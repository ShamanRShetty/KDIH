import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import { getRelevantPhrasesForContext, loadDatabasePhrases } from './phraseService.js';
import { generatePhraseAssistance, explainPhrase } from './groqService.js';

// Resolve current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from backend/.env
dotenv.config({ path: path.resolve(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 5000;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';
const VALID_CATEGORIES = ['transportation', 'shopping', 'healthcare', 'directions'];

// Security & Parsing Middlewares
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or same-origin in development)
      if (!origin) return callback(null, true);
      if (origin === FRONTEND_ORIGIN || origin === 'http://localhost:5173' || origin === 'http://127.0.0.1:5173') {
        return callback(null, true);
      }
      return callback(new Error('CORS policy: Not allowed by CORS for origin ' + origin));
    },
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type'],
  })
);

// Limit request body size to 10kb to prevent payload abuse
app.use(express.json({ limit: '10kb' }));

// Rate limiting: max 40 requests per minute per IP to prevent accidental overuse
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 40,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many requests. Please wait a minute before asking the AI assistant again.',
    code: 'RATE_LIMIT_EXCEEDED',
  },
});

app.use('/api/', apiLimiter);

/**
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
  const hasKey = Boolean(process.env.GROQ_API_KEY && process.env.GROQ_API_KEY !== 'your_groq_api_key_here');
  res.json({
    status: 'healthy',
    groqConfigured: hasKey,
    model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
    timestamp: new Date().toISOString(),
  });
});

/**
 * Main AI Phrase Assistant Endpoint
 * POST /api/phrase-assistant
 * Body: { "message": "...", "category": "transportation" | "shopping" | "healthcare" | "directions" }
 */
app.post('/api/phrase-assistant', async (req, res, next) => {
  try {
    const { message, category } = req.body || {};

    // 1. Validate 'message'
    if (typeof message !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'The "message" field is required and must be a text string.',
        code: 'INVALID_INPUT_TYPE',
      });
    }

    const trimmedMessage = message.trim();
    if (!trimmedMessage) {
      return res.status(400).json({
        success: false,
        error: 'Message cannot be empty. Please describe what you want to say in Kannada.',
        code: 'EMPTY_MESSAGE',
      });
    }

    if (trimmedMessage.length > 500) {
      return res.status(400).json({
        success: false,
        error: 'Message is too long. Please limit your request to 500 characters.',
        code: 'MESSAGE_TOO_LONG',
      });
    }

    // 2. Validate optional 'category'
    let sanitizedCategory = null;
    if (category !== undefined && category !== null && category !== '') {
      if (typeof category !== 'string' || !VALID_CATEGORIES.includes(category.toLowerCase().trim())) {
        return res.status(400).json({
          success: false,
          error: `Invalid category "${category}". Allowed categories are: ${VALID_CATEGORIES.join(', ')}.`,
          code: 'INVALID_CATEGORY',
        });
      }
      sanitizedCategory = category.toLowerCase().trim();
    }

    // 3. Search local verified phrase database for top candidates
    const candidates = getRelevantPhrasesForContext(trimmedMessage, sanitizedCategory, 8);

    // 4. Request assistance from Groq LLM
    const groqResult = await generatePhraseAssistance({
      userMessage: trimmedMessage,
      category: sanitizedCategory,
      candidates,
    });

    // 5. Return structured JSON response to client
    return res.json({
      success: true,
      reply: groqResult.reply,
      suggestions: groqResult.suggestions,
      source: groqResult.source || 'groq',
    });
  } catch (err) {
    next(err);
  }
});

/**
 * Phrase Explanation Endpoint
 * POST /api/explain-phrase
 * Body: { "phraseId": "trans-001" }
 */
app.post('/api/explain-phrase', async (req, res, next) => {
  try {
    const { phraseId } = req.body || {};

    if (phraseId === undefined || phraseId === null) {
      return res.status(400).json({
        success: false,
        error: 'The "phraseId" field is required.',
        code: 'MISSING_PHRASE_ID',
      });
    }

    if (typeof phraseId !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'The "phraseId" field must be a string.',
        code: 'INVALID_PHRASE_ID',
      });
    }

    const trimmedId = phraseId.trim();
    if (!trimmedId) {
      return res.status(400).json({
        success: false,
        error: 'The "phraseId" field cannot be empty.',
        code: 'MISSING_PHRASE_ID',
      });
    }

    if (trimmedId.length > 50) {
      return res.status(400).json({
        success: false,
        error: 'The "phraseId" exceeds maximum allowed length.',
        code: 'INVALID_PHRASE_ID',
      });
    }

    // Look up phrase in database
    const allPhrases = loadDatabasePhrases();
    const phrase = allPhrases.find((p) => p.id === trimmedId);

    if (!phrase) {
      return res.status(404).json({
        success: false,
        error: `Phrase with ID "${trimmedId}" was not found.`,
        code: 'PHRASE_NOT_FOUND',
      });
    }

    // Attempt Groq explanation; if Groq fails or key is missing, return stored usageContext fallback
    try {
      const explanation = await explainPhrase({ phrase, allPhrases });
      return res.json({
        success: true,
        explanation,
        source: 'groq',
      });
    } catch (groqErr) {
      console.warn(`[Server] Groq explanation failed for ${trimmedId}, serving database fallback:`, groqErr.message);
      // Fallback response using stored usageContext
      const sameCategory = allPhrases.filter((p) => p.category === phrase.category && p.id !== phrase.id);
      const similar = sameCategory.length > 0 ? {
        id: sameCategory[0].id,
        kannada: sameCategory[0].kannada,
        transliteration: sameCategory[0].transliteration,
        englishMeaning: sameCategory[0].englishMeaning,
        category: sameCategory[0].category,
      } : null;

      return res.json({
        success: true,
        explanation: {
          phraseId: phrase.id,
          breakdown: [
            {
              kannada: phrase.kannada,
              transliteration: phrase.transliteration,
              meaning: phrase.englishMeaning,
            },
          ],
          formality: {
            level: 'polite',
            note: phrase.usageContext || 'Used politely in everyday communication.',
          },
          similarPhrase: similar,
          label: 'AI-generated — not yet verified',
          isDatabaseVerified: false,
        },
        source: 'fallback',
      });
    }
  } catch (err) {
    next(err);
  }
});

// Central error handling middleware - Never leak secrets, stack traces or internal details
app.use((err, req, res, _next) => {
  // If CORS error
  if (err.message && err.message.includes('CORS policy')) {
    return res.status(403).json({
      success: false,
      error: 'Access blocked by CORS policy.',
      code: 'CORS_ERROR',
    });
  }

  // Determine HTTP status
  const status = typeof err.status === 'number' && err.status >= 400 && err.status < 600
    ? err.status
    : 500;

  // Safe client error message
  const userMessage = err.message && (
    err.code === 'MISSING_API_KEY' ||
    err.code === 'CONFIG_MISSING_API_KEY' ||
    err.code === 'GROQ_AUTH_ERROR' ||
    err.code === 'GROQ_RATE_LIMIT' ||
    err.code === 'GROQ_EMPTY_RESPONSE' ||
    err.code === 'GROQ_MALFORMED_OUTPUT' ||
    err.code === 'GROQ_API_ERROR'
  )
    ? err.message
    : 'An error occurred while generating phrase suggestions with Groq. Please try again.';

  return res.status(status).json({
    success: false,
    error: userMessage,
    code: err.code || 'INTERNAL_SERVER_ERROR',
  });
});

export default app;

// Check if this module is being run directly as the CLI entry point
const isDirectRun = process.argv[1] && (
  process.argv[1].endsWith('server.js') || 
  process.argv[1].endsWith('server')
);

if (isDirectRun && process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`[NammaSahaaya Backend] Server running on http://localhost:${PORT}`);
    console.log(`[NammaSahaaya Backend] CORS allowed for: ${FRONTEND_ORIGIN}`);
    if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === 'your_groq_api_key_here') {
      console.warn('[NammaSahaaya Backend] NOTE: GROQ_API_KEY is not set. Configure it in backend/.env for live AI assistance.');
    } else {
      console.log(`[NammaSahaaya Backend] GROQ_API_KEY detected. Model configured: ${process.env.GROQ_MODEL || 'llama-3.3-70b-versatile'}`);
    }
  });
}

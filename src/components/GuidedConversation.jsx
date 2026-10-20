import { useState } from 'react';
import PhraseCard from './PhraseCard';
import { getPhraseById } from '../utils/phraseUtils';
import './GuidedConversation.css';

/**
 * Interactive Guided Conversation Component.
 * Steps through real-life dialog flows using phrases from the local database.
 * Explains clearly that the user chooses the matching response from prewritten options.
 *
 * @param {object} props
 * @param {object} props.conversation - Conversation data object
 * @param {() => void} [props.onExit] - Optional exit handler
 * @param {(id: string) => boolean} [props.isFavourite] - Check if phrase is favourite
 * @param {(id: string) => void} [props.onToggleFavourite] - Toggle favourite handler
 */
export default function GuidedConversation({
  conversation,
  onExit,
  isFavourite,
  onToggleFavourite,
}) {
  const [history, setHistory] = useState([conversation.steps[0].id]);

  if (!conversation || !conversation.steps || conversation.steps.length === 0) {
    return (
      <div className="guided-conv-empty">
        <p>No conversation steps available.</p>
      </div>
    );
  }

  const currentStep = conversation.steps.find(
    (s) => s.id === history[history.length - 1]
  ) || conversation.steps[0];

  const phrase = currentStep.phraseId ? getPhraseById(currentStep.phraseId) : null;
  const isFinalStep = currentStep.isFinal || !currentStep.responses || currentStep.responses.length === 0;

  const handleSelectResponse = (nextStepId) => {
    if (!nextStepId) return;
    setHistory((prev) => [...prev, nextStepId]);
  };

  const handleRestart = () => {
    setHistory([conversation.steps[0].id]);
  };

  const handleBackStep = () => {
    if (history.length > 1) {
      setHistory((prev) => prev.slice(0, prev.length - 1));
    }
  };

  return (
    <div className="guided-conv card">
      {/* Header */}
      <div className="guided-conv-header">
        <div className="guided-conv-title-wrap">
          <span className="guided-conv-badge">Guided Practice</span>
          <h2 className="guided-conv-title">{conversation.title}</h2>
          {conversation.titleKannada && (
            <p className="guided-conv-kannada kannada-text">{conversation.titleKannada}</p>
          )}
        </div>
        <div className="guided-conv-header-actions">
          {history.length > 1 && (
            <button
              className="btn btn-secondary btn-sm"
              onClick={handleBackStep}
              title="Previous step"
            >
              ← Back
            </button>
          )}
          <button
            className="btn btn-secondary btn-sm"
            onClick={handleRestart}
            title="Restart from beginning"
          >
            Restart
          </button>
          {onExit && (
            <button
              className="btn btn-secondary btn-sm"
              onClick={onExit}
              title="Exit conversation"
            >
              Close
            </button>
          )}
        </div>
      </div>

      <p className="guided-conv-desc">{conversation.description}</p>

      {/* Step Progress */}
      <div className="guided-conv-progress-bar">
        <div
          className="guided-conv-progress-fill"
          style={{
            width: `${Math.min(100, (history.length / Math.max(history.length, conversation.steps.length)) * 100)}%`,
          }}
        />
      </div>

      {/* Current Prompt */}
      <div className="guided-conv-prompt-box">
        <span className="guided-conv-step-number">Step {history.length}</span>
        <p className="guided-conv-prompt">{currentStep.prompt}</p>
      </div>

      {/* Phrase to Say */}
      {phrase && (
        <div className="guided-conv-phrase-section">
          <p className="guided-conv-section-label">Suggested phrase:</p>
          <PhraseCard
            phrase={phrase}
            isFavourite={isFavourite ? isFavourite(phrase.id) : false}
            onToggleFavourite={onToggleFavourite}
          />
        </div>
      )}

      {/* Responses Selection */}
      {!isFinalStep ? (
        <div className="guided-conv-responses-section">
          <p className="guided-conv-section-label">
            Select the response you received:
          </p>
          <div className="guided-conv-options-list">
            {currentStep.responses.map((resp) => (
              <button
                key={resp.id}
                className="guided-conv-option-btn"
                onClick={() => handleSelectResponse(resp.nextStepId)}
              >
                <span className="guided-conv-option-bullet">•</span>
                <span className="guided-conv-option-text">{resp.heardText}</span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="guided-conv-completion">
          <div className="guided-conv-completion-badge">Interaction Complete</div>
          <p className="guided-conv-completion-msg">
            {currentStep.completionMessage || 'You have successfully completed this communication scenario.'}
          </p>
          <div className="guided-conv-completion-actions">
            <button className="btn btn-primary" onClick={handleRestart}>
              Practice Scenario Again
            </button>
            {onExit && (
              <button className="btn btn-secondary" onClick={onExit}>
                Back to Scenario List
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

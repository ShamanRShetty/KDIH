import { Link } from 'react-router-dom';
import SituationCard from '../components/SituationCard';
import DailyPhraseCard from '../components/DailyPhraseCard';
import situations from '../data/situations';
import './HomePage.css';

export default function HomePage() {
  return (
    <main className="page home-page">
      <div className="container">
        {/* Deliberate Hero Section */}
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-content">
            <div className="hero-brand-pill">
              <img
                src="/logo.png"
                alt="NammaSahaaya logo"
                className="hero-logo-img"
                width="24"
                height="24"
              />
              <span className="hero-kicker">NammaSahaaya • Karnataka Civic Companion</span>
            </div>
            <h1 id="hero-title" className="hero-title">
              Everyday Kannada communication, structured for real situations.
            </h1>
            <p className="hero-description">
              Designed for residents, students, and visitors. Access verified phrases for transit,
              markets, clinics, and directions - with native Kannada Unicode, phonetic transliteration,
              and offline speech audio.
            </p>
            <div className="hero-actions">
              <Link to="/explore" className="btn btn-primary btn-lg hero-cta">
                Browse Everyday Phrases
              </Link>
              <Link to="/practice" className="btn btn-secondary btn-lg hero-cta">
                Practice Flashcards
              </Link>
            </div>
          </div>

          {/* Phrase of the Day & Streak Card */}
          <DailyPhraseCard />
        </section>

        {/* Situation Categories */}
        <section className="home-situations" aria-labelledby="situations-heading">
          <div className="section-header">
            <h2 id="situations-heading" className="section-heading">
              Select a Communication Scenario
            </h2>
            <p className="section-subheading">
              Curated phrase groups with Kannada script, pronunciation guides, and interactive dialogue flows.
            </p>
          </div>
          <div className="situations-grid">
            {situations.map((situation) => (
              <SituationCard key={situation.id} situation={situation} />
            ))}
          </div>
        </section>

        {/* Product Utility Architecture */}
        <section className="home-how-it-works" aria-labelledby="how-heading">
          <div className="section-header">
            <h2 id="how-heading" className="section-heading">
              How NammaSahaaya Works
            </h2>
            <p className="section-subheading">
              Designed for immediate utility in outdoor, low-bandwidth, and offline environments.
            </p>
          </div>
          <div className="how-steps">
            <div className="how-step">
              <span className="how-step-index">01</span>
              <div className="how-step-body">
                <h3 className="how-step-title">Tri-Tier Reading Hierarchy</h3>
                <p className="how-step-text">
                  Every phrase provides native Kannada Unicode, italicized English transliteration for pronunciation,
                  and exact English meaning on a single card.
                </p>
              </div>
            </div>
            <div className="how-step">
              <span className="how-step-index">02</span>
              <div className="how-step-body">
                <h3 className="how-step-title">One-Tap Show to Person</h3>
                <p className="how-step-text">
                  In loud markets or crowded buses, open the high-contrast full-screen view and show the Kannada text
                  directly to conductors or shopkeepers.
                </p>
              </div>
            </div>
            <div className="how-step">
              <span className="how-step-index">03</span>
              <div className="how-step-body">
                <h3 className="how-step-title">100% Offline Capability</h3>
                <p className="how-step-text">
                  The entire phrasebook, search index, and 3-box Leitner practice flashcards are cached in the browser
                  and function without cellular network.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Practical Audience & Context */}
        <section className="home-audience" aria-labelledby="audience-heading">
          <div className="section-header">
            <h2 id="audience-heading" className="section-heading">
              Built for Everyday Urban Needs
            </h2>
            <p className="section-subheading">
              Tailored specifically to remove language friction across common public touchpoints.
            </p>
          </div>
          <div className="audience-grid">
            <div className="audience-item">
              <h3 className="audience-title">Commuters & Bus Transit</h3>
              <p className="audience-desc">
                Inquire about bus routes, boarding points, ticket stops, and change requests on BMTC or KSRTC buses.
              </p>
            </div>
            <div className="audience-item">
              <h3 className="audience-title">Local Markets & Street Vendors</h3>
              <p className="audience-desc">
                Ask prices per kilogram, confirm UPI payments, request discounts, and negotiate politely.
              </p>
            </div>
            <div className="audience-item">
              <h3 className="audience-title">Clinics & Medical Reception</h3>
              <p className="audience-desc">
                Register as a patient, describe common symptoms, and ask for doctor timings or prescription counters.
              </p>
            </div>
            <div className="audience-item">
              <h3 className="audience-title">Pedestrian Wayfinding</h3>
              <p className="audience-desc">
                Ask for directions, landmarks, metro stations, auto-rickshaw fares, and polite clarifications.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

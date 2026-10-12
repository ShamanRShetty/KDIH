import { Link } from 'react-router-dom';
import SituationCard from '../components/SituationCard';
import situations from '../data/situations';
import './HomePage.css';

export default function HomePage() {
  return (
    <main className="page home-page">
      <div className="container">
        {/* Hero Section */}
        <section className="hero" aria-labelledby="hero-title">
          <h1 id="hero-title" className="hero-title">
            Speak Kannada with confidence,<br />
            <span className="hero-highlight">wherever you go.</span>
          </h1>
          <p className="hero-description">
            Moving to Karnataka or visiting for the first time? NammaSahaaya
            helps you communicate in everyday Kannada through practical,
            situation-based phrases — no prior knowledge needed.
          </p>
          <Link to="/explore" className="btn btn-primary btn-lg hero-cta">
            Start Exploring Phrases
          </Link>
        </section>

        {/* Situation Cards */}
        <section className="home-situations" aria-labelledby="situations-heading">
          <h2 id="situations-heading" className="section-heading">
            Choose a Situation
          </h2>
          <p className="section-subheading">
            Select a real-life scenario to find the phrases you need.
          </p>
          <div className="situations-grid">
            {situations.map((situation) => (
              <SituationCard key={situation.id} situation={situation} />
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section className="home-how-it-works" aria-labelledby="how-heading">
          <h2 id="how-heading" className="section-heading">
            How It Works
          </h2>
          <div className="how-steps">
            <div className="how-step">
              <span className="how-step-number" aria-hidden="true">1</span>
              <h3 className="how-step-title">Pick a Situation</h3>
              <p className="how-step-text">
                Choose from real-life scenarios like taking a bus, shopping at a
                market, or visiting a hospital.
              </p>
            </div>
            <div className="how-step">
              <span className="how-step-number" aria-hidden="true">2</span>
              <h3 className="how-step-title">Learn the Phrases</h3>
              <p className="how-step-text">
                See each phrase in Kannada script, English transliteration, and
                English meaning — all on one card.
              </p>
            </div>
            <div className="how-step">
              <span className="how-step-number" aria-hidden="true">3</span>
              <h3 className="how-step-title">Use with Confidence</h3>
              <p className="how-step-text">
                Save your favourite phrases for quick access and use them when
                you need them most.
              </p>
            </div>
          </div>
        </section>

        {/* Who is this for */}
        <section className="home-audience" aria-labelledby="audience-heading">
          <h2 id="audience-heading" className="section-heading">
            Who Is This For?
          </h2>
          <ul className="audience-list">
            <li className="audience-item">
              <span className="audience-icon" aria-hidden="true">🎓</span>
              <span>Students moving to Karnataka for education</span>
            </li>
            <li className="audience-item">
              <span className="audience-icon" aria-hidden="true">✈️</span>
              <span>Visitors and tourists exploring the state</span>
            </li>
            <li className="audience-item">
              <span className="audience-icon" aria-hidden="true">👷</span>
              <span>Migrant workers and new employees</span>
            </li>
            <li className="audience-item">
              <span className="audience-icon" aria-hidden="true">🏠</span>
              <span>Residents who understand little Kannada</span>
            </li>
          </ul>
        </section>
      </div>
    </main>
  );
}

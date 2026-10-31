import { Link } from 'react-router-dom';
import packs from '../data/packs';
import './PacksPage.css';

/**
 * /packs — Grid of 6 Quick Pack cards.
 * Each card links to /packs/:packId for the step-through player.
 */
export default function PacksPage() {
  return (
    <main className="page packs-page">
      <div className="container">
        <header className="packs-header">
          <h1 className="packs-title">Quick Packs</h1>
          <p className="packs-description">
            Curated phrase sets for common real-life moments. Open a pack seconds before you need it.
          </p>
        </header>

        <div className="packs-grid" role="list">
          {packs.map((pack) => (
            <Link
              key={pack.id}
              to={`/packs/${pack.id}`}
              className="pack-card"
              role="listitem"
              aria-label={`${pack.title} pack — ${pack.phraseIds.length} phrases. ${pack.whenToUse}`}
            >
              <div className="pack-card-icon" aria-hidden="true">
                {pack.icon}
              </div>
              <div className="pack-card-body">
                <h2 className="pack-card-title">{pack.title}</h2>
                <p className="pack-card-when">{pack.whenToUse}</p>
                <span className="pack-card-count">
                  {pack.phraseIds.length} phrases
                </span>
              </div>
              <span className="pack-card-arrow" aria-hidden="true">›</span>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}


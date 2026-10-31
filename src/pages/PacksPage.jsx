import { Link } from 'react-router-dom';
import packs from '../data/packs';
import { PackIcon, ArrowRightIcon } from '../components/Icons';
import './PacksPage.css';

/**
 * /packs — Grid of Quick Pack cards.
 * Uses shared design system card patterns identical to SituationCard.
 */
export default function PacksPage() {
  return (
    <main className="page packs-page">
      <div className="container">
        {/* Navigation Breadcrumb matching SituationPage */}
        <div className="packs-nav-links">
          <Link to="/" className="packs-back-link">
            Home
          </Link>
          <span className="packs-nav-divider">/</span>
          <span className="packs-nav-current">Quick Packs</span>
        </div>

        <div className="page-header packs-header">
          <h1 className="page-title">Quick Packs</h1>
          <p className="page-subtitle">
            Curated phrase sets for common real-life moments. Open a pack seconds before you need it.
          </p>
        </div>

        <div className="packs-grid" role="list">
          {packs.map((pack) => (
            <Link
              key={pack.id}
              to={`/packs/${pack.id}`}
              className="pack-card card card-interactive"
              role="listitem"
            >
              <div className="pack-card-icon" aria-hidden="true">
                <PackIcon packId={pack.id} size={22} />
              </div>
              <div className="pack-card-body">
                <div className="pack-card-header-row">
                  <h2 className="pack-card-title">{pack.title}</h2>
                  <span className="pack-card-count" aria-label={`${pack.phraseIds.length} phrases`}>
                    {pack.phraseIds.length} phrases
                  </span>
                </div>
                <p className="pack-card-when">{pack.whenToUse}</p>
              </div>
              <div className="pack-card-arrow" aria-hidden="true">
                <ArrowRightIcon size={18} />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}

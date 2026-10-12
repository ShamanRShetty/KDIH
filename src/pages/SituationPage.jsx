import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import PhraseCard from '../components/PhraseCard';
import useFavourites from '../hooks/useFavourites';
import situations from '../data/situations';
import { getPhrasesByCategory, getSubcategories } from '../utils/phraseUtils';
import './SituationPage.css';

export default function SituationPage() {
  const { situationId } = useParams();
  const { isFavourite, toggleFavourite } = useFavourites();
  const [selectedSubcategory, setSelectedSubcategory] = useState('all');

  const situation = situations.find((s) => s.id === situationId);
  const categoryPhrases = useMemo(
    () => (situationId ? getPhrasesByCategory(situationId) : []),
    [situationId]
  );

  const subcategories = useMemo(
    () => (situationId ? getSubcategories(situationId) : []),
    [situationId]
  );

  const filteredPhrases = useMemo(() => {
    if (selectedSubcategory === 'all') return categoryPhrases;
    return categoryPhrases.filter((p) => p.subcategory === selectedSubcategory);
  }, [categoryPhrases, selectedSubcategory]);

  if (!situation) {
    return (
      <main className="page">
        <div className="container">
          <div className="empty-state">
            <span className="empty-state-icon">🔍</span>
            <p className="empty-state-title">Situation not found</p>
            <p className="empty-state-description">
              The situation you are looking for does not exist.
            </p>
            <Link to="/explore" className="btn btn-primary">
              Browse All Situations
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="page situation-page">
      <div className="container">
        {/* Back link */}
        <Link to="/explore" className="situation-back">
          ← Back to Explore
        </Link>

        {/* Situation header */}
        <div
          className="situation-header"
          style={{ '--accent': situation.color }}
        >
          <span className="situation-header-icon" aria-hidden="true">
            {situation.icon}
          </span>
          <div>
            <h1 className="situation-header-title">{situation.title}</h1>
            <span className="situation-header-kannada kannada-text">
              {situation.titleKannada}
            </span>
            <p className="situation-header-description">
              {situation.description}
            </p>
          </div>
        </div>

        {/* Subcategory filter chips if category has subcategories */}
        {subcategories.length > 0 && (
          <div className="situation-filter-bar" role="group" aria-label="Filter by subcategory">
            <button
              className={`filter-chip ${selectedSubcategory === 'all' ? 'filter-chip--active' : ''}`}
              onClick={() => setSelectedSubcategory('all')}
            >
              All ({categoryPhrases.length})
            </button>
            {subcategories.map((sub) => {
              const count = categoryPhrases.filter((p) => p.subcategory === sub).length;
              return (
                <button
                  key={sub}
                  className={`filter-chip ${selectedSubcategory === sub ? 'filter-chip--active' : ''}`}
                  onClick={() => setSelectedSubcategory(sub)}
                >
                  {sub.replace('_', ' ')} ({count})
                </button>
              );
            })}
          </div>
        )}

        {/* Phrase count */}
        <p className="situation-phrase-count">
          Showing {filteredPhrases.length} of {categoryPhrases.length} phrase{categoryPhrases.length !== 1 ? 's' : ''}
        </p>

        {/* Phrases list */}
        {filteredPhrases.length === 0 ? (
          <div className="empty-state">
            <span className="empty-state-icon">📝</span>
            <p className="empty-state-title">No phrases yet</p>
            <p className="empty-state-description">
              Phrases for this category will be added soon.
            </p>
          </div>
        ) : (
          <div className="situation-phrases-list">
            {filteredPhrases.map((phrase) => (
              <PhraseCard
                key={phrase.id}
                phrase={phrase}
                isFavourite={isFavourite(phrase.id)}
                onToggleFavourite={toggleFavourite}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

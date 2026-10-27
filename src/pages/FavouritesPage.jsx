import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import PhraseCard from '../components/PhraseCard';
import useFavourites from '../hooks/useFavourites';
import situations from '../data/situations';
import { getAllPhrases } from '../utils/phraseUtils';
import { StarIcon, SituationIcon, TrashIcon, AlertTriangleIcon } from '../components/Icons';
import './FavouritesPage.css';

export default function FavouritesPage() {
  const { favourites, isFavourite, toggleFavourite, clearAllFavourites } = useFavourites();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showClearModal, setShowClearModal] = useState(false);

  // Get all validated phrases that are favourited
  const allPhrases = useMemo(() => getAllPhrases(), []);
  const favouritePhrases = useMemo(
    () => allPhrases.filter((p) => favourites.includes(p.id)),
    [allPhrases, favourites]
  );

  // Derive unique category situations available within current saved phrases
  const availableCategories = useMemo(() => {
    const categoryIds = new Set(favouritePhrases.map((p) => p.category.toLowerCase()));
    return situations.filter((sit) => categoryIds.has(sit.id.toLowerCase()));
  }, [favouritePhrases]);

  // Filter phrases based on selected category chip
  const filteredPhrases = useMemo(() => {
    if (selectedCategory === 'all') return favouritePhrases;
    return favouritePhrases.filter(
      (p) => p.category.toLowerCase() === selectedCategory.toLowerCase()
    );
  }, [favouritePhrases, selectedCategory]);

  const handleConfirmClear = () => {
    clearAllFavourites();
    setShowClearModal(false);
    setSelectedCategory('all');
  };

  return (
    <main className="page favourites-page">
      <div className="container">
        <div className="page-header favourites-page-header">
          <div>
            <h1 className="page-title">Saved Favourites</h1>
            <p className="page-subtitle">
              Essential phrases saved for quick access during travel and daily tasks.
            </p>
          </div>

          {favouritePhrases.length > 1 && (
            <button
              type="button"
              className="btn btn-secondary btn-sm favourites-clear-btn"
              onClick={() => setShowClearModal(true)}
              aria-label="Clear all saved favourite phrases"
              title="Clear all saved favourites"
            >
              <TrashIcon size={14} />
              <span>Clear All</span>
            </button>
          )}
        </div>

        {favouritePhrases.length === 0 ? (
          <div className="empty-state">
            <span className="empty-state-icon" aria-hidden="true">
              <StarIcon size={36} />
            </span>
            <p className="empty-state-title">No saved phrases yet</p>
            <p className="empty-state-description">
              Tap the star icon on any phrase in Explore or Practice mode to keep it pinned here.
            </p>
            <Link to="/explore" className="btn btn-primary">
              Browse Phrases
            </Link>
          </div>
        ) : (
          <>
            {/* Category Filter Chips (Rendered when phrases belong to multiple categories or 3+ phrases saved) */}
            {availableCategories.length > 1 && (
              <div className="favourites-category-chips" role="group" aria-label="Filter saved phrases by situation">
                <button
                  type="button"
                  className={`favourites-chip ${selectedCategory === 'all' ? 'favourites-chip--active' : ''}`}
                  onClick={() => setSelectedCategory('all')}
                >
                  All ({favouritePhrases.length})
                </button>
                {availableCategories.map((sit) => {
                  const count = favouritePhrases.filter(
                    (p) => p.category.toLowerCase() === sit.id.toLowerCase()
                  ).length;
                  return (
                    <button
                      key={sit.id}
                      type="button"
                      className={`favourites-chip ${selectedCategory === sit.id ? 'favourites-chip--active' : ''}`}
                      onClick={() => setSelectedCategory(sit.id)}
                    >
                      <span className="favourites-chip-icon" aria-hidden="true">
                        <SituationIcon situationId={sit.id} size={14} />
                      </span>
                      <span>{sit.title}</span>
                      <span className="favourites-chip-count">({count})</span>
                    </button>
                  );
                })}
              </div>
            )}

            <div className="favourites-meta-row">
              <p className="favourites-count">
                {filteredPhrases.length} phrase{filteredPhrases.length !== 1 ? 's' : ''}{' '}
                {selectedCategory !== 'all' ? 'in selected situation' : 'saved'}
              </p>
              {selectedCategory !== 'all' && (
                <button
                  type="button"
                  className="favourites-reset-filter"
                  onClick={() => setSelectedCategory('all')}
                >
                  Show all situations
                </button>
              )}
            </div>

            {filteredPhrases.length === 0 ? (
              <div className="empty-state favourites-filter-empty">
                <p className="empty-state-title">No phrases in this situation</p>
                <p className="empty-state-description">
                  You haven&rsquo;t saved any phrases under this situation category yet.
                </p>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setSelectedCategory('all')}
                >
                  Show all saved phrases
                </button>
              </div>
            ) : (
              <div className="favourites-list">
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
          </>
        )}
      </div>

      {/* Clear All Confirmation Modal */}
      {showClearModal && (
        <div
          className="favourites-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="clear-modal-title"
          onClick={() => setShowClearModal(false)}
        >
          <div
            className="favourites-modal-card"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              if (e.key === 'Escape') setShowClearModal(false);
            }}
          >
            <div className="favourites-modal-header">
              <div className="favourites-modal-title-row">
                <span className="favourites-modal-icon" aria-hidden="true">
                  <AlertTriangleIcon size={20} />
                </span>
                <h2 id="clear-modal-title" className="favourites-modal-title">
                  Clear all saved favourites?
                </h2>
              </div>
            </div>

            <div className="favourites-modal-body">
              <p className="favourites-modal-desc">
                This will remove all <strong>{favouritePhrases.length}</strong> pinned phrases from your offline
                device storage. You can still search and bookmark them again anytime from Explore mode.
              </p>
            </div>

            <div className="favourites-modal-actions">
              <button
                type="button"
                className="btn btn-outline favourites-modal-btn"
                onClick={() => setShowClearModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary favourites-modal-danger-btn"
                onClick={handleConfirmClear}
              >
                Yes, Clear All
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

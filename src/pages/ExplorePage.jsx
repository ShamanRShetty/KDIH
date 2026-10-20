import { useState, useMemo } from 'react';
import SituationCard from '../components/SituationCard';
import PhraseCard from '../components/PhraseCard';
import AiPhraseAssistant from '../components/AiPhraseAssistant';
import useFavourites from '../hooks/useFavourites';
import situations from '../data/situations';
import { getAllPhrases } from '../utils/phraseUtils';
import { SituationIcon, SearchIcon } from '../components/Icons';
import './ExplorePage.css';

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { isFavourite, toggleFavourite } = useFavourites();

  // Load validated phrases
  const allPhrases = useMemo(() => {
    return getAllPhrases();
  }, []);

  // Filter phrases by category first
  const categoryFilteredPhrases = useMemo(() => {
    if (selectedCategory === 'all') return allPhrases;
    return allPhrases.filter(
      (p) => p.category.toLowerCase() === selectedCategory.toLowerCase()
    );
  }, [allPhrases, selectedCategory]);

  // Filter phrases by search query
  const searchResults = useMemo(() => {
    if (!searchQuery.trim() && selectedCategory === 'all') return null;

    let results = categoryFilteredPhrases;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      results = results.filter((phrase) => {
        const english = (phrase.englishMeaning || phrase.english || '').toLowerCase();
        const transliteration = (phrase.transliteration || '').toLowerCase();
        const kannada = phrase.kannada || '';
        const context = (phrase.usageContext || phrase.context || '').toLowerCase();
        const subcategory = (phrase.subcategory || '').toLowerCase();

        return (
          english.includes(query) ||
          transliteration.includes(query) ||
          kannada.includes(query) ||
          context.includes(query) ||
          subcategory.includes(query)
        );
      });
    }

    return results;
  }, [searchQuery, selectedCategory, categoryFilteredPhrases]);

  return (
    <main className="page explore-page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">Explore Phrases</h1>
          <p className="page-subtitle">
            Search across all situations or browse by category.
          </p>
        </div>

        {/* Search */}
        <div className="explore-search">
          <label htmlFor="phrase-search" className="sr-only">
            Search phrases
          </label>
          <input
            id="phrase-search"
            type="search"
            className="explore-search-input"
            placeholder="Search in English, Kannada, or pronunciation..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoComplete="off"
          />
          {searchQuery && (
            <button
              className="explore-search-clear"
              onClick={() => setSearchQuery('')}
              aria-label="Clear search"
              title="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        {/* Category Filter Chips for Quick Filtering */}
        <div className="explore-category-chips" role="group" aria-label="Filter by category">
          <button
            className={`explore-chip ${selectedCategory === 'all' ? 'explore-chip--active' : ''}`}
            onClick={() => setSelectedCategory('all')}
          >
            All Situations
          </button>
          {situations.map((sit) => (
            <button
              key={sit.id}
              className={`explore-chip ${selectedCategory === sit.id ? 'explore-chip--active' : ''}`}
              onClick={() => setSelectedCategory(sit.id)}
            >
              <span className="explore-chip-icon" aria-hidden="true">
                <SituationIcon situationId={sit.id} size={14} />
              </span>
              <span>{sit.title}</span>
            </button>
          ))}
        </div>

        {/* Search Results or Situation Cards Grid */}
        {searchResults !== null ? (
          <section aria-label="Search results">
            <div className="explore-results-header">
              <p className="explore-results-count">
                {searchResults.length === 0
                  ? 'No phrases match your criteria.'
                  : `${searchResults.length} phrase${searchResults.length !== 1 ? 's' : ''} found`}
              </p>
              {(searchQuery || selectedCategory !== 'all') && (
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                  }}
                >
                  Reset Filters
                </button>
              )}
            </div>

            {searchResults.length === 0 ? (
              <div className="empty-state">
                <span className="empty-state-icon" aria-hidden="true">
                  <SearchIcon size={32} />
                </span>
                <p className="empty-state-title">No matching phrases</p>
                <p className="empty-state-description">
                  Check your spelling, try simpler keywords, or clear category filters.
                </p>
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                  }}
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="explore-phrases-list">
                {searchResults.map((phrase) => (
                  <PhraseCard
                    key={phrase.id}
                    phrase={phrase}
                    isFavourite={isFavourite(phrase.id)}
                    onToggleFavourite={toggleFavourite}
                  />
                ))}
              </div>
            )}
          </section>
        ) : (
          <>
            {/* Optional AI-Powered Phrase Assistant */}
            <AiPhraseAssistant
              isFavourite={isFavourite}
              onToggleFavourite={toggleFavourite}
            />

            <section aria-label="Browse by situation">
              <h2 className="section-heading explore-grid-heading">
                Browse by Situation
              </h2>
              <div className="situations-grid">
                {situations.map((situation) => (
                  <SituationCard key={situation.id} situation={situation} />
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}

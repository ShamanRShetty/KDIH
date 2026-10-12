import { useState, useMemo } from 'react';
import SituationCard from '../components/SituationCard';
import PhraseCard from '../components/PhraseCard';
import useFavourites from '../hooks/useFavourites';
import situations from '../data/situations';
import { getAllPhrases } from '../utils/phraseUtils';
import './ExplorePage.css';

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const { isFavourite, toggleFavourite } = useFavourites();

  // Load validated phrases
  const allPhrases = useMemo(() => {
    return getAllPhrases();
  }, []);

  // Filter phrases by search query
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const query = searchQuery.toLowerCase().trim();
    return allPhrases.filter((phrase) => {
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
  }, [searchQuery, allPhrases]);

  return (
    <main className="page explore-page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">Explore Phrases</h1>
          <p className="page-subtitle">
            Search for a phrase or browse by situation.
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
            placeholder="Search in English or Kannada..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoComplete="off"
          />
          {searchQuery && (
            <button
              className="explore-search-clear"
              onClick={() => setSearchQuery('')}
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        {/* Search Results or Situation List */}
        {searchResults !== null ? (
          <section aria-label="Search results">
            <p className="explore-results-count">
              {searchResults.length === 0
                ? 'No phrases found. Try a different search term.'
                : `${searchResults.length} phrase${searchResults.length !== 1 ? 's' : ''} found`}
            </p>
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
          </section>
        ) : (
          <section aria-label="Browse by situation">
            <div className="situations-grid">
              {situations.map((situation) => (
                <SituationCard key={situation.id} situation={situation} />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import PhraseCard from '../components/PhraseCard';
import useFavourites from '../hooks/useFavourites';
import { getAllPhrases } from '../utils/phraseUtils';
import './FavouritesPage.css';

export default function FavouritesPage() {
  const { favourites, isFavourite, toggleFavourite } = useFavourites();

  // Get all validated phrases that are favourited
  const allPhrases = useMemo(() => getAllPhrases(), []);
  const favouritePhrases = useMemo(
    () => allPhrases.filter((p) => favourites.includes(p.id)),
    [allPhrases, favourites]
  );

  return (
    <main className="page favourites-page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">Favourites</h1>
          <p className="page-subtitle">
            Your saved phrases for quick access.
          </p>
        </div>

        {favouritePhrases.length === 0 ? (
          <div className="empty-state">
            <span className="empty-state-icon">⭐</span>
            <p className="empty-state-title">No favourites yet</p>
            <p className="empty-state-description">
              Tap the star icon on any phrase to save it here for quick access.
            </p>
            <Link to="/explore" className="btn btn-primary">
              Explore Phrases
            </Link>
          </div>
        ) : (
          <>
            <p className="favourites-count">
              {favouritePhrases.length} phrase{favouritePhrases.length !== 1 ? 's' : ''} saved
            </p>
            <div className="favourites-list">
              {favouritePhrases.map((phrase) => (
                <PhraseCard
                  key={phrase.id}
                  phrase={phrase}
                  isFavourite={isFavourite(phrase.id)}
                  onToggleFavourite={toggleFavourite}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}

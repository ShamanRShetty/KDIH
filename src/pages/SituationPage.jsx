import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import PhraseCard from '../components/PhraseCard';
import GuidedConversation from '../components/GuidedConversation';
import NumbersReference from '../components/NumbersReference';
import useFavourites from '../hooks/useFavourites';
import situations from '../data/situations';
import { getPhrasesByCategory, getSubcategories } from '../utils/phraseUtils';
import { getConversationsByCategory } from '../data/conversations';
import './SituationPage.css';

export default function SituationPage() {
  const { situationId } = useParams();
  const { isFavourite, toggleFavourite } = useFavourites();
  const [selectedSubcategory, setSelectedSubcategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('phrases'); // 'phrases' | 'guided'

  const situation = situations.find((s) => s.id === situationId);
  const categoryPhrases = useMemo(
    () => (situationId ? getPhrasesByCategory(situationId) : []),
    [situationId]
  );

  const subcategories = useMemo(
    () => (situationId ? getSubcategories(situationId) : []),
    [situationId]
  );

  const categoryConversations = useMemo(
    () => (situationId ? getConversationsByCategory(situationId) : []),
    [situationId]
  );

  // Filter phrases by subcategory and search term
  const filteredPhrases = useMemo(() => {
    let list = categoryPhrases;

    if (selectedSubcategory !== 'all') {
      list = list.filter((p) => p.subcategory === selectedSubcategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((p) => {
        const eng = (p.englishMeaning || p.english || '').toLowerCase();
        const trans = (p.transliteration || '').toLowerCase();
        const kan = p.kannada || '';
        const ctx = (p.usageContext || p.context || '').toLowerCase();
        const sub = (p.subcategory || '').toLowerCase();
        return (
          eng.includes(q) ||
          trans.includes(q) ||
          kan.includes(q) ||
          ctx.includes(q) ||
          sub.includes(q)
        );
      });
    }

    return list;
  }, [categoryPhrases, selectedSubcategory, searchQuery]);

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
            <div className="situation-empty-actions">
              <Link to="/" className="btn btn-primary">
                Return Home
              </Link>
              <Link to="/explore" className="btn btn-secondary">
                Browse All Situations
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="page situation-page">
      <div className="container">
        {/* Navigation Breadcrumb with clear Return Home */}
        <div className="situation-nav-links">
          <Link to="/" className="situation-back-link">
            🏠 Home
          </Link>
          <span className="situation-nav-divider">/</span>
          <Link to="/explore" className="situation-back-link">
            Explore
          </Link>
          <span className="situation-nav-divider">/</span>
          <span className="situation-nav-current">{situation.title}</span>
        </div>

        {/* Situation Header */}
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

        {/* Top Mode Tabs: Common Phrases vs Guided Conversation */}
        {categoryConversations.length > 0 && (
          <div className="situation-tabs" role="tablist" aria-label="View mode">
            <button
              role="tab"
              aria-selected={activeTab === 'phrases'}
              className={`situation-tab ${activeTab === 'phrases' ? 'situation-tab--active' : ''}`}
              onClick={() => setActiveTab('phrases')}
            >
              📚 Common Phrases ({categoryPhrases.length})
            </button>
            <button
              role="tab"
              aria-selected={activeTab === 'guided'}
              className={`situation-tab ${activeTab === 'guided' ? 'situation-tab--active' : ''}`}
              onClick={() => setActiveTab('guided')}
            >
              💬 Guided Conversation
            </button>
          </div>
        )}

        {/* TAB 1: COMMON PHRASES */}
        {activeTab === 'phrases' && (
          <div className="situation-phrases-view">
            {/* Category Search Bar */}
            <div className="situation-search-wrap">
              <label htmlFor="cat-search" className="sr-only">
                Search in {situation.title}
              </label>
              <div className="situation-search-input-box">
                <span className="situation-search-icon" aria-hidden="true">🔍</span>
                <input
                  id="cat-search"
                  type="search"
                  className="situation-search-input"
                  placeholder={`Search ${situation.title.toLowerCase()} phrases...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoComplete="off"
                />
                {searchQuery && (
                  <button
                    className="situation-search-clear"
                    onClick={() => setSearchQuery('')}
                    aria-label="Clear search"
                    title="Clear search"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Subcategory filter chips */}
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

            {/* Phrase Count indicator */}
            <p className="situation-phrase-count">
              Showing {filteredPhrases.length} of {categoryPhrases.length} phrase{categoryPhrases.length !== 1 ? 's' : ''}
              {searchQuery && ` matching "${searchQuery}"`}
            </p>

            {/* Phrases List or Empty State */}
            {filteredPhrases.length === 0 ? (
              <div className="empty-state">
                <span className="empty-state-icon">🔍</span>
                <p className="empty-state-title">No matching phrases found</p>
                <p className="empty-state-description">
                  {searchQuery
                    ? `No phrases in ${situation.title} matched your search "${searchQuery}".`
                    : 'No phrases available in this subcategory.'}
                </p>
                {searchQuery && (
                  <button
                    className="btn btn-secondary"
                    onClick={() => setSearchQuery('')}
                  >
                    Clear Search
                  </button>
                )}
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

            {/* Numbers & Money Reference for Shopping Situation */}
            {situationId === 'shopping' && <NumbersReference />}
          </div>
        )}

        {/* TAB 2: GUIDED CONVERSATIONS */}
        {activeTab === 'guided' && categoryConversations.length > 0 && (
          <div className="situation-guided-view">
            {categoryConversations.map((conv) => (
              <GuidedConversation
                key={conv.id}
                conversation={conv}
                isFavourite={isFavourite}
                onToggleFavourite={toggleFavourite}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

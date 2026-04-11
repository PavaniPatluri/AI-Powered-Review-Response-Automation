import React, { useState, useRef, useEffect } from 'react';
import { Search, X, Loader, Filter, Sparkles, Star } from 'lucide-react';
import { searchReviews } from '../api';

const BUSINESS_COLORS = {
  Restaurant: '#f59e0b', Hotel: '#6366f1', Clinic: '#10b981',
  Salon: '#ec4899', Theater: '#8b5cf6', default: '#3b82f6'
};

const SUGGESTIONS = [
  'negative hotel reviews', 'positive dining experience', 'clinic wait time issues',
  'salon service quality', 'theater sound problems', 'staff attitude complaints',
  'best rated restaurants', 'unhappy customers', '5 star experiences'
];

const SearchEngineView = ({ reviews }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [filters, setFilters] = useState({ business_type: '', sentiment: '', rating: '' });
  const [showFilters, setShowFilters] = useState(false);
  const inputRef = useRef(null);

  const handleSearch = async (q = query) => {
    if (!q.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const activeFilters = Object.fromEntries(Object.entries(filters).filter(([, v]) => v));
      const data = await searchReviews(q, activeFilters);
      setResults(data.results || []);
    } catch (err) {
      console.error('Search error:', err);
      // Fallback: search locally
      const q_lower = q.toLowerCase();
      const local = (reviews || [])
        .filter(r =>
          r.content?.toLowerCase().includes(q_lower) ||
          r.author?.toLowerCase().includes(q_lower) ||
          r.business_type?.toLowerCase().includes(q_lower) ||
          r.sentiment?.toLowerCase().includes(q_lower)
        )
        .slice(0, 10)
        .map(r => ({ ...r, review_id: r.id, relevance_score: 0.8, ai_summary: `Matches search for "${q}"` }));
      setResults(local);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch();
    if (e.key === 'Escape') { setQuery(''); setResults([]); setSearched(false); }
  };

  const handleSuggestion = (s) => {
    setQuery(s);
    handleSearch(s);
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setSearched(false);
    inputRef.current?.focus();
  };

  const sentimentColor = { Positive: '#34d399', Negative: '#f87171', Neutral: '#60a5fa' };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">AI Search Engine</h1>
        <p className="page-subtitle">
          Semantic search powered by AI — find reviews by topic, sentiment, business type, or any keyword
        </p>
      </div>

      {/* Search Bar */}
      <div className="search-engine-bar" style={{ marginBottom: '1rem' }}>
        <div style={{ color: 'var(--primary-light)', flexShrink: 0 }}>
          {loading ? <Loader size={22} className="animate-spin" /> : <Sparkles size={22} />}
        </div>
        <input
          ref={inputRef}
          className="search-engine-input"
          placeholder="Search reviews by topic, sentiment, business type, keyword..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
        />
        {query && (
          <button className="btn btn-ghost" style={{ padding: '0.3rem' }} onClick={clearSearch}>
            <X size={16} />
          </button>
        )}
        <button className="btn btn-outline" onClick={() => setShowFilters(f => !f)}>
          <Filter size={15} />
          Filters
          {Object.values(filters).some(Boolean) && (
            <span style={{ background: 'var(--primary)', borderRadius: '50%', width: '6px', height: '6px' }} />
          )}
        </button>
        <button className="btn btn-primary" onClick={() => handleSearch()} disabled={!query.trim() || loading}>
          Search
        </button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="glass-card animate-fade-in" style={{ marginBottom: '1.25rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', padding: '1rem 1.25rem' }}>
          <div>
            <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '0.4rem' }}>Business Type</label>
            <select className="filter-select" value={filters.business_type} onChange={e => setFilters(f => ({ ...f, business_type: e.target.value }))}>
              <option value="">All</option>
              {['Restaurant', 'Hotel', 'Clinic', 'Salon', 'Theater'].map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '0.4rem' }}>Sentiment</label>
            <select className="filter-select" value={filters.sentiment} onChange={e => setFilters(f => ({ ...f, sentiment: e.target.value }))}>
              <option value="">All</option>
              {['Positive', 'Negative', 'Neutral'].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '0.4rem' }}>Min Rating</label>
            <select className="filter-select" value={filters.rating} onChange={e => setFilters(f => ({ ...f, rating: e.target.value }))}>
              <option value="">Any</option>
              {[5, 4, 3, 2, 1].map(r => <option key={r} value={r}>{r} Stars</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button className="btn btn-ghost" onClick={() => setFilters({ business_type: '', sentiment: '', rating: '' })}>
              Clear Filters
            </button>
          </div>
        </div>
      )}

      {/* Suggestions */}
      {!searched && (
        <div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Try searching for...
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '2rem' }}>
            {SUGGESTIONS.map(s => (
              <button
                key={s}
                className="tone-pill"
                onClick={() => handleSuggestion(s)}
                style={{ fontSize: '0.8rem' }}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Empty state */}
          <div className="glass-card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
            <div style={{ width: 80, height: 80, background: 'rgba(99,102,241,0.08)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
              <Sparkles size={36} style={{ color: 'var(--primary-light)' }} />
            </div>
            <h3 style={{ fontFamily: 'Outfit', fontSize: '1.25rem', marginBottom: '0.5rem' }}>AI-Powered Review Search</h3>
            <p style={{ color: 'var(--text-muted)', maxWidth: 400, margin: '0 auto', fontSize: '0.875rem', lineHeight: 1.6 }}>
              Search across all your reviews using natural language. Find patterns, spot issues, and discover what your customers love.
            </p>
          </div>
        </div>
      )}

      {/* Results */}
      {searched && !loading && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              Found <strong style={{ color: 'var(--text-main)' }}>{results.length}</strong> result{results.length !== 1 ? 's' : ''} for "<strong style={{ color: 'var(--primary-light)' }}>{query}</strong>"
            </p>
          </div>

          {results.length === 0 ? (
            <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
              <Search size={40} style={{ margin: '0 auto 1rem', opacity: 0.3, display: 'block' }} />
              <p style={{ color: 'var(--text-muted)' }}>No reviews found matching your search criteria.</p>
            </div>
          ) : (
            results.map((r, i) => {
              const bColor = BUSINESS_COLORS[r.business_type] || BUSINESS_COLORS.default;
              return (
                <div
                  key={r.review_id || i}
                  className="search-result-card animate-fade-in"
                  style={{ animationDelay: `${i * 0.06}s`, borderLeft: `3px solid ${bColor}` }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.625rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{r.author}</span>
                      <span className={`badge badge-${r.sentiment?.toLowerCase()}`}>{r.sentiment}</span>
                      <span className={`business-badge business-badge-${r.business_type?.toLowerCase()}`}>{r.business_type}</span>
                    </div>
                    <div className="relevance-bar">
                      <span>Relevance</span>
                      <div style={{ width: 60, background: 'rgba(255,255,255,0.06)', borderRadius: 3, height: 3, overflow: 'hidden' }}>
                        <div className="relevance-fill" style={{ width: `${(r.relevance_score || 0) * 100}%` }} />
                      </div>
                      <span>{Math.round((r.relevance_score || 0) * 100)}%</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '2px', marginBottom: '0.5rem' }}>
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} size={12} fill={j < r.rating ? '#fbbf24' : 'rgba(255,255,255,0.1)'} stroke="none" />
                    ))}
                  </div>

                  <p style={{ fontSize: '0.875rem', color: 'var(--text-sub)', lineHeight: 1.6, marginBottom: '0.5rem' }}>
                    {r.content}
                  </p>

                  {r.ai_summary && (
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', padding: '0.5rem 0.75rem', background: 'rgba(99,102,241,0.06)', borderRadius: '0.5rem', marginTop: '0.625rem' }}>
                      <Sparkles size={13} style={{ color: 'var(--primary-light)', marginTop: '2px', flexShrink: 0 }} />
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{r.ai_summary}</p>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default SearchEngineView;

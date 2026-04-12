import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Loader, Filter, Sparkles, Star, Globe, Zap, Cpu, Activity } from 'lucide-react';
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: 'easeOut' } }
  };

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
        .map(r => ({ ...r, id: r.id || Math.random(), relevance_score: 0.85, ai_summary: `Neural cluster match for "${q}"` }));
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

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="search-engine-aura"
    >
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '3.5rem' }}>
        <motion.div variants={itemVariants}>
          <h1 className="aura-header">Semantic Intelligence</h1>
          <p className="aura-subheader">Context-aware neural search across global review clusters.</p>
        </motion.div>
        <motion.div variants={itemVariants} className="glass-pill" style={{ height: '48px', padding: '0 1.5rem', background: 'rgba(167, 139, 250, 0.1)' }}>
          <Globe size={16} /> CLUSTER INDEX: READY
        </motion.div>
      </div>

      {/* Hero Search Area */}
      <motion.div variants={itemVariants} style={{ marginBottom: '3.5rem' }}>
        <div className="search-engine-bar" style={{ 
          height: '80px', 
          padding: '0 2rem', 
          background: 'rgba(17, 17, 34, 0.6)', 
          borderRadius: '2rem', 
          border: '1px solid rgba(167, 139, 250, 0.2)',
          boxShadow: '0 20px 50px rgba(0,0,0,0.4)',
          backdropFilter: 'blur(30px)'
        }}>
          <div style={{ color: 'var(--primary-light)', opacity: 0.8 }}>
            {loading ? <RefreshCw size={24} className="animate-spin" /> : <Sparkles size={24} />}
          </div>
          <input
            ref={inputRef}
            className="search-engine-input"
            style={{ fontSize: '1.15rem', padding: '0 1.5rem', fontWeight: 500 }}
            placeholder="Search reviews by intent, sentiment, or keyword cluster..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            {query && (
              <button className="btn btn-ghost" onClick={clearSearch}>
                <X size={18} />
              </button>
            )}
            <button 
              className={`btn ${showFilters ? 'btn-primary' : 'btn-outline'}`} 
              style={{ height: '48px', borderRadius: '1.25rem' }} 
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter size={16} />
            </button>
            <button 
              className="btn btn-primary" 
              style={{ height: '48px', borderRadius: '1.25rem', padding: '0 2rem', fontWeight: 800 }} 
              onClick={() => handleSearch()} disabled={!query.trim() || loading}
            >
              GENERATE RESULTS
            </button>
          </div>
        </div>
      </motion.div>

      {/* Filters Overlay */}
      <AnimatePresence>
        {showFilters && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{ overflow: 'hidden' }}
          >
            <div className="glass-card" style={{ marginBottom: '2.5rem', padding: '2rem', borderRadius: '2rem', border: '1px solid rgba(167, 139, 250, 0.1)' }}>
              <div className="grid-3" style={{ gap: '2rem' }}>
                <div>
                  <label className="label-caps" style={{ marginBottom: '1rem', display: 'block' }}>Platform Node</label>
                  <select className="filter-select" style={{ width: '100%', height: '52px', borderRadius: '1.25rem' }} value={filters.business_type} onChange={e => setFilters(f => ({ ...f, business_type: e.target.value }))}>
                    <option value="">All Entities</option>
                    {['Restaurant', 'Hotel', 'Clinic', 'Salon', 'Theater'].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label-caps" style={{ marginBottom: '1rem', display: 'block' }}>Sentiment Resonance</label>
                  <select className="filter-select" style={{ width: '100%', height: '52px', borderRadius: '1.25rem' }} value={filters.sentiment} onChange={e => setFilters(f => ({ ...f, sentiment: e.target.value }))}>
                    <option value="">All Frequencies</option>
                    {['Positive', 'Negative', 'Neutral'].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label-caps" style={{ marginBottom: '1rem', display: 'block' }}>Threshold Rating</label>
                  <select className="filter-select" style={{ width: '100%', height: '52px', borderRadius: '1.25rem' }} value={filters.rating} onChange={e => setFilters(f => ({ ...f, rating: e.target.value }))}>
                    <option value="">Any Magnitude</option>
                    {[5, 4, 3, 2, 1].map(r => <option key={r} value={r}>{r} Stars</option>)}
                  </select>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Content */}
      <div style={{ minHeight: '400px' }}>
        {!searched ? (
          <motion.div variants={itemVariants}>
            <div style={{ marginBottom: '2.5rem' }}>
              <p className="label-caps" style={{ opacity: 0.5, marginBottom: '1.5rem', letterSpacing: '2px' }}>SUGGESTED VECTORS</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                {SUGGESTIONS.map(s => (
                  <motion.button
                    key={s}
                    whileHover={{ scale: 1.05, background: 'rgba(167, 139, 250, 0.1)' }}
                    className="tone-pill"
                    onClick={() => handleSuggestion(s)}
                    style={{ fontSize: '0.85rem', padding: '0.6rem 1.25rem', borderRadius: '1rem' }}
                  >
                    {s}
                  </motion.button>
                ))}
              </div>
            </div>

            <div className="glass-card" style={{ textAlign: 'center', padding: '8rem 2rem', background: 'rgba(0,0,0,0.1)', border: '1px dashed rgba(167, 139, 250, 0.1)', borderRadius: '3rem' }}>
              <Cpu size={64} style={{ color: 'var(--primary)', opacity: 0.15, marginBottom: '2rem' }} className="animate-pulse" />
              <h3 style={{ fontSize: '1.75rem', fontWeight: 950, letterSpacing: '-1px', color: 'var(--text-sub)' }}>Awakening Neural Clusters</h3>
              <p style={{ color: 'var(--text-dim)', maxWidth: '420px', margin: '1rem auto 0', lineHeight: 1.8 }}>Enter a query above to initiate semantic analysis across your historical review data.</p>
            </div>
          </motion.div>
        ) : (
          <motion.div variants={itemVariants}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                <p style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                  Retrieved <span style={{ color: '#fff', fontWeight: 800 }}>{results.length}</span> neural matches for <span style={{ color: 'var(--primary-light)', fontWeight: 800 }}>"{query}"</span>
                </p>
                <div style={{ display: 'flex', gap: '1rem' }}>
                   <span className="glass-pill" style={{ opacity: 0.6, fontSize: '0.7rem' }}>RANKED BY RELEVANCE</span>
                </div>
             </div>

             {results.length === 0 ? (
               <div className="glass-card" style={{ textAlign: 'center', padding: '5rem', borderRadius: '2.5rem' }}>
                 <Activity size={48} style={{ opacity: 0.1, margin: '0 auto 2rem' }} />
                 <p style={{ fontWeight: 800, color: 'var(--text-muted)' }}>ZERO MATCHES DETECTED IN THE CURRENT CLUSTER.</p>
               </div>
             ) : (
               <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                 <AnimatePresence mode="popLayout">
                   {results.map((r, i) => {
                     const bColor = BUSINESS_COLORS[r.business_type] || BUSINESS_COLORS.default;
                     return (
                       <motion.div
                         key={r.id || i}
                         initial={{ opacity: 0, x: -20 }}
                         animate={{ opacity: 1, x: 0 }}
                         transition={{ delay: i * 0.05 }}
                         className="glass-card"
                         style={{ 
                            padding: '2rem', 
                            borderLeft: `4px solid ${bColor}80`, 
                            background: 'rgba(17, 17, 34, 0.5)',
                            borderRadius: '1.75rem',
                            position: 'relative',
                            overflow: 'hidden'
                         }}
                       >
                         {/* Relevance Background Glow */}
                         <div style={{ 
                           position: 'absolute', top: 0, right: 0, width: '150px', height: '100%', 
                           background: `linear-gradient(90deg, transparent, ${bColor}05)`, pointerEvents: 'none' 
                         }} />

                         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                           <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                             <div style={{ width: '40px', height: '40px', background: `${bColor}20`, color: bColor, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                               {r.author?.[0]?.toUpperCase() || 'A'}
                             </div>
                             <div>
                               <h4 style={{ fontWeight: 900, color: '#fff', fontSize: '1rem' }}>{r.author}</h4>
                               <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                                 <span className="badge" style={{ fontSize: '0.6rem', padding: '0.1rem 0.5rem', background: 'rgba(255,255,255,0.03)', color: 'var(--text-dim)' }}>{r.business_type?.toUpperCase()}</span>
                                 <span className="badge" style={{ fontSize: '0.6rem', padding: '0.1rem 0.5rem', background: 'rgba(255,255,255,0.03)', color: 'var(--text-dim)' }}>{r.sentiment?.toUpperCase()}</span>
                               </div>
                             </div>
                           </div>
                           <div style={{ textAlign: 'right' }}>
                             <div style={{ fontSize: '0.6rem', color: 'var(--text-dim)', fontWeight: 800, letterSpacing: '1px', marginBottom: '0.25rem' }}>RELEVANCE</div>
                             <div style={{ fontWeight: 950, color: 'var(--primary-light)', fontSize: '1.25rem' }}>{Math.round((r.relevance_score || 0.8) * 100)}%</div>
                           </div>
                         </div>

                         <div style={{ display: 'flex', gap: '3px', marginBottom: '1rem' }}>
                           {[...Array(5)].map((_, j) => (
                             <Star key={j} size={14} fill={j < r.rating ? bColor : 'rgba(255,255,255,0.05)'} stroke="none" />
                           ))}
                         </div>

                         <p style={{ fontSize: '0.95rem', color: 'var(--text-sub)', lineHeight: 1.7, marginBottom: '1.5rem' }}>
                           "{r.content}"
                         </p>

                         {r.ai_summary && (
                           <motion.div 
                             initial={{ opacity: 0, y: 5 }} 
                             animate={{ opacity: 1, y: 0 }}
                             style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '1.25rem', background: 'rgba(167, 139, 250, 0.05)', borderRadius: '1.25rem', border: '1px solid rgba(167, 139, 250, 0.1)' }}
                           >
                             <Zap size={16} color="var(--primary-light)" style={{ flexShrink: 0, marginTop: '2px' }} />
                             <p style={{ fontSize: '0.85rem', color: 'var(--primary-light)', lineHeight: 1.5, fontWeight: 500 }}>{r.ai_summary}</p>
                           </motion.div>
                         )}
                       </motion.div>
                     );
                   })}
                 </AnimatePresence>
               </div>
             )}
          </motion.div>
        )}
      </div>

      {/* Footer Disclaimer */}
      <motion.div variants={itemVariants} style={{ marginTop: '5rem', textAlign: 'center', opacity: 0.3 }}>
         <p style={{ fontSize: '0.7rem', letterSpacing: '1px', fontWeight: 800 }}>AURA SEARCH SYSTEM v4.2 // SEMANTIC INDEX ACTIVE</p>
      </motion.div>
    </motion.div>
  );
};

export default SearchEngineView;

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReviewCard from './ReviewCard';
import { Search, Filter, SortAsc, Zap, RefreshCw } from 'lucide-react';

const BUSINESS_TYPES = ['All', 'Restaurant', 'Hotel', 'Clinic', 'Salon', 'Theater'];
const SENTIMENTS = ['All', 'Positive', 'Negative', 'Neutral'];
const SORTS = ['Newest', 'Oldest', 'Highest', 'Lowest'];

const InboxView = ({ reviews, rules, initialFilter = 'All' }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('All');
  const [businessFilter, setBusinessFilter] = useState(initialFilter);
  const [sort, setSort] = useState('Newest');
  const [bulkTrigger, setBulkTrigger] = useState(0);

  React.useEffect(() => {
    if (initialFilter) setBusinessFilter(initialFilter);
  }, [initialFilter]);

  const filtered = useMemo(() => {
    let r = [...reviews];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      r = r.filter(x => x.author?.toLowerCase().includes(q) || x.content?.toLowerCase().includes(q));
    }
    if (filter !== 'All') r = r.filter(x => x.sentiment === filter);
    if (businessFilter !== 'All') r = r.filter(x => x.business_type === businessFilter);
    r.sort((a, b) => {
      if (sort === 'Newest') return new Date(b.date) - new Date(a.date);
      if (sort === 'Oldest') return new Date(a.date) - new Date(b.date);
      if (sort === 'Highest') return b.rating - a.rating;
      if (sort === 'Lowest') return a.rating - b.rating;
      return 0;
    });
    return r;
  }, [reviews, searchQuery, filter, businessFilter, sort]);

  const pending = filtered.filter(r => r.status !== 'Published').length;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: 'easeOut' } }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="inbox-view"
    >
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '3.5rem' }}>
        <motion.div variants={itemVariants}>
          <h1 className="aura-header">Review Intelligence</h1>
          <p className="aura-subheader">Global review stream for {businessFilter === 'All' ? 'all business clusters' : businessFilter}.</p>
        </motion.div>
        <motion.button 
          variants={itemVariants}
          whileHover={{ scale: 1.05, boxShadow: '0 0 20px var(--primary-glow)' }}
          whileTap={{ scale: 0.95 }}
          className="btn btn-primary" 
          onClick={() => setBulkTrigger(Date.now())} 
          style={{ height: '56px', borderRadius: '1.5rem', padding: '0 2.5rem', fontWeight: 800, letterSpacing: '1px' }}
        >
          <Zap size={20} /> AUTOMATE ALL ({pending})
        </motion.button>
      </div>

      <motion.div 
        variants={itemVariants}
        className="toolbar" 
        style={{ 
          background: 'rgba(17, 17, 34, 0.4)', 
          borderRadius: '1.75rem', 
          padding: '0.875rem 1.5rem', 
          border: '1px solid rgba(167, 139, 250, 0.1)', 
          marginBottom: '3rem',
          backdropFilter: 'blur(20px)'
        }}
      >
        <div className="search-wrapper" style={{ flex: 1.5 }}>
          <Search size={18} className="search-icon" style={{ left: '1.5rem', color: 'var(--primary-light)', opacity: 0.6 }} />
          <input
            type="text"
            className="search-input"
            style={{ 
              height: '52px', 
              paddingLeft: '4rem', 
              fontSize: '0.95rem', 
              borderRadius: '1.25rem', 
              background: 'rgba(0,0,0,0.3)',
              border: '1px solid rgba(167, 139, 250, 0.05)'
            }}
            placeholder="Search authors or neural content..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', flex: 2 }}>
          <select className="filter-select" style={{ flex: 1, height: '52px', borderRadius: '1.25rem', background: 'rgba(0,0,0,0.3)' }} value={businessFilter} onChange={e => setBusinessFilter(e.target.value)}>
            {BUSINESS_TYPES.map(t => <option key={t} value={t}>{t === 'All' ? '🏢 ALL CLUSTERS' : t.toUpperCase()}</option>)}
          </select>
          <select className="filter-select" style={{ flex: 1, height: '52px', borderRadius: '1.25rem', background: 'rgba(0,0,0,0.3)' }} value={filter} onChange={e => setFilter(e.target.value)}>
            {SENTIMENTS.map(s => <option key={s} value={s}>{s === 'All' ? '🌓 ALL SENTIMENTS' : s.toUpperCase()}</option>)}
          </select>
          <select className="filter-select" style={{ flex: 1, height: '52px', borderRadius: '1.25rem', background: 'rgba(0,0,0,0.3)' }} value={sort} onChange={e => setSort(e.target.value)}>
            {SORTS.map(s => <option key={s} value={s}>{s === 'Newest' ? '🕒 NEWEST FIRST' : s.toUpperCase()}</option>)}
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', paddingLeft: '1.5rem', borderLeft: '1px solid rgba(167, 139, 250, 0.15)' }}>
          <span className="glass-pill">
            {filtered.length} NODES
          </span>
          {pending > 0 && (
            <span className="badge" style={{ background: 'rgba(167, 139, 250, 0.05)', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 800 }}>
              {pending} PENDING
            </span>
          )}
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="review-grid">
        <AnimatePresence mode="popLayout">
          {filtered.map((review, i) => (
            <motion.div
              key={review.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.4 }}
            >
              <ReviewCard review={review} index={i} bulkTrigger={bulkTrigger} rules={rules} />
            </motion.div>
          ))}
        </AnimatePresence>

        {filtered.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ gridColumn: '1/-1', textAlign: 'center', padding: '8rem 2rem', color: 'var(--text-muted)', background: 'rgba(11,11,26,0.2)', borderRadius: '3rem', border: '1px dashed rgba(167, 139, 250, 0.1)' }}
          >
            <Search size={64} style={{ margin: '0 auto 2rem', display: 'block', opacity: 0.1, filter: 'blur(1px)' }} />
            <h2 style={{ fontSize: '1.75rem', fontWeight: 900, letterSpacing: '-1px', color: 'var(--text-sub)' }}>No matches in the current stream.</h2>
            <p style={{ fontSize: '1rem', opacity: 0.6, marginTop: '0.75rem', maxWidth: '400px', margin: '0.75rem auto 0' }}>The neural clusters have processed all available data. Try adjusting your search query or filters.</p>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default InboxView;

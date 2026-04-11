import React, { useState, useMemo } from 'react';
import ReviewCard from './ReviewCard';
import { Search, Filter, SortAsc, Zap } from 'lucide-react';

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

  return (
    <div className="animate-fade-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Review Inbox</h1>
          <p className="page-subtitle">AI-powered responses for restaurants, hotels, clinics, salons & theaters</p>
        </div>
        <button className="btn btn-primary" onClick={() => setBulkTrigger(Date.now())}>
          <Zap size={16} /> Bulk Generate All
        </button>
      </div>

      {/* Toolbar */}
      <div className="toolbar">
        <div className="search-wrapper">
          <Search size={15} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search reviews, authors..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        <select className="filter-select" value={businessFilter} onChange={e => setBusinessFilter(e.target.value)}>
          {BUSINESS_TYPES.map(t => <option key={t} value={t}>{t === 'All' ? '🏢 All Types' : t}</option>)}
        </select>
        <select className="filter-select" value={filter} onChange={e => setFilter(e.target.value)}>
          {SENTIMENTS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className="filter-select" value={sort} onChange={e => setSort(e.target.value)}>
          {SORTS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
          {filtered.length} review{filtered.length !== 1 ? 's' : ''}
          {pending > 0 && <span style={{ color: '#f87171', marginLeft: '0.3rem' }}>· {pending} pending</span>}
        </span>
      </div>

      {/* Review Grid */}
      <div className="review-grid">
        {filtered.map((review, i) => (
          <ReviewCard key={review.id} review={review} index={i} bulkTrigger={bulkTrigger} rules={rules} />
        ))}
        {filtered.length === 0 && (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
            <Search size={40} style={{ margin: '0 auto 1rem', display: 'block', opacity: 0.3 }} />
            <p>No reviews matching your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InboxView;

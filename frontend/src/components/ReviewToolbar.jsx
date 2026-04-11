import React from 'react';
import { Search, Filter, SortAsc, Zap } from 'lucide-react';

const ReviewToolbar = ({ 
  searchQuery, 
  setSearchQuery, 
  filter, 
  setFilter, 
  sort, 
  setSort,
  onBulkDraft
}) => {
  return (
    <div className="toolbar animate-fade-in">
      <div className="search-wrapper">
        <Search className="search-icon" size={18} />
        <input 
          type="text" 
          placeholder="Search reviews by name or content..." 
          className="search-input"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Filter size={16} style={{ color: 'var(--text-muted)' }} />
          <select 
            className="filter-select"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="All">All Sentiments</option>
            <option value="Positive">Positive</option>
            <option value="Negative">Negative</option>
            <option value="Neutral">Neutral</option>
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <SortAsc size={16} style={{ color: 'var(--text-muted)' }} />
          <select 
            className="filter-select"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="Newest">Newest First</option>
            <option value="Oldest">Oldest First</option>
            <option value="Highest">Rating: High to Low</option>
            <option value="Lowest">Rating: Low to High</option>
          </select>
        </div>

        <button 
          className="btn btn-primary" 
          style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}
          onClick={onBulkDraft}
        >
          <Zap size={16} />
          Bulk Draft
        </button>
      </div>
    </div>
  );
};

export default ReviewToolbar;

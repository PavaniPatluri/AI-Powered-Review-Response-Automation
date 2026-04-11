import React, { useState, useEffect, useRef } from 'react';
import { Radio, Zap, Star, AlertCircle, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import { fetchRealtimeReview } from '../api';

const BUSINESS_COLORS = {
  Restaurant: '#f59e0b', Hotel: '#6366f1', Clinic: '#10b981',
  Salon: '#ec4899', Theater: '#8b5cf6', default: '#3b82f6'
};

const BUSINESS_ICONS = {
  Restaurant: '🍽️', Hotel: '🏨', Clinic: '🏥', Salon: '💇', Theater: '🎭'
};

const SentimentIcon = ({ s }) => {
  if (s === 'Positive') return <span style={{ color: '#34d399' }}>😊</span>;
  if (s === 'Negative') return <span style={{ color: '#f87171' }}>😤</span>;
  return <span style={{ color: '#60a5fa' }}>😐</span>;
};

const RealtimeView = ({ reviews = [] }) => {
  const [pulseCount, setPulseCount] = useState(0);
  const isPolling = true; // Added to fix ReferenceError

  useEffect(() => {
    setPulseCount(reviews.length);
  }, [reviews.length]);

  const liveReviews = reviews.slice(0, 15);


  const stats = {
    total: reviews.length,
    positive: reviews.filter(r => r.sentiment === 'Positive').length,
    negative: reviews.filter(r => r.sentiment === 'Negative').length,
    avgRating: reviews.length ? (reviews.reduce((a, b) => a + (b.rating || 0), 0) / reviews.length).toFixed(1) : '—'
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Live Review Feed</h1>
          <p className="page-subtitle">Real-time stream of incoming customer reviews across all platforms</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(99, 102, 241, 0.1)', padding: '0.5rem 1rem', borderRadius: '0.75rem', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
          <div className="live-dot" />
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-light)', letterSpacing: '1px' }}>NEURAL SYNC ACTIVE</span>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid-4" style={{ marginBottom: '1.5rem' }}>
        {[
          { label: 'Reviews Received', value: stats.total, color: '#6366f1', icon: <Zap size={18} /> },
          { label: 'Positive', value: stats.positive, color: '#10b981', icon: '😊' },
          { label: 'Negative', value: stats.negative, color: '#ef4444', icon: '😤' },
          { label: 'Avg Rating', value: stats.avgRating, color: '#f59e0b', icon: <Star size={18} fill="#f59e0b" strokeWidth={0} /> },
        ].map((s, i) => (
          <div key={i} className="stat-card" style={{ animationDelay: `${i * 0.1}s` }}>
            <div className="stat-card-glow" style={{ background: s.color }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ color: s.color, fontSize: '1.25rem' }}>{s.icon}</span>
              {isPolling && i === 0 && <span className="live-label"><span className="live-dot" />LIVE</span>}
            </div>
            <div className="stat-number" style={{ color: s.color, fontSize: '2rem' }}>{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Feed */}
      <div className="glass-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '1rem', fontFamily: 'Outfit', fontWeight: 700 }}>Incoming Reviews</h3>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <span className="live-label">
              <span className="live-dot" /> Global synchronization enabled
            </span>
          </div>
          </div>
        </div>

        <div style={{ maxHeight: '600px', overflowY: 'auto', paddingRight: '0.25rem' }}>
          {liveReviews.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              <Radio size={40} style={{ marginBottom: '1rem', opacity: 0.3 }} />
              <p>Waiting for incoming reviews...</p>
            </div>
          ) : (
            liveReviews.map((review, i) => {
              const bColor = BUSINESS_COLORS[review.business_type] || BUSINESS_COLORS.default;
              const bIcon = BUSINESS_ICONS[review.business_type] || '⭐';
              const initials = review.author?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
              return (
                <div key={review.id || i} className="realtime-item" style={{ borderLeft: `3px solid ${bColor}20` }}>
                  <div className="realtime-avatar" style={{ background: `${bColor}25`, color: bColor }}>
                    {initials}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem', flexWrap: 'wrap', gap: '0.375rem' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{review.author}</span>
                      <div style={{ display: 'flex', gap: '0.375rem', alignItems: 'center', flexShrink: 0 }}>
                        <span className={`badge badge-${review.sentiment?.toLowerCase()}`}>{review.sentiment}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{review.date?.slice(-5)}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '0.4rem' }}>
                      {[...Array(5)].map((_, j) => (
                        <Star key={j} size={11} fill={j < review.rating ? '#fbbf24' : 'rgba(255,255,255,0.1)'} stroke="none" />
                      ))}
                    </div>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-sub)', lineHeight: 1.5 }}>
                      {review.content?.slice(0, 120)}{review.content?.length > 120 ? '...' : ''}
                    </p>
                    <div style={{ display: 'flex', gap: '0.375rem', marginTop: '0.5rem' }}>
                      <span style={{ fontSize: '0.7rem' }}>{bIcon}</span>
                      <span style={{ fontSize: '0.7rem', color: bColor, fontWeight: 600 }}>{review.business_type}</span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>· {review.platform}</span>
                    </div>
                  </div>
                  {review.is_new && (
                    <span style={{ fontSize: '0.6rem', background: 'rgba(99,102,241,0.15)', color: 'var(--primary-light)', padding: '0.15rem 0.4rem', borderRadius: '0.3rem', fontWeight: 700, flexShrink: 0 }}>NEW</span>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default RealtimeView;

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Radio, Zap, Star, Activity, TrendingUp, Info } from 'lucide-react';
import { fetchRealtimeReview } from '../api';

const BUSINESS_COLORS = {
  Restaurant: '#f59e0b', Hotel: '#6366f1', Clinic: '#10b981',
  Salon: '#ec4899', Theater: '#8b5cf6', default: '#3b82f6'
};

const BUSINESS_ICONS = {
  Restaurant: '🍽️', Hotel: '🏨', Clinic: '🏥', Salon: '💇', Theater: '🎭'
};

const RealtimeView = ({ reviews = [] }) => {
  const isPolling = true;

  const stats = {
    total: reviews.length,
    positive: reviews.filter(r => r.sentiment === 'Positive').length,
    negative: reviews.filter(r => r.sentiment === 'Negative').length,
    avgRating: reviews.length ? (reviews.reduce((a, b) => a + (b.rating || 0), 0) / reviews.length).toFixed(1) : '—'
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: 'easeOut' } }
  };

  const liveReviews = reviews.slice(0, 15);

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="realtime-view"
    >
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '3.5rem' }}>
        <motion.div variants={itemVariants}>
          <h1 className="aura-header">Live Intelligence</h1>
          <p className="aura-subheader">Real-time neural stream of incoming reviews across all clusters.</p>
        </motion.div>
        <motion.div 
          variants={itemVariants} 
          className="glass-pill" 
          style={{ height: '48px', padding: '0 1.5rem', background: 'rgba(167, 139, 250, 0.1)' }}
        >
          <div className="live-dot" style={{ background: 'var(--primary-light)', boxShadow: '0 0 10px var(--primary-glow)' }} />
          <span className="label-caps" style={{ color: 'var(--primary-light)', fontSize: '0.7rem' }}>NEURAL SYNC ACTIVE</span>
        </motion.div>
      </div>

      {/* Stats Row */}
      <div className="grid-4" style={{ marginBottom: '3.5rem', gap: '1.5rem' }}>
        {[
          { label: 'NODES RECEIVED', value: stats.total, color: '#6366f1', icon: <Zap size={20} /> },
          { label: 'POSITIVE RESONANCE', value: stats.positive, color: '#10b981', icon: <TrendingUp size={20} /> },
          { label: 'NEGATIVE DIFFUSION', value: stats.negative, color: '#ef4444', icon: <Info size={20} /> },
          { label: 'AVERAGE RADIANCE', value: stats.avgRating, color: '#f59e0b', icon: <Star size={20} fill="#f59e0b" stroke="none" /> },
        ].map((s, i) => (
          <motion.div 
            key={i} 
            variants={itemVariants}
            whileHover={{ y: -5, background: 'rgba(167, 139, 250, 0.05)' }}
            className="stat-card" 
            style={{ background: 'rgba(17, 17, 34, 0.5)', border: '1px solid rgba(167, 139, 250, 0.05)', padding: '2rem' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <span style={{ color: s.color, opacity: 0.8 }}>{s.icon}</span>
              {isPolling && i === 0 && <span className="glass-pill" style={{ fontSize: '0.6rem', padding: '0.2rem 0.6rem' }}>LIVE</span>}
            </div>
            <div className="stat-number" style={{ color: '#fff', fontSize: '2.5rem', fontWeight: 900, marginBottom: '0.25rem' }}>{s.value}</div>
            <div className="label-caps" style={{ opacity: 0.5, fontSize: '0.65rem' }}>{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Feed */}
      <motion.div variants={itemVariants} className="glass-card" style={{ padding: '2.5rem', background: 'rgba(17, 17, 34, 0.4)', borderRadius: '2.5rem', border: '1px solid rgba(167, 139, 250, 0.08)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Activity size={18} color="var(--primary-light)" />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#fff', letterSpacing: '-0.5px' }}>Incoming Strategic Nodes</h3>
          </div>
          <span className="glass-pill" style={{ opacity: 0.5 }}>
            GLOBAL SYNC ENABLED
          </span>
        </div>

        <div style={{ maxHeight: '600px', overflowY: 'auto', paddingRight: '1rem' }}>
          <AnimatePresence mode="popLayout">
            {liveReviews.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{ textAlign: 'center', padding: '8rem 2rem', color: 'var(--text-muted)' }}
              >
                <Radio size={48} className="animate-pulse" style={{ marginBottom: '2rem', opacity: 0.2 }} />
                <p className="label-caps" style={{ opacity: 0.4 }}>Waiting for incoming neural signals...</p>
              </motion.div>
            ) : (
              liveReviews.map((review, i) => {
                const bColor = BUSINESS_COLORS[review.business_type] || BUSINESS_COLORS.default;
                const bIcon = BUSINESS_ICONS[review.business_type] || '⭐';
                const initials = review.author?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
                return (
                  <motion.div 
                    key={review.id || i}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.4 }}
                    className="realtime-item" 
                    style={{ 
                      borderLeft: `3px solid ${bColor}40`, 
                      background: 'rgba(0,0,0,0.2)', 
                      borderRadius: '1.25rem',
                      padding: '1.5rem',
                      marginBottom: '1rem',
                      display: 'flex',
                      gap: '1.5rem'
                    }}
                  >
                    <div className="realtime-avatar" style={{ background: `${bColor}20`, color: bColor, width: '48px', height: '48px', borderRadius: '1rem', fontWeight: 800, fontSize: '0.9rem' }}>
                      {initials}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <span style={{ fontWeight: 800, fontSize: '1rem', color: '#fff' }}>{review.author}</span>
                        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                          <span className="glass-pill" style={{ background: `${bColor}10`, color: bColor, border: `1px solid ${bColor}20`, fontSize: '0.65rem' }}>{review.sentiment.toUpperCase()}</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600 }}>{review.date?.slice(-5)}</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '0.3rem', marginBottom: '0.75rem' }}>
                        {[...Array(5)].map((_, j) => (
                          <Star key={j} size={12} fill={j < review.rating ? '#fbbf24' : 'rgba(255,255,255,0.05)'} stroke="none" />
                        ))}
                      </div>
                      <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '1rem' }}>
                        {review.content}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                          <span style={{ fontSize: '1rem' }}>{bIcon}</span>
                          <span className="label-caps" style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>{review.business_type}</span>
                        </div>
                        <span style={{ color: 'rgba(255,255,255,0.1)' }}>|</span>
                        <span className="label-caps" style={{ fontSize: '0.65rem', color: 'var(--text-dim)', opacity: 0.6 }}>{review.platform}</span>
                        {review.is_new && (
                          <span className="glass-pill" style={{ marginLeft: 'auto', background: 'rgba(167,139,250,0.1)', color: 'var(--primary-light)', fontSize: '0.6rem', border: '1px solid rgba(167,139,250,0.2)' }}>NEW NODAL DATA</span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default RealtimeView;

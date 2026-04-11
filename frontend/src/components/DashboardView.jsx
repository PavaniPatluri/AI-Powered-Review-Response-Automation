import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Star, MessageSquare, CheckCircle, Clock, Download, RefreshCw, Zap, Activity, ShieldCheck, AlertCircle, Cpu, Target } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell, Legend } from 'recharts';
import { fetchTrends, EXPORT_REVIEWS_URL } from '../api';
import DashboardCore from './DashboardCore';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: 'easeOut' } }
};

const DashboardView = ({ reviews, onExport }) => {
  const [trends, setTrends] = useState(null);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(new Date().toLocaleTimeString());

  const handleRefreshInsights = async () => {
    setLoading(true);
    try {
      const d = await fetchTrends();
      setTrends(d);
      setNow(new Date().toLocaleTimeString());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrends().then(d => { setTrends(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const total = reviews.length;
  const positive = reviews.filter(r => r.sentiment === 'Positive').length;
  const negative = reviews.filter(r => r.sentiment === 'Negative').length;
  const neutral = reviews.filter(r => r.sentiment === 'Neutral').length;
  const published = reviews.filter(r => r.status === 'Published').length;
  const pending = reviews.filter(r => r.status === 'Pending').length;
  const avgRating = total ? (reviews.reduce((a, b) => a + (b.rating || 0), 0) / total).toFixed(1) : '—';
  const responseRate = total ? Math.round((published / total) * 100) : 0;

  // Data for Charts
  const byBusiness = {};
  reviews.forEach(r => {
    const t = r.business_type || 'Other';
    if (!byBusiness[t]) byBusiness[t] = { total: 0, positive: 0 };
    byBusiness[t].total++;
    if (r.sentiment === 'Positive') byBusiness[t].positive++;
  });

  const ratingDist = [1, 2, 3, 4, 5].map(r => ({
    name: `${r} Star`,
    count: reviews.filter(x => x.rating === r).length,
    color: r > 3 ? '#34d399' : (r === 3 ? '#60a5fa' : '#f87171')
  }));

  // Timeline Data
  const sortedReviews = [...reviews].sort((a,b) => new Date(a.date) - new Date(b.date));
  const trendsByDate = {};
  sortedReviews.forEach(r => {
    const d = r.date.split(' ')[0]; // Group by day
    if (!trendsByDate[d]) trendsByDate[d] = { date: d.substring(5), Positive: 0, Negative: 0, Neutral: 0 };
    trendsByDate[d][r.sentiment]++;
  });
  const timelineData = Object.values(trendsByDate).slice(-15); // Last 15 days

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ background: 'rgba(10, 15, 30, 0.9)', border: '1px solid rgba(255,255,255,0.1)', padding: '10px', borderRadius: '8px', zIndex: 1000, position: 'relative' }}>
          <p style={{ margin: '0 0 5px 0', fontSize: '0.8rem', color: '#fff', fontWeight: 'bold' }}>{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ margin: 0, fontSize: '0.75rem', color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      {/* 3D Core Hero Section */}
      <div className="glass-card" style={{ padding: 0, overflow: 'hidden', marginBottom: '2rem', minHeight: '400px', display: 'flex', position: 'relative' }}>
        <div style={{ flex: 1, padding: '3rem', position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <motion.div variants={itemVariants}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <span className="badge badge-positive" style={{ fontSize: '0.75rem', padding: '0.4rem 1rem' }}>🚀 SYSTEM ONLINE</span>
              <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>• {now}</span>
            </div>
            <h1 className="page-title" style={{ fontSize: '3.5rem', marginBottom: '1rem', lineHeight: 1 }}>Review Catalyst Dashboard</h1>
            <p className="page-subtitle" style={{ fontSize: '1.1rem', maxWidth: '500px', opacity: 0.8 }}>
              Synchronizing real-time review intelligence across {Object.keys(byBusiness).length} business clusters.
            </p>
            
            <div style={{ display: 'flex', gap: '1rem', marginTop: '2.5rem' }}>
              <button className="btn btn-primary" onClick={onExport} style={{ padding: '0.875rem 2rem' }}>
                <Download size={18} /> GENERATE REPORT
              </button>
              <button className="btn btn-outline" onClick={handleRefreshInsights} disabled={loading} style={{ padding: '0.875rem 1.5rem' }}>
                <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
              </button>
            </div>
          </motion.div>
        </div>
        
        <div style={{ flex: 1, position: 'relative' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at center, rgba(99, 102, 241, 0.15), transparent 70%)', zIndex: 1 }} />
          <DashboardCore intensity={trends?.score || 70} />
        </div>
      </div>

      {/* KPI Staggered Row */}
      <div className="grid-4" style={{ marginBottom: '2rem' }}>
        {[
          { label: 'Intelligence Core', value: total, color: 'var(--primary)', icon: <Activity size={20} />, status: 'ACTIVE' },
          { label: 'Sentiment Index', value: `${avgRating}★`, color: 'var(--accent-amber)', icon: <Star size={20} />, status: 'SYNCED' },
          { label: 'Auto-Response', value: `${responseRate}%`, color: 'var(--accent-green)', icon: <Zap size={20} />, status: 'ONLINE' },
          { label: 'Neural Backlog', value: pending, color: 'var(--accent-red)', icon: <MessageSquare size={20} />, status: 'QUEUED' },
        ].map((s, i) => (
          <motion.div key={i} variants={itemVariants} className="stat-card" style={{ borderTop: `2px solid ${s.color}` }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div style={{ color: s.color, opacity: 0.8 }}>{s.icon}</div>
                <span style={{ fontSize: '0.6rem', color: s.color, fontWeight: 800, letterSpacing: '1px' }}>{s.status}</span>
             </div>
             <div className="stat-number" style={{ fontSize: '2.8rem' }}>{s.value}</div>
             <div className="stat-label">{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Interactive Charts Row */}
      <div className="grid-2" style={{ marginBottom: '2rem', gap: '1.5rem' }}>
        {/* Timeline Chart */}
        <motion.div variants={itemVariants} className="glass-card luxe-card" style={{ padding: '2rem', height: '400px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', fontSize: '1.1rem' }}>
            <TrendingUp size={18} color="var(--accent-cyan)" /> Sentiment Frequency Metrics
          </h3>
          <div style={{ flex: 1, minHeight: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#34d399" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#34d399" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorNeg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f87171" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f87171" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="rgba(255,255,255,0.2)" fontSize={11} tickMargin={10} axisLine={false} tickLine={false} />
                <YAxis stroke="rgba(255,255,255,0.2)" fontSize={11} axisLine={false} tickLine={false} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <RechartsTooltip content={<CustomTooltip />} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', color: 'var(--text-muted)' }} />
                <Area type="monotone" dataKey="Positive" stroke="#34d399" strokeWidth={3} fillOpacity={1} fill="url(#colorPos)" />
                <Area type="monotone" dataKey="Negative" stroke="#f87171" strokeWidth={3} fillOpacity={1} fill="url(#colorNeg)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Rating Distribution */}
        <motion.div variants={itemVariants} className="glass-card insight-card" style={{ padding: '2rem', height: '400px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', fontSize: '1.1rem' }}>
            <Star size={18} color="var(--accent-amber)" /> Star Distribution Core
          </h3>
          <div style={{ flex: 1, minHeight: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ratingDist} layout="vertical" margin={{ top: 0, right: 30, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis type="number" stroke="rgba(255,255,255,0.2)" fontSize={11} hide />
                <YAxis dataKey="name" type="category" stroke="var(--text-sub)" fontSize={12} axisLine={false} tickLine={false} width={60} />
                <RechartsTooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} content={<CustomTooltip />} />
                <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={24} animationDuration={1500}>
                  {ratingDist.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* AI Neural Insights Section */}
      <motion.div variants={itemVariants} className="grid-1" style={{ marginBottom: '2rem' }}>
        <div className="glass-card luxe-card" style={{ padding: '2.5rem', borderLeft: '4px solid var(--primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <Cpu size={20} color="var(--primary-light)" className="animate-pulse" />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.5px' }}>NEURAL STRATEGIC INTELLIGENCE</h3>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Deep AI analysis across all customer touchpoints</p>
            </div>
            {trends && (
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: 800, marginBottom: '0.25rem' }}>HEALTH SCORE</div>
                <div style={{ fontSize: '2rem', fontWeight: 900, color: trends.score > 80 ? 'var(--accent-green)' : (trends.score > 60 ? 'var(--accent-amber)' : 'var(--accent-red)') }}>
                  {trends.score}<span style={{ fontSize: '0.8rem', opacity: 0.5 }}>/100</span>
                </div>
              </div>
            )}
          </div>

          <div className="grid-3" style={{ gap: '2rem' }}>
            {/* Strategic Summary */}
            <div style={{ gridColumn: 'span 1' }}>
              <div className="label-caps" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Target size={14} /> Executive Summary
              </div>
              <p style={{ fontSize: '1.05rem', lineHeight: 1.6, color: 'var(--text-sub)', fontWeight: 400 }}>
                {loading ? 'Decrypting latest trends...' : (trends?.summary || 'Connect your Gemini API key in settings to unlock deep neural insights.')}
              </p>
            </div>

            {/* Themes: Strengths */}
            <div style={{ gridColumn: 'span 1' }}>
              <div className="label-caps" style={{ marginBottom: '1rem', color: 'var(--accent-green)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldCheck size={14} /> Performance Strengths
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {loading ? [1,2,3].map(i => <div key={i} className="shimmer" style={{ height: '40px', borderRadius: '8px' }} />) : 
                (trends?.strengths || []).map((s, i) => (
                  <motion.div 
                    key={i} 
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className="trend-item" 
                    style={{ background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.1)', padding: '0.8rem 1rem', borderRadius: '10px' }}
                  >
                    <div className="trend-dot" style={{ background: 'var(--accent-green)' }} />
                    <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{s}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Themes: Weaknesses */}
            <div style={{ gridColumn: 'span 1' }}>
              <div className="label-caps" style={{ marginBottom: '1rem', color: 'var(--accent-red)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertCircle size={14} /> Improvement Vectors
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {loading ? [1,2,3].map(i => <div key={i} className="shimmer" style={{ height: '40px', borderRadius: '8px' }} />) : 
                (trends?.weaknesses || []).map((w, i) => (
                  <motion.div 
                    key={i} 
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className="trend-item" 
                    style={{ background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.1)', padding: '0.8rem 1rem', borderRadius: '10px' }}
                  >
                    <div className="trend-dot" style={{ background: 'var(--accent-red)' }} />
                    <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{w}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

    </motion.div>
  );
};

export default DashboardView;

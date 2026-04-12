import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Star, MessageSquare, CheckCircle, Clock, Download, RefreshCw, Zap, Activity, ShieldCheck, AlertCircle, Cpu, Target, Brain } from 'lucide-react';
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
    color: r === 5 ? 'var(--accent-green)' : (r === 4 ? 'var(--primary)' : (r === 3 ? 'var(--accent-cyan)' : (r === 2 ? 'var(--accent-amber)' : 'var(--accent-red)')))
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
      {/* Zen Hero Section */}
      <div className="glass-card" style={{ padding: 0, overflow: 'hidden', marginBottom: '2.5rem', minHeight: '440px', display: 'flex', position: 'relative', border: 'none', background: 'rgba(17, 17, 34, 0.4)' }}>
        <div style={{ flex: 1.2, padding: '4rem', position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <motion.div variants={itemVariants}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <span className="badge" style={{ background: 'rgba(167, 139, 250, 0.1)', color: 'var(--primary-light)', fontSize: '0.7rem', padding: '0.4rem 1.25rem', border: '1px solid rgba(167, 139, 250, 0.2)', borderRadius: '2rem' }}>AURA SYSTEM ONLINE</span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>{now}</span>
            </div>
            <h1 className="page-title" style={{ fontSize: '4.2rem', marginBottom: '1.25rem', lineHeight: 0.9, letterSpacing: '-2px' }}>Review Catalyst</h1>
            <p className="page-subtitle" style={{ fontSize: '1.15rem', maxWidth: '520px', opacity: 0.7, lineHeight: 1.5 }}>
              Sophisticated real-time review intelligence. Synchronizing neural clusters across {Object.keys(byBusiness).length} business locations.
            </p>
            
            <div style={{ display: 'flex', gap: '1.25rem', marginTop: '3rem' }}>
              <button className="btn btn-primary" onClick={onExport} style={{ padding: '1rem 2.5rem', borderRadius: '1.5rem', fontSize: '0.9rem' }}>
                <Download size={18} /> EXPORT INSIGHTS
              </button>
              <button className="btn btn-outline" onClick={handleRefreshInsights} disabled={loading} style={{ padding: '1rem 1.5rem', borderRadius: '1.5rem', border: '1px solid rgba(167, 139, 250, 0.2)' }}>
                <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
              </button>
            </div>
          </motion.div>
        </div>
        
        <div style={{ flex: 1, position: 'relative' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at center, rgba(167, 139, 250, 0.1), transparent 75%)', zIndex: 1 }} />
          <DashboardCore intensity={trends?.score || 70} />
        </div>
      </div>

      {/* Zen KPI Nodes */}
      <div className="grid-4" style={{ marginBottom: '2.5rem', gap: '1.5rem' }}>
        {[
          { label: 'Intelligence Core', value: total, color: 'var(--primary)', icon: <Cpu size={20} />, status: 'ACTIVE' },
          { label: 'Sentiment Index', value: `${avgRating}★`, color: 'var(--accent-cyan)', icon: <Star size={20} />, status: 'SYNCED' },
          { label: 'Auto-Response', value: `${responseRate}%`, color: 'var(--primary-light)', icon: <Zap size={20} />, status: 'ONLINE' },
          { label: 'Neural Backlog', value: pending, color: 'var(--text-muted)', icon: <Clock size={20} />, status: 'QUEUED' },
        ].map((s, i) => (
          <motion.div key={i} variants={itemVariants} className="stat-card" style={{ background: 'rgba(17, 17, 34, 0.5)', border: '1px solid rgba(167, 139, 250, 0.05)', padding: '2rem' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                <div style={{ color: s.color, opacity: 0.9 }}>{s.icon}</div>
                <span style={{ fontSize: '0.65rem', color: s.color, fontWeight: 800, letterSpacing: '2px', opacity: 0.6 }}>{s.status}</span>
             </div>
             <div className="stat-number" style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '0.5rem' }}>{s.value}</div>
             <div className="stat-label" style={{ fontSize: '0.75rem', opacity: 0.5, letterSpacing: '1px' }}>{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Interactive Charts Row */}
      <div className="grid-2" style={{ marginBottom: '2.5rem', gap: '1.5rem' }}>
        {/* Timeline Chart */}
        <motion.div variants={itemVariants} className="glass-card" style={{ padding: '2.5rem', height: '440px', display: 'flex', flexDirection: 'column', border: '1px solid rgba(167, 139, 250, 0.05)' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem', fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)' }}>
            <Activity size={18} color="var(--primary)" /> SENTIMENT FREQUENCY
          </h3>
          <div style={{ flex: 1, minHeight: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorCyan" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent-cyan)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--accent-cyan)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="rgba(167, 139, 250, 0.2)" fontSize={11} tickMargin={10} axisLine={false} tickLine={false} />
                <YAxis stroke="rgba(167, 139, 250, 0.2)" fontSize={11} axisLine={false} tickLine={false} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(167, 139, 250, 0.05)" />
                <RechartsTooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="Positive" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorPos)" />
                <Area type="monotone" dataKey="Neutral" stroke="var(--accent-cyan)" strokeWidth={2} fillOpacity={1} fill="url(#colorCyan)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Rating Distribution */}
        <motion.div variants={itemVariants} className="glass-card" style={{ padding: '2.5rem', height: '440px', display: 'flex', flexDirection: 'column', border: '1px solid rgba(167, 139, 250, 0.05)' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem', fontSize: '1.1rem', fontWeight: 800 }}>
            <Target size={18} color="var(--primary-light)" /> STAR DISTRIBUTION
          </h3>
          <div style={{ flex: 1, minHeight: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ratingDist} layout="vertical" margin={{ top: 0, right: 30, left: 10, bottom: 0 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" stroke="var(--text-muted)" fontSize={11} axisLine={false} tickLine={false} width={70} />
                <RechartsTooltip cursor={{fill: 'rgba(167, 139, 250, 0.03)'}} content={<CustomTooltip />} />
                <Bar dataKey="count" radius={[0, 12, 12, 0]} barSize={26} background={{ fill: 'rgba(255, 255, 255, 0.03)', radius: [0, 12, 12, 0] }}>
                  {ratingDist.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* AI Strategist Section */}
      <motion.div variants={itemVariants} className="grid-1" style={{ marginBottom: '4rem' }}>
        <div className="glass-card" style={{ padding: '3.5rem', background: 'linear-gradient(135deg, rgba(17, 17, 34, 0.8), rgba(11, 11, 26, 0.9))', border: '1px solid rgba(167, 139, 250, 0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '3rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
                <Brain size={24} color="var(--primary)" />
                <h3 style={{ fontSize: '1.5rem', fontWeight: 900, letterSpacing: '-1px', textTransform: 'uppercase' }}>Neural Strategist</h3>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', fontWeight: 500 }}>Global reputation health and strategic vectors</p>
            </div>
            {trends && (
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--primary-light)', fontWeight: 900, marginBottom: '0.5rem', opacity: 0.6, letterSpacing: '1px' }}>HEALTH INDEX</div>
                <div style={{ fontSize: '2.5rem', fontWeight: 950, color: 'var(--primary)' }}>
                  {trends.score}<span style={{ fontSize: '1rem', opacity: 0.3 }}>/100</span>
                </div>
              </div>
            )}
          </div>

          <div className="grid-3" style={{ gap: '3rem' }}>
            <div style={{ gridColumn: 'span 1' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 900, marginBottom: '1.25rem', letterSpacing: '1px' }}>EXECUTIVE ANALYSIS</div>
              <p style={{ fontSize: '1.1rem', lineHeight: 1.7, color: 'var(--text-sub)', fontWeight: 500 }}>
                {loading ? 'Decrypting...' : (trends?.summary || 'Initialize Intelligence key for analysis.')}
              </p>
            </div>

            <div style={{ gridColumn: 'span 1' }}>
              <div style={{ color: 'var(--primary-light)', fontSize: '0.7rem', fontWeight: 900, marginBottom: '1.25rem', letterSpacing: '1px' }}>STRENGTH NODES</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {(trends?.strengths || ['Service Quality', 'Brand Loyalty']).map((s, i) => (
                  <div key={i} style={{ background: 'rgba(167, 139, 250, 0.05)', padding: '1rem 1.25rem', borderRadius: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', border: '1px solid rgba(167, 139, 250, 0.1)' }}>
                    <CheckCircle size={16} color="var(--primary)" />
                    <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{s}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ gridColumn: 'span 1' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 900, marginBottom: '1.25rem', letterSpacing: '1px' }}>CHALLENGE VECTORS</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {(trends?.weaknesses || ['Response Lag', 'Peak Hours']).map((w, i) => (
                  <div key={i} style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '1rem 1.25rem', borderRadius: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <AlertCircle size={16} color="var(--text-muted)" />
                    <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-muted)' }}>{w}</span>
                  </div>
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

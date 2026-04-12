import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, CheckCircle, Clock, AlertCircle, RefreshCw, Globe, Server, Link, Activity } from 'lucide-react';

const PLATFORMS = [
  {
    id: 'google',
    name: 'Google Business',
    icon: '🔍',
    color: '#4285f4',
    bg: 'linear-gradient(135deg, #4285f4, #34a853)',
    status: 'connected',
    reviews: 8,
    lastSync: '2 mins ago',
    description: 'Google Maps & Business Profile reviews'
  },
  {
    id: 'tripadvisor',
    name: 'TripAdvisor',
    icon: '🦉',
    color: '#00aa6c',
    bg: 'linear-gradient(135deg, #00aa6c, #007a4d)',
    status: 'connected',
    reviews: 3,
    lastSync: '15 mins ago',
    description: 'Hotel & restaurant discovery platform'
  },
  {
    id: 'yelp',
    name: 'Yelp',
    icon: '⭐',
    color: '#d32323',
    bg: 'linear-gradient(135deg, #d32323, #a01a1a)',
    status: 'pending',
    reviews: 2,
    lastSync: 'Awaiting auth',
    description: 'Local business reviews & ratings'
  },
  {
    id: 'zomato',
    name: 'Zomato',
    icon: '🍕',
    color: '#e23744',
    bg: 'linear-gradient(135deg, #e23744, #b52030)',
    status: 'connected',
    reviews: 1,
    lastSync: '1 hour ago',
    description: 'Food delivery & restaurant reviews'
  },
  {
    id: 'booking',
    name: 'Booking.com',
    icon: '🏨',
    color: '#003580',
    bg: 'linear-gradient(135deg, #003580, #0069b4)',
    status: 'connected',
    reviews: 1,
    lastSync: '3 hours ago',
    description: 'Hotel & accommodation bookings'
  },
  {
    id: 'justdial',
    name: 'JustDial',
    icon: '📞',
    color: '#fd6c2c',
    bg: 'linear-gradient(135deg, #fd6c2c, #e85510)',
    status: 'pending',
    reviews: 0,
    lastSync: 'Not connected',
    description: 'Indian local business directory'
  },
  {
    id: 'practo',
    name: 'Practo',
    icon: '🏥',
    color: '#5cb85c',
    bg: 'linear-gradient(135deg, #5cb85c, #3d8b3d)',
    status: 'pending',
    reviews: 0,
    lastSync: 'Not connected',
    description: 'Healthcare booking & clinic reviews'
  },
  {
    id: 'facebook',
    name: 'Facebook',
    icon: '📘',
    color: '#1877f2',
    bg: 'linear-gradient(135deg, #1877f2, #0d65d9)',
    status: 'disconnected',
    reviews: 0,
    lastSync: 'Not connected',
    description: 'Facebook Business Page reviews'
  },
];

const StatusBadge = ({ status }) => {
  const map = {
    connected:    { cls: 'status-connected',    label: 'Connected',  icon: <CheckCircle size={12} /> },
    pending:      { cls: 'status-pending',       label: 'Pending',    icon: <Clock size={12} /> },
    disconnected: { cls: 'status-disconnected',  label: 'Disconnected', icon: <AlertCircle size={12} /> },
  };
  const { cls, label, icon } = map[status] || map.disconnected;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.72rem', fontWeight: 600 }}>
      <span className={`status-dot ${cls}`} />
      {label}
    </span>
  );
};

const IntegrationsView = () => {
  const [syncing, setSyncing] = useState(null);
  const [connecting, setConnecting] = useState(null);
  const [connectedPlatforms, setConnectedPlatforms] = useState(PLATFORMS.filter(p => p.status === 'connected').map(p => p.id));

  const handleSync = (id) => {
    setSyncing(id);
    setTimeout(() => setSyncing(null), 2000);
  };

  const handleConnect = (id) => {
    setConnecting(id);
    // Simulate OAuth flow
    setTimeout(() => {
      setConnecting(null);
      setConnectedPlatforms(prev => [...new Set([...prev, id])]);
    }, 2500);
  };

  const connected = connectedPlatforms.length;
  const totalReviews = PLATFORMS.reduce((a, b) => a + b.reviews, 0);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
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
      className="integrations-view"
    >
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '3.5rem' }}>
        <motion.div variants={itemVariants}>
          <h1 className="aura-header">Node Integrations</h1>
          <p className="aura-subheader">Connect global review clusters to the central intelligence engine.</p>
        </motion.div>
        <motion.div variants={itemVariants} className="glass-pill" style={{ height: '48px', padding: '0 1.5rem' }}>
          <Activity size={16} /> SYSTEM STATUS: OPTIMAL
        </motion.div>
      </div>

      {/* Summary Row */}
      <div className="grid-3" style={{ marginBottom: '3.5rem', gap: '2rem' }}>
        {[
          { label: 'Active Clusters', value: connected, color: 'var(--primary-light)', icon: <Link size={20} /> },
          { label: 'Intelligence Synced', value: totalReviews, color: 'var(--accent-cyan)', icon: <Server size={20} /> },
          { label: 'Available Nodes', value: PLATFORMS.length, color: 'var(--text-muted)', icon: <Globe size={20} /> },
        ].map((s, i) => (
          <motion.div 
            key={i} 
            variants={itemVariants}
            whileHover={{ y: -5, boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}
            className="stat-card" 
            style={{ background: 'rgba(17, 17, 34, 0.5)', border: '1px solid rgba(167, 139, 250, 0.05)', padding: '2.5rem' }}
          >
            <div style={{ color: s.color, marginBottom: '1.5rem', opacity: 0.8 }}>{s.icon}</div>
            <div className="stat-number" style={{ color: '#fff', fontSize: '3rem', fontWeight: 900, marginBottom: '0.5rem' }}>{s.value}</div>
            <div className="stat-label" style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '2px', opacity: 0.5 }}>{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Platform Cards */}
      <motion.div variants={itemVariants} className="integration-grid" style={{ gap: '2rem' }}>
        <AnimatePresence>
          {PLATFORMS.map((p, idx) => {
            const isConnected = connectedPlatforms.includes(p.id);
            const status = isConnected ? 'connected' : p.status;
            
            return (
              <motion.div 
                key={p.id} 
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                className="glass-card integration-card" 
                style={{ padding: '2.5rem 2rem', border: '1px solid rgba(167, 139, 250, 0.08)' }}
              >
                {/* Glow effect */}
                <div style={{
                  position: 'absolute', top: -30, right: -30, width: 100, height: 100,
                  borderRadius: '50%', background: p.color, opacity: 0.05, filter: 'blur(30px)', pointerEvents: 'none'
                }} />

                <div className="platform-logo" style={{ background: p.bg, width: '64px', height: '64px', borderRadius: '1.25rem', marginBottom: '1.5rem' }}>
                  <span style={{ fontSize: '1.75rem' }}>{p.icon}</span>
                </div>

                <h3 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.2rem', marginBottom: '0.5rem', color: '#fff' }}>{p.name}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: 1.6, minHeight: '3rem' }}>{p.description}</p>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                  <StatusBadge status={status} />
                  <span className="badge" style={{ background: 'rgba(255,255,255,0.03)', color: 'var(--text-dim)', fontSize: '0.7rem' }}>
                    {p.reviews > 0 ? `${p.reviews} DATA NODES` : 'EMPTY'}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', marginTop: 'auto' }}>
                  {status === 'connected' ? (
                    <>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="btn btn-outline"
                        style={{ flex: 1, fontSize: '0.75rem', height: '44px', borderRadius: '1rem' }}
                        onClick={() => handleSync(p.id)}
                        disabled={syncing === p.id}
                      >
                        {syncing === p.id
                          ? <><RefreshCw size={14} className="animate-spin" /> SYNCING...</>
                          : <><RefreshCw size={14} /> SYNC NODE</>
                        }
                      </motion.button>
                      <button className="btn btn-ghost" style={{ padding: '0 0.75rem', borderRadius: '1rem', background: 'rgba(255,255,255,0.03)' }}>
                        <Globe size={16} />
                      </button>
                    </>
                  ) : (
                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`btn ${status === 'pending' ? 'btn-outline' : 'btn-primary'}`} 
                      style={{ flex: 1, fontSize: '0.75rem', height: '44px', borderRadius: '1rem' }}
                      onClick={() => handleConnect(p.id)}
                      disabled={connecting === p.id}
                    >
                      {connecting === p.id ? (
                        <><RefreshCw size={14} className="animate-spin" /> CONNECTING...</>
                      ) : (
                        <><ExternalLink size={14} /> {status === 'pending' ? 'AUTHORIZE' : 'CONNECT CLUSTER'}</>
                      )}
                    </motion.button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>

      {/* API Notice */}
      <motion.div 
        variants={itemVariants}
        className="glass-card" 
        style={{ marginTop: '3.5rem', padding: '2.5rem', borderColor: 'rgba(167, 139, 250, 0.2)', background: 'rgba(167, 139, 250, 0.03)', borderRadius: '2rem' }}
      >
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
          <div style={{ width: '48px', height: '48px', background: 'rgba(167, 139, 250, 0.1)', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Globe size={24} color="var(--primary-light)" />
          </div>
          <div>
            <h4 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.1rem', marginBottom: '0.5rem', color: '#fff' }}>
              Strategic Platform Bridge
            </h4>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.8, fontWeight: 500 }}>
              To enable real-time intelligence sync, connect your business profiles via authorized high-level APIs.
              Requires OAuth 2.0 verification and a synchronized business node.
              Once the bridge is established, new reviews will automatically propagate to the **Review Intelligence** stream and trigger AI drafting.
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
  );
};

export default IntegrationsView;

import React, { useState } from 'react';
import { ExternalLink, CheckCircle, Clock, AlertCircle, RefreshCw, Globe } from 'lucide-react';

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

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Platform Integrations</h1>
        <p className="page-subtitle">Connect your review platforms to centralize and automate all responses</p>
      </div>

      {/* Summary Row */}
      <div className="grid-3" style={{ marginBottom: '1.5rem' }}>
        {[
          { label: 'Connected Platforms', value: connected, color: '#10b981' },
          { label: 'Reviews Synced', value: totalReviews, color: '#6366f1' },
          { label: 'Platforms Available', value: PLATFORMS.length, color: '#f59e0b' },
        ].map((s, i) => (
          <div key={i} className="stat-card">
            <div className="stat-card-glow" style={{ background: s.color }} />
            <div className="stat-number" style={{ color: s.color, fontSize: '2rem' }}>{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Platform Cards */}
      <div className="integration-grid">
        {PLATFORMS.map((p) => {
          const isConnected = connectedPlatforms.includes(p.id);
          const status = isConnected ? 'connected' : p.status;
          
          return (
            <div key={p.id} className="glass-card integration-card animate-fade-in" style={{ padding: '1.75rem 1.5rem' }}>
              {/* Glow effect */}
              <div style={{
                position: 'absolute', top: -40, right: -40, width: 120, height: 120,
                borderRadius: '50%', background: p.color, opacity: 0.07, filter: 'blur(30px)', pointerEvents: 'none'
              }} />

              <div className="platform-logo" style={{ background: p.bg }}>
                <span>{p.icon}</span>
              </div>

              <h3 style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '1rem', marginBottom: '0.3rem' }}>{p.name}</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1rem', lineHeight: 1.5 }}>{p.description}</p>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <StatusBadge status={status} />
                <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                  {p.reviews > 0 ? `${p.reviews} reviews` : '—'}
                </span>
              </div>

              <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginBottom: '1rem' }}>
                🕐 Last sync: {status === 'connected' ? p.lastSync : 'Not connected'}
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {status === 'connected' ? (
                  <>
                    <button
                      className="btn btn-outline"
                      style={{ flex: 1, fontSize: '0.78rem', padding: '0.5rem' }}
                      onClick={() => handleSync(p.id)}
                      disabled={syncing === p.id}
                    >
                      {syncing === p.id
                        ? <><RefreshCw size={13} className="animate-spin" /> Syncing...</>
                        : <><RefreshCw size={13} /> Sync Now</>
                      }
                    </button>
                    <button className="btn btn-ghost" style={{ padding: '0.5rem 0.75rem' }}>
                      <Globe size={14} />
                    </button>
                  </>
                ) : (
                  <button 
                    className={`btn ${status === 'pending' ? 'btn-outline' : 'btn-primary'}`} 
                    style={{ flex: 1, fontSize: '0.78rem', padding: '0.5rem' }}
                    onClick={() => handleConnect(p.id)}
                    disabled={connecting === p.id}
                  >
                    {connecting === p.id ? (
                      <><RefreshCw size={13} className="animate-spin" /> Connecting...</>
                    ) : (
                      <><ExternalLink size={13} /> {status === 'pending' ? 'Authorize' : 'Connect'}</>
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* API Notice */}
      <div className="glass-card" style={{ marginTop: '1.5rem', borderColor: 'rgba(99,102,241,0.2)', background: 'rgba(99,102,241,0.04)' }}>
        <div style={{ display: 'flex', gap: '0.875rem', alignItems: 'flex-start' }}>
          <Globe size={20} style={{ color: 'var(--primary-light)', flexShrink: 0, marginTop: 2 }} />
          <div>
            <h4 style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.375rem' }}>
              Google Business Profile API
            </h4>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.7 }}>
              To enable real Google Reviews sync, connect your Google Business Profile via the Google My Business API.
              Requires OAuth 2.0 authentication and a verified business listing.
              Once connected, new reviews will automatically appear in your inbox and trigger AI response drafts.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntegrationsView;

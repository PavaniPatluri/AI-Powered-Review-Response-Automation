import React, { useState, useEffect, useCallback } from 'react';
import { Loader, Wifi, WifiOff, X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import Sidebar from './components/Sidebar';
import InboxView from './components/InboxView';
import DashboardView from './components/DashboardView';
import TrainingView from './components/TrainingView';
import IntegrationsView from './components/IntegrationsView';
import SearchEngineView from './components/SearchEngineView';
import RealtimeView from './components/RealtimeView';
import SettingsView from './components/SettingsView';
import SplashScreen from './components/SplashScreen';
import NeuralBackground from './components/NeuralBackground';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchReviews, fetchPrompts, updatePrompts, fetchRules, EXPORT_REVIEWS_URL, WS_URL } from './api';
import { useRef } from 'react';

// ─── Toast System ─────────────────────────────────────────────────────────────
const Toast = ({ toasts, removeToast }) => (
  <div className="toast-container">
    {toasts.map(t => (
      <div key={t.id} className={`toast toast-${t.type}`}>
        {t.type === 'success' && <CheckCircle size={16} />}
        {t.type === 'error'   && <AlertCircle size={16} />}
        {t.type === 'info'    && <Info size={16} />}
        <span style={{ flex: 1 }}>{t.message}</span>
        <button
          onClick={() => removeToast(t.id)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: '0.1rem' }}
        >
          <X size={14} />
        </button>
      </div>
    ))}
  </div>
);

// ─── App ──────────────────────────────────────────────────────────────────────
const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [globalBusinessFilter, setGlobalBusinessFilter] = useState('All');
  const [reviews, setReviews] = useState([]);
  const [prompts, setPrompts] = useState([]);
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [showSplash, setShowSplash] = useState(true);
  const socketRef = useRef(null);

  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const handleRealtimeReview = useCallback((review) => {
    setReviews(prev => [review, ...prev]);
    addToast(`New Review: ${review.author} (${review.sentiment})`, 'info');
  }, [addToast]);

  useEffect(() => {
    const connectSync = () => {
      try {
        socketRef.current = new WebSocket(WS_URL);
        
        socketRef.current.onmessage = (event) => {
          try {
            const newReview = JSON.parse(event.data);
            handleRealtimeReview(newReview);
          } catch (err) {
            console.error('Failed to parse socket message:', err);
          }
        };

        socketRef.current.onclose = () => {
          console.warn('Neural Sync disconnected. Retrying in 5s...');
          setTimeout(connectSync, 5000);
        };

        socketRef.current.onerror = (err) => {
          console.error('Neural Sync Error:', err);
          socketRef.current.close();
        };
      } catch (e) {
        console.error('WebSocket initialization failed:', e);
      }
    };

    connectSync();
    return () => {
      if (socketRef.current) socketRef.current.close();
    };
  }, [handleRealtimeReview]);

  const handleFilterSelect = (type) => {
    setGlobalBusinessFilter(type);
    setActiveTab('inbox');
  };

  useEffect(() => {
    const load = async () => {
      try {
        const [rv, pr, rl] = await Promise.all([fetchReviews(), fetchPrompts(), fetchRules()]);
        setReviews(rv);
        setPrompts(pr);
        setRules(rl);
        setError(null);
        addToast(`Loaded ${rv.length} reviews`, 'success');
      } catch (e) {
        setError(e.message);
        addToast('Could not connect to backend. Using offline mode.', 'error');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [addToast]);

  const handleSavePrompts = async (newPrompts) => {
    try {
      await updatePrompts(newPrompts);
      setPrompts(newPrompts);
      addToast('Prompt templates saved!', 'success');
    } catch {
      addToast('Failed to save prompts', 'error');
    }
  };

  const handleExport = () => {
    window.location.href = EXPORT_REVIEWS_URL;
    addToast('Downloading CSV report...', 'info');
  };



  const pendingCount = reviews.filter(r => r.status === 'Pending').length;

  if (loading) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', height: '100vh', gap: '1.5rem'
      }}>
        <div style={{
          width: 64, height: 64, borderRadius: 18,
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 8px 32px rgba(99,102,241,0.4)',
          animation: 'bgPulse 2s ease-in-out infinite'
        }}>
          <Loader size={28} color="white" className="animate-spin" />
        </div>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '1.25rem', marginBottom: '0.375rem' }}>
            Review Catalyst
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Connecting to backend...</p>
        </div>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      {showSplash ? (
        <SplashScreen key="splash" onFinish={() => setShowSplash(false)} />
      ) : (
        <motion.div 
          key="app"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="app-layout"
        >
          {/* Animated 3D Neural Background */}
          <NeuralBackground score={reviews.length ? (reviews.reduce((a, b) => a + (b.rating || 0), 0) / reviews.length) * 20 : 80} />
          
          <Sidebar 
            activeTab={activeTab} 
            onTabChange={(tab) => { setActiveTab(tab); setGlobalBusinessFilter('All'); }} 
            onFilterSelect={handleFilterSelect}
            pendingCount={pendingCount} 
          />

          <main className="main-content">
            {/* Connection Error Banner */}
            {error && (
              <div style={{
                display: 'flex', gap: '0.75rem', alignItems: 'center',
                padding: '0.875rem 1.25rem', borderRadius: '0.875rem',
                background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
                marginBottom: '1.5rem', fontSize: '0.85rem'
              }}>
                <WifiOff size={16} style={{ color: '#f87171', flexShrink: 0 }} />
                <span style={{ color: 'var(--text-sub)', flex: 1 }}>
                  <strong style={{ color: '#f87171' }}>Intelligence Engine Offline:</strong> {
                    import.meta.env.PROD 
                    ? "Check your cloud environment variables and deployment status." 
                    : "Start the FastAPI server at localhost:8000."
                  }
                </span>
                <button className="btn btn-danger" style={{ fontSize: '0.75rem', padding: '0.4rem 0.875rem' }}
                  onClick={() => window.location.reload()}>
                  Retry
                </button>
              </div>
            )}

            {/* Views with Page Transitions */}
            <AnimatePresence mode="wait">
              <motion.div 
                key={activeTab}
                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 1.02 }}
                transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
              >
                {activeTab === 'dashboard'    && <DashboardView reviews={reviews} onExport={handleExport} />}
                {activeTab === 'inbox'        && <InboxView reviews={reviews} rules={rules} initialFilter={globalBusinessFilter} />}
                {activeTab === 'realtime'     && <RealtimeView reviews={reviews} />}
                {activeTab === 'search'       && <SearchEngineView reviews={reviews} />}
                {activeTab === 'training'     && <TrainingView prompts={prompts} onSave={handleSavePrompts} />}
                {activeTab === 'integrations' && <IntegrationsView />}
                {activeTab === 'settings'     && <SettingsView addToast={addToast} />}
              </motion.div>
            </AnimatePresence>
          </main>

          <Toast toasts={toasts} removeToast={removeToast} />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default App;

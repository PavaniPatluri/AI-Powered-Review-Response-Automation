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
import LoginView from './components/LoginView';

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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
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

  // ─── Authentication Persistence ───
  useEffect(() => {
    const token = localStorage.getItem('neural_nexus_token');
    if (token) {
      setIsAuthenticated(true);
    }
    setIsAuthLoading(false);
  }, []);

  const handleLogin = (token) => {
    const finalToken = token || 'session_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('neural_nexus_token', finalToken);
    setIsAuthenticated(true);
    addToast('Neural Handshake Established. Welcome, Agent.', 'success');
  };

  const handleLogout = () => {
    localStorage.removeItem('neural_nexus_token');
    setIsAuthenticated(false);
    setShowSplash(true); // Reset for next login
    addToast('Connection Terminated.', 'info');
  };

  const handleRealtimeReview = useCallback((review) => {
    setReviews(prev => [review, ...prev]);
    addToast(`New Review: ${review.author} (${review.sentiment})`, 'info');
  }, [addToast]);

  useEffect(() => {
    if (!isAuthenticated) return;

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
  }, [handleRealtimeReview, isAuthenticated]);

  const handleFilterSelect = (type) => {
    setGlobalBusinessFilter(type);
    setActiveTab('inbox');
  };

  useEffect(() => {
    if (!isAuthenticated) return;

    const load = async () => {
      try {
        // Diagnostic health check
        await fetch(`${BASE_URL}/health`).catch(() => console.error('Health check failed'));
        
        const [rv, pr, rl] = await Promise.all([
          fetchReviews().catch(e => { console.error('fetchReviews failed:', e); throw e; }),
          fetchPrompts().catch(e => { console.error('fetchPrompts failed:', e); throw e; }),
          fetchRules().catch(e => { console.error('fetchRules failed:', e); throw e; })
        ]);
        
        setReviews(rv);
        setPrompts(pr);
        setRules(rl);
        setError(null);
      } catch (e) {
        setError(e.message);
        console.error('Neural Core Connection Error:', e);
        addToast('Could not connect to backend. Using offline mode.', 'error');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [addToast, isAuthenticated]);

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

  if (isAuthLoading) return null; // Simple guard while checking localStorage

  return (
    <AnimatePresence mode="wait">
      {!isAuthenticated ? (
        <React.Fragment key="login-flow">
          <NeuralBackground score={80} />
          <LoginView onLogin={handleLogin} addToast={addToast} />
          <Toast toasts={toasts} removeToast={removeToast} />
        </React.Fragment>
      ) : showSplash ? (
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
            onLogout={handleLogout}
          />

          <main className="main-content">
            {/* Connection Error Banner */}

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

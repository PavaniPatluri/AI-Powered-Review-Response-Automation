import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Zap, ArrowRight, Lock, User, AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react';

const LoginView = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('idle'); // 'idle', 'loading', 'success', 'error'
  const [errorMsg, setErrorMsg] = useState('');

  const DEMO_EMAIL = 'demo@gmail.com';
  const DEMO_PASSWORD = 'demo1234';

  const handleSubmit = (e) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');

    // Simulated Neural Handshake
    setTimeout(() => {
      if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
        setStatus('success');
        setTimeout(() => {
          onLogin();
        }, 1500);
      } else {
        setStatus('error');
        setErrorMsg('INVALID IDENTITY OR ACCESS KEY');
        setTimeout(() => setStatus('idle'), 3000);
      }
    }, 2000);
  };

  return (
    <div className="login-container">
      <motion.div 
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        className="glass-login-card"
      >
        {/* Iridescent Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
            style={{ 
              width: 64, height: 64, borderRadius: 20, 
              background: status === 'success' 
                ? 'linear-gradient(135deg, #10b981, #059669)' 
                : status === 'error'
                ? 'linear-gradient(135deg, #ef4444, #b91c1c)'
                : 'linear-gradient(135deg, var(--primary), var(--accent-purple))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1.5rem',
              boxShadow: status === 'success' 
                ? '0 0 40px rgba(16,185,129,0.4)' 
                : status === 'error'
                ? '0 0 40px rgba(239,68,68,0.4)'
                : '0 0 30px var(--primary-glow)',
              transition: 'all 0.5s ease'
            }}
          >
            <AnimatePresence mode="wait">
              {status === 'loading' ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0, rotate: -180 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  exit={{ opacity: 0, rotate: 180 }}
                >
                  <Loader2 size={32} color="white" className="animate-spin" />
                </motion.div>
              ) : status === 'success' ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <CheckCircle2 size={32} color="white" />
                </motion.div>
              ) : status === 'error' ? (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <AlertTriangle size={32} color="white" />
                </motion.div>
              ) : (
                <motion.div
                  key="idle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <ShieldCheck size={32} color="white" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
          
          <h2 style={{ fontSize: '2rem', fontWeight: 900, letterSpacing: '-1.5px', marginBottom: '0.5rem' }}>
            Neural Identity
          </h2>
          <p style={{ 
            color: status === 'error' ? '#f87171' : 'var(--text-muted)', 
            fontSize: '0.9rem', 
            fontWeight: 500,
            transition: 'color 0.3s ease'
          }}>
            {errorMsg || (status === 'loading' ? 'ESTABLISHING HANDSHAKE...' : 'Secure Access to the Review Catalyst Nexus')}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="login-input-group">
            <User size={18} style={{ position: 'absolute', top: '1.25rem', left: '1.5rem', color: 'var(--text-muted)' }} />
            <input 
              type="email" 
              className="login-input-aura" 
              placeholder="IDENTITY_EMAIL" 
              style={{ paddingLeft: '3.5rem' }}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={status === 'loading' || status === 'success'}
              required
            />
          </div>

          <div className="login-input-group">
            <Lock size={18} style={{ position: 'absolute', top: '1.25rem', left: '1.5rem', color: 'var(--text-muted)' }} />
            <input 
              type="password" 
              className="login-input-aura" 
              placeholder="ACCESS_KEY" 
              style={{ paddingLeft: '3.5rem' }}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={status === 'loading' || status === 'success'}
              required
            />
          </div>

          <button 
            type="submit" 
            className={`btn-neural shadow-primary ${status === 'success' ? 'btn-success' : ''}`}
            disabled={status === 'loading' || status === 'success'}
            style={{ marginTop: '1rem' }}
          >
            <AnimatePresence mode="wait">
              {status === 'loading' ? (
                <motion.span 
                  key="l" 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}
                >
                  VERIFYING...
                </motion.span>
              ) : status === 'success' ? (
                <motion.span 
                  key="s" 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}
                >
                  ACCESS GRANTED
                </motion.span>
              ) : (
                <motion.span 
                  key="i" 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}
                >
                  INITIATE ACCESS <ArrowRight size={18} />
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </form>

        <div className="demo-hint" style={{ 
          marginTop: '2rem', 
          padding: '1rem', 
          borderRadius: '12px', 
          background: 'rgba(255,255,255,0.03)', 
          border: '1px solid rgba(255,255,255,0.05)',
          fontSize: '0.75rem',
          color: 'var(--text-muted)',
          textAlign: 'center'
        }}>
          <strong>DEMO_ACCESS:</strong> demo@gmail.com / demo1234
        </div>

        {/* Decorative Grid Pulse */}
        <div style={{ 
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '1px', 
          background: 'linear-gradient(90deg, transparent, var(--primary), transparent)',
          opacity: 0.2
        }} />
      </motion.div>
    </div>
  );
};

export default LoginView;

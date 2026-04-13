import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Zap, ArrowRight, Lock, User, AlertTriangle, CheckCircle2, Loader2, Fingerprint, Keyboard, Cpu } from 'lucide-react';
import { getAuthRegistrationOptions, verifyAuthRegistration, getAuthLoginOptions, verifyAuthLogin } from '../api';

const LoginView = ({ onLogin, addToast }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState('biometric'); // 'biometric' or 'manual'
  const [status, setStatus] = useState('idle'); // 'idle', 'loading', 'success', 'error'
  const [errorMsg, setErrorMsg] = useState('');
  const [isSupported, setIsSupported] = useState(true);

  const DEMO_EMAIL = 'demo@gmail.com';
  const DEMO_PASSWORD = 'demo1234';

  useEffect(() => {
    if (!window.PublicKeyCredential) {
      setIsSupported(false);
      setMode('manual');
    }
  }, []);

  const handleManualSubmit = (e) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');

    // Simulated Handshake for legacy bypass
    setTimeout(() => {
      if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
        setStatus('success');
        setTimeout(() => onLogin(), 1000);
      } else {
        setStatus('error');
        setErrorMsg('INVALID IDENTITY KEY');
        setTimeout(() => setStatus('idle'), 2000);
      }
    }, 1500);
  };

  const handleBiometricAuth = async (e) => {
    if (e) e.preventDefault();
    if (!email) {
      setErrorMsg('IDENTITY_EMAIL REQUIRED');
      return;
    }

    setStatus('loading');
    setErrorMsg('');

    try {
      // 1. Try Login first
      try {
        const { options, session_id } = await getAuthLoginOptions(email);
        const credential = await navigator.credentials.get({ publicKey: options });
        const result = await verifyAuthLogin(email, credential, session_id);
        
        if (result.success) {
          setStatus('success');
          setTimeout(() => onLogin(result.token), 1000);
          return;
        }
      } catch (loginErr) {
        console.warn('Login handshake failed, attempting registration:', loginErr);
        
        // 2. If login fails (user not registered), try Registration
        const { options, session_id } = await getAuthRegistrationOptions(email);
        const credential = await navigator.credentials.create({ publicKey: options });
        const result = await verifyAuthRegistration(email, credential, session_id);
        
        if (result.success) {
          setStatus('success');
          setTimeout(() => setStatus('idle'), 1000); // Trigger a re-login or auto-login
          addToast('Neural Identity Registered. Handshake required.', 'success');
        }
      }
    } catch (err) {
      console.error('Auth Error:', err);
      setStatus('error');
      setErrorMsg(err.message.toUpperCase() || 'HANDSHAKE INTERRUPTED');
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  return (
    <div className="login-container">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="glass-login-card"
        style={{ width: '420px', position: 'relative', overflow: 'hidden' }}
      >
        {/* Animated Background Pulse */}
        <div className="neural-pulse" />

        <div style={{ textAlign: 'center', marginBottom: '2.5rem', position: 'relative' }}>
          <motion.div 
            animate={{ 
              boxShadow: status === 'loading' ? '0 0 50px var(--primary)' : '0 0 20px rgba(167, 139, 250, 0.2)',
              scale: status === 'loading' ? 1.05 : 1
            }}
            style={{ 
              width: 72, height: 72, borderRadius: 24, 
              background: 'rgba(167, 139, 250, 0.1)',
              border: '1px solid rgba(167, 139, 250, 0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1.5rem'
            }}
          >
            {status === 'loading' ? <Cpu className="animate-spin" color="var(--primary)" size={32} /> : 
             status === 'success' ? <CheckCircle2 color="#10b981" size={32} /> :
             mode === 'biometric' ? <Fingerprint color="var(--primary-light)" size={32} /> : <Keyboard color="var(--primary-light)" size={32} />}
          </motion.div>
          
          <h2 style={{ fontSize: '1.85rem', fontWeight: 900, letterSpacing: '-1px', marginBottom: '0.5rem' }}>
            {mode === 'biometric' ? 'Neural Identity' : 'Manual Override'}
          </h2>
          <p style={{ color: status === 'error' ? '#f87171' : 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 800, letterSpacing: '2px' }}>
            {errorMsg || (status === 'loading' ? 'ESTABLISHING HANDSHAKE...' : 'SECURE ACCESS PROTOCOL')}
          </p>
        </div>

        <form onSubmit={mode === 'biometric' ? handleBiometricAuth : handleManualSubmit}>
          <div className="login-input-group">
            <User size={16} style={{ position: 'absolute', top: '1.2rem', left: '1.25rem', color: 'var(--primary-light)', opacity: 0.6 }} />
            <input 
              type="email" 
              className="login-input-aura" 
              placeholder="IDENTITY_EMAIL" 
              style={{ paddingLeft: '3rem' }}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <AnimatePresence mode="wait">
            {mode === 'manual' && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="login-input-group"
              >
                <Lock size={16} style={{ position: 'absolute', top: '1.2rem', left: '1.25rem', color: 'var(--primary-light)', opacity: 0.6 }} />
                <input 
                  type="password" 
                  className="login-input-aura" 
                  placeholder="ACCESS_KEY" 
                  style={{ paddingLeft: '3rem' }}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </motion.div>
            )}
          </AnimatePresence>

          <button 
            type="submit" 
            className="btn-neural"
            disabled={status === 'loading'}
            style={{ width: '100%', marginTop: '1rem', height: '54px' }}
          >
            {status === 'loading' ? 'VERIFYING...' : mode === 'biometric' ? 'START HANDSHAKE' : 'INITIATE OVERRIDE'}
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '2rem' }}>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.05)' }} />
          <span style={{ fontSize: '0.6rem', color: 'var(--text-dim)', fontWeight: 900 }}>SWITCH PROTOCOL</span>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.05)' }} />
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
          <button 
            onClick={() => setMode('biometric')} 
            className={`btn-icon-tiny ${mode === 'biometric' ? 'active' : ''}`}
            style={{ flex: 1, height: '44px', display: 'flex', gap: '0.5rem', alignItems: 'center', justifyContent: 'center' }}
            disabled={!isSupported}
          >
            <Fingerprint size={14} /> <span style={{ fontSize: '0.65rem', fontWeight: 800 }}>BIOMETRIC</span>
          </button>
          <button 
            onClick={() => setMode('manual')} 
            className={`btn-icon-tiny ${mode === 'manual' ? 'active' : ''}`}
            style={{ flex: 1, height: '44px', display: 'flex', gap: '0.5rem', alignItems: 'center', justifyContent: 'center' }}
          >
            <Keyboard size={14} /> <span style={{ fontSize: '0.65rem', fontWeight: 800 }}>MANUAL</span>
          </button>
        </div>

        {mode === 'manual' && (
          <div className="demo-hint" style={{ marginTop: '1.5rem', opacity: 0.6 }}>
            <strong>DEMO:</strong> {DEMO_EMAIL} / {DEMO_PASSWORD}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default LoginView;

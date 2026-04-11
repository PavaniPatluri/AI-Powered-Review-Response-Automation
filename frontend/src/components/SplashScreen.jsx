import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield } from 'lucide-react';
import NeuralBackground from './NeuralBackground';

const SplashScreen = ({ onFinish }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onFinish();
    }, 4500); // slightly longer for cinematic feel
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div className="splash-container" style={{
      position: 'fixed',
      inset: 0,
      background: 'var(--bg-dark)', // solid dark base
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      overflow: 'hidden'
    }}>
      {/* 3D Cinematic Background */}
      <div style={{ position: 'absolute', inset: 0, opacity: 0.8 }}>
        <NeuralBackground />
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at center, transparent 30%, var(--bg-dark) 100%)' }} />
      </div>

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 1.1, opacity: 0, filter: 'blur(10px)' }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        style={{ position: 'relative', zIndex: 10, textAlign: 'center' }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          style={{
            position: 'absolute',
            inset: -60,
            border: '2px dotted rgba(99, 102, 241, 0.4)',
            borderRadius: '50%',
            opacity: 0.5
          }}
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          style={{
            position: 'absolute',
            inset: -40,
            border: '1px solid rgba(139, 92, 246, 0.3)',
            borderRadius: '50%',
            opacity: 0.8
          }}
        />
        
        <div className="logo-3d-icon" style={{ 
          width: '140px', 
          height: '140px', 
          margin: '0 auto',
          boxShadow: '0 0 80px var(--primary-glow), inset 0 0 20px rgba(255,255,255,0.5)',
          background: 'linear-gradient(135deg, var(--primary-dark), var(--accent-cyan))',
          transform: 'perspective(1000px) rotateX(15deg) rotateY(15deg)'
        }}>
           <motion.div
             animate={{ scale: [1, 1.1, 1] }}
             transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
             style={{ 
               width: '50px', height: '50px', background: 'white', borderRadius: '50%',
               boxShadow: '0 0 40px white'
             }}
           />
        </div>

        <motion.h1 style={{ 
          marginTop: '2.5rem',
          fontSize: '3rem', 
          fontWeight: 900, 
          letterSpacing: '-2px',
          background: 'linear-gradient(to bottom, #fff 20%, var(--primary-light))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          filter: 'drop-shadow(0 0 20px rgba(99,102,241,0.5))'
        }}>
          REVIEW CATALYST
        </motion.h1>
        <motion.p style={{ 
          color: 'var(--text-main)', 
          fontSize: '0.85rem', 
          letterSpacing: '6px',
          textTransform: 'uppercase',
          marginTop: '0.75rem',
          opacity: 0.7
        }}>
          Initializing Syntactic Core
        </motion.p>
      </motion.div>

      {/* Cinematic Loading Line */}
      <div style={{
        position: 'absolute',
        bottom: '30%',
        width: '300px',
        height: '1px',
        background: 'rgba(255,255,255,0.1)',
        zIndex: 10
      }}>
        <motion.div
          initial={{ width: '0%', opacity: 0 }}
          animate={{ width: '100%', opacity: 1 }}
          transition={{ duration: 3.5, ease: "easeInOut" }}
          style={{ height: '100%', background: 'var(--primary)', boxShadow: '0 0 20px var(--primary)' }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 3 }}
        style={{
          position: 'absolute',
          bottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          color: 'rgba(255,255,255,0.4)',
          fontSize: '0.7rem',
          zIndex: 10
        }}
      >
        <Shield size={12} /> Secure Interface v4.0.0
      </motion.div>
    </div>
  );
};

export default SplashScreen;

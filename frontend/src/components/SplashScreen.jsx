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
      background: '#0b0b1a', // Absolute dark base
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      overflow: 'hidden'
    }}>
      {/* 3D Cinematic Background */}
      <div style={{ position: 'absolute', inset: 0, opacity: 0.6 }}>
        <NeuralBackground />
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at center, transparent 20%, #0b0b1a 100%)' }} />
      </div>

      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 1.05, opacity: 0, filter: 'blur(15px)' }}
        transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
        style={{ position: 'relative', zIndex: 10, textAlign: 'center' }}
      >
        <motion.div
          animate={{ rotate: 360, scale: [1, 1.05, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          style={{
            position: 'absolute',
            inset: -80,
            border: '1.5px solid rgba(167, 139, 250, 0.15)',
            borderRadius: '50%',
          }}
        />
        <motion.div
          animate={{ rotate: -360, scale: [1, 1.1, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          style={{
            position: 'absolute',
            inset: -50,
            border: '1px solid rgba(167, 139, 250, 0.08)',
            borderRadius: '50%',
          }}
        />
        
        <div style={{ 
          width: '160px', 
          height: '160px', 
          margin: '0 auto',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
           {/* The Core Pearl */}
           <motion.div
             animate={{ 
               scale: [1, 1.05, 1],
               boxShadow: [
                 '0 0 40px rgba(167, 139, 250, 0.2)',
                 '0 0 80px rgba(167, 139, 250, 0.4)',
                 '0 0 40px rgba(167, 139, 250, 0.2)'
               ]
             }}
             transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
             style={{ 
               width: '80px', 
               height: '80px', 
               background: 'linear-gradient(135deg, #fff, #a78bfa)', 
               borderRadius: '50%',
               position: 'relative',
               zIndex: 2,
               filter: 'blur(0.5px)'
             }}
           >
             <div style={{ position: 'absolute', top: '15%', left: '15%', width: '25%', height: '25%', background: '#fff', borderRadius: '50%', filter: 'blur(4px)', opacity: 0.9 }} />
           </motion.div>
           {/* Reflection Ring */}
           <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '4px solid rgba(167, 139, 250, 0.1)', filter: 'blur(2px)' }} />
        </div>

        <motion.h1 style={{ 
          marginTop: '3.5rem',
          fontSize: '4rem', 
          fontWeight: 950, 
          letterSpacing: '-2.5px',
          fontFamily: 'Outfit',
          background: 'linear-gradient(to bottom, #fff 40%, var(--primary-light))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          filter: 'drop-shadow(0 0 30px rgba(167, 139, 250, 0.3))'
        }}>
          REVIEW CATALYST
        </motion.h1>
        <motion.p style={{ 
          color: 'var(--primary-light)', 
          fontSize: '0.9rem', 
          letterSpacing: '8px',
          textTransform: 'uppercase',
          fontWeight: 800,
          marginTop: '1rem',
          opacity: 0.5
        }}>
          SYNCHRONIZING NEURAL CORE
        </motion.p>
      </motion.div>

      {/* Cinematic Loading Line */}
      <div style={{
        position: 'absolute',
        bottom: '25%',
        width: '400px',
        height: '1.5px',
        background: 'rgba(167, 139, 250, 0.05)',
        zIndex: 10
      }}>
        <motion.div
          initial={{ width: '0%', opacity: 0 }}
          animate={{ width: '100%', opacity: 1 }}
          transition={{ duration: 4, ease: [0.16, 1, 0.3, 1] }}
          style={{ height: '100%', background: 'var(--primary)', boxShadow: '0 0 30px var(--primary)' }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 3.5 }}
        style={{
          position: 'absolute',
          bottom: '3rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          color: 'rgba(167, 139, 250, 0.3)',
          fontSize: '0.75rem',
          fontWeight: 700,
          letterSpacing: '1px',
          zIndex: 10
        }}
      >
        <Shield size={14} /> TWILIGHT AURA v4.2.0 // STABLE
      </motion.div>
    </div>
  );
};

export default SplashScreen;

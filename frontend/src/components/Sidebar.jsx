import React from 'react';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Inbox, Zap, Brain, Plug, Search,
  Radio, ChevronRight, Star, Settings, Shield, Activity
} from 'lucide-react';

const NAV = [
  { section: 'Intelligence' },
  { id: 'dashboard', label: 'Command Center', icon: Activity },
  { id: 'inbox',     label: 'Review Inbox',   icon: Inbox,   badge: null },
  { id: 'realtime',  label: 'Neural Stream',  icon: Radio,   live: true },
  { section: 'Neural Tools' },
  { id: 'search',    label: 'Semantic Search', icon: Search },
  { id: 'training',  label: 'Prompt Engine',   icon: Brain },
  { section: 'Core System' },
  { id: 'integrations', label: 'Nodes & Sync',  icon: Plug },
  { id: 'settings',     label: 'Configurations', icon: Settings },
];

const BUSINESS_ICONS = {
  Restaurant: '🍽️', Hotel: '🏨', Clinic: '🏥', Salon: '💇', Theater: '🎭'
};

const Sidebar = ({ activeTab, onTabChange, onFilterSelect, pendingCount }) => (
  <aside className="sidebar" style={{ background: 'rgba(11, 11, 26, 0.75)', backdropFilter: 'blur(40px)' }}>
    <div className="sidebar-logo" style={{ borderBottom: '1px solid rgba(167, 139, 250, 0.1)', paddingBottom: '2.5rem' }}>
      <motion.div 
        whileHover={{ rotateY: 360, scale: 1.1 }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
        className="logo-3d-icon" 
        style={{ 
          background: 'linear-gradient(135deg, var(--primary), #7c3aed)',
          boxShadow: '0 0 30px rgba(167, 139, 250, 0.3)',
          borderRadius: '16px'
        }}
      >
        <Zap size={20} fill="white" strokeWidth={0} />
      </motion.div>
      <div>
        <div className="logo-title" style={{ fontSize: '1.35rem', letterSpacing: '-1.5px', fontWeight: 900 }}>CATALYST AI</div>
        <div className="logo-subtitle" style={{ fontSize: '0.65rem', color: 'var(--primary-light)', opacity: 0.8, letterSpacing: '3px', fontWeight: 700 }}>NEURAL CONTROL</div>
      </div>
    </div>

    <nav className="nav-menu" style={{ gap: '0.75rem' }}>
      {NAV.map((item, i) => {
        if (item.section) {
          return (
            <motion.div 
              key={i} 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 + i * 0.05 }}
              className="nav-section-label" 
              style={{ marginTop: '2rem', color: 'var(--text-muted)', fontSize: '0.7rem' }}
            >
              {item.section}
            </motion.div>
          );
        }
        const Icon = item.icon;
        const isActive = activeTab === item.id;

        return (
          <motion.button
            key={item.id}
            whileHover={{ x: 8, background: 'rgba(167, 139, 250, 0.05)' }}
            whileTap={{ scale: 0.97 }}
            className={`nav-item ${isActive ? 'active' : ''}`}
            onClick={() => onTabChange(item.id)}
            style={{
              position: 'relative',
              overflow: 'hidden',
              background: isActive ? 'rgba(167, 139, 250, 0.08)' : 'transparent',
              borderColor: isActive ? 'rgba(167, 139, 250, 0.15)' : 'transparent',
              borderRadius: '1.25rem',
              height: '48px'
            }}
          >
            {isActive && (
              <motion.div 
                layoutId="nav-glow"
                style={{
                  position: 'absolute',
                  left: 0,
                  top: '25%',
                  bottom: '25%',
                  width: '4px',
                  background: 'var(--primary)',
                  boxShadow: '0 0 20px var(--primary-glow)',
                  borderRadius: '0 4px 4px 0'
                }}
              />
            )}
            <Icon size={18} style={{ color: isActive ? 'var(--primary-light)' : 'var(--text-muted)' }} />
            <span style={{ fontWeight: isActive ? 800 : 600, color: isActive ? 'var(--text-main)' : 'var(--text-sub)' }}>{item.label}</span>
            {item.id === 'inbox' && pendingCount > 0 && (
              <span className="nav-item-badge" style={{ background: 'var(--primary)', boxShadow: '0 0 10px var(--primary-glow)' }}>{pendingCount}</span>
            )}
            {item.live && <span className="nav-live-dot" style={{ background: 'var(--accent-cyan)', boxShadow: '0 0 10px var(--accent-cyan)' }} />}
          </motion.button>
        );
      })}
    </nav>

    <div className="sidebar-footer">
      <motion.div 
        whileHover={{ scale: 1.02 }}
        style={{ 
          padding: '1.25rem', 
          borderRadius: '1.75rem', 
          background: 'rgba(167, 139, 250, 0.03)', 
          border: '1px solid rgba(167, 139, 250, 0.08)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{ position: 'absolute', top: 0, right: 0, padding: '6px' }}>
          <Shield size={12} color="var(--primary-light)" style={{ opacity: 0.4 }} />
        </div>
        <div style={{ fontSize: '0.65rem', color: 'var(--primary-light)', marginBottom: '1rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '2px', opacity: 0.6 }}>
          QUICK NODES
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
          {Object.entries(BUSINESS_ICONS).map(([type, icon]) => (
            <motion.button 
              key={type} 
              title={type} 
              whileHover={{ y: -4, scale: 1.15, background: 'rgba(167, 139, 250, 0.1)' }}
              whileTap={{ scale: 0.9 }}
              className="btn-icon-tiny"
              style={{ fontSize: '1.25rem', width: '42px', height: '42px', background: 'rgba(0,0,0,0.3)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}
              onClick={() => onFilterSelect(type)}
            >
              {icon}
            </motion.button>
          ))}
        </div>
      </motion.div>
    </div>
  </aside>
);

export default Sidebar;

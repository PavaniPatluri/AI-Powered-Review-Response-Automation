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
  <aside className="sidebar" style={{ background: 'rgba(2, 6, 23, 0.8)' }}>
    <div className="sidebar-logo" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '2rem' }}>
      <motion.div 
        whileHover={{ rotateY: 360 }}
        transition={{ duration: 1 }}
        className="logo-3d-icon" 
        style={{ 
          background: 'linear-gradient(135deg, var(--primary), var(--accent-purple))',
          boxShadow: '0 0 20px var(--primary-glow)'
        }}
      >
        <Zap size={20} fill="white" strokeWidth={0} />
      </motion.div>
      <div>
        <div className="logo-title" style={{ fontSize: '1.25rem', letterSpacing: '-1px' }}>CATALYST AI</div>
        <div className="logo-subtitle" style={{ fontSize: '0.6rem', opacity: 0.6, letterSpacing: '2px' }}>CATALYST CONTROL</div>
      </div>
    </div>

    <nav className="nav-menu" style={{ gap: '0.5rem' }}>
      {NAV.map((item, i) => {
        if (item.section) {
          return (
            <motion.div 
              key={i} 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 + i * 0.05 }}
              className="nav-section-label" 
              style={{ marginTop: '1.5rem', opacity: 0.4 }}
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
            whileHover={{ x: 5, background: 'rgba(255,255,255,0.03)' }}
            whileTap={{ scale: 0.98 }}
            className={`nav-item ${isActive ? 'active' : ''}`}
            onClick={() => onTabChange(item.id)}
            style={{
              position: 'relative',
              overflow: 'hidden',
              background: isActive ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
              borderColor: isActive ? 'rgba(99, 102, 241, 0.2)' : 'transparent'
            }}
          >
            {isActive && (
              <motion.div 
                layoutId="nav-glow"
                style={{
                  position: 'absolute',
                  left: 0,
                  top: '20%',
                  bottom: '20%',
                  width: '3px',
                  background: 'var(--primary)',
                  boxShadow: '0 0 15px var(--primary-glow)',
                  borderRadius: '0 4px 4px 0'
                }}
              />
            )}
            <Icon size={18} style={{ opacity: isActive ? 1 : 0.6 }} />
            <span style={{ fontWeight: isActive ? 700 : 500 }}>{item.label}</span>
            {item.id === 'inbox' && pendingCount > 0 && (
              <span className="nav-item-badge" style={{ background: 'var(--accent-red)' }}>{pendingCount}</span>
            )}
            {item.live && <span className="nav-live-dot" />}
          </motion.button>
        );
      })}
    </nav>

    <div className="sidebar-footer">
      <motion.div 
        whileHover={{ scale: 1.02 }}
        style={{ 
          padding: '1rem', 
          borderRadius: '1.25rem', 
          background: 'rgba(99,102,241,0.05)', 
          border: '1px solid rgba(255,255,255,0.05)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{ position: 'absolute', top: 0, right: 0, padding: '4px' }}>
          <Shield size={10} color="var(--primary-light)" style={{ opacity: 0.5 }} />
        </div>
        <div style={{ fontSize: '0.6rem', color: 'var(--text-dim)', marginBottom: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>
          QUICK NODES
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
          {Object.entries(BUSINESS_ICONS).map(([type, icon]) => (
            <motion.button 
              key={type} 
              title={type} 
              whileHover={{ y: -3, scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="btn-icon-tiny"
              style={{ fontSize: '1.2rem', width: '36px', height: '36px', background: 'rgba(0,0,0,0.2)' }}
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

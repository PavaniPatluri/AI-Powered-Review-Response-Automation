import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Shield, Save, CheckCircle, Plus, Trash2, Zap, Settings, Globe, Tag, MessageSquare, AlertTriangle, X, Key, Brain } from 'lucide-react';
import { fetchProfiles, updateProfiles, fetchRules, updateRules, fetchSystemConfig, updateSystemConfig } from '../api';

const TONES = ['Professional', 'Friendly', 'Empathetic', 'Apologetic', 'Celebratory'];
const BUSINESS_TYPES = ['Restaurant', 'Hotel', 'Clinic', 'Salon', 'Theater'];
const SENTIMENTS = ['Positive', 'Negative', 'Neutral'];
const CATEGORIES = ['Service', 'Food', 'Wait Time', 'Hygiene', 'Price', 'Atmosphere', 'Quality', 'Booking'];

const DEFAULT_RULES = [
  { id: '1', name: '5-Star Excellence', enabled: true, rating_min: 5, tone: 'Celebratory', sentiment_match: ['Positive'] },
  { id: '2', name: 'Negative Recovery', enabled: true, rating_min: 1, tone: 'Apologetic', sentiment_match: ['Negative'] }
];

const DEFAULT_PROFILES = [
  { id: 'default', name: 'The Royal Spice', type: 'Restaurant', address: '123 Gourmet St, Foodville', specialties: ['Butter Chicken', 'Peshawari Naan'], tone: 'Professional' }
];

const SettingsView = ({ addToast }) => {
  const [activeTab, setActiveTab] = useState('profiles');
  const [profiles, setProfiles] = useState([]);
  const [rules, setRules] = useState([]);
  const [systemConfig, setSystemConfig] = useState({ gemini_api_key: '' });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [ps, rs, sc] = await Promise.all([fetchProfiles(), fetchRules(), fetchSystemConfig().catch(() => ({ gemini_api_key: '' }))]);
        setProfiles(ps && ps.length > 0 ? ps : DEFAULT_PROFILES);
        setRules(rs && rs.length > 0 ? rs : DEFAULT_RULES);
        if (sc) setSystemConfig(sc);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleSaveProfiles = async () => {
    setSaving(true);
    try {
      await updateProfiles(profiles);
      addToast('Business locations updated!', 'success');
    } catch {
      addToast('Failed to update locations', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveRules = async () => {
    setSaving(true);
    try {
      await updateRules(rules);
      addToast('Advanced automation rules saved!', 'success');
    } catch {
      addToast('Failed to save rules', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveConfig = async () => {
    setSaving(true);
    try {
      await updateSystemConfig(systemConfig);
      addToast('API configuration saved successfully!', 'success');
    } catch {
      addToast('Failed to save API configuration', 'error');
    } finally {
      setSaving(false);
    }
  };

  const addProfile = () => {
    const newProfile = {
      id: 'loc_' + Math.random().toString(36).substr(2, 6),
      name: 'New Location',
      type: 'Restaurant',
      address: '',
      specialties: [],
      tone: 'Professional'
    };
    setProfiles([...profiles, newProfile]);
  };

  const removeProfile = (id) => {
    if (profiles.length <= 1) {
      addToast('You must have at least one location', 'error');
      return;
    }
    setProfiles(profiles.filter(p => p.id !== id));
  };

  const updateProfile = (id, field, value) => {
    setProfiles(profiles.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const addRule = () => {
    const newRule = {
      id: Date.now().toString(),
      name: 'New Custom Rule',
      rating_min: 1,
      tone: 'Friendly',
      enabled: true,
      sentiment_match: [],
      keyword_match: [],
      category_match: []
    };
    setRules([...rules, newRule]);
  };

  const removeRule = (id) => setRules(rules.filter(r => r.id !== id));

  const updateRule = (id, field, value) => {
    setRules(rules.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const saveAction = () => {
    if (activeTab === 'profiles') handleSaveProfiles();
    else if (activeTab === 'rules') handleSaveRules();
    else handleSaveConfig();
  };

  if (loading) return <div style={{ color: 'var(--text-muted)', padding: '2rem' }}>Loading advanced settings...</div>;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="settings-view"
    >
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '3.5rem' }}>
        <div>
          <h1 className="aura-header">Neural Configuration</h1>
          <p className="aura-subheader">Multi-location profiles, intelligent automation rules, and API infrastructure.</p>
        </div>
        <motion.button 
          whileHover={{ scale: 1.05, boxShadow: '0 0 20px var(--primary-glow)' }}
          whileTap={{ scale: 0.95 }}
          className="btn btn-primary" 
          onClick={saveAction}
          disabled={saving}
          style={{ height: '56px', borderRadius: '1.5rem', padding: '0 2.5rem', fontWeight: 800, letterSpacing: '1px' }}
        >
          {saving ? <RefreshCw className="animate-spin" size={20} /> : <Save size={20} />}
          {saving ? 'WRITING CHANGES...' : 'SAVE CONFIGURATION'}
        </motion.button>
      </div>

      <div className="toolbar" style={{ background: 'rgba(17, 17, 34, 0.4)', borderRadius: '1.5rem', padding: '0.6rem', border: '1px solid rgba(167, 139, 250, 0.1)', marginBottom: '3.5rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
          {['profiles', 'rules', 'api'].map((tab) => (
            <motion.button 
              key={tab}
              whileHover={{ background: activeTab === tab ? '' : 'rgba(167, 139, 250, 0.05)' }}
              className={`tone-pill ${activeTab === tab ? 'active' : ''}`} 
              style={{ flex: 1, height: '48px', borderRadius: '1.1rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 800 }} 
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'profiles' && <><Building2 size={16} /> Locations ({profiles.length})</>}
              {tab === 'rules' && <><Zap size={16} /> Automation</>}
              {tab === 'api' && <><Key size={16} /> System Core</>}
            </motion.button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'profiles' ? (
            <div className="profiles-section">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 900, letterSpacing: '-0.5px', textTransform: 'uppercase' }}>Business Clusters</h3>
                <button className="btn btn-outline" style={{ borderRadius: '1.25rem', height: '44px', padding: '0 1.5rem' }} onClick={addProfile}>
                  <Plus size={16} /> ADD LOCATION
                </button>
              </div>
              
              <div className="grid-2" style={{ gap: '2.5rem' }}>
                {profiles.map((p, idx) => (
                  <motion.div 
                    key={p.id} 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="glass-card" 
                    style={{ position: 'relative', padding: '3rem', border: '1px solid rgba(167, 139, 250, 0.1)' }}
                  >
                    {profiles.length > 1 && (
                      <button 
                        onClick={() => removeProfile(p.id)}
                        style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'rgba(239, 68, 68, 0.1)', border: 'none', color: '#f87171', cursor: 'pointer', width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s' }}
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                    
                    <div className="form-group" style={{ marginBottom: '2.5rem' }}>
                      <label className="form-label-aura"><Building2 size={14} /> Location Identity</label>
                      <input className="input-field cinematic-input" placeholder="e.g. Downtown Bistro" value={p.name} onChange={e => updateProfile(p.id, 'name', e.target.value)} />
                    </div>

                    <div className="grid-2" style={{ gap: '2rem', marginBottom: '2.5rem' }}>
                      <div>
                        <label className="label-caps">Entity Vector</label>
                        <select className="filter-select" style={{ width: '100%', height: '52px', borderRadius: '1.25rem' }} value={p.type} onChange={e => updateProfile(p.id, 'type', e.target.value)}>
                          {BUSINESS_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="label-caps">AI Resonance</label>
                        <select className="filter-select" style={{ width: '100%', height: '52px', borderRadius: '1.25rem' }} value={p.tone} onChange={e => updateProfile(p.id, 'tone', e.target.value)}>
                          {TONES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="label-caps">Strategic Specialties</label>
                      <input 
                        className="input-field cinematic-input" 
                        placeholder="e.g. Fine Dining, 24/7, Fast WiFi" 
                        value={p.specialties?.join(', ')} 
                        onChange={e => updateProfile(p.id, 'specialties', e.target.value.split(',').map(s => s.trim()))} 
                        style={{ fontSize: '0.9rem' }}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ) : activeTab === 'rules' ? (
            <div className="rules-section">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 900, letterSpacing: '-0.5px', textTransform: 'uppercase' }}>Automation Engine</h3>
                  <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Define neural response patterns based on review metadata.</p>
                </div>
                <button className="btn btn-primary" style={{ borderRadius: '1.25rem', height: '48px' }} onClick={addRule}>
                  <Plus size={18} /> CREATE RULE
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                {rules.map((rule, idx) => (
                  <motion.div 
                    key={rule.id} 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="glass-card" 
                    style={{ padding: '3rem', borderLeft: `8px solid ${rule.enabled ? 'var(--primary)' : 'rgba(255,255,255,0.05)'}`, borderRadius: '2.5rem' }}
                  >
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr auto', gap: '2.5rem', marginBottom: '2.5rem' }}>
                      <div>
                        <label className="form-label-aura"><Tag size={14} /> Rule Identifier</label>
                        <input className="input-field cinematic-input" style={{ height: '52px' }} value={rule.name} onChange={e => updateRule(rule.id, 'name', e.target.value)} />
                      </div>
                      <div>
                        <label className="label-caps">Neural Tone Override</label>
                        <select className="filter-select" style={{ width: '100%', height: '52px', borderRadius: '1.25rem' }} value={rule.tone} onChange={e => updateRule(rule.id, 'tone', e.target.value)}>
                          {TONES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingTop: '1.5rem' }}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', fontWeight: 900, fontSize: '0.85rem', color: rule.enabled ? 'var(--primary-light)' : 'var(--text-dim)', transition: 'color 0.3s' }}>
                            <div style={{ width: '48px', height: '24px', background: rule.enabled ? 'var(--primary)' : 'rgba(255,255,255,0.05)', borderRadius: '12px', position: 'relative', transition: 'background 0.3s' }}>
                               <motion.div 
                                 animate={{ x: rule.enabled ? 24 : 0 }}
                                 style={{ width: '20px', height: '20px', background: 'white', borderRadius: '50%', margin: '2px', position: 'absolute' }}
                                 onClick={() => updateRule(rule.id, 'enabled', !rule.enabled)}
                               />
                            </div>
                            {rule.enabled ? 'ENABLED' : 'PAUSED'}
                          </label>
                      </div>
                      <div style={{ paddingTop: '1.5rem' }}>
                        <button className="btn btn-ghost" style={{ color: '#f87171', height: '52px', background: 'rgba(239, 68, 68, 0.05)', width: '52px', borderRadius: '1.25rem' }} onClick={() => removeRule(rule.id)}>
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '2rem', padding: '2rem', background: 'rgba(0,0,0,0.3)', borderRadius: '2rem', border: '1px solid rgba(167, 139, 250, 0.05)' }}>
                       <div>
                          <div className="label-caps" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Star size={14} color="var(--accent-amber)" /> Threshold
                          </div>
                          <select className="filter-select" style={{ width: '100%', height: '48px', borderRadius: '1rem' }} value={rule.rating_min} onChange={e => updateRule(rule.id, 'rating_min', parseInt(e.target.value))}>
                            {[5,4,3,2,1].map(v => <option key={v} value={v}>{v} Stars or higher</option>)}
                          </select>
                       </div>
                       
                       <div>
                          <div className="label-caps" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <MessageSquare size={14} color="var(--accent-blue)" /> Sentiments
                          </div>
                          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            {SENTIMENTS.map(s => (
                              <button 
                                key={s} 
                                className={`tone-pill ${(rule.sentiment_match || []).includes(s) ? 'active' : ''}`}
                                style={{ fontSize: '0.7rem', height: '36px', padding: '0 1rem' }}
                                onClick={() => {
                                  const current = rule.sentiment_match || [];
                                  const next = current.includes(s) ? current.filter(x => x !== s) : [...current, s];
                                  updateRule(rule.id, 'sentiment_match', next);
                                }}
                              >
                                {s}
                              </button>
                            ))}
                          </div>
                       </div>

                       <div>
                          <div className="label-caps" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Tag size={14} color="var(--primary-light)" /> Semantic Vectors
                          </div>
                          <select 
                            className="filter-select" 
                            style={{ width: '100%', height: '48px', borderRadius: '1rem' }}
                            value="" 
                            onChange={e => {
                              if (!e.target.value) return;
                              const current = rule.category_match || [];
                              if (!current.includes(e.target.value)) updateRule(rule.id, 'category_match', [...current, e.target.value]);
                            }}
                          >
                            <option value="">+ ADD CATEGORY</option>
                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '1rem' }}>
                            {(rule.category_match || []).map(c => (
                              <span key={c} className="badge" style={{ background: 'rgba(167, 139, 250, 0.1)', color: 'var(--primary-light)', borderRadius: '10px', padding: '0.4rem 0.8rem' }}>
                                {c} <X size={14} style={{ cursor: 'pointer', marginLeft: '6px' }} onClick={() => updateRule(rule.id, 'category_match', rule.category_match.filter(x => x !== c))} />
                              </span>
                            ))}
                          </div>
                       </div>
                    </div>

                    <div style={{ marginTop: '2.5rem' }}>
                      <div className="label-caps" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Brain size={16} color="var(--primary)" /> Keyword Constraints
                      </div>
                      <input 
                        className="input-field cinematic-input" 
                        style={{ height: '56px' }}
                        placeholder="e.g. refund, !fast, delay, service_fail" 
                        value={(rule.keyword_match || []).join(', ')} 
                        onChange={e => updateRule(rule.id, 'keyword_match', e.target.value.split(',').map(s => s.trim()).filter(s => s))} 
                      />
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '0.75rem', fontWeight: 600 }}>
                         Separate with commas. Use <b style={{ color: 'var(--text-muted)' }}>!</b> for exclusion (e.g. !spam).
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ) : (
            <div className="api-section center-infra" style={{ maxWidth: '800px', margin: '0 auto' }}>
              <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                <div style={{ width: '80px', height: '80px', background: 'rgba(167, 139, 250, 0.1)', borderRadius: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem', border: '1px solid rgba(167, 139, 250, 0.2)' }}>
                   <Key size={40} color="var(--primary)" />
                </div>
                <h3 className="aura-header" style={{ fontSize: '2.5rem' }}>Intelligence Core</h3>
                <p className="aura-subheader" style={{ margin: '0 auto' }}>Secure authorization for the Google Gemini API clusters.</p>
              </div>

              <motion.div 
                className="glass-card" 
                style={{ padding: '4rem', background: 'rgba(11, 11, 26, 0.6)', borderRadius: '3rem', border: '1px solid rgba(167, 139, 250, 0.15)' }}
                whileHover={{ shadow: '0 0 40px rgba(167, 139, 250, 0.05)' }}
              >
                <div className="form-group">
                  <label className="form-label-aura" style={{ fontSize: '0.85rem', marginBottom: '1.5rem', letterSpacing: '2px' }}>
                    <Shield size={18} /> GEMINI STRATEGIC KEY
                  </label>
                  <input 
                    type="password" 
                    className="input-field cinematic-input" 
                    style={{ height: '72px', textAlign: 'center', letterSpacing: '4px', fontSize: '1.5rem' }}
                    placeholder="••••••••••••••••••••••••••••••" 
                    value={systemConfig.gemini_api_key || ''} 
                    onChange={e => setSystemConfig({ ...systemConfig, gemini_api_key: e.target.value })}
                  />
                  
                  <div style={{ marginTop: '3rem', padding: '2rem', background: 'rgba(167, 139, 250, 0.03)', borderRadius: '1.5rem', border: '1px solid rgba(167, 139, 250, 0.08)' }}>
                    <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
                      <AlertTriangle size={24} color="var(--primary-light)" style={{ flexShrink: 0 }} />
                      <p style={{ fontSize: '0.9rem', color: 'var(--text-sub)', lineHeight: 1.8, fontWeight: 500 }}>
                        Keys are encrypted and stored in local persistence. This key authorizes the **Aura Intelligence Engine** to perform high-fidelity drafting and semantic reputation analysis.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
};

export default SettingsView;

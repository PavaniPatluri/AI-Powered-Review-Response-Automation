import React, { useState, useEffect } from 'react';
import { Building2, Shield, Save, CheckCircle, Plus, Trash2, Zap, Settings, Globe, Tag, MessageSquare, AlertTriangle, X, Key } from 'lucide-react';
import { fetchProfiles, updateProfiles, fetchRules, updateRules, fetchSystemConfig, updateSystemConfig } from '../api';

const TONES = ['Professional', 'Friendly', 'Empathetic', 'Apologetic', 'Celebratory'];
const BUSINESS_TYPES = ['Restaurant', 'Hotel', 'Clinic', 'Salon', 'Theater'];
const SENTIMENTS = ['Positive', 'Negative', 'Neutral'];
const CATEGORIES = ['Service', 'Food', 'Wait Time', 'Hygiene', 'Price', 'Atmosphere', 'Quality', 'Booking'];

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
        setProfiles(ps);
        setRules(rs);
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
    <div className="animate-fade-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">Enterprise Automation Suite</h1>
          <p className="page-subtitle">Multi-location profiles, multilingual rules, and AI categorization</p>
        </div>
        <button 
          className="btn btn-primary" 
          onClick={saveAction}
          disabled={saving}
        >
          <Save size={16} /> {saving ? 'Writing Changes...' : 'Save Configuration'}
        </button>
      </div>

      <div className="toolbar" style={{ background: 'transparent', border: 'none', padding: 0, marginBottom: '2rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(255,255,255,0.03)', padding: '0.4rem', borderRadius: '0.75rem', border: '1px solid var(--glass-border)' }}>
          <button className={`tone-pill ${activeTab === 'profiles' ? 'active' : ''}`} onClick={() => setActiveTab('profiles')}>
            <Building2 size={14} /> My Locations ({profiles.length})
          </button>
          <button className={`tone-pill ${activeTab === 'rules' ? 'active' : ''}`} onClick={() => setActiveTab('rules')}>
            <Zap size={14} /> Smart Rules Engine
          </button>
          <button className={`tone-pill ${activeTab === 'api' ? 'active' : ''}`} onClick={() => setActiveTab('api')}>
            <Key size={14} /> API & System
          </button>
        </div>
      </div>

      {activeTab === 'profiles' ? (
        <div className="animate-fade-in">
           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.1rem' }}>Business Locations</h3>
              <button className="btn btn-outline" style={{ fontSize: '0.8rem' }} onClick={addProfile}>
                <Plus size={14} /> Add Location
              </button>
           </div>
           
           <div className="grid-2" style={{ gap: '1.5rem', alignItems: 'flex-start' }}>
              {profiles.map(p => (
                <div key={p.id} className="glass-card" style={{ position: 'relative' }}>
                  {profiles.length > 1 && (
                    <button 
                      onClick={() => removeProfile(p.id)}
                      style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: 'var(--accent-red)', cursor: 'pointer', opacity: 0.6 }}
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                  <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                    <label style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem', fontWeight: 700, textTransform: 'uppercase' }}>Location Name</label>
                    <input className="input-field" value={p.name} onChange={e => updateProfile(p.id, 'name', e.target.value)} />
                  </div>
                  <div className="grid-2" style={{ gap: '1rem', marginBottom: '1.25rem' }}>
                    <div>
                      <label style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem', fontWeight: 700, textTransform: 'uppercase' }}>Type</label>
                      <select className="filter-select" style={{ width: '100%' }} value={p.type} onChange={e => updateProfile(p.id, 'type', e.target.value)}>
                        {BUSINESS_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem', fontWeight: 700, textTransform: 'uppercase' }}>Default Tone</label>
                      <select className="filter-select" style={{ width: '100%' }} value={p.tone} onChange={e => updateProfile(p.id, 'tone', e.target.value)}>
                        {TONES.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="form-group">
                    <label style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem', fontWeight: 700, textTransform: 'uppercase' }}>Specialties</label>
                    <input 
                      className="input-field" 
                      placeholder="e.g. Sushi, Free WiFi, Deep Tissue" 
                      value={p.specialties?.join(', ')} 
                      onChange={e => updateProfile(p.id, 'specialties', e.target.value.split(',').map(s => s.trim()))} 
                    />
                  </div>
                </div>
              ))}
           </div>
        </div>
      ) : activeTab === 'rules' ? (
        <div className="animate-fade-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem' }}>Smart Automation Rules</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>AI-driven conditions for matching reviews and generating drafts</p>
            </div>
            <button className="btn btn-outline" style={{ fontSize: '0.8rem' }} onClick={addRule}>
              <Plus size={14} /> Create Complex Rule
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {rules.map(rule => (
              <div key={rule.id} className="glass-card" style={{ padding: '1.5rem', borderLeft: `4px solid ${rule.enabled ? 'var(--accent-blue)' : 'var(--text-dim)'}` }}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr auto', gap: '1.5rem', marginBottom: '1.5rem' }}>
                  <div>
                    <label className="label-caps">Rule Name</label>
                    <input className="input-field" value={rule.name} onChange={e => updateRule(rule.id, 'name', e.target.value)} />
                  </div>
                  <div>
                    <label className="label-caps">Assign AI Tone</label>
                    <select className="filter-select" style={{ width: '100%' }} value={rule.tone} onChange={e => updateRule(rule.id, 'tone', e.target.value)}>
                      {TONES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingTop: '1.2rem' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem' }}>
                        <input type="checkbox" checked={rule.enabled} onChange={e => updateRule(rule.id, 'enabled', e.target.checked)} />
                        {rule.enabled ? 'ENABLED' : 'PAUSED'}
                      </label>
                  </div>
                  <div style={{ paddingTop: '1.2rem' }}>
                    <button className="btn btn-ghost" style={{ color: 'var(--accent-red)' }} onClick={() => removeRule(rule.id)}>
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '0.75rem' }}>
                   {/* Criterion: Rating */}
                   <div>
                      <div className="label-caps" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Zap size={12} /> Min Rating
                      </div>
                      <select className="filter-select" style={{ width: '100%' }} value={rule.rating_min} onChange={e => updateRule(rule.id, 'rating_min', parseInt(e.target.value))}>
                        {[5,4,3,2,1].map(v => <option key={v} value={v}>{v} Stars or higher</option>)}
                      </select>
                   </div>
                   
                   {/* Criterion: Sentiment */}
                   <div>
                      <div className="label-caps" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <MessageSquare size={12} /> Match Sentiment
                      </div>
                      <div style={{ display: 'flex', gap: '3px' }}>
                        {SENTIMENTS.map(s => (
                          <button 
                            key={s} 
                            className={`tone-pill ${(rule.sentiment_match || []).includes(s) ? 'active' : ''}`}
                            style={{ fontSize: '0.65rem', padding: '0.2rem 0.5rem' }}
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

                   {/* Criterion: Categories */}
                   <div>
                      <div className="label-caps" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Tag size={12} /> Categories
                      </div>
                      <select 
                        className="filter-select" 
                        style={{ width: '100%' }}
                        value="" 
                        onChange={e => {
                          if (!e.target.value) return;
                          const current = rule.category_match || [];
                          if (!current.includes(e.target.value)) updateRule(rule.id, 'category_match', [...current, e.target.value]);
                        }}
                      >
                        <option value="">+ Add Category</option>
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '0.5rem' }}>
                        {(rule.category_match || []).map(c => (
                          <span key={c} className="badge badge-neutral" style={{ fontSize: '0.6rem', display: 'flex', alignItems: 'center', gap: '3px' }}>
                            {c} <X size={10} style={{ cursor: 'pointer' }} onClick={() => updateRule(rule.id, 'category_match', rule.category_match.filter(x => x !== c))} />
                          </span>
                        ))}
                      </div>
                   </div>
                </div>

                <div style={{ marginTop: '1rem' }}>
                  <div className="label-caps" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <AlertTriangle size={12} /> Keyword Conditionals
                  </div>
                  <input 
                    className="input-field" 
                    placeholder="e.g. refund, !fast (Use ! for 'must not contain')" 
                    value={(rule.keyword_match || []).join(', ')} 
                    onChange={e => updateRule(rule.id, 'keyword_match', e.target.value.split(',').map(s => s.trim()).filter(s => s))} 
                  />
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '0.4rem' }}>
                    Separate with commas. Keywords starting with <b>!</b> will suppress this rule if found in review.
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="animate-fade-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem' }}>API Configuration</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Securely connect the Google Gemini API for real-time generative responses</p>
            </div>
          </div>
          <div className="glass-card" style={{ padding: '2rem' }}>
            <div className="form-group">
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>
                <Key size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '0.4rem' }} />
                Gemini API Key
              </label>
              <input 
                type="password" 
                className="input-field" 
                placeholder="AIzaSy..." 
                value={systemConfig.gemini_api_key || ''} 
                onChange={e => setSystemConfig({ ...systemConfig, gemini_api_key: e.target.value })}
              />
              <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '0.75rem' }}>
                Your key is stored locally and used exclusively to draft contextual responses and analyze sentiment. If left blank, the application will run in simulation mode.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsView;

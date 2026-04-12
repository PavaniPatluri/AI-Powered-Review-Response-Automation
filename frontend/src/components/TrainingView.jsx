import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchPrompts, updatePrompts } from '../api';
import { Brain, Save, RotateCcw, CheckCircle, Terminal, Sparkles, Plus } from 'lucide-react';

const TONE_META = {
  Professional: { color: '#6366f1', desc: 'Formal, polite, structured responses suitable for corporate settings.' },
  Friendly:     { color: '#f59e0b', desc: 'Warm, casual tone that makes customers feel welcome and valued.' },
  Empathetic:   { color: '#ec4899', desc: 'Compassionate responses that validate feelings and build trust.' },
  Apologetic:   { color: '#ef4444', desc: 'Leads with accountability and offers clear resolution paths.' },
  Celebratory:  { color: '#10b981', desc: 'Enthusiastic and joyful — perfect for 5-star reviews.' },
};

const DEFAULT_PROMPTS = [
  { tone: 'Professional', system_prompt: 'Provide formal, polite, and structured responses.', examples: [] },
  { tone: 'Friendly',     system_prompt: 'Use a casual, welcoming tone. Make customers feel like family.', examples: [] },
  { tone: 'Empathetic',   system_prompt: 'Validate feelings and offer sincere apologies.', examples: [] },
  { tone: 'Apologetic',   system_prompt: 'Lead with a sincere apology and offer clear resolution.', examples: [] },
  { tone: 'Celebratory',  system_prompt: 'Express pure joy and gratitude for great reviews!', examples: [] }
];

const TrainingView = ({ prompts, onSave }) => {
  const initialPrompts = prompts && prompts.length > 0 ? prompts : DEFAULT_PROMPTS;
  const [editablePrompts, setEditablePrompts] = useState(initialPrompts);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: 'easeOut' } }
  };

  const handleChange = (i, value) => {
    const updated = [...editablePrompts];
    updated[i] = { ...updated[i], system_prompt: value };
    setEditablePrompts(updated);
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(editablePrompts);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  const activePrompt = editablePrompts[activeIndex];
  const meta = activePrompt ? TONE_META[activePrompt.tone] : null;

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="training-view"
    >
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '3.5rem' }}>
        <motion.div variants={itemVariants}>
          <h1 className="aura-header">Prompt Engine</h1>
          <p className="aura-subheader">High-fidelity neural tuning and response templating.</p>
        </motion.div>
        <motion.button 
          variants={itemVariants}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`btn ${saved ? 'btn-success' : 'btn-primary'}`} 
          onClick={handleSave} 
          disabled={saving} 
          style={{ height: '56px', borderRadius: '1.5rem', padding: '0 2.5rem', fontWeight: 800 }}
        >
          {saved ? <><CheckCircle size={20} /> CHANGES PERSISTED</> : saving ? 'SYNCING...' : <><Save size={20} /> SAVE TEMPLATES</>}
        </motion.button>
      </div>

      <div className="grid-2" style={{ alignItems: 'flex-start', gap: '2.5rem', gridTemplateColumns: '350px 1fr' }}>
        {/* Tone Selector */}
        <motion.div 
          variants={itemVariants}
          className="glass-card" 
          style={{ padding: '2rem', background: 'rgba(17, 17, 34, 0.4)', borderRadius: '2rem', border: '1px solid rgba(167, 139, 250, 0.05)' }}
        >
          <div className="label-caps" style={{ marginBottom: '1.5rem', opacity: 0.6 }}>
            NEURAL RESONANCE
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {editablePrompts.map((p, i) => {
              const m = TONE_META[p.tone] || {};
              const isActive = activeIndex === i;
              return (
                <motion.button
                  key={p.tone}
                  whileHover={{ x: 5, background: 'rgba(167, 139, 250, 0.05)' }}
                  onClick={() => setActiveIndex(i)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '1.25rem',
                    padding: '1.25rem', borderRadius: '1.25rem', cursor: 'pointer',
                    border: `1px solid ${isActive ? 'rgba(167, 139, 250, 0.2)' : 'rgba(255,255,255,0.03)'}`,
                    background: isActive ? 'rgba(167, 139, 250, 0.1)' : 'rgba(0,0,0,0.2)',
                    transition: 'var(--transition-smooth)', textAlign: 'left', width: '100%'
                  }}
                >
                  <div style={{ 
                    width: 12, height: 12, borderRadius: '50%', 
                    background: isActive ? 'var(--primary)' : 'rgba(255,255,255,0.1)', 
                    boxShadow: isActive ? '0 0 15px var(--primary-glow)' : 'none' 
                  }} />
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '1rem', color: isActive ? '#fff' : 'var(--text-muted)' }}>{p.tone.toUpperCase()}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.25rem', fontWeight: 500 }}>{m.desc?.split(',')[0]}...</div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Prompt Editor */}
        <AnimatePresence mode="wait">
          {activePrompt && (
            <motion.div 
              key={activePrompt.tone}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4 }}
              className="glass-card" 
              style={{ padding: '3.5rem', background: 'rgba(17, 17, 34, 0.5)', borderRadius: '2.5rem', border: '1px solid rgba(167, 139, 250, 0.08)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    <Sparkles size={18} color="var(--primary-light)" />
                    <span className="label-caps" style={{ color: 'var(--primary-light)' }}>ACTIVE SCHEMATIC</span>
                  </div>
                  <h3 style={{ fontSize: '2.5rem', fontWeight: 950, color: '#fff', letterSpacing: '-1.5px' }}>{activePrompt.tone}</h3>
                  <p style={{ fontSize: '1.05rem', color: 'var(--text-muted)', marginTop: '0.75rem', fontWeight: 500, maxWidth: '500px', lineHeight: 1.6 }}>{meta?.desc}</p>
                </div>
              </div>
              
              <div className="label-caps" style={{ marginBottom: '1.25rem', opacity: 0.5 }}>
                SYSTEM INSTRUCTION SET
              </div>
              <div style={{ position: 'relative' }}>
                <Terminal size={18} style={{ position: 'absolute', top: '1.5rem', left: '1.5rem', opacity: 0.3 }} />
                <textarea
                  className="cinematic-input"
                  style={{ 
                    minHeight: '220px', 
                    fontFamily: 'JetBrains Mono, monospace', 
                    fontSize: '0.95rem', 
                    lineHeight: 1.8, 
                    marginBottom: '3rem', 
                    paddingLeft: '4rem' 
                  }}
                  value={activePrompt.system_prompt}
                  onChange={e => handleChange(activeIndex, e.target.value)}
                  placeholder="Define neural behavior guidelines..."
                />
              </div>

              <div className="label-caps" style={{ marginBottom: '2rem', opacity: 0.5 }}>
                FEW-SHOT SUCCESS NODES
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {(activePrompt.examples || []).map((ex, i) => (
                  <motion.div 
                    key={i} 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ padding: '2.5rem', background: 'rgba(0,0,0,0.3)', borderRadius: '1.75rem', border: '1px solid rgba(255,255,255,0.03)' }}
                  >
                    <div className="label-caps" style={{ color: 'var(--primary-light)', marginBottom: '1.75rem', fontSize: '0.7rem', opacity: 0.4 }}>SUCCESS NODE {i+1}</div>
                    <div style={{ marginBottom: '2rem' }}>
                      <div className="form-label-aura">INPUT REVIEW</div>
                      <textarea 
                        className="cinematic-input" 
                        style={{ minHeight: '80px', fontSize: '0.9rem', background: 'rgba(0,0,0,0.2)' }}
                        value={ex.review}
                        onChange={e => {
                          const updated = [...editablePrompts];
                          updated[activeIndex].examples[i].review = e.target.value;
                          setEditablePrompts(updated);
                        }}
                      />
                    </div>
                    <div>
                      <div className="form-label-aura">TARGET RESPONSE</div>
                      <textarea 
                        className="cinematic-input" 
                        style={{ minHeight: '100px', fontSize: '0.9rem', background: 'rgba(0,0,0,0.2)' }}
                        value={ex.response}
                        onChange={e => {
                          const updated = [...editablePrompts];
                          updated[activeIndex].examples[i].response = e.target.value;
                          setEditablePrompts(updated);
                        }}
                      />
                    </div>
                  </motion.div>
                ))}
                
                <motion.button 
                  whileHover={{ scale: 1.01, background: 'rgba(167, 139, 250, 0.05)' }}
                  whileTap={{ scale: 0.99 }}
                  className="btn btn-outline" 
                  style={{ width: '100%', borderStyle: 'dashed', height: '64px', borderRadius: '1.5rem', fontSize: '0.85rem', letterSpacing: '1px', opacity: 0.6 }}
                  onClick={() => {
                    const updated = [...editablePrompts];
                    if (!updated[activeIndex].examples) updated[activeIndex].examples = [];
                    updated[activeIndex].examples.push({ review: '', response: '' });
                    setEditablePrompts(updated);
                  }}
                >
                  <Plus size={18} /> APPEND SUCCESS EXAMPLE
                </motion.button>
              </div>

              <div style={{ display: 'flex', gap: '1.5rem', marginTop: '3.5rem', alignItems: 'center' }}>
                <button className="btn btn-ghost" style={{ fontSize: '0.8rem', borderRadius: '1.25rem', padding: '0 1.5rem', height: '48px', background: 'rgba(255,255,255,0.02)' }}
                  onClick={() => handleChange(activeIndex, prompts[activeIndex]?.system_prompt || '')}>
                  <RotateCcw size={16} /> RESET SCHEMATIC
                </button>
                <div style={{ marginLeft: 'auto' }}>
                  <span className="glass-pill" style={{ opacity: 0.5 }}>
                    {activePrompt.system_prompt?.length || 0} VECTORS
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* How it works */}
      <motion.div 
        variants={itemVariants}
        className="glass-card" 
        style={{ marginTop: '3.5rem', padding: '3rem', background: 'rgba(167, 139, 250, 0.03)', border: '1px solid rgba(167, 139, 250, 0.1)', borderRadius: '2.5rem' }}
      >
        <div style={{ display: 'flex', gap: '1.75rem', alignItems: 'flex-start' }}>
          <div style={{ width: '56px', height: '56px', background: 'rgba(167, 139, 250, 0.1)', borderRadius: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Brain size={28} style={{ color: 'var(--primary-light)' }} />
          </div>
          <div>
            <h4 style={{ fontWeight: 900, marginBottom: '0.75rem', fontSize: '1.25rem', letterSpacing: '-0.5px', color: '#fff' }}>NEURAL SEEDING ARCHITECTURE</h4>
            <p style={{ fontSize: '1rem', color: 'var(--text-muted)', lineHeight: 1.8, fontWeight: 500 }}>
              Instructions defined above are prepended to the AI's core logic. The "Few-Shot" examples provide the highest fidelity guidance for complex tonal requirements. Modifications here will refine the **Aura Engine's** behavior across the entire review stream.
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default TrainingView;

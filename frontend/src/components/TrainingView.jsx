import React, { useState } from 'react';
import { fetchPrompts, updatePrompts } from '../api';
import { Brain, Save, RotateCcw, CheckCircle } from 'lucide-react';

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
    <div className="animate-fade-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '3rem' }}>
        <div>
          <h1 className="page-title" style={{ fontSize: '3rem', letterSpacing: '-1.5px', marginBottom: '0.75rem' }}>Prompt Engine</h1>
          <p className="page-subtitle" style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 500 }}>High-fidelity neural tuning and response templating.</p>
        </div>
        <button className={`btn ${saved ? 'btn-success' : 'btn-primary'}`} onClick={handleSave} disabled={saving} style={{ height: '52px', borderRadius: '1.25rem', padding: '0 2rem' }}>
          {saved ? <><CheckCircle size={18} /> CHANGES PERSISTED</> : saving ? 'SYNCING...' : <><Save size={18} /> SAVE TEMPLATES</>}
        </button>
      </div>

      <div className="grid-2" style={{ alignItems: 'flex-start', gap: '2rem' }}>
        {/* Tone Selector */}
        <div className="glass-card" style={{ padding: '2rem', background: 'rgba(17, 17, 34, 0.4)', borderRadius: '1.75rem' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--primary-light)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '1.5rem', opacity: 0.6 }}>
            NEURAL RESONANCE
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {editablePrompts.map((p, i) => {
              const m = TONE_META[p.tone] || {};
              const isActive = activeIndex === i;
              return (
                <button
                  key={p.tone}
                  onClick={() => setActiveIndex(i)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '1rem',
                    padding: '1.25rem', borderRadius: '1.25rem', cursor: 'pointer',
                    border: `1px solid ${isActive ? 'rgba(167, 139, 250, 0.2)' : 'rgba(255,255,255,0.03)'}`,
                    background: isActive ? 'rgba(167, 139, 250, 0.08)' : 'rgba(0,0,0,0.2)',
                    transition: 'var(--transition-smooth)', textAlign: 'left', width: '100%'
                  }}
                >
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: isActive ? 'var(--primary)' : 'var(--text-dim)', boxShadow: isActive ? '0 0 10px var(--primary-glow)' : 'none' }} />
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '1rem', color: isActive ? 'var(--text-main)' : 'var(--text-sub)' }}>{p.tone.toUpperCase()}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem', fontWeight: 500 }}>{m.desc?.split(',')[0]}...</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Prompt Editor */}
        {activePrompt && (
          <div className="glass-card animate-fade-in" key={activePrompt.tone} style={{ padding: '3rem', background: 'rgba(17, 17, 34, 0.5)', borderRadius: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1.75rem', fontWeight: 950, color: 'var(--primary)', letterSpacing: '-1px' }}>{activePrompt.tone}</h3>
                <p style={{ fontSize: '0.95rem', color: 'var(--text-sub)', marginTop: '0.5rem', fontWeight: 500 }}>{meta?.desc}</p>
              </div>
            </div>
            
            <div style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '1rem' }}>
              SYSTEM INSTRUCTION SET
            </div>
            <textarea
              className="input-field"
              style={{ minHeight: '220px', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.9rem', lineHeight: 1.8, marginBottom: '2.5rem', background: 'rgba(0,0,0,0.3)', borderRadius: '1.25rem', padding: '1.5rem' }}
              value={activePrompt.system_prompt}
              onChange={e => handleChange(activeIndex, e.target.value)}
              placeholder="Define neural behavior guidelines..."
            />

            <div style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '1.5rem' }}>
              FEW-SHOT SUCCESS NODES
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {(activePrompt.examples || []).map((ex, i) => (
                <div key={i} style={{ padding: '2rem', background: 'rgba(0,0,0,0.2)', borderRadius: '1.5rem', border: '1px solid rgba(255,255,255,0.03)' }}>
                  <div style={{ fontSize: '0.65rem', color: 'var(--primary-light)', marginBottom: '1.25rem', fontWeight: 900, letterSpacing: '1px', opacity: 0.5 }}>STRATEGIC EXAMPLE {i+1}</div>
                  <div style={{ marginBottom: '1.5rem' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 800 }}>INPUT REVIEW</div>
                    <textarea 
                      className="input-field" 
                      style={{ minHeight: '70px', fontSize: '0.85rem', background: 'rgba(0,0,0,0.2)', borderRadius: '0.75rem' }}
                      value={ex.review}
                      onChange={e => {
                        const updated = [...editablePrompts];
                        updated[activeIndex].examples[i].review = e.target.value;
                        setEditablePrompts(updated);
                      }}
                    />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 800 }}>TARGET RESPONSE</div>
                    <textarea 
                      className="input-field" 
                      style={{ minHeight: '90px', fontSize: '0.85rem', background: 'rgba(0,0,0,0.2)', borderRadius: '0.75rem' }}
                      value={ex.response}
                      onChange={e => {
                        const updated = [...editablePrompts];
                        updated[activeIndex].examples[i].response = e.target.value;
                        setEditablePrompts(updated);
                      }}
                    />
                  </div>
                </div>
              ))}
              <button className="btn btn-outline" style={{ width: '100%', borderStyle: 'dashed', height: '60px', borderRadius: '1.25rem', fontSize: '0.8rem', letterSpacing: '1px', opacity: 0.6 }}
                onClick={() => {
                  const updated = [...editablePrompts];
                  if (!updated[activeIndex].examples) updated[activeIndex].examples = [];
                  updated[activeIndex].examples.push({ review: '', response: '' });
                  setEditablePrompts(updated);
                }}>
                + APPEND SUCCESS EXAMPLE
              </button>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '2.5rem' }}>
              <button className="btn btn-outline" style={{ fontSize: '0.8rem', borderRadius: '1rem', padding: '0 1.5rem', height: '44px' }}
                onClick={() => handleChange(activeIndex, prompts[activeIndex]?.system_prompt || '')}>
                <RotateCcw size={14} /> RESET NODE
              </button>
              <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--text-dim)', alignSelf: 'center', fontWeight: 700 }}>
                {activePrompt.system_prompt?.length || 0} VECTORS
              </span>
            </div>
          </div>
        )}
      </div>

      {/* How it works */}
      <div className="glass-card" style={{ marginTop: '2.5rem', padding: '2.5rem', background: 'rgba(167, 139, 250, 0.03)', border: '1px solid rgba(167, 139, 250, 0.08)', borderRadius: '2rem' }}>
        <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
          <Brain size={24} style={{ color: 'var(--primary)', flexShrink: 0 }} />
          <div>
            <h4 style={{ fontWeight: 900, marginBottom: '0.5rem', fontSize: '1.1rem', letterSpacing: '-0.5px' }}>NEURAL SEEDING ARCHITECTURE</h4>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-sub)', lineHeight: 1.7, fontWeight: 500, opacity: 0.8 }}>
              Instructions defined above are prepended to the AI's core logic. The "Few-Shot" examples provide the highest fidelity guidance for complex tonal requirements. Modifications here will refine the **Aura Engine's** behavior across the entire review stream.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainingView;

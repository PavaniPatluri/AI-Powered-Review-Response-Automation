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
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Prompt Engine</h1>
          <p className="page-subtitle">Customize AI response templates for each tone — shapes how your AI responds to every review</p>
        </div>
        <button className={`btn ${saved ? 'btn-success' : 'btn-primary'}`} onClick={handleSave} disabled={saving}>
          {saved ? <><CheckCircle size={16} /> Saved!</> : saving ? 'Saving...' : <><Save size={16} /> Save Prompts</>}
        </button>
      </div>

      <div className="grid-2" style={{ alignItems: 'flex-start', gap: '1.5rem' }}>
        {/* Tone Selector */}
        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.875rem' }}>
            Select Tone
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {editablePrompts.map((p, i) => {
              const m = TONE_META[p.tone] || {};
              return (
                <button
                  key={p.tone}
                  onClick={() => setActiveIndex(i)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    padding: '0.75rem 1rem', borderRadius: '0.75rem', cursor: 'pointer',
                    border: `1px solid ${activeIndex === i ? m.color + '40' : 'var(--glass-border)'}`,
                    background: activeIndex === i ? `${m.color}10` : 'transparent',
                    color: activeIndex === i ? m.color : 'var(--text-muted)',
                    transition: 'all 0.2s', textAlign: 'left', width: '100%'
                  }}
                >
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: m.color, flexShrink: 0 }} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{p.tone}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', lineHeight: 1.4 }}>{m.desc?.slice(0, 50)}...</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

            {/* Prompt Editor */}
            {activePrompt && (
              <div className="glass-card animate-fade-in" key={activePrompt.tone}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <div>
                    <h3 style={{ fontFamily: 'Outfit', fontSize: '1.1rem', fontWeight: 700, color: meta?.color }}>{activePrompt.tone}</h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{meta?.desc}</p>
                  </div>
                </div>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>
                  System Prompt
                </div>
                <textarea
                  className="input-field"
                  style={{ minHeight: '180px', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8rem', lineHeight: 1.7, marginBottom: '1.5rem' }}
                  value={activePrompt.system_prompt}
                  onChange={e => handleChange(activeIndex, e.target.value)}
                  placeholder="Enter the system prompt for this tone..."
                />

                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1rem' }}>
                  Success Examples (Few-Shot)
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {(activePrompt.examples || []).map((ex, i) => (
                    <div key={i} style={{ padding: '1rem', background: 'rgba(0,0,0,0.15)', borderRadius: '0.75rem', border: '1px solid var(--glass-border)' }}>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)', marginBottom: '0.5rem', fontWeight: 700 }}>EXAMPLE {i+1}</div>
                      <div style={{ marginBottom: '0.75rem' }}>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Review</div>
                        <textarea 
                          className="input-field" 
                          style={{ minHeight: '60px', fontSize: '0.75rem' }}
                          value={ex.review}
                          onChange={e => {
                            const updated = [...editablePrompts];
                            updated[activeIndex].examples[i].review = e.target.value;
                            setEditablePrompts(updated);
                          }}
                        />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Ideal Response</div>
                        <textarea 
                          className="input-field" 
                          style={{ minHeight: '80px', fontSize: '0.75rem' }}
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
                  <button className="btn btn-outline" style={{ width: '100%', borderStyle: 'dashed' }}
                    onClick={() => {
                      const updated = [...editablePrompts];
                      if (!updated[activeIndex].examples) updated[activeIndex].examples = [];
                      updated[activeIndex].examples.push({ review: '', response: '' });
                      setEditablePrompts(updated);
                    }}>
                    + Add Success Example
                  </button>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem' }}>
                  <button className="btn btn-outline" style={{ fontSize: '0.8rem' }}
                    onClick={() => handleChange(activeIndex, prompts[activeIndex]?.system_prompt || '')}>
                    <RotateCcw size={13} /> Reset to Default
                  </button>
                  <span style={{ marginLeft: 'auto', fontSize: '0.72rem', color: 'var(--text-dim)', alignSelf: 'center' }}>
                    {activePrompt.system_prompt?.length || 0} characters
                  </span>
                </div>
              </div>
            )}
      </div>

      {/* How it works */}
      <div className="glass-card" style={{ marginTop: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
          <Brain size={20} style={{ color: 'var(--primary-light)', flexShrink: 0, marginTop: '2px' }} />
          <div>
            <h4 style={{ fontFamily: 'Outfit', fontWeight: 700, marginBottom: '0.375rem', fontSize: '0.95rem' }}>How Prompt Training Works</h4>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.7 }}>
              Each system prompt is prepended to the AI's context when generating a response.
              The prompt defines the persona, communication style, and constraints.
              Changes here affect all future AI-generated responses using that tone.
              Prompts are stored locally and sent to the Gemini API on each generation request.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainingView;

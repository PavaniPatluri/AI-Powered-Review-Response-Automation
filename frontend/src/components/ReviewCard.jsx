import React, { useState, useRef } from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { Star, MessageSquare, Send, CheckCircle, Loader, RotateCcw, Zap, Globe, Tag, Info, X, ShieldCheck } from 'lucide-react';
import { analyzeReview } from '../api';

const BUSINESS_ICONS = {
  Restaurant: '🍽️', Hotel: '🏨', Clinic: '🏥', Salon: '💇', Theater: '🎭'
};

const BUSINESS_COLORS = {
  Restaurant: '#f59e0b', Hotel: '#6366f1', Clinic: '#10b981',
  Salon: '#ec4899', Theater: '#8b5cf6', default: '#3b82f6'
};

const TONES = ['Professional', 'Friendly', 'Empathetic', 'Apologetic', 'Celebratory'];

const ReviewCard = ({ review, index, bulkTrigger, rules }) => {
  const [tone, setTone] = useState(review.ai_tone || 'Professional');
  const [response, setResponse] = useState(review.drafted_response || '');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPublished, setIsPublished] = useState(review.status === 'Published');
  const [charCount, setCharCount] = useState(0);
  const cardRef = useRef(null);

  // 3D Tilt Logic
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    x.set(mouseX / width - 0.5);
    y.set(mouseY / height - 0.5);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const bType = review.business_type || 'Restaurant';
  const bColor = BUSINESS_COLORS[bType] || BUSINESS_COLORS.default;
  const bIcon = BUSINESS_ICONS[bType] || '⭐';

  React.useEffect(() => {
    if (bulkTrigger > 0 && !response && !isPublished) {
      generateAIResponse();
      return;
    }
    if (rules && rules.length > 0 && !response && !isPublished) {
      const activeRule = [...rules].reverse().find(r => r.enabled && review.rating >= r.rating_min);
      if (activeRule) {
        setTone(activeRule.tone);
        generateAIResponse(activeRule.tone);
      }
    }
  }, [bulkTrigger, rules]);

  const generateAIResponse = async (overrideTone) => {
    const targetTone = overrideTone || tone;
    setIsGenerating(true);
    try {
      const data = await analyzeReview(review.content, targetTone, bType);
      const text = data.suggested_responses[0].content;
      setResponse(text);
      setCharCount(text.length);
    } catch (err) {
      setResponse('Thank you for your valuable feedback! We truly appreciate you taking the time to share your experience with us.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTextChange = (e) => {
    setResponse(e.target.value);
    setCharCount(e.target.value.length);
  };

  const handlePublish = () => setIsPublished(true);
  const handleReset = () => { setResponse(''); setCharCount(0); setIsPublished(false); };

  const ratingColor = review.rating >= 4 ? '#34d399' : review.rating === 3 ? '#60a5fa' : '#f87171';

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ 
        rotateX, 
        rotateY, 
        transformStyle: "preserve-3d",
        perspective: "1000px" 
      }}
      initial={{ opacity: 0, scale: 0.9, y: 30 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ 
        duration: 0.8, 
        delay: index * 0.05,
        ease: [0.23, 1, 0.32, 1]
      }}
      className="review-card-3d"
    >
      {/* 3D Inner Content */}
      <div style={{ transform: "translateZ(30px)" }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: `linear-gradient(90deg, transparent, ${bColor}40, transparent)`, pointerEvents: 'none' }} />

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span className={`badge badge-${review.sentiment?.toLowerCase()}`}>{review.sentiment}</span>
            {review.language_code && review.language_code !== 'en' && (
              <span className="badge badge-neutral" style={{ background: 'rgba(99,102,241,0.1)', color: 'var(--primary-light)' }}>
                <Globe size={11} /> {review.language_code.toUpperCase()}
              </span>
            )}
            <span className={`business-badge business-badge-${bType.toLowerCase()}`}>
              {bIcon} {bType}
            </span>
          </div>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: 600 }}>{review.date}</span>
        </div>

        {/* Author & Stars */}
        <div style={{ marginBottom: '1.25rem', transform: "translateZ(10px)" }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 800 }}>{review.author}</h4>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', letterSpacing: '1px' }}>{review.platform?.toUpperCase() || review.source?.toUpperCase()}</span>
          </div>
          <div style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={14} fill={i < review.rating ? '#fbbf24' : 'rgba(255,255,255,0.05)'} stroke="none" />
            ))}
            <span style={{ fontSize: '0.8rem', color: ratingColor, marginLeft: '0.5rem', fontWeight: 900 }}>{review.rating}.0</span>
          </div>
        </div>

        {/* Categories Tags */}
        {review.categories && review.categories.length > 0 && (
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
            {review.categories.map(c => (
              <span key={c} style={{ fontSize: '0.65rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.03)', padding: '0.25rem 0.6rem', borderRadius: '2rem', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div style={{ width: 4, height: 4, borderRadius: '50%', background: bColor }} /> {c}
              </span>
            ))}
          </div>
        )}

        {/* Review Text */}
        <div style={{
          padding: '1.25rem',
          borderRadius: '1rem',
          background: 'rgba(0,0,0,0.3)',
          borderLeft: `3px solid ${bColor}`,
          marginBottom: '1.5rem',
          fontSize: '0.9rem',
          color: 'var(--text-sub)',
          lineHeight: 1.7,
          boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.2)'
        }}>
          "{review.content}"
        </div>

        {/* Action Area */}
        <div style={{ transform: "translateZ(20px)" }}>
          {isPublished ? (
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-card" style={{ padding: '1rem', background: 'rgba(16,185,129,0.05)', borderColor: 'rgba(16,185,129,0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10b981', marginBottom: '0.5rem' }}>
                <ShieldCheck size={16} /> <span style={{ fontWeight: 800, fontSize: '0.75rem', letterSpacing: '1px' }}>AI VERIFIED RESPONSE</span>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)' }}>{response}</p>
            </motion.div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto', paddingBottom: '2px' }}>
                {TONES.map(t => (
                  <button key={t} className={`tone-pill ${tone === t ? 'active' : ''}`} onClick={() => setTone(t)} style={{ whiteSpace: 'nowrap' }}>{t}</button>
                ))}
              </div>
              
              {!response ? (
                <button className="btn btn-primary" onClick={() => generateAIResponse()} style={{ height: '52px', background: `linear-gradient(135deg, ${bColor}, var(--primary-dark))` }}>
                  {isGenerating ? <Loader className="animate-spin" /> : <Zap size={16} />} GENERATE INTELLIGENT DRAFT
                </button>
              ) : (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <div style={{ position: 'relative', marginBottom: '0.75rem' }}>
                    <textarea className="input-field" style={{ minHeight: '130px', background: 'rgba(255,255,255,0.02)' }} value={response} onChange={handleTextChange} />
                    <span style={{ position: 'absolute', bottom: '0.5rem', right: '0.75rem', fontSize: '0.65rem', color: 'var(--text-dim)' }}>{charCount} CHARS</span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn btn-success" style={{ flex: 1 }} onClick={handlePublish}>PUBLISH RESPONSE</button>
                    <button className="btn btn-outline" style={{ width: '48px' }} onClick={() => generateAIResponse()}><RotateCcw size={16} /></button>
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
export default ReviewCard;

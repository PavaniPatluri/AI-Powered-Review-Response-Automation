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
        perspective: "1200px",
        background: 'rgba(22, 22, 42, 0.4)',
        borderRadius: '2rem'
      }}
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 1.2, 
        delay: index * 0.08,
        ease: [0.16, 1, 0.3, 1]
      }}
      className="review-card-3d"
    >
      {/* 3D Inner Content */}
      <div style={{ transform: "translateZ(40px)", padding: '2rem' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1.5px', background: `linear-gradient(90deg, transparent, var(--primary), transparent)`, opacity: 0.1, pointerEvents: 'none' }} />

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
            <span className={`badge badge-${review.sentiment?.toLowerCase()}`} style={{ border: 'none', background: 'rgba(167, 139, 250, 0.1)', color: 'var(--primary-light)' }}>{review.sentiment}</span>
            <span className="business-badge" style={{ background: 'rgba(255, 255, 255, 0.03)', color: 'var(--text-sub)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
              {bIcon} {bType}
            </span>
            {review.language_code && (
              <span className="badge" style={{ background: 'rgba(129, 140, 248, 0.05)', color: 'var(--primary-light)', opacity: 0.8, fontSize: '0.6rem', fontWeight: 900 }}>
                <Globe size={10} style={{ marginRight: '4px' }} /> {review.language_code.toUpperCase()}
              </span>
            )}
            {review.categories?.[0] && (
              <span className="badge" style={{ background: 'rgba(34, 211, 238, 0.05)', color: 'var(--accent-cyan)', opacity: 0.8, fontSize: '0.6rem', fontWeight: 900 }}>
                <Tag size={10} style={{ marginRight: '4px' }} /> {review.categories[0].toUpperCase()}
              </span>
            )}
          </div>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.5px' }}>{review.date}</span>
        </div>

        {/* Author & Stars */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <h4 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '-0.5px' }}>{review.author}</h4>
            <span style={{ fontSize: '0.65rem', color: 'var(--primary-light)', fontWeight: 800, opacity: 0.6 }}>{review.platform?.toUpperCase()}</span>
          </div>
          <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={15} fill={i < review.rating ? 'var(--primary)' : 'rgba(255,255,255,0.03)'} stroke="none" />
            ))}
            <span style={{ fontSize: '0.85rem', color: 'var(--primary-light)', marginLeft: '0.75rem', fontWeight: 900 }}>{review.rating}.0</span>
          </div>
        </div>

        {/* Review Text */}
        <div style={{
          padding: '1.5rem',
          borderRadius: '1.5rem',
          background: 'rgba(11, 11, 26, 0.4)',
          border: '1px solid rgba(255, 255, 255, 0.02)',
          marginBottom: '2rem',
          fontSize: '0.95rem',
          color: 'var(--text-sub)',
          lineHeight: 1.8,
          fontStyle: 'italic',
          letterSpacing: '0.01em'
        }}>
          "{review.content}"
        </div>

        {/* Action Area */}
        <div style={{ transform: "translateZ(25px)" }}>
          {isPublished ? (
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ padding: '1.5rem', background: 'rgba(167, 139, 250, 0.05)', borderRadius: '1.5rem', border: '1px solid rgba(167, 139, 250, 0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--primary)', marginBottom: '0.75rem' }}>
                <CheckCircle size={18} /> <span style={{ fontWeight: 900, fontSize: '0.7rem', letterSpacing: '2px' }}>AURA GENERATED</span>
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-sub)', lineHeight: 1.6 }}>{response}</p>
            </motion.div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '4px' }}>
                {TONES.map(t => (
                  <button key={t} className={`tone-pill ${tone === t ? 'active' : ''}`} onClick={() => setTone(t)} style={{ borderRadius: '2rem', padding: '0.4rem 1rem', fontSize: '0.7rem' }}>{t}</button>
                ))}
              </div>
              
              {!response ? (
                <button className="btn btn-primary" onClick={() => generateAIResponse()} style={{ height: '56px', borderRadius: '1.5rem', fontSize: '0.85rem', letterSpacing: '0.5px' }}>
                  {isGenerating ? <Loader className="animate-spin" /> : <Zap size={18} />} ANALYZE & DRAFT
                </button>
              ) : (
                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
                  <div style={{ position: 'relative', marginBottom: '1rem' }}>
                    <textarea className="input-field" style={{ minHeight: '140px', background: 'rgba(11, 11, 26, 0.5)', borderRadius: '1.5rem', padding: '1.25rem' }} value={response} onChange={handleTextChange} />
                    <span style={{ position: 'absolute', bottom: '1rem', right: '1.25rem', fontSize: '0.65rem', color: 'var(--text-dim)', fontWeight: 700 }}>{charCount} CHARS</span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button className="btn btn-primary" style={{ flex: 1, borderRadius: '1.5rem', height: '52px' }} onClick={handlePublish}>PUBLISH</button>
                    <button className="btn btn-outline" style={{ width: '52px', height: '52px', borderRadius: '1.25rem' }} onClick={() => generateAIResponse()}><RotateCcw size={18} /></button>
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

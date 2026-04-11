const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws/live-reviews';

export const fetchReviews = async () => {
  const res = await fetch(`${BASE_URL}/reviews`);
  if (!res.ok) throw new Error('Failed to fetch reviews');
  return res.json();
};

export const fetchPrompts = async () => {
  const res = await fetch(`${BASE_URL}/prompts`);
  if (!res.ok) throw new Error('Failed to fetch prompts');
  return res.json();
};

export const updatePrompts = async (prompts) => {
  const res = await fetch(`${BASE_URL}/prompts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(prompts)
  });
  if (!res.ok) throw new Error('Failed to update prompts');
  return res.json();
};

export const analyzeReview = async (content, tone = 'Professional', businessType = 'Restaurant') => {
  const res = await fetch(`${BASE_URL}/analyze-review`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content, tone, business_type: businessType })
  });
  if (!res.ok) throw new Error('Failed to analyze review');
  return res.json();
};

export const fetchTrends = async () => {
  const res = await fetch(`${BASE_URL}/trends`);
  if (!res.ok) throw new Error('Failed to fetch trends');
  return res.json();
};

export const searchReviews = async (query, filters = {}) => {
  const res = await fetch(`${BASE_URL}/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, filters })
  });
  if (!res.ok) throw new Error('Search failed');
  return res.json();
};

export const fetchRealtimeReview = async () => {
  const res = await fetch(`${BASE_URL}/realtime/review`);
  if (!res.ok) throw new Error('Failed to fetch realtime review');
  return res.json();
};

export const fetchProfiles = async () => {
  const res = await fetch(`${BASE_URL}/profiles`);
  if (!res.ok) throw new Error('Failed to fetch profiles');
  return res.json();
};

export const updateProfiles = async (profiles) => {
  const res = await fetch(`${BASE_URL}/profiles`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profiles)
  });
  if (!res.ok) throw new Error('Failed to update profiles');
  return res.json();
};

export const fetchProfile = async () => {
  const res = await fetch(`${BASE_URL}/profile`);
  if (!res.ok) throw new Error('Failed to fetch profile');
  return res.json();
};

export const fetchRules = async () => {
  const res = await fetch(`${BASE_URL}/rules`);
  if (!res.ok) throw new Error('Failed to fetch rules');
  return res.json();
};

export const updateRules = async (rules) => {
  const res = await fetch(`${BASE_URL}/rules`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(rules)
  });
  if (!res.ok) throw new Error('Failed to update rules');
  return res.json();
};

export const fetchSystemConfig = async () => {
  const res = await fetch(`${BASE_URL}/config/system`);
  if (!res.ok) throw new Error('Failed to fetch system config');
  return res.json();
};

export const updateSystemConfig = async (config) => {
  const res = await fetch(`${BASE_URL}/config/system`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config)
  });
  if (!res.ok) throw new Error('Failed to update system config');
  return res.json();
};

export const EXPORT_REVIEWS_URL = `${BASE_URL}/export`;
export { WS_URL };

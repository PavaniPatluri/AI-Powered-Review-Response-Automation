const isProd = import.meta.env.PROD;
const BASE_URL = import.meta.env.VITE_API_URL || (isProd ? '/api' : 'http://localhost:8000');
const WS_URL = import.meta.env.VITE_WS_URL || (isProd 
  ? `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/api/ws/live-reviews` 
  : 'ws://localhost:8000/ws/live-reviews');

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

// ─── Authentication (WebAuthn) ───────────────────────────────────────────────

const bufferToBase64 = (buffer) => {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
};

const base64ToBuffer = (base64) => {
  const binary = atob(base64.replace(/-/g, '+').replace(/_/g, '/'));
  const buffer = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) buffer[i] = binary.charCodeAt(i);
  return buffer.buffer;
};

export const getAuthRegistrationOptions = async (email) => {
  const res = await fetch(`${BASE_URL}/auth/register/options`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
  if (!res.ok) throw new Error('Failed to get registration options');
  const data = await res.json();
  
  // Prepare options for navigator.credentials.create
  data.options.user.id = base64ToBuffer(data.options.user.id);
  data.options.challenge = base64ToBuffer(data.options.challenge);
  if (data.options.excludeCredentials) {
    data.options.excludeCredentials.forEach(c => c.id = base64ToBuffer(c.id));
  }
  return data;
};

export const verifyAuthRegistration = async (email, credential, sessionId) => {
  const credentialJSON = {
    id: credential.id,
    rawId: bufferToBase64(credential.rawId),
    type: credential.type,
    response: {
      attestationObject: bufferToBase64(credential.response.attestationObject),
      clientDataJSON: bufferToBase64(credential.response.clientDataJSON),
    }
  };

  const res = await fetch(`${BASE_URL}/auth/register/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, registration_response: credentialJSON, session_id: sessionId })
  });
  if (!res.ok) throw new Error('Registration verification failed');
  return res.json();
};

export const getAuthLoginOptions = async (email) => {
  const res = await fetch(`${BASE_URL}/auth/login/options`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || 'Failed to get login options');
  }
  const data = await res.json();
  
  // Prepare options for navigator.credentials.get
  data.options.challenge = base64ToBuffer(data.options.challenge);
  if (data.options.allowCredentials) {
    data.options.allowCredentials.forEach(c => c.id = base64ToBuffer(c.id));
  }
  return data;
};

export const verifyAuthLogin = async (email, credential, sessionId) => {
  const credentialJSON = {
    id: credential.id,
    rawId: bufferToBase64(credential.rawId),
    type: credential.type,
    response: {
      authenticatorData: bufferToBase64(credential.response.authenticatorData),
      clientDataJSON: bufferToBase64(credential.response.clientDataJSON),
      signature: bufferToBase64(credential.response.signature),
      userHandle: credential.response.userHandle ? bufferToBase64(credential.response.userHandle) : null,
    }
  };

  const res = await fetch(`${BASE_URL}/auth/login/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, auth_response: credentialJSON, session_id: sessionId })
  });
  if (!res.ok) throw new Error('Login verification failed');
  return res.json();
};

export const EXPORT_REVIEWS_URL = `${BASE_URL}/export`;
export { WS_URL };

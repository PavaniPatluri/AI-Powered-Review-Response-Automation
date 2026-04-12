-- REVIEW CATALYST DATABASE SCHEMA
-- Run this in your Supabase SQL Editor

-- 1. Business Profiles
CREATE TABLE IF NOT EXISTS profiles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT,
  address TEXT,
  contact TEXT,
  specialties JSONB DEFAULT '[]',
  tone TEXT DEFAULT 'Professional',
  auto_respond BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Authentication
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS webauthn_credentials (
  id TEXT PRIMARY KEY, -- credential_id (base64)
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  public_key TEXT NOT NULL, -- public_key (base64)
  sign_count INTEGER DEFAULT 0,
  transports JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed a default admin user for initial biometric linking
INSERT INTO users (id, email, display_name) 
VALUES ('00000000-0000-4000-a000-000000000000', 'admin@neuralnexus.ai', 'Nexus Admin')
ON CONFLICT (email) DO NOTHING;

-- 2. AI Prompts
CREATE TABLE IF NOT EXISTS prompts (
  id SERIAL PRIMARY KEY,
  tone TEXT UNIQUE NOT NULL,
  system_prompt TEXT NOT NULL,
  examples JSONB DEFAULT '[]',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Automation Rules
CREATE TABLE IF NOT EXISTS rules (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  enabled BOOLEAN DEFAULT true,
  rating_min INTEGER DEFAULT 0,
  sentiment_match JSONB DEFAULT '[]',
  keyword_match JSONB DEFAULT '[]',
  category_match JSONB DEFAULT '[]',
  tone TEXT DEFAULT 'Professional',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Reviews Feed
CREATE TABLE IF NOT EXISTS reviews (
  id TEXT PRIMARY KEY,
  author TEXT NOT NULL,
  rating INTEGER NOT NULL,
  content TEXT NOT NULL,
  date TEXT,
  source TEXT,
  sentiment TEXT,
  language TEXT,
  language_code TEXT,
  categories JSONB DEFAULT '[]',
  business_type TEXT,
  platform TEXT,
  status TEXT DEFAULT 'Pending',
  is_new BOOLEAN DEFAULT true,
  profile_id TEXT REFERENCES profiles(id),
  drafted_response TEXT,
  ai_tone TEXT,
  matched_rule TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. System Config
CREATE TABLE IF NOT EXISTS config (
  id TEXT PRIMARY KEY DEFAULT 'main',
  gemini_api_key TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Realtime for reviews table
ALTER PUBLICATION supabase_realtime ADD TABLE reviews;
ALTER TABLE reviews REPLICA IDENTITY FULL;

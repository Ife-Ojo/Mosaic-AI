-- ==============================================================================
-- LinguaLearn / Mosaic AI: Notes Exchange Schema & Row Level Security (RLS)
-- ==============================================================================
-- Run this migration in your Supabase SQL Editor (Dashboard -> SQL Editor -> New Query).

-- Enable UUID generation extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. PROFILES TABLE
-- Stores student user profiles linked to Supabase Auth users.
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- 2. SHARED_NOTES TABLE
-- Stores study notes published by students for discovery in the exchange.
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.shared_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  subject TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'en',
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Indexes for efficient filtering and searching
CREATE INDEX IF NOT EXISTS idx_shared_notes_subject ON public.shared_notes(subject);
CREATE INDEX IF NOT EXISTS idx_shared_notes_language ON public.shared_notes(language);
CREATE INDEX IF NOT EXISTS idx_shared_notes_created_at ON public.shared_notes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_shared_notes_author ON public.shared_notes(author_id);

-- ------------------------------------------------------------------------------
-- 3. SAVED_NOTES TABLE
-- Join table tracking which notes a student has saved to their personal library.
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.saved_notes (
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  note_id UUID NOT NULL REFERENCES public.shared_notes(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  PRIMARY KEY (user_id, note_id)
);

CREATE INDEX IF NOT EXISTS idx_saved_notes_user_id ON public.saved_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_notes_note_id ON public.saved_notes(note_id);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Strict isolation ensuring notes can be read publicly, but only modified by authors,
-- and saved records can only be accessed by the saving user.
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shared_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_notes ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- PROFILES POLICIES
-- ------------------------------------------------------------------------------
-- Anyone (anon and authenticated) can view student profiles to display author names on notes
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" 
  ON public.profiles FOR SELECT 
  USING (true);

-- Users can insert their own profile
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" 
  ON public.profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Users can update their own profile
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

-- ------------------------------------------------------------------------------
-- SHARED_NOTES POLICIES
-- ------------------------------------------------------------------------------
-- Anyone can discover and read published shared notes
DROP POLICY IF EXISTS "Shared notes are viewable by everyone" ON public.shared_notes;
CREATE POLICY "Shared notes are viewable by everyone" 
  ON public.shared_notes FOR SELECT 
  USING (true);

-- Authenticated users can publish notes with themselves as author
DROP POLICY IF EXISTS "Authenticated users can create shared notes" ON public.shared_notes;
CREATE POLICY "Authenticated users can create shared notes" 
  ON public.shared_notes FOR INSERT 
  WITH CHECK (auth.uid() = author_id);

-- Authors can update their own notes
DROP POLICY IF EXISTS "Authors can update their own shared notes" ON public.shared_notes;
CREATE POLICY "Authors can update their own shared notes" 
  ON public.shared_notes FOR UPDATE 
  USING (auth.uid() = author_id);

-- Authors can delete their own notes
DROP POLICY IF EXISTS "Authors can delete their own shared notes" ON public.shared_notes;
CREATE POLICY "Authors can delete their own shared notes" 
  ON public.shared_notes FOR DELETE 
  USING (auth.uid() = author_id);

-- ------------------------------------------------------------------------------
-- SAVED_NOTES POLICIES
-- ------------------------------------------------------------------------------
-- Users can only view their own saved note records
DROP POLICY IF EXISTS "Users can view their own saved notes" ON public.saved_notes;
CREATE POLICY "Users can view their own saved notes" 
  ON public.saved_notes FOR SELECT 
  USING (auth.uid() = user_id);

-- Users can save notes for themselves
DROP POLICY IF EXISTS "Users can save notes for themselves" ON public.saved_notes;
CREATE POLICY "Users can save notes for themselves" 
  ON public.saved_notes FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Users can unsave/delete their own saved note records
DROP POLICY IF EXISTS "Users can unsave their own saved notes" ON public.saved_notes;
CREATE POLICY "Users can unsave their own saved notes" 
  ON public.saved_notes FOR DELETE 
  USING (auth.uid() = user_id);

-- ==============================================================================
-- OPTIONAL HELPER FUNCTION: AUTO-CREATE PROFILE ON USER SIGNUP
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NULL)
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to execute when a new user signs up in auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

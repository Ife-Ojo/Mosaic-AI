-- ==============================================================================
-- LinguaLearn / Mosaic AI: Notes Exchange Schema & Row Level Security (RLS)
-- ==============================================================================
-- See supabase/migrations/20261009000001_notes_exchange.sql for versioned history.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Shared Notes Table
CREATE TABLE IF NOT EXISTS public.shared_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  subject TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'en',
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_shared_notes_subject ON public.shared_notes(subject);
CREATE INDEX IF NOT EXISTS idx_shared_notes_language ON public.shared_notes(language);
CREATE INDEX IF NOT EXISTS idx_shared_notes_created_at ON public.shared_notes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_shared_notes_author ON public.shared_notes(author_id);

-- 3. Saved Notes Table
CREATE TABLE IF NOT EXISTS public.saved_notes (
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  note_id UUID NOT NULL REFERENCES public.shared_notes(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  PRIMARY KEY (user_id, note_id)
);

CREATE INDEX IF NOT EXISTS idx_saved_notes_user_id ON public.saved_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_notes_note_id ON public.saved_notes(note_id);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shared_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_notes ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Shared Notes Policies
DROP POLICY IF EXISTS "Shared notes are viewable by everyone" ON public.shared_notes;
CREATE POLICY "Shared notes are viewable by everyone" ON public.shared_notes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can create shared notes" ON public.shared_notes;
CREATE POLICY "Authenticated users can create shared notes" ON public.shared_notes FOR INSERT WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "Authors can update their own shared notes" ON public.shared_notes;
CREATE POLICY "Authors can update their own shared notes" ON public.shared_notes FOR UPDATE USING (auth.uid() = author_id);

DROP POLICY IF EXISTS "Authors can delete their own shared notes" ON public.shared_notes;
CREATE POLICY "Authors can delete their own shared notes" ON public.shared_notes FOR DELETE USING (auth.uid() = author_id);

-- Saved Notes Policies
DROP POLICY IF EXISTS "Users can view their own saved notes" ON public.saved_notes;
CREATE POLICY "Users can view their own saved notes" ON public.saved_notes FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can save notes for themselves" ON public.saved_notes;
CREATE POLICY "Users can save notes for themselves" ON public.saved_notes FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can unsave their own saved notes" ON public.saved_notes;
CREATE POLICY "Users can unsave their own saved notes" ON public.saved_notes FOR DELETE USING (auth.uid() = user_id);

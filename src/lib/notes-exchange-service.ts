import { SharedNote, ShareNoteFormData, ExchangeFilterOptions } from '@/types/exchange';
import { SAMPLE_EXCHANGE_NOTES, DEMO_CONTRIBUTOR_PROFILE } from './sample-notes';
import { getSupabaseClient, isSupabaseConfigured } from './supabase/client';

const DEMO_SAVED_NOTES_KEY = 'mosaic_demo_saved_notes_v1';
const DEMO_USER_SHARED_NOTES_KEY = 'mosaic_demo_user_shared_notes_v1';

// Helper to access localStorage safely in browser
function getDemoSavedIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(DEMO_SAVED_NOTES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Error reading demo saved notes:', e);
    return [];
  }
}

function setDemoSavedIds(ids: string[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(DEMO_SAVED_NOTES_KEY, JSON.stringify(ids));
  } catch (e) {
    console.error('Error writing demo saved notes:', e);
  }
}

function getDemoUserSharedNotes(): SharedNote[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(DEMO_USER_SHARED_NOTES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Error reading demo user notes:', e);
    return [];
  }
}

function saveDemoUserSharedNote(note: SharedNote): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getDemoUserSharedNotes();
    localStorage.setItem(DEMO_USER_SHARED_NOTES_KEY, JSON.stringify([note, ...current]));
  } catch (e) {
    console.error('Error saving demo user note:', e);
  }
}

/**
 * Fetch notes with search and filters.
 * Returns notes and whether the system is running in demo mode.
 */
export async function fetchExchangeNotes(
  filters: ExchangeFilterOptions
): Promise<{ notes: SharedNote[]; isDemoMode: boolean; error?: string }> {
  const isDemo = !isSupabaseConfigured();

  if (isDemo) {
    // Demo Mode implementation
    const savedIds = new Set(getDemoSavedIds());
    const userNotes = getDemoUserSharedNotes();
    const allNotes: SharedNote[] = [...userNotes, ...SAMPLE_EXCHANGE_NOTES].map((n) => ({
      ...n,
      is_saved: savedIds.has(n.id),
    }));

    const filtered = filterAndSortNotes(allNotes, filters);
    return { notes: filtered, isDemoMode: true };
  }

  // Supabase Mode implementation
  const supabase = getSupabaseClient();
  if (!supabase) {
    // Fallback if client creation failed
    return { notes: filterAndSortNotes(SAMPLE_EXCHANGE_NOTES, filters), isDemoMode: true };
  }

  try {
    // 1. Fetch user session to determine saved states
    const { data: sessionData } = await supabase.auth.getSession();
    const currentUserId = sessionData?.session?.user?.id;

    // 2. Query shared notes with author profile
    let query = supabase
      .from('shared_notes')
      .select(`
        id,
        title,
        content,
        subject,
        language,
        author_id,
        created_at,
        profiles:author_id (
          id,
          display_name,
          avatar_url
        )
      `)
      .order('created_at', { ascending: false });

    if (filters.subject && filters.subject !== 'all') {
      query = query.eq('subject', filters.subject);
    }

    if (filters.language && filters.language !== 'all') {
      query = query.eq('language', filters.language);
    }

    const { data, error } = await query;

    if (error) {
      console.warn('Supabase query error, falling back to demo mode:', error.message);
      return { 
        notes: filterAndSortNotes(SAMPLE_EXCHANGE_NOTES, filters), 
        isDemoMode: true,
        error: `Database query notice: ${error.message}. Running in demo fallback.` 
      };
    }

    // 3. Fetch saved notes for current user if logged in
    let savedNoteIds = new Set<string>();
    if (currentUserId) {
      const { data: savedData } = await supabase
        .from('saved_notes')
        .select('note_id')
        .eq('user_id', currentUserId);
      if (savedData) {
        savedNoteIds = new Set(savedData.map((s) => s.note_id));
      }
    } else {
      // In unauthenticated Supabase mode, use session-only saves
      savedNoteIds = new Set(getDemoSavedIds());
    }

    // 4. Map records to SharedNote structure
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mapped: SharedNote[] = (data || []).map((row: any) => {
      const authorProfile = row.profiles
        ? {
            id: row.profiles.id,
            display_name: row.profiles.display_name,
            avatar_url: row.profiles.avatar_url,
          }
        : undefined;

      const words = (row.content || '').split(/\s+/).length;
      const readTime = Math.max(1, Math.ceil(words / 180));

      return {
        id: row.id,
        title: row.title,
        content: row.content,
        subject: row.subject,
        language: row.language,
        author_id: row.author_id,
        created_at: row.created_at,
        author: authorProfile,
        is_saved: savedNoteIds.has(row.id),
        read_time_minutes: readTime,
      };
    });

    const filtered = filterAndSortNotes(mapped, filters);
    return { notes: filtered, isDemoMode: false };
  } catch (err) {
    console.error('Failed to fetch from Supabase:', err);
    return {
      notes: filterAndSortNotes(SAMPLE_EXCHANGE_NOTES, filters),
      isDemoMode: true,
      error: 'Unable to reach Supabase database. Falling back to Demo Mode.',
    };
  }
}

/**
 * Filter and sort helper
 */
function filterAndSortNotes(notes: SharedNote[], filters: ExchangeFilterOptions): SharedNote[] {
  let result = [...notes];

  // Search filter
  if (filters.searchQuery.trim()) {
    const q = filters.searchQuery.toLowerCase().trim();
    result = result.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        n.subject.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q) ||
        (n.author?.display_name && n.author.display_name.toLowerCase().includes(q)) ||
        (n.tags && n.tags.some((t) => t.toLowerCase().includes(q)))
    );
  }

  // Subject filter
  if (filters.subject && filters.subject !== 'all') {
    result = result.filter((n) => n.subject.toLowerCase() === filters.subject.toLowerCase());
  }

  // Language filter
  if (filters.language && filters.language !== 'all') {
    result = result.filter((n) => n.language.toLowerCase() === filters.language.toLowerCase());
  }

  // Saved only filter
  if (filters.savedOnly) {
    result = result.filter((n) => n.is_saved);
  }

  // Sorting
  result.sort((a, b) => {
    switch (filters.sortBy) {
      case 'title':
        return a.title.localeCompare(b.title);
      case 'subject':
        return a.subject.localeCompare(b.subject);
      case 'oldest':
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      case 'newest':
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });

  return result;
}

/**
 * Toggle Save / Unsave
 */
export async function toggleSaveNote(
  noteId: string,
  save: boolean
): Promise<{ success: boolean; isDemoMode: boolean; error?: string }> {
  const isDemo = !isSupabaseConfigured();

  if (isDemo) {
    const current = getDemoSavedIds();
    let updated: string[];
    if (save) {
      updated = Array.from(new Set([...current, noteId]));
    } else {
      updated = current.filter((id) => id !== noteId);
    }
    setDemoSavedIds(updated);
    return { success: true, isDemoMode: true };
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return { success: false, isDemoMode: true, error: 'Database unavailable' };
  }

  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData?.session?.user?.id;

    if (!userId) {
      // In demo/unauthenticated session on Supabase
      const current = getDemoSavedIds();
      let updated: string[];
      if (save) {
        updated = Array.from(new Set([...current, noteId]));
      } else {
        updated = current.filter((id) => id !== noteId);
      }
      setDemoSavedIds(updated);
      return { success: true, isDemoMode: true };
    }

    if (save) {
      const { error } = await supabase
        .from('saved_notes')
        .insert({ user_id: userId, note_id: noteId });
      if (error && error.code !== '23505') { // 23505 = unique constraint violation
        throw error;
      }
    } else {
      const { error } = await supabase
        .from('saved_notes')
        .delete()
        .eq('user_id', userId)
        .eq('note_id', noteId);
      if (error) throw error;
    }

    return { success: true, isDemoMode: false };
  } catch (err: any) {
    console.error('Failed to toggle saved note:', err);
    // Fallback to session saves
    const current = getDemoSavedIds();
    const updated = save
      ? Array.from(new Set([...current, noteId]))
      : current.filter((id) => id !== noteId);
    setDemoSavedIds(updated);
    return { success: true, isDemoMode: true, error: err.message };
  }
}

/**
 * Publish a new shared note
 */
export async function createSharedNote(
  formData: ShareNoteFormData
): Promise<{ note: SharedNote; isDemoMode: boolean; error?: string }> {
  const isDemo = !isSupabaseConfigured();

  const words = formData.content.split(/\s+/).length;
  const readTime = Math.max(1, Math.ceil(words / 180));

  if (isDemo) {
    const newNote: SharedNote = {
      id: `sn-demo-${Date.now()}`,
      title: formData.title.trim(),
      content: formData.content.trim(),
      subject: formData.subject.trim(),
      language: formData.language,
      author_id: DEMO_CONTRIBUTOR_PROFILE.id,
      created_at: new Date().toISOString(),
      read_time_minutes: readTime,
      is_saved: false,
      is_demo_session: true,
      author: {
        id: DEMO_CONTRIBUTOR_PROFILE.id,
        display_name: formData.author_name?.trim() || DEMO_CONTRIBUTOR_PROFILE.display_name,
        avatar_url: null,
      },
    };

    saveDemoUserSharedNote(newNote);
    return { note: newNote, isDemoMode: true };
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error('Supabase client unavailable');
  }

  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData?.session?.user;

    if (!user) {
      // Unauthenticated demo fallback
      const newNote: SharedNote = {
        id: `sn-demo-${Date.now()}`,
        title: formData.title.trim(),
        content: formData.content.trim(),
        subject: formData.subject.trim(),
        language: formData.language,
        author_id: DEMO_CONTRIBUTOR_PROFILE.id,
        created_at: new Date().toISOString(),
        read_time_minutes: readTime,
        is_saved: false,
        is_demo_session: true,
        author: {
          id: DEMO_CONTRIBUTOR_PROFILE.id,
          display_name: formData.author_name?.trim() || DEMO_CONTRIBUTOR_PROFILE.display_name,
          avatar_url: null,
        },
      };
      saveDemoUserSharedNote(newNote);
      return { note: newNote, isDemoMode: true };
    }

    // Ensure profile exists for this user
    await supabase.from('profiles').upsert({
      id: user.id,
      display_name: formData.author_name?.trim() || user.email?.split('@')[0] || 'Student Contributor',
    });

    const { data, error } = await supabase
      .from('shared_notes')
      .insert({
        title: formData.title.trim(),
        content: formData.content.trim(),
        subject: formData.subject.trim(),
        language: formData.language,
        author_id: user.id,
      })
      .select(`
        id,
        title,
        content,
        subject,
        language,
        author_id,
        created_at,
        profiles:author_id (
          id,
          display_name,
          avatar_url
        )
      `)
      .single();

    if (error) throw error;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const createdRow: any = data;
    const authorProfile = createdRow.profiles
      ? {
          id: createdRow.profiles.id,
          display_name: createdRow.profiles.display_name,
          avatar_url: createdRow.profiles.avatar_url,
        }
      : undefined;

    const createdNote: SharedNote = {
      id: createdRow.id,
      title: createdRow.title,
      content: createdRow.content,
      subject: createdRow.subject,
      language: createdRow.language,
      author_id: createdRow.author_id,
      created_at: createdRow.created_at,
      author: authorProfile,
      read_time_minutes: readTime,
      is_saved: false,
    };

    return { note: createdNote, isDemoMode: false };
  } catch (err: any) {
    console.error('Error inserting note to Supabase:', err);
    // Fallback to local session save
    const fallbackNote: SharedNote = {
      id: `sn-demo-${Date.now()}`,
      title: formData.title.trim(),
      content: formData.content.trim(),
      subject: formData.subject.trim(),
      language: formData.language,
      author_id: DEMO_CONTRIBUTOR_PROFILE.id,
      created_at: new Date().toISOString(),
      read_time_minutes: readTime,
      is_saved: false,
      is_demo_session: true,
      author: {
        id: DEMO_CONTRIBUTOR_PROFILE.id,
        display_name: formData.author_name?.trim() || DEMO_CONTRIBUTOR_PROFILE.display_name,
        avatar_url: null,
      },
    };
    saveDemoUserSharedNote(fallbackNote);
    return { note: fallbackNote, isDemoMode: true, error: err.message };
  }
}

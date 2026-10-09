export interface ExchangeProfile {
  id: string;
  display_name: string;
  avatar_url?: string | null;
  created_at?: string;
}

export interface SharedNote {
  id: string;
  title: string;
  content: string;
  subject: string;
  language: string;
  author_id: string;
  created_at: string;
  author?: ExchangeProfile;
  is_saved?: boolean;
  tags?: string[];
  read_time_minutes?: number;
  is_demo_session?: boolean;
}

export interface SavedNote {
  user_id: string;
  note_id: string;
  created_at: string;
}

export interface ShareNoteFormData {
  title: string;
  subject: string;
  language: string;
  content: string;
  author_name?: string;
}

export interface ExchangeFilterOptions {
  searchQuery: string;
  subject: string;
  language: string;
  savedOnly: boolean;
  sortBy: 'newest' | 'oldest' | 'title' | 'subject';
}

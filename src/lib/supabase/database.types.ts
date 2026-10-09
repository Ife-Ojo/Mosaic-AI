export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string;
          avatar_url: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          display_name: string;
          avatar_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string;
          avatar_url?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      shared_notes: {
        Row: {
          id: string;
          title: string;
          content: string;
          subject: string;
          language: string;
          author_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          content: string;
          subject: string;
          language?: string;
          author_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          content?: string;
          subject?: string;
          language?: string;
          author_id?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "shared_notes_author_id_fkey";
            columns: ["author_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      saved_notes: {
        Row: {
          user_id: string;
          note_id: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          note_id: string;
          created_at?: string;
        };
        Update: {
          user_id?: string;
          note_id?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "saved_notes_note_id_fkey";
            columns: ["note_id"];
            isOneToOne: false;
            referencedRelation: "shared_notes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "saved_notes_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

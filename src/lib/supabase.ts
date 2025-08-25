import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          password_hash: string;
          is_admin: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          full_name: string;
          password_hash: string;
          is_admin?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string;
          password_hash?: string;
          is_admin?: boolean;
          created_at?: string;
        };
      };
      moods: {
        Row: {
          id: string;
          user_id: string;
          mood: 'stressed' | 'tired' | 'focused' | 'happy';
          note: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          mood: 'stressed' | 'tired' | 'focused' | 'happy';
          note?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          mood?: 'stressed' | 'tired' | 'focused' | 'happy';
          note?: string;
          created_at?: string;
        };
      };
      password_reset_tokens: {
        Row: {
          id: string;
          user_id: string;
          token: string;
          expires_at: string;
          used: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          token: string;
          expires_at: string;
          used?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          token?: string;
          expires_at?: string;
          used?: boolean;
          created_at?: string;
        };
      };
    };
  };
};
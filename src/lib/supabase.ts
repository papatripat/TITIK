import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Only create client if we have valid config
let supabase: SupabaseClient;

if (supabaseUrl && supabaseUrl.startsWith('http')) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
} else {
  // Create a dummy client that won't crash at build time
  // but will show clear errors at runtime
  supabase = createClient('https://placeholder.supabase.co', 'placeholder');
  if (typeof window !== 'undefined') {
    console.warn('[TITIK] Supabase not configured. Please set NEXT_PUBLIC_SUPABASE_URL in .env.local');
  }
}

export { supabase };

export type Report = {
  id: string;
  image_url: string;
  latitude: number;
  longitude: number;
  severity: 1 | 2 | 3;
  waste_type: 'plastic' | 'organic' | 'mixed';
  confidence: number;
  created_at: string;
};

import { createClient } from '@supabase/supabase-js';

// Default Supabase project credentials provided by user
const DEFAULT_SUPABASE_URL = 'https://trytwqpigfswkumpbfrp.supabase.co';
const DEFAULT_SUPABASE_KEY = 'sb_publishable_WsYAe5vdbfBKWlKtfbqUgQ_Lls3tbbF';

export const supabaseUrl: string =
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_SUPABASE_URL) ||
  DEFAULT_SUPABASE_URL;

export const supabaseAnonKey: string =
  (typeof import.meta !== 'undefined' &&
    ((import.meta as any).env?.VITE_SUPABASE_PUBLISHABLE_KEY || (import.meta as any).env?.VITE_SUPABASE_ANON_KEY)) ||
  DEFAULT_SUPABASE_KEY;

// Create and export singleton Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
});

/**
 * Utility to test active connectivity to Supabase
 */
export async function testSupabaseConnection(): Promise<{ ok: boolean; message: string; details?: any }> {
  try {
    const { data, error } = await supabase.from('projects').select('count', { count: 'exact', head: true });
    if (error) {
      // If table doesn't exist yet, Supabase is still reachable!
      if (error.code === '42P01' || error.message.includes('relation') || error.message.includes('does not exist')) {
        return {
          ok: true,
          message: 'Terhubung ke Supabase! (Tabel belum dibuat di Supabase, gunakan tombol Buat Skema/SQL)',
          details: error
        };
      }
      return {
        ok: false,
        message: `Koneksi Supabase gagal: ${error.message} (${error.code || 'ERR'})`,
        details: error
      };
    }
    return {
      ok: true,
      message: 'Koneksi Supabase Aktif & Siap Digunakan!',
      details: data
    };
  } catch (err: any) {
    return {
      ok: false,
      message: `Error koneksi: ${err?.message || 'Tidak dapat menghubungi server Supabase'}`,
      details: err
    };
  }
}

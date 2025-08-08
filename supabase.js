// Supabase client initialization and helpers
// Configure via CONFIG.SUPABASE_URL and CONFIG.SUPABASE_ANON_KEY in config.js

let supabase = null;

function initSupabase() {
  if (!window.CONFIG || !window.CONFIG.SUPABASE_URL || !window.CONFIG.SUPABASE_ANON_KEY) {
    console.warn('Supabase not configured (SUPABASE_URL / SUPABASE_ANON_KEY). Falling back to local API.');
    return null;
  }
  // Load supabase-js from CDN if not already loaded
  if (!window.supabase) {
    console.error('supabase-js not loaded. Ensure <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script> is included.');
    return null;
  }
  supabase = window.supabase.createClient(window.CONFIG.SUPABASE_URL, window.CONFIG.SUPABASE_ANON_KEY);
  return supabase;
}

async function sbInsert(table, payload) {
  if (!supabase) initSupabase();
  if (!supabase) throw new Error('Supabase client not available');
  const { data, error } = await supabase.from(table).insert(payload).select();
  if (error) throw error;
  return data;
}

async function sbSelect(table, columns = '*') {
  if (!supabase) initSupabase();
  if (!supabase) throw new Error('Supabase client not available');
  const { data, error } = await supabase.from(table).select(columns);
  if (error) throw error;
  return data;
}

window.initSupabase = initSupabase;
window.sbInsert = sbInsert;
window.sbSelect = sbSelect;


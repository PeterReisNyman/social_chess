// Configuration for Social Chess frontend

// Build-time default for local API endpoint
const APPS_SCRIPT_URL = '/api';

const CONFIG = {
    SHEETS: {
        TASKS: 'Tasks',
        CONTACTS: 'Contacts',
        PROJECTS: 'Projects',
        COMPANIES: 'Companies',
        INTERACTIONS: 'Interactions',
        RELATIONSHIPS: 'Relationships',
        CAPITAL_SCORES: 'CapitalScores',
        GAME_STATES: 'GameStates',
        DASHBOARD: 'Dashboard'
    },
    APPS_SCRIPT_URL: APPS_SCRIPT_URL,
    // These can be injected by the server from environment via window.__ENV__ in index.html (see server.js)
    // If left empty here and __ENV__ exists, they will be set from there.
    SUPABASE_URL: (window.__ENV__ && window.__ENV__.SUPABASE_URL) || '',
    SUPABASE_ANON_KEY: (window.__ENV__ && window.__ENV__.SUPABASE_ANON_KEY) || ''
};

function buildApiUrl(sheetName, params = {}) {
    const url = new URL(CONFIG.APPS_SCRIPT_URL, window.location.origin);
    url.searchParams.set('sheet', sheetName);
    Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
    return url.toString();
}

window.CONFIG = CONFIG;
window.buildApiUrl = buildApiUrl;

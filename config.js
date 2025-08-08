// Configuration for Social Chess frontend

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
    // Set these to enable Supabase. If left empty, app falls back to local API.
    SUPABASE_URL: '',
    SUPABASE_ANON_KEY: ''
};

function buildApiUrl(sheetName, params = {}) {
    const url = new URL(CONFIG.APPS_SCRIPT_URL, window.location.origin);
    url.searchParams.set('sheet', sheetName);
    Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
    return url.toString();
}

window.CONFIG = CONFIG;
window.buildApiUrl = buildApiUrl;

// Configuration for Social Chess frontend

// Build-time default for local API endpoint
const APPS_SCRIPT_URL = '/api';
// Default backend NestJS API base (override via window.__ENV__.BACKEND_API_URL)
const BACKEND_API_URL = (window.__ENV__ && window.__ENV__.BACKEND_API_URL) || 'http://localhost:3001/api';

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
    BACKEND_API_URL: BACKEND_API_URL,
    // Backend-only Supabase. No client Supabase config needed anymore.
};

function buildApiUrl(sheetName, params = {}) {
    const url = new URL(CONFIG.APPS_SCRIPT_URL, window.location.origin);
    url.searchParams.set('sheet', sheetName);
    Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
    return url.toString();
}

function backend(endpoint) {
    const base = CONFIG.BACKEND_API_URL;
    return `${base.replace(/\/$/, '')}/${endpoint.replace(/^\//, '')}`;
}

window.CONFIG = CONFIG;
window.buildApiUrl = buildApiUrl;
window.backend = backend;

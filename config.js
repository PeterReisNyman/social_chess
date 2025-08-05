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
    APPS_SCRIPT_URL: APPS_SCRIPT_URL
};

function buildApiUrl(sheetName, params = {}) {
    const url = new URL(CONFIG.APPS_SCRIPT_URL, window.location.origin);
    url.searchParams.set('sheet', sheetName);
    Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
    return url.toString();
}

window.CONFIG = CONFIG;
window.buildApiUrl = buildApiUrl;

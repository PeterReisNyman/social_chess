// Updated Configuration file for Social Chess - Pointing to Test Sheets

// IMPORTANT: Your Google Apps Script Web App URL.
// This should be the actual URL you got after deploying the Google Apps Script.
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx5Uh7Zm2CWXLoWktVNuyRKXY2dDbm8hmd-sIUfz01JK0T47csFjZOt97bwfGv0xEnDSQ/exec'; // This is the URL you provided

const CONFIG = {
    // The SPREADSHEET_ID is still needed by the Apps Script on the backend.
    SPREADSHEET_ID: '1xXNfUx7PKurZ_Ysk-6dN0teYtj-fX8t6husVBN7WmRc',

    // --- USING TEST SHEETS ---
    // These sheet names now point to your newly created temporary sheets.
    SHEETS: {
        TASKS: 'Tasks', // Assuming 'Tasks' is okay as is, or create 'Test_Tasks' and update here if needed.
        CONTACTS: 'Test_Contacts',         // Changed to Test_Contacts
        PROJECTS: 'Test_Projects',         // Changed to Test_Projects
        COMPANIES: 'Companies',          // Assuming 'Companies' is okay as is, or create 'Test_Companies'.
        INTERACTIONS: 'Interactions',      // If you have this sheet, consider if a Test_Interactions is needed.
        RELATIONSHIPS: 'Test_Relationships', // Changed to Test_Relationships
        CAPITAL_SCORES: 'Test_CapitalScores',// Changed to Test_CapitalScores
        GAME_STATES: 'GameStates'          // If you have this, consider if a Test_GameStates is needed.
    },

    APPS_SCRIPT_URL: APPS_SCRIPT_URL // Making APPS_SCRIPT_URL available via CONFIG object
};

// Expose CONFIG to be used by other scripts if they are not modules.
window.CONFIG = CONFIG;


// Updated Form handling functionality for Social Chess

// APPS_SCRIPT_URL is now expected to be defined globally by config.js
// For example: window.CONFIG.APPS_SCRIPT_URL

// --- Toast Notification Function (Moved here for better organization if not already global) ---
function showToast(title, message, type = 'success') {
    const toastEl = document.getElementById('toast-notification'); // Using the new toast ID from index.html
    const toastMessageEl = document.getElementById('toast-message'); // Using the new toast message ID

    if (toastEl && toastMessageEl) {
        // Clear previous Tailwind classes
        toastEl.classList.remove('bg-green-500', 'bg-red-500', 'bg-yellow-500', 'translate-x-full', 'opacity-0');
        toastEl.classList.add('hidden'); // Hide it first

        toastMessageEl.textContent = message; // Set message (title is part of the message now or could be added)

        if (type === 'success') {
            toastEl.classList.add('bg-green-500');
        } else if (type === 'danger') {
            toastEl.classList.add('bg-red-500');
        } else if (type === 'warning') {
            toastEl.classList.add('bg-yellow-500');
        } else {
            toastEl.classList.add('bg-gray-700'); // Default for other types
        }
        
        // Show toast
        toastEl.classList.remove('hidden', 'translate-x-full', 'opacity-0');
        toastEl.classList.add('transform', 'translate-x-0', 'opacity-100');


        // Hide toast after 3 seconds
        setTimeout(() => {
            toastEl.classList.remove('translate-x-0', 'opacity-100');
            toastEl.classList.add('translate-x-full', 'opacity-0');
            setTimeout(() => toastEl.classList.add('hidden'), 300); // Fully hide after transition
        }, 3000);
    } else {
        console.warn("Toast elements not found. Ensure #toast-notification and #toast-message exist.");
        // Fallback to alert if toast elements are not found (though this should be avoided)
        alert(`${title}: ${message}`);
    }
}


// --- Form Initialization and Dropdown Population ---
document.addEventListener('DOMContentLoaded', function() {
    loadModals().then(() => { // Ensure modals are loaded before setting up handlers
        setupFormHandlers();
        populateFormDropdowns(); // This might need to be called after specific modals are shown or data is ready
        setupModalOpeners(); // For the new dashboard dropdown
        setupCsvImporters();
    });
});

async function loadModals() {
    const modalContainer = document.getElementById('modal-container');
    if (!modalContainer || modalContainer.querySelector('#addTaskModal')) { // Check if modals already loaded in container
        // console.log("Modals seem to be already loaded or container not found.");
        return;
    }
    
    try {
        const response = await fetch('modals.html');
        if (!response.ok) {
            throw new Error(`Failed to load modals.html: ${response.status} ${response.statusText}`);
        }
        const modalHTML = await response.text();
        modalContainer.innerHTML = modalHTML; // Inject into the container
        // console.log("Modals loaded into #modal-container.");

        // Initialize Bootstrap modals if Bootstrap is loaded
        if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
            document.querySelectorAll('.modal').forEach(modalEl => {
                // This just ensures they are known to Bootstrap, showing is handled by buttons
                new bootstrap.Modal(modalEl); 
            });
        }

    } catch (error) {
        console.error('Error loading modals:', error);
        showToast('Error', 'Could not load modal forms. Please refresh.', 'danger');
    }
}

function setupModalOpeners() {
    // This function is for the "Add New" dropdown in the new index.html
    document.querySelectorAll('.open-modal-btn').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const modalId = this.getAttribute('data-modal-target');
            const modalElement = document.getElementById(modalId);
            const addNewDropdown = document.getElementById('add-new-dropdown');

            if (modalElement && typeof bootstrap !== 'undefined' && bootstrap.Modal) {
                const modal = bootstrap.Modal.getInstance(modalElement) || new bootstrap.Modal(modalElement);
                modal.show();
                if (addNewDropdown) addNewDropdown.classList.add('hidden');
            } else {
                console.error('Modal or Bootstrap not found for target:', modalId);
                showToast('Error', `Could not open form: ${modalId}.`, 'danger');
            }
        });
    });
}


function setupFormHandlers() {
    // Helper to attach event listener if form exists
    const addSubmitHandler = (formId, handlerFn) => {
        // Modals are loaded dynamically, so we might need to wait or use event delegation.
        // For now, assuming they are in the DOM when this runs after loadModals.
        const form = document.getElementById(formId);
        if (form) {
            form.addEventListener('submit', handlerFn);
        } else {
            // console.warn(`Form with ID ${formId} not found during setupFormHandlers.`);
        }
    };

    addSubmitHandler('addTaskForm', handleTaskSubmit);
    addSubmitHandler('addContactForm', handleContactSubmit);
    addSubmitHandler('addProjectForm', handleProjectSubmit);
    addSubmitHandler('addCompanyForm', handleCompanySubmit);
}

async function populateFormDropdowns() {
    // Populate dropdowns from Supabase if configured, otherwise from local API
    let allData = {};
    try {
        if (window.CONFIG && window.CONFIG.SUPABASE_URL && window.CONFIG.SUPABASE_ANON_KEY && window.initSupabase && window.initSupabase()) {
            const [companies, projects, contacts] = await Promise.all([
                window.sbSelect('companies'),
                window.sbSelect('projects'),
                window.sbSelect('contacts')
            ]);
            allData = { companies, projects, contacts };
        } else {
            if (!window.CONFIG || !window.CONFIG.APPS_SCRIPT_URL) throw new Error('No data source configured');
            const response = await fetch(`${window.CONFIG.APPS_SCRIPT_URL}?action=getAllData`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const result = await response.json();
            if (!result.success || !result.data) throw new Error(result.message || 'Unknown error');
            allData = result.data;
        }

        // Populate company dropdowns (e.g., in Add Task, Add Project forms)
        const companySelects = document.querySelectorAll('select[name="company"], select[name="organization"]');
        const companies = allData.companies || [];
        companySelects.forEach(select => {
            // Clear existing options except the first placeholder
            while (select.options.length > 1) select.remove(1);
            companies.forEach(company => {
                const name = company.Name || company.name;
                if (name) {
                    const option = new Option(name, name);
                    select.add(option);
                }
            });
        });

        // Populate project dropdowns (e.g., in Add Task form)
        const projectSelects = document.querySelectorAll('select[name="project"]');
        const projects = allData.projects || [];
        projectSelects.forEach(select => {
            while (select.options.length > 1) select.remove(1);
            projects.forEach(project => {
                const name = project.Name || project.name;
                if (name) {
                    const option = new Option(name, name);
                    select.add(option);
                }
            });
        });

        // Populate contact dropdowns (e.g., for 'Primary Contact' in Company form, 'Stakeholder' in Task form)
        const contactSelects = document.querySelectorAll('select[name="stakeholder"], select[name="primaryContact"]');
        const contacts = allData.contacts || [];
        contactSelects.forEach(select => {
            while (select.options.length > 1) select.remove(1);
            contacts.forEach(contact => {
                const name = contact.Name || contact.name;
                if (name) {
                    const option = new Option(name, name);
                    select.add(option);
                }
            });
        });

    } catch (error) {
        console.error('Error populating dropdowns:', error);
        showToast('Error', 'Could not load data for form dropdowns.', 'danger');
    }
}

// --- Date Conversion ---
function convertDateToBrazilian(dateString) {
    if (!dateString) return '';
    try {
        const [year, month, day] = dateString.split('-'); // HTML date input format: YYYY-MM-DD
        if (year && month && day) {
            return `${day}/${month}/${year}`;
        }
        return dateString; // Return original if not in expected format
    } catch (e) {
        console.warn("Could not convert date to Brazilian format:", dateString, e);
        return dateString; // Fallback to original string
    }
}

// --- Form Submission Handlers ---
// Generic function to handle form data submission
async function handleFormSubmit(event, sheetName, formId) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    const dataObject = {};
    formData.forEach((value, key) => {
        // Special handling for date fields to convert format
        if (key.toLowerCase().includes('date') && key !== 'dueDateBrazilian') { // Check if it's a date field
             dataObject[key] = convertDateToBrazilian(value);
        } else {
            dataObject[key] = value;
        }
    });

    // If a specific date field was already converted and named differently, ensure it's used
    // Example: if 'dueDate' is converted to 'dueDateBrazilian', the Apps Script expects 'dueDate'
    // The current Apps Script maps based on headers, so field names from form should match sheet headers.
    // The convertDateToBrazilian function above modifies the value directly.

    try {
        // Prefer Supabase if configured
        if (window.CONFIG && window.CONFIG.SUPABASE_URL && window.CONFIG.SUPABASE_ANON_KEY && window.initSupabase && window.initSupabase()) {
            const tableMap = {
                [window.CONFIG.SHEETS.TASKS]: 'tasks',
                [window.CONFIG.SHEETS.CONTACTS]: 'contacts',
                [window.CONFIG.SHEETS.PROJECTS]: 'projects',
                [window.CONFIG.SHEETS.COMPANIES]: 'companies'
            };
            const table = tableMap[sheetName];
            if (!table) throw new Error('Unknown table for sheet ' + sheetName);
            await window.sbInsert(table, dataObject);
            showToast('Success!', `${sheetName.slice(0,-1)} data added successfully. Refresh might be needed to see changes immediately.`, 'success');
            form.reset();
            // Close the modal if bootstrap is available
            if (typeof bootstrap !== 'undefined' && bootstrap.Modal && formId) {
                const modalElement = document.getElementById(formId.replace('Form', 'Modal')); // e.g. addTaskForm -> addTaskModal
                if (modalElement) {
                    const modalInstance = bootstrap.Modal.getInstance(modalElement);
                    if (modalInstance) modalInstance.hide();
                }
            }
            // Optionally, trigger a data refresh for the relevant part of the UI
            // For example, if on tasks.html, refresh tasks list.
            // Or, more simply, prompt for a page reload or do it automatically after a delay.
             setTimeout(() => {
                // Check if a dashboard refresh function exists (e.g., on index.html)
                if (typeof fetchDashboardData === 'function') {
                    fetchDashboardData(); // Refresh dashboard if on that page
                }
                // Add similar checks for other pages or implement a more generic refresh mechanism
            }, 1500);

        } else {
            // Fallback to existing local API add
            const payload = { action: 'addData', sheetName: sheetName, formData: dataObject };
            if (!window.CONFIG || !window.CONFIG.APPS_SCRIPT_URL) {
                throw new Error("APPS_SCRIPT_URL is not configured.");
            }
            const response = await fetch(window.CONFIG.APPS_SCRIPT_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify(payload)
            });
            const result = await response.json();
            if (!result.success) throw new Error(result.message || `Failed to add data to ${sheetName}.`);
            showToast('Success!', `${sheetName.slice(0,-1)} data added successfully.`, 'success');
            form.reset();
        }

    } catch (error) {
        console.error(`Error submitting ${sheetName} data:`, error);
        showToast('Error', `Failed to add ${sheetName.slice(0,-1)} data. ${error.message}`, 'danger');
    }
}

// Specific handlers calling the generic one
function handleTaskSubmit(e) {
    handleFormSubmit(e, window.CONFIG.SHEETS.TASKS, 'addTaskForm');
}
function handleContactSubmit(e) {
    handleFormSubmit(e, window.CONFIG.SHEETS.CONTACTS, 'addContactForm');
}
function handleProjectSubmit(e) {
    handleFormSubmit(e, window.CONFIG.SHEETS.PROJECTS, 'addProjectForm');
}
function handleCompanySubmit(e) {
    handleFormSubmit(e, window.CONFIG.SHEETS.COMPANIES, 'addCompanyForm');
}

// --- CSV Importers ---
function setupCsvImporters() {
    // Requires PapaParse via CDN
    const files = [
        { id: 'csvContacts', table: 'contacts' },
        { id: 'csvCompanies', table: 'companies' },
        { id: 'csvProjects', table: 'projects' },
        { id: 'csvTasks', table: 'tasks' }
    ];
    files.forEach(cfg => {
        const input = document.getElementById(cfg.id);
        if (!input) return;
        input.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            if (!window.Papa) {
                showToast('Error', 'CSV parser not loaded. Include PapaParse script.', 'danger');
                return;
            }
            Papa.parse(file, {
                header: true,
                skipEmptyLines: true,
                complete: async (results) => {
                    try {
                        if (!(window.CONFIG && window.CONFIG.SUPABASE_URL && window.CONFIG.SUPABASE_ANON_KEY && window.initSupabase && window.initSupabase())) {
                            showToast('Error', 'Supabase not configured. Set SUPABASE_URL and SUPABASE_ANON_KEY in config.js', 'danger');
                            return;
                        }
                        const rows = results.data;
                        for (let i = 0; i < rows.length; i += 1000) { // batch insert
                            const batch = rows.slice(i, i + 1000);
                            await window.sbInsert(cfg.table, batch);
                        }
                        showToast('Success', `Imported ${results.data.length} rows into ${cfg.table}.`, 'success');
                    } catch (err) {
                        console.error('CSV import error:', err);
                        showToast('Error', `Failed to import CSV: ${err.message}`, 'danger');
                    }
                },
                error: (err) => {
                    console.error('CSV parse error:', err);
                    showToast('Error', `Failed to parse CSV: ${err.message}`, 'danger');
                }
            });
        });
    });
}

// Remove old updateAddButtons function as modals are now triggered differently by index.html
// The old buttons that directly opened sheets are gone from the new index.html.
// The new "Add New" dropdown handles opening modals.

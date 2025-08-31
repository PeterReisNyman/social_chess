// Contacts page functionality
let allContacts = [];
let filteredContacts = [];

async function loadContactsData() {
    try {
        const response = await fetch(window.backend('contacts'));
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const rows = await response.json();
        allContacts = rows.map((row, index) => ({
            id: index,
            name: row.name || '',
            organization: row.organization || '',
            role: row.role || '',
            email: row.email || '',
            phone: row.phone || '',
            type: row.type || '',
            projects: row.projects || '',
            lastContact: row.lastContact || '',
            nextAction: row.nextAction || '',
            relationshipStrength: row.relationshipStrength || '',
            notes: row.notes || '',
            tags: row.tags || ''
        }));
        
        filteredContacts = [...allContacts];
        
        // Populate organization filter
        populateOrganizationFilter();
        
        // Display contacts
        displayContacts();
        
    } catch (error) {
        console.error('Error loading contacts:', error);
        showError('Failed to load contacts. Please check your configuration.');
    }
}

function populateOrganizationFilter() {
    const organizations = [...new Set(allContacts.map(contact => contact.organization).filter(o => o))];
    const select = document.getElementById('filter-organization');
    
    select.innerHTML = '<option value="">All Organizations</option>' + 
        organizations.map(org => `<option value="${org}">${org}</option>`).join('');
}

function displayContacts() {
    const container = document.getElementById('contacts-grid');
    
    if (filteredContacts.length === 0) {
        container.innerHTML = '<div class="col-12 text-center text-muted">No contacts found</div>';
        return;
    }
    
    container.innerHTML = filteredContacts.map(contact => `
        <div class="col-md-6 col-lg-4 mb-4">
            <div class="card h-100">
                <div class="card-body">
                    <h5 class="card-title">${contact.name}</h5>
                    <h6 class="card-subtitle mb-2 text-muted">${contact.role} at ${contact.organization}</h6>
                    <p class="card-text">
                        ${contact.type ? `<span class="badge bg-info">${contact.type}</span>` : ''}
                        ${contact.relationshipStrength ? `<span class="badge bg-${getRelationshipColor(contact.relationshipStrength)}">${contact.relationshipStrength}</span>` : ''}
                    </p>
                    <div class="small">
                        ${contact.email ? `<div>📧 ${contact.email}</div>` : ''}
                        ${contact.phone ? `<div>📱 ${contact.phone}</div>` : ''}
                        ${contact.projects ? `<div>📁 ${contact.projects}</div>` : ''}
                        ${contact.lastContact ? `<div>📅 Last contact: ${formatDate(contact.lastContact)}</div>` : ''}
                    </div>
                    ${contact.nextAction ? `<div class="mt-2"><small class="text-warning">Next: ${contact.nextAction}</small></div>` : ''}
                </div>
            </div>
        </div>
    `).join('');
}

function filterContacts() {
    const searchTerm = document.getElementById('search-contacts').value.toLowerCase();
    const typeFilter = document.getElementById('filter-type').value;
    const organizationFilter = document.getElementById('filter-organization').value;
    
    filteredContacts = allContacts.filter(contact => {
        const matchesSearch = !searchTerm || 
            contact.name.toLowerCase().includes(searchTerm) ||
            contact.organization.toLowerCase().includes(searchTerm) ||
            contact.role.toLowerCase().includes(searchTerm) ||
            contact.email.toLowerCase().includes(searchTerm);
        const matchesType = !typeFilter || contact.type === typeFilter;
        const matchesOrganization = !organizationFilter || contact.organization === organizationFilter;
        
        return matchesSearch && matchesType && matchesOrganization;
    });
    
    displayContacts();
}

// Helper functions
function getRelationshipColor(strength) {
    switch (strength?.toLowerCase()) {
        case 'strong': return 'success';
        case 'medium': return 'warning';
        case 'weak': return 'danger';
        default: return 'secondary';
    }
}

function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('pt-BR');
}

function showError(message) {
    const container = document.getElementById('contacts-grid');
    container.innerHTML = `<div class="col-12"><div class="alert alert-danger">${message}</div></div>`;
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    loadContactsData();
    
    // Add event listeners for filters
    document.getElementById('search-contacts').addEventListener('input', filterContacts);
    document.getElementById('filter-type').addEventListener('change', filterContacts);
    document.getElementById('filter-organization').addEventListener('change', filterContacts);
});

// Companies page functionality
let allCompanies = [];

async function loadCompaniesData() {
    try {
        const response = await fetch(window.backend('companies'));
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const rows = await response.json();
        allCompanies = rows.map((row, index) => ({
            id: index,
            name: row.name || '',
            type: row.type || '',
            primaryContact: row.primaryContact || '',
            status: row.status || '',
            projects: row.projects || '',
            totalPipeline: parseFloat(row.totalPipeline) || 0,
            totalRevenue: parseFloat(row.totalRevenue) || 0,
            notes: row.notes || ''
        }));
        
        // Update statistics
        updateCompanyStats();
        
        // Display companies
        displayCompanies();
        
    } catch (error) {
        console.error('Error loading companies:', error);
        showError('Failed to load companies. Please check your configuration.');
    }
}

function updateCompanyStats() {
    // Total companies
    document.getElementById('total-companies').textContent = allCompanies.length;
    
    // Active companies
    const activeCompanies = allCompanies.filter(company => 
        company.status?.toLowerCase() === 'active' || 
        company.status?.toLowerCase() === 'ativo'
    ).length;
    document.getElementById('active-companies').textContent = activeCompanies;
    
    // Total pipeline value
    const totalPipeline = allCompanies.reduce((sum, company) => sum + company.totalPipeline, 0);
    document.getElementById('total-pipeline').textContent = 'R$' + formatNumber(totalPipeline);
    
    // Total revenue
    const totalRevenue = allCompanies.reduce((sum, company) => sum + company.totalRevenue, 0);
    document.getElementById('total-revenue').textContent = 'R$' + formatNumber(totalRevenue);
}

function displayCompanies() {
    const tbody = document.getElementById('companies-table');
    
    if (allCompanies.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">No companies found</td></tr>';
        return;
    }
    
    tbody.innerHTML = allCompanies.map(company => `
        <tr>
            <td>
                <strong>${company.name}</strong>
                ${company.notes ? `<br><small class="text-muted">${company.notes}</small>` : ''}
            </td>
            <td>${company.type}</td>
            <td>${company.primaryContact}</td>
            <td><span class="badge bg-${getStatusColor(company.status)}">${company.status}</span></td>
            <td>${company.projects}</td>
            <td>${company.totalPipeline > 0 ? 'R$' + formatNumber(company.totalPipeline) : '-'}</td>
            <td class="text-success">${company.totalRevenue > 0 ? 'R$' + formatNumber(company.totalRevenue) : '-'}</td>
        </tr>
    `).join('');
}

// Helper functions
function getStatusColor(status) {
    switch (status?.toLowerCase()) {
        case 'active':
        case 'ativo':
            return 'success';
        case 'prospect':
        case 'prospecto':
            return 'info';
        case 'inactive':
        case 'inativo':
            return 'secondary';
        case 'on hold':
        case 'em espera':
            return 'warning';
        default:
            return 'primary';
    }
}

function formatNumber(num) {
    if (!num) return '0';
    return Number(num).toLocaleString('pt-BR');
}

function showError(message) {
    const tbody = document.getElementById('companies-table');
    tbody.innerHTML = `<tr><td colspan="7" class="text-center"><div class="alert alert-danger">${message}</div></td></tr>`;
}

// Load data when page loads
document.addEventListener('DOMContentLoaded', loadCompaniesData);

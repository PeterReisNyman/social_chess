// Projects page functionality
let allProjects = [];
let allTasks = [];

async function loadProjectsData() {
    try {
        const [projectsResponse, tasksResponse] = await Promise.all([
            fetch(window.backend('projects')),
            fetch(window.backend('tasks')),
        ]);
        if (!projectsResponse.ok) throw new Error(`HTTP ${projectsResponse.status}`);
        if (!tasksResponse.ok) throw new Error(`HTTP ${tasksResponse.status}`);
        const projectsRows = await projectsResponse.json();
        const taskRows = await tasksResponse.json();
        allProjects = projectsRows.map((row, index) => ({
            id: index,
            name: row.name || '',
            company: row.company || '',
            status: row.status || '',
            startDate: row.startDate || '',
            revenueModel: row.revenueModel || '',
            feeStructure: row.feeStructure || '',
            pipelineValue: row.pipelineValue || 0,
            actualRevenue: row.actualRevenue || 0,
            stakeholders: row.stakeholders || '',
            nextMilestone: row.nextMilestone || '',
            notes: row.notes || ''
        }));
        allTasks = taskRows.map(r => [r.name, r.company, r.project, r.stakeholder, r.dueDate, r.priority, r.status]);
        
        // Display projects
        displayProjects();
        
    } catch (error) {
        console.error('Error loading projects:', error);
        showError('Failed to load projects. Please check your configuration.');
    }
}

function displayProjects() {
    const container = document.getElementById('projects-grid');
    
    if (allProjects.length === 0) {
        container.innerHTML = '<div class="col-12 text-center text-muted">No projects found</div>';
        return;
    }
    
    container.innerHTML = allProjects.map(project => {
        // Count tasks for this project
        const projectTasks = allTasks.filter(task => task[2] === project.name);
        const openTasks = projectTasks.filter(task => task[6] !== 'Completed').length;
        const totalTasks = projectTasks.length;
        
        return `
            <div class="col-md-6 col-lg-4 mb-4">
                <div class="card h-100">
                    <div class="card-header bg-${getStatusHeaderColor(project.status)}">
                        <h5 class="card-title mb-0 text-white">${project.name}</h5>
                    </div>
                    <div class="card-body">
                        <h6 class="card-subtitle mb-2 text-muted">${project.company}</h6>
                        <div class="mb-3">
                            <span class="badge bg-${getStatusColor(project.status)}">${project.status}</span>
                        </div>
                        <div class="small">
                            ${project.startDate ? `<div>📅 Started: ${formatDate(project.startDate)}</div>` : ''}
                            ${project.stakeholders ? `<div>👥 ${project.stakeholders}</div>` : ''}
                            ${project.revenueModel ? `<div>💰 ${project.revenueModel}</div>` : ''}
                            <div class="mt-2">
                                <strong>Tasks:</strong> ${openTasks} open / ${totalTasks} total
                                ${totalTasks > 0 ? `
                                    <div class="progress mt-1" style="height: 10px;">
                                        <div class="progress-bar bg-success" role="progressbar" 
                                             style="width: ${((totalTasks - openTasks) / totalTasks * 100)}%">
                                        </div>
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                        ${project.nextMilestone ? `
                            <div class="mt-3 p-2 bg-light rounded">
                                <small class="text-muted">Next milestone:</small><br>
                                <small>${project.nextMilestone}</small>
                            </div>
                        ` : ''}
                    </div>
                    ${(project.pipelineValue || project.actualRevenue) ? `
                        <div class="card-footer">
                            <div class="d-flex justify-content-between">
                                ${project.pipelineValue ? `<small>Pipeline: R${formatNumber(project.pipelineValue)}</small>` : '<small></small>'}
                                ${project.actualRevenue ? `<small class="text-success">Revenue: R${formatNumber(project.actualRevenue)}</small>` : ''}
                            </div>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }).join('');
}

// Helper functions
function getStatusColor(status) {
    switch (status?.toLowerCase()) {
        case 'active': return 'success';
        case 'on hold': return 'warning';
        case 'completed': return 'secondary';
        case 'planning': return 'info';
        default: return 'primary';
    }
}

function getStatusHeaderColor(status) {
    switch (status?.toLowerCase()) {
        case 'active': return 'success';
        case 'on hold': return 'warning';
        case 'completed': return 'secondary';
        case 'planning': return 'info';
        default: return 'primary';
    }
}

function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('pt-BR');
}

function formatNumber(num) {
    if (!num) return '0';
    return Number(num).toLocaleString('pt-BR');
}

function showError(message) {
    const container = document.getElementById('projects-grid');
    container.innerHTML = `<div class="col-12"><div class="alert alert-danger">${message}</div></div>`;
}

// Load data when page loads
document.addEventListener('DOMContentLoaded', loadProjectsData);

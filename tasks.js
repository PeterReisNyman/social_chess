// Tasks page functionality
let allTasks = [];
let filteredTasks = [];

async function loadTasksData() {
    try {
        if (window.initSupabase && window.initSupabase()) {
            const rows = await window.sbSelect('tasks');
            allTasks = rows.map((row, index) => ({
                id: index,
                name: row.task_name || '',
                company: row.company || '',
                project: row.project || '',
                stakeholder: row.stakeholder || '',
                dueDate: row.due_date || '',
                priority: row.priority || '',
                status: row.status || '',
                type: row.type || '',
                notes: row.notes || '',
                createdDate: row.created_at || '',
                lastModified: row.created_at || ''
            }));
        } else {
            const response = await fetch(buildApiUrl(CONFIG.SHEETS.TASKS));
            const data = await response.json();
            
            // Skip header row and store tasks
            allTasks = data.values.slice(1).map((row, index) => ({
                id: index,
                name: row[0] || '',
                company: row[1] || '',
                project: row[2] || '',
                stakeholder: row[3] || '',
                dueDate: row[4] || '',
                priority: row[5] || '',
                status: row[6] || '',
                type: row[7] || '',
                notes: row[8] || '',
                createdDate: row[9] || '',
                lastModified: row[10] || ''
            }));
        }
        
        filteredTasks = [...allTasks];
        
        // Populate project filter
        populateProjectFilter();
        
        // Display tasks
        displayTasks();
        
    } catch (error) {
        console.error('Error loading tasks:', error);
        showError('Failed to load tasks. Please check your configuration.');
    }
}

function populateProjectFilter() {
    const projects = [...new Set(allTasks.map(task => task.project).filter(p => p))];
    const select = document.getElementById('filter-project');
    
    // Keep the "All Projects" option and add the rest
    select.innerHTML = '<option value="">All Projects</option>' + 
        projects.map(project => `<option value="${project}">${project}</option>`).join('');
}

function displayTasks() {
    const tbody = document.getElementById('tasks-table');
    
    if (filteredTasks.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">No tasks found</td></tr>';
        document.getElementById('task-count').textContent = '0';
        return;
    }
    
    tbody.innerHTML = filteredTasks.map(task => `
        <tr>
            <td>
                <strong>${task.name}</strong>
                ${task.notes ? `<br><small class="text-muted">${task.notes}</small>` : ''}
            </td>
            <td>${task.company}</td>
            <td>${task.project}</td>
            <td>${task.stakeholder}</td>
            <td>${formatDate(task.dueDate)}</td>
            <td><span class="badge bg-${getPriorityColor(task.priority)}">${task.priority}</span></td>
            <td><span class="badge bg-${getStatusColor(task.status)}">${task.status}</span></td>
        </tr>
    `).join('');
    
    document.getElementById('task-count').textContent = filteredTasks.length;
}

function filterTasks() {
    const statusFilter = document.getElementById('filter-status').value;
    const priorityFilter = document.getElementById('filter-priority').value;
    const projectFilter = document.getElementById('filter-project').value;
    const searchTerm = document.getElementById('search-tasks').value.toLowerCase();
    
    filteredTasks = allTasks.filter(task => {
        const matchesStatus = !statusFilter || task.status === statusFilter;
        const matchesPriority = !priorityFilter || task.priority === priorityFilter;
        const matchesProject = !projectFilter || task.project === projectFilter;
        const matchesSearch = !searchTerm || 
            task.name.toLowerCase().includes(searchTerm) ||
            task.company.toLowerCase().includes(searchTerm) ||
            task.project.toLowerCase().includes(searchTerm) ||
            task.stakeholder.toLowerCase().includes(searchTerm);
        
        return matchesStatus && matchesPriority && matchesProject && matchesSearch;
    });
    
    displayTasks();
}

// Helper functions
function getPriorityColor(priority) {
    switch (priority?.toLowerCase()) {
        case 'high': return 'danger';
        case 'medium': return 'warning';
        case 'low': return 'success';
        default: return 'secondary';
    }
}

function getStatusColor(status) {
    switch (status?.toLowerCase()) {
        case 'not started': return 'secondary';
        case 'in progress': return 'primary';
        case 'completed': return 'success';
        default: return 'info';
    }
}

function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('pt-BR');
}

function showError(message) {
    const tbody = document.getElementById('tasks-table');
    tbody.innerHTML = `<tr><td colspan="7" class="text-center"><div class="alert alert-danger">${message}</div></td></tr>`;
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    loadTasksData();
    
    // Add event listeners for filters
    document.getElementById('filter-status').addEventListener('change', filterTasks);
    document.getElementById('filter-priority').addEventListener('change', filterTasks);
    document.getElementById('filter-project').addEventListener('change', filterTasks);
    document.getElementById('search-tasks').addEventListener('input', filterTasks);
});

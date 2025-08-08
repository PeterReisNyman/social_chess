// Dashboard functionality

// Social Chess Game Mechanics Variables
let allContacts = [];
let allProjects = [];
let relationshipsData = [];
let capitalScoresData = [];
let gameStatesData = [];

async function loadDashboardData() {
    try {
        // Fetch all necessary data
        let tasksData, dashboardData, projectsData, interactionsData, contactsData;
        if (window.initSupabase && window.initSupabase()) {
            const [tasksRows, projectsRows, contactsRows] = await Promise.all([
                window.sbSelect('tasks'),
                window.sbSelect('projects'),
                window.sbSelect('contacts')
            ]);
            tasksData = { values: [['Task Name','Company','Project','Stakeholder','Due Date','Priority','Status','Type','Notes','Created Date','Last Modified'], ...tasksRows.map(r => [r.task_name,r.company,r.project,r.stakeholder,r.due_date,r.priority,r.status,r.type,r.notes,r.created_at,r.created_at])] };
            projectsData = { values: [['Name','Company','Status','Start Date','Revenue Model','Fee Structure','Pipeline Value','Actual Revenue','Stakeholders','Next Milestone','Notes'], ...projectsRows.map(r => [r.name,r.company,r.status,r.start_date,r.revenue_model,r.fee_structure,r.pipeline_value,r.actual_revenue,r.stakeholders,r.next_milestone,r.notes])] };
            contactsData = { values: [['Name','Organization','Role','Email','Phone','Type','Projects','Last Contact','Next Action','Relationship Strength','Notes','Tags'], ...contactsRows.map(r => [r.name,r.organization,r.role,r.email,r.phone,r.type,r.projects,r.last_contact,r.next_action,r.relationship_strength,r.notes,r.tags])] };
            [dashboardData, interactionsData] = await Promise.all([
                fetch(buildApiUrl(CONFIG.SHEETS.DASHBOARD)).then(r => r.json()),
                fetch(buildApiUrl(CONFIG.SHEETS.INTERACTIONS)).then(r => r.json())
            ]);
        } else {
            [tasksData, dashboardData, projectsData, interactionsData, contactsData] = await Promise.all([
                fetch(buildApiUrl(CONFIG.SHEETS.TASKS)).then(r => r.json()),
                fetch(buildApiUrl(CONFIG.SHEETS.DASHBOARD)).then(r => r.json()),
                fetch(buildApiUrl(CONFIG.SHEETS.PROJECTS)).then(r => r.json()),
                fetch(buildApiUrl(CONFIG.SHEETS.INTERACTIONS)).then(r => r.json()),
                fetch(buildApiUrl(CONFIG.SHEETS.CONTACTS)).then(r => r.json())
            ]);
        }

        // Store data for Social Chess calculations
        allProjects = projectsData.values ? projectsData.values.slice(1).map((row, index) => ({
            id: index,
            name: row[0] || '',
            company: row[1] || '',
            status: row[2] || ''
        })) : [];
        
        allContacts = contactsData.values ? contactsData.values.slice(1).map((row, index) => ({
            id: index,
            name: row[0] || ''
        })) : [];

        // Process the data
        updateMetricsFromDashboard(dashboardData.values);
        displayTodaysTasks(tasksData.values);
        displayRecentInteractions(interactionsData.values);
        displayProjectHealth(projectsData.values, tasksData.values);
        
        // Load Social Chess data
        await loadSocialChessData();

    } catch (error) {
        console.error('Error loading dashboard data:', error);
        showError('Failed to load data. Please check your configuration.');
    }
}

// Social Chess Data Loading
async function loadSocialChessData() {
    try {
        const [relationships, capitalScores, gameStates] = await Promise.all([
            fetch(buildApiUrl(CONFIG.SHEETS.RELATIONSHIPS)).then(r => r.json()),
            fetch(buildApiUrl(CONFIG.SHEETS.CAPITAL_SCORES)).then(r => r.json()),
            fetch(buildApiUrl(CONFIG.SHEETS.GAME_STATES)).then(r => r.json())
        ]);
        
        relationshipsData = relationships.values || [];
        capitalScoresData = capitalScores.values || [];
        gameStatesData = gameStates.values || [];
        
        // Calculate and display game metrics
        updateGameMetrics();
        
    } catch (error) {
        console.log('Social Chess data not yet available:', error);
    }
}

// Calculate network reach
function calculateNetworkReach() {
    const uniqueContacts = new Set();
    
    // Count direct contacts
    allContacts.forEach(contact => {
        if (contact.name) uniqueContacts.add(contact.name);
    });
    
    // Count indirect contacts through relationships
    if (relationshipsData.length > 1) {
        relationshipsData.slice(1).forEach(row => {
            if (row[0]) uniqueContacts.add(row[0]);
            if (row[1]) uniqueContacts.add(row[1]);
        });
    }
    
    return uniqueContacts.size;
}

// Count active games (projects with active status)
function countActiveGames() {
    const activeProjects = allProjects.filter(project => 
        project.status?.toLowerCase() === 'active' || 
        project.status?.toLowerCase() === 'ativo'
    );
    return activeProjects.length;
}

// Update game-specific metrics on dashboard
function updateGameMetrics() {
    // Update network reach if element exists
    const networkReachElement = document.getElementById('network-reach');
    if (networkReachElement) {
        networkReachElement.textContent = calculateNetworkReach();
    }
    
    // Update active games count if element exists
    const activeGamesElement = document.getElementById('active-games');
    if (activeGamesElement) {
        activeGamesElement.textContent = countActiveGames();
    }
    
    // Add game metrics section if container exists
    const gameMetricsContainer = document.getElementById('game-metrics');
    if (gameMetricsContainer) {
        gameMetricsContainer.innerHTML = `
            <div class="col-md-3">
                <div class="card text-center">
                    <div class="card-body">
                        <h5 class="card-title">Network Reach</h5>
                        <h2 class="text-gradient">${calculateNetworkReach()}</h2>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card text-center">
                    <div class="card-body">
                        <h5 class="card-title">Active Games</h5>
                        <h2 class="text-gradient">${countActiveGames()}</h2>
                    </div>
                </div>
            </div>
        `;
    }
}

function updateMetricsFromDashboard(dashboardData) {
    // Dashboard sheet has pre-calculated metrics
    // Row 2: Not Started Tasks
    // Row 3: Tasks In Progress  
    // Row 4: High Priority Tasks
    // Row 6: Total Pipeline Value
    // Row 7: Total Revenue Generated
    // Row 9: Network Engaged
    // Row 10: Interactions This Month
    
    // Open tasks = Not Started + In Progress
    const notStarted = dashboardData[2] && dashboardData[2][0] ? parseInt(dashboardData[2][0]) : 0;
    const inProgress = dashboardData[3] && dashboardData[3][0] ? parseInt(dashboardData[3][0]) : 0;
    const openTasks = notStarted + inProgress;
    document.getElementById('open-tasks').textContent = openTasks;
    
    // High priority tasks (assuming these are due today)
    const highPriority = dashboardData[4] && dashboardData[4][0] ? parseInt(dashboardData[4][0]) : 0;
    document.getElementById('due-today').textContent = highPriority;
    
    // Network engaged
    const networkEngaged = dashboardData[9] && dashboardData[9][1] ? parseInt(dashboardData[9][1]) : 0;
    document.getElementById('active-network').textContent = networkEngaged;
    
    // For active projects, we'll count from Projects sheet
    // This will be handled separately
    document.getElementById('active-projects').textContent = '-';
}

function displayTodaysTasks(tasks) {
    const container = document.getElementById('todays-tasks');
    const today = new Date().toISOString().split('T')[0];
    
    // Filter today's tasks (skip header)
    const todaysTasks = tasks.slice(1).filter(row => row[4] === today);
    
    if (todaysTasks.length === 0) {
        container.innerHTML = '<div class="list-group-item text-muted">No tasks due today</div>';
        return;
    }
    
    container.innerHTML = todaysTasks.map(task => `
        <div class="list-group-item">
            <div class="d-flex w-100 justify-content-between">
                <h6 class="mb-1">${task[0]}</h6>
                <small class="badge bg-${getPriorityColor(task[5])}">${task[5]}</small>
            </div>
            <p class="mb-1"><small>${task[1]} - ${task[2]}</small></p>
            <small>Assigned to: ${task[3]}</small>
        </div>
    `).join('');
}

function displayRecentInteractions(interactions) {
    const container = document.getElementById('recent-interactions');
    
    // Get last 5 interactions (skip header)
    const recentInteractions = interactions.slice(1).slice(-5).reverse();
    
    if (recentInteractions.length === 0) {
        container.innerHTML = '<div class="list-group-item text-muted">No recent interactions</div>';
        return;
    }
    
    container.innerHTML = recentInteractions.map(interaction => `
        <div class="list-group-item">
            <div class="d-flex w-100 justify-content-between">
                <h6 class="mb-1">${interaction[4]}</h6>
                <small>${formatDate(interaction[0])}</small>
            </div>
            <p class="mb-1"><small>${interaction[1]} - ${interaction[2]}</small></p>
            <small>${interaction[5]}</small>
        </div>
    `).join('');
}

function displayProjectHealth(projects, tasks) {
    const tbody = document.getElementById('project-health');
    
    // Skip headers
    const projectRows = projects.slice(1);
    const taskRows = tasks.slice(1);
    
    // Count and display active projects
    const activeProjects = projectRows.filter(row => row[2] === 'Active').length;
    document.getElementById('active-projects').textContent = activeProjects;
    
    if (projectRows.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-muted">No projects found</td></tr>';
        return;
    }
    
    tbody.innerHTML = projectRows.map(project => {
        // Count open tasks for this project
        const projectTasks = taskRows.filter(task => task[2] === project[0] && task[6] !== 'Completed');
        
        return `
            <tr>
                <td>${project[0]}</td>
                <td>${project[1]}</td>
                <td><span class="badge bg-${getStatusColor(project[2])}">${project[2]}</span></td>
                <td>${projectTasks.length}</td>
            </tr>
        `;
    }).join('');
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
        case 'active': return 'success';
        case 'on hold': return 'warning';
        case 'completed': return 'secondary';
        default: return 'info';
    }
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    // Handle ISO date format with timezone
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString; // Return original if parsing fails
    return date.toLocaleDateString('pt-BR'); // Brazilian date format
}

function showError(message) {
    // Display error messages in all containers
    ['todays-tasks', 'recent-interactions', 'project-health'].forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.innerHTML = `<div class="alert alert-danger">${message}</div>`;
        }
    });
}

// Load data when page loads
document.addEventListener('DOMContentLoaded', loadDashboardData);

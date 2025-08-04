// game-board.js - Social Chess Game Board Functionality

// --- Global Variables ---
let allData = {
    projects: [],
    contacts: [],
    capitalScores: [],
    relationships: [],
    // gameStates: [] // Add if you have a GameStates sheet and logic for it
};
let currentGame = null; // Stores the currently selected project object
let selectedPlayerNode = null; // Stores the D3 data of the selected player

// D3 Network Visualization Variables
let svg, networkGroup, simulation, width, height;
const nodeRadius = 25;
const selectedNodeRadius = 30;

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    initializeGameBoard();
    setupEventListeners();
});

function setupEventListeners() {
    // Event listeners for view control buttons
    document.querySelectorAll('.view-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            const viewType = event.target.dataset.view;
            switchView(viewType, event.target);
        });
    });

    // AI Insight button (initially disabled)
    const aiButton = document.getElementById('ai-insight-button');
    if (aiButton) {
        aiButton.addEventListener('click', handleAIInsightRequest);
    }
}

async function initializeGameBoard() {
    const loader = document.getElementById('board-loader');
    const prompt = document.getElementById('select-game-prompt');
    if (loader) loader.classList.remove('hidden');
    if (prompt) prompt.classList.add('hidden');


    if (!window.CONFIG || !window.CONFIG.APPS_SCRIPT_URL) {
        console.error("CONFIG or APPS_SCRIPT_URL not defined. Ensure config.js is loaded.");
        if (loader) loader.classList.add('hidden');
        if (prompt) {
            prompt.classList.remove('hidden');
            prompt.textContent = "Error: Application configuration is missing.";
        }
        return;
    }

    try {
        const response = await fetch(`${window.CONFIG.APPS_SCRIPT_URL}?action=getAllData`);
        if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
        const result = await response.json();

        if (result.success && result.data) {
            allData.projects = result.data.projects || [];
            allData.contacts = result.data.contacts || [];
            allData.capitalScores = result.data.capitalScores || [];
            allData.relationships = result.data.relationships || [];
            // allData.gameStates = result.data.gameStates || [];

            displayGamesList();
            initializeNetworkSVG();
             if (prompt) prompt.classList.remove('hidden'); // Show "Select a game" after loading
        } else {
            throw new Error(result.message || "Failed to fetch game board data from backend.");
        }
    } catch (error) {
        console.error('Error initializing game board:', error);
        if (prompt) {
            prompt.classList.remove('hidden');
            prompt.innerHTML = `<p class="text-red-500">Error loading game data: ${error.message}</p>`;
        }
        // Display error in UI
    } finally {
        if (loader) loader.classList.add('hidden');
    }
}

// --- UI Display Functions ---

function displayGamesList() {
    const container = document.getElementById('games-list-container');
    if (!container) return;

    const activeProjects = allData.projects.filter(p => p.Status && p.Status.toLowerCase() === 'active');

    if (activeProjects.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-sm">No active games (projects) found.</p>';
        return;
    }

    container.innerHTML = activeProjects.map(project => `
        <div class="p-3 rounded-lg cursor-pointer hover:bg-brand-light transition-colors border border-transparent hover:border-brand-accent" 
             data-project-name="${project.Name}" onclick="selectGame('${project.Name}')">
            <h4 class="font-medium text-sm text-brand-dark">${project.Name}</h4>
            <p class="text-xs text-gray-500">${project.Company || 'N/A'}</p>
            <span class="text-xs ${project.Status === 'Active' ? 'text-green-500' : 'text-yellow-500'}">${project.Status}</span>
        </div>
    `).join('');
}

function selectGame(projectName) {
    currentGame = allData.projects.find(p => p.Name === projectName);
    if (!currentGame) {
        console.error(`Project ${projectName} not found.`);
        return;
    }

    document.getElementById('current-game-title-display').textContent = currentGame.Name;
    document.querySelectorAll('#games-list-container > div').forEach(el => {
        el.classList.remove('bg-brand-accent', 'text-white', 'border-brand-accent');
        el.classList.add('hover:bg-brand-light');
        if (el.dataset.projectName === projectName) {
            el.classList.add('bg-brand-accent', 'text-white');
            el.classList.remove('hover:bg-brand-light');
        }
    });
    
    const prompt = document.getElementById('select-game-prompt');
    if (prompt) prompt.classList.add('hidden');

    drawNetworkForCurrentGame();
    clearPlayerDetails(); // Clear details when a new game is selected
}

function clearPlayerDetails() {
    const panel = document.getElementById('player-details-panel-content');
    panel.innerHTML = `<div class="text-center text-gray-400 pt-10"><p>Select a player node from the network to view their details.</p></div>`;
    document.getElementById('ai-insight-button').disabled = true;
    selectedPlayerNode = null; // Clear selected player
    // Deselect any D3 nodes
    if (networkGroup) {
        networkGroup.selectAll('.node').classed('selected', false)
            .select('circle').attr('r', nodeRadius);
    }
}


function displayPlayerDetails(playerData) { // playerData is the D3 node data
    const panel = document.getElementById('player-details-panel-content');
    if (!panel || !playerData) return;

    const contactInfo = allData.contacts.find(c => c.Name === playerData.id) || {}; // playerData.id is the contact's name
    const capital = allData.capitalScores.find(cs => cs.ContactName === playerData.id) || {};

    // Capital scores - ensure they are numbers and default to 0 if not found or not a number
    const capitals = [
        { label: 'Economic', value: parseFloat(capital.Economic) || 0, icon: '💰', color: 'bg-blue-500' },
        { label: 'Social', value: parseFloat(capital.Social) || 0, icon: '🤝', color: 'bg-green-500' },
        { label: 'Political', value: parseFloat(capital.Political) || 0, icon: '🏛️', color: 'bg-red-500' },
        { label: 'Career', value: parseFloat(capital.Career) || 0, icon: '🎓', color: 'bg-yellow-500' },
        { label: 'Cultural', value: parseFloat(capital.Cultural) || 0, icon: '🎭', color: 'bg-purple-500' },
        { label: 'Intellectual', value: parseFloat(capital.Intellectual) || 0, icon: '💡', color: 'bg-indigo-500' }
    ];

    let capitalHTML = capitals.map(cap => `
        <div class="mb-3">
            <div class="flex justify-between items-center mb-1">
                <span class="text-xs font-medium text-gray-600">${cap.icon} ${cap.label}</span>
                <span class="text-xs text-gray-500">${cap.value.toFixed(0)}/100</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2.5">
                <div class="${cap.color} h-2.5 rounded-full" style="width: ${cap.value}%"></div>
            </div>
        </div>
    `).join('');

    panel.innerHTML = `
        <div class="text-center mb-4">
            <img src="https://placehold.co/80x80/${tailwind.config.theme.extend.colors['brand-secondary'].substring(1)}/FFFFFF?text=${contactInfo.Name ? contactInfo.Name.substring(0,1).toUpperCase() : 'P'}" alt="${contactInfo.Name}" class="w-20 h-20 rounded-full mx-auto mb-2 border-2 border-brand-secondary shadow-md">
            <h4 class="text-lg font-semibold text-brand-dark">${contactInfo.Name || 'N/A'}</h4>
            <p class="text-sm text-gray-600">${contactInfo.Role || 'Role N/A'}</p>
            <p class="text-xs text-gray-500">${contactInfo.Organization || 'Organization N/A'}</p>
        </div>
        <div class="my-4 py-4 border-y">
            <h5 class="text-sm font-semibold text-gray-700 mb-2">Polycapital Scores:</h5>
            ${capitalHTML}
        </div>
        <div>
            <h5 class="text-sm font-semibold text-gray-700 mb-2">Contact Info:</h5>
            <p class="text-xs text-gray-600"><strong>Email:</strong> ${contactInfo.Email || 'N/A'}</p>
            <p class="text-xs text-gray-600"><strong>Phone:</strong> ${contactInfo.Phone || 'N/A'}</p>
            <p class="text-xs text-gray-600"><strong>Type:</strong> ${contactInfo['Contact Type'] || 'N/A'}</p>
            <p class="text-xs text-gray-600"><strong>Strength:</strong> ${contactInfo['Relationship Strength'] || 'N/A'}</p>
        </div>
        <div class="mt-4">
             <h5 class="text-sm font-semibold text-gray-700 mb-2">Notes:</h5>
             <p class="text-xs text-gray-600 bg-gray-50 p-2 rounded-md">${contactInfo.Notes || 'No notes available.'}</p>
        </div>
    `;
    document.getElementById('ai-insight-button').disabled = false;
}

// --- D3 Network Visualization ---

function initializeNetworkSVG() {
    const container = document.getElementById('network-visualization-container');
    if (!container) {
        console.error("Network visualization container not found.");
        return;
    }
    width = container.clientWidth;
    height = container.clientHeight;

    svg = d3.select('#network-svg-element')
        .attr('width', width)
        .attr('height', height)
        .on('click', (event) => { // Click on SVG background deselects nodes
            if (event.target.tagName === 'svg') {
                 clearPlayerDetails();
            }
        });

    networkGroup = svg.append('g').attr('class', 'network-group');

    // Define marker for arrowheads on links (optional)
    svg.append('defs').append('marker')
        .attr('id', 'arrowhead')
        .attr('viewBox', '-0 -5 10 10')
        .attr('refX', nodeRadius + 7) // Adjust based on node size and desired arrow position
        .attr('refY', 0)
        .attr('orient', 'auto')
        .attr('markerWidth', 6)
        .attr('markerHeight', 6)
        .attr('xoverflow', 'visible')
        .append('svg:path')
        .attr('d', 'M 0,-5 L 10 ,0 L 0,5')
        .attr('fill', '#999')
        .style('stroke', 'none');

    simulation = d3.forceSimulation()
        .force('link', d3.forceLink().id(d => d.id).distance(120).strength(0.1))
        .force('charge', d3.forceManyBody().strength(-250))
        .force('center', d3.forceCenter(width / 2, height / 2))
        .force('collision', d3.forceCollide().radius(nodeRadius * 1.5));

    // Add zoom behavior
    const zoom = d3.zoom()
        .scaleExtent([0.3, 3])
        .on('zoom', (event) => {
            networkGroup.attr('transform', event.transform);
        });
    svg.call(zoom);

    // Resize listener
    window.addEventListener('resize', () => {
        width = container.clientWidth;
        height = container.clientHeight;
        svg.attr('width', width).attr('height', height);
        simulation.force('center', d3.forceCenter(width / 2, height / 2)).alpha(0.3).restart();
    });
}

function drawNetworkForCurrentGame() {
    if (!currentGame || !networkGroup || !simulation) {
        console.warn("Cannot draw network: current game, SVG group, or simulation not ready.");
        networkGroup.selectAll('*').remove(); // Clear previous if any
        return;
    }
    const loader = document.getElementById('board-loader');
    if (loader) loader.classList.remove('hidden');


    // 1. Identify Players (Contacts) for the current game (Project)
    // This depends on how stakeholders are stored in your 'Projects' sheet.
    // Assuming 'currentGame.Stakeholders' is a string of names, semicolon-separated.
    const stakeholderNames = currentGame.Stakeholders ? currentGame.Stakeholders.split(';').map(s => s.trim()).filter(s => s) : [];
    
    // Add "You" as a central player if not already implicitly part of stakeholders
    // For now, we'll just use the stakeholders from the project.
    // Consider adding a "User" node if Social Chess is from a user's perspective.

    const gameNodes = allData.contacts
        .filter(contact => stakeholderNames.includes(contact.Name))
        .map(contact => ({
            id: contact.Name, // D3 needs an 'id'
            name: contact.Name,
            role: contact.Role || 'Stakeholder',
            group: contact.Organization || 'Default' // For coloring or grouping
        }));

    if (gameNodes.length === 0) {
        console.warn(`No stakeholders found or mapped for project: ${currentGame.Name}`);
        networkGroup.selectAll('*').remove();
        if (loader) loader.classList.add('hidden');
        // Display a message on the board
        networkGroup.append("text")
            .attr("x", width / 2)
            .attr("y", height / 2)
            .attr("text-anchor", "middle")
            .style("font-size", "16px")
            .style("fill", "#777")
            .text("No players (stakeholders) defined for this game.");
        return;
    }
    
    // 2. Identify Relationships between these players
    // Filter relationships from 'allData.relationships' that involve only the gameNodes
    const gameLinks = allData.relationships
        .filter(rel => {
            const sourceExists = gameNodes.some(node => node.id === rel.SourceContact);
            const targetExists = gameNodes.some(node => node.id === rel.TargetContact);
            return sourceExists && targetExists;
        })
        .map(rel => ({
            source: rel.SourceContact, // Must match node 'id'
            target: rel.TargetContact, // Must match node 'id'
            type: rel.RelationshipType || 'related', // e.g., 'Reports To', 'Influences', 'Blocks'
            strength: parseFloat(rel.Strength) || 0.5 // Numerical strength 0-1
        }));

    // --- D3 Data Binding ---
    networkGroup.selectAll('*').remove(); // Clear previous drawing

    const link = networkGroup.append('g')
        .attr('class', 'links')
        .selectAll('line')
        .data(gameLinks)
        .enter().append('line')
        .attr('class', 'link')
        .style('stroke', d => d.type === 'blocker' ? '#ef4444' : '#9ca3af') // Example coloring
        .style('stroke-width', d => (d.strength || 0.5) * 4) // Example: strength influences width
        // .attr('marker-end', 'url(#arrowhead)'); // Optional: add arrows

    const node = networkGroup.append('g')
        .attr('class', 'nodes')
        .selectAll('g.node')
        .data(gameNodes, d => d.id) // Key function for object constancy
        .enter().append('g')
        .attr('class', 'node')
        .call(d3.drag()
            .on('start', dragstarted)
            .on('drag', dragged)
            .on('end', dragended))
        .on('click', function(event, d) {
            event.stopPropagation(); // Prevent SVG click event
            
            // Toggle selection
            const alreadySelected = d3.select(this).classed('selected');
            networkGroup.selectAll('.node').classed('selected', false)
                .select('circle').attr('r', nodeRadius).style('stroke', d => d.isCentralUser ? tailwind.config.theme.extend.colors['brand-accent'] : tailwind.config.theme.extend.colors['brand-secondary']);

            if (!alreadySelected) {
                d3.select(this).classed('selected', true)
                    .select('circle').attr('r', selectedNodeRadius).style('stroke', tailwind.config.theme.extend.colors['brand-accent']);
                selectedPlayerNode = d; // Store the D3 data object
                displayPlayerDetails(d);
            } else {
                clearPlayerDetails(); // Deselecting
            }
        })
        .on('mouseover', function(event, d) {
            if (!d3.select(this).classed('selected')) {
                 d3.select(this).select('circle').attr('r', selectedNodeRadius * 0.9);
            }
            // Highlight connected links and nodes (optional)
        })
        .on('mouseout', function(event, d) {
             if (!d3.select(this).classed('selected')) {
                d3.select(this).select('circle').attr('r', nodeRadius);
            }
        });

    node.append('circle')
        .attr('r', nodeRadius)
        .style('fill', d => d.isCentralUser ? tailwind.config.theme.extend.colors['brand-accent'] : 'white') // Example: color user node differently
        .style('stroke', d => d.isCentralUser ? tailwind.config.theme.extend.colors['brand-accent'] : tailwind.config.theme.extend.colors['brand-secondary'])
        .style('cursor', 'pointer');

    node.append('text')
        .attr('class', 'name')
        .attr('dy', -5) // Offset text above center
        .attr('text-anchor', 'middle')
        .text(d => d.name);
    
    node.append('text')
        .attr('class', 'role')
        .attr('dy', 10) // Offset text below center
        .attr('text-anchor', 'middle')
        .text(d => d.role);

    // --- Simulation Setup ---
    simulation.nodes(gameNodes).on('tick', ticked);
    simulation.force('link').links(gameLinks);
    simulation.alpha(1).restart(); // Reheat the simulation

    function ticked() {
        link
            .attr('x1', d => d.source.x)
            .attr('y1', d => d.source.y)
            .attr('x2', d => d.target.x)
            .attr('y2', d => d.target.y);
        node
            .attr('transform', d => `translate(${d.x},${d.y})`);
    }
    if (loader) loader.classList.add('hidden');
}


// --- D3 Drag Functions ---
function dragstarted(event, d) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
}
function dragged(event, d) {
    d.fx = event.x;
    d.fy = event.y;
}
function dragended(event, d) {
    if (!event.active) simulation.alphaTarget(0);
    d.fx = null; // Set to null to unpin, or keep fx, fy to pin
    d.fy = null;
}

// --- View Switching ---
function switchView(viewType, clickedButton) {
    console.log(`Switching to ${viewType} view`);
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.classList.remove('bg-brand-secondary', 'text-white', 'opacity-100');
        btn.classList.add('bg-gray-200', 'text-gray-700', 'hover:bg-gray-300');
    });
    clickedButton.classList.add('bg-brand-secondary', 'text-white', 'opacity-100');
    clickedButton.classList.remove('bg-gray-200', 'text-gray-700', 'hover:bg-gray-300');

    const vizContainer = document.getElementById('network-visualization-container');
    vizContainer.innerHTML = ''; // Clear previous content

    if (viewType === 'network') {
        vizContainer.innerHTML = '<svg id="network-svg-element" class="w-full h-full"></svg>'; // Re-add SVG
        initializeNetworkSVG(); // Re-initialize SVG and simulation setup
        if (currentGame) {
            drawNetworkForCurrentGame();
        } else {
             document.getElementById('select-game-prompt').classList.remove('hidden');
        }
    } else {
        vizContainer.innerHTML = `<div class="p-10 text-center text-gray-500">"${viewType}" view is under construction.</div>`;
        // Hide the select game prompt if it's visible for other views
        document.getElementById('select-game-prompt').classList.add('hidden');
    }
}

// --- AI Insight ---
async function handleAIInsightRequest() {
    if (!selectedPlayerNode || !selectedPlayerNode.id) {
        alert("Please select a player from the network first.");
        return;
    }

    const contactName = selectedPlayerNode.id;
    const contactDetails = allData.contacts.find(c => c.Name === contactName);
    const capitalScores = allData.capitalScores.find(cs => cs.ContactName === contactName);
    // Potentially gather interaction history if available

    if (!contactDetails) {
        alert("Could not find details for the selected player.");
        return;
    }

    const aiButton = document.getElementById('ai-insight-button');
    aiButton.disabled = true;
    aiButton.innerHTML = `
        <svg class="animate-spin h-5 w-5 mr-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Getting Insight...`;

    // Construct the prompt for the Gemini API
    // YOU NEED TO DEFINE THIS PROMPT based on what insights you want.
    let promptText = `Analyze the professional profile for ${contactName} for a strategic relationship management system called "Social Chess".\n`;
    promptText += `Contact Details:\n`;
    promptText += `- Role: ${contactDetails.Role || 'N/A'}\n`;
    promptText += `- Organization: ${contactDetails.Organization || 'N/A'}\n`;
    promptText += `- Contact Type: ${contactDetails['Contact Type'] || 'N/A'}\n`;
    promptText += `- Relationship Strength (User-defined): ${contactDetails['Relationship Strength'] || 'N/A'}\n`;
    if (contactDetails.Notes) {
        promptText += `- Notes: ${contactDetails.Notes}\n`;
    }

    if (capitalScores) {
        promptText += `Polycapital Scores (scale of 0-100):\n`;
        if (capitalScores.Economic) promptText += `- Economic: ${parseFloat(capitalScores.Economic) || 0}\n`;
        if (capitalScores.Social) promptText += `- Social: ${parseFloat(capitalScores.Social) || 0}\n`;
        if (capitalScores.Political) promptText += `- Political: ${parseFloat(capitalScores.Political) || 0}\n`;
        if (capitalScores.Career) promptText += `- Career: ${parseFloat(capitalScores.Career) || 0}\n`;
        if (capitalScores.Cultural) promptText += `- Cultural: ${parseFloat(capitalScores.Cultural) || 0}\n`;
        if (capitalScores.Intellectual) promptText += `- Intellectual: ${parseFloat(capitalScores.Intellectual) || 0}\n`;
    }
    
    // TODO: Add interaction history if available from 'Interactions' sheet

    promptText += `\nBased on this information, provide:
1. A brief summary of this contact's potential strategic value.
2. Three actionable suggestions to strengthen the relationship with ${contactName}.
3. One potential risk or challenge in dealing with this contact.
Keep the response concise and actionable.`;

    console.log("Sending prompt to AI:", promptText);

    try {
        // This is where you'd make the fetch call to the Gemini API
        // For now, we'll simulate a response.
        // Replace this with the actual Gemini API call structure when ready.
        // const apiKey = ""; // Your Gemini API Key if required by the model
        // const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
        // const payload = { contents: [{ parts: [{ text: promptText }] }] };
        // const response = await fetch(apiUrl, {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify(payload)
        // });
        // if (!response.ok) throw new Error(`Gemini API Error: ${response.status}`);
        // const result = await response.json();
        // const aiText = result.candidates[0].content.parts[0].text;

        // SIMULATED AI RESPONSE:
        await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate network delay
        const aiText = `**Strategic Value Summary:**\n${contactName} appears to be a valuable contact, particularly if their ${contactDetails['Contact Type'] || 'role'} aligns with your current objectives. Their capital scores in [mention a high score area, e.g., Social Capital] suggest strength in [explain implication].\n\n**Actionable Suggestions:**\n1. Schedule a brief virtual coffee to discuss [relevant topic based on their role/notes].\n2. Offer a valuable introduction to someone in your network if their Social Capital is high and it aligns.\n3. Share a relevant article or insight related to their work or stated interests from notes.\n\n**Potential Risk/Challenge:**\nIf their Relationship Strength is marked 'Weak' or notes indicate past issues, proceed with caution and focus on rebuilding trust before making significant requests.`;
        
        // Display AI insight (e.g., in a modal or dedicated section)
        // For simplicity, using an alert for now. Replace with proper UI display.
        alert("AI Insight:\n\n" + aiText.replace(/\*\*/g, '')); // Remove markdown bold for alert

    } catch (error) {
        console.error("Error getting AI insight:", error);
        alert("Failed to get AI insight. " + error.message);
    } finally {
        aiButton.disabled = false;
        aiButton.innerHTML = `
            <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
            Get AI Insight`;
    }
}

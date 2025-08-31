/*
 Test creator: posts one Company, Contact, Project, and Task to the NestJS API.
 Usage: node scripts/test-create.js
 Optional env: BACKEND_API_URL (default http://localhost:3001/api)
*/

// Attempt to load .env if available
try {
  require('dotenv').config();
} catch {}

const BASE = (process.env.BACKEND_API_URL || 'http://localhost:3001/api').replace(/\/$/, '');

async function postJson(path, payload) {
  const url = `${BASE}/${path.replace(/^\//, '')}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`${res.status} ${res.statusText} for ${url}: ${text}`);
  }
  return res.json();
}

function today() {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`; // YYYY-MM-DD
}

async function main() {
  const ts = new Date().toISOString().replace(/[:.TZ-]/g, '').slice(0, 14);
  const companyName = `TestCo ${ts}`;
  const contactName = `Test Contact ${ts}`;
  const projectName = `Test Project ${ts}`;

  console.log(`Using API base: ${BASE}`);

  // 1) Company
  const companyPayload = {
    name: companyName,
    type: 'Company',
    primaryContact: contactName, // will be created next
    status: 'Active',
    projects: projectName,
    totalPipeline: 10000,
    totalRevenue: 5000,
    notes: 'Created by test-create script',
  };
  const company = await postJson('companies', companyPayload);
  console.log('Created company:', company);

  // 2) Contact
  const contactPayload = {
    name: contactName,
    organization: companyName,
    role: 'CTO',
    email: `test+${ts}@example.com`,
    phone: '+1-555-0000',
    type: 'Decision Maker',
    projects: projectName,
    lastContact: today(),
    nextAction: 'Schedule demo',
    relationshipStrength: 'Strong',
    notes: 'Seed contact from script',
    tags: 'test,script',
  };
  const contact = await postJson('contacts', contactPayload);
  console.log('Created contact:', contact);

  // 3) Project
  const projectPayload = {
    name: projectName,
    company: companyName,
    status: 'Active',
    startDate: today(),
    revenueModel: 'Monthly Retainer',
    feeStructure: 'Fixed + Success',
    pipelineValue: 25000,
    actualRevenue: 0,
    stakeholders: contactName,
    nextMilestone: 'Kickoff',
    notes: 'Seed project from script',
  };
  const project = await postJson('projects', projectPayload);
  console.log('Created project:', project);

  // 4) Task
  const taskPayload = {
    taskName: `Intro Call ${ts}`,
    company: companyName,
    project: projectName,
    stakeholder: contactName,
    dueDate: today(),
    priority: 'High',
    status: 'Not Started',
    type: 'Task',
    notes: 'Seed task from script',
  };
  const task = await postJson('tasks', taskPayload);
  console.log('Created task:', task);

  console.log('\nAll test records created successfully.');
}

main().catch((err) => {
  console.error('Test creation failed:', err.message || err);
  process.exitCode = 1;
});


const express = require('express');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');

app.use(express.json());
app.use(express.static(__dirname));

function readSheet(sheetName) {
  const file = path.join(DATA_DIR, `${sheetName}.json`);
  if (!fs.existsSync(file)) {
    return { values: [] };
  }
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function writeSheet(sheetName, data) {
  const file = path.join(DATA_DIR, `${sheetName}.json`);
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

app.get('/api', (req, res) => {
  const { action, sheet: sheetName } = req.query;
  if (action === 'getAllData') {
    const data = {
      projects: readSheet('Projects').values.slice(1).map(row => ({
        Name: row[0],
        Company: row[1],
        Status: row[2],
        Stakeholders: row[8] // Needed by game-board network view
      })),
      // Include companies for richer dashboards and mappings
      companies: readSheet('Companies').values.slice(1).map(row => ({
        Name: row[0],
        Type: row[1],
        PrimaryContact: row[2],
        Status: row[3],
        Projects: row[4],
        TotalPipeline: row[5],
        TotalRevenue: row[6],
        Notes: row[7]
      })),
      // Include tasks so the dashboard can calculate counts and recency
      tasks: readSheet('Tasks').values.slice(1).map(row => ({
        'Task Name': row[0],
        Company: row[1],
        Project: row[2],
        Stakeholder: row[3],
        'Due Date': row[4],
        Priority: row[5],
        Status: row[6],
        Type: row[7],
        Notes: row[8],
        'Created Date': row[9],
        'Last Modified': row[10]
      })),
      contacts: readSheet('Contacts').values.slice(1).map(row => ({
        Name: row[0],
        Role: row[2],
        Organization: row[1],
        'Contact Type': row[5],
        'Relationship Strength': row[9],
        Notes: row[10]
      })),
      capitalScores: readSheet('CapitalScores').values.slice(1).map(row => ({
        ContactName: row[0],
        Economic: row[1],
        Social: row[2],
        Political: row[3],
        Career: row[4]
      })),
      relationships: readSheet('Relationships').values.slice(1).map(row => ({
        Source: row[0],
        Target: row[1],
        Strength: row[2]
      })),
      // Optional dataset to connect investors with startups
      investments: readSheet('Investments').values.slice(1).map(row => ({
        Investor: row[0],
        Startup: row[1],
        Stage: row[2],
        Amount: row[3],
        Status: row[4]
      }))
    };
    return res.json({ success: true, data });
  }

  if (!sheetName) {
    return res.status(400).json({ error: 'sheet query parameter is required' });
  }
  const data = readSheet(sheetName);
  res.json(data);
});

// Inject selected environment variables into client as window.__ENV__
app.get('/env.js', (req, res) => {
  const env = {
    SUPABASE_URL: process.env.SUPABASE_URL || '',
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || ''
  };
  res.setHeader('Content-Type', 'application/javascript');
  res.send(`window.__ENV__ = ${JSON.stringify(env)};`);
});

app.post('/api', (req, res) => {
  const { action, sheetName, formData } = req.body || {};
  if (action !== 'addData' || !sheetName || !formData) {
    return res.status(400).json({ success: false, message: 'Invalid payload' });
  }
  const sheet = readSheet(sheetName);
  if (!sheet.values || sheet.values.length === 0) {
    sheet.values = [Object.keys(formData)];
  }
  const headers = sheet.values[0];
  const row = headers.map(h => formData[h] || '');
  sheet.values.push(row);
  writeSheet(sheetName, sheet);
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

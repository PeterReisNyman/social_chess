# Social Chess Documentation

## Overview
Social Chess is a proof-of-concept productivity tool that mixes simple CRM features with a chess-themed game board. The application is composed of a static frontend and a lightweight Node.js backend that persists data in JSON files.

## Architecture
- **Frontend**: Plain HTML, Tailwind/Bootstrap styles and modular JavaScript files (`tasks.js`, `contacts.js`, etc.). Each module fetches data from the backend using the helper `buildApiUrl` defined in `config.js`.
- **Backend**: `server.js` uses [Express](https://expressjs.com/) to serve the static frontend and a small REST API. Data for each "sheet" is stored in `data/*.json` and mimics the structure of Google Sheets.
- **Data flow**: The frontend issues `GET /api?sheet=Tasks` style requests to retrieve data. Submissions from modal forms send a `POST /api` request with `{action:'addData', sheetName, formData}` which the server appends to the corresponding JSON file.

## Features
- Dashboard view summarising open tasks, recent interactions and network information.
- CRUD-like interfaces for tasks, contacts, projects and companies.
- Game board page that visualises projects and relationships as a network graph.
- JSON backed storage for quick local experimentation without external services.

## Running Locally
1. Install dependencies with `npm install`.
2. Start the server via `npm start`.
3. Navigate to `http://localhost:3000/index.html` to view the dashboard.

## Next Steps
- Replace JSON file storage with a real database (SQLite, PostgreSQL, etc.).
- Implement authentication and per-user data separation.
- Build an API layer that enforces validation and supports pagination/filtering.
- Enhance the game board with turn logic and persistence of game states.
- Add automated tests for both the backend and frontend logic.

## Future Ideas
- AI powered relationship insights using large language models.
- Real-time collaboration using WebSockets.
- Mobile-friendly layout and offline support.

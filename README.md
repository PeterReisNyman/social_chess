# Social Chess

A lightweight CRM and "game board" demo. The frontend is vanilla HTML/CSS/JS and the backend is a simple Express server that stores data in JSON files.

## Getting Started

```bash
npm install
npm start
```

Open http://localhost:3000/index.html in your browser.

Key pages:
- Dashboard: index.html
- Tasks: tasks.html
- Contacts: contacts.html
- Projects: projects.html
- Companies: companies.html
- Game Board (includes Influence Map): game-board.html

Influence Map prototype
- Go to Game Board, click the "Influence Map" view. Investors (Type = "Investor" in Companies.json) will render on the left, Startups (Type = "Startup") on the right. Links come from data/Investments.json. Sample data is included.

Full documentation is available in the [docs](docs/README.md) folder.

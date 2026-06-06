# LearnFast: AI Learning Companion

An AI-powered learning companion that generates personalized, interactive learning roadmaps for any coding or tech topic.

## Features

- **AI Roadmap Generation** - Enter any topic and get a structured learning path
- **Interactive Nodes** - Click any node to explore topics in depth
- **AI Chat Assistant** - Built-in tutor to answer questions
- **Knowledge Tests** - MCQ tests at every stage to validate learning
- **Project Generator** - Generate real-world project ideas
- **XP & Achievements** - Gamification to track progress
- **Progress Tracking** - Visual progress bars and completion stats

## Tech Stack

- **Frontend:** React 19 + Vite + Tailwind CSS + React Router
- **Backend:** Python FastAPI
- **AI:** Google Gemini 2.0 Flash (via `google-genai` SDK)

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.10+
- Google Gemini API key ([get one free](https://aistudio.google.com/apikey))

### Setup

1. **Clone and enter the project**

```bash
cd learnfast
```

2. **Backend setup**

```bash
cd backend
python -m venv venv

# Windows:
venv\Scripts\activate
# macOS/Linux:
# source venv/bin/activate

pip install -r requirements.txt
```

3. **Configure API key**

```bash
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY
```

4. **Start the backend**

```bash
uvicorn main:app --reload --port 8000
```

5. **Frontend setup** (new terminal)

```bash
cd frontend
npm install
npm run dev
```

6. Open http://localhost:5173 in your browser.

## Project Structure

```
learnfast/
├── backend/
│   ├── main.py              # FastAPI entry point
│   ├── requirements.txt
│   ├── .env.example
│   └── routers/
│       ├── roadmap.py       # Roadmap generation
│       ├── chat.py          # AI chat assistant
│       ├── tests.py         # Knowledge tests
│       └── projects.py      # Project generator
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   ├── index.css
│   │   ├── context/
│   │   │   └── AppContext.jsx
│   │   ├── hooks/
│   │   │   └── useApi.js
│   │   └── components/
│   │       ├── Navbar.jsx
│   │       ├── Hero.jsx
│   │       ├── Roadmap.jsx
│   │       ├── NodeDetail.jsx
│   │       ├── ChatAssistant.jsx
│   │       ├── Achievements.jsx
│   │       └── ProgressBar.jsx
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── index.html
└── README.md
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/roadmap` | Generate learning roadmap |
| POST | `/api/chat` | Chat with AI tutor |
| POST | `/api/generate-test` | Generate knowledge test |
| POST | `/api/generate-projects` | Generate practice projects |
| GET  | `/api/health` | Health check |

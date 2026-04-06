# Zala CRM

A full-stack real estate CRM platform for managing leads, running email campaigns, collaborating with teams, and tracking deals through customizable Kanban pipelines.

## Features

- **Lead Management** — Create, search, and track leads with linked properties, contacts, and addresses
- **Email Campaigns** — Build and send targeted email campaigns with Gmail API integration
- **Team Collaboration** — Manage teams with invitations, announcements, shared deals, and role-based access
- **Kanban Boards** — Customizable deal pipelines with drag-and-drop workflow stages
- **Property Tracking** — Store and organize property details, units, and images
- **Contact Management** — Maintain a database of contacts with full relationship mapping
- **Real-Time Updates** — WebSocket support for live notifications and collaboration
- **Google Integration** — OAuth authentication, Gmail sending, and Google Maps location features
- **CSV Import** — Batch import leads from spreadsheet data
- **Notifications & Tutorials** — In-app alerts and onboarding guides with progress tracking

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, TypeScript, Vite, TailwindCSS, Material UI, Zustand, React Router v7 |
| Backend | Python, FastAPI, SQLAlchemy 2.0, Pydantic v2, Uvicorn |
| Database | PostgreSQL |
| Integrations | Google OAuth, Gmail API, Google Maps, RapidAPI, OpenAI |

## Project Structure

```
├── ZalaFrontend/    # Main CRM frontend (React + TypeScript)
├── ZalaBackend/     # API server (FastAPI + PostgreSQL)
└── BigRealEstate/   # Property analysis tool (React + TypeScript)
```

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.13+
- PostgreSQL

### Backend

```bash
cd ZalaBackend
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
uvicorn app.main:app --reload
```

The API will be available at `http://127.0.0.1:8000`. See [ZalaBackend/API_ROUTES_README.md](ZalaBackend/API_ROUTES_README.md) for endpoint documentation.

### Frontend

```bash
cd ZalaFrontend
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

### Environment Variables

Create a `.env` file in `ZalaFrontend/`:

```
VITE_API_URL=http://127.0.0.1:8000
VITE_GOOGLE_MAPS_KEY=your_google_maps_key
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_GOOGLE_REDIRECT_URI=postmessage
VITE_GOOGLE_SCOPES=openid email profile https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/gmail.settings.basic
```

## Authors

Senior Project — 2026

- Andrew Moulton
- Colin Tondreau
- Jonathan Zhu
- Niccolls Evsseef
- Robert Huang

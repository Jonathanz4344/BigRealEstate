# Zala Backend (FastAPI)

Backend service for the **Zala** project, built with [FastAPI](https://fastapi.tiangolo.com/), [Uvicorn](https://www.uvicorn.org/), and [Pydantic v2](https://docs.pydantic.dev/).

---

## Requirements

- **Python 3.13 or higher** (tested with Python 3.13)
- **pip** for dependency management

---

## Project Structure

```text
ZalaBackend/
├── app/
│   ├── data/
│   │   └── mock_properties.json           # Mock property inventory used by search endpoints
│   ├── db/
│   │   ├── crud/                          # CRUD helpers (addresses, leads, campaigns, etc.)
│   │   ├── schema.sql                     # Core PostgreSQL schema
│   │   ├── data.sql                       # Seed data used during development
│   │   └── session.py                     # SQLAlchemy session configuration
│   ├── external_api/                      # Client wrappers for Google Places, RapidAPI, ToLeads
│   ├── models/                            # SQLAlchemy ORM models
│   ├── routes/                            # FastAPI routers (users, leads, campaigns, …)
│   ├── schemas/                           # Pydantic request/response models
│   ├── utils/                             # Utility helpers (e.g. geocoding)
│   └── main.py                            # FastAPI application entry point
├── scripts/                               # Helper scripts (data loading, tooling)
├── tests/                                 # Unit and integration tests
├── API_ROUTES_README.md                   # Endpoint documentation for frontend consumers
├── requirements.txt                       # Python dependencies
├── package.json / package-lock.json       # Frontend tooling configuration (if needed)
├── .env                                   # Local environment variables (not tracked)
├── __init__.py                            # Allows running `python -m app`
└── README.md                              # This guide
```

For a detailed endpoint catalogue, see `API_ROUTES_README.md`.

---

## Project Overview

The backend handles core application logic for Zala, including:

- User management and authentication
- Lead, property, and campaign handling
- Integration with external APIs (Google Maps, OAuth, etc.)
- RESTful endpoints consumed by the Zala frontend

For detailed API documentation, see `API_ROUTES_README.md`.

---

## Virtual Environment Setup

Creating a virtual environment ensures dependencies are isolated to this project.

### 🖥️ macOS / Linux

1. Navigate to the project root and create a virtual environment:

   ```
   cd ZalaBackend
   python3 -m venv venv
   ```

2. Activate the virtual environment:

   ```
   source venv/bin/activate
   ```

3. Install dependencies:

   ```
   pip install -r requirements.txt
   ```

4. Run the application:

   ```
   uvicorn app.main:app --reload
   ```

### 🪟 Windows (PowerShell)

1. Navigate to the project root and create a virtual environment:

   ```
   cd ZalaBackend
   py -m venv venv
   ```

2. Activate the virtual environment:

   ```
   .\venv\Scripts\activate
   ```

3. Install dependencies:

   ```
   py -m pip install -r requirements.txt
   ```

4. Run the application:

   ```
   py -m uvicorn app.main:app --reload
   ```

💡 Use `deactivate` to exit the virtual environment when finished.

---

## Running the API

From the project root (`ZalaBackend/`):

```
uvicorn app.main:app --reload
```

- **API Base URL:** [http://127.0.0.1:8000](http://127.0.0.1:8000)
- **Swagger Docs:** [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **ReDoc Docs:** [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)

If running from the `app/` directory, use:

```
uvicorn main:app --reload
```

Use `--reload` in development to automatically restart on file changes.

---

## Environment Variables

All environment variables are defined in a single `.env` file located in the project root (`ZalaBackend/`).

```
# ─── Database Configuration ─────────────────────────────
SQL_UNAME=<your_postgres_username>
SQL_PASSWORD=<your_postgres_password>
SQL_HOST=localhost
SQL_PORT=5432
SQL_DBNAME=zala_db

# ─── Google Cloud API Configuration (Maps / Geocoding) ─
GOOGLE_API_KEY=<your_google_maps_api_key>

# ─── Google OAuth 2.0 Authentication ────────────────────
GOOGLE_CLIENT_ID=<your_google_oauth_client_id>
GOOGLE_CLIENT_SECRET=<your_google_oauth_client_secret>

# ─── Lead Generation API Keys ────────────────────

RAPIDAPI_KEY=<your_rapid_api_key>
OPENAI_API_KEY=<your_open_ai_api_key>
BRAVE_API_KEY=<your_brave_api_key>

# ─── Frontend OAuth Integration (for React/Vite) ────────
VITE_GOOGLE_CLIENT_ID=<same_as_GOOGLE_CLIENT_ID_or_OAuth_client_id>
```

### How to Get These Values

#### 🗺️ Google API Key (for Maps and Geocoding)

1. Visit [Google Cloud Console](https://console.cloud.google.com/).
2. Create or select an existing project.
3. Enable the **Geocoding API**, **Places API**, and **Maps JavaScript API**.
4. Go to **APIs & Services → Credentials → Create Credentials → API Key**.
5. Copy the key and add it to your `.env` file:

   ```
   GOOGLE_API_KEY=<your_api_key>
   ```

#### 🔐 Google OAuth Client (for Sign-In)

1. In **Google Cloud Console**, open **APIs & Services → OAuth consent screen** and configure your app.
2. Go to **Credentials → Create Credentials → OAuth client ID → Web application**.
3. Add development origins:

   ```
   http://localhost:3000
   http://127.0.0.1:3000
   http://localhost:5173
   http://127.0.0.1:5173
   http://localhost:8000
   ```

4. Add redirect URIs:

   ```
   http://localhost:3000/auth/google/callback
   http://localhost:8000/docs/oauth2-redirect
   ```

5. Copy the generated Client ID and Secret into `.env`:

   ```
   GOOGLE_CLIENT_ID=<your_client_id>
   GOOGLE_CLIENT_SECRET=<your_client_secret>
   ```

6. Add the same Client ID to your frontend `.env`:

   ```
   VITE_GOOGLE_CLIENT_ID=<your_client_id>
   ```

#### 🧠 Lead Generation API Keys (RapidAPI, OpenAI, Brave Search)

These keys are used for intelligent lead generation, AI processing, and web data enrichment features.
Each service requires a developer account to generate and manage API credentials.

##### ⚡ RapidAPI Key

1. Visit [RapidAPI](https://rapidapi.com) and log in or create an account.
2. Navigate to the **"My Apps"** section from your dashboard.
3. Select an existing application or create a new one.
   Need to subscribe https://rapidapi.com/ntd119/api/zillow-com4/playground/apiendpoint_85a30d86-7f81-4503-b49e-0c6ffe1f5f97
4. Copy your personal API key.
5. Add it to your `.env` file as:

   ```
   RAPIDAPI_KEY=<your_rapid_api_key>
   ```

##### 🤖 OpenAI API Key

1. Go to [OpenAI API Keys](https://platform.openai.com/account/api-keys).
2. Sign in with your OpenAI account.
3. Click **“Create new secret key.”**
4. Copy the key immediately (it won’t be shown again).
5. Add it to your `.env` file as:

   ```
   OPENAI_API_KEY=<your_open_ai_api_key>
   ```

##### 🦁 Brave Search API Key

1. Visit [Brave Search API](https://api.search.brave.com).
2. Sign up or log in with your Brave account.
3. Go to your **Developer Dashboard**.
4. Locate your **Brave Search API key** under API credentials.
5. Add it to your `.env` file as:

   ```
   BRAVE_API_KEY=<your_brave_api_key>
   ```

#### 🧩 Database Variables

Use your PostgreSQL credentials to connect to your local or hosted database.

Example:

```
SQL_UNAME=postgres
SQL_PASSWORD=admin
SQL_HOST=localhost
SQL_PORT=5432
SQL_DBNAME=zala
```

⚠️ Do not commit your `.env` file or share credentials publicly.

---

## Testing

1. Ensure the server is running:

   ```
   uvicorn app.main:app --reload
   ```

2. Access documentation and test endpoints:

   - **Swagger UI:** [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
   - **ReDoc UI:** [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)

3. You can also test endpoints with:

   - [Postman](https://www.postman.com/)
   - [HTTPie](https://httpie.io/)
   - `curl` commands

---

## Development Notes

- Store sensitive configuration only in `.env`.
- The `/api` prefix is automatically applied to all routers in `app/main.py`.
- Use dedicated link/unlink endpoints for entity relationships instead of embedding IDs in create requests.
- Keep `API_ROUTES_README.md` updated with endpoint changes for frontend synchronization.
- Restart your FastAPI server after modifying `.env`.

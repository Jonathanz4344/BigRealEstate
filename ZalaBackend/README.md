# 🏗️ Zala Backend (FastAPI)

Backend service for the **Zala** project — built with [FastAPI](https://fastapi.tiangolo.com/), [Uvicorn](https://www.uvicorn.org/), and [Pydantic v2](https://docs.pydantic.dev/).

---

## ⚙️ Requirements

- **Python 3.13 or higher** (tested on Python 3.13)
- **pip** (Python package installer)

---

## 📁 Project Structure

 ```bash

ZalaBackend/
│
├── app/
  ├── db/        # DB logic (queries, migrations, etc.)
│ ├── main.py    # FastAPI entry point
│ ├── db.py      #  Database setup and connection
│ ├── models/    # Pydantic or ORM models
         └── lead.py  # Lead model (first name, last name, email, phone)
         └── location.py # Location filter model (zip, city, state, lat/lng)
│ ├── routes/    # API route definitions
         └── csv_intake.py # Upload and parse CSV/Excel leads
         └── location_filter.py # Flexible location filter + geocoding
│ ├── utils/     # Helper functions and utilities
         └── geocode.py # Google Maps geocoder (need google maps env)
│ ├── tests/     # Unit/integration tests
│ ├── .env       # Environment variables (DB URLs, secrets, etc.)
│ └── .gitignore # Ignored files for Git
│
├── requirements.txt # Project dependencies
└── README.md # Setup and usage guide

```

## 🧩 Setting Up Your Environment (Windows)

### 1. **Verify Python**

   ```bash
   py --version

   Must be Python 3.13 or higher
   ```

2. Must be 3.13 or higher.

3. py -m pip install -r requirements.txt

## Running the Server

```bash

From Project Root (ZalaBackend/)

py -m uvicorn app.main:app --reload

```

1. App runs at: http://127.0.0.1:8000

2. Interactive docs: http://127.0.0.1:8000/docs

3. Alternative docs: http://127.0.0.1:8000/redoc


```bash

If Youre Inside the app Folder

py -m uvicorn main:app --reload

```

## How FastAPI Works

1. FastAPI app instance

 ```bash

Creates a single FastAPI app.

Includes modular route files using include_router().

```

## Testing Your API
1. Run your app:
   py -m uvicorn app.main:app --reload

2. Visit:

   1. Swagger UI → http://127.0.0.1:8000/docs
   2. ReDoc → http://127.0.0.1:8000/redoc

## Automatic Documentation

```bash

FastAPI automatically generates documentation endpoints:

/docs → Swagger UI (interactive testing)

/redoc → ReDoc (clean read-only documentation)

Both stay updated automatically as you add new routes or models.

```

## Development Notes

```bash
Use --reload during development for hot-reload.

Use environment variables in .env for configs (DB URLs, secrets, etc.).

```






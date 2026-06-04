# Video Synopsis AI

AI-powered tool that takes a YouTube video URL and returns a structured synopsis — with transcript, summary, and downloadable PDF/DOCX.

---

## Who is working on what

| Module | Name | Role | Works in |
|--------|------|------|----------|
| M1 | - | Infrastructure & DevOps | `docker-compose.yml`, project setup |
| M2 | — | Frontend Developer | `frontend/` |
| M3 | — | YouTube Ingestion Engineer | `backend/fastAPI/` |
| M4 | — | AI & Transcription Engineer | `backend/fastAPI/` |
| M5 | — | LLM / Summarization Engineer | `backend/fastAPI/` |
| M6 | — | Document & Export Engineer | `backend/fastAPI/` |

> M2 only works in the `frontend/` folder.  
> M3–M6 only work in the `backend/fastAPI/` folder.  
> Nobody touches `docker-compose.yml` except M1.

---

## What is running where

| Service | URL | What it is |
|---------|-----|------------|
| React frontend | http://localhost:5173 | The UI — M2 works here |
| Node / Express | http://localhost:3001 | Auth API (login, register, JWT) |
| FastAPI | http://localhost:8000 | AI API (video processing, synopsis) |
| FastAPI docs | http://localhost:8000/docs | Auto-generated API explorer — test endpoints here |
| PostgreSQL | localhost:5432 | User accounts database |
| MongoDB | localhost:27017 | Transcripts and synopses database |
| MongoDB UI | http://localhost:8081 | Visual browser for MongoDB data |
| Redis | localhost:6379 | Background task queue |
| MinIO | http://localhost:9000 | File storage (audio, PDFs) |
| MinIO dashboard | http://localhost:9001 | Visual browser for stored files |

---

## Tech stack

- **Frontend** — React + Vite
- **Auth backend** — Node.js + Express
- **AI backend** — Python + FastAPI
- **User data** — PostgreSQL
- **Synopses / transcripts** — MongoDB
- **Task queue** — Redis + Celery
- **File storage** — MinIO (local S3)

---

## Setup — do this once

### 1. Prerequisites

Install these on your machine before anything else.

| Tool | Install |
|------|---------|
| Git | https://git-scm.com |
| Node 20 | https://nodejs.org (download LTS) |
| Python 3.11 | `brew install python@3.11` |
| Docker Desktop | https://www.docker.com/products/docker-desktop |

After installing Docker Desktop, open it and leave it running in the background. You don't need to do anything else with it.

Verify everything is installed:
```bash
node --version       # should show v20.x.x
python3 --version    # should show 3.11.x
docker --version     # should show Docker version 24.x or higher
git --version        # should show git version 2.x
```

---

### 2. Clone the repo

```bash
git clone https://github.com/bonunithinkumar/video-synopsis-ai.git
cd video-synopsis-ai
```

---

### 3. Set up your .env file

```bash
cp .env.example .env
```

Now open `.env` in VS Code and fill in the two values marked below. Everything else is already correct and matches the Docker setup — do not change the database URLs.

```env
# ── Databases (keep exactly as-is) ──────────────────────────
DATABASE_URL=postgresql://admin:qwert@localhost:5432/video_synopsis
MONGO_URL=mongodb://admin:qwert@localhost:27017
REDIS_URL=redis://localhost:6379/0
MINIO_URL=http://localhost:9000
MINIO_ROOT_USER=admin
MINIO_ROOT_PASSWORD=password123

# ── You must fill these in yourself ─────────────────────────

# Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET=REPLACE_THIS

# Get from: https://platform.openai.com/api-keys
OPENAI_API_KEY=REPLACE_THIS

# ── Frontend (Vite) ──────────────────────────────────────────
VITE_NODE_API_URL=http://localhost:3001
VITE_AI_API_URL=http://localhost:8000

# ── App ──────────────────────────────────────────────────────
NODE_ENV=development
PORT=3001
```

To generate your JWT secret, run this in terminal and paste the output:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

> ⚠️ Never commit your `.env` file. It is already in `.gitignore`.  
> Every teammate has their own `.env` with their own OpenAI key.

---

### 4. Start the databases

This starts PostgreSQL, MongoDB, Redis, and MinIO in the background using Docker. You only need this one command — Docker does the rest silently.

```bash
docker compose up -d
```

Verify all images are present:
```bash
docker images
```

Verify all 5 containers are green in Docker Desktop, or run:
```bash
docker ps
```

You should see: `postgres`, `mongodb`, `redis`, `minio`, `mongo-express` — all with status `Up`.

To stop them at end of day:
```bash
docker compose down
```

---

## Daily workflow — start your service

Open a separate terminal tab for each service you work on.

### Frontend — M2

```bash
# First time only
cd frontend
npm install

# Every day
npm run dev
```

Open http://localhost:5173

---

### Node / Express backend

```bash
# First time only
cd backend/node
npm install

# Every day
npm run dev
```

Open http://localhost:3001

---

### FastAPI backend — M3, M4, M5, M6

```bash
# First time only
cd backend/fastAPI
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Every day
source venv/bin/activate
uvicorn main:app --reload --port 8000
```

Open http://localhost:8000/docs

> Every time you open a new terminal for FastAPI, run `source venv/bin/activate` first. Your terminal prompt will show `(venv)` when it is active.

> Every time you install a new package, run `pip freeze > requirements.txt` immediately so teammates get the same packages.

---

## Folder structure

```
video-synopsis-ai/
│
├── docker-compose.yml        ← M1 only. Do not edit.
├── .env.example              ← Template. Copy to .env and fill in keys.
├── .env                      ← Never committed. Your local secrets.
├── .gitignore
├── README.md
│
├── frontend/                 ← M2 works here entirely
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   └── hooks/
│   ├── package.json
│   └── vite.config.js
│
└── backend/
    ├── node/                 ← Auth backend (login, register, JWT)
    │   ├── server.js         ← Entry point
    │   ├── routes/
    │   │   └── auth.js
    │   └── package.json
    │
    └── fastAPI/              ← M3, M4, M5, M6 all work here
        ├── main.py           ← Entry point, all routes registered here
        ├── requirements.txt  ← Add packages here after pip install
        ├── routers/
        │   ├── videos.py     ← M3: YouTube ingestion routes
        │   ├── transcription.py  ← M4: Whisper transcription routes
        │   ├── synopsis.py   ← M5: GPT-4o summarization routes
        │   └── export.py     ← M6: PDF/DOCX export routes
        ├── tasks/
        │   ├── ingest.py     ← M3: Celery tasks
        │   ├── transcribe.py ← M4: Celery tasks
        │   └── summarize.py  ← M5: Celery tasks
        ├── models/
        │   └── synopsis.py   ← MongoDB document schemas
        └── services/
            └── storage.py    ← M6: MinIO upload/download
```

---

## How to connect to each database

Use the values from your `.env` file. Examples below use the default credentials.

### PostgreSQL

Used by: Node/Express backend for user accounts.

```javascript
// Node.js (pg library)
const { Pool } = require('pg')
const pool = new Pool({ connectionString: process.env.DATABASE_URL })
```

Connect with a GUI (TablePlus, DBeaver):
- Host: `localhost` · Port: `5432`
- User: `admin` · Password: `qwert`
- Database: `video_synopsis`

---

### MongoDB

Used by: FastAPI backend for transcripts and synopses.

```python
# Python (motor — async)
import motor.motor_asyncio
client = motor.motor_asyncio.AsyncIOMotorClient(os.getenv("MONGO_URL"))
db = client["video_synopsis"]
```

Connect with MongoDB Compass GUI:
- URI: `mongodb://admin:qwert@localhost:27017`

Or open the browser UI at http://localhost:8081

---

### Redis

Used by: FastAPI + Celery for background task queue.

```python
# Python (redis library)
import redis
r = redis.from_url(os.getenv("REDIS_URL"))
```

---

### MinIO (file storage)

Used by: M3 for audio uploads, M6 for PDF/DOCX uploads.

```python
# Python (boto3)
import boto3
s3 = boto3.client(
    "s3",
    endpoint_url=os.getenv("MINIO_URL"),
    aws_access_key_id=os.getenv("MINIO_ROOT_USER"),
    aws_secret_access_key=os.getenv("MINIO_ROOT_PASSWORD"),
)
```

Open the browser dashboard at http://localhost:9001  
Login: `admin` / `password123`


---

## Common errors and fixes

**`docker-compose up -d` fails — port already in use**
Something on your Mac is already using that port (common with Postgres). Change the host port in `docker-compose.yml` — e.g. `5433:5432` — and update your `.env` accordingly.

**FastAPI: `ModuleNotFoundError`**
You forgot to activate the virtual environment. Run `source venv/bin/activate` first.

**FastAPI: new package not found by teammates**
You installed a package but forgot to run `pip freeze > requirements.txt`. Run it now and push.

**Node: `Cannot find module`**
Run `npm install` in the `backend/node` folder.

**MongoDB connection refused**
Docker isn't running. Open Docker Desktop and run `docker-compose up -d`.

**`OPENAI_API_KEY` error in FastAPI**
You haven't filled in your `.env`. Get a key from https://platform.openai.com/api-keys

---

## Git rules

- Always pull before starting work: `git pull origin main`
- Create a branch for your feature: `git checkout -b m2/login-page`
- Never commit directly to `main`
- Never commit `.env` or `node_modules/` or `venv/`
- Keep your `requirements.txt` up to date if you add Python packages
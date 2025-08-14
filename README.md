# Fake News Detector
>Paste an article and get a Fake/Real verdict from a RoBERTa classifier, with evidence (FAISS/RAG) and LLM explanation.

[![Next.js](https://img.shields.io/badge/Next.js-000000?logo=nextdotjs&logoColor=white&style=for-the-badge)](#)
[![React](https://img.shields.io/badge/React-149ECA?logo=react&logoColor=white&style=for-the-badge)](#)
[![Chakra UI](https://img.shields.io/badge/Chakra%20UI-3CC7BD?logo=chakraui&logoColor=white&style=for-the-badge)](#)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-38B2AC?logo=tailwindcss&logoColor=white&style=for-the-badge)](#)
[![TanStack Query](https://img.shields.io/badge/TanStack%20Query-FF4154?logo=reactquery&logoColor=white&style=for-the-badge)](#)
[![FastAPI](https://img.shields.io/badge/FastAPI-05998B?logo=fastapi&logoColor=white&style=for-the-badge)](#)
[![Python](https://img.shields.io/badge/Python-3776AB?logo=python&logoColor=white&style=for-the-badge)](#)
[![Uvicorn](https://img.shields.io/badge/Uvicorn-222?style=for-the-badge)](#)
[![Hugging Face](https://img.shields.io/badge/Hugging%20Face-FFCC4D?logo=huggingface&logoColor=black&style=for-the-badge)](#)
[![FAISS](https://img.shields.io/badge/FAISS-0052CC?style=for-the-badge)](#)
[![OpenAI](https://img.shields.io/badge/OpenAI-412991?logo=openai&logoColor=white&style=for-the-badge)](#)
[![Docker](https://img.shields.io/badge/Docker-2496ED?logo=docker&logoColor=white&style=for-the-badge)](#)

**Deploy:**  
[![Frontend on Vercel](https://img.shields.io/badge/Frontend-Vercel-000000?logo=vercel&logoColor=white&style=for-the-badge)](#)
[![Backend on Render](https://img.shields.io/badge/Backend-Render-46E3B7?logo=render&logoColor=000&style=for-the-badge)](#)



---

## Getting Started

### Prerequisites

- **Python** 3.10+  
- **Node.js** 18+ & **npm**  
- **Docker****

### 1. Clone the repo

```bash
git clone git@github.com:ThedysonLuzon/fake-news-detect.git
cd fake-news-detect
```

### 2. Backend Setup
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

uvicorn app.main:app --reload --port 8000
# http://localhost:8000/health  -> {"status":"ok"}
# http://localhost:8000/docs    -> Swagger
```
Create `backend/.env`
```
# Allow local frontend
CORS_ORIGINS=http://localhost:3000

# Enable/disable heavy features (handy on low-memory hosts)
USE_RAG=1
USE_EXPLAINER=1

# OpenAI key for LLM explanation (USE_EXPLAINER=1)
OPENAI_API_KEY=sk-...

# ONLY if download from GCS at runtime
# GOOGLE_APPLICATION_CREDENTIALS=/absolute/path/to/gcp-sa.json

TOKENIZERS_PARALLELISM=false
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install --legacy-peer-deps
npm run dev
```

# Project Structure
```ruby
fake-news-detect/
    ├── README.md
    ├── backend/
    │   ├── Dockerfile
    │   ├── entrypoint.sh
    │   ├── requirements.txt
    │   ├── .dockerignore
    │   ├── app/
    │   │   ├── fnd_bridge.py
    │   │   └── main.py
    │   └── vendor/
    │       └── fnd/
    └── frontend/
        ├── README.md
        ├── eslint.config.mjs
        ├── next.config.ts
        ├── package-lock.json
        ├── package.json
        ├── postcss.config.mjs
        ├── tailwind.config.js
        ├── tsconfig.json
        ├── .gitignore
        ├── app/
        │   ├── globals.css
        │   ├── layout.tsx
        │   ├── page.tsx
        │   ├── analyze/
        │   │   └── page.tsx
        │   └── api/
        │       └── analyze/
        │           └── route.ts
        ├── components/
        │   ├── AnalyzeForm.tsx
        │   └── ResultPanel.tsx
        ├── hooks/
        │   └── useAnalyze.tsx
        ├── public/
        └── theme/
            └── index.ts

```

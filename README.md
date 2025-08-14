# Fake News Detector
>Paste an article and get a Fake/Real verdict from a RoBERTa classifier, with optional evidence (FAISS/RAG) and LLM explanation.

- **Frontend**: Next.js (App Router), React, Chakra UI, TanStack React Query
- **Backend**: FastAPI (Python 3.12)
- **ML bits**: Hugging Face Transformers, optional FAISS retriever, optional OpenAI explainer
- **Vendors** included: integrates code adapted from `agilancan/Fake-News-Detection`

---

## Getting Started

### Prerequisites

- **Python** 3.10+  
- **Node.js** 18+ & **npm**  
- **Docker** & **Docker Compose**

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

# OpenAI key for LLM explanation (if USE_EXPLAINER=1)
OPENAI_API_KEY=sk-...

# ONLY if you truly download from GCS at runtime
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

# Fake News Detector

> A web application that classifies articles as **real** or **fake** using a transformer-based classifier, context retrieval, and LLM-generated explanations.

---

## Tech Stack

- **Backend**: FastAPI, Python 3.12, Uvicorn  
- **Frontend**: Next.js 15, React 19, Chakra UI, Tailwind CSS, TanStack React Query  
- **AI Components**: Hugging Face Transformers (BERT/RoBERTa), FAISS vector store, OpenAI API for explanations  
- **Containerization**: Docker & Docker Compose 
- **Infrastructure as Code**: Terraform (in `infra/`)  

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

# Run FastAPI server
uvicorn app.main:app --reload --port 8000 
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install --legacy-peer-deps
npm run dev
```

```ruby
fake-news-detect/
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI app & endpoints
│   │   ├── classifier.py    # classification logic
│   │   ├── retriever.py     # FAISS/RAG retrieval
│   │   └── explainer.py     # OpenAI explanation calls
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/
│   ├── app/                 # Next.js App Router pages & layout
│   ├── components/          # AnalyzeForm, ResultPanel, etc.
│   ├── hooks/               # useAnalyze.ts
│   ├── theme/               # Chakra theme overrides
│   ├── public/              # static assets (favicon, logos)
│   ├── package.json
│   ├── next.config.js
│   ├── tailwind.config.js
│   └── tsconfig.json
│
├── data/                    # scripts to ingest & preprocess source corpora
├── models/                  # saved ML model artifacts
├── infra/                   # Terraform modules for cloud infra
├── docker-compose.yml
├── .gitignore
└── README.md

```

### Contributing

> - Fork the repo 
> - Create a feature branch: git checkout -b feature/XYZ
> - Commit your changes: git commit -m "feat: add XYZ"
> - Push to your branch and open a PR
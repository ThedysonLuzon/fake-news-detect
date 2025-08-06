# backend/app/main.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# 1) Define your request model
class AnalyzeRequest(BaseModel):
    text: str

# 2) Create FastAPI app
app = FastAPI(title="Fake News Detector")

# 3) Configure CORS
origins = [
    "http://localhost:3000",  # your Next.js dev server
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],      # allow GET, POST, OPTIONS, etc.
    allow_headers=["*"],      # allow all headers
)

# 4) Health check
@app.get("/health")
def health_check():
    return {"status": "ok"}

# 5) Analyze endpoint
@app.post("/analyze")
def analyze_news(req: AnalyzeRequest):
    text = req.text

    # TODO: replace this placeholder logic with your classifier + retriever + explainer
    if not text.strip():
        raise HTTPException(status_code=400, detail="No text provided")

    return {
        "label": "real",
        "score": 0.95,
        "snippets": [
            "“In today’s news…”",
            "“According to Reuters…”",
        ],
        "explanation": "The article cites multiple reputable sources."
    }

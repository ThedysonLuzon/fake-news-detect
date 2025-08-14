# backend/app/main.py
from __future__ import annotations
import os
from pathlib import Path
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv  # ← add

from .fnd_bridge import analyze_article, warmup

# --- load env early (backend/.env) ---
BASE_DIR = Path(__file__).resolve().parents[1]
load_dotenv(BASE_DIR / ".env")  # will set GCP_SA_KEY, CORS_ORIGINS, etc.

class AnalyzeRequest(BaseModel):
    title: str = ""
    text: str
    k: int | None = 3

class EvidenceModel(BaseModel):
    doc_id: str
    chunk_id: int
    snippet: str

class AnalyzeResponse(BaseModel):
    label: str
    score: float
    evidence: list[EvidenceModel]
    explanation: dict | None

app = FastAPI(title="Fake News Detector")

origins = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in origins],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def _startup():
    # Don't crash the server if warmup fails — log and keep going so you can hit /debug/fnd
    try:
        warmup()
    except Exception as e:
        print(f"[startup] warmup failed: {e}")

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.get("/debug/fnd")
def debug_fnd():
    return warmup()

@app.post("/analyze", response_model=AnalyzeResponse)
def analyze_news(req: AnalyzeRequest):
    if not req.text.strip():
        raise HTTPException(status_code=400, detail="No text provided")
    try:
        res = analyze_article(req.title, req.text, k=req.k or 3)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    return AnalyzeResponse(
        label=res.label,
        score=res.score,
        evidence=[EvidenceModel(**e.__dict__) for e in res.evidence],
        explanation=res.explanation if isinstance(res.explanation, dict) else None,
    )

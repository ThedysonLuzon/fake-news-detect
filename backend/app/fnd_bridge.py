# backend/app/fnd_bridge.py
from __future__ import annotations
import json, os
from dataclasses import dataclass
from importlib.util import spec_from_file_location, module_from_spec
from pathlib import Path
from typing import Any, Dict, List, Optional
from contextlib import contextmanager

from google.oauth2 import service_account
from google.cloud import storage

BASE_DIR = Path(__file__).resolve().parents[1]
VENDOR_DIRS = [BASE_DIR / "vendor" / "fnd", BASE_DIR / "vendor" / "fnp"]  # support both

@contextmanager
def _cwd(path: Path):
    old = Path.cwd()
    os.chdir(path)
    try:
        yield
    finally:
        os.chdir(old)

def _load_vendor_module(module_name: str, rel_path: str):
    """Try fnd then fnp; chdir into vendor root so relative paths inside module work."""
    last_err = None
    for vd in VENDOR_DIRS:
        file_path = vd / rel_path
        if file_path.exists():
            try:
                with _cwd(vd):
                    spec = spec_from_file_location(module_name, file_path)
                    if spec is None or spec.loader is None:
                        raise ImportError(f"Spec not loadable for {file_path}")
                    mod = module_from_spec(spec)
                    spec.loader.exec_module(mod)  # type: ignore[attr-defined]
                    return mod, vd
            except Exception as e:
                last_err = e
                continue
    raise ImportError(f"Could not load {rel_path} from any vendor dir ({VENDOR_DIRS}). Last error: {last_err}")

def _ensure_gcp_auth():
    """
    Find a valid service-account JSON and export an ABSOLUTE
    GOOGLE_APPLICATION_CREDENTIALS so vendor code can use it even when we chdir.
    """
    default_secret = BASE_DIR / "secrets" / "gcp-sa.json"
    candidates = [
        os.getenv("GCP_SA_KEY"),
        os.getenv("GOOGLE_APPLICATION_CREDENTIALS"),
        str(default_secret),
    ]

    sa_path = None
    for p in candidates:
        if not p:
            continue
        cand = Path(p)
        # Resolve relative paths against the backend BASE_DIR, not cwd
        if not cand.is_absolute():
            cand = (BASE_DIR / cand).resolve()
        if cand.exists():
            sa_path = cand
            break

    if not sa_path:
        tried = []
        for p in candidates:
            if not p:
                continue
            cand = Path(p)
            if not cand.is_absolute():
                cand = (BASE_DIR / cand).resolve()
            tried.append(str(cand))
        raise FileNotFoundError(
            "GCP service account key not found.\n"
            "Tried:\n- " + "\n- ".join(tried or ["<none>"]) + "\n"
            "Fix by either:\n"
            "  1) placing a key at backend/secrets/gcp-sa.json, or\n"
            "  2) setting GCP_SA_KEY=/absolute/path/to/your-key.json in backend/.env"
        )

    # Validate and export absolute path
    from google.oauth2 import service_account
    from google.cloud import storage
    creds = service_account.Credentials.from_service_account_file(str(sa_path))
    storage.Client(project=creds.project_id, credentials=creds)  # fail fast
    os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = str(sa_path)


@dataclass
class Evidence:
    doc_id: str
    chunk_id: int
    snippet: str

@dataclass
class AnalysisResult:
    label: str
    score: float
    evidence: List[Evidence]
    explanation: Optional[Dict[str, Any]]
    raw_classifier: Dict[str, Any]

_predictor = None
_retriever = None
_explainer = None
_src = {"predictor": None, "retriever": None, "explainer": None}
_loaded = False

def _first_attr(mod: Any, names: List[str]):
    for n in names:
        if hasattr(mod, n):
            return n, getattr(mod, n)
    return None, None

def _init_once():
    global _predictor, _retriever, _explainer, _loaded
    if _loaded:
        return
    _ensure_gcp_auth()

    # predictor (required)
    _predictor, pred_dir = _load_vendor_module("v_pred", "app/predictor.py")
    _src["predictor"] = str(pred_dir)

    # retriever (optional)
    try:
        _retriever, ret_dir = _load_vendor_module("v_ret", "app/retriever.py")
        _src["retriever"] = str(ret_dir)
    except Exception:
        _retriever = None
        _src["retriever"] = None

    # explainer (optional)
    try:
        _explainer, exp_dir = _load_vendor_module("v_exp", "app/explainer.py")
        _src["explainer"] = str(exp_dir)
    except Exception:
        _explainer = None
        _src["explainer"] = None

    _loaded = True

def warmup() -> Dict[str, Any]:
    _init_once()
    pred_funcs = [n for n in dir(_predictor) if not n.startswith("_")] if _predictor else []
    ret_funcs = [n for n in dir(_retriever) if not n.startswith("_")] if _retriever else []
    exp_funcs = [n for n in dir(_explainer) if not n.startswith("_")] if _explainer else []
    return {
        "predictor_loaded": _predictor is not None,
        "retriever_loaded": _retriever is not None,
        "explainer_loaded": _explainer is not None,
        "predictor_funcs": pred_funcs,
        "retriever_funcs": ret_funcs,
        "explainer_funcs": exp_funcs,
        "sources": _src,
    }

def analyze_article(title: str, text: str, k: int = 3) -> AnalysisResult:
    _init_once()

    # classifier
    _, cls_fn = _first_attr(_predictor, ["classify_article", "classify", "predict"])
    if not cls_fn:
        raise RuntimeError("predictor has no classify_article/classify/predict")
    cls_out = cls_fn(text)
    label = str(cls_out.get("label", "Unknown"))
    probs = cls_out.get("probs") or cls_out.get("probabilities") or []
    score = float(probs[1]) if isinstance(probs, (list, tuple)) and len(probs) >= 2 else float(cls_out.get("score", 0.5))

    # retriever -> evidence
    evidence: List[Evidence] = []
    if _retriever:
        _, ctx_fn = _first_attr(_retriever, ["get_context", "retrieve_evidence", "retrieve_top_k", "search"])
        if ctx_fn:
            try:
                ctx = ctx_fn(text, k=k)
            except TypeError:
                ctx = ctx_fn(text)
            if isinstance(ctx, list):
                for r in ctx:
                    meta = r.get("meta", {}) if isinstance(r, dict) else {}
                    doc_id = str(meta.get("doc_id", meta.get("source", "")))
                    chunk_id = int(meta.get("chunk_id", 0)) if meta else 0
                    snippet = (r.get("text") or meta.get("snippet") or "")[:300]
                    evidence.append(Evidence(doc_id=doc_id, chunk_id=chunk_id, snippet=snippet))

    # explainer
    explanation_obj: Optional[Dict[str, Any]] = None
    if _explainer:
        _, exp_fn = _first_attr(_explainer, ["explain_with_llm", "explain", "generate_explanation"])
        if exp_fn:
            try:
                raw = exp_fn(text, [{"text": e.snippet, "meta": {"doc_id": e.doc_id, "chunk_id": e.chunk_id}} for e in evidence])
            except TypeError:
                raw = exp_fn(text)
            if isinstance(raw, str):
                try:
                    explanation_obj = json.loads(raw)
                except Exception:
                    explanation_obj = {"verdict": label, "confidence": int(score * 100), "explanation": raw[:800]}
            elif isinstance(raw, dict):
                explanation_obj = raw

    return AnalysisResult(
        label=label,
        score=score,
        evidence=evidence,
        explanation=explanation_obj,
        raw_classifier=cls_out,
    )

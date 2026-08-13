import json
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session
from database import get_db, ReviewSession, User
from auth import get_current_user
from reviewer_engine import IntelligentReviewerEngine

router = APIRouter(prefix="/api/reviews", tags=["reviews"])


class SubmitCodeRequest(BaseModel):
    title: Optional[str] = "Source Code Review"
    language: str
    source_code: str
    api_key_override: Optional[str] = None
    save_session: bool = True


class BatchReviewItem(BaseModel):
    filename: str
    language: str
    source_code: str


class BatchReviewRequest(BaseModel):
    files: List[BatchReviewItem]


@router.post("/evaluate")
def evaluate_code(
    req: SubmitCodeRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not req.source_code.strip():
        raise HTTPException(status_code=400, detail="Source code cannot be empty")

    result = IntelligentReviewerEngine.evaluate_code(
        source_code=req.source_code,
        language=req.language,
        title=req.title or "Untitled Review",
        db=db,
        api_key_override=req.api_key_override
    )

    session_id = None
    if req.save_session:
        session = ReviewSession(
            user_id=current_user.id,
            title=result["title"],
            language=result["language"],
            source_code=req.source_code,
            quality_score=result["quality_score"],
            grade=result["grade"],
            summary=result["summary"],
            category_scores_json=json.dumps(result["category_scores"]),
            issues_json=json.dumps(result["issues"]),
            grounded_rules_json=json.dumps(result["grounded_rules"]),
            refactored_code=result["refactored_code"],
            metrics_json=json.dumps(result["metrics"])
        )
        db.add(session)
        db.commit()
        db.refresh(session)
        session_id = session.id

    result["session_id"] = session_id
    return result


@router.post("/batch")
def evaluate_batch(
    req: BatchReviewRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not req.files:
        raise HTTPException(status_code=400, detail="File list cannot be empty")

    results = []
    total_score = 0.0

    for file_item in req.files:
        res = IntelligentReviewerEngine.evaluate_code(
            source_code=file_item.source_code,
            language=file_item.language,
            title=file_item.filename,
            db=db
        )
        total_score += res["quality_score"]

        # Persist session
        session = ReviewSession(
            user_id=current_user.id,
            title=file_item.filename,
            language=file_item.language,
            source_code=file_item.source_code,
            quality_score=res["quality_score"],
            grade=res["grade"],
            summary=res["summary"],
            category_scores_json=json.dumps(res["category_scores"]),
            issues_json=json.dumps(res["issues"]),
            grounded_rules_json=json.dumps(res["grounded_rules"]),
            refactored_code=res["refactored_code"],
            metrics_json=json.dumps(res["metrics"])
        )
        db.add(session)
        db.commit()
        db.refresh(session)

        res["session_id"] = session.id
        results.append(res)

    avg_score = round(total_score / len(req.files), 1)
    return {
        "files_analyzed": len(req.files),
        "project_average_score": avg_score,
        "results": results
    }


@router.get("/history")
def get_user_history(
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    sessions = (
        db.query(ReviewSession)
        .filter(ReviewSession.user_id == current_user.id)
        .order_by(ReviewSession.created_at.desc())
        .limit(limit)
        .all()
    )

    history = []
    for s in sessions:
        history.append({
            "id": s.id,
            "title": s.title,
            "language": s.language,
            "quality_score": s.quality_score,
            "grade": s.grade,
            "summary": s.summary[:200] + "..." if len(s.summary) > 200 else s.summary,
            "created_at": s.created_at.strftime("%Y-%m-%d %H:%M:%S")
        })

    return {"history": history, "count": len(history)}


@router.get("/{review_id}")
def get_review_detail(
    review_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    session = db.query(ReviewSession).filter(ReviewSession.id == review_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Review session not found")

    return {
        "id": session.id,
        "title": session.title,
        "language": session.language,
        "source_code": session.source_code,
        "quality_score": session.quality_score,
        "grade": session.grade,
        "summary": session.summary,
        "category_scores": json.loads(session.category_scores_json or "{}"),
        "issues": json.loads(session.issues_json or "[]"),
        "grounded_rules": json.loads(session.grounded_rules_json or "[]"),
        "refactored_code": session.refactored_code,
        "metrics": json.loads(session.metrics_json or "{}"),
        "created_at": session.created_at.strftime("%Y-%m-%d %H:%M:%S")
    }

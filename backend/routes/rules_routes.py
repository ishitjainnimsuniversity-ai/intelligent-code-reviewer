import io
import csv
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Response
from pydantic import BaseModel
from sqlalchemy.orm import Session
from database import get_db, HistoricalRule, User
from auth import get_current_user
from learning_engine import HistoricalLearningEngine

router = APIRouter(prefix="/api/rules", tags=["rules"])


class IngestCSVRequest(BaseModel):
    csv_content: str


class CreateRuleRequest(BaseModel):
    rule_id: Optional[int] = None
    type: str
    description: str
    severity: str = "HIGH"
    language_scope: str = "ALL"
    pattern_regex: Optional[str] = None


class TestRuleRequest(BaseModel):
    rule_id: Optional[int] = None
    type: str
    description: str
    pattern_regex: Optional[str] = None
    test_code: str
    language: str = "python"


@router.get("/")
def list_rules(
    type: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(HistoricalRule)
    if type:
        query = query.filter(HistoricalRule.type == type.lower())
    if search:
        query = query.filter(HistoricalRule.description.ilike(f"%{search}%"))

    rules = query.order_by(HistoricalRule.rule_id.asc()).all()
    return {
        "count": len(rules),
        "rules": [
            {
                "id": r.id,
                "rule_id": r.rule_id,
                "type": r.type,
                "description": r.description,
                "severity": r.severity,
                "language_scope": r.language_scope,
                "pattern_regex": r.pattern_regex,
                "deduction_weight": r.deduction_weight,
                "is_custom": r.is_custom,
                "created_at": r.created_at.strftime("%Y-%m-%d")
            }
            for r in rules
        ]
    }


@router.post("/ingest/text")
def ingest_csv_text(
    req: IngestCSVRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not req.csv_content.strip():
        raise HTTPException(status_code=400, detail="CSV content cannot be empty")

    stats = HistoricalLearningEngine.ingest_rules_to_db(req.csv_content, db, is_custom=True)
    return {
        "status": "success",
        "message": f"Successfully ingested {stats['parsed_count']} historical rules.",
        "stats": stats
    }


@router.post("/ingest/file")
async def ingest_csv_file(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    content = await file.read()
    try:
        text = content.decode("utf-8")
    except UnicodeDecodeError:
        text = content.decode("latin-1")

    stats = HistoricalLearningEngine.ingest_rules_to_db(text, db, is_custom=True)
    return {
        "status": "success",
        "filename": file.filename,
        "message": f"Successfully processed {file.filename}: added {stats['added_count']} new rules, updated {stats['updated_count']} rules.",
        "stats": stats
    }


@router.post("/create")
def create_rule(
    req: CreateRuleRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Auto-assign next rule_id if not provided
    if not req.rule_id:
        max_id = db.query(HistoricalRule.rule_id).order_by(HistoricalRule.rule_id.desc()).first()
        assigned_id = (max_id[0] + 1) if max_id else 1
    else:
        assigned_id = req.rule_id

    existing = db.query(HistoricalRule).filter(HistoricalRule.rule_id == assigned_id).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"Rule ID {assigned_id} already exists")

    rule = HistoricalRule(
        rule_id=assigned_id,
        type=req.type.lower(),
        description=req.description,
        pattern_regex=req.pattern_regex or HistoricalLearningEngine._synthesize_regex_from_description(req.description, req.type),
        severity=req.severity.upper(),
        language_scope=req.language_scope,
        is_custom=True
    )
    db.add(rule)
    db.commit()
    db.refresh(rule)

    return {"status": "created", "rule": {"rule_id": rule.rule_id, "type": rule.type, "description": rule.description}}


@router.post("/test")
def test_rule_pattern(req: TestRuleRequest):
    regex = req.pattern_regex or HistoricalLearningEngine._synthesize_regex_from_description(req.description, req.type)
    matches = []
    if regex:
        import re
        for idx, line in enumerate(req.test_code.split("\n")):
            if re.search(regex, line, re.IGNORECASE):
                matches.append({"line": idx + 1, "text": line.strip()})

    return {
        "pattern_used": regex,
        "matched": len(matches) > 0,
        "match_count": len(matches),
        "matches": matches
    }


@router.delete("/{rule_id}")
def delete_rule(
    rule_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    rule = db.query(HistoricalRule).filter(HistoricalRule.rule_id == rule_id).first()
    if not rule:
        raise HTTPException(status_code=404, detail="Rule not found")
    
    db.delete(rule)
    db.commit()
    return {"status": "deleted", "rule_id": rule_id}


@router.get("/export/csv")
def export_csv(db: Session = Depends(get_db)):
    rules = db.query(HistoricalRule).order_by(HistoricalRule.rule_id.asc()).all()
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["id", "type", "description"])
    for r in rules:
        writer.writerow([r.rule_id, r.type, r.description])
    
    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=learned_code_rules.csv"}
    )

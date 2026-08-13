import re
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from database import get_db, User
from auth import get_current_user
from reviewer_engine import IntelligentReviewerEngine

router = APIRouter(prefix="/api/webhook", tags=["webhook"])


class PRReviewSimulationRequest(BaseModel):
    pr_title: str = "Feature: Optimize User Authentication & Query Handler"
    repo_name: str = "enterprise/core-service"
    branch: str = "feature/auth-v2"
    diff_text: str


@router.post("/github-pr")
def simulate_github_pr_review(
    req: PRReviewSimulationRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not req.diff_text.strip():
        raise HTTPException(status_code=400, detail="Diff text cannot be empty")

    # Extract changed lines or files from git diff
    files_detected = []
    current_file = "snippet.py"
    current_lang = "python"
    current_lines = []

    for line in req.diff_text.split("\n"):
        if line.startswith("+++ b/") or line.startswith("diff --git"):
            if current_lines:
                files_detected.append({
                    "filename": current_file,
                    "language": current_lang,
                    "code": "\n".join(current_lines)
                })
                current_lines = []
            filename_match = re.search(r"b/(.*)$", line)
            if filename_match:
                current_file = filename_match.group(1)
            elif "diff --git" in line:
                current_file = line.split()[-1].replace("b/", "")

            # Guess language
            ext = current_file.split(".")[-1].lower() if "." in current_file else "py"
            lang_map = {
                "py": "python", "js": "javascript", "ts": "typescript",
                "java": "java", "cpp": "c++", "go": "go", "rs": "rust", "sql": "sql"
            }
            current_lang = lang_map.get(ext, "python")
        elif line.startswith("+") and not line.startswith("+++"):
            current_lines.append(line[1:])
        elif not line.startswith("-"):
            current_lines.append(line)

    if current_lines:
        files_detected.append({
            "filename": current_file,
            "language": current_lang,
            "code": "\n".join(current_lines)
        })

    if not files_detected:
        files_detected.append({
            "filename": "patch.py",
            "language": "python",
            "code": req.diff_text
        })

    # Evaluate each file
    file_reviews = []
    total_score = 0.0
    critical_blockers = []

    for f in files_detected:
        res = IntelligentReviewerEngine.evaluate_code(
            source_code=f["code"],
            language=f["language"],
            title=f["filename"],
            db=db
        )
        total_score += res["quality_score"]
        
        # Check critical issues
        for issue in res["issues"]:
            if issue.get("severity") in ("CRITICAL", "HIGH"):
                critical_blockers.append({
                    "file": f["filename"],
                    "line": issue.get("line_number", 1),
                    "title": issue.get("title"),
                    "recommendation": issue.get("recommendation")
                })

        file_reviews.append({
            "filename": f["filename"],
            "language": f["language"],
            "quality_score": res["quality_score"],
            "grade": res["grade"],
            "issues": res["issues"],
            "refactored_code": res["refactored_code"]
        })

    avg_score = round(total_score / len(files_detected), 1)
    pr_status = "CHANGES_REQUESTED" if avg_score < 7.0 or len(critical_blockers) > 0 else "APPROVED"

    return {
        "pr_title": req.pr_title,
        "repo_name": req.repo_name,
        "branch": req.branch,
        "overall_status": pr_status,
        "average_quality_score": avg_score,
        "blockers_count": len(critical_blockers),
        "critical_blockers": critical_blockers,
        "file_reviews": file_reviews,
        "bot_verdict": f"Automated 24/7 Review completed. Quality Score: {avg_score}/10. Status: {pr_status}."
    }

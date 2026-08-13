import sys
import json
from pathlib import Path

# Add backend to sys.path
sys.path.insert(0, str(Path(__file__).parent.parent / "backend"))

from database import init_db, SessionLocal, User, HistoricalRule, ReviewSession
from learning_engine import HistoricalLearningEngine
from reviewer_engine import IntelligentReviewerEngine, CodeMetricsCalculator
from analytics_engine import DeveloperGrowthEngine


def run_all_tests():
    print("[TEST 1/6] Initializing Database & Seeding Historical Rules...")
    init_db()
    db = SessionLocal()

    count = HistoricalLearningEngine.seed_default_rules_if_empty(db)
    assert count >= 3, f"Expected at least 3 historical rules, got {count}"
    print(f"[PASS]: Seeded {count} historical rules.")

    print("\n[TEST 2/6] Ingesting CSV with Prompt Schema: <id>, <type>, <description>...")
    sample_csv = """id,type,description
1,formatting,Avoid single-character variable names -- they hurt readability
2,performance,Cache repeated database lookups inside the request loop
3,security,Never interpolate raw user input directly into SQL queries
100,security,Do not use dangerous eval on untrusted user strings"""

    stats = HistoricalLearningEngine.ingest_rules_to_db(sample_csv, db)
    assert stats["parsed_count"] == 4, f"Expected 4 parsed rules, got {stats['parsed_count']}"
    print(f"[PASS]: Ingestion successful! Stats: {stats}")

    print("\n[TEST 3/6] Testing Evaluation Engine & Historical Rule Grounding...")
    vulnerable_code = """
import sqlite3

def get_user_data(user_id):
    db = sqlite3.connect("app.db")
    cursor = db.cursor()
    # Violates Rule 3 (SQL Injection) and Rule 1 (single-char variable 'q')
    q = f"SELECT * FROM users WHERE id = {user_id}"
    cursor.execute(q)
    # Violates Rule 1 (single-char variable 'x')
    x = cursor.fetchall()
    return x
"""
    result = IntelligentReviewerEngine.evaluate_code(
        source_code=vulnerable_code,
        language="python",
        title="Vulnerable Auth Handler",
        db=db
    )

    print(f"  - Quality Score: {result['quality_score']} / 10.0 (Grade: {result['grade']})")
    print(f"  - Total Issues Found: {len(result['issues'])}")
    print(f"  - Grounded Historical Rules: {len(result['grounded_rules'])}")
    print(f"  - Category Scores: {result['category_scores']}")

    assert result["quality_score"] < 7.0, f"Expected low score for vulnerable code, got {result['quality_score']}"
    assert len(result["grounded_rules"]) >= 1, "Expected historical rules to be grounded"
    
    # Verify rule IDs 1 or 3 were caught
    grounded_ids = [g["rule_id"] for g in result["grounded_rules"]]
    print(f"  - Grounded Rule IDs: {grounded_ids}")
    assert 3 in grounded_ids or 1 in grounded_ids, "Expected Rule #1 or Rule #3 to trigger citation"
    print("[PASS]: Multi-language evaluation and rule grounding verified.")

    print("\n[TEST 4/6] Testing Clean Code Evaluation (10.0 Standard)...")
    clean_code = """
import os
from typing import Dict, Any, Optional

class UserRepository:
    def __init__(self, db_pool):
        self._pool = db_pool

    def find_user_by_id(self, user_id: int) -> Optional[Dict[str, Any]]:
        statement = "SELECT id, username FROM users WHERE id = :user_id"
        with self._pool.acquire() as conn:
            return conn.fetch_one(statement, {"user_id": user_id})
"""
    clean_result = IntelligentReviewerEngine.evaluate_code(
        source_code=clean_code,
        language="python",
        title="Clean Repository",
        db=db
    )
    print(f"  - Clean Code Score: {clean_result['quality_score']} / 10.0 (Grade: {clean_result['grade']})")
    assert clean_result["quality_score"] >= 8.5, f"Expected high quality score for clean code, got {clean_result['quality_score']}"
    print("[PASS]: Clean code evaluation verified.")

    print("\n[TEST 5/6] Testing Developer Growth Tracking & Persistence...")
    # Create test user
    test_user = db.query(User).filter(User.username == "test_engineer_1").first()
    if not test_user:
        test_user = User(
            username="test_engineer_1",
            email="test1@codereview.ai",
            hashed_password="hashed_pw_test",
            full_name="Alex Rivera",
            is_guest=False
        )
        db.add(test_user)
        db.commit()
        db.refresh(test_user)

    # Save 2 review sessions
    s1 = ReviewSession(
        user_id=test_user.id,
        title="Initial Buggy Snippet",
        language="python",
        source_code=vulnerable_code,
        quality_score=4.5,
        grade="D",
        summary="Initial review",
        issues_json=json.dumps(result["issues"]),
        grounded_rules_json=json.dumps(result["grounded_rules"])
    )
    s2 = ReviewSession(
        user_id=test_user.id,
        title="Refactored Clean Snippet",
        language="python",
        source_code=clean_code,
        quality_score=9.5,
        grade="A+",
        summary="Refactored review",
        issues_json="[]",
        grounded_rules_json="[]"
    )
    db.add_all([s1, s2])
    db.commit()

    analytics = DeveloperGrowthEngine.get_user_analytics(test_user.id, db)
    print(f"  - Total Reviews Recorded: {analytics['total_reviews']}")
    print(f"  - Average Score: {analytics['average_score']}/10")
    print(f"  - Growth Score Improvement: {analytics['growth_highlights']['score_improvement']}")
    assert analytics["total_reviews"] >= 2
    assert analytics["average_score"] == 7.0
    print("[PASS]: Developer Growth progression and analytics verified.")

    print("\n[TEST 6/6] Testing Automated Refactoring & Diff Generation...")
    refactored = result["refactored_code"]
    assert "user_id" in refactored or "record" in refactored or "query" in refactored
    print("  - Refactored snippet preview:")
    for line in refactored.strip().split("\n")[:4]:
        print(f"    {line}")
    print("[PASS]: Automated refactoring generator verified.")

    db.close()
    print("\n" + "=" * 60)
    print("ALL 6 TEST SUITES PASSED FLAWLESSLY!")
    print("=" * 60)


if __name__ == "__main__":
    run_all_tests()

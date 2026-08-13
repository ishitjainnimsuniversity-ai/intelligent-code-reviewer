import sys
import json
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent.parent / "backend"))

from database import init_db, SessionLocal, User, HistoricalRule
from learning_engine import HistoricalLearningEngine
from reviewer_engine import IntelligentReviewerEngine


SCENARIOS = [
    {
        "id": 1,
        "name": "Python SQL Injection & Hardcoded API Secret",
        "lang": "python",
        "code": """import os\nimport sqlite3\n\napi_key = "AIzaSyD9873498234798234729384729"\ndef get_user(uid):\n    q = f"SELECT * FROM users WHERE id = {uid}"\n    cursor.execute(q)\n    x = cursor.fetchall()\n    return x\n""",
        "min_issues": 2,
        "required_rules": [1, 3]
    },
    {
        "id": 2,
        "name": "JavaScript N+1 Query & Inefficient Loop Concat",
        "lang": "javascript",
        "code": """async function processOrders(orders) {\n  let log = "";\n  for (let i = 0; i < orders.length; i++) {\n    const o = orders[i];\n    const u = await db.users.findOne({ id: o.userId });\n    log += "Order: " + o.id + "\\n";\n  }\n  return log;\n}\n""",
        "min_issues": 1,
        "required_rules": [1, 2]
    },
    {
        "id": 3,
        "name": "Python Mutable Defaults & Disabled SSL Verification",
        "lang": "python",
        "code": """import requests\n\ndef sync_batch(items=[], env="prod"):\n    resp = requests.post("https://api.internal/sync", json=items, verify=False)\n    try:\n        return resp.json()\n    except:\n        pass\n""",
        "min_issues": 2,
        "required_rules": [13, 17]
    },
    {
        "id": 4,
        "name": "Java Single Character Variables & Magic Numbers",
        "lang": "java",
        "code": """public class InvoiceService {\n    public double computeTotal(double a, double b) {\n        double x = a * 86400;\n        double y = b * 3600;\n        return x + y;\n    }\n}\n""",
        "min_issues": 1,
        "required_rules": [1, 22]
    },
    {
        "id": 5,
        "name": "TypeScript Unhandled Fetch Promise & innerHTML XSS",
        "lang": "typescript",
        "code": """function renderProfile(userContainer: HTMLElement, userId: string) {\n  fetch('/api/user/' + userId);\n  userContainer.innerHTML = '<h1>' + userId + '</h1>';\n}\n""",
        "min_issues": 2,
        "required_rules": [6, 26]
    },
    {
        "id": 6,
        "name": "Go Microservice Handler with Single Char Identifier",
        "lang": "go",
        "code": """package main\nimport "net/http"\n\nfunc HandleWebhook(w http.ResponseWriter, r *http.Request) {\n    var a = r.Header.Get("X-Auth")\n    w.Write([]byte(a))\n}\n""",
        "min_issues": 1,
        "required_rules": [1]
    },
    {
        "id": 7,
        "name": "Rust Unsafe State & Magic Numbers",
        "lang": "rust",
        "code": """pub fn calculate_window_buffer(offset: usize) -> usize {\n    let a = offset * 86400;\n    a\n}\n""",
        "min_issues": 1,
        "required_rules": [1, 22]
    },
    {
        "id": 8,
        "name": "SQL Query with String Concat Injection",
        "lang": "sql",
        "code": """SELECT id, email, password FROM accounts WHERE username = 'admin' + '' AND status = 1;""",
        "min_issues": 1,
        "required_rules": [3]
    },
    {
        "id": 9,
        "name": "C++ Raw Calculation & Magic Numbers",
        "lang": "cpp",
        "code": """#include <iostream>\nint main() {\n    int a = 100;\n    int b = 200;\n    int x = a + b * 3600;\n    std::cout << x << std::endl;\n    return 0;\n}\n""",
        "min_issues": 1,
        "required_rules": [1, 22]
    },
    {
        "id": 10,
        "name": "Enterprise Clean Architecture with Zero Violations",
        "lang": "python",
        "code": """import os\nimport logging\nfrom typing import Optional, Dict, Any\nfrom dataclasses import dataclass\n\nlogger = logging.getLogger(__name__)\n\n@dataclass(frozen=True)\nclass UserProfile:\n    user_id: int\n    username: str\n    email: str\n\nclass UserRepository:\n    def __init__(self, connection_pool):\n        self._pool = connection_pool\n\n    def get_by_id(self, user_id: int) -> Optional[UserProfile]:\n        query = "SELECT id, username, email FROM users WHERE id = :user_id"\n        try:\n            with self._pool.acquire() as conn:\n                row = conn.fetch_one(query, {"user_id": user_id})\n                if not row:\n                    return None\n                return UserProfile(user_id=row["id"], username=row["username"], email=row["email"])\n        except Exception as error:\n            logger.error(f"Error querying user {user_id}: {error}")\n            raise\n""",
        "min_issues": 0,
        "required_rules": []
    }
]


def test_10_scenarios():
    print("=" * 70)
    print("EXECUTING 10 REAL-WORLD MULTI-LANGUAGE TEST SUITES")
    print("=" * 70)

    init_db()
    db = SessionLocal()
    HistoricalLearningEngine.seed_default_rules_if_empty(db)

    passed_count = 0

    for scenario in SCENARIOS:
        print(f"\n[RUNNING TEST {scenario['id']}/10] {scenario['name']} ({scenario['lang'].upper()})")
        res = IntelligentReviewerEngine.evaluate_code(
            source_code=scenario["code"],
            language=scenario["lang"],
            title=scenario["name"],
            db=db
        )

        score = res["quality_score"]
        grade = res["grade"]
        issues = res["issues"]
        grounded = res["grounded_rules"]
        ml_conf = res.get("ml_insights", {}).get("ml_confidence_percentage", 95.0)

        print(f"  - Quality Rating: {score}/10.0 | Grade: {grade} | ML Confidence: {ml_conf}%")
        print(f"  - Total Issues Found: {len(issues)} | Grounded Learned Rules: {len(grounded)}")

        # Verification assertions
        assert 1.0 <= score <= 10.0, f"Expected score between 1.0 and 10.0, got {score}"
        assert grade in ["A+", "A", "B", "C", "D", "F"], f"Invalid grade: {grade}"
        assert len(issues) >= scenario["min_issues"], f"Expected at least {scenario['min_issues']} issues, got {len(issues)}"

        if scenario["required_rules"]:
            grounded_ids = [g["rule_id"] for g in grounded]
            matched_any = any(r in grounded_ids for r in scenario["required_rules"])
            print(f"  - Grounded Rule Citations: {grounded_ids}")
            assert matched_any, f"Expected at least one of {scenario['required_rules']} to be grounded"

        # Check refactored code exists
        assert len(res["refactored_code"]) > 0

        print(f"  [PASS] Test {scenario['id']} succeeded.")
        passed_count += 1

    db.close()

    print("\n" + "=" * 70)
    print(f"SUCCESS: {passed_count}/10 COMPREHENSIVE TEST SCENARIOS PASSED WITH ZERO ERRORS!")
    print("=" * 70)


if __name__ == "__main__":
    test_10_scenarios()

import json
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from database import ReviewSession, User, HistoricalRule


class DeveloperGrowthEngine:
    """
    Tracks developer progression, error mitigation trajectories, and historical session insights over time.
    """

    @staticmethod
    def get_user_analytics(user_id: int, db: Session) -> Dict[str, Any]:
        """
        Computes rich analytics and growth trends for an authenticated user.
        """
        sessions = (
            db.query(ReviewSession)
            .filter(ReviewSession.user_id == user_id)
            .order_by(ReviewSession.created_at.asc())
            .all()
        )

        if not sessions:
            return {
                "total_reviews": 0,
                "average_score": 0.0,
                "latest_score": 0.0,
                "latest_grade": "N/A",
                "score_trajectory": [],
                "category_breakdown": {
                    "security": 0,
                    "performance": 0,
                    "architecture": 0,
                    "maintainability": 0,
                    "readability": 0,
                    "bug": 0,
                    "formatting": 0
                },
                "language_distribution": {},
                "top_violated_rules": [],
                "growth_highlights": {
                    "score_improvement": "+0.0",
                    "security_flaws_resolved": 0,
                    "active_streak": 1
                }
            }

        total_reviews = len(sessions)
        scores = [s.quality_score for s in sessions]
        avg_score = round(sum(scores) / total_reviews, 1)
        latest_score = sessions[-1].quality_score
        latest_grade = sessions[-1].grade

        # Score trajectory for time-series charts
        score_trajectory = []
        for s in sessions:
            score_trajectory.append({
                "id": s.id,
                "title": s.title,
                "language": s.language,
                "score": s.quality_score,
                "grade": s.grade,
                "date": s.created_at.strftime("%Y-%m-%d %H:%M")
            })

        # Category & error distribution
        category_counts = {
            "security": 0,
            "performance": 0,
            "architecture": 0,
            "maintainability": 0,
            "readability": 0,
            "bug": 0,
            "formatting": 0
        }
        rule_violation_counts = {}
        language_dist = {}

        for s in sessions:
            lang = s.language.lower()
            language_dist[lang] = language_dist.get(lang, 0) + 1

            try:
                issues = json.loads(s.issues_json or "[]")
                for issue in issues:
                    cat = issue.get("category", "bug").lower()
                    if cat in category_counts:
                        category_counts[cat] += 1
                    else:
                        category_counts[cat] = category_counts.get(cat, 0) + 1

                    if "grounded_rule" in issue:
                        r_id = issue["grounded_rule"].get("rule_id")
                        if r_id:
                            rule_violation_counts[r_id] = rule_violation_counts.get(r_id, 0) + 1
            except Exception:
                pass

        # Top violated historical rules
        top_rules = []
        for r_id, count in sorted(rule_violation_counts.items(), key=lambda x: x[1], reverse=True)[:5]:
            rule_obj = db.query(HistoricalRule).filter(HistoricalRule.rule_id == r_id).first()
            if rule_obj:
                top_rules.append({
                    "rule_id": r_id,
                    "type": rule_obj.type,
                    "description": rule_obj.description,
                    "count": count
                })

        # Growth highlights
        if len(scores) >= 2:
            first_half_avg = sum(scores[:len(scores)//2]) / max(1, len(scores)//2)
            second_half_avg = sum(scores[len(scores)//2:]) / max(1, len(scores) - len(scores)//2)
            improvement = round(second_half_avg - first_half_avg, 1)
            improvement_str = f"+{improvement}" if improvement >= 0 else f"{improvement}"
        else:
            improvement_str = "+0.0"

        return {
            "total_reviews": total_reviews,
            "average_score": avg_score,
            "latest_score": latest_score,
            "latest_grade": latest_grade,
            "score_trajectory": score_trajectory,
            "category_breakdown": category_counts,
            "language_distribution": language_dist,
            "top_violated_rules": top_rules,
            "growth_highlights": {
                "score_improvement": improvement_str,
                "security_flaws_resolved": category_counts.get("security", 0),
                "active_streak": min(total_reviews, 7)
            }
        }

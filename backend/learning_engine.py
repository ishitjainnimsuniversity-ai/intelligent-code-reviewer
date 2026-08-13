import csv
import io
import re
from pathlib import Path
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from database import HistoricalRule

DEFAULT_CSV_PATH = Path(__file__).parent.parent / "data" / "historical_rules.csv"

# Pre-compiled heuristic pattern matchers for known fundamental rules
KNOWN_RULE_PATTERNS = {
    1: { # Single character variable names (except i, j, k in loops or _ in unpacks)
        "regex": r"\b(?<![\w\.])([a-ce-hj-z])\s*=\s*(?![=\'\"])(?!lambda)(?!for\s)",
        "language_scope": "ALL",
        "severity": "LOW",
        "weight": 0.5,
        "detector": "single_char_var"
    },
    2: { # Repeated DB lookups in request loops
        "regex": r"(for|while)\b[\s\S]{1,200}\.(query|find|select|get|fetch|execute|findById|findOne|aggregate)\s*\(",
        "language_scope": "ALL",
        "severity": "HIGH",
        "weight": 1.5,
        "detector": "db_in_loop"
    },
    3: { # Raw user input interpolation in SQL queries
        "regex": r"""(SELECT|INSERT|UPDATE|DELETE|FROM|WHERE)\b[\s\S]{1,100}(\+|\%|\.format\(|f[\'\"]|`[\s\S]*?\$\{)""",
        "language_scope": "ALL",
        "severity": "CRITICAL",
        "weight": 2.5,
        "detector": "sql_injection"
    },
    4: { # Hardcoded sensitive credentials
        "regex": r"""(?i)(password|secret|api_key|apikey|token|private_key|auth_token)\s*[:=]\s*['\"][A-Za-z0-9_\-\.\/+=]{8,}['\"]""",
        "language_scope": "ALL",
        "severity": "CRITICAL",
        "weight": 2.5,
        "detector": "hardcoded_secret"
    },
    5: { # Quadratic nested loops
        "regex": r"""for\b[\s\S]{1,100}:\s*\n\s+for\b|for\s*\([^;]+;[^;]+;[^)]+\)\s*\{[\s\S]{1,100}for\s*\(""",
        "language_scope": "ALL",
        "severity": "HIGH",
        "weight": 1.2,
        "detector": "nested_loop"
    },
    6: { # Unescaped innerHTML / XSS
        "regex": r"""\b(innerHTML|dangerouslySetInnerHTML|document\.write|v-html)\s*(=|\:)""",
        "language_scope": "javascript,typescript",
        "severity": "HIGH",
        "weight": 2.0,
        "detector": "xss"
    },
    8: { # Wildcard imports
        "regex": r"""(from\s+[\w\.]+\s+import\s+\*|import\s+[\w\.]+\.\*)""",
        "language_scope": "python,java",
        "severity": "LOW",
        "weight": 0.4,
        "detector": "wildcard_import"
    },
    10: { # Shell injection in subprocess/exec
        "regex": r"""(subprocess\.(call|Popen|run)\([^)]*shell\s*=\s*True|os\.system\(|exec\()""",
        "language_scope": "python,javascript,php",
        "severity": "CRITICAL",
        "weight": 2.5,
        "detector": "shell_injection"
    },
    13: { # Broad generic Exception catch without handling
        "regex": r"""except\s+(Exception|BaseException)?\s*:\s*(pass|return None|continue)""",
        "language_scope": "python",
        "severity": "MEDIUM",
        "weight": 1.0,
        "detector": "bare_except"
    },
    17: { # Disabled SSL verification
        "regex": r"""(verify\s*=\s*False|rejectUnauthorized\s*:\s*false|InsecureSkipVerify\s*:\s*true)""",
        "language_scope": "ALL",
        "severity": "CRITICAL",
        "weight": 2.2,
        "detector": "disabled_ssl"
    },
    22: { # Magic numbers
        "regex": r"""(?<![\w\.])(?:\d{4,}|86400|3600|604800)(?![\w\.\'\"])""",
        "language_scope": "ALL",
        "severity": "LOW",
        "weight": 0.3,
        "detector": "magic_numbers"
    },
    26: { # Unhandled promise / missing await/catch
        "regex": r"""\b(fetch|\.then)\([^)]+\)(?!\.catch)(?!\s*await)""",
        "language_scope": "javascript,typescript",
        "severity": "MEDIUM",
        "weight": 1.0,
        "detector": "unhandled_promise"
    }
}


class HistoricalLearningEngine:
    """
    Engine responsible for ingesting, managing, indexing, and matching
    historical review rules against submitted source code.
    """

    @staticmethod
    def parse_csv_rules(csv_content: str) -> List[Dict[str, Any]]:
        """
        Parses CSV data matching schema: <id>, <type>, <description>
        Supports various header casing or headerless streams.
        """
        rules = []
        reader = csv.reader(io.StringIO(csv_content.strip()))
        lines = list(reader)
        if not lines:
            return rules

        # Detect if line 0 is a header
        first_row = [c.strip().lower() for c in lines[0]]
        start_idx = 0
        id_col, type_col, desc_col = 0, 1, 2

        if "id" in first_row or "<id>" in first_row or "rule_id" in first_row:
            start_idx = 1
            for idx, col in enumerate(first_row):
                if "id" in col:
                    id_col = idx
                elif "type" in col:
                    type_col = idx
                elif "desc" in col or "rule" in col or "pattern" in col:
                    desc_col = idx

        for i in range(start_idx, len(lines)):
            row = lines[i]
            if not row or len(row) < 3:
                continue
            try:
                raw_id = row[id_col].strip().replace("<", "").replace(">", "")
                rule_id = int(raw_id)
                rule_type = row[type_col].strip().lower()
                desc = row[desc_col].strip()

                if desc:
                    rules.append({
                        "rule_id": rule_id,
                        "type": rule_type,
                        "description": desc
                    })
            except (ValueError, IndexError):
                continue

        return rules

    @staticmethod
    def seed_default_rules_if_empty(db: Session) -> int:
        """
        Seeds baseline rules into SQLite DB from default CSV file if empty.
        """
        existing_count = db.query(HistoricalRule).count()
        if existing_count > 0:
            return existing_count

        if not DEFAULT_CSV_PATH.exists():
            return 0

        with open(DEFAULT_CSV_PATH, "r", encoding="utf-8") as f:
            content = f.read()

        rules = HistoricalLearningEngine.parse_csv_rules(content)
        for r in rules:
            rule_id = r["rule_id"]
            rule_meta = KNOWN_RULE_PATTERNS.get(rule_id, {})
            db_rule = HistoricalRule(
                rule_id=rule_id,
                type=r["type"],
                description=r["description"],
                pattern_regex=rule_meta.get("regex"),
                severity=rule_meta.get("severity", "HIGH"),
                language_scope=rule_meta.get("language_scope", "ALL"),
                deduction_weight=rule_meta.get("weight", 1.0),
                is_custom=False
            )
            db.add(db_rule)
        
        db.commit()
        return len(rules)

    @staticmethod
    def ingest_rules_to_db(csv_content: str, db: Session, is_custom: bool = True) -> Dict[str, Any]:
        """
        Ingests user-supplied CSV rules into the database.
        """
        parsed_rules = HistoricalLearningEngine.parse_csv_rules(csv_content)
        added_count = 0
        updated_count = 0

        for r in parsed_rules:
            rule_id = r["rule_id"]
            existing = db.query(HistoricalRule).filter(HistoricalRule.rule_id == rule_id).first()
            rule_meta = KNOWN_RULE_PATTERNS.get(rule_id, {})

            # Auto-synthesize regex if description has obvious indicators
            auto_regex = rule_meta.get("regex")
            if not auto_regex:
                auto_regex = HistoricalLearningEngine._synthesize_regex_from_description(r["description"], r["type"])

            if existing:
                existing.type = r["type"]
                existing.description = r["description"]
                if auto_regex:
                    existing.pattern_regex = auto_regex
                updated_count += 1
            else:
                new_rule = HistoricalRule(
                    rule_id=rule_id,
                    type=r["type"],
                    description=r["description"],
                    pattern_regex=auto_regex,
                    severity=rule_meta.get("severity", "HIGH"),
                    language_scope=rule_meta.get("language_scope", "ALL"),
                    deduction_weight=rule_meta.get("weight", 1.0),
                    is_custom=is_custom
                )
                db.add(new_rule)
                added_count += 1

        db.commit()
        total = db.query(HistoricalRule).count()
        return {
            "parsed_count": len(parsed_rules),
            "added_count": added_count,
            "updated_count": updated_count,
            "total_rules": total
        }

    @staticmethod
    def _synthesize_regex_from_description(description: str, rule_type: str) -> Optional[str]:
        """
        Synthesizes basic token search regex based on descriptive keywords in custom rules.
        """
        desc_lower = description.lower()
        if "sql" in desc_lower and ("inject" in desc_lower or "interpolate" in desc_lower or "raw" in desc_lower):
            return r"""(SELECT|INSERT|UPDATE|DELETE)\b[\s\S]{1,60}(\+|\%|\.format\(|f[\'\"])"""
        elif "single-character" in desc_lower or "single character" in desc_lower:
            return r"\b([a-ce-hj-z])\s*=\s*"
        elif "loop" in desc_lower and ("database" in desc_lower or "lookup" in desc_lower or "query" in desc_lower):
            return r"(for|while)\b[\s\S]{1,120}\.(query|find|select|get)\s*\("
        elif "console.log" in desc_lower or "print" in desc_lower:
            return r"\b(console\.log|print)\s*\("
        elif "password" in desc_lower or "secret" in desc_lower:
            return r"""(?i)(password|secret|api_key)\s*[:=]\s*['\"][^'\"]+['\"]"""
        return None

    @staticmethod
    def match_historical_rules(source_code: str, language: str, db: Session) -> List[Dict[str, Any]]:
        """
        Evaluates source code against all historical rules and returns grounded citations with line numbers.
        """
        rules = db.query(HistoricalRule).all()
        violations = []
        code_lines = source_code.split("\n")

        for rule in rules:
            # Check language scope
            if rule.language_scope != "ALL":
                allowed_langs = [l.strip().lower() for l in rule.language_scope.split(",")]
                if language.lower() not in allowed_langs:
                    continue

            matched_lines = []

            # 1. Specialized AST / Semantic matchers
            if rule.rule_id == 1: # Avoid single-character variable names
                for idx, line in enumerate(code_lines):
                    clean_l = line.strip()
                    if clean_l.startswith("#") or clean_l.startswith("//") or clean_l.startswith("/*"):
                        continue
                    # Ignore standard loop index variables like `for i in range`
                    if re.search(r"for\s+[a-z]\s+in\s+", clean_l) or re.search(r"for\s*\(\s*(?:let|var|int)?\s*[a-z]\s*=", clean_l):
                        continue
                    matches = list(re.finditer(r"\b([a-ce-hj-z])\s*=\s*(?![=\'\"])(?!lambda)(?!for\s)", line))
                    if matches:
                        matched_lines.append((idx + 1, line.strip(), f"Single-character variable '{matches[0].group(1)}' declared here"))

            elif rule.rule_id == 2: # Cache repeated database lookups inside request loop
                in_loop = False
                loop_start = 0
                for idx, line in enumerate(code_lines):
                    clean_l = line.strip()
                    if re.match(r"^(for|while)\b", clean_l):
                        in_loop = True
                        loop_start = idx + 1
                    if in_loop and re.search(r"\.(query|find|select|get|fetch|execute|findById|findOne|filter|all)\s*\(", clean_l):
                        matched_lines.append((idx + 1, clean_l, f"Database query inside loop (started at line {loop_start})"))
                    if in_loop and (clean_l == "}" or (language == "python" and not line.startswith("    ") and not line.startswith("\t") and clean_l and not re.match(r"^(for|while)\b", clean_l))):
                        in_loop = False

            elif rule.rule_id == 3: # Never interpolate raw user input directly into SQL queries
                for idx, line in enumerate(code_lines):
                    clean_l = line.strip()
                    if re.search(r"(SELECT|INSERT|UPDATE|DELETE|FROM|WHERE)\b", clean_l, re.IGNORECASE):
                        if re.search(r"(\+|\%|\.format\(|f[\'\"]|\$\{)", clean_l):
                            matched_lines.append((idx + 1, clean_l, "Raw string interpolation detected in SQL query statement"))

            elif rule.pattern_regex: # General regex matching
                try:
                    for idx, line in enumerate(code_lines):
                        clean_l = line.strip()
                        if clean_l.startswith("#") or clean_l.startswith("//"):
                            continue
                        if re.search(rule.pattern_regex, clean_l, re.IGNORECASE):
                            matched_lines.append((idx + 1, clean_l, f"Pattern matched historical rule criteria"))
                except re.error:
                    pass

            if matched_lines:
                for line_no, snippet, reason in matched_lines[:3]: # Cap per rule to avoid flooding
                    violations.append({
                        "rule_id": rule.rule_id,
                        "type": rule.type,
                        "description": rule.description,
                        "severity": rule.severity,
                        "line_number": line_no,
                        "snippet": snippet,
                        "reason": reason,
                        "deduction_weight": rule.deduction_weight,
                        "grounding_citation": f"Learned Rule #{rule.rule_id} [{rule.type.upper()}]: {rule.description}"
                    })

        return violations

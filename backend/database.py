import datetime
import json
from pathlib import Path
from sqlalchemy import create_engine, Column, Integer, String, Text, Float, DateTime, ForeignKey, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship

DB_PATH = Path(__file__).parent.parent / "data" / "code_reviewer.db"
DB_PATH.parent.mkdir(parents=True, exist_ok=True)
DATABASE_URL = f"sqlite:///{DB_PATH}"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(64), unique=True, index=True, nullable=False)
    email = Column(String(128), unique=True, index=True, nullable=False)
    hashed_password = Column(String(256), nullable=False)
    full_name = Column(String(128), default="Developer")
    is_guest = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    reviews = relationship("ReviewSession", back_populates="user", cascade="all, delete-orphan")


class HistoricalRule(Base):
    __tablename__ = "historical_rules"

    id = Column(Integer, primary_key=True, index=True)
    rule_id = Column(Integer, unique=True, index=True, nullable=False) # e.g. 1, 2, 3 from CSV
    type = Column(String(64), index=True, nullable=False) # formatting, performance, security, architecture, bug
    description = Column(Text, nullable=False)
    pattern_regex = Column(Text, nullable=True) # synthesized or custom regex
    severity = Column(String(32), default="HIGH") # CRITICAL, HIGH, MEDIUM, LOW
    language_scope = Column(String(64), default="ALL") # ALL, python, javascript, sql, etc.
    deduction_weight = Column(Float, default=1.0)
    is_custom = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class ReviewSession(Base):
    __tablename__ = "review_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True, nullable=False)
    title = Column(String(256), default="Untitled Review")
    language = Column(String(64), default="python")
    source_code = Column(Text, nullable=False)
    quality_score = Column(Float, nullable=False) # Standardized 1.0 to 10.0
    grade = Column(String(8), nullable=False) # A+, A, B, C, D, F
    summary = Column(Text, nullable=False)
    
    # Sub-scores stored as JSON {security: 8.5, performance: 6.0, architecture: 9.0, maintainability: 7.5, readability: 8.0}
    category_scores_json = Column(Text, default="{}")
    
    # Detected issues array stored as JSON
    issues_json = Column(Text, default="[]")
    
    # Grounded historical rules triggered stored as JSON
    grounded_rules_json = Column(Text, default="[]")
    
    # Optimized refactored code output
    refactored_code = Column(Text, default="")
    
    # Code complexity & metrics JSON
    metrics_json = Column(Text, default="{}")
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="reviews")


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    Base.metadata.create_all(bind=engine)

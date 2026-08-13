from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path

from database import init_db, SessionLocal
from learning_engine import HistoricalLearningEngine
from routes.auth_routes import router as auth_router
from routes.review_routes import router as review_router
from routes.rules_routes import router as rules_router
from routes.analytics_routes import router as analytics_router
from routes.webhook_routes import router as webhook_router

app = FastAPI(
    title="The 24/7 Intelligent Code Reviewer API",
    description="Automated, always-on multi-language code evaluation, 1-10 quality scoring, historical learning, and developer growth platform.",
    version="2.0.0"
)

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Database and Seed Baseline Historical Rules
@app.on_event("startup")
def on_startup():
    init_db()
    db = SessionLocal()
    try:
        count = HistoricalLearningEngine.seed_default_rules_if_empty(db)
        print(f"[Engine] Historical rules ready. Total rules active: {count}")
    finally:
        db.close()

# Include API Routers
app.include_router(auth_router)
app.include_router(review_router)
app.include_router(rules_router)
app.include_router(analytics_router)
app.include_router(webhook_router)

@app.get("/api/health")
def health_check():
    return {
        "status": "online",
        "service": "The 24/7 Intelligent Code Reviewer",
        "engine_state": "ACTIVE",
        "version": "2.0.0"
    }

# Mount React static files if built
STATIC_DIR = Path(__file__).parent.parent / "frontend" / "dist"
if STATIC_DIR.exists():
    app.mount("/", StaticFiles(directory=str(STATIC_DIR), html=True), name="static")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)

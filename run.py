import os
import sys
import webbrowser
import threading
import time
from pathlib import Path

# Set working directory to backend
BACKEND_DIR = Path(__file__).parent / "backend"
sys.path.insert(0, str(BACKEND_DIR))

import uvicorn
from main import app

def open_browser():
    time.sleep(1.5)
    try:
        webbrowser.open("http://127.0.0.1:8000")
    except Exception:
        pass

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    host = os.environ.get("HOST", "0.0.0.0")

    print("=" * 70)
    print("[STARTING] THE 24/7 INTELLIGENT CODE REVIEWER // AURA ENGINE")
    print("=" * 70)
    print("* Multi-Language Review Engine (Python, JS, TS, Java, C++, Go, SQL, Rust)")
    print("* Standardized Quality Rating (1.0 to 10.0) & Sub-Category Scoring")
    print("* Historical Rule Ingestion & Semantic Grounding (<id>, <type>, <desc>)")
    print("* Developer Growth & Session Analytics")
    print("* 24/7 CI/CD Pull Request Review Simulator")
    print(f"* Server URL: http://{host}:{port}")
    print("=" * 70)

    # Launch browser thread only in local development
    if os.environ.get("OPEN_BROWSER", "0") == "1":
        threading.Thread(target=open_browser, daemon=True).start()

    # Start FastAPI server (serves React frontend + APIs)
    uvicorn.run(app, host=host, port=port, log_level="info")

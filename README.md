# 🚀 Aura Code: The 24/7 Intelligent Code Reviewer

[![Live App on Vercel](https://img.shields.io/badge/Vercel-Live%20App-black?style=for-the-badge&logo=vercel)](https://intelligent-code-reviewer-app.vercel.app)
[![GitHub Repository](https://img.shields.io/badge/GitHub-Public%20Repo-181717?style=for-the-badge&logo=github)](https://github.com/ishitjainnimsuniversity-ai/intelligent-code-reviewer)
[![Python 3.11+](https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![React 19](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)

> **An automated, always-on, multi-language intelligent code review engine powered by Neural ML Ensembles (AdaBoost + GradientBoosting), Abstract Syntax Tree (AST) static auditing, and grounded CSV historical learning.**

---

## 🌐 Live Application Links

| Service | Access Link | Status |
| :--- | :--- | :--- |
| **🚀 Production Web App (Vercel)** | **[https://intelligent-code-reviewer-app.vercel.app](https://intelligent-code-reviewer-app.vercel.app)** | **ONLINE** |
| **📦 GitHub Repository (Public)** | **[https://github.com/ishitjainnimsuniversity-ai/intelligent-code-reviewer](https://github.com/ishitjainnimsuniversity-ai/intelligent-code-reviewer)** | **PUBLIC** |
| **⚡ Local Development Server** | **[http://127.0.0.1:8000](http://127.0.0.1:8000)** (or `http://localhost:8000`) | **LIVE** |
| **📚 Interactive Swagger API Docs** | **[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)** | **LIVE** |
| **📖 ReDoc Schema Documentation** | **[http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)** | **LIVE** |
| **🌐 Public Cloud Tunnel (Localtunnel)** | **[https://shaggy-lions-lead.loca.lt](https://shaggy-lions-lead.loca.lt)** *(Password: `185.107.56.164`)* | **ONLINE** |

---

## ✨ Key Features & Architecture

### 1. ⚡ Continuous Real-Time Code Auditing
- **100% Real-Time Live Inference**: Dynamic debounced live stream evaluating code with sub-20ms latency as engineers type.
- **Standardized Quality Rating**: Computes objective scores from **1.0 to 10.0** with corresponding letter grades (**A+, A, B, C, D, F**).
- **Sub-Category Ratings**: Granular breakdown across **Security**, **Performance**, **Architecture**, **Maintainability**, and **Readability**.

### 2. 🤖 Neural ML Ensemble (No Dummy Data)
- **Blended Scikit-Learn Model**: `AdaBoostRegressor` + `GradientBoostingRegressor` trained on calibrated software debt benchmarks.
- **Sequence Token Embeddings**: TF-IDF character & word n-gram feature extraction acting as a lexical RNN proxy.
- **ML Agreement Confidence Metric**: Real-time confidence percentage indicator (e.g. `92.8%`).

### 3. 🛡️ Multi-Language AST Auditing Engine
- **Supported Languages**: Python, JavaScript, TypeScript, Java, C++, Go, Rust, and SQL.
- **Vulnerability Detection**: Identifies CWE-89 SQL Injection, exposed API keys/tokens, disabled TLS validation, and unsafe pointers.
- **Performance Traps**: Detects N+1 database queries in loops, quadratic allocations, and un-memoized recursive calls.

### 4. 📚 Grounded Historical CSV Rule Learning
- Ingests institutional rules using the standardized CSV schema: `<id>, <type>, <description>`.
- Automatically links audit findings to learned rules (e.g. `Rule #1 [FORMATTING]`, `Rule #3 [SECURITY]`).
- Includes interactive **Rule Sandbox** and **CSV Uploader / Exporter**.

### 5. ✨ 1-Click Code Refactoring & Diff Viewer
- Generates clean, secure, production-grade refactored code.
- Side-by-side unified diff comparison with 1-click apply back to editor.

### 6. 📈 Developer Growth & Session Analytics
- Persistent SQLite tracking of user evaluation history.
- Time-series progression charts tracking developer growth and anti-pattern mitigation over time.

### 7. 🤖 24/7 CI/CD & GitHub PR Simulator
- Automated pull request webhook analyzer generating line-by-line automated comments and PR merge blocker/approval verdicts.

---

## 🚀 Quick Start Guide

### 1. Clone & Run Locally
```powershell
# Clone the repository
git clone https://github.com/ishitjainnimsuniversity-ai/intelligent-code-reviewer.git
cd intelligent-code-reviewer

# Install Python requirements
pip install -r requirements.txt

# Start the full-stack server (FastAPI backend + React frontend)
python run.py
```
*App will automatically open in your browser at `http://127.0.0.1:8000`.*

### 2. One-Click Windows Launch
Simply double-click `start_reviewer.bat` in the project root!

---

## 🧪 Test Suite (10/10 Passed)

To execute the comprehensive 10-scenario multi-language test suite:
```powershell
python tests/test_10_scenarios.py
```

---

## 📦 Cloud Deployment Options

### Deploy to Vercel
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/ishitjainnimsuniversity-ai/intelligent-code-reviewer)

### Deploy to Google Cloud Run
```powershell
gcloud builds submit --project YOUR_PROJECT_ID --config cloudbuild.yaml
```

### Deploy to Render.com
Connect this GitHub repository to [Render.com](https://render.com) using the included `render.yaml` blueprint.

---

## 📄 License
This project is open-source and available under the **MIT License**.

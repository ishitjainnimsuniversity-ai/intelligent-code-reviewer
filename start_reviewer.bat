@echo off
title The 24/7 Intelligent Code Reviewer - Aura Engine
color 0A
echo ======================================================================
echo   AURA CODE REVIEWER // 24/7 PERMANENT REAL-TIME ENGINE
echo ======================================================================
echo Starting FastAPI Daemon and Mounting Production React Client...
echo Server will be available at: http://127.0.0.1:8000
echo ======================================================================

cd /d "%~dp0"
python run.py
pause

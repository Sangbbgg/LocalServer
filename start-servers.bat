@echo off
echo Starting Backend (Flask) and Frontend (React) servers...

REM Start Backend Server in a new window
echo Starting Flask backend...
start "Backend" cmd /c "cd backend && .\venv\Scripts\activate && python app.py"

REM Start Frontend Server in a new window
echo Starting React frontend...
start "Frontend" cmd /c "cd frontend && npm run dev"

echo Both servers are starting in separate command prompt windows.

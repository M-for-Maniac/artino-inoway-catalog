@echo off
cd /d "%~dp0"
where py >nul 2>nul
if %errorlevel%==0 (
  start "Artino Catalog Server" cmd /c "py -m http.server 8765"
) else (
  start "Artino Catalog Server" cmd /c "python -m http.server 8765"
)
timeout /t 2 >nul
start "" "http://127.0.0.1:8765/index.html"

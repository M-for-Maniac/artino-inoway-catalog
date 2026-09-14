$ErrorActionPreference = 'Stop'

Write-Host "ARTINO x INOWAY — Catalog Publisher" -ForegroundColor Cyan
Write-Host ""

if (-not (Test-Path "data/catalog.json")) { throw "data/catalog.json not found. Run this from the repository root." }
if (-not (Test-Path "script.js")) { throw "script.js not found. Run this from the repository root." }

Write-Host "1. Syncing catalog.json into script.js..." -ForegroundColor Yellow
python tools/build_catalog.py

Write-Host ""
Write-Host "2. Git status:" -ForegroundColor Yellow
git status --short

Write-Host ""
$answer = Read-Host "Publish these changes to GitHub? (y/n)"
if ($answer -notmatch '^(y|yes)$') {
    Write-Host "Cancelled. No Git changes were committed or pushed." -ForegroundColor DarkYellow
    exit 0
}

git add .
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm"
git commit -m "Update catalog - $timestamp"
git push

Write-Host ""
Write-Host "Published successfully. GitHub Pages may take a short time to update." -ForegroundColor Green

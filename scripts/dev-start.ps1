# Start backend (new window) and frontend (this window). Run from repo root: .\scripts\dev-start.ps1
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
$Backend = Join-Path $Root "backend"

Start-Process powershell -WorkingDirectory $Backend -ArgumentList @(
  "-NoExit",
  "-Command",
  "python -m uvicorn app:app --host 0.0.0.0 --port 8000 --reload"
)

Set-Location $Root
npm run dev

# CeliacSafe — Schritte 1+2: Migrationen + Datenimport
# Voraussetzung: .env mit SUPABASE_SERVICE_ROLE_KEY=sb_secret_...
#   oder SUPABASE_DB_PASSWORD=... (für Migrationen)

$ErrorActionPreference = "Stop"
Set-Location (Split-Path $PSScriptRoot -Parent)

if (-not (Get-Command python -ErrorAction SilentlyContinue)) {
    Write-Error "Python nicht gefunden."
}

pip install -q -r scripts/requirements.txt

$hasSecret = Select-String -Path ".env" -Pattern "^\s*SUPABASE_(SERVICE_ROLE_KEY|SECRET_KEY)\s*=\s*sb_" -Quiet
$hasDbPass = Select-String -Path ".env" -Pattern "^\s*SUPABASE_DB_PASSWORD\s*=\s*\S+" -Quiet

if (-not $hasSecret -and -not $hasDbPass) {
    Write-Host ""
    Write-Host "Bitte in .env eintragen (Dashboard → Project Settings → API Keys → Secret key):" -ForegroundColor Yellow
    Write-Host "  SUPABASE_SERVICE_ROLE_KEY=sb_secret_..." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Alternativ für nur Migrationen: SUPABASE_DB_PASSWORD=..." -ForegroundColor Yellow
    exit 1
}

if ($hasDbPass -or (Select-String -Path ".env" -Pattern "^\s*SUPABASE_DB_URL\s*=" -Quiet)) {
    Write-Host "=== 1/2 SQL-Migrationen ===" -ForegroundColor Cyan
    python scripts/run-supabase-migrations.py
}

if ($hasSecret) {
    Write-Host "=== 2/2 Datenimport ===" -ForegroundColor Cyan
    python scripts/import-to-supabase.py --dry-run
    python scripts/import-to-supabase.py
} else {
    Write-Host "Datenimport übersprungen (kein Secret Key in .env)." -ForegroundColor Yellow
}

Write-Host "Fertig." -ForegroundColor Green

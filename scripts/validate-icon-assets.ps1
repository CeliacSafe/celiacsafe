# Prueft Branding-Assets unter assets/
# .\scripts\validate-icon-assets.ps1

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$assets = Join-Path $root "assets"

if (-not (Test-Path $assets)) {
    Write-Host "Ordner assets/ fehlt." -ForegroundColor Red
    exit 1
}

Add-Type -AssemblyName System.Drawing

function Get-FirstExistingPath {
    param([string[]]$Candidates)
    foreach ($c in $Candidates) {
        $p = Join-Path $assets $c
        if (Test-Path $p) { return $p }
    }
    return $null
}

function Test-ImageSize {
    param(
        [string]$Path,
        [int]$ExpectedW,
        [int]$ExpectedH,
        [bool]$Required = $true,
        [bool]$Exact = $true
    )
    if (-not $Path -or -not (Test-Path $Path)) {
        if ($Required) {
            Write-Host "[FEHLT] $Path" -ForegroundColor Yellow
            return $false
        }
        return $true
    }
    $img = [System.Drawing.Image]::FromFile($Path)
    try {
        $name = [System.IO.Path]::GetFileName($Path)
        if (-not $Exact) {
            Write-Host "[OK] $name $($img.Width)x$($img.Height)" -ForegroundColor Green
            return $true
        }
        $ok = ($img.Width -eq $ExpectedW) -and ($img.Height -eq $ExpectedH)
        if ($ok) {
            Write-Host "[OK] $name $($img.Width)x$($img.Height)" -ForegroundColor Green
        } else {
            Write-Host "[GROESSE] $name ist $($img.Width)x$($img.Height), erwartet ${ExpectedW}x${ExpectedH}" -ForegroundColor Red
        }
        return $ok
    } finally {
        $img.Dispose()
    }
}

Write-Host "CeliacSafe — Asset-Validierung" -ForegroundColor Cyan
Write-Host "Pfad: $assets`n"

$allOk = $true

$icon = Join-Path $assets "icon.png"
$allOk = (Test-ImageSize $icon 1024 1024) -and $allOk

$fg = Get-FirstExistingPath @("adaptive-icon-fg.png", "android-icon-foreground.png")
$allOk = (Test-ImageSize $fg 1024 1024) -and $allOk

$bg = Get-FirstExistingPath @("adaptive-icon-bg.png", "android-icon-background.png")
if ($bg) {
    $null = Test-ImageSize $bg 1024 1024 -Required $false
} else {
    Write-Host "[OK] adaptive Hintergrund nur via backgroundColor #2E7D32 (app.json)" -ForegroundColor Green
}

$mono = Get-FirstExistingPath @("android-icon-monochrome.png")
if ($mono) {
    $null = Test-ImageSize $mono 1024 1024 -Required $false
}

$splash = Get-FirstExistingPath @("splash.png", "splash-icon.png")
if ($splash) {
    $img = [System.Drawing.Image]::FromFile($splash)
    try {
        $name = [System.IO.Path]::GetFileName($splash)
        $hint = if ($name -eq "splash.png") { " (empfohlen 1284x2778)" } else { " → bitte als splash.png speichern" }
        Write-Host "[OK] $name $($img.Width)x$($img.Height)$hint" -ForegroundColor Green
        if ($name -ne "splash.png") {
            Write-Host "      app.json erwartet assets/splash.png" -ForegroundColor DarkYellow
        }
    } finally {
        $img.Dispose()
    }
} else {
    Write-Host "[FEHLT] splash.png (M10 Teil 2)" -ForegroundColor Yellow
    $allOk = $false
}

if ($allOk) {
    Write-Host "`nBranding-Assets: bereit fuer Build" -ForegroundColor Green
    exit 0
}

Write-Host "`nBitte Canva-Exporte nach assets/ kopieren." -ForegroundColor Yellow
exit 1

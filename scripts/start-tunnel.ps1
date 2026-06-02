# Startet Expo mit Tunnel (ngrok) - Standard fuer Tests auf dem Handy.
# Funktioniert auch wenn Handy und PC in unterschiedlichen Netzen sind.

Write-Host ""
Write-Host "CeliacSafe - Expo Tunnel-Modus"
Write-Host "QR-Code mit Expo Go scannen (kann 30-60 Sek. dauern beim ersten Start)"
Write-Host ""

npx expo start --tunnel --clear

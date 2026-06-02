# Startet Expo mit der lokalen WLAN-IP (nicht 127.0.0.1).
# So kann Expo Go auf dem Handy den Dev-Server erreichen.

$ip = (
  Get-NetIPAddress -AddressFamily IPv4 |
  Where-Object {
    $_.IPAddress -notmatch '^127\.' -and
    $_.IPAddress -notmatch '^169\.254\.' -and
    $_.InterfaceAlias -notmatch 'vEthernet|WSL|VirtualBox|Loopback'
  } |
  Select-Object -First 1
).IPAddress

if (-not $ip) {
  Write-Host "Keine WLAN-IP gefunden. Bitte npm run start:tunnel nutzen."
  exit 1
}

Write-Host ""
Write-Host "WLAN-IP: $ip"
Write-Host "Expo Go URL: exp://${ip}:8081"
Write-Host ""

$env:REACT_NATIVE_PACKAGER_HOSTNAME = $ip
npx expo start --lan --clear

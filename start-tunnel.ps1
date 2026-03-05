# 🚀 Start Inventory App with Internet Access
# This script starts your frontend and creates a public URL

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  🚀 INVENTORY APP - INTERNET ACCESS" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if cloudflared exists
if (-Not (Test-Path "cloudflared.exe")) {
    Write-Host "📥 Downloading Cloudflare Tunnel..." -ForegroundColor Yellow
    Write-Host ""
    
    try {
        Invoke-WebRequest -Uri "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe" -OutFile "cloudflared.exe"
        Write-Host "✅ Cloudflare Tunnel downloaded!" -ForegroundColor Green
        Write-Host ""
    } catch {
        Write-Host "❌ Failed to download Cloudflare Tunnel" -ForegroundColor Red
        Write-Host "Please download manually from:" -ForegroundColor Yellow
        Write-Host "https://github.com/cloudflare/cloudflared/releases" -ForegroundColor Cyan
        exit 1
    }
}

# Start frontend in new window
Write-Host "🎨 Starting Frontend..." -ForegroundColor Yellow
Write-Host ""

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; Write-Host '🎨 Frontend Server' -ForegroundColor Green; Write-Host ''; npm run dev"

# Wait for frontend to start
Write-Host "⏳ Waiting for frontend to start (10 seconds)..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Start Cloudflare tunnel
Write-Host ""
Write-Host "🌐 Creating Public URL..." -ForegroundColor Green
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  YOUR APP WILL BE ACCESSIBLE FROM:" -ForegroundColor Green
Write-Host "  https://xxxxx.trycloudflare.com" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📱 Share this URL with anyone!" -ForegroundColor Yellow
Write-Host "🔒 Your Firebase backend is already on cloud!" -ForegroundColor Green
Write-Host ""
Write-Host "Press Ctrl+C to stop the tunnel" -ForegroundColor Yellow
Write-Host ""

./cloudflared tunnel --url http://localhost:5173

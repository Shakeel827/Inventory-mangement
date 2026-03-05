# 🚀 Start Inventory App with LocalTunnel
# Alternative method using LocalTunnel (npm package)

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  🚀 INVENTORY APP - LOCALTUNNEL" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if localtunnel is installed
Write-Host "📦 Checking LocalTunnel installation..." -ForegroundColor Yellow
$ltInstalled = npm list -g localtunnel 2>&1 | Select-String "localtunnel"

if (-Not $ltInstalled) {
    Write-Host "📥 Installing LocalTunnel..." -ForegroundColor Yellow
    Write-Host ""
    npm install -g localtunnel
    Write-Host ""
    Write-Host "✅ LocalTunnel installed!" -ForegroundColor Green
    Write-Host ""
}

# Start frontend in new window
Write-Host "🎨 Starting Frontend..." -ForegroundColor Yellow
Write-Host ""

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; Write-Host '🎨 Frontend Server' -ForegroundColor Green; Write-Host ''; npm run dev"

# Wait for frontend to start
Write-Host "⏳ Waiting for frontend to start (10 seconds)..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Start LocalTunnel
Write-Host ""
Write-Host "🌐 Creating Public URL..." -ForegroundColor Green
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  YOUR APP WILL BE ACCESSIBLE FROM:" -ForegroundColor Green
Write-Host "  https://xxxxx.loca.lt" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📱 Share this URL with anyone!" -ForegroundColor Yellow
Write-Host "🔒 Your Firebase backend is already on cloud!" -ForegroundColor Green
Write-Host ""
Write-Host "⚠️  First-time visitors will see a warning page" -ForegroundColor Yellow
Write-Host "    Just click 'Continue' to access the app" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press Ctrl+C to stop the tunnel" -ForegroundColor Yellow
Write-Host ""

npx localtunnel --port 5173

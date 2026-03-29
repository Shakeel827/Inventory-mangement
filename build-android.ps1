# 📱 Build Android App Script

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  📱 BUILDING ANDROID APP" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Build web app
Write-Host "1️⃣  Building web app..." -ForegroundColor Yellow
cd frontend
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Web app built successfully!" -ForegroundColor Green
Write-Host ""

# Step 2: Sync with Capacitor
Write-Host "2️⃣  Syncing with Capacitor..." -ForegroundColor Yellow
npx cap sync android

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Sync failed!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Synced successfully!" -ForegroundColor Green
Write-Host ""

# Step 3: Open in Android Studio
Write-Host "3️⃣  Opening in Android Studio..." -ForegroundColor Yellow
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  NEXT STEPS:" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Wait for Gradle sync to complete" -ForegroundColor White
Write-Host "2. Click 'Run' to test on emulator" -ForegroundColor White
Write-Host "3. Or build release:" -ForegroundColor White
Write-Host "   cd android" -ForegroundColor Cyan
Write-Host "   ./gradlew bundleRelease" -ForegroundColor Cyan
Write-Host ""
Write-Host "📄 See ANDROID_APP_GUIDE.md for full instructions" -ForegroundColor Yellow
Write-Host ""

npx cap open android

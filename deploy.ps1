# 🚀 Quick Deployment Script for Inventory Cloud
# Run this script to deploy your app to the internet

Write-Host "🚀 Starting Deployment Process..." -ForegroundColor Cyan
Write-Host ""

# Step 1: Check if Firebase CLI is installed
Write-Host "📦 Checking Firebase CLI..." -ForegroundColor Yellow
$firebaseInstalled = Get-Command firebase -ErrorAction SilentlyContinue

if (-not $firebaseInstalled) {
    Write-Host "❌ Firebase CLI not found. Installing..." -ForegroundColor Red
    npm install -g firebase-tools
    Write-Host "✅ Firebase CLI installed!" -ForegroundColor Green
} else {
    Write-Host "✅ Firebase CLI found!" -ForegroundColor Green
}

Write-Host ""

# Step 2: Build the frontend
Write-Host "🔨 Building frontend..." -ForegroundColor Yellow
Set-Location frontend
npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Frontend built successfully!" -ForegroundColor Green
} else {
    Write-Host "❌ Build failed! Please check errors above." -ForegroundColor Red
    Set-Location ..
    exit 1
}

Set-Location ..
Write-Host ""

# Step 3: Deploy to Firebase
Write-Host "🌐 Deploying to Firebase..." -ForegroundColor Yellow
firebase deploy

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "🎉 DEPLOYMENT SUCCESSFUL!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Your app is now live at:" -ForegroundColor Cyan
    Write-Host "https://inventory-f8f66.web.app" -ForegroundColor White
    Write-Host ""
    Write-Host "Alternative URL:" -ForegroundColor Cyan
    Write-Host "https://inventory-f8f66.firebaseapp.com" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "❌ Deployment failed!" -ForegroundColor Red
    Write-Host "Please check the errors above." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Common fixes:" -ForegroundColor Cyan
    Write-Host "1. Run: firebase login" -ForegroundColor White
    Write-Host "2. Run: firebase use inventory-f8f66" -ForegroundColor White
    Write-Host "3. Try again: ./deploy.ps1" -ForegroundColor White
    Write-Host ""
}

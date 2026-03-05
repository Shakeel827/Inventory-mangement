# 🧪 Test Setup - Verify Everything is Ready

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  🧪 TESTING SETUP" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$allGood = $true

# Test 1: Node.js
Write-Host "1. Checking Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "   ✅ Node.js installed: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Node.js not found" -ForegroundColor Red
    $allGood = $false
}

# Test 2: npm
Write-Host "2. Checking npm..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version
    Write-Host "   ✅ npm installed: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "   ❌ npm not found" -ForegroundColor Red
    $allGood = $false
}

# Test 3: Frontend dependencies
Write-Host "3. Checking frontend dependencies..." -ForegroundColor Yellow
if (Test-Path "frontend/node_modules") {
    Write-Host "   ✅ Frontend dependencies installed" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Frontend dependencies not installed" -ForegroundColor Yellow
    Write-Host "   Run: cd frontend && npm install" -ForegroundColor Cyan
    $allGood = $false
}

# Test 4: Firebase config
Write-Host "4. Checking Firebase configuration..." -ForegroundColor Yellow
if (Test-Path "frontend/src/firebaseClient.ts") {
    Write-Host "   ✅ Firebase configured" -ForegroundColor Green
} else {
    Write-Host "   ❌ Firebase config not found" -ForegroundColor Red
    $allGood = $false
}

# Test 5: Internet connection
Write-Host "5. Checking internet connection..." -ForegroundColor Yellow
try {
    $ping = Test-Connection -ComputerName google.com -Count 1 -Quiet
    if ($ping) {
        Write-Host "   ✅ Internet connected" -ForegroundColor Green
    } else {
        Write-Host "   ❌ No internet connection" -ForegroundColor Red
        $allGood = $false
    }
} catch {
    Write-Host "   ⚠️  Could not test connection" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan

if ($allGood) {
    Write-Host "  ✅ ALL CHECKS PASSED!" -ForegroundColor Green
    Write-Host ""
    Write-Host "  You're ready to expose your app!" -ForegroundColor Green
    Write-Host ""
    Write-Host "  Run: ./start-tunnel.ps1" -ForegroundColor Cyan
} else {
    Write-Host "  ⚠️  SOME CHECKS FAILED" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "  Fix the issues above and try again" -ForegroundColor Yellow
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

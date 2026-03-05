# 📋 ALL COMMANDS - Quick Reference

## 🚀 EXPOSE TO INTERNET

### Method 1: Automated (Recommended)
```powershell
./start-tunnel.ps1
```

### Method 2: LocalTunnel Alternative
```powershell
./start-localtunnel.ps1
```

### Method 3: Manual Setup
```powershell
# Terminal 1: Start frontend
cd frontend
npm run dev

# Terminal 2: Create tunnel
./cloudflared tunnel --url http://localhost:5173
```

---

## 🧪 TEST YOUR SETUP

```powershell
./test-setup.ps1
```

---

## 🔧 TROUBLESHOOTING COMMANDS

### Enable Script Execution
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Reinstall Frontend Dependencies
```powershell
cd frontend
rm -rf node_modules
npm install
```

### Kill Process on Port 5173
```powershell
netstat -ano | findstr :5173
taskkill /PID <PID_NUMBER> /F
```

### Use Different Port
```powershell
cd frontend
npm run dev -- --port 3000

# Then tunnel to new port
./cloudflared tunnel --url http://localhost:3000
```

---

## 📥 DOWNLOAD CLOUDFLARE MANUALLY

```powershell
Invoke-WebRequest -Uri "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe" -OutFile "cloudflared.exe"
```

---

## 📦 INSTALL LOCALTUNNEL

```powershell
npm install -g localtunnel
```

---

## 🔄 UPDATE FRONTEND

```powershell
cd frontend
npm install
npm run build
```

---

## 🚀 FULL FIREBASE DEPLOYMENT (Alternative)

```powershell
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Build
cd frontend
npm run build

# Deploy
cd ..
firebase deploy
```

---

## 📊 CHECK FIREBASE STATUS

```powershell
firebase projects:list
firebase use inventory-f8f66
```

---

## 🧹 CLEAN BUILD

```powershell
cd frontend
rm -rf dist
rm -rf node_modules
npm install
npm run build
```

---

## 🎯 QUICK START (Copy-Paste)

```powershell
# Test setup
./test-setup.ps1

# Start tunnel
./start-tunnel.ps1
```

---

## 📱 MOBILE TESTING

1. Run: `./start-tunnel.ps1`
2. Copy the URL (e.g., `https://xxxxx.trycloudflare.com`)
3. Open on your phone
4. Login and test

---

## 🆘 EMERGENCY RESET

```powershell
# Stop all Node processes
taskkill /F /IM node.exe

# Reinstall everything
cd frontend
rm -rf node_modules
npm install

# Start fresh
npm run dev
```

---

## 💡 USEFUL CHECKS

### Check Node Version
```powershell
node --version
```

### Check npm Version
```powershell
npm --version
```

### Check Running Processes
```powershell
netstat -ano | findstr :5173
```

### Check Internet Connection
```powershell
Test-Connection google.com -Count 1
```

---

## 🎉 MOST COMMON WORKFLOW

```powershell
# 1. Test setup (optional)
./test-setup.ps1

# 2. Start tunnel
./start-tunnel.ps1

# 3. Copy your public URL
# 4. Share with team
# 5. Test on mobile
```

---

## 📚 DOCUMENTATION FILES

- `START_HERE.md` - Start here!
- `README_INTERNET.md` - Complete guide
- `INTERNET_QUICK_START.md` - Quick reference
- `INTERNET_ACCESS.md` - Detailed instructions
- `COMMANDS.md` - This file

---

## ✅ CHECKLIST

Before running:
- [ ] Node.js installed
- [ ] Internet connected
- [ ] Frontend dependencies installed (`cd frontend && npm install`)

To expose:
- [ ] Run `./start-tunnel.ps1`
- [ ] Copy public URL
- [ ] Test on phone
- [ ] Share with team

---

**Ready? Run: `./start-tunnel.ps1`** 🚀

# ⚡ QUICK START - Deploy in 5 Minutes

## 🚀 ONE-COMMAND DEPLOYMENT

### Windows (PowerShell):
```powershell
# 1. Install Firebase CLI (first time only)
npm install -g firebase-tools

# 2. Login to Firebase (first time only)
firebase login

# 3. Deploy!
./deploy.ps1
```

### Mac/Linux (Terminal):
```bash
# 1. Install Firebase CLI (first time only)
npm install -g firebase-tools

# 2. Login to Firebase (first time only)
firebase login

# 3. Build and Deploy
cd frontend && npm run build && cd .. && firebase deploy
```

---

## 📋 STEP-BY-STEP

### 1. Install Firebase CLI
```bash
npm install -g firebase-tools
```
Wait for installation to complete (~30 seconds)

### 2. Login to Firebase
```bash
firebase login
```
- Browser opens automatically
- Login with your Google account
- Grant permissions
- Return to terminal

### 3. Build Frontend
```bash
cd frontend
npm run build
```
Wait for build to complete (~1 minute)

### 4. Deploy
```bash
cd ..
firebase deploy
```
Wait for deployment (~1 minute)

### 5. Done! 🎉
Your app is live at:
**https://inventory-f8f66.web.app**

---

## 🔄 UPDATE DEPLOYMENT

When you make changes:

```bash
cd frontend
npm run build
cd ..
firebase deploy
```

Changes go live in ~30 seconds!

---

## 📱 SHARE YOUR APP

Send this URL to your team:
**https://inventory-f8f66.web.app**

They can:
- Register accounts
- Login
- Scan QR codes
- Manage inventory
- Access from anywhere!

---

## 🆘 TROUBLESHOOTING

### "firebase: command not found"
```bash
npm install -g firebase-tools
```

### "Build failed"
```bash
cd frontend
rm -rf node_modules
npm install
npm run build
```

### "Deploy failed"
```bash
firebase logout
firebase login
firebase use inventory-f8f66
firebase deploy
```

---

## ✅ CHECKLIST

Before deploying:
- [x] Firebase project created (inventory-f8f66) ✅
- [x] Firebase Authentication enabled ✅
- [x] Firestore database created ✅
- [ ] Firebase CLI installed
- [ ] Logged in to Firebase
- [ ] Frontend built
- [ ] Deployed

After deploying:
- [ ] Visit live URL
- [ ] Test registration
- [ ] Test login
- [ ] Add test device
- [ ] Share with team

---

## 🎯 WHAT GETS DEPLOYED

✅ Frontend (React app)
✅ Firestore Rules (security)
✅ Firestore Indexes (performance)
✅ SSL Certificate (automatic)
✅ CDN (global fast access)

---

## 💰 COST

**FREE** for:
- Up to 10 GB storage
- Up to 360 MB/day bandwidth
- Up to 50,000 reads/day
- Up to 20,000 writes/day

Perfect for small to medium businesses!

---

## 🌐 YOUR LIVE URLS

**Primary:**
https://inventory-f8f66.web.app

**Alternative:**
https://inventory-f8f66.firebaseapp.com

**Custom Domain (optional):**
You can add your own domain like:
inventory.yourcompany.com

---

**Ready? Let's deploy! 🚀**

Run: `./deploy.ps1` (Windows) or follow steps above!

# 🚀 Vercel Deployment Guide

## Quick Deploy to Vercel

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/new
   - Sign in with GitHub

2. **Import Your Repository**
   - Click "Import Project"
   - Select: `Shakeel827/Inventory-mangement`
   - Click "Import"

3. **Configure Project Settings**

   **Root Directory:**
   ```
   ./
   ```

   **Build Command:**
   ```
   cd frontend && npm install && npm run build
   ```

   **Output Directory:**
   ```
   frontend/dist
   ```

   **Install Command:**
   ```
   npm install --prefix frontend
   ```

4. **Environment Variables** (Optional - already in code)
   
   You don't need to add environment variables because Firebase config is already in the code. But if you want to use environment variables:

   ```
   VITE_FIREBASE_API_KEY=AIzaSyD5ArVO8mhkCFoxx8sCshhORnOMb-e7e1A
   VITE_FIREBASE_AUTH_DOMAIN=inventory-f8f66.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=inventory-f8f66
   VITE_FIREBASE_STORAGE_BUCKET=inventory-f8f66.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID=31361110076
   VITE_FIREBASE_APP_ID=1:31361110076:web:01a72dde18ac85d885b339
   VITE_FIREBASE_MEASUREMENT_ID=G-BJ80YDN06X
   ```

5. **Click "Deploy"**
   - Wait 2-3 minutes for build
   - Your app will be live!

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI**
```bash
npm install -g vercel
```

2. **Login to Vercel**
```bash
vercel login
```

3. **Deploy**
```bash
vercel
```

4. **Deploy to Production**
```bash
vercel --prod
```

---

## 📋 Vercel Configuration Summary

### Project Settings

| Setting | Value |
|---------|-------|
| Framework Preset | Other |
| Root Directory | `./` |
| Build Command | `cd frontend && npm install && npm run build` |
| Output Directory | `frontend/dist` |
| Install Command | `npm install --prefix frontend` |
| Node Version | 18.x (default) |

### Environment Variables (Optional)

Since your Firebase config is already in the code (`frontend/src/firebaseClient.ts`), you don't need to add environment variables. The app will work immediately after deployment.

However, if you want to use environment variables for better security:

1. Go to Vercel Dashboard > Your Project > Settings > Environment Variables
2. Add the variables listed above
3. Update `frontend/src/firebaseClient.ts` to use environment variables:

```typescript
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};
```

---

## 🔧 Troubleshooting

### Build Fails

**Error: "Command failed: npm run build"**

Solution:
```bash
# Test build locally first
cd frontend
npm install
npm run build

# If it works locally, push to GitHub
git add .
git commit -m "Fix build"
git push
```

### Wrong Output Directory

**Error: "No output directory found"**

Solution: Make sure Output Directory is set to `frontend/dist`

### Module Not Found

**Error: "Cannot find module..."**

Solution: Make sure Install Command is `npm install --prefix frontend`

### Environment Variables Not Working

**Error: "Firebase config undefined"**

Solution: 
1. Check that variables start with `VITE_`
2. Redeploy after adding variables
3. Or use hardcoded config (already in your code)

---

## 🌐 After Deployment

### Your Live URLs

After deployment, you'll get:
- **Production URL:** `https://your-project.vercel.app`
- **Preview URLs:** For each branch/PR

### Custom Domain (Optional)

1. Go to Vercel Dashboard > Your Project > Settings > Domains
2. Add your custom domain
3. Follow DNS configuration instructions
4. Wait for SSL certificate (automatic)

Example: `inventory.yourcompany.com`

---

## 🔄 Automatic Deployments

Vercel automatically deploys:
- **Production:** Every push to `main` branch
- **Preview:** Every push to other branches
- **PR Previews:** Every pull request

---

## 📊 Monitoring

### View Deployment Logs
1. Go to Vercel Dashboard
2. Click on your project
3. Click on a deployment
4. View build logs and runtime logs

### Analytics
- Vercel provides free analytics
- View page views, performance, and errors
- Go to: Dashboard > Your Project > Analytics

---

## ✅ Deployment Checklist

Before deploying:
- [x] Code pushed to GitHub
- [x] `vercel.json` configured
- [x] Build command tested locally
- [x] Firebase config present
- [ ] Deploy to Vercel
- [ ] Test live URL
- [ ] Configure custom domain (optional)
- [ ] Set up environment variables (optional)
- [ ] Enable analytics (optional)

---

## 🚀 Quick Deploy Button

Add this to your README.md:

```markdown
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Shakeel827/Inventory-mangement)
```

---

## 💡 Pro Tips

1. **Use Preview Deployments**
   - Test changes before merging to main
   - Each PR gets its own URL

2. **Enable Vercel Analytics**
   - Free for hobby projects
   - Track performance and usage

3. **Set Up Notifications**
   - Get notified on deployment success/failure
   - Configure in Vercel Dashboard > Settings > Notifications

4. **Use Environment Variables**
   - For different configs per environment
   - Production vs Preview vs Development

5. **Monitor Performance**
   - Check Lighthouse scores
   - Optimize based on Vercel insights

---

## 🔐 Security Notes

- Firebase API keys are safe to expose (they're meant to be public)
- Firestore security rules protect your data
- Use environment variables for truly sensitive data
- Enable Vercel's security headers (automatic)

---

## 📞 Support

- Vercel Docs: https://vercel.com/docs
- Vercel Support: https://vercel.com/support
- GitHub Issues: https://github.com/Shakeel827/Inventory-mangement/issues

---

**Your app will be live in 2-3 minutes after clicking Deploy!** 🎉

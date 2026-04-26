# 🔧 Firebase Connection Troubleshooting Guide

## ⚠️ SECURITY ALERT

**Anda baru saja expose Firebase private key!**

### SEGERA LAKUKAN INI:

1. **Go to Firebase Console** → Project Settings → Service Accounts
2. **Delete the exposed key** (b4f59645831d4bc2c6d42b91ced809d23c9e6160)
3. **Generate new key** 
4. **Update di aplikasi Anda**

---

## 🔍 DEBUG FIREBASE CONNECTION

### Step 1: Check Browser Console
Buka aplikasi di browser, tekan `F12` → Console tab

Cari error messages seperti:
- `Failed to get document because the client is offline`
- `Permission denied`
- `PERMISSION_DENIED: Missing or insufficient permissions`
- `Failed to initialize Cloud Firestore`

### Step 2: Verify Firebase Configuration

Pastikan `.env.local` sudah benar:
```
VITE_FIREBASE_API_KEY=AIzaSyA5fJZs56GNEzS7GXJee28TRVbe90_UcyQ
VITE_FIREBASE_AUTH_DOMAIN=layangan-caa6c.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=layangan-caa6c
VITE_FIREBASE_STORAGE_BUCKET=layangan-caa6c.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=187969086899
VITE_FIREBASE_APP_ID=1:187969086899:web:b0949bbf8603214dfc97c6
VITE_FIREBASE_MEASUREMENT_ID=G-7XK5TYGZ6C
```

### Step 3: Check Firebase Console Settings

#### 3.1 Firestore Database
- [ ] Go to Firebase Console → Firestore Database
- [ ] Click "Create Database"
- [ ] Choose region (e.g., asia-southeast1)
- [ ] Start in **Test Mode** (for development)
- [ ] Click "Create"

#### 3.2 Firestore Security Rules
- [ ] Go to Firestore → Rules tab
- [ ] Paste this (for development):

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // Allow all reads and writes for now (development only)
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

- [ ] Click "Publish"

#### 3.3 Storage
- [ ] Go to Firebase Console → Storage
- [ ] Click "Get Started"
- [ ] Choose region
- [ ] Click "Done"

#### 3.4 Authentication
- [ ] Go to Firebase Console → Authentication
- [ ] Click "Get Started"
- [ ] Enable "Anonymous" (for now)
- [ ] Click "Save"

#### 3.5 API Keys
- [ ] Go to Firebase Console → Project Settings → API Keys
- [ ] Verify your API key is listed
- [ ] Make sure it's enabled

### Step 4: Test Connection

1. **Clear browser cache**
   - Press `Ctrl+Shift+Delete`
   - Clear all data
   - Refresh page

2. **Check console for errors**
   - Open DevTools (F12)
   - Go to Console tab
   - Look for any error messages

3. **Check Network tab**
   - Go to Network tab
   - Look for failed requests to `firebaseio.com`

### Step 5: Common Issues & Solutions

#### Issue: "Mode lokal: Firebase belum bisa diakses"

**Solution 1: Check Firestore is enabled**
```
Firebase Console → Firestore Database → Create Database
```

**Solution 2: Check Security Rules**
```
Firebase Console → Firestore → Rules
Make sure rules allow read/write
```

**Solution 3: Check API Key**
```
Firebase Console → Project Settings → API Keys
Verify API key is enabled
```

**Solution 4: Check CORS**
```
If you get CORS error, check:
- Firebase Console → Authentication → Authorized domains
- Add your domain (localhost:5173 for dev)
```

#### Issue: "Permission denied"

**Solution:**
```javascript
// Temporarily use permissive rules for development
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

#### Issue: "Called encrypt() without a session key"

**This is from browser extension, not your app**
- Disable password manager extensions
- Or ignore this error (it's not from your code)

---

## ✅ VERIFICATION CHECKLIST

- [ ] Firestore Database created
- [ ] Firestore Rules published
- [ ] Storage enabled
- [ ] Authentication enabled (Anonymous)
- [ ] API Key enabled
- [ ] `.env.local` configured correctly
- [ ] Browser cache cleared
- [ ] No console errors from your app
- [ ] Can see "Online dengan Firebase" message

---

## 🚀 NEXT STEPS

### For Development
1. Use permissive Firestore rules (allow all)
2. Enable Anonymous authentication
3. Test all features

### For Production
1. Implement proper Firestore rules with RBAC
2. Setup Firebase Authentication (Email/Password or Google)
3. Restrict API key to your domain
4. Enable HTTPS

---

## 📝 IMPORTANT NOTES

### Never Share:
- ❌ Private keys
- ❌ API keys (in public repos)
- ❌ Service account JSON files
- ❌ Database credentials

### Always Use:
- ✅ Environment variables
- ✅ `.env.local` (not committed to git)
- ✅ `.env.example` as template
- ✅ `.gitignore` to exclude `.env.local`

---

## 🆘 STILL NOT WORKING?

If you still see "Mode lokal: Firebase belum bisa diakses":

1. **Check browser console** (F12 → Console)
2. **Look for specific error message**
3. **Share the error message** (not the private key!)
4. **I can help debug**

---

**Last Updated**: 26 April 2026

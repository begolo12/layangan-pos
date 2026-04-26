# 🔍 ADVANCED FIREBASE DEBUGGING

Jika masih "Firebase error: permission-denied" setelah update rules, ikuti langkah ini:

## Step 1: Check Firestore Rules Status

1. Buka Firebase Console
2. Go to Firestore Database → Rules
3. **Pastikan rules sudah berubah** (bukan rules lama)
4. Lihat di bawah ada tulisan: "Last published: X minutes ago"

Jika masih rules lama, berarti **Publish belum berhasil**.

## Step 2: Verify Rules Published

Coba publish ulang:

1. Go to Firestore → Rules
2. Paste rules ini:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

3. Click **"Publish"** (tombol biru)
4. **Tunggu sampai selesai** (jangan close tab)
5. Seharusnya muncul: "Rules updated successfully"

## Step 3: Check Browser Console

1. Buka aplikasi
2. Press **F12** (DevTools)
3. Go to **Console** tab
4. Cari error message yang detail

Contoh error yang mungkin muncul:
```
FirebaseError: Missing or insufficient permissions.
  at new FirestoreError (firestore.js:...)
  at onError (firestore.js:...)
```

## Step 4: Check Network Tab

1. Open DevTools (F12)
2. Go to **Network** tab
3. Refresh aplikasi (F5)
4. Cari request ke `firebaseio.com`
5. Lihat response status:
   - ✅ 200 = OK
   - ❌ 403 = Permission Denied
   - ❌ 401 = Unauthorized

## Step 5: Clear Everything & Try Again

1. **Clear browser cache**
   - Press: Ctrl+Shift+Delete
   - Select: All time
   - Check: Cookies, Cache
   - Click: Clear data

2. **Close browser completely**
   - Close semua tab
   - Close browser

3. **Open browser again**
   - Open aplikasi
   - Check console

## Step 6: Check Firebase Console Settings

Pastikan ini sudah benar:

### ✅ Firestore Database
- [ ] Database sudah created
- [ ] Status: "Ready"
- [ ] Region: asia-southeast1 (atau region lain)

### ✅ Authentication
- [ ] Go to Authentication
- [ ] Click "Get Started"
- [ ] Enable "Anonymous"
- [ ] Status: "Enabled"

### ✅ API Keys
- [ ] Go to Project Settings → API Keys
- [ ] Lihat API key Anda
- [ ] Status: "Enabled"

## Step 7: Check .env.local

Pastikan `.env.local` benar:

```
VITE_FIREBASE_API_KEY=AIzaSyA5fJZs56GNEzS7GXJee28TRVbe90_UcyQ
VITE_FIREBASE_AUTH_DOMAIN=layangan-caa6c.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=layangan-caa6c
VITE_FIREBASE_STORAGE_BUCKET=layangan-caa6c.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=187969086899
VITE_FIREBASE_APP_ID=1:187969086899:web:b0949bbf8603214dfc97c6
VITE_FIREBASE_MEASUREMENT_ID=G-7XK5TYGZ6C
```

Jika ada yang berbeda, update `.env.local` dengan credentials yang benar.

## Step 8: Restart Dev Server

Jika sudah update `.env.local`:

1. Stop dev server (Ctrl+C di terminal)
2. Run: `npm run dev`
3. Refresh browser

## 🆘 MASIH TIDAK BERHASIL?

Jika sudah semua langkah di atas tapi masih error, coba ini:

### Option 1: Delete & Recreate Firestore

1. Go to Firebase Console → Firestore Database
2. Click **"Delete database"** (di menu ...)
3. Confirm delete
4. Click **"Create database"**
5. Choose region
6. Start in **Test Mode**
7. Click **"Create"**
8. Publish rules lagi

### Option 2: Check Firestore Quota

Mungkin Firestore quota sudah habis:

1. Go to Firebase Console → Quotas
2. Lihat "Firestore Reads" dan "Firestore Writes"
3. Jika sudah limit, tunggu reset (biasanya 24 jam)

### Option 3: Use Different Project

Jika masih tidak berhasil, coba buat project Firebase baru:

1. Go to https://console.firebase.google.com
2. Click "Add project"
3. Create new project
4. Setup Firestore, Storage, Auth
5. Update `.env.local` dengan credentials baru

## 📋 CHECKLIST LENGKAP

- [ ] Firestore Database created
- [ ] Firestore Rules published (permissive)
- [ ] Authentication enabled (Anonymous)
- [ ] API Key enabled
- [ ] `.env.local` correct
- [ ] Browser cache cleared
- [ ] Dev server restarted
- [ ] Waited 2-3 minutes
- [ ] Tried testFirebaseConnection()

## 🎯 NEXT STEPS

Jika masih error setelah semua ini:

1. **Screenshot error message** (dari console)
2. **Share error message** (bukan private key!)
3. **I can help debug**

---

**Last Updated**: 26 April 2026

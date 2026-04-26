# ✅ FIREBASE SETUP CHECKLIST - VISUAL GUIDE

## 🎯 Tujuan
Aplikasi bisa connect ke Firebase tanpa error "permission-denied"

---

## 📋 CHECKLIST (Ikuti Urutan)

### 1. Firestore Database ✅
```
Firebase Console
  ↓
Firestore Database
  ↓
"Create Database" button
  ↓
Choose region (asia-southeast1)
  ↓
Start in "Test Mode"
  ↓
"Create" button
  ↓
✅ Status: "Ready"
```

### 2. Firestore Rules ✅
```
Firestore Database
  ↓
"Rules" tab (bukan "Data")
  ↓
Hapus semua, paste ini:

rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}

  ↓
"Publish" button (biru)
  ↓
Tunggu: "Rules updated successfully"
  ↓
✅ Last published: X minutes ago
```

### 3. Authentication ✅
```
Firebase Console
  ↓
Authentication
  ↓
"Get Started" button
  ↓
"Anonymous" provider
  ↓
Toggle ON
  ↓
"Save" button
  ↓
✅ Status: "Enabled"
```

### 4. Storage ✅
```
Firebase Console
  ↓
Storage
  ↓
"Get Started" button
  ↓
Choose region
  ↓
"Done" button
  ↓
✅ Status: "Ready"
```

### 5. Environment Variables ✅
```
File: .env.local

VITE_FIREBASE_API_KEY=AIzaSyA5fJZs56GNEzS7GXJee28TRVbe90_UcyQ
VITE_FIREBASE_AUTH_DOMAIN=layangan-caa6c.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=layangan-caa6c
VITE_FIREBASE_STORAGE_BUCKET=layangan-caa6c.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=187969086899
VITE_FIREBASE_APP_ID=1:187969086899:web:b0949bbf8603214dfc97c6
VITE_FIREBASE_MEASUREMENT_ID=G-7XK5TYGZ6C

✅ Semua terisi
```

### 6. Browser Cache ✅
```
Press: Ctrl+Shift+Delete
  ↓
Select: All time
  ↓
Check: Cookies, Cache, Stored data
  ↓
"Clear data" button
  ↓
✅ Cache cleared
```

### 7. Dev Server ✅
```
Terminal:
  ↓
Ctrl+C (stop server)
  ↓
npm run dev
  ↓
✅ Server running on http://localhost:5173
```

### 8. Test Connection ✅
```
Browser:
  ↓
Press F12 (DevTools)
  ↓
Go to Console tab
  ↓
Type: testFirebaseConnection()
  ↓
Press Enter
  ↓
✅ Result: "Firebase connection test PASSED!"
```

---

## 🎯 EXPECTED RESULTS

### ✅ Jika Berhasil
```
Console output:
✅ Firebase config loaded
✅ Firebase app initialized
✅ Firebase Auth initialized
✅ Firestore initialized
✅ Anonymous auth successful
✅ Firestore read successful: X products found
🎉 Firebase connection test PASSED!
```

### ❌ Jika Gagal
```
Console output:
❌ Firebase connection test FAILED
Error: permission-denied
```

Jika masih gagal:
1. Ulangi step 1-7
2. Tunggu 2-3 menit
3. Coba lagi

---

## 🆘 TROUBLESHOOTING

| Error | Solusi |
|-------|--------|
| "permission-denied" | Update Firestore rules, publish ulang |
| "Failed to initialize" | Check API key di Firebase Console |
| "CORS error" | Clear cache, restart dev server |
| "Offline" | Check internet connection |
| "Timeout" | Tunggu 2-3 menit, coba lagi |

---

## 📞 NEED HELP?

Jika masih error:

1. Screenshot console error
2. Share error message
3. I can help debug

**JANGAN share private keys!**

---

**Last Updated**: 26 April 2026

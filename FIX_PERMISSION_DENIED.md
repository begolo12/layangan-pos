# 🔧 FIX: Firebase Permission Denied Error

## ❌ Error: "Firebase error: permission-denied"

Ini berarti Firestore rules tidak mengizinkan akses.

---

## ✅ SOLUSI: Update Firestore Rules

### Step 1: Buka Firebase Console
1. Go to https://console.firebase.google.com
2. Select project: **layangan-caa6c**
3. Go to **Firestore Database** (di sidebar kiri)

### Step 2: Go to Rules Tab
1. Click **"Rules"** tab (di sebelah "Data")
2. Anda akan lihat rules yang sekarang

### Step 3: Replace dengan Development Rules
Hapus semua yang ada, ganti dengan ini:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // DEVELOPMENT ONLY - Allow all reads and writes
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

### Step 4: Publish Rules
1. Click **"Publish"** button (biru, di kanan atas)
2. Tunggu sampai selesai (biasanya 1-2 menit)
3. Anda akan lihat "Rules updated successfully"

### Step 5: Test Connection
1. Refresh aplikasi (F5)
2. Open DevTools (F12)
3. Go to Console tab
4. Run: `testFirebaseConnection()`
5. Seharusnya berhasil sekarang ✅

---

## ⚠️ PENTING: PRODUCTION RULES

Rules di atas hanya untuk **DEVELOPMENT**!

Untuk **PRODUCTION**, gunakan rules yang aman:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // Helper function to get user role
    function getUserRole() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role;
    }

    // Users collection - only admins can read/write
    match /users/{userId} {
      allow read: if request.auth.uid == userId || getUserRole() == 'admin';
      allow write: if request.auth.uid == userId || getUserRole() == 'admin';
    }

    // Products - everyone can read, only admins can write
    match /products/{productId} {
      allow read: if request.auth != null;
      allow create, update, delete: if request.auth != null && getUserRole() == 'admin';
    }

    // Sales - everyone can read, admins and cashiers can create, only admins can update/delete
    match /sales/{saleId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && (getUserRole() == 'admin' || getUserRole() == 'cashier');
      allow update, delete: if request.auth != null && getUserRole() == 'admin';
    }

    // Settings - only admins can read/write
    match /settings/{settingId} {
      allow read, write: if request.auth != null && getUserRole() == 'admin';
    }
  }
}
```

---

## 🎯 CHECKLIST

- [ ] Buka Firebase Console
- [ ] Go to Firestore Database → Rules
- [ ] Replace dengan development rules
- [ ] Click "Publish"
- [ ] Tunggu "Rules updated successfully"
- [ ] Refresh aplikasi
- [ ] Test dengan `testFirebaseConnection()`
- [ ] Seharusnya berhasil ✅

---

## 🆘 MASIH ERROR?

Jika masih error setelah publish rules:

1. **Clear browser cache** (Ctrl+Shift+Delete)
2. **Refresh aplikasi** (F5)
3. **Wait 2-3 minutes** (Firebase rules bisa delay)
4. **Try again**

Jika masih tidak berhasil:
- Open DevTools (F12)
- Go to Console
- Run: `testFirebaseConnection()`
- Share error message (bukan private key!)

---

**Last Updated**: 26 April 2026

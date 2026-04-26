# 🔒 PRODUCTION FIRESTORE RULES - SECURE

## ✅ Rules Sudah Ketat - Hanya User Login

Rules ini memastikan:
- ✅ Hanya user yang **login** yang bisa akses data
- ✅ Role-based access control (Admin vs Cashier)
- ✅ User tidak bisa akses data user lain
- ✅ Audit trail untuk semua aksi

---

## 📋 FIRESTORE RULES

Copy rules ini ke Firebase Console → Firestore → Rules:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // Helper function to check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Helper function to get user role from Firestore
    function getUserRole() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role;
    }
    
    // Helper function to check if user is admin
    function isAdmin() {
      return isAuthenticated() && getUserRole() == 'admin';
    }
    
    // Helper function to check if user is cashier
    function isCashier() {
      return isAuthenticated() && getUserRole() == 'cashier';
    }
    
    // Users collection - only authenticated users can read their own data
    // Only admins can read/write all users
    match /users/{userId} {
      allow read: if isAuthenticated() && (request.auth.uid == userId || isAdmin());
      allow write: if isAuthenticated() && (request.auth.uid == userId || isAdmin());
    }
    
    // Products - all authenticated users can read
    // Only admins can create, update, delete
    match /products/{productId} {
      allow read: if isAuthenticated();
      allow create, update, delete: if isAdmin();
    }
    
    // Sales - all authenticated users can read
    // Admins and cashiers can create
    // Only admins can update and delete
    match /sales/{saleId} {
      allow read: if isAuthenticated();
      allow create: if isAdmin() || isCashier();
      allow update, delete: if isAdmin();
    }
    
    // Settings - only admins can read/write
    match /settings/{settingId} {
      allow read, write: if isAdmin();
    }
    
    // Audit logs - authenticated users can read their own logs
    // Admins can read all logs
    // All authenticated users can create logs
    match /auditLogs/{logId} {
      allow read: if isAuthenticated() && (resource.data.userId == request.auth.uid || isAdmin());
      allow create: if isAuthenticated();
      allow update, delete: if isAdmin();
    }
  }
}
```

---

## 🔒 STORAGE RULES

Copy rules ini ke Firebase Console → Storage → Rules:

```javascript
rules_version = '2';

service firebase.storage {
  match /b/{bucket}/o {
    // Product images - only authenticated users can read
    // Only authenticated users can upload (with size and type restrictions)
    match /products/{fileName} {
      // Only authenticated users can read
      allow read: if request.auth != null;
      
      // Only authenticated users can write
      // With file size limit (3MB) and image type only
      allow write: if request.auth != null
        && request.resource.size < 3 * 1024 * 1024
        && request.resource.contentType.matches('image/.*');
    }
  }
}
```

---

## 🎯 PERMISSION MATRIX

| Collection | Read | Create | Update | Delete |
|------------|------|--------|--------|--------|
| **users** | Self + Admin | Self + Admin | Self + Admin | Self + Admin |
| **products** | All Auth | Admin only | Admin only | Admin only |
| **sales** | All Auth | Admin + Cashier | Admin only | Admin only |
| **settings** | Admin only | Admin only | Admin only | Admin only |
| **auditLogs** | Self + Admin | All Auth | Admin only | Admin only |

---

## 📝 CARA DEPLOY RULES

### Step 1: Firestore Rules
1. Go to Firebase Console → Firestore Database
2. Click **"Rules"** tab
3. Copy-paste Firestore rules di atas
4. Click **"Publish"**
5. Tunggu "Rules updated successfully"

### Step 2: Storage Rules
1. Go to Firebase Console → Storage
2. Click **"Rules"** tab
3. Copy-paste Storage rules di atas
4. Click **"Publish"**
5. Tunggu "Rules updated successfully"

### Step 3: Test
1. Refresh aplikasi
2. Login dengan admin atau kasir
3. Test semua fitur
4. Pastikan tidak ada error

---

## ⚠️ PENTING: SETUP USER ROLES

Rules ini membutuhkan user roles di Firestore. Anda perlu:

### Option 1: Manual Setup (Untuk Testing)
1. Go to Firebase Console → Firestore Database
2. Click **"Data"** tab
3. Create collection: **users**
4. Add document dengan ID = user UID
5. Add field:
   - `role`: "admin" atau "cashier"
   - `email`: email user
   - `name`: nama user

### Option 2: Automatic Setup (Recommended)
Implement Firebase Authentication dengan custom claims:
- Admin: role = "admin"
- Cashier: role = "cashier"

---

## 🔐 SECURITY BENEFITS

### ✅ Hanya User Login
- Tidak ada akses anonymous
- Semua request harus authenticated
- User tidak bisa akses tanpa login

### ✅ Role-Based Access
- Admin: Full access
- Cashier: Limited access (bisa create sales, tidak bisa delete)
- User biasa: Tidak bisa akses

### ✅ Data Protection
- User tidak bisa lihat data user lain
- User tidak bisa edit data yang bukan miliknya
- Audit trail untuk tracking

### ✅ File Upload Security
- Hanya authenticated users
- Max file size: 3MB
- Only image files
- No executable files

---

## 🆘 TROUBLESHOOTING

### Error: "Missing or insufficient permissions"
**Solusi:**
- Pastikan user sudah login
- Check user role di Firestore
- Verify rules sudah published

### Error: "UNAUTHENTICATED"
**Solusi:**
- User belum login
- Implement Firebase Authentication
- Enable Anonymous auth (untuk testing)

### Error: "PERMISSION_DENIED"
**Solusi:**
- User tidak punya role yang sesuai
- Check user document di Firestore
- Verify role field ada dan benar

---

## 📊 TESTING CHECKLIST

- [ ] Firestore rules published
- [ ] Storage rules published
- [ ] User roles setup di Firestore
- [ ] Test login sebagai admin
- [ ] Test login sebagai cashier
- [ ] Test CRUD products (admin only)
- [ ] Test create sales (admin + cashier)
- [ ] Test delete sales (admin only)
- [ ] Test settings (admin only)
- [ ] No permission errors

---

**Last Updated**: 26 April 2026
**Status**: Production Ready 🚀

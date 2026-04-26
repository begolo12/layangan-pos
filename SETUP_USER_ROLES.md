# 🔐 SETUP USER ROLES DI FIRESTORE

## Step 1: Get User UIDs

1. **Buka Firebase Console**
2. Go to **Authentication** → **Users**
3. Anda akan lihat 2 users:
   - admin@admin.com
   - kasir@kasir.com
4. **Copy UID** dari masing-masing user

Contoh UID: `abc123def456ghi789jkl012`

---

## Step 2: Create Users Collection di Firestore

### Manual Setup (Recommended)

1. **Buka Firebase Console**
2. Go to **Firestore Database**
3. Click **"Start collection"**
4. Collection ID: `users`
5. Click **"Next"**

### Add Admin User

1. **Document ID**: [Paste UID dari admin@admin.com]
2. **Add fields**:
   - Field: `email` | Type: string | Value: `admin@admin.com`
   - Field: `role` | Type: string | Value: `admin`
   - Field: `name` | Type: string | Value: `Admin`
   - Field: `createdAt` | Type: timestamp | Value: [Current time]
3. Click **"Save"**

### Add Kasir User

1. Click **"Add document"**
2. **Document ID**: [Paste UID dari kasir@kasir.com]
3. **Add fields**:
   - Field: `email` | Type: string | Value: `kasir@kasir.com`
   - Field: `role` | Type: string | Value: `cashier`
   - Field: `name` | Type: string | Value: `Kasir`
   - Field: `createdAt` | Type: timestamp | Value: [Current time]
4. Click **"Save"**

---

## Step 3: Verify Firestore Rules

Pastikan Firestore rules sudah benar (sudah di-setup sebelumnya):

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function getUserRole() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role;
    }
    
    function isAdmin() {
      return isAuthenticated() && getUserRole() == 'admin';
    }
    
    function isCashier() {
      return isAuthenticated() && getUserRole() == 'cashier';
    }
    
    match /users/{userId} {
      allow read: if isAuthenticated() && (request.auth.uid == userId || isAdmin());
      allow write: if isAuthenticated() && (request.auth.uid == userId || isAdmin());
    }
    
    match /products/{productId} {
      allow read: if isAuthenticated();
      allow create, update, delete: if isAdmin();
    }
    
    match /sales/{saleId} {
      allow read: if isAuthenticated();
      allow create: if isAdmin() || isCashier();
      allow update, delete: if isAdmin();
    }
    
    match /settings/{settingId} {
      allow read, write: if isAdmin();
    }
  }
}
```

---

## Step 4: Test Access

### Test Admin Access
1. Login dengan: admin@admin.com
2. Seharusnya bisa:
   - ✅ Read products
   - ✅ Create/Update/Delete products
   - ✅ Read sales
   - ✅ Create/Update/Delete sales
   - ✅ Read/Write settings

### Test Kasir Access
1. Login dengan: kasir@kasir.com
2. Seharusnya bisa:
   - ✅ Read products
   - ✅ Read sales
   - ✅ Create sales
3. Seharusnya TIDAK bisa:
   - ❌ Create/Update/Delete products
   - ❌ Update/Delete sales
   - ❌ Read/Write settings

---

## 🎯 QUICK SETUP GUIDE

### Visual Steps:

```
Firebase Console
  ↓
Firestore Database
  ↓
Start collection → "users"
  ↓
Add document (admin)
  - Document ID: [UID dari admin@admin.com]
  - email: admin@admin.com
  - role: admin
  - name: Admin
  ↓
Add document (kasir)
  - Document ID: [UID dari kasir@kasir.com]
  - email: kasir@kasir.com
  - role: cashier
  - name: Kasir
  ↓
Save
```

---

## 📝 EXAMPLE DATA STRUCTURE

```
users (collection)
  ├── abc123def456 (document - admin UID)
  │   ├── email: "admin@admin.com"
  │   ├── role: "admin"
  │   ├── name: "Admin"
  │   └── createdAt: [timestamp]
  │
  └── xyz789ghi012 (document - kasir UID)
      ├── email: "kasir@kasir.com"
      ├── role: "cashier"
      ├── name: "Kasir"
      └── createdAt: [timestamp]
```

---

## ⚠️ IMPORTANT NOTES

1. **Document ID HARUS sama dengan User UID** dari Authentication
2. **Role field** harus exact: "admin" atau "cashier" (lowercase)
3. **Firestore rules** akan check role dari collection ini
4. **Hanya 2 user ini** yang bisa akses Firebase

---

## 🆘 TROUBLESHOOTING

### Error: "Missing or insufficient permissions"
**Solusi:**
- Check Document ID sama dengan User UID
- Check role field ada dan benar
- Check Firestore rules sudah published

### Error: "User not found"
**Solusi:**
- Pastikan user sudah dibuat di Authentication
- Pastikan document di Firestore sudah dibuat
- Check Document ID sama dengan UID

---

**Next Step**: Setelah setup users collection, saya akan update aplikasi untuk menggunakan Firebase Authentication.

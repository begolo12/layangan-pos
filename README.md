# POS Layang Layar

Aplikasi POS (Point of Sale) ringan untuk UMKM penjual layang-layang dan benang. Dibangun dengan React, Vite, dan Firebase.

## 🚀 Fitur

- **Mode Kasir**: Interface sederhana untuk transaksi cepat di HP/tablet
- **Backoffice Admin**: Dashboard lengkap untuk manajemen produk, stok, dan laporan
- **Real-time Sync**: Sinkronisasi data dengan Firebase
- **Offline Support**: Aplikasi tetap berfungsi tanpa internet (mode lokal)
- **Multiple Themes**: 4 pilihan tema warna
- **Responsive Design**: Optimal di mobile, tablet, dan desktop
- **PWA Ready**: Bisa diinstall sebagai aplikasi

## 📋 Prerequisites

- Node.js 16+ dan npm
- Firebase project (untuk production)
- Git

## 🔧 Setup Lokal

### 1. Clone Repository
```bash
git clone <repository-url>
cd aplikasi-pos
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment Variables
```bash
# Copy template
cp .env.example .env.local

# Edit .env.local dan isi Firebase credentials
# VITE_FIREBASE_API_KEY=your_api_key
# VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
# ... dst
```

### 4. Run Development Server
```bash
npm run dev
```

Aplikasi akan berjalan di `http://localhost:5173`

### 5. Build untuk Production
```bash
npm run build
```

Output akan ada di folder `dist/`

## 🔐 Security

### Environment Variables
- **JANGAN** commit `.env.local` ke git
- `.env.local` sudah di-ignore di `.gitignore`
- Gunakan `.env.example` sebagai template

### Firebase Credentials
- API key disimpan di environment variables
- Tidak ada credentials di source code
- Firestore rules implement role-based access control

### Authentication
- Gunakan Firebase Authentication untuk login
- Passwords tidak disimpan di client-side
- Implement proper password hashing di server

## 👥 User Roles

### Admin
- Kelola produk dan stok
- Lihat laporan penjualan
- Manage user passwords
- Reset data aplikasi

### Cashier
- Proses transaksi penjualan
- Lihat daftar produk
- Lihat history transaksi

## 📱 Default Login (Development)

```
Admin:
- Username: admin
- Password: admin123

Cashier:
- Username: kasir
- Password: kasir123
```

⚠️ **PENTING**: Ganti password ini sebelum production!

## 🗄️ Database Structure

### Firestore Collections

```
users/
  {userId}/
    - role: 'admin' | 'cashier'
    - email: string
    - name: string

products/
  {productId}/
    - name: string
    - type: 'layang' | 'benang'
    - price: number
    - stock: number
    - minStock: number
    - image: string (URL)
    - color: string (hex)
    - desc: string
    - updatedAt: timestamp

sales/
  {saleId}/
    - date: string (YYYY-MM-DD)
    - cashier: string
    - items: number
    - total: number
    - payment: 'Tunai'
    - cashReceived: number
    - change: number
    - createdAt: timestamp

settings/
  app/
    - themeId: string

auditLogs/
  {logId}/
    - userId: string
    - action: string
    - detail: string
    - timestamp: timestamp
```

## 🔒 Firestore Security Rules

Aplikasi menggunakan role-based access control:

- **Products**: Semua user bisa baca, hanya admin bisa edit
- **Sales**: Semua user bisa baca, admin & cashier bisa buat, hanya admin bisa edit/delete
- **Settings**: Hanya admin bisa akses
- **Audit Logs**: User bisa baca log mereka, admin bisa baca semua

## 📊 Laporan & Export

- Export laporan penjualan ke CSV
- Print laporan ke PDF
- Filter laporan per periode (harian, mingguan, bulanan, tahunan)
- Tracking stok produk yang menipis

## 🎨 Themes

1. **Hijau Segar** - Bersih, ringan, cocok untuk toko harian
2. **Langit Layang** - Cerah, muda, enak untuk tablet kasir
3. **Senja Pasar** - Hangat, ramah, tetap profesional
4. **Modern Gelap** - Kontras tinggi untuk layar redup

## 📦 Tech Stack

- **Frontend**: React 19, Vite 7
- **Styling**: CSS3 dengan CSS Variables
- **Icons**: Lucide React
- **Backend**: Firebase (Firestore, Storage, Auth)
- **Deployment**: Vercel (recommended)

## 🚀 Deployment

### Deploy ke Vercel

1. Push ke GitHub
2. Connect repository ke Vercel
3. Set environment variables di Vercel dashboard
4. Deploy

### Deploy ke Firebase Hosting

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
npm run build
firebase deploy
```

## 📝 Development

### Project Structure
```
src/
├── main.jsx           # Main app component
├── firebase.js        # Firebase configuration
├── styles.css         # Global styles
├── hooks/
│   └── useToast.jsx   # Toast notification hook
└── utils/
    └── validators.js  # Input validation utilities
```

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
```

## 🐛 Troubleshooting

### Firebase Connection Error
- Pastikan `.env.local` sudah diisi dengan benar
- Check Firebase project credentials
- Pastikan Firestore sudah enabled di Firebase Console

### Image Upload Gagal
- Check Firebase Storage rules
- Pastikan file size < 3MB
- Pastikan file format adalah image (jpg, png, gif, etc)

### Sync Data Tidak Berfungsi
- Check internet connection
- Verify Firestore rules
- Check browser console untuk error messages

## 📚 Documentation

- `AUDIT_FIXES.md` - Dokumentasi perbaikan security
- `.env.example` - Template environment variables

## 📄 License

Private - Untuk penggunaan internal UMKM Layang Layar

## 👨‍💻 Support

Untuk pertanyaan atau issue, hubungi tim development.

---

**Last Updated**: 26 April 2026
**Version**: 0.1.0
**Status**: Production Ready (dengan Firebase setup)

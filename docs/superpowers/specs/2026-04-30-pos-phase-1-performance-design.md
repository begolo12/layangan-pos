# POS Phase 1 Performance Design

## Ringkasan

Fase 1 berfokus pada optimasi internal aplikasi POS Layang Layar tanpa mengubah flow bisnis, tampilan besar, atau menambah fitur baru. Tujuan utamanya adalah membuat aplikasi terasa lebih cepat di semua device, terutama saat startup, saat berpindah screen, saat sinkronisasi Firebase lambat, dan saat dipakai di perangkat Android low-end.

Pendekatan yang dipilih adalah fondasi performa bertahap: memecah bootstrap aplikasi, menyatukan local cache, memindahkan sinkronisasi Firebase ke layer khusus, dan memisahkan screen berat agar dapat dimuat bertahap.

## Tujuan

- Mempercepat startup aplikasi dengan local-first hydration.
- Menjaga aplikasi tetap responsif saat Firebase lambat atau offline.
- Mengurangi beban `src/main.jsx` yang saat ini menjadi titik bootstrap, state, UI, dan sinkronisasi sekaligus.
- Membuat struktur aplikasi lebih maintainable untuk optimasi lanjutan pada fase berikutnya.

## Non-Goal

- Tidak menambah fitur bisnis baru.
- Tidak melakukan redesign besar pada tampilan.
- Tidak mengubah flow login, kasir, admin, laporan, atau tema dari sudut pandang user.
- Tidak melakukan refactor total seluruh aplikasi sekaligus.

## Kondisi Saat Ini

- `src/main.jsx` menangani terlalu banyak tanggung jawab: bootstrap, local state, integrasi Firebase, login, POS screen, backoffice, laporan, dan helper turunan.
- Terdapat dua pola penyimpanan lokal yang belum disatukan: `useLocalState` di `src/main.jsx` dan `src/services/storageService.ts`.
- Bootstrap Firebase dijalankan langsung dari root app, sehingga jalur awal aplikasi memuat logic sinkronisasi dan subscription sejak awal.
- Beberapa area berat admin tetap berada dalam tree komponen yang sama, sehingga berpotensi ikut membebani startup dan render lintas screen.

## Keputusan Desain

### 1. Arsitektur tingkat atas

- `src/main.jsx` akan diperkecil menjadi entry point dan mount root saja.
- Bootstrap aplikasi dipindahkan ke modul khusus agar root render lebih ringan.
- UI utama akan dipecah menjadi screen terpisah: login, kasir, dan backoffice.
- Screen backoffice dan area berat akan dimuat bertahap menggunakan lazy loading.

### 2. Model data

- Aplikasi menggunakan pendekatan local-first dengan background sync.
- Saat startup, aplikasi membaca cache lokal lebih dulu lalu langsung render UI.
- Firebase tetap menjadi source of truth untuk `products`, `users`, `settings`, dan `productTypes`.
- `sales` menggunakan aturan konflik lokal menang lalu di-push ke Firebase, agar transaksi offline tidak hilang.

### 3. Store terpusat

- State inti aplikasi dipusatkan ke satu store aplikasi.
- Store bertanggung jawab untuk hydrate cache lokal, persist perubahan, menerima update sync, dan menjalankan action aplikasi.
- Komponen UI tidak lagi melakukan akses local storage atau sinkronisasi Firebase secara langsung.

### 4. Layer sinkronisasi khusus

- Seluruh interaksi Firebase untuk subscription, push data, conflict handling, dan status sync dipindahkan ke service khusus.
- Status sinkronisasi dibuat eksplisit agar UI dan debugging lebih konsisten.
- Pending sales untuk kondisi offline disimpan lokal dan dikirim saat koneksi kembali.

### 5. Optimasi render

- Data turunan seperti filter laporan, chart rows, low stock, dan ringkasan dipindah ke helper atau selector terpisah.
- Setiap screen hanya menerima state yang memang dibutuhkan.
- Area admin tidak dimuat penuh saat user hanya membutuhkan login atau mode kasir.

## Aturan Konflik Data

### Sales

- Perubahan lokal menang.
- Sale baru yang dibuat saat offline atau saat sinkronisasi gagal tetap disimpan lokal.
- Data sales yang belum tersinkron ditandai sebagai pending sync.
- Saat koneksi kembali, sale pending dikirim ke Firebase dengan mekanisme yang aman dari duplikasi.

### Products, Users, Settings, Product Types

- Firebase menang.
- Cache lokal boleh dipakai untuk render awal, tetapi hasil sync Firebase akan menimpa state lokal jika ada perbedaan.
- Tujuannya adalah mencegah master data dari device lain tertimpa oleh cache lama.

## Struktur Modul yang Diusulkan

- `src/main.jsx`: entry point root aplikasi.
- `src/app/AppShell.jsx`: komposisi screen aktif dan shell aplikasi.
- `src/app/useAppBootstrap.js`: hydrate cache, start sync, dan inisialisasi awal.
- `src/store/appStore.js`: state inti aplikasi.
- `src/store/appActions.js`: action terstruktur untuk login, logout, create sale, save product, reset, theme, dan sync.
- `src/services/localCache.js`: pembungkus akses local storage dengan satu pola cache.
- `src/services/syncService.js`: subscription Firebase, push pending sales, dan aturan konflik.
- `src/screens/LoginScreen.jsx`: layar login terpisah.
- `src/screens/PosScreen.jsx`: layar kasir yang dijaga ringan.
- `src/screens/BackofficeScreen.jsx`: layar admin yang dimuat bertahap.

Struktur ini menjaga perubahan tetap terfokus pada fondasi performa, sambil mengikuti pola yang sudah mulai muncul di repo seperti `services`, `components`, dan `types`.

## Urutan Implementasi

1. Bentuk bootstrap ringan dan pindahkan state inti keluar dari `src/main.jsx`.
2. Satukan local cache ke service tunggal.
3. Pindahkan logika Firebase sync ke service tersendiri.
4. Terapkan conflict rules dan pending sales sync.
5. Pecah screen login, kasir, dan admin.
6. Terapkan lazy loading untuk area berat admin.
7. Rapikan helper atau selector turunan agar render tidak boros.
8. Verifikasi startup, offline sales, dan sync recovery.

Urutan ini dipilih agar fondasi data selesai lebih dulu, lalu dampak performa yang terlihat user datang dari split screen dan lazy loading.

## Risiko Utama

- Refactor struktur dapat memecah perilaku lama tanpa terlihat jelas jika verifikasi lemah.
- Pending sales sync harus idempotent agar tidak mengirim transaksi ganda.
- Conflict rules yang berbeda per entitas harus konsisten di semua jalur update.
- Lazy loading admin tidak boleh membuat dependency penting untuk kasir ikut tertunda.

## Strategi Verifikasi

### Startup

- Aplikasi bisa render dari cache lokal tanpa menunggu Firebase.
- Login screen dan screen utama muncul stabil di device lemah.
- Backoffice tidak ikut membebani startup sebelum dibuka.

### Sinkronisasi

- Saat online, produk dan settings mengikuti Firebase.
- Saat offline, sale baru tetap tersimpan lokal.
- Saat koneksi kembali, pending sales terkirim tanpa duplikasi.

### Regresi flow bisnis

- Flow login tetap sama.
- Flow transaksi kasir tetap sama.
- Flow CRUD produk dan backoffice tetap sama.
- Laporan dan history tetap benar setelah modul dipisah.

### Performa

- Initial load lebih ringan.
- Perpindahan antar screen lebih stabil.
- Input nominal kasir tetap responsif walau sync lambat.
- Render berat di admin berkurang setelah area dan selector dipisah.

## Hasil Akhir yang Diharapkan

Setelah fase 1 selesai, aplikasi tetap terlihat dan bekerja seperti sebelumnya dari sudut pandang user, tetapi memiliki startup yang lebih cepat, perilaku offline yang lebih andal, sinkronisasi yang lebih jelas, dan struktur internal yang lebih siap untuk optimasi fase berikutnya.

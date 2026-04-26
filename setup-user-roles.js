// Script untuk setup user roles di Firestore
// Jalankan script ini di browser console saat sudah login ke aplikasi

async function setupUserRoles() {
  console.log('🔧 Starting user roles setup...');
  
  try {
    // Import Firebase modules
    const firebaseModule = await import('./firebase.js');
    const { db, auth } = firebaseModule;
    
    // Import Firestore functions
    const { doc, setDoc, serverTimestamp } = await import('firebase/firestore');
    
    // Get current user (harus sudah login)
    if (!auth.currentUser) {
      console.error('❌ Error: Anda harus login dulu!');
      console.log('💡 Tip: Login dengan salah satu akun (admin@admin.com atau kasir@kasir.com)');
      return;
    }
    
    console.log('✅ Current user:', auth.currentUser.email);
    console.log('✅ Current UID:', auth.currentUser.uid);
    
    // Tanya user mau setup sebagai apa
    const isAdmin = confirm('Apakah akun ini adalah ADMIN?\n\nKlik OK untuk Admin\nKlik Cancel untuk Kasir');
    
    const userData = {
      email: auth.currentUser.email,
      role: isAdmin ? 'admin' : 'cashier',
      name: isAdmin ? 'Admin' : 'Kasir',
      createdAt: serverTimestamp(),
    };
    
    // Save to Firestore
    await setDoc(doc(db, 'users', auth.currentUser.uid), userData);
    
    console.log('✅ User role berhasil disimpan!');
    console.log('📊 Data:', userData);
    console.log('🎉 Setup selesai! Silakan logout dan login lagi.');
    
    alert(`✅ Setup berhasil!\n\nEmail: ${userData.email}\nRole: ${userData.role}\nName: ${userData.name}\n\nSilakan logout dan login lagi.`);
    
  } catch (error) {
    console.error('❌ Error:', error);
    alert(`❌ Error: ${error.message}`);
  }
}

// Run the setup
setupUserRoles();

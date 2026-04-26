import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { getAuth, signInAnonymously } from 'firebase/auth';

// Test Firebase connection
export async function testFirebaseConnection() {
  try {
    console.log('🔍 Testing Firebase connection...');

    const firebaseConfig = {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID,
      measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
    };

    console.log('✅ Firebase config loaded:', {
      projectId: firebaseConfig.projectId,
      authDomain: firebaseConfig.authDomain,
    });

    const app = initializeApp(firebaseConfig);
    console.log('✅ Firebase app initialized');

    const auth = getAuth(app);
    console.log('✅ Firebase Auth initialized');

    const db = getFirestore(app);
    console.log('✅ Firestore initialized');

    // Test authentication
    console.log('🔍 Testing authentication...');
    const userCredential = await signInAnonymously(auth);
    console.log('✅ Anonymous auth successful:', userCredential.user.uid);

    // Test Firestore read
    console.log('🔍 Testing Firestore read...');
    const productsRef = collection(db, 'products');
    const snapshot = await getDocs(productsRef);
    console.log('✅ Firestore read successful:', snapshot.size, 'products found');

    console.log('🎉 Firebase connection test PASSED!');
    return {
      success: true,
      message: 'Firebase connection successful',
      projectId: firebaseConfig.projectId,
      productsCount: snapshot.size,
    };
  } catch (error) {
    console.error('❌ Firebase connection test FAILED:', error);
    return {
      success: false,
      message: error.message,
      code: error.code,
    };
  }
}

// Run test on page load
if (typeof window !== 'undefined') {
  window.testFirebaseConnection = testFirebaseConnection;
  console.log('💡 Run testFirebaseConnection() in console to test Firebase');
}

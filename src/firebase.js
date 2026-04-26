import { initializeApp } from 'firebase/app';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { getAuth, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  getFirestore,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);

isSupported()
  .then((supported) => {
    if (supported) getAnalytics(app);
  })
  .catch(() => {});

export async function ensureFirebaseAuth() {
  if (auth.currentUser) return auth.currentUser;
  return null;
}

export async function loginWithEmail(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function logout() {
  try {
    await signOut(auth);
  } catch (error) {
    throw new Error(error.message);
  }
}

export function subscribeProducts(onData, onError) {
  return onSnapshot(
    query(collection(db, 'products'), orderBy('name')),
    (snapshot) => onData(snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))),
    onError
  );
}

export function subscribeSales(onData, onError) {
  return onSnapshot(
    query(collection(db, 'sales'), orderBy('createdAt', 'desc')),
    (snapshot) => onData(snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))),
    onError
  );
}

export function subscribeSettings(onData, onError) {
  return onSnapshot(doc(db, 'settings', 'app'), (snapshot) => {
    if (snapshot.exists()) onData(snapshot.data());
  }, onError);
}

export async function saveTheme(themeId) {
  await setDoc(doc(db, 'settings', 'app'), { themeId }, { merge: true });
}

export async function saveProduct(product) {
  const id = product.id || `${product.type}-${Date.now()}`;
  await setDoc(doc(db, 'products', id), {
    ...product,
    id,
    price: Number(product.price || 0),
    stock: Number(product.stock || 0),
    updatedAt: serverTimestamp(),
  });
  return id;
}

export async function updateProductStock(productId, stock) {
  await updateDoc(doc(db, 'products', productId), {
    stock: Number(stock || 0),
    updatedAt: serverTimestamp(),
  });
}

export async function removeProduct(productId) {
  await deleteDoc(doc(db, 'products', productId));
}

export async function removeSale(saleId) {
  await deleteDoc(doc(db, 'sales', saleId));
}

export async function saveSale(sale) {
  await setDoc(doc(db, 'sales', sale.id), {
    ...sale,
    createdAt: serverTimestamp(),
  });
}

export async function uploadProductImage(file) {
  const extension = file.name.split('.').pop() || 'jpg';
  const imageRef = ref(storage, `products/${Date.now()}-${crypto.randomUUID()}.${extension}`);
  await uploadBytes(imageRef, file);
  return getDownloadURL(imageRef);
}

export async function seedProductsIfEmpty(products) {
  const snapshot = await getDocs(collection(db, 'products'));
  if (!snapshot.empty) return;
  await Promise.all(products.map((product) => saveProduct(product)));
}

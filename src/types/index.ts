export interface User {
  uid: string;
  email: string;
  role: 'admin' | 'cashier';
  name: string;
  firebaseAuth?: boolean;
}

export interface Product {
  id: string;
  name: string;
  type: string;
  price: number;
  stock: number;
  minStock: number;
  image?: string;
  color: string;
  desc?: string;
}

export interface Sale {
  id: string;
  date: string;
  cashier: string;
  total: number;
  items: number;
  payment: string;
  category: string;
  cashReceived?: number;
  change?: number;
  memo?: string;
}

export interface HistoryLog {
  id: string;
  time: string;
  actor: string;
  action: string;
  detail: string;
}

export interface Theme {
  id: string;
  name: string;
  note: string;
  colors: string[];
}

export interface ProductType {
  id: string;
  name: string;
  color: string;
}

export interface Deposit {
  id: string;
  date: string;
  amount: number;
  note?: string;
}

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

export interface Dialog {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export interface Session {
  uid: string;
  email: string;
  role: 'admin' | 'cashier';
  name: string;
  firebaseAuth?: boolean;
  createdAt: number;
  expiresAt: number;
}

export interface AppState {
  session: Session | null;
  products: Product[];
  sales: Sale[];
  users: User[];
  historyLog: HistoryLog[];
  themeId: string;
  productTypes: ProductType[];
}

export interface FirebaseAPI {
  ensureFirebaseAuth: () => Promise<any>;
  loginWithEmail: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  subscribeProducts: (onData: (products: Product[]) => void, onError: (error: any) => void) => () => void;
  subscribeSales: (onData: (sales: Sale[]) => void, onError: (error: any) => void) => () => void;
  saveProduct: (product: Product) => Promise<string>;
  saveSale: (sale: Sale) => Promise<void>;
  removeProduct: (productId: string) => Promise<void>;
  removeSale: (saleId: string) => Promise<void>;
  uploadProductImage: (file: File) => Promise<string>;
  saveTheme: (themeId: string) => Promise<void>;
  seedProductsIfEmpty: (products: Product[]) => Promise<void>;
}
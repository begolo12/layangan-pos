import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  BarChart3,
  Boxes,
  ChevronLeft,
  CalendarDays,
  ClipboardList,
  Download,
  History,
  ImagePlus,
  Eye,
  EyeOff,
  KeyRound,
  LayoutDashboard,
  LockKeyhole,
  LogOut,
  Minus,
  PackagePlus,
  Plus,
  Printer,
  ReceiptText,
  Search,
  Settings,
  ShoppingCart,
  Sparkles,
  Trash2,
  UserRound,
  WalletCards,
  AlertCircle,
  CheckCircle,
  Info,
} from 'lucide-react';
import './styles.css';
import { useToast, ToastContainer } from './hooks/useToast';
import { useConfirmDialog, ConfirmDialog } from './hooks/useConfirmDialog';
import { validators, sanitize } from './utils/validators';
import { testFirebaseConnection } from './utils/firebaseTest';

const currency = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
});

const themes = [
  {
    id: 'segar',
    name: 'Hijau Segar',
    note: 'bersih, ringan, cocok untuk toko harian',
    colors: ['#0f766e', '#22c55e', '#f7fbf8'],
  },
  {
    id: 'langit',
    name: 'Langit Layang',
    note: 'cerah, muda, enak untuk tablet kasir',
    colors: ['#2563eb', '#06b6d4', '#f8fbff'],
  },
  {
    id: 'senja',
    name: 'Senja Pasar',
    note: 'hangat, ramah, tetap profesional',
    colors: ['#c2410c', '#f59e0b', '#fffaf4'],
  },
  {
    id: 'mono',
    name: 'Modern Gelap',
    note: 'kontras tinggi untuk layar redup',
    colors: ['#111827', '#14b8a6', '#f9fafb'],
  },
];

const seedProducts = [
  {
    id: 'kite-super-1',
    name: 'Layang Adu Super',
    type: 'layang',
    price: 12000,
    stock: 36,
    minStock: 10,
    image: '',
    color: '#0f766e',
    desc: 'Bambu ringan, kertas kuat',
  },
  {
    id: 'kite-anak-2',
    name: 'Layang Anak Motif',
    type: 'layang',
    price: 8000,
    stock: 48,
    minStock: 10,
    image: '',
    color: '#2563eb',
    desc: 'Motif ramai, cocok paket hemat',
  },
  {
    id: 'thread-gelas-1',
    name: 'Benang Gelasan Mini',
    type: 'benang',
    price: 15000,
    stock: 18,
    minStock: 8,
    image: '',
    color: '#c2410c',
    desc: 'Ukuran kecil, cepat laku',
  },
  {
    id: 'thread-roll-2',
    name: 'Benang Roll Polos',
    type: 'benang',
    price: 10000,
    stock: 25,
    minStock: 8,
    image: '',
    color: '#7c3aed',
    desc: 'Aman untuk pemula',
  },
];

const demoSales = [
  { id: 'S-1001', date: '2026-04-24', cashier: 'Kasir', total: 47000, items: 4, payment: 'Tunai' },
  { id: 'S-1002', date: '2026-04-25', cashier: 'Kasir', total: 72000, items: 6, payment: 'Tunai' },
  { id: 'S-1003', date: '2026-04-26', cashier: 'Admin', total: 30000, items: 2, payment: 'Tunai' },
];

const users = [
  {
    username: 'admin',
    password: 'admin123',
    role: 'admin',
    name: 'Admin',
    title: 'Admin Backoffice',
    note: 'Kelola produk, stok, laporan, dan tema toko',
    icon: LayoutDashboard,
  },
  {
    username: 'kasir',
    password: 'kasir123',
    role: 'cashier',
    name: 'Kasir',
    title: 'Kasir POS',
    note: 'Jualan cepat dari HP atau tablet low-end',
    icon: ShoppingCart,
  },
];

const defaultHistory = [
  {
    id: 'H-1001',
    time: '2026-04-26 09:00',
    actor: 'Sistem',
    action: 'Aplikasi dibuat',
    detail: 'Data awal produk dan transaksi demo disiapkan.',
  },
];

function toDate(dateText) {
  const date = new Date(`${dateText}T00:00:00`);
  return Number.isNaN(date.getTime()) ? new Date() : date;
}

function startOfDay(date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function getPeriodRange(period) {
  const now = startOfDay(new Date());
  const start = new Date(now);

  if (period === 'weekly') {
    const day = start.getDay() || 7;
    start.setDate(start.getDate() - day + 1);
  } else if (period === 'monthly') {
    start.setDate(1);
  } else if (period === 'yearly') {
    start.setMonth(0, 1);
  }

  const end = new Date(now);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

function filterSalesByPeriod(sales, period) {
  const { start, end } = getPeriodRange(period);
  return sales.filter((sale) => {
    const date = toDate(sale.date);
    return date >= start && date <= end;
  });
}

function isLowStock(product) {
  return Number(product.stock || 0) <= Number(product.minStock || 10);
}

function getPeriodLabel(period) {
  return {
    daily: 'Harian',
    weekly: 'Mingguan',
    monthly: 'Bulanan',
    yearly: 'Tahunan',
  }[period];
}

function nowStamp() {
  return new Date().toLocaleString('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

const defaultProductTypes = [
  { id: 'layang', name: 'Layang-layang', color: '#2563eb' },
  { id: 'benang', name: 'Benang', color: '#f59e0b' },
];

function useLocalState(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const update = (next) => {
    setValue((current) => {
      const valueToStore = typeof next === 'function' ? next(current) : next;
      localStorage.setItem(key, JSON.stringify(valueToStore));
      return valueToStore;
    });
  };

  return [value, update];
}

function App() {
  const [session, setSession] = useLocalState('pos-session', null);
  const [products, setProducts] = useLocalState('pos-products', seedProducts);
  const [sales, setSales] = useLocalState('pos-sales', demoSales);
  const [appUsers, setAppUsers] = useLocalState('pos-users', users);
  const [historyLog, setHistoryLog] = useLocalState('pos-history', defaultHistory);
  const [themeId, setThemeId] = useLocalState('pos-theme', 'senja');
  const [productTypes, setProductTypes] = useLocalState('pos-product-types', defaultProductTypes);
  const [syncStatus, setSyncStatus] = useState('Menghubungkan Firebase...');
  const [firebaseApi, setFirebaseApi] = useState(null);
  const { toasts, addToast, removeToast } = useToast();
  const { dialog, confirm, setDialog } = useConfirmDialog();
  const theme = themes.find((item) => item.id === themeId) || themes[0];

  useEffect(() => {
    if (themeId !== 'senja') setThemeId('senja');
  }, [themeId]);

  // Make test function available in console
  useEffect(() => {
    window.testFirebaseConnection = testFirebaseConnection;
    console.log('💡 Tip: Run testFirebaseConnection() in console to test Firebase connection');
  }, []);

  useEffect(() => {
    let unsubProducts = () => {};
    let unsubSales = () => {};
    let unsubSettings = () => {};

    import('./firebase')
      .then(async (api) => {
        setFirebaseApi(api);
        await api.ensureFirebaseAuth();
        setSyncStatus('Online dengan Firebase');
        await api.seedProductsIfEmpty(seedProducts);
        
        // Subscribe to products - always update, even if empty
        unsubProducts = api.subscribeProducts((items) => {
          setProducts(items.length > 0 ? items : seedProducts);
        }, (error) => {
          setSyncStatus('Mode lokal: produk belum tersambung');
          addToast('Gagal sinkronisasi produk', 'error');
        });
        
        // Subscribe to sales
        unsubSales = api.subscribeSales((items) => {
          if (items.length > 0) setSales(items);
        }, (error) => {
          setSyncStatus('Mode lokal: laporan belum tersambung');
          addToast('Gagal sinkronisasi laporan', 'error');
        });
      })
      .catch((error) => {
        const code = error?.code || error?.message || 'Firebase belum bisa diakses';
        setSyncStatus(`Mode lokal: ${code}`);
        addToast(`Firebase error: ${code}`, 'error');
      });

    return () => {
      unsubProducts();
      unsubSales();
      unsubSettings();
    };
  }, []);

  const changeTheme = (nextThemeId) => {
    setThemeId(nextThemeId);
    firebaseApi?.saveTheme(nextThemeId).catch(() => {
      setSyncStatus('Tema tersimpan lokal, Firebase belum bisa diakses');
      addToast('Tema tersimpan lokal', 'info');
    });
  };

  const addHistory = (action, detail, actor = session?.name || 'Sistem') => {
    setHistoryLog((current) => [
      {
        id: `H-${Date.now().toString().slice(-6)}`,
        time: nowStamp(),
        actor,
        action,
        detail,
      },
      ...current,
    ]);
  };

  return (
    <main className={`app theme-${theme.id}`}>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <ConfirmDialog dialog={dialog} onClose={() => setDialog(null)} />
      {!session ? (
        <Login users={appUsers} setSession={setSession} addToast={addToast} />
      ) : session.role === 'admin' ? (
        <BackOffice
          products={products}
          setProducts={setProducts}
          sales={sales}
          setSales={setSales}
          setSession={setSession}
          appUsers={appUsers}
          setAppUsers={setAppUsers}
          historyLog={historyLog}
          setHistoryLog={setHistoryLog}
          addHistory={addHistory}
          themeId={themeId}
          setThemeId={changeTheme}
          firebaseApi={firebaseApi}
          addToast={addToast}
          confirm={confirm}
          productTypes={productTypes}
          setProductTypes={setProductTypes}
        />
      ) : (
        <PosScreen
          products={products}
          setProducts={setProducts}
          sales={sales}
          setSales={setSales}
          setSession={setSession}
          firebaseApi={firebaseApi}
          addHistory={addHistory}
          addToast={addToast}
          productTypes={productTypes}
        />
      )}
    </main>
  );
}

function Login({ users, setSession, addToast }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [useFirebaseAuth, setUseFirebaseAuth] = useState(true);

  const login = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (useFirebaseAuth) {
        // Firebase Authentication
        const firebaseModule = await import('./firebase');
        const userData = await firebaseModule.loginWithEmail(email, password);
        
        setSession({
          uid: userData.uid,
          email: userData.email,
          role: userData.role,
          name: userData.name,
          firebaseAuth: true,
        });
        addToast(`Selamat datang, ${userData.name}!`, 'success');
      } else {
        // Local Authentication (fallback)
        const user = users.find(
          (item) =>
            item.username.toLowerCase() === email.trim().toLowerCase() &&
            item.password === password
        );

        if (!user) {
          setError('Username atau password belum cocok.');
          addToast('Login gagal: username atau password salah', 'error');
          setLoading(false);
          return;
        }

        setSession({ role: user.role, name: user.name, firebaseAuth: false });
        addToast(`Selamat datang, ${user.name}!`, 'success');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Terjadi kesalahan saat login');
      addToast(err.message || 'Login gagal', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="login-shell">
      <div className="brand-panel">
        <div className="brand-mark">
          <Sparkles size={25} />
        </div>
        <p className="eyebrow">POS UMKM ringan</p>
        <h1>Layang Layar</h1>
        <p className="lead">
          Kasir simpel untuk jualan layang-layang dan benang, plus backoffice web untuk stok
          dan laporan penjualan.
        </p>
      </div>

      <div className="login-panel">
        <form className="login-form" onSubmit={login}>
          <p className="eyebrow">Masuk aplikasi</p>
          <h2>Login toko</h2>
          
          <div className="auth-toggle">
            <label className="toggle-option">
              <input
                type="radio"
                checked={useFirebaseAuth}
                onChange={() => setUseFirebaseAuth(true)}
              />
              <span>Firebase Auth</span>
            </label>
            <label className="toggle-option">
              <input
                type="radio"
                checked={!useFirebaseAuth}
                onChange={() => setUseFirebaseAuth(false)}
              />
              <span>Local Auth</span>
            </label>
          </div>
          
          <label>
            {useFirebaseAuth ? 'Email' : 'Username'}
            <span className="input-with-icon">
              <UserRound />
              <input
                autoComplete="username"
                type={useFirebaseAuth ? 'email' : 'text'}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder={useFirebaseAuth ? 'admin@admin.com' : 'admin atau kasir'}
                disabled={loading}
              />
            </span>
          </label>
          <label>
            Password
            <span className="input-with-icon">
              <LockKeyhole />
              <input
                autoComplete="current-password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Masukkan password"
                disabled={loading}
              />
            </span>
          </label>
          {error && <p className="login-error">{error}</p>}
          <button className="login-submit" type="submit" disabled={loading}>
            <KeyRound />
            {loading ? 'Sedang login...' : 'Masuk'}
          </button>
          
          {useFirebaseAuth && (
            <p className="login-hint">
              Gunakan akun Firebase: admin@admin.com atau kasir@kasir.com
            </p>
          )}
        </form>
      </div>
    </section>
  );
}

function ProductArt({ product, large = false }) {
  if (product.image) {
    return <img className={`product-art ${large ? 'large' : ''}`} src={product.image} alt={product.name} />;
  }

  return (
    <div className={`product-art generated ${large ? 'large' : ''}`} style={{ '--item-color': product.color }}>
      {product.type === 'layang' ? (
        <span className="kite-shape" />
      ) : (
        <span className="thread-shape" />
      )}
    </div>
  );
}

function PosScreen({ products, setProducts, sales, setSales, setSession, firebaseApi, addHistory, addToast, productTypes }) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('semua');
  const [cart, setCart] = useState({});
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [cashReceived, setCashReceived] = useState('');
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const visibleProducts = products.filter((product) => {
    const matchesType = filter === 'semua' || product.type === filter;
    const matchesQuery = product.name.toLowerCase().includes(query.toLowerCase());
    return matchesType && matchesQuery;
  });

  const cartItems = Object.entries(cart)
    .map(([id, qty]) => {
      const product = products.find((item) => item.id === id);
      return product ? { ...product, qty } : null;
    })
    .filter(Boolean);

  const total = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);

  const addItem = (product) => {
    if (product.stock <= (cart[product.id] || 0)) {
      addToast('Stok tidak cukup', 'warning');
      return;
    }
    setCart((current) => ({ ...current, [product.id]: (current[product.id] || 0) + 1 }));
  };

  const changeQty = (id, delta) => {
    setCart((current) => {
      const nextQty = Math.max(0, (current[id] || 0) + delta);
      const next = { ...current, [id]: nextQty };
      if (!nextQty) delete next[id];
      return next;
    });
  };

  const cashNumber = Number(cashReceived || 0);
  const change = Math.max(0, cashNumber - total);
  const canFinishPayment = cartItems.length > 0 && cashNumber >= total;

  const checkout = async () => {
    if (!cartItems.length) return;
    
    setCheckoutLoading(true);
    try {
      const sale = {
        id: `S-${Date.now().toString().slice(-6)}`,
        date: new Date().toISOString().slice(0, 10),
        cashier: 'Kasir',
        total,
        items: cartItems.reduce((sum, item) => sum + item.qty, 0),
        payment: 'Tunai',
        cashReceived: cashNumber,
        change,
      };
      
      setSales([sale, ...sales]);
      const nextProducts = products.map((product) => ({
        ...product,
        stock: product.stock - (cart[product.id] || 0),
      }));
      setProducts(nextProducts);
      
      if (firebaseApi) {
        try {
          await Promise.all([
            firebaseApi.saveSale(sale),
            ...cartItems.map((item) => firebaseApi.updateProductStock(item.id, item.stock - item.qty)),
          ]);
          addToast('Transaksi berhasil disimpan', 'success');
        } catch (error) {
          addToast('Transaksi tersimpan lokal, gagal sinkronisasi Firebase', 'warning');
        }
      }
      
      setCart({});
      setPaymentOpen(false);
      setCashReceived('');
      addHistory?.('Transaksi baru', `${sale.id} dibuat dengan total ${currency.format(total)}.`);
    } catch (error) {
      addToast('Gagal memproses transaksi', 'error');
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    <section className="pos-layout">
      <header className="pos-header">
        <div>
          <p className="eyebrow">Mode kasir</p>
          <h1>POS Layang Layar</h1>
        </div>
        <button className="icon-button" aria-label="Keluar" onClick={() => setSession(null)}>
          <LogOut />
        </button>
      </header>

      <div className="search-row">
        <Search />
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari layang atau benang" />
      </div>

      <div className="segmented">
        <button className={filter === 'semua' ? 'active' : ''} onClick={() => setFilter('semua')} key="semua">
          semua
        </button>
        {productTypes.map((type) => (
          <button className={filter === type.id ? 'active' : ''} onClick={() => setFilter(type.id)} key={type.id}>
            {type.name}
          </button>
        ))}
      </div>

      <div className="pos-content">
        <div className="product-grid">
          {visibleProducts.map((product) => (
            <button className="product-tile" key={product.id} onClick={() => addItem(product)}>
              <ProductArt product={product} />
              <span className="type-pill">{product.type}</span>
              <strong>{product.name}</strong>
              <small>{product.desc}</small>
              <span className="price-row">
                <b>{currency.format(product.price)}</b>
                <em>Stok {product.stock}</em>
              </span>
            </button>
          ))}
        </div>

        <aside className="cart-panel">
          <div className="cart-title">
            <h2>Keranjang</h2>
            <ShoppingCart />
          </div>
          <div className="cart-items">
            {cartItems.length === 0 && <p className="empty">Tap produk untuk mulai transaksi.</p>}
            {cartItems.map((item) => (
              <div className="cart-item" key={item.id}>
                <ProductArt product={item} />
                <span>
                  <strong>{item.name}</strong>
                  <small>{currency.format(item.price)}</small>
                </span>
                <div className="stepper">
                  <button onClick={() => changeQty(item.id, -1)}><Minus size={16} /></button>
                  <b>{item.qty}</b>
                  <button onClick={() => changeQty(item.id, 1)}><Plus size={16} /></button>
                </div>
              </div>
            ))}
          </div>
          <div className="cash-only-row">
            <WalletCards />
            <span>
              <strong>Pembayaran Tunai</strong>
              <small>Hitung uang diterima dan kembalian sebelum transaksi selesai.</small>
            </span>
          </div>
          <div className="total-box">
            <span>Total</span>
            <strong>{currency.format(total)}</strong>
          </div>
          <button className="checkout-button" onClick={() => setPaymentOpen(true)} disabled={!cartItems.length}>
            <ReceiptText />
            Bayar
          </button>
        </aside>
      </div>

      {paymentOpen && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="payment-modal">
            <div className="section-title">
              <div>
                <p className="eyebrow">Pembayaran tunai</p>
                <h2>Hitung kembalian</h2>
              </div>
              <button className="icon-button" aria-label="Tutup" onClick={() => setPaymentOpen(false)}>
                <ChevronLeft />
              </button>
            </div>
            <div className="payment-total">
              <span>Total belanja</span>
              <strong>{currency.format(total)}</strong>
            </div>
            <label>
              Uang diterima
              <input
                autoFocus
                inputMode="numeric"
                type="number"
                value={cashReceived}
                onChange={(event) => setCashReceived(event.target.value)}
                placeholder="Contoh: 50000"
              />
            </label>
            <div className={`change-box ${canFinishPayment && change > 0 ? 'has-change' : ''}`}>
              <span>{cashNumber < total ? 'Kurang bayar' : change > 0 ? 'Kembalian' : 'Uang pas'}</span>
              <strong>{cashNumber < total ? currency.format(total - cashNumber) : currency.format(change)}</strong>
              {canFinishPayment && change > 0 && <small>Serahkan kembalian ke pembeli, lalu tekan selesai.</small>}
            </div>
            <button className="checkout-button" onClick={checkout} disabled={!canFinishPayment || checkoutLoading}>
              <ReceiptText />
              {checkoutLoading ? 'Memproses...' : change > 0 ? 'Selesai, kembalian sudah diserahkan' : 'Selesaikan transaksi'}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

function BackOffice({
  products,
  setProducts,
  sales,
  setSales,
  setSession,
  appUsers,
  setAppUsers,
  historyLog,
  setHistoryLog,
  addHistory,
  firebaseApi,
  addToast,
  confirm,
  productTypes,
  setProductTypes,
}) {
  const [view, setView] = useState('dashboard');
  const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);
  const lowStock = products.filter(isLowStock);
  const totalStock = products.reduce((sum, product) => sum + product.stock, 0);
  const todaySales = filterSalesByPeriod(sales, 'daily');
  const weeklySales = filterSalesByPeriod(sales, 'weekly');
  const todayRevenue = todaySales.reduce((sum, sale) => sum + sale.total, 0);
  const weeklyRevenue = weeklySales.reduce((sum, sale) => sum + sale.total, 0);
  const averageSale = sales.length ? Math.round(totalRevenue / sales.length) : 0;
  const stockValue = products.reduce((sum, product) => sum + product.price * product.stock, 0);
  const stockFocus = lowStock.length ? lowStock : [...products].sort((a, b) => b.stock - a.stock).slice(0, 5);

  return (
    <section className="office-shell">
      <aside className="office-sidebar">
        <div className="office-brand">
          <Sparkles />
          <span>
            <strong>Layang Layar</strong>
            <small>Backoffice Admin</small>
          </span>
        </div>
        <nav>
          <button className={view === 'dashboard' ? 'active' : ''} onClick={() => setView('dashboard')}>
            <LayoutDashboard /> Dashboard
          </button>
          <button className={view === 'products' ? 'active' : ''} onClick={() => setView('products')}>
            <Boxes /> Produk
          </button>
          <button className={view === 'reports' ? 'active' : ''} onClick={() => setView('reports')}>
            <BarChart3 /> Laporan
          </button>
          <button className={view === 'transactions' ? 'active' : ''} onClick={() => setView('transactions')}>
            <ClipboardList /> Transaksi
          </button>
          <button className={view === 'history' ? 'active' : ''} onClick={() => setView('history')}>
            <History /> History
          </button>
          <button className={view === 'settings' ? 'active' : ''} onClick={() => setView('settings')}>
            <Settings /> Setting
          </button>
        </nav>
        <button className="logout-button" onClick={() => setSession(null)}>
          <LogOut /> Keluar
        </button>
      </aside>

      <main className="office-main">
        <header className="office-topbar">
          <button className="back-mobile" onClick={() => setSession(null)}>
            <ChevronLeft /> Keluar
          </button>
          <div>
            <p className="eyebrow">Admin</p>
            <h1>{view === 'dashboard' ? 'Dashboard' : view === 'products' ? 'Produk & Stok' : view === 'reports' ? 'Laporan' : view === 'transactions' ? 'Transaksi' : view === 'history' ? 'History' : 'Setting'}</h1>
          </div>
          <div className="user-chip">
            <UserRound size={18} /> Admin
          </div>
        </header>

        <div className="admin-mobile-nav">
          <button className={view === 'dashboard' ? 'active' : ''} onClick={() => setView('dashboard')}>Dashboard</button>
          <button className={view === 'products' ? 'active' : ''} onClick={() => setView('products')}>Produk</button>
          <button className={view === 'reports' ? 'active' : ''} onClick={() => setView('reports')}>Laporan</button>
          <button className={view === 'transactions' ? 'active' : ''} onClick={() => setView('transactions')}>Transaksi</button>
          <button className={view === 'history' ? 'active' : ''} onClick={() => setView('history')}>History</button>
          <button className={view === 'settings' ? 'active' : ''} onClick={() => setView('settings')}>Setting</button>
        </div>

        {view === 'dashboard' && (
          <>
            <div className="metric-grid">
              <Metric icon={<WalletCards />} label="Omzet hari ini" value={currency.format(todayRevenue)} hint={`${todaySales.length} transaksi`} />
              <Metric icon={<BarChart3 />} label="Omzet minggu ini" value={currency.format(weeklyRevenue)} hint={`${weeklySales.length} transaksi`} />
              <Metric icon={<ReceiptText />} label="Rata-rata nota" value={currency.format(averageSale)} hint="Semua transaksi" />
              <Metric icon={<PackagePlus />} label="Nilai stok" value={currency.format(stockValue)} hint={`${totalStock} barang tersedia`} />
            </div>
            <div className="dashboard-grid">
              <section className="office-section">
                <div className="section-title">
                  <h2>Transaksi terbaru</h2>
                  <small>{sales.length} nota tersimpan</small>
                </div>
                <div className="sales-table compact-table">
                  {sales.slice(0, 6).map((sale) => (
                    <div className="sales-row" key={sale.id}>
                      <span>
                        <strong>{sale.id}</strong>
                        <small>{sale.date} - {sale.cashier}</small>
                      </span>
                      <span>{sale.items} item</span>
                      <span>{sale.payment}</span>
                      <b>{currency.format(sale.total)}</b>
                    </div>
                  ))}
                </div>
              </section>
              <section className="office-section">
                <div className="section-title">
                  <h2>Stok perlu perhatian</h2>
                  <small>{lowStock.length} produk menipis</small>
                </div>
                <div className="inventory-list">
                  {stockFocus.map((product) => (
                    <div className="inventory-item" key={product.id}>
                      <ProductArt product={product} />
                      <span>
                        <strong>{product.name}</strong>
                        <small>{product.type} - {currency.format(product.price)}</small>
                      </span>
                      <b>{product.stock}</b>
                    </div>
                  ))}
                </div>
              </section>
            </div>
            <section className="office-section">
              <h2>Produk cepat dipantau</h2>
              <div className="inventory-list">
                {products.map((product) => (
                  <div className="inventory-item" key={product.id}>
                    <ProductArt product={product} />
                    <span>
                      <strong>{product.name}</strong>
                      <small>{product.type} • {currency.format(product.price)}</small>
                    </span>
                    <b>{product.stock}</b>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        {view === 'products' && <ProductManager products={products} setProducts={setProducts} firebaseApi={firebaseApi} addHistory={addHistory} addToast={addToast} confirm={confirm} productTypes={productTypes} />}
        {view === 'reports' && <ReportsPro sales={sales} products={products} />}
        {view === 'transactions' && <TransactionManager sales={sales} setSales={setSales} firebaseApi={firebaseApi} addHistory={addHistory} addToast={addToast} confirm={confirm} />}
        {view === 'history' && <HistoryPage historyLog={historyLog} />}
        {view === 'settings' && (
          <SettingsPage
            users={appUsers}
            setUsers={setAppUsers}
            setProducts={setProducts}
            setSales={setSales}
            setHistoryLog={setHistoryLog}
            addHistory={addHistory}
            addToast={addToast}
            confirm={confirm}
            productTypes={productTypes}
            setProductTypes={setProductTypes}
          />
        )}
      </main>
    </section>
  );
}

function Metric({ icon, label, value, hint }) {
  return (
    <div className="metric-card">
      <span>{icon}</span>
      <small>{label}</small>
      <strong>{value}</strong>
      {hint && <em>{hint}</em>}
    </div>
  );
}

function ProductManager({ products, setProducts, firebaseApi, addHistory, addToast, confirm, productTypes }) {
  const emptyForm = { name: '', type: 'layang', price: '', stock: '', minStock: 10, desc: '', image: '', color: '#0f766e' };
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const submit = async (event) => {
    event.preventDefault();
    setFormError('');

    // Validation
    const nameError = validators.productName(form.name);
    if (nameError) {
      setFormError(nameError);
      addToast(nameError, 'error');
      return;
    }

    const priceError = validators.price(form.price);
    if (priceError) {
      setFormError(priceError);
      addToast(priceError, 'error');
      return;
    }

    const stockError = validators.stock(form.stock);
    if (stockError) {
      setFormError(stockError);
      addToast(stockError, 'error');
      return;
    }

    const minStockError = validators.minStock(form.minStock);
    if (minStockError) {
      setFormError(minStockError);
      addToast(minStockError, 'error');
      return;
    }

    setSaving(true);
    try {
      const product = {
        ...form,
        name: sanitize.text(form.name),
        id: editingId || `${form.type}-${Date.now()}`,
        price: sanitize.positiveNumber(form.price),
        stock: sanitize.number(form.stock),
        minStock: sanitize.number(form.minStock),
      };
      
      setProducts((current) => editingId
        ? current.map((item) => (item.id === editingId ? product : item))
        : [product, ...current]
      );
      
      try {
        await firebaseApi?.saveProduct(product);
        addToast(editingId ? 'Produk berhasil diperbarui' : 'Produk berhasil ditambahkan', 'success');
      } catch (error) {
        console.error('Firebase save error:', error);
        addToast('Produk tersimpan lokal, gagal sinkronisasi Firebase', 'warning');
      }
      
      addHistory?.(editingId ? 'Produk diedit' : 'Produk baru', `${product.name} ${editingId ? 'diperbarui' : 'ditambahkan'} dengan stok ${product.stock}.`);
      setForm(emptyForm);
      setEditingId('');
    } catch (error) {
      console.error('Product save error:', error);
      addToast('Gagal menyimpan produk', 'error');
    } finally {
      setSaving(false);
    }
  };

  const uploadImage = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Validate file
    if (!file.type.startsWith('image/')) {
      addToast('File harus berupa gambar', 'error');
      return;
    }
    
    if (file.size > 3 * 1024 * 1024) {
      addToast('Ukuran gambar maksimal 3MB', 'error');
      return;
    }
    
    setSaving(true);
    try {
      const imageUrl = firebaseApi ? await firebaseApi.uploadProductImage(file) : '';
      if (!imageUrl) throw new Error('Firebase Storage belum siap');
      setForm((current) => ({ ...current, image: imageUrl }));
      addToast('Gambar berhasil diupload', 'success');
    } catch (error) {
      addToast('Gagal upload gambar ke Firebase, gunakan lokal', 'warning');
      // Fallback to local storage only if Firebase fails
      const reader = new FileReader();
      reader.onload = () => setForm((current) => ({ ...current, image: reader.result }));
      reader.readAsDataURL(file);
    } finally {
      setSaving(false);
    }
  };

  const deleteProduct = async (id) => {
    const deletedProduct = products.find((item) => item.id === id);
    const confirmed = await confirm(
      `Apakah Anda yakin ingin menghapus produk "${deletedProduct?.name || id}"?`,
      'Hapus Produk'
    );
    
    if (!confirmed) return;
    
    setProducts(products.filter((product) => product.id !== id));
    try {
      firebaseApi?.removeProduct(id);
      addToast('Produk berhasil dihapus', 'success');
    } catch (error) {
      addToast('Produk dihapus lokal, gagal sinkronisasi Firebase', 'warning');
    }
    addHistory?.('Produk dihapus', `${deletedProduct?.name || id} dihapus dari daftar barang.`);
  };

  const editProduct = (product) => {
    setEditingId(product.id);
    setForm({
      name: product.name,
      type: product.type,
      price: product.price,
      stock: product.stock,
      minStock: product.minStock || 10,
      desc: product.desc || '',
      image: product.image || '',
      color: product.color || '#0f766e',
    });
  };

  const cancelEdit = () => {
    setEditingId('');
    setForm(emptyForm);
    setFormError('');
  };

  return (
    <div className="product-manager">
      <form className="product-form" onSubmit={submit}>
        <div className="section-title">
          <div>
            <p className="eyebrow">{editingId ? 'Edit produk' : 'Produk baru'}</p>
            <h2>{editingId ? 'Ubah data barang' : 'Tambah barang'}</h2>
          </div>
          {editingId && <button className="secondary-button" type="button" onClick={cancelEdit}>Batal</button>}
        </div>
        <div className="form-grid">
          <label>
            Nama barang
            <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Contoh: Layang Adu Merah" />
          </label>
          <label>
            Tipe
            <select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })}>
              {productTypes.map((type) => (
                <option value={type.id} key={type.id}>{type.name}</option>
              ))}
            </select>
          </label>
          <label>
            Harga
            <input type="number" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} placeholder="12000" min="0" />
          </label>
          <label>
            Stok
            <input type="number" value={form.stock} onChange={(event) => setForm({ ...form, stock: event.target.value })} placeholder="20" min="0" />
          </label>
          <label>
            Minimal stok
            <input type="number" value={form.minStock} onChange={(event) => setForm({ ...form, minStock: event.target.value })} placeholder="10" min="0" />
          </label>
          <label>
            Catatan
            <input value={form.desc} onChange={(event) => setForm({ ...form, desc: event.target.value })} placeholder="Motif / ukuran / kualitas" />
          </label>
          <label>
            Warna fallback
            <input type="color" value={form.color} onChange={(event) => setForm({ ...form, color: event.target.value })} />
          </label>
        </div>
        {formError && <p className="form-error">{formError}</p>}
        <label className="upload-box">
          <ImagePlus />
          <span>{form.image ? 'Gambar sudah dipilih' : saving ? 'Mengunggah...' : 'Upload gambar produk'}</span>
          <input type="file" accept="image/*" onChange={uploadImage} />
        </label>
        {form.image && <img className="preview-image" src={form.image} alt="Preview produk" />}
        <button className="primary-button" type="submit" disabled={saving}>
          <Plus /> {editingId ? 'Update barang' : 'Simpan barang'}
        </button>
      </form>

      <section className="office-section">
        <div className="section-title">
          <div>
            <p className="eyebrow">Inventori</p>
            <h2>Daftar barang</h2>
          </div>
          <small>{products.length} produk</small>
        </div>
        <div className="product-stock-list">
          {products.map((product) => (
            <div className={`stock-card ${isLowStock(product) ? 'low-stock' : ''}`} key={product.id}>
              <ProductArt product={product} large />
              <span>
                <strong>{product.name}</strong>
                <small>{product.type} • {currency.format(product.price)} • stok {product.stock}</small>
              </span>
              <b>{currency.format(product.price)}</b>
              <em>Stok {product.stock} / min {product.minStock || 10}</em>
              {isLowStock(product) && <i>Stok menipis</i>}
              <div className="row-actions">
                <button className="secondary-button" type="button" onClick={() => editProduct(product)}>Edit</button>
                <button className="icon-button danger" aria-label="Hapus produk" onClick={() => deleteProduct(product.id)}>
                  <Trash2 />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function TransactionManager({ sales, setSales, firebaseApi, addHistory, addToast, confirm }) {
  const emptyForm = { id: '', date: '', cashier: '', items: '', total: '', cashReceived: '', change: '' };
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const editSale = (sale) => {
    setForm({
      id: sale.id,
      date: sale.date,
      cashier: sale.cashier,
      items: sale.items,
      total: sale.total,
      cashReceived: sale.cashReceived || sale.total,
      change: sale.change || 0,
    });
  };

  const saveEdit = async (event) => {
    event.preventDefault();
    if (!form.id) return;
    
    setSaving(true);
    try {
      const updatedSale = {
        ...sales.find((sale) => sale.id === form.id),
        id: form.id,
        date: form.date,
        cashier: form.cashier || 'Admin',
        items: Number(form.items || 0),
        total: Number(form.total || 0),
        payment: 'Tunai',
        cashReceived: Number(form.cashReceived || form.total || 0),
        change: Number(form.change || 0),
      };
      
      setSales((current) => current.map((sale) => (sale.id === form.id ? updatedSale : sale)));
      
      try {
        await firebaseApi?.saveSale(updatedSale);
        addToast('Transaksi berhasil diperbarui', 'success');
      } catch (error) {
        addToast('Transaksi diperbarui lokal, gagal sinkronisasi Firebase', 'warning');
      }
      
      addHistory?.('Transaksi diedit', `${updatedSale.id} diperbarui menjadi ${currency.format(updatedSale.total)}.`);
      setForm(emptyForm);
    } catch (error) {
      addToast('Gagal memperbarui transaksi', 'error');
    } finally {
      setSaving(false);
    }
  };

  const deleteSale = async (sale) => {
    const confirmed = await confirm(
      `Apakah Anda yakin ingin menghapus transaksi "${sale.id}"?`,
      'Hapus Transaksi'
    );
    
    if (!confirmed) return;
    
    setSales((current) => current.filter((item) => item.id !== sale.id));
    
    try {
      await firebaseApi?.removeSale?.(sale.id);
      addToast('Transaksi berhasil dihapus', 'success');
    } catch (error) {
      addToast('Transaksi dihapus lokal, gagal sinkronisasi Firebase', 'warning');
    }
    
    addHistory?.('Transaksi dihapus', `${sale.id} dengan total ${currency.format(sale.total)} dihapus.`);
  };

  return (
    <div className="transactions-layout">
      <section className="office-section">
        <div className="section-title">
          <div>
            <p className="eyebrow">Penyesuaian nota</p>
            <h2>{form.id ? `Edit ${form.id}` : 'Pilih transaksi'}</h2>
          </div>
          {form.id && <button className="secondary-button" onClick={() => setForm(emptyForm)}>Batal</button>}
        </div>
        <form className="form-grid" onSubmit={saveEdit}>
          <label>
            Tanggal
            <input type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} disabled={!form.id} />
          </label>
          <label>
            Kasir
            <input value={form.cashier} onChange={(event) => setForm({ ...form, cashier: event.target.value })} disabled={!form.id} />
          </label>
          <label>
            Jumlah item
            <input type="number" value={form.items} onChange={(event) => setForm({ ...form, items: event.target.value })} disabled={!form.id} />
          </label>
          <label>
            Total
            <input type="number" value={form.total} onChange={(event) => setForm({ ...form, total: event.target.value })} disabled={!form.id} />
          </label>
          <label>
            Uang diterima
            <input type="number" value={form.cashReceived} onChange={(event) => setForm({ ...form, cashReceived: event.target.value })} disabled={!form.id} />
          </label>
          <label>
            Kembalian
            <input type="number" value={form.change} onChange={(event) => setForm({ ...form, change: event.target.value })} disabled={!form.id} />
          </label>
          <button className="primary-button" type="submit" disabled={!form.id || saving}>Simpan perubahan</button>
        </form>
      </section>

      <section className="office-section">
        <div className="section-title">
          <div>
            <p className="eyebrow">Daftar transaksi</p>
            <h2>Semua nota</h2>
          </div>
          <small>{sales.length} transaksi</small>
        </div>
        <div className="sales-table">
          {sales.map((sale) => (
            <div className="sales-row transaction-row" key={sale.id}>
              <span>
                <strong>{sale.id}</strong>
                <small>{sale.date} - {sale.cashier}</small>
              </span>
              <span>{sale.items} item</span>
              <b>{currency.format(sale.total)}</b>
              <div className="row-actions">
                <button className="secondary-button" onClick={() => editSale(sale)}>Edit</button>
                <button className="icon-button danger" aria-label="Hapus transaksi" onClick={() => deleteSale(sale)}>
                  <Trash2 />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function HistoryPage({ historyLog }) {
  return (
    <section className="office-section">
      <div className="section-title">
        <div>
          <p className="eyebrow">Audit aktivitas</p>
          <h2>History aplikasi</h2>
        </div>
        <small>{historyLog.length} aktivitas</small>
      </div>
      <div className="history-list">
        {historyLog.map((item) => (
          <div className="history-item" key={item.id}>
            <History />
            <span>
              <strong>{item.action}</strong>
              <small>{item.detail}</small>
              <em>{item.time} - {item.actor}</em>
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

function SettingsPage({ users: authUsers, setUsers, setProducts, setSales, setHistoryLog, addHistory, addToast, confirm, productTypes, setProductTypes }) {
  const [forms, setForms] = useState(() =>
    authUsers.reduce((acc, user) => ({ ...acc, [user.username]: { password: user.password, confirm: user.password } }), {})
  );
  const [message, setMessage] = useState('');
  const [visiblePasswords, setVisiblePasswords] = useState({});
  const [resetPassword, setResetPassword] = useState('');
  const [saving, setSaving] = useState(false);
  
  // Product types management
  const [typeForm, setTypeForm] = useState({ id: '', name: '', color: '#2563eb' });
  const [editingTypeId, setEditingTypeId] = useState('');

  const savePassword = (username) => {
    const next = forms[username];
    if (!next?.password || next.password !== next.confirm) {
      setMessage('Password dan konfirmasi harus sama.');
      addToast('Password dan konfirmasi harus sama', 'error');
      return;
    }
    
    const passwordError = validators.password(next.password);
    if (passwordError) {
      setMessage(passwordError);
      addToast(passwordError, 'error');
      return;
    }
    
    setSaving(true);
    try {
      setUsers((current) => current.map((user) => (user.username === username ? { ...user, password: next.password } : user)));
      addHistory?.('Password diubah', `Password akun ${username} diperbarui.`);
      setMessage(`Password ${username} berhasil diperbarui.`);
      addToast(`Password ${username} berhasil diperbarui`, 'success');
    } catch (error) {
      addToast('Gagal mengubah password', 'error');
    } finally {
      setSaving(false);
    }
  };

  const resetAllData = async () => {
    const admin = authUsers.find((user) => user.username === 'admin');
    if (!resetPassword || resetPassword !== admin?.password) {
      setMessage('Password admin tidak sesuai. Reset dibatalkan.');
      addToast('Password admin tidak sesuai', 'error');
      return;
    }
    
    const confirmed = await confirm(
      'Ini akan menghapus SEMUA data transaksi, produk, history, dan mengembalikan password ke awal. Tindakan ini tidak bisa dibatalkan!',
      'Reset Semua Data'
    );
    
    if (!confirmed) return;
    
    setSaving(true);
    try {
      // Reset semua data ke kondisi awal
      setProducts(seedProducts);
      setSales([]);
      setUsers(users);
      setHistoryLog([
        {
          id: `H-${Date.now().toString().slice(-6)}`,
          time: nowStamp(),
          actor: 'Admin',
          action: 'Reset data',
          detail: 'Semua data lokal aplikasi dikembalikan ke kondisi awal.',
        },
      ]);
      
      // Clear localStorage untuk memastikan data benar-benar direset
      localStorage.removeItem('pos-products');
      localStorage.removeItem('pos-sales');
      localStorage.removeItem('pos-users');
      localStorage.removeItem('pos-history');
      
      // Set ulang dengan data awal
      localStorage.setItem('pos-products', JSON.stringify(seedProducts));
      localStorage.setItem('pos-sales', JSON.stringify([]));
      localStorage.setItem('pos-users', JSON.stringify(users));
      localStorage.setItem('pos-history', JSON.stringify([
        {
          id: `H-${Date.now().toString().slice(-6)}`,
          time: nowStamp(),
          actor: 'Admin',
          action: 'Reset data',
          detail: 'Semua data lokal aplikasi dikembalikan ke kondisi awal.',
        },
      ]));
      
      setResetPassword('');
      setMessage('Data aplikasi berhasil direset.');
      addToast('Data aplikasi berhasil direset', 'success');
    } catch (error) {
      addToast('Gagal mereset data', 'error');
    } finally {
      setSaving(false);
    }
  };
  
  // Product types management functions
  const saveProductType = () => {
    if (!typeForm.name || !typeForm.id) {
      addToast('Nama dan ID tipe harus diisi', 'error');
      return;
    }
    
    if (editingTypeId) {
      // Update existing type
      setProductTypes((current) =>
        current.map((type) => (type.id === editingTypeId ? { ...typeForm } : type))
      );
      addToast('Tipe produk berhasil diperbarui', 'success');
      addHistory?.('Tipe produk diedit', `Tipe "${typeForm.name}" diperbarui.`);
    } else {
      // Add new type
      if (productTypes.find((type) => type.id === typeForm.id)) {
        addToast('ID tipe sudah digunakan', 'error');
        return;
      }
      setProductTypes((current) => [...current, { ...typeForm }]);
      addToast('Tipe produk berhasil ditambahkan', 'success');
      addHistory?.('Tipe produk baru', `Tipe "${typeForm.name}" ditambahkan.`);
    }
    
    setTypeForm({ id: '', name: '', color: '#2563eb' });
    setEditingTypeId('');
  };
  
  const editProductType = (type) => {
    setEditingTypeId(type.id);
    setTypeForm({ ...type });
  };
  
  const deleteProductType = async (typeId) => {
    const type = productTypes.find((t) => t.id === typeId);
    
    // Check if any products use this type
    const productsUsingType = products.filter((p) => p.type === typeId);
    if (productsUsingType.length > 0) {
      addToast(`Tidak bisa hapus: ${productsUsingType.length} produk masih menggunakan tipe ini`, 'error');
      return;
    }
    
    const confirmed = await confirm(
      `Apakah Anda yakin ingin menghapus tipe "${type?.name}"?`,
      'Hapus Tipe Produk'
    );
    
    if (!confirmed) return;
    
    setProductTypes((current) => current.filter((t) => t.id !== typeId));
    addToast('Tipe produk berhasil dihapus', 'success');
    addHistory?.('Tipe produk dihapus', `Tipe "${type?.name}" dihapus.`);
  };
  
  const cancelEditType = () => {
    setEditingTypeId('');
    setTypeForm({ id: '', name: '', color: '#2563eb' });
  };

  return (
    <section className="office-section">
      <div className="section-title">
        <div>
          <p className="eyebrow">Akun aplikasi</p>
          <h2>Setting password</h2>
        </div>
      </div>
      {message && <p className="login-error">{message}</p>}
      
      {/* Product Types Management */}
      <div className="section-title" style={{ marginTop: '32px' }}>
        <div>
          <p className="eyebrow">Tipe produk</p>
          <h2>Kelola tipe produk</h2>
          <small>Tambah, edit, atau hapus tipe produk untuk bisnis Anda</small>
        </div>
      </div>
      
      <div className="product-types-section">
        <div className="type-form-card">
          <strong>{editingTypeId ? 'Edit Tipe Produk' : 'Tambah Tipe Baru'}</strong>
          <label>
            ID Tipe (huruf kecil, tanpa spasi)
            <input
              value={typeForm.id}
              onChange={(event) => setTypeForm({ ...typeForm, id: event.target.value.toLowerCase().replace(/\s/g, '-') })}
              placeholder="contoh: mainan"
              disabled={!!editingTypeId}
            />
          </label>
          <label>
            Nama Tipe
            <input
              value={typeForm.name}
              onChange={(event) => setTypeForm({ ...typeForm, name: event.target.value })}
              placeholder="contoh: Mainan Anak"
            />
          </label>
          <label>
            Warna
            <input
              type="color"
              value={typeForm.color}
              onChange={(event) => setTypeForm({ ...typeForm, color: event.target.value })}
            />
          </label>
          <div className="button-row">
            <button className="primary-button" onClick={saveProductType}>
              {editingTypeId ? 'Update Tipe' : 'Tambah Tipe'}
            </button>
            {editingTypeId && (
              <button className="secondary-button" onClick={cancelEditType}>
                Batal
              </button>
            )}
          </div>
        </div>
        
        <div className="types-list">
          <strong>Tipe Produk Aktif ({productTypes.length})</strong>
          {productTypes.map((type) => (
            <div className="type-item" key={type.id}>
              <div className="type-color" style={{ background: type.color }} />
              <span>
                <strong>{type.name}</strong>
                <small>ID: {type.id}</small>
              </span>
              <div className="row-actions">
                <button className="secondary-button" onClick={() => editProductType(type)}>
                  Edit
                </button>
                <button
                  className="icon-button danger"
                  onClick={() => deleteProductType(type.id)}
                  aria-label="Hapus tipe"
                >
                  <Trash2 />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Password Management */}
      <div className="section-title" style={{ marginTop: '32px' }}>
        <div>
          <p className="eyebrow">Akun aplikasi</p>
          <h2>Setting password</h2>
        </div>
      </div>
      {message && <p className="login-error">{message}</p>}
      <div className="settings-grid">
        {authUsers.map((user) => (
          <div className="settings-card" key={user.username}>
            <strong>{user.title}</strong>
            <small>Username: {user.username}</small>
            <label>
              Password baru
              <span className="password-field">
                <input
                  type={visiblePasswords[`${user.username}-password`] ? 'text' : 'password'}
                  value={forms[user.username]?.password || ''}
                  onChange={(event) => setForms({ ...forms, [user.username]: { ...forms[user.username], password: event.target.value } })}
                />
                <button
                  type="button"
                  aria-label="Lihat password"
                  onClick={() => setVisiblePasswords({ ...visiblePasswords, [`${user.username}-password`]: !visiblePasswords[`${user.username}-password`] })}
                >
                  {visiblePasswords[`${user.username}-password`] ? <EyeOff /> : <Eye />}
                </button>
              </span>
            </label>
            <label>
              Konfirmasi
              <span className="password-field">
                <input
                  type={visiblePasswords[`${user.username}-confirm`] ? 'text' : 'password'}
                  value={forms[user.username]?.confirm || ''}
                  onChange={(event) => setForms({ ...forms, [user.username]: { ...forms[user.username], confirm: event.target.value } })}
                />
                <button
                  type="button"
                  aria-label="Lihat konfirmasi password"
                  onClick={() => setVisiblePasswords({ ...visiblePasswords, [`${user.username}-confirm`]: !visiblePasswords[`${user.username}-confirm`] })}
                >
                  {visiblePasswords[`${user.username}-confirm`] ? <EyeOff /> : <Eye />}
                </button>
              </span>
            </label>
            <button className="primary-button" onClick={() => savePassword(user.username)} disabled={saving}>Simpan password</button>
          </div>
        ))}
      </div>
      <div className="danger-zone">
        <div>
          <p className="eyebrow">Reset aplikasi</p>
          <h2>Reset keseluruhan data</h2>
          <small>Menghapus transaksi, history, dan mengembalikan produk ke data awal. Butuh password admin.</small>
        </div>
        <label>
          Password admin
          <span className="password-field">
            <input
              type={visiblePasswords.reset ? 'text' : 'password'}
              value={resetPassword}
              onChange={(event) => setResetPassword(event.target.value)}
              placeholder="Masukkan password admin"
            />
            <button type="button" aria-label="Lihat password reset" onClick={() => setVisiblePasswords({ ...visiblePasswords, reset: !visiblePasswords.reset })}>
              {visiblePasswords.reset ? <EyeOff /> : <Eye />}
            </button>
          </span>
        </label>
        <button className="danger-button" onClick={resetAllData} disabled={saving}>Reset semua data</button>
      </div>
    </section>
  );
}

function ReportsPro({ sales, products }) {
  const [period, setPeriod] = useState('daily');
  const filteredSales = useMemo(() => filterSalesByPeriod(sales, period), [sales, period]);
  const total = filteredSales.reduce((sum, sale) => sum + sale.total, 0);
  const totalItems = filteredSales.reduce((sum, sale) => sum + sale.items, 0);
  const average = filteredSales.length ? Math.round(total / filteredSales.length) : 0;
  const cashIn = filteredSales.reduce((sum, sale) => sum + (sale.cashReceived || sale.total), 0);
  const changeOut = filteredSales.reduce((sum, sale) => sum + (sale.change || 0), 0);
  const lowStock = products.filter(isLowStock);
  const { start, end } = getPeriodRange(period);
  const chartRows = useMemo(() => {
    const grouped = filteredSales.reduce((acc, sale) => {
      acc[sale.date] = (acc[sale.date] || 0) + sale.total;
      return acc;
    }, {});
    const rows = Object.entries(grouped).slice(-7);
    const max = Math.max(...rows.map(([, value]) => value), 1);
    return rows.map(([date, value]) => ({ date, value, width: `${Math.max(8, (value / max) * 100)}%` }));
  }, [filteredSales]);

  const exportCsv = () => {
    const rows = ['ID,Tanggal,Kasir,Item,Pembayaran,Uang Diterima,Kembalian,Total'];
    filteredSales.forEach((sale) =>
      rows.push(`${sale.id},${sale.date},${sale.cashier},${sale.items},${sale.payment},${sale.cashReceived || sale.total},${sale.change || 0},${sale.total}`)
    );
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `laporan-${period}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="reports-layout">
      <section className="office-section report-print-area">
        <div className="section-title report-actions">
          <div>
            <p className="eyebrow">Laporan {getPeriodLabel(period)}</p>
            <h2>Ringkasan penjualan</h2>
            <small>{start.toLocaleDateString('id-ID')} - {end.toLocaleDateString('id-ID')}</small>
          </div>
          <div className="button-row">
            <button className="secondary-button no-print" onClick={exportCsv}><Download /> CSV</button>
            <button className="primary-button no-print" onClick={() => window.print()}><Printer /> Print PDF</button>
          </div>
        </div>

        <div className="period-tabs no-print">
          {['daily', 'weekly', 'monthly', 'yearly'].map((item) => (
            <button className={period === item ? 'active' : ''} onClick={() => setPeriod(item)} key={item}>
              <CalendarDays />
              {getPeriodLabel(item)}
            </button>
          ))}
        </div>

        <div className="report-metrics">
          <Metric icon={<WalletCards />} label="Total omzet" value={currency.format(total)} hint={`${filteredSales.length} transaksi`} />
          <Metric icon={<ReceiptText />} label="Barang terjual" value={totalItems} hint="Akumulasi item" />
          <Metric icon={<BarChart3 />} label="Rata-rata nota" value={currency.format(average)} hint="Per transaksi" />
          <Metric icon={<WalletCards />} label="Uang masuk bersih" value={currency.format(cashIn - changeOut)} hint={`Kembalian ${currency.format(changeOut)}`} />
        </div>

        <div className="report-chart no-print">
          <div className="section-title">
            <h2>Grafik omzet</h2>
            <small>{chartRows.length ? 'Per tanggal transaksi' : 'Belum ada data'}</small>
          </div>
          <div className="bar-list">
            {chartRows.map((row) => (
              <div className="bar-row" key={row.date}>
                <span>{row.date.slice(5)}</span>
                <i><b style={{ width: row.width }} /></i>
                <strong>{currency.format(row.value)}</strong>
              </div>
            ))}
          </div>
        </div>

        <div className="sales-table">
          {filteredSales.length === 0 && <p className="empty">Belum ada transaksi pada periode ini.</p>}
          {filteredSales.map((sale) => (
            <div className="sales-row report-row" key={sale.id}>
              <span>
                <strong>{sale.id}</strong>
                <small>{sale.date} - {sale.cashier}</small>
              </span>
              <span>{sale.items} item</span>
              <span>{sale.payment}</span>
              <span>{currency.format(sale.cashReceived || sale.total)}</span>
              <span>{currency.format(sale.change || 0)}</span>
              <b>{currency.format(sale.total)}</b>
            </div>
          ))}
        </div>
      </section>

      <section className="office-section no-print">
        <div className="section-title">
          <h2>Stok menipis</h2>
          <small>{lowStock.length} produk</small>
        </div>
        <div className="inventory-list compact">
          {lowStock.length === 0 && <p className="empty">Semua stok masih aman.</p>}
          {lowStock.map((product) => (
            <div className="inventory-item" key={product.id}>
              <ProductArt product={product} />
              <span>
                <strong>{product.name}</strong>
                <small>Sisa stok {product.stock}</small>
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function Reports({ sales, products }) {
  const byPayment = useMemo(() => {
    return sales.reduce((acc, sale) => {
      acc[sale.payment] = (acc[sale.payment] || 0) + sale.total;
      return acc;
    }, {});
  }, [sales]);

  const exportCsv = () => {
    const rows = ['ID,Tanggal,Kasir,Item,Pembayaran,Total'];
    sales.forEach((sale) => rows.push(`${sale.id},${sale.date},${sale.cashier},${sale.items},${sale.payment},${sale.total}`));
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'laporan-pos.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="reports-layout">
      <section className="office-section">
        <div className="section-title">
          <h2>Ringkasan penjualan</h2>
          <button className="secondary-button" onClick={exportCsv}><Download /> CSV</button>
        </div>
        <div className="payment-summary">
          {Object.entries(byPayment).map(([name, total]) => (
            <div key={name}>
              <span>{name}</span>
              <strong>{currency.format(total)}</strong>
            </div>
          ))}
        </div>
        <div className="sales-table">
          {sales.map((sale) => (
            <div className="sales-row" key={sale.id}>
              <span>
                <strong>{sale.id}</strong>
                <small>{sale.date} • {sale.cashier}</small>
              </span>
              <span>{sale.items} item</span>
              <span>{sale.payment}</span>
              <b>{currency.format(sale.total)}</b>
            </div>
          ))}
        </div>
      </section>

      <section className="office-section">
        <h2>Barang yang perlu dicek</h2>
        <div className="inventory-list compact">
          {products
            .filter((product) => product.stock <= 15)
            .map((product) => (
              <div className="inventory-item" key={product.id}>
                <ProductArt product={product} />
                <span>
                  <strong>{product.name}</strong>
                  <small>Sisa stok {product.stock}</small>
                </span>
              </div>
            ))}
        </div>
      </section>
    </div>
  );
}

function DesignPicker({ themeId, setThemeId }) {
  return (
    <section className="office-section">
      <h2>Contoh desain & warna</h2>
      <div className="design-grid office-design">
        {themes.map((theme) => (
          <button
            className={`theme-card ${themeId === theme.id ? 'active' : ''}`}
            key={theme.id}
            onClick={() => setThemeId(theme.id)}
          >
            <span className="swatches">
              {theme.colors.map((color) => (
                <i key={color} style={{ background: color }} />
              ))}
            </span>
            <strong>{theme.name}</strong>
            <small>{theme.note}</small>
          </button>
        ))}
      </div>
    </section>
  );
}

createRoot(document.getElementById('root')).render(<App />);

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}

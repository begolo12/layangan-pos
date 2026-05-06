import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  BarChart3,
  Boxes,
  ChevronLeft,
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

const APP_VERSION = '2026.04.30-2';
const APP_UPDATE_NOTE = 'Backoffice dipercepat, laporan punya filter range/bulan/tahun, dan navigasi dibuat lebih user-friendly.';

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
  { id: 'S-1001', date: '2026-04-24', cashier: 'Kasir', total: 47000, items: 4, payment: 'Tunai', category: 'layangan' },
  { id: 'S-1002', date: '2026-04-25', cashier: 'Kasir', total: 72000, items: 6, payment: 'Tunai', category: 'benang' },
  { id: 'S-1003', date: '2026-04-26', cashier: 'Admin', total: 30000, items: 2, payment: 'Tunai', category: 'layangan' },
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

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);
}

function endOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
}

function endOfYear(date) {
  return new Date(date.getFullYear(), 11, 31, 23, 59, 59, 999);
}

function formatDateInputValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getMonthLabel(month) {
  return [
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember',
  ][month] || '';
}

function getReportYears(sales) {
  const currentYear = new Date().getFullYear();
  const years = new Set([currentYear]);

  sales.forEach((sale) => {
    const date = toDate(sale.date);
    if (!Number.isNaN(date.getTime())) years.add(date.getFullYear());
  });

  return [...years].sort((a, b) => b - a);
}

function getReportFilterLabel(filter) {
  if (filter.mode === 'range') {
    return `${filter.start || '-'} sampai ${filter.end || '-'}`;
  }

  if (filter.mode === 'month') {
    return `${getMonthLabel(Number(filter.month) - 1)} ${filter.year}`;
  }

  if (filter.mode === 'year') {
    return `${filter.year}`;
  }

  return 'Semua data';
}

function filterSalesByReportFilter(sales, filter) {
  if (filter.mode === 'range') {
    if (!filter.start || !filter.end) return sales;
    const start = startOfDay(toDate(filter.start));
    const end = new Date(`${filter.end}T00:00:00`);
    end.setHours(23, 59, 59, 999);
    return sales.filter((sale) => {
      const date = toDate(sale.date);
      return date >= start && date <= end;
    });
  }

  if (filter.mode === 'month') {
    if (!filter.month || !filter.year) return sales;
    const start = new Date(Number(filter.year), Number(filter.month) - 1, 1, 0, 0, 0, 0);
    const end = endOfMonth(start);
    return sales.filter((sale) => {
      const date = toDate(sale.date);
      return date >= start && date <= end;
    });
  }

  if (filter.mode === 'year') {
    if (!filter.year) return sales;
    const start = new Date(Number(filter.year), 0, 1, 0, 0, 0, 0);
    const end = endOfYear(start);
    return sales.filter((sale) => {
      const date = toDate(sale.date);
      return date >= start && date <= end;
    });
  }

  return sales;
}

function filterSalesByPeriod(sales, period) {
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
  return sales.filter((sale) => {
    const date = toDate(sale.date);
    return date >= start && date <= end;
  });
}

function isLowStock(product) {
  return Number(product.stock || 0) <= Number(product.minStock || 10);
}

function nowStamp() {
  return new Date().toLocaleString('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'medium',
  });
}

const defaultProductTypes = [
  { id: 'layang', name: 'Layang-layang', color: '#2563eb' },
  { id: 'benang', name: 'Benang', color: '#f59e0b' },
];

const saleCategories = [
  { id: 'layangan', name: 'Layangan' },
  { id: 'benang', name: 'Benang' },
];

function getSaleCategoryLabel(category) {
  return saleCategories.find((item) => item.id === category)?.name || 'Umum';
}

function normalizeText(value) {
  return String(value || '').toLowerCase().trim();
}

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

  useEffect(() => {
    const historyVersionKey = 'pos-history-app-version';
    try {
      const lastLoggedVersion = localStorage.getItem(historyVersionKey);
      if (lastLoggedVersion === APP_VERSION) return;

      setHistoryLog((current) => [
        {
          id: `H-${Date.now().toString().slice(-6)}`,
          time: nowStamp(),
          actor: 'Sistem',
          action: 'Aplikasi diperbarui',
          detail: APP_UPDATE_NOTE,
        },
        ...current,
      ]);
      localStorage.setItem(historyVersionKey, APP_VERSION);
    } catch {
      // Ignore localStorage errors so the app still loads.
    }
  }, [setHistoryLog]);

  // Make test function available in console
  useEffect(() => {
    window.testFirebaseConnection = testFirebaseConnection;
    console.log('Tip: Run testFirebaseConnection() in console to test Firebase connection');
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
          confirm={confirm}
        />
      )}
    </main>
  );
}

function Login({ setSession, addToast }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const login = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
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
          
          <label>
            Email
            <span className="input-with-icon">
              <UserRound />
              <input
                autoComplete="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="admin@admin.com atau kasir@kasir.com"
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
          
          <p className="login-hint">
            Gunakan akun Firebase: admin@admin.com atau kasir@kasir.com
          </p>
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

function PosScreen({ products, setProducts, sales, setSales, setSession, firebaseApi, addHistory, addToast, productTypes, confirm }) {
  const [activeTab, setActiveTab] = useState('kasir');
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('semua');
  const [saleCategory, setSaleCategory] = useState('layangan');
  const [cashReceived, setCashReceived] = useState('');
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  
  const [editingSale, setEditingSale] = useState(null);
  const [editForm, setEditForm] = useState({ category: '', total: '' });
  
  const localToday = new Date().toLocaleDateString('en-CA');
  const todaySales = sales.filter((sale) => sale.date === localToday);
  const todayRevenue = todaySales.reduce((sum, sale) => sum + sale.total, 0);

  const cashNumber = Number(cashReceived || 0);
  const canFinishPayment = cashNumber > 0;

  useEffect(() => {
    setCashReceived('');
  }, []);

  const setShortcut = (value) => {
    setCashReceived(String(value));
  };

  const checkout = async () => {
    if (!cashNumber) return;
    
    setCheckoutLoading(true);
    try {
      const sale = {
        id: `S-${Date.now().toString().slice(-6)}`,
        date: new Date().toLocaleDateString('en-CA'),
        time: new Date().toLocaleTimeString('id-ID', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        cashier: 'Kasir',
        total: cashNumber,
        items: 1,
        payment: 'Tunai',
        cashReceived: cashNumber,
        change: 0,
        category: saleCategory,
        memo: getSaleCategoryLabel(saleCategory),
      };
      
      setSales([sale, ...sales]);
      
      if (firebaseApi) {
        try {
          await firebaseApi.saveSale(sale);
          addToast('Transaksi berhasil disimpan', 'success');
        } catch (error) {
          addToast('Transaksi tersimpan lokal, gagal sinkronisasi Firebase', 'warning');
        }
      }
      
      setCashReceived('');
      addHistory?.('Transaksi baru', `${sale.id} dicatat sebagai ${getSaleCategoryLabel(saleCategory)} sebesar ${currency.format(cashNumber)}.`);
    } catch (error) {
      addToast('Gagal memproses transaksi', 'error');
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleEditClick = (sale) => {
    setEditingSale(sale);
    setEditForm({ category: sale.category, total: sale.total });
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    if (!editingSale) return;
    
    setCheckoutLoading(true);
    try {
      const updatedSale = {
        ...editingSale,
        category: editForm.category,
        total: Number(editForm.total),
        cashReceived: Number(editForm.total),
        memo: getSaleCategoryLabel(editForm.category),
      };
      
      setSales((current) => current.map((s) => (s.id === editingSale.id ? updatedSale : s)));
      
      if (firebaseApi) {
        try {
          await firebaseApi.saveSale(updatedSale);
          addToast('Riwayat diperbarui', 'success');
        } catch (error) {
          addToast('Lokal diperbarui, gagal sinkronisasi Firebase', 'warning');
        }
      }
      
      addHistory?.('Riwayat diedit', `${updatedSale.id} diperbarui menjadi ${currency.format(updatedSale.total)}.`);
      setEditingSale(null);
    } catch (error) {
      addToast('Gagal memperbarui riwayat', 'error');
    } finally {
      setCheckoutLoading(false);
    }
  };

  const deleteHistory = async () => {
    if (!editingSale) return;
    const ok = await confirm(`Yakin hapus transaksi ${editingSale.id}?`, 'Hapus Riwayat');
    if (!ok) return;
    
    setSales((current) => current.filter((s) => s.id !== editingSale.id));
    
    if (firebaseApi) {
      try {
        await firebaseApi.removeSale?.(editingSale.id);
        addToast('Riwayat dihapus', 'success');
      } catch (error) {
        addToast('Lokal dihapus, gagal sinkronisasi Firebase', 'warning');
      }
    }
    
    addHistory?.('Riwayat dihapus', `${editingSale.id} dihapus.`);
    setEditingSale(null);
  };

  return (
    <section className={`pos-layout mobile-view-${activeTab}`}>
      <header className="pos-header">
        <div>
          <p className="eyebrow">Mode kasir</p>
          <h1>Pemasukan Harian</h1>
        </div>
        <button className="icon-button" aria-label="Keluar" onClick={() => setSession(null)}>
          <LogOut />
        </button>
      </header>

      <div className="pos-content">
        <main className="pos-main report-panel" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="metric-grid" style={{ gridTemplateColumns: 'repeat(1, minmax(0, 1fr))', marginBottom: 0 }}>
            <Metric icon={<WalletCards />} label="Pendapatan Hari Ini" value={currency.format(todayRevenue)} hint={`${todaySales.length} transaksi`} />
          </div>
        </main>

        <main className="pos-main history-panel" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <section className="office-section" style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
            <div className="section-title" style={{ padding: '16px 16px 0' }}>
              <h2>History Inputan</h2>
            </div>
            <div className="sales-table compact-table" style={{ flex: 1, overflow: 'auto' }}>
              {todaySales.map((sale) => (
                <div className="sales-row" key={sale.id} onClick={() => handleEditClick(sale)} style={{ cursor: 'pointer' }} title="Klik untuk edit">
                  <span>
                    <strong>{sale.id}</strong>
                    <small>{sale.date}{sale.time ? ` | ${sale.time}` : ''} - {getSaleCategoryLabel(sale.category)}</small>
                  </span>
                  <span>{sale.payment}</span>
                  <b>{currency.format(sale.total)}</b>
                </div>
              ))}
              {todaySales.length === 0 && (
                <p className="empty" style={{ padding: '16px' }}>Belum ada inputan hari ini.</p>
              )}
            </div>
          </section>
        </main>
        <aside className="cart-panel">
          <div className="cart-title">
            <h2>Catat pemasukan</h2>
            <WalletCards />
          </div>
          <div className="cash-only-row">
            <WalletCards />
            <span>
              <strong>Pilih kategori lalu masukkan nominal</strong>
              <small>Kasir tinggal tap layangan atau benang, lalu isi uang masuk.</small>
            </span>
          </div>
          <div className="sale-type-tabs" role="tablist" aria-label="Kategori penjualan">
            {saleCategories.map((item) => (
              <button
                key={item.id}
                type="button"
                className={saleCategory === item.id ? 'active' : ''}
                onClick={() => setSaleCategory(item.id)}
              >
                {item.name}
              </button>
            ))}
          </div>
          <label className="cash-input">
            Nominal transaksi
            <input
              autoFocus
              inputMode="numeric"
              type="number"
              value={cashReceived}
              onChange={(event) => setCashReceived(event.target.value)}
              placeholder="10000"
            />
          </label>
          <div className="cash-shortcuts">
            <button type="button" onClick={() => setShortcut(10000)}>10rb</button>
            <button type="button" onClick={() => setShortcut(20000)}>20rb</button>
            <button type="button" onClick={() => setShortcut(50000)}>50rb</button>
            <button type="button" onClick={() => setShortcut(100000)}>100rb</button>
          </div>
          <div className="total-box">
            <span>{getSaleCategoryLabel(saleCategory)}</span>
            <strong>{currency.format(cashNumber || 0)}</strong>
          </div>
          <button className="checkout-button" onClick={checkout} disabled={!canFinishPayment || checkoutLoading}>
            <ReceiptText />
            {checkoutLoading ? 'Memproses...' : 'Simpan pemasukan'}
          </button>
        </aside>
      </div>

      <nav className="pos-mobile-nav">
        <button className={activeTab === 'kasir' ? 'active' : ''} onClick={() => setActiveTab('kasir')}>
          <WalletCards size={18} style={{ margin: '0 auto 4px', display: 'block' }} /> Kasir
        </button>
        <button className={activeTab === 'history' ? 'active' : ''} onClick={() => setActiveTab('history')}>
          <History size={18} style={{ margin: '0 auto 4px', display: 'block' }} /> Riwayat
        </button>
        <button className={activeTab === 'laporan' ? 'active' : ''} onClick={() => setActiveTab('laporan')}>
          <BarChart3 size={18} style={{ margin: '0 auto 4px', display: 'block' }} /> Laporan
        </button>
      </nav>

      {editingSale && (
        <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && setEditingSale(null)}>
          <div className="payment-modal">
            <div className="section-title">
              <h2>Edit {editingSale.id}</h2>
            </div>
            <form className="form-grid" onSubmit={saveEdit} style={{ display: 'grid', gap: '12px' }}>
              <label className="cash-input">
                Kategori
                <select value={editForm.category} onChange={(e) => setEditForm({ ...editForm, category: e.target.value })} style={{ padding: '12px', borderRadius: '12px', border: '1px solid var(--line)' }}>
                  {saleCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </label>
              <label className="cash-input">
                Total Nominal
                <input type="number" value={editForm.total} onChange={(e) => setEditForm({ ...editForm, total: e.target.value })} autoFocus />
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '10px' }}>
                <button type="button" className="secondary-button" style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }} onClick={deleteHistory}>
                  Hapus
                </button>
                <button type="submit" className="primary-button" disabled={checkoutLoading}>
                  Simpan
                </button>
              </div>
            </form>
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
  const viewMeta = {
    dashboard: 'Ringkasan cepat omzet, stok, dan transaksi terbaru.',
    products: 'Kelola produk dengan formulir yang lebih mudah dipindai.',
    reports: 'Filter penjualan berdasarkan rentang, bulan, atau tahun.',
    transactions: 'Cari dan atur transaksi lebih cepat.',
    history: 'Lihat aktivitas perubahan sistem.',
    settings: 'Atur akun, tema, dan data aplikasi.',
  };
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
            <small>{viewMeta[view]}</small>
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
            <div className="quick-actions">
              <button className="quick-action-card" onClick={() => setView('products')}>
                <Boxes />
                <span>
                  <strong>Kelola Produk</strong>
                  <small>Tambah, edit, dan cek stok yang menipis.</small>
                </span>
              </button>
              <button className="quick-action-card" onClick={() => setView('reports')}>
                <BarChart3 />
                <span>
                  <strong>Buka Laporan</strong>
                  <small>Filter transaksi berdasarkan tanggal, bulan, atau tahun.</small>
                </span>
              </button>
              <button className="quick-action-card" onClick={() => setView('transactions')}>
                <ClipboardList />
                <span>
                  <strong>Transaksi</strong>
                  <small>Cari nota lalu edit tanpa pindah banyak layar.</small>
                </span>
              </button>
              <button className="quick-action-card" onClick={() => setView('settings')}>
                <Settings />
                <span>
                  <strong>Pengaturan</strong>
                  <small>Atur akun, tipe barang, dan reset data.</small>
                </span>
              </button>
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
                      <small>{product.type} - {currency.format(product.price)}</small>
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
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState('stock-low');

  const filteredProducts = useMemo(() => {
    const normalizedQuery = normalizeText(query);
    const base = products.filter((product) => {
      if (!normalizedQuery) return true;
      return [product.name, product.type, product.desc].some((field) => normalizeText(field).includes(normalizedQuery));
    });

    return [...base].sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name, 'id');
      if (sortBy === 'price') return Number(a.price || 0) - Number(b.price || 0);
      if (sortBy === 'stock-high') return Number(b.stock || 0) - Number(a.stock || 0);
      return Number(a.stock || 0) - Number(b.stock || 0);
    });
  }, [products, query, sortBy]);

  const lowStockCount = useMemo(() => products.filter(isLowStock).length, [products]);

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
      <form className="product-form product-form-sticky" onSubmit={submit}>
        <div className="section-title">
          <div>
            <p className="eyebrow">{editingId ? 'Edit produk' : 'Produk baru'}</p>
            <h2>{editingId ? 'Ubah data barang' : 'Tambah barang'}</h2>
            <small>Form di kiri, daftar di kanan. Alur ini lebih cepat untuk input dan cek stok.</small>
          </div>
          {editingId && <button className="secondary-button" type="button" onClick={cancelEdit}>Batal</button>}
        </div>
        <div className="compact-summary">
          <span><strong>{products.length}</strong><small>Produk</small></span>
          <span><strong>{lowStockCount}</strong><small>Perlu restock</small></span>
          <span><strong>{productTypes.length}</strong><small>Tipe</small></span>
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
            <small>Cari, urutkan, lalu edit data tanpa berpindah layar terlalu jauh.</small>
          </div>
          <small>{filteredProducts.length} ditampilkan</small>
        </div>
        <div className="search-row toolbar-row">
          <Search size={18} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari nama, tipe, atau catatan..." />
          <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
            <option value="stock-low">Stok terendah</option>
            <option value="stock-high">Stok tertinggi</option>
            <option value="name">Nama A-Z</option>
            <option value="price">Harga termurah</option>
          </select>
        </div>
        <div className="product-stock-list">
          {filteredProducts.length === 0 && <p className="empty">Tidak ada produk yang cocok dengan pencarian ini.</p>}
          {filteredProducts.map((product) => (
            <div className={`stock-card ${isLowStock(product) ? 'low-stock' : ''}`} key={product.id}>
              <ProductArt product={product} large />
              <span>
                <strong>{product.name}</strong>
                <small>{product.type} - {currency.format(product.price)} - stok {product.stock}</small>
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
  const emptyForm = { id: '', date: '', cashier: '', category: 'layangan', items: '', total: '', cashReceived: '', change: '' };
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState('');

  const filteredSales = useMemo(() => {
    const normalizedQuery = normalizeText(query);
    return sales.filter((sale) => {
      if (!normalizedQuery) return true;
      return [
        sale.id,
        sale.date,
        sale.cashier,
        sale.memo,
        getSaleCategoryLabel(sale.category),
        sale.payment,
      ].some((field) => normalizeText(field).includes(normalizedQuery));
    });
  }, [sales, query]);

  const editSale = (sale) => {
    setForm({
      id: sale.id,
      date: sale.date,
      cashier: sale.cashier,
      category: sale.category || 'layangan',
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
        category: form.category || 'layangan',
        items: Number(form.items || 0),
        total: Number(form.total || 0),
        payment: 'Tunai',
        cashReceived: Number(form.cashReceived || form.total || 0),
        change: Number(form.change || 0),
        memo: getSaleCategoryLabel(form.category || 'layangan'),
      };
      
      setSales((current) => current.map((sale) => (sale.id === form.id ? updatedSale : sale)));
      
      try {
        await firebaseApi?.saveSale(updatedSale);
        addToast('Transaksi berhasil diperbarui', 'success');
      } catch (error) {
        addToast('Transaksi diperbarui lokal, gagal sinkronisasi Firebase', 'warning');
      }
      
      addHistory?.('Transaksi diedit', `${updatedSale.id} diperbarui sebagai ${getSaleCategoryLabel(updatedSale.category)} sebesar ${currency.format(updatedSale.total)}.`);
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
            <small>{form.id ? 'Ubah detail transaksi tanpa keluar dari halaman ini.' : 'Klik salah satu nota di daftar untuk mulai edit.'}</small>
          </div>
          {form.id && <button className="secondary-button" onClick={() => setForm(emptyForm)}>Batal</button>}
        </div>
        {!form.id && (
          <div className="empty empty-note">
            <strong>Belum ada transaksi dipilih.</strong>
            <p>Pilih nota di daftar kanan supaya form ini terisi otomatis.</p>
          </div>
        )}
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
            Kategori
            <select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} disabled={!form.id}>
              {saleCategories.map((item) => (
                <option key={item.id} value={item.id}>{item.name}</option>
              ))}
            </select>
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
            <small>Gunakan pencarian untuk menemukan nota dengan cepat.</small>
          </div>
          <small>{filteredSales.length} ditampilkan</small>
        </div>
        <div className="search-row toolbar-row">
          <Search size={18} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari ID, kasir, kategori, atau tanggal..." />
        </div>
        <div className="sales-table">
          {filteredSales.length === 0 && <p className="empty">Tidak ada transaksi yang cocok.</p>}
          {filteredSales.map((sale) => (
            <div className="sales-row transaction-row" key={sale.id}>
              <span>
                <strong>{sale.id}</strong>
                <small>{sale.date}{sale.time ? ` | ${sale.time}` : ''} - {sale.cashier} - {getSaleCategoryLabel(sale.category)}</small>
              </span>
              <span>{sale.memo || getSaleCategoryLabel(sale.category)}</span>
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
  const availableYears = useMemo(() => getReportYears(sales), [sales]);
  const currentDate = new Date();
  const [filterMode, setFilterMode] = useState('range');
  const [rangeStart, setRangeStart] = useState(() => formatDateInputValue(startOfMonth(currentDate)));
  const [rangeEnd, setRangeEnd] = useState(() => formatDateInputValue(currentDate));
  const [selectedMonth, setSelectedMonth] = useState(String(currentDate.getMonth() + 1).padStart(2, '0'));
  const [selectedYear, setSelectedYear] = useState(String(currentDate.getFullYear()));

  useEffect(() => {
    if (filterMode === 'range' && rangeStart && rangeEnd && rangeStart > rangeEnd) {
      setRangeEnd(rangeStart);
    }
  }, [filterMode, rangeStart, rangeEnd]);

  const activeFilter = useMemo(() => ({
    mode: filterMode,
    start: rangeStart,
    end: rangeEnd,
    month: selectedMonth,
    year: selectedYear,
  }), [filterMode, rangeStart, rangeEnd, selectedMonth, selectedYear]);

  const filteredSales = useMemo(() => filterSalesByReportFilter(sales, activeFilter), [sales, activeFilter]);
  const total = filteredSales.reduce((sum, sale) => sum + sale.total, 0);
  const cashIn = filteredSales.reduce((sum, sale) => sum + (sale.cashReceived || sale.total), 0);
  const changeOut = filteredSales.reduce((sum, sale) => sum + (sale.change || 0), 0);
  const netCash = cashIn - changeOut;
  const filterLabel = getReportFilterLabel(activeFilter);
  const chartRows = useMemo(() => {
    const grouped = filteredSales.reduce((acc, sale) => {
      acc[sale.date] = (acc[sale.date] || 0) + sale.total;
      return acc;
    }, {});
    const rows = Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b)).slice(-7);
    const max = Math.max(...rows.map(([, value]) => value), 1);
    return rows.map(([date, value]) => ({ date, value, width: `${Math.max(8, (value / max) * 100)}%` }));
  }, [filteredSales]);

  const exportCsv = () => {
    const rows = ['ID,Tanggal,Kasir,Kategori,Pembayaran,Nominal Masuk,Kembalian,Netto Kas'];
    filteredSales.forEach((sale) =>
      rows.push(`${sale.id},${sale.date},${sale.cashier},${getSaleCategoryLabel(sale.category)},${sale.payment},${sale.cashReceived || sale.total},${sale.change || 0},${(sale.cashReceived || sale.total) - (sale.change || 0)}`)
    );
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `laporan-${filterMode}-${filterLabel.replace(/\s+/g, '-').toLowerCase()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const resetFilter = () => {
    setFilterMode('range');
    setRangeStart(formatDateInputValue(startOfMonth(currentDate)));
    setRangeEnd(formatDateInputValue(currentDate));
    setSelectedMonth(String(currentDate.getMonth() + 1).padStart(2, '0'));
    setSelectedYear(String(currentDate.getFullYear()));
  };

  return (
    <div className="reports-layout">
      <section className="office-section report-print-area">
        <div className="report-header">
          <div className="section-title report-actions">
            <div>
              <p className="eyebrow">Jurnal penjualan</p>
              <h2>Data penjualan yang lebih mudah dibaca</h2>
              <small>{filterLabel}</small>
            </div>
            <div className="button-row">
              <button className="secondary-button no-print" onClick={exportCsv}><Download /> CSV</button>
              <button className="primary-button no-print" onClick={() => window.print()}><Printer /> Print PDF</button>
            </div>
          </div>
          <div className="report-subtitle">
            <span>{filteredSales.length} transaksi tampil</span>
            <span>Filter aktif: {filterMode === 'range' ? 'Rentang tanggal' : filterMode === 'month' ? 'Bulan' : filterMode === 'year' ? 'Tahun' : 'Semua data'}</span>
          </div>
        </div>

        <div className="report-filter-card no-print">
          <div className="filter-mode-tabs">
            <button className={filterMode === 'range' ? 'active' : ''} onClick={() => setFilterMode('range')}>Rentang</button>
            <button className={filterMode === 'month' ? 'active' : ''} onClick={() => setFilterMode('month')}>Bulan</button>
            <button className={filterMode === 'year' ? 'active' : ''} onClick={() => setFilterMode('year')}>Tahun</button>
            <button className={filterMode === 'all' ? 'active' : ''} onClick={() => setFilterMode('all')}>Semua</button>
          </div>

          {filterMode === 'range' && (
            <div className="filter-grid">
              <label>
                Tanggal awal
                <input type="date" value={rangeStart} onChange={(event) => setRangeStart(event.target.value)} />
              </label>
              <label>
                Tanggal akhir
                <input type="date" value={rangeEnd} onChange={(event) => setRangeEnd(event.target.value)} min={rangeStart} />
              </label>
            </div>
          )}

          {filterMode === 'month' && (
            <div className="filter-grid filter-grid-month">
              <label>
                Bulan
                <select value={selectedMonth} onChange={(event) => setSelectedMonth(event.target.value)}>
                  {Array.from({ length: 12 }, (_, index) => {
                    const monthValue = String(index + 1).padStart(2, '0');
                    return (
                      <option value={monthValue} key={monthValue}>
                        {getMonthLabel(index)}
                      </option>
                    );
                  })}
                </select>
              </label>
              <label>
                Tahun
                <select value={selectedYear} onChange={(event) => setSelectedYear(event.target.value)}>
                  {availableYears.map((year) => (
                    <option value={String(year)} key={year}>{year}</option>
                  ))}
                </select>
              </label>
            </div>
          )}

          {filterMode === 'year' && (
            <div className="filter-grid filter-grid-year">
              <label>
                Tahun
                <select value={selectedYear} onChange={(event) => setSelectedYear(event.target.value)}>
                  {availableYears.map((year) => (
                    <option value={String(year)} key={year}>{year}</option>
                  ))}
                </select>
              </label>
            </div>
          )}

          <div className="filter-footer">
            <small>Gunakan rentang tanggal untuk melihat periode spesifik. Bulan dan tahun cocok untuk rekap lebih cepat.</small>
            <button className="secondary-button" onClick={resetFilter}>Reset filter</button>
          </div>
        </div>

        <div className="report-metrics">
          <Metric icon={<WalletCards />} label="Total pemasukan" value={currency.format(total)} hint={`${filteredSales.length} catatan`} />
          <Metric icon={<ReceiptText />} label="Nominal tercatat" value={currency.format(cashIn)} hint="Disimpan ke buku kas" />
          <Metric icon={<BarChart3 />} label="Total koreksi" value={currency.format(changeOut)} hint="Biasanya 0" />
          <Metric icon={<WalletCards />} label="Netto kas" value={currency.format(netCash)} hint="Masuk ke saldo" />
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
          {filteredSales.length === 0 && <p className="empty">Belum ada transaksi pada filter ini.</p>}
          {filteredSales.map((sale) => (
            <div className="sales-row report-row" key={sale.id}>
              <span>
                <strong>{sale.id}</strong>
                <small>{sale.date} - {sale.cashier} - {getSaleCategoryLabel(sale.category)}</small>
              </span>
              <span>{sale.memo || getSaleCategoryLabel(sale.category)}</span>
              <span>{sale.payment}</span>
              <span>{currency.format(sale.cashReceived || sale.total)}</span>
              <span>{currency.format(sale.change || 0)}</span>
              <b>{currency.format((sale.cashReceived || sale.total) - (sale.change || 0))}</b>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function Reports({ sales }) {
  const byPayment = useMemo(() => {
    return sales.reduce((acc, sale) => {
      acc[sale.payment] = (acc[sale.payment] || 0) + sale.total;
      return acc;
    }, {});
  }, [sales]);

  const exportCsv = () => {
    const rows = ['ID,Tanggal,Kasir,Kategori,Pembayaran,Nominal Masuk,Kembalian,Netto Kas'];
    sales.forEach((sale) =>
      rows.push(`${sale.id},${sale.date},${sale.cashier},${getSaleCategoryLabel(sale.category)},${sale.payment},${sale.cashReceived || sale.total},${sale.change || 0},${sale.total - (sale.change || 0)}`)
    );
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
          <h2>Jurnal pemasukan</h2>
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
                <small>{sale.date} - {sale.cashier} - {getSaleCategoryLabel(sale.category)}</small>
              </span>
              <span>{sale.memo || getSaleCategoryLabel(sale.category)}</span>
              <span>{sale.payment}</span>
              <span>{currency.format(sale.cashReceived || sale.total)}</span>
              <span>{currency.format(sale.change || 0)}</span>
              <b>{currency.format(sale.total - (sale.change || 0))}</b>
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

import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  BarChart3,
  Boxes,
  ChevronLeft,
  CreditCard,
  Download,
  ImagePlus,
  KeyRound,
  LayoutDashboard,
  LockKeyhole,
  LogOut,
  Minus,
  PackagePlus,
  Palette,
  Plus,
  ReceiptText,
  Search,
  ShoppingCart,
  Sparkles,
  Trash2,
  UserRound,
  WalletCards,
} from 'lucide-react';
import './styles.css';

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
    image: '',
    color: '#7c3aed',
    desc: 'Aman untuk pemula',
  },
];

const demoSales = [
  { id: 'S-1001', date: '2026-04-24', cashier: 'Kasir', total: 47000, items: 4, payment: 'Tunai' },
  { id: 'S-1002', date: '2026-04-25', cashier: 'Kasir', total: 72000, items: 6, payment: 'QRIS' },
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
  const [themeId, setThemeId] = useLocalState('pos-theme', 'senja');
  const [syncStatus, setSyncStatus] = useState('Menghubungkan Firebase...');
  const [firebaseApi, setFirebaseApi] = useState(null);
  const theme = themes.find((item) => item.id === themeId) || themes[0];

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
        unsubProducts = api.subscribeProducts((items) => {
          if (items.length) setProducts(items);
        }, () => setSyncStatus('Mode lokal: produk belum tersambung'));
        unsubSales = api.subscribeSales((items) => {
          if (items.length) setSales(items);
        }, () => setSyncStatus('Mode lokal: laporan belum tersambung'));
        unsubSettings = api.subscribeSettings((settings) => {
          if (settings.themeId) setThemeId(settings.themeId);
        }, () => {});
      })
      .catch((error) => {
        const code = error?.code || error?.message || 'Firebase belum bisa diakses';
        setSyncStatus(`Mode lokal: ${code}`);
      });

    return () => {
      unsubProducts();
      unsubSales();
      unsubSettings();
    };
  }, []);

  const changeTheme = (nextThemeId) => {
    setThemeId(nextThemeId);
    firebaseApi?.saveTheme(nextThemeId).catch(() => setSyncStatus('Tema tersimpan lokal, Firebase belum bisa diakses'));
  };

  return (
    <main className={`app theme-${theme.id}`}>
      {!session ? (
        <Login themeId={themeId} setThemeId={changeTheme} setSession={setSession} syncStatus={syncStatus} />
      ) : session.role === 'admin' ? (
        <BackOffice
          products={products}
          setProducts={setProducts}
          sales={sales}
          setSession={setSession}
          themeId={themeId}
          setThemeId={changeTheme}
          syncStatus={syncStatus}
          firebaseApi={firebaseApi}
        />
      ) : (
        <PosScreen
          products={products}
          setProducts={setProducts}
          sales={sales}
          setSales={setSales}
          setSession={setSession}
          syncStatus={syncStatus}
          firebaseApi={firebaseApi}
        />
      )}
    </main>
  );
}

function Login({ themeId, setThemeId, setSession, syncStatus }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const fillDemo = (user) => {
    setUsername(user.username);
    setPassword(user.password);
    setError('');
  };

  const login = (event) => {
    event.preventDefault();
    const user = users.find(
      (item) =>
        item.username.toLowerCase() === username.trim().toLowerCase() &&
        item.password === password
    );

    if (!user) {
      setError('Username atau password belum cocok.');
      return;
    }

    setSession({ role: user.role, name: user.name });
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
          Kasir simpel untuk jualan layang-layang dan benang, plus backoffice web untuk stok,
          laporan, dan pilihan desain.
        </p>

        <div className="design-grid">
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
      </div>

      <div className="login-panel">
        <form className="login-form" onSubmit={login}>
          <p className="eyebrow">Masuk aplikasi</p>
          <h2>Login toko</h2>
          <label>
            Username
            <span className="input-with-icon">
              <UserRound />
              <input
                autoComplete="username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="admin atau kasir"
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
              />
            </span>
          </label>
          {error && <p className="login-error">{error}</p>}
          <button className="login-submit" type="submit">
            <KeyRound />
            Masuk
          </button>
        </form>

        <div className="demo-login-list">
          {users.map((user) => {
            const Icon = user.icon;
            return (
              <button className="role-button" key={user.username} onClick={() => fillDemo(user)}>
                <Icon />
                <span>
                  <strong>{user.title}</strong>
                  <small>{user.note}</small>
                  <em>{user.username} / {user.password}</em>
                </span>
              </button>
            );
          })}
        </div>
        <p className="login-hint">Klik contoh akun untuk mengisi form, lalu tekan Masuk.</p>
        <p className="sync-pill">{syncStatus}</p>
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

function PosScreen({ products, setProducts, sales, setSales, setSession, syncStatus, firebaseApi }) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('semua');
  const [cart, setCart] = useState({});
  const [payment, setPayment] = useState('Tunai');

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
    if (product.stock <= (cart[product.id] || 0)) return;
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

  const checkout = async () => {
    if (!cartItems.length) return;
    const sale = {
      id: `S-${Date.now().toString().slice(-6)}`,
      date: new Date().toISOString().slice(0, 10),
      cashier: 'Kasir',
      total,
      items: cartItems.reduce((sum, item) => sum + item.qty, 0),
      payment,
    };
    setSales([sale, ...sales]);
    const nextProducts = products.map((product) => ({
        ...product,
        stock: product.stock - (cart[product.id] || 0),
      }));
    setProducts(nextProducts);
    if (firebaseApi) {
      await Promise.all([
        firebaseApi.saveSale(sale),
        ...cartItems.map((item) => firebaseApi.updateProductStock(item.id, item.stock - item.qty)),
      ]).catch(() => {});
    }
    setCart({});
  };

  return (
    <section className="pos-layout">
      <header className="pos-header">
        <div>
          <p className="eyebrow">Mode kasir</p>
          <h1>POS Layang Layar</h1>
          <small className="sync-text">{syncStatus}</small>
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
        {['semua', 'layang', 'benang'].map((item) => (
          <button className={filter === item ? 'active' : ''} onClick={() => setFilter(item)} key={item}>
            {item}
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
          <div className="payment-row">
            {['Tunai', 'QRIS'].map((item) => (
              <button className={payment === item ? 'active' : ''} onClick={() => setPayment(item)} key={item}>
                {item === 'Tunai' ? <WalletCards /> : <CreditCard />}
                {item}
              </button>
            ))}
          </div>
          <div className="total-box">
            <span>Total</span>
            <strong>{currency.format(total)}</strong>
          </div>
          <button className="checkout-button" onClick={checkout} disabled={!cartItems.length}>
            <ReceiptText />
            Bayar
          </button>
        </aside>
      </div>
    </section>
  );
}

function BackOffice({ products, setProducts, sales, setSession, themeId, setThemeId, syncStatus, firebaseApi }) {
  const [view, setView] = useState('dashboard');
  const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);
  const lowStock = products.filter((product) => product.stock <= 10);
  const totalStock = products.reduce((sum, product) => sum + product.stock, 0);

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
          <button className={view === 'design' ? 'active' : ''} onClick={() => setView('design')}>
            <Palette /> Desain
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
            <h1>{view === 'dashboard' ? 'Dashboard' : view === 'products' ? 'Produk & Stok' : view === 'reports' ? 'Laporan' : 'Pilihan Desain'}</h1>
            <small className="sync-text">{syncStatus}</small>
          </div>
          <div className="user-chip">
            <UserRound size={18} /> Admin
          </div>
        </header>

        {view === 'dashboard' && (
          <>
            <div className="metric-grid">
              <Metric icon={<WalletCards />} label="Omzet demo" value={currency.format(totalRevenue)} />
              <Metric icon={<Boxes />} label="Total stok" value={totalStock} />
              <Metric icon={<ReceiptText />} label="Transaksi" value={sales.length} />
              <Metric icon={<PackagePlus />} label="Stok menipis" value={lowStock.length} />
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

        {view === 'products' && <ProductManager products={products} setProducts={setProducts} firebaseApi={firebaseApi} />}
        {view === 'reports' && <Reports sales={sales} products={products} />}
        {view === 'design' && <DesignPicker themeId={themeId} setThemeId={setThemeId} />}
      </main>
    </section>
  );
}

function Metric({ icon, label, value }) {
  return (
    <div className="metric-card">
      <span>{icon}</span>
      <small>{label}</small>
      <strong>{value}</strong>
    </div>
  );
}

function ProductManager({ products, setProducts, firebaseApi }) {
  const emptyForm = { name: '', type: 'layang', price: '', stock: '', desc: '', image: '', color: '#0f766e' };
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    if (!form.name || !form.price) return;
    setSaving(true);
    const product = {
        ...form,
        id: `${form.type}-${Date.now()}`,
        price: Number(form.price),
        stock: Number(form.stock || 0),
      };
    setProducts([product, ...products]);
    await firebaseApi?.saveProduct(product).catch(() => {});
    setForm(emptyForm);
    setSaving(false);
  };

  const uploadImage = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setSaving(true);
    try {
      const imageUrl = firebaseApi ? await firebaseApi.uploadProductImage(file) : '';
      if (!imageUrl) throw new Error('Firebase Storage belum siap');
      setForm((current) => ({ ...current, image: imageUrl }));
    } catch {
      const reader = new FileReader();
      reader.onload = () => setForm((current) => ({ ...current, image: reader.result }));
      reader.readAsDataURL(file);
    } finally {
      setSaving(false);
    }
  };

  const deleteProduct = (id) => {
    setProducts(products.filter((product) => product.id !== id));
    firebaseApi?.removeProduct(id).catch(() => {});
  };

  return (
    <div className="product-manager">
      <form className="product-form" onSubmit={submit}>
        <h2>Tambah barang</h2>
        <div className="form-grid">
          <label>
            Nama barang
            <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Contoh: Layang Adu Merah" />
          </label>
          <label>
            Tipe
            <select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })}>
              <option value="layang">Layang-layang</option>
              <option value="benang">Benang</option>
            </select>
          </label>
          <label>
            Harga
            <input type="number" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} placeholder="12000" />
          </label>
          <label>
            Stok
            <input type="number" value={form.stock} onChange={(event) => setForm({ ...form, stock: event.target.value })} placeholder="20" />
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
        <label className="upload-box">
          <ImagePlus />
          <span>{form.image ? 'Gambar sudah dipilih' : saving ? 'Mengunggah...' : 'Upload gambar produk'}</span>
          <input type="file" accept="image/*" onChange={uploadImage} />
        </label>
        {form.image && <img className="preview-image" src={form.image} alt="Preview produk" />}
        <button className="primary-button" type="submit" disabled={saving}>
          <Plus /> Simpan barang
        </button>
      </form>

      <section className="office-section">
        <h2>Daftar barang</h2>
        <div className="inventory-list">
          {products.map((product) => (
            <div className="inventory-item" key={product.id}>
              <ProductArt product={product} />
              <span>
                <strong>{product.name}</strong>
                <small>{product.type} • {currency.format(product.price)} • stok {product.stock}</small>
              </span>
              <button className="icon-button danger" aria-label="Hapus produk" onClick={() => deleteProduct(product.id)}>
                <Trash2 />
              </button>
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

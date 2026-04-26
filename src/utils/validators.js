export const validators = {
  productName: (name) => {
    if (!name || name.trim().length < 2) {
      return 'Nama produk minimal 2 karakter';
    }
    if (name.length > 100) {
      return 'Nama produk maksimal 100 karakter';
    }
    return null;
  },

  price: (price) => {
    const num = Number(price);
    if (!price || isNaN(num)) {
      return 'Harga harus berupa angka';
    }
    if (num <= 0) {
      return 'Harga harus lebih dari 0';
    }
    if (num > 999999999) {
      return 'Harga terlalu besar';
    }
    return null;
  },

  stock: (stock) => {
    const num = Number(stock);
    if (isNaN(num)) {
      return 'Stok harus berupa angka';
    }
    if (num < 0) {
      return 'Stok tidak boleh negatif';
    }
    if (num > 999999) {
      return 'Stok terlalu besar';
    }
    return null;
  },

  minStock: (minStock) => {
    const num = Number(minStock);
    if (isNaN(num)) {
      return 'Minimal stok harus berupa angka';
    }
    if (num < 0) {
      return 'Minimal stok tidak boleh negatif';
    }
    if (num > 999999) {
      return 'Minimal stok terlalu besar';
    }
    return null;
  },

  email: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return 'Email tidak valid';
    }
    return null;
  },

  password: (password) => {
    if (!password || password.length < 6) {
      return 'Password minimal 6 karakter';
    }
    if (password.length > 100) {
      return 'Password maksimal 100 karakter';
    }
    return null;
  },

  username: (username) => {
    if (!username || username.length < 3) {
      return 'Username minimal 3 karakter';
    }
    if (username.length > 50) {
      return 'Username maksimal 50 karakter';
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      return 'Username hanya boleh huruf, angka, underscore, dan dash';
    }
    return null;
  },
};

export const sanitize = {
  text: (text) => {
    if (!text) return '';
    return text.trim().replace(/[<>]/g, '');
  },

  number: (num) => {
    const n = Number(num);
    return isNaN(n) ? 0 : Math.max(0, n);
  },

  positiveNumber: (num) => {
    const n = Number(num);
    return isNaN(n) || n <= 0 ? 0 : n;
  },
};

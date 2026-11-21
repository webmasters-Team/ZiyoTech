import React, { useEffect, useState } from 'react';

const API_BASE_URL = (import.meta.env.VITE_ASSISTANT_API_BASE_URL || (import.meta.env.DEV ? 'http://localhost:4000' : '')).replace(/\/+$/, '');
const adminRequest = (url: string, init: RequestInit = {}) => {
  const csrfCookie = document.cookie.split('; ').find((part) => /(?:^|__Host-)ziyo_(?:admin_)?csrf=/.test(part));
  const csrfToken = decodeURIComponent(csrfCookie?.slice(csrfCookie.indexOf('=') + 1) || '');
  const headers = new Headers(init.headers);
  if (init.body) headers.set('Content-Type', 'application/json');
  if (csrfToken) headers.set('X-CSRF-Token', csrfToken);
  return fetch(url, { ...init, headers, credentials: 'include' }).then((response) => {
    if (response.status === 401) window.dispatchEvent(new Event('ziyotech-admin-session-expired'));
    return response;
  });
};

interface SalesAiAdminProps {
  businessId?: string;
}

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  currency: string;
  stock: number;
  description: string;
}

const emptyProduct = {
  name: '',
  category: 'smartphone',
  price: 0,
  currency: 'UZS',
  stock: 0,
  description: '',
};

export default function SalesAiAdmin({ businessId = 'demo-business' }: SalesAiAdminProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState(emptyProduct);
  const [loading, setLoading] = useState(false);

  const loadProducts = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/catalog?businessId=${encodeURIComponent(businessId)}`);
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      console.error('Failed to load products', error);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [businessId]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);

    try {
      const res = await adminRequest(`${API_BASE_URL}/api/products`, {
        method: 'POST',
        body: JSON.stringify({
          businessId,
          ...form,
        }),
      });

      if (res.ok) {
        setForm(emptyProduct);
        await loadProducts();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId: string) => {
    try {
      await adminRequest(`${API_BASE_URL}/api/products/${productId}`, { method: 'DELETE' });
      await loadProducts();
    } catch (error) {
      console.error('Failed to delete product', error);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#071522', color: '#e4ecf9', padding: 32 }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <h1 style={{ fontSize: 40, marginBottom: 16 }}>Sales AI Admin</h1>
        <p style={{ color: '#94a8c7', marginBottom: 32 }}>Manage product catalog, stock, pricing and customer offers for {businessId}.</p>

        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 28 }}>
          <form onSubmit={handleSubmit} style={{ background: '#0b1b2b', border: '1px solid #1b3055', borderRadius: 18, padding: 24 }}>
            <h2 style={{ marginTop: 0, marginBottom: 20 }}>Add product</h2>

            <div style={{ display: 'grid', gap: 16 }}>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Product name" style={inputStyle} />
              <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Category" style={inputStyle} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} placeholder="Price" style={inputStyle} />
                <input value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} placeholder="Currency" style={inputStyle} />
              </div>
              <input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} placeholder="Stock" style={inputStyle} />
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" rows={4} style={{ ...inputStyle, resize: 'vertical' }} />
              <button type="submit" disabled={loading} style={{ background: 'linear-gradient(90deg, #2563eb, #06b6d4)', border: 'none', borderRadius: 12, color: 'white', padding: '12px 18px', fontWeight: 700, cursor: 'pointer' }}>
                {loading ? 'Saving...' : 'Save product'}
              </button>
            </div>
          </form>

          <div style={{ background: '#0b1b2b', border: '1px solid #1b3055', borderRadius: 18, padding: 24 }}>
            <h2 style={{ marginTop: 0, marginBottom: 20 }}>Current catalog</h2>
            <div style={{ display: 'grid', gap: 14 }}>
              {products.map((product) => (
                <div key={product.id} style={{ background: '#0f2139', borderRadius: 14, padding: 16, border: '1px solid #1d3558' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                    <div>
                      <div style={{ fontWeight: 700 }}>{product.name}</div>
                      <div style={{ color: '#9db7d6', fontSize: 13 }}>{product.category}</div>
                    </div>
                    <button onClick={() => handleDelete(product.id)} style={{ background: '#172d45', border: '1px solid #27476d', color: '#fca5a5', borderRadius: 10, padding: '8px 12px', cursor: 'pointer' }}>
                      Delete
                    </button>
                  </div>
                  <div style={{ marginTop: 12, color: '#d9ecff' }}>
                    {product.price.toLocaleString()} {product.currency} · Stock: {product.stock}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: '#0f2238',
  border: '1px solid #26466d',
  borderRadius: 10,
  color: '#edf5ff',
  padding: '12px 14px',
  fontSize: 15,
  outline: 'none',
};

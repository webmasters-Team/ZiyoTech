import React, { useState } from 'react';

interface SalesAiLoginProps {
  onLogin: () => void;
}

export default function SalesAiLogin({ onLogin }: SalesAiLoginProps) {
  const [email, setEmail] = useState('admin@ziyotech.com');
  const [password, setPassword] = useState('Aslan1995!');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:4000/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Login failed.');
        return;
      }

      localStorage.setItem('ziyo-sales-admin', JSON.stringify(data.user));
      onLogin();
    } catch (submitError) {
      setError('Unable to reach the authentication service.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#06131d', color: '#edf6ff', display: 'grid', placeItems: 'center', padding: 24 }}>
      <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: 440, background: '#0a1c2d', border: '1px solid #24476d', borderRadius: 20, padding: 28 }}>
        <h1 style={{ fontSize: 32, marginBottom: 8 }}>Sales AI Admin</h1>
        <p style={{ color: '#9bb5d2', marginBottom: 28 }}>Secure access to the sales AI dashboard.</p>

        <div style={{ display: 'grid', gap: 16 }}>
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" style={inputStyle} />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" style={inputStyle} />

          {error ? <div style={{ color: '#fca5a5', fontSize: 14 }}>{error}</div> : null}

          <button type="submit" disabled={loading} style={{ background: 'linear-gradient(90deg, #2563eb, #06b6d4)', border: 'none', borderRadius: 12, color: '#fff', padding: '12px 18px', fontWeight: 700, cursor: 'pointer' }}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </div>
      </form>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: '#0e243b',
  border: '1px solid #26466d',
  borderRadius: 12,
  color: '#edf6ff',
  padding: '12px 14px',
  fontSize: 15,
  outline: 'none',
};

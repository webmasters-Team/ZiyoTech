import React, { useState } from 'react';
import { API_BASE_URL } from '../lib/api';

interface SalesAiLoginProps {
  onLogin: () => void;
}

export default function SalesAiLogin({ onLogin }: SalesAiLoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const apiBase = API_BASE_URL;
      const response = await fetch(`${apiBase}/api/admin/login`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
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
          <input autoComplete="username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Admin ID" aria-label="Admin ID" required style={inputStyle} />
          <input autoComplete="current-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" aria-label="Password" required style={inputStyle} />

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

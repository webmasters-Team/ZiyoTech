import React, { useState } from 'react';

interface SalesAiOnboardingProps {
  onContinue: (businessId?: string) => void;
}

export default function SalesAiOnboarding({ onContinue }: SalesAiOnboardingProps) {
  const [form, setForm] = useState({
    name: 'Malditaia',
    type: 'electronics',
    language: 'uz',
    botEnabled: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:4000/api/businesses/onboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'Unable to create business account.');
        return;
      }

      onContinue(data.business?.id || 'demo-business');
    } catch (submitError) {
      setError('Unable to create the business account right now.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#071522', color: '#edf5ff', display: 'grid', placeItems: 'center', padding: 24 }}>
      <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: 520, background: '#0a1b2b', border: '1px solid #244465', borderRadius: 20, padding: 28 }}>
        <h1 style={{ fontSize: 34, marginBottom: 8 }}>Onboard your business</h1>
        <p style={{ color: '#9bb5d2', marginBottom: 24 }}>Create a tenant for your AI sales agent and start managing products, leads, and conversations.</p>

        <div style={{ display: 'grid', gap: 16 }}>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Business name"
            style={inputStyle}
          />

          <input
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
            placeholder="Business type"
            style={inputStyle}
          />

          <select value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })} style={inputStyle}>
            <option value="uz">Uzbek</option>
            <option value="ru">Russian</option>
            <option value="en">English</option>
          </select>

          <label style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#dfeeff' }}>
            <input type="checkbox" checked={form.botEnabled} onChange={(e) => setForm({ ...form, botEnabled: e.target.checked })} />
            Enable Telegram sales bot
          </label>

          {error ? <div style={{ color: '#fca5a5', fontSize: 14 }}>{error}</div> : null}

          <button type="submit" disabled={loading} style={{ background: 'linear-gradient(90deg, #2563eb, #06b6d4)', border: 'none', borderRadius: 12, color: '#fff', padding: '12px 18px', fontWeight: 700, cursor: 'pointer' }}>
            {loading ? 'Creating account...' : 'Create business account'}
          </button>
        </div>
      </form>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: '#0f2438',
  border: '1px solid #27486f',
  borderRadius: 12,
  color: '#edf5ff',
  padding: '12px 14px',
  fontSize: 15,
  outline: 'none',
};

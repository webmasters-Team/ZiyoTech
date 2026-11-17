import React, { useEffect, useState } from 'react';

interface SalesAiDashboardProps {
  businessId?: string;
}

const demoStats = [
  { label: 'Active businesses', value: '12' },
  { label: 'Leads today', value: '128' },
  { label: 'Conversion rate', value: '18.4%' },
  { label: 'Avg. response', value: '< 3s' },
];

export default function SalesAiDashboard({ businessId = 'demo-business' }: SalesAiDashboardProps) {
  const [products, setProducts] = useState<Array<{ name: string; price: string; stock: string }>>([]);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await fetch(`http://localhost:4000/api/catalog?businessId=${encodeURIComponent(businessId)}`);
        const data = await response.json();
        setProducts(
          (data || []).slice(0, 4).map((product: any) => ({
            name: product.name,
            price: `${Number(product.price || 0).toLocaleString()} ${product.currency || 'UZS'}`,
            stock: String(product.stock || 0),
          }))
        );
      } catch (error) {
        setProducts([
          { name: 'Samsung Galaxy A35', price: '3,300,000 UZS', stock: '12' },
          { name: 'Tecno Camon 30', price: '2,750,000 UZS', stock: '9' },
          { name: 'Noise Buds X', price: '640,000 UZS', stock: '27' },
        ]);
      }
    };

    loadProducts();
  }, [businessId]);

  return (
    <div style={{ padding: 32, fontFamily: 'Inter, sans-serif', background: '#07111c', color: '#e5eefc', minHeight: '100vh' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <h1 style={{ fontSize: 42, marginBottom: 8 }}>ZiyoTech Sales AI</h1>
        <p style={{ color: '#9bb8d3', fontSize: 18, marginBottom: 32 }}>
          AI-powered sales assistant for {businessId}.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 18, marginBottom: 32 }}>
          {demoStats.map((stat) => (
            <div key={stat.label} style={{ background: '#0d1a2b', border: '1px solid #1f3657', borderRadius: 16, padding: 20 }}>
              <div style={{ color: '#7dd3fc', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.12em' }}>{stat.label}</div>
              <div style={{ fontSize: 30, fontWeight: 800, marginTop: 12 }}>{stat.value}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 24 }}>
          <div style={{ background: '#0a1628', border: '1px solid #1b2d45', borderRadius: 20, padding: 24 }}>
            <h2 style={{ marginTop: 0 }}>Live product catalog</h2>
            <div style={{ display: 'grid', gap: 14 }}>
              {products.map((product) => (
                <div key={product.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #183049', paddingBottom: 12 }}>
                  <div>
                    <div style={{ fontWeight: 700 }}>{product.name}</div>
                    <div style={{ color: '#9bb8d3', fontSize: 13 }}>{product.price}</div>
                  </div>
                  <div style={{ background: '#142f48', borderRadius: 999, padding: '8px 12px', color: '#7dd3fc', fontSize: 12 }}>
                    Stock: {product.stock}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: '#0b1830', border: '1px solid #1d3554', borderRadius: 20, padding: 24 }}>
            <h2 style={{ marginTop: 0 }}>AI sales flow</h2>
            <ul style={{ color: '#cfe3ff', lineHeight: 1.8 }}>
              <li>Receives Telegram customer message</li>
              <li>Reads product catalog and pricing</li>
              <li>Recommends relevant products</li>
              <li>Collects lead contact info</li>
              <li>Escalates to salesperson when needed</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

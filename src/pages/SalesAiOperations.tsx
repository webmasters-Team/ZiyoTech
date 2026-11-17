import React, { useEffect, useState } from 'react';

interface SalesAiOperationsProps {
  businessId?: string;
}

interface Lead {
  id: string;
  customerName: string;
  channel: string;
  status: string;
  note: string;
}

interface Conversation {
  id: string;
  customerName: string;
  channel: string;
  status: string;
  lastMessage: string;
}

export default function SalesAiOperations({ businessId = 'demo-business' }: SalesAiOperationsProps) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);

  const loadData = async () => {
    try {
      const [leadsRes, conversationsRes] = await Promise.all([
        fetch(`http://localhost:4000/api/leads?businessId=${encodeURIComponent(businessId)}`),
        fetch(`http://localhost:4000/api/conversations?businessId=${encodeURIComponent(businessId)}`),
      ]);

      const leadsData = await leadsRes.json();
      const conversationsData = await conversationsRes.json();
      setLeads(leadsData);
      setConversations(conversationsData);
    } catch (error) {
      console.error('Failed to load operations', error);
    }
  };

  useEffect(() => {
    loadData();
  }, [businessId]);

  return (
    <div style={{ minHeight: '100vh', background: '#071522', color: '#ecf5ff', padding: 32 }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <h1 style={{ fontSize: 40, marginBottom: 8 }}>Sales AI Operations</h1>
        <p style={{ color: '#9bb5d2', marginBottom: 32 }}>Live leads and customer conversations for {businessId}.</p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          <div style={{ background: '#0d1c2d', border: '1px solid #1d3557', borderRadius: 18, padding: 20 }}>
            <h2 style={{ marginTop: 0, marginBottom: 16 }}>New leads</h2>
            <div style={{ display: 'grid', gap: 12 }}>
              {leads.length === 0 ? (
                <div style={{ color: '#9bb5d2' }}>No leads yet.</div>
              ) : (
                leads.map((lead) => (
                  <div key={lead.id} style={{ background: '#102640', border: '1px solid #23486e', borderRadius: 12, padding: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                      <strong>{lead.customerName || 'Unknown customer'}</strong>
                      <span style={{ color: '#7dd3fc', fontSize: 12 }}>{lead.status}</span>
                    </div>
                    <div style={{ fontSize: 13, color: '#c7d8ee', marginTop: 8 }}>{lead.channel}</div>
                    <div style={{ marginTop: 8, color: '#dfeeff', fontSize: 13 }}>{lead.note}</div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div style={{ background: '#0d1c2d', border: '1px solid #1d3557', borderRadius: 18, padding: 20 }}>
            <h2 style={{ marginTop: 0, marginBottom: 16 }}>Conversations</h2>
            <div style={{ display: 'grid', gap: 12 }}>
              {conversations.length === 0 ? (
                <div style={{ color: '#9bb5d2' }}>No conversations yet.</div>
              ) : (
                conversations.map((conversation) => (
                  <div key={conversation.id} style={{ background: '#102640', border: '1px solid #23486e', borderRadius: 12, padding: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                      <strong>{conversation.customerName}</strong>
                      <span style={{ color: '#7dd3fc', fontSize: 12 }}>{conversation.status}</span>
                    </div>
                    <div style={{ fontSize: 13, color: '#c7d8ee', marginTop: 8 }}>{conversation.channel}</div>
                    <div style={{ marginTop: 8, color: '#dfeeff', fontSize: 13 }}>{conversation.lastMessage}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { usePlatform } from '../../context/PlatformContext';
import { useLanguage } from '../../context/LanguageContext';
import { OrderItem } from '../../types';
import {
  ShoppingBag,
  Search,
  CheckCircle2,
  Clock,
  Truck,
  XCircle,
  Filter,
  Instagram,
  Download
} from 'lucide-react';

export const OrdersView: React.FC = () => {
  const { orders, updateOrderStatus } = usePlatform();
  const { language } = useLanguage();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | OrderItem['status']>('all');

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.customerName.toLowerCase().includes(search.toLowerCase()) ||
      o.phone.toLowerCase().includes(search.toLowerCase()) ||
      o.productName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalRevenue = orders.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-indigo-400" />
            <span>Orders Captured by AI Agent</span>
          </h2>
          <p className="text-xs text-slate-400">
            Autonomous order drafting directly from customer Instagram Direct negotiations
          </p>
        </div>

        <div className="text-xs font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-800 px-3.5 py-1.5 rounded-xl">
          Captured Pipeline Value: {totalRevenue.toLocaleString()} UZS
        </div>
      </div>

      {/* Filters and search */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search order #, customer, phone..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 placeholder:text-slate-500"
          />
        </div>

        <div className="flex gap-1.5 text-xs w-full sm:w-auto">
          {(['all', 'pending', 'confirmed', 'delivered'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg capitalize font-medium transition-colors ${
                statusFilter === st
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800 bg-slate-950/60">
              <tr>
                <th className="py-3.5 px-4">Order ID & Date</th>
                <th className="py-3.5 px-4">Customer Details</th>
                <th className="py-3.5 px-4">Product Selected</th>
                <th className="py-3.5 px-4">Order Value</th>
                <th className="py-3.5 px-4">Current Status</th>
                <th className="py-3.5 px-4 text-right">Change Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {filteredOrders.map((ord) => (
                <tr key={ord.id} className="hover:bg-slate-850/60 transition-colors">
                  <td className="py-3.5 px-4 font-mono">
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <Instagram className="w-3.5 h-3.5 text-pink-400" />
                      <span>{ord.orderNumber}</span>
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{ord.date}</div>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-white">{ord.customerName}</div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {ord.customerHandle} · {ord.phone}
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-slate-300 font-medium">{ord.productName}</td>

                  <td className="py-3.5 px-4 font-mono font-bold text-white tabular-nums">
                    {ord.amount.toLocaleString()} UZS
                  </td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize ${
                        ord.status === 'confirmed'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : ord.status === 'delivered'
                          ? 'bg-blue-950 text-blue-400 border border-blue-800'
                          : 'bg-amber-950 text-amber-400 border border-amber-800'
                      }`}
                    >
                      {ord.status}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right space-x-1">
                    <select
                      value={ord.status}
                      onChange={(e) => updateOrderStatus(ord.id, e.target.value as any)}
                      className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-[11px] text-slate-200 focus:outline-none focus:border-cyan-400"
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

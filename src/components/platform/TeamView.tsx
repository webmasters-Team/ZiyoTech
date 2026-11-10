import React, { useState } from 'react';
import { usePlatform } from '../../context/PlatformContext';
import { UserRole } from '../../types';
import { Users, UserPlus, Shield, Mail, Trash2, CheckCircle2 } from 'lucide-react';

export const TeamView: React.FC = () => {
  const { role, setRole } = usePlatform();

  const [members, setMembers] = useState([
    {
      id: 'm-1',
      name: 'Aziz Rahimov',
      email: 'aziz@ziyotech.uz',
      role: 'Business Owner' as const,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80',
      activeConversations: 0,
    },
    {
      id: 'm-2',
      name: 'Alisher Qodirov',
      email: 'alisher@ziyotech.uz',
      role: 'Business Employee' as const,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80',
      activeConversations: 2,
    },
    {
      id: 'm-3',
      name: 'Malika Karimova',
      email: 'malika@ziyotech.uz',
      role: 'Business Employee' as const,
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80',
      activeConversations: 1,
    },
  ]);

  return (
    <div className="space-y-6 max-w-4xl">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-cyan-400" />
            <span>Team Members & Role-Based Access Control (RBAC)</span>
          </h2>
          <p className="text-xs text-slate-400">
            Invite customer support agents, manage live conversation assignments, and control permissions.
          </p>
        </div>

        <button
          onClick={() => alert('Invite member modal (demo): enter email to generate invitation token.')}
          className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs flex items-center gap-2 transition-colors self-start"
        >
          <UserPlus className="w-4 h-4" />
          <span>Invite Employee</span>
        </button>
      </div>

      {/* Role Switcher Sandbox */}
      <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-800/60 flex items-center justify-between flex-wrap gap-3">
        <div className="text-xs">
          <span className="font-bold text-white">Active Session RBAC Simulator: </span>
          <span className="text-slate-300">Switch current role to test UI permissions</span>
        </div>

        <div className="flex gap-1.5 text-xs">
          {(['business_owner', 'employee', 'super_admin'] as UserRole[]).map((r) => (
            <button
              key={r}
              onClick={() => setRole(r)}
              className={`px-3 py-1.5 rounded-lg font-medium capitalize transition-colors ${
                role === r
                  ? 'bg-cyan-500 text-black font-bold'
                  : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-700'
              }`}
            >
              {r.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Team Table */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-xl">
        <table className="w-full text-left text-xs">
          <thead className="text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800 bg-slate-950/60">
            <tr>
              <th className="py-3.5 px-4">Member Name</th>
              <th className="py-3.5 px-4">Email</th>
              <th className="py-3.5 px-4">Assigned Role</th>
              <th className="py-3.5 px-4">Assigned Inquiries</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {members.map((m) => (
              <tr key={m.id} className="hover:bg-slate-850/60 transition-colors">
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-3">
                    <img src={m.avatar} alt={m.name} className="w-8 h-8 rounded-full object-cover" />
                    <span className="font-semibold text-white">{m.name}</span>
                  </div>
                </td>
                <td className="py-3.5 px-4 text-slate-400 font-mono">{m.email}</td>
                <td className="py-3.5 px-4">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-cyan-300 border border-slate-700">
                    {m.role}
                  </span>
                </td>
                <td className="py-3.5 px-4 font-mono text-white">
                  {m.activeConversations} active
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
};

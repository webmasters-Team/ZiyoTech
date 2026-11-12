import React, { useState } from 'react';
import { usePlatform } from '../../context/PlatformContext';
import { UserRole } from '../../types';
import { Users } from 'lucide-react';

export const TeamView: React.FC = () => {
  const { role, setRole } = usePlatform();

  const [members, setMembers] = useState([]);

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-cyan-400" />
            <span>Team Members</span>
          </h2>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-800/60 flex items-center justify-between flex-wrap gap-3">
        <div className="text-xs">
          <span className="font-bold text-white">Current Role: </span>
          <span className="text-slate-300">{role.replace('_', ' ')}</span>
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

      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-xl">
        {members.length === 0 ? (
          <div className="p-8 text-center text-slate-400">No team members available.</div>
        ) : (
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
        )}
      </div>
    </div>
  );
};

import React, { useMemo } from 'react';
import { usePlatform } from '../../context/PlatformContext';
import { servicesData } from '../../data/servicesData';
import { Clock3, Mail, Phone, User } from 'lucide-react';
import { sortProjectRequests } from '../../lib/projectRequests.js';

const statusMeta = {
  new: {
    label: 'New',
    tone: 'bg-blue-950/80 text-blue-300 border border-blue-800',
  },
  review: {
    label: 'Review',
    tone: 'bg-amber-950/80 text-amber-300 border border-amber-800',
  },
  contacted: {
    label: 'Contacted',
    tone: 'bg-violet-950/80 text-violet-300 border border-violet-800',
  },
  completed: {
    label: 'Completed',
    tone: 'bg-emerald-950/80 text-emerald-300 border border-emerald-800',
  },
} as const;

export const ProjectRequestsView: React.FC = () => {
  const { projectRequests, projectRequestsLoadStatus, projectRequestsLoadError } = usePlatform();

  const rows = useMemo(() => {
    return sortProjectRequests(projectRequests);
  }, [projectRequests]);

  const formatDate = (value: string) => {
    if (!value || Number.isNaN(Date.parse(value))) return 'Date unavailable';
    return new Intl.DateTimeFormat('en', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(new Date(value));
  };

  return (
    <div className="space-y-4">
      {projectRequestsLoadStatus === 'loading' && (
        <div className="rounded-xl border border-cyan-900/60 bg-cyan-950/30 px-4 py-3 text-sm text-cyan-200" role="status" aria-live="polite">
          Loading Project Requests…
        </div>
      )}
      {projectRequestsLoadStatus === 'error' && (
        <div className="rounded-xl border border-rose-900/60 bg-rose-950/30 px-4 py-3 text-sm text-rose-200" role="alert">
          {projectRequestsLoadError || 'Project Requests could not be loaded.'}
          {rows.length > 0 && <span className="block pt-1 text-rose-200/80">Showing requests available in the local cache.</span>}
        </div>
      )}
      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 shadow-2xl">
        {rows.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            {projectRequestsLoadStatus === 'loading'
              ? 'Loading requests…'
              : projectRequestsLoadStatus === 'error'
                ? 'Requests are unavailable until the Firestore connection is restored.'
                : 'No project requests have been submitted yet.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm text-slate-200">
              <thead className="bg-slate-950/80 text-[11px] uppercase tracking-[0.16em] text-slate-400">
                <tr>
                  <th className="px-4 py-3 font-semibold">Name</th>
                  <th className="px-4 py-3 font-semibold">Business</th>
                  <th className="px-4 py-3 font-semibold">Service</th>
                  <th className="px-4 py-3 font-semibold">Email</th>
                  <th className="px-4 py-3 font-semibold">Phone</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Submitted</th>
                  <th className="px-4 py-3 font-semibold">Project Brief</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((request) => {
                  const serviceName = servicesData.find((item) => item.id === request.serviceId)?.name[request.preferredLang] ?? request.serviceId;
                  const meta = statusMeta[request.status];

                  return (
                    <tr key={request.id} className="border-t border-slate-800 align-top hover:bg-slate-800/40">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-white">{request.name || '—'}</div>
                        <div className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                          <User className="h-3 w-3 text-cyan-400" />
                          <span>{request.id || 'No ID'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-300">{request.businessName || '—'}</td>
                      <td className="px-4 py-3 text-slate-300">{serviceName || '—'}</td>
                      <td className="px-4 py-3 text-slate-300">{request.email || '—'}</td>
                      <td className="px-4 py-3 text-slate-300">
                        <div className="flex items-center gap-2">
                          <Phone className="h-3.5 w-3.5 text-cyan-400" />
                          <span>{request.phoneOrTelegram || '—'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${meta.tone}`}>
                          {meta.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-300">
                        <div className="flex items-center gap-2">
                          <Clock3 className="h-3.5 w-3.5 text-cyan-400" />
                          <span>{request.createdAt ? formatDate(request.createdAt) : '—'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-300">
                        <div className="max-w-md leading-6">{request.projectDesc || '—'}</div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

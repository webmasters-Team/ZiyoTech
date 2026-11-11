import React, { useMemo, useState } from 'react';
import { usePlatform } from '../../context/PlatformContext';
import { servicesData } from '../../data/servicesData';
import {
  Briefcase,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Mail,
  Phone,
  Search,
  Sparkles,
  User,
} from 'lucide-react';

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
  const { projectRequests, updateProjectRequestStatus } = usePlatform();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'new' | 'review' | 'contacted' | 'completed'>('all');

  const filteredRequests = useMemo(() => {
    return projectRequests.filter((request) => {
      const serviceName = servicesData.find((item) => item.id === request.serviceId)?.name[request.preferredLang] ?? request.serviceId;
      const matchesSearch =
        !search ||
        [request.name, request.businessName, request.email, request.phoneOrTelegram, request.projectDesc, serviceName]
          .join(' ')
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesFilter = filter === 'all' || request.status === filter;
      return matchesSearch && matchesFilter;
    });
  }, [filter, projectRequests, search]);

  const formatDate = (value: string) =>
    new Intl.DateTimeFormat('en', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(new Date(value));

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-2xl">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-cyan-500/40 bg-cyan-950/40 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-300">
              <Sparkles className="h-3.5 w-3.5" />
              Lead queue
            </div>
            <h2 className="text-2xl font-bold text-white">Project Requests</h2>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-300">
            <Briefcase className="h-4 w-4 text-cyan-400" />
            <span>{projectRequests.length} total inquiries</span>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name, business, email, or service"
              className="w-full rounded-xl border border-slate-700 bg-slate-950/70 py-2.5 pl-9 pr-3 text-sm text-white placeholder:text-slate-500 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div className="relative">
            <select
              value={filter}
              onChange={(event) => setFilter(event.target.value as typeof filter)}
              className="appearance-none rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2.5 pr-9 text-sm text-white focus:border-cyan-500 focus:outline-none"
            >
              <option value="all">All statuses</option>
              <option value="new">New</option>
              <option value="review">Review</option>
              <option value="contacted">Contacted</option>
              <option value="completed">Completed</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/60 p-8 text-center text-slate-400">
            No inquiries match this filter.
          </div>
        ) : (
          filteredRequests.map((request) => {
            const serviceName = servicesData.find((item) => item.id === request.serviceId)?.name[request.preferredLang] ?? request.serviceId;
            const meta = statusMeta[request.status];

            return (
              <div key={request.id} className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-lg">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${meta.tone}`}>
                        {meta.label}
                      </span>
                      <span className="text-[11px] text-slate-400">#{request.id}</span>
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-lg font-bold text-white">{request.name}</h3>
                      <p className="text-sm text-slate-300">{request.businessName || 'Independent client'}</p>
                    </div>

                    <div className="grid gap-2 text-sm text-slate-300 md:grid-cols-2">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-cyan-400" />
                        <span>{request.email || 'No email provided'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-cyan-400" />
                        <span>{request.phoneOrTelegram || 'No phone provided'}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-slate-300">
                      <User className="h-4 w-4 text-cyan-400" />
                      <span>{serviceName}</span>
                    </div>
                  </div>

                  <div className="w-full max-w-sm space-y-3">
                    <div className="rounded-xl border border-slate-700 bg-slate-950/60 p-3">
                      <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                        <Clock3 className="h-3.5 w-3.5" />
                        Submitted
                      </div>
                      <div className="text-sm text-slate-200">{formatDate(request.createdAt)}</div>
                    </div>

                    <label className="block text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                      Update status
                    </label>
                    <select
                      value={request.status}
                      onChange={(event) => updateProjectRequestStatus(request.id, event.target.value as typeof request.status)}
                      className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2.5 text-sm text-white focus:border-cyan-500 focus:outline-none"
                    >
                      <option value="new">New</option>
                      <option value="review">Review</option>
                      <option value="contacted">Contacted</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </div>

                <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950/50 p-3">
                  <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-400">Project brief</div>
                  <p className="text-sm leading-6 text-slate-300">{request.projectDesc || 'No project description provided.'}</p>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                  <span className="rounded-full border border-slate-700 bg-slate-800 px-2 py-1">Prefers: {request.preferredLang.toUpperCase()}</span>
                  <span className="rounded-full border border-slate-700 bg-slate-800 px-2 py-1">Source: {request.source}</span>
                  {request.status === 'completed' && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-800 bg-emerald-950/40 px-2 py-1 text-emerald-300">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Closed
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

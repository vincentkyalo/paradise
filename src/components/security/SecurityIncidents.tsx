import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SecurityIncident } from '../../types';
import {
  ShieldAlert,
  AlertTriangle,
  UserX,
  Users,
  CheckCircle2,
  Plus,
  Clock,
  MapPin,
  FileText
} from 'lucide-react';

export const SecurityIncidents: React.FC = () => {
  const { incidents, reportIncident, currentUser, showToast } = useApp();

  const [incidentModalOpen, setIncidentModalOpen] = useState(false);
  const [severity, setSeverity] = useState<SecurityIncident['severity']>('medium');
  const [location, setLocation] = useState('Club Main Entrance');
  const [description, setDescription] = useState('');

  // Door crowd live capacity simulator
  const [currentHeadcount, setCurrentHeadcount] = useState(184);
  const maxCapacity = 250;

  const handleIncidentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    reportIncident({
      location,
      severity,
      reportedBy: `${currentUser.name} (${currentUser.role})`,
      description,
    });

    setIncidentModalOpen(false);
    setDescription('');
  };

  const getSeverityBadge = (s: SecurityIncident['severity']) => {
    switch (s) {
      case 'low':
        return { label: 'Low', bg: 'bg-slate-800 text-slate-300 border-slate-700' };
      case 'medium':
        return { label: 'Medium', bg: 'bg-amber-500/20 text-amber-300 border-amber-500/30' };
      case 'high':
        return { label: 'High Alert', bg: 'bg-rose-500/20 text-rose-300 border-rose-500/30' };
      case 'critical':
        return { label: 'Critical / Police', bg: 'bg-purple-600 text-white border-purple-500 animate-pulse' };
    }
  };

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-400" />
            <h2 className="text-xl font-bold text-white tracking-tight">
              Security Operations, Incidents & Door Control
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-semibold">
              Live Guard Dispatch
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Door entry headcount capacity tracking, security incident reports, patron blacklists, and guard patrol logs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIncidentModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-lg shadow-rose-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>Log Security Incident</span>
          </button>
        </div>
      </div>

      {/* Door Capacity Tally Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-cyan-400" />
              Live Club Patron Headcount
            </span>
            <span className="font-mono text-cyan-400 font-bold">
              {currentHeadcount} / {maxCapacity} Pax
            </span>
          </div>

          <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
            <div
              className={`h-full ${
                currentHeadcount / maxCapacity > 0.9
                  ? 'bg-rose-500'
                  : currentHeadcount / maxCapacity > 0.75
                  ? 'bg-amber-400'
                  : 'bg-emerald-400'
              }`}
              style={{ width: `${(currentHeadcount / maxCapacity) * 100}%` }}
            />
          </div>

          <div className="flex justify-between items-center pt-1">
            <span className="text-[11px] text-slate-400">Door Bouncer Clicker:</span>
            <div className="flex gap-1.5">
              <button
                onClick={() => setCurrentHeadcount((c) => Math.max(0, c - 1))}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono cursor-pointer"
              >
                -1 Exit
              </button>
              <button
                onClick={() => setCurrentHeadcount((c) => Math.min(maxCapacity, c + 1))}
                className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-bold cursor-pointer"
              >
                +1 Entry
              </button>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400">Active Security Incidents</span>
            <div className="text-2xl font-bold font-mono text-rose-400 mt-1">
              {incidents.filter((i) => i.status === 'open' || i.status === 'investigating').length} Active
            </div>
            <div className="text-[10px] text-slate-500">Requires supervisor review</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-950/40 text-rose-400 flex items-center justify-center border border-rose-800/40">
            <ShieldAlert className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400">Banned Individuals (Blacklist)</span>
            <div className="text-2xl font-bold font-mono text-amber-400 mt-1">
              3 Persons
            </div>
            <div className="text-[10px] text-slate-500">Denied entry at all access gates</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-950/40 text-amber-400 flex items-center justify-center border border-amber-800/40">
            <UserX className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Incidents Table */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl space-y-3">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <FileText className="w-4 h-4 text-rose-400" />
            Security Incident Logbook
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            {incidents.length} Records
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3.5">Timestamp</th>
                <th className="p-3.5">Location</th>
                <th className="p-3.5">Severity</th>
                <th className="p-3.5">Description & Action Taken</th>
                <th className="p-3.5">Reporting Officer</th>
                <th className="p-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {incidents.map((inc) => {
                const sBadge = getSeverityBadge(inc.severity);
                return (
                  <tr key={inc.id} className="hover:bg-slate-800/40 transition">
                    <td className="p-3.5 font-mono text-slate-400 text-[11px] whitespace-nowrap">
                      {inc.timestamp}
                    </td>
                    <td className="p-3.5 font-bold text-white whitespace-nowrap">
                      {inc.location}
                    </td>
                    <td className="p-3.5 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded-full border text-[10px] font-semibold ${sBadge.bg}`}>
                        {sBadge.label}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-300 max-w-md">{inc.description}</td>
                    <td className="p-3.5 text-slate-400 whitespace-nowrap">{inc.reportedBy}</td>
                    <td className="p-3.5 capitalize font-mono text-emerald-400 whitespace-nowrap">
                      {inc.status}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Incident Modal */}
      {incidentModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleIncidentSubmit}
            className="bg-slate-900 border border-rose-800/60 rounded-2xl w-full max-w-md p-5 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-sm font-bold text-rose-400 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4" />
                File Security Incident Report
              </h3>
              <button
                type="button"
                onClick={() => setIncidentModalOpen(false)}
                className="text-slate-400 hover:text-white text-xs cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 text-[10px]">Location in Facility</label>
                  <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full mt-0.5 bg-slate-950 border border-slate-700 rounded-lg p-2 text-white text-xs"
                  >
                    <option value="Club Main Entrance">Club Main Entrance</option>
                    <option value="VIP Lounge Area">VIP Lounge Area</option>
                    <option value="Main Dance Floor">Main Dance Floor</option>
                    <option value="Bar Counter Till">Bar Counter Till</option>
                    <option value="Nyama Choma Patio">Nyama Choma Patio</option>
                    <option value="Hotel Reception / Lobby">Hotel Reception / Lobby</option>
                    <option value="Perimeter / VIP Car Park">Perimeter / VIP Car Park</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 text-[10px]">Severity Rating</label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value as any)}
                    className="w-full mt-0.5 bg-slate-950 border border-slate-700 rounded-lg p-2 text-white text-xs"
                  >
                    <option value="low">Low (Dispute / Misunderstanding)</option>
                    <option value="medium">Medium (Intoxicated / Unpaid Tab)</option>
                    <option value="high">High (Fight / Property Damage)</option>
                    <option value="critical">Critical (Weapons / Police Intervened)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-400 text-[10px]">Detailed Incident Description</label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Record sequence of events, individuals involved, property damaged, and action taken by security..."
                  className="w-full mt-0.5 bg-slate-950 border border-slate-700 rounded-lg p-2 text-white text-xs"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIncidentModalOpen(false)}
                className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold cursor-pointer shadow-lg shadow-rose-600/20"
              >
                Submit Incident Report
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

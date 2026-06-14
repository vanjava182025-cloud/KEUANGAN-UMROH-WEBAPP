import React, { useState, useEffect } from 'react';
import { dbService } from '../services/dbService';
import { formatIndoDateTime } from '../utils/formatters';
import { useAuth } from '../contexts/AuthContext';
import { 
  History, 
  Search, 
  User, 
  Calendar,
  AlertCircle,
  Eye,
  EyeOff,
  Database
} from 'lucide-react';

export default function AuditLog() {
  const { user } = useAuth();
  
  // Database states
  const [logs, setLogs] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter
  const [search, setSearch] = useState('');
  const [userFilter, setUserFilter] = useState('Semua');
  const [expandedLogId, setExpandedLogId] = useState(null);

  const loadLogsData = async () => {
    setLoading(true);
    const rawLogs = await dbService.auditLogs.getAll();
    setLogs(rawLogs);

    const rawUsers = await dbService.users.getAll();
    setUsers(rawUsers);
    setLoading(false);
  };

  useEffect(() => {
    loadLogsData();
  }, []);

  // Filter logs
  const filteredLogs = logs.filter(log => {
    const matchSearch = log.activity.toLowerCase().includes(search.toLowerCase()) ||
                        (log.old_data && log.old_data.toLowerCase().includes(search.toLowerCase())) ||
                        (log.new_data && log.new_data.toLowerCase().includes(search.toLowerCase()));
    
    // Find log operator
    const operator = users.find(u => u.id === log.user_id);
    const matchUser = userFilter === 'Semua' || log.user_id === userFilter;

    return matchSearch && matchUser;
  });

  const toggleExpand = (logId) => {
    setExpandedLogId(expandedLogId === logId ? null : logId);
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'Admin Keuangan': return 'bg-red-50 text-primary border border-red-100';
      case 'Staff Keuangan': return 'bg-blue-50 text-blue-600 border border-blue-100';
      case 'Marketing': return 'bg-emerald-50 text-emerald-600 border border-emerald-100';
      case 'Pimpinan': return 'bg-purple-50 text-purple-600 border border-purple-100';
      default: return 'bg-slate-50 text-slate-500';
    }
  };

  const renderJsonPretty = (jsonStr) => {
    if (!jsonStr) return <span className="text-slate-400 italic">Kosong</span>;
    try {
      const parsed = JSON.parse(jsonStr);
      return (
        <pre className="bg-slate-900 text-slate-100 p-3 rounded-lg text-[10px] leading-relaxed overflow-x-auto max-w-full font-mono">
          {JSON.stringify(parsed, null, 2)}
        </pre>
      );
    } catch (e) {
      return <span className="font-mono text-slate-700 block break-words">{jsonStr}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-800">Log Aktivitas Sistem (Audit Trail)</h1>
        <p className="text-xs text-slate-500 mt-0.5">Pantau seluruh catatan perubahan data, login sesi pengguna, dan pembukuan kuitansi untuk keperluan verifikasi kepatuhan keuangan.</p>
      </div>

      {/* SEARCH AND FILTERS */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-premium flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
            <Search size={16} />
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari kata kunci aktivitas..."
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-700"
          />
        </div>

        {/* User filter selector */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <span className="text-xs text-slate-500 flex items-center gap-1 font-medium"><User size={14} /> Operator:</span>
          <select
            value={userFilter}
            onChange={(e) => setUserFilter(e.target.value)}
            className="border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white text-slate-700 font-medium"
          >
            <option value="Semua">Semua Pengguna</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
            ))}
          </select>
        </div>
      </div>

      {/* LOGS LIST */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-premium overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary mx-auto mb-2"></div>
            <p className="text-xs text-slate-400">Memuat log perubahan...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                  <th className="py-4 px-6 w-[20%]">Tanggal Log</th>
                  <th className="py-4 px-6 w-[25%]">Pengguna (Operator)</th>
                  <th className="py-4 px-6 w-[45%]">Aktivitas Perubahan</th>
                  <th className="py-4 px-6 text-center w-[10%]">Metadata</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredLogs.map((log) => {
                  const operator = users.find(u => u.id === log.user_id) || { name: 'System / Automated', role: 'Daemon' };
                  const isExpanded = expandedLogId === log.id;
                  
                  return (
                    <React.Fragment key={log.id}>
                      <tr className="hover:bg-slate-50/30 transition-colors">
                        {/* DateTime */}
                        <td className="py-4 px-6 font-medium text-slate-500">
                          {formatIndoDateTime(log.created_at)}
                        </td>

                        {/* Operator details */}
                        <td className="py-4 px-6">
                          <div>
                            <span className="font-bold text-slate-800 block">{operator.name}</span>
                            <span className={`inline-block px-1.5 py-0.5 rounded text-[8px] font-bold uppercase mt-1 ${getRoleBadgeColor(operator.role)}`}>
                              {operator.role}
                            </span>
                          </div>
                        </td>

                        {/* Activity */}
                        <td className="py-4 px-6 font-semibold text-slate-700">
                          {log.activity}
                        </td>

                        {/* JSON expand action */}
                        <td className="py-4 px-6 text-center">
                          {(log.old_data || log.new_data) ? (
                            <button
                              onClick={() => toggleExpand(log.id)}
                              className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-500 hover:text-primary transition-colors bg-slate-100 px-2 py-1 rounded"
                            >
                              {isExpanded ? <EyeOff size={12} /> : <Eye size={12} />}
                              <span>{isExpanded ? 'Tutup' : 'Data'}</span>
                            </button>
                          ) : (
                            <span className="text-slate-300 italic text-[10px]">Tdk ada</span>
                          )}
                        </td>
                      </tr>

                      {/* Expanded comparative changes view */}
                      {isExpanded && (
                        <tr className="bg-slate-50/50">
                          <td colSpan="4" className="py-4 px-8 border-l-4 border-primary">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-1.5">
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide flex items-center gap-1"><Database size={10} /> Data Lama (Sebelumnya):</span>
                                {renderJsonPretty(log.old_data)}
                              </div>
                              <div className="space-y-1.5">
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide flex items-center gap-1"><Database size={10} /> Data Baru (Sesudah):</span>
                                {renderJsonPretty(log.new_data)}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}

                {filteredLogs.length === 0 && (
                  <tr>
                    <td colSpan="4" className="py-8 text-center text-slate-400 italic">
                      <div className="flex flex-col items-center justify-center gap-1.5">
                        <AlertCircle size={20} className="text-slate-300" />
                        <span>Log audit kosong atau tidak ditemukan.</span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

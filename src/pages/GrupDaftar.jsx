import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dbService } from '../services/dbService';
import { formatRupiah, formatIndoDate } from '../utils/formatters';
import { useAuth } from '../contexts/AuthContext';
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  Eye, 
  Edit3, 
  Trash2, 
  Plus, 
  FileText, 
  ChevronLeft, 
  ChevronRight,
  Plane,
  AlertCircle
} from 'lucide-react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { GrupLaporanPdf } from '../utils/PdfRenderer';

export default function GrupDaftar() {
  const { user, isReadOnly } = useAuth();
  
  // Database states
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // UI features states
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua');
  const [jamaahPaymentFilter, setJamaahPaymentFilter] = useState('Semua');
  const [sortField, setSortField] = useState('departure_date');
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' or 'desc'
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

  // Load groups with aggregated figures
  const loadGroups = async () => {
    setLoading(true);
    const rawGroups = await dbService.groups.getAll();
    const processed = await Promise.all(
      rawGroups.map(async (g) => {
        // Fetch linked jamaah
        const jamaahList = await dbService.jamaah.getByGroup(g.id);
        
        // Sum members
        let totalPax = 0;
        for (const jam of jamaahList) {
          const members = await dbService.jamaah.getMembers(jam.id);
          totalPax += members.length;
        }

        // Sum billing & outstanding
        const invoices = await dbService.invoices.getByGroup(g.id);
        const totalOmset = invoices.reduce((sum, i) => sum + Number(i.total_amount), 0);
        const totalPiutang = invoices.reduce((sum, i) => sum + Number(i.remaining_amount), 0);

        // Preload complete details for report compiling
        const jamaahWithCounts = await Promise.all(
          jamaahList.map(async (j) => {
            const mems = await dbService.jamaah.getMembers(j.id);
            return {
              ...j,
              membersCount: mems.length
            };
          })
        );

        return {
          ...g,
          paxCount: totalPax,
          omset: totalOmset,
          piutang: totalPiutang,
          rawJamaahList: jamaahWithCounts,
          rawInvoices: invoices
        };
      })
    );
    setGroups(processed);
    setLoading(false);
  };

  useEffect(() => {
    loadGroups();
  }, []);

  // Delete Action
  const handleDelete = async (id, name) => {
    // Rely on framework modal instead of native confirm
    // For local convenience, we implement a simple custom modal or state confirm.
    // Here we'll do state confirmation
    if (window.confirm(`Apakah Anda yakin ingin menghapus Grup Keberangkatan "${name}"? Semua data jamaah dan invoice terkait akan ikut terhapus.`)) {
      await dbService.groups.delete(id, user.id);
      loadGroups();
    }
  };

  // Sort handler
  const handleSort = (field) => {
    const isAsc = sortField === field && sortOrder === 'asc';
    setSortField(field);
    setSortOrder(isAsc ? 'desc' : 'asc');
  };

  // Filtering & Sorting Logic
  const filteredGroups = groups
    .filter(g => {
      const matchSearch = g.group_name.toLowerCase().includes(search.toLowerCase()) || 
                          g.group_code.toLowerCase().includes(search.toLowerCase()) ||
                          g.package_name.toLowerCase().includes(search.toLowerCase());
      const matchFilter = statusFilter === 'Semua' || g.status === statusFilter;
      const matchPaymentFilter = jamaahPaymentFilter === 'Semua' ||
        (jamaahPaymentFilter === 'Lunas' && g.rawJamaahList.every(jam => jam.payment_status === 'Lunas')) ||
        (jamaahPaymentFilter === 'Belum Lunas' && g.rawJamaahList.some(jam => jam.payment_status !== 'Lunas'));
      return matchSearch && matchFilter && matchPaymentFilter;
    })
    .sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (sortField === 'departure_date') {
        valA = new Date(valA);
        valB = new Date(valB);
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

  // Pagination Logic
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredGroups.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(filteredGroups.length / rowsPerPage);

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'Persiapan':
        return 'bg-amber-50 text-amber-600 border border-amber-100';
      case 'Berangkat':
        return 'bg-emerald-50 text-emerald-600 border border-emerald-100';
      case 'Selesai':
        return 'bg-slate-100 text-slate-600 border border-slate-200';
      default:
        return 'bg-slate-50 text-slate-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">Daftar Grup Keberangkatan</h1>
          <p className="text-xs text-slate-500 mt-0.5">Kelola kloter penerbangan, akomodasi hotel, dan status pelunasan jamaah per grup.</p>
        </div>
        
        {!isReadOnly() && (
          <Link
            to="/grup/tambah"
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-md transition-all active:scale-95 shrink-0 justify-center"
          >
            <Plus size={16} />
            <span>Tambah Grup Baru</span>
          </Link>
        )}
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
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            placeholder="Cari kode, nama grup, paket..."
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>

        {/* Filter status */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full md:w-auto justify-end">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 flex items-center gap-1 font-medium"><Filter size={14} /> Status Grup:</span>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white text-slate-700 font-medium"
            >
              <option value="Semua">Semua Status</option>
              <option value="Persiapan">Persiapan</option>
              <option value="Berangkat">Berangkat</option>
              <option value="Selesai">Selesai</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 flex items-center gap-1 font-medium"><Filter size={14} /> Status Pembayaran:</span>
            <select
              value={jamaahPaymentFilter}
              onChange={(e) => { setJamaahPaymentFilter(e.target.value); setCurrentPage(1); }}
              className="border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white text-slate-700 font-medium"
            >
              <option value="Semua">Semua Pembayaran</option>
              <option value="Lunas">Lunas</option>
              <option value="Belum Lunas">Belum Lunas</option>
            </select>
          </div>
        </div>
      </div>

      {/* MODERN DATATABLE */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-premium overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary mx-auto mb-2"></div>
            <p className="text-xs text-slate-400">Memuat data grup keberangkatan...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                  <th className="py-4 px-6 cursor-pointer hover:text-primary transition-colors" onClick={() => handleSort('group_code')}>
                    <div className="flex items-center gap-1">Kode Grup <ArrowUpDown size={12} /></div>
                  </th>
                  <th className="py-4 px-6 cursor-pointer hover:text-primary transition-colors" onClick={() => handleSort('group_name')}>
                    <div className="flex items-center gap-1">Nama Grup & Paket <ArrowUpDown size={12} /></div>
                  </th>
                  <th className="py-4 px-6 cursor-pointer hover:text-primary transition-colors" onClick={() => handleSort('departure_date')}>
                    <div className="flex items-center gap-1">Tanggal Berangkat <ArrowUpDown size={12} /></div>
                  </th>
                  <th className="py-4 px-6 text-center">Jumlah Jamaah</th>
                  <th className="py-4 px-6 text-right">Total Omset</th>
                  <th className="py-4 px-6 text-right">Total Piutang</th>
                  <th className="py-4 px-6 text-center">Status</th>
                  <th className="py-4 px-6 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {currentRows.map((g) => (
                  <tr key={g.id} className="hover:bg-slate-50/50 transition-colors">
                    {/* Code */}
                    <td className="py-4 px-6 font-semibold text-slate-800">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-primary/20 block"></span>
                        {g.group_code}
                      </div>
                    </td>
                    
                    {/* Name & Package */}
                    <td className="py-4 px-6">
                      <div>
                        <span className="font-bold text-slate-800 block text-sm">{g.group_name}</span>
                        <span className="text-[10px] text-slate-400 font-medium block mt-0.5">{g.package_name}</span>
                      </div>
                    </td>

                    {/* Dates */}
                    <td className="py-4 px-6 font-medium text-slate-600">
                      {formatIndoDate(g.departure_date)}
                    </td>

                    {/* Pax Count */}
                    <td className="py-4 px-6 text-center font-bold text-slate-700">
                      {g.paxCount} Pax
                    </td>

                    {/* Total Omset */}
                    <td className="py-4 px-6 text-right font-bold text-slate-800">
                      {formatRupiah(g.omset)}
                    </td>

                    {/* Total Piutang */}
                    <td className="py-4 px-6 text-right font-bold text-primary">
                      {formatRupiah(g.piutang)}
                    </td>

                    {/* Status */}
                    <td className="py-4 px-6 text-center">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${getStatusBadgeColor(g.status)}`}>
                        {g.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center gap-2">
                        {/* Detail */}
                        <Link
                          to={`/grup/detail/${g.id}`}
                          title="Detail Grup"
                          className="p-1.5 hover:bg-slate-100 text-slate-600 hover:text-slate-800 rounded-lg transition-colors"
                        >
                          <Eye size={15} />
                        </Link>
                        
                        {/* Edit */}
                        {!isReadOnly() && (
                          <Link
                            to={`/grup/edit/${g.id}`}
                            title="Edit Grup"
                            className="p-1.5 hover:bg-slate-100 text-slate-600 hover:text-slate-800 rounded-lg transition-colors"
                          >
                            <Edit3 size={15} />
                          </Link>
                        )}

                        {/* Print PDF report */}
                        <PDFDownloadLink
                          document={<GrupLaporanPdf group={g} jamaahList={g.rawJamaahList} invoices={g.rawInvoices} printedBy={user?.name} />}
                          fileName={`Laporan-Grup-${g.group_code}.pdf`}
                          title="Cetak Laporan Keuangan Grup"
                          className="p-1.5 hover:bg-red-50 text-slate-600 hover:text-primary rounded-lg transition-colors"
                        >
                          {({ loading }) => (
                            <FileText size={15} className={loading ? 'animate-pulse text-red-300' : ''} />
                          )}
                        </PDFDownloadLink>

                        {/* Delete */}
                        {!isReadOnly() && (
                          <button
                            onClick={() => handleDelete(g.id, g.group_name)}
                            title="Hapus Grup"
                            className="p-1.5 hover:bg-rose-50 text-rose-500 hover:text-rose-600 rounded-lg transition-colors"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}

                {currentRows.length === 0 && (
                  <tr>
                    <td colSpan="8" className="py-8 text-center text-slate-400 italic">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <AlertCircle size={24} className="text-slate-300" />
                        <span>Grup tidak ditemukan atau daftar kosong.</span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* PAGINATION PANEL */}
        {!loading && filteredGroups.length > rowsPerPage && (
          <div className="bg-slate-50 border-t border-slate-100 px-6 py-4 flex items-center justify-between">
            <span className="text-[11px] text-slate-500 font-medium">
              Menampilkan {indexOfFirstRow + 1} - {Math.min(indexOfLastRow, filteredGroups.length)} dari {filteredGroups.length} grup
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-1.5 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-slate-600"
              >
                <ChevronLeft size={14} />
              </button>
              <span className="text-xs text-slate-600 font-semibold px-2">Halaman {currentPage} dari {totalPages}</span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-1.5 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-slate-600"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

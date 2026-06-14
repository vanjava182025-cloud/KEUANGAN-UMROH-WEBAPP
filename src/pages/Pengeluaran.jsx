import React, { useState, useEffect } from 'react';
import { dbService } from '../services/dbService';
import { formatRupiah, formatIndoDate } from '../utils/formatters';
import { useAuth } from '../contexts/AuthContext';
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  Edit3, 
  Trash2, 
  Plus, 
  AlertCircle,
  TrendingDown,
  Calendar,
  Layers,
  ChevronLeft,
  ChevronRight,
  Save,
  Info
} from 'lucide-react';

export default function Pengeluaran() {
  const { user, isReadOnly } = useAuth();
  
  // Database states
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form Modal States
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  
  // Form input states
  const [expDate, setExpDate] = useState(new Date().toISOString().split('T')[0]);
  const [expCategory, setExpCategory] = useState('Hotel');
  const [expDesc, setExpDesc] = useState('');
  const [expAmount, setExpAmount] = useState('');
  const [expAttachment, setExpAttachment] = useState(null);
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  // Search & Filters states
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Semua');
  const [sortField, setSortField] = useState('expense_date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

  const categories = [
    'Tiket', 'Visa', 'Hotel', 'Transportasi', 
    'Makan', 'Handling', 'Gaji', 'Marketing', 
    'Operasional Kantor', 'Lainnya'
  ];

  // Load expenses
  const loadExpenses = async () => {
    setLoading(true);
    const data = await dbService.expenses.getAll();
    setExpenses(data);
    setLoading(false);
  };

  useEffect(() => {
    loadExpenses();
  }, []);

  // Open modal for Create
  const handleOpenAddModal = () => {
    setSelectedExpense(null);
    setExpDate(new Date().toISOString().split('T')[0]);
    setExpCategory('Hotel');
    setExpDesc('');
    setExpAmount('');
    setExpAttachment(null);
    setFormError('');
    setModalOpen(true);
  };

  // Open modal for Edit
  const handleOpenEditModal = (expense) => {
    setSelectedExpense(expense);
    setExpDate(expense.expense_date);
    setExpCategory(expense.category);
    setExpDesc(expense.description);
    setExpAmount(expense.amount);
    setExpAttachment(null); // Keep original attachment unless replaced
    setFormError('');
    setModalOpen(true);
  };

  // Handle Save
  const handleSave = async (e) => {
    e.preventDefault();
    if (!expDesc.trim()) {
      setFormError('Deskripsi pengeluaran wajib diisi.');
      return;
    }
    if (!expAmount || Number(expAmount) <= 0) {
      setFormError('Nominal pengeluaran harus lebih besar dari 0.');
      return;
    }

    setFormLoading(true);
    try {
      const payload = {
        expense_date: expDate,
        category: expCategory,
        description: expDesc,
        amount: Number(expAmount),
        attachment: expAttachment ? expAttachment.name : (selectedExpense?.attachment || null)
      };

      if (selectedExpense) {
        payload.id = selectedExpense.id;
      }

      await dbService.expenses.save(payload, user.id);
      setModalOpen(false);
      loadExpenses();
    } catch (err) {
      setFormError('Gagal menyimpan data pengeluaran.');
    } finally {
      setFormLoading(false);
    }
  };

  // Handle Delete
  const handleDelete = async (id, desc) => {
    if (window.confirm(`Hapus catatan pengeluaran "${desc}"? Saldo kas akan disesuaikan.`)) {
      await dbService.expenses.delete(id, user.id);
      loadExpenses();
    }
  };

  // Sort handler
  const handleSort = (field) => {
    const isAsc = sortField === field && sortOrder === 'asc';
    setSortField(field);
    setSortOrder(isAsc ? 'desc' : 'asc');
  };

  // Filtering & Sorting
  const filteredExpenses = expenses
    .filter(e => {
      const matchSearch = e.description.toLowerCase().includes(search.toLowerCase()) || 
                          e.category.toLowerCase().includes(search.toLowerCase());
      const matchFilter = categoryFilter === 'Semua' || e.category === categoryFilter;
      return matchSearch && matchFilter;
    })
    .sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (sortField === 'expense_date') {
        valA = new Date(valA);
        valB = new Date(valB);
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

  // Pagination calculations
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredExpenses.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(filteredExpenses.length / rowsPerPage);

  // Stats
  const totalExpenseSum = expenses.reduce((sum, e) => sum + e.amount, 0);
  const maxExpense = expenses.length > 0 ? Math.max(...expenses.map(e => e.amount)) : 0;
  const maxExpenseItem = expenses.find(e => e.amount === maxExpense);

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">Operasional Pengeluaran</h1>
          <p className="text-xs text-slate-500 mt-0.5">Kelola log pengeluaran untuk visa, tiket pesawat, katering, akomodasi hotel, dan komisi marketing.</p>
        </div>

        {!isReadOnly() && (
          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-md transition-all active:scale-95 shrink-0 justify-center"
          >
            <Plus size={16} />
            <span>Catat Pengeluaran</span>
          </button>
        )}
      </div>

      {/* STATS ANALYTICS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-premium flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
            <TrendingDown size={20} />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Total Pengeluaran</span>
            <span className="text-lg font-bold text-slate-800">{formatRupiah(totalExpenseSum)}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-premium flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500">
            <Layers size={20} />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Pos Terbesar</span>
            <span className="text-sm font-bold text-slate-800 truncate max-w-[200px] block">{maxExpenseItem ? `${maxExpenseItem.category} (${formatRupiah(maxExpense)})` : '-'}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-premium flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
            <Calendar size={20} />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Transaksi Terakhir</span>
            <span className="text-xs font-bold text-slate-800 block">{expenses[0] ? `${formatIndoDate(expenses[0].expense_date)} - ${expenses[0].category}` : '-'}</span>
          </div>
        </div>
      </div>

      {/* SEARCH AND FILTERS */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-premium flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
            <Search size={16} />
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            placeholder="Cari deskripsi pengeluaran..."
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-700"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <span className="text-xs text-slate-500 flex items-center gap-1 font-medium"><Filter size={14} /> Kategori:</span>
          <select
            value={categoryFilter}
            onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
            className="border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white text-slate-700 font-medium"
          >
            <option value="Semua">Semua Kategori</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* EXPENSES TABLE */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-premium overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary mx-auto mb-2"></div>
            <p className="text-xs text-slate-400">Memuat data pengeluaran...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                  <th className="py-4 px-6 cursor-pointer hover:text-primary transition-colors" onClick={() => handleSort('expense_date')}>
                    <div className="flex items-center gap-1">Tanggal <ArrowUpDown size={12} /></div>
                  </th>
                  <th className="py-4 px-6 cursor-pointer hover:text-primary transition-colors" onClick={() => handleSort('category')}>
                    <div className="flex items-center gap-1">Kategori <ArrowUpDown size={12} /></div>
                  </th>
                  <th className="py-4 px-6">Deskripsi Keterangan</th>
                  <th className="py-4 px-6 text-right cursor-pointer hover:text-primary transition-colors" onClick={() => handleSort('amount')}>
                    <div className="flex items-center justify-end gap-1">Nominal <ArrowUpDown size={12} /></div>
                  </th>
                  <th className="py-4 px-6 text-center">Lampiran</th>
                  <th className="py-4 px-6 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {currentRows.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6 font-medium text-slate-600">
                      {formatIndoDate(e.expense_date)}
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-block bg-slate-100 border border-slate-200 text-slate-700 px-2 py-0.5 rounded font-bold uppercase text-[9px]">
                        {e.category}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-semibold text-slate-800">
                      {e.description}
                    </td>
                    <td className="py-4 px-6 text-right font-extrabold text-slate-900">
                      {formatRupiah(e.amount)}
                    </td>
                    <td className="py-4 px-6 text-center text-slate-400">
                      {e.attachment ? (
                        <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded font-semibold">
                          {e.attachment}
                        </span>
                      ) : (
                        <span className="italic text-slate-300">-</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {!isReadOnly() && (
                          <button
                            onClick={() => handleOpenEditModal(e)}
                            className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded transition-colors"
                          >
                            <Edit3 size={15} />
                          </button>
                        )}
                        {!isReadOnly() && (
                          <button
                            onClick={() => handleDelete(e.id, e.description)}
                            className="p-1.5 hover:bg-rose-50 text-rose-500 hover:text-rose-600 rounded transition-colors"
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
                    <td colSpan="6" className="py-8 text-center text-slate-400 italic">
                      <div className="flex flex-col items-center justify-center gap-1.5">
                        <AlertCircle size={20} className="text-slate-300" />
                        <span>Data pengeluaran kosong atau tidak ditemukan.</span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* PAGINATION PANEL */}
        {!loading && filteredExpenses.length > rowsPerPage && (
          <div className="bg-slate-50 border-t border-slate-100 px-6 py-4 flex items-center justify-between">
            <span className="text-[11px] text-slate-500 font-medium">
              Menampilkan {indexOfFirstRow + 1} - {Math.min(indexOfLastRow, filteredExpenses.length)} dari {filteredExpenses.length} transaksi
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

      {/* ======================================= */}
      {/* MODAL FORM: CREATE/EDIT EXPENSE        */}
      {/* ======================================= */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl border border-slate-100 shadow-premium-lg overflow-hidden relative">
            <div className="bg-primary text-white p-4">
              <h3 className="font-bold text-sm uppercase tracking-wide">
                {selectedExpense ? 'Ubah Log Pengeluaran' : 'Catat Pengeluaran Baru'}
              </h3>
              <p className="text-[10px] text-red-100">Catat transaksi pengeluaran operasional secara detail.</p>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-4">
              {formError && (
                <div className="p-2.5 bg-red-50 text-primary border-l-4 border-primary text-[10px] rounded font-semibold">
                  {formError}
                </div>
              )}

              {/* Tanggal */}
              <div>
                <label className="block text-[10px] font-semibold text-slate-600 mb-1 uppercase tracking-wide">Tanggal Transaksi *</label>
                <input
                  type="date"
                  value={expDate}
                  onChange={(e) => setExpDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-700"
                  required
                />
              </div>

              {/* Kategori */}
              <div>
                <label className="block text-[10px] font-semibold text-slate-600 mb-1 uppercase tracking-wide">Kategori Pengeluaran *</label>
                <select
                  value={expCategory}
                  onChange={(e) => setExpCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white text-slate-700 font-medium"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Deskripsi */}
              <div>
                <label className="block text-[10px] font-semibold text-slate-600 mb-1 uppercase tracking-wide">Deskripsi Pengeluaran *</label>
                <input
                  type="text"
                  value={expDesc}
                  onChange={(e) => setExpDesc(e.target.value)}
                  placeholder="Contoh: Booking Hotel Zamzam, Sewa Bus Madinah..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-700 font-medium"
                  required
                />
              </div>

              {/* Nominal */}
              <div>
                <label className="block text-[10px] font-semibold text-slate-600 mb-1 uppercase tracking-wide">Nominal Pengeluaran (Rp) *</label>
                <input
                  type="number"
                  value={expAmount}
                  onChange={(e) => setExpAmount(e.target.value)}
                  placeholder="Contoh: 15000000"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-700 font-bold"
                  required
                />
              </div>

              {/* Lampiran Bukti */}
              <div>
                <label className="block text-[10px] font-semibold text-slate-600 mb-1 uppercase tracking-wide">Upload Nota / Kuitansi Bukti</label>
                <input
                  type="file"
                  onChange={(e) => setExpAttachment(e.target.files[0])}
                  className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer"
                />
              </div>

              {/* Action buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-4 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-semibold rounded-xl transition-all shadow-md active:scale-95"
                >
                  {formLoading ? 'Menyimpan...' : 'Simpan Transaksi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

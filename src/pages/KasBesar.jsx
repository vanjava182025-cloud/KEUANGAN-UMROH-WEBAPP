import React, { useState, useEffect } from 'react';
import { dbService } from '../services/dbService';
import { formatRupiah, formatIndoDate } from '../utils/formatters';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Search, 
  Filter, 
  Calendar,
  AlertCircle,
  Wallet,
  ArrowUpDown
} from 'lucide-react';

export default function KasBesar() {
  const [ledger, setLedger] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Stats
  const [totals, setTotals] = useState({
    cashIn: 0,
    cashOut: 0,
    balance: 0
  });

  // Filter States
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('Semua'); // 'Semua', 'Kas Masuk', 'Kas Keluar'
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const loadLedgerData = async () => {
    setLoading(true);
    
    // Fetch payments (Kas Masuk)
    const payments = await dbService.payments.getAll();
    const paymentsMapped = payments.map(p => ({
      id: p.id,
      date: p.payment_date,
      type: 'Kas Masuk',
      category: p.payment_method,
      description: `Pembayaran: ${p.description} (Pengirim: ${p.sender_name})`,
      amount: p.amount,
      reference: p.payment_number
    }));

    // Fetch expenses (Kas Keluar)
    const expenses = await dbService.expenses.getAll();
    const expensesMapped = expenses.map(e => ({
      id: e.id,
      date: e.expense_date,
      type: 'Kas Keluar',
      category: e.category,
      description: `Operasional: ${e.description}`,
      amount: e.amount,
      reference: `EXP-${e.id.substring(4, 8).toUpperCase()}`
    }));

    // Combine and sort chronologically (newest first)
    const combined = [...paymentsMapped, ...expensesMapped].sort((a, b) => new Date(b.date) - new Date(a.date));
    setLedger(combined);

    // Calculate totals
    const cashIn = payments.reduce((sum, p) => sum + Number(p.amount), 0);
    const cashOut = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
    setTotals({
      cashIn,
      cashOut,
      balance: cashIn - cashOut
    });

    setLoading(false);
  };

  useEffect(() => {
    loadLedgerData();
  }, []);

  // Filter entries
  const filteredLedger = ledger.filter(item => {
    const matchSearch = item.description.toLowerCase().includes(search.toLowerCase()) ||
                        item.reference.toLowerCase().includes(search.toLowerCase()) ||
                        item.category.toLowerCase().includes(search.toLowerCase());
    
    const matchType = typeFilter === 'Semua' || item.type === typeFilter;
    
    const matchStart = !startDate || new Date(item.date) >= new Date(startDate);
    const matchEnd = !endDate || new Date(item.date) <= new Date(endDate);

    return matchSearch && matchType && matchStart && matchEnd;
  });

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-800">Buku Kas Besar</h1>
        <p className="text-xs text-slate-500 mt-0.5">Buku jurnal keuangan konsolidasi dari seluruh penerimaan pembayaran jamaah (Masuk) dan pengeluaran operasional (Keluar).</p>
      </div>

      {/* STATS ROW */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Kas Masuk */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-premium hover-scale-soft transition-all-custom flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Total Kas Masuk</span>
            <span className="text-xl font-bold text-emerald-600 block">{formatRupiah(totals.cashIn)}</span>
            <span className="text-[9px] text-slate-400 block font-medium">Dari pembayaran kwitansi jamaah</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <ArrowUpRight size={20} />
          </div>
        </div>

        {/* Kas Keluar */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-premium hover-scale-soft transition-all-custom flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Total Kas Keluar</span>
            <span className="text-xl font-bold text-rose-600 block">{formatRupiah(totals.cashOut)}</span>
            <span className="text-[9px] text-slate-400 block font-medium">Dari log pengeluaran operasional</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
            <ArrowDownRight size={20} />
          </div>
        </div>

        {/* Saldo Akhir */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-premium hover-scale-soft transition-all-custom flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Saldo Kas Akhir</span>
            <span className="text-xl font-bold text-slate-800 block">{formatRupiah(totals.balance)}</span>
            <span className="text-[9px] text-slate-400 block font-medium">Likuiditas kas terbebas saat ini</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
            <Wallet size={20} />
          </div>
        </div>
      </div>

      {/* SEARCH AND FILTERS */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-premium flex flex-col gap-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Search */}
          <div className="relative w-full md:w-80">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
              <Search size={16} />
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari deskripsi, referensi, kategori..."
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-700"
            />
          </div>

          {/* Filters type */}
          <div className="flex items-center gap-4 w-full md:w-auto justify-end">
            <div className="flex items-center gap-1 text-xs text-slate-500 font-medium">
              <Filter size={14} /> Jenis:
            </div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white text-slate-700 font-medium"
            >
              <option value="Semua">Semua Arus</option>
              <option value="Kas Masuk">Kas Masuk (Inflow)</option>
              <option value="Kas Keluar">Kas Keluar (Outflow)</option>
            </select>
          </div>
        </div>

        {/* Date Filters Row */}
        <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-100/60">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <Calendar size={14} /> Rentang Tanggal:
          </div>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border border-slate-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white text-slate-700 font-medium"
            />
            <span className="text-slate-400 text-xs font-semibold">s/d</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border border-slate-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white text-slate-700 font-medium"
            />
          </div>
          {(startDate || endDate) && (
            <button
              onClick={() => { setStartDate(''); setEndDate(''); }}
              className="text-[10px] font-bold text-primary bg-red-50 hover:bg-red-100 px-2 py-1 rounded-lg transition-all"
            >
              Reset Tanggal
            </button>
          )}
        </div>
      </div>

      {/* LEDGER REGISTER TABLE */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-premium overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary mx-auto mb-2"></div>
            <p className="text-xs text-slate-400">Menyusun buku kas...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                  <th className="py-4 px-6">Tanggal</th>
                  <th className="py-4 px-6">Referensi No</th>
                  <th className="py-4 px-6 text-center">Jenis</th>
                  <th className="py-4 px-6">Pos Kategori</th>
                  <th className="py-4 px-6">Deskripsi Keterangan</th>
                  <th className="py-4 px-6 text-right">Debit / Kredit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredLedger.map((item, idx) => {
                  const isIncoming = item.type === 'Kas Masuk';
                  return (
                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                      {/* Date */}
                      <td className="py-4 px-6 font-medium text-slate-600">
                        {formatIndoDate(item.date)}
                      </td>
                      
                      {/* Reference code */}
                      <td className="py-4 px-6 font-bold text-slate-800">
                        {item.reference}
                      </td>

                      {/* Type Inflow/Outflow */}
                      <td className="py-4 px-6 text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                          isIncoming 
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                            : 'bg-rose-50 text-rose-600 border border-rose-100'
                        }`}>
                          <span className={`w-1 h-1 rounded-full ${isIncoming ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                          {isIncoming ? 'Masuk' : 'Keluar'}
                        </span>
                      </td>

                      {/* Category */}
                      <td className="py-4 px-6">
                        <span className="bg-slate-100 border border-slate-200 text-slate-600 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                          {item.category}
                        </span>
                      </td>

                      {/* Description */}
                      <td className="py-4 px-6 font-semibold text-slate-700">
                        {item.description}
                      </td>

                      {/* Amount In/Out */}
                      <td className={`py-4 px-6 text-right font-extrabold text-sm ${
                        isIncoming ? 'text-emerald-600' : 'text-rose-600'
                      }`}>
                        {isIncoming ? '+' : '-'} {formatRupiah(item.amount)}
                      </td>
                    </tr>
                  );
                })}

                {filteredLedger.length === 0 && (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-slate-400 italic">
                      <div className="flex flex-col items-center justify-center gap-1.5">
                        <AlertCircle size={20} className="text-slate-300" />
                        <span>Log buku kas kosong.</span>
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

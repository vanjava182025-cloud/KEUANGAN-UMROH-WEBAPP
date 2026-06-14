import React, { useState, useEffect } from 'react';
import { dbService } from '../services/dbService';
import { formatRupiah, formatIndoDate } from '../utils/formatters';
import { 
  FileText, 
  Search, 
  Filter, 
  Printer, 
  Calendar,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  AlertCircle,
  FileSpreadsheet
} from 'lucide-react';

export default function Laporan() {
  // Database states
  const [groups, setGroups] = useState([]);
  const [payments, setPayments] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [jamaahList, setJamaahList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [reportType, setReportType] = useState('Kas'); // 'Pemasukan', 'Pengeluaran', 'Kas', 'Piutang', 'Lunas', 'Belum Lunas'
  const [filterMonth, setFilterMonth] = useState('Semua');
  const [filterYear, setFilterYear] = useState('2026');
  const [filterGroup, setFilterGroup] = useState('Semua');
  const [filterPackage, setFilterPackage] = useState('Semua');

  // Report results state
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState({
    totalCount: 0,
    totalSum: 0
  });

  const months = [
    { num: '01', name: 'Januari' },
    { num: '02', name: 'Februari' },
    { num: '03', name: 'Maret' },
    { num: '04', name: 'April' },
    { num: '05', name: 'Mei' },
    { num: '06', name: 'Juni' },
    { num: '07', name: 'Juli' },
    { num: '08', name: 'Agustus' },
    { num: '09', name: 'September' },
    { num: '10', name: 'Oktober' },
    { num: '11', name: 'November' },
    { num: '12', name: 'Desember' }
  ];

  const packages = [
    'Paket Silver 9 Hari',
    'Paket Gold 12 Hari',
    'Paket Haji Furoda Gold'
  ];

  const loadReportData = async () => {
    setLoading(true);
    const grps = await dbService.groups.getAll();
    setGroups(grps);
    
    const pays = await dbService.payments.getAll();
    setPayments(pays);

    const exps = await dbService.expenses.getAll();
    setExpenses(exps);

    const invs = await dbService.invoices.getAll();
    setInvoices(invs);

    const jams = await dbService.jamaah.getAll();
    setJamaahList(jams);

    setLoading(false);
  };

  useEffect(() => {
    loadReportData();
  }, []);

  // Generate Report records based on filters
  useEffect(() => {
    if (loading) return;

    let results = [];
    let sum = 0;

    const matchesMonth = (dateStr) => {
      if (filterMonth === 'Semua') return true;
      const month = dateStr.split('-')[1]; // YYYY-MM-DD
      return month === filterMonth;
    };

    const matchesYear = (dateStr) => {
      if (filterYear === 'Semua') return true;
      const year = dateStr.split('-')[0];
      return year === filterYear;
    };

    const matchesGroup = (groupId) => {
      if (filterGroup === 'Semua') return true;
      return groupId === filterGroup;
    };

    // Filter logic per category
    if (reportType === 'Pemasukan') {
      // Maps payments received
      results = payments.filter(p => {
        const inv = invoices.find(i => i.id === p.invoice_id);
        const matchM = matchesMonth(p.payment_date);
        const matchY = matchesYear(p.payment_date);
        const matchG = matchesGroup(inv?.group_id);
        
        // Find group package details
        const grp = groups.find(g => g.id === inv?.group_id);
        const matchP = filterPackage === 'Semua' || grp?.package_name === filterPackage;

        return matchM && matchY && matchG && matchP;
      }).map(p => {
        const inv = invoices.find(i => i.id === p.invoice_id);
        const grp = groups.find(g => g.id === inv?.group_id);
        return {
          date: p.payment_date,
          reference: p.payment_number,
          description: `Pembayaran: ${p.description} (Penyetor: ${p.sender_name})`,
          group: grp?.group_name || 'N/A',
          amount: p.amount
        };
      });
      sum = results.reduce((acc, r) => acc + r.amount, 0);

    } else if (reportType === 'Pengeluaran') {
      // Maps expenses recorded
      results = expenses.filter(e => {
        const matchM = matchesMonth(e.expense_date);
        const matchY = matchesYear(e.expense_date);
        // Note: expenses are general operational, group check is skipped unless general
        const matchP = filterPackage === 'Semua' || e.description.includes(filterPackage) || e.category.includes(filterPackage);
        return matchM && matchY && matchP;
      }).map(e => ({
        date: e.expense_date,
        reference: `EXP-${e.id.substring(4,8).toUpperCase()}`,
        description: `[${e.category}] ${e.description}`,
        group: 'Operasional Kantor',
        amount: e.amount
      }));
      sum = results.reduce((acc, r) => acc + r.amount, 0);

    } else if (reportType === 'Kas') {
      // Cash ledger records combined
      const cashIn = payments.filter(p => {
        const inv = invoices.find(i => i.id === p.invoice_id);
        const grp = groups.find(g => g.id === inv?.group_id);
        return matchesMonth(p.payment_date) && matchesYear(p.payment_date) && matchesGroup(inv?.group_id) && (filterPackage === 'Semua' || grp?.package_name === filterPackage);
      }).map(p => {
        const inv = invoices.find(i => i.id === p.invoice_id);
        const grp = groups.find(g => g.id === inv?.group_id);
        return {
          date: p.payment_date,
          reference: p.payment_number,
          description: `[Masuk] Penyetor: ${p.sender_name} - ${p.description}`,
          group: grp?.group_name || 'N/A',
          amount: p.amount,
          type: 'in'
        };
      });

      const cashOut = expenses.filter(e => {
        return matchesMonth(e.expense_date) && matchesYear(e.expense_date);
      }).map(e => ({
        date: e.expense_date,
        reference: `EXP-${e.id.substring(4,8).toUpperCase()}`,
        description: `[Keluar] ${e.category} - ${e.description}`,
        group: 'Operasional Kantor',
        amount: e.amount,
        type: 'out'
      }));

      results = [...cashIn, ...cashOut].sort((a, b) => new Date(a.date) - new Date(b.date));
      sum = cashIn.reduce((acc, r) => acc + r.amount, 0) - cashOut.reduce((acc, r) => acc + r.amount, 0);

    } else if (reportType === 'Piutang') {
      // Outstanding invoices
      results = invoices.filter(inv => {
        const jam = jamaahList.find(j => j.id === inv.jamaah_id);
        const grp = groups.find(g => g.id === inv.group_id);
        
        const matchM = matchesMonth(inv.invoice_date);
        const matchY = matchesYear(inv.invoice_date);
        const matchG = matchesGroup(inv.group_id);
        const matchP = filterPackage === 'Semua' || grp?.package_name === filterPackage;

        return inv.remaining_amount > 0 && matchM && matchY && matchG && matchP;
      }).map(inv => {
        const jam = jamaahList.find(j => j.id === inv.jamaah_id);
        const grp = groups.find(g => g.id === inv.group_id);
        return {
          date: inv.invoice_date,
          reference: inv.invoice_number,
          description: `Tagihan PJ: ${jam?.person_in_charge} (Kontak: ${jam?.phone})`,
          group: grp?.group_name || 'N/A',
          amount: inv.remaining_amount
        };
      });
      sum = results.reduce((acc, r) => acc + r.amount, 0);

    } else if (reportType === 'Lunas' || reportType === 'Belum Lunas') {
      // Filter Jamaah by status lunas / outstanding
      const targetStatus = reportType === 'Lunas' ? 'Lunas' : 'Belum Lunas';
      
      results = jamaahList.filter(jam => {
        const grp = groups.find(g => g.id === jam.group_id);
        const inv = invoices.find(i => i.jamaah_id === jam.id);
        
        const matchesStatus = targetStatus === 'Lunas' 
          ? jam.payment_status === 'Lunas' 
          : jam.payment_status !== 'Lunas';
          
        const matchG = matchesGroup(jam.group_id);
        const matchP = filterPackage === 'Semua' || grp?.package_name === filterPackage;
        const matchM = matchesMonth(jam.created_at.substring(0, 10));
        const matchY = matchesYear(jam.created_at.substring(0, 10));

        return matchesStatus && matchG && matchP && matchM && matchY;
      }).map(jam => {
        const grp = groups.find(g => g.id === jam.group_id);
        return {
          date: jam.created_at.substring(0, 10),
          reference: `JAM-${jam.id.substring(4,8).toUpperCase()}`,
          description: `PJ: ${jam.person_in_charge} (Status: ${jam.payment_status})`,
          group: grp?.group_name || 'N/A',
          amount: jam.remaining_bill
        };
      });
      sum = results.length; // count of records instead of cash
    }

    setRecords(results);
    setSummary({
      totalCount: results.length,
      totalSum: sum
    });
  }, [reportType, filterMonth, filterYear, filterGroup, filterPackage, loading]);

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="space-y-6 print:p-0 print:bg-white">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">Konsolidasi Laporan Keuangan</h1>
          <p className="text-xs text-slate-500 mt-0.5">Saring parameter laporan berdasarkan periode akuntansi dan ekspor ke lembar kerja cetak.</p>
        </div>

        <button
          onClick={handlePrintReport}
          className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-md transition-all active:scale-95 shrink-0 justify-center"
        >
          <Printer size={16} />
          <span>Cetak Laporan</span>
        </button>
      </div>

      {/* FILTER CONTROL CARD */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-premium space-y-4 print:hidden">
        <div className="flex items-center gap-2 text-primary border-b border-slate-100 pb-2 mb-2">
          <Filter size={16} />
          <h3 className="text-xs font-bold uppercase tracking-wider">Parameter Saringan Laporan</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* 1. Category */}
          <div>
            <label className="block text-[10px] font-semibold text-slate-500 mb-1 uppercase tracking-wide">Kategori Laporan</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white text-slate-700 font-semibold"
            >
              <option value="Kas">Laporan Kas (Arus Jurnal)</option>
              <option value="Pemasukan">Laporan Pemasukan</option>
              <option value="Pengeluaran">Laporan Pengeluaran</option>
              <option value="Piutang">Laporan Piutang</option>
              <option value="Lunas">Jamaah Lunas</option>
              <option value="Belum Lunas">Jamaah Belum Lunas</option>
            </select>
          </div>

          {/* 2. Month */}
          <div>
            <label className="block text-[10px] font-semibold text-slate-500 mb-1 uppercase tracking-wide">Bulan</label>
            <select
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white text-slate-700 font-semibold"
            >
              <option value="Semua">Semua Bulan</option>
              {months.map((m) => (
                <option key={m.num} value={m.num}>{m.name}</option>
              ))}
            </select>
          </div>

          {/* 3. Year */}
          <div>
            <label className="block text-[10px] font-semibold text-slate-500 mb-1 uppercase tracking-wide">Tahun</label>
            <select
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white text-slate-700 font-semibold"
            >
              <option value="2026">2026</option>
              <option value="2025">2025</option>
              <option value="2027">2027</option>
              <option value="Semua">Semua Tahun</option>
            </select>
          </div>

          {/* 4. Group */}
          <div>
            <label className="block text-[10px] font-semibold text-slate-500 mb-1 uppercase tracking-wide">Grup Keberangkatan</label>
            <select
              value={filterGroup}
              onChange={(e) => setFilterGroup(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white text-slate-700 font-semibold"
            >
              <option value="Semua">Semua Grup</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>{g.group_code} - {g.group_name}</option>
              ))}
            </select>
          </div>

          {/* 5. Package */}
          <div>
            <label className="block text-[10px] font-semibold text-slate-500 mb-1 uppercase tracking-wide">Nama Paket</label>
            <select
              value={filterPackage}
              onChange={(e) => setFilterPackage(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white text-slate-700 font-semibold"
            >
              <option value="Semua">Semua Paket</option>
              {packages.map((pkg) => (
                <option key={pkg} value={pkg}>{pkg}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* REPORT PRINT HEADER FOR WINDOW PRINT */}
      <div className="hidden print:block text-center border-b-2 border-primary pb-4 mb-6">
        <h1 className="text-xl font-bold font-serif text-slate-800">ELHAKIM UMROH HAJI TULUNGAGUNG</h1>
        <p className="text-xs text-slate-500">Elhakim Umroh Haji Tulungagung | Telp: 0851-4100-9634</p>
        <p className="text-xs text-slate-500">Jalan Kesehatan No. 10, Tulungagung</p>
        <h2 className="text-sm font-bold uppercase tracking-wider mt-4">
          LAPORAN KEUANGAN KONSOLIDASI: {reportType}
        </h2>
        <p className="text-[10px] text-slate-400">
          Parameter Filter: Bulan ({filterMonth !== 'Semua' ? months.find(m=>m.num===filterMonth)?.name : 'Semua'}), Tahun ({filterYear}), Grup ({filterGroup !== 'Semua' ? groups.find(g=>g.id===filterGroup)?.group_code : 'Semua'})
        </p>
      </div>

      {/* SUMMARY PANEL WIDGET */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-premium flex items-center justify-between">
        <div>
          <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Ringkasan Saringan Laporan</span>
          <span className="text-slate-500 text-xs font-semibold mt-0.5">Ditemukan {summary.totalCount} baris rekonsiliasi data.</span>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">
            {['Lunas', 'Belum Lunas'].includes(reportType) ? 'Jumlah Rekod' : 'Total Akumulasi'}
          </span>
          <span className="text-xl font-extrabold text-primary">
            {['Lunas', 'Belum Lunas'].includes(reportType) 
              ? `${summary.totalSum} Transaksi` 
              : formatRupiah(summary.totalSum)}
          </span>
        </div>
      </div>

      {/* LEDGER SPREADSHEET TABLE */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-premium overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary mx-auto mb-2"></div>
            <p className="text-xs text-slate-400">Mengkonsolidasi baris data laporan...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                  <th className="py-4 px-6 w-1/6">Tanggal</th>
                  <th className="py-4 px-6 w-1/6">No Referensi</th>
                  <th className="py-4 px-6 w-1/3">Deskripsi Rincian</th>
                  <th className="py-4 px-6 w-1/4">Grup / Sektor</th>
                  <th className="py-4 px-6 text-right w-1/6">Nominal / Saldo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {records.map((r, idx) => {
                  const isNegative = r.type === 'out';
                  return (
                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-6 font-medium text-slate-600">
                        {formatIndoDate(r.date)}
                      </td>
                      <td className="py-4 px-6 font-bold text-slate-800">
                        {r.reference}
                      </td>
                      <td className="py-4 px-6 font-semibold text-slate-700">
                        {r.description}
                      </td>
                      <td className="py-4 px-6 font-medium text-slate-500">
                        {r.group}
                      </td>
                      <td className={`py-4 px-6 text-right font-extrabold ${
                        ['Lunas', 'Belum Lunas'].includes(reportType) 
                          ? 'text-slate-800' 
                          : (isNegative ? 'text-rose-600' : 'text-emerald-600')
                      }`}>
                        {['Lunas', 'Belum Lunas'].includes(reportType)
                          ? '-'
                          : `${isNegative ? '-' : ''} ${formatRupiah(r.amount)}`}
                      </td>
                    </tr>
                  );
                })}

                {records.length === 0 && (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-slate-400 italic">
                      <div className="flex flex-col items-center justify-center gap-1.5">
                        <AlertCircle size={20} className="text-slate-300" />
                        <span>Tidak ada catatan transaksi untuk parameter filter yang dipilih.</span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* FOOTER STATEMENT ON PRINT */}
      <div className="hidden print:flex justify-between items-center mt-12 pt-6 border-t border-slate-200 text-[10px] text-slate-500">
        <span>Sistem Keuangan Elhakim Umroh Haji - Rekapitulasi Otomatis</span>
        <span>Tanggal Cetak: {new Date().toLocaleString('id-ID')}</span>
      </div>
    </div>
  );
}

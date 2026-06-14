import React, { useState, useEffect } from 'react';
import { dbService } from '../services/dbService';
import { formatRupiah, formatIndoDate } from '../utils/formatters';
import { useAuth } from '../contexts/AuthContext';
import { 
  Calendar,
  Copy,
  Check,
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
  DollarSign,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

export default function LaporanHarian() {
  const { user } = useAuth();

  // Database states
  const [payments, setPayments] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [startDate, setStartDate] = useState(() => {
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), 1);
    return start.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  // Copy to clipboard state
  const [copiedText, setCopiedText] = useState('');

  // Load data
  const loadData = async () => {
    setLoading(true);
    const allPayments = await dbService.payments.getAll();
    const allExpenses = await dbService.expenses.getAll();
    setPayments(allPayments);
    setExpenses(allExpenses);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Get daily summary data
  const getDailySummary = () => {
    const dailyMap = {}; // key: YYYY-MM-DD

    // Add payments (income)
    payments.forEach(p => {
      const date = p.payment_date.split('T')[0];
      if (date >= startDate && date <= endDate) {
        if (!dailyMap[date]) {
          dailyMap[date] = { income: 0, expenses: 0, details: { income: [], expenses: [] } };
        }
        dailyMap[date].income += Number(p.amount || 0);
        dailyMap[date].details.income.push({
          type: 'payment',
          amount: Number(p.amount || 0),
          description: `Pembayaran dari ${p.sender_name} (${p.payment_method}) - ${p.description}`,
          paymentNumber: p.payment_number
        });
      }
    });

    // Add expenses
    expenses.forEach(e => {
      const date = e.expense_date.split('T')[0];
      if (date >= startDate && date <= endDate) {
        if (!dailyMap[date]) {
          dailyMap[date] = { income: 0, expenses: 0, details: { income: [], expenses: [] } };
        }
        dailyMap[date].expenses += Number(e.amount || 0);
        dailyMap[date].details.expenses.push({
          type: 'expense',
          amount: Number(e.amount || 0),
          description: `[${e.category}] ${e.description}`,
          category: e.category
        });
      }
    });

    // Sort by date descending
    const sorted = Object.entries(dailyMap)
      .sort(([dateA], [dateB]) => dateB.localeCompare(dateA))
      .map(([date, data]) => ({
        date,
        ...data,
        net: data.income - data.expenses
      }));

    return sorted;
  };

  // Generate copyable report text
  const generateReportText = (dailyData) => {
    let report = `LAPORAN HARIAN KEUANGAN\n`;
    report += `===========================\n`;
    report += `Periode: ${formatIndoDate(startDate)} s/d ${formatIndoDate(endDate)}\n`;
    report += `Dicetak oleh: ${user?.name || 'Admin'}\n`;
    report += `Tanggal cetak: ${new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}\n\n`;

    let totalIncome = 0;
    let totalExpense = 0;

    dailyData.forEach(day => {
      totalIncome += day.income;
      totalExpense += day.expenses;

      report += `📅 ${formatIndoDate(day.date)}\n`;
      report += `─────────────────────────────────────────\n`;

      // Income detail
      if (day.details.income.length > 0) {
        report += `💰 PEMASUKAN: ${formatRupiah(day.income)}\n`;
        day.details.income.forEach(item => {
          report += `   ✓ ${item.description}: ${formatRupiah(item.amount)}\n`;
        });
      } else {
        report += `💰 PEMASUKAN: Rp 0\n`;
      }

      report += `\n`;

      // Expense detail
      if (day.details.expenses.length > 0) {
        report += `💸 PENGELUARAN: ${formatRupiah(day.expenses)}\n`;
        day.details.expenses.forEach(item => {
          report += `   ✗ ${item.description}: ${formatRupiah(item.amount)}\n`;
        });
      } else {
        report += `💸 PENGELUARAN: Rp 0\n`;
      }

      report += `\n`;

      // Daily net
      const netAmount = day.income - day.expenses;
      const icon = netAmount >= 0 ? '✓' : '✗';
      report += `${icon} NET: ${formatRupiah(netAmount)}\n\n`;
    });

    // Total summary
    report += `\n${'═'.repeat(45)}\n`;
    report += `RINGKASAN PERIODE\n`;
    report += `${'═'.repeat(45)}\n`;
    report += `Total Pemasukan  : ${formatRupiah(totalIncome)}\n`;
    report += `Total Pengeluaran: ${formatRupiah(totalExpense)}\n`;
    report += `─────────────────────────────────────────\n`;
    report += `Net Kas          : ${formatRupiah(totalIncome - totalExpense)}\n`;

    return report;
  };

  const dailyData = getDailySummary();
  const reportText = generateReportText(dailyData);

  const handleCopyReport = () => {
    navigator.clipboard.writeText(reportText);
    setCopiedText(reportText.substring(0, 30));
    setTimeout(() => setCopiedText(''), 2000);
  };

  // Calculate totals
  const totalIncome = dailyData.reduce((sum, day) => sum + day.income, 0);
  const totalExpense = dailyData.reduce((sum, day) => sum + day.expenses, 0);
  const totalNet = totalIncome - totalExpense;

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary mx-auto mb-2"></div>
        <p className="text-xs text-slate-400">Memuat laporan harian...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg md:rounded-2xl border border-slate-100 shadow-premium p-4 md:p-6">
        <div className="flex items-start md:items-center justify-between gap-4 mb-4">
          <div className="flex-1">
            <h1 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight">Laporan Harian</h1>
            <p className="text-xs md:text-sm text-slate-500 mt-1">Ringkasan pemasukan dan pengeluaran harian</p>
          </div>
          <div className="p-2 md:p-3 bg-blue-50 rounded-lg md:rounded-xl flex-shrink-0">
            <DollarSign size={18} className="md:w-6 md:h-6 text-blue-600" />
          </div>
        </div>

        {/* Date Range Selector */}
        <div className="flex flex-col gap-3 md:gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">
                Dari Tanggal
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">
                Sampai Tanggal
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>

          <button
            onClick={loadData}
            className="w-full sm:w-auto px-4 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-semibold rounded-xl transition-all"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        <div className="bg-white rounded-lg md:rounded-2xl border border-slate-100 shadow-premium p-4 md:p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Total Pemasukan</span>
            <div className="p-2 bg-emerald-50 rounded-lg">
              <ArrowUpRight size={14} className="md:w-4 md:h-4 text-emerald-600" />
            </div>
          </div>
          <p className="text-lg md:text-2xl font-bold text-emerald-600">{formatRupiah(totalIncome)}</p>
          <p className="text-[10px] text-slate-400">Dari {dailyData.filter(d => d.income > 0).length} hari</p>
        </div>

        <div className="bg-white rounded-lg md:rounded-2xl border border-slate-100 shadow-premium p-4 md:p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Total Pengeluaran</span>
            <div className="p-2 bg-red-50 rounded-lg">
              <ArrowDownRight size={14} className="md:w-4 md:h-4 text-red-600" />
            </div>
          </div>
          <p className="text-lg md:text-2xl font-bold text-red-600">{formatRupiah(totalExpense)}</p>
          <p className="text-[10px] text-slate-400">Dari {dailyData.filter(d => d.expenses > 0).length} hari</p>
        </div>

        <div className={`bg-white rounded-lg md:rounded-2xl border border-slate-100 shadow-premium p-4 md:p-5 space-y-2 sm:col-span-2 lg:col-span-1 ${totalNet >= 0 ? 'border-emerald-100' : 'border-red-100'}`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Net Kas</span>
            <div className={`p-2 rounded-lg ${totalNet >= 0 ? 'bg-emerald-50' : 'bg-red-50'}`}>
              <TrendingUp size={14} className={`md:w-4 md:h-4 ${totalNet >= 0 ? 'text-emerald-600' : 'text-red-600'}`} />
            </div>
          </div>
          <p className={`text-lg md:text-2xl font-bold ${totalNet >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {formatRupiah(totalNet)}
          </p>
          <p className="text-[10px] text-slate-400">Saldo kas periode ini</p>
        </div>
      </div>

      {/* Daily Detail Table */}
      <div className="bg-white rounded-lg md:rounded-2xl border border-slate-100 shadow-premium overflow-hidden">
        <div className="p-4 md:p-5 border-b border-slate-100">
          <h2 className="text-xs md:text-sm font-bold text-slate-800 uppercase tracking-wide">Detail Harian</h2>
        </div>

        {dailyData.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-[10px] md:text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-3 md:px-4 py-2 md:py-3 text-left font-semibold text-slate-600 uppercase tracking-wider">Tanggal</th>
                  <th className="px-3 md:px-4 py-2 md:py-3 text-right font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap">Pemasukan</th>
                  <th className="px-3 md:px-4 py-2 md:py-3 text-right font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap">Pengeluaran</th>
                  <th className="px-3 md:px-4 py-2 md:py-3 text-right font-semibold text-slate-600 uppercase tracking-wider">Net</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {dailyData.map((day, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-3 md:px-4 py-2 md:py-3 font-semibold text-slate-800">{formatIndoDate(day.date)}</td>
                    <td className="px-3 md:px-4 py-2 md:py-3 text-right">
                      {day.income > 0 ? (
                        <span className="font-semibold text-emerald-600">{formatRupiah(day.income)}</span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="px-3 md:px-4 py-2 md:py-3 text-right">
                      {day.expenses > 0 ? (
                        <span className="font-semibold text-red-600">{formatRupiah(day.expenses)}</span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="px-3 md:px-4 py-2 md:py-3 text-right">
                      <span className={`font-bold ${day.net >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {formatRupiah(day.net)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 md:p-8 text-center">
            <AlertCircle size={32} className="mx-auto text-slate-300 mb-2" />
            <p className="text-xs md:text-sm text-slate-500">Tidak ada data untuk periode yang dipilih</p>
          </div>
        )}
      </div>

      {/* Copyable Report */}
      <div className="bg-white rounded-lg md:rounded-2xl border border-slate-100 shadow-premium p-4 md:p-6 space-y-3 md:space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <h2 className="text-xs md:text-sm font-bold text-slate-800 uppercase tracking-wide">Laporan Teks (Copyable)</h2>
          <button
            onClick={handleCopyReport}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 font-semibold text-xs rounded-lg transition-colors"
          >
            {copiedText ? (
              <>
                <Check size={14} />
                <span>Tersalin!</span>
              </>
            ) : (
              <>
                <Copy size={14} />
                <span>Salin Semua</span>
              </>
            )}
          </button>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 md:p-4 overflow-auto max-h-64 md:max-h-96">
          <pre className="text-[10px] md:text-[11px] text-slate-700 font-mono whitespace-pre-wrap break-words">
            {reportText}
          </pre>
        </div>

        <p className="text-xs text-slate-500 text-center">
          Anda dapat mengcopy laporan ini dan paste ke aplikasi lain seperti Whatsapp atau Telegram
        </p>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { dbService } from '../services/dbService';
import { formatRupiah, formatIndoDate } from '../utils/formatters';
import { useAuth } from '../contexts/AuthContext';
import { CurrencyInput } from '../components/CurrencyInput';
import {
  ArrowLeft,
  Users,
  CheckCircle2,
  XCircle,
  TrendingUp,
  FileText,
  DollarSign,
  Plus,
  Eye,
  Trash2,
  Edit3,
  Calendar,
  Plane,
  Building,
  CreditCard,
  History,
  AlertCircle,
  Printer,
  ChevronRight,
  Info,
  Phone,
  MessageCircle,
  Search,
  Filter,
  ChevronLeft,
  Download,
  Copy
} from 'lucide-react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { InvoicePdf, KwitansiPdf, GrupLaporanPdf, ReceiptPdf, MultiReceiptPdf } from '../utils/PdfRenderer';

export default function GrupDetail() {
  const { id } = useParams();
  const { user, isReadOnly } = useAuth();
  const navigate = useNavigate();

  // Component states
  const [group, setGroup] = useState(null);
  const [jamaahList, setJamaahList] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [banks, setBanks] = useState([]);
  const [terms, setTerms] = useState([]);
  const [companySettings, setCompanySettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ringkasan'); // 'ringkasan', 'jamaah', 'keuangan', 'dokumen'
  const [jamaahSearch, setJamaahSearch] = useState('');
  const [jamaahStatusFilter, setJamaahStatusFilter] = useState('Semua'); // 'Semua', 'Lunas', 'Belum Lunas'

  // Finance Tab Search & Filter States
  const [invoiceSearch, setInvoiceSearch] = useState('');
  const [paymentSearch, setPaymentSearch] = useState('');

  // Proof Modal States
  const [proofModalOpen, setProofModalOpen] = useState(false);
  const [selectedProof, setSelectedProof] = useState(null);
  const [allProofs, setAllProofs] = useState([]);
  const [currentProofIndex, setCurrentProofIndex] = useState(0);
  const [selectedJamaahForProof, setSelectedJamaahForProof] = useState(null);
  const [imageOrientations, setImageOrientations] = useState({}); // Track image orientations by proof index

  // Payment Modal States
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [selectedJamaahName, setSelectedJamaahName] = useState('');
  
  // Payment Form State
  const [payDate, setPayDate] = useState(new Date().toISOString().split('T')[0]);
  const [paySender, setPaySender] = useState('');
  const [payMethod, setPayMethod] = useState('Transfer BSI');
  const [payAmount, setPayAmount] = useState('');
  const [payDesc, setPayDesc] = useState('');
  const [payProof, setPayProof] = useState(null);
  const [payError, setPayError] = useState('');
  const [payLoading, setPayLoading] = useState(false);

  const handleProofFileChange = (file) => {
    if (!file) {
      setPayProof(null);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setPayProof({
        name: file.name,
        type: file.type,
        data: reader.result
      });
    };
    reader.readAsDataURL(file);
  };

  const downloadProof = (proof) => {
    if (!proof?.data) return;
    const link = document.createElement('a');
    link.href = proof.data;
    link.download = proof.name || 'bukti-transfer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const printProof = (proof) => {
    if (!proof?.data) return;
    const win = window.open(proof.data, '_blank');
    if (win) {
      win.onload = () => win.print();
    }
  };

  // Load all details
  const loadGroupDetails = async () => {
    setLoading(true);
    const grp = await dbService.groups.getById(id);
    if (!grp) {
      navigate('/grup');
      return;
    }
    setGroup(grp);

    // Fetch related jamaah packages
    const rawJamaah = await dbService.jamaah.getByGroup(id);
    const processedJamaah = await Promise.all(
      rawJamaah.map(async (j) => {
        const mems = await dbService.jamaah.getMembers(j.id);
        return {
          ...j,
          members: mems,
          membersCount: mems.length
        };
      })
    );
    setJamaahList(processedJamaah);

    // Fetch invoices for this group
    const groupInvoices = await dbService.invoices.getByGroup(id);
    const invoicesWithItems = await Promise.all(
      groupInvoices.map(async (inv) => {
        const items = await dbService.invoices.getItems(inv.id);
        return {
          ...inv,
          rawItems: items
        };
      })
    );
    setInvoices(invoicesWithItems);

    // Fetch payments for these invoices
    const invIds = groupInvoices.map(inv => inv.id);
    const allPayments = await dbService.payments.getAll();
    const groupPayments = allPayments.filter(p => invIds.includes(p.invoice_id));
    setPayments(groupPayments);

    // Settings for PDFs
    const compSettings = await dbService.settings.getCompany();
    setCompanySettings(compSettings);
    const compBanks = await dbService.settings.getBanks();
    setBanks(compBanks);
    const compTerms = await dbService.settings.getTerms();
    setTerms(compTerms);

    setLoading(false);
  };

  useEffect(() => {
    loadGroupDetails();
  }, [id]);

  // Handle Jamaah Delete
  const handleJamaahDelete = async (jamaahId, picName) => {
    if (window.confirm(`Hapus pendaftaran jamaah atas nama PJ "${picName}"? Tagihan, kwitansi, dan riwayat pembayaran terkait akan dihapus permanen.`)) {
      await dbService.jamaah.delete(jamaahId, user.id);
      loadGroupDetails();
    }
  };

  // Handle Payment Delete
  const handlePaymentDelete = async (paymentId, paymentNumber) => {
    if (window.confirm(`Anda yakin ingin menghapus pembayaran dengan nomor kwitansi "${paymentNumber}"? Aksi ini akan mengembalikan saldo tagihan terkait.`)) {
      await dbService.payments.delete(paymentId, user.id);
      loadGroupDetails();
    }
  };

  // Open Payment modal
  const handleOpenPaymentModal = (jamaahItem) => {
    const inv = invoices.find(i => i.jamaah_id === jamaahItem.id);
    if (!inv) return;
    
    setSelectedInvoice(inv);
    setSelectedJamaahName(jamaahItem.person_in_charge);
    setPaySender(jamaahItem.person_in_charge);
    setPayAmount(inv.remaining_amount); // Default to full remaining amount
    setPayDesc('Pembayaran angsuran paket umroh');
    setPayError('');
    setPaymentModalOpen(true);
  };

  // Handle Payment Submit
  const handleAddPayment = async (e) => {
    e.preventDefault();
    if (!payAmount || Number(payAmount) <= 0) {
      setPayError('Nominal pembayaran harus lebih besar dari 0');
      return;
    }
    if (Number(payAmount) > selectedInvoice.remaining_amount) {
      setPayError(`Nominal pembayaran melebihi sisa tagihan (${formatRupiah(selectedInvoice.remaining_amount)})`);
      return;
    }

    setPayLoading(true);
    try {
      const paymentPayload = {
        invoice_id: selectedInvoice.id,
        payment_date: payDate,
        sender_name: paySender,
        payment_method: payMethod,
        amount: Number(payAmount),
        description: payDesc,
        proof_file_name: payProof?.name || null,
        proof_file_data: payProof?.data || null
      };

      await dbService.payments.save(paymentPayload, user.id);
      setPaymentModalOpen(false);
      loadGroupDetails(); // refresh stats & history
    } catch (err) {
      setPayError('Gagal menambahkan pembayaran.');
    } finally {
      setPayLoading(false);
    }
  };

  // WhatsApp reminder handler
  // Colors: Hijau = Lunas, Kuning = Mendekati jatuh tempo (due in <= 15 days), Merah = Terlambat/overdue (due_date < today)
  const getPaymentStatusColors = (jamaahItem, invoice) => {
    if (jamaahItem.payment_status === 'Lunas') return { badge: 'bg-emerald-50 text-emerald-600 border border-emerald-100', dot: 'bg-emerald-500' };
    
    if (!invoice) return { badge: 'bg-slate-50 text-slate-500 border border-slate-200', dot: 'bg-slate-500' };
    
    const dueDate = new Date(invoice.due_date);
    const today = new Date();
    today.setHours(0,0,0,0);
    
    if (dueDate < today) {
      return { badge: 'bg-rose-50 text-rose-600 border border-rose-100', dot: 'bg-rose-500', isOverdue: true };
    }
    
    const diffTime = Math.abs(dueDate - today);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 15) {
      return { badge: 'bg-amber-50 text-amber-600 border border-amber-100', dot: 'bg-amber-500', isWarning: true };
    }
    
    return { badge: 'bg-blue-50 text-blue-600 border border-blue-100', dot: 'bg-blue-500' };
  };

  const getWhatsAppLink = (jamaahItem, invoice) => {
    if (!invoice) return '#';
    const cleanPhone = jamaahItem.phone.replace(/[^0-9]/g, '');
    const phoneWithCountry = cleanPhone.startsWith('0') ? '62' + cleanPhone.substring(1) : cleanPhone;
    
    const msg = `Assalamualaikum wr. wb., Yth. Bapak/Ibu *${jamaahItem.person_in_charge}*.\n\nKami dari pihak keuangan *PT. Elhakim Tour & Travel* ingin mengingatkan perihal tagihan paket ibadah Anda:\n\n*No. Invoice:* ${invoice.invoice_number}\n*Total Tagihan:* ${formatRupiah(invoice.total_amount)}\n*Telah Dibayar:* ${formatRupiah(invoice.total_paid)}\n*Sisa Tagihan:* ${formatRupiah(invoice.remaining_amount)}\n*Jatuh Tempo:* ${formatIndoDate(invoice.due_date)}\n\nPembayaran dapat ditransfer melalui rekening perusahaan resmi kami yang tertera pada invoice tagihan.\n\nTerima kasih, Wassalamualaikum wr. wb.`;
    
    return `https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(msg)}`;
  };

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary mx-auto mb-2"></div>
        <p className="text-xs text-slate-400">Memuat rincian grup...</p>
      </div>
    );
  }

  // Calculate Aggregates
  const totalOmset = invoices.reduce((sum, i) => sum + Number(i.total_amount), 0);
  const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount), 0);
  const totalPiutang = invoices.reduce((sum, i) => sum + Number(i.remaining_amount), 0);
  const totalPax = jamaahList.reduce((sum, j) => sum + (j.members?.length || 0), 0);
  
  const lunasCount = jamaahList.filter(j => j.payment_status === 'Lunas').length;
  const belumLunasCount = jamaahList.filter(j => j.payment_status !== 'Lunas').length;

  const filteredInvoices = invoices.filter((inv) => {
    const jam = jamaahList.find(j => j.id === inv.jamaah_id);
    return (
      inv.invoice_number.toLowerCase().includes(invoiceSearch.toLowerCase()) ||
      jam?.person_in_charge.toLowerCase().includes(invoiceSearch.toLowerCase())
    );
  });

  const filteredPayments = payments.filter((pay) => {
    const inv = invoices.find(i => i.id === pay.invoice_id);
    const jam = jamaahList.find(j => j.id === inv?.jamaah_id);
    return (
      pay.payment_number.toLowerCase().includes(paymentSearch.toLowerCase()) ||
      pay.sender_name.toLowerCase().includes(paymentSearch.toLowerCase()) ||
      inv?.invoice_number.toLowerCase().includes(paymentSearch.toLowerCase()) ||
      jam?.person_in_charge.toLowerCase().includes(paymentSearch.toLowerCase())
    );
  });

  // Handler to detect image orientation (portrait vs landscape)
  const handleImageLoad = (e, proofIndex) => {
    const img = e.target;
    const isPortrait = img.naturalHeight > img.naturalWidth;
    setImageOrientations(prev => ({
      ...prev,
      [proofIndex]: isPortrait ? 'portrait' : 'landscape'
    }));
  };

  return (
    <div className="space-y-6">
      {/* 1. HEADER CARD */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-premium p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        {/* Brand accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-primary"></div>
        
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Link
              to="/grup"
              className="p-1.5 hover:bg-slate-50 border border-slate-100 rounded-lg text-slate-400 hover:text-slate-700 transition-colors"
            >
              <ArrowLeft size={14} />
            </Link>
            <span className="bg-red-50 text-primary border border-red-100 px-2 py-0.5 rounded-full text-[9px] font-bold">
              {group.group_code}
            </span>
            <span className="text-slate-300">|</span>
            <span className="text-xs font-semibold text-slate-500">{group.package_name}</span>
          </div>
          
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">{group.group_name}</h1>
          
          <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-slate-500">
            <span className="flex items-center gap-1.5"><Calendar size={14} className="text-slate-400" /> {formatIndoDate(group.departure_date)} s/d {formatIndoDate(group.return_date)}</span>
            <span className="flex items-center gap-1.5"><Plane size={14} className="text-slate-400" /> {group.airline || '-'}</span>
            <span className="flex items-center gap-1.5"><Building size={14} className="text-slate-400" /> Makkah: {group.hotel_makkah || '-'} | Madinah: {group.hotel_madinah || '-'}</span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2 text-right shrink-0">
          <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Status Grup</span>
          <span className="px-3 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full font-bold text-xs">
            {group.status}
          </span>
        </div>
      </div>

      {/* 2. TABS NAVIGATOR */}
      <div className="flex border-b border-slate-200 gap-6 text-sm font-semibold text-slate-500 overflow-x-auto no-scrollbar">
        {[
          { key: 'ringkasan', title: 'Ringkasan', icon: Info },
          { key: 'jamaah', title: 'Data Jamaah', icon: Users },
          { key: 'keuangan', title: 'Keuangan & Pembayaran', icon: DollarSign },
          { key: 'dokumen', title: 'Unduh Dokumen / PDF', icon: FileText }
        ].map(t => {
          const Icon = t.icon;
          const isActive = activeTab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`flex items-center gap-1.5 pb-3 border-b-2 transition-all px-1 whitespace-nowrap ${
                isActive ? 'border-primary text-primary font-bold' : 'border-transparent hover:text-slate-800'
              }`}
            >
              <Icon size={16} />
              <span>{t.title}</span>
            </button>
          );
        })}
      </div>

      {/* 3. TAB CONTENT */}
      
      {/* 3.1 TAB: RINGKASAN */}
      {activeTab === 'ringkasan' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Stats details card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-premium md:col-span-2 space-y-6">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide border-b border-slate-100 pb-2">Analitik Grup</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50/50 border border-slate-100 rounded-xl">
                <span className="text-[10px] text-slate-400 font-semibold block uppercase">Total Jamaah</span>
                <span className="text-lg font-bold text-slate-800">{totalPax} Pax</span>
                <span className="text-[9px] text-slate-400 block mt-1">Kuota Terdaftar ({Math.round(totalPax / group.target_pax * 100)}% dari target {group.target_pax} pax)</span>
              </div>
              <div className="p-4 bg-emerald-50/20 border border-emerald-100/50 rounded-xl">
                <span className="text-[10px] text-emerald-600/70 font-semibold block uppercase">Jamaah Lunas</span>
                <span className="text-lg font-bold text-emerald-600">{lunasCount} PIC</span>
                <span className="text-[9px] text-slate-400 block mt-1">{belumLunasCount} PIC belum lunas</span>
              </div>
              <div className="p-4 bg-slate-50/50 border border-slate-100 rounded-xl">
                <span className="text-[10px] text-slate-400 font-semibold block uppercase">Total Omset</span>
                <span className="text-lg font-bold text-slate-800">{formatRupiah(totalOmset)}</span>
              </div>
              <div className="p-4 bg-red-50/30 border border-red-100/50 rounded-xl">
                <span className="text-[10px] text-primary/70 font-semibold block uppercase">Total Piutang (Kekurangan)</span>
                <span className="text-lg font-bold text-primary">{formatRupiah(totalPiutang)}</span>
              </div>
            </div>

            {/* Belum Lunas Section */}
            {belumLunasCount > 0 && (
              <div className="pt-4 border-t border-slate-100">
                <h4 className="text-[10px] font-bold text-slate-600 uppercase tracking-wide mb-2 block">Jamaah yang Belum Lunas:</h4>
                <div className="bg-red-50 border border-red-100 rounded-xl p-3 space-y-1.5">
                  {jamaahList
                    .filter(jam => jam.payment_status !== 'Lunas')
                    .map((jam) => (
                      <div key={jam.id} className="text-[10px] text-slate-700 flex justify-between items-center">
                        <span className="font-medium">{jam.person_in_charge}</span>
                        <span className="text-red-600 font-bold">{formatRupiah(jam.remaining_bill)}</span>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>

          {/* Quick flight checklist details */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-premium space-y-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide border-b border-slate-100 pb-2">Status Administrasi</h3>
            
            <div className="space-y-3.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Batas Pelunasan</span>
                <span className="font-bold text-slate-700">{group.due_date ? formatIndoDate(group.due_date) : 'H-45 Berangkat'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Pengumpulan Paspor</span>
                <span className="font-bold text-slate-700">H-30 Berangkat</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Total Penerimaan Kas</span>
                <span className="font-bold text-emerald-600">{formatRupiah(totalPaid)}</span>
              </div>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-slate-500 font-semibold">Tingkat Kolektibilitas</span>
                <span className="font-bold text-slate-800 text-sm">
                  {totalOmset > 0 ? Math.round(totalPaid / totalOmset * 100) : 0}%
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3.2 TAB: JAMAAH LIST */}
      {activeTab === 'jamaah' && (
        <div className="space-y-4">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Daftar Paket Jamaah Terdaftar</h3>
              
              {!isReadOnly() && (
                <Link
                  to={`/jamaah/tambah/${group.id}`}
                  className="inline-flex items-center gap-1.5 bg-primary hover:bg-primary-hover text-white text-xs font-semibold px-3.5 py-2 rounded-xl transition-all shadow-md active:scale-95"
                >
                  <Plus size={14} />
                  <span>+ Tambah Jamaah</span>
                </Link>
              )}
            </div>

            {/* Search and Filter Bar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-premium flex flex-col md:flex-row gap-3 items-stretch md:items-center">
              {/* Search */}
              <div className="relative flex-1">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <Search size={16} />
                </span>
                <input
                  type="text"
                  value={jamaahSearch}
                  onChange={(e) => setJamaahSearch(e.target.value)}
                  placeholder="Cari nama PIC, nomor HP, alamat..."
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>

              {/* Filter status */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium whitespace-nowrap"><Filter size={14} className="inline mr-1" /> Status:</span>
                <select
                  value={jamaahStatusFilter}
                  onChange={(e) => setJamaahStatusFilter(e.target.value)}
                  className="border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white text-slate-700 font-medium"
                >
                  <option value="Semua">Semua Status</option>
                  <option value="Lunas">Lunas</option>
                  <option value="Belum Lunas">Belum Lunas</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-premium overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                    <th className="py-4 px-6">Penanggung Jawab (PIC)</th>
                    <th className="py-4 px-6 text-center">Jumlah Anggota</th>
                    <th className="py-4 px-6">Nomor HP</th>
                    <th className="py-4 px-6 text-right">Total Tagihan</th>
                    <th className="py-4 px-6 text-right">Total Terbayar</th>
                    <th className="py-4 px-6 text-right">Sisa Tagihan</th>
                    <th className="py-4 px-6 text-center">Status Bayar</th>
                    <th className="py-4 px-6 text-center">Bukti TF</th>
                    <th className="py-4 px-6 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {jamaahList
                    .filter(jam => {
                      const matchSearch = 
                        jam.person_in_charge.toLowerCase().includes(jamaahSearch.toLowerCase()) ||
                        jam.phone.toLowerCase().includes(jamaahSearch.toLowerCase()) ||
                        jam.address.toLowerCase().includes(jamaahSearch.toLowerCase());
                      
                      const matchFilter = 
                        jamaahStatusFilter === 'Semua' || jam.payment_status === jamaahStatusFilter;
                      
                      return matchSearch && matchFilter;
                    })
                    .map((jam) => {
                    const inv = invoices.find(i => i.jamaah_id === jam.id);
                    const statusConfig = getPaymentStatusColors(jam, inv);
                    
                    return (
                      <tr key={jam.id} className="hover:bg-slate-50/50 transition-colors">
                        {/* PIC Name & Address */}
                        <td className="py-4 px-6">
                          <div>
                            <span className="font-bold text-slate-800 block text-sm">{jam.person_in_charge}</span>
                            <span className="text-[10px] text-slate-400 block mt-0.5 truncate max-w-xs">{jam.address}</span>
                          </div>
                        </td>

                        {/* Members count & List details */}
                        <td className="py-4 px-6 text-center">
                          <span className="font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full text-[11px]">
                            {jam.members?.length || 1} Pax
                          </span>
                        </td>

                        {/* Phone */}
                        <td className="py-4 px-6 font-medium text-slate-600">
                          {jam.phone}
                        </td>

                        {/* Total tagihan */}
                        <td className="py-4 px-6 text-right font-semibold text-slate-700">
                          {formatRupiah(jam.total_invoice)}
                        </td>

                        {/* Paid */}
                        <td className="py-4 px-6 text-right font-semibold text-emerald-600">
                          {formatRupiah(jam.total_paid)}
                        </td>

                        {/* Remaining balance */}
                        <td className="py-4 px-6 text-right font-bold text-slate-800">
                          {formatRupiah(jam.remaining_bill)}
                        </td>

                        {/* Status badge & reminder buttons */}
                        <td className="py-4 px-6 text-center">
                          <div className="flex flex-col items-center gap-1.5">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${statusConfig.badge}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`}></span>
                              {jam.payment_status}
                            </span>
                            
                            {/* WhatsApp reminder if outstanding */}
                            {jam.remaining_bill > 0 && inv && (
                              <a
                                href={getWhatsAppLink(jam, inv)}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 hover:text-emerald-700 transition-colors bg-emerald-50 px-2 py-0.5 rounded"
                              >
                                <MessageCircle size={10} className="fill-emerald-600 text-emerald-500" />
                                <span>Tagih WA</span>
                              </a>
                            )}
                          </div>
                        </td>

                        {/* Bukti Transfer */}
                        <td className="py-4 px-6 text-center">
                          {(() => {
                            const jamaahPayments = payments.filter(p => {
                              const payInv = invoices.find(i => i.id === p.invoice_id);
                              return payInv?.jamaah_id === jam.id && p.proof_file_data;
                            });
                            return jamaahPayments.length > 0 ? (
                              <button
                                onClick={() => {
                                  setAllProofs(jamaahPayments.map(p => ({
                                    name: p.proof_file_name,
                                    data: p.proof_file_data,
                                    paymentId: p.id,
                                    paymentNumber: p.payment_number,
                                    amount: p.amount,
                                    senderName: p.sender_name,
                                    paymentDate: p.payment_date,
                                    paymentMethod: p.payment_method
                                  })));
                                  setCurrentProofIndex(0);
                                  setSelectedJamaahForProof(jam);
                                  setProofModalOpen(true);
                                }}
                                className="inline-flex items-center gap-1 text-[10px] font-semibold text-blue-600 hover:text-blue-700 transition-colors bg-blue-50 px-2 py-1 rounded"
                              >
                                <Eye size={12} />
                                <span>Lihat Bukti ({jamaahPayments.length})</span>
                              </button>
                            ) : (
                              <span className="text-xs text-slate-400">-</span>
                            );
                          })()}
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-6">
                          <div className="flex items-center justify-center gap-1.5">
                            {/* Record Payment */}
                            {!isReadOnly() && jam.remaining_bill > 0 && (
                              <button
                                onClick={() => handleOpenPaymentModal(jam)}
                                className="bg-primary hover:bg-primary-hover text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm transition-all"
                              >
                                + Bayar
                              </button>
                            )}

                            {/* Edit */}
                            {!isReadOnly() && (
                              <Link
                                to={`/jamaah/edit/${jam.id}`}
                                className="p-1 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded transition-colors"
                              >
                                <Edit3 size={14} />
                              </Link>
                            )}

                            {/* Delete */}
                            {!isReadOnly() && (
                              <button
                                onClick={() => handleJamaahDelete(jam.id, jam.person_in_charge)}
                                className="p-1 hover:bg-rose-50 text-rose-500 rounded transition-colors"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {jamaahList.filter(jam => {
                    const matchSearch = 
                      jam.person_in_charge.toLowerCase().includes(jamaahSearch.toLowerCase()) ||
                      jam.phone.toLowerCase().includes(jamaahSearch.toLowerCase()) ||
                      jam.address.toLowerCase().includes(jamaahSearch.toLowerCase());
                    
                    const matchFilter = 
                      jamaahStatusFilter === 'Semua' || jam.payment_status === jamaahStatusFilter;
                    
                    return matchSearch && matchFilter;
                  }).length === 0 && (
                    <tr>
                      <td colSpan="8" className="py-8 text-center text-slate-400 italic">
                        <div className="flex flex-col items-center justify-center gap-1.5">
                          <AlertCircle size={20} className="text-slate-300" />
                          <span>{jamaahList.length === 0 ? 'Belum ada jamaah yang terdaftar. Klik "+ Tambah Jamaah" untuk mendaftarkan.' : 'Tidak ada hasil yang sesuai dengan pencarian.'}</span>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      {activeTab === 'keuangan' && (
        <div className="space-y-6">
          {/* Search Bar */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-premium">
              <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">Cari Invoice</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <Search size={16} />
                </span>
                <input
                  type="text"
                  value={invoiceSearch}
                  onChange={(e) => setInvoiceSearch(e.target.value)}
                  placeholder="Cari nomor invoice atau nama PIC..."
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-premium">
              <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">Cari Kwitansi / Pembayaran</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <Search size={16} />
                </span>
                <input
                  type="text"
                  value={paymentSearch}
                  onChange={(e) => setPaymentSearch(e.target.value)}
                  placeholder="Cari nomor kwitansi, nama penyetor, atau invoice..."
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-premium">
            {filteredInvoices.map((inv) => {
              const jam = jamaahList.find(j => j.id === inv.jamaah_id);
              return (
                <div key={inv.id} className="p-4 border border-slate-100 hover:border-slate-200 rounded-xl flex items-center justify-between bg-slate-50/30 transition-all mb-4 last:mb-0">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800 text-sm">{inv.invoice_number}</span>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                        inv.status === 'Lunas' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                      }`}>
                        {inv.status}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-slate-600 mt-1">PJ: {jam?.person_in_charge}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Tempo: {formatIndoDate(inv.due_date)}</p>
                  </div>

                  <div className="text-right flex flex-col items-end gap-2">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Sisa Tagihan</span>
                      <span className="font-bold text-slate-800 text-xs">{formatRupiah(inv.remaining_amount)}</span>
                    </div>

                    {/* PDF Print Link */}
                    <PDFDownloadLink
                      document={<InvoicePdf invoice={inv} group={group} jamaah={jam} members={jam?.members || []} items={inv.rawItems || []} payments={payments.filter(p => p.invoice_id === inv.id)} settings={companySettings} banks={banks} terms={terms} />}
                      fileName={`${inv.invoice_number}.pdf`}
                      className="inline-flex items-center gap-1 text-[10px] font-semibold text-primary hover:text-primary-hover bg-red-50 px-2 py-1 rounded"
                    >
                      {({ loading }) => (
                        <>
                          <Printer size={10} />
                          <span>{loading ? 'Memproses...' : 'Invoice PDF'}</span>
                        </>
                      )}
                    </PDFDownloadLink>
                  </div>
                </div>
              );
            })}

            {filteredInvoices.length === 0 && (
              <p className="text-xs text-slate-400 italic text-center py-6">{invoices.length === 0 ? 'Belum ada tagihan.' : 'Tidak ada hasil yang sesuai dengan pencarian.'}</p>
            )}
          </div>

          {/* List Payments Received */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-premium space-y-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide border-b border-slate-100 pb-2">Riwayat Pembayaran Masuk</h3>

            <div className="space-y-3">
              {filteredPayments.map((pay) => {
                const inv = invoices.find(i => i.id === pay.invoice_id);
                const jam = jamaahList.find(j => j.id === inv?.jamaah_id);
                return (
                  <div key={pay.id} className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-[11px] text-slate-700">{pay.payment_number}</span>
                      <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                        {formatRupiah(pay.amount)}
                      </span>
                    </div>

                    <div className="text-[10px] text-slate-500 space-y-0.5">
                      <p>Penyetor: <span className="font-semibold text-slate-700">{pay.sender_name}</span></p>
                      <p>Metode: <span className="font-semibold text-slate-700">{pay.payment_method}</span></p>
                      <p>Tanggal: <span className="font-semibold text-slate-700">{formatIndoDate(pay.payment_date)}</span></p>
                    </div>

                    {/* Receipt Actions */}
                    <div className="pt-2 border-t border-slate-200/50 flex items-center justify-end gap-2">
                      <PDFDownloadLink
                        document={<KwitansiPdf payment={pay} invoice={inv} jamaah={jam} members={jam?.members || []} settings={companySettings} />}
                        fileName={`Kwitansi-${pay.payment_number}.pdf`}
                        className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-600 hover:text-emerald-700 transition-colors bg-emerald-50 px-2 py-1 rounded"
                      >
                        {({ loading }) => (
                          <>
                            <Printer size={9} />
                            <span>{loading ? 'Cetak...' : 'Kwitansi A5'}</span>
                          </>
                        )}
                      </PDFDownloadLink>
                      {!isReadOnly() && (
                        <button
                          onClick={() => handlePaymentDelete(pay.id, pay.payment_number)}
                          className="inline-flex items-center gap-1 text-[9px] font-bold text-rose-600 hover:text-rose-700 transition-colors bg-rose-50 px-2 py-1 rounded"
                        >
                          <Trash2 size={9} />
                          <span>Hapus</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              {filteredPayments.length === 0 && (
                <p className="text-xs text-slate-400 italic text-center py-6">{payments.length === 0 ? 'Belum ada pembayaran masuk.' : 'Tidak ada hasil yang sesuai dengan pencarian.'}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3.4 TAB: DOKUMEN / REPORTS EXPORT */}
      {activeTab === 'dokumen' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-premium space-y-6">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide border-b border-slate-100 pb-2">Ekspor Laporan Keberangkatan Grup</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border border-slate-100 rounded-xl flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-800">Laporan Keuangan Grup (PDF)</h4>
                <p className="text-[10px] text-slate-500 mt-0.5">Berisi rekapitulasi data nama jamaah, total tagihan, pembayaran, sisa piutang, dan ringkasan keuangan.</p>
              </div>

              <PDFDownloadLink
                document={<GrupLaporanPdf group={group} jamaahList={jamaahList} invoices={invoices} printedBy={user?.name} />}
                fileName={`Laporan-Grup-${group.group_code}.pdf`}
                className="bg-primary hover:bg-primary-hover text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-md active:scale-95 text-center shrink-0"
              >
                {({ loading }) => loading ? 'Menyusun...' : 'Unduh Laporan A4'}
              </PDFDownloadLink>
            </div>
          </div>
        </div>
      )}

      {/* ======================================= */}
      {/* MODAL FORM: RECORD PAYMENT              */}
      {/* ======================================= */}
      {paymentModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl border border-slate-100 shadow-premium-lg overflow-hidden relative">
            <div className="bg-primary text-white p-4">
              <h3 className="font-bold text-sm uppercase tracking-wide">Penerimaan Pembayaran</h3>
              <p className="text-[10px] text-red-100">Catat pelunasan / angsuran jamaah: {selectedJamaahName}</p>
            </div>

            <form onSubmit={handleAddPayment} className="p-5 space-y-4">
              {payError && (
                <div className="p-2.5 bg-red-50 text-primary border-l-4 border-primary text-[10px] rounded font-semibold">
                  {payError}
                </div>
              )}

              {/* Invoice Num Info */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <div>
                  <span className="text-[9px] text-slate-400 uppercase font-semibold">No. Invoice</span>
                  <p className="font-bold text-slate-800 text-xs">{selectedInvoice?.invoice_number}</p>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 uppercase font-semibold">Sisa Tagihan</span>
                  <p className="font-bold text-primary text-xs">{formatRupiah(selectedInvoice?.remaining_amount)}</p>
                </div>
              </div>

              {/* Tanggal Pembayaran */}
              <div>
                <label className="block text-[10px] font-semibold text-slate-600 mb-1 uppercase tracking-wide">Tanggal Pembayaran *</label>
                <input
                  type="date"
                  value={payDate}
                  onChange={(e) => setPayDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-700"
                  required
                />
              </div>

              {/* Nama Pengirim */}
              <div>
                <label className="block text-[10px] font-semibold text-slate-600 mb-1 uppercase tracking-wide">Nama Pengirim / Penyetor *</label>
                <input
                  type="text"
                  value={paySender}
                  onChange={(e) => setPaySender(e.target.value)}
                  placeholder="Nama pembayar di bukti transfer"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-700"
                  required
                />
              </div>

              {/* Metode Pembayaran */}
              <div>
                <label className="block text-[10px] font-semibold text-slate-600 mb-1 uppercase tracking-wide">Metode Pembayaran *</label>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white text-slate-700 font-medium"
                >
                  <option value="Cash">Cash (Tunai)</option>
                  <option value="Transfer BSI">Transfer BSI</option>
                  <option value="Transfer Mandiri">Transfer Mandiri</option>
                  <option value="Transfer BCA">Transfer BCA</option>
                  <option value="Transfer BRI">Transfer BRI</option>
                  <option value="Transfer Muamalat">Transfer Muamalat</option>
                </select>
              </div>

              {/* Nominal Pembayaran */}
              <div>
                <CurrencyInput
                  value={payAmount}
                  onChange={(val) => setPayAmount(val)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-700 font-bold"
                  placeholder="Contoh: 5000000"
                  required
                />
              </div>

              {/* Keterangan */}
              <div>
                <label className="block text-[10px] font-semibold text-slate-600 mb-1 uppercase tracking-wide">Keterangan</label>
                <input
                  type="text"
                  value={payDesc}
                  onChange={(e) => setPayDesc(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-700"
                />
              </div>

              {/* Bukti Transfer */}
              <div>
                <label className="block text-[10px] font-semibold text-slate-600 mb-1 uppercase tracking-wide">Upload Bukti Transfer</label>
                <input
                  type="file"
                  onChange={(e) => handleProofFileChange(e.target.files[0])}
                  className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer"
                />
              </div>

              {/* Action buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentModalOpen(false)}
                  className="px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={payLoading}
                  className="px-4 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-semibold rounded-xl transition-all shadow-md active:scale-95"
                >
                  {payLoading ? 'Menyimpan...' : 'Simpan Pembayaran'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================= */}
      {/* MODAL: VIEW PROOF OF TRANSFER - ENHANCED GALLERY */}
      {/* ======================================= */}
      {proofModalOpen && allProofs.length > 0 && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white rounded-2xl border border-slate-100 shadow-premium-lg overflow-hidden relative flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="bg-primary text-white p-4 flex items-center justify-between flex-shrink-0">
              <div>
                <h3 className="font-bold text-sm uppercase tracking-wide">Bukti Pembayaran Masuk</h3>
                <p className="text-[10px] text-red-100">{selectedJamaahForProof?.person_in_charge} - {allProofs.length} bukti pembayaran</p>
              </div>
              <button
                onClick={() => {
                  setProofModalOpen(false);
                  setAllProofs([]);
                  setCurrentProofIndex(0);
                }}
                className="text-red-100 hover:text-white transition-colors text-2xl font-light leading-none"
              >
                ✕
              </button>
            </div>

            {/* Gallery Content - SCROLLABLE */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              {/* Current Proof Display */}
              <div className="space-y-4">
                {/* Navigation bar with proof counter */}
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setCurrentProofIndex((prev) => (prev === 0 ? allProofs.length - 1 : prev - 1))}
                    className="p-2 hover:bg-slate-100 text-slate-600 hover:text-slate-800 rounded-lg transition-colors disabled:opacity-50"
                    disabled={allProofs.length <= 1}
                  >
                    <ChevronLeft size={20} />
                  </button>

                  <div className="text-center">
                    <span className="text-sm font-bold text-slate-800">
                      {currentProofIndex + 1} dari {allProofs.length}
                    </span>
                    <p className="text-[10px] text-slate-400 mt-1">Proof #{allProofs[currentProofIndex]?.paymentNumber}</p>
                  </div>

                  <button
                    onClick={() => setCurrentProofIndex((prev) => (prev === allProofs.length - 1 ? 0 : prev + 1))}
                    className="p-2 hover:bg-slate-100 text-slate-600 hover:text-slate-800 rounded-lg transition-colors disabled:opacity-50"
                    disabled={allProofs.length <= 1}
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>

                {/* Payment Info Card */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-[9px] text-slate-500 font-semibold uppercase block">Nominal Bayar</span>
                      <span className="text-sm font-bold text-primary block mt-1">{formatRupiah(allProofs[currentProofIndex]?.amount)}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 font-semibold uppercase block">Tanggal</span>
                      <span className="text-sm font-bold text-slate-800 block mt-1">{formatIndoDate(allProofs[currentProofIndex]?.paymentDate)}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 font-semibold uppercase block">Pengirim</span>
                      <span className="text-[11px] font-semibold text-slate-800 block mt-1">{allProofs[currentProofIndex]?.senderName}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 font-semibold uppercase block">Metode</span>
                      <span className="text-[11px] font-semibold text-slate-800 block mt-1">{allProofs[currentProofIndex]?.paymentMethod}</span>
                    </div>
                  </div>
                </div>

                {/* File Name */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
                  <p className="text-[10px] text-slate-600 font-medium mb-1">Nama File:</p>
                  <p className="text-xs font-semibold text-slate-800 break-all">{allProofs[currentProofIndex]?.name}</p>
                </div>

                {/* File Preview */}
                <div className="bg-slate-100 rounded-xl overflow-hidden border border-slate-200">
                  {allProofs[currentProofIndex]?.data?.startsWith('data:image') && (
                    <img 
                      src={allProofs[currentProofIndex]?.data} 
                      alt="Bukti" 
                      className="w-full h-auto object-contain max-h-64"
                      onLoad={(e) => handleImageLoad(e, currentProofIndex)}
                    />
                  )}

                  {allProofs[currentProofIndex]?.data?.startsWith('data:application/pdf') && (
                    <iframe
                      title="Bukti Transfer"
                      src={allProofs[currentProofIndex]?.data}
                      className="w-full h-64"
                    />
                  )}

                  {!allProofs[currentProofIndex]?.data?.startsWith('data:image') && !allProofs[currentProofIndex]?.data?.startsWith('data:application/pdf') && (
                    <div className="p-6 text-center text-sm text-slate-600">
                      Pratinjau tidak tersedia untuk jenis file ini.
                    </div>
                  )}
                </div>
              </div>

              {/* Proof Thumbnails / List */}
              {allProofs.length > 1 && (
                <div className="border-t border-slate-200 pt-4">
                  <p className="text-xs font-semibold text-slate-600 mb-2 uppercase">Bukti Lainnya:</p>
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {allProofs.map((proof, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentProofIndex(idx)}
                        className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-[10px] font-semibold transition-all ${
                          idx === currentProofIndex
                            ? 'bg-primary text-white'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        #{proof.paymentNumber}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons - STICKY AT BOTTOM */}
            <div className="border-t border-slate-200 p-4 grid grid-cols-1 sm:grid-cols-4 gap-2 flex-shrink-0 bg-slate-50">
              {/* Download Current */}
              <button
                type="button"
                onClick={() => downloadProof(allProofs[currentProofIndex])}
                className="w-full px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2"
              >
                <Download size={14} />
                <span>Unduh Ini</span>
              </button>

              {/* Print Current as Receipt PDF */}
              <PDFDownloadLink
                document={
                  <ReceiptPdf
                    proof={allProofs[currentProofIndex]}
                    jamaah={selectedJamaahForProof}
                    settings={companySettings}
                    imageOrientation={imageOrientations[currentProofIndex]}
                  />
                }
                fileName={`Bukti-${allProofs[currentProofIndex]?.paymentNumber}.pdf`}
                className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2"
              >
                {({ loading }) => (
                  <>
                    <Printer size={14} />
                    <span>{loading ? 'Proses...' : 'Cetak PDF Ini'}</span>
                  </>
                )}
              </PDFDownloadLink>

              {/* Print All as Receipt PDF */}
              {allProofs.length > 1 && (
                <PDFDownloadLink
                  document={
                    <MultiReceiptPdf
                      proofs={allProofs}
                      jamaah={selectedJamaahForProof}
                      settings={companySettings}
                      imageOrientations={imageOrientations}
                    />
                  }
                  fileName={`Bukti-Pembayaran-${selectedJamaahForProof?.person_in_charge}.pdf`}
                  className="w-full px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2"
                >
                  {({ loading }) => (
                    <>
                      <Printer size={14} />
                      <span>{loading ? 'Proses...' : 'Cetak Semua PDF'}</span>
                    </>
                  )}
                </PDFDownloadLink>
              )}

              {/* Close */}
              <button
                onClick={() => {
                  setProofModalOpen(false);
                  setAllProofs([]);
                  setCurrentProofIndex(0);
                }}
                className="w-full px-3 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-all hover:bg-slate-50"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

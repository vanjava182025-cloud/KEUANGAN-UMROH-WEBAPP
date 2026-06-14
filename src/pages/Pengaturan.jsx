import React, { useState, useEffect } from 'react';
import { dbService } from '../services/dbService';
import { useAuth } from '../contexts/AuthContext';
import { 
  Settings, 
  Building, 
  CreditCard, 
  FileText, 
  Users, 
  Plus, 
  Trash2, 
  Edit3, 
  Save, 
  AlertCircle,
  CheckCircle,
  HelpCircle,
  Database
} from 'lucide-react';

export default function Pengaturan() {
  const { user, isAdmin } = useAuth();
  
  // Navigation tabs
  const [activeTab, setActiveTab] = useState('profil'); // 'profil', 'rekening', 'terms', 'users'

  // Global loading/status states
  const [loading, setLoading] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  // 1. Company Profile Form States
  const [companyName, setCompanyName] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');
  const [companyPhone, setCompanyPhone] = useState('');
  const [companyWebsite, setCompanyWebsite] = useState('');
  const [companyInstagram, setCompanyInstagram] = useState('');
  const [companyFacebook, setCompanyFacebook] = useState('');
  const [companyTiktok, setCompanyTiktok] = useState('');
  
  // 2. Bank Accounts States
  const [banks, setBanks] = useState([]);
  const [bankModalOpen, setBankModalOpen] = useState(false);
  const [selectedBank, setSelectedBank] = useState(null);
  const [bankName, setBankName] = useState('');
  const [bankAccountNum, setBankAccountNum] = useState('');
  const [bankAccountHolder, setBankAccountHolder] = useState('');
  const [bankActive, setBankActive] = useState(true);

  // 3. Terms & Conditions States
  const [terms, setTerms] = useState([]);
  const [newTermContent, setNewTermContent] = useState('');

  // 4. User Management States
  const [systemUsers, setSystemUsers] = useState([]);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [selectedSystemUser, setSelectedSystemUser] = useState(null);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userRole, setUserRole] = useState('Staff Keuangan');
  const [userError, setUserError] = useState('');

  const loadSettingsData = async () => {
    setLoading(true);
    
    // Load Company
    const comp = await dbService.settings.getCompany();
    if (comp) {
      setCompanyName(comp.company_name);
      setCompanyAddress(comp.company_address);
      setCompanyPhone(comp.company_phone);
      setCompanyWebsite(comp.company_website);
      setCompanyInstagram(comp.company_instagram);
      setCompanyFacebook(comp.company_facebook);
      setCompanyTiktok(comp.company_tiktok);
    }

    // Load Banks
    const compBanks = await dbService.settings.getBanks();
    setBanks(compBanks);

    // Load Terms
    const compTerms = await dbService.settings.getTerms();
    setTerms(compTerms);

    // Load System Users if Admin
    if (isAdmin()) {
      const allUsers = await dbService.users.getAll();
      setSystemUsers(allUsers);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadSettingsData();
  }, []);

  // Show status toast
  const triggerStatus = (msg) => {
    setStatusMsg(msg);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      setStatusMsg('');
    }, 3000);
  };

  // Save company details
  const handleSaveCompany = async (e) => {
    e.preventDefault();
    const payload = {
      company_name: companyName,
      company_address: companyAddress,
      company_phone: companyPhone,
      company_website: companyWebsite,
      company_instagram: companyInstagram,
      company_facebook: companyFacebook,
      company_tiktok: companyTiktok,
      company_logo: '/logo lanscape copy.png'
    };
    await dbService.settings.saveCompany(payload, user.id);
    triggerStatus('Profil perusahaan berhasil disimpan!');
  };

  // Open Bank Modal for Create
  const handleOpenBankAdd = () => {
    setSelectedBank(null);
    setBankName('');
    setBankAccountNum('');
    setBankAccountHolder('');
    setBankActive(true);
    setBankModalOpen(true);
  };

  // Open Bank Modal for Edit
  const handleOpenBankEdit = (bank) => {
    setSelectedBank(bank);
    setBankName(bank.bank_name);
    setBankAccountNum(bank.account_number);
    setBankAccountHolder(bank.account_holder);
    setBankActive(bank.is_active);
    setBankModalOpen(true);
  };

  // Save Bank
  const handleSaveBank = async (e) => {
    e.preventDefault();
    const payload = {
      bank_name: bankName,
      account_number: bankAccountNum,
      account_holder: bankAccountHolder,
      is_active: bankActive
    };
    if (selectedBank) {
      payload.id = selectedBank.id;
    }
    await dbService.settings.saveBank(payload, user.id);
    setBankModalOpen(false);
    loadSettingsData();
    triggerStatus('Rekening bank berhasil disimpan!');
  };

  // Delete Bank
  const handleDeleteBank = async (bankId, bankLabel) => {
    if (window.confirm(`Hapus rekening bank "${bankLabel}"?`)) {
      await dbService.settings.deleteBank(bankId, user.id);
      loadSettingsData();
      triggerStatus('Rekening bank dihapus!');
    }
  };

  // Add Term Point
  const handleAddTerm = async () => {
    if (!newTermContent.trim()) return;
    const updatedTerms = [...terms, { id: `tc-${Date.now()}`, content: newTermContent }];
    await dbService.settings.saveTerms(updatedTerms, user.id);
    setNewTermContent('');
    loadSettingsData();
    triggerStatus('Syarat & ketentuan baru ditambahkan!');
  };

  // Delete Term Point
  const handleDeleteTerm = async (termId) => {
    const updatedTerms = terms.filter(t => t.id !== termId);
    await dbService.settings.saveTerms(updatedTerms, user.id);
    loadSettingsData();
    triggerStatus('Syarat & ketentuan dihapus!');
  };

  // Open User Modal for Create
  const handleOpenUserAdd = () => {
    setSelectedSystemUser(null);
    setUserName('');
    setUserEmail('');
    setUserRole('Staff Keuangan');
    setUserError('');
    setUserModalOpen(true);
  };

  // Open User Modal for Edit
  const handleOpenUserEdit = (u) => {
    setSelectedSystemUser(u);
    setUserName(u.name);
    setUserEmail(u.email);
    setUserRole(u.role);
    setUserError('');
    setUserModalOpen(true);
  };

  // Save User
  const handleSaveUser = async (e) => {
    e.preventDefault();
    if (!userName.trim() || !userEmail.trim()) {
      setUserError('Nama dan Email wajib diisi.');
      return;
    }

    const payload = {
      name: userName,
      email: userEmail,
      role: userRole
    };
    if (selectedSystemUser) {
      payload.id = selectedSystemUser.id;
    }
    await dbService.users.save(payload, user.id);
    setUserModalOpen(false);
    loadSettingsData();
    triggerStatus('Informasi pengguna berhasil disimpan!');
  };

  // Delete User
  const handleDeleteUser = async (userId, uName) => {
    if (window.confirm(`Hapus hak akses pengguna "${uName}"?`)) {
      await dbService.users.delete(userId, user.id);
      loadSettingsData();
      triggerStatus('Akses pengguna dihapus!');
    }
  };

  // Clean DB to default
  const handleResetDB = async () => {
    if (window.confirm("Peringatan keras! Tindakan ini akan menghapus semua input grup, jamaah, kuitansi, dan log audit, dan mengembalikan basis data demo default. Lanjutkan?")) {
      await dbService.resetDB();
      loadSettingsData();
      triggerStatus('Sistem basis data berhasil di-reset!');
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">Pengaturan Parameter</h1>
          <p className="text-xs text-slate-500 mt-0.5">Atur profil agensi, rincian nomor rekening tujuan transfer, kebijakan pelunasan, dan hak akses staf.</p>
        </div>

        {/* Database reset helper */}
        {isAdmin() && (
          <button
            onClick={handleResetDB}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 px-3.5 py-2 rounded-xl transition-all active:scale-95 shrink-0 justify-center"
          >
            <Database size={14} />
            <span>Reset Database Demo</span>
          </button>
        )}
      </div>

      {/* Success Toast */}
      {saveSuccess && (
        <div className="p-3 bg-emerald-50 border-l-4 border-emerald-500 text-emerald-700 text-xs rounded-xl flex items-center gap-2 font-semibold">
          <CheckCircle size={16} />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* 2. SETTINGS TABS NAV */}
      <div className="flex border-b border-slate-200 gap-6 text-sm font-semibold text-slate-500 overflow-x-auto no-scrollbar">
        {[
          { key: 'profil', title: 'Profil Agensi', icon: Building, allowed: true },
          { key: 'rekening', title: 'Rekening Perusahaan', icon: CreditCard, allowed: true },
          { key: 'terms', title: 'Syarat & Ketentuan', icon: FileText, allowed: true },
          { key: 'users', title: 'Kelola Pengguna', icon: Users, allowed: isAdmin() }
        ].filter(t => t.allowed).map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`flex items-center gap-1.5 pb-3 border-b-2 transition-all px-1 whitespace-nowrap ${
                activeTab === t.key ? 'border-primary text-primary font-bold' : 'border-transparent hover:text-slate-800'
              }`}
            >
              <Icon size={16} />
              <span>{t.title}</span>
            </button>
          );
        })}
      </div>

      {/* 3. TABS VIEWS */}
      
      {/* 3.1 TAB: PROFIL AGENSI */}
      {activeTab === 'profil' && (
        <form onSubmit={handleSaveCompany} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-premium space-y-6">
          <div className="border-b border-slate-100 pb-2 flex items-center gap-1.5 text-primary">
            <Building size={16} />
            <h3 className="text-xs font-bold uppercase tracking-wider">Identitas Resmi Agensi</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Nama Resmi Perusahaan</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-700 font-medium"
                required
              />
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Nomor Telepon Kantor</label>
              <input
                type="text"
                value={companyPhone}
                onChange={(e) => setCompanyPhone(e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-700 font-medium"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Alamat Lengkap Kantor</label>
              <input
                type="text"
                value={companyAddress}
                onChange={(e) => setCompanyAddress(e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-700 font-medium"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Website Perusahaan</label>
              <input
                type="text"
                value={companyWebsite}
                onChange={(e) => setCompanyWebsite(e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-700 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Instagram Handle</label>
              <input
                type="text"
                value={companyInstagram}
                onChange={(e) => setCompanyInstagram(e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-700 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Facebook Page</label>
              <input
                type="text"
                value={companyFacebook}
                onChange={(e) => setCompanyFacebook(e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-700 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">TikTok Handle</label>
              <input
                type="text"
                value={companyTiktok}
                onChange={(e) => setCompanyTiktok(e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-700 font-medium"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white text-xs font-semibold px-5 py-2.5 rounded-xl shadow-md transition-all active:scale-95"
            >
              <Save size={16} />
              <span>Simpan Profil</span>
            </button>
          </div>
        </form>
      )}

      {/* 3.2 TAB: REKENING PERUSAHAAN */}
      {activeTab === 'rekening' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Rekening Penerimaan Resmi</h3>
            
            <button
              onClick={handleOpenBankAdd}
              className="inline-flex items-center gap-1.5 bg-primary hover:bg-primary-hover text-white text-xs font-semibold px-3.5 py-2 rounded-xl transition-all shadow-md active:scale-95"
            >
              <Plus size={14} />
              <span>Tambah Rekening</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-premium overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                  <th className="py-4 px-6">Nama Bank</th>
                  <th className="py-4 px-6">Nomor Rekening</th>
                  <th className="py-4 px-6">Atas Nama (Pemilik)</th>
                  <th className="py-4 px-6 text-center">Status</th>
                  <th className="py-4 px-6 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {banks.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6 font-bold text-slate-800">{b.bank_name}</td>
                    <td className="py-4 px-6 font-mono text-slate-700 font-semibold">{b.account_number}</td>
                    <td className="py-4 px-6 font-medium text-slate-700">{b.account_holder}</td>
                    <td className="py-4 px-6 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded text-[8px] font-bold uppercase ${
                        b.is_active ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'
                      }`}>
                        {b.is_active ? 'Aktif' : 'Non-Aktif'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleOpenBankEdit(b)}
                          className="p-1 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded transition-colors"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteBank(b.id, b.bank_name)}
                          className="p-1 hover:bg-rose-50 text-rose-500 rounded transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3.3 TAB: SYARAT & KETENTUAN */}
      {activeTab === 'terms' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-premium space-y-6">
          <div className="border-b border-slate-100 pb-2 flex items-center gap-1.5 text-primary">
            <FileText size={16} />
            <h3 className="text-xs font-bold uppercase tracking-wider">Syarat Pelunasan pada Invoice</h3>
          </div>

          {/* List current terms */}
          <div className="space-y-3">
            {terms.map((t, idx) => (
              <div key={t.id || idx} className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between">
                <span className="text-xs text-slate-700 font-semibold">{idx + 1}. {t.content}</span>
                
                <button
                  type="button"
                  onClick={() => handleDeleteTerm(t.id)}
                  className="text-rose-500 hover:text-rose-600 p-1 rounded hover:bg-rose-50 transition-all shrink-0"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            {terms.length === 0 && (
              <p className="text-xs text-slate-400 italic">Belum ada syarat pelunasan yang didaftarkan.</p>
            )}
          </div>

          {/* Add form */}
          <div className="flex gap-2 pt-4 border-t border-slate-100">
            <input
              type="text"
              value={newTermContent}
              onChange={(e) => setNewTermContent(e.target.value)}
              placeholder="Contoh: Dokumen lengkap diserahkan 30 hari sebelum keberangkatan..."
              className="flex-1 px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-700 font-medium"
            />
            <button
              type="button"
              onClick={handleAddTerm}
              className="inline-flex items-center gap-1 bg-primary hover:bg-primary-hover text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all shadow-md active:scale-95"
            >
              <Plus size={14} />
              <span>Tambah</span>
            </button>
          </div>
        </div>
      )}

      {/* 3.4 TAB: USER MANAGEMENT (Admin only) */}
      {activeTab === 'users' && isAdmin() && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Operator & Pengguna Sistem</h3>
            
            <button
              onClick={handleOpenUserAdd}
              className="inline-flex items-center gap-1.5 bg-primary hover:bg-primary-hover text-white text-xs font-semibold px-3.5 py-2 rounded-xl transition-all shadow-md active:scale-95"
            >
              <Plus size={14} />
              <span>Tambah Pengguna</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-premium overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                  <th className="py-4 px-6">Nama Lengkap</th>
                  <th className="py-4 px-6">Alamat Email</th>
                  <th className="py-4 px-6">Peran (Role RBAC)</th>
                  <th className="py-4 px-6 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {systemUsers.map((su) => (
                  <tr key={su.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6 font-bold text-slate-800">{su.name}</td>
                    <td className="py-4 px-6 font-medium text-slate-600">{su.email}</td>
                    <td className="py-4 px-6">
                      <span className="inline-block bg-red-50 border border-red-100 text-primary px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                        {su.role}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleOpenUserEdit(su)}
                          className="p-1 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded transition-colors"
                        >
                          <Edit3 size={14} />
                        </button>
                        {su.id !== user.id && ( // Prevent self deleting
                          <button
                            onClick={() => handleDeleteUser(su.id, su.name)}
                            className="p-1 hover:bg-rose-50 text-rose-500 rounded transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================= */}
      {/* BANK ACCOUNT MODAL FORM                 */}
      {/* ======================================= */}
      {bankModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl border border-slate-100 shadow-premium-lg overflow-hidden relative">
            <div className="bg-primary text-white p-4">
              <h3 className="font-bold text-sm uppercase tracking-wide">
                {selectedBank ? 'Ubah Rekening Bank' : 'Tambah Rekening Bank'}
              </h3>
              <p className="text-[10px] text-red-100">Daftarkan rekening bank resmi transfer jamaah.</p>
            </div>

            <form onSubmit={handleSaveBank} className="p-5 space-y-4">
              <div>
                <label className="block text-[10px] font-semibold text-slate-600 mb-1 uppercase tracking-wide">Nama Bank *</label>
                <input
                  type="text"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="Contoh: Bank Syariah Indonesia (BSI)"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-700"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-600 mb-1 uppercase tracking-wide">Nomor Rekening *</label>
                <input
                  type="text"
                  value={bankAccountNum}
                  onChange={(e) => setBankAccountNum(e.target.value)}
                  placeholder="Contoh: 7112233445"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-700 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-600 mb-1 uppercase tracking-wide">Atas Nama Pemilik *</label>
                <input
                  type="text"
                  value={bankAccountHolder}
                  onChange={(e) => setBankAccountHolder(e.target.value)}
                  placeholder="Contoh: PT Elhakim Tour & Travel"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-700"
                  required
                />
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="bank_active_check"
                  checked={bankActive}
                  onChange={(e) => setBankActive(e.target.checked)}
                  className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary focus:ring-2 cursor-pointer"
                />
                <label htmlFor="bank_active_check" className="text-xs font-semibold text-slate-600 cursor-pointer">
                  Aktifkan di Invoice & Kwitansi
                </label>
              </div>

              {/* Action buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setBankModalOpen(false)}
                  className="px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-semibold rounded-xl transition-all shadow-md active:scale-95"
                >
                  Simpan Rekening
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================= */}
      {/* SYSTEM USER MODAL FORM                  */}
      {/* ======================================= */}
      {userModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl border border-slate-100 shadow-premium-lg overflow-hidden relative">
            <div className="bg-primary text-white p-4">
              <h3 className="font-bold text-sm uppercase tracking-wide">
                {selectedSystemUser ? 'Ubah Informasi Pengguna' : 'Tambah Akses Pengguna'}
              </h3>
              <p className="text-[10px] text-red-100">Atur hak akses staf agensi keuangan.</p>
            </div>

            <form onSubmit={handleSaveUser} className="p-5 space-y-4">
              {userError && (
                <div className="p-2.5 bg-red-50 text-primary border-l-4 border-primary text-[10px] rounded font-semibold">
                  {userError}
                </div>
              )}

              <div>
                <label className="block text-[10px] font-semibold text-slate-600 mb-1 uppercase tracking-wide">Nama Lengkap *</label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Nama lengkap staf"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-700"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-600 mb-1 uppercase tracking-wide">Alamat Email *</label>
                <input
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  placeholder="staf@elhakimtravel.com"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-700"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-600 mb-1 uppercase tracking-wide">Hak Akses Role *</label>
                <select
                  value={userRole}
                  onChange={(e) => setUserRole(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white text-slate-700 font-semibold"
                >
                  <option value="Admin Keuangan">Admin Keuangan (Akses Penuh)</option>
                  <option value="Staff Keuangan">Staff Keuangan (Input Kas & Log)</option>
                  <option value="Marketing">Marketing (Input Jamaah & Grup)</option>
                  <option value="Pimpinan">Pimpinan (Laporan Read-Only)</option>
                </select>
              </div>

              {/* Action buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setUserModalOpen(false)}
                  className="px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-semibold rounded-xl transition-all shadow-md active:scale-95"
                >
                  Simpan Pengguna
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

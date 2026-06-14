import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { dbService } from '../services/dbService';
import { formatRupiah } from '../utils/formatters';
import { useAuth } from '../contexts/AuthContext';
import CurrencyInput from '../components/CurrencyInput';
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Save, 
  Users, 
  FileSpreadsheet, 
  AlertCircle,
  HelpCircle
} from 'lucide-react';

export default function JamaahForm() {
  const { user } = useAuth();
  const { groupId, id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Group info for styling reference
  const [group, setGroup] = useState(null);

  // Form local states
  const [picName, setPicName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  
  // Dynamic Passengers list
  const [members, setMembers] = useState(['']); // array of names

  // Dynamic Invoice items list
  const [invoiceItems, setInvoiceItems] = useState([
    { description: 'Paket Umroh', qty: 1, price: 29000000 }
  ]);

  // Load details
  useEffect(() => {
    const loadFormInfo = async () => {
      setLoading(true);
      try {
        if (isEdit) {
          // Fetch existing jamaah package
          const jam = await dbService.jamaah.getById(id);
          if (jam) {
            setPicName(jam.person_in_charge);
            setPhone(jam.phone);
            setAddress(jam.address);
            
            // Get group info
            const grp = await dbService.groups.getById(jam.group_id);
            setGroup(grp);

            // Fetch members
            const mems = await dbService.jamaah.getMembers(id);
            setMembers(mems.map(m => m.full_name));

            // Fetch invoice items
            const inv = await dbService.invoices.getByJamaah(id);
            if (inv) {
              const items = await dbService.invoices.getItems(inv.id);
              if (items.length > 0) {
                setInvoiceItems(items.map(item => ({
                  description: item.description,
                  qty: item.qty,
                  price: item.price
                })));
              }
            }
          } else {
            setErrorMsg('Data jamaah tidak ditemukan');
          }
        } else {
          // Fetch group details for reference
          const grp = await dbService.groups.getById(groupId);
          if (grp) {
            setGroup(grp);
            // Default first item with group's package description
            setInvoiceItems([
              { description: `Paket Umroh: ${grp.package_name}`, qty: 1, price: 29000000 }
            ]);
          } else {
            setErrorMsg('Grup keberangkatan tidak valid.');
          }
        }
      } catch (e) {
        setErrorMsg('Gagal memuat parameter form.');
      } finally {
        setLoading(false);
      }
    };
    loadFormInfo();
  }, [id, groupId, isEdit]);

  // Passengers handlers
  const handleAddMember = () => {
    setMembers([...members, '']);
  };

  const handleRemoveMember = (index) => {
    if (members.length === 1) return; // Keep at least one
    const updated = [...members];
    updated.splice(index, 1);
    setMembers(updated);
  };

  const handleMemberChange = (index, value) => {
    const updated = [...members];
    updated[index] = value;
    setMembers(updated);
  };

  // Invoice Items handlers
  const handleAddItemRow = () => {
    setInvoiceItems([...invoiceItems, { description: '', qty: 1, price: 0 }]);
  };

  const handleRemoveItemRow = (index) => {
    if (invoiceItems.length === 1) return;
    const updated = [...invoiceItems];
    updated.splice(index, 1);
    setInvoiceItems(updated);
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...invoiceItems];
    updated[index][field] = value;
    setInvoiceItems(updated);
  };

  // Calculations
  const totalInvoiceAmount = invoiceItems.reduce((sum, item) => {
    return sum + (Number(item.qty) * Number(item.price));
  }, 0);

  // Form Submit
  const handleSave = async (e) => {
    e.preventDefault();
    if (!picName.trim()) {
      setErrorMsg('Nama Penanggung Jawab wajib diisi.');
      return;
    }
    if (members.some(m => !m.trim())) {
      setErrorMsg('Nama semua anggota jamaah wajib diisi.');
      return;
    }
    if (invoiceItems.some(i => !i.description.trim() || i.price <= 0)) {
      setErrorMsg('Harap isi deskripsi rincian dan harga satuan tagihan.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        jamaah: {
          id: isEdit ? id : undefined,
          group_id: isEdit ? group.id : groupId,
          person_in_charge: picName,
          phone,
          address
        },
        members: members.filter(name => name.trim() !== ''),
        invoiceItems: invoiceItems.map(item => ({
          description: item.description,
          qty: Number(item.qty),
          price: Number(item.price)
        }))
      };

      await dbService.jamaah.save(payload, user.id);
      
      // Redirect back to group detail page
      navigate(`/grup/detail/${isEdit ? group.id : groupId}`);
    } catch (err) {
      setErrorMsg('Gagal memproses pendaftaran jamaah.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header bar */}
      <div className="flex items-center gap-3">
        <Link
          to={`/grup/detail/${isEdit ? group?.id : groupId}`}
          className="p-2 bg-white hover:bg-slate-50 border border-slate-100 rounded-xl text-slate-400 hover:text-slate-700 transition-colors shadow-sm"
        >
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800">
            {isEdit ? 'Ubah Paket Jamaah' : 'Pendaftaran Paket Jamaah Baru'}
          </h1>
          <p className="text-xs text-slate-500">
            Grup: <span className="font-semibold text-slate-700">{group?.group_name || 'Loading...'}</span>
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 bg-red-50 border-l-4 border-primary text-primary text-xs rounded-xl flex items-center gap-2">
          <AlertCircle size={16} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Form Area */}
      <form onSubmit={handleSave} className="space-y-6">
        
        {/* SECTION 1: DATA PENANGGUNG JAWAB (PIC) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-premium space-y-4">
          <div className="border-b border-slate-100 pb-2 flex items-center gap-1.5 text-primary">
            <Users size={16} />
            <h3 className="text-xs font-bold uppercase tracking-wider">Penanggung Jawab Tagihan (PIC)</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Nama Penanggung Jawab *</label>
              <input
                type="text"
                value={picName}
                onChange={(e) => setPicName(e.target.value)}
                placeholder="Contoh: Ahmad Fauzi"
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-700"
                required
              />
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Nomor HP (WhatsApp) *</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Contoh: 081234567890"
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-700"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Alamat Lengkap</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Alamat penyerahan dokumen / pengiriman kit perlengkapan"
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-700"
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: DAFTAR NAMA ANGGOTA JAMAAH (DYNAMIC ROW) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-premium space-y-4">
          <div className="border-b border-slate-100 pb-2 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-primary">
              <Users size={16} />
              <h3 className="text-xs font-bold uppercase tracking-wider">Nama Anggota Jamaah dalam Paket</h3>
            </div>
            
            <button
              type="button"
              onClick={handleAddMember}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:text-primary-hover bg-red-50 px-2.5 py-1 rounded-lg transition-all"
            >
              <Plus size={12} />
              <span>Tambah Anggota</span>
            </button>
          </div>

          <div className="space-y-3">
            {members.map((name, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-400 w-5 text-right">{idx + 1}.</span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => handleMemberChange(idx, e.target.value)}
                  placeholder="Nama Lengkap sesuai Paspor / KTP"
                  className="flex-1 px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-700"
                  required
                />
                
                {members.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveMember(idx)}
                    className="p-2 hover:bg-rose-50 text-rose-500 hover:text-rose-600 rounded-xl transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 3: RINCIAN TAGIHAN / INVOICE (DYNAMIC ROW) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-premium space-y-4">
          <div className="border-b border-slate-100 pb-2 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-primary">
              <FileSpreadsheet size={16} />
              <h3 className="text-xs font-bold uppercase tracking-wider">Rincian Item Tagihan</h3>
            </div>

            <button
              type="button"
              onClick={handleAddItemRow}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:text-primary-hover bg-red-50 px-2.5 py-1 rounded-lg transition-all"
            >
              <Plus size={12} />
              <span>Tambah Rincian</span>
            </button>
          </div>

          {/* Rincian Table headers */}
          <div className="hidden md:grid grid-cols-12 gap-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 pb-1">
            <div className="col-span-6">Uraian / Deskripsi Item</div>
            <div className="col-span-2 text-center">Qty</div>
            <div className="col-span-3 text-right">Harga Satuan (Rp)</div>
            <div className="col-span-1"></div>
          </div>

          <div className="space-y-3">
            {invoiceItems.map((item, idx) => (
              <div key={idx} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                {/* Deskripsi */}
                <div className="col-span-6">
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                    placeholder="Contoh: Paket Umroh VIP, Upgrade Room, Paspor, Handling..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-700 font-medium"
                    required
                  />
                </div>

                {/* Qty */}
                <div className="col-span-2">
                  <input
                    type="number"
                    value={item.qty}
                    onChange={(e) => handleItemChange(idx, 'qty', Number(e.target.value))}
                    min="1"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-center focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-700 font-bold"
                    required
                  />
                </div>

                {/* Harga */}
                <div className="col-span-3">
                  <CurrencyInput
                    value={item.price}
                    onChange={(val) => handleItemChange(idx, 'price', Number(val))}
                    placeholder="Contoh: 29000000"
                    className="text-right"
                  />
                </div>

                {/* Delete row */}
                <div className="col-span-1 text-center">
                  {invoiceItems.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveItemRow(idx)}
                      className="p-1.5 hover:bg-rose-50 text-rose-500 hover:text-rose-600 rounded-xl transition-all"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* CALCULATED TOTAL FOOTER */}
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50 -mx-6 -mb-6 p-6 rounded-b-2xl">
            <div>
              <span className="text-[10px] text-slate-400 font-semibold block uppercase">Estimasi Total Tagihan</span>
              <span className="text-slate-400 text-[10px] italic">Ditagihkan secara otomatis dalam satu invoice bundle.</span>
            </div>
            
            <span className="text-lg font-extrabold text-primary">
              {formatRupiah(totalInvoiceAmount)}
            </span>
          </div>
        </div>

        {/* Action Bottom Bar */}
        <div className="flex items-center justify-end gap-3">
          <Link
            to={`/grup/detail/${isEdit ? group?.id : groupId}`}
            className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 bg-white hover:bg-slate-50 transition-all active:scale-95 shadow-sm"
          >
            Batal
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white text-xs font-semibold px-5 py-2.5 rounded-xl shadow-md transition-all active:scale-95"
          >
            <Save size={16} />
            <span>{loading ? 'Menyimpan...' : 'Simpan Pendaftaran'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

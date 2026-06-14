import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { dbService } from '../services/dbService';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, Save, Plane, Calendar, Building, HelpCircle } from 'lucide-react';

export default function GrupForm() {
  const { user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    defaultValues: {
      group_code: '',
      group_name: '',
      package_name: '',
      departure_date: '',
      return_date: '',
      due_date: '',
      airline: '',
      hotel_makkah: '',
      hotel_madinah: '',
      target_pax: 45,
      description: '',
      status: 'Persiapan'
    }
  });

  // Pre-load data if Edit mode
  useEffect(() => {
    if (isEdit) {
      const loadGroup = async () => {
        setLoading(true);
        const group = await dbService.groups.getById(id);
        if (group) {
          setValue('group_code', group.group_code);
          setValue('group_name', group.group_name);
          setValue('package_name', group.package_name);
          setValue('departure_date', group.departure_date);
          setValue('return_date', group.return_date);
          setValue('due_date', group.due_date || '');
          setValue('airline', group.airline);
          setValue('hotel_makkah', group.hotel_makkah);
          setValue('hotel_madinah', group.hotel_madinah);
          setValue('target_pax', group.target_pax);
          setValue('description', group.description);
          setValue('status', group.status);
        } else {
          setErrorMsg('Grup tidak ditemukan.');
        }
        setLoading(false);
      };
      loadGroup();
    }
  }, [id, isEdit, setValue]);

  // Form submit handler
  const onSubmit = async (data) => {
    setLoading(true);
    setErrorMsg('');
    try {
      const payload = {
        ...data,
        target_pax: Number(data.target_pax)
      };
      if (isEdit) {
        payload.id = id;
      }
      await dbService.groups.save(payload, user.id);
      navigate('/grup');
    } catch (e) {
      setErrorMsg('Gagal menyimpan data grup.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Navigation & Header */}
      <div className="flex items-center gap-3">
        <Link
          to="/grup"
          className="p-2 bg-white hover:bg-slate-50 border border-slate-100 rounded-xl text-slate-500 hover:text-slate-800 transition-colors shadow-sm"
        >
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800">
            {isEdit ? 'Ubah Data Grup' : 'Tambah Grup Keberangkatan'}
          </h1>
          <p className="text-xs text-slate-500">
            {isEdit ? 'Ubah parameter dan rute penerbangan grup.' : 'Daftarkan kloter penerbangan dan rute perjalanan umroh/haji baru.'}
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 bg-red-50 border-l-4 border-primary text-primary text-xs rounded-xl">
          {errorMsg}
        </div>
      )}

      {/* Form Container */}
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-2xl border border-slate-100 shadow-premium overflow-hidden">
        {loading && !isEdit ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary mx-auto"></div>
          </div>
        ) : (
          <div className="p-6 space-y-6">
            
            {/* 1. SECTION: INFORMASI UTAMA */}
            <div className="space-y-4">
              <div className="border-b border-slate-100 pb-2 flex items-center gap-1.5 text-primary">
                <Plane size={16} />
                <h3 className="text-xs font-bold uppercase tracking-wider">Informasi Utama Grup</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Kode Grup */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Kode Grup *</label>
                  <input
                    type="text"
                    {...register('group_code', { required: 'Kode Grup wajib diisi' })}
                    placeholder="Contoh: UMR-202608-REG"
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-700"
                  />
                  {errors.group_code && <p className="text-[10px] text-primary mt-1">{errors.group_code.message}</p>}
                </div>

                {/* Nama Grup */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Nama Grup *</label>
                  <input
                    type="text"
                    {...register('group_name', { required: 'Nama Grup wajib diisi' })}
                    placeholder="Contoh: Umroh Reguler Syawal 1447 H"
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-700"
                  />
                  {errors.group_name && <p className="text-[10px] text-primary mt-1">{errors.group_name.message}</p>}
                </div>

                {/* Nama Paket */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Nama Paket *</label>
                  <input
                    type="text"
                    {...register('package_name', { required: 'Nama Paket wajib diisi' })}
                    placeholder="Contoh: Paket Silver 9 Hari"
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-700"
                  />
                  {errors.package_name && <p className="text-[10px] text-primary mt-1">{errors.package_name.message}</p>}
                </div>

                {/* Target Pax */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Target Pax (Quota)</label>
                  <input
                    type="number"
                    {...register('target_pax', { required: 'Target Pax wajib diisi', min: 1 })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-700"
                  />
                  {errors.target_pax && <p className="text-[10px] text-primary mt-1">{errors.target_pax.message}</p>}
                </div>
              </div>
            </div>

            {/* 2. SECTION: JADWAL & MASKAPAI */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <div className="border-b border-slate-100 pb-2 flex items-center gap-1.5 text-primary">
                <Calendar size={16} />
                <h3 className="text-xs font-bold uppercase tracking-wider">Jadwal Keberangkatan & Penerbangan</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Tanggal Berangkat */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Tanggal Berangkat *</label>
                  <input
                    type="date"
                    {...register('departure_date', { required: 'Tanggal Berangkat wajib diisi' })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-700"
                  />
                  {errors.departure_date && <p className="text-[10px] text-primary mt-1">{errors.departure_date.message}</p>}
                </div>

                {/* Tanggal Pulang */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Tanggal Kepulangan *</label>
                  <input
                    type="date"
                    {...register('return_date', { required: 'Tanggal Kepulangan wajib diisi' })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-700"
                  />
                  {errors.return_date && <p className="text-[10px] text-primary mt-1">{errors.return_date.message}</p>}
                </div>

                {/* Batas Pelunasan */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Batas Pelunasan *</label>
                  <input
                    type="date"
                    {...register('due_date', { required: 'Batas Pelunasan wajib diisi' })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-700"
                  />
                  {errors.due_date && <p className="text-[10px] text-primary mt-1">{errors.due_date.message}</p>}
                </div>

                {/* Maskapai Penerbangan */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Maskapai (Airline)</label>
                  <input
                    type="text"
                    {...register('airline')}
                    placeholder="Contoh: Saudi Arabian Airlines"
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-700"
                  />
                </div>
              </div>
            </div>

            {/* 3. SECTION: AKOMODASI & DETAIL LAIN */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <div className="border-b border-slate-100 pb-2 flex items-center gap-1.5 text-primary">
                <Building size={16} />
                <h3 className="text-xs font-bold uppercase tracking-wider">Akomodasi Hotel & Status</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Hotel Makkah */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Hotel Makkah</label>
                  <input
                    type="text"
                    {...register('hotel_makkah')}
                    placeholder="Contoh: Retaj Al Hayat"
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-700"
                  />
                </div>

                {/* Hotel Madinah */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Hotel Madinah</label>
                  <input
                    type="text"
                    {...register('hotel_madinah')}
                    placeholder="Contoh: Al-Madinah Concorde"
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-700"
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Status Grup</label>
                  <select
                    {...register('status')}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white text-slate-700 font-medium"
                  >
                    <option value="Persiapan">Persiapan</option>
                    <option value="Berangkat">Berangkat</option>
                    <option value="Selesai">Selesai</option>
                  </select>
                </div>
              </div>

              {/* Deskripsi Tambahan */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Keterangan / Deskripsi</label>
                <textarea
                  rows="3"
                  {...register('description')}
                  placeholder="Catatan tambahan grup..."
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-700"
                ></textarea>
              </div>
            </div>

          </div>
        )}

        {/* Footer Action buttons */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <Link
            to="/grup"
            className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 bg-white hover:bg-slate-50 transition-all active:scale-95"
          >
            Batal
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-md transition-all active:scale-95"
          >
            <Save size={16} />
            <span>{loading ? 'Menyimpan...' : 'Simpan Grup'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

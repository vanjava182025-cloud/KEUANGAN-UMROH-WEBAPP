import React, { useState, useEffect, useRef, forwardRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { mockDB } from '../services/mockDatabase';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Printer, Trash2, ArrowLeft } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import { format, parseISO } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { formatIDR, terbilang } from '@/utils/formatters';

// Komponen Kwitansi dipindahkan ke dalam file yang sama agar lebih mudah dikelola
const Kwitansi = forwardRef(({ payment, invoice, jamaah, company, cashier }, ref) => {
  if (!payment || !invoice || !jamaah || !company) return null;

  const kwitansiDate = format(parseISO(payment.payment_date), 'd MMMM yyyy', { locale: idLocale });
  const amountInWords = terbilang(payment.amount);

  return (
    <div ref={ref} className="bg-white p-8 rounded-lg shadow-lg border border-gray-200 text-sm">
      {/* Header */}
      <div className="flex justify-between items-center pb-4 border-b-2 border-gray-300">
        <div className="flex items-center">
          <img src={company.company_logo} alt="Company Logo" className="h-16 mr-4" />
          <div>
            <h1 className="font-bold text-lg text-primary">{company.company_name}</h1>
            <p className="text-xs text-gray-500">{company.company_address}</p>
            <p className="text-xs text-gray-500">Telp: {company.company_phone}</p>
          </div>
        </div>
        <div className="text-right">
          <h2 className="font-bold text-2xl uppercase">Kwitansi</h2>
          <p className="text-gray-500">No: {payment.payment_number}</p>
        </div>
      </div>

      {/* Info Pembayaran */}
      <div className="grid grid-cols-2 gap-x-8 gap-y-2 mt-4">
        <div>
          <strong className="text-gray-600">Sudah terima dari:</strong>
          <p>{payment.sender_name}</p>
        </div>
        <div className="text-right">
          <strong className="text-gray-600">Tanggal:</strong>
          <p>{kwitansiDate}</p>
        </div>
        <div>
          <strong className="text-gray-600">Group:</strong>
          <p>{mockDB.groups.getById(invoice.group_id)?.group_name || 'N/A'}</p>
        </div>
         <div className="text-right">
          <strong className="text-gray-600">Penanggung Jawab:</strong>
          <p>{jamaah.person_in_charge}</p>
        </div>
      </div>

      {/* Detail Pembayaran */}
      <div className="mt-6">
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="flex justify-between items-center">
            <p className="font-semibold">Keterangan</p>
            <p className="font-semibold">Jumlah</p>
          </div>
          <div className="mt-2 pt-2 border-t">
            <div className="flex justify-between">
              <p>{payment.description}</p>
              <p>{formatIDR(payment.amount)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Total */}
      <div className="mt-4 flex justify-end items-center">
        <div className="w-2/3 bg-primary text-white p-4 rounded-lg flex justify-between items-center">
          <span className="font-bold text-lg">TOTAL</span>
          <span className="font-bold text-2xl">{formatIDR(payment.amount)}</span>
        </div>
      </div>

      {/* Terbilang */}
      <div className="mt-4">
        <p className="italic font-semibold">Terbilang: <span className="capitalize">{amountInWords} Rupiah</span></p>
      </div>

      {/* Footer */}
      <div className="mt-8 flex justify-between text-center">
        <div className="w-1/2">
          <p>Hormat Kami,</p>
          <div className="mt-16 border-t w-2/3 mx-auto"></div>
          <p className="mt-2">{jamaah.person_in_charge}</p>
          <p className="text-xs font-semibold">(Penyetor)</p>
        </div>
        <div className="w-1/2">
          <p>Penerima,</p>
          <div className="mt-16 border-t w-2/3 mx-auto"></div>
          <p className="mt-2 font-bold">{(cashier?.name || 'Elhakim Umroh Haji Admin')}</p>
          <p className="text-xs font-semibold">({(cashier?.role || 'Admin Keuangan')})</p>
        </div>
      </div>
    </div>
  );
});

export default function KwitansiPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [payment, setPayment] = useState(null);
  const [invoice, setInvoice] = useState(null);
  const [jamaah, setJamaah] = useState(null);
  const [company, setCompany] = useState(null);
  const [cashier, setCashier] = useState(null);

  const componentRef = useRef();

  useEffect(() => {
    const paymentData = mockDB.payments.getById(id);
    if (paymentData) {
      setPayment(paymentData);
      const invoiceData = mockDB.invoices.getById(paymentData.invoice_id);
      setInvoice(invoiceData);
      if (invoiceData) {
        const jamaahData = mockDB.jamaah.getById(invoiceData.jamaah_id);
        setJamaah(jamaahData);
      }
      // Fetch the cashier (user who created the payment)
      const cashierData = mockDB.users.getById(paymentData.created_by);
      setCashier(cashierData);
    } else {
      alert("Kwitansi tidak ditemukan atau telah dihapus.");
      navigate('/cash-flow');
    }
    const companyData = mockDB.settings.getCompany();
    setCompany(companyData);
  }, [id, navigate]);

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: `Kwitansi-${payment?.payment_number}`,
  });
  
  const handleDelete = () => {
    if (window.confirm('Anda yakin ingin menghapus kwitansi ini? Bukti transfer yang terlampir (jika ada) juga akan dihapus. Tindakan ini tidak dapat diurungkan.')) {
      // Pastikan ID yang digunakan untuk menghapus adalah string
      const paymentId = String(id);
      const userId = user ? String(user.id) : null;

      if (!userId) {
          alert('Gagal menghapus: User tidak terautentikasi.');
          return;
      }

      const result = mockDB.payments.delete(paymentId, userId);
      if (result) {
        alert('Kwitansi berhasil dihapus.');
        navigate('/cash-flow');
      } else {
        alert('Gagal menghapus kwitansi. Coba muat ulang halaman dan coba lagi.');
      }
    }
  };

  if (!payment) {
    return <div className="text-center p-8">Memuat data atau kwitansi tidak ditemukan...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-4 sticky top-0 bg-gray-50 py-2 z-10">
        <Button variant="outline" onClick={() => navigate('/cash-flow')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Kembali ke Kas Besar
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="mr-2 h-4 w-4" /> Hapus
          </Button>
          <Button onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" /> Cetak / PDF
          </Button>
        </div>
      </div>
      <Kwitansi 
        ref={componentRef} 
        payment={payment} 
        invoice={invoice} 
        jamaah={jamaah} 
        company={company} 
        cashier={cashier} 
      />
    </div>
  );
}

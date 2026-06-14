import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  PDFDownloadLink,
  PDFViewer
} from '@react-pdf/renderer';
import { formatRupiah, formatIndoDate, terbilangRupiah } from './formatters';

// PDF styling with brand colors: #b40000 (primary), #5a5a5a (secondary)
const styles = StyleSheet.create({
  // General layout
  pageA4: {
    padding: 30,
    fontSize: 9,
    fontFamily: 'Helvetica',
    color: '#333333',
    backgroundColor: '#ffffff'
  },
  pageA4Landscape: {
    padding: 30,
    fontSize: 9,
    fontFamily: 'Helvetica',
    color: '#333333',
    backgroundColor: '#ffffff',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1.5,
    borderBottomColor: '#b40000',
    paddingBottom: 10,
    marginBottom: 15
  },
  logoContainer: {
    width: '45%'
  },
  logoImage: {
    width: 90,
    height: 30,
    marginBottom: 8,
    objectFit: 'contain'
  },
  logoText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#b40000',
    fontFamily: 'Helvetica-Bold'
  },
  logoSubtext: {
    fontSize: 7,
    color: '#5a5a5a',
    marginTop: 2
  },
  headerMeta: {
    textAlign: 'right',
    width: '50%'
  },
  docTitle: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    color: '#b40000',
    marginBottom: 4
  },
  docNumber: {
    fontSize: 10,
    color: '#333333',
    fontFamily: 'Helvetica-Bold'
  },
  metaText: {
    fontSize: 8,
    color: '#5a5a5a',
    marginTop: 2
  },
  
  // Section layout
  row: {
    flexDirection: 'row',
    marginBottom: 10
  },
  col2: {
    width: '50%'
  },
  sectionTitle: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#b40000',
    borderBottomWidth: 1,
    borderBottomColor: '#f2f2f2',
    paddingBottom: 3,
    marginBottom: 6,
    textTransform: 'uppercase'
  },
  label: {
    color: '#5a5a5a',
    fontSize: 8,
    marginBottom: 2
  },
  value: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold'
  },

  // Table styles
  table: {
    marginTop: 10,
    marginBottom: 15
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#b40000',
    paddingVertical: 5,
    paddingHorizontal: 6,
    borderRadius: 2
  },
  tableHeaderCell: {
    color: '#ffffff',
    fontFamily: 'Helvetica-Bold',
    fontSize: 8
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f2f2f2',
    paddingVertical: 5,
    paddingHorizontal: 6
  },
  tableCell: {
    fontSize: 8
  },
  
  // Alignment columns
  colDesc: { width: '50%' },
  colQty: { width: '10%', textAlign: 'center' },
  colPrice: { width: '20%', textAlign: 'right' },
  colSub: { width: '20%', textAlign: 'right' },

  // Summary sections
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10
  },
  bankSection: {
    width: '55%',
    backgroundColor: '#fcfcfc',
    padding: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#f2f2f2'
  },
  bankTitle: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#333333',
    marginBottom: 4
  },
  bankItem: {
    fontSize: 7.5,
    marginBottom: 3,
    color: '#444444'
  },
  totalSection: {
    width: '40%',
    alignSelf: 'flex-end'
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f8f8'
  },
  totalRowFinal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    backgroundColor: '#ffebeb',
    borderRadius: 2,
    paddingHorizontal: 4,
    marginTop: 2
  },
  
  // Footer
  footerContainer: {
    marginTop: 30,
    borderTopWidth: 1,
    borderTopColor: '#f2f2f2',
    paddingTop: 8,
    textAlign: 'center'
  },
  footerText: {
    fontSize: 7,
    color: '#888888'
  },
  footerSocial: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 4
  },
  socialItem: {
    fontSize: 7,
    color: '#5a5a5a',
    marginHorizontal: 8
  },

  // Kwitansi Specific
  receiptTerbilang: {
    backgroundColor: '#f2f2f2',
    padding: 6,
    borderRadius: 3,
    fontSize: 8.5,
    fontStyle: 'italic',
    color: '#333333',
    marginTop: 5,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#b40000'
  },
  signatureContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    paddingHorizontal: 10
  },
  signBlock: {
    width: '35%',
    textAlign: 'center'
  },
  signSpace: {
    height: 35
  },
  signName: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
    paddingBottom: 2
  },
  signRole: {
    fontSize: 7,
    color: '#5a5a5a',
    marginTop: 2
  },
  imagePage: {
    padding: 20,
    backgroundColor: '#ffffff',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center'
  },
  imageTitle: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: '#b40000',
    marginBottom: 10,
    textAlign: 'center'
  },
  fullPageImage: {
    width: '95%',
    height: '95%',
    objectFit: 'contain'
  },
  imageFooter: {
    fontSize: 8,
    color: '#888',
    marginTop: 10,
    textAlign: 'center'
  }
});

// 1. INVOICE PDF TEMPLATE (A4 Portrait)
export const InvoicePdf = ({ invoice, group, jamaah, members, items, payments, settings, banks, terms }) => {
  const company = settings || {
    company_name: 'Elhakim Umroh Haji Tulungagung',
    company_address: 'Jalan Kesehatan No. 10, Tulungagung',
    company_phone: '0851-4100-9634',
    company_website: 'www.elhakim.co.id',
    company_instagram: '@elhakimtour',
    company_whatsapp: '0851-4100-9634',
    company_tiktok: 'elhakimtour',
    company_facebook: 'El Hakim Umrah'
  };

  const activeBanks = banks?.filter(b => b.is_active) || [];
  const activeTerms = terms || [];

  return (
    <Document title={`Invoice-${invoice?.invoice_number}`}>
      <Page size="A4" style={styles.pageA4}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <View style={styles.logoContainer}>
            {company.company_logo && (
              <Image style={styles.logoImage} src={company.company_logo} />
            )}
            <Text style={styles.logoText}>ELHAKIM UMROH HAJI</Text>
            <Text style={styles.logoSubtext}>{company.company_name}</Text>
            <Text style={styles.logoSubtext}>{company.company_address}</Text>
            <Text style={styles.logoSubtext}>Telp: {company.company_phone}</Text>
          </View>
          <View style={styles.headerMeta}>
            <Text style={styles.docTitle}>INVOICE TAGIHAN</Text>
            <Text style={styles.docNumber}>{invoice?.invoice_number}</Text>
            <Text style={styles.metaText}>Tanggal: {formatIndoDate(invoice?.invoice_date)}</Text>
            <Text style={styles.metaText}>Jatuh Tempo: {formatIndoDate(invoice?.due_date)}</Text>
            <Text style={[styles.metaText, { fontFamily: 'Helvetica-Bold', color: invoice?.status === 'Lunas' ? 'green' : '#b40000' }]}>
              STATUS: {invoice?.status?.toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Client & Flight Info */}
        <View style={styles.row}>
          <View style={styles.col2}>
            <Text style={styles.sectionTitle}>Penanggung Jawab Tagihan</Text>
            <Text style={styles.value}>{jamaah?.person_in_charge}</Text>
            <Text style={styles.metaText}>Telp: {jamaah?.phone}</Text>
            <Text style={styles.metaText}>Alamat: {jamaah?.address}</Text>
          </View>
          <View style={styles.col2}>
            <Text style={styles.sectionTitle}>Detail Grup Keberangkatan</Text>
            <Text style={styles.value}>{group?.group_name}</Text>
            <Text style={styles.metaText}>Kode Grup: {group?.group_code}</Text>
            <Text style={styles.metaText}>Paket: {group?.package_name}</Text>
            <Text style={styles.metaText}>Berangkat: {formatIndoDate(group?.departure_date)}</Text>
          </View>
        </View>

        {/* Members list */}
        <View style={{ marginBottom: 10 }}>
          <Text style={[styles.label, { fontFamily: 'Helvetica-Bold' }]}>Daftar Peserta Jamaah:</Text>
          <Text style={{ fontSize: 8, lineHeight: 1.3 }}>
            {members?.map((m, i) => `${i + 1}. ${m.full_name}`).join('   |   ') || '-'}
          </Text>
        </View>

        {/* Billing Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, styles.colDesc]}>Deskripsi Uraian Tagihan</Text>
            <Text style={[styles.tableHeaderCell, styles.colQty]}>Qty</Text>
            <Text style={[styles.tableHeaderCell, styles.colPrice]}>Harga Satuan</Text>
            <Text style={[styles.tableHeaderCell, styles.colSub]}>Subtotal</Text>
          </View>
          {items?.map((item) => (
            <View key={item.id} style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.colDesc]}>{item.description}</Text>
              <Text style={[styles.tableCell, styles.colQty]}>{item.qty}</Text>
              <Text style={[styles.tableCell, styles.colPrice]}>{formatRupiah(item.price)}</Text>
              <Text style={[styles.tableCell, styles.colSub]}>{formatRupiah(item.subtotal)}</Text>
            </View>
          ))}
        </View>

        {/* Payment History */}
        {payments && payments.length > 0 && (
          <View style={{ marginBottom: 5 }}>
            <Text style={[styles.label, { fontFamily: 'Helvetica-Bold', color: '#333333' }]}>Riwayat Pembayaran:</Text>
            <View style={{ borderBottomWidth: 1, borderBottomColor: '#f2f2f2', paddingBottom: 4 }}>
              {payments.map((pay) => (
                <Text key={pay.id} style={{ fontSize: 7.5, color: '#5a5a5a', marginBottom: 2 }}>
                  • {formatIndoDate(pay.payment_date)} - {pay.payment_number} ({pay.payment_method}) - {formatRupiah(pay.amount)} - {pay.description}
                </Text>
              ))}
            </View>
          </View>
        )}

        {/* Footer Summary (Bank + Totals) */}
        <View style={styles.summaryContainer}>
          <View style={styles.bankSection}>
            <Text style={styles.bankTitle}>Informasi Rekening Perusahaan:</Text>
            {activeBanks.map((b) => (
              <Text key={b.id} style={styles.bankItem}>
                • {b.bank_name} - A/N {b.account_holder} - No.Rek: {b.account_number}
              </Text>
            ))}
            {activeBanks.length === 0 && (
              <Text style={{ fontSize: 7.5, color: '#888' }}>Belum ada rekening aktif.</Text>
            )}
          </View>
          <View style={styles.totalSection}>
            <View style={styles.totalRow}>
              <Text style={{ fontSize: 8, color: '#5a5a5a' }}>Total Tagihan</Text>
              <Text style={styles.value}>{formatRupiah(invoice?.total_amount)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={{ fontSize: 8, color: '#5a5a5a' }}>Total Terbayar (Deposit)</Text>
              <Text style={styles.value}>{formatRupiah(invoice?.total_paid)}</Text>
            </View>
            <View style={styles.totalRowFinal}>
              <Text style={{ fontSize: 8.5, fontFamily: 'Helvetica-Bold', color: '#b40000' }}>Sisa Tagihan</Text>
              <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold', color: '#b40000' }}>{formatRupiah(invoice?.remaining_amount)}</Text>
            </View>
          </View>
        </View>

        {/* Terms & Conditions */}
        {activeTerms.length > 0 && (
          <View style={{ marginTop: 20 }}>
            <Text style={[styles.label, { fontFamily: 'Helvetica-Bold', color: '#333333' }]}>Syarat & Ketentuan Pelunasan:</Text>
            {activeTerms.map((t, idx) => (
              <Text key={t.id || idx} style={{ fontSize: 7, color: '#666666', marginBottom: 2 }}>
                {idx + 1}. {t.content}
              </Text>
            ))}
          </View>
        )}

        {/* Footer */}
        <View style={styles.footerContainer}>
          <Text style={styles.footerText}>Terima kasih telah mempercayakan perjalanan ibadah Anda kepada kami.</Text>
          <View style={styles.footerSocial}>
            <Text style={styles.socialItem}>WhatsApp: {company.company_whatsapp}</Text>
            <Text style={styles.socialItem}>IG: {company.company_instagram}</Text>
            <Text style={styles.socialItem}>TikTok: {company.company_tiktok}</Text>
            <Text style={styles.socialItem}>FB: {company.company_facebook}</Text>
            <Text style={styles.socialItem}>Web: {company.company_website}</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

// 2. RECEIPT/KWITANSI PDF TEMPLATE (A4 Portrait)
export const KwitansiPdf = ({ payment, invoice, jamaah, members, settings, companyLogo }) => {
  const company = settings || {
    company_name: 'Elhakim Umroh Haji Tulungagung',
    company_address: 'Jalan Kesehatan No. 10, Tulungagung',
    company_phone: '0851-4100-9634',
    company_website: 'www.elhakim.co.id',
    company_instagram: '@elhakimtour'
  };

  const memberNames = members?.map(m => m.full_name).join(', ') || '';

  return (
    <Document title={`Kwitansi-${payment?.payment_number}`}>
      <Page size="A4" style={styles.pageA4}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <View style={styles.logoContainer}>
            {company.company_logo && (
              <Image style={styles.logoImage} src={company.company_logo} />
            )}
            <Text style={styles.logoText}>ELHAKIM UMROH HAJI</Text>
            <Text style={styles.logoSubtext}>{company.company_name}</Text>
            <Text style={styles.logoSubtext}>Telp: {company.company_phone}</Text>
          </View>
          <View style={styles.headerMeta}>
            <Text style={[styles.docTitle, { fontSize: 13 }]}>KWITANSI</Text>
            <Text style={[styles.docTitle, { fontSize: 13 }]}>BUKTI PEMBAYARAN</Text>
            <Text style={[styles.docNumber, { fontSize: 9 }]}>{payment?.payment_number}</Text>
            <Text style={styles.metaText}>Tanggal: {formatIndoDate(payment?.payment_date)}</Text>
            <Text style={styles.metaText}>Metode: {payment?.payment_method}</Text>
          </View>
        </View>

        {/* Receipt Content */}
        <View style={{ marginVertical: 5 }}>
          <View style={[styles.row, { marginBottom: 6 }]}>
            <View style={{ width: '30%' }}><Text style={styles.label}>Telah Terima Dari</Text></View>
            <View style={{ width: '5%' }}><Text>:</Text></View>
            <View style={{ width: '65%' }}><Text style={styles.value}>{payment?.sender_name}</Text></View>
          </View>

          <View style={[styles.row, { marginBottom: 6 }]}>
            <View style={{ width: '30%' }}><Text style={styles.label}>Uang Sejumlah</Text></View>
            <View style={{ width: '5%' }}><Text>:</Text></View>
            <View style={{ width: '65%' }}><Text style={[styles.value, { color: '#b40000' }]}>{formatRupiah(payment?.amount)}</Text></View>
          </View>

          <View style={[styles.row, { marginBottom: 6 }]}>
            <View style={{ width: '30%' }}><Text style={styles.label}>Daftar Jamaah</Text></View>
            <View style={{ width: '5%' }}><Text>:</Text></View>
            <View style={{ width: '65%' }}><Text style={{ fontSize: 8 }}>{memberNames}</Text></View>
          </View>

          <View style={[styles.row, { marginBottom: 6 }]}>
            <View style={{ width: '30%' }}><Text style={styles.label}>Untuk Pembayaran</Text></View>
            <View style={{ width: '5%' }}><Text>:</Text></View>
            <View style={{ width: '65%' }}><Text style={{ fontSize: 8.5 }}>{payment?.description} (No. Tagihan: {invoice?.invoice_number})</Text></View>
          </View>
        </View>

        {/* Written Spelling (Terbilang) */}
        <Text style={styles.label}>Terbilang:</Text>
        <View style={styles.receiptTerbilang}>
          <Text>{terbilangRupiah(payment?.amount || 0)}</Text>
        </View>

        {/* Footer Audit Detail */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginVertical: 4 }}>
          <Text style={{ fontSize: 6.5, color: '#888' }}>
            Sisa Tagihan Invoice: {formatRupiah(invoice?.remaining_amount || 0)}
          </Text>
          <Text style={{ fontSize: 6.5, color: '#888' }}>
            Dicetak pada: {new Date().toLocaleDateString('id-ID')}
          </Text>
        </View>

        {/* Signatures */}
        <View style={styles.signatureContainer}>
          <View style={styles.signBlock}>
            <Text style={styles.label}>Penyetor,</Text>
            <View style={styles.signSpace} />
            <Text style={styles.signName}>{payment?.sender_name}</Text>
            <Text style={styles.signRole}>Jamaah / PIC</Text>
          </View>
          <View style={styles.signBlock}>
            <Text style={styles.label}>Penerima (Kasir),</Text>
            <View style={styles.signSpace} />
            <Text style={styles.signName}>Elhakim Umroh Haji Admin</Text>
            <Text style={styles.signRole}>Staff Keuangan</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

// 3. GROUP DEPARTURE REPORT PDF (A4 Portrait)
export const GrupLaporanPdf = ({ group, jamaahList, invoices, printedBy }) => {
  // Aggregate calculations
  const totalJamaahCount = jamaahList?.reduce((acc, j) => {
    // Look up number of members
    // For local report, we will estimate or pass in members count
    return acc + (j.membersCount || 1);
  }, 0) || 0;
  
  const totalOmset = invoices?.reduce((sum, inv) => sum + Number(inv.total_amount), 0) || 0;
  const totalTerbayar = invoices?.reduce((sum, inv) => sum + Number(inv.total_paid), 0) || 0;
  const totalReceivables = invoices?.reduce((sum, inv) => sum + Number(inv.remaining_amount), 0) || 0;

  return (
    <Document title={`Laporan-Grup-${group?.group_code}`}>
      <Page size="A4" style={styles.pageA4}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>ELHAKIM UMROH HAJI</Text>
            <Text style={{ fontSize: 8, color: '#333' }}>Laporan Rekapitulasi Grup Keberangkatan</Text>
          </View>
          <View style={styles.headerMeta}>
            <Text style={[styles.docTitle, { fontSize: 13 }]}>LAPORAN KEUANGAN GRUP</Text>
            <Text style={styles.value}>{group?.group_name}</Text>
            <Text style={styles.metaText}>Kode: {group?.group_code} | Paket: {group?.package_name}</Text>
            <Text style={styles.metaText}>Jadwal Keberangkatan: {formatIndoDate(group?.departure_date)}</Text>
          </View>
        </View>

        {/* Flight & Hotels Specs */}
        <View style={[styles.row, { backgroundColor: '#fcfcfc', padding: 8, borderRadius: 4, borderWidth: 1, borderColor: '#f2f2f2' }]}>
          <View style={{ width: '33%' }}>
            <Text style={styles.label}>Penerbangan</Text>
            <Text style={styles.value}>{group?.airline || '-'}</Text>
          </View>
          <View style={{ width: '33%' }}>
            <Text style={styles.label}>Hotel Makkah</Text>
            <Text style={styles.value}>{group?.hotel_makkah || '-'}</Text>
          </View>
          <View style={{ width: '33%' }}>
            <Text style={styles.label}>Hotel Madinah</Text>
            <Text style={styles.value}>{group?.hotel_madinah || '-'}</Text>
          </View>
        </View>

        {/* Passengers Table */}
        <View style={[styles.table, { marginTop: 15 }]}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, { width: '5%' }]}>No</Text>
            <Text style={[styles.tableHeaderCell, { width: '25%' }]}>Penanggung Jawab</Text>
            <Text style={[styles.tableHeaderCell, { width: '10%', textAlign: 'center' }]}>Pax</Text>
            <Text style={[styles.tableHeaderCell, { width: '20%', textAlign: 'right' }]}>Tagihan</Text>
            <Text style={[styles.tableHeaderCell, { width: '20%', textAlign: 'right' }]}>Terbayar</Text>
            <Text style={[styles.tableHeaderCell, { width: '20%', textAlign: 'right' }]}>Sisa</Text>
          </View>
          
          {jamaahList?.map((jam, idx) => {
            const inv = invoices?.find(i => i.jamaah_id === jam.id) || { total_amount: 0, total_paid: 0, remaining_amount: 0 };
            return (
              <View key={jam.id} style={styles.tableRow}>
                <Text style={[styles.tableCell, { width: '5%' }]}>{idx + 1}</Text>
                <Text style={[styles.tableCell, { width: '25%', fontFamily: 'Helvetica-Bold' }]}>{jam.person_in_charge}</Text>
                <Text style={[styles.tableCell, { width: '10%', textAlign: 'center' }]}>{jam.membersCount || 1}</Text>
                <Text style={[styles.tableCell, { width: '20%', textAlign: 'right' }]}>{formatRupiah(inv.total_amount)}</Text>
                <Text style={[styles.tableCell, { width: '20%', textAlign: 'right' }]}>{formatRupiah(inv.total_paid)}</Text>
                <Text style={[styles.tableCell, { width: '20%', textAlign: 'right', color: inv.remaining_amount > 0 ? '#b40000' : 'green', fontFamily: 'Helvetica-Bold' }]}>
                  {formatRupiah(inv.remaining_amount)}
                </Text>
              </View>
            );
          })}

          {(!jamaahList || jamaahList.length === 0) && (
            <View style={[styles.tableRow, { justifyContent: 'center', paddingVertical: 10 }]}>
              <Text style={{ color: '#888888', fontStyle: 'italic' }}>Belum ada jamaah yang didaftarkan di grup ini.</Text>
            </View>
          )}
        </View>

        {/* Report Summary Footer Box */}
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10 }}>
          <View style={{ width: '50%', backgroundColor: '#ffebeb', padding: 8, borderRadius: 4, borderWidth: 1, borderColor: '#b40000' }}>
            <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold', color: '#b40000', marginBottom: 6, textTransform: 'uppercase' }}>
              Rekapitulasi Keuangan Grup
            </Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2.5 }}>
              <Text style={{ fontSize: 8, color: '#333' }}>Total Jamaah</Text>
              <Text style={{ fontSize: 8, fontFamily: 'Helvetica-Bold' }}>{totalJamaahCount} Pax</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2.5 }}>
              <Text style={{ fontSize: 8, color: '#333' }}>Total Omset</Text>
              <Text style={{ fontSize: 8, fontFamily: 'Helvetica-Bold' }}>{formatRupiah(totalOmset)}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2.5 }}>
              <Text style={{ fontSize: 8, color: '#333' }}>Total Terbayar</Text>
              <Text style={{ fontSize: 8, fontFamily: 'Helvetica-Bold', color: 'green' }}>{formatRupiah(totalTerbayar)}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingTop: 3, borderTopWidth: 1, borderTopColor: '#b40000' }}>
              <Text style={{ fontSize: 8.5, fontFamily: 'Helvetica-Bold', color: '#b40000' }}>Total Piutang</Text>
              <Text style={{ fontSize: 8.5, fontFamily: 'Helvetica-Bold', color: '#b40000' }}>{formatRupiah(totalReceivables)}</Text>
            </View>
          </View>
        </View>

        {/* Print metadata */}
        <View style={{ marginTop: 40, borderTopWidth: 1, borderTopColor: '#f2f2f2', paddingTop: 6, flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ fontSize: 7, color: '#888' }}>
            Dicetak oleh: {printedBy || 'Staff Keuangan'} | Sistem Keuangan Elhakim Umroh Haji
          </Text>
          <Text style={{ fontSize: 7, color: '#888' }}>
            Waktu Cetak: {new Date().toLocaleString('id-ID')}
          </Text>
        </View>
      </Page>
    </Document>
  );
};

// HELPER DOWNLOAD BUTTON COMPONENT
export const DownloadPdfButton = ({ document, fileName, children, className }) => {
  return (
    <PDFDownloadLink document={document} fileName={fileName}>
      {({ blob, url, loading, error }) => 
        loading ? (
          <button disabled className={`${className} opacity-50 cursor-not-allowed`}>
            Loading PDF...
          </button>
        ) : (
          <span className={className}>
            {children || 'Unduh PDF'}
          </span>
        )
      }
    </PDFDownloadLink>
  );
};

// Helper function to detect image orientation
const getImageOrientation = (base64String) => {
  try {
    if (!base64String || !base64String.startsWith('data:image')) {
      return null;
    }
    
    const img = new window.Image();
    img.src = base64String;
    
    // For PDF rendering, we'll check if height > width (portrait) or width > height (landscape)
    // Since we can't reliably get dimensions from base64 in @react-pdf renderer context,
    // we'll return a promise that resolves when image loads
    return new Promise((resolve) => {
      img.onload = () => {
        const isPortrait = img.height > img.width;
        resolve(isPortrait ? 'portrait' : 'landscape');
      };
      img.onerror = () => resolve('landscape'); // default to landscape
    });
  } catch (error) {
    return 'landscape'; // default to landscape on error
  }
};

// 4. RECEIPT PDF - BUKTI PEMBAYARAN (A4 with flexible layout based on image orientation)
export const ReceiptPdf = ({ proof, jamaah, settings, imageOrientation = null }) => {
    const company = settings || {
        company_name: 'Elhakim Umroh Haji Tulungagung',
        company_address: 'Jalan Kesehatan No. 10, Tulungagung',
        company_phone: '0851-4100-9634',
        company_website: 'www.elhakim.co.id',
        company_instagram: '@elhakimtour'
    };
    
    const hasImage = proof?.data && proof?.data?.startsWith('data:image');
    const orientation = imageOrientation || 'portrait';

    return (
        <Document title={`Bukti-Pembayaran-${proof?.paymentNumber}`}>
            {/* Page 1: Information Page */}
            <Page size="A4" style={styles.pageA4}>
                {/* Header */}
                <View style={styles.headerContainer}>
                    <View style={styles.logoContainer}>
                        {company.company_logo && (
                            <Image style={styles.logoImage} src={company.company_logo} />
                        )}
                        <Text style={styles.logoText}>ELHAKIM UMROH HAJI</Text>
                        <Text style={styles.logoSubtext}>{company.company_name}</Text>
                    </View>
                    <View style={styles.headerMeta}>
                        <Text style={[styles.docTitle, { fontSize: 14 }]}>BUKTI PEMBAYARAN</Text>
                        <Text style={[styles.docNumber, { fontSize: 11, marginTop: 4 }]}>{proof?.paymentNumber}</Text>
                        <Text style={styles.metaText}>Tanggal: {formatIndoDate(proof?.paymentDate)}</Text>
                        <Text style={styles.metaText}>Metode: {proof?.paymentMethod}</Text>
                    </View>
                </View>

                {/* Jamaah & Payment Info */}
                <View style={{ marginVertical: 10 }}>
                    <View style={[styles.row, { marginBottom: 8 }]}>
                        <View style={{ width: '30%' }}><Text style={styles.label}>Atas Nama Penanggung Jawab</Text></View>
                        <View style={{ width: '5%' }}><Text>:</Text></View>
                        <View style={{ width: '65%' }}><Text style={styles.value}>{jamaah?.person_in_charge || '-'}</Text></View>
                    </View>

                    <View style={[styles.row, { marginBottom: 8 }]}>
                        <View style={{ width: '30%' }}><Text style={styles.label}>Nomor HP / Telepon</Text></View>
                        <View style={{ width: '5%' }}><Text>:</Text></View>
                        <View style={{ width: '65%' }}><Text style={styles.value}>{jamaah?.phone || '-'}</Text></View>
                    </View>

                    <View style={[styles.row, { marginBottom: 8 }]}>
                        <View style={{ width: '30%' }}><Text style={styles.label}>Alamat</Text></View>
                        <View style={{ width: '5%' }}><Text>:</Text></View>
                        <View style={{ width: '65%' }}><Text style={{ fontSize: 8 }}>{jamaah?.address || '-'}</Text></View>
                    </View>
                </View>
                
                {/* Payment Details Box */}
                <View style={{ 
                    backgroundColor: '#f5f5f5', 
                    padding: 10, 
                    borderRadius: 4, 
                    marginVertical: 10,
                    borderWidth: 1,
                    borderColor: '#e0e0e0'
                }}>
                    <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold', color: '#b40000', marginBottom: 6 }}>
                        RINCIAN PEMBAYARAN
                    </Text>
                    
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                        <Text style={{ fontSize: 8, color: '#333' }}>Nominal Pembayaran</Text>
                        <Text style={{ fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#b40000' }}>
                            {formatRupiah(proof?.amount || 0)}
                        </Text>
                    </View>

                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                        <Text style={{ fontSize: 8, color: '#333' }}>Tanggal Pembayaran</Text>
                        <Text style={{ fontSize: 8, fontFamily: 'Helvetica-Bold' }}>
                            {formatIndoDate(proof?.paymentDate)}
                        </Text>
                    </View>

                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                        <Text style={{ fontSize: 8, color: '#333' }}>Nama Pengirim</Text>
                        <Text style={{ fontSize: 8, fontFamily: 'Helvetica-Bold' }}>
                            {proof?.senderName}
                        </Text>
                    </View>

                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={{ fontSize: 8, color: '#333' }}>Metode Pembayaran</Text>
                        <Text style={{ fontSize: 8, fontFamily: 'Helvetica-Bold' }}>
                            {proof?.paymentMethod}
                        </Text>
                    </View>
                </View>

                {/* Terbilang */}
                <Text style={{ fontSize: 8, color: '#5a5a5a', marginVertical: 6, fontFamily: 'Helvetica-Bold' }}>
                    Terbilang:
                </Text>
                <View style={{ 
                    backgroundColor: '#fff9f0', 
                    padding: 8, 
                    borderLeftWidth: 4,
                    borderLeftColor: '#b40000',
                    marginBottom: 10
                }}>
                    <Text style={{ fontSize: 8, color: '#333', fontStyle: 'italic' }}>
                        {terbilangRupiah(proof?.amount || 0)}
                    </Text>
                </View>

                {/* Footer Notes */}
                <View style={{ marginVertical: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#e0e0e0' }}>
                    <Text style={{ fontSize: 7, color: '#888', textAlign: 'center', marginBottom: 3 }}>
                        Dokumen ini merupakan bukti sah pembayaran angsuran paket ibadah umroh / haji
                    </Text>
                    <Text style={{ fontSize: 7, color: '#888', textAlign: 'center' }}>
                        Dicetak pada: {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </Text>
                </View>

                {/* Signature Area */}
                <View style={styles.signatureContainer}>
                    <View style={styles.signBlock}>
                        <Text style={styles.label}>Pengirim,</Text>
                        <View style={styles.signSpace} />
                        <Text style={styles.signName}>{proof?.senderName}</Text>
                        <Text style={styles.signRole}>Jamaah / PIC</Text>
                    </View>
                    <View style={styles.signBlock}>
                        <Text style={styles.label}>Penerima (Kasir),</Text>
                        <View style={styles.signSpace} />
                        <Text style={styles.signName}>Elhakim Umroh Haji Admin</Text>
                        <Text style={styles.signRole}>Staff Keuangan</Text>
                    </View>
                </View>
            </Page>

            {/* Page 2: Image Page (if image exists) */}
            {hasImage && (
                <Page size={orientation === 'portrait' ? 'A4' : 'A4_LANDSCAPE'} style={styles.imagePage} orientation={orientation}>
                    <Text style={styles.imageTitle}>
                        📸 DOKUMENTASI BUKTI PEMBAYARAN
                    </Text>
                    <Image 
                        style={styles.fullPageImage} 
                        src={proof?.data} 
                    />
                </Page>
            )}
        </Document>
    );
};


// 5. MULTI RECEIPT PDF - BUKTI PEMBAYARAN MULTIPLE (A4 Portrait with multiple receipts)
export const MultiReceiptPdf = ({ proofs, jamaah, settings, imageOrientations = {} }) => {
  const company = settings || {
    company_name: 'Elhakim Umroh Haji Tulungagung',
    company_address: 'Jalan Kesehatan No. 10, Tulungagung',
    company_phone: '0851-4100-9634',
    company_website: 'www.elhakim.co.id',
    company_instagram: '@elhakimtour'
  };

  const totalAmount = proofs.reduce((sum, p) => sum + (p.amount || 0), 0);

  return (
    <Document title={`Bukti-Pembayaran-Multiple-${jamaah?.person_in_charge}`}>
      {/* Title Page */}
      <Page size="A4" style={styles.pageA4}>
        <View style={styles.headerContainer}>
          <View style={styles.logoContainer}>
            {company.company_logo && (
              <Image style={styles.logoImage} src={company.company_logo} />
            )}
            <Text style={styles.logoText}>ELHAKIM UMROH HAJI</Text>
            <Text style={styles.logoSubtext}>{company.company_name}</Text>
          </View>
          <View style={styles.headerMeta}>
            <Text style={[styles.docTitle, { fontSize: 14 }]}>KUMPULAN BUKTI PEMBAYARAN</Text>
            <Text style={styles.metaText}>Total {proofs.length} Bukti Pembayaran</Text>
          </View>
        </View>

        <View style={{ marginVertical: 20 }}>
          <View style={[styles.row, { marginBottom: 10 }]}>
            <View style={{ width: '30%' }}><Text style={styles.label}>Atas Nama</Text></View>
            <View style={{ width: '5%' }}><Text>:</Text></View>
            <View style={{ width: '65%' }}><Text style={styles.value}>{jamaah?.person_in_charge}</Text></View>
          </View>

          <View style={[styles.row, { marginBottom: 10 }]}>
            <View style={{ width: '30%' }}><Text style={styles.label}>Nomor HP</Text></View>
            <View style={{ width: '5%' }}><Text>:</Text></View>
            <View style={{ width: '65%' }}><Text style={styles.value}>{jamaah?.phone}</Text></View>
          </View>

          <View style={[styles.row]}>
            <View style={{ width: '30%' }}><Text style={styles.label}>Total Pembayaran</Text></View>
            <View style={{ width: '5%' }}><Text>:</Text></View>
            <View style={{ width: '65%' }}><Text style={[styles.value, { color: '#b40000', fontFamily: 'Helvetica-Bold', fontSize: 10 }]}>{formatRupiah(totalAmount)}</Text></View>
          </View>
        </View>

        {/* Summary Table */}
        <View style={[styles.table, { marginTop: 15 }]}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, { width: '10%' }]}>No.</Text>
            <Text style={[styles.tableHeaderCell, { width: '20%' }]}>Kode Bayar</Text>
            <Text style={[styles.tableHeaderCell, { width: '20%' }]}>Tanggal</Text>
            <Text style={[styles.tableHeaderCell, { width: '20%' }]}>Metode</Text>
            <Text style={[styles.tableHeaderCell, { width: '30%', textAlign: 'right' }]}>Jumlah</Text>
          </View>
          
          {proofs.map((proof, idx) => (
            <View key={idx} style={styles.tableRow}>
              <Text style={[styles.tableCell, { width: '10%' }]}>{idx + 1}</Text>
              <Text style={[styles.tableCell, { width: '20%' }]}>{proof.paymentNumber}</Text>
              <Text style={[styles.tableCell, { width: '20%' }]}>{formatIndoDate(proof.paymentDate)}</Text>
              <Text style={[styles.tableCell, { width: '20%' }]}>{proof.paymentMethod}</Text>
              <Text style={[styles.tableCell, { width: '30%', textAlign: 'right' }]}>{formatRupiah(proof.amount)}</Text>
            </View>
          ))}
        </View>

        <View style={{ marginTop: 15, paddingTop: 15, borderTopWidth: 1, borderTopColor: '#e0e0e0', textAlign: 'center' }}>
          <Text style={{ fontSize: 8, color: '#888' }}>Dokumen ini berisi ringkasan semua bukti pembayaran untuk {jamaah?.person_in_charge}</Text>
          <Text style={{ fontSize: 8, color: '#888', marginTop: 3 }}>Halaman ini diikuti dengan detail bukti pembayaran individual</Text>
        </View>
      </Page>

      {/* Individual Receipt Pages */}
      {proofs.map((proof, idx) => {
        const hasImage = proof?.data && proof?.data?.startsWith('data:image');
        const orientation = imageOrientations[idx] || 'portrait';
        
        return (
          <React.Fragment key={idx}>
            {/* Page 1: Information for this receipt */}
            <Page size="A4" style={styles.pageA4}>
                {/* Header */}
                <View style={styles.headerContainer}>
                    <View style={styles.logoContainer}>
                        {company.company_logo && (
                            <Image style={styles.logoImage} src={company.company_logo} />
                        )}
                        <Text style={styles.logoText}>ELHAKIM UMROH HAJI</Text>
                    </View>
                    <View style={styles.headerMeta}>
                        <Text style={[styles.docTitle, { fontSize: 14 }]}>BUKTI PEMBAYARAN</Text>
                        <Text style={[styles.docNumber, { fontSize: 11, marginTop: 4 }]}>{proof.paymentNumber}</Text>
                        <Text style={styles.metaText}>Tanggal: {formatIndoDate(proof.paymentDate)}</Text>
                        <Text style={styles.metaText}>Bukti {idx + 1} dari {proofs.length}</Text>
                    </View>
                </View>

                 {/* Jamaah & Payment Info */}
                 <View style={{ marginVertical: 10 }}>
                    <View style={[styles.row, { marginBottom: 8 }]}>
                        <View style={{ width: '30%' }}><Text style={styles.label}>Atas Nama Penanggung Jawab</Text></View>
                        <View style={{ width: '5%' }}><Text>:</Text></View>
                        <View style={{ width: '65%' }}><Text style={styles.value}>{jamaah?.person_in_charge || '-'}</Text></View>
                    </View>

                    <View style={[styles.row, { marginBottom: 8 }]}>
                        <View style={{ width: '30%' }}><Text style={styles.label}>Nomor HP / Telepon</Text></View>
                        <View style={{ width: '5%' }}><Text>:</Text></View>
                        <View style={{ width: '65%' }}><Text style={styles.value}>{jamaah?.phone || '-'}</Text></View>
                    </View>

                    <View style={[styles.row, { marginBottom: 8 }]}>
                        <View style={{ width: '30%' }}><Text style={styles.label}>Alamat</Text></View>
                        <View style={{ width: '5%' }}><Text>:</Text></View>
                        <View style={{ width: '65%' }}><Text style={{ fontSize: 8 }}>{jamaah?.address || '-'}</Text></View>
                    </View>
                </View>
                
                {/* Payment Details Box */}
                <View style={{ 
                    backgroundColor: '#f5f5f5', 
                    padding: 10, 
                    borderRadius: 4, 
                    marginVertical: 10,
                    borderWidth: 1,
                    borderColor: '#e0e0e0'
                }}>
                    <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold', color: '#b40000', marginBottom: 6 }}>
                        RINCIAN PEMBAYARAN
                    </Text>
                    
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                        <Text style={{ fontSize: 8, color: '#333' }}>Nominal Pembayaran</Text>
                        <Text style={{ fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#b40000' }}>
                            {formatRupiah(proof.amount || 0)}
                        </Text>
                    </View>

                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                        <Text style={{ fontSize: 8, color: '#333' }}>Tanggal Pembayaran</Text>
                        <Text style={{ fontSize: 8, fontFamily: 'Helvetica-Bold' }}>
                            {formatIndoDate(proof.paymentDate)}
                        </Text>
                    </View>

                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                        <Text style={{ fontSize: 8, color: '#333' }}>Nama Pengirim</Text>
                        <Text style={{ fontSize: 8, fontFamily: 'Helvetica-Bold' }}>
                            {proof.senderName}
                        </Text>
                    </View>

                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={{ fontSize: 8, color: '#333' }}>Metode Pembayaran</Text>
                        <Text style={{ fontSize: 8, fontFamily: 'Helvetica-Bold' }}>
                            {proof.paymentMethod}
                        </Text>
                    </View>
                </View>

                {/* Terbilang */}
                <Text style={{ fontSize: 8, color: '#5a5a5a', marginVertical: 6, fontFamily: 'Helvetica-Bold' }}>
                    Terbilang:
                </Text>
                <View style={{ 
                    backgroundColor: '#fff9f0', 
                    padding: 8, 
                    borderLeftWidth: 4,
                    borderLeftColor: '#b40000',
                    marginBottom: 10
                }}>
                    <Text style={{ fontSize: 8, color: '#333', fontStyle: 'italic' }}>
                        {terbilangRupiah(proof.amount || 0)}
                    </Text>
                </View>

                {/* Footer Notes */}
                <View style={{ marginVertical: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#e0e0e0' }}>
                    <Text style={{ fontSize: 7, color: '#888', textAlign: 'center', marginBottom: 3 }}>
                        Dokumen ini merupakan bukti sah pembayaran angsuran paket ibadah umroh / haji
                    </Text>
                    <Text style={{ fontSize: 7, color: '#888', textAlign: 'center' }}>
                        Dicetak pada: {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </Text>
                </View>

                {/* Signature Area */}
                <View style={styles.signatureContainer}>
                    <View style={styles.signBlock}>
                        <Text style={styles.label}>Pengirim,</Text>
                        <View style={styles.signSpace} />
                        <Text style={styles.signName}>{proof.senderName}</Text>
                        <Text style={styles.signRole}>Jamaah / PIC</Text>
                    </View>
                    <View style={styles.signBlock}>
                        <Text style={styles.label}>Penerima (Kasir),</Text>
                        <View style={styles.signSpace} />
                        <Text style={styles.signName}>Elhakim Umroh Haji Admin</Text>
                        <Text style={styles.signRole}>Staff Keuangan</Text>
                    </View>
                </View>
            </Page>

            {/* Page 2: Image for this receipt */}
            {hasImage && (
                <Page size={orientation === 'portrait' ? 'A4' : 'A4_LANDSCAPE'} style={styles.imagePage} orientation={orientation}>
                    <Text style={styles.imageTitle}>
                        📸 DOKUMENTASI BUKTI PEMBAYARAN
                    </Text>
                    <Image 
                        style={styles.fullPageImage} 
                        src={proof?.data} 
                    />
                </Page>
            )}
          </React.Fragment>
        )
      })}
    </Document>
  );
};
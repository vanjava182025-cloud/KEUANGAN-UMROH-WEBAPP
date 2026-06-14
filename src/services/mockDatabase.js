// Mock Database Engine for Elhakim Travel Umroh Haji
// Persists in localStorage and seeds with realistic initial data

const STORAGE_KEYS = {
  USERS: 'elhakim_users',
  GROUPS: 'elhakim_groups',
  JAMAAH: 'elhakim_jamaah',
  JAMAAH_MEMBERS: 'elhakim_jamaah_members',
  INVOICES: 'elhakim_invoices',
  INVOICE_ITEMS: 'elhakim_invoice_items',
  PAYMENTS: 'elhakim_payments',
  EXPENSES: 'elhakim_expenses',
  COMPANY_SETTINGS: 'elhakim_company_settings',
  COMPANY_BANKS: 'elhakim_company_banks',
  TERMS_CONDITIONS: 'elhakim_terms_conditions',
  AUDIT_LOGS: 'elhakim_audit_logs',
};

// Seed Data
const DEFAULT_USERS = [
  { id: 'usr-1', name: 'Zulkifli Al-Hafiz', email: 'admin@elhakim.com', role: 'Admin Keuangan', created_at: '2026-01-10T08:00:00Z' },
  { id: 'usr-2', name: 'Siti Rahma', email: 'staff@elhakim.com', role: 'Staff Keuangan', created_at: '2026-01-15T09:30:00Z' },
  { id: 'usr-3', name: 'Budi Santoso', email: 'marketing@elhakim.com', role: 'Marketing', created_at: '2026-01-20T10:00:00Z' },
  { id: 'usr-4', name: 'H. Elhakim (Owner)', email: 'pimpinan@elhakim.com', role: 'Pimpinan', created_at: '2026-01-01T07:00:00Z' },
];

const DEFAULT_GROUPS = [
  {
    id: 'grp-1',
    group_code: 'UMR-202608-REG',
    group_name: 'Umroh Reguler Syawal 1447 H',
    package_name: 'Paket Silver 9 Hari',
    departure_date: '2026-08-05',
    return_date: '2026-08-14',
    due_date: '2026-07-05',
    airline: 'Saudi Arabian Airlines',
    hotel_makkah: 'Retaj Al Hayat',
    hotel_madinah: 'Al-Madinah Concorde',
    target_pax: 45,
    description: 'Pemberangkatan kloter pertama bulan Agustus 2026 dengan rute Jakarta - Madinah.',
    status: 'Persiapan',
    created_at: '2026-03-01T10:00:00Z'
  },
  {
    id: 'grp-2',
    group_code: 'HAJ-2026-VVIP',
    group_name: 'Haji Furoda VVIP 2026',
    package_name: 'Paket Haji Furoda Gold',
    departure_date: '2026-06-15',
    return_date: '2026-07-10',
    due_date: '2026-06-01',
    airline: 'Garuda Indonesia',
    hotel_makkah: 'Pullman Zamzam Makkah',
    hotel_madinah: 'The Oberoi Madinah',
    target_pax: 15,
    description: 'Program haji langsung berangkat tanpa antri dengan fasilitas bintang 5.',
    status: 'Berangkat',
    created_at: '2026-01-10T12:00:00Z'
  },
  {
    id: 'grp-3',
    group_code: 'UMR-202604-VIP',
    group_name: 'Umroh Premium Ramadhan 1447 H',
    package_name: 'Paket Gold 12 Hari',
    departure_date: '2026-04-10',
    return_date: '2026-04-22',
    due_date: '2026-03-15',
    airline: 'Qatar Airways',
    hotel_makkah: 'Hilton Suites Makkah',
    hotel_madinah: 'Dallah Taibah',
    target_pax: 30,
    description: 'Perjalanan ibadah Umroh I`tikaf 10 hari terakhir Ramadhan.',
    status: 'Selesai',
    created_at: '2025-11-01T08:00:00Z'
  }
];

const DEFAULT_JAMAAH = [
  {
    id: 'jam-1',
    group_id: 'grp-1',
    person_in_charge: 'Ahmad Fauzi',
    phone: '081234567890',
    address: 'Jl. Pemuda No. 12, Rawamangun, Jakarta Timur',
    total_invoice: 89000000,
    total_paid: 55000000,
    remaining_bill: 34000000,
    payment_status: 'DP 2',
    created_at: '2026-03-10T14:30:00Z'
  },
  {
    id: 'jam-2',
    group_id: 'grp-1',
    person_in_charge: 'Hj. Siti Aminah',
    phone: '081987654321',
    address: 'Perumahan Griya Indah Blok C3, Bekasi',
    total_invoice: 32000000,
    total_paid: 32000000,
    remaining_bill: 0,
    payment_status: 'Lunas',
    created_at: '2026-03-12T09:15:00Z'
  },
  {
    id: 'jam-3',
    group_id: 'grp-2',
    person_in_charge: 'Bambang Subianto',
    phone: '081122334455',
    address: 'Kebayoran Baru, Jakarta Selatan',
    total_invoice: 450000000,
    total_paid: 150000000,
    remaining_bill: 300000000,
    payment_status: 'DP 1',
    created_at: '2026-01-20T11:45:00Z'
  },
  {
    id: 'jam-4',
    group_id: 'grp-1',
    person_in_charge: 'Muhibuddin',
    phone: '085299887766',
    address: 'Jl. Merdeka No. 45, Bogor',
    total_invoice: 31500000,
    total_paid: 0,
    remaining_bill: 31500000,
    payment_status: 'Belum Bayar',
    created_at: '2026-03-15T15:20:00Z'
  }
];

const DEFAULT_JAMAAH_MEMBERS = [
  { id: 'mb-1', jamaah_id: 'jam-1', full_name: 'Ahmad Fauzi' },
  { id: 'mb-2', jamaah_id: 'jam-1', full_name: 'Rina Herawati' },
  { id: 'mb-3', jamaah_id: 'jam-1', full_name: 'Fahri Ramadhan' },
  { id: 'mb-4', jamaah_id: 'jam-2', full_name: 'Hj. Siti Aminah' },
  { id: 'mb-5', jamaah_id: 'jam-3', full_name: 'Bambang Subianto' },
  { id: 'mb-6', jamaah_id: 'jam-3', full_name: 'Hartati' },
  { id: 'mb-7', jamaah_id: 'jam-4', full_name: 'Muhibuddin' }
];

const DEFAULT_INVOICES = [
  {
    id: 'inv-1',
    invoice_number: 'INV-202603-0001',
    jamaah_id: 'jam-1',
    group_id: 'grp-1',
    invoice_date: '2026-03-10',
    due_date: '2026-07-05',
    total_amount: 89000000,
    total_paid: 55000000,
    remaining_amount: 34000000,
    status: 'Sebagian', // 'Lunas', 'Sebagian', 'Belum Bayar'
    created_at: '2026-03-10T14:30:00Z'
  },
  {
    id: 'inv-2',
    invoice_number: 'INV-202603-0002',
    jamaah_id: 'jam-2',
    group_id: 'grp-1',
    invoice_date: '2026-03-12',
    due_date: '2026-07-05',
    total_amount: 32000000,
    total_paid: 32000000,
    remaining_amount: 0,
    status: 'Lunas',
    created_at: '2026-03-12T09:15:00Z'
  },
  {
    id: 'inv-3',
    invoice_number: 'INV-202601-0001',
    jamaah_id: 'jam-3',
    group_id: 'grp-2',
    invoice_date: '2026-01-20',
    due_date: '2026-05-15',
    total_amount: 450000000,
    total_paid: 150000000,
    remaining_amount: 300000000,
    status: 'Sebagian',
    created_at: '2026-01-20T11:45:00Z'
  },
  {
    id: 'inv-4',
    invoice_number: 'INV-202603-0003',
    jamaah_id: 'jam-4',
    group_id: 'grp-1',
    invoice_date: '2026-03-15',
    due_date: '2026-07-05',
    total_amount: 31500000,
    total_paid: 0,
    remaining_amount: 31500000,
    status: 'Belum Bayar',
    created_at: '2026-03-15T15:20:00Z'
  }
];

const DEFAULT_INVOICE_ITEMS = [
  // INV-1 (Ahmad Fauzi - 3 pax Silver Package)
  { id: 'item-1', invoice_id: 'inv-1', description: 'Paket Umroh Silver (3 Pax)', qty: 3, price: 29000000, subtotal: 87000000 },
  { id: 'item-2', invoice_id: 'inv-1', description: 'Handling & Perlengkapan', qty: 3, price: 500000, subtotal: 1500000 },
  { id: 'item-3', invoice_id: 'inv-1', description: 'Admin + Materai', qty: 1, price: 500000, subtotal: 500000 },
  // INV-2 (Hj. Siti Aminah - 1 pax Silver Package + Upgrade Room)
  { id: 'item-4', invoice_id: 'inv-2', description: 'Paket Umroh Silver (1 Pax)', qty: 1, price: 29000000, subtotal: 29000000 },
  { id: 'item-5', invoice_id: 'inv-2', description: 'Upgrade Room (Double)', qty: 1, price: 2500000, subtotal: 2500000 },
  { id: 'item-6', invoice_id: 'inv-2', description: 'Handling & Perlengkapan', qty: 1, price: 500000, subtotal: 500000 },
  // INV-3 (Bambang Subianto - 2 pax Haji Furoda VVIP)
  { id: 'item-7', invoice_id: 'inv-3', description: 'Paket Haji Furoda VVIP (2 Pax)', qty: 2, price: 220000000, subtotal: 440000000 },
  { id: 'item-8', invoice_id: 'inv-3', description: 'Handling & Seragam Premium', qty: 2, price: 5000000, subtotal: 10000000 },
  // INV-4 (Muhibuddin - 1 pax Silver Package)
  { id: 'item-9', invoice_id: 'inv-4', description: 'Paket Umroh Silver (1 Pax)', qty: 1, price: 29000000, subtotal: 29000000 },
  { id: 'item-10', invoice_id: 'inv-4', description: 'Paspor & Visa', qty: 1, price: 2000000, subtotal: 2000000 },
  { id: 'item-11', invoice_id: 'inv-4', description: 'Handling & Perlengkapan', qty: 1, price: 500000, subtotal: 500000 },
];

const DEFAULT_PAYMENTS = [
  // Payments for INV-1
  {
    id: 'pay-1',
    payment_number: 'PAY-INV-202603-0001',
    invoice_id: 'inv-1',
    payment_date: '2026-03-10',
    sender_name: 'Ahmad Fauzi',
    payment_method: 'Transfer BSI',
    amount: 25000000,
    description: 'DP Awal Pendaftaran Umroh 3 Pax',
    proof_file: null,
    created_by: 'usr-2',
    created_at: '2026-03-10T14:40:00Z'
  },
  {
    id: 'pay-2',
    payment_number: 'PAY-INV-202604-0001',
    invoice_id: 'inv-1',
    payment_date: '2026-04-15',
    sender_name: 'Ahmad Fauzi',
    payment_method: 'Transfer BSI',
    amount: 30000000,
    description: 'Pembayaran DP 2',
    proof_file: null,
    created_by: 'usr-2',
    created_at: '2026-04-15T10:00:00Z'
  },
  // Payments for INV-2 (Lunas)
  {
    id: 'pay-3',
    payment_number: 'PAY-INV-202603-0002',
    invoice_id: 'inv-2',
    payment_date: '2026-03-12',
    sender_name: 'Hj. Siti Aminah',
    payment_method: 'Transfer Mandiri',
    amount: 32000000,
    description: 'Pelunasan Paket Umroh Syawal',
    proof_file: null,
    created_by: 'usr-2',
    created_at: '2026-03-12T09:30:00Z'
  },
  // Payments for INV-3
  {
    id: 'pay-4',
    payment_number: 'PAY-INV-202601-0001',
    invoice_id: 'inv-3',
    payment_date: '2026-01-20',
    sender_name: 'Bambang Subianto',
    payment_method: 'Transfer BCA',
    amount: 150000000,
    description: 'DP 1 Haji Furoda 2 Pax',
    proof_file: null,
    created_by: 'usr-1',
    created_at: '2026-01-20T12:00:00Z'
  }
];

const DEFAULT_EXPENSES = [
  {
    id: 'exp-1',
    expense_date: '2026-03-05',
    category: 'Hotel',
    description: 'Booking Kamar Retaj Al Hayat Makkah (Kloter Syawal)',
    amount: 45000000,
    attachment: null,
    created_by: 'usr-2',
    created_at: '2026-03-05T11:00:00Z'
  },
  {
    id: 'exp-2',
    expense_date: '2026-03-08',
    category: 'Makan',
    description: 'DP Katering Makkah Madinah (Grup Syawal)',
    amount: 12000000,
    attachment: null,
    created_by: 'usr-2',
    created_at: '2026-03-08T13:15:00Z'
  },
  {
    id: 'exp-3',
    expense_date: '2026-02-15',
    category: 'Tiket',
    description: 'Pembayaran Deposit Block Seat Tiket Garuda (Haji)',
    amount: 100000000,
    attachment: null,
    created_by: 'usr-1',
    created_at: '2026-02-15T09:00:00Z'
  },
  {
    id: 'exp-4',
    expense_date: '2026-04-01',
    category: 'Operasional Kantor',
    description: 'Bayar Listrik & Internet Kantor Bulan Maret',
    amount: 2500000,
    attachment: null,
    created_by: 'usr-2',
    created_at: '2026-04-01T16:00:00Z'
  }
];

const DEFAULT_COMPANY_SETTINGS = {
  company_name: 'Elhakim Umroh Haji Tulungagung',
  company_address: 'Jalan Kesehatan No. 10, Tulungagung',
  company_phone: '0851-4100-9634',
  company_website: 'www.elhakim.co.id',
  company_instagram: '@elhakimtour',
  company_facebook: 'El Hakim Umrah',
  company_whatsapp: '0851-4100-9634',
  company_tiktok: 'elhakimtour',
  company_logo: '/logo lanscape copy.png'
};

const DEFAULT_COMPANY_BANKS = [
  { id: 'bnk-1', bank_name: 'Bank Syariah Indonesia (BSI)', account_number: '7112233445', account_holder: 'Elhakim Umroh Haji Tulungagung', is_active: true },
  { id: 'bnk-2', bank_name: 'Bank Mandiri', account_number: '111-00-9988776', account_holder: 'Elhakim Umroh Haji Tulungagung', is_active: true },
  { id: 'bnk-3', bank_name: 'Bank Central Asia (BCA)', account_number: '0321122334', account_holder: 'Elhakim Umroh Haji Tulungagung', is_active: false }
];

const DEFAULT_TERMS_CONDITIONS = [
  { id: 'tc-1', content: 'Pembayaran DP minimal Rp 5.000.000,- per jamaah saat pendaftaran.' },
  { id: 'tc-2', content: 'Pelunasan biaya paket wajib diselesaikan maksimal 45 hari sebelum tanggal keberangkatan.' },
  { id: 'tc-3', content: 'Dokumen lengkap (Paspor asli, Foto, Buku Nikah/KK, Kartu Vaksin) diserahkan 30 hari sebelum keberangkatan.' },
  { id: 'tc-4', content: 'Pembatalan sepihak dikenakan denda administrasi sesuai dengan jangka waktu pembatalan.' }
];

const DEFAULT_AUDIT_LOGS = [
  { id: 'log-1', user_id: 'usr-1', activity: 'Inisialisasi sistem keuangan Elhakim Travel', old_data: null, new_data: 'Sistem diaktifkan', created_at: '2026-01-01T07:00:00Z' },
  { id: 'log-2', user_id: 'usr-3', activity: 'Membuat Grup Keberangkatan Haji Furoda VVIP 2026', old_data: null, new_data: 'HAJ-2026-VVIP', created_at: '2026-01-10T12:05:00Z' },
  { id: 'log-3', user_id: 'usr-2', activity: 'Penerimaan pembayaran DP Ahmad Fauzi', old_data: null, new_data: 'Kwitansi KWT-INV-202603-0001 senilai Rp 25.000.000', created_at: '2026-03-10T14:42:00Z' },
];

// Initialize Database in LocalStorage
function initDB() {
  const getOrSet = (key, val) => {
    if (!localStorage.getItem(key)) {
      localStorage.setItem(key, JSON.stringify(val));
    }
  };
  getOrSet(STORAGE_KEYS.USERS, DEFAULT_USERS);
  getOrSet(STORAGE_KEYS.GROUPS, DEFAULT_GROUPS);
  getOrSet(STORAGE_KEYS.JAMAAH, DEFAULT_JAMAAH);
  getOrSet(STORAGE_KEYS.JAMAAH_MEMBERS, DEFAULT_JAMAAH_MEMBERS);
  getOrSet(STORAGE_KEYS.INVOICES, DEFAULT_INVOICES);
  getOrSet(STORAGE_KEYS.INVOICE_ITEMS, DEFAULT_INVOICE_ITEMS);
  getOrSet(STORAGE_KEYS.PAYMENTS, DEFAULT_PAYMENTS);
  getOrSet(STORAGE_KEYS.EXPENSES, DEFAULT_EXPENSES);
  getOrSet(STORAGE_KEYS.COMPANY_SETTINGS, DEFAULT_COMPANY_SETTINGS);
  getOrSet(STORAGE_KEYS.COMPANY_BANKS, DEFAULT_COMPANY_BANKS);
  getOrSet(STORAGE_KEYS.TERMS_CONDITIONS, DEFAULT_TERMS_CONDITIONS);
  getOrSet(STORAGE_KEYS.AUDIT_LOGS, DEFAULT_AUDIT_LOGS);
}

// Run immediately
initDB();

// Helper to get data from localStorage
const getTable = (key) => JSON.parse(localStorage.getItem(key)) || [];
const saveTable = (key, data) => localStorage.setItem(key, JSON.stringify(data));

// Audit log helper
export const logActivity = (userId, activity, oldData = null, newData = null) => {
  const logs = getTable(STORAGE_KEYS.AUDIT_LOGS);
  const newLog = {
    id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    user_id: userId || 'system',
    activity,
    old_data: oldData ? (typeof oldData === 'object' ? JSON.stringify(oldData) : oldData) : null,
    new_data: newData ? (typeof newData === 'object' ? JSON.stringify(newData) : newData) : null,
    created_at: new Date().toISOString()
  };
  logs.unshift(newLog); // Put latest logs first
  saveTable(STORAGE_KEYS.AUDIT_LOGS, logs);
};

// DATABASE SERVICES
export const mockDB = {
  // Users
  users: {
    getAll: () => getTable(STORAGE_KEYS.USERS),
    getById: (id) => getTable(STORAGE_KEYS.USERS).find(u => u.id === id),
    getByEmail: (email) => getTable(STORAGE_KEYS.USERS).find(u => u.email === email),
    save: (user, actingUserId) => {
      const users = getTable(STORAGE_KEYS.USERS);
      const idx = users.findIndex(u => u.id === user.id);
      if (idx > -1) {
        const old = users[idx];
        users[idx] = { ...old, ...user };
        saveTable(STORAGE_KEYS.USERS, users);
        logActivity(actingUserId, `Update user: ${user.name}`, old, user);
      } else {
        const newUser = { id: `usr-${Date.now()}`, ...user, created_at: new Date().toISOString() };
        users.push(newUser);
        saveTable(STORAGE_KEYS.USERS, users);
        logActivity(actingUserId, `Tambah user baru: ${user.name}`, null, newUser);
      }
      return true;
    },
    delete: (id, actingUserId) => {
      const users = getTable(STORAGE_KEYS.USERS);
      const user = users.find(u => u.id === id);
      const filtered = users.filter(u => u.id !== id);
      saveTable(STORAGE_KEYS.USERS, filtered);
      logActivity(actingUserId, `Hapus user: ${user?.name || id}`, user, null);
      return true;
    }
  },

  // Groups
  groups: {
    getAll: () => getTable(STORAGE_KEYS.GROUPS),
    getById: (id) => getTable(STORAGE_KEYS.GROUPS).find(g => g.id === id),
    save: (group, actingUserId) => {
      const groups = getTable(STORAGE_KEYS.GROUPS);
      const idx = groups.findIndex(g => g.id === group.id);
      if (idx > -1) {
        const old = groups[idx];
        groups[idx] = { ...old, ...group };
        saveTable(STORAGE_KEYS.GROUPS, groups);
        logActivity(actingUserId, `Update grup: ${group.group_name}`, old, group);
        return groups[idx];
      } else {
        const newGroup = { id: `grp-${Date.now()}`, ...group, created_at: new Date().toISOString() };
        groups.push(newGroup);
        saveTable(STORAGE_KEYS.GROUPS, groups);
        logActivity(actingUserId, `Tambah grup baru: ${group.group_name}`, null, newGroup);
        return newGroup;
      }
    },
    delete: (id, actingUserId) => {
      const groups = getTable(STORAGE_KEYS.GROUPS);
      const grp = groups.find(g => g.id === id);
      const filtered = groups.filter(g => g.id !== id);
      saveTable(STORAGE_KEYS.GROUPS, filtered);
      logActivity(actingUserId, `Hapus grup: ${grp?.group_name || id}`, grp, null);
      return true;
    }
  },

  // Jamaah & Invoices (Linked concept)
  jamaah: {
    getAll: () => getTable(STORAGE_KEYS.JAMAAH),
    getById: (id) => getTable(STORAGE_KEYS.JAMAAH).find(j => j.id === id),
    getByGroup: (groupId) => getTable(STORAGE_KEYS.JAMAAH).filter(j => j.group_id === groupId),
    getMembers: (jamaahId) => getTable(STORAGE_KEYS.JAMAAH_MEMBERS).filter(m => m.jamaah_id === jamaahId),
    
    // Save new jamaah + members + create invoice + invoice items
    save: (payload, actingUserId) => {
      const jamaahTable = getTable(STORAGE_KEYS.JAMAAH);
      const membersTable = getTable(STORAGE_KEYS.JAMAAH_MEMBERS);
      const invoicesTable = getTable(STORAGE_KEYS.INVOICES);
      const itemsTable = getTable(STORAGE_KEYS.INVOICE_ITEMS);
      
      const { jamaah, members, invoiceItems } = payload;
      const isEdit = !!jamaah.id;
      
      let finalJamaah;
      
      if (isEdit) {
        // Edit existing jamaah
        const idx = jamaahTable.findIndex(j => j.id === jamaah.id);
        const old = jamaahTable[idx];
        finalJamaah = { ...old, ...jamaah };
        jamaahTable[idx] = finalJamaah;
        saveTable(STORAGE_KEYS.JAMAAH, jamaahTable);
        
        // Replace members
        const filteredMembers = membersTable.filter(m => m.jamaah_id !== jamaah.id);
        const newMembers = members.map(name => ({
          id: `mb-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          jamaah_id: jamaah.id,
          full_name: name
        }));
        saveTable(STORAGE_KEYS.JAMAAH_MEMBERS, [...filteredMembers, ...newMembers]);
        
        // Find existing invoice
        const invIdx = invoicesTable.findIndex(i => i.jamaah_id === jamaah.id);
        if (invIdx > -1) {
          const invoice = invoicesTable[invIdx];
          const oldInv = { ...invoice };
          
          // Re-calculate invoice amount based on edited invoiceItems
          const totalAmount = invoiceItems.reduce((acc, item) => acc + (item.qty * item.price), 0);
          invoice.total_amount = totalAmount;
          invoice.remaining_amount = totalAmount - invoice.total_paid;
          
          // Update Invoice Status
          if (invoice.remaining_amount <= 0) {
            invoice.status = 'Lunas';
          } else if (invoice.total_paid > 0) {
            invoice.status = 'Sebagian';
          } else {
            invoice.status = 'Belum Bayar';
          }
          
          invoicesTable[invIdx] = invoice;
          saveTable(STORAGE_KEYS.INVOICES, invoicesTable);
          
          // Update jamaah figures as well
          finalJamaah.total_invoice = totalAmount;
          finalJamaah.remaining_bill = totalAmount - finalJamaah.total_paid;
          
          // Re-evaluate payment status
          const payments = getTable(STORAGE_KEYS.PAYMENTS).filter(p => p.invoice_id === invoice.id);
          const paymentCount = payments.length;
          if (finalJamaah.remaining_bill <= 0) {
            finalJamaah.payment_status = 'Lunas';
          } else if (paymentCount === 1) {
            finalJamaah.payment_status = 'DP 1';
          } else if (paymentCount === 2) {
            finalJamaah.payment_status = 'DP 2';
          } else if (paymentCount >= 3) {
            finalJamaah.payment_status = 'DP 3';
          } else {
            finalJamaah.payment_status = 'Belum Bayar';
          }
          
          // Save updated jamaah
          const jamIdx = jamaahTable.findIndex(j => j.id === jamaah.id);
          jamaahTable[jamIdx] = finalJamaah;
          saveTable(STORAGE_KEYS.JAMAAH, jamaahTable);
          
          // Replace invoice items
          const filteredItems = itemsTable.filter(item => item.invoice_id !== invoice.id);
          const newItems = invoiceItems.map(item => ({
            id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            invoice_id: invoice.id,
            description: item.description,
            qty: Number(item.qty),
            price: Number(item.price),
            subtotal: Number(item.qty) * Number(item.price)
          }));
          saveTable(STORAGE_KEYS.INVOICE_ITEMS, [...filteredItems, ...newItems]);
        }
        
        logActivity(actingUserId, `Edit Jamaah: ${jamaah.person_in_charge}`, old, finalJamaah);
      } else {
        // Create new jamaah
        const jamaahId = `jam-${Date.now()}`;
        const totalAmount = invoiceItems.reduce((acc, item) => acc + (Number(item.qty) * Number(item.price)), 0);
        
        finalJamaah = {
          id: jamaahId,
          group_id: jamaah.group_id,
          person_in_charge: jamaah.person_in_charge,
          phone: jamaah.phone,
          address: jamaah.address,
          total_invoice: totalAmount,
          total_paid: 0,
          remaining_bill: totalAmount,
          payment_status: 'Belum Bayar',
          created_at: new Date().toISOString()
        };
        
        jamaahTable.push(finalJamaah);
        saveTable(STORAGE_KEYS.JAMAAH, jamaahTable);
        
        // Add members
        const newMembers = members.map(name => ({
          id: `mb-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          jamaah_id: jamaahId,
          full_name: name
        }));
        membersTable.push(...newMembers);
        saveTable(STORAGE_KEYS.JAMAAH_MEMBERS, membersTable);
        
        // Create Invoice Automatically
        const invoiceId = `inv-${Date.now()}`;
        // Generate Invoice Number automatically (Format: INV-YYYYMM-XXXX)
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const count = invoicesTable.length + 1;
        const invoiceNum = `INV-${year}${month}-${String(count).padStart(4, '0')}`;
        
        const group = getTable(STORAGE_KEYS.GROUPS).find(g => g.id === jamaah.group_id);
        const newInvoice = {
          id: invoiceId,
          invoice_number: invoiceNum,
          jamaah_id: jamaahId,
          group_id: jamaah.group_id,
          invoice_date: new Date().toISOString().split('T')[0],
          due_date: group?.due_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          total_amount: totalAmount,
          total_paid: 0,
          remaining_amount: totalAmount,
          status: 'Belum Bayar',
          created_at: new Date().toISOString()
        };
        invoicesTable.push(newInvoice);
        saveTable(STORAGE_KEYS.INVOICES, invoicesTable);
        
        // Add Invoice Items
        const newItems = invoiceItems.map(item => ({
          id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          invoice_id: invoiceId,
          description: item.description,
          qty: Number(item.qty),
          price: Number(item.price),
          subtotal: Number(item.qty) * Number(item.price)
        }));
        itemsTable.push(...newItems);
        saveTable(STORAGE_KEYS.INVOICE_ITEMS, itemsTable);
        
        logActivity(actingUserId, `Tambah Jamaah & Invoice baru: ${jamaah.person_in_charge}`, null, finalJamaah);
      }
      
      return finalJamaah;
    },
    
    delete: (id, actingUserId) => {
      const jamaahTable = getTable(STORAGE_KEYS.JAMAAH);
      const membersTable = getTable(STORAGE_KEYS.JAMAAH_MEMBERS);
      const invoicesTable = getTable(STORAGE_KEYS.INVOICES);
      const itemsTable = getTable(STORAGE_KEYS.INVOICE_ITEMS);
      const paymentsTable = getTable(STORAGE_KEYS.PAYMENTS);
      
      const jam = jamaahTable.find(j => j.id === id);
      if (!jam) return false;
      
      // Delete Jamaah
      saveTable(STORAGE_KEYS.JAMAAH, jamaahTable.filter(j => j.id !== id));
      // Delete Members
      saveTable(STORAGE_KEYS.JAMAAH_MEMBERS, membersTable.filter(m => m.jamaah_id !== id));
      
      // Find invoices to delete related items and payments
      const relatedInvs = invoicesTable.filter(i => i.jamaah_id === id);
      const invIds = relatedInvs.map(i => i.id);
      
      // Delete Invoices
      saveTable(STORAGE_KEYS.INVOICES, invoicesTable.filter(i => i.jamaah_id !== id));
      // Delete Invoice Items
      saveTable(STORAGE_KEYS.INVOICE_ITEMS, itemsTable.filter(item => !invIds.includes(item.invoice_id)));
      // Delete Payments
      saveTable(STORAGE_KEYS.PAYMENTS, paymentsTable.filter(p => !invIds.includes(p.invoice_id)));
      
      logActivity(actingUserId, `Hapus Jamaah & tagihan terkait: ${jam.person_in_charge}`, jam, null);
      return true;
    }
  },

  // Invoices & Items
  invoices: {
    getAll: () => getTable(STORAGE_KEYS.INVOICES),
    getById: (id) => getTable(STORAGE_KEYS.INVOICES).find(i => i.id === id),
    getByJamaah: (jamaahId) => getTable(STORAGE_KEYS.INVOICES).find(i => i.jamaah_id === jamaahId),
    getItems: (invoiceId) => getTable(STORAGE_KEYS.INVOICE_ITEMS).filter(item => item.invoice_id === invoiceId),
    getByGroup: (groupId) => getTable(STORAGE_KEYS.INVOICES).filter(i => i.group_id === groupId),
  },

  // Payments & Receipts (Kwitansi)
  payments: {
    getAll: () => getTable(STORAGE_KEYS.PAYMENTS),
    getById: (id) => getTable(STORAGE_KEYS.PAYMENTS).find(p => p.id === id),
    getByInvoice: (invoiceId) => getTable(STORAGE_KEYS.PAYMENTS).filter(p => p.invoice_id === invoiceId),
    
    // Save payment & update invoice/jamaah status
    save: (payment, actingUserId) => {
      const payments = getTable(STORAGE_KEYS.PAYMENTS);
      const invoices = getTable(STORAGE_KEYS.INVOICES);
      const jamaahs = getTable(STORAGE_KEYS.JAMAAH);
      
      const isEdit = !!payment.id;
      let savedPayment;
      
      if (isEdit) {
        const idx = payments.findIndex(p => p.id === payment.id);
        const old = payments[idx];
        savedPayment = { ...old, ...payment };
        payments[idx] = savedPayment;
        saveTable(STORAGE_KEYS.PAYMENTS, payments);
        logActivity(actingUserId, `Edit Pembayaran: ${payment.payment_number}`, old, savedPayment);
      } else {
        // Generate automatic payment number (Format: PAY-INV-YYYYMM-XXXX)
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const count = payments.length + 1;
        const payNum = `PAY-INV-${year}${month}-${String(count).padStart(4, '0')}`;
        
        savedPayment = {
          id: `pay-${Date.now()}`,
          payment_number: payNum,
          ...payment,
          amount: Number(payment.amount),
          created_at: new Date().toISOString(),
          created_by: actingUserId || 'usr-2'
        };
        payments.push(savedPayment);
        saveTable(STORAGE_KEYS.PAYMENTS, payments);
        logActivity(actingUserId, `Terima Pembayaran Baru: ${payNum}`, null, savedPayment);
      }
      
      // Recalculate linked Invoice
      const invoice = invoices.find(i => i.id === savedPayment.invoice_id);
      if (invoice) {
        // Get all payments for this invoice
        const invPayments = payments.filter(p => p.invoice_id === invoice.id);
        const totalPaid = invPayments.reduce((sum, p) => sum + Number(p.amount), 0);
        
        invoice.total_paid = totalPaid;
        invoice.remaining_amount = Math.max(0, invoice.total_amount - totalPaid);
        
        // Status Update
        if (invoice.remaining_amount <= 0) {
          invoice.status = 'Lunas';
        } else if (invoice.total_paid > 0) {
          invoice.status = 'Sebagian';
        } else {
          invoice.status = 'Belum Bayar';
        }
        
        // Save invoice
        saveTable(STORAGE_KEYS.INVOICES, invoices);
        
        // Recalculate linked Jamaah
        const jamaah = jamaahs.find(j => j.id === invoice.jamaah_id);
        if (jamaah) {
          jamaah.total_paid = totalPaid;
          jamaah.remaining_bill = invoice.remaining_amount;
          
          // Set payment status based on number of payments + lunas
          // 0% = Belum Bayar, 1 pay = DP 1, 2 pay = DP 2, 3 pay = DP 3, lunas = Lunas
          const paymentCount = invPayments.length;
          if (jamaah.remaining_bill <= 0) {
            jamaah.payment_status = 'Lunas';
          } else if (paymentCount === 1) {
            jamaah.payment_status = 'DP 1';
          } else if (paymentCount === 2) {
            jamaah.payment_status = 'DP 2';
          } else if (paymentCount >= 3) {
            jamaah.payment_status = 'DP 3';
          } else {
            jamaah.payment_status = 'Belum Bayar';
          }
          
          saveTable(STORAGE_KEYS.JAMAAH, jamaahs);
        }
      }
      
      return savedPayment;
    },
    
    delete: (id, actingUserId) => {
      const payments = getTable(STORAGE_KEYS.PAYMENTS);
      const invoices = getTable(STORAGE_KEYS.INVOICES);
      const jamaahs = getTable(STORAGE_KEYS.JAMAAH);
      
      const pay = payments.find(p => p.id === id);
      if (!pay) return false;
      
      const filtered = payments.filter(p => p.id !== id);
      saveTable(STORAGE_KEYS.PAYMENTS, filtered);
      logActivity(actingUserId, `Hapus Pembayaran: ${pay.payment_number}`, pay, null);
      
      // Re-trigger calculation for Invoice
      const invoice = invoices.find(i => i.id === pay.invoice_id);
      if (invoice) {
        const invPayments = filtered.filter(p => p.invoice_id === invoice.id);
        const totalPaid = invPayments.reduce((sum, p) => sum + Number(p.amount), 0);
        
        invoice.total_paid = totalPaid;
        invoice.remaining_amount = Math.max(0, invoice.total_amount - totalPaid);
        
        if (invoice.remaining_amount <= 0) {
          invoice.status = 'Lunas';
        } else if (invoice.total_paid > 0) {
          invoice.status = 'Sebagian';
        } else {
          invoice.status = 'Belum Bayar';
        }
        saveTable(STORAGE_KEYS.INVOICES, invoices);
        
        const jamaah = jamaahs.find(j => j.id === invoice.jamaah_id);
        if (jamaah) {
          jamaah.total_paid = totalPaid;
          jamaah.remaining_bill = invoice.remaining_amount;
          
          const paymentCount = invPayments.length;
          if (jamaah.remaining_bill <= 0) {
            jamaah.payment_status = 'Lunas';
          } else if (paymentCount === 1) {
            jamaah.payment_status = 'DP 1';
          } else if (paymentCount === 2) {
            jamaah.payment_status = 'DP 2';
          } else if (paymentCount >= 3) {
            jamaah.payment_status = 'DP 3';
          } else {
            jamaah.payment_status = 'Belum Bayar';
          }
          saveTable(STORAGE_KEYS.JAMAAH, jamaahs);
        }
      }
      
      return true;
    }
  },

  // Expenses (Pengeluaran)
  expenses: {
    getAll: () => getTable(STORAGE_KEYS.EXPENSES).sort((a, b) => new Date(b.expense_date) - new Date(a.expense_date)),
    getById: (id) => getTable(STORAGE_KEYS.EXPENSES).find(e => e.id === id),
    save: (expense, actingUserId) => {
      const expenses = getTable(STORAGE_KEYS.EXPENSES);
      const idx = expenses.findIndex(e => e.id === expense.id);
      
      let savedExpense;
      if (idx > -1) {
        const old = expenses[idx];
        savedExpense = { ...old, ...expense, amount: Number(expense.amount) };
        expenses[idx] = savedExpense;
        saveTable(STORAGE_KEYS.EXPENSES, expenses);
        logActivity(actingUserId, `Update pengeluaran: ${expense.description}`, old, savedExpense);
      } else {
        savedExpense = {
          id: `exp-${Date.now()}`,
          ...expense,
          amount: Number(expense.amount),
          created_at: new Date().toISOString(),
          created_by: actingUserId || 'usr-2'
        };
        expenses.push(savedExpense);
        saveTable(STORAGE_KEYS.EXPENSES, expenses);
        logActivity(actingUserId, `Tambah pengeluaran baru: ${expense.description}`, null, savedExpense);
      }
      return savedExpense;
    },
    delete: (id, actingUserId) => {
      const expenses = getTable(STORAGE_KEYS.EXPENSES);
      const exp = expenses.find(e => e.id === id);
      const filtered = expenses.filter(e => e.id !== id);
      saveTable(STORAGE_KEYS.EXPENSES, filtered);
      logActivity(actingUserId, `Hapus pengeluaran: ${exp?.description || id}`, exp, null);
      return true;
    }
  },

  // Settings
  settings: {
    getCompany: () => getTable(STORAGE_KEYS.COMPANY_SETTINGS),
    saveCompany: (settings, actingUserId) => {
      const old = getTable(STORAGE_KEYS.COMPANY_SETTINGS);
      saveTable(STORAGE_KEYS.COMPANY_SETTINGS, settings);
      logActivity(actingUserId, 'Update Profil Perusahaan', old, settings);
      return true;
    },
    getBanks: () => getTable(STORAGE_KEYS.COMPANY_BANKS),
    saveBank: (bank, actingUserId) => {
      const banks = getTable(STORAGE_KEYS.COMPANY_BANKS);
      const idx = banks.findIndex(b => b.id === bank.id);
      if (idx > -1) {
        const old = banks[idx];
        banks[idx] = { ...old, ...bank };
        saveTable(STORAGE_KEYS.COMPANY_BANKS, banks);
        logActivity(actingUserId, `Update Rekening: ${bank.bank_name}`, old, bank);
      } else {
        const newBank = { id: `bnk-${Date.now()}`, ...bank };
        banks.push(newBank);
        saveTable(STORAGE_KEYS.COMPANY_BANKS, banks);
        logActivity(actingUserId, `Tambah Rekening Baru: ${bank.bank_name}`, null, newBank);
      }
      return true;
    },
    deleteBank: (id, actingUserId) => {
      const banks = getTable(STORAGE_KEYS.COMPANY_BANKS);
      const bank = banks.find(b => b.id === id);
      const filtered = banks.filter(b => b.id !== id);
      saveTable(STORAGE_KEYS.COMPANY_BANKS, filtered);
      logActivity(actingUserId, `Hapus Rekening: ${bank?.bank_name || id}`, bank, null);
      return true;
    },
    getTerms: () => getTable(STORAGE_KEYS.TERMS_CONDITIONS),
    saveTerms: (termsList, actingUserId) => {
      const old = getTable(STORAGE_KEYS.TERMS_CONDITIONS);
      saveTable(STORAGE_KEYS.TERMS_CONDITIONS, termsList);
      logActivity(actingUserId, 'Update Terms & Conditions', old, termsList);
      return true;
    }
  },

  // Audit Logs
  auditLogs: {
    getAll: () => getTable(STORAGE_KEYS.AUDIT_LOGS)
  },

  // Reset database to default
  resetDB: () => {
    localStorage.removeItem(STORAGE_KEYS.USERS);
    localStorage.removeItem(STORAGE_KEYS.GROUPS);
    localStorage.removeItem(STORAGE_KEYS.JAMAAH);
    localStorage.removeItem(STORAGE_KEYS.JAMAAH_MEMBERS);
    localStorage.removeItem(STORAGE_KEYS.INVOICES);
    localStorage.removeItem(STORAGE_KEYS.INVOICE_ITEMS);
    localStorage.removeItem(STORAGE_KEYS.PAYMENTS);
    localStorage.removeItem(STORAGE_KEYS.EXPENSES);
    localStorage.removeItem(STORAGE_KEYS.COMPANY_SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.COMPANY_BANKS);
    localStorage.removeItem(STORAGE_KEYS.TERMS_CONDITIONS);
    localStorage.removeItem(STORAGE_KEYS.AUDIT_LOGS);
    initDB();
    return true;
  }
};

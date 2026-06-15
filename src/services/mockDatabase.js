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

const DEFAULT_GROUPS = [];
const DEFAULT_JAMAAH = [];
const DEFAULT_JAMAAH_MEMBERS = [];
const DEFAULT_INVOICES = [];
const DEFAULT_INVOICE_ITEMS = [];
const DEFAULT_PAYMENTS = [];
const DEFAULT_EXPENSES = [];
const DEFAULT_AUDIT_LOGS = [];

const DEFAULT_COMPANY_SETTINGS = {
  company_name: 'Elhakim Umroh Haji Tulungagung',
  company_address: 'Jalan Kesehatan No. 10, Tulungagung',
  company_phone: '0851-4100-9634',
  company_website: 'www.elhakim.co.id',
  company_instagram: '@elhakimtour',
  company_facebook: 'El Hakim Umrah',
  company_whatsapp: '0851-4100-9634',
  company_tiktok: 'elhakimtour',
  company_logo: 'logo lanscape copy.png'
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
        const jamaah = getTable(STORAGE_KEYS.JAMAAH);
        const jamaahMembers = getTable(STORAGE_KEYS.JAMAAH_MEMBERS);
        const invoices = getTable(STORAGE_KEYS.INVOICES);
        const invoiceItems = getTable(STORAGE_KEYS.INVOICE_ITEMS);
        const payments = getTable(STORAGE_KEYS.PAYMENTS);

        const groupToDelete = groups.find(g => g.id === id);
        if (!groupToDelete) return false;

        // Log group deletion
        logActivity(actingUserId, `Hapus grup: ${groupToDelete.group_name}`, groupToDelete, null);

        // Find all jamaah related to the group
        const relatedJamaah = jamaah.filter(j => j.group_id === id);
        const relatedJamaahIds = relatedJamaah.map(j => j.id);

        // Find all invoices related to the group
        const relatedInvoices = invoices.filter(i => i.group_id === id);
        const relatedInvoiceIds = relatedInvoices.map(i => i.id);

        // Filter out all related data
        const remainingGroups = groups.filter(g => g.id !== id);
        const remainingJamaah = jamaah.filter(j => j.group_id !== id);
        const remainingMembers = jamaahMembers.filter(m => !relatedJamaahIds.includes(m.jamaah_id));
        const remainingInvoices = invoices.filter(i => i.group_id !== id);
        const remainingInvoiceItems = invoiceItems.filter(item => !relatedInvoiceIds.includes(item.invoice_id));
        const remainingPayments = payments.filter(p => !relatedInvoiceIds.includes(p.invoice_id));

        // Save the filtered tables back to localStorage
        saveTable(STORAGE_KEYS.GROUPS, remainingGroups);
        saveTable(STORAGE_KEYS.JAMAAH, remainingJamaah);
        saveTable(STORAGE_KEYS.JAMAAH_MEMBERS, remainingMembers);
        saveTable(STORAGE_KEYS.INVOICES, remainingInvoices);
        saveTable(STORAGE_KEYS.INVOICE_ITEMS, remainingInvoiceItems);
        saveTable(STORAGE_KEYS.PAYMENTS, remainingPayments);

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

  // Reset database to a clean slate, preserving users and settings
  resetDB: (actingUserId) => {
    saveTable(STORAGE_KEYS.GROUPS, []);
    saveTable(STORAGE_KEYS.JAMAAH, []);
    saveTable(STORAGE_KEYS.JAMAAH_MEMBERS, []);
    saveTable(STORAGE_KEYS.INVOICES, []);
    saveTable(STORAGE_KEYS.INVOICE_ITEMS, []);
    saveTable(STORAGE_KEYS.PAYMENTS, []);
    saveTable(STORAGE_KEYS.EXPENSES, []);
    saveTable(STORAGE_KEYS.AUDIT_LOGS, []);
    logActivity(actingUserId, 'RESET DATABASE', 'all transactional data', 'empty');
    return true;
  }
};

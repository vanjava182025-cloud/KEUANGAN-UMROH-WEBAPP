import { supabase, isSupabaseConfigured } from './supabaseClient';
import { mockDB } from './mockDatabase';

// Unified Service to manage all CRUD with Supabase or MockDB fallback
export const dbService = {
  // Users Management
  users: {
    getAll: async () => {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase.from('users').select('*');
        if (!error) return data;
        console.error('Error fetching users from Supabase:', error.message);
      }
      return mockDB.users.getAll();
    },
    getById: async (id) => {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase.from('users').select('*').eq('id', id).single();
        if (!error) return data;
      }
      return mockDB.users.getById(id);
    },
    getByEmail: async (email) => {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase.from('users').select('*').eq('email', email).maybeSingle();
        if (!error) return data;
      }
      return mockDB.users.getByEmail(email);
    },
    save: async (user, actingUserId) => {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase.from('users').upsert(user).select().single();
        if (!error) return data;
        console.error('Error saving user to Supabase:', error.message);
      }
      return mockDB.users.save(user, actingUserId);
    },
    delete: async (id, actingUserId) => {
      if (isSupabaseConfigured) {
        const { error } = await supabase.from('users').delete().eq('id', id);
        if (!error) return true;
        console.error('Error deleting user from Supabase:', error.message);
      }
      return mockDB.users.delete(id, actingUserId);
    }
  },

  // Groups Management
  groups: {
    getAll: async () => {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase.from('groups').select('*').order('created_at', { ascending: false });
        if (!error) return data;
        console.error('Error fetching groups from Supabase:', error.message);
      }
      return mockDB.groups.getAll();
    },
    getById: async (id) => {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase.from('groups').select('*').eq('id', id).single();
        if (!error) return data;
        console.error('Error fetching group by ID from Supabase:', error.message);
      }
      return mockDB.groups.getById(id);
    },
    save: async (group, actingUserId) => {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase.from('groups').upsert(group).select().single();
        if (!error) return data;
        console.error('Error saving group to Supabase:', error.message);
      }
      return mockDB.groups.save(group, actingUserId);
    },
    delete: async (id, actingUserId) => {
      if (isSupabaseConfigured) {
        const { error } = await supabase.from('groups').delete().eq('id', id);
        if (!error) return true;
        console.error('Error deleting group from Supabase:', error.message);
      }
      return mockDB.groups.delete(id, actingUserId);
    }
  },

  // Jamaah Management
  jamaah: {
    getAll: async () => {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase.from('jamaah').select('*').order('created_at', { ascending: false });
        if (!error) return data;
        console.error('Error fetching jamaah from Supabase:', error.message);
      }
      return mockDB.jamaah.getAll();
    },
    getById: async (id) => {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase.from('jamaah').select('*').eq('id', id).single();
        if (!error) return data;
      }
      return mockDB.jamaah.getById(id);
    },
    getByGroup: async (groupId) => {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase.from('jamaah').select('*').eq('group_id', groupId);
        if (!error) return data;
      }
      return mockDB.jamaah.getByGroup(groupId);
    },
    getMembers: async (jamaahId) => {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase.from('jamaah_members').select('*').eq('jamaah_id', jamaahId);
        if (!error) return data;
      }
      return mockDB.jamaah.getMembers(jamaahId);
    },
    save: async (payload, actingUserId) => {
      // In Supabase, this would normally involve transactions or multiple client calls.
      // For absolute correctness and safety, we run it locally and sync or fall back.
      if (isSupabaseConfigured) {
        try {
          const { jamaah, members, invoiceItems } = payload;
          const { data: savedJam, error: jamErr } = await supabase.from('jamaah').upsert(jamaah).select().single();
          if (jamErr) throw jamErr;

          // Delete and insert members
          await supabase.from('jamaah_members').delete().eq('jamaah_id', savedJam.id);
          const memberRows = members.map(name => ({ jamaah_id: savedJam.id, full_name: name }));
          await supabase.from('jamaah_members').insert(memberRows);

          // Get/Create invoice
          let { data: invoice, error: invGetErr } = await supabase.from('invoices').select('*').eq('jamaah_id', savedJam.id).maybeSingle();
          const { data: groupData, error: groupErr } = await supabase.from('groups').select('due_date').eq('id', savedJam.group_id).maybeSingle();
          const totalAmount = invoiceItems.reduce((acc, item) => acc + (item.qty * item.price), 0);

          if (!invoice) {
            const date = new Date();
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const { count } = await supabase.from('invoices').select('*', { count: 'exact', head: true });
            const invoiceNum = `INV-${year}${month}-${String((count || 0) + 1).padStart(4, '0')}`;
            const invoiceDueDate = groupData?.due_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

            const { data: newInv, error: invInsErr } = await supabase.from('invoices').insert({
              invoice_number: invoiceNum,
              jamaah_id: savedJam.id,
              group_id: savedJam.group_id,
              invoice_date: new Date().toISOString().split('T')[0],
              due_date: invoiceDueDate,
              total_amount: totalAmount,
              total_paid: 0,
              remaining_amount: totalAmount,
              status: 'Belum Bayar'
            }).select().single();
            if (invInsErr) throw invInsErr;
            invoice = newInv;
          } else {
            const { data: updatedInv, error: invUpdErr } = await supabase.from('invoices').update({
              total_amount: totalAmount,
              remaining_amount: totalAmount - invoice.total_paid,
              status: (totalAmount - invoice.total_paid) <= 0 ? 'Lunas' : (invoice.total_paid > 0 ? 'Sebagian' : 'Belum Bayar')
            }).eq('id', invoice.id).select().single();
            if (invUpdErr) throw invUpdErr;
            invoice = updatedInv;
          }

          // Delete and insert invoice items
          await supabase.from('invoice_items').delete().eq('invoice_id', invoice.id);
          const itemRows = invoiceItems.map(item => ({
            invoice_id: invoice.id,
            description: item.description,
            qty: Number(item.qty),
            price: Number(item.price),
            subtotal: Number(item.qty) * Number(item.price)
          }));
          await supabase.from('invoice_items').insert(itemRows);

          // Update Jam total_invoice & remaining_bill
          await supabase.from('jamaah').update({
            total_invoice: totalAmount,
            remaining_bill: totalAmount - savedJam.total_paid,
            payment_status: (totalAmount - savedJam.total_paid) <= 0 ? 'Lunas' : (savedJam.total_paid > 0 ? 'DP 1' : 'Belum Bayar') // simplification
          }).eq('id', savedJam.id);

          return savedJam;
        } catch (e) {
          console.error('Supabase multi-table save transaction failed, falling back to Mock:', e.message);
        }
      }
      return mockDB.jamaah.save(payload, actingUserId);
    },
    delete: async (id, actingUserId) => {
      if (isSupabaseConfigured) {
        // Cascade delete on supabase if FK is configured, otherwise manual:
        try {
          const { data: invoice } = await supabase.from('invoices').select('id').eq('jamaah_id', id).maybeSingle();
          if (invoice) {
            await supabase.from('invoice_items').delete().eq('invoice_id', invoice.id);
            await supabase.from('payments').delete().eq('invoice_id', invoice.id);
            await supabase.from('invoices').delete().eq('id', invoice.id);
          }
          await supabase.from('jamaah_members').delete().eq('jamaah_id', id);
          const { error } = await supabase.from('jamaah').delete().eq('id', id);
          if (!error) return true;
        } catch (e) {
          console.error('Error cascading delete in Supabase:', e);
        }
      }
      return mockDB.jamaah.delete(id, actingUserId);
    }
  },

  // Invoices & Items
  invoices: {
    getAll: async () => {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase.from('invoices').select('*');
        if (!error) return data;
      }
      return mockDB.invoices.getAll();
    },
    getById: async (id) => {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase.from('invoices').select('*').eq('id', id).single();
        if (!error) return data;
      }
      return mockDB.invoices.getById(id);
    },
    getByJamaah: async (jamaahId) => {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase.from('invoices').select('*').eq('jamaah_id', jamaahId).maybeSingle();
        if (!error) return data;
      }
      return mockDB.invoices.getByJamaah(jamaahId);
    },
    getItems: async (invoiceId) => {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase.from('invoice_items').select('*').eq('invoice_id', invoiceId);
        if (!error) return data;
      }
      return mockDB.invoices.getItems(invoiceId);
    },
    getByGroup: async (groupId) => {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase.from('invoices').select('*').eq('group_id', groupId);
        if (!error) return data;
      }
      return mockDB.invoices.getByGroup(groupId);
    }
  },

  // Payments Management
  payments: {
    getAll: async () => {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase.from('payments').select('*').order('payment_date', { ascending: false });
        if (!error) return data;
      }
      return mockDB.payments.getAll();
    },
    getById: async (id) => {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase.from('payments').select('*').eq('id', id).single();
        if (!error) return data;
      }
      return mockDB.payments.getById(id);
    },
    getByInvoice: async (invoiceId) => {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase.from('payments').select('*').eq('invoice_id', invoiceId);
        if (!error) return data;
      }
      return mockDB.payments.getByInvoice(invoiceId);
    },
    save: async (payment, actingUserId) => {
      if (isSupabaseConfigured) {
        // Run database upsert & trigger sync (in production, triggers/functions on DB handles recalculations)
        try {
          const { data, error } = await supabase.from('payments').upsert(payment).select().single();
          if (!error) {
            // Recalculate and update the invoice and jamaah table
            // Similar to the mock logic, query related tables and update
            return data;
          }
        } catch (err) {
          console.error('Supabase payments write failed:', err);
        }
      }
      return mockDB.payments.save(payment, actingUserId);
    },
    delete: async (id, actingUserId) => {
      if (isSupabaseConfigured) {
        const { data: payment, error: fetchError } = await supabase.from('payments').select('id, invoice_id, amount').eq('id', id).single();
        if (fetchError) {
          console.error('Error fetching payment for deletion:', fetchError.message);
          return false;
        }

        const { error } = await supabase.from('payments').delete().eq('id', id);
        if (error) {
          console.error('Error deleting payment from Supabase:', error.message);
          return false;
        }

        // Recalculate invoice totals
        const { data: invoice, error: invoiceError } = await supabase.from('invoices').select('*').eq('id', payment.invoice_id).single();
        if (invoiceError) {
          console.error('Error fetching invoice for recalculation:', invoiceError.message);
          return true; // Deletion was successful, but recalculation failed
        }

        const newTotalPaid = (invoice.total_paid || 0) - payment.amount;
        const newRemainingAmount = invoice.total_amount - newTotalPaid;
        const newStatus = newRemainingAmount <= 0 ? 'Lunas' : (newTotalPaid > 0 ? 'Sebagian' : 'Belum Bayar');

        await supabase.from('invoices').update({
          total_paid: newTotalPaid,
          remaining_amount: newRemainingAmount,
          status: newStatus
        }).eq('id', invoice.id);

        return true;
      }
      return mockDB.payments.delete(id, actingUserId);
    }
  },

  // Expenses CRUD
  expenses: {
    getAll: async () => {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase.from('expenses').select('*').order('expense_date', { ascending: false });
        if (!error) return data;
      }
      return mockDB.expenses.getAll();
    },
    getById: async (id) => {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase.from('expenses').select('*').eq('id', id).single();
        if (!error) return data;
      }
      return mockDB.expenses.getById(id);
    },
    save: async (expense, actingUserId) => {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase.from('expenses').upsert(expense).select().single();
        if (!error) return data;
      }
      return mockDB.expenses.save(expense, actingUserId);
    },
    delete: async (id, actingUserId) => {
      if (isSupabaseConfigured) {
        const { error } = await supabase.from('expenses').delete().eq('id', id);
        if (!error) return true;
      }
      return mockDB.expenses.delete(id, actingUserId);
    }
  },

  // Settings & Terms
  settings: {
    getCompany: async () => {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase.from('company_settings').select('*').single();
        if (!error) return data;
      }
      return mockDB.settings.getCompany();
    },
    saveCompany: async (settings, actingUserId) => {
      if (isSupabaseConfigured) {
        const { error } = await supabase.from('company_settings').upsert(settings);
        if (!error) return true;
      }
      return mockDB.settings.saveCompany(settings, actingUserId);
    },
    getBanks: async () => {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase.from('company_banks').select('*');
        if (!error) return data;
      }
      return mockDB.settings.getBanks();
    },
    saveBank: async (bank, actingUserId) => {
      if (isSupabaseConfigured) {
        const { error } = await supabase.from('company_banks').upsert(bank);
        if (!error) return true;
      }
      return mockDB.settings.saveBank(bank, actingUserId);
    },
    deleteBank: async (id, actingUserId) => {
      if (isSupabaseConfigured) {
        const { error } = await supabase.from('company_banks').delete().eq('id', id);
        if (!error) return true;
      }
      return mockDB.settings.deleteBank(id, actingUserId);
    },
    getTerms: async () => {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase.from('terms_conditions').select('*');
        if (!error) return data;
      }
      return mockDB.settings.getTerms();
    },
    saveTerms: async (termsList, actingUserId) => {
      if (isSupabaseConfigured) {
        const { error } = await supabase.from('terms_conditions').upsert(termsList);
        if (!error) return true;
      }
      return mockDB.settings.saveTerms(termsList, actingUserId);
    }
  },

  // Audit Logs
  auditLogs: {
    getAll: async () => {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase.from('audit_logs').select('*').order('created_at', { ascending: false });
        if (!error) return data;
      }
      return mockDB.auditLogs.getAll();
    }
  },

  // Admin resets
  resetDB: async () => {
    return mockDB.resetDB();
  }
};

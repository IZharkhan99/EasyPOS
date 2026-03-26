import { supabase } from '../supabaseClient';

export class SupabaseProvider {
  // --------------------------------------------------------
  // AUTH
  // --------------------------------------------------------
  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  }

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  async getSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  }

  // --------------------------------------------------------
  // PROFILES & BUSINESS
  // --------------------------------------------------------
  async createBusinessAndProfile(email, password, businessName, fullName) {
    // 1. Sign up user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });
    if (authError) throw authError;

    const user = authData.user;
    if (!user) throw new Error("User creation failed");

    // 2. Create business
    const { data: business, error: bizError } = await supabase
      .from('businesses')
      .insert({ name: businessName, email })
      .select()
      .single();
    if (bizError) throw bizError;

    // 3. Create profile
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: user.id,
        business_id: business.id,
        name: fullName,
        role: 'owner'
      });
    if (profileError) throw profileError;

    return { user, business };
  }

  async getProfile(userId) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*, businesses(*)')
      .eq('id', userId)
      .single();
    if (error) throw error;
    return data;
  }

  // --------------------------------------------------------
  // PRODUCTS
  // --------------------------------------------------------
  async getProducts(businessId) {
    const { data, error } = await supabase
      .from('products')
      .select('*, categories(name)')
      .eq('business_id', businessId)
      .eq('is_active', true)
      .order('name');
    if (error) throw error;
    return data;
  }

  async createProduct(productData) {
    const { data, error } = await supabase
      .from('products')
      .insert(productData)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async updateProduct(id, productData) {
    const { data, error } = await supabase
      .from('products')
      .update(productData)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async deleteProduct(id) {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }

  async deleteProducts(ids) {
    const { error } = await supabase
      .from('products')
      .delete()
      .in('id', ids);
    if (error) throw error;
  }

  // --------------------------------------------------------
  // CUSTOMERS
  // --------------------------------------------------------
  async getCustomers(businessId) {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('business_id', businessId)
      .eq('is_active', true)
      .order('name');
    if (error) throw error;
    return data;
  }

  // --------------------------------------------------------
  // ORDERS
  // --------------------------------------------------------
  async getOrders(businessId) {
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*), customers(name), profiles(name)')
      .eq('business_id', businessId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }

  async createOrder(orderData, itemsData) {
    // Process sale through RPC to ensure atomic transaction!
    /*
      orderData: { business_id, branch_id, user_id, customer_id, subtotal, discount_amount, tax_amount, total, payment_method, ... }
      itemsData: [{ product_id, name, qty, unit_price, total, ... }]
    */
    // We will build the RPC later, for now we do standard inserts (not atomic across multiple calls but close enough for start)
    // Actually, to make it atomic, we should use an RPC. I'll define an RPC.
    
    // For now, doing it sequentially (in production, use supabase.rpc function!)
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert(orderData)
      .select()
      .single();
    if (orderError) throw orderError;

    const itemsToInsert = itemsData.map(item => ({ ...item, order_id: order.id }));
    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(itemsToInsert);
    if (itemsError) throw itemsError;

    return order;
  }

  // --------------------------------------------------------
  // STAFF (PROFILES)
  // --------------------------------------------------------
  async getStaff(businessId) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('business_id', businessId)
      .order('name');
    if (error) throw error;
    return data;
  }

  async createStaff(staffData) {
    const { data, error } = await supabase
      .from('profiles')
      .insert(staffData)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async updateStaff(id, staffData) {
    const { data, error } = await supabase
      .from('profiles')
      .update(staffData)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async deleteStaff(id) {
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }

  async deleteMultipleStaff(ids) {
    const { error } = await supabase
      .from('profiles')
      .delete()
      .in('id', ids);
    if (error) throw error;
  }

  // --------------------------------------------------------
  // SHIFTS
  // --------------------------------------------------------
  async getShifts(businessId) {
    const { data, error } = await supabase
      .from('shifts')
      .select('*, profiles(name)')
      .eq('business_id', businessId)
      .order('opened_at', { ascending: false });
    if (error) throw error;
    return data;
  }

  async openShift(shiftData) {
    const { data, error } = await supabase
      .from('shifts')
      .insert(shiftData)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async closeShift(id, closingData) {
    const { data, error } = await supabase
      .from('shifts')
      .update({ ...closingData, status: 'closed', closed_at: new Date() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  // --------------------------------------------------------
  // EXPENSES
  // --------------------------------------------------------
  async getExpenses(businessId) {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('business_id', businessId)
      .order('expense_date', { ascending: false });
    if (error) throw error;
    return data;
  }

  async createExpense(expenseData) {
    const { data, error } = await supabase
      .from('expenses')
      .insert(expenseData)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async updateExpense(id, expenseData) {
    const { data, error } = await supabase
      .from('expenses')
      .update(expenseData)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async deleteExpense(id) {
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }

  // --------------------------------------------------------
  // RETURNS
  // --------------------------------------------------------
  async getReturns(businessId) {
    const { data, error } = await supabase
      .from('returns')
      .select('*')
      .eq('business_id', businessId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }

  async createReturn(returnData) {
    const { data, error } = await supabase
      .from('returns')
      .insert(returnData)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async updateReturn(id, updateData) {
    const { data, error } = await supabase
      .from('returns')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  // --------------------------------------------------------
  // AUDIT LOGS
  // --------------------------------------------------------
  async getAuditLogs(businessId) {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('business_id', businessId)
      .order('created_at', { ascending: false })
      .limit(100);
    if (error) throw error;
    return data;
  }

  async createAuditLog(logData) {
    const { error } = await supabase
      .from('audit_logs')
      .insert(logData);
    if (error) throw error;
  }

  // --------------------------------------------------------
  // ALERTS
  // --------------------------------------------------------
  async getAlerts(businessId) {
    const { data, error } = await supabase
      .from('alerts')
      .select('*')
      .eq('business_id', businessId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }

  async deleteAlerts(businessId) {
    const { error } = await supabase
      .from('alerts')
      .delete()
      .eq('business_id', businessId);
    if (error) throw error;
  }

  // --------------------------------------------------------
  // PAYMENTS
  // --------------------------------------------------------
  async getPayments(businessId) {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('business_id', businessId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }

  async createPayment(paymentData) {
    const { data, error } = await supabase
      .from('payments')
      .insert(paymentData)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  // --------------------------------------------------------
  // SUPPLIERS
  // --------------------------------------------------------
  async getSuppliers(businessId) {
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .eq('business_id', businessId)
      .order('name');
    if (error) throw error;
    return data;
  }
  
  async createSupplier(supplierData) {
    const { data, error } = await supabase
      .from('suppliers')
      .insert(supplierData)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async updateSupplier(id, supplierData) {
    const { data, error } = await supabase
      .from('suppliers')
      .update(supplierData)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async deleteSupplier(id) {
    const { error } = await supabase
      .from('suppliers')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }

  // --------------------------------------------------------
  // SETTINGS
  // --------------------------------------------------------
  async getSettings(businessId) {
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .eq('business_id', businessId);
    if (error) throw error;
    return data;
  }

  async updateSetting(businessId, key, value) {
    const { data, error } = await supabase
      .from('settings')
      .upsert({ business_id: businessId, key, value })
      .select()
      .single();
    if (error) throw error;
    return data;
  }
  // --------------------------------------------------------
  // RETURNS
  // --------------------------------------------------------
  async getReturns(businessId) {
    const { data, error } = await supabase
      .from('returns')
      .select('*')
      .eq('business_id', businessId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }

  async createReturn(returnData) {
    const { data, error } = await supabase
      .from('returns')
      .insert(returnData)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  // --------------------------------------------------------
  // PURCHASE ORDERS
  // --------------------------------------------------------
  async getPurchaseOrders(businessId) {
    const { data, error } = await supabase
      .from('purchase_orders')
      .select('*, suppliers(name)')
      .eq('business_id', businessId)
      .order('order_date', { ascending: false });
    if (error) throw error;
    return data;
  }

  async createPurchaseOrder(poData) {
    const { data, error } = await supabase
      .from('purchase_orders')
      .insert(poData)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async updatePurchaseOrder(id, poData) {
    const { data, error } = await supabase
      .from('purchase_orders')
      .update(poData)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  // --------------------------------------------------------
  // ALERTS
  // --------------------------------------------------------
  async getAlerts(businessId) {
    const { data, error } = await supabase
      .from('alerts')
      .select('*')
      .eq('business_id', businessId)
      .eq('status', 'active')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }

  // --------------------------------------------------------
  // AUDIT LOGS
  // --------------------------------------------------------
  async getAuditLogs(businessId) {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('business_id', businessId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }

  // --------------------------------------------------------
  // INVENTORY HISTORY
  // --------------------------------------------------------
  async getInventoryHistory(businessId) {
    const { data, error } = await supabase
      .from('inventory_history')
      .select('*')
      .eq('business_id', businessId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }
}


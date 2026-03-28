import { supabase } from '../supabaseClient';
import createLogger from '../../utils/logger';
import { validateAndSanitize } from '../../utils/sanitizer';
import { 
  productSchema, 
  customerSchema, 
  staffSchema, 
  supplierSchema, 
  shiftSchema, 
  expenseSchema, 
  orderSchema,
  purchaseOrderSchema,
  orderItemSchema as schemaItem
} from '../../utils/schemas';

const logger = createLogger('SupabaseProvider');

export class SupabaseProvider {
  // --------------------------------------------------------
  // AUTH
  // --------------------------------------------------------
  async signIn(email, password) {
    logger.info(`Attempting sign-in for: ${email}`);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      logger.error('Sign-in failed', { error, email });
      throw error;
    }
    return data;
  }

  async signOut() {
    logger.info('Attempting sign-out');
    const { error } = await supabase.auth.signOut();
    if (error) {
      logger.error('Sign-out failed', { error });
      throw error;
    }
  }

  async getSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      logger.error('Failed to get session', { error });
      throw error;
    }
    return session;
  }

  // --------------------------------------------------------
  // PROFILES & BUSINESS
  // --------------------------------------------------------
  async createBusinessAndProfile(email, password, businessName, fullName) {
    logger.info(`Creating business and profile for ${email}`, { businessName, fullName });
    // 1. Sign up user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });
    if (authError) {
      logger.error('SignUp failed', { error: authError, email });
      throw authError;
    }

    const user = authData.user;
    if (!user) {
      const err = new Error("User creation failed");
      logger.error(err.message);
      throw err;
    }

    // 2. Create business
    const { data: business, error: bizError } = await supabase
      .from('businesses')
      .insert({ name: businessName, email })
      .select()
      .single();
    if (bizError) {
      logger.error('Business creation failed', { error: bizError, email });
      throw bizError;
    }

    // 3. Create profile
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: user.id,
        business_id: business.id,
        name: fullName,
        role: 'owner'
      });
    if (profileError) {
      logger.error('Profile creation failed', { error: profileError, userId: user.id, businessId: business.id });
      throw profileError;
    }

    return { user, business };
  }

  async getProfile(userId) {
    logger.info(`Fetching profile for user: ${userId}`);
    const { data, error } = await supabase
      .from('profiles')
      .select('*, businesses(*)')
      .eq('id', userId)
      .single();
    if (error) {
      logger.error('Failed to fetch profile', { error, userId });
      throw error;
    }
    return data;
  }

  // --------------------------------------------------------
  // PRODUCTS
  // --------------------------------------------------------
  async getProducts(businessId) {
    logger.info(`Fetching products for business: ${businessId}`);
    const { data, error } = await supabase
      .from('products')
      .select('*, categories(name)')
      .eq('business_id', businessId)
      .eq('is_active', true)
      .order('name');
    if (error) {
      logger.error('Failed to fetch products', { error, businessId });
      throw error;
    }
    return data;
  }

  async createProduct(productData) {
    logger.info('Creating product', productData);
    const validated = validateAndSanitize(productSchema, productData);
    const { data, error } = await supabase
      .from('products')
      .insert(validated)
      .select()
      .single();
    if (error) {
      logger.error('Failed to create product', { error, productData: validated });
      throw error;
    }
    return data;
  }

  async updateProduct(id, productData) {
    logger.info(`Updating product ${id}`, productData);
    const validated = validateAndSanitize(productSchema.partial(), productData);
    const { data, error } = await supabase
      .from('products')
      .update(validated)
      .eq('id', id)
      .select()
      .single();
    if (error) {
      logger.error(`Failed to update product ${id}`, { error, productData: validated });
      throw error;
    }
    return data;
  }

  async deleteProduct(id) {
    logger.info(`Deleting product ${id}`);
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    if (error) {
      logger.error(`Failed to delete product ${id}`, { error });
      throw error;
    }
  }

  async deleteProducts(ids) {
    logger.info(`Deleting multiple products`, { ids });
    const { error } = await supabase
      .from('products')
      .delete()
      .in('id', ids);
    if (error) {
      logger.error(`Failed to delete multiple products`, { error, ids });
      throw error;
    }
  }

  // --------------------------------------------------------
  // CUSTOMERS
  // --------------------------------------------------------
  async getCustomers(businessId) {
    logger.info(`Fetching customers for business: ${businessId}`);
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('business_id', businessId)
      .eq('is_active', true)
      .order('name');
    if (error) {
      logger.error('Failed to fetch customers', { error, businessId });
      throw error;
    }
    return data;
  }

  async createCustomer(customerData) {
    logger.info('Creating customer', customerData);
    const validated = validateAndSanitize(customerSchema, customerData);
    const { data, error } = await supabase
      .from('customers')
      .insert(validated)
      .select()
      .single();
    if (error) {
      logger.error('Failed to create customer', { error, customerData: validated });
      throw error;
    }
    return data;
  }

  async updateCustomer(id, customerData) {
    logger.info(`Updating customer ${id}`, customerData);
    const validated = validateAndSanitize(customerSchema.partial(), customerData);
    const { data, error } = await supabase
      .from('customers')
      .update(validated)
      .eq('id', id)
      .select()
      .single();
    if (error) {
      logger.error(`Failed to update customer ${id}`, { error, customerData: validated });
      throw error;
    }
    return data;
  }

  async deleteCustomer(id) {
    logger.info(`Deleting customer ${id}`);
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', id);
    if (error) {
      logger.error(`Failed to delete customer ${id}`, { error });
      throw error;
    }
  }

  async deleteMultipleCustomers(ids) {
    logger.info(`Deleting multiple customers`, { ids });
    const { error } = await supabase
      .from('customers')
      .delete()
      .in('id', ids);
    if (error) {
      logger.error(`Failed to delete multiple customers`, { error, ids });
      throw error;
    }
  }

  // --------------------------------------------------------
  // ORDERS
  // --------------------------------------------------------
  async getOrders(businessId) {
    logger.info(`Fetching orders for business: ${businessId}`);
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*), customers(name), profiles(name)')
      .eq('business_id', businessId)
      .order('created_at', { ascending: false });
    if (error) {
      logger.error('Failed to fetch orders', { error, businessId });
      throw error;
    }
    return data;
  }

  async createOrder(orderData, itemsData) {
    logger.info('Creating order', { orderData, itemsCount: itemsData.length });
    const validatedOrder = validateAndSanitize(orderSchema, orderData);
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert(validatedOrder)
      .select()
      .single();
    if (orderError) {
      logger.error('Failed to create order', { error: orderError, orderData: validatedOrder });
      throw orderError;
    }

    const itemsToInsert = itemsData.map(item => {
      const validatedItem = validateAndSanitize(schemaItem, item);
      return { ...validatedItem, order_id: order.id };
    });

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(itemsToInsert);
    if (itemsError) {
      logger.error(`Failed to insert order items for order ${order.id}`, { error: itemsError, itemsToInsert });
      throw itemsError;
    }

    return order;
  }

  // --------------------------------------------------------
  // STAFF (PROFILES)
  // --------------------------------------------------------
  async getStaff(businessId) {
    logger.info(`Fetching staff for business: ${businessId}`);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('business_id', businessId)
      .order('name');
    if (error) {
      logger.error('Failed to fetch staff', { error, businessId });
      throw error;
    }
    return data;
  }

  async createStaff(staffData) {
    logger.info('Creating staff member', staffData);
    const validated = validateAndSanitize(staffSchema, staffData);
    const { data, error } = await supabase
      .from('profiles')
      .insert(validated)
      .select()
      .single();
    if (error) {
      logger.error('Failed to create staff', { error, staffData: validated });
      throw error;
    }
    return data;
  }

  async updateStaff(id, staffData) {
    logger.info(`Updating staff member ${id}`, staffData);
    const validated = validateAndSanitize(staffSchema.partial(), staffData);
    const { data, error } = await supabase
      .from('profiles')
      .update(validated)
      .eq('id', id)
      .select()
      .single();
    if (error) {
      logger.error(`Failed to update staff ${id}`, { error, staffData: validated });
      throw error;
    }
    return data;
  }

  async deleteStaff(id) {
    logger.info(`Deleting staff member ${id}`);
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', id);
    if (error) {
      logger.error(`Failed to delete staff ${id}`, { error });
      throw error;
    }
  }

  async deleteMultipleStaff(ids) {
    logger.info(`Deleting multiple staff members`, { ids });
    const { error } = await supabase
      .from('profiles')
      .delete()
      .in('id', ids);
    if (error) {
      logger.error(`Failed to delete multiple staff`, { error, ids });
      throw error;
    }
  }

  // --------------------------------------------------------
  // SHIFTS
  // --------------------------------------------------------
  async getShifts(businessId) {
    logger.info(`Fetching shifts for business: ${businessId}`);
    const { data, error } = await supabase
      .from('shifts')
      .select('*, profiles(name)')
      .eq('business_id', businessId)
      .order('opened_at', { ascending: false });
    if (error) {
      logger.error('Failed to fetch shifts', { error, businessId });
      throw error;
    }
    return data;
  }

  async openShift(shiftData) {
    logger.info('Opening shift', shiftData);
    const validated = validateAndSanitize(shiftSchema, shiftData);
    const { data, error } = await supabase
      .from('shifts')
      .insert(validated)
      .select()
      .single();
    if (error) {
      logger.error('Failed to open shift', { error, shiftData: validated });
      throw error;
    }
    return data;
  }

  async closeShift(id, closingData) {
    logger.info(`Closing shift ${id}`, closingData);
    const { data, error } = await supabase
      .from('shifts')
      .update({ ...closingData, status: 'closed', closed_at: new Date() })
      .eq('id', id)
      .select()
      .single();
    if (error) {
      logger.error(`Failed to close shift ${id}`, { error, closingData });
      throw error;
    }
    return data;
  }

  // --------------------------------------------------------
  // EXPENSES
  // --------------------------------------------------------
  async getExpenses(businessId) {
    logger.info(`Fetching expenses for business: ${businessId}`);
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('business_id', businessId)
      .order('expense_date', { ascending: false });
    if (error) {
      logger.error('Failed to fetch expenses', { error, businessId });
      throw error;
    }
    return data;
  }

  async createExpense(expenseData) {
    logger.info('Creating expense', expenseData);
    const validated = validateAndSanitize(expenseSchema, expenseData);
    const { data, error } = await supabase
      .from('expenses')
      .insert(validated)
      .select()
      .single();
    if (error) {
      logger.error('Failed to create expense', { error, expenseData: validated });
      throw error;
    }
    return data;
  }

  async updateExpense(id, expenseData) {
    logger.info(`Updating expense ${id}`, expenseData);
    const validated = validateAndSanitize(expenseSchema.partial(), expenseData);
    const { data, error } = await supabase
      .from('expenses')
      .update(validated)
      .eq('id', id)
      .select()
      .single();
    if (error) {
      logger.error(`Failed to update expense ${id}`, { error, expenseData: validated });
      throw error;
    }
    return data;
  }

  async deleteExpense(id) {
    logger.info(`Deleting expense ${id}`);
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id);
    if (error) {
      logger.error(`Failed to delete expense ${id}`, { error });
      throw error;
    }
  }

  // --------------------------------------------------------
  // PURCHASE ORDERS
  // --------------------------------------------------------
  async getPurchaseOrders(businessId) {
    logger.info(`Fetching purchase orders for business: ${businessId}`);
    const { data, error } = await supabase
      .from('purchase_orders')
      .select('*, suppliers(name)')
      .eq('business_id', businessId)
      .order('order_date', { ascending: false });
    if (error) {
      logger.error('Failed to fetch purchase orders', { error, businessId });
      throw error;
    }
    return data;
  }

  async createPurchaseOrder(poData) {
    logger.info('Creating purchase order', poData);
    const validated = validateAndSanitize(purchaseOrderSchema, poData);
    const { data, error } = await supabase
      .from('purchase_orders')
      .insert(validated)
      .select()
      .single();
    if (error) {
      logger.error('Failed to create purchase order', { error, poData: validated });
      throw error;
    }
    return data;
  }

  async updatePurchaseOrder(id, poData) {
    logger.info(`Updating purchase order ${id}`, poData);
    const validated = validateAndSanitize(purchaseOrderSchema.partial(), poData);
    const { data, error } = await supabase
      .from('purchase_orders')
      .update(validated)
      .eq('id', id)
      .select()
      .single();
    if (error) {
      logger.error(`Failed to update purchase order ${id}`, { error, poData: validated });
      throw error;
    }
    return data;
  }

  // --------------------------------------------------------
  // SUPPLIERS
  // --------------------------------------------------------
  async getSuppliers(businessId) {
    logger.info(`Fetching suppliers for business: ${businessId}`);
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .eq('business_id', businessId)
      .eq('is_active', true)
      .order('name');
    if (error) {
      logger.error('Failed to fetch suppliers', { error, businessId });
      throw error;
    }
    return data;
  }

  async createSupplier(supplierData) {
    logger.info('Creating supplier', supplierData);
    const validated = validateAndSanitize(supplierSchema, supplierData);
    const { data, error } = await supabase
      .from('suppliers')
      .insert(validated)
      .select()
      .single();
    if (error) {
      logger.error('Failed to create supplier', { error, supplierData: validated });
      throw error;
    }
    return data;
  }

  async updateSupplier(id, supplierData) {
    logger.info(`Updating supplier ${id}`, supplierData);
    const validated = validateAndSanitize(supplierSchema.partial(), supplierData);
    const { data, error } = await supabase
      .from('suppliers')
      .update(validated)
      .eq('id', id)
      .select()
      .single();
    if (error) {
      logger.error(`Failed to update supplier ${id}`, { error, supplierData: validated });
      throw error;
    }
    return data;
  }

  async deleteSupplier(id) {
    logger.info(`Deleting supplier ${id}`);
    const { error } = await supabase
      .from('suppliers')
      .delete()
      .eq('id', id);
    if (error) {
      logger.error(`Failed to delete supplier ${id}`, { error });
      throw error;
    }
  }

  // --------------------------------------------------------
  // INVENTORY HISTORY
  // --------------------------------------------------------
  async getInventoryHistory(businessId) {
    logger.info(`Fetching inventory history for business: ${businessId}`);
    const { data, error } = await supabase
      .from('inventory_history')
      .select('*')
      .eq('business_id', businessId)
      .order('created_at', { ascending: false });
    if (error) {
      logger.error('Failed to fetch inventory history', { error, businessId });
      throw error;
    }
    return data;
  }
}


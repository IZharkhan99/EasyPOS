import { z } from 'zod';

export const customerSchema = z.object({
  name: z.string().min(1, 'Name is required').trim(),
  phone: z.string().optional().default(''),
  email: z.string().email('Invalid email format').optional().or(z.literal('')),
  address: z.string().optional().default(''),
  tier: z.enum(['Bronze', 'Silver', 'Gold', 'Platinum']).default('Bronze'),
  is_active: z.boolean().default(true),
  business_id: z.string().uuid().optional(),
}).strip();

export const supplierSchema = z.object({
  name: z.string().min(1, 'Supplier name is required').trim(),
  contact_person: z.string().optional().default(''),
  phone: z.string().optional().default(''),
  email: z.string().email('Invalid email format').optional().or(z.literal('')),
  address: z.string().optional().default(''),
  category: z.string().default('General'),
  is_active: z.boolean().default(true),
  business_id: z.string().uuid().optional(),
}).strip();

export const staffSchema = z.object({
  name: z.string().min(1, 'Name is required').trim(),
  phone: z.string().optional().default(''),
  role: z.enum(['owner', 'admin', 'manager', 'cashier']).default('cashier'),
  shift_type: z.string().default('full-time'),
  is_active: z.boolean().default(true),
  salary: z.coerce.number().min(0).default(0),
  commission_type: z.enum(['percentage', 'fixed']).default('percentage'),
  commission_amount: z.coerce.number().min(0).default(0),
  pin: z.string().min(4, 'PIN must be at least 4 digits'),
  business_id: z.string().uuid().optional(),
}).strip();

export const productSchema = z.object({
  name: z.string().min(1, 'Product name is required').trim(),
  category: z.string().min(1, 'Category is required'),
  sku: z.string().optional().default(''),
  barcode: z.string().optional().default(''),
  price: z.coerce.number().min(0),
  cost: z.coerce.number().min(0).default(0),
  stock: z.coerce.number().int().default(0),
  min_stock: z.coerce.number().int().default(0),
  reorder_level: z.coerce.number().int().default(5),
  unit: z.string().default('pcs'),
  tracking: z.string().default('none'),
  is_active: z.boolean().default(true),
  emoji: z.string().optional().default('📦'),
  image_url: z.string().optional().default(''),
  business_id: z.string().uuid().optional(),
}).strip();

export const shiftSchema = z.object({
  business_id: z.string().uuid(),
  user_id: z.string().uuid(),
  opened_at: z.string().or(z.date()).default(() => new Date()),
  closed_at: z.string().or(z.date()).optional().nullable(),
  opening_float: z.coerce.number().min(0).default(0),
  closing_cash: z.coerce.number().min(0).optional().nullable(),
  expected_cash: z.coerce.number().optional().nullable(),
  cash_difference: z.coerce.number().optional().nullable(),
  total_revenue: z.coerce.number().min(0).default(0),
  cash_sales: z.coerce.number().min(0).default(0),
  card_sales: z.coerce.number().min(0).default(0),
  orders_count: z.coerce.number().int().min(0).default(0),
  status: z.enum(['open', 'closed']).default('open'),
}).strip();

export const expenseSchema = z.object({
  business_id: z.string().uuid(),
  amount: z.coerce.number().min(0.01, 'Amount must be greater than 0'),
  category: z.string().min(1, 'Category is required'),
  description: z.string().optional().default(''),
  expense_date: z.string().or(z.date()).default(() => new Date()),
  payment_method: z.string().default('cash'),
  status: z.enum(['approved', 'pending', 'rejected']).default('approved'),
  created_by: z.string().uuid().optional(),
}).strip();

export const purchaseOrderSchema = z.object({
  business_id: z.string().uuid(),
  supplier_id: z.string().uuid('Supplier is required'),
  order_date: z.string().or(z.date()).default(() => new Date()),
  total: z.coerce.number().min(0).default(0),
  status: z.enum(['pending', 'ordered', 'received', 'cancelled']).default('pending'),
  notes: z.string().optional().default(''),
}).strip();

export const orderSchema = z.object({
  business_id: z.string().uuid(),
  user_id: z.string().uuid(),
  customer_id: z.string().uuid().optional().nullable(),
  order_number: z.string().optional(),
  subtotal: z.coerce.number().min(0),
  tax_amount: z.coerce.number().min(0).default(0),
  discount_amount: z.coerce.number().min(0).default(0),
  total: z.coerce.number().min(0),
  payment_method: z.string().default('cash'),
  status: z.enum(['completed', 'pending', 'cancelled', 'refunded', 'held']).default('completed'),
  notes: z.string().optional().default(''),
}).strip();

export const orderItemSchema = z.object({
  order_id: z.string().uuid().optional(),
  product_id: z.string().uuid().optional().nullable(),
  name: z.string().min(1),
  sku: z.string().optional().default(''),
  qty: z.coerce.number().min(1),
  unit_price: z.coerce.number().min(0),
  cost_price: z.coerce.number().optional().default(0),
  total: z.coerce.number().min(0),
}).strip();

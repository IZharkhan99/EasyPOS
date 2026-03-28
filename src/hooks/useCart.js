import { useState, useCallback, useMemo } from 'react';
import createLogger from '../utils/logger';

const logger = createLogger('useCart');

/**
 * useCart: Purely local state hook for managing the POS cart.
 * Persists to localStorage to prevent data loss on refresh.
 */
export function useCart() {
  const [cart, setCart] = useState(() => {
    const stored = localStorage.getItem('active_cart');
    return stored ? JSON.parse(stored) : [];
  });
  
  const [currentCustomer, setCurrentCustomer] = useState(null);
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState('percent');
  const [heldOrders, setHeldOrders] = useState([]);

  const subtotal = useMemo(() => cart.reduce((sum, item) => sum + (item.price * item.qty), 0), [cart]);
  
  const discountAmount = useMemo(() => {
    if (discountType === 'percent') return (subtotal * discount) / 100;
    return discount;
  }, [subtotal, discount, discountType]);

  const total = useMemo(() => Math.max(0, subtotal - discountAmount), [subtotal, discountAmount]);
  const itemCount = useMemo(() => cart.reduce((sum, item) => sum + item.qty, 0), [cart]);

  const saveCart = useCallback((newCart) => {
    setCart(newCart);
    localStorage.setItem('active_cart', JSON.stringify(newCart));
  }, []);

  const holdOrder = useCallback(() => {
    if (!cart.length) return;
    logger.info('Holding current order', { itemCount: cart.length, subtotal });
    setHeldOrders(prev => [...prev, { 
      items: [...cart], 
      customer: currentCustomer, 
      discount,
      discountType 
    }]);
    setCart([]);
    localStorage.removeItem('active_cart');
  }, [cart, currentCustomer, discount, discountType, subtotal]);

  const restoreHeldOrder = useCallback(() => {
    if (heldOrders.length === 0) return;
    const last = heldOrders[heldOrders.length - 1];
    setHeldOrders(prev => prev.slice(0, -1));
    setCart(last.items);
    setCurrentCustomer(last.customer);
    setDiscount(last.discount);
    setDiscountType(last.discountType);
    localStorage.setItem('active_cart', JSON.stringify(last.items));
  }, [heldOrders]);

  const addToCart = useCallback((product) => {
    logger.info('Adding product to cart', { productId: product.id, productName: product.name });
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      let newCart;
      if (existing) {
        newCart = prev.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item);
      } else {
        newCart = [...prev, { ...product, qty: 1 }];
      }
      localStorage.setItem('active_cart', JSON.stringify(newCart));
      return newCart;
    });
  }, []);

  const updateQty = useCallback((productId, qty) => {
    if (qty < 1) return removeFromCart(productId);
    const newCart = cart.map(item => item.id === productId ? { ...item, qty } : item);
    saveCart(newCart);
  }, [cart, saveCart]);

  const removeFromCart = useCallback((productId) => {
    const newCart = cart.filter(item => item.id !== productId);
    saveCart(newCart);
  }, [cart, saveCart]);

  const clearCart = useCallback(() => {
    logger.info('Clearing cart completely');
    saveCart([]);
    setCurrentCustomer(null);
    setDiscount(0);
  }, [saveCart]);

  return {
    cart,
    currentCustomer,
    setCurrentCustomer,
    discount,
    setDiscount,
    discountType,
    setDiscountType,
    addToCart,
    updateQty,
    removeFromCart,
    clearCart,
    subtotal,
    discountAmount,
    total,
    itemCount,
    heldOrders,
    holdOrder,
    restoreHeldOrder
  };
}

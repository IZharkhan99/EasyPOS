import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDAL } from '../services/dal';
import { useAuth } from './useAuth';

const dal = getDAL();

export function usePurchaseOrders() {
  const { profile } = useAuth();
  const businessId = profile?.business_id;
  const queryClient = useQueryClient();

  // 1. Fetch Purchase Orders
  const { data: purchaseOrders = [], isLoading, error } = useQuery({
    queryKey: ['purchase_orders', businessId],
    queryFn: () => dal.getPurchaseOrders(businessId),
    enabled: !!businessId,
  });

  // 2. Create Purchase Order
  const createPurchaseOrder = useMutation({
    mutationFn: (newPO) => dal.createPurchaseOrder({ ...newPO, business_id: businessId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase_orders', businessId] });
      queryClient.invalidateQueries({ queryKey: ['inventory_history', businessId] });
      queryClient.invalidateQueries({ queryKey: ['products', businessId] });
    },
  });

  // 3. Update Purchase Order
  const updatePurchaseOrder = useMutation({
    mutationFn: ({ id, data }) => dal.updatePurchaseOrder(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase_orders', businessId] });
      queryClient.invalidateQueries({ queryKey: ['products', businessId] });
    },
  });

  return { 
    purchaseOrders, 
    isLoading,
    error,
    createPurchaseOrder: createPurchaseOrder.mutateAsync,
    isCreating: createPurchaseOrder.isPending,
    updatePurchaseOrder: updatePurchaseOrder.mutateAsync,
    isUpdating: updatePurchaseOrder.isPending,
  };
}

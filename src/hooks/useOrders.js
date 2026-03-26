import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDAL } from '../services/dal';
import { useAuth } from './useAuth';

const dal = getDAL();

export function useOrders() {
  const { profile } = useAuth();
  const businessId = profile?.business_id;
  const queryClient = useQueryClient();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['orders', businessId],
    queryFn: () => dal.getOrders(businessId),
    enabled: !!businessId,
  });

  const createOrder = useMutation({
    mutationFn: ({ orderData, itemsData }) => dal.createOrder({ ...orderData, business_id: businessId }, itemsData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders', businessId] });
      queryClient.invalidateQueries({ queryKey: ['products', businessId] }); // Orders affect stock
    },
  });

  return {
    orders,
    isLoading,
    createOrder: createOrder.mutateAsync,
    isCreating: createOrder.isPending,
  };
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDAL } from '../services/dal';
import { useAuth } from './useAuth';

const dal = getDAL();

export function usePayments() {
  const { profile } = useAuth();
  const businessId = profile?.business_id;
  const queryClient = useQueryClient();

  const { data: payments = [], isLoading } = useQuery({
    queryKey: ['payments', businessId],
    queryFn: () => dal.getPayments(businessId),
    enabled: !!businessId,
  });

  const createPayment = useMutation({
    mutationFn: (data) => dal.createPayment({ ...data, business_id: businessId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments', businessId] });
    },
  });

  return {
    payments,
    isLoading,
    createPayment: createPayment.mutateAsync,
    isCreating: createPayment.isPending,
  };
}

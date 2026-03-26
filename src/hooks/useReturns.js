import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDAL } from '../services/dal';
import { useAuth } from './useAuth';

const dal = getDAL();

export function useReturns() {
  const { profile } = useAuth();
  const businessId = profile?.business_id;
  const queryClient = useQueryClient();

  const { data: returns = [], isLoading } = useQuery({
    queryKey: ['returns', businessId],
    queryFn: () => dal.getReturns(businessId),
    enabled: !!businessId,
  });

  const createReturn = useMutation({
    mutationFn: (data) => dal.createReturn({ ...data, business_id: businessId, user_id: profile.id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['returns', businessId] });
      queryClient.invalidateQueries({ queryKey: ['products', businessId] }); // Returns affect stock
    },
  });

  const updateReturn = useMutation({
    mutationFn: ({ id, ...data }) => dal.updateReturn(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['returns', businessId] });
      queryClient.invalidateQueries({ queryKey: ['products', businessId] });
    },
  });

  return {
    returns,
    isLoading,
    createReturn: createReturn.mutateAsync,
    updateReturn: updateReturn.mutateAsync,
    isCreating: createReturn.isPending,
    isUpdating: updateReturn.isPending,
  };
}

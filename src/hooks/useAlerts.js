import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDAL } from '../services/dal';
import { useAuth } from './useAuth';

const dal = getDAL();

export function useAlerts() {
  const { profile } = useAuth();
  const businessId = profile?.business_id;
  const queryClient = useQueryClient();

  const clearAlerts = useMutation({
    mutationFn: () => dal.deleteAlerts(businessId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts', businessId] });
    },
  });

  return { 
    alerts, 
    isLoading,
    clearAlerts: clearAlerts.mutateAsync,
    isClearing: clearAlerts.isPending,
  };
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDAL } from '../services/dal';
import { useAuth } from './useAuth';

const dal = getDAL();

export function useShifts() {
  const { profile } = useAuth();
  const businessId = profile?.business_id;
  const queryClient = useQueryClient();

  const { data: shifts = [], isLoading } = useQuery({
    queryKey: ['shifts', businessId],
    queryFn: () => dal.getShifts(businessId),
    enabled: !!businessId,
  });

  const openShift = useMutation({
    mutationFn: (data) => dal.openShift({ ...data, business_id: businessId, user_id: profile.id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shifts', businessId] });
    },
  });

  const closeShift = useMutation({
    mutationFn: ({ id, data }) => dal.closeShift(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shifts', businessId] });
    },
  });

  const activeShift = shifts.find(s => s.status === 'open');

  return {
    shifts,
    activeShift,
    isLoading,
    openShift: openShift.mutateAsync,
    closeShift: closeShift.mutateAsync,
    isOpening: openShift.isPending,
    isClosing: closeShift.isPending,
  };
}

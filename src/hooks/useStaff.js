import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDAL } from '../services/dal';
import { useAuth } from './useAuth';

const dal = getDAL();

export function useStaff() {
  const { profile } = useAuth();
  const businessId = profile?.business_id;
  const queryClient = useQueryClient();

  const { data: staff = [], isLoading } = useQuery({
    queryKey: ['staff', businessId],
    queryFn: () => dal.getStaff(businessId),
    enabled: !!businessId,
  });

  const addStaff = useMutation({
    mutationFn: (data) => dal.createStaff({ ...data, business_id: businessId }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['staff', businessId] }),
  });

  const updateStaff = useMutation({
    mutationFn: ({ id, ...data }) => dal.updateStaff(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['staff', businessId] }),
  });

  const deleteStaff = useMutation({
    mutationFn: (id) => dal.deleteStaff(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['staff', businessId] }),
  });

  const deleteMultipleStaff = useMutation({
    mutationFn: (ids) => dal.deleteMultipleStaff(ids),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['staff', businessId] }),
  });

  return { 
    staff, 
    isLoading,
    addStaff: addStaff.mutateAsync,
    updateStaff: updateStaff.mutateAsync,
    deleteStaff: deleteStaff.mutateAsync,
    deleteMultipleStaff: deleteMultipleStaff.mutateAsync,
    isAdding: addStaff.isPending,
    isUpdating: updateStaff.isPending,
    isDeleting: deleteStaff.isPending,
    isBulkDeleting: deleteMultipleStaff.isPending,
  };
}

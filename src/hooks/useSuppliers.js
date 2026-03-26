import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDAL } from '../services/dal';
import { useAuth } from './useAuth';

const dal = getDAL();

export function useSuppliers() {
  const { profile } = useAuth();
  const businessId = profile?.business_id;
  const queryClient = useQueryClient();

  // 1. Fetch Suppliers
  const { data: suppliers = [], isLoading, error } = useQuery({
    queryKey: ['suppliers', businessId],
    queryFn: () => dal.getSuppliers(businessId),
    enabled: !!businessId,
  });

  // 2. Add Supplier
  const addSupplier = useMutation({
    mutationFn: (newSupplier) => dal.createSupplier({ ...newSupplier, business_id: businessId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers', businessId] });
    },
  });

  // 3. Update Supplier
  const updateSupplier = useMutation({
    mutationFn: ({ id, data }) => dal.updateSupplier(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers', businessId] });
    },
  });

  // 4. Delete Supplier
  const deleteSupplier = useMutation({
    mutationFn: (id) => dal.deleteSupplier(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers', businessId] });
    },
  });

  return { 
    suppliers, 
    isLoading,
    error,
    addSupplier: addSupplier.mutateAsync,
    isAdding: addSupplier.isPending,
    updateSupplier: updateSupplier.mutateAsync,
    isUpdating: updateSupplier.isPending,
    deleteSupplier: deleteSupplier.mutateAsync,
    isDeleting: deleteSupplier.isPending,
  };
}

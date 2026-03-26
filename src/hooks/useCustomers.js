import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDAL } from '../services/dal';
import { useAuth } from './useAuth';

const dal = getDAL();

export function useCustomers() {
  const { profile } = useAuth();
  const businessId = profile?.business_id;
  const queryClient = useQueryClient();

  const { data: customers = [], isLoading } = useQuery({
    queryKey: ['customers', businessId],
    queryFn: () => dal.getCustomers(businessId),
    enabled: !!businessId,
  });

  // 2. Add Customer
  const addCustomer = useMutation({
    mutationFn: (data) => dal.createCustomer({ ...data, business_id: businessId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers', businessId] });
    },
  });

  // 3. Update Customer
  const updateCustomer = useMutation({
    mutationFn: ({ id, ...data }) => dal.updateCustomer(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers', businessId] });
    },
  });

  // 4. Delete Customer
  const deleteCustomer = useMutation({
    mutationFn: (id) => dal.deleteCustomer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers', businessId] });
    },
  });

  // 5. Bulk Delete
  const deleteMultipleCustomers = useMutation({
    mutationFn: (ids) => dal.deleteMultipleCustomers(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers', businessId] });
    },
  });

  return {
    customers,
    isLoading,
    addCustomer: addCustomer.mutateAsync,
    updateCustomer: updateCustomer.mutateAsync,
    deleteCustomer: deleteCustomer.mutateAsync,
    deleteMultipleCustomers: deleteMultipleCustomers.mutateAsync,
    isAdding: addCustomer.isPending,
    isUpdating: updateCustomer.isPending,
    isDeleting: deleteCustomer.isPending,
    isBulkDeleting: deleteMultipleCustomers.isPending,
  };
}

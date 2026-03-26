import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDAL } from '../services/dal';
import { useAuth } from './useAuth';

const dal = getDAL();

export function useExpenses() {
  const { profile } = useAuth();
  const businessId = profile?.business_id;
  const queryClient = useQueryClient();

  const { data: expenses = [], isLoading } = useQuery({
    queryKey: ['expenses', businessId],
    queryFn: () => dal.getExpenses(businessId),
    enabled: !!businessId,
  });

  const addExpense = useMutation({
    mutationFn: (data) => dal.createExpense({ ...data, business_id: businessId, created_by: profile.id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses', businessId] });
    },
  });

  const updateExpense = useMutation({
    mutationFn: ({ id, ...data }) => dal.updateExpense(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses', businessId] });
    },
  });

  const deleteExpense = useMutation({
    mutationFn: (id) => dal.deleteExpense(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses', businessId] });
    },
  });

  return {
    expenses,
    isLoading,
    addExpense: addExpense.mutateAsync,
    isAdding: addExpense.isPending,
    updateExpense: updateExpense.mutateAsync,
    isUpdating: updateExpense.isPending,
    deleteExpense: deleteExpense.mutateAsync,
    isDeleting: deleteExpense.isPending,
  };
}

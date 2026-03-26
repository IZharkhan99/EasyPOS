import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDAL } from '../services/dal';
import { useAuth } from './useAuth';

const dal = getDAL();

export function useProducts() {
  const { profile } = useAuth();
  const businessId = profile?.business_id;
  const queryClient = useQueryClient();

  // 1. Fetch Products
  const { data: products = [], isLoading, error } = useQuery({
    queryKey: ['products', businessId],
    queryFn: () => dal.getProducts(businessId),
    enabled: !!businessId,
  });

  // 2. Add Product
  const addProduct = useMutation({
    mutationFn: (newProduct) => dal.createProduct({ ...newProduct, business_id: businessId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products', businessId] });
    },
  });

  // 3. Update Product
  const updateProduct = useMutation({
    mutationFn: ({ id, data }) => dal.updateProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products', businessId] });
    },
  });

  // 4. Delete Product
  const deleteProduct = useMutation({
    mutationFn: (id) => dal.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products', businessId] });
    },
  });

  // 5. Bulk Delete Products
  const bulkDeleteProducts = useMutation({
    mutationFn: (ids) => dal.deleteProducts(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products', businessId] });
    },
  });

  return {
    products,
    isLoading,
    error,
    addProduct: addProduct.mutateAsync,
    isAdding: addProduct.isPending,
    updateProduct: updateProduct.mutateAsync,
    isUpdating: updateProduct.isPending,
    deleteProduct: deleteProduct.mutateAsync,
    isDeleting: deleteProduct.isPending,
    deleteMultipleProducts: bulkDeleteProducts.mutateAsync,
    isBulkDeleting: bulkDeleteProducts.isPending,
  };
}

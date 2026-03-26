import { useQuery } from '@tanstack/react-query';
import { getDAL } from '../services/dal';
import { useAuth } from './useAuth';

const dal = getDAL();

export function useInventoryHistory() {
  const { profile } = useAuth();
  const businessId = profile?.business_id;

  const { data: inventoryHistory = [], isLoading } = useQuery({
    queryKey: ['inventory_history', businessId],
    queryFn: () => dal.getInventoryHistory(businessId),
    enabled: !!businessId,
  });

  return { inventoryHistory, isLoading };
}

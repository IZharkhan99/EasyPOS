import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDAL } from '../services/dal';
import { useAuth } from './useAuth';

const dal = getDAL();

export function useSettings() {
  const { profile } = useAuth();
  const businessId = profile?.business_id;
  const queryClient = useQueryClient();

  const { data: settingsList = [], isLoading } = useQuery({
    queryKey: ['settings', businessId],
    queryFn: () => dal.getSettings(businessId),
    enabled: !!businessId,
  });

  // Convert list to a flat object for easy access
  const settings = settingsList.reduce((acc, s) => {
    acc[s.key] = s.value;
    return acc;
  }, {});

  const updateSetting = useMutation({
    mutationFn: ({ key, value }) => dal.updateSetting(businessId, key, value),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', businessId] });
    },
  });

  return {
    settings,
    isLoading,
    updateSetting: updateSetting.mutateAsync,
    isUpdating: updateSetting.isPending,
  };
}

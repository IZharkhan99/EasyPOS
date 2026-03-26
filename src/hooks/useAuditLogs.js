import { useQuery } from '@tanstack/react-query';
import { getDAL } from '../services/dal';
import { useAuth } from './useAuth';

const dal = getDAL();

export function useAuditLogs() {
  const { profile } = useAuth();
  const businessId = profile?.business_id;

  const { data: auditLogs = [], isLoading } = useQuery({
    queryKey: ['audit_logs', businessId],
    queryFn: () => dal.getAuditLogs(businessId),
    enabled: !!businessId,
  });

  return {
    auditLogs,
    isLoading,
  };
}

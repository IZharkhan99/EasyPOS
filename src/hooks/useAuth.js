import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDAL } from '../services/dal';

const dal = getDAL();

export function useAuth() {
  const queryClient = useQueryClient();

  // Queries
  const { data: session, isLoading: isSessionLoading } = useQuery({
    queryKey: ['auth', 'session'],
    queryFn: () => dal.getSession(),
    staleTime: Infinity,
  });

  const isAuthenticated = !!session;
  const user = session?.user || null;

  // We fetch the profile separately once we have a user
  const { data: profile, isLoading: isProfileLoading } = useQuery({
    queryKey: ['auth', 'profile', user?.id],
    queryFn: () => dal.getProfile(user.id),
    enabled: !!user?.id,
    staleTime: Infinity,
  });

  // Mutations
  const loginMutation = useMutation({
    mutationFn: ({ email, password }) => dal.signIn(email, password),
    onSuccess: (data) => {
      // Invalidate queries so session refetches
      queryClient.setQueryData(['auth', 'session'], data.session);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: () => dal.signOut(),
    onSuccess: () => {
      queryClient.setQueryData(['auth', 'session'], null);
      queryClient.setQueryData(['auth', 'profile'], null);
      queryClient.clear();
    },
  });

  const isLoading = isSessionLoading || (isAuthenticated && isProfileLoading);

  return {
    session,
    isAuthenticated,
    user,
    currentUser: user,
    profile, // Contains {role, business_id, branch_id, ... businesses:{name}}
    isLoading,
    login: loginMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
  };
}

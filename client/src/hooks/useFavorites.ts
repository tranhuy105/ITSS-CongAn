import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as userService from '@/services/userService';

interface MutationContext {
  previousStatus: boolean;
}

export const useFavorites = (dishId: string) => {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  // Query to check initial favorite status
  const { data: isFavorite, isLoading: isChecking } = useQuery({
    queryKey: ['isFavorite', dishId],
    queryFn: () => userService.checkIsFavorite(dishId),
    enabled: isAuthenticated && !!dishId,
    staleTime: 60 * 1000,
  });

  const [optimisticStatus, setOptimisticStatus] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    if (isFavorite !== undefined) {
      setOptimisticStatus(isFavorite);
    }
  }, [isFavorite]);

  const currentStatus = optimisticStatus !== undefined ? optimisticStatus : false;

  // Mutation to add to favorites
  const addMutation = useMutation<{ message: string }, unknown, void, MutationContext>({
    mutationFn: () => userService.addFavorite(dishId),
    onMutate: () => {
      setOptimisticStatus(true);
      return { previousStatus: currentStatus };
    },
    onError: (_: unknown, _vars: unknown, context: MutationContext | undefined) => {
      if (context) {
        setOptimisticStatus(context.previousStatus);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['isFavorite', dishId] });
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });

  // Mutation to remove from favorites
  const removeMutation = useMutation<{ message: string }, unknown, void, MutationContext>({
    mutationFn: () => userService.removeFavorite(dishId),
    onMutate: () => {
      setOptimisticStatus(false);
      return { previousStatus: currentStatus };
    },
    onError: (_: unknown, _vars: unknown, context: MutationContext | undefined) => {
      if (context) {
        setOptimisticStatus(context.previousStatus);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['isFavorite', dishId] });
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });

  const isMutating = addMutation.isPending || removeMutation.isPending;

  const toggleFavorite = () => {
    if (!isAuthenticated || isMutating) return;

    if (currentStatus) {
      removeMutation.mutate();
    } else {
      addMutation.mutate();
    }
  };

  return {
    isFavorite: currentStatus,
    isChecking,
    isMutating,
    toggleFavorite,
  };
};

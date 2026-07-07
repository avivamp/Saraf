/**
 * src/hooks/useNotifications.ts
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { NotificationsService } from '@services/notifications.service';
import { useAuthStore } from '@store/auth.store';

export const NOTIFICATIONS_KEY = (userId: string) => ['notifications', userId] as const;

export function useNotifications() {
  const user        = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey:  NOTIFICATIONS_KEY(user?.id ?? ''),
    queryFn:   () => NotificationsService.fetchForUser(user!.id),
    enabled:   !!user,
    staleTime: 1000 * 30, // refresh every 30s
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => NotificationsService.markRead(id),
    onSuccess: () => {
      if (user) queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY(user.id) });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => NotificationsService.markAllRead(user!.id),
    onSuccess: () => {
      if (user) queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY(user.id) });
    },
  });

  const notifications = query.data ?? [];
  const unreadCount   = notifications.filter((n) => !n.is_read).length;

  return {
    notifications,
    unreadCount,
    isLoading:   query.isLoading,
    refetch:     query.refetch,
    markRead:    markReadMutation.mutate,
    markAllRead: markAllReadMutation.mutate,
  };
}

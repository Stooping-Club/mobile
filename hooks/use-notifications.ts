import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';

import { requestNotificationPermission } from '@/lib/notifications';

export function useNotificationsSetup() {
  const responseListener = useRef<Notifications.EventSubscription | null>(null);

  useEffect(() => {
    requestNotificationPermission();

    // Navigate to the right screen when user taps a notification
    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content.data as {
          screen?: string;
          itemId?: string;
          conversationId?: string;
        };

        if (data.screen === 'item' && data.itemId) {
          router.push(`/item/${data.itemId}` as never);
        } else if (data.screen === 'messages') {
          router.push('/(tabs)/explore');
        } else if (data.screen === 'profile') {
          router.push('/(tabs)/profile');
        }
      }
    );

    return () => {
      responseListener.current?.remove();
    };
  }, []);
}

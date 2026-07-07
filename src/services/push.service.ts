/**
 * src/services/push.service.ts
 */

import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { NotificationsService } from '@services/notifications.service';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert:  true,
    shouldPlaySound:  true,
    shouldSetBadge:   true,
    shouldShowBanner: true,
    shouldShowList:   true,
  }),
});

export interface PushNotificationData {
  type?:       string;
  product_id?: string;
  category?:   string;
  order_id?:   string;
}

// Reads projectId from app.json → expo.extra.eas.projectId
// Run: npx eas init   to generate one automatically, or paste it from
// https://expo.dev → your project → Project ID
function getProjectId(): string | null {
  return (
    Constants.expoConfig?.extra?.eas?.projectId ??
    (Constants as any).easConfig?.projectId ??
    null
  );
}

export const PushService = {
  async register(userId: string): Promise<string | null> {
    if (!Device.isDevice) return null;

    const projectId = getProjectId();
    if (!projectId) {
      // Not configured yet — in-app inbox still works, just no push tokens
      console.log('[Push] Skipped — no projectId in app.json. Add expo.extra.eas.projectId to enable push.');
      return null;
    }

    const { status: existing } = await Notifications.getPermissionsAsync();
    let finalStatus = existing;

    if (existing !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('[Push] Permission denied');
      return null;
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name:             'Saraf',
        importance:       Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
      });
    }

    try {
      const { data: token } = await Notifications.getExpoPushTokenAsync({ projectId });
      await NotificationsService.registerToken(userId, token, Platform.OS);
      console.log('[Push] Registered:', token);
      return token;
    } catch (e) {
      console.log('[Push] Token fetch failed (non-fatal):', (e as Error).message);
      return null;
    }
  },

  subscribe(onTap: (data: PushNotificationData) => void): () => void {
    const receivedSub  = Notifications.addNotificationReceivedListener(() => {});
    const responseSub  = Notifications.addNotificationResponseReceivedListener((r) => {
      const data = r.notification.request.content.data as PushNotificationData;
      onTap(data);
    });
    return () => { receivedSub.remove(); responseSub.remove(); };
  },
} as const;

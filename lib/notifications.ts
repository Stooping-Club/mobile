import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Show notifications when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function requestNotificationPermission(): Promise<boolean> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Stooping Club',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#16A34A',
    });
  }

  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function getNotificationPermissionStatus(): Promise<string> {
  const { status } = await Notifications.getPermissionsAsync();
  return status;
}

async function send(
  title: string,
  body: string,
  data?: Record<string, unknown>
): Promise<void> {
  try {
    await Notifications.scheduleNotificationAsync({
      content: { title, body, data, sound: true },
      trigger: null,
    });
  } catch {
    // Silently fail if permissions not granted
  }
}

export const notify = {
  itemPosted: (title: string, neighborhood: string) =>
    send(
      'Your item is live! 🎉',
      `"${title}" is now visible to folks in ${neighborhood}.`,
      { screen: 'profile' }
    ),

  itemClaimed: (title: string) =>
    send(
      'Item claimed! 🙌',
      `"${title}" has been claimed and kept from landfill.`,
      { screen: 'profile' }
    ),

  someoneInterested: (title: string, count: number) =>
    send(
      'Someone wants your item!',
      `${count} ${count === 1 ? 'person is' : 'people are'} interested in "${title}"`,
      { screen: 'profile' }
    ),

  newMessage: (senderName: string, preview: string, conversationId?: string) =>
    send(`Message from ${senderName}`, preview, {
      screen: 'messages',
      conversationId,
    }),
};

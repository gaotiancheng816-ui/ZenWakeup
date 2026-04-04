import * as Notifications from 'expo-notifications';
import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { ThemeProvider } from '../utils/theme-context';

export default function RootLayout() {
  useEffect(() => {
    // Android 8+ requires a notification channel.
    // MAX importance + bypassDnd ensures the alarm rings even in DND / silent mode.
    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('zen-alarm', {
        name: 'Morning Alarm',
        importance: Notifications.AndroidImportance.MAX,
        sound: 'alarm_bell',          // resource name, no extension
        vibrationPattern: [0, 400, 200, 400],
        lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
        bypassDnd: true,
      });
    }
  }, []);

  return (
    <ThemeProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
      </Stack>
    </ThemeProvider>
  );
}

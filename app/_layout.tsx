import notifee, {
  AndroidImportance,
  AndroidVisibility,
  EventType,
} from '@notifee/react-native';
import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { loadData } from '../utils/storage';
import { ThemeProvider } from '../utils/theme-context';
import { scheduleAlarm } from '../utils/alarm';

// ── Background event handler ─────────────────────────────────────────────────
// Must be registered at module scope (before any React tree mounts).
// Notifee requires this even if empty; without it the JS thread crashes
// when a notification event fires while the app is in the background.
if (Platform.OS !== 'web') {
  notifee.onBackgroundEvent(async ({ type, detail }) => {
    // No action needed — alarm is triggered via fullScreenAction / getInitialNotification
    // Hourly bells are display-only (no interaction handling required).
  });
}

export default function RootLayout() {
  useEffect(() => {
    (async () => {
      if (Platform.OS === 'web') return;

      // ── Android notification channel ────────────────────────────────────
      // Single "zen-alarm" channel shared by the morning alarm and hourly bells.
      // MAX importance + bypassDnd ensures full-volume delivery even in silent mode.
      if (Platform.OS === 'android') {
        await notifee.createChannel({
          id: 'zen-alarm',
          name: 'Morning Alarm',
          importance: AndroidImportance.HIGH,
          sound: 'alarm_bell',
          vibration: true,
          vibrationPattern: [0, 400, 200, 400],
          bypassDnd: true,
          visibility: AndroidVisibility.PUBLIC,
        });
      }

      // ── Request notification permission (Android 13+ / iOS) ─────────────
      await notifee.requestPermission();

      // ── Boot auto-reschedule ─────────────────────────────────────────────
      // Android clears all AlarmManager entries on reboot.  On every cold
      // start, if no trigger notifications exist we restore from saved time.
      const pending = await notifee.getTriggerNotifications();
      const hasAlarm = pending.some(n => n.notification.id === 'zen-morning-alarm');
      if (!hasAlarm) {
        const data = await loadData();
        if (data.hasOnboarded) {
          await scheduleAlarm(data.alarmHour, data.alarmMinute);
        }
      }
    })();
  }, []);

  return (
    <ThemeProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
      </Stack>
    </ThemeProvider>
  );
}

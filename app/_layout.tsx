import * as Notifications from 'expo-notifications';
import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { loadData } from '../utils/storage';
import { ThemeProvider } from '../utils/theme-context';

export default function RootLayout() {
  useEffect(() => {
    (async () => {
      // ── Android notification channel ──────────────────────────────────
      // Android 8+ requires a channel; MAX importance + bypassDnd ensures
      // the alarm fires at full volume even in silent / DND mode.
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('zen-alarm', {
          name: 'Morning Alarm',
          importance: Notifications.AndroidImportance.MAX,
          sound: 'alarm_bell',
          vibrationPattern: [0, 400, 200, 400],
          lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
          bypassDnd: true,
        });
      }

      // ── Boot auto-reschedule ──────────────────────────────────────────
      // Android clears all AlarmManager entries on reboot. On every cold
      // start, if there are no scheduled notifications we restore the alarm
      // from the saved alarm time (covers both reboot and app reinstall).
      if (Platform.OS !== 'web') {
        const scheduled = await Notifications.getAllScheduledNotificationsAsync();
        if (scheduled.length === 0) {
          const data = await loadData();
          if (data.hasOnboarded) {
            await Notifications.scheduleNotificationAsync({
              content: {
                title: 'Awakening',
                body: 'Time to begin your morning meditation',
                sound: 'alarm_bell.wav',
              },
              trigger: {
                type: Notifications.SchedulableTriggerInputTypes.DAILY,
                hour: data.alarmHour,
                minute: data.alarmMinute,
                ...(Platform.OS === 'android' ? { channelId: 'zen-alarm' } : {}),
              },
            });
          }
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

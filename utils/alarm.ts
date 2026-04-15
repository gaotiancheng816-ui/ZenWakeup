/**
 * Shared alarm-scheduling utility using @notifee/react-native.
 *
 * Using notifee instead of expo-notifications gives us:
 *  • fullScreenAction  — wakes the screen and shows the app directly on the
 *                        lock screen when the alarm fires (no native alarm → app gap)
 *  • alarmManager      — uses Android's setAlarmClock() which survives Doze mode
 *  • bypassDnd channel — fires at full volume even in silent / DND mode
 */

import notifee, {
  AndroidCategory,
  AndroidImportance,
  AndroidVisibility,
  RepeatFrequency,
  TriggerType,
} from '@notifee/react-native';
import type { TimestampTrigger } from '@notifee/react-native';
import { Platform } from 'react-native';

export const ALARM_NOTIF_ID = 'zen-morning-alarm';
export const ALARM_CHANNEL  = 'zen-alarm';

/** Returns the timestamp (ms) for the next occurrence of hour:minute. */
function nextAlarmMs(hour: number, minute: number): number {
  const now = new Date();
  const t   = new Date();
  t.setHours(hour, minute, 0, 0);
  if (t.getTime() <= now.getTime()) {
    t.setDate(t.getDate() + 1); // already past today → schedule for tomorrow
  }
  return t.getTime();
}

/**
 * Schedule (or re-schedule) the daily morning alarm.
 * Safe to call multiple times — cancels any existing alarm first.
 */
export async function scheduleAlarm(hour: number, minute: number): Promise<void> {
  if (Platform.OS === 'web') return;

  // Cancel previous alarm (if any)
  await notifee.cancelTriggerNotification(ALARM_NOTIF_ID);

  const trigger: TimestampTrigger = {
    type: TriggerType.TIMESTAMP,
    timestamp: nextAlarmMs(hour, minute),
    repeatFrequency: RepeatFrequency.DAILY,
    // alarmManager: true → uses Android setAlarmClock() which:
    //  • shows alarm clock icon in status bar
    //  • is protected from battery optimisation
    //  • fires reliably even in Doze mode (better than allowWhileIdle)
    alarmManager: true,
  };

  await notifee.createTriggerNotification(
    {
      id: ALARM_NOTIF_ID,
      title: 'Awakening',
      body:  'Time to begin your morning meditation',
      android: {
        channelId: ALARM_CHANNEL,
        sound: 'alarm_bell',
        category: AndroidCategory.ALARM,
        importance: AndroidImportance.HIGH,
        visibility: AndroidVisibility.PUBLIC,
        // KEY: wakes the screen and launches the app full-screen on lock screen
        fullScreenAction: {
          id: 'default',
          launchActivity: 'default',
        },
        pressAction: {
          id: 'default',
          launchActivity: 'default',
        },
      },
      ios: {
        sound: 'alarm_bell.wav',
        critical: true,       // bypasses silent switch on iOS
        criticalVolume: 1.0,
      },
    },
    trigger,
  );
}

/** Cancel the morning alarm (e.g. after it has been dismissed for today). */
export async function cancelAlarm(): Promise<void> {
  if (Platform.OS === 'web') return;
  await notifee.cancelTriggerNotification(ALARM_NOTIF_ID);
}

/**
 * DEV/TEST — Schedule a one-shot alarm N seconds from now (no daily repeat).
 * Lets you verify the full alarm delivery pipeline in ~60 s instead of overnight.
 */
export async function scheduleTestAlarm(seconds: number): Promise<void> {
  if (Platform.OS === 'web') return;

  await notifee.cancelTriggerNotification(ALARM_NOTIF_ID);

  const trigger: TimestampTrigger = {
    type:         TriggerType.TIMESTAMP,
    timestamp:    Date.now() + seconds * 1000,
    alarmManager: true,
    // No repeatFrequency — fires once only
  };

  await notifee.createTriggerNotification(
    {
      id:    ALARM_NOTIF_ID,
      title: 'Awakening',
      body:  'Time to begin your morning meditation',
      android: {
        channelId:        ALARM_CHANNEL,
        sound:            'alarm_bell',
        category:         AndroidCategory.ALARM,
        importance:       AndroidImportance.HIGH,
        visibility:       AndroidVisibility.PUBLIC,
        fullScreenAction: { id: 'default', launchActivity: 'default' },
        pressAction:      { id: 'default', launchActivity: 'default' },
      },
      ios: {
        sound:          'alarm_bell.wav',
        critical:       true,
        criticalVolume: 1.0,
      },
    },
    trigger,
  );
}

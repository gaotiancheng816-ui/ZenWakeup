/**
 * Custom Expo config plugin for @notifee/react-native.
 *
 * notifee 9.x ships no valid Expo config plugin of its own, so we wire up
 * everything it needs in AndroidManifest.xml manually:
 *
 *  1. NotifeeEventReceiver  — receives background notification events
 *  2. USE_FULL_SCREEN_INTENT — lets the alarm show over the lock screen
 *
 * iOS needs nothing extra; notifee uses standard UNUserNotificationCenter.
 */

const { withAndroidManifest } = require('@expo/config-plugins');

module.exports = function withNotifee(config) {
  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults;
    const app = manifest.manifest.application?.[0];
    if (!app) return config;

    // ── 1. NotifeeEventReceiver ─────────────────────────────────────────────
    if (!app.receiver) app.receiver = [];
    const RECEIVER_NAME = 'app.notifee.core.ReceiverService';
    const alreadyAdded = app.receiver.some(
      (r) => r.$?.['android:name'] === RECEIVER_NAME,
    );
    if (!alreadyAdded) {
      app.receiver.push({
        $: {
          'android:name': RECEIVER_NAME,
          'android:exported': 'false',
        },
        'intent-filter': [
          {
            action: [{ $: { 'android:name': RECEIVER_NAME } }],
          },
        ],
      });
    }

    // ── 2. USE_FULL_SCREEN_INTENT permission (Android 14+) ─────────────────
    // The permission is already declared via app.json "permissions", but we
    // also need the <uses-permission> node to be present for the manifest
    // merger to accept fullScreenAction on older build toolchains.
    const permissions = manifest.manifest['uses-permission'] ?? [];
    const FSI = 'android.permission.USE_FULL_SCREEN_INTENT';
    const hasFsi = permissions.some((p) => p.$?.['android:name'] === FSI);
    if (!hasFsi) {
      permissions.push({ $: { 'android:name': FSI } });
      manifest.manifest['uses-permission'] = permissions;
    }

    return config;
  });
};

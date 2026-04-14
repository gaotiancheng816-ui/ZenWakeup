import notifee, { EventType } from '@notifee/react-native';
import { useEffect, useRef, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import AlarmScreen from '../../screens/alarm';
import AllSetScreen from '../../screens/allset';
import DogenScreen from '../../screens/dogen';
import EveningScreen from '../../screens/evening';
import DaytimeScreen from '../../screens/hourly';
import IntroMeditationScreen from '../../screens/intro-meditation';
import MeditationScreen from '../../screens/meditation';
import MountainPathScreen from '../../screens/mountain-path';
import OnboardingScreen from '../../screens/onboarding';
import PaywallScreen from '../../screens/paywall';
import SummaryScreen from '../../screens/summary';
import ZenGuideScreen from '../../screens/zen-guide';
import { getTrialStatus, getTodayRecord, loadCurrentPage, loadData, saveCurrentPage } from '../../utils/storage';

type Page =
  | 'loading'
  | 'dogen'
  | 'zen-guide'
  | 'intro-meditation'
  | 'onboarding'
  | 'allset'
  | 'alarm'
  | 'meditation'
  | 'mountain-path'
  | 'daytime'
  | 'evening'
  | 'summary'
  | 'paywall';

export default function App() {
  const [page, setPage] = useState<Page>('loading');
  const [daysLeft, setDaysLeft] = useState(7);
  const [alarmTimeStr, setAlarmTimeStr] = useState('06:00');
  const [allsetMode,   setAllsetMode]   = useState<'first' | 'daily'>('daily');

  // Ref to track current page without stale closure in event listeners
  const pageRef = useRef<Page>('loading');

  useEffect(() => {
    // DEV: URL 参数跳页 (?dev=meditation)
    if (typeof window !== 'undefined' && window.location?.search) {
      const devPage = new URLSearchParams(window.location.search).get('dev') as Page | null;
      if (devPage) { setPage(devPage); return; }
    }
    loadData().then(async data => {
      if (!data.hasOnboarded) {
        setAllsetMode('first');   // 首次用户显示 "All Set." 文案
        setPage('dogen');
        return;
      }
      // Always sync alarm time from storage so allset page shows the correct time
      const hh = String(data.alarmHour ?? 6).padStart(2, '0');
      const mm = String(data.alarmMinute ?? 0).padStart(2, '0');
      setAlarmTimeStr(`${hh}:${mm}`);
      const trial = await getTrialStatus();
      if (!trial.isPurchased && trial.trialExpired) {
        setPage('paywall');
        return;
      }
      setDaysLeft(trial.daysLeft);

      // Cold-start: if app was launched by the alarm notification (fullScreenAction),
      // always route to the alarm screen — regardless of what page was saved.
      const todayRec = getTodayRecord(data);
      if (Platform.OS !== 'web' && !todayRec.morningDone) {
        const initial = await notifee.getInitialNotification();
        if (initial?.notification?.id === 'zen-morning-alarm') {
          setPage('alarm');
          return;
        }
      }

      // 恢复上次页面（meditation/daytime/evening/summary），避免 Focus 模式返回后丢失进度
      const saved = await loadCurrentPage();
      if (saved && !(saved === 'allset' && todayRec.morningDone)) {
        setPage(saved as Page);
      } else {
        // 无保存页面时，根据今日进度决定显示 alarm 还是 daytime/evening
        if (todayRec.eveningDone) {
          setPage('summary');
        } else if (todayRec.morningDone) {
          setPage('daytime');
        } else {
          setPage('alarm');
        }
      }
    });
  }, []);

  // Global foreground alarm handler: if alarm fires while app is on any screen
  // other than the alarm screen (e.g. allset, daytime), navigate there directly.
  useEffect(() => {
    if (Platform.OS === 'web') return;
    const unsub = notifee.onForegroundEvent(({ type, detail }) => {
      if (
        type === EventType.DELIVERED &&
        detail.notification?.id === 'zen-morning-alarm' &&
        pageRef.current !== 'alarm'
      ) {
        setPage('alarm');
      }
    });
    return () => unsub();
  }, []);

  // 页面变化时持久化，方便从 Focus 等模式返回后恢复
  // 跳过 'loading' 状态，避免启动时立即清除已保存页面
  useEffect(() => {
    pageRef.current = page;
    if (page !== 'loading') saveCurrentPage(page);
  }, [page]);

  if (page === 'loading') return <View style={s.root} />;

  return (
    <View style={s.root}>
      {page === 'dogen'            && <DogenScreen            onDone={() => setPage('intro-meditation')} />}
      {page === 'intro-meditation' && <IntroMeditationScreen  onDone={() => setPage('zen-guide')} />}
      {page === 'zen-guide'        && <ZenGuideScreen         onReady={() => setPage('onboarding')} />}
      {page === 'onboarding'       && <OnboardingScreen       onDone={() => setPage('alarm')} />}
      {page === 'allset' && (
        <AllSetScreen
          mode={allsetMode}
          alarmTime={alarmTimeStr}
          onDone={() => setPage('alarm')}
        />
      )}
      {page === 'alarm' && (
        <AlarmScreen
          onDismiss={() => setPage('meditation')}
          onConfirmed={() => {
            loadData().then(data => {
              const hh = String(data.alarmHour).padStart(2, '0');
              const mm = String(data.alarmMinute).padStart(2, '0');
              setAlarmTimeStr(`${hh}:${mm}`);
              setAllsetMode('daily');
              setPage('allset');
            });
          }}
        />
      )}
      {page === 'meditation'    && <MeditationScreen    onDone={() => setPage('daytime')} />}
      {page === 'daytime'       && <DaytimeScreen       onEvening={() => setPage('evening')} />}
      {page === 'evening'       && <EveningScreen       onDone={() => setPage('mountain-path')} />}
      {page === 'mountain-path' && <MountainPathScreen  onDone={() => setPage('summary')} />}
      {page === 'summary'       && <SummaryScreen       onDone={() => setPage('alarm')} />}
      {page === 'paywall'          && (
        <PaywallScreen
          trialExpired={true}
          daysLeft={daysLeft}
          onPurchased={() => setPage('alarm')}
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex:1 },
});

import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import AlarmScreen from '../../screens/alarm';
import EveningScreen from '../../screens/evening';
import DaytimeScreen from '../../screens/hourly';
import MeditationScreen from '../../screens/meditation';
import OnboardingScreen from '../../screens/onboarding';
import SummaryScreen from '../../screens/summary';
import { getTodayRecord, loadData } from '../../utils/storage';

type Page = 'alarm' | 'meditation' | 'daytime' | 'evening' | 'summary' | 'loading' | 'onboarding';

export default function App() {
  const [page, setPage] = useState<Page>('loading');

  useEffect(() => {
    loadData().then(data => {
      if (!data.hasOnboarded) {
        setPage('onboarding');
        return;
      }
      const today = getTodayRecord(data);
      const hour  = new Date().getHours();

      if (!today.morningDone) {
        // 今天还没做晨间 → 从头开始
        setPage('alarm');
      } else if (hour < 18 && !today.eveningDone) {
        // 晨间完成，白天 → 日间页
        setPage('daytime');
      } else if (hour >= 18 && !today.eveningDone) {
        // 傍晚后 → 直接去evening
        setPage('evening');
      } else {
        // 今天全部完成 → summary
        setPage('summary');
      }
    });
  }, []);

  if (page === 'loading') return <View style={s.root} />;

  return (
    <View style={s.root}>
      {page === 'onboarding' && <OnboardingScreen onDone={() => setPage('alarm')} />}
      {page === 'alarm'      && <AlarmScreen      onDismiss={() => setPage('meditation')} />}
      {page === 'meditation' && <MeditationScreen onDone={()    => setPage('daytime')} />}
      {page === 'daytime'    && <DaytimeScreen    onEvening={()  => setPage('evening')} />}
      {page === 'evening'    && <EveningScreen    onDone={()    => setPage('summary')} />}
      {page === 'summary'    && <SummaryScreen />}
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex:1 },
});
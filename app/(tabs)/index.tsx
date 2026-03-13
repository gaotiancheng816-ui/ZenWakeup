import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import AlarmScreen from '../../screens/alarm';
import EveningScreen from '../../screens/evening';
import DaytimeScreen from '../../screens/hourly';
import IntroMeditationScreen from '../../screens/intro-meditation';
import MeditationScreen from '../../screens/meditation';
import OnboardingScreen from '../../screens/onboarding';
import SummaryScreen from '../../screens/summary';
import ZenGuideScreen from '../../screens/zen-guide';
import { loadData } from '../../utils/storage';

type Page =
  | 'loading'
  | 'onboarding'
  | 'zen-guide'
  | 'intro-meditation'
  | 'alarm'
  | 'meditation'
  | 'daytime'
  | 'evening'
  | 'summary';

export default function App() {
  const [page, setPage] = useState<Page>('loading');

  useEffect(() => {
    loadData().then(data => {
      if (!data.hasOnboarded) {
        setPage('onboarding');
      } else {
        setPage('alarm');
      }
    });
  }, []);

  if (page === 'loading') return <View style={s.root} />;

  return (
    <View style={s.root}>
      {page === 'onboarding'       && <OnboardingScreen       onDone={() => setPage('zen-guide')} />}
      {page === 'zen-guide'        && <ZenGuideScreen         onReady={() => setPage('intro-meditation')} />}
      {page === 'intro-meditation' && <IntroMeditationScreen  onDone={() => setPage('alarm')} />}
      {page === 'alarm'            && <AlarmScreen            onDismiss={() => setPage('meditation')} />}
      {page === 'meditation'       && <MeditationScreen       onDone={() => setPage('daytime')} />}
      {page === 'daytime'          && <DaytimeScreen          onEvening={() => setPage('evening')} />}
      {page === 'evening'          && <EveningScreen          onDone={() => setPage('summary')} />}
      {page === 'summary'          && <SummaryScreen />}
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
});
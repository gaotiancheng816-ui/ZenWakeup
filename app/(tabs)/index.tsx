import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import AlarmScreen from '../../screens/alarm';
import AllSetScreen from '../../screens/allset';
import DogenScreen from '../../screens/dogen';
import EveningScreen from '../../screens/evening';
import DaytimeScreen from '../../screens/hourly';
import IntroMeditationScreen from '../../screens/intro-meditation';
import MeditationScreen from '../../screens/meditation';
import OnboardingScreen from '../../screens/onboarding';
import PaywallScreen from '../../screens/paywall';
import SummaryScreen from '../../screens/summary';
import ZenGuideScreen from '../../screens/zen-guide';
import { getTrialStatus, loadData } from '../../utils/storage';

type Page =
  | 'loading'
  | 'dogen'
  | 'zen-guide'
  | 'intro-meditation'
  | 'onboarding'
  | 'allset'
  | 'alarm'
  | 'meditation'
  | 'daytime'
  | 'evening'
  | 'summary'
  | 'paywall';

export default function App() {
  const [page, setPage] = useState<Page>('loading');
  const [daysLeft, setDaysLeft] = useState(7);
  const [isFirstTime,  setIsFirstTime]  = useState(false);
  const [alarmTimeStr, setAlarmTimeStr] = useState('06:00');
  const [allsetMode,   setAllsetMode]   = useState<'first' | 'daily'>('first');

  useEffect(() => {
    loadData().then(async data => {
      if (!data.hasOnboarded) {
        setPage('dogen');
        return;
      }
      const trial = await getTrialStatus();
      if (!trial.isPurchased && trial.trialExpired) {
        setPage('paywall');
        return;
      }
      setDaysLeft(trial.daysLeft);
      setPage('alarm');
    });
  }, []);

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
          onDone={() => {}}
        />
      )}
      {page === 'alarm'            && <AlarmScreen            onDismiss={() => setPage('meditation')} />}
      {page === 'meditation'       && <MeditationScreen       onDone={() => setPage('daytime')} />}
      {page === 'daytime'          && <DaytimeScreen          onEvening={() => setPage('evening')} />}
      {page === 'evening'          && <EveningScreen          onDone={() => setPage('summary')} />}
      {page === 'summary'          && <SummaryScreen />}
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

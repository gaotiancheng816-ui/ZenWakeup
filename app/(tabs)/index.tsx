import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import AlarmScreen from '../../screens/alarm';
import EveningScreen from '../../screens/evening';
import DaytimeScreen from '../../screens/hourly';
import MeditationScreen from '../../screens/meditation';
import SummaryScreen from '../../screens/summary';

type Page = 'alarm' | 'meditation' | 'daytime' | 'evening' | 'summary';

function getInitialPage(): Page {
  const h = new Date().getHours();
  if (h >= 6  && h < 9)  return 'alarm';
  if (h >= 18 && h < 23) return 'evening';
  return 'daytime';
}

export default function App() {
  const [page, setPage] = useState<Page>(getInitialPage());

  return (
    <View style={s.root}>
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
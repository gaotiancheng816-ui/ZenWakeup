import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AlarmScreen from '../../screens/alarm';
import EveningScreen from '../../screens/evening';
import DaytimeScreen from '../../screens/hourly';
import IntroMeditationScreen from '../../screens/intro-meditation';
import MeditationScreen from '../../screens/meditation';
import OnboardingScreen from '../../screens/onboarding';
import SummaryScreen from '../../screens/summary';
import ZenGuideScreen from '../../screens/zen-guide';

type Page = 'onboarding' | 'zen-guide' | 'intro-meditation' | 'alarm' | 'meditation' | 'daytime' | 'evening' | 'summary';
const PAGES: Page[] = ['onboarding', 'alarm', 'meditation', 'daytime', 'evening', 'summary'];

export default function App() {
  const [page, setPage] = useState<Page>('alarm');

  return (
    <View style={s.root}>
      {page === 'onboarding' && <OnboardingScreen onDone={() => setPage('zen-guide')} />}
      {page === 'alarm'      && <AlarmScreen      onDismiss={() => setPage('meditation')} />}
      {page === 'meditation' && <MeditationScreen onDone={() => setPage('daytime')} />}
      {page === 'daytime'   && <DaytimeScreen onEvening={() => setPage('evening')} />}
      {page === 'evening'   && <EveningScreen onDone={() => setPage('summary')} />}
      {page === 'summary'    && <SummaryScreen />}
      {page === 'zen-guide'        && <ZenGuideScreen       onReady={() => setPage('intro-meditation')} />}
      {page === 'intro-meditation' && <IntroMeditationScreen onDone={() => setPage('alarm')} />}

      <View style={s.nav}>
        {['入','醒','心','息','归','·'].map((label, i) => (
          <TouchableOpacity key={i} onPress={() => setPage(PAGES[i])} style={[s.navBtn, page===PAGES[i] && s.navBtnActive]}>
            <Text style={[s.navText, page===PAGES[i] && s.navTextActive]}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root:          { flex:1 },
  nav:           { position:'absolute', bottom:32, left:24, right:24, flexDirection:'row', justifyContent:'space-between', backgroundColor:'rgba(234,230,220,0.92)', borderRadius:32, paddingVertical:8, paddingHorizontal:12, borderWidth:1, borderColor:'rgba(42,46,36,0.1)' },
  navBtn:        { width:40, height:40, borderRadius:20, alignItems:'center', justifyContent:'center' },
  navBtnActive:  { backgroundColor:'rgba(42,46,36,0.12)' },
  navText:       { fontSize:15, color:'rgba(42,46,36,0.35)', fontWeight:'300' },
  navTextActive: { color:'#2a2e24' },
});
import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AlarmScreen from '../../screens/alarm';
import EveningScreen from '../../screens/evening';
import DaytimeScreen from '../../screens/hourly';
import MeditationScreen from '../../screens/meditation';
import SummaryScreen from '../../screens/summary';

type Page = 'alarm' | 'meditation' | 'daytime' | 'evening' | 'summary';

const PAGES: Page[] = ['alarm', 'meditation', 'daytime', 'evening', 'summary'];

export default function App() {
  const [page, setPage] = useState<Page>('alarm');

  const next = () => {
    const idx = PAGES.indexOf(page);
    setPage(PAGES[(idx + 1) % PAGES.length]);
  };

  return (
    <View style={s.root}>
      {page === 'alarm'      && <AlarmScreen      onDismiss={() => setPage('meditation')} />}
      {page === 'meditation' && <MeditationScreen onDone={()    => setPage('daytime')} />}
      {page === 'daytime'    && <DaytimeScreen    onEvening={()  => setPage('evening')} />}
      {page === 'evening'    && <EveningScreen    onDone={()    => setPage('summary')} />}
      {page === 'summary'    && <SummaryScreen />}

      {/* 临时导航条 */}
      <View style={s.nav}>
        {PAGES.map(p => (
          <TouchableOpacity key={p} onPress={() => setPage(p)} style={[s.navBtn, page===p && s.navBtnActive]}>
            <Text style={[s.navText, page===p && s.navTextActive]}>
              {p === 'alarm' ? '醒' : p === 'meditation' ? '心' : p === 'daytime' ? '息' : p === 'evening' ? '归' : '·'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root:          { flex:1 },
  nav:           { position:'absolute', bottom:32, left:32, right:32, flexDirection:'row', justifyContent:'space-between', backgroundColor:'rgba(234,230,220,0.9)', borderRadius:32, paddingVertical:10, paddingHorizontal:16, borderWidth:1, borderColor:'rgba(42,46,36,0.1)' },
  navBtn:        { width:44, height:44, borderRadius:22, alignItems:'center', justifyContent:'center' },
  navBtnActive:  { backgroundColor:'rgba(42,46,36,0.12)' },
  navText:       { fontSize:16, color:'rgba(42,46,36,0.35)', fontWeight:'300' },
  navTextActive: { color:'#2a2e24', opacity:1 },
});
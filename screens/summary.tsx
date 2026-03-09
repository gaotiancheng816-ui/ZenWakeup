import { useEffect, useRef, useState } from 'react';
import {
  Animated, Dimensions, ScrollView,
  StatusBar, StyleSheet, Text, View
} from 'react-native';
import { AppData, DayRecord, getTodayRecord, loadData } from '../utils/storage';

const { width, height } = Dimensions.get('window');

const MOON     = ['🌑','🌒','🌓','🌔','🌕'];
const SCORE_EN = ['Heavy','Tired','Neutral','Light','Fulfilled'];
const MONTHS   = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DAYS     = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const QUOTES   = [
  'In pursuit of Tao, every day something is dropped',
  'The highest good is like water',
  'Attain the utmost emptiness · hold fast to stillness',
  'Those who know enough are rich',
  'Yield and overcome',
  'True words are not beautiful · beautiful words are not true',
  'He who overcomes himself is strong',
];

const AI_UNLOCK = 500;

export default function DailySummaryScreen() {
  const [appData,   setAppData]   = useState<AppData | null>(null);
  const [todayRec,  setTodayRec]  = useState<DayRecord | null>(null);
  const [displayPoints, setDisplayPoints] = useState(0);

  const fadeIn     = useRef(new Animated.Value(0)).current;
  const lineAnim   = useRef(new Animated.Value(0)).current;
  const pointsAnim = useRef(new Animated.Value(0)).current;
  const mist1      = useRef(new Animated.Value(0)).current;
  const mist2      = useRef(new Animated.Value(0)).current;
  const brushY     = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadData().then(data => {
      setAppData(data);
      setTodayRec(getTodayRecord(data));
    });
  }, []);

  useEffect(() => {
    if (!todayRec) return;

    Animated.sequence([
      Animated.timing(fadeIn,   { toValue:1, duration:1600, useNativeDriver:true }),
      Animated.timing(lineAnim, { toValue:1, duration:1200, useNativeDriver:false }),
    ]).start();
    Animated.loop(Animated.sequence([
      Animated.timing(mist1, { toValue:1, duration:9000,  useNativeDriver:true }),
      Animated.timing(mist1, { toValue:0, duration:9000,  useNativeDriver:true }),
    ])).start();
    Animated.loop(Animated.sequence([
      Animated.timing(mist2, { toValue:1, duration:12000, useNativeDriver:true }),
      Animated.timing(mist2, { toValue:0, duration:12000, useNativeDriver:true }),
    ])).start();
    Animated.loop(Animated.sequence([
      Animated.timing(brushY, { toValue:1, duration:15000, useNativeDriver:true }),
      Animated.timing(brushY, { toValue:0, duration:15000, useNativeDriver:true }),
    ])).start();

    const bothDone = todayRec.morningDone && todayRec.eveningDone;
    if (bothDone) {
      Animated.timing(pointsAnim, { toValue:25, duration:1800, useNativeDriver:false }).start();
      pointsAnim.addListener(({ value }) => setDisplayPoints(Math.round(value)));
      return () => pointsAnim.removeAllListeners();
    }
  }, [todayRec]);

  if (!todayRec || !appData) return <View style={s.scroll} />;

  const bothDone    = todayRec.morningDone && todayRec.eveningDone;
  const pointsToday = bothDone ? 25 : 0;
  const now         = new Date();
  const quote       = QUOTES[now.getDay() % QUOTES.length];
  const dateStr     = `${DAYS[now.getDay()]}  ·  ${now.getDate()} ${MONTHS[now.getMonth()]}`;
  const totalH      = Math.floor(todayRec.totalMinutes / 60);
  const totalM      = todayRec.totalMinutes % 60;
  const timeStr     = totalH > 0 ? `${totalH}h ${totalM}min` : `${todayRec.totalMinutes}min`;
  const accumMin    = appData.allPoints * 2;
  const accumH      = Math.floor(accumMin / 60);
  const accumM      = accumMin % 60;
  const progressPct = Math.min(100, Math.round((appData.allPoints / AI_UNLOCK) * 100));
  const lineWidth   = lineAnim.interpolate({ inputRange:[0,1], outputRange:['0%','100%'] });

  const alarmH = String(appData.alarmHour).padStart(2,'0');
  const alarmM = String(appData.alarmMinute).padStart(2,'0');

  return (
    <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
      <StatusBar barStyle="dark-content" />

      <View style={s.mountain1} /><View style={s.mountain2} /><View style={s.mountain3} />
      {[0.38,0.41,0.44].map((pos,i) => (
        <View key={i} style={[s.waterLine, {
          top:height*pos, opacity:0.04+i*0.015,
          width:width*[0.72,0.85,0.68][i], alignSelf:'center',
        }]} />
      ))}
      <Animated.View style={[s.mist1Layer, { transform:[{ translateY: mist1.interpolate({ inputRange:[0,1], outputRange:[0,-10] }) }] }]} />
      <Animated.View style={[s.mist2Layer, { transform:[{ translateX: mist2.interpolate({ inputRange:[0,1], outputRange:[0,14] }) }] }]} />
      <Animated.View style={[s.brushGroup, { transform:[{ translateY: brushY.interpolate({ inputRange:[0,1], outputRange:[0,-14] }) }] }]}>
        {[
          { left:width*0.06, h:90,  op:0.05 },{ left:width*0.11, h:140, op:0.07 },
          { left:width*0.16, h:60,  op:0.04 },{ left:width*0.80, h:110, op:0.06 },
          { left:width*0.86, h:75,  op:0.08 },{ left:width*0.91, h:95,  op:0.05 },
        ].map((b,i) => (
          <View key={i} style={{ position:'absolute', left:b.left, bottom:0, width:1.5, height:b.h, backgroundColor:'#1e2030', opacity:b.op, borderRadius:1 }} />
        ))}
      </Animated.View>
      <View style={s.cornerTL} /><View style={s.cornerBR} />

      <Animated.View style={[s.content, { opacity: fadeIn }]}>

        <Text style={s.dateStr}>{dateStr}</Text>
        <Text style={s.mainWord}>Summary</Text>
        <View style={s.lineWrap}>
          <Animated.View style={[s.line, { width: lineWidth }]} />
        </View>

        <Text style={s.sectionLabel}>Today's Practice</Text>
        <View style={{ height: 20 }} />

        <View style={s.itemRow}>
          <Text style={[s.itemDot, todayRec.morningDone ? s.dotOn : s.dotOff]}>
            {todayRec.morningDone ? '●' : '○'}
          </Text>
          <View style={{ flex:1 }}>
            <Text style={[s.itemTitle, !todayRec.morningDone && s.dim]}>Morning Meditation</Text>
            <Text style={s.itemSub}>5 min guided breathing</Text>
          </View>
          <Text style={[s.itemCheck, todayRec.morningDone ? s.checkOn : s.checkOff]}>
            {todayRec.morningDone ? '✓' : '—'}
          </Text>
        </View>

        <View style={s.itemDivider} />

        <View style={s.itemRow}>
          <Text style={[s.itemDot, todayRec.eveningDone ? s.dotOn : s.dotOff]}>
            {todayRec.eveningDone ? '●' : '○'}
          </Text>
          <View style={{ flex:1 }}>
            <Text style={[s.itemTitle, !todayRec.eveningDone && s.dim]}>Evening Return</Text>
            <Text style={s.itemSub}>3 reflections</Text>
          </View>
          <Text style={[s.itemCheck, todayRec.eveningDone ? s.checkOn : s.checkOff]}>
            {todayRec.eveningDone ? '✓' : '—'}
          </Text>
        </View>

        <View style={s.sectionDivider} />

        <Text style={s.sectionLabel}>Zen Points</Text>
        <View style={{ height: 24 }} />

        {bothDone ? (
          <>
            <View style={s.pointsRow}>
              <Text style={s.pointsBig}>+{displayPoints}</Text>
              <Text style={s.pointsStar}>✦</Text>
            </View>
            <Text style={s.pointsSub}>Total  {appData.allPoints + pointsToday} points</Text>
            <View style={{ height: 28 }} />
            <View style={s.unlockWrap}>
              <View style={s.unlockTextRow}>
                <Text style={s.unlockLabel}>AI Personalisation</Text>
                <Text style={s.unlockPct}>{progressPct}%</Text>
              </View>
              <View style={s.unlockBarBg}>
                <View style={[s.unlockBar, { width:`${progressPct}%` }]} />
              </View>
              <Text style={s.unlockHint}>{AI_UNLOCK - appData.allPoints} points to unlock</Text>
            </View>
          </>
        ) : (
          <View style={s.noPointsBox}>
            <Text style={s.noPointsTitle}>No points today</Text>
            <Text style={s.noPointsSub}>Complete both morning & evening{'\n'}to receive today's points</Text>
          </View>
        )}

        <View style={s.sectionDivider} />

        <Text style={s.sectionLabel}>Today's State</Text>
        <View style={{ height: 24 }} />
        <View style={s.moodRow}>
          <Text style={s.moodMoon}>{MOON[todayRec.score]}</Text>
          <View style={{ gap:6 }}>
            <Text style={s.moodLabel}>{SCORE_EN[todayRec.score]}</Text>
            <Text style={s.moodSub}>Evening self-assessment</Text>
          </View>
        </View>

        <View style={s.sectionDivider} />

        <Text style={s.sectionLabel}>Mindfulness Time</Text>
        <View style={{ height: 20 }} />
        <Text style={s.bigTime}>{timeStr}</Text>
        <Text style={s.accumTime}>Total accumulated  ·  {accumH}h {accumM}min</Text>

        <View style={s.sectionDivider} />

        <View style={s.quoteBlock}>
          <Text style={s.quoteDash}>— — —</Text>
          <View style={{ height: 20 }} />
          <Text style={s.quoteText}>{quote}</Text>
          <View style={{ height: 20 }} />
          <Text style={s.quoteDash}>— — —</Text>
        </View>

        <View style={{ height: 56 }} />
        <Text style={s.seeYou}>Until tomorrow</Text>
        <Text style={s.nextAlarm}>Next morning  ·  {alarmH}:{alarmM}</Text>
        <View style={{ height: 80 }} />

      </Animated.View>
    </ScrollView>
  );
}

const INK = '#2a2e24', INK2 = '#485040', INK3 = '#7a8472', GOLD = '#8a7040', BG = '#d4d0c8';

const s = StyleSheet.create({
  scroll:        { flex:1, backgroundColor:BG },
  scrollContent: { alignItems:'center', paddingHorizontal:32, paddingTop:72 },
  mountain1:     { position:'absolute', width:width*1.4, height:width*1.4, borderRadius:width*0.7,  backgroundColor:'rgba(30,32,48,0.045)', top:height*0.45, left:-width*0.2 },
  mountain2:     { position:'absolute', width:width*1.1, height:width*1.1, borderRadius:width*0.55, backgroundColor:'rgba(30,32,48,0.035)', top:height*0.48, left:width*0.1 },
  mountain3:     { position:'absolute', width:width*0.8, height:width*0.8, borderRadius:width*0.4,  backgroundColor:'rgba(30,32,48,0.03)',  top:height*0.50, right:-width*0.05 },
  waterLine:     { position:'absolute', height:1, backgroundColor:'#1e2030' },
  mist1Layer:    { position:'absolute', width:width*1.3, height:80,  borderRadius:40, backgroundColor:'rgba(220,216,206,0.45)', top:height*0.35, left:-width*0.15 },
  mist2Layer:    { position:'absolute', width:width*0.85, height:50, borderRadius:25, backgroundColor:'rgba(220,216,206,0.3)',  top:height*0.40, right:-width*0.1 },
  brushGroup:    { position:'absolute', top:height*0.28, left:0, right:0, height:170 },
  cornerTL:      { position:'absolute', width:100, height:100, borderRadius:50, borderWidth:1, borderColor:'rgba(30,32,48,0.07)', top:-30, left:-30 },
  cornerBR:      { position:'absolute', width:70,  height:70,  borderRadius:35, borderWidth:1, borderColor:'rgba(30,32,48,0.06)', top:height*0.55, right:-15 },

  content:        { width:'100%', alignItems:'center' },
  dateStr:        { fontSize:11, color:INK3, letterSpacing:5, fontWeight:'300', marginBottom:8 },
  mainWord:       { fontSize:28, color:INK2, letterSpacing:10, fontWeight:'300' },
  lineWrap:       { width:'100%', height:1, backgroundColor:'rgba(30,32,48,0.08)', marginBottom:40 },
  line:           { height:1, backgroundColor:'rgba(30,32,48,0.3)' },
  sectionLabel:   { fontSize:11, color:INK2, letterSpacing:5, fontWeight:'300', alignSelf:'flex-start' },
  sectionDivider: { width:'100%', height:1, backgroundColor:'rgba(30,32,48,0.08)', marginVertical:32 },
  itemRow:        { flexDirection:'row', alignItems:'center', gap:14, width:'100%' },
  itemDot:        { fontSize:10, width:16 },
  dotOn:          { color:GOLD },
  dotOff:         { color:'rgba(30,32,48,0.2)' },
  itemTitle:      { fontSize:15, color:INK2, letterSpacing:2, fontWeight:'300' },
  itemSub:        { fontSize:10, color:INK3, letterSpacing:1, fontStyle:'italic', marginTop:3, opacity:0.65 },
  dim:            { opacity:0.3 },
  itemCheck:      { fontSize:15 },
  checkOn:        { color:GOLD },
  checkOff:       { color:'rgba(30,32,48,0.2)' },
  itemDivider:    { height:1, backgroundColor:'rgba(30,32,48,0.06)', marginVertical:16, width:'100%' },
  pointsRow:      { flexDirection:'row', alignItems:'flex-end', gap:10, alignSelf:'flex-start' },
  pointsBig:      { fontSize:56, color:INK, fontWeight:'200', letterSpacing:2 },
  pointsStar:     { fontSize:24, color:GOLD, marginBottom:12 },
  pointsSub:      { fontSize:13, color:INK2, letterSpacing:3, marginTop:4, alignSelf:'flex-start' },
  unlockWrap:     { width:'100%', gap:10 },
  unlockTextRow:  { flexDirection:'row', justifyContent:'space-between' },
  unlockLabel:    { fontSize:11, color:INK2, letterSpacing:2 },
  unlockPct:      { fontSize:11, color:GOLD, letterSpacing:1 },
  unlockBarBg:    { width:'100%', height:1, backgroundColor:'rgba(30,32,48,0.12)' },
  unlockBar:      { height:1, backgroundColor:GOLD },
  unlockHint:     { fontSize:10, color:INK3, letterSpacing:1, opacity:0.55, fontStyle:'italic' },
  noPointsBox:    { width:'100%', borderWidth:1, borderColor:'rgba(30,32,48,0.08)', padding:28, alignItems:'center', gap:14 },
  noPointsTitle:  { fontSize:18, color:INK2, letterSpacing:4, fontWeight:'300' },
  noPointsSub:    { fontSize:12, color:INK3, letterSpacing:1, fontStyle:'italic', textAlign:'center', lineHeight:20, opacity:0.6 },
  moodRow:        { flexDirection:'row', alignItems:'center', gap:20, alignSelf:'flex-start' },
  moodMoon:       { fontSize:40 },
  moodLabel:      { fontSize:28, color:INK, letterSpacing:5, fontWeight:'200' },
  moodSub:        { fontSize:10, color:INK3, letterSpacing:1, fontStyle:'italic', opacity:0.6 },
  bigTime:        { fontSize:48, color:INK, fontWeight:'200', letterSpacing:2, alignSelf:'flex-start' },
  accumTime:      { fontSize:11, color:INK2, letterSpacing:2, marginTop:6, alignSelf:'flex-start' },
  quoteBlock:     { width:'100%', alignItems:'center', paddingVertical:8 },
  quoteDash:      { fontSize:11, color:INK3, letterSpacing:4, opacity:0.35 },
  quoteText:      { fontSize:14, color:INK2, letterSpacing:2, fontStyle:'italic', textAlign:'center', lineHeight:24 },
  seeYou:         { fontSize:22, color:INK2, letterSpacing:8, fontWeight:'300', marginBottom:12 },
  nextAlarm:      { fontSize:11, color:INK3, letterSpacing:4, opacity:0.5 },
});
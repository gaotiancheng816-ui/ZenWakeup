import { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    View
} from 'react-native';

const { width } = Dimensions.get('window');

const TODAY = {
  morningDone:  true,
  eveningDone:  true,
  totalMinutes: 45,
  allPoints:    280,
  scoreToday:   3,
  date:         new Date(),
};

const bothDone    = TODAY.morningDone && TODAY.eveningDone;
const pointsToday = bothDone ? 25 : 0;

const MOON     = ['🌑','🌒','🌓','🌔','🌕'];
const SCORE_ZH = ['沉重','疲惫','平静','轻盈','圆满'];
const SCORE_EN = ['Heavy','Tired','Neutral','Light','Fulfilled'];
const MONTHS   = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DAYS     = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

const QUOTES = [
  { zh: '为学日益，为道日损', en: 'In pursuit of learning, every day something is gained\nIn pursuit of Tao, every day something is dropped' },
  { zh: '上善若水',           en: 'The highest good is like water' },
  { zh: '致虚极，守静笃',     en: 'Attain the utmost emptiness\nHold fast to stillness' },
  { zh: '知足者富',           en: 'Those who know enough are rich' },
  { zh: '曲则全',             en: 'Yield and overcome' },
  { zh: '信言不美，美言不信', en: 'True words are not beautiful\nBeautiful words are not true' },
  { zh: '胜人者有力，自胜者强', en: 'He who overcomes others has force\nHe who overcomes himself is strong' },
];

const quote = QUOTES[TODAY.date.getDay() % QUOTES.length];

export default function DailySummaryScreen() {
  const fadeIn     = useRef(new Animated.Value(0)).current;
  const lineAnim   = useRef(new Animated.Value(0)).current;
  const pointsAnim = useRef(new Animated.Value(0)).current;
  const [displayPoints, setDisplayPoints] = useState(0);

  useEffect(() => {
    Animated.sequence([
      Animated.timing(fadeIn,   { toValue:1, duration:1600, useNativeDriver:true }),
      Animated.timing(lineAnim, { toValue:1, duration:1200, useNativeDriver:false }),
    ]).start();

    if (bothDone) {
      Animated.timing(pointsAnim, {
        toValue: pointsToday,
        duration: 1800,
        useNativeDriver: false,
      }).start();
      pointsAnim.addListener(({ value }) => setDisplayPoints(Math.round(value)));
      return () => pointsAnim.removeAllListeners();
    }
  }, []);

  const lineWidth = lineAnim.interpolate({
    inputRange:  [0, 1],
    outputRange: ['0%', '100%'],
  });

  const dateStr = `${DAYS[TODAY.date.getDay()]}  ·  ${TODAY.date.getDate()} ${MONTHS[TODAY.date.getMonth()]}`;
  const totalH  = Math.floor(TODAY.totalMinutes / 60);
  const totalM  = TODAY.totalMinutes % 60;
  const timeStr = totalH > 0 ? `${totalH}h ${totalM}min` : `${totalM}min`;

  const accumMins = TODAY.allPoints * 2;
  const accumH    = Math.floor(accumMins / 60);
  const accumM    = accumMins % 60;

  const AI_UNLOCK   = 500;
  const progressPct = Math.min(100, Math.round((TODAY.allPoints / AI_UNLOCK) * 100));

  return (
    <ScrollView style={s.scroll} contentContainerStyle={s.root} showsVerticalScrollIndicator={false}>
      <StatusBar barStyle="dark-content" />
      <Animated.View style={[s.full, { opacity: fadeIn }]}>

        <Text style={s.dateStr}>{dateStr}</Text>
        <Text style={s.pageTitle}>今日归省</Text>
        <View style={s.lineWrap}>
          <Animated.View style={[s.line, { width: lineWidth }]} />
        </View>

        <Text style={s.sectionLabel}>今日正念</Text>
        <Text style={s.sectionLabelEn}>Today's Practice</Text>
        <View style={{ height: 20 }} />

        <View style={s.itemRow}>
          <Text style={[s.itemDot, TODAY.morningDone ? s.dotOn : s.dotOff]}>
            {TODAY.morningDone ? '●' : '○'}
          </Text>
          <View style={{ flex: 1 }}>
            <Text style={[s.itemZh, !TODAY.morningDone && s.dim]}>晨间冥想</Text>
            <Text style={s.itemEn}>Morning meditation</Text>
          </View>
          <Text style={[s.itemStatus, TODAY.morningDone ? s.statusOn : s.statusOff]}>
            {TODAY.morningDone ? '完成' : '未完成'}
          </Text>
        </View>

        <View style={s.itemDivider} />

        <View style={s.itemRow}>
          <Text style={[s.itemDot, TODAY.eveningDone ? s.dotOn : s.dotOff]}>
            {TODAY.eveningDone ? '●' : '○'}
          </Text>
          <View style={{ flex: 1 }}>
            <Text style={[s.itemZh, !TODAY.eveningDone && s.dim]}>归·晚间反思</Text>
            <Text style={s.itemEn}>Evening return</Text>
          </View>
          <Text style={[s.itemStatus, TODAY.eveningDone ? s.statusOn : s.statusOff]}>
            {TODAY.eveningDone ? '完成' : '未完成'}
          </Text>
        </View>

        <View style={s.sectionDivider} />

        <Text style={s.sectionLabel}>今日禅点</Text>
        <Text style={s.sectionLabelEn}>Zen Points</Text>
        <View style={{ height: 24 }} />

        {bothDone ? (
          <>
            <View style={s.pointsRow}>
              <Text style={s.pointsBig}>+{displayPoints}</Text>
              <Text style={s.pointsUnit}>✦</Text>
            </View>
            <Text style={s.pointsSub}>累积 {TODAY.allPoints + pointsToday} 禅点</Text>
            <View style={{ height: 24 }} />
            <View style={s.unlockWrap}>
              <View style={s.unlockTextRow}>
                <Text style={s.unlockLabel}>AI 个性化引导</Text>
                <Text style={s.unlockPct}>{progressPct}%</Text>
              </View>
              <View style={s.unlockBarBg}>
                <View style={[s.unlockBar, { width: `${progressPct}%` }]} />
              </View>
              <Text style={s.unlockHint}>还需 {AI_UNLOCK - TODAY.allPoints} 禅点解锁</Text>
            </View>
          </>
        ) : (
          <View style={s.noPointsBox}>
            <Text style={s.noPointsZh}>今日无禅点</Text>
            <Text style={s.noPointsEn}>
              Complete both morning & evening{'\n'}to receive today's points
            </Text>
          </View>
        )}

        <View style={s.sectionDivider} />

        <Text style={s.sectionLabel}>今日状态</Text>
        <Text style={s.sectionLabelEn}>Today's State</Text>
        <View style={{ height: 24 }} />
        <View style={s.moodRow}>
          <Text style={s.moodMoon}>{MOON[TODAY.scoreToday]}</Text>
          <View>
            <Text style={s.moodZh}>{SCORE_ZH[TODAY.scoreToday]}</Text>
            <Text style={s.moodEn}>{SCORE_EN[TODAY.scoreToday]}</Text>
          </View>
        </View>

        <View style={s.sectionDivider} />

        <Text style={s.sectionLabel}>今日正念时长</Text>
        <Text style={s.sectionLabelEn}>Time in Mindfulness</Text>
        <View style={{ height: 20 }} />
        <Text style={s.bigTime}>{timeStr}</Text>
        <View style={{ height: 8 }} />
        <Text style={s.accumTime}>累积正念时光　{accumH}h {accumM}min</Text>

        <View style={s.sectionDivider} />

        <View style={s.quoteBlock}>
          <Text style={s.quoteZh}>{quote.zh}</Text>
          <View style={s.hairline} />
          <Text style={s.quoteEn}>{quote.en}</Text>
        </View>

        <View style={{ height: 56 }} />
        <Text style={s.seeYou}>明日，再见</Text>
        <Text style={s.seeYouEn}>Until tomorrow</Text>
        <View style={{ height: 12 }} />
        <Text style={s.nextAlarm}>明日晨醒  06:00</Text>
        <View style={{ height: 80 }} />

      </Animated.View>
    </ScrollView>
  );
}

const INK = '#2a2e24', INK2 = '#485040', INK3 = '#7a8472';
const GOLD = '#8a7040', NIGHT = '#1e2030';

const s = StyleSheet.create({
  scroll:          { flex:1, backgroundColor:'#d4d0c8' },
  root:            { alignItems:'center', paddingHorizontal:32, paddingTop:72 },
  full:            { width:'100%', alignItems:'center' },
  dateStr:         { fontSize:11, color:INK3, letterSpacing:5, fontWeight:'300' },
  pageTitle:       { fontSize:28, color:NIGHT, letterSpacing:8, fontWeight:'200', marginTop:8, marginBottom:24 },
  lineWrap:        { width:'100%', height:1, backgroundColor:'rgba(30,32,48,0.08)', marginBottom:40 },
  line:            { height:1, backgroundColor:'rgba(30,32,48,0.25)' },
  sectionLabel:    { fontSize:11, color:INK3, letterSpacing:5, fontWeight:'300', alignSelf:'flex-start' },
  sectionLabelEn:  { fontSize:9,  color:INK3, letterSpacing:3, marginTop:3, opacity:0.6, fontStyle:'italic', alignSelf:'flex-start' },
  sectionDivider:  { width:'100%', height:1, backgroundColor:'rgba(30,32,48,0.08)', marginVertical:32 },
  itemRow:         { flexDirection:'row', alignItems:'center', gap:14, width:'100%' },
  itemDot:         { fontSize:10, width:16 },
  dotOn:           { color:GOLD },
  dotOff:          { color:'rgba(30,32,48,0.2)' },
  itemZh:          { fontSize:15, color:INK2, letterSpacing:3, fontWeight:'300' },
  itemEn:          { fontSize:9,  color:INK3, letterSpacing:1, fontStyle:'italic', marginTop:2, opacity:0.6 },
  dim:             { opacity:0.3 },
  itemStatus:      { fontSize:11, letterSpacing:2 },
  statusOn:        { color:GOLD },
  statusOff:       { color:'rgba(30,32,48,0.25)' },
  itemDivider:     { height:1, backgroundColor:'rgba(30,32,48,0.06)', marginVertical:16, width:'100%' },
  pointsRow:       { flexDirection:'row', alignItems:'flex-end', gap:8 },
  pointsBig:       { fontSize:52, color:NIGHT, fontWeight:'200', letterSpacing:2 },
  pointsUnit:      { fontSize:22, color:GOLD, marginBottom:10 },
  pointsSub:       { fontSize:11, color:INK3, letterSpacing:3, marginTop:4, opacity:0.7 },
  unlockWrap:      { width:'100%', gap:8 },
  unlockTextRow:   { flexDirection:'row', justifyContent:'space-between' },
  unlockLabel:     { fontSize:10, color:INK3, letterSpacing:2, opacity:0.7 },
  unlockPct:       { fontSize:10, color:GOLD, letterSpacing:1 },
  unlockBarBg:     { width:'100%', height:1, backgroundColor:'rgba(30,32,48,0.1)' },
  unlockBar:       { height:1, backgroundColor:'rgba(138,112,64,0.5)' },
  unlockHint:      { fontSize:9, color:INK3, letterSpacing:1, opacity:0.5, fontStyle:'italic' },
  noPointsBox:     { width:'100%', borderWidth:1, borderColor:'rgba(30,32,48,0.08)', padding:24, alignItems:'center', gap:12 },
  noPointsZh:      { fontSize:16, color:INK2, letterSpacing:5, fontWeight:'300', opacity:0.6 },
  noPointsEn:      { fontSize:10, color:INK3, letterSpacing:1, fontStyle:'italic', textAlign:'center', lineHeight:18, opacity:0.5 },
  moodRow:         { flexDirection:'row', alignItems:'center', gap:20, alignSelf:'flex-start' },
  moodMoon:        { fontSize:38 },
  moodZh:          { fontSize:20, color:NIGHT, letterSpacing:5, fontWeight:'200' },
  moodEn:          { fontSize:10, color:INK3, letterSpacing:2, fontStyle:'italic', marginTop:4, opacity:0.6 },
  bigTime:         { fontSize:44, color:NIGHT, fontWeight:'200', letterSpacing:2, alignSelf:'flex-start' },
  accumTime:       { fontSize:11, color:INK3, letterSpacing:3, opacity:0.6, alignSelf:'flex-start' },
  quoteBlock:      { width:'100%', alignItems:'center', paddingVertical:8 },
  quoteZh:         { fontSize:18, color:INK2, letterSpacing:6, fontWeight:'300', textAlign:'center' },
  hairline:        { width:24, height:1, backgroundColor:'rgba(30,32,48,0.15)', marginVertical:20 },
  quoteEn:         { fontSize:10, color:INK3, letterSpacing:1, fontStyle:'italic', textAlign:'center', lineHeight:20, opacity:0.6 },
  seeYou:          { fontSize:22, color:NIGHT, letterSpacing:8, fontWeight:'200' },
  seeYouEn:        { fontSize:10, color:INK3, letterSpacing:4, marginTop:6, opacity:0.6 },
  nextAlarm:       { fontSize:11, color:INK3, letterSpacing:4, opacity:0.4 },
});
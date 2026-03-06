import { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions, StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const { width, height } = Dimensions.get('window');

const GUIDANCE = [
  { zh: '轻闭双眼\n将注意力带回呼吸', en: 'Close your eyes gently\nReturn to your breath' },
  { zh: '放松肩膀\n让身体沉入此刻', en: 'Relax your shoulders\nLet your body settle' },
  { zh: '思绪飘走时\n温柔地拉回呼吸', en: 'When thoughts arise\ngently return' },
  { zh: '带着觉知\n感受清晨的光', en: 'Feel the morning light\nwith full awareness' },
];

export default function MeditationScreen({ onDone }: { onDone?: () => void }) {
  const [phase, setPhase]     = useState('inhale');
  const [stepIdx, setStepIdx] = useState(0);
  const [seconds, setSeconds] = useState(300);
  const [done, setDone]       = useState(false);
  const [breathCount, setBreathCount] = useState(0);

  const orbScale  = useRef(new Animated.Value(1)).current;
  const fadeIn    = useRef(new Animated.Value(0)).current;
  const textFade  = useRef(new Animated.Value(1)).current;
  const breathAnim = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    Animated.timing(fadeIn, { toValue:1, duration:1800, useNativeDriver:true }).start();
  }, []);

  useEffect(() => {
    if (done) return;
    const runCycle = () => {
      setPhase('inhale');
      breathAnim.current = Animated.sequence([
        Animated.timing(orbScale, { toValue:1.35, duration:4000, useNativeDriver:true }),
        Animated.timing(orbScale, { toValue:1.0,  duration:4000, useNativeDriver:true }),
      ]);
      breathAnim.current.start(({ finished }) => {
        if (finished) {
          setPhase('exhale');
          setBreathCount(c => c + 1);
          runCycle();
        }
      });
    };
    runCycle();
    return () => breathAnim.current?.stop();
  }, [done]);

  useEffect(() => {
    if (done) return;
    const t = setInterval(() => {
      setSeconds(s => {
        if (s <= 1) { clearInterval(t); setDone(true); return 0; }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [done]);

  useEffect(() => {
    const elapsed = 300 - seconds;
    const idx = Math.min(GUIDANCE.length - 1, Math.floor(elapsed / 75));
    if (idx !== stepIdx) {
      Animated.timing(textFade, { toValue:0, duration:400, useNativeDriver:true }).start(() => {
        setStepIdx(idx);
        Animated.timing(textFade, { toValue:1, duration:600, useNativeDriver:true }).start();
      });
    }
  }, [seconds]);

  const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');

  if (done) {
    return (
      <View style={s.root}>
        <StatusBar barStyle="dark-content" />
        <Animated.View style={[s.center, { opacity: fadeIn }]}>
          <Text style={s.sealChar}>禅</Text>
          <View style={s.hairline} />
          <Text style={s.doneTitle}>今日正念完成</Text>
          <Text style={s.doneTitleEn}>Session Complete</Text>
          <View style={{ height: 32 }} />
          <Text style={s.doneQuote}>行到水穷处</Text>
          <Text style={s.doneQuoteEn}>Walk to where the water ends</Text>
          <View style={{ height: 8 }} />
          <Text style={s.doneQuote}>坐看云起时</Text>
          <Text style={s.doneQuoteEn}>Sit and watch the clouds arise</Text>
          <View style={{ height: 48 }} />
          <TouchableOpacity style={s.btn} onPress={() => onDone && onDone()}>
            <Text style={s.btnText}>开始正念晨间  ›</Text>
            <Text style={s.btnTextEn}>Begin mindful morning</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  }

  return (
    <View style={s.root}>
      <StatusBar barStyle="dark-content" />
      <Animated.View style={[s.header, { opacity: fadeIn }]}>
        <Text style={s.headerLabel}>正念冥想</Text>
        <Text style={s.timer}>{mm}:{ss}</Text>
      </Animated.View>
      <View style={s.orbWrap}>
        <Animated.View style={[s.orbOuter, { transform: [{ scale: orbScale }] }]}>
          <View style={s.orbInner}>
            <Text style={s.orbChar}>心</Text>
          </View>
        </Animated.View>
      </View>
      <Animated.View style={[s.phaseWrap, { opacity: fadeIn }]}>
        <Text style={s.phaseText}>{phase === 'inhale' ? '吸　气' : '呼　气'}</Text>
        <Text style={s.phaseEn}>{phase === 'inhale' ? 'Inhale' : 'Exhale'}</Text>
        <Text style={s.breathNum}>第 {breathCount + 1} 次呼吸</Text>
      </Animated.View>
      <Animated.View style={[s.guidanceBox, { opacity: textFade }]}>
        <Text style={s.guidanceZh}>{GUIDANCE[stepIdx].zh}</Text>
        <Text style={s.guidanceEn}>{GUIDANCE[stepIdx].en}</Text>
      </Animated.View>
      <View style={s.dots}>
        {GUIDANCE.map((_, i) => (
          <View key={i} style={[s.dot, i === stepIdx && s.dotActive, i < stepIdx && s.dotDone]} />
        ))}
      </View>
      <Animated.View style={{ opacity: fadeIn }}>
        <TouchableOpacity onPress={() => setDone(true)}>
          <Text style={s.skip}>跳过  ›</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const INK = '#2a2e24', INK2 = '#485040', INK3 = '#7a8472', GOLD = '#8a7040';

const s = StyleSheet.create({
  root:        { flex:1, backgroundColor:'#dedad2', alignItems:'center', justifyContent:'space-between', paddingVertical:56 },
  center:      { alignItems:'center', width:'100%', paddingHorizontal:32 },
  header:      { width:'100%', flexDirection:'row', justifyContent:'space-between', alignItems:'center', paddingHorizontal:32 },
  headerLabel: { fontSize:13, color:INK3, letterSpacing:4, fontWeight:'300' },
  timer:       { fontSize:15, color:INK2, letterSpacing:2, fontWeight:'300' },
  orbWrap:     { alignItems:'center', justifyContent:'center', width:240, height:240 },
  orbOuter:    { width:180, height:180, borderRadius:90, borderWidth:1, borderColor:'rgba(42,46,36,0.14)', backgroundColor:'rgba(234,230,220,0.6)', alignItems:'center', justifyContent:'center' },
  orbInner:    { width:130, height:130, borderRadius:65, borderWidth:0.5, borderColor:'rgba(42,46,36,0.10)', alignItems:'center', justifyContent:'center' },
  orbChar:     { fontSize:42, color:INK2, fontWeight:'100', opacity:0.7 },
  phaseWrap:   { alignItems:'center', gap:4 },
  phaseText:   { fontSize:22, color:INK, letterSpacing:8, fontWeight:'200' },
  phaseEn:     { fontSize:11, color:INK3, letterSpacing:3, fontStyle:'italic', opacity:0.7 },
  breathNum:   { fontSize:10, color:INK3, letterSpacing:2, marginTop:4, opacity:0.5 },
  guidanceBox: { marginHorizontal:32, padding:20, borderWidth:1, borderColor:'rgba(42,46,36,0.08)', backgroundColor:'rgba(234,230,220,0.5)', borderRadius:4, alignItems:'center', gap:6 },
  guidanceZh:  { fontSize:15, color:INK2, letterSpacing:4, fontWeight:'300', textAlign:'center', lineHeight:26 },
  guidanceEn:  { fontSize:10, color:INK3, letterSpacing:1, fontStyle:'italic', textAlign:'center', lineHeight:18, opacity:0.7 },
  dots:        { flexDirection:'row', gap:8 },
  dot:         { width:5, height:5, borderRadius:2.5, backgroundColor:'rgba(42,46,36,0.15)' },
  dotActive:   { width:16, borderRadius:3, backgroundColor:GOLD },
  dotDone:     { backgroundColor:'rgba(138,112,64,0.4)' },
  skip:        { fontSize:11, color:INK3, letterSpacing:3, opacity:0.5 },
  sealChar:    { fontSize:64, color:INK, fontWeight:'100', letterSpacing:4, opacity:0.8 },
  hairline:    { width:32, height:1, backgroundColor:'rgba(42,46,36,0.15)', marginVertical:24 },
  doneTitle:   { fontSize:22, color:INK, letterSpacing:6, fontWeight:'300' },
  doneTitleEn: { fontSize:10, color:INK3, letterSpacing:4, marginTop:6, fontWeight:'300' },
  doneQuote:   { fontSize:16, color:INK2, letterSpacing:5, fontWeight:'300' },
  doneQuoteEn: { fontSize:10, color:INK3, letterSpacing:1, fontStyle:'italic', opacity:0.6, marginBottom:8 },
  btn:         { borderWidth:1, borderColor:'rgba(42,46,36,0.2)', paddingHorizontal:32, paddingVertical:14, borderRadius:2, alignItems:'center', gap:4 },
  btnText:     { fontSize:13, color:INK2, letterSpacing:4, fontWeight:'300' },
  btnTextEn:   { fontSize:10, color:INK3, letterSpacing:2, opacity:0.6, fontStyle:'italic' },
});
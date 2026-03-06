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
  { label: 'Arrive',  sub: 'Close your eyes · return to breath' },
  { label: 'Release', sub: 'Relax your shoulders · settle in' },
  { label: 'Return',  sub: 'When thoughts arise · gently return' },
  { label: 'Awaken',  sub: 'Feel the morning light · be aware' },
];

export default function MeditationScreen({ onDone }: { onDone?: () => void }) {
  const [phase, setPhase]             = useState<'inhale'|'exhale'>('inhale');
  const [stepIdx, setStepIdx]         = useState(0);
  const [seconds, setSeconds]         = useState(300);
  const [done, setDone]               = useState(false);
  const [breathCount, setBreathCount] = useState(0);

  const orbScale   = useRef(new Animated.Value(1)).current;
  const fadeIn     = useRef(new Animated.Value(0)).current;
  const textFade   = useRef(new Animated.Value(1)).current;
  const mist1      = useRef(new Animated.Value(0)).current;
  const mist2      = useRef(new Animated.Value(0)).current;
  const brushY     = useRef(new Animated.Value(0)).current;
  const ring1      = useRef(new Animated.Value(0)).current;
  const ring2      = useRef(new Animated.Value(0)).current;
  const breathAnim = useRef(null as any);

  useEffect(() => {
    Animated.timing(fadeIn, { toValue:1, duration:1800, useNativeDriver:true }).start();
  }, []);

  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(mist1, { toValue:1, duration:8000,  useNativeDriver:true }),
      Animated.timing(mist1, { toValue:0, duration:8000,  useNativeDriver:true }),
    ])).start();
    Animated.loop(Animated.sequence([
      Animated.timing(mist2, { toValue:1, duration:11000, useNativeDriver:true }),
      Animated.timing(mist2, { toValue:0, duration:11000, useNativeDriver:true }),
    ])).start();
    Animated.loop(Animated.sequence([
      Animated.timing(brushY, { toValue:1, duration:14000, useNativeDriver:true }),
      Animated.timing(brushY, { toValue:0, duration:14000, useNativeDriver:true }),
    ])).start();
  }, []);

  useEffect(() => {
    if (done) return;
    const ripple = (anim: Animated.Value, delay: number) => {
      Animated.loop(Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, { toValue:1, duration:4000, useNativeDriver:true }),
        Animated.timing(anim, { toValue:0, duration:0,    useNativeDriver:true }),
      ])).start();
    };
    ripple(ring1, 0);
    ripple(ring2, 2000);
  }, [done]);

  useEffect(() => {
    if (done) return;
    const cycle = () => {
      setPhase('inhale');
      breathAnim.current = Animated.sequence([
        Animated.timing(orbScale, { toValue:1.38, duration:4000, useNativeDriver:true }),
        Animated.timing(orbScale, { toValue:1.0,  duration:4000, useNativeDriver:true }),
      ]);
      breathAnim.current.start(({ finished }: { finished: boolean }) => {
        if (finished) { setPhase('exhale'); setBreathCount((c: number) => c+1); cycle(); }
      });
    };
    cycle();
    return () => breathAnim.current?.stop();
  }, [done]);

  useEffect(() => {
    if (done) return;
    const t = setInterval(() => {
      setSeconds((s: number) => {
        if (s <= 1) { clearInterval(t); setDone(true); return 0; }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [done]);

  useEffect(() => {
    const idx = Math.min(GUIDANCE.length-1, Math.floor((300-seconds)/75));
    if (idx !== stepIdx) {
      Animated.timing(textFade, { toValue:0, duration:400, useNativeDriver:true }).start(() => {
        setStepIdx(idx);
        Animated.timing(textFade, { toValue:1, duration:600, useNativeDriver:true }).start();
      });
    }
  }, [seconds]);

  const mm = String(Math.floor(seconds/60)).padStart(2,'0');
  const ss = String(seconds%60).padStart(2,'0');

  const rippleStyle = (anim: Animated.Value) => ({
    opacity:   anim.interpolate({ inputRange:[0,0.2,1], outputRange:[0,0.08,0] }),
    transform: [{ scale: anim.interpolate({ inputRange:[0,1], outputRange:[1,2.8] }) }],
  });

  const Background = () => (
    <>
      <View style={s.mountain1} /><View style={s.mountain2} /><View style={s.mountain3} />
      {[0.62,0.65,0.68].map((pos,i) => (
        <View key={i} style={[s.waterLine, { top:height*pos, opacity:0.04+i*0.02, width:width*[0.8,0.9,0.75][i], alignSelf:'center' }]} />
      ))}
      <Animated.View style={[s.mist1Layer, { transform:[{ translateY: mist1.interpolate({ inputRange:[0,1], outputRange:[0,-10] }) }] }]} />
      <Animated.View style={[s.mist2Layer, { transform:[{ translateX: mist2.interpolate({ inputRange:[0,1], outputRange:[0,14] }) }] }]} />
      <Animated.View style={[s.brushGroup, { transform:[{ translateY: brushY.interpolate({ inputRange:[0,1], outputRange:[0,-14] }) }] }]}>
        {[
          { left:width*0.06, h:100, op:0.06 },{ left:width*0.12, h:160, op:0.08 },
          { left:width*0.17, h:70,  op:0.05 },{ left:width*0.80, h:130, op:0.07 },
          { left:width*0.86, h:80,  op:0.09 },{ left:width*0.91, h:110, op:0.05 },
        ].map((b,i) => (
          <View key={i} style={{ position:'absolute', left:b.left, bottom:0, width:1.5, height:b.h, backgroundColor:'#2a2e24', opacity:b.op, borderRadius:1 }} />
        ))}
      </Animated.View>
      <View style={s.cornerTL} /><View style={s.cornerBR} />
    </>
  );

  // ── 完成页 ──
  if (done) {
    return (
      <View style={s.root}>
        <StatusBar barStyle="dark-content" />
        <Background />
        <Animated.View style={[s.content, { opacity: fadeIn }]}>
          <Text style={s.kanji}>心</Text>
          <View style={s.hairline} />
          <Text style={s.mainWord}>Complete</Text>
          <Text style={s.subWord}>{breathCount} breaths  ·  5 minutes</Text>
          <View style={{ height: 48 }} />
          <Text style={s.quote}>Walk to where the water ends</Text>
          <Text style={s.quote}>Sit and watch the clouds arise</Text>
          <View style={{ height: 56 }} />
          <TouchableOpacity style={s.btn} onPress={() => onDone && onDone()}>
            <Text style={s.btnText}>Begin your morning  ›</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  }

  // ── 冥想页 ──
  return (
    <View style={s.root}>
      <StatusBar barStyle="dark-content" />
      <Background />

      <View style={s.progressWrap}>
        <View style={[s.progressBar, { width:`${((300-seconds)/300)*100}%` }]} />
      </View>

      <Animated.View style={[s.content, { opacity: fadeIn }]}>

        {/* 顶部计时 */}
        <Text style={s.timerLabel}>{mm}:{ss}</Text>
        <Text style={s.breathLabel}>{breathCount} breaths</Text>

        <View style={{ height: 28 }} />

        {/* 大圆 */}
        <View style={s.stage}>
          <Animated.View style={[s.ripple, rippleStyle(ring1)]} />
          <Animated.View style={[s.ripple, rippleStyle(ring2)]} />
          <Animated.View style={[s.orbOuter, { transform:[{ scale: orbScale }] }]}>
            <View style={s.orbMid}>
              <Text style={s.kanji}>心</Text>
              <Text style={s.phaseIndicator}>{phase === 'inhale' ? '↑' : '↓'}</Text>
            </View>
          </Animated.View>
        </View>

        <View style={{ height: 28 }} />

        {/* 英文主词 */}
        <Text style={s.mainWord}>Breathing</Text>

        {/* 引导文字 */}
        <Animated.View style={{ opacity: textFade, alignItems:'center', marginTop:10 }}>
          <Text style={s.subWord}>{GUIDANCE[stepIdx].sub}</Text>
        </Animated.View>

        {/* 步骤点 */}
        <View style={s.stepDots}>
          {GUIDANCE.map((_,i) => (
            <View key={i} style={[s.stepDot, i===stepIdx && s.stepDotActive, i<stepIdx && s.stepDotDone]} />
          ))}
        </View>

        <View style={{ height: 36 }} />

        <TouchableOpacity onPress={() => setDone(true)}>
          <Text style={s.skip}>skip  ›</Text>
        </TouchableOpacity>

      </Animated.View>
    </View>
  );
}

const INK = '#2a2e24', INK2 = '#485040', INK3 = '#7a8472', GOLD = '#8a7040', BG = '#dedad2';

const s = StyleSheet.create({
  root:       { flex:1, backgroundColor:BG },
  mountain1:  { position:'absolute', width:width*1.4, height:width*1.4, borderRadius:width*0.7,  backgroundColor:'rgba(42,46,36,0.045)', bottom:-width*0.95, left:-width*0.2 },
  mountain2:  { position:'absolute', width:width*1.1, height:width*1.1, borderRadius:width*0.55, backgroundColor:'rgba(42,46,36,0.035)', bottom:-width*0.72, left:width*0.1 },
  mountain3:  { position:'absolute', width:width*0.8, height:width*0.8, borderRadius:width*0.4,  backgroundColor:'rgba(42,46,36,0.03)',  bottom:-width*0.52, right:-width*0.05 },
  waterLine:  { position:'absolute', height:1, backgroundColor:'#2a2e24' },
  mist1Layer: { position:'absolute', width:width*1.3, height:80,  borderRadius:40, backgroundColor:'rgba(234,230,220,0.55)', bottom:height*0.22, left:-width*0.15 },
  mist2Layer: { position:'absolute', width:width*0.8, height:50,  borderRadius:25, backgroundColor:'rgba(234,230,220,0.35)', bottom:height*0.27, right:-width*0.1 },
  brushGroup: { position:'absolute', bottom:height*0.12, left:0, right:0, height:180 },
  cornerTL:   { position:'absolute', width:100, height:100, borderRadius:50, borderWidth:1, borderColor:'rgba(42,46,36,0.07)', top:-30, left:-30 },
  cornerBR:   { position:'absolute', width:70,  height:70,  borderRadius:35, borderWidth:1, borderColor:'rgba(42,46,36,0.06)', bottom:70, right:-15 },

  progressWrap: { position:'absolute', top:0, left:0, right:0, height:1, backgroundColor:'rgba(42,46,36,0.08)' },
  progressBar:  { height:1, backgroundColor:'rgba(42,46,36,0.3)' },

  content:    { flex:1, alignItems:'center', justifyContent:'center', paddingHorizontal:40 },

  timerLabel: { fontSize:13, color:INK2, letterSpacing:5, fontWeight:'300' },
  breathLabel:{ fontSize:11, color:INK3, letterSpacing:3, marginTop:4, opacity:0.7 },

  stage:      { width:240, height:240, alignItems:'center', justifyContent:'center' },
  ripple:     { position:'absolute', width:180, height:180, borderRadius:90, borderWidth:1, borderColor:'#2a2e24' },
  orbOuter:   { width:180, height:180, borderRadius:90, borderWidth:1, borderColor:'rgba(42,46,36,0.15)', backgroundColor:'rgba(234,230,220,0.6)', alignItems:'center', justifyContent:'center' },
  orbMid:     { width:140, height:140, borderRadius:70, borderWidth:0.5, borderColor:'rgba(42,46,36,0.09)', alignItems:'center', justifyContent:'center', gap:8 },
  kanji:      { fontSize:48, color:INK, fontWeight:'200', letterSpacing:4 },
  phaseIndicator: { fontSize:16, color:INK3, opacity:0.6 },

 mainWord: { fontSize:28, color:INK2, letterSpacing:10, fontWeight:'300' },
  subWord:    { fontSize:13, color:INK2, letterSpacing:3, fontWeight:'300', textAlign:'center' },

  stepDots:     { flexDirection:'row', gap:8, marginTop:20 },
  stepDot:      { width:5, height:5, borderRadius:2.5, backgroundColor:'rgba(42,46,36,0.15)' },
  stepDotActive:{ width:18, borderRadius:3, backgroundColor:GOLD },
  stepDotDone:  { backgroundColor:'rgba(138,112,64,0.4)' },

  skip:    { fontSize:11, color:INK3, letterSpacing:3, opacity:0.45 },
  hairline:{ width:32, height:1, backgroundColor:'rgba(42,46,36,0.15)', marginVertical:24 },
  quote:   { fontSize:12, color:INK2, letterSpacing:2, fontStyle:'italic', opacity:0.7, marginBottom:8 },
  btn:     { borderWidth:1, borderColor:'rgba(42,46,36,0.2)', paddingHorizontal:32, paddingVertical:14, borderRadius:2 },
  btnText: { fontSize:13, color:INK2, letterSpacing:4, fontWeight:'300' },
});
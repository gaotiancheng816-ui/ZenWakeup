import { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { playBreathTone } from '../utils/sounds';

const { width, height } = Dimensions.get('window');
const INK = '#2a2e24', INK2 = '#485040', INK3 = '#7a8472', BG = '#dedad2';

const PHASES = [
  { phase: 'inhale', label: 'Breathe in',  sub: 'Slowly · through your nose', duration: 4000 },
  { phase: 'hold',   label: 'Hold',         sub: 'Gently · no effort',         duration: 2000 },
  { phase: 'exhale', label: 'Breathe out',  sub: 'Slowly · release everything', duration: 6000 },
  { phase: 'rest',   label: 'Rest',         sub: 'Just be here',               duration: 2000 },
];

const TOTAL_SECONDS = 5 * 60;

interface Props {
  onDone: () => void;
}

export default function IntroMeditationScreen({ onDone }: Props) {
  const [phaseIdx,  setPhaseIdx]  = useState(0);
  const [seconds,   setSeconds]   = useState(TOTAL_SECONDS);
  const [done,      setDone]      = useState(false);

  const orbScale  = useRef(new Animated.Value(1)).current;
  const fadeIn    = useRef(new Animated.Value(0)).current;
  const glowOpac  = useRef(new Animated.Value(0.08)).current;
  const mist1     = useRef(new Animated.Value(0)).current;
  const brushY    = useRef(new Animated.Value(0)).current;
  const phaseAnim = useRef<Animated.CompositeAnimation | null>(null);
  const phaseRef  = useRef(0);

  useEffect(() => {
    Animated.timing(fadeIn, { toValue:1, duration:2000, useNativeDriver:true }).start();
    Animated.loop(Animated.sequence([
      Animated.timing(mist1, { toValue:1, duration:9000, useNativeDriver:true }),
      Animated.timing(mist1, { toValue:0, duration:9000, useNativeDriver:true }),
    ])).start();
    Animated.loop(Animated.sequence([
      Animated.timing(brushY, { toValue:1, duration:15000, useNativeDriver:true }),
      Animated.timing(brushY, { toValue:0, duration:15000, useNativeDriver:true }),
    ])).start();
    runPhase(0);
  }, []);

  // Countdown timer
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

  function runPhase(idx: number) {
    const p = PHASES[idx % PHASES.length];
    phaseRef.current = idx % PHASES.length;
    setPhaseIdx(idx % PHASES.length);

    if (p.phase === 'inhale') playBreathTone('inhale');
    if (p.phase === 'exhale') playBreathTone('exhale');

    // Orb animation
    const toScale = p.phase === 'inhale' ? 1.28
                  : p.phase === 'hold'   ? 1.28
                  : p.phase === 'exhale' ? 0.92
                  : 0.92;

    const toGlow  = p.phase === 'inhale' ? 0.18
                  : p.phase === 'hold'   ? 0.18
                  : 0.06;

    phaseAnim.current = Animated.parallel([
      Animated.timing(orbScale, { toValue:toScale, duration:p.duration, useNativeDriver:true }),
      Animated.timing(glowOpac, { toValue:toGlow,  duration:p.duration, useNativeDriver:true }),
    ]);

    phaseAnim.current.start(({ finished }) => {
      if (finished) runPhase(idx + 1);
    });
  }

  const mins = String(Math.floor(seconds / 60)).padStart(2, '0');
  const secs = String(seconds % 60).padStart(2, '0');
  const current = PHASES[phaseIdx];

  if (done) {
    return (
      <View style={s.root}>
        <View style={s.mountain1} /><View style={s.mountain2} /><View style={s.mountain3} />
        <Animated.View style={[s.content, { opacity: fadeIn }]}>
          <Text style={s.doneKanji}>心</Text>
          <View style={{ height: 24 }} />
          <Text style={s.doneTitle}>Well done</Text>
          <View style={{ height: 12 }} />
          <Text style={s.doneSub}>You just completed your first{'\n'}ZenWakeup meditation.</Text>
          <View style={{ height: 16 }} />
          <Text style={s.doneSub2}>This feeling — of stillness after breath —{'\n'}is what we return to, every morning.</Text>
          <View style={{ height: 56 }} />
          <TouchableOpacity style={s.btn} onPress={onDone}>
            <Text style={s.btnText}>Set my morning alarm  ›</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  }

  return (
    <View style={s.root}>
      {/* 背景 */}
      <View style={s.mountain1} /><View style={s.mountain2} /><View style={s.mountain3} />
      {[0.38,0.42,0.46].map((pos,i) => (
        <View key={i} style={[s.waterLine, {
          top: height*pos, opacity: 0.03+i*0.012,
          width: width*[0.7,0.82,0.65][i], alignSelf:'center',
        }]} />
      ))}
      <Animated.View style={[s.mistLayer, {
        transform:[{ translateY: mist1.interpolate({ inputRange:[0,1], outputRange:[0,-10] }) }]
      }]} />
      <Animated.View style={[s.brushGroup, {
        transform:[{ translateY: brushY.interpolate({ inputRange:[0,1], outputRange:[0,-14] }) }]
      }]}>
        {[
          { left:width*0.05, h:100, op:0.05 },{ left:width*0.10, h:150, op:0.07 },
          { left:width*0.15, h:65,  op:0.04 },{ left:width*0.79, h:120, op:0.06 },
          { left:width*0.85, h:80,  op:0.08 },{ left:width*0.90, h:100, op:0.05 },
        ].map((b,i) => (
          <View key={i} style={{
            position:'absolute', left:b.left, bottom:0,
            width:1.5, height:b.h, backgroundColor:'#1e2030',
            opacity:b.op, borderRadius:1,
          }} />
        ))}
      </Animated.View>
      <View style={s.cornerTL} /><View style={s.cornerBR} />

      <Animated.View style={[s.content, { opacity: fadeIn }]}>

        <Text style={s.timer}>{mins}:{secs}</Text>
        <View style={{ height: 32 }} />

        {/* 呼吸球 */}
        <View style={s.stage}>
          <Animated.View style={[s.glow, { opacity: glowOpac }]} />
          <Animated.View style={[s.orb, { transform:[{ scale: orbScale }] }]}>
            <View style={s.orbInner}>
              <Text style={s.orbKanji}>息</Text>
            </View>
          </Animated.View>
        </View>

        <View style={{ height: 36 }} />

        <Text style={s.phaseLabel}>{current.label}</Text>
        <View style={{ height: 8 }} />
        <Text style={s.phaseSub}>{current.sub}</Text>

        <View style={{ height: 64 }} />

        <TouchableOpacity onPress={() => { setDone(true); }} style={s.skipBtn}>
          <Text style={s.skipText}>skip  ›</Text>
        </TouchableOpacity>

      </Animated.View>
    </View>
  );
}

const s = StyleSheet.create({
  root:    { flex:1, backgroundColor:BG },
  content: { flex:1, alignItems:'center', justifyContent:'center', paddingHorizontal:40 },

  mountain1:  { position:'absolute', width:width*1.4, height:width*1.4, borderRadius:width*0.7,  backgroundColor:'rgba(30,32,48,0.04)',  top:height*0.45, left:-width*0.2 },
  mountain2:  { position:'absolute', width:width*1.1, height:width*1.1, borderRadius:width*0.55, backgroundColor:'rgba(30,32,48,0.03)',  top:height*0.48, left:width*0.1 },
  mountain3:  { position:'absolute', width:width*0.8, height:width*0.8, borderRadius:width*0.4,  backgroundColor:'rgba(30,32,48,0.025)', top:height*0.50, right:-width*0.05 },
  waterLine:  { position:'absolute', height:1, backgroundColor:'#1e2030' },
  mistLayer:  { position:'absolute', width:width*1.3, height:80, borderRadius:40, backgroundColor:'rgba(220,216,206,0.4)', top:height*0.32, left:-width*0.15 },
  brushGroup: { position:'absolute', top:height*0.25, left:0, right:0, height:180 },
  cornerTL:   { position:'absolute', width:100, height:100, borderRadius:50, borderWidth:1, borderColor:'rgba(30,32,48,0.06)', top:-30, left:-30 },
  cornerBR:   { position:'absolute', width:70,  height:70,  borderRadius:35, borderWidth:1, borderColor:'rgba(30,32,48,0.05)', top:height*0.55, right:-15 },

  timer: { fontSize:13, color:INK3, letterSpacing:4, fontWeight:'300' },

  stage:    { width:240, height:240, alignItems:'center', justifyContent:'center' },
  glow:     { position:'absolute', width:220, height:220, borderRadius:110, backgroundColor:'#2a2e24' },
  orb:      { width:180, height:180, borderRadius:90, borderWidth:1, borderColor:'rgba(42,46,36,0.18)', backgroundColor:'rgba(222,218,210,0.7)', alignItems:'center', justifyContent:'center' },
  orbInner: { width:130, height:130, borderRadius:65, borderWidth:0.5, borderColor:'rgba(42,46,36,0.1)', alignItems:'center', justifyContent:'center' },
  orbKanji: { fontSize:48, color:INK, fontWeight:'200', letterSpacing:4 },

  phaseLabel: { fontSize:28, color:INK2, letterSpacing:8, fontWeight:'300' },
  phaseSub:   { fontSize:12, color:INK3, letterSpacing:2, fontStyle:'italic', opacity:0.7 },

  skipBtn:  { padding:12 },
  skipText: { fontSize:11, color:INK3, letterSpacing:3, opacity:0.4 },

  // Done screen
  doneKanji: { fontSize:80, color:INK, fontWeight:'200', letterSpacing:6, opacity:0.8 },
  doneTitle: { fontSize:28, color:INK2, letterSpacing:8, fontWeight:'300' },
  doneSub:   { fontSize:13, color:INK2, letterSpacing:1.5, textAlign:'center', lineHeight:24, opacity:0.7 },
  doneSub2:  { fontSize:12, color:INK3, letterSpacing:1.5, textAlign:'center', lineHeight:22, fontStyle:'italic', opacity:0.6 },
  btn:       { borderWidth:1, borderColor:'rgba(42,46,36,0.25)', paddingHorizontal:40, paddingVertical:16, borderRadius:2 },
  btnText:   { fontSize:13, color:INK2, letterSpacing:4, fontWeight:'300' },
});

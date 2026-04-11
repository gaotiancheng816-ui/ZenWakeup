import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { TapButton } from '../components/tap-button';
import Svg, { Circle, Path } from 'react-native-svg';
import { AppTheme } from '../constants/app-themes';
import { useTheme } from '../utils/theme-context';
import { playBreathTone } from '../utils/sounds';

const { width, height } = Dimensions.get('window');

const PHASES = [
  { phase: 'inhale', duration: 3000 },
  { phase: 'hold',   duration:  500 },
  { phase: 'exhale', duration: 3000 },
  { phase: 'rest',   duration:  500 },
];

const TOTAL_SECONDS = 3 * 60;

interface Props {
  onDone: () => void;
}

export default function IntroMeditationScreen({ onDone }: Props) {
  const { theme: T } = useTheme();
  const INK = T.ink, INK2 = T.ink2, INK3 = T.ink3, GOLD = T.gold, BG = T.bg;
  const s = makeStyles(T);

  const [ready,   setReady]   = useState(false);
  const [seconds, setSeconds] = useState(TOTAL_SECONDS);
  const [done,    setDone]    = useState(false);

  const orbScale  = useRef(new Animated.Value(1)).current;
  const ensoRot   = useRef(new Animated.Value(0)).current;
  const fadeIn    = useRef(new Animated.Value(0)).current;
  const glowOpac  = useRef(new Animated.Value(0.08)).current;
  const mist1     = useRef(new Animated.Value(0)).current;
  const brushY    = useRef(new Animated.Value(0)).current;
  const phaseAnim = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    Animated.timing(fadeIn, { toValue: 1, duration: 2000, useNativeDriver: true }).start();
    Animated.loop(Animated.sequence([
      Animated.timing(mist1,  { toValue: 1, duration: 9000,  useNativeDriver: true }),
      Animated.timing(mist1,  { toValue: 0, duration: 9000,  useNativeDriver: true }),
    ])).start();
    Animated.loop(Animated.sequence([
      Animated.timing(brushY, { toValue: 1, duration: 15000, useNativeDriver: true }),
      Animated.timing(brushY, { toValue: 0, duration: 15000, useNativeDriver: true }),
    ])).start();
  }, []);

  useEffect(() => {
    if (!ready) return;
    runPhase(0);
  }, [ready]);

  useEffect(() => {
    if (!ready || done) return;
    const t = setInterval(() => {
      setSeconds(s => {
        if (s <= 1) { clearInterval(t); setDone(true); return 0; }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [ready, done]);

  function runPhase(idx: number) {
    const p = PHASES[idx % PHASES.length];
    if (p.phase === 'inhale') playBreathTone('inhale');
    if (p.phase === 'exhale') playBreathTone('exhale');
    const toScale = p.phase === 'inhale' ? 1.25 : p.phase === 'hold' ? 1.25 : p.phase === 'exhale' ? 0.92 : 0.92;
    const toGlow  = p.phase === 'inhale' ? 0.16 : p.phase === 'hold' ? 0.16 : 0.06;
    const toRot   = (p.phase === 'inhale' || p.phase === 'hold') ? 1 : 0;
    phaseAnim.current = Animated.parallel([
      Animated.timing(orbScale, { toValue: toScale, duration: p.duration, useNativeDriver: true }),
      Animated.timing(glowOpac, { toValue: toGlow,  duration: p.duration, useNativeDriver: true }),
      Animated.timing(ensoRot,  { toValue: toRot,   duration: p.duration, useNativeDriver: true }),
    ]);
    phaseAnim.current.start(({ finished }) => { if (finished) runPhase(idx + 1); });
  }

  const ensoRotDeg = ensoRot.interpolate({ inputRange:[0,1], outputRange:['0deg','20deg'] });
  const mins = String(Math.floor(seconds / 60)).padStart(2, '0');
  const secs = String(seconds % 60).padStart(2, '0');

  const Background = () => (
    <>
      <View style={s.mountain1} />
      <View style={s.mountain2} />
      <View style={s.mountain3} />
      {[0.38, 0.42, 0.46].map((pos, i) => (
        <View key={i} style={[s.waterLine, {
          top: height * pos, opacity: 0.03 + i * 0.012,
          width: width * [0.7, 0.82, 0.65][i], alignSelf: 'center',
        }]} />
      ))}
      <Animated.View style={[s.mistLayer, {
        transform: [{ translateY: mist1.interpolate({ inputRange:[0,1], outputRange:[0,-10] }) }]
      }]} />
      <Animated.View style={[s.brushGroup, {
        transform: [{ translateY: brushY.interpolate({ inputRange:[0,1], outputRange:[0,-14] }) }]
      }]}>
        {[
          { left:width*0.05, h:100, op:0.05 }, { left:width*0.10, h:150, op:0.07 },
          { left:width*0.15, h:65,  op:0.04 }, { left:width*0.79, h:120, op:0.06 },
          { left:width*0.85, h:80,  op:0.08 }, { left:width*0.90, h:100, op:0.05 },
        ].map((b, i) => (
          <View key={i} style={{
            position:'absolute', left:b.left, bottom:0,
            width:1.5, height:b.h, backgroundColor: INK,
            opacity:b.op, borderRadius:1,
          }} />
        ))}
      </Animated.View>
      <View style={s.cornerTL} />
      <View style={s.cornerBR} />
    </>
  );

  if (!ready) {
    return (
      <View style={s.root}>
        <Background />
        <Animated.View style={[s.content, { opacity: fadeIn }]}>
          <Svg width={120} height={120} viewBox="0 0 90 90">
            <Path d="M45 12 A33 33 0 1 1 32 74" fill="none" stroke={INK} strokeWidth={4.5} strokeLinecap="round" opacity={0.62}/>
            <Circle cx={45} cy={45} r={3}   fill={GOLD} opacity={0.65}/>
            <Circle cx={45} cy={45} r={1.2} fill={GOLD} opacity={0.85}/>
            <Circle cx={45} cy={45} r={20} fill="none" stroke={INK} strokeWidth={0.5} opacity={0.08}/>
            <Circle cx={45} cy={45} r={28} fill="none" stroke={INK} strokeWidth={0.3} opacity={0.05}/>
          </Svg>
          <View style={{ height:32 }} />
          <View style={s.inkLine} />
          <View style={{ height:32 }} />
          <Text style={s.readyTitle}>Your First Practice.</Text>
          <View style={{ height:16 }} />
          <Text style={s.readySub}>
            {'Find a quiet spot.\nSit however feels natural.\nClose your eyes.\n\n3 minutes. Just follow the circle.'}
          </Text>
          <View style={{ height:12 }} />
          <Text style={s.readyHint}>inhale as it expands  ·  exhale as it contracts</Text>
          <View style={{ height:48 }} />
          <TapButton style={s.btn} onPress={() => setReady(true)}>
            <Text style={s.btnText}>Begin  ›</Text>
          </TapButton>
        </Animated.View>
      </View>
    );
  }

  if (done) {
    return (
      <View style={s.root}>
        <Background />
        <Animated.View style={[s.content, { opacity: fadeIn }]}>
          <Svg width={120} height={120} viewBox="0 0 90 90">
            <Path d="M45 12 A33 33 0 1 1 32 74" fill="none" stroke={INK} strokeWidth={4.5} strokeLinecap="round" opacity={0.62}/>
            <Circle cx={45} cy={45} r={3}   fill={GOLD} opacity={0.65}/>
            <Circle cx={45} cy={45} r={1.2} fill={GOLD} opacity={0.85}/>
          </Svg>
          <View style={{ height:24 }} />
          <Text style={s.doneTitle}>Well done</Text>
          <View style={{ height:12 }} />
          <Text style={s.doneSub}>{'You just completed your first\nZenWakeup meditation.'}</Text>
          <View style={{ height:16 }} />
          <Text style={s.doneSub2}>{'This feeling — of stillness after breath —\nis what we return to, every morning.'}</Text>
          <View style={{ height:56 }} />
          <TapButton style={s.btn} onPress={onDone}>
            <Text style={s.btnText}>Continue  ›</Text>
          </TapButton>
        </Animated.View>
      </View>
    );
  }

  return (
    <View style={s.root}>
      <Background />
      <Animated.View style={[s.content, { opacity: fadeIn }]}>
        <Text style={s.timer}>{mins}:{secs}</Text>
        <View style={{ height:32 }} />
        <View style={s.stage}>
          <Animated.View style={[s.glow, { opacity: glowOpac }]} />
          <Animated.View style={[s.orb, { transform: [{ scale: orbScale }] }]}>
            <View style={s.orbInner}>
              <Animated.View style={{ transform: [{ rotate: ensoRotDeg }] }}>
                <Svg width={90} height={90} viewBox="0 0 90 90">
                  <Path d="M45 12 A33 33 0 1 1 32 74" fill="none" stroke={INK} strokeWidth={4.5} strokeLinecap="round" opacity={0.62}/>
                  <Circle cx={45} cy={45} r={3}   fill={GOLD} opacity={0.65}/>
                  <Circle cx={45} cy={45} r={1.2} fill={GOLD} opacity={0.85}/>
                </Svg>
              </Animated.View>
            </View>
          </Animated.View>
        </View>
        <View style={{ height:36 }} />
        <Text style={s.phaseLabel}>Breathe</Text>
        <View style={{ height:8 }} />
        <Text style={s.phaseSub}>Follow the orb · let your breath find its rhythm</Text>
        <View style={{ height:64 }} />
        <TapButton onPress={() => setDone(true)} style={s.skipBtn}>
          <Text style={s.skipText}>skip  ›</Text>
        </TapButton>
      </Animated.View>
    </View>
  );
}

function makeStyles(T: AppTheme) {
  const INK = T.ink, INK2 = T.ink2, INK3 = T.ink3, GOLD = T.gold, BG = T.bg;
  return StyleSheet.create({
    root:    { flex:1, backgroundColor:BG },
    content: { flex:1, alignItems:'center', justifyContent:'center', paddingHorizontal:40 },
    mountain1: { position:'absolute', width:width*1.4, height:width*1.4, borderRadius:width*0.7,  backgroundColor:'rgba(30,32,48,0.04)',  top:height*0.45, left:-width*0.2 },
    mountain2: { position:'absolute', width:width*1.1, height:width*1.1, borderRadius:width*0.55, backgroundColor:'rgba(30,32,48,0.03)',  top:height*0.48, left:width*0.1 },
    mountain3: { position:'absolute', width:width*0.8, height:width*0.8, borderRadius:width*0.4,  backgroundColor:'rgba(30,32,48,0.025)', top:height*0.50, right:-width*0.05 },
    waterLine: { position:'absolute', height:1, backgroundColor: INK },
    mistLayer: { position:'absolute', width:width*1.3, height:80, borderRadius:40, backgroundColor: T.bgMist, top:height*0.32, left:-width*0.15 },
    brushGroup:{ position:'absolute', top:height*0.25, left:0, right:0, height:180 },
    cornerTL:  { position:'absolute', width:100, height:100, borderRadius:50, borderWidth:1, borderColor:`${INK}12`, top:-30, left:-30 },
    cornerBR:  { position:'absolute', width:70,  height:70,  borderRadius:35, borderWidth:1, borderColor:`${INK}0d`, top:height*0.55, right:-15 },
    inkLine:    { width:40, height:1, backgroundColor:`${INK}40` },
    readyTitle: { fontSize:22, color:INK2, letterSpacing:6, fontWeight:'300', textAlign:'center' },
    readySub:   { fontSize:13, color:INK2, letterSpacing:1.5, fontWeight:'300', textAlign:'center', lineHeight:26, opacity:0.75 },
    readyHint:  { fontSize:11, color:INK3, letterSpacing:2, opacity:0.45, textAlign:'center' },
    timer:      { fontSize:25, color:INK2, letterSpacing:5, fontWeight:'300' },
    stage:      { width:240, height:240, alignItems:'center', justifyContent:'center' },
    glow:       { position:'absolute', width:220, height:220, borderRadius:110, backgroundColor: INK },
    orb:        { width:180, height:180, borderRadius:90, borderWidth:1, borderColor:`${INK}2e`, backgroundColor: T.bgCard, alignItems:'center', justifyContent:'center' },
    orbInner:   { width:130, height:130, borderRadius:65, borderWidth:0.5, borderColor:`${INK}1a`, alignItems:'center', justifyContent:'center' },
    phaseLabel: { fontSize:28, color:INK2, letterSpacing:8, fontWeight:'300' },
    phaseSub:   { fontSize:12, color:INK3, letterSpacing:1.5, fontStyle:'italic', opacity:0.7, textAlign:'center' },
    skipBtn:    { padding:12 },
    skipText:   { fontSize:11, color:INK3, letterSpacing:3, opacity:0.4 },
    doneTitle:  { fontSize:28, color:INK2, letterSpacing:8, fontWeight:'300' },
    doneSub:    { fontSize:13, color:INK2, letterSpacing:1.5, textAlign:'center', lineHeight:24, opacity:0.7 },
    doneSub2:   { fontSize:12, color:INK3, letterSpacing:1.5, textAlign:'center', lineHeight:22, fontStyle:'italic', opacity:0.6 },
    btn:        { borderWidth:1, borderColor:`${INK}40`, paddingHorizontal:40, paddingVertical:16, borderRadius: T.radiusBtn },
    btnText:    { fontSize:13, color:INK2, letterSpacing:4, fontWeight:'300' },
  });
}

import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions, StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { AppTheme } from '../constants/app-themes';
import { useTheme } from '../utils/theme-context';
import { playBreathIn, playBreathOut } from '../utils/sounds';
import { updateTodayRecord } from '../utils/storage';

const { width, height } = Dimensions.get('window');

const GUIDANCE = [
  { label: 'Arrive',  sub: 'Close your eyes · return to breath' },
  { label: 'Release', sub: 'Relax your shoulders · settle in' },
  { label: 'Return',  sub: 'When thoughts arise · gently return' },
  { label: 'Awaken',  sub: 'Feel the morning light · be aware' },
];

const DURATIONS = [
  { label: '5 min',  seconds: 300 },
  { label: '10 min', seconds: 600 },
  { label: '15 min', seconds: 900 },
  { label: '20 min', seconds: 1200 },
];

const LotusIcon = ({ size = 90, INK, GOLD }: { size?: number; INK: string; GOLD: string }) => (
  <Svg width={size} height={size} viewBox="0 0 90 90">
    <Path d="M45 45 Q38 32 45 18 Q52 32 45 45Z" fill="none" stroke={INK} strokeWidth={0.9} opacity={0.55}/>
    <Path d="M45 45 Q32 38 18 45 Q32 52 45 45Z" fill="none" stroke={INK} strokeWidth={0.9} opacity={0.55}/>
    <Path d="M45 45 Q52 58 45 72 Q38 58 45 45Z" fill="none" stroke={INK} strokeWidth={0.9} opacity={0.55}/>
    <Path d="M45 45 Q58 52 72 45 Q58 38 45 45Z" fill="none" stroke={INK} strokeWidth={0.9} opacity={0.55}/>
    <Path d="M45 45 Q34 34 26 26 Q40 35 45 45Z" fill="none" stroke={INK} strokeWidth={0.6} opacity={0.3}/>
    <Path d="M45 45 Q56 34 64 26 Q55 40 45 45Z" fill="none" stroke={INK} strokeWidth={0.6} opacity={0.3}/>
    <Path d="M45 45 Q34 56 26 64 Q40 55 45 45Z" fill="none" stroke={INK} strokeWidth={0.6} opacity={0.3}/>
    <Path d="M45 45 Q56 56 64 64 Q55 55 45 45Z" fill="none" stroke={INK} strokeWidth={0.6} opacity={0.3}/>
    <Circle cx={45} cy={45} r={5} fill="none" stroke={GOLD} strokeWidth={0.8} opacity={0.7}/>
    <Circle cx={45} cy={45} r={2} fill={GOLD} opacity={0.65}/>
  </Svg>
);

const EnsoIcon = ({ size = 90, INK, GOLD }: { size?: number; INK: string; GOLD: string }) => (
  <Svg width={size} height={size} viewBox="0 0 90 90">
    <Path
      d="M45 12 A33 33 0 1 1 32 74"
      fill="none"
      stroke={INK}
      strokeWidth={4.5}
      strokeLinecap="round"
      opacity={0.62}
    />
    <Circle cx={45} cy={45} r={3}   fill={GOLD} opacity={0.65}/>
    <Circle cx={45} cy={45} r={1.2} fill={GOLD} opacity={0.85}/>
  </Svg>
);

const EnsoLarge = ({ INK, GOLD }: { INK: string; GOLD: string }) => (
  <Svg width={120} height={120} viewBox="0 0 90 90">
    <Path
      d="M45 12 A33 33 0 1 1 32 74"
      fill="none"
      stroke={INK}
      strokeWidth={4.5}
      strokeLinecap="round"
      opacity={0.62}
    />
    <Circle cx={45} cy={45} r={3}   fill={GOLD} opacity={0.65}/>
    <Circle cx={45} cy={45} r={1.2} fill={GOLD} opacity={0.85}/>
  </Svg>
);

export default function MeditationScreen({ onDone }: { onDone?: () => void }) {
  const { theme: T } = useTheme();
  const INK = T.ink, INK2 = T.ink2, INK3 = T.ink3, GOLD = T.gold, BG = T.bg;
  const s = makeStyles(T);
  const [screen,      setScreen]      = useState<'ready' | 'meditating' | 'done'>('ready');
  const [durationIdx, setDurationIdx] = useState(0);
  const [phase,       setPhase]       = useState<'inhale' | 'exhale'>('inhale');
  const [stepIdx,     setStepIdx]     = useState(0);
  const [seconds,     setSeconds]     = useState(300);
  const [breathCount, setBreathCount] = useState(0);

  const totalSeconds = DURATIONS[durationIdx].seconds;

  const orbScale   = useRef(new Animated.Value(1)).current;
  const fadeIn     = useRef(new Animated.Value(0)).current;
  const textFade   = useRef(new Animated.Value(1)).current;
  const mist1      = useRef(new Animated.Value(0)).current;
  const mist2      = useRef(new Animated.Value(0)).current;
  const brushY     = useRef(new Animated.Value(0)).current;
  const ring1      = useRef(new Animated.Value(0)).current;
  const ring2      = useRef(new Animated.Value(0)).current;
  const ensoRot    = useRef(new Animated.Value(0)).current;
  const breathAnim = useRef(null as any);

  useEffect(() => {
    Animated.timing(fadeIn, { toValue: 1, duration: 1800, useNativeDriver: true }).start();
    Animated.loop(Animated.sequence([
      Animated.timing(mist1, { toValue: 1, duration: 8000,  useNativeDriver: true }),
      Animated.timing(mist1, { toValue: 0, duration: 8000,  useNativeDriver: true }),
    ])).start();
    Animated.loop(Animated.sequence([
      Animated.timing(mist2, { toValue: 1, duration: 11000, useNativeDriver: true }),
      Animated.timing(mist2, { toValue: 0, duration: 11000, useNativeDriver: true }),
    ])).start();
    Animated.loop(Animated.sequence([
      Animated.timing(brushY, { toValue: 1, duration: 14000, useNativeDriver: true }),
      Animated.timing(brushY, { toValue: 0, duration: 14000, useNativeDriver: true }),
    ])).start();
  }, []);

  useEffect(() => {
    if (screen !== 'meditating') return;
    const ripple = (anim: Animated.Value, delay: number) => {
      Animated.loop(Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, { toValue: 1, duration: 4000, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: 0,    useNativeDriver: true }),
      ])).start();
    };
    ripple(ring1, 0);
    ripple(ring2, 2000);
  }, [screen]);

  useEffect(() => {
    if (screen !== 'meditating') return;
    const cycle = () => {
      setPhase('inhale');
      playBreathIn();
      breathAnim.current = Animated.sequence([
        Animated.parallel([
          Animated.timing(orbScale, { toValue: 1.38, duration: 4000, useNativeDriver: true }),
          Animated.timing(ensoRot,  { toValue: 1,    duration: 4000, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(orbScale, { toValue: 1.0, duration: 4000, useNativeDriver: true }),
          Animated.timing(ensoRot,  { toValue: 0,   duration: 4000, useNativeDriver: true }),
        ]),
      ]);
      breathAnim.current.start(({ finished }: { finished: boolean }) => {
        if (finished) {
          setPhase('exhale');
          playBreathOut();
          setBreathCount(c => c + 1);
          cycle();
        }
      });
    };
    cycle();
    return () => breathAnim.current?.stop();
  }, [screen]);

  useEffect(() => {
    if (screen !== 'meditating') return;
    const t = setInterval(() => {
      setSeconds(s => {
        if (s <= 1) {
          clearInterval(t);
          setScreen('done');
          updateTodayRecord({ morningDone: true, totalMinutes: Math.ceil(totalSeconds / 60) });
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [screen]);

  useEffect(() => {
    if (screen !== 'meditating') return;
    const idx = Math.min(
      GUIDANCE.length - 1,
      Math.floor((totalSeconds - seconds) / (totalSeconds / GUIDANCE.length))
    );
    if (idx !== stepIdx) {
      Animated.timing(textFade, { toValue: 0, duration: 400, useNativeDriver: true }).start(() => {
        setStepIdx(idx);
        Animated.timing(textFade, { toValue: 1, duration: 600, useNativeDriver: true }).start();
      });
    }
  }, [seconds]);

  function startMeditation() {
    setSeconds(totalSeconds);
    setBreathCount(0);
    setStepIdx(0);
    setScreen('meditating');
  }

  const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');

  const ensoRotDeg = ensoRot.interpolate({
    inputRange:  [0, 1],
    outputRange: ['0deg', '20deg'],
  });

  const rippleStyle = (anim: Animated.Value) => ({
    opacity:   anim.interpolate({ inputRange: [0, 0.2, 1], outputRange: [0, 0.08, 0] }),
    transform: [{ scale: anim.interpolate({ inputRange: [0, 1], outputRange: [1, 2.8] }) }],
  });

  const Background = () => (
    <>
      {/* 侘寂: 无山形背景，保持净空 */}
      {T.mountain !== 'weathered' && (
        <><View style={s.mountain1} /><View style={s.mountain2} /><View style={s.mountain3} /></>
      )}
      {T.mountain !== 'weathered' && [0.62, 0.65, 0.68].map((pos, i) => (
        <View key={i} style={[s.waterLine, {
          top: height * pos, opacity: 0.04 + i * 0.02,
          width: width * [0.8, 0.9, 0.75][i], alignSelf: 'center',
        }]} />
      ))}
      {T.mountain !== 'weathered' && (
        <Animated.View style={[s.mist1Layer, {
          transform: [{ translateY: mist1.interpolate({ inputRange: [0,1], outputRange: [0,-10] }) }],
        }]} />
      )}
      {T.mountain !== 'weathered' && (
        <Animated.View style={[s.mist2Layer, {
          transform: [{ translateX: mist2.interpolate({ inputRange: [0,1], outputRange: [0,14] }) }],
        }]} />
      )}
      {T.mountain !== 'weathered' && (
        <Animated.View style={[s.brushGroup, {
          transform: [{ translateY: brushY.interpolate({ inputRange: [0,1], outputRange: [0,-14] }) }],
        }]}>
          {[
            { left: width*0.06, h:100, op:0.06 }, { left: width*0.12, h:160, op:0.08 },
            { left: width*0.17, h:70,  op:0.05 }, { left: width*0.80, h:130, op:0.07 },
            { left: width*0.86, h:80,  op:0.09 }, { left: width*0.91, h:110, op:0.05 },
          ].map((b, i) => (
            <View key={i} style={{
              position: 'absolute', left: b.left, bottom: 0,
              width: 1.5, height: b.h, backgroundColor: INK,
              opacity: b.op, borderRadius: 1,
            }} />
          ))}
        </Animated.View>
      )}
      {T.mountain !== 'weathered' && <><View style={s.cornerTL} /><View style={s.cornerBR} /></>}
    </>
  );

  if (screen === 'ready') {
    return (
      <View style={s.root}>
        <StatusBar barStyle="dark-content" />
        <Background />
        <Animated.View style={[s.content, { opacity: fadeIn }]}>
          <LotusIcon size={T.mountain === 'weathered' ? 160 : 120} INK={INK} GOLD={GOLD} />
          <View style={{ height: 32 }} />
          <View style={s.inkLine} />
          <View style={{ height: 32 }} />
          <Text style={s.title}>Morning Meditation</Text>
          {T.mountain === 'weathered' && (
            <>
              <View style={{ height: 8 }} />
              <Text style={s.wabiConcept}>stillness</Text>
              <Text style={s.wabiConceptJp}>静けさ</Text>
            </>
          )}
          <View style={{ height: 12 }} />
          <Text style={s.readySub}>Take a moment to settle in.{'\n'}Choose your duration when ready.</Text>
          <View style={{ height: 40 }} />
          <View style={s.durationRow}>
            {DURATIONS.map((d, i) => (
              <TouchableOpacity
                key={i}
                style={[s.durationBtn, i === durationIdx && s.durationBtnActive]}
                onPress={() => setDurationIdx(i)}
              >
                <Text style={[s.durationLabel, i === durationIdx && s.durationLabelActive]}>
                  {d.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={{ height: 48 }} />
          <TouchableOpacity style={s.btn} onPress={startMeditation}>
            <Text style={s.btnText}>Begin  ›</Text>
          </TouchableOpacity>
          <View style={{ height: 20 }} />
          <Text style={s.readyHint}>Find a comfortable position · close your eyes</Text>
        </Animated.View>
      </View>
    );
  }

  if (screen === 'done') {
    return (
      <View style={s.root}>
        <StatusBar barStyle="dark-content" />
        <Background />
        <Animated.View style={[s.content, { opacity: fadeIn }]}>
          <EnsoLarge INK={INK} GOLD={GOLD} />
          <View style={s.hairline} />
          <Text style={s.mainWord}>Complete</Text>
          <Text style={s.subWord}>{breathCount} breaths  ·  {DURATIONS[durationIdx].label}</Text>
          {T.mountain === 'weathered' && (
            <>
              <View style={{ height: 12 }} />
              <Text style={s.wabiConcept}>continuity</Text>
              <Text style={s.wabiConceptJp}>継続性</Text>
            </>
          )}
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

  return (
    <View style={s.root}>
      <StatusBar barStyle="dark-content" />
      <Background />
      <View style={s.progressWrap}>
        <View style={[s.progressBar, { width: `${((totalSeconds - seconds) / totalSeconds) * 100}%` as any }]} />
      </View>
      <Animated.View style={[s.content, { opacity: fadeIn }]}>
        <Text style={s.timerLabel}>{mm}:{ss}</Text>
        <Text style={s.breathLabel}>{breathCount} breaths</Text>
        <View style={{ height: 28 }} />
        <View style={s.stage}>
          <Animated.View style={[s.ripple, rippleStyle(ring1)]} />
          <Animated.View style={[s.ripple, rippleStyle(ring2)]} />
          <Animated.View style={[s.orbOuter, { transform: [{ scale: orbScale }] }]}>
            <View style={s.orbMid}>
              <Animated.View style={{ transform: [{ rotate: ensoRotDeg }] }}>
                <EnsoIcon size={T.mountain === 'weathered' ? 120 : 90} INK={INK} GOLD={GOLD} />
              </Animated.View>
            </View>
          </Animated.View>
        </View>
        <View style={{ height: 28 }} />
        <Text style={s.mainWord}>Breathing</Text>
        <Animated.View style={{ opacity: textFade, alignItems: 'center', marginTop: 10 }}>
          <Text style={s.subWord}>{GUIDANCE[stepIdx].sub}</Text>
        </Animated.View>
        <View style={s.stepDots}>
          {GUIDANCE.map((_, i) => (
            <View key={i} style={[s.stepDot, i === stepIdx && s.stepDotActive, i < stepIdx && s.stepDotDone]} />
          ))}
        </View>
        <View style={{ height: 36 }} />
        <TouchableOpacity onPress={() => {
          setScreen('done');
          updateTodayRecord({ morningDone: true, totalMinutes: Math.floor((totalSeconds - seconds) / 60) + 1 });
        }}>
          <Text style={s.skip}>skip  ›</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

function makeStyles(T: AppTheme) {
  const INK = T.ink, INK2 = T.ink2, INK3 = T.ink3, GOLD = T.gold, BG = T.bg;
  return StyleSheet.create({
  root:       { flex: 1, backgroundColor: BG },
  mountain1:  { position:'absolute', width:width*1.4, height:width*1.4, borderRadius:width*0.7,  backgroundColor:`${INK}0b`, bottom:-width*0.95, left:-width*0.2 },
  mountain2:  { position:'absolute', width:width*1.1, height:width*1.1, borderRadius:width*0.55, backgroundColor:`${INK}09`, bottom:-width*0.72, left:width*0.1 },
  mountain3:  { position:'absolute', width:width*0.8, height:width*0.8, borderRadius:width*0.4,  backgroundColor:`${INK}07`, bottom:-width*0.52, right:-width*0.05 },
  waterLine:  { position:'absolute', height:1, backgroundColor: INK },
  mist1Layer: { position:'absolute', width:width*1.3, height:80, borderRadius:40, backgroundColor: T.bgMist, bottom:height*0.22, left:-width*0.15 },
  mist2Layer: { position:'absolute', width:width*0.8, height:50, borderRadius:25, backgroundColor: T.bgMist, bottom:height*0.27, right:-width*0.1 },
  brushGroup: { position:'absolute', bottom:height*0.12, left:0, right:0, height:180 },
  cornerTL:   { position:'absolute', width:100, height:100, borderRadius:50, borderWidth:1, borderColor:`${INK}12`, top:-30, left:-30 },
  cornerBR:   { position:'absolute', width:70,  height:70,  borderRadius:35, borderWidth:1, borderColor:`${INK}0f`, bottom:70, right:-15 },
  progressWrap: { position:'absolute', top:0, left:0, right:0, height:1, backgroundColor:`${INK}14` },
  progressBar:  { height:1, backgroundColor:`${INK}4d` },
  content: { flex:1, alignItems:'center', justifyContent:'center', paddingHorizontal:40 },
  inkLine:             { width:40, height:1, backgroundColor:`${INK}40`, marginVertical:20 },
  title:               { fontSize:22, color:INK2, letterSpacing:2, fontWeight:'400', textAlign:'center' },
  readySub:            { fontSize:14, color:INK3, letterSpacing:1, textAlign:'center', lineHeight:24, opacity:0.8 },
  readyHint:           { fontSize:12, color:INK3, letterSpacing:1.5, opacity:0.55, textAlign:'center' },
  durationRow:         { flexDirection:'row', gap:10 },
  durationBtn:         { paddingHorizontal:16, paddingVertical:10, borderRadius:2, borderWidth:1, borderColor:`${INK}2e` },
  durationBtnActive:   { borderColor:`${INK}8c`, backgroundColor:`${INK}0f` },
  durationLabel:       { fontSize:13, color:INK3, letterSpacing:1.5, fontWeight:'300' },
  durationLabelActive: { color:INK2 },
  timerLabel:  { fontSize:14, color:INK2, letterSpacing:4, fontWeight:'300' },
  breathLabel: { fontSize:12, color:INK3, letterSpacing:2, marginTop:4, opacity:0.75 },
  stage:    { width:240, height:240, alignItems:'center', justifyContent:'center' },
  ripple:   { position:'absolute', width:180, height:180, borderRadius:90, borderWidth:1, borderColor: INK },
  // orbOuter / orbMid defined below with wabi-sabi sizing
  stepDots:      { flexDirection:'row', gap:8, marginTop:20 },
  stepDot:       { width:5, height:5, borderRadius:2.5, backgroundColor:`${INK}26` },
  stepDotActive: { width:18, borderRadius:3, backgroundColor:GOLD },
  stepDotDone:   { backgroundColor:`${GOLD}66` },
  skip:          { fontSize:12, color:INK3, letterSpacing:2, opacity:0.5 },
  mainWord: { fontSize:28, color:INK2, letterSpacing:7, fontWeight:'300' },
  subWord:  { fontSize:14, color:INK2, letterSpacing:2,  fontWeight:'300', textAlign:'center', opacity:0.8 },
  hairline: { width:32, height:1, backgroundColor:`${INK}26`, marginVertical:24 },
  quote:    { fontSize:13, color:INK2, letterSpacing:1.5, fontStyle:'italic', opacity:0.78, marginBottom:8 },
  btn:           { borderWidth:1, borderColor:`${INK}33`, paddingHorizontal:32, paddingVertical:14, borderRadius: T.radiusBtn },
  btnText:       { fontSize:13, color:INK2, letterSpacing:3, fontWeight:'400' },
  wabiConcept:   { fontSize:22, color:INK2, fontStyle:'italic', letterSpacing:1 },
  wabiConceptJp: { fontSize:11, color:INK3, letterSpacing:6, fontWeight:'300', marginTop:2 },
  orbOuter: { width: T.mountain === 'weathered' ? 220 : 180, height: T.mountain === 'weathered' ? 220 : 180, borderRadius: T.mountain === 'weathered' ? 110 : 90, borderWidth:1, borderColor:`${INK}26`, backgroundColor: T.bgCard, alignItems:'center', justifyContent:'center' },
  orbMid:   { width: T.mountain === 'weathered' ? 170 : 140, height: T.mountain === 'weathered' ? 170 : 140, borderRadius: T.mountain === 'weathered' ? 85 : 70, borderWidth:0.5, borderColor:`${INK}17`, alignItems:'center', justifyContent:'center' },
  });
}
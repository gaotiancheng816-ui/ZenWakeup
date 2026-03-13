import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { completeOnboarding } from '../utils/storage';

const { width, height } = Dimensions.get('window');

const INK = '#2a2e24', INK2 = '#485040', INK3 = '#7a8472', GOLD = '#8a7040', BG = '#dedad2';

const SLIDES = [
  {
    kanji: '禅',
    title: 'Welcome to ZenWakeup',
    sub: 'A daily practice of stillness,\nawareness, and return.',
    hint: '',
  },
  {
    kanji: '道',
    title: 'What is Zen?',
    sub: 'Zen is not a belief.\nIt is a way of paying attention —\nto breath, to moment, to life as it is.',
    hint: '',
  },
  {
    kanji: '息',
    title: 'A Zen Life, Simply',
    sub: 'ZenWakeup gives you three small rituals.\nMorning. Daytime. Evening.\nThat is enough.',
    hint: '',
  },
  {
    kanji: '醒',
    title: 'Morning Meditation',
    sub: 'Each day begins with a few minutes\nof guided breathing.\nNo experience needed. Just arrive.',
    hint: '',
  },
  {
    kanji: '归',
    title: 'Return to Now',
    sub: 'Throughout the day, a gentle reminder\nto pause and notice.\nWhere are you? How do you feel?',
    hint: '',
  },
  {
    kanji: '省',
    title: 'Evening Reflection',
    sub: 'Three quiet questions at day\'s end.\nWhat did you bring?\nWhat are you grateful for?\nWhat will you release?',
    hint: '',
  },
  {
    kanji: '明',
    title: 'What Awaits You',
    sub: 'With practice, the noise softens.\nYou begin to respond rather than react.\nYou sleep better. Wake lighter.\nYou become more — you.',
    hint: '',
  },
];

interface Props {
  onDone: () => void;
}

export default function OnboardingScreen({ onDone }: Props) {
  const [slideIdx, setSlideIdx] = useState(0);
  const [showSetup, setShowSetup] = useState(false);
  const [alarmHour, setAlarmHour]   = useState(6);
  const [alarmMinute, setAlarmMinute] = useState(0);

  const fadeAnim  = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const bgMist1   = useRef(new Animated.Value(0)).current;
  const bgMist2   = useRef(new Animated.Value(0)).current;
  const brushY    = useRef(new Animated.Value(0)).current;
  const kanjiScale = useRef(new Animated.Value(0.8)).current;
  const kanjiOpac  = useRef(new Animated.Value(0)).current;

  const hourBase   = useRef(0);
  const minuteBase = useRef(0);

  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(bgMist1, { toValue:1, duration:10000, useNativeDriver:true }),
      Animated.timing(bgMist1, { toValue:0, duration:10000, useNativeDriver:true }),
    ])).start();
    Animated.loop(Animated.sequence([
      Animated.timing(bgMist2, { toValue:1, duration:14000, useNativeDriver:true }),
      Animated.timing(bgMist2, { toValue:0, duration:14000, useNativeDriver:true }),
    ])).start();
    Animated.loop(Animated.sequence([
      Animated.timing(brushY, { toValue:1, duration:16000, useNativeDriver:true }),
      Animated.timing(brushY, { toValue:0, duration:16000, useNativeDriver:true }),
    ])).start();
    animateIn();
  }, []);

  function animateIn() {
    kanjiScale.setValue(0.75);
    kanjiOpac.setValue(0);
    Animated.parallel([
      Animated.spring(kanjiScale, { toValue:1, useNativeDriver:true, damping:12, mass:0.8 }),
      Animated.timing(kanjiOpac, { toValue:1, duration:800, useNativeDriver:true }),
    ]).start();
  }

  async function goNext() {
    if (slideIdx < SLIDES.length - 1) {
      Animated.timing(fadeAnim, { toValue:0, duration:250, useNativeDriver:true }).start(() => {
        setSlideIdx(i => i + 1);
        animateIn();
        Animated.timing(fadeAnim, { toValue:1, duration:400, useNativeDriver:true }).start();
      });
    } else {
  await completeOnboarding(6, 0, 5);
  onDone();
}
  }

  async function handleBegin() {
    await completeOnboarding(alarmHour, alarmMinute, 5);
    onDone();
  }

  const hh = String(alarmHour).padStart(2, '0');
  const mm = String(alarmMinute).padStart(2, '0');
  const slide = SLIDES[slideIdx];

  // Ink brush mountain background
  const BgElements = () => (
    <>
      <View style={s.mountain1} />
      <View style={s.mountain2} />
      <View style={s.mountain3} />
      {[0.38,0.42,0.46].map((pos,i) => (
        <View key={i} style={[s.waterLine, {
          top: height*pos,
          opacity: 0.03 + i*0.012,
          width: width*[0.7,0.82,0.65][i],
          alignSelf: 'center',
        }]} />
      ))}
      <Animated.View style={[s.mistLayer1, {
        transform:[{ translateY: bgMist1.interpolate({ inputRange:[0,1], outputRange:[0,-12] }) }]
      }]} />
      <Animated.View style={[s.mistLayer2, {
        transform:[{ translateX: bgMist2.interpolate({ inputRange:[0,1], outputRange:[0,16] }) }]
      }]} />
      <Animated.View style={[s.brushGroup, {
        transform:[{ translateY: brushY.interpolate({ inputRange:[0,1], outputRange:[0,-14] }) }]
      }]}>
        {[
          { left:width*0.05, h:100, op:0.05 }, { left:width*0.10, h:150, op:0.07 },
          { left:width*0.15, h:65,  op:0.04 }, { left:width*0.79, h:120, op:0.06 },
          { left:width*0.85, h:80,  op:0.08 }, { left:width*0.90, h:100, op:0.05 },
        ].map((b,i) => (
          <View key={i} style={{
            position:'absolute', left:b.left, bottom:0,
            width:1.5, height:b.h, backgroundColor:'#1e2030',
            opacity:b.op, borderRadius:1,
          }} />
        ))}
      </Animated.View>
      <View style={s.cornerTL} />
      <View style={s.cornerBR} />
    </>
  );
  return (
    <View style={s.root}>
      <BgElements />

      {/* Dot progress */}
      <View style={s.dots}>
        {SLIDES.map((_, i) => (
          <View key={i} style={[s.dot, i === slideIdx && s.dotActive]} />
        ))}
      </View>

      <Animated.View style={[s.content, { opacity: fadeAnim }]}>

        {/* Large kanji */}
        <Animated.Text style={[s.kanji, {
          opacity: kanjiOpac,
          transform: [{ scale: kanjiScale }],
        }]}>
          {slide.kanji}
        </Animated.Text>

        <View style={{ height: 32 }} />

        {/* Ink divider */}
        <View style={s.inkLine} />

        <View style={{ height: 32 }} />

        <Text style={s.title}>{slide.title}</Text>
        <View style={{ height: 20 }} />
        <Text style={s.sub}>{slide.sub}</Text>

        {slide.hint ? (
          <>
            <View style={{ height: 24 }} />
            <Text style={s.hint}>{slide.hint}</Text>
          </>
        ) : null}

        <View style={{ height: 64 }} />

        <TouchableOpacity style={s.nextBtn} onPress={goNext}>
          <Text style={s.nextBtnText}>
            {'Next  ›'}
          </Text>
        </TouchableOpacity>

          <TouchableOpacity style={s.skipBtn} onPress={onDone}>
            <Text style={s.skipText}>skip intro</Text>
          </TouchableOpacity>

      </Animated.View>
    </View>
  );
}

const s = StyleSheet.create({
  root:    { flex:1, backgroundColor:BG },
  content: { flex:1, alignItems:'center', justifyContent:'center', paddingHorizontal:40 },

  // Background
  mountain1:  { position:'absolute', width:width*1.4, height:width*1.4, borderRadius:width*0.7,  backgroundColor:'rgba(30,32,48,0.04)',  top:height*0.45, left:-width*0.2 },
  mountain2:  { position:'absolute', width:width*1.1, height:width*1.1, borderRadius:width*0.55, backgroundColor:'rgba(30,32,48,0.03)',  top:height*0.48, left:width*0.1 },
  mountain3:  { position:'absolute', width:width*0.8, height:width*0.8, borderRadius:width*0.4,  backgroundColor:'rgba(30,32,48,0.025)', top:height*0.50, right:-width*0.05 },
  waterLine:  { position:'absolute', height:1, backgroundColor:'#1e2030' },
  mistLayer1: { position:'absolute', width:width*1.3, height:80,  borderRadius:40, backgroundColor:'rgba(220,216,206,0.4)', top:height*0.32, left:-width*0.15 },
  mistLayer2: { position:'absolute', width:width*0.9, height:50,  borderRadius:25, backgroundColor:'rgba(220,216,206,0.3)', top:height*0.38, right:-width*0.1 },
  brushGroup: { position:'absolute', top:height*0.25, left:0, right:0, height:180 },
  cornerTL:   { position:'absolute', width:100, height:100, borderRadius:50, borderWidth:1, borderColor:'rgba(30,32,48,0.06)', top:-30, left:-30 },
  cornerBR:   { position:'absolute', width:70,  height:70,  borderRadius:35, borderWidth:1, borderColor:'rgba(30,32,48,0.05)', top:height*0.55, right:-15 },

  // Dots
  dots:      { position:'absolute', top:64, flexDirection:'row', gap:8, alignSelf:'center' },
  dot:       { width:4, height:4, borderRadius:2, backgroundColor:'rgba(42,46,36,0.2)' },
  dotActive: { width:16, backgroundColor:'rgba(42,46,36,0.6)' },

  // Slide content
  kanji:   { fontSize:96, color:INK, fontWeight:'200', letterSpacing:8, opacity:0.85 },
  inkLine: { width:40, height:1, backgroundColor:'rgba(42,46,36,0.25)' },
  title:   { fontSize:22, color:INK2, letterSpacing:4, fontWeight:'300', textAlign:'center' },
  sub:     { fontSize:13, color:INK2, letterSpacing:1.5, fontWeight:'300', textAlign:'center', lineHeight:24, opacity:0.75 },
  hint:    { fontSize:11, color:GOLD, letterSpacing:3, textAlign:'center', opacity:0.8 },

  nextBtn:     { borderWidth:1, borderColor:'rgba(42,46,36,0.25)', paddingHorizontal:36, paddingVertical:14, borderRadius:2 },
  nextBtnText: { fontSize:13, color:INK2, letterSpacing:4, fontWeight:'300' },
  skipBtn:     { marginTop:20, padding:8 },
  skipText:    { fontSize:11, color:INK3, letterSpacing:3, opacity:0.45 },

  // Setup screen
  setupKanji: { fontSize:72, color:INK, fontWeight:'200', letterSpacing:6, opacity:0.8 },
  setupTitle: { fontSize:24, color:INK2, letterSpacing:6, fontWeight:'300' },
  setupSub:   { fontSize:12, color:INK3, letterSpacing:1.5, textAlign:'center', lineHeight:22, opacity:0.7 },

  timeRow:   { flexDirection:'row', alignItems:'center', gap:8 },
  pickerCol: { alignItems:'center', gap:8 },
  arrowBtn:  { padding:12 },
  arrowText: { fontSize:12, color:INK3, opacity:0.5 },
  pickerNum: { fontSize:72, color:INK, fontWeight:'200', letterSpacing:4 },
  colon:     { fontSize:56, color:INK2, fontWeight:'200', marginBottom:8 },
  minuteHint:{ fontSize:10, color:INK3, letterSpacing:2, opacity:0.45 },

  beginBtn:     { borderWidth:1, borderColor:'rgba(42,46,36,0.25)', paddingHorizontal:40, paddingVertical:16, borderRadius:2 },
  beginBtnText: { fontSize:13, color:INK2, letterSpacing:4, fontWeight:'300' },
  beginHint:    { fontSize:10, color:INK3, letterSpacing:2, opacity:0.5 },
});
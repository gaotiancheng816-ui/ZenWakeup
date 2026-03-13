import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Svg, { Circle, Ellipse, Line, Path } from 'react-native-svg';
import { completeOnboarding } from '../utils/storage';

const { width, height } = Dimensions.get('window');

const INK = '#2a2e24', INK2 = '#485040', INK3 = '#7a8472', GOLD = '#8a7040', BG = '#dedad2';

// ── SVG Illustrations ──────────────────────────────────────────

const Icon01 = () => (
  <Svg width={200} height={160} viewBox="0 0 100 80">
    <Path d="M0 65 L18 35 L36 65Z" fill="none" stroke={INK} strokeWidth={0.6} opacity={0.25}/>
    <Path d="M30 65 L52 22 L74 65Z" fill={BG} stroke={INK} strokeWidth={0.9} opacity={0.7}/>
    <Path d="M60 65 L78 40 L96 65Z" fill="none" stroke={INK} strokeWidth={0.6} opacity={0.2}/>
    <Line x1={8}  y1={52} x2={38} y2={52} stroke={INK} strokeWidth={0.4} opacity={0.15}/>
    <Line x1={62} y1={48} x2={95} y2={48} stroke={INK} strokeWidth={0.4} opacity={0.12}/>
    <Circle cx={52} cy={18} r={5} fill="none" stroke={GOLD} strokeWidth={0.8} opacity={0.6}/>
    <Line x1={52} y1={8}  x2={52} y2={11} stroke={GOLD} strokeWidth={0.6} opacity={0.4}/>
    <Line x1={44} y1={10} x2={46} y2={13} stroke={GOLD} strokeWidth={0.6} opacity={0.35}/>
    <Line x1={60} y1={10} x2={58} y2={13} stroke={GOLD} strokeWidth={0.6} opacity={0.35}/>
    <Line x1={10} y1={65} x2={90} y2={65} stroke={INK} strokeWidth={0.5} opacity={0.2}/>
    <Line x1={96} y1={10} x2={96} y2={65} stroke={INK} strokeWidth={0.8} opacity={0.06}/>
    <Line x1={93} y1={18} x2={93} y2={65} stroke={INK} strokeWidth={0.5} opacity={0.04}/>
  </Svg>
);

const Icon02 = () => (
  <Svg width={200} height={160} viewBox="0 0 100 80">
    <Path d="M50 75 Q46 60 54 50 Q62 40 50 28 Q42 18 50 8" fill="none" stroke={INK} strokeWidth={1.2} strokeLinecap="round" opacity={0.55}/>
    <Circle cx={50} cy={72} r={1.5} fill={INK} opacity={0.3}/>
    <Circle cx={53} cy={60} r={1.2} fill={INK} opacity={0.25}/>
    <Circle cx={49} cy={48} r={1.5} fill={INK} opacity={0.3}/>
    <Circle cx={51} cy={36} r={1.2} fill={INK} opacity={0.2}/>
    <Circle cx={50} cy={14} r={2}   fill={GOLD} opacity={0.45}/>
    <Path d="M30 55 Q35 48 32 42" fill="none" stroke={INK2} strokeWidth={0.7} opacity={0.3}/>
    <Path d="M28 55 Q26 48 29 44" fill="none" stroke={INK2} strokeWidth={0.5} opacity={0.2}/>
    <Path d="M70 50 Q65 44 68 38" fill="none" stroke={INK2} strokeWidth={0.7} opacity={0.3}/>
    <Line x1={10} y1={76} x2={90} y2={76} stroke={INK} strokeWidth={0.4} opacity={0.15}/>
  </Svg>
);

const Icon03 = () => (
  <Svg width={200} height={160} viewBox="0 0 100 80">
    <Circle cx={22} cy={30} r={8}   fill="none" stroke={GOLD} strokeWidth={0.9} opacity={0.7}/>
    <Circle cx={22} cy={30} r={2.5} fill={GOLD} opacity={0.5}/>
    <Line x1={22} y1={18} x2={22} y2={20} stroke={GOLD} strokeWidth={0.7} opacity={0.5}/>
    <Line x1={22} y1={40} x2={22} y2={42} stroke={GOLD} strokeWidth={0.7} opacity={0.5}/>
    <Line x1={10} y1={30} x2={12} y2={30} stroke={GOLD} strokeWidth={0.7} opacity={0.5}/>
    <Line x1={32} y1={30} x2={34} y2={30} stroke={GOLD} strokeWidth={0.7} opacity={0.5}/>
    <Ellipse cx={50} cy={30} rx={10} ry={6} fill="none" stroke={INK} strokeWidth={0.9} opacity={0.55}/>
    <Circle cx={50} cy={30} r={3} fill="none" stroke={INK} strokeWidth={0.8} opacity={0.5}/>
    <Circle cx={50} cy={30} r={1} fill={INK} opacity={0.6}/>
    <Path d="M72 22 A10 10 0 1 1 72 38 A6 6 0 1 0 72 22Z" fill="none" stroke={INK2} strokeWidth={0.9} opacity={0.55}/>
    <Line x1={36} y1={20} x2={36} y2={45} stroke={INK} strokeWidth={0.4} opacity={0.15}/>
    <Line x1={64} y1={20} x2={64} y2={45} stroke={INK} strokeWidth={0.4} opacity={0.15}/>
    <Line x1={15} y1={58} x2={29} y2={58} stroke={GOLD} strokeWidth={0.5} opacity={0.4}/>
    <Line x1={43} y1={58} x2={57} y2={58} stroke={INK}  strokeWidth={0.5} opacity={0.3}/>
    <Line x1={71} y1={58} x2={85} y2={58} stroke={INK2} strokeWidth={0.5} opacity={0.3}/>
    <Line x1={10} y1={65} x2={90} y2={65} stroke={INK}  strokeWidth={0.4} opacity={0.12}/>
  </Svg>
);

const Icon04 = () => (
  <Svg width={200} height={160} viewBox="0 0 100 80">
    <Line x1={10} y1={62} x2={90} y2={62} stroke={INK} strokeWidth={0.5} opacity={0.18}/>
    <Path d="M10 65 Q30 62 50 65 Q70 68 90 65" fill="none" stroke={INK} strokeWidth={0.4} opacity={0.1}/>
    <Line x1={50} y1={62} x2={50} y2={50} stroke={INK2} strokeWidth={1} opacity={0.4}/>
    <Path d="M50 50 Q42 42 44 32 Q50 38 50 50Z" fill="none" stroke={INK} strokeWidth={0.8} opacity={0.5}/>
    <Path d="M50 50 Q58 42 56 32 Q50 38 50 50Z" fill="none" stroke={INK} strokeWidth={0.8} opacity={0.5}/>
    <Path d="M50 50 Q38 46 32 36 Q42 38 50 50Z" fill="none" stroke={INK} strokeWidth={0.7} opacity={0.35}/>
    <Path d="M50 50 Q62 46 68 36 Q58 38 50 50Z" fill="none" stroke={INK} strokeWidth={0.7} opacity={0.35}/>
    <Path d="M50 50 Q44 35 50 22 Q56 35 50 50Z" fill={BG} stroke={GOLD} strokeWidth={0.9} opacity={0.65}/>
    <Circle cx={50} cy={42} r={3} fill="none" stroke={GOLD} strokeWidth={0.7} opacity={0.6}/>
    <Circle cx={50} cy={42} r={1} fill={GOLD} opacity={0.55}/>
    <Path d="M50 60 Q38 58 32 50 Q42 52 50 60Z" fill="none" stroke={INK2} strokeWidth={0.7} opacity={0.3}/>
  </Svg>
);

const Icon05 = () => (
  <Svg width={200} height={160} viewBox="0 0 100 80">
    <Circle cx={50} cy={42} r={32} fill="none" stroke={INK} strokeWidth={0.4} opacity={0.1}/>
    <Circle cx={50} cy={42} r={24} fill="none" stroke={INK} strokeWidth={0.5} opacity={0.18}/>
    <Circle cx={50} cy={42} r={16} fill="none" stroke={INK} strokeWidth={0.7} opacity={0.28}/>
    <Circle cx={50} cy={42} r={9}  fill="none" stroke={INK} strokeWidth={0.9} opacity={0.4}/>
    <Circle cx={50} cy={42} r={3}  fill={GOLD} opacity={0.7}/>
    <Line x1={50} y1={6}  x2={50} y2={9}  stroke={INK} strokeWidth={0.5} opacity={0.2}/>
    <Line x1={50} y1={73} x2={50} y2={76} stroke={INK} strokeWidth={0.5} opacity={0.2}/>
    <Line x1={14} y1={42} x2={17} y2={42} stroke={INK} strokeWidth={0.5} opacity={0.2}/>
    <Line x1={83} y1={42} x2={86} y2={42} stroke={INK} strokeWidth={0.5} opacity={0.2}/>
    <Path d="M72 16 Q75 13 78 16" fill="none" stroke={INK3} strokeWidth={0.7} opacity={0.4}/>
    <Path d="M80 12 Q83 9 86 12"  fill="none" stroke={INK3} strokeWidth={0.5} opacity={0.3}/>
  </Svg>
);

const Icon06 = () => (
  <Svg width={200} height={160} viewBox="0 0 100 80">
    <Path d="M50 12 A16 16 0 1 1 50 44 A10 10 0 1 0 50 12Z" fill="none" stroke={GOLD} strokeWidth={0.9} opacity={0.6}/>
    <Circle cx={30} cy={18} r={1}   fill={GOLD} opacity={0.45}/>
    <Circle cx={72} cy={14} r={0.8} fill={GOLD} opacity={0.35}/>
    <Circle cx={78} cy={28} r={1}   fill={GOLD} opacity={0.3}/>
    <Circle cx={22} cy={32} r={0.8} fill={GOLD} opacity={0.3}/>
    <Line x1={10} y1={58} x2={90} y2={58} stroke={INK} strokeWidth={0.4} opacity={0.15}/>
    <Path d="M42 58 Q50 62 58 58" fill="none" stroke={GOLD} strokeWidth={0.6} opacity={0.35}/>
    <Path d="M36 62 Q50 68 64 62" fill="none" stroke={GOLD} strokeWidth={0.4} opacity={0.2}/>
    <Circle cx={38} cy={74} r={1.2} fill={INK2} opacity={0.35}/>
    <Circle cx={50} cy={74} r={1.2} fill={INK2} opacity={0.35}/>
    <Circle cx={62} cy={74} r={1.2} fill={INK2} opacity={0.35}/>
  </Svg>
);

const Icon07 = () => (
  <Svg width={200} height={160} viewBox="0 0 100 80">
    <Line x1={42} y1={70} x2={42} y2={10} stroke={INK2} strokeWidth={2}   opacity={0.45}/>
    <Line x1={42} y1={55} x2={42} y2={56} stroke={INK}  strokeWidth={3}   opacity={0.2}/>
    <Line x1={42} y1={38} x2={42} y2={39} stroke={INK}  strokeWidth={3}   opacity={0.2}/>
    <Line x1={42} y1={22} x2={42} y2={23} stroke={INK}  strokeWidth={3}   opacity={0.2}/>
    <Path d="M42 52 Q54 46 52 38" fill="none" stroke={INK2} strokeWidth={0.9} opacity={0.5}/>
    <Path d="M42 34 Q32 28 34 20" fill="none" stroke={INK2} strokeWidth={0.9} opacity={0.45}/>
    <Line x1={58} y1={70} x2={58} y2={22} stroke={INK2} strokeWidth={1.5} opacity={0.35}/>
    <Line x1={58} y1={52} x2={58} y2={53} stroke={INK}  strokeWidth={2.5} opacity={0.18}/>
    <Line x1={58} y1={36} x2={58} y2={37} stroke={INK}  strokeWidth={2.5} opacity={0.18}/>
    <Path d="M58 48 Q68 42 66 34" fill="none" stroke={INK2} strokeWidth={0.7} opacity={0.4}/>
    <Line x1={32} y1={70} x2={32} y2={42} stroke={INK2} strokeWidth={1.2} opacity={0.3}/>
    <Line x1={32} y1={58} x2={32} y2={59} stroke={INK}  strokeWidth={2}   opacity={0.15}/>
    <Line x1={10} y1={70} x2={90} y2={70} stroke={INK}  strokeWidth={0.5} opacity={0.2}/>
    <Path d="M48 70 Q50 64 52 68" fill="none" stroke={INK2} strokeWidth={0.7} opacity={0.3}/>
    <Path d="M24 70 Q26 66 28 70" fill="none" stroke={INK2} strokeWidth={0.6} opacity={0.25}/>
  </Svg>
);

// ── Slide Data ─────────────────────────────────────────────────

const SLIDES = [
  {
    icon: <Icon01 />,
    title: 'Welcome to ZenWakeup',
    sub: 'A daily practice of stillness,\nawareness, and return.',
  },
  {
    icon: <Icon02 />,
    title: 'What is Zen?',
    sub: 'Zen is not a belief.\nIt is a way of paying attention —\nto breath, to moment, to life as it is.',
  },
  {
    icon: <Icon03 />,
    title: 'A Zen Life, Simply',
    sub: 'ZenWakeup gives you three small rituals.\nMorning. Daytime. Evening.\nThat is enough.',
  },
  {
    icon: <Icon04 />,
    title: 'Morning Meditation',
    sub: 'Each day begins with a few minutes\nof guided breathing.\nNo experience needed. Just arrive.',
  },
  {
    icon: <Icon05 />,
    title: 'Return to Now',
    sub: 'Throughout the day, a gentle reminder\nto pause and notice.\nWhere are you? How do you feel?',
  },
  {
    icon: <Icon06 />,
    title: 'Evening Reflection',
    sub: 'Three quiet questions at day\'s end.\nWhat did you bring?\nWhat are you grateful for?\nWhat will you release?',
  },
  {
    icon: <Icon07 />,
    title: 'What Awaits You',
    sub: 'With practice, the noise softens.\nYou begin to respond rather than react.\nYou sleep better. Wake lighter.\nYou become more — you.',
  },
];

// ── Component ──────────────────────────────────────────────────

interface Props {
  onDone: () => void;
}

export default function OnboardingScreen({ onDone }: Props) {
  const [slideIdx, setSlideIdx] = useState(0);

  const fadeAnim   = useRef(new Animated.Value(1)).current;
  const bgMist1    = useRef(new Animated.Value(0)).current;
  const bgMist2    = useRef(new Animated.Value(0)).current;
  const brushY     = useRef(new Animated.Value(0)).current;
  const iconScale  = useRef(new Animated.Value(0.8)).current;
  const iconOpac   = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(bgMist1, { toValue: 1, duration: 10000, useNativeDriver: true }),
      Animated.timing(bgMist1, { toValue: 0, duration: 10000, useNativeDriver: true }),
    ])).start();
    Animated.loop(Animated.sequence([
      Animated.timing(bgMist2, { toValue: 1, duration: 14000, useNativeDriver: true }),
      Animated.timing(bgMist2, { toValue: 0, duration: 14000, useNativeDriver: true }),
    ])).start();
    Animated.loop(Animated.sequence([
      Animated.timing(brushY, { toValue: 1, duration: 16000, useNativeDriver: true }),
      Animated.timing(brushY, { toValue: 0, duration: 16000, useNativeDriver: true }),
    ])).start();
    animateIn();
  }, []);

  function animateIn() {
    iconScale.setValue(0.75);
    iconOpac.setValue(0);
    Animated.parallel([
      Animated.spring(iconScale, { toValue: 1, useNativeDriver: true, damping: 12, mass: 0.8 }),
      Animated.timing(iconOpac, { toValue: 1, duration: 800, useNativeDriver: true }),
    ]).start();
  }

  async function goNext() {
    if (slideIdx < SLIDES.length - 1) {
      Animated.timing(fadeAnim, { toValue: 0, duration: 250, useNativeDriver: true }).start(() => {
        setSlideIdx(i => i + 1);
        animateIn();
        Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
      });
    } else {
      await completeOnboarding(6, 0, 5);
      onDone();
    }
  }

  const slide = SLIDES[slideIdx];

  const BgElements = () => (
    <>
      <View style={s.mountain1} />
      <View style={s.mountain2} />
      <View style={s.mountain3} />
      {[0.38, 0.42, 0.46].map((pos, i) => (
        <View key={i} style={[s.waterLine, {
          top: height * pos,
          opacity: 0.03 + i * 0.012,
          width: width * [0.7, 0.82, 0.65][i],
          alignSelf: 'center',
        }]} />
      ))}
      <Animated.View style={[s.mistLayer1, {
        transform: [{ translateY: bgMist1.interpolate({ inputRange: [0, 1], outputRange: [0, -12] }) }],
      }]} />
      <Animated.View style={[s.mistLayer2, {
        transform: [{ translateX: bgMist2.interpolate({ inputRange: [0, 1], outputRange: [0, 16] }) }],
      }]} />
      <Animated.View style={[s.brushGroup, {
        transform: [{ translateY: brushY.interpolate({ inputRange: [0, 1], outputRange: [0, -14] }) }],
      }]}>
        {[
          { left: width * 0.05, h: 100, op: 0.05 },
          { left: width * 0.10, h: 150, op: 0.07 },
          { left: width * 0.15, h: 65,  op: 0.04 },
          { left: width * 0.79, h: 120, op: 0.06 },
          { left: width * 0.85, h: 80,  op: 0.08 },
          { left: width * 0.90, h: 100, op: 0.05 },
        ].map((b, i) => (
          <View key={i} style={{
            position: 'absolute', left: b.left, bottom: 0,
            width: 1.5, height: b.h, backgroundColor: '#1e2030',
            opacity: b.op, borderRadius: 1,
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

        {/* Illustration */}
        <Animated.View style={{
          opacity: iconOpac,
          transform: [{ scale: iconScale }],
        }}>
          {slide.icon}
        </Animated.View>

        <View style={{ height: 32 }} />

        {/* Ink divider */}
        <View style={s.inkLine} />

        <View style={{ height: 32 }} />

        <Text style={s.title}>{slide.title}</Text>
        <View style={{ height: 20 }} />
        <Text style={s.sub}>{slide.sub}</Text>

        <View style={{ height: 64 }} />

        <TouchableOpacity style={s.nextBtn} onPress={goNext}>
          <Text style={s.nextBtnText}>
            {slideIdx === SLIDES.length - 1 ? 'Begin  ›' : 'Next  ›'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={s.skipBtn} onPress={onDone}>
          <Text style={s.skipText}>skip intro</Text>
        </TouchableOpacity>

      </Animated.View>
    </View>
  );
}

// ── Styles ─────────────────────────────────────────────────────

const s = StyleSheet.create({
  root:    { flex: 1, backgroundColor: BG },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },

  mountain1: { position: 'absolute', width: width*1.4, height: width*1.4, borderRadius: width*0.7,  backgroundColor: 'rgba(30,32,48,0.04)',  top: height*0.45, left: -width*0.2 },
  mountain2: { position: 'absolute', width: width*1.1, height: width*1.1, borderRadius: width*0.55, backgroundColor: 'rgba(30,32,48,0.03)',  top: height*0.48, left: width*0.1 },
  mountain3: { position: 'absolute', width: width*0.8, height: width*0.8, borderRadius: width*0.4,  backgroundColor: 'rgba(30,32,48,0.025)', top: height*0.50, right: -width*0.05 },
  waterLine: { position: 'absolute', height: 1, backgroundColor: '#1e2030' },
  mistLayer1: { position: 'absolute', width: width*1.3, height: 80, borderRadius: 40, backgroundColor: 'rgba(220,216,206,0.4)', top: height*0.32, left: -width*0.15 },
  mistLayer2: { position: 'absolute', width: width*0.9, height: 50, borderRadius: 25, backgroundColor: 'rgba(220,216,206,0.3)', top: height*0.38, right: -width*0.1 },
  brushGroup: { position: 'absolute', top: height*0.25, left: 0, right: 0, height: 180 },
  cornerTL:   { position: 'absolute', width: 100, height: 100, borderRadius: 50, borderWidth: 1, borderColor: 'rgba(30,32,48,0.06)', top: -30, left: -30 },
  cornerBR:   { position: 'absolute', width: 70,  height: 70,  borderRadius: 35, borderWidth: 1, borderColor: 'rgba(30,32,48,0.05)', top: height*0.55, right: -15 },

  dots:      { position: 'absolute', top: 64, flexDirection: 'row', gap: 8, alignSelf: 'center' },
  dot:       { width: 4, height: 4, borderRadius: 2, backgroundColor: 'rgba(42,46,36,0.2)' },
  dotActive: { width: 16, backgroundColor: 'rgba(42,46,36,0.6)' },

  inkLine: { width: 40, height: 1, backgroundColor: 'rgba(42,46,36,0.25)' },
  title:   { fontSize: 22, color: INK2, letterSpacing: 4, fontWeight: '300', textAlign: 'center' },
  sub:     { fontSize: 13, color: INK2, letterSpacing: 1.5, fontWeight: '300', textAlign: 'center', lineHeight: 24, opacity: 0.75 },

  nextBtn:     { borderWidth: 1, borderColor: 'rgba(42,46,36,0.25)', paddingHorizontal: 36, paddingVertical: 14, borderRadius: 2 },
  nextBtnText: { fontSize: 13, color: INK2, letterSpacing: 4, fontWeight: '300' },
  skipBtn:     { marginTop: 20, padding: 8 },
  skipText:    { fontSize: 11, color: INK3, letterSpacing: 3, opacity: 0.45 },
});
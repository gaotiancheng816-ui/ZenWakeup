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
import { playGuqinPluck, playPageTurn } from '../utils/sounds';
import { completeOnboarding } from '../utils/storage';

const { width, height } = Dimensions.get('window');
const INK = '#2a2e24', INK2 = '#485040', INK3 = '#7a8472', GOLD = '#8a7040', BG = '#dedad2';

const MountainPathIcon = () => (
  <Svg width={200} height={160} viewBox="0 0 100 80">
    <Path d="M0,70 L15,48 L30,70Z"  fill="none" stroke={INK} strokeWidth={0.5} opacity={0.15}/>
    <Path d="M20,70 L38,42 L56,70Z" fill="none" stroke={INK} strokeWidth={0.5} opacity={0.12}/>
    <Path d="M30,70 L55,18 L80,70Z" fill={BG} stroke={INK} strokeWidth={1.0} strokeLinejoin="round" opacity={0.75}/>
    <Path d="M65,70 L80,50 L95,70Z" fill="none" stroke={INK} strokeWidth={0.5} opacity={0.13}/>
    <Path d="M55,18 Q54,32 53,46 Q52,58 53,70" fill="none" stroke={INK2} strokeWidth={0.7} opacity={0.35}/>
    <Circle cx={48} cy={45} r={2}   fill={INK} opacity={0.22}/>
    <Circle cx={46} cy={38} r={1.5} fill={INK} opacity={0.18}/>
    <Circle cx={44} cy={32} r={1.2} fill={INK} opacity={0.14}/>
    <Path d="M80,14 A8 8 0 1 1 80 30 A5 5 0 1 0 80 14Z" fill="none" stroke={GOLD} strokeWidth={0.8} opacity={0.55}/>
    <Path d="M0,58 Q25,54 50,57 Q75,60 100,56" fill="none" stroke={INK} strokeWidth={0.3} opacity={0.10}/>
    <Line x1={5}  y1={70} x2={95} y2={70} stroke={INK} strokeWidth={0.4} opacity={0.15}/>
    <Line x1={96} y1={8}  x2={96} y2={70} stroke={INK} strokeWidth={0.8} opacity={0.06}/>
    <Line x1={93} y1={16} x2={93} y2={70} stroke={INK} strokeWidth={0.5} opacity={0.04}/>
  </Svg>
);

const EveningIcon = () => (
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

const PracticeIcon = () => (
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

const SLIDES = [
  {
    icon: <MountainPathIcon />,
    title: 'The Mountain Path',
    sub: '180 days of quiet mornings.\nEach complete day unlocks\na new element on your path.',
  },
];

interface Props {
  onDone: () => void;
}

export default function OnboardingScreen({ onDone }: Props) {
  const [slideIdx, setSlideIdx] = useState(0);

  const fadeAnim  = useRef(new Animated.Value(1)).current;
  const bgMist1   = useRef(new Animated.Value(0)).current;
  const bgMist2   = useRef(new Animated.Value(0)).current;
  const brushY    = useRef(new Animated.Value(0)).current;
  const iconScale = useRef(new Animated.Value(0.8)).current;
  const iconOpac  = useRef(new Animated.Value(0)).current;

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
    iconScale.setValue(0.75);
    iconOpac.setValue(0);
    Animated.parallel([
      Animated.spring(iconScale, { toValue:1, useNativeDriver:true, damping:12, mass:0.8 }),
      Animated.timing(iconOpac,  { toValue:1, duration:800, useNativeDriver:true }),
    ]).start();
  }

  async function goNext() {
    if (slideIdx < SLIDES.length - 1) {
      playPageTurn();
      Animated.timing(fadeAnim, { toValue:0, duration:250, useNativeDriver:true }).start(() => {
        setSlideIdx(i => i + 1);
        animateIn();
        Animated.timing(fadeAnim, { toValue:1, duration:400, useNativeDriver:true }).start();
      });
    } else {
      playGuqinPluck();
      await completeOnboarding(5);
      setTimeout(() => onDone(), 800);
    }
  }

  const slide = SLIDES[slideIdx];

  return (
    <View style={s.root}>
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
        transform: [{ translateY: bgMist1.interpolate({ inputRange:[0,1], outputRange:[0,-12] }) }],
      }]} />
      <Animated.View style={[s.mistLayer2, {
        transform: [{ translateX: bgMist2.interpolate({ inputRange:[0,1], outputRange:[0,16] }) }],
      }]} />
      <Animated.View style={[s.brushGroup, {
        transform: [{ translateY: brushY.interpolate({ inputRange:[0,1], outputRange:[0,-14] }) }],
      }]}>
        {[
          { left:width*0.05, h:100, op:0.05 }, { left:width*0.10, h:150, op:0.07 },
          { left:width*0.15, h:65,  op:0.04 }, { left:width*0.79, h:120, op:0.06 },
          { left:width*0.85, h:80,  op:0.08 }, { left:width*0.90, h:100, op:0.05 },
        ].map((b, i) => (
          <View key={i} style={{
            position:'absolute', left:b.left, bottom:0,
            width:1.5, height:b.h, backgroundColor:'#1e2030',
            opacity:b.op, borderRadius:1,
          }} />
        ))}
      </Animated.View>
      <View style={s.cornerTL} />
      <View style={s.cornerBR} />

      <View style={s.dots}>
        {SLIDES.map((_, i) => (
          <View key={i} style={[s.dot, i === slideIdx && s.dotActive]} />
        ))}
      </View>

      <Animated.View style={[s.content, { opacity: fadeAnim }]}>
        <Animated.View style={{ opacity: iconOpac, transform: [{ scale: iconScale }] }}>
          {slide.icon}
        </Animated.View>
        <View style={{ height:24 }} />
        <View style={s.inkLine} />
        <View style={{ height:24 }} />
        <Text style={s.title}>{slide.title}</Text>
        <View style={{ height:16 }} />
        <Text style={s.sub}>{slide.sub}</Text>
        <View style={{ height:48 }} />
        <TouchableOpacity style={s.nextBtn} onPress={goNext}>
          <Text style={s.nextBtnText}>
            {slideIdx === SLIDES.length - 1 ? 'Set Morning Alarm  ›' : 'Next  ›'}
          </Text>
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
  mistLayer1: { position:'absolute', width:width*1.3, height:80, borderRadius:40, backgroundColor:'rgba(220,216,206,0.4)', top:height*0.32, left:-width*0.15 },
  mistLayer2: { position:'absolute', width:width*0.9, height:50, borderRadius:25, backgroundColor:'rgba(220,216,206,0.3)', top:height*0.38, right:-width*0.1 },
  brushGroup: { position:'absolute', top:height*0.25, left:0, right:0, height:180 },
  cornerTL:   { position:'absolute', width:100, height:100, borderRadius:50, borderWidth:1, borderColor:'rgba(30,32,48,0.06)', top:-30, left:-30 },
  cornerBR:   { position:'absolute', width:70,  height:70,  borderRadius:35, borderWidth:1, borderColor:'rgba(30,32,48,0.05)', top:height*0.55, right:-15 },
  dots:      { position:'absolute', top:64, flexDirection:'row', gap:8, alignSelf:'center' },
  dot:       { width:4, height:4, borderRadius:2, backgroundColor:'rgba(42,46,36,0.2)' },
  dotActive: { width:16, backgroundColor:'rgba(42,46,36,0.6)' },
  inkLine:     { width:40, height:1, backgroundColor:'rgba(42,46,36,0.25)' },
  title:       { fontSize:20, color:INK2, letterSpacing:3, fontWeight:'300', textAlign:'center' },
  sub:         { fontSize:12, color:INK2, letterSpacing:1.5, fontWeight:'300', textAlign:'center', lineHeight:22, opacity:0.75 },
  nextBtn:     { borderWidth:1, borderColor:'rgba(42,46,36,0.25)', paddingHorizontal:36, paddingVertical:14, borderRadius:2 },
  nextBtnText: { fontSize:13, color:INK2, letterSpacing:4, fontWeight:'300' },
});
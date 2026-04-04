import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Svg, { Circle, Ellipse, Line, Path, Rect } from 'react-native-svg';
import { AppTheme } from '../constants/app-themes';
import { useTheme } from '../utils/theme-context';
import { playPageTurn, playWelcomeBell } from '../utils/sounds';

const { width, height } = Dimensions.get('window');

const WabiIcon01 = ({ INK, INK2, GOLD, BG }: { INK: string; INK2: string; GOLD: string; BG: string }) => (
  <Svg width={width} height={width * 0.65} viewBox="0 0 175 130">
    <Rect width={175} height={130} fill={BG}/>
    <Ellipse cx={88} cy={38} rx={105} ry={35} fill={INK} opacity={0.045}/>
    <Circle cx={143} cy={28} r={13} fill={BG}/>
    <Circle cx={149} cy={23} r={11} fill={INK} opacity={0.07}/>
    <Circle cx={143} cy={28} r={13} fill="none" stroke={GOLD} strokeWidth={0.9} opacity={0.50}/>
    <Circle cx={150} cy={23} r={11} fill={BG}/>
    <Path d="M0,88 Q43,68 88,64 Q128,61 175,70 L175,100 L0,100Z" fill={INK} opacity={0.09}/>
    <Path d="M0,96 Q48,78 88,75 Q125,72 175,81 L175,108 L0,108Z" fill={INK} opacity={0.06}/>
    <Rect x={0} y={105} width={175} height={25} fill={INK} opacity={0.04}/>
    <Path d="M0,107 Q21,103 43,107 Q65,111 88,106 Q112,101 140,105 Q158,108 175,104" fill="none" stroke={INK} strokeWidth={0.6} opacity={0.22}/>
    <Path d="M0,116 Q29,112 58,116 Q87,120 116,115 Q146,110 175,114" fill="none" stroke={INK} strokeWidth={0.4} opacity={0.14}/>
    <Path d="M65,104 Q69,90 73,83 Q77,78 81,83 Q85,90 87,104Z" fill={INK} opacity={0.46}/>
    <Path d="M77,83 L77,62 Q85,68 85,83Z" fill={INK} opacity={0.36}/>
    <Ellipse cx={76} cy={109} rx={11} ry={3} fill={INK} opacity={0.08}/>
    <Rect x={-5} y={97} width={185} height={12} rx={6} fill={BG} opacity={0.60}/>
    <Line x1={6}   y1={14} x2={6}   y2={125} stroke={INK} strokeWidth={1.2} opacity={0.06}/>
    <Line x1={10}  y1={24} x2={10}  y2={123} stroke={INK} strokeWidth={0.7} opacity={0.04}/>
    <Line x1={167} y1={14} x2={167} y2={125} stroke={INK} strokeWidth={1.0} opacity={0.05}/>
  </Svg>
);

const WabiIcon02 = ({ INK, INK2, GOLD, BG }: { INK: string; INK2: string; GOLD: string; BG: string }) => (
  <Svg width={width} height={width * 0.65} viewBox="0 0 175 130">
    <Rect width={175} height={130} fill={BG}/>
    <Rect x={0} y={0} width={175} height={90} fill={INK} opacity={0.03}/>
    <Ellipse cx={138} cy={34} rx={36} ry={26} fill={GOLD} opacity={0.08}/>
    <Circle  cx={138} cy={34} r={15} fill={GOLD} opacity={0.10}/>
    <Circle  cx={138} cy={34} r={7}  fill={GOLD} opacity={0.18}/>
    <Circle  cx={138} cy={34} r={3}  fill={GOLD} opacity={0.40}/>
    <Path d="M0,100 L22,80 L44,100Z"     fill={INK} opacity={0.10}/>
    <Path d="M28,100 L54,72 L80,100Z"    fill={INK} opacity={0.12}/>
    <Path d="M72,100 L95,84 L118,100Z"   fill={INK} opacity={0.09}/>
    <Path d="M108,100 L126,87 L144,100Z" fill={INK} opacity={0.08}/>
    <Path d="M18,128 Q50,92 65,74 Q75,62 80,52 Q82,47 84,52 Q89,62 99,75 Q114,94 147,128Z"
      fill={INK} opacity={0.28}/>
    <Path d="M84,52 Q91,65 100,80 Q114,101 141,128 L126,128 Q108,110 98,90 Q91,74 84,52Z"
      fill={BG} opacity={0.12}/>
    <Path d="M82,52 Q81,68 80,86 Q79,102 80,128" fill="none" stroke={INK2} strokeWidth={0.8} opacity={0.32}/>
    <Rect x={-5}  y={97}  width={185} height={16} rx={8} fill={BG} opacity={0.58}/>
    <Rect x={10}  y={108} width={155} height={12} rx={6} fill={BG} opacity={0.40}/>
    <Rect x={24}  y={117} width={127} height={9}  rx={4} fill={BG} opacity={0.28}/>
    <Line x1={167} y1={14} x2={167} y2={126} stroke={INK} strokeWidth={1.2} opacity={0.06}/>
    <Line x1={163} y1={24} x2={163} y2={124} stroke={INK} strokeWidth={0.7} opacity={0.04}/>
  </Svg>
);

const SLIDES = [
  {
    title: 'Eight centuries ago,',
    sub: 'a monk named Dogen\nwoke before sunrise every morning.\n\nNot to achieve anything.\nJust to sit. Just to breathe.\nHe called it — simply being.',
    btn: 'Next  ›',
    isFinal: false,
  },
  {
    title: "Dogen's world was quieter than ours.",
    sub: 'Yet he still chose stillness —\nevery single morning.\n\nEight centuries later,\nthat same stillness is yours to find.',
    btn: 'Step onto the path  ›',
    isFinal: true,
  },
];

interface Props {
  onDone: () => void;
}

export default function DogenScreen({ onDone }: Props) {
  const { theme: T } = useTheme();
  const INK = T.ink, INK2 = T.ink2, INK3 = T.ink3, GOLD = T.gold, BG = T.bg;
  const s = makeStyles(T);
  const [slideIdx, setSlideIdx] = useState(0);

  const fadeAnim  = useRef(new Animated.Value(1)).current;
  const bgMist    = useRef(new Animated.Value(0)).current;
  const brushY    = useRef(new Animated.Value(0)).current;
  const iconScale = useRef(new Animated.Value(0.8)).current;
  const iconOpac  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(bgMist, { toValue: 1, duration: 12000, useNativeDriver: true }),
      Animated.timing(bgMist, { toValue: 0, duration: 12000, useNativeDriver: true }),
    ])).start();
    Animated.loop(Animated.sequence([
      Animated.timing(brushY, { toValue: 1, duration: 18000, useNativeDriver: true }),
      Animated.timing(brushY, { toValue: 0, duration: 18000, useNativeDriver: true }),
    ])).start();
    animateIn();
  }, []);

  function animateIn() {
    iconScale.setValue(0.78);
    iconOpac.setValue(0);
    Animated.parallel([
      Animated.spring(iconScale, { toValue: 1, useNativeDriver: true, damping: 14, mass: 0.9 }),
      Animated.timing(iconOpac,  { toValue: 1, duration: 1000, useNativeDriver: true }),
    ]).start();
  }

  function goNext() {
    if (slideIdx === 0) playWelcomeBell();
    else playPageTurn();

    if (slideIdx < SLIDES.length - 1) {
      Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start(() => {
        setSlideIdx(i => i + 1);
        animateIn();
        Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
      });
    } else {
      onDone();
    }
  }

  const slide = SLIDES[slideIdx];

  return (
    <View style={s.root}>
      <View style={s.mountain1} />
      <View style={s.mountain2} />
      <View style={s.mountain3} />
      {[0.40, 0.43, 0.46].map((pos, i) => (
        <View key={i} style={[s.waterLine, {
          top: height * pos,
          opacity: 0.03 + i * 0.01,
          width: width * [0.68, 0.80, 0.62][i],
          alignSelf: 'center',
        }]} />
      ))}
      <Animated.View style={[s.mistLayer, {
        transform: [{ translateY: bgMist.interpolate({ inputRange: [0,1], outputRange: [0,-10] }) }],
      }]} />
      <Animated.View style={[s.brushGroup, {
        transform: [{ translateY: brushY.interpolate({ inputRange: [0,1], outputRange: [0,-12] }) }],
      }]}>
        {[
          { left: width*0.05, h:110, op:0.05 },
          { left: width*0.10, h:160, op:0.06 },
          { left: width*0.15, h:70,  op:0.04 },
          { left: width*0.79, h:130, op:0.055 },
          { left: width*0.85, h:85,  op:0.07 },
          { left: width*0.90, h:105, op:0.045 },
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

        {/* 关键修复：用 slideIdx 作为 key，强制每次切换时重新挂载 */}
        <Animated.View
          key={`icon-${slideIdx}`}
          style={{ opacity: iconOpac, transform: [{ scale: iconScale }] }}
        >
          {slideIdx === 0 && <WabiIcon01 INK={INK} INK2={INK2} GOLD={GOLD} BG={BG} />}
          {slideIdx === 1 && <WabiIcon02 INK={INK} INK2={INK2} GOLD={GOLD} BG={BG} />}
        </Animated.View>

        <View style={s.inkLine} />

        <View key={`text-${slideIdx}`} style={s.textZone}>
          <Text style={s.title}>{slide.title}</Text>
          <Text style={s.sub}>{slide.sub}</Text>
        </View>

        <View style={{ height: 8 }} />

        <TouchableOpacity
          style={[s.btn, slide.isFinal && s.btnFinal]}
          onPress={goNext}
        >
          <Text style={[s.btnText, slide.isFinal && s.btnTextFinal]}>
            {slide.btn}
          </Text>
        </TouchableOpacity>

      </Animated.View>
    </View>
  );
}

function makeStyles(T: AppTheme) {
  const INK = T.ink, INK2 = T.ink2, INK3 = T.ink3, GOLD = T.gold, BG = T.bg;
  return StyleSheet.create({
  root:      { flex:1, backgroundColor:BG },
  mountain1: { position:'absolute', width:width*1.4, height:width*1.4, borderRadius:width*0.7,  backgroundColor:'rgba(30,32,48,0.045)', top:height*0.45, left:-width*0.2 },
  mountain2: { position:'absolute', width:width*1.1, height:width*1.1, borderRadius:width*0.55, backgroundColor:'rgba(30,32,48,0.035)', top:height*0.48, left:width*0.1 },
  mountain3: { position:'absolute', width:width*0.8, height:width*0.8, borderRadius:width*0.4,  backgroundColor:'rgba(30,32,48,0.03)',  top:height*0.50, right:-width*0.05 },
  waterLine: { position:'absolute', height:1, backgroundColor:'#1e2030' },
  mistLayer: { position:'absolute', width:width*1.3, height:75, borderRadius:37, backgroundColor:'rgba(220,216,206,0.42)', top:height*0.34, left:-width*0.15 },
  brushGroup:{ position:'absolute', top:height*0.26, left:0, right:0, height:180 },
  cornerTL:  { position:'absolute', width:100, height:100, borderRadius:50, borderWidth:1, borderColor:'rgba(30,32,48,0.07)', top:-30, left:-30 },
  cornerBR:  { position:'absolute', width:70,  height:70,  borderRadius:35, borderWidth:1, borderColor:'rgba(30,32,48,0.06)', top:height*0.55, right:-15 },
  dots:      { position:'absolute', top:56, flexDirection:'row', gap:8, alignSelf:'center' },
  dot:       { width:4, height:4, borderRadius:2, backgroundColor:'rgba(42,38,28,0.18)' },
  dotActive: { width:16, backgroundColor:'rgba(42,38,28,0.50)' },
  content: {
    flex:1,
    alignItems:'center',
    justifyContent:'center',
    paddingHorizontal:40,
    paddingTop:72,
    paddingBottom:44,
  },
  inkLine:  { width:32, height:1, backgroundColor:'rgba(42,38,28,0.22)', marginVertical:20 },
  textZone: { alignItems:'center', paddingHorizontal:0, marginBottom:4 },
  title: {
    fontSize:18, color:INK2, letterSpacing:1.5, fontWeight:'400',
    textAlign:'center', marginBottom:14,
  },
  sub: {
    fontSize:14, color:INK2, letterSpacing:1, fontWeight:'300',
    textAlign:'center', lineHeight:24, opacity:0.78,
  },
  btn:          { borderWidth:1, borderColor:'rgba(42,38,28,0.22)', paddingHorizontal:32, paddingVertical:14, borderRadius:2, alignItems:'center', justifyContent:'center', minWidth:width-80 },
  btnFinal:     { borderColor:'rgba(42,38,28,0.38)', backgroundColor:'rgba(42,38,28,0.05)' },
  btnText:      { fontSize:14, color:INK2, letterSpacing:3, fontWeight:'400', textAlign:'center' },
  btnTextFinal: { letterSpacing:2 },
  });
}
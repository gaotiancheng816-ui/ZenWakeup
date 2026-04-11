import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { TapButton } from '../components/tap-button';
import Svg, { Circle, Ellipse, Line, Path, Rect } from 'react-native-svg';
// Ellipse, Rect kept for potential future use — used in Svg components above
import { AppTheme } from '../constants/app-themes';
import { useTheme } from '../utils/theme-context';
import { playPageTurn, playWelcomeBell } from '../utils/sounds';

const { width, height } = Dimensions.get('window');

// ── Welcome page: ink-wash background ────────────────────────────────────────
const InkWashBg = ({ INK, GOLD }: { INK: string; GOLD: string }) => (
  <Svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }} pointerEvents="none">
    {/* large central ink bloom */}
    <Circle cx={width * 0.5}  cy={height * 0.42} r={width * 0.72} fill={INK} opacity={0.055}/>
    <Circle cx={width * 0.5}  cy={height * 0.42} r={width * 0.52} fill={INK} opacity={0.04}/>
    <Circle cx={width * 0.5}  cy={height * 0.42} r={width * 0.30} fill={INK} opacity={0.035}/>
    <Circle cx={width * 0.5}  cy={height * 0.42} r={width * 0.14} fill={INK} opacity={0.045}/>
    {/* off-centre secondary bloom */}
    <Circle cx={width * 0.22} cy={height * 0.28} r={width * 0.38} fill={INK} opacity={0.03}/>
    <Circle cx={width * 0.78} cy={height * 0.60} r={width * 0.30} fill={INK} opacity={0.025}/>
    {/* ink drip streaks */}
    <Path d={`M${width*0.48} ${height*0.18} Q${width*0.50} ${height*0.32} ${width*0.47} ${height*0.46}`}
      fill="none" stroke={INK} strokeWidth={0.8} opacity={0.10}/>
    <Path d={`M${width*0.52} ${height*0.20} Q${width*0.54} ${height*0.35} ${width*0.53} ${height*0.50}`}
      fill="none" stroke={INK} strokeWidth={0.5} opacity={0.07}/>
    {/* gold accent dot */}
    <Circle cx={width * 0.50} cy={height * 0.42} r={3} fill={GOLD} opacity={0.55}/>
    <Circle cx={width * 0.50} cy={height * 0.42} r={1.2} fill={GOLD} opacity={0.85}/>
    {/* horizon line */}
    <Path d={`M${width*0.08} ${height*0.72} Q${width*0.50} ${height*0.70} ${width*0.92} ${height*0.72}`}
      fill="none" stroke={INK} strokeWidth={0.4} opacity={0.12}/>
    {/* side brush strokes */}
    <Line x1={width*0.06} y1={height*0.22} x2={width*0.06} y2={height*0.58} stroke={INK} strokeWidth={1.2} opacity={0.05}/>
    <Line x1={width*0.09} y1={height*0.30} x2={width*0.09} y2={height*0.62} stroke={INK} strokeWidth={0.7} opacity={0.035}/>
    <Line x1={width*0.94} y1={height*0.18} x2={width*0.94} y2={height*0.55} stroke={INK} strokeWidth={1.0} opacity={0.045}/>
    <Line x1={width*0.91} y1={height*0.26} x2={width*0.91} y2={height*0.60} stroke={INK} strokeWidth={0.6} opacity={0.03}/>
  </Svg>
);

// ── Dogen slide 1: pre-dawn monk silhouette ──────────────────────────────────
const DogenBg01 = ({ INK, GOLD }: { INK: string; GOLD: string }) => (
  <Svg width={width} height={height} style={{ position:'absolute', top:0, left:0 }} pointerEvents="none">
    <Circle cx={width*0.62} cy={height*0.22} r={width*0.55} fill={GOLD} opacity={0.04}/>
    <Circle cx={width*0.62} cy={height*0.22} r={width*0.32} fill={GOLD} opacity={0.04}/>
    <Circle cx={width*0.62} cy={height*0.22} r={width*0.14} fill={GOLD} opacity={0.06}/>
    <Circle cx={width*0.50} cy={height*0.78} r={width*0.80} fill={INK} opacity={0.06}/>
    <Circle cx={width*0.50} cy={height*0.85} r={width*0.55} fill={INK} opacity={0.05}/>
    <Ellipse cx={width*0.50} cy={height*0.56} rx={width*0.09} ry={width*0.13} fill={INK} opacity={0.14}/>
    <Circle  cx={width*0.50} cy={height*0.43} r={width*0.045} fill={INK} opacity={0.13}/>
    <Path d={`M${width*0.05} ${height*0.65} Q${width*0.5} ${height*0.63} ${width*0.95} ${height*0.65}`}
      fill="none" stroke={INK} strokeWidth={0.5} opacity={0.10}/>
    <Line x1={width*0.06} y1={height*0.20} x2={width*0.06} y2={height*0.65} stroke={INK} strokeWidth={1.2} opacity={0.06}/>
    <Line x1={width*0.09} y1={height*0.28} x2={width*0.09} y2={height*0.68} stroke={INK} strokeWidth={0.7} opacity={0.04}/>
    <Line x1={width*0.94} y1={height*0.16} x2={width*0.94} y2={height*0.62} stroke={INK} strokeWidth={1.0} opacity={0.05}/>
  </Svg>
);

// ── Dogen slide 2: mountain + eight centuries ─────────────────────────────────
const DogenBg02 = ({ INK, GOLD }: { INK: string; GOLD: string }) => (
  <Svg width={width} height={height} style={{ position:'absolute', top:0, left:0 }} pointerEvents="none">
    <Circle cx={width*0.50} cy={height*0.45} r={width*0.75} fill={INK} opacity={0.05}/>
    <Circle cx={width*0.50} cy={height*0.45} r={width*0.48} fill={INK} opacity={0.04}/>
    <Circle cx={width*0.50} cy={height*0.45} r={width*0.24} fill={INK} opacity={0.04}/>
    <Path d={`M${width*0.10} ${height*0.72} L${width*0.50} ${height*0.32} L${width*0.90} ${height*0.72}Z`}
      fill={INK} opacity={0.08}/>
    <Path d={`M${width*0.28} ${height*0.72} L${width*0.50} ${height*0.32} L${width*0.58} ${height*0.72}Z`}
      fill={INK} opacity={0.06}/>
    <Circle cx={width*0.50} cy={height*0.32} r={2.5} fill={GOLD} opacity={0.50}/>
    <Circle cx={width*0.50} cy={height*0.32} r={1.0} fill={GOLD} opacity={0.80}/>
    <Path d={`M0 ${height*0.68} Q${width*0.5} ${height*0.65} ${width} ${height*0.68}`}
      fill="none" stroke={INK} strokeWidth={0.5} opacity={0.12}/>
    <Line x1={width*0.06} y1={height*0.22} x2={width*0.06} y2={height*0.60} stroke={INK} strokeWidth={1.2} opacity={0.06}/>
    <Line x1={width*0.94} y1={height*0.18} x2={width*0.94} y2={height*0.58} stroke={INK} strokeWidth={1.0} opacity={0.05}/>
  </Svg>
);

const SLIDES = [
  {
    title: 'Zen Wakeup',
    sub: 'A quiet morning practice.\nBuilt around stillness, breath,\nand the slow rhythm of each day.',
    btn: 'Begin  ›',
    isFinal: false,
    isWelcome: true,
  },
  {
    title: 'Eight centuries ago,',
    sub: 'a monk named Dogen\nwoke before sunrise every morning.\n\nNot to achieve anything.\nJust to sit. Just to breathe.\nHe called it — simply being.',
    btn: 'Next  ›',
    isFinal: false,
    isWelcome: false,
  },
  {
    title: "Dogen's world was quieter than ours.",
    sub: 'Yet he still chose stillness —\nevery single morning.\n\nEight centuries later,\nthat same stillness is yours to find.',
    btn: 'Step onto the path  ›',
    isFinal: true,
    isWelcome: false,
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

  const fadeAnim    = useRef(new Animated.Value(1)).current;
  const bgMist      = useRef(new Animated.Value(0)).current;
  const brushY      = useRef(new Animated.Value(0)).current;

  // Welcome page specific
  const inkBloom    = useRef(new Animated.Value(0)).current;   // bloom pulse
  const titleY      = useRef(new Animated.Value(18)).current;  // title slides up
  const titleOpac   = useRef(new Animated.Value(0)).current;
  const subOpac     = useRef(new Animated.Value(0)).current;
  const btnOpac     = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(brushY, { toValue: 1, duration: 18000, useNativeDriver: true }),
      Animated.timing(brushY, { toValue: 0, duration: 18000, useNativeDriver: true }),
    ])).start();

    if (slideIdx === 0) {
      startWelcomeAnim();
    } else {
      animateIn();
    }
  }, []);

  // Bloom pulses continuously on welcome page
  useEffect(() => {
    if (slideIdx === 0) {
      Animated.loop(Animated.sequence([
        Animated.timing(inkBloom, { toValue: 1, duration: 4000, useNativeDriver: true }),
        Animated.timing(inkBloom, { toValue: 0, duration: 4000, useNativeDriver: true }),
      ])).start();
    }
  }, [slideIdx]);

  function startWelcomeAnim() {
    titleY.setValue(24);
    titleOpac.setValue(0);
    subOpac.setValue(0);
    btnOpac.setValue(0);

    // title drifts up + fades in
    Animated.parallel([
      Animated.timing(titleOpac, { toValue: 1, duration: 1400, useNativeDriver: true }),
      Animated.timing(titleY,    { toValue: 0, duration: 1400, useNativeDriver: true }),
    ]).start();
    // sub fades in after 900ms
    Animated.sequence([
      Animated.delay(900),
      Animated.timing(subOpac, { toValue: 1, duration: 1200, useNativeDriver: true }),
    ]).start();
    // button fades in last
    Animated.sequence([
      Animated.delay(1800),
      Animated.timing(btnOpac, { toValue: 1, duration: 800, useNativeDriver: true }),
    ]).start();
  }

  function animateIn() {
    titleY.setValue(20);
    titleOpac.setValue(0);
    subOpac.setValue(0);
    btnOpac.setValue(0);
    Animated.parallel([
      Animated.timing(titleOpac, { toValue: 1, duration: 1200, useNativeDriver: true }),
      Animated.timing(titleY,    { toValue: 0, duration: 1200, useNativeDriver: true }),
    ]).start();
    Animated.sequence([
      Animated.delay(700),
      Animated.timing(subOpac, { toValue: 1, duration: 1000, useNativeDriver: true }),
    ]).start();
    Animated.sequence([
      Animated.delay(1400),
      Animated.timing(btnOpac, { toValue: 1, duration: 700, useNativeDriver: true }),
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
  const bloomScale = inkBloom.interpolate({ inputRange: [0, 1], outputRange: [0.97, 1.03] });

  // ── Welcome page ─────────────────────────────────────────────────────────
  if (slideIdx === 0) {
    return (
      <View style={s.root}>
        {/* animated ink bloom layer */}
        <Animated.View style={[
          StyleSheet.absoluteFill,
          { transform: [{ scale: bloomScale }] }
        ]}>
          <InkWashBg INK={INK} GOLD={GOLD} />
        </Animated.View>

        {/* brush strokes */}
        <Animated.View style={[s.brushGroup, {
          transform: [{ translateY: brushY.interpolate({ inputRange:[0,1], outputRange:[0,-12] }) }],
        }]}>
          {[
            { left: width*0.05, h:120, op:0.06 },
            { left: width*0.09, h:170, op:0.07 },
            { left: width*0.91, h:140, op:0.06 },
            { left: width*0.95, h:100, op:0.05 },
          ].map((b, i) => (
            <View key={i} style={{
              position:'absolute', left:b.left, bottom:0,
              width:1.5, height:b.h, backgroundColor:INK,
              opacity:b.op, borderRadius:1,
            }} />
          ))}
        </Animated.View>

        {/* dots */}
        <View style={s.dots}>
          {SLIDES.map((_, i) => (
            <View key={i} style={[s.dot, i === slideIdx && s.dotActive]} />
          ))}
        </View>

        {/* content */}
        <View style={s.welcomeContent}>
          {/* large title */}
          <Animated.Text style={[s.welcomeTitle, {
            opacity: titleOpac,
            transform: [{ translateY: titleY }],
          }]}>
            Zen Wakeup
          </Animated.Text>

          <Animated.View style={[s.welcomeHairline, { opacity: titleOpac }]} />

          <Animated.Text style={[s.welcomeSub, { opacity: subOpac }]}>
            {'A quiet morning practice.\nBuilt around stillness, breath,\nand the slow rhythm of each day.'}
          </Animated.Text>

          <View style={{ height: 56 }} />

          <Animated.View style={{ opacity: btnOpac, width: '100%' }}>
            <TapButton style={s.welcomeBtn} onPress={goNext}>
              <Text style={s.welcomeBtnText}>Begin  ›</Text>
            </TapButton>
          </Animated.View>
        </View>
      </View>
    );
  }

  // ── Dogen slides ──────────────────────────────────────────────────────────
  return (
    <View style={s.root}>
      {/* ink-wash background per slide */}
      <Animated.View style={[StyleSheet.absoluteFill, { transform: [{ scale: bloomScale }] }]}>
        {slideIdx === 1 && <DogenBg01 INK={INK} GOLD={GOLD} />}
        {slideIdx === 2 && <DogenBg02 INK={INK} GOLD={GOLD} />}
      </Animated.View>

      {/* floating brush strokes */}
      <Animated.View style={[s.brushGroup, {
        transform: [{ translateY: brushY.interpolate({ inputRange:[0,1], outputRange:[0,-12] }) }],
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
            width:1.5, height:b.h, backgroundColor:INK,
            opacity:b.op, borderRadius:1,
          }} />
        ))}
      </Animated.View>

      <View style={s.dots}>
        {SLIDES.map((_, i) => (
          <View key={i} style={[s.dot, i === slideIdx && s.dotActive]} />
        ))}
      </View>

      <View style={s.content}>
        <Animated.Text style={[s.title, {
          opacity: titleOpac,
          transform: [{ translateY: titleY }],
        }]}>
          {slide.title}
        </Animated.Text>

        <Animated.View style={[s.inkLine, { opacity: titleOpac }]} />

        <Animated.Text style={[s.sub, { opacity: subOpac }]}>
          {slide.sub}
        </Animated.Text>

        <View style={{ height: 48 }} />

        <Animated.View style={{ opacity: btnOpac, width: '100%' }}>
          <TapButton
            style={[s.btn, slide.isFinal && s.btnFinal]}
            onPress={goNext}
          >
            <Text style={[s.btnText, slide.isFinal && s.btnTextFinal]}>
              {slide.btn}
            </Text>
          </TapButton>
        </Animated.View>
      </View>
    </View>
  );
}

function makeStyles(T: AppTheme) {
  const INK = T.ink, INK2 = T.ink2, INK3 = T.ink3, GOLD = T.gold, BG = T.bg;
  return StyleSheet.create({
  root:      { flex:1, backgroundColor:BG },
  // welcome
  welcomeContent: {
    flex:1, alignItems:'center', justifyContent:'center',
    paddingHorizontal:40, paddingBottom:60,
  },
  welcomeTitle: {
    fontSize:48, color:INK, fontWeight:'100',
    letterSpacing:4, textAlign:'center',
  },
  welcomeHairline: {
    width:40, height:1, backgroundColor:`${GOLD}99`,
    marginVertical:28,
  },
  welcomeSub: {
    fontSize:14, color:INK2, letterSpacing:1.5, fontWeight:'300',
    textAlign:'center', lineHeight:26, opacity:0.72,
  },
  welcomeBtn: {
    borderWidth:1, borderColor:`${INK}33`,
    paddingHorizontal:40, paddingVertical:16,
    borderRadius:2, alignItems:'center',
  },
  welcomeBtnText: {
    fontSize:14, color:INK2, letterSpacing:5, fontWeight:'300',
  },
  // dogen slides
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
    flex:1, alignItems:'center', justifyContent:'center',
    paddingHorizontal:40, paddingTop:72, paddingBottom:44,
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

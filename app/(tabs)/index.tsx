import { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, Animated, PanResponder,
  Dimensions, StatusBar
} from 'react-native';
import Svg, {
  Path, Rect, Defs,
  LinearGradient as SvgLinearGradient, Stop
} from 'react-native-svg';

const { width, height } = Dimensions.get('window');
const TRACK_W = 240;
const THUMB   = 48;
const MAX_X   = TRACK_W - THUMB - 6;

function InkMountains() {
  const W = width, H = height;
  return (
    <Svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}
      style={StyleSheet.absoluteFill} preserveAspectRatio="xMidYMid slice">
      <Defs>
        <SvgLinearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0"   stopColor="#dedad2" stopOpacity="1"/>
          <Stop offset="0.6" stopColor="#eae6dc" stopOpacity="1"/>
          <Stop offset="1"   stopColor="#d8d4c8" stopOpacity="1"/>
        </SvgLinearGradient>
        <SvgLinearGradient id="m1" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#9aaa98" stopOpacity="1"/>
          <Stop offset="1" stopColor="#dedad2" stopOpacity="1"/>
        </SvgLinearGradient>
        <SvgLinearGradient id="m2" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#7a9278" stopOpacity="1"/>
          <Stop offset="1" stopColor="#c8c4ba" stopOpacity="1"/>
        </SvgLinearGradient>
        <SvgLinearGradient id="m3" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#607860" stopOpacity="1"/>
          <Stop offset="1" stopColor="#a0a898" stopOpacity="1"/>
        </SvgLinearGradient>
        <SvgLinearGradient id="mist" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#eae6dc" stopOpacity="0"/>
          <Stop offset="0.5" stopColor="#eae6dc" stopOpacity="0.55"/>
          <Stop offset="1" stopColor="#eae6dc" stopOpacity="0"/>
        </SvgLinearGradient>
      </Defs>
      <Rect x="0" y="0" width={W} height={H} fill="url(#sky)"/>
      <Path
        d={`M0,${H*0.60} Q${W*0.08},${H*0.32} ${W*0.16},${H*0.44} Q${W*0.26},${H*0.20} ${W*0.38},${H*0.35} Q${W*0.48},${H*0.14} ${W*0.56},${H*0.28} Q${W*0.68},${H*0.10} ${W*0.78},${H*0.26} Q${W*0.88},${H*0.18} ${W},${H*0.32} L${W},${H*0.68} L0,${H*0.68} Z`}
        fill="url(#m1)" opacity={0.55}
      />
      <Path
        d={`M0,${H*0.70} Q${W*0.10},${H*0.44} ${W*0.22},${H*0.56} Q${W*0.33},${H*0.32} ${W*0.44},${H*0.48} Q${W*0.54},${H*0.26} ${W*0.64},${H*0.42} Q${W*0.76},${H*0.20} ${W*0.86},${H*0.38} Q${W*0.94},${H*0.30} ${W},${H*0.44} L${W},${H*0.78} L0,${H*0.78} Z`}
        fill="url(#m2)" opacity={0.65}
      />
      <Path
        d={`M0,${H*0.80} Q${W*0.12},${H*0.58} ${W*0.24},${H*0.68} Q${W*0.34},${H*0.46} ${W*0.46},${H*0.60} Q${W*0.56},${H*0.40} ${W*0.66},${H*0.54} Q${W*0.78},${H*0.32} ${W*0.88},${H*0.50} Q${W*0.95},${H*0.44} ${W},${H*0.56} L${W},${H} L0,${H} Z`}
        fill="url(#m3)" opacity={0.55}
      />
      <Path
        d={`M0,${H*0.86} Q${W*0.25},${H*0.82} ${W*0.5},${H*0.84} Q${W*0.75},${H*0.86} ${W},${H*0.82} L${W},${H} L0,${H} Z`}
        fill="#607860" opacity={0.35}
      />
      <Rect x={-W*0.1} y={H*0.42} width={W*1.2} height={H*0.22} fill="url(#mist)"/>
      <Rect x="0" y="0" width={W} height={H} fill="#eae6dc" opacity={0.15}/>
    </Svg>
  );
}

export default function ZenAlarmScreen() {
  const [dismissed, setDismissed] = useState(false);
  const [time, setTime]           = useState('06:00');
  const [dateStr, setDateStr]     = useState('');

  const thumbX    = useRef(new Animated.Value(0)).current;
  const bellAnim  = useRef(new Animated.Value(0)).current;
  const fadeIn    = useRef(new Animated.Value(0)).current;
  const mistDrift = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const upd = () => {
      const n = new Date();
      setTime(`${String(n.getHours()).padStart(2,'0')}:${String(n.getMinutes()).padStart(2,'0')}`);
      const D = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
      const M = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      setDateStr(`${D[n.getDay()]}  ·  ${n.getDate()} ${M[n.getMonth()]}`);
    };
    upd(); const t = setInterval(upd,10000); return ()=>clearInterval(t);
  }, []);

  useEffect(() => {
    Animated.timing(fadeIn,{toValue:1,duration:2200,useNativeDriver:true}).start();
  },[]);

  useEffect(() => {
    if (dismissed) return;
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(bellAnim,{toValue:1, duration:650,useNativeDriver:true}),
      Animated.timing(bellAnim,{toValue:-1,duration:650,useNativeDriver:true}),
      Animated.timing(bellAnim,{toValue:0, duration:450,useNativeDriver:true}),
      Animated.delay(2200),
    ])); loop.start(); return ()=>loop.stop();
  },[dismissed]);

  useEffect(() => {
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(mistDrift,{toValue:1,duration:7000,useNativeDriver:true}),
      Animated.timing(mistDrift,{toValue:0,duration:7000,useNativeDriver:true}),
    ])); loop.start(); return ()=>loop.stop();
  },[]);

  const pan = useRef(PanResponder.create({
    onStartShouldSetPanResponder: ()=>true,
    onPanResponderMove: (_,g) => thumbX.setValue(Math.max(0,Math.min(MAX_X,g.dx))),
    onPanResponderRelease: (_,g) => {
      if (g.dx >= MAX_X*0.65) {
        Animated.timing(thumbX,{toValue:MAX_X,duration:180,useNativeDriver:false})
          .start(()=>setDismissed(true));
      } else {
        Animated.spring(thumbX,{toValue:0,useNativeDriver:false}).start();
      }
    },
  })).current;

  const bellRot    = bellAnim.interpolate({inputRange:[-1,0,1],outputRange:['-9deg','0deg','9deg']});
  const labelOpac  = thumbX.interpolate({inputRange:[0,MAX_X*0.35],outputRange:[1,0]});
  const mistTX     = mistDrift.interpolate({inputRange:[0,1],outputRange:[0,12]});

  if (dismissed) {
    return (
      <View style={s.root}>
        <StatusBar barStyle="dark-content"/>
        <InkMountains/>
        <Animated.View style={[s.center,{opacity:fadeIn}]}>
          <Text style={s.awTitle}>晨　醒</Text>
          <Text style={s.awTitleEn}>A W A K E N I N G</Text>
          <View style={s.hairline}/>
          <Text style={s.awQuote}>知足者富</Text>
          <Text style={s.awQuoteEn}>Those who know enough are rich</Text>
          <View style={{height:52}}/>
          <Text style={s.awHint}>Your mindfulness session begins…</Text>
        </Animated.View>
      </View>
    );
  }

  return (
    <View style={s.root}>
      <StatusBar barStyle="dark-content"/>
      <InkMountains/>
      <Animated.View style={[s.mistBand,{transform:[{translateX:mistTX}]}]}/>
      <Animated.View style={[s.center,{opacity:fadeIn}]}>
        <Text style={s.appTitle}>坐　禅</Text>
        <Text style={s.appTitleEn}>ZEN  WAKEUP</Text>
        <View style={{height:36}}/>
        <View style={s.ring}>
          <View style={s.ringInner}>
            <Text style={s.timeText}>{time}</Text>
          </View>
        </View>
        <View style={{height:10}}/>
        <Text style={s.dateText}>{dateStr}</Text>
        <View style={{height:32}}/>
        <View style={{height:32}}/>
        <Text style={s.tagline}>无事无心　随作随止</Text>
        <Text style={s.taglineEn}>No mind, no burden  ·  Begin when ready</Text>
        <View style={{height:44}}/>
        <View style={s.track}>
          <Animated.Text style={[s.trackLabel,{opacity:labelOpac}]}>
            Slide to wake　　❯
          </Animated.Text>
          <Animated.View
            style={[s.thumb,{transform:[{translateX:thumbX}]}]}
            {...pan.panHandlers}>
            <Text style={s.thumbIcon}>☽</Text>
          </Animated.View>
        </View>
        <View style={{height:32}}/>
        <Text style={s.footer}>以东方智慧，开启你的能量</Text>
        <Text style={s.footerEn}>Eastern wisdom for your morning energy</Text>
      </Animated.View>
    </View>
  );
}

const INK = '#2a2e24', INK2 = '#485040', INK3 = '#7a8472';

const s = StyleSheet.create({
  root:       { flex:1, backgroundColor:'#dedad2', alignItems:'center', justifyContent:'center' },
  center:     { alignItems:'center', width:'100%', paddingHorizontal:32, paddingBottom:32 },
  mistBand:   { position:'absolute', left:-30, right:-30, top:height*0.44, height:height*0.16, backgroundColor:'rgba(234,230,220,0.5)' },
  appTitle:   { fontSize:28, color:INK,  fontWeight:'300', letterSpacing:14 },
  appTitleEn: { fontSize:10, color:INK3, letterSpacing:6,  fontWeight:'300', marginTop:5 },
  ring:       { width:144, height:144, borderRadius:72, borderWidth:1, borderColor:'rgba(42,46,36,0.16)', alignItems:'center', justifyContent:'center', backgroundColor:'rgba(234,230,220,0.55)', shadowColor:INK, shadowOpacity:0.08, shadowRadius:24, shadowOffset:{width:0,height:6} },
  ringInner:  { width:118, height:118, borderRadius:59, borderWidth:0.5, borderColor:'rgba(42,46,36,0.10)', alignItems:'center', justifyContent:'center' },
  timeText:   { fontSize:38, color:INK, fontWeight:'200', letterSpacing:2 },
  dateText:   { fontSize:11, color:INK3, letterSpacing:4, fontWeight:'300' },
  bellGlyph:  { fontSize:30, color:INK2, fontWeight:'200', opacity:0.65 },
  tagline:    { fontSize:14, color:INK2, letterSpacing:5, fontWeight:'300' },
  taglineEn:  { fontSize:10, color:INK3, letterSpacing:1.5, marginTop:6, fontWeight:'300', opacity:0.7, fontStyle:'italic' },
  track:      { width:TRACK_W, height:THUMB+6, borderRadius:(THUMB+6)/2, borderWidth:1, borderColor:'rgba(42,46,36,0.14)', backgroundColor:'rgba(42,46,36,0.04)', justifyContent:'center', paddingLeft:3, overflow:'hidden' },
  trackLabel: { position:'absolute', width:'100%', textAlign:'center', fontSize:11, color:INK3, letterSpacing:2, fontWeight:'300' },
  thumb:      { width:THUMB, height:THUMB, borderRadius:THUMB/2, backgroundColor:INK, alignItems:'center', justifyContent:'center', shadowColor:INK, shadowOpacity:0.22, shadowRadius:8, shadowOffset:{width:0,height:2} },
  thumbIcon:  { fontSize:17, color:'#e8e4da' },
  footer:     { fontSize:11, color:INK3, letterSpacing:3, opacity:0.65 },
  footerEn:   { fontSize:10, color:INK3, letterSpacing:1.5, marginTop:4, opacity:0.45, fontStyle:'italic' },
  hairline:   { width:28, height:1, backgroundColor:'rgba(42,46,36,0.18)', marginVertical:22 },
  awTitle:    { fontSize:40, color:INK, fontWeight:'200', letterSpacing:18, marginBottom:6 },
  awTitleEn:  { fontSize:10, color:INK3, letterSpacing:7, fontWeight:'300' },
  awQuote:    { fontSize:22, color:INK2, letterSpacing:8, fontWeight:'300' },
  awQuoteEn:  { fontSize:11, color:INK3, letterSpacing:1, marginTop:8, fontWeight:'300', fontStyle:'italic', opacity:0.7 },
  awHint:     { fontSize:11, color:INK3, letterSpacing:2, opacity:0.55 },
});
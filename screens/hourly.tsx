import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions, StatusBar,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { playZenBowl } from '../utils/sounds';

const { width, height } = Dimensions.get('window');

const QUOTES = [
  { label: 'Presence',  sub: 'This moment is complete' },
  { label: 'Stillness', sub: 'A settled mind settles all things' },
  { label: 'Patience',  sub: 'No rush — all things arrive' },
  { label: 'Breath',    sub: 'Breath is always home' },
  { label: 'Release',   sub: 'Release, and release again' },
  { label: 'Enough',    sub: 'Those who know enough are rich' },
  { label: 'Peace',     sub: 'Stillness brings peace' },
];

const HOURS = [
  'Good morning','Good morning','Good morning','Good morning',
  'Good morning','Good morning','Good morning','Good morning',
  'Good morning','Good morning','Good morning','Good morning',
  'Good afternoon','Good afternoon','Good afternoon','Good afternoon',
  'Good afternoon','Good afternoon','Good evening','Good evening',
  'Good evening','Good evening','Good evening','Good evening',
];

export default function DaytimeScreen({ onEvening }: { onEvening?: () => void }) {
  const [time, setTime] = useState('');
  const [quote]         = useState(QUOTES[new Date().getHours() % QUOTES.length]);
  const [greeting]      = useState(HOURS[new Date().getHours()]);

  const fadeIn   = useRef(new Animated.Value(0)).current;
  const orbScale = useRef(new Animated.Value(1)).current;
  const mist1    = useRef(new Animated.Value(0)).current;
  const mist2    = useRef(new Animated.Value(0)).current;
  const mist3    = useRef(new Animated.Value(0)).current;
  const brushY   = useRef(new Animated.Value(0)).current;
  const ring1    = useRef(new Animated.Value(0)).current;
  const ring2    = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const upd = () => {
      const n = new Date();
      setTime(`${String(n.getHours()).padStart(2,'0')}:${String(n.getMinutes()).padStart(2,'0')}`);
    };
    upd();
    const t = setInterval(upd, 10000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    Animated.timing(fadeIn, { toValue:1, duration:2000, useNativeDriver:true }).start();
  }, []);

  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(orbScale, { toValue:1.06, duration:4500, useNativeDriver:true }),
      Animated.timing(orbScale, { toValue:1.0,  duration:4500, useNativeDriver:true }),
    ])).start();
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
      Animated.timing(mist3, { toValue:1, duration:13000, useNativeDriver:true }),
      Animated.timing(mist3, { toValue:0, duration:13000, useNativeDriver:true }),
    ])).start();
    Animated.loop(Animated.sequence([
      Animated.timing(brushY, { toValue:1, duration:14000, useNativeDriver:true }),
      Animated.timing(brushY, { toValue:0, duration:14000, useNativeDriver:true }),
    ])).start();
  }, []);

  useEffect(() => {
    const ripple = (anim: Animated.Value, delay: number) => {
      Animated.loop(Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, { toValue:1, duration:4000, useNativeDriver:true }),
        Animated.timing(anim, { toValue:0, duration:0,    useNativeDriver:true }),
      ])).start();
    };
    ripple(ring1, 0);
    ripple(ring2, 2000);
  }, []);

  useEffect(() => {
    const t = setInterval(() => {
      const now = new Date();
      if (now.getMinutes() === 0) playZenBowl();
      if (now.getHours() >= 18) onEvening && onEvening()
      }, 60000);
    return () => clearInterval(t);
  }, []);

  const rippleStyle = (anim: Animated.Value) => ({
    opacity:   anim.interpolate({ inputRange:[0,0.2,1], outputRange:[0,0.07,0] }),
    transform: [{ scale: anim.interpolate({ inputRange:[0,1], outputRange:[1,3.0] }) }],
  });

  return (
    <View style={s.root}>
      <StatusBar barStyle="dark-content" />

      {/* 背景 */}
      <View style={s.mountain1} /><View style={s.mountain2} /><View style={s.mountain3} />
      {[0.58,0.61,0.64].map((pos,i) => (
        <View key={i} style={[s.waterLine, {
          top:height*pos, opacity:0.04+i*0.02,
          width:width*[0.75,0.88,0.7][i], alignSelf:'center',
        }]} />
      ))}
      <Animated.View style={[s.mist1Layer, { transform:[{ translateY: mist1.interpolate({ inputRange:[0,1], outputRange:[0,-10] }) }] }]} />
      <Animated.View style={[s.mist2Layer, { transform:[{ translateX: mist2.interpolate({ inputRange:[0,1], outputRange:[0,14] }) }] }]} />
      <Animated.View style={[s.mist3Layer, { transform:[{ translateY: mist3.interpolate({ inputRange:[0,1], outputRange:[0,8] }) }] }]} />
      <Animated.View style={[s.brushGroup, { transform:[{ translateY: brushY.interpolate({ inputRange:[0,1], outputRange:[0,-14] }) }] }]}>
        {[
          { left:width*0.06, h:90,  op:0.06 },{ left:width*0.11, h:150, op:0.08 },
          { left:width*0.16, h:65,  op:0.05 },{ left:width*0.79, h:120, op:0.07 },
          { left:width*0.85, h:75,  op:0.09 },{ left:width*0.90, h:100, op:0.05 },
        ].map((b,i) => (
          <View key={i} style={{ position:'absolute', left:b.left, bottom:0, width:1.5, height:b.h, backgroundColor:'#2a2e24', opacity:b.op, borderRadius:1 }} />
        ))}
      </Animated.View>
      <View style={s.cornerTL} /><View style={s.cornerBR} />

      {/* 内容 */}
      <Animated.View style={[s.content, { opacity: fadeIn }]}>

        {/* 顶部 */}
        <Text style={s.greeting}>{greeting}</Text>
        <Text style={s.time}>{time}</Text>

        <View style={{ height: 32 }} />

        {/* 大圆 */}
        <View style={s.stage}>
          <Animated.View style={[s.ripple, rippleStyle(ring1)]} />
          <Animated.View style={[s.ripple, rippleStyle(ring2)]} />
          <Animated.View style={[s.orbOuter, { transform:[{ scale: orbScale }] }]}>
            <View style={s.orbMid}>
              <Text style={s.kanji}>息</Text>
            </View>
          </Animated.View>
        </View>

        <View style={{ height: 28 }} />

        {/* 英文主词 */}
        <Text style={s.mainWord}>Focus</Text>
        <Text style={s.subWord}>{quote.sub}</Text>

        <View style={s.hairline} />

        {/* 三次呼吸 */}
        <View style={s.breathRow}>
          {[
            { icon:'↑', label:'Inhale'  },
            { icon:'↓', label:'Exhale'  },
            { icon:'∞', label:'Return'  },
          ].map((item,i) => (
            <View key={i} style={s.breathItem}>
              <View style={s.breathCircle}>
                <Text style={s.breathIcon}>{item.icon}</Text>
              </View>
              <Text style={s.breathItemLabel}>{item.label}</Text>
            </View>
          ))}
        </View>

        <View style={{ height: 40 }} />

        <Text style={s.hint}>A gentle bell sounds every hour</Text>
        <Text style={s.hintSub}>No task · just a moment of awareness</Text>

      </Animated.View>
    </View>
  );
}

const INK = '#2a2e24', INK2 = '#485040', INK3 = '#7a8472', BG = '#dedad2';

const s = StyleSheet.create({
  root:       { flex:1, backgroundColor:BG },
  mountain1:  { position:'absolute', width:width*1.4, height:width*1.4, borderRadius:width*0.7,  backgroundColor:'rgba(42,46,36,0.045)', bottom:-width*0.95, left:-width*0.2 },
  mountain2:  { position:'absolute', width:width*1.1, height:width*1.1, borderRadius:width*0.55, backgroundColor:'rgba(42,46,36,0.035)', bottom:-width*0.72, left:width*0.1 },
  mountain3:  { position:'absolute', width:width*0.8, height:width*0.8, borderRadius:width*0.4,  backgroundColor:'rgba(42,46,36,0.03)',  bottom:-width*0.52, right:-width*0.05 },
  waterLine:  { position:'absolute', height:1, backgroundColor:'#2a2e24' },
  mist1Layer: { position:'absolute', width:width*1.3, height:80,  borderRadius:40, backgroundColor:'rgba(234,230,220,0.55)', bottom:height*0.24, left:-width*0.15 },
  mist2Layer: { position:'absolute', width:width*0.85, height:55, borderRadius:28, backgroundColor:'rgba(234,230,220,0.38)', bottom:height*0.29, right:-width*0.1 },
  mist3Layer: { position:'absolute', width:width*0.6,  height:40, borderRadius:20, backgroundColor:'rgba(234,230,220,0.28)', bottom:height*0.20, left:width*0.1 },
  brushGroup: { position:'absolute', bottom:height*0.13, left:0, right:0, height:170 },
  cornerTL:   { position:'absolute', width:100, height:100, borderRadius:50, borderWidth:1, borderColor:'rgba(42,46,36,0.07)', top:-30, left:-30 },
  cornerBR:   { position:'absolute', width:70,  height:70,  borderRadius:35, borderWidth:1, borderColor:'rgba(42,46,36,0.06)', bottom:70, right:-15 },

  content:    { flex:1, alignItems:'center', justifyContent:'center', paddingHorizontal:40 },
  greeting:   { fontSize:11, color:INK3, letterSpacing:6, fontWeight:'300' },
  time:       { fontSize:15, color:INK2, letterSpacing:4, fontWeight:'300', marginTop:6 },

  stage:      { width:220, height:220, alignItems:'center', justifyContent:'center' },
  ripple:     { position:'absolute', width:180, height:180, borderRadius:90, borderWidth:1, borderColor:'#2a2e24' },
  orbOuter:   { width:180, height:180, borderRadius:90, borderWidth:1, borderColor:'rgba(42,46,36,0.15)', backgroundColor:'rgba(234,230,220,0.6)', alignItems:'center', justifyContent:'center' },
  orbMid:     { width:140, height:140, borderRadius:70, borderWidth:0.5, borderColor:'rgba(42,46,36,0.09)', alignItems:'center', justifyContent:'center' },
  kanji:      { fontSize:52, color:INK, fontWeight:'200', letterSpacing:4 },

  mainWord: { fontSize:28, color:INK2, letterSpacing:10, fontWeight:'300' },
  subWord:    { fontSize:13, color:INK2, letterSpacing:3, fontWeight:'300', marginTop:10, textAlign:'center' },
  hairline:   { width:32, height:1, backgroundColor:'rgba(42,46,36,0.15)', marginVertical:28 },

  breathRow:       { flexDirection:'row', gap:32 },
  breathItem:      { alignItems:'center', gap:10 },
  breathCircle:    { width:52, height:52, borderRadius:26, borderWidth:1, borderColor:'rgba(42,46,36,0.14)', backgroundColor:'rgba(234,230,220,0.5)', alignItems:'center', justifyContent:'center' },
  breathIcon:      { fontSize:20, color:INK2, fontWeight:'200' },
  breathItemLabel: { fontSize:11, color:INK2, letterSpacing:2, fontWeight:'300' },

  hint:    { fontSize:11, color:INK2, letterSpacing:2, opacity:0.6 },
  hintSub: { fontSize:10, color:INK3, letterSpacing:1, opacity:0.45, fontStyle:'italic', marginTop:4 },
});
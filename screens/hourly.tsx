import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions, StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { getHourlyQuote } from '../utils/greetings';
import { playZenBowl } from '../utils/sounds';
import { loadData } from '../utils/storage';

const { width, height } = Dimensions.get('window');
const INK = '#2a2e24', INK2 = '#485040', INK3 = '#7a8472', GOLD = '#8a7040', BG = '#dedad2';

const HOURS = [
  'Good morning','Good morning','Good morning','Good morning',
  'Good morning','Good morning','Good morning','Good morning',
  'Good morning','Good morning','Good morning','Good morning',
  'Good afternoon','Good afternoon','Good afternoon','Good afternoon',
  'Good afternoon','Good afternoon','Good evening','Good evening',
  'Good evening','Good evening','Good evening','Good evening',
];

function RippleIcon() {
  return (
    <Svg width={200} height={200} viewBox="0 0 200 200">
      <Circle cx={100} cy={100} r={90} fill="none" stroke={INK} strokeWidth={0.4} opacity={0.07}/>
      <Circle cx={100} cy={100} r={70} fill="none" stroke={INK} strokeWidth={0.5} opacity={0.11}/>
      <Circle cx={100} cy={100} r={50} fill="none" stroke={INK} strokeWidth={0.7} opacity={0.18}/>
      <Circle cx={100} cy={100} r={30} fill="none" stroke={INK} strokeWidth={0.9} opacity={0.26}/>
      <Circle cx={100} cy={100} r={13} fill="none" stroke={INK} strokeWidth={1.1} opacity={0.32}/>
      <Circle cx={100} cy={100} r={4}   fill={GOLD} opacity={0.65}/>
      <Circle cx={100} cy={100} r={1.6} fill={GOLD} opacity={0.9}/>
    </Svg>
  );
}

export default function DaytimeScreen({ onEvening }: { onEvening?: () => void }) {
  const [time,     setTime]     = useState('');
  const [greeting, setGreeting] = useState('');
  const [quote,    setQuote]    = useState('');

  const fadeIn  = useRef(new Animated.Value(0)).current;
  const rippleS = useRef(new Animated.Value(1)).current;
  const mist1   = useRef(new Animated.Value(0)).current;
  const mist2   = useRef(new Animated.Value(0)).current;
  const brushY  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadData().then(data => {
      const lastRecord = [...data.records].reverse().find(r => r.eveningDone);
      const lastScore  = lastRecord?.score ?? 2;
      setQuote(getHourlyQuote(lastScore));
    });
    const upd = () => {
      const n = new Date();
      setTime(`${String(n.getHours()).padStart(2,'00')} : ${String(n.getMinutes()).padStart(2,'00')}`);
      setGreeting(HOURS[n.getHours()]);
    };
    upd();
    const t = setInterval(upd, 10000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    Animated.timing(fadeIn, { toValue: 1, duration: 2000, useNativeDriver: true }).start();
  }, []);

  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(rippleS, { toValue: 1.06, duration: 5000, useNativeDriver: true }),
      Animated.timing(rippleS, { toValue: 1.0,  duration: 5000, useNativeDriver: true }),
    ])).start();
  }, []);

  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(mist1, { toValue: 1, duration: 9000,  useNativeDriver: true }),
      Animated.timing(mist1, { toValue: 0, duration: 9000,  useNativeDriver: true }),
    ])).start();
    Animated.loop(Animated.sequence([
      Animated.timing(mist2, { toValue: 1, duration: 12000, useNativeDriver: true }),
      Animated.timing(mist2, { toValue: 0, duration: 12000, useNativeDriver: true }),
    ])).start();
    Animated.loop(Animated.sequence([
      Animated.timing(brushY, { toValue: 1, duration: 14000, useNativeDriver: true }),
      Animated.timing(brushY, { toValue: 0, duration: 14000, useNativeDriver: true }),
    ])).start();
  }, []);

  useEffect(() => {
    const t = setInterval(() => {
      if (new Date().getMinutes() === 0) playZenBowl();
    }, 60000);
    return () => clearInterval(t);
  }, []);

  return (
    <View style={s.root}>
      <StatusBar barStyle="dark-content" />

      <View style={s.mountain1} /><View style={s.mountain2} /><View style={s.mountain3} />
      {[0.58, 0.61, 0.64].map((pos, i) => (
        <View key={i} style={[s.waterLine, {
          top: height*pos, opacity: 0.04+i*0.02,
          width: width*[0.75,0.88,0.7][i], alignSelf: 'center',
        }]} />
      ))}
      <Animated.View style={[s.mist1Layer, {
        transform: [{ translateY: mist1.interpolate({ inputRange:[0,1], outputRange:[0,-10] }) }]
      }]} />
      <Animated.View style={[s.mist2Layer, {
        transform: [{ translateX: mist2.interpolate({ inputRange:[0,1], outputRange:[0,14] }) }]
      }]} />
      <Animated.View style={[s.brushGroup, {
        transform: [{ translateY: brushY.interpolate({ inputRange:[0,1], outputRange:[0,-14] }) }]
      }]}>
        {[
          { left:width*0.06, h:90,  op:0.06 }, { left:width*0.11, h:150, op:0.08 },
          { left:width*0.16, h:65,  op:0.05 }, { left:width*0.79, h:120, op:0.07 },
          { left:width*0.85, h:75,  op:0.09 }, { left:width*0.90, h:100, op:0.05 },
        ].map((b, i) => (
          <View key={i} style={{
            position:'absolute', left:b.left, bottom:0,
            width:1.5, height:b.h, backgroundColor:'#2a2e24',
            opacity:b.op, borderRadius:1,
          }} />
        ))}
      </Animated.View>
      <View style={s.cornerTL} /><View style={s.cornerBR} />

      <Animated.View style={[s.content, { opacity: fadeIn }]}>

        {/* 顶部 */}
        <Text style={s.greeting}>{greeting}</Text>
        <Text style={s.time}>{time}</Text>
        <View style={{ height: 24 }} />

        {/* 涟漪 */}
        <Animated.View style={{ transform: [{ scale: rippleS }] }}>
          <RippleIcon />
        </Animated.View>

        {/* 主词 + 禅语 */}
        <Text style={s.mainWord}>Focus</Text>
        <View style={{ height: 10 }} />
        <Text style={s.quote}>{quote}</Text>

        {/* 底部固定在薄雾层位置 */}
        <View style={s.bottomWrap}>
          <View style={s.bottomLine} />
          <Text style={s.hintMain}>Nothing to do  ·  nowhere to be</Text>
          <Text style={s.hintSub}>A gentle bell will sound each hour</Text>
          <View style={{ height: 20 }} />
          <TouchableOpacity style={s.reflectBtn} onPress={() => onEvening && onEvening()}>
            <Text style={s.reflectBtnText}>Begin today's reflection  ›</Text>
          </TouchableOpacity>
        </View>

      </Animated.View>
    </View>
  );
}

const s = StyleSheet.create({
  root:       { flex:1, backgroundColor:BG },
  mountain1:  { position:'absolute', width:width*1.4, height:width*1.4, borderRadius:width*0.7,  backgroundColor:'rgba(42,46,36,0.045)', bottom:-width*0.95, left:-width*0.2 },
  mountain2:  { position:'absolute', width:width*1.1, height:width*1.1, borderRadius:width*0.55, backgroundColor:'rgba(42,46,36,0.035)', bottom:-width*0.72, left:width*0.1 },
  mountain3:  { position:'absolute', width:width*0.8, height:width*0.8, borderRadius:width*0.4,  backgroundColor:'rgba(42,46,36,0.03)',  bottom:-width*0.52, right:-width*0.05 },
  waterLine:  { position:'absolute', height:1, backgroundColor:'#2a2e24' },
  mist1Layer: { position:'absolute', width:width*1.3, height:80,  borderRadius:40, backgroundColor:'rgba(234,230,220,0.55)', bottom:height*0.24, left:-width*0.15 },
  mist2Layer: { position:'absolute', width:width*0.85, height:55, borderRadius:28, backgroundColor:'rgba(234,230,220,0.38)', bottom:height*0.29, right:-width*0.1 },
  brushGroup: { position:'absolute', bottom:height*0.13, left:0, right:0, height:170 },
  cornerTL:   { position:'absolute', width:100, height:100, borderRadius:50, borderWidth:1, borderColor:'rgba(42,46,36,0.07)', top:-30, left:-30 },
  cornerBR:   { position:'absolute', width:70,  height:70,  borderRadius:35, borderWidth:1, borderColor:'rgba(42,46,36,0.06)', bottom:70, right:-15 },

  // 关键改动：去掉 flex:1，改用 position absolute 把底部钉在薄雾层上方
  content: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 72,
  },

  greeting: { fontSize:11, color:INK3, letterSpacing:6, fontWeight:'300' },
  time:     { fontSize:15, color:INK2, letterSpacing:6, fontWeight:'300', marginTop:6 },
  mainWord: { fontSize:28, color:INK2, letterSpacing:10, fontWeight:'300', marginTop:4 },
  quote:    { fontSize:13, color:INK2, letterSpacing:2, fontWeight:'300', opacity:0.6, textAlign:'center' },

  // 底部固定在距离底部 height*0.24 处，对齐薄雾层顶部
  bottomWrap: {
    position: 'absolute',
    bottom: height * 0.24,
    left: 40,
    right: 40,
    alignItems: 'center',
  },
  bottomLine: { width:'100%', height:0.5, backgroundColor:'rgba(42,46,36,0.15)', marginBottom:16 },
  hintMain:   { fontSize:11, color:INK2, letterSpacing:2, opacity:0.55, textAlign:'center' },
  hintSub:    { fontSize:10, color:INK3, letterSpacing:1.5, opacity:0.4, fontStyle:'italic', marginTop:6, textAlign:'center' },

  reflectBtn:     { marginTop:20, borderWidth:1, borderColor:'rgba(42,46,36,0.25)', paddingHorizontal:32, paddingVertical:14, borderRadius:2 },
  reflectBtnText: { fontSize:13, color:INK2, letterSpacing:4, fontWeight:'300' },
});
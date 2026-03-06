import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  PanResponder,
  StatusBar,
  StyleSheet,
  Text,
  View
} from 'react-native';

const { width, height } = Dimensions.get('window');
const TRACK_W = width - 80;
const THUMB   = 52;
const MAX_X   = TRACK_W - THUMB - 4;

const DAYS   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function ZenAlarmScreen({ onDismiss }: { onDismiss?: () => void }) {
  const [time, setTime] = useState('06:00');
  const [date, setDate] = useState('');

  const fadeIn   = useRef(new Animated.Value(0)).current;
  const orbScale = useRef(new Animated.Value(0.96)).current;
  const mist1Y   = useRef(new Animated.Value(0)).current;
  const mist2Y   = useRef(new Animated.Value(0)).current;
  const mist3X   = useRef(new Animated.Value(0)).current;
  const thumbX   = useRef(new Animated.Value(0)).current;
  const ring1    = useRef(new Animated.Value(0)).current;
  const ring2    = useRef(new Animated.Value(0)).current;
  const ring3    = useRef(new Animated.Value(0)).current;
  const brushY   = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const upd = () => {
      const n = new Date();
      setTime(`${String(n.getHours()).padStart(2,'0')}:${String(n.getMinutes()).padStart(2,'0')}`);
      setDate(`${DAYS[n.getDay()]}  ·  ${n.getDate()} ${MONTHS[n.getMonth()]}`);
    };
    upd();
    const t = setInterval(upd, 10000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    Animated.timing(fadeIn, { toValue:1, duration:2400, useNativeDriver:true }).start();
  }, []);

  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(orbScale, { toValue:1.05, duration:4000, useNativeDriver:true }),
      Animated.timing(orbScale, { toValue:0.96, duration:4000, useNativeDriver:true }),
    ])).start();
  }, []);

  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(mist1Y, { toValue:1, duration:7000, useNativeDriver:true }),
      Animated.timing(mist1Y, { toValue:0, duration:7000, useNativeDriver:true }),
    ])).start();
    Animated.loop(Animated.sequence([
      Animated.timing(mist2Y, { toValue:1, duration:9000, useNativeDriver:true }),
      Animated.timing(mist2Y, { toValue:0, duration:9000, useNativeDriver:true }),
    ])).start();
    Animated.loop(Animated.sequence([
      Animated.timing(mist3X, { toValue:1, duration:11000, useNativeDriver:true }),
      Animated.timing(mist3X, { toValue:0, duration:11000, useNativeDriver:true }),
    ])).start();
    Animated.loop(Animated.sequence([
      Animated.timing(brushY, { toValue:1, duration:13000, useNativeDriver:true }),
      Animated.timing(brushY, { toValue:0, duration:13000, useNativeDriver:true }),
    ])).start();
  }, []);

  useEffect(() => {
    const ripple = (anim: Animated.Value, delay: number) => {
      Animated.loop(Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, { toValue:1, duration:3600, useNativeDriver:true }),
        Animated.timing(anim, { toValue:0, duration:0,    useNativeDriver:true }),
      ])).start();
    };
    ripple(ring1, 0);
    ripple(ring2, 1200);
    ripple(ring3, 2400);
  }, []);

  const pan = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (_, g) => thumbX.setValue(Math.max(0, Math.min(MAX_X, g.dx))),
    onPanResponderRelease: (_, g) => {
      if (g.dx >= MAX_X * 0.65) {
        Animated.timing(thumbX, { toValue: MAX_X, duration: 180, useNativeDriver: false })
          .start(() => onDismiss && onDismiss());
      } else {
        Animated.spring(thumbX, { toValue: 0, useNativeDriver: false }).start();
      }
    },
  })).current;

  const labelOpac = thumbX.interpolate({ inputRange:[0, MAX_X*0.3], outputRange:[1, 0] });

  const rippleStyle = (anim: Animated.Value) => ({
    opacity:   anim.interpolate({ inputRange:[0,0.2,1], outputRange:[0,0.10,0] }),
    transform: [{ scale: anim.interpolate({ inputRange:[0,1], outputRange:[1, 2.6] }) }],
  });

  return (
    <View style={s.root}>
      <StatusBar barStyle="dark-content" />

      <View style={s.mountain1} /><View style={s.mountain2} /><View style={s.mountain3} />
      {[0.55,0.58,0.61,0.64,0.67].map((pos,i) => (
        <View key={i} style={[s.waterLine, { top:height*pos, opacity:0.04+i*0.015, width:width*[0.7,0.85,0.95,0.85,0.7][i], alignSelf:'center' }]} />
      ))}
      <Animated.View style={[s.mist1, { transform:[{ translateY: mist1Y.interpolate({ inputRange:[0,1], outputRange:[0,-10] }) }] }]} />
      <Animated.View style={[s.mist2, { transform:[{ translateY: mist2Y.interpolate({ inputRange:[0,1], outputRange:[0,8] }) }] }]} />
      <Animated.View style={[s.mist3, { transform:[{ translateX: mist3X.interpolate({ inputRange:[0,1], outputRange:[0,16] }) }] }]} />
      <Animated.View style={[s.brushGroup, { transform:[{ translateY: brushY.interpolate({ inputRange:[0,1], outputRange:[0,-12] }) }] }]}>
        {[
          { left:width*0.08, h:80,  op:0.06 },{ left:width*0.14, h:130, op:0.09 },
          { left:width*0.19, h:60,  op:0.05 },{ left:width*0.78, h:110, op:0.07 },
          { left:width*0.84, h:70,  op:0.10 },{ left:width*0.89, h:140, op:0.06 },
          { left:width*0.93, h:50,  op:0.04 },
        ].map((b,i) => (
          <View key={i} style={{ position:'absolute', left:b.left, bottom:0, width:1.5, height:b.h, backgroundColor:'#2a2e24', opacity:b.op, borderRadius:1 }} />
        ))}
      </Animated.View>
      <View style={s.cornerCircleTL} /><View style={s.cornerCircleBR} />

      <Animated.View style={[s.content, { opacity: fadeIn }]}>

        {/* 顶部时间 */}
        <Text style={s.date}>{date}</Text>
        <Text style={s.time}>{time}</Text>

        <View style={{ height: 32 }} />

        {/* 大圆 */}
        <View style={s.stage}>
          <Animated.View style={[s.ripple, rippleStyle(ring1)]} />
          <Animated.View style={[s.ripple, rippleStyle(ring2)]} />
          <Animated.View style={[s.ripple, rippleStyle(ring3)]} />
          <Animated.View style={[s.clockOuter, { transform:[{ scale: orbScale }] }]}>
            <View style={s.clockMid}>
              <Text style={s.kanji}>醒</Text>
            </View>
          </Animated.View>
        </View>

        <View style={{ height: 28 }} />

        {/* 英文主词 */}
        <Text style={s.mainWord}>Awakening</Text>
        <Text style={s.subWord}>Begin when you are ready</Text>

        <View style={{ height: 52 }} />

        {/* 滑块 */}
        <View style={s.track} {...pan.panHandlers}>
          <Animated.Text style={[s.trackLabel, { opacity: labelOpac }]}>
            — — —  slide to begin  — — —
          </Animated.Text>
          <Animated.View style={[s.thumb, { transform:[{ translateX: thumbX }] }]}>
            <Text style={s.thumbIcon}>☽</Text>
          </Animated.View>
        </View>

      </Animated.View>
    </View>
  );
}

const INK = '#2a2e24', INK2 = '#485040', INK3 = '#7a8472', BG = '#dedad2';

const s = StyleSheet.create({
  root:            { flex:1, backgroundColor:BG },
  mountain1:       { position:'absolute', width:width*1.4, height:width*1.4, borderRadius:width*0.7,  backgroundColor:'rgba(42,46,36,0.045)', bottom:-width*0.95, left:-width*0.2 },
  mountain2:       { position:'absolute', width:width*1.1, height:width*1.1, borderRadius:width*0.55, backgroundColor:'rgba(42,46,36,0.035)', bottom:-width*0.72, left:width*0.1 },
  mountain3:       { position:'absolute', width:width*0.8, height:width*0.8, borderRadius:width*0.4,  backgroundColor:'rgba(42,46,36,0.03)',  bottom:-width*0.52, right:-width*0.05 },
  waterLine:       { position:'absolute', height:1, backgroundColor:INK },
  mist1:           { position:'absolute', width:width*1.3, height:90,  borderRadius:45, backgroundColor:'rgba(234,230,220,0.55)', bottom:height*0.28, left:-width*0.15 },
  mist2:           { position:'absolute', width:width*0.9, height:60,  borderRadius:30, backgroundColor:'rgba(234,230,220,0.40)', bottom:height*0.32, left:-width*0.05 },
  mist3:           { position:'absolute', width:width*0.7, height:44,  borderRadius:22, backgroundColor:'rgba(234,230,220,0.30)', bottom:height*0.25, right:-width*0.1 },
  brushGroup:      { position:'absolute', bottom:height*0.15, left:0, right:0, height:160 },
  cornerCircleTL:  { position:'absolute', width:120, height:120, borderRadius:60, borderWidth:1, borderColor:'rgba(42,46,36,0.07)', top:-40, left:-40 },
  cornerCircleBR:  { position:'absolute', width:80,  height:80,  borderRadius:40, borderWidth:1, borderColor:'rgba(42,46,36,0.06)', bottom:80, right:-20 },

  content:   { flex:1, alignItems:'center', justifyContent:'center', paddingHorizontal:40 },
  date:      { fontSize:11, color:INK3, letterSpacing:5, fontWeight:'300' },
  time:      { fontSize:15, color:INK2, letterSpacing:4, fontWeight:'300', marginTop:6 },

  stage:     { width:220, height:220, alignItems:'center', justifyContent:'center' },
  ripple:    { position:'absolute', width:180, height:180, borderRadius:90, borderWidth:1, borderColor:INK },
  clockOuter:{ width:180, height:180, borderRadius:90, borderWidth:1, borderColor:'rgba(42,46,36,0.16)', backgroundColor:'rgba(234,230,220,0.55)', alignItems:'center', justifyContent:'center' },
  clockMid:  { width:140, height:140, borderRadius:70, borderWidth:0.5, borderColor:'rgba(42,46,36,0.09)', alignItems:'center', justifyContent:'center' },
  kanji:     { fontSize:52, color:INK, fontWeight:'200', letterSpacing:4 },

  mainWord: { fontSize:28, color:INK2, letterSpacing:10, fontWeight:'300' },
  subWord:   { fontSize:13, color:INK2, letterSpacing:3, fontWeight:'300', marginTop:10 },

  track:     { width:'100%', height:THUMB+4, borderRadius:(THUMB+4)/2, borderWidth:1, borderColor:'rgba(42,46,36,0.18)', backgroundColor:'rgba(42,46,36,0.05)', justifyContent:'center', paddingLeft:2, overflow:'hidden' },
  trackLabel:{ position:'absolute', width:'100%', textAlign:'center', fontSize:11, color:INK2, letterSpacing:3 },
  thumb:     { width:THUMB, height:THUMB, borderRadius:THUMB/2, backgroundColor:INK, alignItems:'center', justifyContent:'center' },
  thumbIcon: { fontSize:18, color:'#e8e4da' },
});
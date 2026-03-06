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
const TRACK_W = 240;
const THUMB   = 48;
const MAX_X   = TRACK_W - THUMB - 6;

export default function ZenAlarmScreen({ onDismiss }: { onDismiss?: () => void }) {
  const [time, setTime]       = useState('06:00');
  const [dateStr, setDateStr] = useState('');

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
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(bellAnim,{toValue:1, duration:650,useNativeDriver:true}),
      Animated.timing(bellAnim,{toValue:-1,duration:650,useNativeDriver:true}),
      Animated.timing(bellAnim,{toValue:0, duration:450,useNativeDriver:true}),
      Animated.delay(2200),
    ])); loop.start(); return ()=>loop.stop();
  },[]);

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
          .start(() => onDismiss ? onDismiss() : null);
      } else {
        Animated.spring(thumbX,{toValue:0,useNativeDriver:false}).start();
      }
    },
  })).current;

  const bellRot   = bellAnim.interpolate({inputRange:[-1,0,1],outputRange:['-9deg','0deg','9deg']});
  const labelOpac = thumbX.interpolate({inputRange:[0,MAX_X*0.35],outputRange:[1,0]});
  const mistTX    = mistDrift.interpolate({inputRange:[0,1],outputRange:[0,12]});

  return (
    <View style={s.root}>
      <StatusBar barStyle="dark-content"/>
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
        <Animated.Text style={[s.bellGlyph,{transform:[{rotate:bellRot}]}]}>鐘</Animated.Text>
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
  ring:       { width:144, height:144, borderRadius:72, borderWidth:1, borderColor:'rgba(42,46,36,0.16)', alignItems:'center', justifyContent:'center', backgroundColor:'rgba(234,230,220,0.55)' },
  ringInner:  { width:118, height:118, borderRadius:59, borderWidth:0.5, borderColor:'rgba(42,46,36,0.10)', alignItems:'center', justifyContent:'center' },
  timeText:   { fontSize:38, color:INK, fontWeight:'200', letterSpacing:2 },
  dateText:   { fontSize:11, color:INK3, letterSpacing:4, fontWeight:'300' },
  bellGlyph:  { fontSize:30, color:INK2, fontWeight:'200', opacity:0.65 },
  tagline:    { fontSize:14, color:INK2, letterSpacing:5, fontWeight:'300' },
  taglineEn:  { fontSize:10, color:INK3, letterSpacing:1.5, marginTop:6, fontWeight:'300', opacity:0.7, fontStyle:'italic' },
  track:      { width:TRACK_W, height:THUMB+6, borderRadius:(THUMB+6)/2, borderWidth:1, borderColor:'rgba(42,46,36,0.14)', backgroundColor:'rgba(42,46,36,0.04)', justifyContent:'center', paddingLeft:3, overflow:'hidden' },
  trackLabel: { position:'absolute', width:'100%', textAlign:'center', fontSize:11, color:INK3, letterSpacing:2, fontWeight:'300' },
  thumb:      { width:THUMB, height:THUMB, borderRadius:THUMB/2, backgroundColor:INK, alignItems:'center', justifyContent:'center' },
  thumbIcon:  { fontSize:17, color:'#e8e4da' },
  footer:     { fontSize:11, color:INK3, letterSpacing:3, opacity:0.65 },
  footerEn:   { fontSize:10, color:INK3, letterSpacing:1.5, marginTop:4, opacity:0.45, fontStyle:'italic' },
});
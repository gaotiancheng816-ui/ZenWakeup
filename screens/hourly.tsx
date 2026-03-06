import { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions, StatusBar,
    StyleSheet,
    Text,
    View
} from 'react-native';

const { width, height } = Dimensions.get('window');

const HOUR_QUOTES = [
  { zh: '此刻即圆满',     en: 'This moment is complete' },
  { zh: '心定则万事定',   en: 'A settled mind settles all things' },
  { zh: '不急，一切皆至', en: 'No rush — all things arrive' },
  { zh: '呼吸即归处',     en: 'Breath is always home' },
  { zh: '松开，再松开',   en: 'Release, and release again' },
  { zh: '知足者富',       en: 'Those who know enough are rich' },
  { zh: '静而后能安',     en: 'Stillness brings peace' },
];

const currentQuote = HOUR_QUOTES[new Date().getHours() % HOUR_QUOTES.length];
const currentHour  = new Date().getHours();
const greeting     = currentHour < 12 ? '上午好' : currentHour < 18 ? '午后好' : '傍晚好';
const greetingEn   = currentHour < 12 ? 'Good morning' : currentHour < 18 ? 'Good afternoon' : 'Good evening';

export default function DaytimeScreen({ onEvening }: { onEvening?: () => void }) {
  const fadeIn    = useRef(new Animated.Value(0)).current;
  const breathOrb = useRef(new Animated.Value(1)).current;
  const mistAnim  = useRef(new Animated.Value(0)).current;
  const [time, setTime] = useState('');

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
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(breathOrb, { toValue:1.08, duration:4000, useNativeDriver:true }),
      Animated.timing(breathOrb, { toValue:1.0,  duration:4000, useNativeDriver:true }),
    ]));
    loop.start();
    return () => loop.stop();
  }, []);

  useEffect(() => {
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(mistAnim, { toValue:1, duration:8000, useNativeDriver:true }),
      Animated.timing(mistAnim, { toValue:0, duration:8000, useNativeDriver:true }),
    ]));
    loop.start();
    return () => loop.stop();
  }, []);

  useEffect(() => {
    const t = setInterval(() => {
      if (new Date().getHours() >= 18) {
        onEvening && onEvening();
      }
    }, 60000);
    return () => clearInterval(t);
  }, []);

  const mistX = mistAnim.interpolate({ inputRange:[0,1], outputRange:[0,10] });

  return (
    <View style={s.root}>
      <StatusBar barStyle="dark-content" />
      <Animated.View style={[s.mistBand, { transform:[{ translateX: mistX }] }]} />
      <Animated.View style={[s.center, { opacity: fadeIn }]}>
        <Text style={s.greeting}>{greeting}</Text>
        <Text style={s.greetingEn}>{greetingEn}</Text>
        <View style={{ height: 8 }} />
        <Text style={s.timeText}>{time}</Text>
        <View style={s.vertLine} />
        <Animated.View style={[s.orb, { transform:[{ scale: breathOrb }] }]}>
          <View style={s.orbInner}>
            <Text style={s.orbChar}>息</Text>
          </View>
        </Animated.View>
        <View style={{ height: 40 }} />
        <Text style={s.quoteZh}>{currentQuote.zh}</Text>
        <Text style={s.quoteEn}>{currentQuote.en}</Text>
        <View style={s.vertLine} />
        <View style={s.breathBox}>
          <Text style={s.breathTitle}>三次呼吸，回到当下</Text>
          <Text style={s.breathTitleEn}>Three breaths · Return to now</Text>
          <View style={{ height: 16 }} />
          <View style={s.breathSteps}>
            {['吸', '呼', '归'].map((ch, i) => (
              <View key={i} style={s.breathStep}>
                <View style={s.breathDot}>
                  <Text style={s.breathDotChar}>{ch}</Text>
                </View>
                <Text style={s.breathStepEn}>
                  {['Inhale','Exhale','Return'][i]}
                </Text>
              </View>
            ))}
          </View>
        </View>
        <View style={{ height: 48 }} />
        <Text style={s.hint}>整点，禅声轻触</Text>
        <Text style={s.hintEn}>A gentle bowl sounds every hour</Text>
        <View style={{ height: 8 }} />
        <Text style={s.hintSub}>无需完成，只需听见</Text>
        <Text style={s.hintSubEn}>No task — just a moment of awareness</Text>
      </Animated.View>
    </View>
  );
}

const INK = '#2a2e24', INK2 = '#485040', INK3 = '#7a8472';

const s = StyleSheet.create({
  root:          { flex:1, backgroundColor:'#dedad2', alignItems:'center', justifyContent:'center' },
  center:        { alignItems:'center', width:'100%', paddingHorizontal:36 },
  mistBand:      { position:'absolute', left:-20, right:-20, top:height*0.3, height:height*0.2, backgroundColor:'rgba(234,230,220,0.4)' },
  greeting:      { fontSize:22, color:INK, letterSpacing:6, fontWeight:'200' },
  greetingEn:    { fontSize:10, color:INK3, letterSpacing:4, marginTop:4, fontWeight:'300', opacity:0.7 },
  timeText:      { fontSize:13, color:INK3, letterSpacing:5, marginTop:6, fontWeight:'300' },
  vertLine:      { width:1, height:36, backgroundColor:'rgba(42,46,36,0.12)', marginVertical:24 },
  orb:           { width:120, height:120, borderRadius:60, borderWidth:1, borderColor:'rgba(42,46,36,0.12)', backgroundColor:'rgba(234,230,220,0.6)', alignItems:'center', justifyContent:'center' },
  orbInner:      { width:88, height:88, borderRadius:44, borderWidth:0.5, borderColor:'rgba(42,46,36,0.08)', alignItems:'center', justifyContent:'center' },
  orbChar:       { fontSize:32, color:INK2, fontWeight:'100', opacity:0.6 },
  quoteZh:       { fontSize:18, color:INK2, letterSpacing:5, fontWeight:'300', textAlign:'center' },
  quoteEn:       { fontSize:10, color:INK3, letterSpacing:1.5, marginTop:8, fontStyle:'italic', opacity:0.65, textAlign:'center' },
  breathBox:     { width:'100%', borderWidth:1, borderColor:'rgba(42,46,36,0.08)', padding:24, alignItems:'center' },
  breathTitle:   { fontSize:13, color:INK2, letterSpacing:4, fontWeight:'300' },
  breathTitleEn: { fontSize:9,  color:INK3, letterSpacing:2, marginTop:4, opacity:0.6, fontStyle:'italic' },
  breathSteps:   { flexDirection:'row', gap:32, justifyContent:'center' },
  breathStep:    { alignItems:'center', gap:8 },
  breathDot:     { width:44, height:44, borderRadius:22, borderWidth:1, borderColor:'rgba(42,46,36,0.12)', backgroundColor:'rgba(234,230,220,0.5)', alignItems:'center', justifyContent:'center' },
  breathDotChar: { fontSize:16, color:INK2, fontWeight:'200' },
  breathStepEn:  { fontSize:9, color:INK3, letterSpacing:1, opacity:0.5, fontStyle:'italic' },
  hint:          { fontSize:11, color:INK3, letterSpacing:3, opacity:0.5 },
  hintEn:        { fontSize:9,  color:INK3, letterSpacing:1, opacity:0.35, fontStyle:'italic', marginTop:3 },
  hintSub:       { fontSize:11, color:INK3, letterSpacing:3, opacity:0.4, marginTop:10 },
  hintSubEn:     { fontSize:9,  color:INK3, letterSpacing:1, opacity:0.3, fontStyle:'italic', marginTop:3 },
});
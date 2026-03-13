import * as Notifications from 'expo-notifications';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  PanResponder,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import Svg, { Circle, Line, Path } from 'react-native-svg';
import { getMorningGreeting } from '../utils/greetings';
import { loadData, saveAlarmTime } from '../utils/storage';

const { width, height } = Dimensions.get('window');
const { Sound } = require('expo-av/build/Audio');
const FileSystem = require('expo-file-system/legacy');

const INK = '#2a2e24', INK2 = '#485040', INK3 = '#7a8472', GOLD = '#8a7040', BG = '#dedad2';

const DAYS   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const TRACK_W = width - 80;
const THUMB   = 52;
const MAX_X   = TRACK_W - THUMB - 4;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// ── 山水插图 — 设置页主视觉 ──────────────────
function MountainIcon() {
  return (
    <Svg width={240} height={140} viewBox="0 0 160 95">
      {/* back-left mountain */}
      <Path d="M10,90 L32,55 L54,90Z" fill="none" stroke={INK} strokeWidth={0.6} opacity={0.22}/>
      {/* back-right mountain */}
      <Path d="M106,90 L128,60 L150,90Z" fill="none" stroke={INK} strokeWidth={0.6} opacity={0.20}/>
      {/* main mountain */}
      <Path d="M38,90 L80,18 L122,90Z" fill={BG} stroke={INK} strokeWidth={1.2} strokeLinejoin="round" opacity={0.75}/>
      {/* horizon */}
      <Line x1={10} y1={90} x2={150} y2={90} stroke={INK} strokeWidth={0.5} opacity={0.20}/>
      {/* mist lines */}
      <Line x1={10} y1={72} x2={38}  y2={72} stroke={INK} strokeWidth={0.4} opacity={0.15}/>
      <Line x1={122} y1={68} x2={150} y2={68} stroke={INK} strokeWidth={0.4} opacity={0.12}/>
      {/* sun */}
      <Circle cx={130} cy={30} r={8}   fill="none" stroke={GOLD} strokeWidth={0.9} opacity={0.65}/>
      <Circle cx={130} cy={30} r={3}   fill={GOLD} opacity={0.5}/>
      <Line x1={130} y1={18} x2={130} y2={21} stroke={GOLD} strokeWidth={0.7} opacity={0.45}/>
      <Line x1={120} y1={22} x2={122} y2={24} stroke={GOLD} strokeWidth={0.6} opacity={0.35}/>
      <Line x1={140} y1={22} x2={138} y2={24} stroke={GOLD} strokeWidth={0.6} opacity={0.35}/>
      {/* vertical ink strokes */}
      <Line x1={155} y1={10} x2={155} y2={90} stroke={INK} strokeWidth={0.8} opacity={0.05}/>
      <Line x1={152} y1={20} x2={152} y2={90} stroke={INK} strokeWidth={0.5} opacity={0.04}/>
    </Svg>
  );
}

// ── 呼吸球内山水缩略图 — 响铃页 ──────────────
function OrbMountain() {
  return (
    <Svg width={100} height={100} viewBox="0 0 100 100">
      {/* back-left */}
      <Path d="M10,68 L28,42 L46,68Z" fill="none" stroke={INK} strokeWidth={0.6} opacity={0.22}/>
      {/* back-right */}
      <Path d="M54,68 L72,46 L90,68Z" fill="none" stroke={INK} strokeWidth={0.6} opacity={0.20}/>
      {/* main mountain */}
      <Path d="M22,68 L50,18 L78,68Z" fill={BG} stroke={INK} strokeWidth={1.1} strokeLinejoin="round" opacity={0.75}/>
      {/* horizon */}
      <Line x1={10} y1={68} x2={90} y2={68} stroke={INK} strokeWidth={0.4} opacity={0.20}/>
      {/* mist */}
      <Line x1={10} y1={55} x2={28} y2={55} stroke={INK} strokeWidth={0.4} opacity={0.14}/>
      <Line x1={72} y1={52} x2={90} y2={52} stroke={INK} strokeWidth={0.4} opacity={0.12}/>
      {/* sun */}
      <Circle cx={80} cy={26} r={6}   fill="none" stroke={GOLD} strokeWidth={0.8} opacity={0.65}/>
      <Circle cx={80} cy={26} r={2.2} fill={GOLD} opacity={0.5}/>
      <Line x1={80} y1={17} x2={80} y2={19} stroke={GOLD} strokeWidth={0.6} opacity={0.45}/>
      <Line x1={74} y1={19} x2={76} y2={21} stroke={GOLD} strokeWidth={0.6} opacity={0.35}/>
      <Line x1={86} y1={19} x2={84} y2={21} stroke={GOLD} strokeWidth={0.6} opacity={0.35}/>
    </Svg>
  );
}

// ── 滑块莲花图标 ──────────────────────────────
function ThumbLotus() {
  return (
    <Svg width={32} height={32} viewBox="0 0 90 90">
      <Path d="M45 45 Q38 32 45 18 Q52 32 45 45Z" fill="none" stroke={INK} strokeWidth={0.9} opacity={0.55}/>
      <Path d="M45 45 Q32 38 18 45 Q32 52 45 45Z" fill="none" stroke={INK} strokeWidth={0.9} opacity={0.55}/>
      <Path d="M45 45 Q52 58 45 72 Q38 58 45 45Z" fill="none" stroke={INK} strokeWidth={0.9} opacity={0.55}/>
      <Path d="M45 45 Q58 52 72 45 Q58 38 45 45Z" fill="none" stroke={INK} strokeWidth={0.9} opacity={0.55}/>
      <Path d="M45 45 Q34 34 26 26 Q40 35 45 45Z" fill="none" stroke={INK} strokeWidth={0.6} opacity={0.3}/>
      <Path d="M45 45 Q56 34 64 26 Q55 40 45 45Z" fill="none" stroke={INK} strokeWidth={0.6} opacity={0.3}/>
      <Path d="M45 45 Q34 56 26 64 Q40 55 45 45Z" fill="none" stroke={INK} strokeWidth={0.6} opacity={0.3}/>
      <Path d="M45 45 Q56 56 64 64 Q55 55 45 45Z" fill="none" stroke={INK} strokeWidth={0.6} opacity={0.3}/>
      <Circle cx={45} cy={45} r={5}   fill="none" stroke={GOLD} strokeWidth={0.8} opacity={0.7}/>
      <Circle cx={45} cy={45} r={2}   fill={GOLD} opacity={0.65}/>
    </Svg>
  );
}

function generateWav(frequency: number, durationMs: number, volume: number): string {
  const sampleRate = 22050;
  const numSamples = Math.floor(sampleRate * durationMs / 1000);
  const dataSize = numSamples * 2;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);
  const write = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
  };
  write(0, 'RIFF'); view.setUint32(4, 36 + dataSize, true);
  write(8, 'WAVE'); write(12, 'fmt ');
  view.setUint32(16, 16, true); view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true); view.setUint16(32, 2, true);
  view.setUint16(34, 16, true); write(36, 'data');
  view.setUint32(40, dataSize, true);
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const env = Math.exp(-t * 1.5);
    const val = Math.sin(2 * Math.PI * frequency * t) * env * volume;
    view.setInt16(44 + i * 2, Math.round(val * 32767), true);
  }
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

export default function ZenAlarmScreen({ onDismiss }: { onDismiss?: () => void }) {
  const [alarmHour,   setAlarmHour]   = useState(6);
  const [alarmMinute, setAlarmMinute] = useState(0);
  const [date,        setDate]        = useState('');
  const [phase,       setPhase]       = useState<'set'|'ringing'>('set');
  const [greeting,    setGreeting]    = useState('');

  const soundRef = useRef<any>(null);
  const fadeIn   = useRef(new Animated.Value(0)).current;
  const orbScale = useRef(new Animated.Value(0.96)).current;
  const thumbX   = useRef(new Animated.Value(0)).current;
  const ring1    = useRef(new Animated.Value(0)).current;
  const ring2    = useRef(new Animated.Value(0)).current;
  const ring3    = useRef(new Animated.Value(0)).current;
  const mist1Y   = useRef(new Animated.Value(0)).current;
  const brushY   = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const d = new Date();
    setDate(`${DAYS[d.getDay()]}  ${d.getDate()} ${MONTHS[d.getMonth()]}`);
    loadData().then(data => {
      setAlarmHour(data.alarmHour);
      setAlarmMinute(data.alarmMinute);
      const lastRecord = [...data.records].reverse().find(r => r.eveningDone);
      const lastScore  = lastRecord?.score ?? 2;
      setGreeting(getMorningGreeting(lastScore));
    });
    Animated.parallel([
      Animated.timing(fadeIn,   { toValue: 1, duration: 2000, useNativeDriver: true }),
      Animated.spring(orbScale, { toValue: 1, useNativeDriver: true, damping: 14 }),
    ]).start();
    Animated.loop(Animated.sequence([
      Animated.timing(mist1Y, { toValue: 1, duration: 9000,  useNativeDriver: true }),
      Animated.timing(mist1Y, { toValue: 0, duration: 9000,  useNativeDriver: true }),
    ])).start();
    Animated.loop(Animated.sequence([
      Animated.timing(brushY, { toValue: 1, duration: 15000, useNativeDriver: true }),
      Animated.timing(brushY, { toValue: 0, duration: 15000, useNativeDriver: true }),
    ])).start();
    requestNotificationPermission();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      const n = new Date();
      if (n.getHours() === alarmHour && n.getMinutes() === alarmMinute) triggerAlarm();
    }, 10000);
    return () => clearInterval(timer);
  }, [alarmHour, alarmMinute]);

  async function requestNotificationPermission() {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') console.log('Notification permission denied');
  }

  async function scheduleAlarmNotification() {
    await Notifications.cancelAllScheduledNotificationsAsync();
    const now = new Date();
    const alarm = new Date();
    alarm.setHours(alarmHour, alarmMinute, 0, 0);
    if (alarm <= now) alarm.setDate(alarm.getDate() + 1);
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Awakening',
        body: 'Time to begin your morning meditation',
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: alarm,
      },
    });
  }

  async function triggerAlarm() {
    setPhase('ringing');
    startRipples();
    loopAlarmSound();
  }

  function startRipples() {
    const ripple = (anim: Animated.Value, delay: number) => {
      Animated.loop(Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, { toValue: 1, duration: 2500, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: 0,    useNativeDriver: true }),
      ])).start();
    };
    ripple(ring1, 0);
    ripple(ring2, 800);
    ripple(ring3, 1600);
  }

  async function loopAlarmSound() {
    try {
      const b64  = generateWav(528, 2000, 0.9);
      const path = FileSystem.cacheDirectory + 'alarm_tone.wav';
      await FileSystem.writeAsStringAsync(path, b64, { encoding: 'base64' });
      const { sound } = await Sound.createAsync({ uri: path }, { shouldPlay: true, volume: 1.0 });
      soundRef.current = sound;
      sound.setOnPlaybackStatusUpdate((s: any) => {
        if (s.isLoaded && s.didJustFinish) sound.replayAsync();
      });
    } catch (e) {
      console.log('alarm sound error:', e);
    }
  }

  async function stopAlarm() {
    if (soundRef.current) {
      await soundRef.current.stopAsync();
      await soundRef.current.unloadAsync();
      soundRef.current = null;
    }
  }

  const slidePan = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (_, g) => thumbX.setValue(Math.max(0, Math.min(MAX_X, g.dx))),
    onPanResponderRelease: (_, g) => {
      if (g.dx >= MAX_X * 0.65) {
        Animated.timing(thumbX, { toValue: MAX_X, duration: 180, useNativeDriver: false })
          .start(async () => {
            await stopAlarm();
            onDismiss && onDismiss();
          });
      } else {
        Animated.spring(thumbX, { toValue: 0, useNativeDriver: false }).start();
      }
    },
  })).current;

  const labelOpac = thumbX.interpolate({ inputRange: [0, MAX_X * 0.3], outputRange: [1, 0] });
  const rippleStyle = (anim: Animated.Value) => ({
    opacity:   anim.interpolate({ inputRange: [0, 0.15, 1], outputRange: [0, 0.12, 0] }),
    transform: [{ scale: anim.interpolate({ inputRange: [0, 1], outputRange: [1, 2.6] }) }],
  });

  const hh = String(alarmHour).padStart(2, '0');
  const mm = String(alarmMinute).padStart(2, '0');

  return (
    <View style={s.root}>
      <StatusBar barStyle="dark-content" />

      {/* 背景 */}
      <View style={s.mountain1} /><View style={s.mountain2} /><View style={s.mountain3} />
      {[0.38, 0.41, 0.44].map((pos, i) => (
        <View key={i} style={[s.waterLine, {
          top: height * pos, opacity: 0.04 + i * 0.015,
          width: width * [0.72, 0.85, 0.68][i], alignSelf: 'center',
        }]} />
      ))}
      <Animated.View style={[s.mist1Layer, {
        transform: [{ translateY: mist1Y.interpolate({ inputRange: [0, 1], outputRange: [0, -10] }) }]
      }]} />
      <Animated.View style={[s.brushGroup, {
        transform: [{ translateY: brushY.interpolate({ inputRange: [0, 1], outputRange: [0, -14] }) }]
      }]}>
        {[
          { left: width*0.06, h: 90,  op: 0.05 }, { left: width*0.11, h: 140, op: 0.07 },
          { left: width*0.16, h: 60,  op: 0.04 }, { left: width*0.80, h: 110, op: 0.06 },
          { left: width*0.86, h: 75,  op: 0.08 }, { left: width*0.91, h: 95,  op: 0.05 },
        ].map((b, i) => (
          <View key={i} style={{
            position: 'absolute', left: b.left, bottom: 0,
            width: 1.5, height: b.h, backgroundColor: '#1e2030',
            opacity: b.op, borderRadius: 1,
          }} />
        ))}
      </Animated.View>
      <View style={s.cornerTL} /><View style={s.cornerBR} />

      <Animated.View style={[s.content, { opacity: fadeIn }]}>
        <Text style={s.dateStr}>{date}</Text>

        {phase === 'set' ? (
          <>
            {/* 山水插图 */}
            <MountainIcon />
            <View style={{ height: 16 }} />

            {/* 时间选择器 */}
            <View style={s.timePickerRow}>
              <View style={s.pickerCol}>
                <TouchableOpacity onPress={() => setAlarmHour(h => (h+1)%24)} style={s.arrowBtn}>
                  <Text style={s.pickerArrow}>▲</Text>
                </TouchableOpacity>
                <Text style={s.pickerNum}>{hh}</Text>
                <TouchableOpacity onPress={() => setAlarmHour(h => (h-1+24)%24)} style={s.arrowBtn}>
                  <Text style={s.pickerArrow}>▼</Text>
                </TouchableOpacity>
              </View>
              <Text style={s.pickerColon}>:</Text>
              <View style={s.pickerCol}>
                <TouchableOpacity onPress={() => setAlarmMinute(m => (m+5)%60)} style={s.arrowBtn}>
                  <Text style={s.pickerArrow}>▲</Text>
                </TouchableOpacity>
                <Text style={s.pickerNum}>{mm}</Text>
                <TouchableOpacity onPress={() => setAlarmMinute(m => (m-5+60)%60)} style={s.arrowBtn}>
                  <Text style={s.pickerArrow}>▼</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={{ height: 8 }} />
            <Text style={s.mainWord}>Awakening</Text>
            <Text style={s.subWord}>{greeting || 'A new morning begins in stillness'}</Text>
            <View style={{ height: 40 }} />

            <TouchableOpacity style={s.btn} onPress={() => {
              scheduleAlarmNotification();
              saveAlarmTime(alarmHour, alarmMinute);
              triggerAlarm();
            }}>
              <Text style={s.btnText}>Set alarm  ›</Text>
            </TouchableOpacity>
            <View style={{ height: 12 }} />
            <Text style={s.hintText}>Alarm set for  {hh}:{mm}</Text>
          </>
        ) : (
          <>
            {/* 响铃：呼吸球 */}
            <View style={s.stage}>
              <Animated.View style={[s.ripple, rippleStyle(ring1)]} />
              <Animated.View style={[s.ripple, rippleStyle(ring2)]} />
              <Animated.View style={[s.ripple, rippleStyle(ring3)]} />
              <Animated.View style={[s.clockOuter, { transform: [{ scale: orbScale }] }]}>
                <View style={s.clockMid}>
                  <OrbMountain />
                </View>
              </Animated.View>
            </View>

            <View style={{ height: 20 }} />
            <Text style={s.timeDisplay}>{hh}:{mm}</Text>
            <Text style={s.mainWord}>Awakening</Text>
            <Text style={s.subWord}>{greeting || 'A new morning begins in stillness'}</Text>
            <View style={{ height: 48 }} />

            {/* 水面滑动轨道 */}
            <View style={s.trackWrap}>
              <Animated.View style={[s.trackLabel, { opacity: labelOpac }]}>
                <Text style={s.trackLabelText}>slide to wake  ›</Text>
              </Animated.View>
              <View style={s.track} {...slidePan.panHandlers}>
                {/* 轨道内水波纹 */}
                <Svg style={s.trackSvg} width={TRACK_W - THUMB} height={56} viewBox={`0 0 ${TRACK_W - THUMB} 56`}>
                  <Path
                    d={`M${THUMB} 22 Q${THUMB+30} 18 ${THUMB+60} 22 Q${THUMB+90} 26 ${THUMB+120} 22 Q${THUMB+150} 18 ${TRACK_W-THUMB} 22`}
                    fill="none" stroke={INK} strokeWidth={0.5} opacity={0.18}/>
                  <Path
                    d={`M${THUMB} 30 Q${THUMB+30} 26 ${THUMB+60} 30 Q${THUMB+90} 34 ${THUMB+120} 30 Q${THUMB+150} 26 ${TRACK_W-THUMB} 30`}
                    fill="none" stroke={INK} strokeWidth={0.4} opacity={0.12}/>
                  <Path
                    d={`M${THUMB} 38 Q${THUMB+30} 34 ${THUMB+60} 38 Q${THUMB+90} 42 ${THUMB+120} 38 Q${THUMB+150} 34 ${TRACK_W-THUMB} 38`}
                    fill="none" stroke={INK} strokeWidth={0.3} opacity={0.08}/>
                </Svg>
                {/* 莲花滑块 */}
                <Animated.View style={[s.thumb, { transform: [{ translateX: thumbX }] }]}>
                  <ThumbLotus />
                </Animated.View>
              </View>
            </View>
          </>
        )}
      </Animated.View>
    </View>
  );
}

const s = StyleSheet.create({
  root:       { flex: 1, backgroundColor: BG },
  mountain1:  { position:'absolute', width:width*1.4, height:width*1.4, borderRadius:width*0.7,  backgroundColor:'rgba(30,32,48,0.045)', top:height*0.45, left:-width*0.2 },
  mountain2:  { position:'absolute', width:width*1.1, height:width*1.1, borderRadius:width*0.55, backgroundColor:'rgba(30,32,48,0.035)', top:height*0.48, left:width*0.1 },
  mountain3:  { position:'absolute', width:width*0.8, height:width*0.8, borderRadius:width*0.4,  backgroundColor:'rgba(30,32,48,0.03)',  top:height*0.50, right:-width*0.05 },
  waterLine:  { position:'absolute', height:1, backgroundColor:'#1e2030' },
  mist1Layer: { position:'absolute', width:width*1.3, height:80, borderRadius:40, backgroundColor:'rgba(220,216,206,0.45)', top:height*0.35, left:-width*0.15 },
  brushGroup: { position:'absolute', top:height*0.28, left:0, right:0, height:170 },
  cornerTL:   { position:'absolute', width:100, height:100, borderRadius:50, borderWidth:1, borderColor:'rgba(30,32,48,0.07)', top:-30, left:-30 },
  cornerBR:   { position:'absolute', width:70,  height:70,  borderRadius:35, borderWidth:1, borderColor:'rgba(30,32,48,0.06)', top:height*0.55, right:-15 },

  content:   { flex:1, alignItems:'center', justifyContent:'center', paddingHorizontal:40 },
  dateStr:   { fontSize:25, color:INK3, letterSpacing:5, fontWeight:'300', marginBottom:16 },

  timePickerRow: { flexDirection:'row', alignItems:'center', gap:16 },
  pickerCol:     { alignItems:'center', gap:12, paddingHorizontal:16, paddingVertical:8 },
  arrowBtn:      { padding:12 },
  pickerArrow:   { fontSize:10, color:INK3, opacity:0.4 },
  pickerNum:     { fontSize:64, color:INK, fontWeight:'200', letterSpacing:4 },
  pickerColon:   { fontSize:48, color:INK2, fontWeight:'200', marginBottom:8 },

  mainWord:  { fontSize:28, color:INK2, letterSpacing:10, fontWeight:'300', marginTop:8 },
  subWord:   { fontSize:11, color:INK3, letterSpacing:3,  fontWeight:'300', marginTop:8, textAlign:'center' },
  btn:       { borderWidth:1, borderColor:'rgba(30,32,48,0.22)', paddingHorizontal:32, paddingVertical:14, borderRadius:2 },
  btnText:   { fontSize:13, color:INK2, letterSpacing:4, fontWeight:'300' },
  hintText:  { fontSize:11, color:INK3, letterSpacing:3, opacity:0.5 },

  stage:      { width:240, height:240, alignItems:'center', justifyContent:'center' },
  ripple:     { position:'absolute', width:200, height:200, borderRadius:100, borderWidth:1, borderColor:'#2a2e24' },
  clockOuter: { width:200, height:200, borderRadius:100, borderWidth:1, borderColor:'rgba(30,32,48,0.12)', backgroundColor:'rgba(220,216,206,0.6)', alignItems:'center', justifyContent:'center' },
  clockMid:   { width:155, height:155, borderRadius:78, borderWidth:0.5, borderColor:'rgba(30,32,48,0.08)', alignItems:'center', justifyContent:'center' },
  timeDisplay:{ fontSize:42, color:INK, fontWeight:'200', letterSpacing:6, marginTop:16 },

  trackWrap:      { width:TRACK_W, alignItems:'center', gap:12 },
  trackLabel:     { alignItems:'center' },
  trackLabelText: { fontSize:11, color:INK3, letterSpacing:4 },
  track:          { width:TRACK_W, height:56, borderRadius:28, borderWidth:1, borderColor:'rgba(30,32,48,0.12)', backgroundColor:'rgba(220,216,206,0.4)', justifyContent:'center', paddingHorizontal:2, overflow:'hidden' },
  trackSvg:       { position:'absolute', left:THUMB, top:0 },
  thumb:          { width:THUMB, height:THUMB, borderRadius:THUMB/2, backgroundColor:'rgba(220,216,206,0.95)', borderWidth:1, borderColor:'rgba(30,32,48,0.15)', alignItems:'center', justifyContent:'center' },
});
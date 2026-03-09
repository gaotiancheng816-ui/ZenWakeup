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
import { loadData, saveAlarmTime } from '../utils/storage';

const { width, height } = Dimensions.get('window');
const { Sound } = require('expo-av/build/Audio');
const FileSystem = require('expo-file-system/legacy');

const DAYS    = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const MONTHS  = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
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
    setDate(`${DAYS[d.getDay()]}  ·  ${d.getDate()} ${MONTHS[d.getMonth()]}`);
    loadData().then(data => {
      setAlarmHour(data.alarmHour);
      setAlarmMinute(data.alarmMinute);
    });
    Animated.parallel([
      Animated.timing(fadeIn,   { toValue:1, duration:2000, useNativeDriver:true }),
      Animated.spring(orbScale, { toValue:1, useNativeDriver:true, damping:14 }),
    ]).start();
    Animated.loop(Animated.sequence([
      Animated.timing(mist1Y, { toValue:1, duration:9000, useNativeDriver:true }),
      Animated.timing(mist1Y, { toValue:0, duration:9000, useNativeDriver:true }),
    ])).start();
    Animated.loop(Animated.sequence([
      Animated.timing(brushY, { toValue:1, duration:15000, useNativeDriver:true }),
      Animated.timing(brushY, { toValue:0, duration:15000, useNativeDriver:true }),
    ])).start();
    requestNotificationPermission();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      const n = new Date();
      if (n.getHours() === alarmHour && n.getMinutes() === alarmMinute) {
        triggerAlarm();
      }
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
        title: '醒  ·  Awakening',
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
        Animated.timing(anim, { toValue:1, duration:2500, useNativeDriver:true }),
        Animated.timing(anim, { toValue:0, duration:0,    useNativeDriver:true }),
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

  const hourPan = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (_, g) => {
      const delta = Math.round(-g.dy / 20);
      setAlarmHour(h => (h + delta + 24) % 24);
    },
  })).current;

  const minutePan = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (_, g) => {
      const delta = Math.round(-g.dy / 20);
      setAlarmMinute(m => (m + delta + 60) % 60);
    },
  })).current;

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

  const labelOpac = thumbX.interpolate({ inputRange:[0, MAX_X*0.3], outputRange:[1, 0] });
  const rippleStyle = (anim: Animated.Value) => ({
    opacity:   anim.interpolate({ inputRange:[0,0.15,1], outputRange:[0,0.12,0] }),
    transform: [{ scale: anim.interpolate({ inputRange:[0,1], outputRange:[1,2.6] }) }],
  });

  const hh = String(alarmHour).padStart(2, '0');
  const mm = String(alarmMinute).padStart(2, '0');

  return (
    <View style={s.root}>
      <StatusBar barStyle="dark-content" />
      <View style={s.mountain1} /><View style={s.mountain2} /><View style={s.mountain3} />
      {[0.38,0.41,0.44].map((pos,i) => (
        <View key={i} style={[s.waterLine, {
          top:height*pos, opacity:0.04+i*0.015,
          width:width*[0.72,0.85,0.68][i], alignSelf:'center',
        }]} />
      ))}
      <Animated.View style={[s.mist1Layer, { transform:[{ translateY: mist1Y.interpolate({ inputRange:[0,1], outputRange:[0,-10] }) }] }]} />
      <Animated.View style={[s.brushGroup, { transform:[{ translateY: brushY.interpolate({ inputRange:[0,1], outputRange:[0,-14] }) }] }]}>
        {[
          { left:width*0.06, h:90,  op:0.05 },{ left:width*0.11, h:140, op:0.07 },
          { left:width*0.16, h:60,  op:0.04 },{ left:width*0.80, h:110, op:0.06 },
          { left:width*0.86, h:75,  op:0.08 },{ left:width*0.91, h:95,  op:0.05 },
        ].map((b,i) => (
          <View key={i} style={{ position:'absolute', left:b.left, bottom:0, width:1.5, height:b.h, backgroundColor:'#1e2030', opacity:b.op, borderRadius:1 }} />
        ))}
      </Animated.View>
      <View style={s.cornerTL} /><View style={s.cornerBR} />

      <Animated.View style={[s.content, { opacity: fadeIn }]}>
        <Text style={s.dateStr}>{date}</Text>

        {phase === 'set' ? (
          <>
            <View style={s.timePickerRow}>
              <View style={s.pickerCol} {...hourPan.panHandlers}>
                <Text style={s.pickerArrow}>▲</Text>
                <Text style={s.pickerNum}>{hh}</Text>
                <Text style={s.pickerArrow}>▼</Text>
              </View>
              <Text style={s.pickerColon}>:</Text>
              <View style={s.pickerCol} {...minutePan.panHandlers}>
                <Text style={s.pickerArrow}>▲</Text>
                <Text style={s.pickerNum}>{mm}</Text>
                <Text style={s.pickerArrow}>▼</Text>
              </View>
            </View>
            <View style={{ height: 12 }} />
            <Text style={s.mainWord}>Awakening</Text>
            <Text style={s.subWord}>Drag up · down to set time</Text>
            <View style={{ height: 48 }} />
            <TouchableOpacity style={s.btn} onPress={() => {
              scheduleAlarmNotification();
              saveAlarmTime(alarmHour, alarmMinute);
              triggerAlarm();
            }}>
              <Text style={s.btnText}>Set alarm  ›</Text>
            </TouchableOpacity>
            <View style={{ height: 16 }} />
            <Text style={s.hintText}>Alarm set for  {hh}:{mm}</Text>
          </>
        ) : (
          <>
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
            <View style={{ height: 20 }} />
            <Text style={s.timeDisplay}>{hh}:{mm}</Text>
            <Text style={s.mainWord}>Awakening</Text>
            <Text style={s.subWord}>A new day begins in stillness</Text>
            <View style={{ height: 48 }} />
            <View style={s.trackWrap}>
              <Animated.View style={[s.trackLabel, { opacity: labelOpac }]}>
                <Text style={s.trackLabelText}>slide to dismiss  ›</Text>
              </Animated.View>
              <View style={s.track} {...slidePan.panHandlers}>
                <Animated.View style={[s.thumb, { transform:[{ translateX: thumbX }] }]}>
                  <Text style={s.thumbIcon}>☽</Text>
                </Animated.View>
              </View>
            </View>
          </>
        )}
      </Animated.View>
    </View>
  );
}

const INK = '#2a2e24', INK2 = '#485040', INK3 = '#7a8472', BG = '#dedad2';

const s = StyleSheet.create({
  root:       { flex:1, backgroundColor:BG },
  mountain1:  { position:'absolute', width:width*1.4, height:width*1.4, borderRadius:width*0.7,  backgroundColor:'rgba(30,32,48,0.045)', top:height*0.45, left:-width*0.2 },
  mountain2:  { position:'absolute', width:width*1.1, height:width*1.1, borderRadius:width*0.55, backgroundColor:'rgba(30,32,48,0.035)', top:height*0.48, left:width*0.1 },
  mountain3:  { position:'absolute', width:width*0.8, height:width*0.8, borderRadius:width*0.4,  backgroundColor:'rgba(30,32,48,0.03)',  top:height*0.50, right:-width*0.05 },
  waterLine:  { position:'absolute', height:1, backgroundColor:'#1e2030' },
  mist1Layer: { position:'absolute', width:width*1.3, height:80, borderRadius:40, backgroundColor:'rgba(220,216,206,0.45)', top:height*0.35, left:-width*0.15 },
  brushGroup: { position:'absolute', top:height*0.28, left:0, right:0, height:170 },
  cornerTL:   { position:'absolute', width:100, height:100, borderRadius:50, borderWidth:1, borderColor:'rgba(30,32,48,0.07)', top:-30, left:-30 },
  cornerBR:   { position:'absolute', width:70,  height:70,  borderRadius:35, borderWidth:1, borderColor:'rgba(30,32,48,0.06)', top:height*0.55, right:-15 },

  content:      { flex:1, alignItems:'center', justifyContent:'center', paddingHorizontal:40 },
  dateStr:      { fontSize:11, color:INK3, letterSpacing:5, fontWeight:'300', marginBottom:32 },

  timePickerRow: { flexDirection:'row', alignItems:'center', gap:16 },
  pickerCol:     { alignItems:'center', gap:12, paddingHorizontal:16, paddingVertical:8 },
  pickerArrow:   { fontSize:10, color:INK3, opacity:0.4 },
  pickerNum:     { fontSize:64, color:INK, fontWeight:'200', letterSpacing:4 },
  pickerColon:   { fontSize:48, color:INK2, fontWeight:'200', marginBottom:8 },

  mainWord:    { fontSize:28, color:INK2, letterSpacing:10, fontWeight:'300', marginTop:8 },
  subWord:     { fontSize:11, color:INK3, letterSpacing:3,  fontWeight:'300', marginTop:8, textAlign:'center' },
  btn:         { borderWidth:1, borderColor:'rgba(30,32,48,0.22)', paddingHorizontal:32, paddingVertical:14, borderRadius:2 },
  btnText:     { fontSize:13, color:INK2, letterSpacing:4, fontWeight:'300' },
  hintText:    { fontSize:11, color:INK3, letterSpacing:3, opacity:0.5 },

  stage:      { width:240, height:240, alignItems:'center', justifyContent:'center' },
  ripple:     { position:'absolute', width:200, height:200, borderRadius:100, borderWidth:1, borderColor:'#2a2e24' },
  clockOuter: { width:200, height:200, borderRadius:100, borderWidth:1, borderColor:'rgba(30,32,48,0.12)', backgroundColor:'rgba(220,216,206,0.6)', alignItems:'center', justifyContent:'center' },
  clockMid:   { width:155, height:155, borderRadius:78, borderWidth:0.5, borderColor:'rgba(30,32,48,0.08)', alignItems:'center', justifyContent:'center' },
  kanji:      { fontSize:52, color:INK, fontWeight:'200', letterSpacing:4 },
  timeDisplay:{ fontSize:42, color:INK, fontWeight:'200', letterSpacing:6, marginTop:16 },

  trackWrap:      { width:width-80, alignItems:'center', gap:12 },
  trackLabel:     { alignItems:'center' },
  trackLabelText: { fontSize:11, color:INK3, letterSpacing:4 },
  track:          { width:width-80, height:56, borderRadius:28, borderWidth:1, borderColor:'rgba(30,32,48,0.12)', backgroundColor:'rgba(220,216,206,0.4)', justifyContent:'center', paddingHorizontal:2 },
  thumb:          { width:THUMB, height:THUMB, borderRadius:THUMB/2, backgroundColor:'rgba(220,216,206,0.95)', borderWidth:1, borderColor:'rgba(30,32,48,0.15)', alignItems:'center', justifyContent:'center' },
  thumbIcon:      { fontSize:20, color:INK2 },
});
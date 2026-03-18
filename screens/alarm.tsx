import * as Notifications from 'expo-notifications';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  PanResponder,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import Svg, { Circle, Line, Path } from 'react-native-svg';
import { getMorningGreeting } from '../utils/greetings';
import { playAlarmBell } from '../utils/sounds';
import { loadData, saveAlarmTime } from '../utils/storage';

const { width, height } = Dimensions.get('window');
const INK = '#2a2e24', INK2 = '#485040', INK3 = '#7a8472', GOLD = '#8a7040', BG = '#dedad2';

const DAYS   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const TRACK_W = width - 80;
const THUMB   = 52;
const MAX_X   = TRACK_W - THUMB - 4;
const MIN_HOUR = 4;
const MAX_HOUR = 10;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

function MountainIcon() {
  return (
    <Svg width={width} height={width * 0.45} viewBox="0 0 160 95">
      <Path d="M10,90 L32,55 L54,90Z" fill="none" stroke={INK} strokeWidth={0.6} opacity={0.22}/>
      <Path d="M106,90 L128,60 L150,90Z" fill="none" stroke={INK} strokeWidth={0.6} opacity={0.20}/>
      <Path d="M38,90 L80,18 L122,90Z" fill={BG} stroke={INK} strokeWidth={1.2} strokeLinejoin="round" opacity={0.75}/>
      <Line x1={10} y1={90} x2={150} y2={90} stroke={INK} strokeWidth={0.5} opacity={0.20}/>
      <Line x1={10} y1={72} x2={38}  y2={72} stroke={INK} strokeWidth={0.4} opacity={0.15}/>
      <Line x1={122} y1={68} x2={150} y2={68} stroke={INK} strokeWidth={0.4} opacity={0.12}/>
      <Circle cx={130} cy={30} r={8}   fill="none" stroke={GOLD} strokeWidth={0.9} opacity={0.65}/>
      <Circle cx={130} cy={30} r={3}   fill={GOLD} opacity={0.5}/>
      <Line x1={130} y1={18} x2={130} y2={21} stroke={GOLD} strokeWidth={0.7} opacity={0.45}/>
      <Line x1={120} y1={22} x2={122} y2={24} stroke={GOLD} strokeWidth={0.6} opacity={0.35}/>
      <Line x1={140} y1={22} x2={138} y2={24} stroke={GOLD} strokeWidth={0.6} opacity={0.35}/>
      <Line x1={155} y1={10} x2={155} y2={90} stroke={INK} strokeWidth={0.8} opacity={0.05}/>
      <Line x1={152} y1={20} x2={152} y2={90} stroke={INK} strokeWidth={0.5} opacity={0.04}/>
    </Svg>
  );
}

function OrbMountain() {
  return (
    <Svg width={100} height={100} viewBox="0 0 100 100">
      <Path d="M10,68 L28,42 L46,68Z" fill="none" stroke={INK} strokeWidth={0.6} opacity={0.22}/>
      <Path d="M54,68 L72,46 L90,68Z" fill="none" stroke={INK} strokeWidth={0.6} opacity={0.20}/>
      <Path d="M22,68 L50,18 L78,68Z" fill={BG} stroke={INK} strokeWidth={1.1} strokeLinejoin="round" opacity={0.75}/>
      <Line x1={10} y1={68} x2={90} y2={68} stroke={INK} strokeWidth={0.4} opacity={0.20}/>
      <Line x1={10} y1={55} x2={28} y2={55} stroke={INK} strokeWidth={0.4} opacity={0.14}/>
      <Line x1={72} y1={52} x2={90} y2={52} stroke={INK} strokeWidth={0.4} opacity={0.12}/>
      <Circle cx={80} cy={26} r={6}   fill="none" stroke={GOLD} strokeWidth={0.8} opacity={0.65}/>
      <Circle cx={80} cy={26} r={2.2} fill={GOLD} opacity={0.5}/>
      <Line x1={80} y1={17} x2={80} y2={19} stroke={GOLD} strokeWidth={0.6} opacity={0.45}/>
      <Line x1={74} y1={19} x2={76} y2={21} stroke={GOLD} strokeWidth={0.6} opacity={0.35}/>
      <Line x1={86} y1={19} x2={84} y2={21} stroke={GOLD} strokeWidth={0.6} opacity={0.35}/>
    </Svg>
  );
}

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

export default function ZenAlarmScreen({
  onDismiss,
  onConfirmed,
}: {
  onDismiss?: () => void;
  onConfirmed?: () => void;
}) {
  const [alarmHour,   setAlarmHour]   = useState(6);
  const [alarmMinute, setAlarmMinute] = useState(0);
  const [phase,       setPhase]       = useState<'set'|'ringing'>('set');
  const [greeting,    setGreeting]    = useState('');
  const [confirmed,   setConfirmed]   = useState(false);

  const triggeredRef  = useRef(false);
  const ringingRef    = useRef(false);
  const alarmLoopRef  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fadeIn   = useRef(new Animated.Value(0)).current;
  const orbScale = useRef(new Animated.Value(0.96)).current;
  const thumbX   = useRef(new Animated.Value(0)).current;
  const ring1    = useRef(new Animated.Value(0)).current;
  const ring2    = useRef(new Animated.Value(0)).current;
  const ring3    = useRef(new Animated.Value(0)).current;
  const mist1Y   = useRef(new Animated.Value(0)).current;
  const brushY   = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadData().then(data => {
      const hour = Math.min(MAX_HOUR, Math.max(MIN_HOUR, data.alarmHour));
      setAlarmHour(hour);
      setAlarmMinute(hour >= MAX_HOUR ? 0 : data.alarmMinute);
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
    if (Platform.OS !== 'web') {
      requestNotificationPermission();

      // app 在前台时收到通知
      const sub = Notifications.addNotificationReceivedListener(() => {
        if (!triggeredRef.current) {
          triggeredRef.current = true;
          triggerAlarm();
        }
      });

      // app 在后台时用户点击通知横幅唤醒
      const subResponse = Notifications.addNotificationResponseReceivedListener(() => {
        if (!triggeredRef.current) {
          triggeredRef.current = true;
          triggerAlarm();
        }
      });

      // app 从通知冷启动时检查是否有未处理的通知
      Notifications.getLastNotificationResponseAsync().then(response => {
        if (response && !triggeredRef.current) {
          triggeredRef.current = true;
          triggerAlarm();
        }
      });

      return () => {
        sub.remove();
        subResponse.remove();
      };
    }
  }, []);

  async function requestNotificationPermission() {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') console.log('Notification permission denied');
  }

  async function scheduleAlarmNotification() {
    if (Platform.OS === 'web') return;
    await Notifications.cancelAllScheduledNotificationsAsync();
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Awakening',
        body: 'Time to begin your morning meditation',
        sound: 'alarm_bell.wav',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: alarmHour,
        minute: alarmMinute,
      },
    });
  }

  function triggerAlarm() {
    setPhase('ringing');
    startRipples();
    ringingRef.current = true;
    loopAlarmBell();
  }

  async function loopAlarmBell() {
    if (!ringingRef.current) return;
    await playAlarmBell();
    alarmLoopRef.current = setTimeout(() => {
      if (ringingRef.current) loopAlarmBell();
    }, 1500);
  }

  function stopAlarmBell() {
    ringingRef.current = false;
    if (alarmLoopRef.current) {
      clearTimeout(alarmLoopRef.current);
      alarmLoopRef.current = null;
    }
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

  const slidePan = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (_, g) => thumbX.setValue(Math.max(0, Math.min(MAX_X, g.dx))),
    onPanResponderRelease: (_, g) => {
      if (g.dx >= MAX_X * 0.65) {
        Animated.timing(thumbX, { toValue: MAX_X, duration: 180, useNativeDriver: false })
          .start(() => {
            triggeredRef.current = false;
            stopAlarmBell();
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
  const minuteLocked = alarmHour >= MAX_HOUR;

  return (
    <View style={s.root}>
      <StatusBar barStyle="dark-content" />
      <View style={s.mountain1} /><View style={s.mountain2} /><View style={s.mountain3} />
      {[0.38, 0.41, 0.44].map((pos, i) => (
        <View key={i} style={[s.waterLine, {
          top: height * pos, opacity: 0.04 + i * 0.015,
          width: width * [0.72, 0.85, 0.68][i], alignSelf: 'center',
        }]} />
      ))}
      <Animated.View style={[s.mist1Layer, {
        transform: [{ translateY: mist1Y.interpolate({ inputRange:[0,1], outputRange:[0,-10] }) }]
      }]} />
      <Animated.View style={[s.brushGroup, {
        transform: [{ translateY: brushY.interpolate({ inputRange:[0,1], outputRange:[0,-14] }) }]
      }]}>
        {[
          { left:width*0.06, h:90,  op:0.05 }, { left:width*0.11, h:140, op:0.07 },
          { left:width*0.16, h:60,  op:0.04 }, { left:width*0.80, h:110, op:0.06 },
          { left:width*0.86, h:75,  op:0.08 }, { left:width*0.91, h:95,  op:0.05 },
        ].map((b, i) => (
          <View key={i} style={{
            position:'absolute', left:b.left, bottom:0,
            width:1.5, height:b.h, backgroundColor:'#1e2030',
            opacity:b.op, borderRadius:1,
          }} />
        ))}
      </Animated.View>
      <View style={s.cornerTL} /><View style={s.cornerBR} />

      <Animated.View style={[s.content, { opacity: fadeIn }]}>

        {phase === 'set' ? (
          <>
            <MountainIcon />
            <View style={{ height: 8 }} />

            <View style={s.titleZone}>
              <Text style={s.mainWord}>Awakening</Text>
              <View style={s.hairline} />
              <Text style={s.subWord}>{greeting || 'A new morning begins in stillness'}</Text>
              <View style={{ height: 8 }} />
              <Text style={s.guideText}>
                Set the time for tomorrow's{'\n'}first morning meditation.
              </Text>
            </View>

            <View style={{ height: 16 }} />

            <View style={s.timePickerRow}>
              <View style={s.pickerCol}>
                <TouchableOpacity
                  onPress={() => {
                    setAlarmHour(h => {
                      const next = Math.min(MAX_HOUR, h + 1);
                      if (next >= MAX_HOUR) setAlarmMinute(0);
                      return next;
                    });
                    setConfirmed(false);
                  }}
                  style={[s.arrowBtn, alarmHour >= MAX_HOUR && s.arrowDisabled]}
                >
                  <Text style={s.pickerArrow}>▲</Text>
                </TouchableOpacity>
                <Text style={s.pickerNum}>{hh}</Text>
                <TouchableOpacity
                  onPress={() => {
                    setAlarmHour(h => Math.max(MIN_HOUR, h - 1));
                    setConfirmed(false);
                  }}
                  style={[s.arrowBtn, alarmHour <= MIN_HOUR && s.arrowDisabled]}
                >
                  <Text style={s.pickerArrow}>▼</Text>
                </TouchableOpacity>
              </View>
              <Text style={s.pickerColon}>:</Text>
              <View style={s.pickerCol}>
                <TouchableOpacity
                  onPress={() => {
                    if (minuteLocked) return;
                    setAlarmMinute(m => (m + 5) % 60);
                    setConfirmed(false);
                  }}
                  style={[s.arrowBtn, minuteLocked && s.arrowDisabled]}
                >
                  <Text style={s.pickerArrow}>▲</Text>
                </TouchableOpacity>
                <Text style={s.pickerNum}>{mm}</Text>
                <TouchableOpacity
                  onPress={() => {
                    if (minuteLocked) return;
                    setAlarmMinute(m => (m - 5 + 60) % 60);
                    setConfirmed(false);
                  }}
                  style={[s.arrowBtn, minuteLocked && s.arrowDisabled]}
                >
                  <Text style={s.pickerArrow}>▼</Text>
                </TouchableOpacity>
              </View>
            </View>

            <Text style={s.rangeHint}>Mindful mornings  ·  4:00 — 10:00</Text>
            <View style={{ height: 20 }} />

            <TouchableOpacity style={s.btn} onPress={() => {
              scheduleAlarmNotification();
              saveAlarmTime(alarmHour, alarmMinute);
              setConfirmed(true);
              if (onConfirmed) setTimeout(() => onConfirmed(), 1200);
            }}>
              <Text style={s.btnText}>{confirmed ? 'Alarm saved  ✓' : 'Confirm  ›'}</Text>
            </TouchableOpacity>
            <View style={{ height: 8 }} />
            <Text style={s.hintText}>
              {confirmed ? `Waking at  ${hh}:${mm}  tomorrow` : `Tomorrow's alarm set for  ${hh}:${mm}`}
            </Text>
          </>
        ) : (
          <>
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
            <View style={s.trackWrap}>
              <Animated.View style={[s.trackLabel, { opacity: labelOpac }]}>
                <Text style={s.trackLabelText}>slide to wake  ›</Text>
              </Animated.View>
              <View style={s.track} {...slidePan.panHandlers}>
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
  root:       { flex:1, backgroundColor:BG },
  mountain1:  { position:'absolute', width:width*1.4, height:width*1.4, borderRadius:width*0.7,  backgroundColor:'rgba(30,32,48,0.045)', top:height*0.45, left:-width*0.2 },
  mountain2:  { position:'absolute', width:width*1.1, height:width*1.1, borderRadius:width*0.55, backgroundColor:'rgba(30,32,48,0.035)', top:height*0.48, left:width*0.1 },
  mountain3:  { position:'absolute', width:width*0.8, height:width*0.8, borderRadius:width*0.4,  backgroundColor:'rgba(30,32,48,0.03)',  top:height*0.50, right:-width*0.05 },
  waterLine:  { position:'absolute', height:1, backgroundColor:'#1e2030' },
  mist1Layer: { position:'absolute', width:width*1.3, height:80, borderRadius:40, backgroundColor:'rgba(220,216,206,0.45)', top:height*0.35, left:-width*0.15 },
  brushGroup: { position:'absolute', top:height*0.28, left:0, right:0, height:170 },
  cornerTL:   { position:'absolute', width:100, height:100, borderRadius:50, borderWidth:1, borderColor:'rgba(30,32,48,0.07)', top:-30, left:-30 },
  cornerBR:   { position:'absolute', width:70,  height:70,  borderRadius:35, borderWidth:1, borderColor:'rgba(30,32,48,0.06)', top:height*0.55, right:-15 },

  content:   { flex:1, alignItems:'center', justifyContent:'center', paddingBottom:24 },

  titleZone: { alignItems:'center', gap:8, paddingHorizontal:40 },
  mainWord:  { fontSize:28, color:INK2, letterSpacing:10, fontWeight:'300' },
  hairline:  { width:32, height:1, backgroundColor:'rgba(42,46,36,0.22)' },
  subWord:   { fontSize:11, color:INK3, letterSpacing:3, fontWeight:'300', textAlign:'center', opacity:0.7 },
  guideText: { fontSize:12, color:INK3, letterSpacing:1.5, fontWeight:'300', textAlign:'center', lineHeight:20, opacity:0.6 },

  timePickerRow: { flexDirection:'row', alignItems:'center', gap:16 },
  pickerCol:     { alignItems:'center', gap:12, paddingHorizontal:16, paddingVertical:8 },
  arrowBtn:      { padding:12 },
  arrowDisabled: { opacity:0.15 },
  pickerArrow:   { fontSize:10, color:INK3, opacity:0.4 },
  pickerNum:     { fontSize:64, color:INK, fontWeight:'200', letterSpacing:4 },
  pickerColon:   { fontSize:48, color:INK2, fontWeight:'200', marginBottom:8 },
  rangeHint:     { fontSize:10, color:INK3, letterSpacing:2, opacity:0.35, marginTop:4 },

  btn:      { borderWidth:1, borderColor:'rgba(30,32,48,0.22)', paddingHorizontal:32, paddingVertical:14, borderRadius:2 },
  btnText:  { fontSize:13, color:INK2, letterSpacing:4, fontWeight:'300' },
  hintText: { fontSize:11, color:INK3, letterSpacing:3, opacity:0.5 },

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
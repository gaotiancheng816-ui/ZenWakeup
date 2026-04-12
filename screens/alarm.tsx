import notifee, { EventType } from '@notifee/react-native';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  PanResponder,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { TapButton } from '../components/tap-button';
import Svg, { Circle, Defs, Line, LinearGradient, Path, Rect, Stop } from 'react-native-svg';
import { AppTheme } from '../constants/app-themes';
import { useTheme } from '../utils/theme-context';
import { getMorningGreeting } from '../utils/greetings';
import { playAlarmBell } from '../utils/sounds';
import { scheduleAlarm } from '../utils/alarm';
import { getTodayRecord, loadData, saveAlarmTime, updateTodayRecord } from '../utils/storage';

const { width, height } = Dimensions.get('window');

const DAYS   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

// 侘寂: mountain scene height
const WABI_MTN_H = height * 0.36;

// 侘寂: filled mountain + pebbles + horizon
function WabiSabiMountainScene({ INK }: { INK: string }) {
  const W = width;
  const H = WABI_MTN_H;
  // scale helper from design coords (320 × 250)
  const x = (v: number) => (v / 320) * W;
  const y = (v: number) => (v / 250) * H;
  const horizon = y(215);
  return (
    <Svg width={W} height={H} style={{ position: 'absolute', top: 0, left: 0 }} pointerEvents="none">
      <Defs>
        <LinearGradient id="wabiMist" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={INK} stopOpacity="0"/>
          <Stop offset="1" stopColor="#c8c0b0" stopOpacity="1"/>
        </LinearGradient>
      </Defs>
      {/* pebble left */}
      <Path d={`M${x(55)} ${y(95)} C${x(46)} ${y(82)} ${x(50)} ${y(63)} ${x(65)} ${y(58)} C${x(80)} ${y(53)} ${x(98)} ${y(62)} ${x(100)} ${y(79)} C${x(102)} ${y(96)} ${x(91)} ${y(110)} ${x(74)} ${y(111)} C${x(57)} ${y(112)} ${x(64)} ${y(108)} ${x(55)} ${y(95)}Z`}
        fill="#b0a898" opacity={0.55}/>
      {/* pebble right */}
      <Path d={`M${x(258)} ${y(72)} C${x(253)} ${y(61)} ${x(257)} ${y(48)} ${x(268)} ${y(46)} C${x(279)} ${y(44)} ${x(288)} ${y(53)} ${x(286)} ${y(66)} C${x(284)} ${y(79)} ${x(275)} ${y(86)} ${x(265)} ${y(83)} C${x(256)} ${y(81)} ${x(263)} ${y(83)} ${x(258)} ${y(72)}Z`}
        fill="#b8b0a0" opacity={0.45}/>
      {/* back hill left */}
      <Path d={`M${x(-20)} ${y(248)} C${x(8)} ${y(228)} ${x(30)} ${y(206)} ${x(54)} ${y(188)} C${x(70)} ${y(176)} ${x(80)} ${y(172)} ${x(86)} ${y(176)} C${x(94)} ${y(182)} ${x(100)} ${y(196)} ${x(108)} ${y(214)} C${x(116)} ${y(232)} ${x(122)} ${y(244)} ${x(126)} ${y(252)} L${x(-20)} ${y(252)}Z`}
        fill="#9a9282" opacity={0.38}/>
      {/* back hill right */}
      <Path d={`M${x(218)} ${y(248)} C${x(234)} ${y(232)} ${x(248)} ${y(214)} ${x(260)} ${y(200)} C${x(268)} ${y(192)} ${x(274)} ${y(188)} ${x(278)} ${y(192)} C${x(284)} ${y(198)} ${x(288)} ${y(212)} ${x(292)} ${y(228)} C${x(296)} ${y(242)} ${x(298)} ${y(250)} ${x(300)} ${y(254)} L${x(218)} ${y(254)}Z`}
        fill="#a0988a" opacity={0.32}/>
      {/* main mountain — filled */}
      <Path d={`M${x(42)} ${y(250)} C${x(54)} ${y(234)} ${x(70)} ${y(214)} ${x(86)} ${y(194)} C${x(100)} ${y(176)} ${x(114)} ${y(160)} ${x(126)} ${y(146)} C${x(136)} ${y(134)} ${x(144)} ${y(124)} ${x(152)} ${y(118)} C${x(156)} ${y(115)} ${x(160)} ${y(114)} ${x(164)} ${y(118)} C${x(172)} ${y(126)} ${x(182)} ${y(140)} ${x(194)} ${y(158)} C${x(208)} ${y(180)} ${x(222)} ${y(200)} ${x(234)} ${y(220)} C${x(242)} ${y(234)} ${x(248)} ${y(244)} ${x(252)} ${y(250)} L${x(42)} ${y(250)}Z`}
        fill="#8a8272"/>
      {/* inner shadow — left face volume */}
      <Path d={`M${x(160)} ${y(118)} C${x(154)} ${y(140)} ${x(144)} ${y(166)} ${x(132)} ${y(194)} C${x(122)} ${y(216)} ${x(110)} ${y(234)} ${x(100)} ${y(248)} L${x(160)} ${y(248)}Z`}
        fill="#7a7262" opacity={0.28}/>
      {/* erosion cracks */}
      <Path d={`M${x(146)} ${y(180)} Q${x(156)} ${y(170)} ${x(150)} ${y(160)}`} fill="none" stroke="#6a6252" strokeWidth={0.8} opacity={0.6}/>
      <Path d={`M${x(168)} ${y(196)} Q${x(177)} ${y(185)} ${x(172)} ${y(176)}`} fill="none" stroke="#6a6252" strokeWidth={0.7} opacity={0.5}/>
      <Path d={`M${x(192)} ${y(218)} Q${x(198)} ${y(208)} ${x(195)} ${y(200)}`} fill="none" stroke="#6a6252" strokeWidth={0.6} opacity={0.4}/>
      {/* pitting */}
      <Circle cx={x(156)} cy={y(200)} r={1.4} fill="#6a6252" opacity={0.55}/>
      <Circle cx={x(178)} cy={y(186)} r={1.1} fill="#6a6252" opacity={0.45}/>
      <Circle cx={x(136)} cy={y(214)} r={0.9} fill="#6a6252" opacity={0.40}/>
      <Circle cx={x(202)} cy={y(228)} r={1.0} fill="#6a6252" opacity={0.35}/>
      {/* horizon line */}
      <Line x1={0} y1={horizon} x2={W} y2={horizon} stroke="#8a8272" strokeWidth={0.6} opacity={0.5}/>
      {/* mist fade at base */}
      <Rect x={0} y={horizon - 18} width={W} height={H - (horizon - 18)} fill="url(#wabiMist)"/>
    </Svg>
  );
}

// 侘寂: deterministic noise texture (golden-ratio sequence, no Math.random)
const NOISE_PTS = Array.from({ length: 80 }, (_, i) => ({
  nx: (i * 0.618034) % 1,
  ny: (i * 0.381966) % 1,
  op: 0.010 + (i % 8) * 0.003,
  r:  0.6 + (i % 4) * 0.3,
}));

// 侘寂: hand-drawn wobbly border
function IrregularRect({ w, h, color }: { w: number; h: number; color: string }) {
  const s = (n: number, a: number) => Math.sin(n * 2.61803) * a;
  const d = [
    `M${4+s(1,1.2)} ${1+s(2,.8)}`,
    `Q${w*.28+s(3,2)} ${s(4,1.5)} ${w*.52+s(5,1)} ${1+s(6,.8)}`,
    `Q${w*.76+s(7,2)} ${s(8,1.5)} ${w-3+s(9,1)} ${1+s(10,.8)}`,
    `Q${w+1+s(11,.8)} ${h*.38+s(12,2)} ${w-1+s(13,.8)} ${h*.68+s(14,1.5)}`,
    `Q${w+1+s(15,.8)} ${h-3+s(16,2)} ${w-3+s(17,1)} ${h-1+s(18,.8)}`,
    `Q${w*.68+s(19,2)} ${h+1+s(20,1.5)} ${w*.38+s(21,1)} ${h-1+s(22,.8)}`,
    `Q${w*.2+s(23,2)} ${h+1+s(24,1.5)} ${3+s(25,1)} ${h-1+s(26,.8)}`,
    `Q${-1+s(27,.8)} ${h*.62+s(28,2)} ${1+s(29,.8)} ${h*.32+s(30,1.5)}`,
    `Q${-1+s(31,.8)} ${h*.14+s(32,2)} ${4+s(33,1.2)} ${1+s(34,.8)}Z`,
  ].join(' ');
  return (
    <Svg width={w+4} height={h+4} style={{ position:'absolute', top:-2, left:-2 }} pointerEvents="none">
      <Path d={d} fill="none" stroke={color} strokeWidth={0.9} opacity={0.45}/>
    </Svg>
  );
}
const TRACK_W = width - 80;
const THUMB   = 52;
const MAX_X   = TRACK_W - THUMB - 4;
const MIN_HOUR = 4;
const MAX_HOUR = 10;

// (notifee handles display behaviour via the channel config — no global handler needed)

function MountainIcon({ INK, GOLD, BG }: { INK: string; GOLD: string; BG: string }) {
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

function OrbMountain({ INK, GOLD, BG }: { INK: string; GOLD: string; BG: string }) {
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

function ThumbLotus({ INK, GOLD }: { INK: string; GOLD: string }) {
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
  const { theme: T } = useTheme();
  const INK = T.ink, INK2 = T.ink2, INK3 = T.ink3, GOLD = T.gold, BG = T.bg;
  const s = makeStyles(T);
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
    loadData().then(async data => {
      const hour = Math.min(MAX_HOUR, Math.max(MIN_HOUR, data.alarmHour));
      setAlarmHour(hour);
      setAlarmMinute(hour >= MAX_HOUR ? 0 : data.alarmMinute);
      const lastRecord = [...data.records].reverse().find(r => r.eveningDone);
      const lastScore  = lastRecord?.score ?? 2;
      setGreeting(getMorningGreeting(lastScore));
      // 今天已经唤醒过了 → 屏蔽所有通知触发，避免重新进入闹铃响铃界面
      const today = getTodayRecord(data);
      if (today.morningDone) triggeredRef.current = true;

      // Cold-start: app was launched via fullScreenAction (lock-screen alarm).
      // getInitialNotification() returns the notification that opened the app,
      // but only once — subsequent calls return null (notifee clears it).
      if (Platform.OS !== 'web') {
        const initial = await notifee.getInitialNotification();
        if (initial && !triggeredRef.current) {
          triggeredRef.current = true;
          triggerAlarm();
        }
      }
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
      // Foreground: alarm fires while app is already open on this screen.
      // EventType.DELIVERED fires when a notification arrives in the foreground.
      const unsubFg = notifee.onForegroundEvent(({ type }) => {
        if (type === EventType.DELIVERED && !triggeredRef.current) {
          triggeredRef.current = true;
          triggerAlarm();
        }
      });
      return () => unsubFg();
    }
  }, []);

  async function scheduleAlarmNotification() {
    await scheduleAlarm(alarmHour, alarmMinute);
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
            // 保持 triggeredRef.current = true，防止组件重挂后再次触发铃声
            stopAlarmBell();
            updateTodayRecord({ morningDone: true }); // 记录今日已唤醒
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
      {/* 侘寂: filled mountain scene replaces abstract blobs */}
      {T.mountain === 'weathered'
        ? <WabiSabiMountainScene INK={INK} />
        : <><View style={s.mountain1} /><View style={s.mountain2} /><View style={s.mountain3} /></>
      }
      {T.mountain !== 'weathered' && [0.38, 0.41, 0.44].map((pos, i) => (
        <View key={i} style={[s.waterLine, {
          top: height * pos, opacity: 0.04 + i * 0.015,
          width: width * [0.72, 0.85, 0.68][i], alignSelf: 'center',
        }]} />
      ))}
      {T.mountain !== 'weathered' && (
        <Animated.View style={[s.mist1Layer, {
          transform: [{ translateY: mist1Y.interpolate({ inputRange:[0,1], outputRange:[0,-10] }) }]
        }]} />
      )}
      {T.mountain !== 'weathered' && (
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
              width:1.5, height:b.h, backgroundColor: INK,
              opacity:b.op, borderRadius:1,
            }} />
          ))}
        </Animated.View>
      )}
      {T.mountain !== 'weathered' && <><View style={s.cornerTL} /><View style={s.cornerBR} /></>}

      {/* 水墨: 墨晕渗染 + 大字背景 + 印章 */}
      {T.mountain === 'brushstroke' && <View style={s.inkBleed} />}
      {T.mountain === 'brushstroke' && (
        <Text style={s.bgChar} pointerEvents="none">{T.seal ?? '禅'}</Text>
      )}
      {T.mountain === 'brushstroke' && T.seal && (
        <View style={s.sealCorner}><Text style={s.sealCornerText}>{T.seal}</Text></View>
      )}

      {/* 侘寂: 和纸噪点 (SVG, 单个元素) */}
      {T.mountain === 'weathered' && (
        <Svg width={width} height={height} style={{ position:'absolute', top:0, left:0 }} pointerEvents="none">
          {NOISE_PTS.map((p, i) => (
            <Circle key={i} cx={p.nx*width} cy={p.ny*height} r={p.r} fill={INK} opacity={p.op}/>
          ))}
        </Svg>
      )}

      <Animated.View style={[s.content, { opacity: fadeIn }]}>

        {phase === 'set' ? (
          <>
            {T.mountain !== 'weathered' && <MountainIcon INK={INK} GOLD={GOLD} BG={BG} />}
            {T.mountain !== 'weathered' && <View style={{ height: 8 }} />}

            <View style={s.titleZone}>
              {/* 水墨: 竖排中文副标 */}
              {T.mountain === 'brushstroke' && (
                <Text style={s.inkSubLabel}>觉  醒</Text>
              )}
              <Text style={s.mainWord}>Awakening</Text>
              <View style={s.hairline} />
              {/* 侘寂: 哲学词对 */}
              {T.mountain === 'weathered' ? (
                <>
                  <Text style={s.wabiConcept}>impermanence</Text>
                  <Text style={s.wabiConceptJp}>もののあわれ</Text>
                </>
              ) : (
                <Text style={s.subWord}>{greeting || 'A new morning begins in stillness'}</Text>
              )}
              {/* 水墨: 笔触粗细不均横线 */}
              {T.mountain === 'brushstroke' && (
                <View style={s.brushAccent}>
                  <View style={[s.brushLine, { width:100, opacity:0.55, height:1.8 }]}/>
                  <View style={[s.brushLine, { width:62,  opacity:0.32, height:1.2, marginTop:5 }]}/>
                  <View style={[s.brushLine, { width:140, opacity:0.16, height:0.8, marginTop:4 }]}/>
                </View>
              )}
              <View style={{ height: 8 }} />
              <Text style={s.guideText}>
                Set the time for tomorrow's{'\n'}first morning meditation.
              </Text>
            </View>

            <View style={{ height: 16 }} />

            <View style={s.timePickerRow}>
              <View style={s.pickerCol}>
                <TapButton
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
                </TapButton>
                <Text style={s.pickerNum}>{hh}</Text>
                <TapButton
                  onPress={() => {
                    setAlarmHour(h => Math.max(MIN_HOUR, h - 1));
                    setConfirmed(false);
                  }}
                  style={[s.arrowBtn, alarmHour <= MIN_HOUR && s.arrowDisabled]}
                >
                  <Text style={s.pickerArrow}>▼</Text>
                </TapButton>
              </View>
              <Text style={s.pickerColon}>:</Text>
              <View style={s.pickerCol}>
                <TapButton
                  onPress={() => {
                    if (minuteLocked) return;
                    setAlarmMinute(m => (m + 5) % 60);
                    setConfirmed(false);
                  }}
                  style={[s.arrowBtn, minuteLocked && s.arrowDisabled]}
                >
                  <Text style={s.pickerArrow}>▲</Text>
                </TapButton>
                <Text style={s.pickerNum}>{mm}</Text>
                <TapButton
                  onPress={() => {
                    if (minuteLocked) return;
                    setAlarmMinute(m => (m - 5 + 60) % 60);
                    setConfirmed(false);
                  }}
                  style={[s.arrowBtn, minuteLocked && s.arrowDisabled]}
                >
                  <Text style={s.pickerArrow}>▼</Text>
                </TapButton>
              </View>
            </View>

            <Text style={s.rangeHint}>Mindful mornings  ·  4:00 — 10:00</Text>
            <View style={{ height: 20 }} />

            <TapButton
              style={[s.btn, T.mountain === 'weathered' && s.btnWabi]}
              onPress={() => {
                scheduleAlarmNotification();
                saveAlarmTime(alarmHour, alarmMinute);
                setConfirmed(true);
                if (onConfirmed) setTimeout(() => onConfirmed(), 1200);
              }}
            >
              {T.mountain === 'weathered' && (
                <IrregularRect w={176} h={48} color={INK} />
              )}
              <Text style={s.btnText}>{confirmed ? 'Alarm saved  ✓' : 'Confirm  ›'}</Text>
            </TapButton>
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
                  <OrbMountain INK={INK} GOLD={GOLD} BG={BG} />
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
                  <ThumbLotus INK={INK} GOLD={GOLD} />
                </Animated.View>
              </View>
            </View>
          </>
        )}
      </Animated.View>
    </View>
  );
}

function makeStyles(T: AppTheme) {
  const INK = T.ink, INK2 = T.ink2, INK3 = T.ink3, BG = T.bg;
  return StyleSheet.create({
    root:       { flex:1, backgroundColor:BG },
    mountain1:  { position:'absolute', width:width*1.4, height:width*1.4, borderRadius:width*0.7,  backgroundColor:`${INK}0b`, top:height*0.45, left:-width*0.2 },
    mountain2:  { position:'absolute', width:width*1.1, height:width*1.1, borderRadius:width*0.55, backgroundColor:`${INK}09`, top:height*0.48, left:width*0.1 },
    mountain3:  { position:'absolute', width:width*0.8, height:width*0.8, borderRadius:width*0.4,  backgroundColor:`${INK}07`, top:height*0.50, right:-width*0.05 },
    waterLine:  { position:'absolute', height:1, backgroundColor: INK },
    mist1Layer: { position:'absolute', width:width*1.3, height:80, borderRadius:40, backgroundColor: T.bgMist, top:height*0.35, left:-width*0.15 },
    brushGroup: { position:'absolute', top:height*0.28, left:0, right:0, height:170 },
    cornerTL:   { position:'absolute', width:100, height:100, borderRadius:50, borderWidth:1, borderColor:`${INK}12`, top:-30, left:-30 },
    cornerBR:   { position:'absolute', width:70,  height:70,  borderRadius:35, borderWidth:1, borderColor:`${INK}0f`, top:height*0.55, right:-15 },

    content:   { flex:1, alignItems: T.mountain === 'brushstroke' ? 'flex-start' : 'center', justifyContent: T.mountain === 'weathered' ? 'flex-start' : 'center', paddingTop: T.mountain === 'weathered' ? WABI_MTN_H + 8 : 0, paddingBottom:24, paddingHorizontal: T.mountain === 'brushstroke' ? 40 : 0 },

    // 水墨专属
    inkBleed:      { position:'absolute', width:width*0.75, height:width*0.75, borderRadius:width*0.375, backgroundColor:INK, opacity:0.055, top:-width*0.32, left:-width*0.28 },
    bgChar:        { position:'absolute', fontSize:260, color:INK, opacity:0.038, fontWeight:'700', top:height*0.08, right:-16, includeFontPadding:false },
    sealCorner:    { position:'absolute', top:58, right:28, width:38, height:38, backgroundColor:T.gold, alignItems:'center', justifyContent:'center' },
    sealCornerText:{ color:'#fff8f0', fontSize:17, fontWeight:'500' },
    inkSubLabel:   { fontSize:11, color:T.gold, letterSpacing:8, fontWeight:'300', marginBottom:8, opacity:0.85 },
    brushAccent:   { marginTop:10 },
    brushLine:     { backgroundColor:T.gold, borderRadius:1 },

    // 侘寂专属
    noiseLayer:      { position:'absolute', top:0, left:0, width, height },
    btnWabi:         { borderWidth:0, overflow:'visible' },
    wabiConcept:     { fontSize:22, color:INK2, fontStyle:'italic', letterSpacing:1, fontFamily:undefined },
    wabiConceptJp:   { fontSize:11, color:INK3, letterSpacing:6, fontWeight:'300', marginTop:2 },

    titleZone: { alignItems: T.mountain === 'brushstroke' ? 'flex-start' : 'center', gap:10 },
    mainWord:  { fontSize:28, color:INK2, letterSpacing: T.mountain === 'brushstroke' ? 4 : 7, fontWeight: T.mountain === 'brushstroke' ? '400' : '300' },
    hairline:  { width:32, height:1, backgroundColor:`${INK}38` },
    subWord:   { fontSize:13, color:INK3, letterSpacing:2, fontWeight:'300', textAlign: T.mountain === 'brushstroke' ? 'left' : 'center', opacity:0.78 },
    guideText: { fontSize:13, color:INK3, letterSpacing:1, fontWeight:'300', textAlign: T.mountain === 'brushstroke' ? 'left' : 'center', lineHeight:22, opacity:0.72 },

    timePickerRow: { flexDirection:'row', alignItems:'center', gap:16 },
    pickerCol:     { alignItems:'center', gap:12, paddingHorizontal:16, paddingVertical:8 },
    arrowBtn:      { padding:12 },
    arrowDisabled: { opacity:0.15 },
    pickerArrow:   { fontSize:10, color:INK3, opacity:0.4 },
    pickerNum:     { fontSize:64, color:INK, fontWeight:'200', letterSpacing:4 },
    pickerColon:   { fontSize:48, color:INK2, fontWeight:'200', marginBottom:8 },
    rangeHint:     { fontSize:10, color:INK3, letterSpacing:2, opacity:0.35, marginTop:4 },

    btn:      { borderWidth:1, borderColor:`${INK}38`, paddingHorizontal:32, paddingVertical:14, borderRadius: T.radiusBtn },
    btnText:  { fontSize:13, color:INK2, letterSpacing:3, fontWeight:'400' },
    hintText: { fontSize:12, color:INK3, letterSpacing:2, opacity:0.6 },

    stage:      { width:240, height:240, alignItems:'center', justifyContent:'center' },
    ripple:     { position:'absolute', width:200, height:200, borderRadius:100, borderWidth:1, borderColor: INK },
    clockOuter: { width:200, height:200, borderRadius:100, borderWidth:1, borderColor:`${INK}1f`, backgroundColor: T.bgCard, alignItems:'center', justifyContent:'center' },
    clockMid:   { width:155, height:155, borderRadius:78, borderWidth:0.5, borderColor:`${INK}14`, alignItems:'center', justifyContent:'center' },
    timeDisplay:{ fontSize:42, color:INK, fontWeight:'200', letterSpacing:6, marginTop:16 },

    trackWrap:      { width:TRACK_W, alignItems:'center', gap:12 },
    trackLabel:     { alignItems:'center' },
    trackLabelText: { fontSize:11, color:INK3, letterSpacing:4 },
    track:          { width:TRACK_W, height:56, borderRadius:28, borderWidth:1, borderColor:`${INK}1f`, backgroundColor: T.bgMist, justifyContent:'center', paddingHorizontal:2, overflow:'hidden' },
    trackSvg:       { position:'absolute', left:THUMB, top:0 },
    thumb:          { width:THUMB, height:THUMB, borderRadius:THUMB/2, backgroundColor: T.bgCard, borderWidth:1, borderColor:`${INK}26`, alignItems:'center', justifyContent:'center' },
  });
}
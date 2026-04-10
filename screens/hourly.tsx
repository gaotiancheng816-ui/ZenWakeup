import * as Notifications from 'expo-notifications';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions, Platform, StatusBar,
  StyleSheet,
  Text,
  View
} from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { AppTheme } from '../constants/app-themes';
import { useTheme } from '../utils/theme-context';
import { getHourlyQuote } from '../utils/greetings';
import { playZenBowl } from '../utils/sounds';
import { loadData } from '../utils/storage';

const { width, height } = Dimensions.get('window');

const HOURS = [
  'Good morning','Good morning','Good morning','Good morning',
  'Good morning','Good morning','Good morning','Good morning',
  'Good morning','Good morning','Good morning','Good morning',
  'Good afternoon','Good afternoon','Good afternoon','Good afternoon',
  'Good afternoon','Good afternoon','Good evening','Good evening',
  'Good evening','Good evening','Good evening','Good evening',
];

function RippleIcon({ INK, GOLD }: { INK: string; GOLD: string }) {
  return (
    <Svg width={200} height={200} viewBox="0 0 200 200">
      <Circle cx={100} cy={100} r={90} fill="none" stroke={INK} strokeWidth={0.4} opacity={0.07}/>
      <Circle cx={100} cy={100} r={70} fill="none" stroke={INK} strokeWidth={0.5} opacity={0.11}/>
      <Circle cx={100} cy={100} r={50} fill="none" stroke={INK} strokeWidth={0.7} opacity={0.18}/>
      <Circle cx={100} cy={100} r={30} fill="none" stroke={INK} strokeWidth={0.9} opacity={0.26}/>
      <Circle cx={100} cy={100} r={13} fill="none" stroke={INK} strokeWidth={1.1} opacity={0.32}/>
      <Circle cx={100} cy={100} r={4}  fill={GOLD} opacity={0.65}/>
      <Circle cx={100} cy={100} r={1.6} fill={GOLD} opacity={0.9}/>
    </Svg>
  );
}

export default function DaytimeScreen({ onEvening }: { onEvening?: () => void }) {
  const { theme: T } = useTheme();
  const INK = T.ink, INK2 = T.ink2, INK3 = T.ink3, GOLD = T.gold, BG = T.bg;
  const s = makeStyles(T);
  const [time,        setTime]        = useState('');
  const [greeting,    setGreeting]    = useState('');
  const [quote,       setQuote]       = useState('');
  const [hoursLeft,   setHoursLeft]   = useState<number | null>(null);

  const fadeIn        = useRef(new Animated.Value(0)).current;
  const rippleS       = useRef(new Animated.Value(1)).current;
  const mist1         = useRef(new Animated.Value(0)).current;
  const mist2         = useRef(new Animated.Value(0)).current;
  const brushY        = useRef(new Animated.Value(0)).current;
  const hourlyNotifIds = useRef<string[]>([]);

  useEffect(() => {
    loadData().then(data => {
      const lastRecord = [...data.records].reverse().find(r => r.eveningDone);
      const lastScore  = lastRecord?.score ?? 2;
      setQuote(getHourlyQuote(lastScore));
    });

    const upd = () => {
      const n = new Date();
      setTime(`${String(n.getHours()).padStart(2,'0')} : ${String(n.getMinutes()).padStart(2,'0')}`);
      setGreeting(HOURS[n.getHours()]);

      // 计算距离18点还有多少小时
      const EVENING_HOUR = 18;
      const currentHour = n.getHours();
      const currentMin  = n.getMinutes();

      if (currentHour >= EVENING_HOUR) {
        // 已过18点，自动跳转
        onEvening && onEvening();
      } else {
        const diff = (EVENING_HOUR - currentHour - 1) * 60 + (60 - currentMin);
        setHoursLeft(Math.ceil(diff / 60));
      }
    };

    upd();
    const t = setInterval(upd, 30000); // 每30秒检查一次
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

  // 前台准点：app 可见时直接播音效
  useEffect(() => {
    const t = setInterval(() => {
      if (new Date().getMinutes() === 0) playZenBowl();
    }, 60000);
    return () => clearInterval(t);
  }, []);

  // 后台准点：调度系统通知，app 不在前台时也能响
  useEffect(() => {
    scheduleHourlyBells();
    return () => {
      hourlyNotifIds.current.forEach(id =>
        Notifications.cancelScheduledNotificationAsync(id).catch(() => {})
      );
    };
  }, []);

  async function scheduleHourlyBells() {
    // 先清除上次遗留的整点通知
    hourlyNotifIds.current.forEach(id =>
      Notifications.cancelScheduledNotificationAsync(id).catch(() => {})
    );
    hourlyNotifIds.current = [];

    const EVENING_HOUR = 18;
    const now = new Date();
    const ids: string[] = [];

    for (let h = now.getHours() + 1; h < EVENING_HOUR; h++) {
      const trigger = new Date();
      trigger.setHours(h, 0, 0, 0);
      if (trigger <= now) continue;

      try {
        const id = await Notifications.scheduleNotificationAsync({
          content: {
            title: '·',
            body: 'A moment of quiet',
            sound: 'alarm_bell.wav',
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: trigger,
            ...(Platform.OS === 'android' ? { channelId: 'zen-alarm' } : {}),
          },
        });
        ids.push(id);
      } catch (e) {
        // 通知权限未授予时静默失败
      }
    }
    hourlyNotifIds.current = ids;
  }

  return (
    <View style={s.root}>
      <StatusBar barStyle="dark-content" />

      {T.mountain !== 'weathered' && (
        <><View style={s.mountain1} /><View style={s.mountain2} /><View style={s.mountain3} /></>
      )}
      {T.mountain !== 'weathered' && [0.58, 0.61, 0.64].map((pos, i) => (
        <View key={i} style={[s.waterLine, {
          top: height*pos, opacity: 0.04+i*0.02,
          width: width*[0.75,0.88,0.7][i], alignSelf: 'center',
        }]} />
      ))}
      {T.mountain !== 'weathered' && (
        <Animated.View style={[s.mist1Layer, {
          transform: [{ translateY: mist1.interpolate({ inputRange:[0,1], outputRange:[0,-10] }) }]
        }]} />
      )}
      {T.mountain !== 'weathered' && (
        <Animated.View style={[s.mist2Layer, {
          transform: [{ translateX: mist2.interpolate({ inputRange:[0,1], outputRange:[0,14] }) }]
        }]} />
      )}
      {T.mountain !== 'weathered' && (
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
              width:1.5, height:b.h, backgroundColor: INK,
              opacity:b.op, borderRadius:1,
            }} />
          ))}
        </Animated.View>
      )}
      {T.mountain !== 'weathered' && <><View style={s.cornerTL} /><View style={s.cornerBR} /></>}
      {/* 水墨: 墨晕渗染 + 大字背景 + 印章 */}
      {T.mountain === 'brushstroke' && <View style={s.inkBleed} />}
      {T.mountain === 'brushstroke' && <Text style={s.bgChar} pointerEvents="none">观</Text>}
      {T.mountain === 'brushstroke' && T.seal && (
        <View style={s.sealCorner}><Text style={s.sealCornerText}>{T.seal}</Text></View>
      )}

      <Animated.View style={[s.content, { opacity: fadeIn }]}>

        <View style={s.topSection}>
          <Text style={s.greeting}>{greeting}</Text>
          <Text style={s.time}>{time}</Text>
        </View>

        <View style={s.midSection}>
          <Animated.View style={{ transform: [{ scale: rippleS }] }}>
            <RippleIcon INK={INK} GOLD={GOLD} />
          </Animated.View>
          {T.mountain === 'brushstroke' && (
            <Text style={s.inkSubLabel}>专  注</Text>
          )}
          <Text style={s.mainWord}>Focus</Text>
          {T.mountain === 'weathered' && (
            <>
              <Text style={s.wabiConcept}>presence</Text>
              <Text style={s.wabiConceptJp}>今ここに</Text>
            </>
          )}
          <Text style={s.quote}>{quote}</Text>
        </View>

        <View style={s.bottomSection}>
          <View style={s.bottomLine} />
          <Text style={s.hintMain}>Nothing to do  ·  nowhere to be</Text>
          <Text style={s.hintSub}>A gentle bell will sound each hour</Text>
          {hoursLeft !== null && hoursLeft > 0 && (
            <Text style={s.eveningHint}>
              Evening reflection begins in {hoursLeft}h
            </Text>
          )}
        </View>

      </Animated.View>
    </View>
  );
}

function makeStyles(T: AppTheme) {
  const INK = T.ink, INK2 = T.ink2, INK3 = T.ink3, GOLD = T.gold, BG = T.bg;
  return StyleSheet.create({
  root:       { flex:1, backgroundColor:BG },
  mountain1:  { position:'absolute', width:width*1.4, height:width*1.4, borderRadius:width*0.7,  backgroundColor:`${INK}0b`, bottom:-width*0.95, left:-width*0.2 },
  mountain2:  { position:'absolute', width:width*1.1, height:width*1.1, borderRadius:width*0.55, backgroundColor:`${INK}09`, bottom:-width*0.72, left:width*0.1 },
  mountain3:  { position:'absolute', width:width*0.8, height:width*0.8, borderRadius:width*0.4,  backgroundColor:`${INK}07`, bottom:-width*0.52, right:-width*0.05 },
  waterLine:  { position:'absolute', height:1, backgroundColor: INK },
  mist1Layer: { position:'absolute', width:width*1.3, height:80,  borderRadius:40, backgroundColor: T.bgMist, bottom:height*0.24, left:-width*0.15 },
  mist2Layer: { position:'absolute', width:width*0.85, height:55, borderRadius:28, backgroundColor: T.bgMist, bottom:height*0.29, right:-width*0.1 },
  brushGroup: { position:'absolute', bottom:height*0.13, left:0, right:0, height:170 },
  cornerTL:   { position:'absolute', width:100, height:100, borderRadius:50, borderWidth:1, borderColor:`${INK}12`, top:-30, left:-30 },
  cornerBR:   { position:'absolute', width:70,  height:70,  borderRadius:35, borderWidth:1, borderColor:`${INK}0f`, bottom:70, right:-15 },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 64,
    paddingBottom: 48,
    justifyContent: 'space-between',
  },
  topSection:  { alignItems: 'center', gap: 6 },
  midSection:  { alignItems: 'center', gap: 12 },
  bottomSection: { alignItems: 'center', width: '100%' },
  greeting:    { fontSize:11, color:INK3, letterSpacing:5, fontWeight:'300', opacity:0.65 },
  time:        { fontSize:44, color:INK, letterSpacing:6, fontWeight:'200' },
  mainWord:    { fontSize:26, color:INK2, letterSpacing:8, fontWeight:'300' },
  quote:       { fontSize:13, color:INK2, letterSpacing:1.5, fontWeight:'300', opacity:0.72, textAlign:'center', lineHeight:22 },
  bottomLine:  { width:40, height:1, backgroundColor:`${INK}26`, marginBottom:16 },
  hintMain:    { fontSize:12, color:INK2, letterSpacing:1.5, opacity:0.65, textAlign:'center' },
  hintSub:     { fontSize:11, color:INK3, letterSpacing:1, opacity:0.55, fontStyle:'italic', marginTop:6, textAlign:'center' },
  eveningHint:   { fontSize:11, color:GOLD, letterSpacing:1.5, opacity:0.75, marginTop:10, textAlign:'center' },
  wabiConcept:   { fontSize:20, color:INK2, fontStyle:'italic', letterSpacing:1 },
  wabiConceptJp: { fontSize:11, color:INK3, letterSpacing:6, fontWeight:'300', marginTop:2 },
  inkBleed:       { position:'absolute', width:width*0.75, height:width*0.75, borderRadius:width*0.375, backgroundColor:INK, opacity:0.055, top:-width*0.32, left:-width*0.28 },
  bgChar:         { position:'absolute', fontSize:260, color:INK, opacity:0.038, fontWeight:'700', top:height*0.08, right:-16, includeFontPadding:false },
  sealCorner:     { position:'absolute', top:58, right:28, width:38, height:38, backgroundColor:T.gold, alignItems:'center', justifyContent:'center' },
  sealCornerText: { color:'#fff8f0', fontSize:17, fontWeight:'500' },
  inkSubLabel:    { fontSize:11, color:T.gold, letterSpacing:8, fontWeight:'300', marginBottom:4, opacity:0.85 },
  });
}
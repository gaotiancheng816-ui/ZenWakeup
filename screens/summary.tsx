import { useEffect, useRef, useState } from 'react';
import {
  Animated, Dimensions, ScrollView,
  StatusBar, StyleSheet, Text, View
} from 'react-native';
import { TapButton } from '../components/tap-button';
import Svg, { Circle, Line, Path } from 'react-native-svg';
import { ALL_THEMES, AppTheme } from '../constants/app-themes';
import { useTheme } from '../utils/theme-context';
import { AppData, DayRecord, getTodayRecord, loadData, saveAlarmTime } from '../utils/storage';

const { width, height } = Dimensions.get('window');
// Defaults used by module-level subcomponents; overridden at render time via props
let INK = '#2a2e24', INK2 = '#485040', INK3 = '#7a8472', GOLD = '#8a7040', BG = '#d4d0c8';

const SCORE_EN = ['Heavy','Tired','Neutral','Light','Fulfilled'];
const MONTHS   = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DAYS     = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const QUOTES   = [
  'Before enlightenment, chop wood, carry water',
  'Sit quietly · doing nothing · spring comes',
  'The quieter you become · the more you can hear',
  'When you realize nothing is lacking · the whole world belongs to you',
  'Wherever you are is called here',
  'Walk as if you are kissing the earth with your feet',
  'The present moment is the only moment available to us',
];

// ── 月相 SVG ──────────────────────────────────
const MoonPhase = ({ phase, size = 40 }: { phase: number; size?: number }) => {
  const cx = size / 2, cy = size / 2, r = size * 0.36;
  if (phase === 0) {
    return (
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Path d={`M ${cx} ${cy-r} A ${r} ${r} 0 1 1 ${cx} ${cy+r} A ${r} ${r} 0 1 1 ${cx} ${cy-r}`}
          fill="none" stroke={INK} strokeWidth={0.8} opacity={0.3}/>
      </Svg>
    );
  }
  if (phase === 4) {
    return (
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Circle cx={cx} cy={cy} r={r}       fill="none" stroke={INK} strokeWidth={0.8} opacity={0.5}/>
        <Circle cx={cx} cy={cy} r={r*0.7}   fill={INK}  opacity={0.18}/>
        <Circle cx={cx} cy={cy} r={r*0.35}  fill={GOLD} opacity={0.55}/>
        <Circle cx={cx} cy={cy} r={r*0.12}  fill={GOLD} opacity={0.85}/>
      </Svg>
    );
  }
  const bulge   = phase === 1 ? 0.15 : phase === 2 ? 0.5 : 0.85;
  const offsetX = r * (1 - bulge * 2);
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <Path d={`M ${cx} ${cy-r} A ${r} ${r} 0 1 1 ${cx} ${cy+r}`}
        fill="none" stroke={INK} strokeWidth={0.9} opacity={0.55}/>
      <Path d={`M ${cx} ${cy-r} A ${Math.abs(offsetX)} ${r} 0 1 ${bulge>0.5?0:1} ${cx} ${cy+r}`}
        fill="none" stroke={INK} strokeWidth={0.7} opacity={0.4}/>
      <Circle cx={cx+r*0.3} cy={cy-r*0.5} r={1.5} fill={GOLD} opacity={0.45}/>
    </Svg>
  );
};

// ── 禅圆 mini ─────────────────────────────────
const EnsoMini = () => (
  <Svg width={20} height={20} viewBox="0 0 90 90">
    <Path d="M45 12 A33 33 0 1 1 32 74" fill="none" stroke={INK} strokeWidth={4.5} strokeLinecap="round" opacity={0.55}/>
    <Circle cx={45} cy={45} r={3}   fill={GOLD} opacity={0.6}/>
    <Circle cx={45} cy={45} r={1.2} fill={GOLD} opacity={0.8}/>
  </Svg>
);

// ── 月历 ──────────────────────────────────────
function MonthCalendar({ records }: { records: DayRecord[] }) {
  const now         = new Date();
  const year        = now.getFullYear();
  const month       = now.getMonth();
  const daysInMonth = new Date(year, month+1, 0).getDate();
  const today       = now.getDate();

  const doneMap: Record<string, { morning: boolean; evening: boolean }> = {};
  records.forEach(r => {
    const d = new Date(r.date);
    if (d.getFullYear() === year && d.getMonth() === month) {
      doneMap[d.getDate()] = { morning: r.morningDone, evening: r.eveningDone };
    }
  });

  const weeks: (number|null)[][] = [];
  const firstDay = new Date(year, month, 1).getDay();
  let week: (number|null)[] = Array(firstDay).fill(null);
  for (let d = 1; d <= daysInMonth; d++) {
    week.push(d);
    if (week.length === 7) { weeks.push(week); week = []; }
  }
  if (week.length) { while (week.length < 7) week.push(null); weeks.push(week); }

  return (
    <View style={cal.wrap}>
      <View style={cal.row}>
        {['S','M','T','W','T','F','S'].map((d,i) => (
          <Text key={i} style={cal.dayLabel}>{d}</Text>
        ))}
      </View>
      {weeks.map((week, wi) => (
        <View key={wi} style={cal.row}>
          {week.map((day, di) => {
            if (!day) return <View key={di} style={cal.cell}/>;
            const rec     = doneMap[day];
            const both    = rec?.morning && rec?.evening;
            const partial = rec && (rec.morning || rec.evening) && !both;
            const isToday = day === today;
            return (
              <View key={di} style={cal.cell}>
                {both    && <View style={cal.dotFull}/>}
                {partial && <View style={cal.dotPartial}/>}
                <Text style={[cal.dayNum, isToday && cal.dayNumToday, both && cal.dayNumDone]}>
                  {day}
                </Text>
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const cal = StyleSheet.create({
  wrap:         { width:'100%' },
  row:          { flexDirection:'row', justifyContent:'space-between', marginBottom:8 },
  cell:         { width:36, alignItems:'center', position:'relative' },
  dayLabel:     { fontSize:9, color:INK3, letterSpacing:1, opacity:0.5, width:36, textAlign:'center' },
  dayNum:       { fontSize:11, color:INK2, fontWeight:'300', letterSpacing:0.5 },
  dayNumToday:  { color:GOLD },
  dayNumDone:   { color:INK, fontWeight:'400' },
  dotFull:      { position:'absolute', top:-5, width:4, height:4, borderRadius:2, backgroundColor:GOLD, opacity:0.7 },
  dotPartial:   { position:'absolute', top:-5, width:4, height:4, borderRadius:2, backgroundColor:INK3, opacity:0.3 },
});

// ── 山路阶段 ──────────────────────────────────
const STAGES = [
  { days:7,    quote:'The path reveals itself slowly' },
  { days:14,   quote:'A tree takes root' },
  { days:21,   quote:'Water finds its way' },
  { days:30,   quote:'The summit is in the mist' },
  { days:45,   quote:'Darkness has its own light' },
  { days:60,   quote:'The moon knows the mountain' },
  { days:75,   quote:'Seasons pass through you' },
  { days:90,   quote:'New growth asks for nothing' },
  { days:120,  quote:'Birds know where they belong' },
  { days:180,  quote:'You are part of the mountain now' },
  { days:9999, quote:'The mountain has always been here' },
];

function MountainPath({ quietDays }: { quietDays: number }) {
  const stageIdx = STAGES.findIndex(s => quietDays <= s.days);
  const stage    = Math.max(0, stageIdx);
  const { quote } = STAGES[Math.min(stage, STAGES.length-1)];

  const W = width - 64;
  const H = 88;

  const hasTrees    = stage >= 1;
  const hasStream   = stage >= 2;
  const hasSun      = stage >= 3;
  const hasMist2    = stage >= 3;
  const hasStar1    = stage >= 4;
  const hasMoon     = stage >= 5;
  const hasMoonRefl = stage >= 5;
  const hasSnow     = stage >= 6;
  const hasSprouts  = stage >= 7;
  const hasBirds    = stage >= 8;
  const hasDayMoon  = stage >= 9;

  const px = (v: number) => (v / 106) * W;
  const py = (v: number) => (v / 72)  * H;

  return (
    <View style={mp.wrap}>
      <Text style={mp.label}>THE MOUNTAIN PATH</Text>
      <Svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>

        {/* 太阳 */}
        {hasSun && <>
          <Circle cx={px(44)} cy={py(14)} r={px(5)}  fill="none" stroke={GOLD} strokeWidth={0.7} opacity={0.5}/>
          <Circle cx={px(44)} cy={py(14)} r={px(2)}  fill={GOLD} opacity={0.45}/>
          <Line x1={px(44)} y1={py(5)}  x2={px(44)} y2={py(7)}  stroke={GOLD} strokeWidth={0.6} opacity={0.38}/>
          <Line x1={px(52)} y1={py(8)}  x2={px(50)} y2={py(10)} stroke={GOLD} strokeWidth={0.5} opacity={0.32}/>
          <Line x1={px(36)} y1={py(8)}  x2={px(38)} y2={py(10)} stroke={GOLD} strokeWidth={0.5} opacity={0.32}/>
        </>}

        {/* 弦月 */}
        {hasMoon && <>
          <Path
            d={`M ${px(80)} ${py(8)} A ${px(9)} ${py(9)} 0 1 1 ${px(80)} ${py(26)} A ${px(6)} ${py(6)} 0 1 0 ${px(80)} ${py(8)}Z`}
            fill="none" stroke={GOLD} strokeWidth={0.7} opacity={0.52}/>
          <Circle cx={px(62)} cy={py(8)}  r={1}   fill={GOLD} opacity={0.38}/>
          <Circle cx={px(92)} cy={py(12)} r={0.8} fill={GOLD} opacity={0.3}/>
        </>}

        {/* 第一颗星（无月时） */}
        {hasStar1 && !hasMoon && <>
          <Circle cx={px(82)} cy={py(10)} r={1.2} fill={GOLD} opacity={0.5}/>
          <Circle cx={px(72)} cy={py(6)}  r={0.8} fill={GOLD} opacity={0.35}/>
        </>}

        {/* 日月共存 */}
        {hasDayMoon && (
          <Path
            d={`M ${px(88)} ${py(30)} A ${px(5)} ${py(5)} 0 1 1 ${px(88)} ${py(40)} A ${px(3)} ${py(3)} 0 1 0 ${px(88)} ${py(30)}Z`}
            fill="none" stroke={GOLD} strokeWidth={0.5} opacity={0.2}/>
        )}

        {/* 飞鸟 */}
        {hasBirds && <>
          <Path d={`M ${px(72)} ${py(18)} Q ${px(75)} ${py(15)} ${px(78)} ${py(18)}`} fill="none" stroke={INK} strokeWidth={0.7} opacity={0.35}/>
          <Path d={`M ${px(82)} ${py(12)} Q ${px(85)} ${py(9)}  ${px(88)} ${py(12)}`} fill="none" stroke={INK} strokeWidth={0.6} opacity={0.26}/>
          <Path d={`M ${px(64)} ${py(22)} Q ${px(67)} ${py(19)} ${px(70)} ${py(22)}`} fill="none" stroke={INK} strokeWidth={0.5} opacity={0.2}/>
        </>}

        {/* 雪点 */}
        {hasSnow && <>
          <Circle cx={px(30)} cy={py(12)} r={0.8} fill={INK} opacity={0.13}/>
          <Circle cx={px(55)} cy={py(8)}  r={0.6} fill={INK} opacity={0.1}/>
          <Circle cx={px(18)} cy={py(18)} r={0.7} fill={INK} opacity={0.09}/>
        </>}

        {/* 背景山 */}
        <Path d={`M ${px(0)} ${py(58)} L ${px(18)} ${py(36)} L ${px(36)} ${py(58)}Z`}
          fill="none" stroke={INK} strokeWidth={0.4} opacity={0.14}/>

        {/* 主山 */}
        <Path d={`M ${px(22)} ${py(58)} L ${px(44)} ${py(20)} L ${px(66)} ${py(58)}Z`}
          fill={BG} stroke={INK} strokeWidth={0.7} opacity={0.28}/>

        {/* 山顶积雪 */}
        {hasSnow && (
          <Path d={`M ${px(38)} ${py(30)} L ${px(44)} ${py(20)} L ${px(50)} ${py(30)} Q ${px(44)} ${py(26)} ${px(38)} ${py(30)}Z`}
            fill={INK} opacity={0.07}/>
        )}

        {/* 云雾山顶 */}
        {hasMist2 && (
          <Path d={`M ${px(28)} ${py(34)} Q ${px(36)} ${py(28)} ${px(44)} ${py(30)} Q ${px(52)} ${py(28)} ${px(60)} ${py(34)}`}
            fill="none" stroke={INK} strokeWidth={0.3} opacity={0.1}/>
        )}

        {/* 右侧小山 */}
        <Path d={`M ${px(58)} ${py(58)} L ${px(76)} ${py(38)} L ${px(94)} ${py(58)}Z`}
          fill="none" stroke={INK} strokeWidth={0.4} opacity={0.12}/>

        {/* 地平线 */}
        <Line x1={px(0)} y1={py(58)} x2={px(106)} y2={py(58)} stroke={INK} strokeWidth={0.4} opacity={0.16}/>

        {/* 虚线小路 */}
        <Path
          d={`M ${px(53)} ${py(58)} Q ${px(49)} ${py(63)} ${px(46)} ${py(68)} Q ${px(43)} ${py(72)} ${px(40)} ${py(72)}`}
          fill="none" stroke={INK} strokeWidth={0.5} strokeDasharray="2,3" opacity={0.2}/>

        {/* 松树 */}
        {hasTrees && <>
          <Line x1={px(12)} y1={py(58)} x2={px(12)} y2={py(44)} stroke={INK2} strokeWidth={0.9} opacity={0.45}/>
          <Path d={`M ${px(7)} ${py(53)} L ${px(12)} ${py(43)} L ${px(17)} ${py(53)}Z`} fill="none" stroke={INK2} strokeWidth={0.6} opacity={0.45}/>
          <Path d={`M ${px(8)} ${py(57)} L ${px(12)} ${py(48)} L ${px(16)} ${py(57)}Z`} fill="none" stroke={INK2} strokeWidth={0.5} opacity={0.35}/>
          <Line x1={px(90)} y1={py(58)} x2={px(90)} y2={py(47)} stroke={INK2} strokeWidth={0.8} opacity={0.38}/>
          <Path d={`M ${px(86)} ${py(55)} L ${px(90)} ${py(46)} L ${px(94)} ${py(55)}Z`} fill="none" stroke={INK2} strokeWidth={0.5} opacity={0.35}/>
        </>}

        {/* 春芽 */}
        {hasSprouts && <>
          <Path d={`M ${px(30)} ${py(58)} Q ${px(32)} ${py(52)} ${px(34)} ${py(55)}`} fill="none" stroke={INK2} strokeWidth={0.6} opacity={0.38}/>
          <Path d={`M ${px(36)} ${py(58)} Q ${px(37)} ${py(53)} ${px(39)} ${py(56)}`} fill="none" stroke={INK2} strokeWidth={0.5} opacity={0.32}/>
        </>}

        {/* 小溪 */}
        {hasStream && <>
          <Path d={`M ${px(68)} ${py(58)} Q ${px(70)} ${py(62)} ${px(67)} ${py(66)} Q ${px(64)} ${py(70)} ${px(65)} ${py(72)}`}
            fill="none" stroke={GOLD} strokeWidth={0.6} opacity={0.3}/>
          <Path d={`M ${px(71)} ${py(58)} Q ${px(73)} ${py(62)} ${px(70)} ${py(66)} Q ${px(67)} ${py(70)} ${px(68)} ${py(72)}`}
            fill="none" stroke={GOLD} strokeWidth={0.4} opacity={0.17}/>
        </>}

        {/* 月亮水面倒影 */}
        {hasMoonRefl && <>
          <Path d={`M ${px(72)} ${py(62)} Q ${px(80)} ${py(59)} ${px(88)} ${py(62)}`} fill="none" stroke={GOLD} strokeWidth={0.5} opacity={0.22}/>
          <Path d={`M ${px(68)} ${py(66)} Q ${px(80)} ${py(63)} ${px(92)} ${py(66)}`} fill="none" stroke={GOLD} strokeWidth={0.4} opacity={0.14}/>
        </>}

        {/* 底部薄雾 */}
        <Path d={`M ${px(0)} ${py(46)} Q ${px(26)} ${py(42)} ${px(53)} ${py(46)} Q ${px(80)} ${py(50)} ${px(106)} ${py(46)}`}
          fill="none" stroke={INK} strokeWidth={0.3} opacity={0.08}/>
        {hasMist2 && (
          <Path d={`M ${px(5)} ${py(50)} Q ${px(30)} ${py(45)} ${px(55)} ${py(50)} Q ${px(80)} ${py(55)} ${px(100)} ${py(50)}`}
            fill="none" stroke={INK} strokeWidth={0.25} opacity={0.06}/>
        )}

      </Svg>

      <View style={mp.footer}>
        <Text style={mp.quote}>{quote}</Text>
        <Text style={mp.days}>{quietDays} quiet {quietDays === 1 ? 'day' : 'days'}</Text>
      </View>
    </View>
  );
}

const mp = StyleSheet.create({
  wrap:   { width:'100%', alignItems:'center', gap:12 },
  label:  { fontSize:9, color:INK3, letterSpacing:5, fontWeight:'300', alignSelf:'flex-start' },
  footer: { width:'100%', flexDirection:'row', justifyContent:'space-between', alignItems:'center' },
  quote:  { fontSize:11, color:INK2, letterSpacing:1.5, fontStyle:'italic', opacity:0.7 },
  days:   { fontSize:10, color:INK3, letterSpacing:1.5, opacity:0.5 },
});

// ── 主组件 ────────────────────────────────────
export default function DailySummaryScreen({ onDone }: { onDone?: () => void }) {
  const { theme: T, setTheme, morningDays } = useTheme();
  // Update module-level color vars so all subcomponents pick up the theme
  INK = T.ink; INK2 = T.ink2; INK3 = T.ink3; GOLD = T.gold; BG = T.bg;
  const s = makeStyles(T);
  const [appData,    setAppData]    = useState<AppData | null>(null);
  const [todayRec,   setTodayRec]   = useState<DayRecord | null>(null);
  const [alarmSaved, setAlarmSaved] = useState(false);

  const fadeIn   = useRef(new Animated.Value(0)).current;
  const lineAnim = useRef(new Animated.Value(0)).current;
  const mist1    = useRef(new Animated.Value(0)).current;
  const mist2    = useRef(new Animated.Value(0)).current;
  const brushY   = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadData().then(data => {
      setAppData(data);
      setTodayRec(getTodayRecord(data));
    });
  }, []);

  useEffect(() => {
    if (!todayRec) return;
    Animated.sequence([
      Animated.timing(fadeIn,   { toValue:1, duration:1600, useNativeDriver:true }),
      Animated.timing(lineAnim, { toValue:1, duration:1200, useNativeDriver:false }),
    ]).start();
    Animated.loop(Animated.sequence([
      Animated.timing(mist1,  { toValue:1, duration:9000,  useNativeDriver:true }),
      Animated.timing(mist1,  { toValue:0, duration:9000,  useNativeDriver:true }),
    ])).start();
    Animated.loop(Animated.sequence([
      Animated.timing(mist2,  { toValue:1, duration:12000, useNativeDriver:true }),
      Animated.timing(mist2,  { toValue:0, duration:12000, useNativeDriver:true }),
    ])).start();
    Animated.loop(Animated.sequence([
      Animated.timing(brushY, { toValue:1, duration:15000, useNativeDriver:true }),
      Animated.timing(brushY, { toValue:0, duration:15000, useNativeDriver:true }),
    ])).start();
  }, [todayRec]);

  if (!todayRec || !appData) return <View style={s.scroll}/>;

  const now      = new Date();
  const quote    = QUOTES[now.getDay() % QUOTES.length];
  const dateStr  = `${DAYS[now.getDay()]}  ${now.getDate()} ${MONTHS[now.getMonth()]}`;
  const totalM   = todayRec.totalMinutes;
  const timeStr  = totalM >= 60 ? `${Math.floor(totalM/60)}h ${totalM%60}min` : `${totalM}min`;
  const accumMin = appData.records.reduce((sum,r) => sum+(r.totalMinutes||0), 0);
  const accumStr = accumMin >= 60 ? `${Math.floor(accumMin/60)}h ${accumMin%60}min` : `${accumMin}min`;
  const lineWidth = lineAnim.interpolate({ inputRange:[0,1], outputRange:['0%','100%'] });

  const quietDays = appData.records.filter(r => {
    const d = new Date(r.date);
    return d.getMonth() === now.getMonth() &&
           d.getFullYear() === now.getFullYear() &&
           r.morningDone && r.eveningDone;
  }).length;

  const alarmH = String(appData.alarmHour).padStart(2,'0');
  const alarmM = String(appData.alarmMinute).padStart(2,'0');

  return (
    <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
      <StatusBar barStyle="dark-content" />

      {T.mountain !== 'weathered' && (
        <><View style={s.mountain1}/><View style={s.mountain2}/><View style={s.mountain3}/></>
      )}
      {T.mountain !== 'weathered' && [0.38,0.41,0.44].map((pos,i) => (
        <View key={i} style={[s.waterLine, {
          top:height*pos, opacity:0.04+i*0.015,
          width:width*[0.72,0.85,0.68][i], alignSelf:'center',
        }]}/>
      ))}
      {T.mountain !== 'weathered' && (
        <Animated.View style={[s.mist1Layer, { transform:[{ translateY: mist1.interpolate({ inputRange:[0,1], outputRange:[0,-10] }) }] }]}/>
      )}
      {T.mountain !== 'weathered' && (
        <Animated.View style={[s.mist2Layer, { transform:[{ translateX: mist2.interpolate({ inputRange:[0,1], outputRange:[0,14] }) }] }]}/>
      )}
      {T.mountain !== 'weathered' && (
        <Animated.View style={[s.brushGroup, { transform:[{ translateY: brushY.interpolate({ inputRange:[0,1], outputRange:[0,-14] }) }] }]}>
          {[
            { left:width*0.06, h:90,  op:0.05 }, { left:width*0.11, h:140, op:0.07 },
            { left:width*0.16, h:60,  op:0.04 }, { left:width*0.80, h:110, op:0.06 },
            { left:width*0.86, h:75,  op:0.08 }, { left:width*0.91, h:95,  op:0.05 },
          ].map((b,i) => (
            <View key={i} style={{ position:'absolute', left:b.left, bottom:0, width:1.5, height:b.h, backgroundColor: INK, opacity:b.op, borderRadius:1 }}/>
          ))}
        </Animated.View>
      )}
      {T.mountain !== 'weathered' && <><View style={s.cornerTL}/><View style={s.cornerBR}/></>}
      {/* 水墨: 墨晕渗染 + 大字背景 + 印章 */}
      {T.mountain === 'brushstroke' && <View style={s.inkBleed} />}
      {T.mountain === 'brushstroke' && <Text style={s.bgChar} pointerEvents="none">道</Text>}
      {T.mountain === 'brushstroke' && T.seal && (
        <View style={s.sealCorner}><Text style={s.sealCornerText}>{T.seal}</Text></View>
      )}

      <Animated.View style={[s.content, { opacity: fadeIn }]}>

        {/* 侘寂: 堆石 + 哲学词 */}
        {T.mountain === 'weathered' && (
          <View style={{ alignItems:'center', marginBottom:24 }}>
            <Svg width={86} height={108} viewBox="0 0 86 108">
              <Path d="M6 102 C14 96 28 93 43 94 C58 95 72 98 78 103 C70 108 56 111 43 110 C30 109 16 106 6 102Z" fill="#8a8272" opacity={0.82}/>
              <Path d="M13 84 C20 79 32 76 43 77 C54 78 65 81 69 86 C62 91 52 93 43 92 C34 91 23 88 13 84Z" fill="#928a7c" opacity={0.82}/>
              <Path d="M20 68 C26 64 34 62 44 63 C53 64 62 67 64 72 C58 77 51 79 43 78 C35 77 27 74 20 68Z" fill="#9a9282" opacity={0.82}/>
              <Path d="M28 54 C33 50 38 49 44 50 C50 51 56 54 56 58 C52 63 48 64 43 63 C38 62 32 60 28 54Z" fill="#a0988a" opacity={0.82}/>
              <Path d="M34 43 C37 40 41 39 44 40 C47 41 50 43 49 47 C47 50 45 51 43 50 C40 49 36 47 34 43Z" fill="#a8a09a" opacity={0.82}/>
            </Svg>
            <View style={{ height: 16 }}/>
            <Text style={s.wabiConcept}>continuity</Text>
            <Text style={s.wabiConceptJp}>継続性</Text>
          </View>
        )}

        {/* 标题 */}
        <Text style={s.dateStr}>{dateStr}</Text>
        <Text style={s.mainWord}>Summary</Text>
        <View style={s.lineWrap}>
          <Animated.View style={[s.line, { width: lineWidth }]}/>
        </View>

        {/* 今日完成 */}
        <Text style={s.sectionLabel}>Today's practice</Text>
        <View style={{ height:20 }}/>
        <View style={s.itemRow}>
          <View style={{ flex:1 }}>
            <Text style={[s.itemTitle, !todayRec.morningDone && s.dim]}>Morning Meditation</Text>
            <Text style={s.itemSub}>guided breathing</Text>
          </View>
          <Text style={todayRec.morningDone ? s.checkOn : s.checkOff}>
            {todayRec.morningDone ? '✓' : '—'}
          </Text>
        </View>
        <View style={s.itemDivider}/>
        <View style={s.itemRow}>
          <View style={{ flex:1 }}>
            <Text style={[s.itemTitle, !todayRec.eveningDone && s.dim]}>Evening Return</Text>
            <Text style={s.itemSub}>
              {todayRec.eveningDone ? `3 reflections  ·  ${SCORE_EN[todayRec.score]}` : '3 reflections'}
            </Text>
          </View>
          <Text style={todayRec.eveningDone ? s.checkOn : s.checkOff}>
            {todayRec.eveningDone ? '✓' : '—'}
          </Text>
        </View>

        <View style={s.sectionDivider}/>

        {/* 月历 */}
        <Text style={s.sectionLabel}>This month</Text>
        <View style={{ height:8 }}/>
        <View style={{ alignSelf:'flex-start', flexDirection:'row', alignItems:'baseline', gap:8 }}>
          <Text style={s.quietNum}>{quietDays}</Text>
          <Text style={s.quietLabel}>quiet {quietDays === 1 ? 'day' : 'days'}</Text>
        </View>
        <Text style={s.quietSub}>morning + evening both complete</Text>
        <View style={{ height:24 }}/>
        <MonthCalendar records={appData.records}/>

        <View style={s.sectionDivider}/>

        {/* 冥想时长 */}
        <Text style={s.sectionLabel}>Mindfulness time</Text>
        <View style={{ height:16 }}/>
        <Text style={s.bigTime}>{timeStr}</Text>
        <Text style={s.accumTime}>Total accumulated  ·  {accumStr}</Text>

        <View style={s.sectionDivider}/>

        {/* 今日状态 */}
        {todayRec.eveningDone && <>
          <Text style={s.sectionLabel}>Today's state</Text>
          <View style={{ height:20 }}/>
          <View style={s.moodRow}>
            <MoonPhase phase={todayRec.score} size={40}/>
            <View style={{ gap:4 }}>
              <Text style={s.moodLabel}>{SCORE_EN[todayRec.score]}</Text>
              <Text style={s.moodSub}>Evening self-assessment</Text>
            </View>
          </View>
          <View style={s.sectionDivider}/>
        </>}

        {/* 禅语 */}
        <View style={s.quoteBlock}>
          <Text style={s.quoteDash}>— — —</Text>
          <View style={{ height:20 }}/>
          <Text style={s.quoteText}>{quote}</Text>
          <View style={{ height:20 }}/>
          <Text style={s.quoteDash}>— — —</Text>
        </View>

        <View style={s.sectionDivider}/>

        {/* 山路 */}
        <MountainPath quietDays={quietDays}/>

        <View style={s.sectionDivider}/>

        {/* 主题选择 */}
        <Text style={s.sectionLabel}>Theme</Text>
        <View style={{ height: 16 }} />
        <View style={s.themeRow}>
          {ALL_THEMES.map(t => {
            const unlocked = t.unlockDay <= morningDays;
            const active   = t.id === T.id;
            return (
              <TapButton
                key={t.id}
                style={[s.themeCard, active && s.themeCardActive, !unlocked && s.themeCardLocked]}
                onPress={() => unlocked && setTheme(t.id)}
                disabled={!unlocked}
                activeOpacity={unlocked ? 0.7 : 1}
              >
                <Text style={[s.themeCardName, active && s.themeCardNameActive]}>
                  {t.name}
                </Text>
                {active  && <View style={s.themeCardDot} />}
                {!unlocked && (
                  <Text style={s.themeCardHint}>day {t.unlockDay}</Text>
                )}
              </TapButton>
            );
          })}
        </View>

        <View style={s.sectionDivider}/>

        {/* 明日闹钟 */}
        <Text style={s.seeYou}>Until tomorrow</Text>
        <View style={{ height:24 }}/>
        <View style={s.alarmSetRow}>
          <View style={s.alarmCol}>
            <TapButton onPress={() => setAppData(d => d ? {...d, alarmHour:(d.alarmHour+1)%24} : d)} style={s.alarmArrow}>
              <Text style={s.alarmArrowText}>▲</Text>
            </TapButton>
            <Text style={s.alarmTime}>{alarmH}</Text>
            <TapButton onPress={() => setAppData(d => d ? {...d, alarmHour:(d.alarmHour-1+24)%24} : d)} style={s.alarmArrow}>
              <Text style={s.alarmArrowText}>▼</Text>
            </TapButton>
          </View>
          <Text style={s.alarmColon}>:</Text>
          <View style={s.alarmCol}>
            <TapButton onPress={() => setAppData(d => d ? {...d, alarmMinute:(d.alarmMinute+5)%60} : d)} style={s.alarmArrow}>
              <Text style={s.alarmArrowText}>▲</Text>
            </TapButton>
            <Text style={s.alarmTime}>{alarmM}</Text>
            <TapButton onPress={() => setAppData(d => d ? {...d, alarmMinute:(d.alarmMinute-5+60)%60} : d)} style={s.alarmArrow}>
              <Text style={s.alarmArrowText}>▼</Text>
            </TapButton>
          </View>
        </View>

        <TapButton style={s.saveAlarmBtn} onPress={async () => {
          if (!appData) return;
          await saveAlarmTime(appData.alarmHour, appData.alarmMinute);
          setAlarmSaved(true);
          setTimeout(() => setAlarmSaved(false), 2000);
        }}>
          <Text style={s.saveAlarmText}>Save alarm  ›</Text>
        </TapButton>

        {alarmSaved && <Text style={s.savedHint}>Alarm saved  ✓</Text>}

        <View style={{ height:40 }}/>
        {onDone && (
          <TapButton style={s.doneBtn} onPress={onDone}>
            <Text style={s.doneBtnText}>Rest well tonight  ›</Text>
          </TapButton>
        )}
        <View style={{ height:80 }}/>
        
      </Animated.View>
    </ScrollView>
  );
}

function makeStyles(T: AppTheme) {
  const INK = T.ink, INK2 = T.ink2, INK3 = T.ink3, GOLD = T.gold, BG = T.bg;
  return StyleSheet.create({
    scroll:        { flex:1, backgroundColor:BG },
    scrollContent: { alignItems:'center', paddingHorizontal:32, paddingTop:72 },
    mountain1:     { position:'absolute', width:width*1.4, height:width*1.4, borderRadius:width*0.7,  backgroundColor:`${INK}0b`, top:height*0.45, left:-width*0.2 },
    mountain2:     { position:'absolute', width:width*1.1, height:width*1.1, borderRadius:width*0.55, backgroundColor:`${INK}09`, top:height*0.48, left:width*0.1 },
    mountain3:     { position:'absolute', width:width*0.8, height:width*0.8, borderRadius:width*0.4,  backgroundColor:`${INK}07`, top:height*0.50, right:-width*0.05 },
    waterLine:     { position:'absolute', height:1, backgroundColor: INK },
    mist1Layer:    { position:'absolute', width:width*1.3, height:80,  borderRadius:40, backgroundColor: T.bgMist, top:height*0.35, left:-width*0.15 },
    mist2Layer:    { position:'absolute', width:width*0.85, height:50, borderRadius:25, backgroundColor: T.bgMist, top:height*0.40, right:-width*0.1 },
    brushGroup:    { position:'absolute', top:height*0.28, left:0, right:0, height:170 },
    cornerTL:      { position:'absolute', width:100, height:100, borderRadius:50, borderWidth:1, borderColor:`${INK}12`, top:-30, left:-30 },
    cornerBR:      { position:'absolute', width:70,  height:70,  borderRadius:35, borderWidth:1, borderColor:`${INK}0f`, top:height*0.55, right:-15 },

    content:        { width:'100%', alignItems:'center' },
    dateStr:        { fontSize:13, color:INK3, letterSpacing:3, fontWeight:'300', marginBottom:8, opacity:0.8 },
    mainWord:       { fontSize:28, color:INK2, letterSpacing:7, fontWeight:'300' },
    lineWrap:       { width:'100%', height:1, backgroundColor:`${INK}14`, marginTop:16, marginBottom:36 },
    line:           { height:1, backgroundColor:`${INK}4d` },

    sectionLabel:   { fontSize:12, color:INK2, letterSpacing:4, fontWeight:'400', alignSelf:'flex-start', opacity:0.7 },
    sectionDivider: { width:'100%', height:1, backgroundColor:`${INK}14`, marginVertical:28 },

    itemRow:     { flexDirection:'row', alignItems:'center', width:'100%' },
    itemTitle:   { fontSize:15, color:INK2, letterSpacing:1.5, fontWeight:'400' },
    itemSub:     { fontSize:11, color:INK3, letterSpacing:0.5, fontStyle:'italic', marginTop:3, opacity:0.7 },
    dim:         { opacity:0.3 },
    checkOn:     { fontSize:14, color:GOLD },
    checkOff:    { fontSize:14, color:`${INK}33` },
    itemDivider: { height:1, backgroundColor:`${INK}0f`, marginVertical:16, width:'100%' },

    quietNum:    { fontSize:48, color:INK, fontWeight:'200', letterSpacing:2 },
    quietLabel:  { fontSize:14, color:INK2, letterSpacing:2, fontWeight:'300' },
    quietSub:    { fontSize:11, color:INK3, letterSpacing:0.5, fontStyle:'italic', opacity:0.7, alignSelf:'flex-start', marginTop:4 },

    bigTime:     { fontSize:48, color:INK, fontWeight:'200', letterSpacing:2, alignSelf:'flex-start' },
    accumTime:   { fontSize:12, color:INK2, letterSpacing:1.5, marginTop:6, alignSelf:'flex-start', opacity:0.75 },

    moodRow:     { flexDirection:'row', alignItems:'center', gap:20, alignSelf:'flex-start' },
    moodLabel:   { fontSize:28, color:INK, letterSpacing:4, fontWeight:'200' },
    moodSub:     { fontSize:11, color:INK3, letterSpacing:0.5, fontStyle:'italic', opacity:0.7 },

    quoteBlock:  { width:'100%', alignItems:'center', paddingVertical:8 },
    quoteDash:   { fontSize:11, color:INK3, letterSpacing:3, opacity:0.4 },
    quoteText:   { fontSize:14, color:INK2, letterSpacing:1.5, fontStyle:'italic', textAlign:'center', lineHeight:24, opacity:0.85 },

    seeYou:        { fontSize:22, color:INK2, letterSpacing:6, fontWeight:'300', alignSelf:'center' },
    alarmSetRow:   { flexDirection:'row', alignItems:'center', gap:20 },
    alarmCol:      { alignItems:'center', gap:4 },
    alarmArrow:    { padding:12 },
    alarmArrowText:{ fontSize:14, color:INK3, opacity:0.5 },
    alarmTime:     { fontSize:48, color:INK, fontWeight:'200', letterSpacing:6 },
    alarmColon:    { fontSize:48, color:INK2, fontWeight:'200', marginBottom:4 },
    saveAlarmBtn:  { marginTop:24, borderWidth:1, borderColor:`${INK}38`, paddingHorizontal:32, paddingVertical:14, borderRadius: T.radiusBtn },
    saveAlarmText: { fontSize:13, color:INK2, letterSpacing:4, fontWeight:'300' },
    savedHint:     { fontSize:11, color:GOLD, letterSpacing:3, marginTop:12 },
    doneBtn:       { marginTop:16, borderWidth:1, borderColor:`${INK}61`, backgroundColor:`${INK}0d`, paddingHorizontal:32, paddingVertical:14, borderRadius: T.radiusBtn },
    doneBtnText:   { fontSize:13, color:INK2, letterSpacing:3, fontWeight:'300' },
    themeRow:            { flexDirection:'row', gap:8, width:'100%' },
    themeCard:           { flex:1, paddingVertical:14, paddingHorizontal:6, borderWidth:1, borderColor:`${INK}20`, borderRadius:T.radiusCard, alignItems:'center', gap:5 },
    themeCardActive:     { borderColor:`${INK}70`, backgroundColor:`${INK}08` },
    themeCardLocked:     { opacity:0.35 },
    themeCardName:       { fontSize:12, color:INK3, letterSpacing:1.5, fontWeight:'300', textAlign:'center' },
    themeCardNameActive: { color:INK, fontWeight:'400' },
    themeCardHint:       { fontSize:9,  color:INK3, letterSpacing:1.5, opacity:0.7 },
    themeCardDot:        { width:4, height:4, borderRadius:2, backgroundColor:GOLD, opacity:0.85 },
    wabiConcept:   { fontSize:22, color:INK2, fontStyle:'italic', letterSpacing:1, marginTop:4 },
    wabiConceptJp: { fontSize:11, color:INK3, letterSpacing:6, fontWeight:'300', marginTop:2 },
    inkBleed:       { position:'absolute', width:width*0.75, height:width*0.75, borderRadius:width*0.375, backgroundColor:INK, opacity:0.055, top:-width*0.32, left:-width*0.28 },
    bgChar:         { position:'absolute', fontSize:260, color:INK, opacity:0.038, fontWeight:'700', top:height*0.08, right:-16, includeFontPadding:false },
    sealCorner:     { position:'absolute', top:58, right:28, width:38, height:38, backgroundColor:T.gold, alignItems:'center', justifyContent:'center' },
    sealCornerText: { color:'#fff8f0', fontSize:17, fontWeight:'500' },
  });
}
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
import { TapButton } from '../components/tap-button';
import Svg, { Circle, Defs, LinearGradient, Path, Rect, Stop } from 'react-native-svg';
import { AppTheme } from '../constants/app-themes';
import { useTheme } from '../utils/theme-context';
import { playEveningTone, playGuqinPluck, stopEveningTone } from '../utils/sounds';
import { updateTodayRecord } from '../utils/storage';

const { width, height } = Dimensions.get('window');

const WABI_EVE_H = height * 0.36;

function WabiSabiEveningScene({ INK }: { INK: string }) {
  const W = width, H = WABI_EVE_H;
  const x = (v: number) => (v / 320) * W;
  const y = (v: number) => (v / 250) * H;
  const horizon = y(210);
  return (
    <Svg width={W} height={H} style={{ position: 'absolute', top: 0, left: 0 }} pointerEvents="none">
      <Defs>
        <LinearGradient id="eveSky" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#c0a880" stopOpacity="0.2"/>
          <Stop offset="1" stopColor="#c8c0b0" stopOpacity="0"/>
        </LinearGradient>
        <LinearGradient id="eveMist" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={INK} stopOpacity="0"/>
          <Stop offset="1" stopColor="#c8c0b0" stopOpacity="1"/>
        </LinearGradient>
      </Defs>
      <Rect x={0} y={0} width={W} height={H} fill="url(#eveSky)"/>
      {/* crescent moon */}
      <Path d={`M${x(234)} ${y(52)} C${x(228)} ${y(34)} ${x(234)} ${y(18)} ${x(248)} ${y(16)} C${x(236)} ${y(28)} ${x(234)} ${y(44)} ${x(240)} ${y(58)} C${x(246)} ${y(72)} ${x(262)} ${y(80)} ${x(276)} ${y(76)} C${x(264)} ${y(90)} ${x(240)} ${y(70)} ${x(234)} ${y(52)}Z`}
        fill="#c0b8a8" opacity={0.65}/>
      {/* back hill left */}
      <Path d={`M${x(-10)} ${y(222)} C${x(14)} ${y(202)} ${x(36)} ${y(178)} ${x(60)} ${y(160)} C${x(76)} ${y(148)} ${x(84)} ${y(144)} ${x(90)} ${y(148)} C${x(98)} ${y(156)} ${x(104)} ${y(172)} ${x(112)} ${y(190)} C${x(118)} ${y(204)} ${x(122)} ${y(214)} ${x(124)} ${y(222)} L${x(-10)} ${y(224)}Z`}
        fill="#948c7e" opacity={0.4}/>
      {/* back hill right */}
      <Path d={`M${x(214)} ${y(222)} C${x(228)} ${y(206)} ${x(242)} ${y(188)} ${x(256)} ${y(174)} C${x(264)} ${y(166)} ${x(270)} ${y(162)} ${x(274)} ${y(165)} C${x(280)} ${y(170)} ${x(284)} ${y(184)} ${x(288)} ${y(200)} C${x(292)} ${y(214)} ${x(294)} ${y(222)} ${x(296)} ${y(226)} L${x(214)} ${y(226)}Z`}
        fill="#9a9082" opacity={0.35}/>
      {/* main mountain */}
      <Path d={`M${x(58)} ${y(226)} C${x(72)} ${y(208)} ${x(88)} ${y(186)} ${x(104)} ${y(166)} C${x(116)} ${y(150)} ${x(128)} ${y(136)} ${x(138)} ${y(124)} C${x(146)} ${y(116)} ${x(152)} ${y(110)} ${x(158)} ${y(108)} C${x(162)} ${y(106)} ${x(166)} ${y(107)} ${x(170)} ${y(112)} C${x(178)} ${y(122)} ${x(188)} ${y(138)} ${x(200)} ${y(156)} C${x(214)} ${y(176)} ${x(226)} ${y(196)} ${x(236)} ${y(212)} C${x(242)} ${y(222)} ${x(246)} ${y(228)} ${x(248)} ${y(230)} L${x(58)} ${y(230)}Z`}
        fill="#888070"/>
      {/* inner shadow */}
      <Path d={`M${x(158)} ${y(108)} C${x(154)} ${y(128)} ${x(146)} ${y(152)} ${x(136)} ${y(178)} C${x(128)} ${y(198)} ${x(118)} ${y(216)} ${x(110)} ${y(228)} L${x(158)} ${y(228)}Z`}
        fill="#78706a" opacity={0.2}/>
      {/* erosion */}
      <Path d={`M${x(144)} ${y(168)} Q${x(154)} ${y(158)} ${x(148)} ${y(148)}`} fill="none" stroke="#646058" strokeWidth={0.9} opacity={0.6}/>
      <Circle cx={x(160)} cy={y(182)} r={1.3} fill="#646058" opacity={0.5}/>
      <Circle cx={x(182)} cy={y(168)} r={1.0} fill="#646058" opacity={0.4}/>
      {/* horizon */}
      <Path d={`M0 ${horizon} L${W} ${horizon}`} stroke="#888070" strokeWidth={0.5} opacity={0.4}/>
      {/* mist */}
      <Rect x={0} y={horizon - 16} width={W} height={H - (horizon - 16)} fill="url(#eveMist)"/>
    </Svg>
  );
}

const REFLECTIONS = [
  { label: 'Accomplish', sub: 'What did I bring into the world today?' },
  { label: 'Gratitude',  sub: 'What am I grateful for today?' },
  { label: 'Release',    sub: 'What will I let go of tonight?' },
];

const SCORE_LABELS = ['Heavy', 'Tired', 'Neutral', 'Light', 'Fulfilled'];

const CrescentIcon = ({ size = 120, INK, GOLD }: { size?: number; INK: string; GOLD: string }) => (
  <Svg width={size} height={size} viewBox="0 0 80 80">
    <Path d="M40 12 A28 28 0 1 1 40 68 A18 18 0 1 0 40 12Z"
      fill="none" stroke={INK} strokeWidth={1.1} opacity={0.65}/>
    <Circle cx={54} cy={22} r={2}   fill={GOLD} opacity={0.5}/>
    <Circle cx={62} cy={16} r={1.2} fill={GOLD} opacity={0.35}/>
    <Circle cx={60} cy={30} r={1}   fill={GOLD} opacity={0.3}/>
  </Svg>
);

const MoonPhase = ({ phase, size = 52, INK, GOLD }: { phase: number; size?: number; INK: string; GOLD: string }) => {
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
        <Circle cx={cx} cy={cy} r={r}        fill="none" stroke={INK} strokeWidth={0.8} opacity={0.5}/>
        <Circle cx={cx} cy={cy} r={r*0.7}   fill={INK}  opacity={0.18}/>
        <Circle cx={cx} cy={cy} r={r*0.35}  fill={GOLD} opacity={0.55}/>
        <Circle cx={cx} cy={cy} r={r*0.12}  fill={GOLD} opacity={0.85}/>
      </Svg>
    );
  }
  const bulge = phase === 1 ? 0.15 : phase === 2 ? 0.5 : 0.85;
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

const EnsoMini = ({ INK, GOLD }: { INK: string; GOLD: string }) => (
  <Svg width={22} height={22} viewBox="0 0 90 90">
    <Path d="M45 12 A33 33 0 1 1 32 74" fill="none" stroke={INK} strokeWidth={4.5} strokeLinecap="round" opacity={0.55}/>
    <Circle cx={45} cy={45} r={3}   fill={GOLD} opacity={0.6}/>
    <Circle cx={45} cy={45} r={1.2} fill={GOLD} opacity={0.8}/>
  </Svg>
);

const EnsoLarge = ({ INK, GOLD }: { INK: string; GOLD: string }) => (
  <Svg width={120} height={120} viewBox="0 0 90 90">
    <Path d="M45 12 A33 33 0 1 1 32 74" fill="none" stroke={INK} strokeWidth={4.5} strokeLinecap="round" opacity={0.62}/>
    <Circle cx={45} cy={45} r={3}   fill={GOLD} opacity={0.65}/>
    <Circle cx={45} cy={45} r={1.2} fill={GOLD} opacity={0.85}/>
  </Svg>
);

const CardDecoration = ({ cardWidth, cardHeight, INK, GOLD }: { cardWidth: number; cardHeight: number; INK: string; GOLD: string }) => {
  const cx = cardWidth / 2;
  const cy = cardHeight * 0.78;
  const r  = cardWidth * 0.38;
  return (
    <Svg
      width={cardWidth}
      height={cardHeight}
      viewBox={`0 0 ${cardWidth} ${cardHeight}`}
      style={{ position: 'absolute', top: 0, left: 0 }}
    >
      <Path
        d={`M ${cx} ${cy - r} A ${r} ${r} 0 1 1 ${cx - r * 0.38} ${cy + r * 0.92}`}
        fill="none" stroke={INK} strokeWidth={cardWidth * 0.025} strokeLinecap="round" opacity={0.04}/>
      <Circle cx={cx} cy={cy + r * 0.55} r={r * 0.28} fill="none" stroke={INK} strokeWidth={0.5} opacity={0.07}/>
      <Circle cx={cx} cy={cy + r * 0.55} r={r * 0.18} fill="none" stroke={INK} strokeWidth={0.6} opacity={0.10}/>
      <Circle cx={cx} cy={cy + r * 0.55} r={r * 0.08} fill="none" stroke={INK} strokeWidth={0.7} opacity={0.14}/>
      <Circle cx={cx} cy={cy + r * 0.55} r={r * 0.024} fill={GOLD} opacity={0.38}/>
      <Circle cx={cardWidth * 0.78} cy={cardHeight * 0.18} r={2.2} fill={GOLD} opacity={0.28}/>
      <Circle cx={cardWidth * 0.84} cy={cardHeight * 0.12} r={1.4} fill={GOLD} opacity={0.18}/>
      <Circle cx={cardWidth * 0.72} cy={cardHeight * 0.13} r={1.0} fill={GOLD} opacity={0.15}/>
    </Svg>
  );
};

export default function EveningReturnScreen({ onDone }: { onDone?: () => void }) {
  const { theme: T } = useTheme();
  const INK = T.ink, INK2 = T.ink2, INK3 = T.ink3, GOLD = T.gold, BG = T.bg;
  const s = makeStyles(T);
  const [phase,   setPhase]   = useState<'enter' | 'score' | 'reflect' | 'done'>('enter');
  const [score,   setScore]   = useState(2);
  const [cardIdx, setCardIdx] = useState(0);

  const scoreBase  = useRef(2);
  const cardIdxRef = useRef(0);

  const fadeIn    = useRef(new Animated.Value(0)).current;
  const moonScale = useRef(new Animated.Value(0.85)).current;
  const moonPulse = useRef(new Animated.Value(1)).current;
  const cardX     = useRef(new Animated.Value(0)).current;
  const cardOpac  = useRef(new Animated.Value(1)).current;
  const scoreAnim = useRef(new Animated.Value(2)).current;
  const mist1     = useRef(new Animated.Value(0)).current;
  const mist2     = useRef(new Animated.Value(0)).current;
  const brushY    = useRef(new Animated.Value(0)).current;

  useEffect(() => { cardIdxRef.current = cardIdx; }, [cardIdx]);

  useEffect(() => {
    // 古琴拨弦开场，2秒后背景音淡入
    playGuqinPluck();
    setTimeout(() => playEveningTone(), 2000);

    Animated.parallel([
      Animated.timing(fadeIn,    { toValue: 1, duration: 2000, useNativeDriver: true }),
      Animated.spring(moonScale, { toValue: 1, useNativeDriver: true, damping: 14 }),
    ]).start();
    Animated.loop(Animated.sequence([
      Animated.timing(moonPulse, { toValue: 1.04, duration: 3500, useNativeDriver: true }),
      Animated.timing(moonPulse, { toValue: 1.0,  duration: 3500, useNativeDriver: true }),
    ])).start();
    Animated.loop(Animated.sequence([
      Animated.timing(mist1, { toValue: 1, duration: 9000,  useNativeDriver: true }),
      Animated.timing(mist1, { toValue: 0, duration: 9000,  useNativeDriver: true }),
    ])).start();
    Animated.loop(Animated.sequence([
      Animated.timing(mist2, { toValue: 1, duration: 12000, useNativeDriver: true }),
      Animated.timing(mist2, { toValue: 0, duration: 12000, useNativeDriver: true }),
    ])).start();
    Animated.loop(Animated.sequence([
      Animated.timing(brushY, { toValue: 1, duration: 15000, useNativeDriver: true }),
      Animated.timing(brushY, { toValue: 0, duration: 15000, useNativeDriver: true }),
    ])).start();

    return () => { stopEveningTone(); };
  }, []);

  const scorePan = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (_, g) => {
      const n = Math.max(0, Math.min(4, Math.round(scoreBase.current + g.dx / 40)));
      setScore(n);
      scoreAnim.setValue(n);
    },
    onPanResponderRelease: (_, g) => {
      scoreBase.current = Math.max(0, Math.min(4, Math.round(scoreBase.current + g.dx / 40)));
    },
  })).current;

  const cardPan = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (_, g) => cardX.setValue(g.dx),
    onPanResponderRelease: (_, g) => {
      if (g.dx < -60) {
        Animated.parallel([
          Animated.timing(cardX,    { toValue: -width, duration: 300, useNativeDriver: true }),
          Animated.timing(cardOpac, { toValue: 0,      duration: 300, useNativeDriver: true }),
        ]).start(() => {
          const next = cardIdxRef.current + 1;
          if (next >= REFLECTIONS.length) {
            updateTodayRecord({ eveningDone: true, score });
            setPhase('done');
          } else {
            setCardIdx(next);
            cardX.setValue(0);
            cardOpac.setValue(1);
          }
        });
      } else {
        Animated.spring(cardX, { toValue: 0, useNativeDriver: true }).start();
      }
    },
  });

  const scoreX = scoreAnim.interpolate({ inputRange: [0, 4], outputRange: [0, width - 112] });
  const cardW = width - 64;
  const cardH = height * 0.44;

  const Background = () => (
    <>
      {T.mountain === 'weathered'
        ? <WabiSabiEveningScene INK={INK} />
        : <><View style={s.mountain1} /><View style={s.mountain2} /><View style={s.mountain3} /></>
      }
      {T.mountain !== 'weathered' && [0.60, 0.63, 0.66].map((pos, i) => (
        <View key={i} style={[s.waterLine, {
          top: height*pos, opacity: 0.04+i*0.02,
          width: width*[0.72,0.86,0.68][i], alignSelf: 'center',
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
            { left:width*0.07, h:95,  op:0.06 }, { left:width*0.13, h:145, op:0.08 },
            { left:width*0.18, h:60,  op:0.05 }, { left:width*0.80, h:115, op:0.07 },
            { left:width*0.86, h:70,  op:0.09 }, { left:width*0.91, h:105, op:0.05 },
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
      {T.mountain === 'brushstroke' && <Text style={s.bgChar} pointerEvents="none">月</Text>}
      {T.mountain === 'brushstroke' && T.seal && (
        <View style={s.sealCorner}><Text style={s.sealCornerText}>{T.seal}</Text></View>
      )}
    </>
  );

  if (phase === 'enter') {
    return (
      <View style={s.root}>
        <StatusBar barStyle="dark-content" />
        <Background />
        <Animated.View style={[s.content, { opacity: fadeIn }]}>
          <View style={s.enterTop}>
            <Text style={s.pageLabel}>Evening</Text>
            <Text style={s.pageLabelSub}>
              {new Date().toLocaleDateString('en-GB', { weekday:'long', day:'numeric', month:'short' })}
            </Text>
          </View>
          <View style={s.enterMid}>
            {T.mountain !== 'weathered' && (
              <Animated.View style={{ transform: [{ scale: Animated.multiply(moonScale, moonPulse) }] }}>
                <CrescentIcon size={140} INK={INK} GOLD={GOLD} />
              </Animated.View>
            )}
            <View style={s.inkLine} />
            {T.mountain === 'brushstroke' && (
              <Text style={s.inkSubLabel}>归  宁</Text>
            )}
            <Text style={s.mainWord}>Return</Text>
            <Text style={s.subWord}>As dusk falls, the mountains recede</Text>
            {T.mountain === 'weathered' && (
              <>
                <View style={{ height: 8 }} />
                <Text style={s.wabiConcept}>transience</Text>
                <Text style={s.wabiConceptJp}>無常</Text>
              </>
            )}
          </View>
          <TapButton style={s.btn} onPress={() => setPhase('score')}>
            <Text style={s.btnText}>Begin evening return  ›</Text>
          </TapButton>
        </Animated.View>
      </View>
    );
  }

  if (phase === 'score') {
    return (
      <View style={s.root}>
        <StatusBar barStyle="dark-content" />
        <Background />
        <Animated.View style={[s.content, { opacity: fadeIn }]}>
          <View style={s.enterTop}>
            <Text style={s.mainWord}>Today</Text>
            <Text style={s.subWord}>How was your day?</Text>
          </View>
          <View style={s.scoreMid}>
            <View style={s.moonRow}>
              {[0, 1, 2, 3, 4].map(i => (
                <TapButton
                  key={i}
                  onPress={() => { setScore(i); scoreBase.current = i; scoreAnim.setValue(i); }}
                  style={[s.moonBtn, score === i && s.moonBtnActive]}
                >
                  <MoonPhase phase={i} size={44} INK={INK} GOLD={GOLD} />
                </TapButton>
              ))}
            </View>
            <View style={{ height: 32 }} />
            <View style={s.sliderWrap} {...scorePan.panHandlers}>
              <View style={s.sliderTrack}>
                <Animated.View style={[s.sliderThumb, { transform: [{ translateX: scoreX }] }]}>
                  <View style={s.thumbDot} />
                </Animated.View>
              </View>
            </View>
            <View style={{ height: 20 }} />
            <Text style={s.scoreLabel}>{SCORE_LABELS[score]}</Text>
            <Text style={s.slideHint}>← slide to choose →</Text>
          </View>
          <TapButton style={s.btn} onPress={() => setPhase('reflect')}>
            <Text style={s.btnText}>Continue  ›</Text>
          </TapButton>
        </Animated.View>
      </View>
    );
  }

  if (phase === 'reflect') {
    const cardRotate = cardX.interpolate({
      inputRange: [-width, 0, width],
      outputRange: ['-8deg', '0deg', '8deg'],
    });
    return (
      <View style={s.root}>
        <StatusBar barStyle="dark-content" />
        <Background />
        <View style={s.progressWrap}>
          <View style={[s.progressBar, { width: `${(cardIdxRef.current / REFLECTIONS.length) * 100}%` as any }]} />
        </View>
        <View style={s.cardStage}>
          {cardIdx + 1 < REFLECTIONS.length && (
            <View style={[s.card, s.cardBg]} />
          )}
          <Animated.View
            style={[s.card, {
              transform: [{ translateX: cardX }, { rotate: cardRotate }],
              opacity: cardOpac,
            }]}
            {...cardPan.panHandlers}
          >
            <CardDecoration cardWidth={cardW} cardHeight={cardH} INK={INK} GOLD={GOLD} />
            <Text style={s.cardNum}>{cardIdx + 1}  /  {REFLECTIONS.length}</Text>
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: 20 }}>
              <Text style={s.cardMainWord}>{REFLECTIONS[cardIdx].label}</Text>
              <View style={s.cardHairline} />
              <Text style={s.cardSub}>{REFLECTIONS[cardIdx].sub}</Text>
            </View>
            <Text style={s.cardHint}>← swipe to continue</Text>
          </Animated.View>
        </View>
        <Text style={s.reflectNote}>Answer silently within yourself</Text>
        <View style={{ height: 48 }} />
      </View>
    );
  }

  return (
    <View style={s.root}>
      <StatusBar barStyle="dark-content" />
      <Background />
      <Animated.View style={[s.content, { opacity: fadeIn }]}>
        <View style={s.enterMid}>
          <EnsoLarge INK={INK} GOLD={GOLD} />
          <View style={s.hairline} />
          <Text style={s.mainWord}>Complete</Text>
          <Text style={s.subWord}>Today is complete</Text>
          <View style={{ height: 32 }} />
          <View style={s.summaryBox}>
            <View style={s.summaryRow}>
              <MoonPhase phase={score} size={36} INK={INK} GOLD={GOLD} />
              <Text style={s.summaryText}>{SCORE_LABELS[score]}</Text>
            </View>
            <View style={s.summaryDivider} />
            <View style={s.summaryRow}>
              <EnsoMini INK={INK} GOLD={GOLD} />
              <Text style={s.summaryText}>{REFLECTIONS.length} reflections</Text>
            </View>
          </View>
          <View style={{ height: 24 }} />
          <Text style={s.quote}>When you bow deeply to the universe, it bows back</Text>
        </View>
        <TapButton style={s.btn} onPress={() => onDone && onDone()}>
          <Text style={s.btnText}>View today's summary  ›</Text>
        </TapButton>
      </Animated.View>
    </View>
  );
}

function makeStyles(T: AppTheme) {
  const INK = T.ink, INK2 = T.ink2, INK3 = T.ink3, GOLD = T.gold, BG = T.bg;
  return StyleSheet.create({
    root:       { flex:1, backgroundColor:BG },
    mountain1:  { position:'absolute', width:width*1.4, height:width*1.4, borderRadius:width*0.7,  backgroundColor:`${INK}0d`, bottom:-width*0.95, left:-width*0.2 },
    mountain2:  { position:'absolute', width:width*1.1, height:width*1.1, borderRadius:width*0.55, backgroundColor:`${INK}0a`, bottom:-width*0.72, left:width*0.1 },
    mountain3:  { position:'absolute', width:width*0.8, height:width*0.8, borderRadius:width*0.4,  backgroundColor:`${INK}07`, bottom:-width*0.52, right:-width*0.05 },
    waterLine:  { position:'absolute', height:1, backgroundColor: INK },
    mist1Layer: { position:'absolute', width:width*1.3, height:80,  borderRadius:40, backgroundColor: T.bgMist, bottom:height*0.24, left:-width*0.15 },
    mist2Layer: { position:'absolute', width:width*0.85, height:50, borderRadius:25, backgroundColor: T.bgMist, bottom:height*0.29, right:-width*0.1 },
    brushGroup: { position:'absolute', bottom:height*0.13, left:0, right:0, height:170 },
    cornerTL:   { position:'absolute', width:100, height:100, borderRadius:50, borderWidth:1, borderColor:`${INK}12`, top:-30, left:-30 },
    cornerBR:   { position:'absolute', width:70,  height:70,  borderRadius:35, borderWidth:1, borderColor:`${INK}0f`, bottom:70, right:-15 },
    content:      { flex:1, alignItems:'center', paddingHorizontal:40, paddingTop: T.mountain === 'weathered' ? WABI_EVE_H + 16 : 64, paddingBottom:48, justifyContent:'space-between' },
    enterTop:     { alignItems:'center', gap:6 },
    enterMid:     { alignItems:'center', gap:12 },
    scoreMid:     { alignItems:'center', width:'100%' },
    pageLabel:    { fontSize:12, color:INK3, letterSpacing:5, fontWeight:'300' },
    pageLabelSub: { fontSize:12, color:INK3, letterSpacing:2, marginTop:4, opacity:0.8 },
    inkLine:      { width:40, height:1, backgroundColor:`${INK}40`, marginVertical:16 },
    mainWord: { fontSize:28, color:INK2, letterSpacing:7, fontWeight:'300' },
    subWord:  { fontSize:14, color:INK2, letterSpacing:1.5, fontWeight:'300', textAlign:'center', opacity:0.8 },
    moonRow:       { flexDirection:'row', gap:8, alignItems:'center' },
    moonBtn:       { width:52, height:52, alignItems:'center', justifyContent:'center', borderRadius:26, borderWidth:1, borderColor:'transparent' },
    moonBtnActive: { borderColor:`${INK}33`, backgroundColor:`${INK}0a` },
    sliderWrap:  { width:width-80, paddingVertical:20 },
    sliderTrack: { width:'100%', height:1, backgroundColor:`${INK}26`, justifyContent:'center' },
    sliderThumb: { width:36, height:36, borderRadius:18, backgroundColor: T.bgCard, borderWidth:1, borderColor:`${INK}2e`, alignItems:'center', justifyContent:'center', marginTop:-18 },
    thumbDot:    { width:8, height:8, borderRadius:4, backgroundColor:GOLD, opacity:0.75 },
    scoreLabel:  { fontSize:28, color:INK, letterSpacing:5, fontWeight:'200' },
    slideHint:   { fontSize:11, color:INK3, letterSpacing:1.5, opacity:0.5, fontStyle:'italic', marginTop:6 },
    progressWrap: { width:'100%', height:1, backgroundColor:`${INK}14`, position:'absolute', top:0 },
    progressBar:  { height:1, backgroundColor:`${INK}40` },
    cardStage:    { flex:1, width:'100%', alignItems:'center', justifyContent:'center' },
    card:         { width:width-64, height:height*0.44, backgroundColor: T.bgCard, borderRadius: T.radiusCard, borderWidth:1, borderColor:`${INK}14`, padding:32, justifyContent:'space-between', overflow:'hidden' },
    cardBg:       { position:'absolute', width:width-80, height:height*0.42, backgroundColor: T.bgMist, borderRadius: T.radiusCard, top:12 },
    cardNum:      { fontSize:11, color:INK3, letterSpacing:3, opacity:0.5 },
    cardMainWord: { fontSize:30, color:INK, letterSpacing:5, fontWeight:'300', textAlign:'center' },
    cardHairline: { width:24, height:1, backgroundColor:`${INK}26` },
    cardSub:      { fontSize:14, color:INK2, letterSpacing:1, textAlign:'center', lineHeight:22, opacity:0.82 },
    cardHint:     { fontSize:10, color:INK3, letterSpacing:1.5, opacity:0.4, textAlign:'right' },
    reflectNote:  { fontSize:12, color:INK2, letterSpacing:1.5, textAlign:'center', opacity:0.7 },
    hairline:       { width:32, height:1, backgroundColor:`${INK}26`, marginVertical:20 },
    quote:          { fontSize:13, color:INK2, letterSpacing:1, fontStyle:'italic', opacity:0.75, textAlign:'center', lineHeight:21 },
    summaryBox:     { width:'100%', borderWidth:1, borderColor:`${INK}1a`, padding:24, gap:20 },
    summaryRow:     { flexDirection:'row', alignItems:'center', gap:16 },
    summaryText:    { fontSize:15, color:INK2, letterSpacing:2, fontWeight:'400' },
    summaryDivider: { height:1, backgroundColor:`${INK}14` },
    btn:           { borderWidth:1, borderColor:`${INK}38`, paddingHorizontal:32, paddingVertical:14, borderRadius: T.radiusBtn, alignItems:'center' },
    btnText:       { fontSize:13, color:INK2, letterSpacing:3, fontWeight:'400' },
    wabiConcept:   { fontSize:22, color:INK2, fontStyle:'italic', letterSpacing:1 },
    wabiConceptJp: { fontSize:11, color:INK3, letterSpacing:6, fontWeight:'300', marginTop:2 },
    inkBleed:       { position:'absolute', width:width*0.75, height:width*0.75, borderRadius:width*0.375, backgroundColor:INK, opacity:0.055, top:-width*0.32, left:-width*0.28 },
    bgChar:         { position:'absolute', fontSize:260, color:INK, opacity:0.038, fontWeight:'700', top:height*0.08, right:-16, includeFontPadding:false },
    sealCorner:     { position:'absolute', top:58, right:28, width:38, height:38, backgroundColor:T.gold, alignItems:'center', justifyContent:'center' },
    sealCornerText: { color:'#fff8f0', fontSize:17, fontWeight:'500' },
    inkSubLabel:    { fontSize:11, color:T.gold, letterSpacing:8, fontWeight:'300', marginBottom:8, opacity:0.85 },
  });
}
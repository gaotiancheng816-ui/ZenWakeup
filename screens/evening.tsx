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

const { width, height } = Dimensions.get('window');

const REFLECTIONS = [
  { label: 'Accomplish', sub: 'What did I bring into the world today?' },
  { label: 'Gratitude',  sub: 'What am I grateful for today?' },
  { label: 'Release',    sub: 'What will I let go of tonight?' },
];

const SCORE_LABELS = ['Heavy','Tired','Neutral','Light','Fulfilled'];
const MOON         = ['🌑','🌒','🌓','🌔','🌕'];

export default function EveningReturnScreen({ onDone }: { onDone?: () => void }) {
  const [phase, setPhase]     = useState<'enter'|'score'|'reflect'|'done'>('enter');
  const [score, setScore]     = useState(2);
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
  const ring1     = useRef(new Animated.Value(0)).current;
  const ring2     = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    cardIdxRef.current = cardIdx;
  }, [cardIdx]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeIn,    { toValue:1, duration:2000, useNativeDriver:true }),
      Animated.spring(moonScale, { toValue:1, useNativeDriver:true, damping:14 }),
    ]).start();
    Animated.loop(Animated.sequence([
      Animated.timing(moonPulse, { toValue:1.04, duration:3000, useNativeDriver:true }),
      Animated.timing(moonPulse, { toValue:1.0,  duration:3000, useNativeDriver:true }),
    ])).start();
    Animated.loop(Animated.sequence([
      Animated.timing(mist1, { toValue:1, duration:9000,  useNativeDriver:true }),
      Animated.timing(mist1, { toValue:0, duration:9000,  useNativeDriver:true }),
    ])).start();
    Animated.loop(Animated.sequence([
      Animated.timing(mist2, { toValue:1, duration:12000, useNativeDriver:true }),
      Animated.timing(mist2, { toValue:0, duration:12000, useNativeDriver:true }),
    ])).start();
    Animated.loop(Animated.sequence([
      Animated.timing(brushY, { toValue:1, duration:15000, useNativeDriver:true }),
      Animated.timing(brushY, { toValue:0, duration:15000, useNativeDriver:true }),
    ])).start();
    const ripple = (anim: Animated.Value, delay: number) => {
      Animated.loop(Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, { toValue:1, duration:4000, useNativeDriver:true }),
        Animated.timing(anim, { toValue:0, duration:0,    useNativeDriver:true }),
      ])).start();
    };
    ripple(ring1, 0);
    ripple(ring2, 2000);
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
          Animated.timing(cardX,    { toValue:-width, duration:300, useNativeDriver:true }),
          Animated.timing(cardOpac, { toValue:0,      duration:300, useNativeDriver:true }),
        ]).start(() => {
          const next = cardIdxRef.current + 1;
          if (next >= REFLECTIONS.length) {
            setPhase('done');
          } else {
            setCardIdx(next);
            cardX.setValue(0);
            cardOpac.setValue(1);
          }
        });
      } else {
        Animated.spring(cardX, { toValue:0, useNativeDriver:true }).start();
      }
    },
  });

  const scoreX = scoreAnim.interpolate({ inputRange:[0,4], outputRange:[0, width-112] });

  const rippleStyle = (anim: Animated.Value) => ({
    opacity:   anim.interpolate({ inputRange:[0,0.2,1], outputRange:[0,0.08,0] }),
    transform: [{ scale: anim.interpolate({ inputRange:[0,1], outputRange:[1,2.8] }) }],
  });

  const Background = () => (
    <>
      <View style={s.mountain1} /><View style={s.mountain2} /><View style={s.mountain3} />
      {[0.60,0.63,0.66].map((pos,i) => (
        <View key={i} style={[s.waterLine, {
          top:height*pos, opacity:0.04+i*0.02,
          width:width*[0.72,0.86,0.68][i], alignSelf:'center',
        }]} />
      ))}
      <Animated.View style={[s.mist1Layer, { transform:[{ translateY: mist1.interpolate({ inputRange:[0,1], outputRange:[0,-10] }) }] }]} />
      <Animated.View style={[s.mist2Layer, { transform:[{ translateX: mist2.interpolate({ inputRange:[0,1], outputRange:[0,14] }) }] }]} />
      <Animated.View style={[s.brushGroup, { transform:[{ translateY: brushY.interpolate({ inputRange:[0,1], outputRange:[0,-14] }) }] }]}>
        {[
          { left:width*0.07, h:95,  op:0.06 },{ left:width*0.13, h:145, op:0.08 },
          { left:width*0.18, h:60,  op:0.05 },{ left:width*0.80, h:115, op:0.07 },
          { left:width*0.86, h:70,  op:0.09 },{ left:width*0.91, h:105, op:0.05 },
        ].map((b,i) => (
          <View key={i} style={{ position:'absolute', left:b.left, bottom:0, width:1.5, height:b.h, backgroundColor:'#2a2e24', opacity:b.op, borderRadius:1 }} />
        ))}
      </Animated.View>
      <View style={s.cornerTL} /><View style={s.cornerBR} />
    </>
  );

  // ── 入场页 ──
  if (phase === 'enter') {
    return (
      <View style={s.root}>
        <StatusBar barStyle="dark-content" />
        <Background />
        <Animated.View style={[s.content, { opacity: fadeIn }]}>
          <Text style={s.pageLabel}>Evening</Text>
          <Text style={s.pageLabelSub}>
            {new Date().toLocaleDateString('en-GB', { weekday:'long', day:'numeric', month:'short' })}
          </Text>
          <View style={{ height: 32 }} />
          <View style={s.stage}>
            <Animated.View style={[s.ripple, rippleStyle(ring1)]} />
            <Animated.View style={[s.ripple, rippleStyle(ring2)]} />
            <Animated.View style={[s.moonOuter, { transform:[{ scale: Animated.multiply(moonScale, moonPulse) }] }]}>
              <View style={s.moonMid}>
                <Text style={s.kanji}>归</Text>
              </View>
            </Animated.View>
          </View>
          <View style={{ height: 28 }} />
          <Text style={s.mainWord}>Return</Text>
          <Text style={s.subWord}>As dusk falls, the mountains recede</Text>
          <View style={{ height: 56 }} />
          <TouchableOpacity style={s.btn} onPress={() => setPhase('score')}>
            <Text style={s.btnText}>Begin evening return  ›</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  }

  // ── 状态评分页 ──
  if (phase === 'score') {
    return (
      <View style={s.root}>
        <StatusBar barStyle="dark-content" />
        <Background />
        <Animated.View style={[s.content, { opacity: fadeIn }]}>
          <Text style={s.mainWord}>Today</Text>
          <Text style={s.subWord}>How was your day?</Text>
          <View style={{ height: 52 }} />
          <View style={s.sliderWrap} {...scorePan.panHandlers}>
            <View style={s.sliderTrack}>
              <Animated.View style={[s.sliderThumb, { transform:[{ translateX: scoreX }] }]}>
                <Text style={s.thumbEmoji}>{MOON[score]}</Text>
              </Animated.View>
            </View>
          </View>
          <View style={{ height: 24 }} />
          <Text style={s.scoreLabel}>{SCORE_LABELS[score]}</Text>
          <View style={s.ticks}>
            {SCORE_LABELS.map((_,i) => (
              <TouchableOpacity key={i} onPress={() => {
                setScore(i);
                scoreBase.current = i;
                scoreAnim.setValue(i);
              }}>
                <View style={[s.tick, i===score && s.tickActive]} />
              </TouchableOpacity>
            ))}
          </View>
          <View style={{ height: 64 }} />
          <TouchableOpacity style={s.btn} onPress={() => setPhase('reflect')}>
            <Text style={s.btnText}>Continue  ›</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  }

  // ── 反思卡片页 ──
  if (phase === 'reflect') {
    const cardRotate = cardX.interpolate({
      inputRange:[-width,0,width], outputRange:['-8deg','0deg','8deg'],
    });
    return (
      <View style={s.root}>
        <StatusBar barStyle="dark-content" />
        <Background />
        <View style={s.progressWrap}>
          <View style={[s.progressBar, { width:`${(cardIdxRef.current/REFLECTIONS.length)*100}%` }]} />
        </View>
        <View style={s.cardStage}>
          {cardIdx+1 < REFLECTIONS.length && <View style={[s.card, s.cardBg]} />}
          <Animated.View
            style={[s.card, { transform:[{ translateX:cardX },{ rotate:cardRotate }], opacity:cardOpac }]}
            {...cardPan.panHandlers}
          >
            <Text style={s.cardNum}>{cardIdx+1}  /  {REFLECTIONS.length}</Text>
            <View style={{ flex:1, justifyContent:'center', alignItems:'center', gap:20 }}>
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

  // ── 完成页 ──
  return (
    <View style={s.root}>
      <StatusBar barStyle="dark-content" />
      <Background />
      <Animated.View style={[s.content, { opacity: fadeIn }]}>
        <Text style={s.kanji}>归</Text>
        <View style={s.hairline} />
        <Text style={s.mainWord}>Complete</Text>
        <Text style={s.subWord}>Today is complete</Text>
        <View style={{ height: 40 }} />
        <View style={s.summaryBox}>
          <View style={s.summaryRow}>
            <Text style={s.summaryIcon}>{MOON[score]}</Text>
            <Text style={s.summaryText}>{SCORE_LABELS[score]}</Text>
          </View>
          <View style={s.summaryDivider} />
          <View style={s.summaryRow}>
            <Text style={s.summaryIcon}>∞</Text>
            <Text style={s.summaryText}>{REFLECTIONS.length} reflections</Text>
          </View>
        </View>
        <View style={{ height: 48 }} />
        <Text style={s.quote}>The way of heaven benefits and does not harm</Text>
        <View style={{ height: 48 }} />
        <TouchableOpacity style={s.btn} onPress={() => onDone && onDone()}>
          <Text style={s.btnText}>View today's summary  ›</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const INK = '#2a2e24', INK2 = '#485040', INK3 = '#7a8472', GOLD = '#8a7040', BG = '#d4d0c8';

const s = StyleSheet.create({
  root:         { flex:1, backgroundColor:BG },
  mountain1:    { position:'absolute', width:width*1.4, height:width*1.4, borderRadius:width*0.7,  backgroundColor:'rgba(30,32,48,0.05)',  bottom:-width*0.95, left:-width*0.2 },
  mountain2:    { position:'absolute', width:width*1.1, height:width*1.1, borderRadius:width*0.55, backgroundColor:'rgba(30,32,48,0.04)',  bottom:-width*0.72, left:width*0.1 },
  mountain3:    { position:'absolute', width:width*0.8, height:width*0.8, borderRadius:width*0.4,  backgroundColor:'rgba(30,32,48,0.03)',  bottom:-width*0.52, right:-width*0.05 },
  waterLine:    { position:'absolute', height:1, backgroundColor:'#1e2030' },
  mist1Layer:   { position:'absolute', width:width*1.3, height:80,  borderRadius:40, backgroundColor:'rgba(220,216,206,0.5)',  bottom:height*0.24, left:-width*0.15 },
  mist2Layer:   { position:'absolute', width:width*0.85, height:50, borderRadius:25, backgroundColor:'rgba(220,216,206,0.35)', bottom:height*0.29, right:-width*0.1 },
  brushGroup:   { position:'absolute', bottom:height*0.13, left:0, right:0, height:170 },
  cornerTL:     { position:'absolute', width:100, height:100, borderRadius:50, borderWidth:1, borderColor:'rgba(30,32,48,0.07)', top:-30, left:-30 },
  cornerBR:     { position:'absolute', width:70,  height:70,  borderRadius:35, borderWidth:1, borderColor:'rgba(30,32,48,0.06)', bottom:70, right:-15 },

  content:      { flex:1, alignItems:'center', justifyContent:'center', paddingHorizontal:40 },
  pageLabel:    { fontSize:11, color:INK3, letterSpacing:8, fontWeight:'300' },
  pageLabelSub: { fontSize:11, color:INK3, letterSpacing:4, marginTop:4, opacity:0.7 },

  stage:     { width:220, height:220, alignItems:'center', justifyContent:'center' },
  ripple:    { position:'absolute', width:180, height:180, borderRadius:90, borderWidth:1, borderColor:'#2a2e24' },
  moonOuter: { width:180, height:180, borderRadius:90, borderWidth:1, borderColor:'rgba(30,32,48,0.15)', backgroundColor:'rgba(220,216,206,0.65)', alignItems:'center', justifyContent:'center' },
  moonMid:   { width:140, height:140, borderRadius:70, borderWidth:0.5, borderColor:'rgba(30,32,48,0.09)', alignItems:'center', justifyContent:'center' },
  kanji:     { fontSize:52, color:INK, fontWeight:'200', letterSpacing:4 },

  mainWord:  { fontSize:28, color:INK2, letterSpacing:10, fontWeight:'300' },
  subWord:   { fontSize:13, color:INK2, letterSpacing:3,  fontWeight:'300', marginTop:10, textAlign:'center' },

  sliderWrap:  { width:width-80, paddingVertical:20 },
  sliderTrack: { width:'100%', height:1, backgroundColor:'rgba(30,32,48,0.15)', justifyContent:'center' },
  sliderThumb: { width:52, height:52, borderRadius:26, backgroundColor:'rgba(220,216,206,0.9)', borderWidth:1, borderColor:'rgba(30,32,48,0.18)', alignItems:'center', justifyContent:'center', marginTop:-26 },
  thumbEmoji:  { fontSize:26 },
  scoreLabel:  { fontSize:28, color:INK, letterSpacing:6, fontWeight:'200' },
  ticks:       { flexDirection:'row', justifyContent:'space-between', width:width-80, marginTop:20 },
  tick:        { width:4, height:4, borderRadius:2, backgroundColor:'rgba(30,32,48,0.15)' },
  tickActive:  { backgroundColor:INK, width:6, height:6, borderRadius:3, marginTop:-1 },

  progressWrap:   { width:'100%', height:1, backgroundColor:'rgba(30,32,48,0.08)', position:'absolute', top:0 },
  progressBar:    { height:1, backgroundColor:'rgba(30,32,48,0.25)' },
  cardStage:      { flex:1, width:'100%', alignItems:'center', justifyContent:'center' },
  card:           { width:width-64, height:height*0.44, backgroundColor:'rgba(234,230,220,0.85)', borderRadius:8, borderWidth:1, borderColor:'rgba(30,32,48,0.08)', padding:32, justifyContent:'space-between' },
  cardBg:         { position:'absolute', width:width-80, height:height*0.42, backgroundColor:'rgba(220,216,206,0.5)', borderRadius:8, top:12 },
  cardNum:        { fontSize:10, color:INK3, letterSpacing:4, opacity:0.45 },
  cardMainWord:   { fontSize:32, color:INK, letterSpacing:6, fontWeight:'200', textAlign:'center' },
  cardHairline:   { width:24, height:1, backgroundColor:'rgba(30,32,48,0.15)' },
  cardSub:        { fontSize:13, color:INK2, letterSpacing:1, textAlign:'center', lineHeight:20 },
  cardHint:       { fontSize:9, color:INK3, letterSpacing:2, opacity:0.35, textAlign:'right' },
  reflectNote:    { fontSize:11, color:INK2, letterSpacing:2, textAlign:'center' },

  hairline:       { width:32, height:1, backgroundColor:'rgba(42,46,36,0.15)', marginVertical:24 },
  quote:          { fontSize:12, color:INK2, letterSpacing:1, fontStyle:'italic', opacity:0.65, textAlign:'center', lineHeight:20 },
  summaryBox:     { width:'100%', borderWidth:1, borderColor:'rgba(30,32,48,0.1)', padding:24, gap:20 },
  summaryRow:     { flexDirection:'row', alignItems:'center', gap:16 },
  summaryIcon:    { fontSize:22, width:32 },
  summaryText:    { fontSize:15, color:INK2, letterSpacing:3, fontWeight:'300' },
  summaryDivider: { height:1, backgroundColor:'rgba(30,32,48,0.08)' },

  btn:     { borderWidth:1, borderColor:'rgba(30,32,48,0.22)', paddingHorizontal:32, paddingVertical:14, borderRadius:2 },
  btnText: { fontSize:13, color:INK2, letterSpacing:4, fontWeight:'300' },
});
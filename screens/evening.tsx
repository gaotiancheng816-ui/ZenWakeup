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
  { zh: '今天，我做到了什么？', en: 'What did I accomplish today?' },
  { zh: '今天，我感恩什么？',   en: 'What am I grateful for today?' },
  { zh: '今天，我放下什么？',   en: 'What will I release from today?' },
];

const SCORE_LABELS = [
  { zh: '沉重', en: 'Heavy' },
  { zh: '疲惫', en: 'Tired' },
  { zh: '平静', en: 'Neutral' },
  { zh: '轻盈', en: 'Light' },
  { zh: '圆满', en: 'Fulfilled' },
];

export default function EveningReturnScreen({ onDone }: { onDone?: () => void }) {
  const [phase, setPhase]   = useState<'enter' | 'score' | 'reflect' | 'done'>('enter');
  const [score, setScore]   = useState(2);
  const [cardIdx, setCardIdx] = useState(0);

  const fadeIn    = useRef(new Animated.Value(0)).current;
  const moonScale = useRef(new Animated.Value(0.85)).current;
  const cardX     = useRef(new Animated.Value(0)).current;
  const cardOpac  = useRef(new Animated.Value(1)).current;
  const scoreAnim = useRef(new Animated.Value(2)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeIn,    { toValue:1, duration:2000, useNativeDriver:true }),
      Animated.spring(moonScale, { toValue:1, useNativeDriver:true, damping:14 }),
    ]).start();
  }, []);

  const scorePan = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (_, g) => {
      const newScore = Math.max(0, Math.min(4, Math.round(2 + g.dx / 40)));
      if (newScore !== score) {
        setScore(newScore);
        Animated.spring(scoreAnim, { toValue: newScore, useNativeDriver: false, damping: 15 }).start();
      }
    },
  })).current;

  const cardPan = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (_, g) => cardX.setValue(g.dx),
    onPanResponderRelease: (_, g) => {
      if (g.dx < -60) {
        Animated.parallel([
          Animated.timing(cardX,    { toValue: -width, duration: 300, useNativeDriver: true }),
          Animated.timing(cardOpac, { toValue: 0,      duration: 300, useNativeDriver: true }),
        ]).start(() => {
          const next = cardIdx + 1;
          if (next >= REFLECTIONS.length) {
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
  })).current;

  const scoreX = scoreAnim.interpolate({
    inputRange: [0, 4],
    outputRange: [0, width - 80],
  });

  if (phase === 'enter') {
    return (
      <View style={s.root}>
        <StatusBar barStyle="dark-content" />
        <Animated.View style={[s.center, { opacity: fadeIn }]}>
          <Text style={s.timeLabel}>归</Text>
          <Text style={s.timeLabelEn}>Evening Return</Text>
          <View style={{ height: 48 }} />
          <Animated.View style={[s.moonWrap, { transform:[{ scale: moonScale }] }]}>
            <View style={s.moonCircle}>
              <Text style={s.moonChar}>月</Text>
            </View>
          </Animated.View>
          <View style={{ height: 40 }} />
          <Text style={s.enterQuote}>日暮苍山远</Text>
          <Text style={s.enterQuoteEn}>As dusk falls, the mountains recede</Text>
          <View style={{ height: 56 }} />
          <TouchableOpacity style={s.btn} onPress={() => setPhase('score')}>
            <Text style={s.btnText}>开始今日归省  ›</Text>
            <Text style={s.btnEn}>Begin evening return</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  }

  if (phase === 'score') {
    return (
      <View style={s.root}>
        <StatusBar barStyle="dark-content" />
        <Animated.View style={[s.center, { opacity: fadeIn }]}>
          <Text style={s.sectionTitle}>今天的状态</Text>
          <Text style={s.sectionTitleEn}>How was your day?</Text>
          <View style={{ height: 56 }} />
          <View style={s.sliderWrap} {...scorePan.panHandlers}>
            <View style={s.sliderTrack}>
              <Animated.View style={[s.sliderThumb, { transform:[{ translateX: scoreX }] }]}>
                <Text style={s.thumbEmoji}>
                  {['🌑','🌒','🌓','🌔','🌕'][score]}
                </Text>
              </Animated.View>
            </View>
          </View>
          <View style={{ height: 24 }} />
          <Text style={s.scoreLabel}>{SCORE_LABELS[score].zh}</Text>
          <Text style={s.scoreLabelEn}>{SCORE_LABELS[score].en}</Text>
          <View style={s.ticks}>
            {SCORE_LABELS.map((_, i) => (
              <TouchableOpacity key={i} onPress={() => { setScore(i); scoreAnim.setValue(i); }}>
                <View style={[s.tick, i === score && s.tickActive]} />
              </TouchableOpacity>
            ))}
          </View>
          <View style={{ height: 64 }} />
          <TouchableOpacity style={s.btn} onPress={() => setPhase('reflect')}>
            <Text style={s.btnText}>继续  ›</Text>
            <Text style={s.btnEn}>Continue</Text>
          </TouchableOpacity>
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
        <View style={s.progressWrap}>
          <View style={[s.progressBar, { width: `${(cardIdx / REFLECTIONS.length) * 100}%` }]} />
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
            <Text style={s.cardNum}>{cardIdx + 1} / {REFLECTIONS.length}</Text>
            <View style={{ flex: 1, justifyContent: 'center' }}>
              <Text style={s.cardZh}>{REFLECTIONS[cardIdx].zh}</Text>
              <Text style={s.cardEn}>{REFLECTIONS[cardIdx].en}</Text>
            </View>
            <Text style={s.cardHint}>向左滑动  ›</Text>
            <Text style={s.cardHintEn}>swipe left to continue</Text>
          </Animated.View>
        </View>
        <Text style={s.reflectNote}>在心中默默回答即可，无需言说</Text>
        <Text style={s.reflectNoteEn}>Answer silently within yourself</Text>
        <View style={{ height: 40 }} />
      </View>
    );
  }

  return (
    <View style={s.root}>
      <StatusBar barStyle="dark-content" />
      <Animated.View style={[s.center, { opacity: fadeIn }]}>
        <Text style={s.doneChar}>归</Text>
        <View style={s.hairline} />
        <Text style={s.doneTitle}>今日已归</Text>
        <Text style={s.doneTitleEn}>Today is complete</Text>
        <View style={{ height: 32 }} />
        <Text style={s.doneQuote}>天之道，利而不害</Text>
        <Text style={s.doneQuoteEn}>The way of heaven benefits and does not harm</Text>
        <View style={{ height: 48 }} />
        <View style={s.summaryBox}>
          <Text style={s.summaryItem}>今日状态　{SCORE_LABELS[score].zh}  {['🌑','🌒','🌓','🌔','🌕'][score]}</Text>
          <View style={s.summaryLine} />
          <Text style={s.summaryItem}>反思完成　{REFLECTIONS.length} / {REFLECTIONS.length}</Text>
        </View>
        <View style={{ height: 48 }} />
        <TouchableOpacity style={s.btn} onPress={() => onDone && onDone()}>
          <Text style={s.btnText}>查看今日成果  ›</Text>
          <Text style={s.btnEn}>View today's summary</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const INK = '#2a2e24', INK2 = '#485040', INK3 = '#7a8472';
const NIGHT = '#1e2030';

const s = StyleSheet.create({
  root:           { flex:1, backgroundColor:'#d4d0c8', alignItems:'center', justifyContent:'center' },
  center:         { alignItems:'center', width:'100%', paddingHorizontal:36 },
  timeLabel:      { fontSize:64, color:NIGHT, fontWeight:'100', letterSpacing:8 },
  timeLabelEn:    { fontSize:11, color:INK3,  letterSpacing:6, marginTop:4, fontWeight:'300' },
  moonWrap:       { width:130, height:130, alignItems:'center', justifyContent:'center' },
  moonCircle:     { width:110, height:110, borderRadius:55, borderWidth:1, borderColor:'rgba(30,32,48,0.15)', backgroundColor:'rgba(220,216,206,0.7)', alignItems:'center', justifyContent:'center' },
  moonChar:       { fontSize:40, color:NIGHT, fontWeight:'100', opacity:0.7 },
  enterQuote:     { fontSize:18, color:INK2, letterSpacing:5, fontWeight:'300' },
  enterQuoteEn:   { fontSize:10, color:INK3, letterSpacing:1, fontStyle:'italic', marginTop:8, opacity:0.6 },
  sectionTitle:   { fontSize:24, color:NIGHT, letterSpacing:6, fontWeight:'200' },
  sectionTitleEn: { fontSize:11, color:INK3,  letterSpacing:4, marginTop:6, fontWeight:'300' },
  sliderWrap:     { width:width - 80, paddingVertical:20 },
  sliderTrack:    { width:'100%', height:1, backgroundColor:'rgba(30,32,48,0.15)', justifyContent:'center' },
  sliderThumb:    { width:44, height:44, borderRadius:22, backgroundColor:'rgba(220,216,206,0.9)', borderWidth:1, borderColor:'rgba(30,32,48,0.15)', alignItems:'center', justifyContent:'center', marginTop:-22 },
  thumbEmoji:     { fontSize:22 },
  scoreLabel:     { fontSize:20, color:NIGHT, letterSpacing:6, fontWeight:'200' },
  scoreLabelEn:   { fontSize:11, color:INK3,  letterSpacing:3, marginTop:4, fontStyle:'italic', opacity:0.6 },
  ticks:          { flexDirection:'row', justifyContent:'space-between', width:width - 80, marginTop:16 },
  tick:           { width:4, height:4, borderRadius:2, backgroundColor:'rgba(30,32,48,0.15)' },
  tickActive:     { backgroundColor:NIGHT, width:6, height:6, borderRadius:3, marginTop:-1 },
  cardStage:      { flex:1, width:'100%', alignItems:'center', justifyContent:'center' },
  card:           { width:width - 64, height:height * 0.42, backgroundColor:'rgba(234,230,220,0.85)', borderRadius:8, borderWidth:1, borderColor:'rgba(30,32,48,0.1)', padding:32, justifyContent:'space-between' },
  cardBg:         { position:'absolute', width:width - 80, height:height * 0.40, backgroundColor:'rgba(220,216,206,0.5)', borderRadius:8, top:12 },
  cardNum:        { fontSize:10, color:INK3, letterSpacing:4, opacity:0.5 },
  cardZh:         { fontSize:20, color:NIGHT, letterSpacing:4, fontWeight:'200', lineHeight:36, textAlign:'center' },
  cardEn:         { fontSize:11, color:INK3,  letterSpacing:1, fontStyle:'italic', textAlign:'center', marginTop:12, opacity:0.6 },
  cardHint:       { fontSize:10, color:INK3,  letterSpacing:3, opacity:0.4, textAlign:'right' },
  cardHintEn:     { fontSize:9,  color:INK3,  letterSpacing:1, opacity:0.3, textAlign:'right', fontStyle:'italic' },
  reflectNote:    { fontSize:11, color:INK3, letterSpacing:2, opacity:0.5 },
  reflectNoteEn:  { fontSize:9,  color:INK3, letterSpacing:1, opacity:0.35, fontStyle:'italic', marginTop:4 },
  progressWrap:   { width:'100%', height:1, backgroundColor:'rgba(30,32,48,0.08)', position:'absolute', top:0 },
  progressBar:    { height:1, backgroundColor:'rgba(30,32,48,0.25)' },
  hairline:       { width:32, height:1, backgroundColor:'rgba(30,32,48,0.15)', marginVertical:24 },
  doneChar:       { fontSize:64, color:NIGHT, fontWeight:'100', letterSpacing:8, opacity:0.8 },
  doneTitle:      { fontSize:22, color:NIGHT, letterSpacing:6, fontWeight:'300' },
  doneTitleEn:    { fontSize:10, color:INK3,  letterSpacing:4, marginTop:6 },
  doneQuote:      { fontSize:15, color:INK2,  letterSpacing:4, fontWeight:'300' },
  doneQuoteEn:    { fontSize:10, color:INK3,  letterSpacing:1, fontStyle:'italic', opacity:0.6, marginTop:8 },
  summaryBox:     { width:'100%', borderWidth:1, borderColor:'rgba(30,32,48,0.1)', padding:24, gap:16 },
  summaryItem:    { fontSize:13, color:INK2, letterSpacing:3, fontWeight:'300' },
  summaryLine:    { height:1, backgroundColor:'rgba(30,32,48,0.08)' },
  btn:            { borderWidth:1, borderColor:'rgba(30,32,48,0.2)', paddingHorizontal:32, paddingVertical:14, borderRadius:2, alignItems:'center', gap:4 },
  btnText:        { fontSize:13, color:INK2, letterSpacing:4, fontWeight:'300' },
  btnEn:          { fontSize:10, color:INK3, letterSpacing:2, opacity:0.6, fontStyle:'italic' },
});
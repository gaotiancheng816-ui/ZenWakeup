import { useEffect, useRef } from 'react';
import {
    Animated,
    Dimensions,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Svg, { Circle, Ellipse, Line, Path } from 'react-native-svg';

const { width, height } = Dimensions.get('window');
const INK = '#2a2e24', INK2 = '#485040', INK3 = '#7a8472', BG = '#dedad2';

// 坐禅人物SVG
function ZenFigure() {
  return (
    <Svg width={220} height={220} viewBox="0 0 220 220">
      {/* 地面线 */}
      <Line x1="30" y1="175" x2="190" y2="175" stroke={INK} strokeWidth="1" opacity="0.2"/>

      {/* 坐垫 */}
      <Ellipse cx="110" cy="172" rx="52" ry="10" fill={INK} opacity="0.12"/>

      {/* 盘腿 左腿 */}
      <Path d="M75,155 Q65,165 60,162 Q55,158 70,152 Z" fill={INK} opacity="0.7"/>
      {/* 盘腿 右腿 */}
      <Path d="M145,155 Q155,165 160,162 Q165,158 150,152 Z" fill={INK} opacity="0.7"/>

      {/* 身体 */}
      <Path
        d="M90,155 Q88,130 92,115 Q95,105 110,103 Q125,105 128,115 Q132,130 130,155 Z"
        fill={INK} opacity="0.75"
      />

      {/* 双手合十 / 禅定印 */}
      <Ellipse cx="110" cy="148" rx="16" ry="8" fill={INK} opacity="0.6"/>

      {/* 颈部 */}
      <Path d="M104,103 Q110,98 116,103" fill={INK} opacity="0.6"/>

      {/* 头部 */}
      <Circle cx="110" cy="88" r="18" fill={INK} opacity="0.72"/>

      {/* 呼吸圆圈 — 从头顶发散 */}
      <Circle cx="110" cy="60" r="12" fill="none" stroke={INK} strokeWidth="1" opacity="0.2"/>
      <Circle cx="110" cy="60" r="22" fill="none" stroke={INK} strokeWidth="0.8" opacity="0.12"/>
      <Circle cx="110" cy="60" r="34" fill="none" stroke={INK} strokeWidth="0.6" opacity="0.07"/>

      {/* 水墨装饰点 */}
      <Circle cx="58" cy="140" r="2" fill={INK} opacity="0.15"/>
      <Circle cx="54" cy="148" r="1.2" fill={INK} opacity="0.1"/>
      <Circle cx="162" cy="138" r="1.8" fill={INK} opacity="0.13"/>
      <Circle cx="166" cy="146" r="1" fill={INK} opacity="0.08"/>

      {/* 地面水墨晕 */}
      <Ellipse cx="110" cy="178" rx="70" ry="6" fill={INK} opacity="0.04"/>
    </Svg>
  );
}

interface Props {
  onReady: () => void;
}

export default function ZenGuideScreen({ onReady }: Props) {
  const fadeIn  = useRef(new Animated.Value(0)).current;
  const figureY = useRef(new Animated.Value(12)).current;
  const mist1   = useRef(new Animated.Value(0)).current;
  const brushY  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeIn,  { toValue:1, duration:1800, useNativeDriver:true }),
      Animated.spring(figureY, { toValue:0, useNativeDriver:true, damping:14, mass:0.9 }),
    ]).start();
    Animated.loop(Animated.sequence([
      Animated.timing(mist1, { toValue:1, duration:9000, useNativeDriver:true }),
      Animated.timing(mist1, { toValue:0, duration:9000, useNativeDriver:true }),
    ])).start();
    Animated.loop(Animated.sequence([
      Animated.timing(brushY, { toValue:1, duration:15000, useNativeDriver:true }),
      Animated.timing(brushY, { toValue:0, duration:15000, useNativeDriver:true }),
    ])).start();
  }, []);

  return (
    <View style={s.root}>
      {/* 背景 */}
      <View style={s.mountain1} />
      <View style={s.mountain2} />
      <View style={s.mountain3} />
      {[0.38, 0.42, 0.46].map((pos, i) => (
        <View key={i} style={[s.waterLine, {
          top: height * pos,
          opacity: 0.03 + i * 0.012,
          width: width * [0.7, 0.82, 0.65][i],
          alignSelf: 'center',
        }]} />
      ))}
      <Animated.View style={[s.mistLayer, {
        transform: [{ translateY: mist1.interpolate({ inputRange:[0,1], outputRange:[0,-10] }) }]
      }]} />
      <Animated.View style={[s.brushGroup, {
        transform: [{ translateY: brushY.interpolate({ inputRange:[0,1], outputRange:[0,-14] }) }]
      }]}>
        {[
          { left:width*0.05, h:100, op:0.05 }, { left:width*0.10, h:150, op:0.07 },
          { left:width*0.15, h:65,  op:0.04 }, { left:width*0.79, h:120, op:0.06 },
          { left:width*0.85, h:80,  op:0.08 }, { left:width*0.90, h:100, op:0.05 },
        ].map((b, i) => (
          <View key={i} style={{
            position:'absolute', left:b.left, bottom:0,
            width:1.5, height:b.h, backgroundColor:'#1e2030',
            opacity:b.op, borderRadius:1,
          }} />
        ))}
      </Animated.View>
      <View style={s.cornerTL} />
      <View style={s.cornerBR} />

      <Animated.View style={[s.content, { opacity: fadeIn }]}>

        {/* 标题 */}
        <Text style={s.title}>Before we begin</Text>
        <View style={s.inkLine} />
        <View style={{ height: 32 }} />

        {/* SVG 人物 */}
        <Animated.View style={{ transform: [{ translateY: figureY }] }}>
          <ZenFigure />
        </Animated.View>

        <View style={{ height: 28 }} />

        {/* 说明文字 */}
        <View style={s.guideList}>
          {[
            { num: '一', text: 'Find a comfortable seated position' },
            { num: '二', text: 'Rest your hands gently on your lap' },
            { num: '三', text: 'Close your eyes or soften your gaze' },
            { num: '四', text: 'Let your breath be natural · no effort' },
          ].map((item, i) => (
            <View key={i} style={s.guideRow}>
              <Text style={s.guideNum}>{item.num}</Text>
              <Text style={s.guideText}>{item.text}</Text>
            </View>
          ))}
        </View>

        <View style={{ height: 48 }} />

        <Text style={s.hint}>A 5-minute guided session awaits you</Text>

        <View style={{ height: 24 }} />

        <TouchableOpacity style={s.btn} onPress={onReady}>
          <Text style={s.btnText}>I am ready  ›</Text>
        </TouchableOpacity>

      </Animated.View>
    </View>
  );
}

const s = StyleSheet.create({
  root:    { flex:1, backgroundColor:BG },
  content: { flex:1, alignItems:'center', justifyContent:'center', paddingHorizontal:40 },

  mountain1:  { position:'absolute', width:width*1.4, height:width*1.4, borderRadius:width*0.7,  backgroundColor:'rgba(30,32,48,0.04)',  top:height*0.45, left:-width*0.2 },
  mountain2:  { position:'absolute', width:width*1.1, height:width*1.1, borderRadius:width*0.55, backgroundColor:'rgba(30,32,48,0.03)',  top:height*0.48, left:width*0.1 },
  mountain3:  { position:'absolute', width:width*0.8, height:width*0.8, borderRadius:width*0.4,  backgroundColor:'rgba(30,32,48,0.025)', top:height*0.50, right:-width*0.05 },
  waterLine:  { position:'absolute', height:1, backgroundColor:'#1e2030' },
  mistLayer:  { position:'absolute', width:width*1.3, height:80, borderRadius:40, backgroundColor:'rgba(220,216,206,0.4)', top:height*0.32, left:-width*0.15 },
  brushGroup: { position:'absolute', top:height*0.25, left:0, right:0, height:180 },
  cornerTL:   { position:'absolute', width:100, height:100, borderRadius:50, borderWidth:1, borderColor:'rgba(30,32,48,0.06)', top:-30, left:-30 },
  cornerBR:   { position:'absolute', width:70,  height:70,  borderRadius:35, borderWidth:1, borderColor:'rgba(30,32,48,0.05)', top:height*0.55, right:-15 },

  title:   { fontSize:22, color:INK2, letterSpacing:6, fontWeight:'300', marginBottom:16 },
  inkLine: { width:40, height:1, backgroundColor:'rgba(42,46,36,0.25)' },

  guideList: { width:'100%', gap:16 },
  guideRow:  { flexDirection:'row', alignItems:'flex-start', gap:16 },
  guideNum:  { fontSize:13, color:INK3, letterSpacing:2, fontWeight:'300', width:20, marginTop:1 },
  guideText: { fontSize:13, color:INK2, letterSpacing:1.5, fontWeight:'300', flex:1, lineHeight:22 },

  hint:    { fontSize:11, color:INK3, letterSpacing:3, opacity:0.6 },
  btn:     { borderWidth:1, borderColor:'rgba(42,46,36,0.25)', paddingHorizontal:40, paddingVertical:16, borderRadius:2 },
  btnText: { fontSize:13, color:INK2, letterSpacing:4, fontWeight:'300' },
});

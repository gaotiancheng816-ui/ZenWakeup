import { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Svg, { Circle, Line, Path } from 'react-native-svg';

const { width, height } = Dimensions.get('window');
const INK = '#2a2e24', INK2 = '#485040', INK3 = '#7a8472', GOLD = '#8a7040', BG = '#dedad2';

export default function ZenGuideScreen({ onReady }: { onReady: () => void }) {
  const fadeIn = useRef(new Animated.Value(0)).current;
  const mist1  = useRef(new Animated.Value(0)).current;
  const brushY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeIn, { toValue: 1, duration: 1800, useNativeDriver: true }).start();
    Animated.loop(Animated.sequence([
      Animated.timing(mist1,  { toValue: 1, duration: 9000,  useNativeDriver: true }),
      Animated.timing(mist1,  { toValue: 0, duration: 9000,  useNativeDriver: true }),
    ])).start();
    Animated.loop(Animated.sequence([
      Animated.timing(brushY, { toValue: 1, duration: 15000, useNativeDriver: true }),
      Animated.timing(brushY, { toValue: 0, duration: 15000, useNativeDriver: true }),
    ])).start();
  }, []);

  return (
    <View style={s.root}>
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

        {/* 三个图标横排 */}
        <View style={s.iconRow}>
          {/* Morning — sun */}
          <View style={s.iconCol}>
            <Svg width={60} height={60} viewBox="0 0 60 60">
              <Circle cx={30} cy={30} r={12} fill="none" stroke={GOLD} strokeWidth={1.1} opacity={0.65}/>
              <Circle cx={30} cy={30} r={4}  fill={GOLD} opacity={0.45}/>
              <Line x1={30} y1={12} x2={30} y2={15} stroke={GOLD} strokeWidth={0.9} opacity={0.45}/>
              <Line x1={30} y1={45} x2={30} y2={48} stroke={GOLD} strokeWidth={0.9} opacity={0.45}/>
              <Line x1={12} y1={30} x2={15} y2={30} stroke={GOLD} strokeWidth={0.9} opacity={0.45}/>
              <Line x1={45} y1={30} x2={48} y2={30} stroke={GOLD} strokeWidth={0.9} opacity={0.45}/>
              <Line x1={17} y1={17} x2={19} y2={19} stroke={GOLD} strokeWidth={0.8} opacity={0.32}/>
              <Line x1={41} y1={41} x2={43} y2={43} stroke={GOLD} strokeWidth={0.8} opacity={0.32}/>
              <Line x1={43} y1={17} x2={41} y2={19} stroke={GOLD} strokeWidth={0.8} opacity={0.32}/>
              <Line x1={19} y1={41} x2={17} y2={43} stroke={GOLD} strokeWidth={0.8} opacity={0.32}/>
            </Svg>
            <Text style={s.iconLabel}>Morning</Text>
          </View>

          {/* Daytime — ripple */}
          <View style={s.iconCol}>
            <Svg width={60} height={60} viewBox="0 0 60 60">
              <Circle cx={30} cy={30} r={20} fill="none" stroke={INK} strokeWidth={0.5} opacity={0.10}/>
              <Circle cx={30} cy={30} r={14} fill="none" stroke={INK} strokeWidth={0.6} opacity={0.16}/>
              <Circle cx={30} cy={30} r={9}  fill="none" stroke={INK} strokeWidth={0.8} opacity={0.26}/>
              <Circle cx={30} cy={30} r={5}  fill="none" stroke={INK} strokeWidth={1.0} opacity={0.38}/>
              <Circle cx={30} cy={30} r={2}  fill={GOLD} opacity={0.65}/>
            </Svg>
            <Text style={s.iconLabel}>Daytime</Text>
          </View>

          {/* Evening — crescent */}
          <View style={s.iconCol}>
            <Svg width={60} height={60} viewBox="0 0 60 60">
              <Path
                d="M30 14 A16 16 0 1 1 30 46 A10 10 0 1 0 30 14Z"
                fill="none" stroke={INK2} strokeWidth={1.1} opacity={0.55}/>
              <Circle cx={40} cy={20} r={1.5} fill={GOLD} opacity={0.4}/>
              <Circle cx={44} cy={28} r={1.0} fill={GOLD} opacity={0.3}/>
            </Svg>
            <Text style={s.iconLabel}>Evening</Text>
          </View>
        </View>

        <View style={{ height: 40 }} />
        <View style={s.inkLine} />
        <View style={{ height: 32 }} />

        <Text style={s.title}>Three daily rituals.</Text>
        <View style={{ height: 16 }} />
        <Text style={s.sub}>
          Morning meditation.{'\n'}
          Daytime awareness.{'\n'}
          Evening reflection.{'\n\n'}
          That is enough.
        </Text>

        <View style={{ height: 56 }} />

        <TouchableOpacity style={s.btn} onPress={onReady}>
          <Text style={s.btnText}>Next  ›</Text>
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
  iconRow:   { flexDirection:'row', gap:32, alignItems:'flex-start' },
  iconCol:   { alignItems:'center', gap:8 },
  iconLabel: { fontSize:11, color:INK3, letterSpacing:2, fontWeight:'300', opacity:0.7 },
  inkLine:   { width:40, height:1, backgroundColor:'rgba(42,46,36,0.25)' },
  title:     { fontSize:22, color:INK2, letterSpacing:4, fontWeight:'300', textAlign:'center' },
  sub:       { fontSize:13, color:INK2, letterSpacing:1.5, fontWeight:'300', textAlign:'center', lineHeight:26, opacity:0.7 },
  btn:       { borderWidth:1, borderColor:'rgba(42,46,36,0.25)', paddingHorizontal:40, paddingVertical:16, borderRadius:2 },
  btnText:   { fontSize:13, color:INK2, letterSpacing:4, fontWeight:'300' },
});
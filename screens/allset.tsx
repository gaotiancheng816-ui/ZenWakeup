import { useEffect, useRef } from 'react';
import {
    Animated,
    Dimensions,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

const { width, height } = Dimensions.get('window');
const INK = '#2a2e24', INK2 = '#485040', GOLD = '#8a7040', BG = '#dedad2';

interface Props {
  onDone: () => void;
}

export default function AllSetScreen({ onDone }: Props) {
  const fadeIn = useRef(new Animated.Value(0)).current;
  const brushY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeIn, { toValue:1, duration:2000, useNativeDriver:true }).start();
    Animated.loop(Animated.sequence([
      Animated.timing(brushY, { toValue:1, duration:15000, useNativeDriver:true }),
      Animated.timing(brushY, { toValue:0, duration:15000, useNativeDriver:true }),
    ])).start();
    const timer = setTimeout(() => onDone(), 4000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={s.root}>
      <View style={s.mountain1} />
      <View style={s.mountain2} />
      <View style={s.mountain3} />
      <Animated.View style={[s.brushGroup, {
        transform: [{ translateY: brushY.interpolate({ inputRange:[0,1], outputRange:[0,-14] }) }],
      }]}>
        {[
          { left:width*0.05, h:100, op:0.05 }, { left:width*0.10, h:150, op:0.07 },
          { left:width*0.79, h:120, op:0.06 }, { left:width*0.90, h:100, op:0.05 },
        ].map((b, i) => (
          <View key={i} style={{
            position:'absolute', left:b.left, bottom:0,
            width:1.5, height:b.h, backgroundColor:'#1e2030',
            opacity:b.op, borderRadius:1,
          }} />
        ))}
      </Animated.View>
      <View style={s.cornerTL} />

      <Animated.View style={[s.content, { opacity: fadeIn }]}>
        <Svg width={100} height={100} viewBox="0 0 90 90">
          <Path
            d="M45 12 A33 33 0 1 1 32 74"
            fill="none" stroke={INK} strokeWidth={4.5}
            strokeLinecap="round" opacity={0.55}/>
          <Circle cx={45} cy={45} r={3}   fill={GOLD} opacity={0.60}/>
          <Circle cx={45} cy={45} r={1.2} fill={GOLD} opacity={0.80}/>
        </Svg>
        <View style={s.hairline} />
        <Text style={s.title}>All set.</Text>
        <View style={{ height:16 }} />
        <Text style={s.sub}>
          {'Your first morning\nbegins tomorrow.\n\nRest well tonight.'}
        </Text>
      </Animated.View>
    </View>
  );
}

const s = StyleSheet.create({
  root:      { flex:1, backgroundColor:BG },
  content:   { flex:1, alignItems:'center', justifyContent:'center', paddingHorizontal:40 },
  mountain1: { position:'absolute', width:width*1.4, height:width*1.4, borderRadius:width*0.7,  backgroundColor:'rgba(30,32,48,0.04)',  top:height*0.45, left:-width*0.2 },
  mountain2: { position:'absolute', width:width*1.1, height:width*1.1, borderRadius:width*0.55, backgroundColor:'rgba(30,32,48,0.03)',  top:height*0.48, left:width*0.1 },
  mountain3: { position:'absolute', width:width*0.8, height:width*0.8, borderRadius:width*0.4,  backgroundColor:'rgba(30,32,48,0.025)', top:height*0.50, right:-width*0.05 },
  brushGroup:{ position:'absolute', top:height*0.25, left:0, right:0, height:180 },
  cornerTL:  { position:'absolute', width:100, height:100, borderRadius:50, borderWidth:1, borderColor:'rgba(30,32,48,0.06)', top:-30, left:-30 },
  hairline:  { width:32, height:1, backgroundColor:'rgba(42,46,36,0.22)', marginVertical:24 },
  title:     { fontSize:28, color:INK2, letterSpacing:8, fontWeight:'300', textAlign:'center' },
  sub:       { fontSize:13, color:INK2, letterSpacing:2, fontWeight:'300', textAlign:'center', lineHeight:26, opacity:0.65 },
});
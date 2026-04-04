import { useEffect, useRef, useState } from 'react';
import {
  Animated, Dimensions, StatusBar, StyleSheet, Text, TouchableOpacity, View,
} from 'react-native';
import Svg, { Circle, Ellipse, Line, Path, Rect } from 'react-native-svg';
import { AppTheme } from '../constants/app-themes';
import { useTheme } from '../utils/theme-context';
import { loadData } from '../utils/storage';

const { width, height } = Dimensions.get('window');

const SVG_W = width - 48;
const SVG_H = Math.round(SVG_W * 0.78);
// coordinate helpers: map a 200×156 virtual canvas onto the actual SVG dimensions
const v = (x: number) => (x / 200) * SVG_W;
const u = (y: number) => (y / 156) * SVG_H;

// ─── 18 stages × 10 days = 180 days ───────────────────────────────────────
const STAGES = [
  { threshold: 1,   name: 'The First Step',   quote: 'The journey of ten thousand steps\nbegins right here' },
  { threshold: 10,  name: 'The Pine',          quote: 'Stand like a pine in winter\nstill, and deeply rooted' },
  { threshold: 20,  name: 'Stone Steps',       quote: 'Each stone step: one breath\neach breath: one step' },
  { threshold: 30,  name: 'The Sun',           quote: 'Light comes not to be seen\nbut to illuminate' },
  { threshold: 40,  name: 'Stone Lantern',     quote: 'The lantern needs no sun\nto light the way within' },
  { threshold: 50,  name: 'The Moon',          quote: 'The moon does not try to shine\nit simply is' },
  { threshold: 60,  name: 'The Stream',        quote: 'Water finds its way\nwithout forcing' },
  { threshold: 70,  name: 'Mountain Shelter',  quote: 'Rest is not the end\nit is part of the path' },
  { threshold: 80,  name: 'Cherry Blossom',    quote: 'The blossom falls\nthe tree deepens' },
  { threshold: 90,  name: 'The Birds',         quote: 'Birds know where they belong\nand go there' },
  { threshold: 100, name: 'First Snow',        quote: 'Snow covers everything\nand uncovers silence' },
  { threshold: 110, name: 'Bamboo Grove',      quote: 'Bamboo bends in the storm\nits roots hold' },
  { threshold: 120, name: 'The Gate',          quote: 'Pass through with empty hands\nand a quiet mind' },
  { threshold: 130, name: 'Mountain Spring',   quote: 'Still water holds the sky\nand asks for nothing' },
  { threshold: 140, name: 'The Second Peak',   quote: 'Beyond the summit\nanother mountain smiles' },
  { threshold: 150, name: 'Temple Bell',       quote: 'The bell fades into silence\nthe silence fades into you' },
  { threshold: 160, name: 'New Growth',        quote: 'Near the top\nthe weight falls away' },
  { threshold: 170, name: 'The Summit',        quote: 'The summit is empty\nand complete' },
];

// Chinese poetry quotes for sumi-e theme (one per stage group)
const SUMIE_QUOTES = [
  '千里之行，始於足下', '独坐幽篁里，弹琴复长啸',
  '横看成岭侧成峰，远近高低各不同', '山静似太古，日长如小年',
  '明月松间照，清泉石上流', '举头望明月，低头思故乡',
  '水善利万物而不争', '此中有真意，欲辨已忘言',
  '无边落木萧萧下，不尽长江滚滚来', '鸟宿池边树，僧敲月下门',
  '千山鸟飞绝，万径人踪灭', '不知细叶谁裁出，二月春风似剪刀',
  '曲径通幽处，禅房花木深', '疏影横斜水清浅，暗香浮动月黄昏',
  '会当凌绝顶，一览众山小', '深山藏古寺，幽径无人知',
  '看似寻常最奇崛，成如容易却艰辛', '行到水穷处，坐看云起时',
];

function getStageIndex(morningDays: number): number {
  for (let i = STAGES.length - 1; i >= 0; i--) {
    if (morningDays >= STAGES[i].threshold) return i;
  }
  return -1;
}

function isNewUnlock(morningDays: number): boolean {
  return morningDays > 0 && STAGES.some(s => s.threshold === morningDays);
}

// ─── Mountain SVG: Geometric (minimal / muji style) ────────────────────────
function GeometricMountain({ stage, t }: { stage: number; t: AppTheme }) {
  const s = (idx: number) => stage >= idx;
  const INK = t.ink, INK2 = t.ink2, GOLD = t.gold, BG = t.bg;
  return (
    <Svg width={SVG_W} height={SVG_H} viewBox={`0 0 ${SVG_W} ${SVG_H}`}>
      <Line x1={v(0)} y1={u(22)} x2={v(200)} y2={u(22)} stroke={INK} strokeWidth={0.3} opacity={0.05}/>
      <Line x1={v(0)} y1={u(44)} x2={v(200)} y2={u(44)} stroke={INK} strokeWidth={0.25} opacity={0.04}/>
      {s(14) && <Path d={`M${v(0)} ${u(86)} L${v(14)} ${u(62)} L${v(28)} ${u(86)}Z`} fill={BG} stroke={INK} strokeWidth={0.5} opacity={0.3}/>}
      <Path d={`M${v(0)} ${u(110)} L${v(22)} ${u(80)} L${v(44)} ${u(110)}Z`} fill="none" stroke={INK} strokeWidth={0.4} opacity={0.12}/>
      <Path d={`M${v(30)} ${u(124)} L${v(100)} ${u(14)} L${v(170)} ${u(124)}Z`} fill={BG} stroke={INK} strokeWidth={0.9} opacity={0.25}/>
      <Path d={`M${v(132)} ${u(124)} L${v(172)} ${u(74)} L${v(200)} ${u(110)}Z`} fill="none" stroke={INK} strokeWidth={0.45} opacity={0.14}/>
      {s(10) && <Path d={`M${v(88)} ${u(28)} L${v(100)} ${u(14)} L${v(112)} ${u(28)} Q${v(100)} ${u(22)} ${v(88)} ${u(28)}Z`} fill={INK} opacity={0.06}/>}
      {s(15) && <>
        <Line x1={v(162)} y1={u(78)} x2={v(162)} y2={u(62)} stroke={INK} strokeWidth={0.5} opacity={0.28}/>
        <Path d={`M${v(156)} ${u(64)} L${v(162)} ${u(59)} L${v(168)} ${u(64)}`} fill="none" stroke={INK} strokeWidth={0.45} opacity={0.26}/>
        <Path d={`M${v(157)} ${u(68)} L${v(162)} ${u(64)} L${v(167)} ${u(68)}`} fill="none" stroke={INK} strokeWidth={0.4} opacity={0.22}/>
        <Path d={`M${v(158)} ${u(72)} L${v(158)} ${u(78)} L${v(166)} ${u(78)} L${v(166)} ${u(72)}`} fill="none" stroke={INK} strokeWidth={0.4} opacity={0.2}/>
      </>}
      <Path d={`M${v(56)} ${u(130)} C${v(68)} ${u(118)} ${v(54)} ${u(107)} ${v(76)} ${u(96)} C${v(94)} ${u(86)} ${v(76)} ${u(75)} ${v(96)} ${u(64)} C${v(112)} ${u(55)} ${v(98)} ${u(44)} ${v(110)} ${u(36)} C${v(120)} ${u(30)} ${v(112)} ${u(22)} ${v(122)} ${u(18)}`}
        fill="none" stroke={INK} strokeWidth={1.1} strokeDasharray="2.5,3.5" opacity={0.2} strokeLinecap="round"/>
      <Line x1={v(0)} y1={u(124)} x2={v(200)} y2={u(124)} stroke={INK} strokeWidth={0.45} opacity={0.18}/>
      <Path d={`M${v(0)} ${u(106)} Q${v(50)} ${u(100)} ${v(100)} ${u(106)} Q${v(150)} ${u(112)} ${v(200)} ${u(106)}`} fill="none" stroke={INK} strokeWidth={0.3} opacity={0.07}/>
      {s(0) && <><Circle cx={v(56)} cy={u(132)} r={v(2.2)} fill="none" stroke={INK} strokeWidth={0.7} opacity={0.42}/><Line x1={v(50)} y1={u(134)} x2={v(62)} y2={u(134)} stroke={INK} strokeWidth={0.4} opacity={0.2}/></>}
      {s(1) && <><Line x1={v(20)} y1={u(124)} x2={v(20)} y2={u(104)} stroke={INK2} strokeWidth={0.95} opacity={0.42}/><Path d={`M${v(13)} ${u(116)} L${v(20)} ${u(104)} L${v(27)} ${u(116)}Z`} fill="none" stroke={INK2} strokeWidth={0.65} opacity={0.38}/><Path d={`M${v(14)} ${u(121)} L${v(20)} ${u(110)} L${v(26)} ${u(121)}Z`} fill="none" stroke={INK2} strokeWidth={0.55} opacity={0.3}/><Line x1={v(178)} y1={u(124)} x2={v(178)} y2={u(110)} stroke={INK2} strokeWidth={0.8} opacity={0.36}/><Path d={`M${v(172)} ${u(120)} L${v(178)} ${u(109)} L${v(184)} ${u(120)}Z`} fill="none" stroke={INK2} strokeWidth={0.55} opacity={0.3}/></>}
      {s(2) && <><Line x1={v(70)} y1={u(116)} x2={v(82)} y2={u(116)} stroke={INK} strokeWidth={0.85} opacity={0.36}/><Line x1={v(72)} y1={u(112)} x2={v(83)} y2={u(112)} stroke={INK} strokeWidth={0.75} opacity={0.3}/><Line x1={v(74)} y1={u(108)} x2={v(84)} y2={u(108)} stroke={INK} strokeWidth={0.65} opacity={0.25}/></>}
      {s(3) && <><Circle cx={v(44)} cy={u(20)} r={v(5.5)} fill="none" stroke={GOLD} strokeWidth={0.7} opacity={0.48}/><Circle cx={v(44)} cy={u(20)} r={v(2.4)} fill={GOLD} opacity={0.38}/><Line x1={v(44)} y1={u(10)} x2={v(44)} y2={u(12.5)} stroke={GOLD} strokeWidth={0.6} opacity={0.35}/><Line x1={v(53.5)} y1={u(13.5)} x2={v(51.5)} y2={u(15.5)} stroke={GOLD} strokeWidth={0.55} opacity={0.3}/><Line x1={v(34.5)} y1={u(13.5)} x2={v(36.5)} y2={u(15.5)} stroke={GOLD} strokeWidth={0.55} opacity={0.3}/><Line x1={v(57)} y1={u(20)} x2={v(54.5)} y2={u(20)} stroke={GOLD} strokeWidth={0.55} opacity={0.3}/></>}
      {s(4) && <><Line x1={v(66)} y1={u(124)} x2={v(66)} y2={u(110)} stroke={INK} strokeWidth={0.8} opacity={0.4}/><Path d={`M${v(62)} ${u(115)} L${v(66)} ${u(110)} L${v(70)} ${u(115)} L${v(62)} ${u(115)}Z`} fill="none" stroke={INK} strokeWidth={0.6} opacity={0.34}/><Circle cx={v(66)} cy={u(113)} r={v(0.9)} fill={GOLD} opacity={0.48}/><Line x1={v(63)} y1={u(124)} x2={v(69)} y2={u(124)} stroke={INK} strokeWidth={0.6} opacity={0.28}/></>}
      {s(5) && <><Path d={`M${v(164)} ${u(13)} A${v(10)} ${v(10)} 0 1 1 ${v(164)} ${u(33)} A${v(7)} ${v(7)} 0 1 0 ${v(164)} ${u(13)}Z`} fill="none" stroke={GOLD} strokeWidth={0.75} opacity={0.5}/><Circle cx={v(150)} cy={u(13)} r={1.1} fill={GOLD} opacity={0.32}/><Circle cx={v(178)} cy={u(20)} r={0.85} fill={GOLD} opacity={0.26}/></>}
      {s(6) && <><Path d={`M${v(150)} ${u(124)} Q${v(154)} ${u(130)} ${v(151)} ${u(137)} Q${v(148)} ${u(142)} ${v(150)} ${u(148)}`} fill="none" stroke={GOLD} strokeWidth={0.7} opacity={0.3}/><Path d={`M${v(153)} ${u(124)} Q${v(157)} ${u(130)} ${v(154)} ${u(137)} Q${v(151)} ${u(142)} ${v(153)} ${u(148)}`} fill="none" stroke={GOLD} strokeWidth={0.45} opacity={0.17}/></>}
      {s(7) && <><Path d={`M${v(46)} ${u(97)} L${v(57)} ${u(90)} L${v(68)} ${u(97)}`} fill="none" stroke={INK} strokeWidth={0.65} opacity={0.36}/><Path d={`M${v(48)} ${u(97)} L${v(48)} ${u(106)} L${v(66)} ${u(106)} L${v(66)} ${u(97)}`} fill="none" stroke={INK} strokeWidth={0.55} opacity={0.3}/><Line x1={v(55)} y1={u(100)} x2={v(55)} y2={u(106)} stroke={INK} strokeWidth={0.45} opacity={0.24}/></>}
      {s(8) && <><Line x1={v(140)} y1={u(124)} x2={v(138)} y2={u(104)} stroke={INK2} strokeWidth={0.9} opacity={0.4}/><Circle cx={v(136)} cy={u(98)} r={v(7.5)} fill="none" stroke={INK2} strokeWidth={0.5} opacity={0.28}/><Circle cx={v(143)} cy={u(96)} r={v(5.5)} fill="none" stroke={INK2} strokeWidth={0.4} opacity={0.23}/><Circle cx={v(133)} cy={u(94)} r={v(4)} fill="none" stroke={INK2} strokeWidth={0.4} opacity={0.2}/><Circle cx={v(138)} cy={u(98)} r={0.75} fill={GOLD} opacity={0.42}/><Circle cx={v(133)} cy={u(95)} r={0.65} fill={GOLD} opacity={0.35}/><Circle cx={v(143)} cy={u(100)} r={0.6} fill={GOLD} opacity={0.3}/></>}
      {s(9) && <><Path d={`M${v(78)} ${u(32)} Q${v(82)} ${u(28)} ${v(86)} ${u(32)}`} fill="none" stroke={INK} strokeWidth={0.7} opacity={0.3}/><Path d={`M${v(90)} ${u(24)} Q${v(94)} ${u(20)} ${v(98)} ${u(24)}`} fill="none" stroke={INK} strokeWidth={0.6} opacity={0.24}/><Path d={`M${v(70)} ${u(40)} Q${v(74)} ${u(36)} ${v(78)} ${u(40)}`} fill="none" stroke={INK} strokeWidth={0.5} opacity={0.19}/></>}
      {s(10) && <><Circle cx={v(36)} cy={u(18)} r={0.8} fill={INK} opacity={0.12}/><Circle cx={v(56)} cy={u(11)} r={0.65} fill={INK} opacity={0.09}/><Circle cx={v(22)} cy={u(25)} r={0.7} fill={INK} opacity={0.08}/><Circle cx={v(160)} cy={u(22)} r={0.6} fill={INK} opacity={0.07}/></>}
      {s(11) && <><Line x1={v(186)} y1={u(124)} x2={v(186)} y2={u(93)} stroke={INK2} strokeWidth={0.95} opacity={0.36}/><Circle cx={v(186)} cy={u(114)} r={v(0.9)} fill="none" stroke={INK2} strokeWidth={0.4} opacity={0.26}/><Circle cx={v(186)} cy={u(105)} r={v(0.9)} fill="none" stroke={INK2} strokeWidth={0.4} opacity={0.26}/><Line x1={v(183)} y1={u(110)} x2={v(190)} y2={u(108)} stroke={INK2} strokeWidth={0.4} opacity={0.2}/><Line x1={v(191)} y1={u(124)} x2={v(191)} y2={u(97)} stroke={INK2} strokeWidth={0.75} opacity={0.28}/><Circle cx={v(191)} cy={u(116)} r={v(0.8)} fill="none" stroke={INK2} strokeWidth={0.35} opacity={0.22}/></>}
      {s(12) && <><Line x1={v(88)} y1={u(76)} x2={v(88)} y2={u(93)} stroke={INK} strokeWidth={0.9} opacity={0.4}/><Line x1={v(112)} y1={u(76)} x2={v(112)} y2={u(93)} stroke={INK} strokeWidth={0.9} opacity={0.4}/><Line x1={v(84)} y1={u(78)} x2={v(116)} y2={u(78)} stroke={INK} strokeWidth={1.0} opacity={0.42}/><Line x1={v(86)} y1={u(82)} x2={v(114)} y2={u(82)} stroke={INK} strokeWidth={0.65} opacity={0.28}/></>}
      {s(13) && <><Path d={`M${v(128)} ${u(87)} A${v(8.5)} ${v(4)} 0 0 1 ${v(145)} ${u(87)} A${v(8.5)} ${v(4)} 0 0 1 ${v(128)} ${u(87)}Z`} fill="none" stroke={GOLD} strokeWidth={0.55} opacity={0.33}/><Path d={`M${v(131)} ${u(89)} Q${v(137)} ${u(85)} ${v(143)} ${u(89)}`} fill="none" stroke={GOLD} strokeWidth={0.35} opacity={0.17}/></>}
      {s(16) && <><Path d={`M${v(115)} ${u(48)} Q${v(120)} ${u(39)} ${v(122)} ${u(43)}`} fill="none" stroke={INK2} strokeWidth={0.65} opacity={0.36}/><Path d={`M${v(122)} ${u(50)} Q${v(127)} ${u(41)} ${v(129)} ${u(45)}`} fill="none" stroke={INK2} strokeWidth={0.55} opacity={0.3}/><Circle cx={v(120)} cy={u(42)} r={0.8} fill={GOLD} opacity={0.38}/><Circle cx={v(127)} cy={u(44)} r={0.7} fill={GOLD} opacity={0.32}/></>}
      {s(17) && <><Line x1={v(100)} y1={u(14)} x2={v(100)} y2={u(5)} stroke={INK} strokeWidth={0.85} opacity={0.48}/><Circle cx={v(100)} cy={u(5)} r={v(2.2)} fill="none" stroke={INK} strokeWidth={0.7} opacity={0.42}/><Circle cx={v(100)} cy={u(5)} r={0.85} fill={GOLD} opacity={0.58}/></>}
      <Path d={`M${v(58)} ${u(48)} Q${v(80)} ${u(42)} ${v(100)} ${u(46)} Q${v(120)} ${u(42)} ${v(142)} ${u(48)}`} fill="none" stroke={INK} strokeWidth={0.3} opacity={0.08}/>
    </Svg>
  );
}

// ─── Mountain SVG: Brushstroke (水墨 sumi-e style) ─────────────────────────
function BrushstrokeMountain({ stage, t }: { stage: number; t: AppTheme }) {
  const s = (idx: number) => stage >= idx;
  const INK = t.ink, INK2 = t.ink2, GOLD = t.gold, BG = t.bg;
  return (
    <Svg width={SVG_W} height={SVG_H} viewBox={`0 0 ${SVG_W} ${SVG_H}`}>
      {/* vertical calligraphy strokes */}
      <Line x1={v(196)} y1={u(5)}  x2={v(196)} y2={u(128)} stroke={INK} strokeWidth={1.2} opacity={0.07}/>
      <Line x1={v(191)} y1={u(15)} x2={v(191)} y2={u(128)} stroke={INK} strokeWidth={0.7} opacity={0.04}/>
      <Line x1={v(4)}   y1={u(10)} x2={v(4)}   y2={u(128)} stroke={INK} strokeWidth={1.0} opacity={0.05}/>

      {/* ink wash: far mountains */}
      <Path d={`M${v(8)} ${u(125)} Q${v(25)} ${u(78)} ${v(40)} ${u(75)} Q${v(55)} ${u(78)} ${v(65)} ${u(125)}Z`}
        fill={INK} opacity={0.07}/>
      <Path d={`M${v(132)} ${u(125)} Q${v(148)} ${u(83)} ${v(163)} ${u(80)} Q${v(175)} ${u(83)} ${v(190)} ${u(125)}Z`}
        fill={INK} opacity={0.06}/>

      {/* main mountain: ink wash fill */}
      <Path d={`M${v(32)} ${u(127)} Q${v(43)} ${u(99)} ${v(58)} ${u(75)} Q${v(70)} ${u(55)} ${v(82)} ${u(40)} Q${v(88)} ${u(29)} ${v(92)} ${u(25)} Q${v(98)} ${u(29)} ${v(105)} ${u(42)} Q${v(117)} ${u(60)} ${v(129)} ${u(83)} Q${v(140)} ${u(104)} ${v(149)} ${u(127)}Z`}
        fill={INK} opacity={0.09}/>

      {/* left slope: thick brush pressure */}
      <Path d={`M${v(35)} ${u(127)} Q${v(52)} ${u(92)} ${v(68)} ${u(68)} Q${v(82)} ${u(45)} ${v(92)} ${u(27)}`}
        fill="none" stroke={INK} strokeWidth={2.8} strokeLinecap="round" opacity={0.45}/>
      {/* right slope: thin, lifting brush */}
      <Path d={`M${v(92)} ${u(27)} Q${v(102)} ${u(40)} ${v(114)} ${u(60)} Q${v(128)} ${u(84)} ${v(140)} ${u(121)}`}
        fill="none" stroke={INK} strokeWidth={1.0} strokeLinecap="round" opacity={0.4}/>

      {/* mist band */}
      <Rect x={v(0)} y={u(98)} width={v(200)} height={u(18)} fill={BG} opacity={0.55} rx={4}/>
      <Rect x={v(0)} y={u(103)} width={v(200)} height={u(10)} fill={BG} opacity={0.4} rx={3}/>

      {/* ellipse ink wash shadows */}
      <Ellipse cx={v(67)} cy={u(109)} rx={v(37)} ry={u(8)} fill={INK} opacity={0.04}/>
      <Ellipse cx={v(133)} cy={u(112)} rx={v(29)} ry={u(6)} fill={INK} opacity={0.03}/>

      {/* crescent moon (replaces circle sun) */}
      {s(3) && <Path d={`M${v(161)} ${u(35)} Q${v(171)} ${u(28)} ${v(171)} ${u(40)} Q${v(165)} ${u(46)} ${v(158)} ${u(43)} Q${v(155)} ${u(38)} ${v(161)} ${u(35)}Z`}
        fill={GOLD} opacity={0.55}/>}

      {/* pine dots on slope */}
      {s(1) && <>
        <Circle cx={v(62)} cy={u(93)} r={v(2.1)} fill={INK} opacity={0.25}/>
        <Circle cx={v(71)} cy={u(84)} r={v(1.7)} fill={INK} opacity={0.2}/>
        <Circle cx={v(79)} cy={u(75)} r={v(1.3)} fill={INK} opacity={0.15}/>
      </>}

      {/* stone steps: ink dashes */}
      {s(2) && <>
        <Line x1={v(70)} y1={u(116)} x2={v(80)} y2={u(116)} stroke={INK} strokeWidth={1.2} opacity={0.3}/>
        <Line x1={v(72)} y1={u(112)} x2={v(82)} y2={u(112)} stroke={INK} strokeWidth={1.0} opacity={0.24}/>
        <Line x1={v(74)} y1={u(108)} x2={v(84)} y2={u(108)} stroke={INK} strokeWidth={0.8} opacity={0.19}/>
      </>}

      {/* lantern: ink block style */}
      {s(4) && <>
        <Line x1={v(66)} y1={u(124)} x2={v(66)} y2={u(110)} stroke={INK} strokeWidth={1.2} opacity={0.45}/>
        <Path d={`M${v(61)} ${u(116)} L${v(66)} ${u(110)} L${v(71)} ${u(116)} L${v(61)} ${u(116)}Z`}
          fill={INK} opacity={0.12}/>
        <Circle cx={v(66)} cy={u(114)} r={v(0.9)} fill={GOLD} opacity={0.6}/>
      </>}

      {/* stream: ink wash lines */}
      {s(6) && <>
        <Path d={`M${v(150)} ${u(124)} Q${v(155)} ${u(130)} ${v(152)} ${u(138)} Q${v(149)} ${u(143)} ${v(151)} ${u(150)}`}
          fill="none" stroke={INK} strokeWidth={0.9} opacity={0.22}/>
        <Path d={`M${v(154)} ${u(124)} Q${v(159)} ${u(131)} ${v(156)} ${u(138)} Q${v(153)} ${u(144)} ${v(155)} ${u(150)}`}
          fill="none" stroke={INK} strokeWidth={0.5} opacity={0.14}/>
      </>}

      {/* mountain shelter: ink block */}
      {s(7) && <>
        <Path d={`M${v(46)} ${u(97)} L${v(57)} ${u(90)} L${v(68)} ${u(97)}`}
          fill={INK} opacity={0.08} stroke={INK} strokeWidth={1.0}/>
        <Path d={`M${v(48)} ${u(97)} L${v(48)} ${u(106)} L${v(66)} ${u(106)} L${v(66)} ${u(97)}`}
          fill="none" stroke={INK} strokeWidth={0.8} opacity={0.36}/>
      </>}

      {/* cherry blossom: ink circles + gold dots */}
      {s(8) && <>
        <Line x1={v(140)} y1={u(124)} x2={v(138)} y2={u(106)} stroke={INK} strokeWidth={1.4} opacity={0.4}/>
        <Circle cx={v(136)} cy={u(100)} r={v(7)} fill={INK} opacity={0.06} stroke={INK} strokeWidth={0.5}/>
        <Circle cx={v(143)} cy={u(97)} r={v(5)} fill={INK} opacity={0.05}/>
        <Circle cx={v(133)} cy={u(96)} r={v(4)} fill={INK} opacity={0.04}/>
        <Circle cx={v(138)} cy={u(99)} r={0.9} fill={GOLD} opacity={0.5}/>
        <Circle cx={v(133)} cy={u(96)} r={0.7} fill={GOLD} opacity={0.42}/>
        <Circle cx={v(143)} cy={u(101)} r={0.7} fill={GOLD} opacity={0.38}/>
      </>}

      {/* birds: ink strokes */}
      {s(9) && <>
        <Path d={`M${v(78)} ${u(32)} Q${v(82)} ${u(27)} ${v(86)} ${u(32)}`} fill="none" stroke={INK} strokeWidth={1.0} opacity={0.3}/>
        <Path d={`M${v(90)} ${u(23)} Q${v(94)} ${u(18)} ${v(98)} ${u(23)}`} fill="none" stroke={INK} strokeWidth={0.8} opacity={0.24}/>
        <Path d={`M${v(70)} ${u(40)} Q${v(74)} ${u(35)} ${v(78)} ${u(40)}`} fill="none" stroke={INK} strokeWidth={0.7} opacity={0.2}/>
      </>}

      {/* bamboo: segmented verticals */}
      {s(11) && <>
        <Line x1={v(186)} y1={u(124)} x2={v(186)} y2={u(90)} stroke={INK} strokeWidth={1.4} opacity={0.38}/>
        <Circle cx={v(186)} cy={u(115)} r={v(0.8)} fill="none" stroke={INK} strokeWidth={0.5} opacity={0.3}/>
        <Circle cx={v(186)} cy={u(106)} r={v(0.8)} fill="none" stroke={INK} strokeWidth={0.5} opacity={0.3}/>
        <Line x1={v(183)} y1={u(110)} x2={v(190)} y2={u(108)} stroke={INK2} strokeWidth={0.6} opacity={0.22}/>
        <Line x1={v(191)} y1={u(124)} x2={v(191)} y2={u(94)} stroke={INK} strokeWidth={1.1} opacity={0.3}/>
        <Circle cx={v(191)} cy={u(116)} r={v(0.7)} fill="none" stroke={INK} strokeWidth={0.4} opacity={0.25}/>
      </>}

      {/* torii gate: bold ink */}
      {s(12) && <>
        <Line x1={v(88)} y1={u(76)} x2={v(88)} y2={u(93)} stroke={INK} strokeWidth={1.4} opacity={0.42}/>
        <Line x1={v(112)} y1={u(76)} x2={v(112)} y2={u(93)} stroke={INK} strokeWidth={1.4} opacity={0.42}/>
        <Line x1={v(84)} y1={u(78)} x2={v(116)} y2={u(78)} stroke={INK} strokeWidth={1.6} opacity={0.44}/>
        <Line x1={v(86)} y1={u(82)} x2={v(114)} y2={u(82)} stroke={INK} strokeWidth={0.9} opacity={0.28}/>
      </>}

      {/* summit: ink mark */}
      {s(17) && <>
        <Line x1={v(92)} y1={u(27)} x2={v(92)} y2={u(18)} stroke={INK} strokeWidth={1.4} opacity={0.5}/>
        <Circle cx={v(92)} cy={u(17)} r={v(2)} fill={INK} opacity={0.3}/>
        <Circle cx={v(92)} cy={u(17)} r={0.9} fill={GOLD} opacity={0.65}/>
      </>}
    </Svg>
  );
}

// ─── Mountain SVG: Weathered (侘寂 wabi-sabi style) ────────────────────────
function WeatheredMountain({ stage, t }: { stage: number; t: AppTheme }) {
  const s = (idx: number) => stage >= idx;
  const INK = t.ink, INK2 = t.ink2, GOLD = t.gold, BG = t.bg;
  return (
    <Svg width={SVG_W} height={SVG_H} viewBox={`0 0 ${SVG_W} ${SVG_H}`}>
      {/* aged paper marks */}
      <Circle cx={v(37)} cy={u(31)} r={v(15)} fill={INK} opacity={0.025}/>
      <Circle cx={v(163)} cy={u(125)} r={v(21)} fill={INK} opacity={0.02}/>
      <Circle cx={v(100)} cy={u(78)} r={v(46)} fill={INK} opacity={0.015}/>

      {/* far distant mountains, very faint */}
      <Path d={`M${v(0)} ${u(128)} Q${v(16)} ${u(95)} ${v(28)} ${u(92)} Q${v(40)} ${u(95)} ${v(52)} ${u(128)}Z`}
        fill={INK} opacity={0.055}/>
      <Path d={`M${v(148)} ${u(128)} Q${v(162)} ${u(98)} ${v(173)} ${u(96)} Q${v(184)} ${u(98)} ${v(200)} ${u(128)}Z`}
        fill={INK} opacity={0.048}/>

      {/* main mountain: asymmetric, eroded silhouette fill */}
      <Path d={`M${v(23)} ${u(138)} Q${v(35)} ${u(118)} ${v(46)} ${u(104)} Q${v(54)} ${u(91)} ${v(60)} ${u(81)} Q${v(67)} ${u(68)} ${v(73)} ${u(55)} Q${v(79)} ${u(42)} ${v(83)} ${u(33)} Q${v(87)} ${u(26)} ${v(90)} ${u(22)} Q${v(95)} ${u(26)} ${v(100)} ${u(36)} Q${v(108)} ${u(50)} ${v(114)} ${u(61)} Q${v(120)} ${u(71)} ${v(126)} ${u(82)} Q${v(134)} ${u(95)} ${v(143)} ${u(110)} Q${v(152)} ${u(124)} ${v(158)} ${u(136)}Z`}
        fill={INK} opacity={0.08}/>

      {/* rough, uneven outer stroke */}
      <Path d={`M${v(25)} ${u(138)} Q${v(40)} ${u(111)} ${v(54)} ${u(88)} Q${v(68)} ${u(65)} ${v(82)} ${u(36)} Q${v(87)} ${u(23)} ${v(91)} ${u(21)} Q${v(97)} ${u(25)} ${v(102)} ${u(37)} Q${v(115)} ${u(63)} ${v(132)} ${u(94)} Q${v(143)} ${u(116)} ${v(155)} ${u(135)}`}
        fill="none" stroke={INK} strokeWidth={1.4} strokeLinecap="round" opacity={0.42}/>

      {/* crack / fissure — time-worn */}
      <Path d={`M${v(90)} ${u(82)} Q${v(93)} ${u(97)} ${v(90)} ${u(110)} Q${v(88)} ${u(120)} ${v(91)} ${u(127)}`}
        fill="none" stroke={INK} strokeWidth={0.5} opacity={0.18}/>

      {/* heavy mist — lower, more opaque */}
      <Rect x={v(0)} y={u(115)} width={v(200)} height={u(30)} fill={BG} opacity={0.7} rx={2}/>
      <Rect x={v(8)} y={u(122)} width={v(184)} height={u(20)} fill={BG} opacity={0.5} rx={2}/>

      {/* imperfect, slightly-off moon */}
      {s(3) && <Path d={`M${v(154)} ${u(39)} Q${v(160)} ${u(31)} ${v(164)} ${u(37)} Q${v(167)} ${u(44)} ${v(162)} ${u(50)} Q${v(155)} ${u(52)} ${v(151)} ${u(47)} Q${v(149)} ${u(41)} ${v(154)} ${u(39)}Z`}
        fill="none" stroke={GOLD} strokeWidth={0.8} opacity={0.5}/>}

      {/* lichen / moss dots — age marks */}
      <Circle cx={v(66)} cy={u(98)} r={1.2} fill={INK2} opacity={0.2}/>
      <Circle cx={v(73)} cy={u(91)} r={0.8} fill={INK2} opacity={0.15}/>
      <Circle cx={v(117)} cy={u(93)} r={1.0} fill={INK2} opacity={0.18}/>
      <Circle cx={v(106)} cy={u(103)} r={0.7} fill={INK2} opacity={0.12}/>

      {/* uneven horizon */}
      <Path d={`M${v(12)} ${u(138)} Q${v(50)} ${u(135)} ${v(100)} ${u(136)} Q${v(150)} ${u(137)} ${v(188)} ${u(135)}`}
        fill="none" stroke={INK} strokeWidth={0.4} opacity={0.15}/>

      {/* pine trees: weathered, leaning */}
      {s(1) && <>
        <Line x1={v(18)} y1={u(128)} x2={v(17)} y2={u(109)} stroke={INK} strokeWidth={0.9} opacity={0.38}/>
        <Path d={`M${v(12)} ${u(120)} L${v(18)} ${u(108)} L${v(24)} ${u(120)}Z`}
          fill="none" stroke={INK} strokeWidth={0.6} opacity={0.3}/>
        <Line x1={v(175)} y1={u(128)} x2={v(177)} y2={u(113)} stroke={INK} strokeWidth={0.8} opacity={0.33}/>
        <Path d={`M${v(170)} ${u(122)} L${v(176)} ${u(112)} L${v(182)} ${u(122)}Z`}
          fill="none" stroke={INK} strokeWidth={0.55} opacity={0.27}/>
      </>}

      {/* stone steps: worn, uneven */}
      {s(2) && <>
        <Line x1={v(68)} y1={u(118)} x2={v(79)} y2={u(117)} stroke={INK} strokeWidth={0.9} opacity={0.3}/>
        <Line x1={v(70)} y1={u(114)} x2={v(80)} y2={u(113)} stroke={INK} strokeWidth={0.75} opacity={0.24}/>
        <Line x1={v(73)} y1={u(110)} x2={v(82)} y2={u(109)} stroke={INK} strokeWidth={0.6} opacity={0.19}/>
      </>}

      {/* lantern: weathered */}
      {s(4) && <>
        <Line x1={v(65)} y1={u(128)} x2={v(66)} y2={u(113)} stroke={INK} strokeWidth={0.9} opacity={0.36}/>
        <Path d={`M${v(61)} ${u(117)} L${v(66)} ${u(112)} L${v(71)} ${u(117)} L${v(61)} ${u(117)}Z`}
          fill={INK} opacity={0.08} stroke={INK} strokeWidth={0.55}/>
        <Circle cx={v(65)} cy={u(115)} r={v(0.8)} fill={GOLD} opacity={0.42}/>
      </>}

      {/* stream */}
      {s(6) && <>
        <Path d={`M${v(150)} ${u(128)} Q${v(154)} ${u(133)} ${v(151)} ${u(140)}`}
          fill="none" stroke={INK} strokeWidth={0.7} opacity={0.2}/>
      </>}

      {/* shelter: worn roof */}
      {s(7) && <>
        <Path d={`M${v(45)} ${u(99)} L${v(57)} ${u(93)} L${v(69)} ${u(99)}`}
          fill={INK} opacity={0.06} stroke={INK} strokeWidth={0.9}/>
        <Path d={`M${v(47)} ${u(99)} L${v(47)} ${u(108)} L${v(67)} ${u(108)} L${v(67)} ${u(99)}`}
          fill="none" stroke={INK} strokeWidth={0.65} opacity={0.28}/>
      </>}

      {/* cherry blossom: scattered, fading */}
      {s(8) && <>
        <Line x1={v(140)} y1={u(128)} x2={v(139)} y2={u(107)} stroke={INK} strokeWidth={1.0} opacity={0.32}/>
        <Circle cx={v(137)} cy={u(101)} r={v(6.5)} fill={INK} opacity={0.04}/>
        <Circle cx={v(143)} cy={u(99)} r={v(4.5)} fill={INK} opacity={0.035}/>
        <Circle cx={v(137)} cy={u(100)} r={0.7} fill={GOLD} opacity={0.38}/>
        <Circle cx={v(143)} cy={u(102)} r={0.6} fill={GOLD} opacity={0.3}/>
      </>}

      {/* birds: barely visible */}
      {s(9) && <>
        <Path d={`M${v(78)} ${u(34)} Q${v(82)} ${u(30)} ${v(86)} ${u(34)}`} fill="none" stroke={INK} strokeWidth={0.65} opacity={0.22}/>
        <Path d={`M${v(90)} ${u(26)} Q${v(94)} ${u(22)} ${v(98)} ${u(26)}`} fill="none" stroke={INK} strokeWidth={0.55} opacity={0.17}/>
      </>}

      {/* summit: worn marker */}
      {s(17) && <>
        <Line x1={v(91)} y1={u(21)} x2={v(91)} y2={u(12)} stroke={INK} strokeWidth={1.0} opacity={0.38}/>
        <Circle cx={v(91)} cy={u(11)} r={v(1.8)} fill="none" stroke={INK} strokeWidth={0.7} opacity={0.35}/>
        <Circle cx={v(91)} cy={u(11)} r={0.8} fill={GOLD} opacity={0.45}/>
      </>}
    </Svg>
  );
}

// ─── Main Screen ────────────────────────────────────────────────────────────
export default function MountainPathScreen({ onDone }: { onDone?: () => void }) {
  const { theme, newUnlockTheme, setTheme } = useTheme();
  const [morningDays, setMorningDays] = useState(0);
  const [ready, setReady] = useState(false);

  const fadeIn    = useRef(new Animated.Value(0)).current;
  const revealY   = useRef(new Animated.Value(8)).current;
  const mist1     = useRef(new Animated.Value(0)).current;
  const brushY    = useRef(new Animated.Value(0)).current;
  const badgeFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadData().then(data => {
      const days = data.records.filter(r => r.morningDone).length;
      setMorningDays(days);
      setReady(true);
    });
  }, []);

  useEffect(() => {
    if (!ready) return;
    Animated.parallel([
      Animated.timing(fadeIn,  { toValue: 1, duration: 1800, useNativeDriver: true }),
      Animated.timing(revealY, { toValue: 0, duration: 1400, useNativeDriver: true }),
    ]).start();
    setTimeout(() => {
      Animated.timing(badgeFade, { toValue: 1, duration: 900, useNativeDriver: true }).start();
    }, 600);
    Animated.loop(Animated.sequence([
      Animated.timing(mist1,  { toValue: 1, duration: 10000, useNativeDriver: true }),
      Animated.timing(mist1,  { toValue: 0, duration: 10000, useNativeDriver: true }),
    ])).start();
    Animated.loop(Animated.sequence([
      Animated.timing(brushY, { toValue: 1, duration: 16000, useNativeDriver: true }),
      Animated.timing(brushY, { toValue: 0, duration: 16000, useNativeDriver: true }),
    ])).start();
  }, [ready]);

  if (!ready) return <View style={{ flex: 1, backgroundColor: theme.bg }} />;

  const stageIdx = getStageIndex(morningDays);
  const stage    = stageIdx >= 0 ? STAGES[stageIdx] : null;
  const isNew    = isNewUnlock(morningDays);
  const progress = Math.min(1, morningDays / 180);
  const dayLabel = morningDays === 0 ? 'Begin your path'
    : morningDays >= 180 ? 'Path complete · 180 days'
    : `Day ${morningDays} of 180`;

  // pick quote based on theme: sumi-e uses Chinese poetry
  const quoteText = (theme.mountain === 'brushstroke' && stageIdx >= 0)
    ? SUMIE_QUOTES[Math.min(stageIdx, SUMIE_QUOTES.length - 1)]
    : stage?.quote ?? 'A path opens before you\ntake the first step';

  const T = theme;
  const bgMtn = T.bg === '#e8e2d6'
    ? 'rgba(42,32,16,' : T.bg === '#cec8bc'
    ? 'rgba(42,34,24,' : 'rgba(30,32,48,';

  return (
    <View style={[s.root, { backgroundColor: T.bg }]}>
      <StatusBar barStyle="dark-content" />

      {/* atmosphere */}
      <View style={[s.mtn1, { backgroundColor: `${bgMtn}0.042)` }]} />
      <View style={[s.mtn2, { backgroundColor: `${bgMtn}0.032)` }]} />
      <View style={[s.mtn3, { backgroundColor: `${bgMtn}0.028)` }]} />
      {[0.38, 0.42, 0.46].map((pos, i) => (
        <View key={i} style={[s.waterLine, {
          top: height * pos, opacity: 0.04 + i * 0.012,
          width: width * [0.7, 0.84, 0.66][i], alignSelf: 'center',
          backgroundColor: T.ink,
        }]} />
      ))}
      <Animated.View style={[s.mistLayer, {
        backgroundColor: T.bgMist,
        transform: [{ translateY: mist1.interpolate({ inputRange: [0,1], outputRange: [0,-10] }) }],
      }]} />
      <Animated.View style={[s.brushGroup, {
        transform: [{ translateY: brushY.interpolate({ inputRange: [0,1], outputRange: [0,-14] }) }],
      }]}>
        {[
          { l:width*0.05, h:95,  o:0.05 }, { l:width*0.10, h:145, o:0.07 },
          { l:width*0.16, h:65,  o:0.04 }, { l:width*0.80, h:115, o:0.06 },
          { l:width*0.86, h:78,  o:0.08 }, { l:width*0.92, h:98,  o:0.05 },
        ].map((b, i) => (
          <View key={i} style={{
            position: 'absolute', left: b.l, bottom: 0,
            width: 1.5, height: b.h, backgroundColor: T.ink,
            opacity: b.o, borderRadius: 1,
          }} />
        ))}
      </Animated.View>

      {/* main content */}
      <Animated.View style={[s.content, { opacity: fadeIn }]}>

        {/* sumi-e seal 印章 */}
        {T.mountain === 'brushstroke' && (
          <View style={[s.seal, { backgroundColor: T.gold }]}>
            <Text style={s.sealText}>{T.seal ?? '禅'}</Text>
          </View>
        )}

        <Text style={[s.headerLabel, { color: T.ink3, letterSpacing: T.fontCaption.letterSpacing }]}>
          THE  MOUNTAIN  PATH
        </Text>
        <View style={{ height: 10 }} />

        {/* new element unlock badge */}
        {isNew && stage && (
          <Animated.View style={[s.badge, { opacity: badgeFade, borderColor: `${T.gold}60` }]}>
            <Text style={[s.badgeText, { color: T.gold, letterSpacing: T.fontCaption.letterSpacing }]}>
              ✦  {stage.name.toUpperCase()}  ✦
            </Text>
          </Animated.View>
        )}

        {/* new THEME unlock notification */}
        {newUnlockTheme && (
          <Animated.View style={[s.themeUnlock, { opacity: badgeFade, borderColor: `${T.gold}40` }]}>
            <Text style={[s.themeUnlockText, { color: T.gold }]}>
              New style unlocked: {newUnlockTheme.nameZh}
            </Text>
            <TouchableOpacity onPress={() => setTheme(newUnlockTheme.id)}>
              <Text style={[s.themeUnlockBtn, { color: T.ink2 }]}>Apply  ›</Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        {(!isNew || !stage) && !newUnlockTheme && <View style={{ height: 20 }} />}

        {/* mountain SVG */}
        <Animated.View style={{ transform: [{ translateY: revealY }] }}>
          {T.mountain === 'brushstroke' && <BrushstrokeMountain stage={stageIdx} t={T} />}
          {T.mountain === 'weathered'   && <WeatheredMountain   stage={stageIdx} t={T} />}
          {T.mountain === 'geometric'   && <GeometricMountain   stage={stageIdx} t={T} />}
        </Animated.View>

        <View style={{ height: 20 }} />

        {/* progress bar */}
        <View style={[s.progressTrack, { backgroundColor: `${T.ink}18` }]}>
          <View style={[s.progressFill, { width: `${progress * 100}%` as any, backgroundColor: `${T.gold}88` }]} />
        </View>
        <View style={{ height: 8 }} />
        <Text style={[s.dayLabel, { color: T.ink3 }]}>{dayLabel}</Text>

        <View style={[s.hairline, { backgroundColor: `${T.ink}30` }]} />

        {/* quote */}
        {stage ? (
          <>
            <Text style={[s.stageName, { color: T.gold, letterSpacing: T.fontCaption.letterSpacing }]}>
              {stage.name.toUpperCase()}
            </Text>
            <View style={{ height: 10 }} />
            <Text style={[s.quote, T.fontQuote as any, { color: T.ink2 }]}>
              {quoteText}
            </Text>
          </>
        ) : (
          <Text style={[s.quote, T.fontQuote as any, { color: T.ink2 }]}>
            {'A path opens before you\ntake the first step'}
          </Text>
        )}

        <View style={{ height: 36 }} />

        <TouchableOpacity
          style={[s.btn, { borderColor: `${T.ink}30`, borderRadius: T.radiusBtn }]}
          onPress={() => onDone && onDone()}
        >
          <Text style={[s.btnText, { color: T.ink2, letterSpacing: T.fontTitle.letterSpacing - 2 }]}>
            Begin your morning  ›
          </Text>
        </TouchableOpacity>

      </Animated.View>
    </View>
  );
}

const s = StyleSheet.create({
  root:    { flex: 1 },
  mtn1:    { position:'absolute', width:width*1.4, height:width*1.4, borderRadius:width*0.7,  top:height*0.42, left:-width*0.2 },
  mtn2:    { position:'absolute', width:width*1.1, height:width*1.1, borderRadius:width*0.55, top:height*0.46, left:width*0.1 },
  mtn3:    { position:'absolute', width:width*0.8, height:width*0.8, borderRadius:width*0.4,  top:height*0.50, right:-width*0.05 },
  waterLine:  { position:'absolute', height:1 },
  mistLayer:  { position:'absolute', width:width*1.3, height:75, borderRadius:38, top:height*0.36, left:-width*0.15 },
  brushGroup: { position:'absolute', top:height*0.25, left:0, right:0, height:175 },

  content:     { flex:1, alignItems:'center', justifyContent:'center', paddingHorizontal:24, paddingBottom:20 },
  headerLabel: { fontSize:9, fontWeight:'300', opacity:0.55 },

  seal:     { width:28, height:28, alignItems:'center', justifyContent:'center', marginBottom:20 },
  sealText: { color:'#fff', fontSize:12, fontWeight:'400' },

  badge:     { paddingHorizontal:18, paddingVertical:7, borderWidth:1, marginBottom:12 },
  badgeText: { fontSize:10, fontWeight:'300', opacity:0.85 },

  themeUnlock:    { flexDirection:'row', alignItems:'center', gap:12, paddingHorizontal:16, paddingVertical:8, borderWidth:1, marginBottom:12 },
  themeUnlockText:{ fontSize:11, letterSpacing:2 },
  themeUnlockBtn: { fontSize:11, letterSpacing:2 },

  progressTrack: { width:SVG_W, height:1.5, borderRadius:1 },
  progressFill:  { height:1.5, borderRadius:1 },
  dayLabel:      { fontSize:10, letterSpacing:2.5, opacity:0.55 },

  hairline:  { width:28, height:1, marginVertical:20 },
  stageName: { fontSize:9, fontWeight:'300', opacity:0.7 },
  quote:     { textAlign:'center', opacity:0.78 },

  btn:     { borderWidth:1, paddingHorizontal:32, paddingVertical:14 },
  btnText: { fontSize:13, fontWeight:'400' },
});

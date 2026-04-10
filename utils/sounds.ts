import * as FileSystem from 'expo-file-system/legacy';
import { Audio } from 'expo-av';
const { Sound } = Audio;

const SAMPLE_RATE = 44100;

function adsr(i: number, total: number, a: number, d: number, s: number, r: number): number {
  const t = i / total;
  if (t < a) return t / a;
  if (t < a + d) return 1 - (1 - s) * ((t - a) / d);
  if (t < 1 - r) return s;
  return s * (1 - (t - (1 - r)) / r);
}

function synthesize(
  partials: { freq: number; amp: number }[],
  durationMs: number,
  envelope: { a: number; d: number; s: number; r: number },
  volume: number,
  noiseAmt: number = 0
): string {
  const numSamples = Math.floor(SAMPLE_RATE * durationMs / 1000);
  const dataSize   = numSamples * 2;
  const buffer     = new ArrayBuffer(44 + dataSize);
  const view       = new DataView(buffer);
  const write = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
  };
  write(0, 'RIFF'); view.setUint32(4, 36 + dataSize, true);
  write(8, 'WAVE'); write(12, 'fmt ');
  view.setUint32(16, 16, true); view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);  view.setUint32(24, SAMPLE_RATE, true);
  view.setUint32(28, SAMPLE_RATE * 2, true); view.setUint16(32, 2, true);
  view.setUint16(34, 16, true); write(36, 'data');
  view.setUint32(40, dataSize, true);
  const totalAmp = partials.reduce((s, p) => s + p.amp, 0);
  for (let i = 0; i < numSamples; i++) {
    const t   = i / SAMPLE_RATE;
    const env = adsr(i, numSamples, envelope.a, envelope.d, envelope.s, envelope.r);
    let val   = 0;
    for (const p of partials) {
      val += (p.amp / totalAmp) * Math.sin(2 * Math.PI * p.freq * t);
    }
    if (noiseAmt > 0) val += (Math.random() * 2 - 1) * noiseAmt;
    view.setInt16(44 + i * 2, Math.round(val * env * volume * 32767), true);
  }
  const bytes = new Uint8Array(buffer);
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}

async function playB64(b64: string, filename: string, volume: number = 1.0) {
  try {
    const path = (FileSystem.cacheDirectory ?? '') + filename;
    await FileSystem.writeAsStringAsync(path, b64, { encoding: 'base64' });
    const { sound } = await Sound.createAsync({ uri: path }, { shouldPlay: true, volume });
    sound.setOnPlaybackStatusUpdate((s: any) => {
      if (s.isLoaded && s.didJustFinish) sound.unloadAsync();
    });
    return sound;
  } catch (e) {
    console.log('playB64 error:', e);
    return null;
  }
}

// ── 闹钟：颂钵（保留，唤醒感强）──
export async function playAlarmBell() {
  const bell1 = synthesize(
    [
      { freq: 528,  amp: 1.0  },
      { freq: 528.4,amp: 0.9  }, // 拍频颤动
      { freq: 1056, amp: 0.5  },
      { freq: 1584, amp: 0.25 },
      { freq: 704,  amp: 0.3  },
    ],
    3500,
    { a: 0.005, d: 0.08, s: 0.7, r: 0.5 },
    0.85
  );
  await playB64(bell1, 'alarm1.wav');
  setTimeout(async () => {
    const bell2 = synthesize(
      [
        { freq: 660,   amp: 1.0  },
        { freq: 660.3, amp: 0.8  },
        { freq: 1320,  amp: 0.4  },
        { freq: 880,   amp: 0.25 },
      ],
      3000,
      { a: 0.005, d: 0.06, s: 0.6, r: 0.55 },
      0.7
    );
    await playB64(bell2, 'alarm2.wav');
  }, 2000);
}

// ── 冥想吸气：风铃（轻盈向上）──
export async function playBreathIn() {
  const wav = synthesize(
    [
      { freq: 1200, amp: 1.0  },
      { freq: 1800, amp: 0.5  }, // 五度泛音，明亮
      { freq: 2400, amp: 0.2  },
      { freq: 900,  amp: 0.3  }, // 低八度，增加厚度
    ],
    600,
    { a: 0.05, d: 0.1, s: 0.3, r: 0.7 }, // 快攻击，长衰减
    0.28
  );
  await playB64(wav, 'breath_in.wav');
}

// ── 冥想呼气：低频弦音（沉降收敛）──
export async function playBreathOut() {
  const wav = synthesize(
    [
      { freq: 220,   amp: 1.0  }, // A3，低沉
      { freq: 220.2, amp: 0.8  }, // 微差拍频，弦乐颤动感
      { freq: 330,   amp: 0.4  }, // 五度
      { freq: 440,   amp: 0.2  }, // 八度泛音
      { freq: 110,   amp: 0.3  }, // 低八度，厚重
    ],
    900,
    { a: 0.08, d: 0.15, s: 0.5, r: 0.6 },
    0.25
  );
  await playB64(wav, 'breath_out.wav');
}

// ── 旧接口兼容 ──
export async function playBreathTone(phase: 'inhale' | 'exhale') {
  if (phase === 'inhale') await playBreathIn();
  else await playBreathOut();
}

// ── hourly 整点：木鱼（短促空洞）──
export async function playZenBowl() {
  // 木鱼特征：中低频，极短衰减，空洞感（噪声+纯音叠加）
  const wav = synthesize(
    [
      { freq: 320,   amp: 1.0  }, // 木质基频
      { freq: 640,   amp: 0.6  }, // 倍频
      { freq: 480,   amp: 0.4  }, // 空洞感泛音
      { freq: 960,   amp: 0.15 },
    ],
    800,
    { a: 0.003, d: 0.05, s: 0.2, r: 0.7 }, // 极快攻击，快速衰减
    0.75,
    0.04 // 少量噪声，模拟木头质感
  );
  await playB64(wav, 'bowl.wav');
}

// ── evening 开始：古琴拨弦（单音，余韵长）──
export async function playGuqinPluck() {
  const wav = synthesize(
    [
      { freq: 196,   amp: 1.0  }, // G3，古琴低音区
      { freq: 196.15,amp: 0.85 }, // 微差，弦乐颤动
      { freq: 392,   amp: 0.45 }, // 八度泛音
      { freq: 588,   amp: 0.22 }, // 五度泛音
      { freq: 784,   amp: 0.1  }, // 二倍八度
      { freq: 98,    amp: 0.2  }, // 低八度共鸣
    ],
    4500,
    { a: 0.004, d: 0.12, s: 0.55, r: 0.55 }, // 快攻击模拟拨弦，长余韵
    0.7,
    0.015 // 极少噪声，弦音质感
  );
  await playB64(wav, 'guqin.wav');
}

// ── evening 背景：等待真实雨声文件 ──
let eveningSound: any = null;

export async function playEveningTone() {
  // 暂时用低频环境音占位，后续替换为真实雨声文件
  const wav = synthesize(
    [
      { freq: 174,   amp: 1.0  },
      { freq: 174.3, amp: 0.9  },
      { freq: 261,   amp: 0.3  },
      { freq: 87,    amp: 0.4  },
    ],
    5000,
    { a: 0.2, d: 0.1, s: 0.8, r: 0.3 },
    0.4
  );
  eveningSound = await playB64(wav, 'evening.wav', 0.4);
}

export async function stopEveningTone() {
  if (eveningSound) {
    try {
      await eveningSound.stopAsync();
      await eveningSound.unloadAsync();
    } catch (e) {}
    eveningSound = null;
  }
}

// ── onboarding 翻页音：极轻木鱼单击 ──
export async function playPageTurn() {
  const wav = synthesize(
    [
      { freq: 320, amp: 1.0 },
      { freq: 640, amp: 0.4 },
      { freq: 480, amp: 0.3 },
    ],
    400,
    { a: 0.003, d: 0.04, s: 0.1, r: 0.8 },
    0.35,
    0.02
  );
  await playB64(wav, 'page_turn.wav');
}

// ── onboarding 开场：颂钵长鸣 ──
export async function playWelcomeBell() {
  const wav = synthesize(
    [
      { freq: 432,   amp: 1.0  },
      { freq: 432.4, amp: 0.9  },
      { freq: 864,   amp: 0.4  },
      { freq: 1296,  amp: 0.18 },
      { freq: 216,   amp: 0.25 },
    ],
    5000,
    { a: 0.005, d: 0.1, s: 0.75, r: 0.55 },
    0.75
  );
  await playB64(wav, 'welcome.wav');
}
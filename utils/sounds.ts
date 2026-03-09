const FileSystem = require('expo-file-system/legacy');
const { Sound } = require('expo-av/build/Audio');

const SAMPLE_RATE = 44100;

// ── ADSR 包络 ──
function adsr(i: number, total: number, a: number, d: number, s: number, r: number): number {
  const t = i / total;
  if (t < a) return t / a;
  if (t < a + d) return 1 - (1 - s) * ((t - a) / d);
  if (t < 1 - r) return s;
  return s * (1 - (t - (1 - r)) / r);
}

// ── 泛音合成（多个正弦波叠加）──
function synthesize(
  partials: { freq: number; amp: number }[],
  durationMs: number,
  envelope: { a: number; d: number; s: number; r: number },
  volume: number
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
    view.setInt16(44 + i * 2, Math.round(val * env * volume * 32767), true);
  }

  const bytes = new Uint8Array(buffer);
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}

async function playB64(b64: string, filename: string, volume: number = 1.0) {
  try {
    const path = FileSystem.cacheDirectory + filename;
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

// ── 晨醒铃声：悠扬双音，泛音丰富 ──
export async function playAlarmBell() {
  // 第一声：A4 528Hz 带丰富泛音
  const bell1 = synthesize(
    [
      { freq: 528,  amp: 1.0  },
      { freq: 1056, amp: 0.5  },
      { freq: 1584, amp: 0.25 },
      { freq: 2112, amp: 0.12 },
      { freq: 704,  amp: 0.3  }, // 小三度泛音
    ],
    3000,
    { a: 0.01, d: 0.1, s: 0.6, r: 0.4 },
    0.85
  );
  await playB64(bell1, 'alarm1.wav');

  // 第二声：E5 660Hz，稍低音量，延迟响起
  setTimeout(async () => {
    const bell2 = synthesize(
      [
        { freq: 660,  amp: 1.0  },
        { freq: 1320, amp: 0.4  },
        { freq: 1980, amp: 0.2  },
        { freq: 880,  amp: 0.25 },
      ],
      2500,
      { a: 0.01, d: 0.08, s: 0.5, r: 0.45 },
      0.7
    );
    await playB64(bell2, 'alarm2.wav');
  }, 1800);
}

// ── 呼吸引导音：柔和，接近人声泛音 ──
export async function playBreathTone(phase: 'inhale' | 'exhale') {
  if (phase === 'inhale') {
    const wav = synthesize(
      [
        { freq: 396, amp: 1.0 },
        { freq: 792, amp: 0.3 },
        { freq: 528, amp: 0.2 }, // 五度泛音
      ],
      800,
      { a: 0.3, d: 0.1, s: 0.7, r: 0.4 }, // 慢攻击，柔和进入
      0.35
    );
    await playB64(wav, 'inhale.wav');
  } else {
    const wav = synthesize(
      [
        { freq: 285, amp: 1.0 },
        { freq: 570, amp: 0.25 },
        { freq: 427, amp: 0.15 },
      ],
      900,
      { a: 0.1, d: 0.1, s: 0.6, r: 0.5 }, // 长释放，自然消散
      0.3
    );
    await playB64(wav, 'exhale.wav');
  }
}

// ── 禅钵声：真实钵声特征（非线性衰减 + 拍频）──
export async function playZenBowl() {
  const wav = synthesize(
    [
      { freq: 440,    amp: 1.0  }, // 基频
      { freq: 440.5,  amp: 0.8  }, // 微差造成拍频（模拟真实钵声颤动）
      { freq: 1174,   amp: 0.35 }, // 第二泛音（真实钵声比例）
      { freq: 1174.3, amp: 0.28 },
      { freq: 2093,   amp: 0.15 }, // 第三泛音
      { freq: 880,    amp: 0.2  },
    ],
    4000,
    { a: 0.005, d: 0.05, s: 0.75, r: 0.6 }, // 极快攻击模拟敲击
    0.9
  );
  await playB64(wav, 'bowl.wav');
}

// ── 晚间背景音：低频持续环境音（双拍频 + 泛音） ──
let eveningSound: any = null;

export async function playEveningTone() {
  const wav = synthesize(
    [
      { freq: 174,   amp: 1.0  },
      { freq: 174.3, amp: 0.9  }, // 微差拍频，产生轻微律动感
      { freq: 261,   amp: 0.3  }, // 五度音
      { freq: 348,   amp: 0.15 }, // 八度泛音
      { freq: 87,    amp: 0.4  }, // 低八度，增加厚重感
    ],
    5000,
    { a: 0.15, d: 0.1, s: 0.8, r: 0.3 },
    0.5
  );
  eveningSound = await playB64(wav, 'evening.wav', 0.5);
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
import { useAudioPlayer } from 'expo-audio';

function generateWav(frequency: number, durationMs: number, volume: number): string {
  const sampleRate = 22050;
  const numSamples = Math.floor(sampleRate * durationMs / 1000);
  const dataSize = numSamples * 2;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  const write = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
  };

  write(0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  write(8, 'WAVE');
  write(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  write(36, 'data');
  view.setUint32(40, dataSize, true);

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const env = Math.exp(-t * 2.0);
    const val = Math.sin(2 * Math.PI * frequency * t) * env * volume;
    view.setInt16(44 + i * 2, Math.round(val * 32767), true);
  }

  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return 'data:audio/wav;base64,' + btoa(binary);
}

export async function playAlarmBell() {
  try {
    const { AudioPlayer } = await import('expo-audio');
    const uri = generateWav(528, 2000, 0.9);
    const player = new AudioPlayer({ uri });
    player.play();
  } catch (e) {
    console.log('playAlarmBell error:', e);
  }
}

export async function playBreathTone(phase: 'inhale' | 'exhale') {
  try {
    const { AudioPlayer } = await import('expo-audio');
    const freq = phase === 'inhale' ? 396 : 285;
    const uri = generateWav(freq, 600, 0.4);
    const player = new AudioPlayer({ uri });
    player.play();
  } catch (e) {
    console.log('playBreathTone error:', e);
  }
}

export async function playZenBowl() {
  try {
    const { AudioPlayer } = await import('expo-audio');
    const uri = generateWav(440, 3000, 0.9);
    const player = new AudioPlayer({ uri });
    player.play();
  } catch (e) {
    console.log('playZenBowl error:', e);
  }
}

export async function playEveningTone() {
  try {
    const { AudioPlayer } = await import('expo-audio');
    const uri = generateWav(174, 3500, 0.5);
    const player = new AudioPlayer({ uri });
    player.play();
  } catch (e) {
    console.log('playEveningTone error:', e);
  }
}
```

保存后运行：
```
npx expo start --clear
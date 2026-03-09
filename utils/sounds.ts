const FileSystem = require('expo-file-system/legacy');

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
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

async function playWav(frequency: number, durationMs: number, volume: number) {
  try {
    console.log('playWav called:', frequency);
    const b64 = generateWav(frequency, durationMs, volume);
    const path = FileSystem.cacheDirectory + `tone_${frequency}.wav`;

    await FileSystem.writeAsStringAsync(path, b64, { encoding: 'base64' });

    const { Sound } = require('expo-av/build/Audio');
    const { sound } = await Sound.createAsync(
      { uri: path },
      { shouldPlay: true, volume }
    );
    sound.setOnPlaybackStatusUpdate((s: any) => {
      if (s.isLoaded && s.didJustFinish) sound.unloadAsync();
    });
  } catch (e) {
    console.log('playWav error:', e);
  }
}

export async function playAlarmBell() {
  await playWav(528, 2000, 0.9);
  setTimeout(() => playWav(660, 1500, 0.7), 1000);
}

export async function playBreathTone(phase: 'inhale' | 'exhale') {
  await playWav(phase === 'inhale' ? 396 : 285, 600, 0.4);
}

export async function playZenBowl() {
  await playWav(440, 3000, 0.9);
}

export async function playEveningTone() {
  await playWav(174, 3500, 0.5);
}
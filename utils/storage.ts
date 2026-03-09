import AsyncStorage from '@react-native-async-storage/async-storage';

export interface DayRecord {
  date: string;        // 'YYYY-MM-DD'
  morningDone: boolean;
  eveningDone: boolean;
  score: number;       // 0-4
  totalMinutes: number;
}

export interface AppData {
  alarmHour: number;
  alarmMinute: number;
  allPoints: number;
  records: DayRecord[];
}

const DEFAULT: AppData = {
  alarmHour: 6,
  alarmMinute: 0,
  allPoints: 0,
  records: [],
};

const KEY = 'zenwakeup_data';

export async function loadData(): Promise<AppData> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return DEFAULT;
    return { ...DEFAULT, ...JSON.parse(raw) };
  } catch {
    return DEFAULT;
  }
}

export async function saveData(data: AppData): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(data));
  } catch (e) {
    console.log('saveData error:', e);
  }
}

export function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

export function getTodayRecord(data: AppData): DayRecord {
  const today = todayStr();
  return data.records.find(r => r.date === today) ?? {
    date: today,
    morningDone: false,
    eveningDone: false,
    score: 2,
    totalMinutes: 0,
  };
}

export async function updateTodayRecord(
  patch: Partial<DayRecord>
): Promise<AppData> {
  const data = await loadData();
  const today = todayStr();
  const idx = data.records.findIndex(r => r.date === today);
  const existing = getTodayRecord(data);
  const updated = { ...existing, ...patch };

  if (idx >= 0) {
    data.records[idx] = updated;
  } else {
    data.records.push(updated);
  }

  // 计算积分
  if (updated.morningDone && updated.eveningDone) {
    const wasComplete = existing.morningDone && existing.eveningDone;
    if (!wasComplete) data.allPoints += 25;
  }

  await saveData(data);
  return data;
}

export async function saveAlarmTime(hour: number, minute: number): Promise<void> {
  const data = await loadData();
  data.alarmHour = hour;
  data.alarmMinute = minute;
  await saveData(data);
}
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
  meditationMinutes: number;
  hasOnboarded: boolean;
  records: DayRecord[];
  // 试用 & 付费
  trialStartDate: string | null;   // 首次启动日期 'YYYY-MM-DD'
  isPurchased: boolean;            // 是否已买断
}

const DEFAULT: AppData = {
  alarmHour: 6,
  alarmMinute: 0,
  allPoints: 0,
  meditationMinutes: 5,
  hasOnboarded: false,
  records: [],
  trialStartDate: null,
  isPurchased: false,
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

export async function completeOnboarding(
  minutes: number
): Promise<void> {
  const data = await loadData();
  data.hasOnboarded = true;
  data.meditationMinutes = minutes;
  await saveData(data);
}
// 获取试用状态
export async function getTrialStatus(): Promise<{
  isTrialActive: boolean;
  isPurchased: boolean;
  daysLeft: number;
  trialExpired: boolean;
}> {
  const data = await loadData();

  if (data.isPurchased) {
    return { isTrialActive: false, isPurchased: true, daysLeft: 0, trialExpired: false };
  }

  if (!data.trialStartDate) {
    // 第一次启动，记录试用开始日期
    const today = todayStr();
    data.trialStartDate = today;
    await saveData(data);
    return { isTrialActive: true, isPurchased: false, daysLeft: 7, trialExpired: false };
  }

  const start = new Date(data.trialStartDate);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  const daysLeft = Math.max(0, 7 - diffDays);

  return {
    isTrialActive: daysLeft > 0,
    isPurchased: false,
    daysLeft,
    trialExpired: daysLeft === 0,
  };
}

// 标记为已购买（RevenueCat 接入后调用这个）
export async function setPurchased(): Promise<void> {
  const data = await loadData();
  data.isPurchased = true;
  await saveData(data);
}
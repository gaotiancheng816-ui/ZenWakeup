import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { setPurchased } from '../utils/storage';

const { width } = Dimensions.get('window');

const INK = '#2a2e24';
const INK2 = '#485040';
const INK3 = '#7a8472';
const GOLD = '#8a7040';
const BG = '#dedad2';

interface Props {
  daysLeft?: number;
  trialExpired?: boolean;
}

export default function PaywallScreen({ daysLeft = 0, trialExpired = false }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // 模拟购买（RevenueCat 接入前用这个）
  async function handlePurchase() {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1500)); // 模拟网络请求
    await setPurchased();
    setLoading(false);
    router.replace('/(tabs)');
  }

  // 恢复购买（RevenueCat 接入前用这个）
  async function handleRestore() {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setLoading(false);
    alert('No previous purchase found.');
  }

  return (
    <View style={styles.container}>
      {/* 山形背景 SVG 可以后续加，先用纯色 */}

      {/* 顶部标题 */}
      <View style={styles.top}>
        <Text style={styles.title}>ZenWakeup</Text>
        <Text style={styles.subtitle}>每一个清晨，都值得好好开始</Text>
      </View>

      {/* 试用状态提示 */}
      <View style={styles.statusBox}>
        {trialExpired ? (
          <Text style={styles.expiredText}>你的 7 天免费试用已结束</Text>
        ) : (
          <Text style={styles.trialText}>
            免费试用剩余 <Text style={{ color: GOLD }}>{daysLeft} 天</Text>
          </Text>
        )}
      </View>

      {/* 功能列表 */}
      <View style={styles.features}>
        {[
          '每日冥想引导',
          '个性化禅意问候',
          '山路成长系统（180天）',
          '晚间 reflection & 月历',
          '永久使用，买断一次',
        ].map((f, i) => (
          <View key={i} style={styles.featureRow}>
            <Text style={styles.featureDot}>·</Text>
            <Text style={styles.featureText}>{f}</Text>
          </View>
        ))}
      </View>

      {/* 价格 */}
      <View style={styles.priceBox}>
        <Text style={styles.price}>€ 2.99</Text>
        <Text style={styles.priceNote}>一次买断 · 永久使用</Text>
      </View>

      {/* 购买按钮 */}
      <TouchableOpacity
        style={styles.buyButton}
        onPress={handlePurchase}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={BG} />
        ) : (
          <Text style={styles.buyText}>立即解锁</Text>
        )}
      </TouchableOpacity>

      {/* 恢复购买 */}
      <TouchableOpacity onPress={handleRestore} disabled={loading}>
        <Text style={styles.restoreText}>恢复购买</Text>
      </TouchableOpacity>

      {/* 底部说明 */}
      <Text style={styles.legalText}>
        一次性付款，无订阅，无自动续费
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 36,
  },
  top: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '200',
    color: INK,
    letterSpacing: 6,
  },
  subtitle: {
    fontSize: 13,
    color: INK3,
    marginTop: 8,
    letterSpacing: 2,
    fontWeight: '300',
  },
  statusBox: {
    marginBottom: 24,
  },
  trialText: {
    fontSize: 14,
    color: INK2,
    letterSpacing: 1,
  },
  expiredText: {
    fontSize: 14,
    color: GOLD,
    letterSpacing: 1,
  },
  features: {
    width: '100%',
    marginBottom: 32,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  featureDot: {
    color: GOLD,
    fontSize: 18,
    marginRight: 10,
    lineHeight: 20,
  },
  featureText: {
    fontSize: 14,
    color: INK2,
    fontWeight: '300',
    letterSpacing: 1,
    lineHeight: 20,
  },
  priceBox: {
    alignItems: 'center',
    marginBottom: 24,
  },
  price: {
    fontSize: 36,
    fontWeight: '200',
    color: INK,
    letterSpacing: 2,
  },
  priceNote: {
    fontSize: 12,
    color: INK3,
    letterSpacing: 2,
    marginTop: 4,
  },
  buyButton: {
    backgroundColor: INK,
    paddingVertical: 14,
    paddingHorizontal: 48,
    borderRadius: 2,
    marginBottom: 16,
    width: width - 72,
    alignItems: 'center',
  },
  buyText: {
    color: BG,
    fontSize: 15,
    fontWeight: '300',
    letterSpacing: 4,
  },
  restoreText: {
    fontSize: 12,
    color: INK3,
    letterSpacing: 2,
    marginBottom: 24,
  },
  legalText: {
    fontSize: 10,
    color: INK3,
    letterSpacing: 1,
    textAlign: 'center',
    position: 'absolute',
    bottom: 40,
  },
});
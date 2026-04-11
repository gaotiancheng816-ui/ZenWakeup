import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { TapButton } from '../components/tap-button';
import Purchases from 'react-native-purchases';
import { AppTheme } from '../constants/app-themes';
import { useTheme } from '../utils/theme-context';
import { setPurchased } from '../utils/storage';

const { width } = Dimensions.get('window');

const RC_API_KEY = 'goog_rjHUqiJZGzrvmXnxGAiyrSUfbFx';

interface Props {
  daysLeft?: number;
  trialExpired?: boolean;
  onPurchased: () => void;
}

export default function PaywallScreen({ daysLeft = 0, trialExpired = false, onPurchased }: Props) {
  const { theme: T } = useTheme();
  const INK = T.ink, INK2 = T.ink2, INK3 = T.ink3, GOLD = T.gold, BG = T.bg;
  const styles = makeStyles(T);
  const [loading, setLoading] = useState(false);
  const [price,   setPrice]   = useState('€ 2.99');

  useEffect(() => {
    Purchases.configure({ apiKey: RC_API_KEY });
    fetchPrice();
  }, []);

  async function fetchPrice() {
    try {
      const offerings = await Purchases.getOfferings();
      const lifetime = offerings.current?.availablePackages.find(
        p => p.packageType === 'LIFETIME'
      );
      if (lifetime) {
        setPrice(lifetime.product.priceString);
      }
    } catch (e) {
      console.log('fetchPrice error:', e);
    }
  }

  async function handlePurchase() {
    setLoading(true);
    try {
      const offerings = await Purchases.getOfferings();
      const lifetime = offerings.current?.availablePackages.find(
        p => p.packageType === 'LIFETIME'
      );
      if (!lifetime) throw new Error('Product not found');
      await Purchases.purchasePackage(lifetime);
      await setPurchased();
      onPurchased();
    } catch (e: any) {
      if (!e.userCancelled) {
        Alert.alert('Purchase failed', 'Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleRestore() {
    setLoading(true);
    try {
      const info = await Purchases.restorePurchases();
      const active = info.entitlements.active['zenwakeup_pro'];
      if (active) {
        await setPurchased();
        onPurchased();
      } else {
        Alert.alert('No purchase found', 'No previous purchase found for this account.');
      }
    } catch (e) {
      Alert.alert('Restore failed', 'Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.top}>
        <Text style={styles.zen}>
          Seven days of quiet mornings.{'\n'}
          If this stillness has meant something to you —
        </Text>
        <View style={{ height: 24 }} />
        <Text style={styles.title}>ZenWakeup</Text>
      </View>

      <View style={styles.features}>
        {[
          'Daily meditation guidance',
          'Personalized zen greetings',
          'Mountain path growth system (180 days)',
          'Evening reflection & moon calendar',
          'Yours forever · one-time purchase',
        ].map((f, i) => (
          <View key={i} style={styles.featureRow}>
            <Text style={styles.featureDot}>·</Text>
            <Text style={styles.featureText}>{f}</Text>
          </View>
        ))}
      </View>

      <View style={styles.priceBox}>
        <Text style={styles.price}>{price}</Text>
        <Text style={styles.priceNote}>One-time · Yours forever</Text>
      </View>

      <TapButton
        style={styles.buyButton}
        onPress={handlePurchase}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={BG} />
        ) : (
          <Text style={styles.buyText}>Support  ›</Text>
        )}
      </TapButton>

      <TapButton onPress={handleRestore} disabled={loading}>
        <Text style={styles.restoreText}>Restore purchase</Text>
      </TapButton>

      <Text style={styles.legalText}>
        One-time payment · No subscription · No auto-renewal
      </Text>
    </View>
  );
}

function makeStyles(T: AppTheme) {
  const INK = T.ink, INK2 = T.ink2, INK3 = T.ink3, GOLD = T.gold, BG = T.bg;
  return StyleSheet.create({
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
  zen: {
    fontSize: 13,
    color: INK2,
    letterSpacing: 1.5,
    fontWeight: '300',
    lineHeight: 22,
    textAlign: 'center',
    fontStyle: 'italic',
    opacity: 0.7,
  },
  title: {
    fontSize: 28,
    fontWeight: '200',
    color: INK,
    letterSpacing: 6,
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
}
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';

import { useAuth } from '@/store/auth-context';
import { useItems } from '@/store/items-context';
import {
  requestNotificationPermission,
  getNotificationPermissionStatus,
} from '@/lib/notifications';
import { Avatar } from '@/components/ui/avatar';
import { ItemCard } from '@/components/items/item-card';
import { COMMUNITY_STATS } from '@/constants/mock-data';
import {
  Colors,
  Spacing,
  Radius,
  FontSize,
  FontWeight,
  Shadow,
} from '@/constants/theme';
import { formatWeight } from '@/lib/format';

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({ label, value, emoji }: { label: string; value: string | number; emoji: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statEmoji}>{emoji}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

// ─── Trust Badge ──────────────────────────────────────────────────────────────

function TrustBadge({ score }: { score: number }) {
  const level =
    score >= 90 ? { label: 'Trusted Stooper', emoji: '🏆', color: Colors.accent } :
    score >= 70 ? { label: 'Reliable', emoji: '⭐', color: Colors.primary } :
    score >= 50 ? { label: 'New Member', emoji: '🌱', color: Colors.textSecondary } :
                  { label: 'Getting Started', emoji: '👋', color: Colors.textTertiary };

  return (
    <View style={[styles.trustBadge, { borderColor: level.color + '40', backgroundColor: level.color + '15' }]}>
      <Text style={styles.trustEmoji}>{level.emoji}</Text>
      <Text style={[styles.trustLabel, { color: level.color }]}>{level.label}</Text>
      <Text style={[styles.trustScore, { color: level.color }]}>{score}/100</Text>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const { items } = useItems();
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  useEffect(() => {
    getNotificationPermissionStatus().then((status) => {
      setNotificationsEnabled(status === 'granted');
    });
  }, []);

  const handleNotificationToggle = async (value: boolean) => {
    if (value) {
      const granted = await requestNotificationPermission();
      setNotificationsEnabled(granted);
      if (!granted) {
        Alert.alert(
          'Notifications Blocked',
          'Please enable notifications in your device settings.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() },
          ]
        );
      }
    } else {
      Alert.alert(
        'Disable Notifications',
        'To turn off notifications, go to your device settings.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: () => Linking.openSettings() },
        ]
      );
    }
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.authPrompt} edges={['top']}>
        <StatusBar style="dark" />
        <Text style={styles.authEmoji}>🪴</Text>
        <Text style={styles.authTitle}>Join Stooping Club</Text>
        <Text style={styles.authSub}>
          Create an account to post items, message people, and track your community impact.
        </Text>
        <TouchableOpacity
          style={styles.signInBtn}
          onPress={() => router.push('/auth')}
        >
          <Text style={styles.signInBtnText}>Sign In or Sign Up</Text>
        </TouchableOpacity>
        <Text style={styles.browsing}>Browse without signing in →</Text>
      </SafeAreaView>
    );
  }

  const myItems = items.filter((i) => i.userId === user.id);

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: () => signOut(),
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.header} edges={['top']}>
        <Text style={styles.headerTitle}>Profile</Text>
      </SafeAreaView>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* User info */}
        <View style={styles.userSection}>
          <Avatar user={user} size={72} showBadge />
          <View style={styles.userInfo}>
            <Text style={styles.username}>@{user.username}</Text>
            <Text style={styles.email}>{user.email}</Text>
            {user.verifiedEmail && (
              <View style={styles.verifiedRow}>
                <Text style={styles.verifiedText}>✅ Berkeley verified</Text>
              </View>
            )}
          </View>
        </View>

        {/* Trust badge */}
        <TrustBadge score={user.trustScore} />

        {/* Stats */}
        <View style={styles.statsRow}>
          <StatCard label="Posted" value={user.itemsPosted} emoji="📦" />
          <StatCard label="Claimed" value={user.itemsClaimed} emoji="🙌" />
          <StatCard label="Rating" value={`${user.rating.toFixed(1)}★`} emoji="⭐" />
        </View>

        {/* Environmental impact */}
        <View style={styles.impactCard}>
          <Text style={styles.impactTitle}>🌍 Your Impact</Text>
          <Text style={styles.impactValue}>
            {formatWeight(user.environmentalImpactLbs)}
          </Text>
          <Text style={styles.impactSub}>kept from landfill</Text>
          <View style={styles.impactBar}>
            <View
              style={[
                styles.impactFill,
                {
                  width: `${Math.min(
                    (user.environmentalImpactLbs / 1000) * 100,
                    100
                  )}%`,
                },
              ]}
            />
          </View>
          <Text style={styles.impactNote}>
            Community total: {formatWeight(COMMUNITY_STATS.totalWeightKeptFromLandfillLbs)}
          </Text>
        </View>

        {/* Bio */}
        {user.bio ? (
          <View style={styles.bio}>
            <Text style={styles.bioText}>{user.bio}</Text>
          </View>
        ) : null}

        {/* Settings */}
        <View style={styles.settingsSection}>
          <Text style={styles.settingsSectionTitle}>Settings</Text>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>🔔 Notifications</Text>
            <Switch
              value={notificationsEnabled}
              onValueChange={handleNotificationToggle}
              trackColor={{ false: Colors.border, true: Colors.primaryLight }}
              thumbColor={notificationsEnabled ? Colors.primary : Colors.textTertiary}
            />
          </View>

          <TouchableOpacity style={styles.settingRow}>
            <Text style={styles.settingLabel}>🔐 Privacy Settings</Text>
            <Text style={styles.settingArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingRow}>
            <Text style={styles.settingLabel}>⭐ Saved Searches</Text>
            <Text style={styles.settingArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingRow}>
            <Text style={styles.settingLabel}>🛡 Verification</Text>
            <Text style={[styles.settingArrow, user.verified && styles.verified]}>
              {user.verified ? '✓ Verified' : 'Get verified ›'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingRow} onPress={handleSignOut}>
            <Text style={[styles.settingLabel, { color: Colors.error }]}>Sign Out</Text>
            <Text style={styles.settingArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* My items */}
        {myItems.length > 0 && (
          <View style={styles.myItemsSection}>
            <Text style={styles.settingsSectionTitle}>My Items ({myItems.length})</Text>
            {myItems.slice(0, 3).map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.md,
  },
  headerTitle: {
    fontSize: FontSize['2xl'],
    fontWeight: FontWeight.black,
    color: Colors.text,
    letterSpacing: -0.5,
    paddingTop: Spacing.sm,
  },
  content: {
    paddingBottom: 120,
  },

  // User section
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.base,
    padding: Spacing.base,
    backgroundColor: Colors.surface,
    marginBottom: Spacing.sm,
  },
  userInfo: { flex: 1 },
  username: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.text,
  },
  email: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  verifiedRow: { marginTop: 4 },
  verifiedText: {
    fontSize: FontSize.xs,
    color: Colors.primary,
    fontWeight: '600',
  },

  // Trust badge
  trustBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginHorizontal: Spacing.base,
    marginBottom: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
  },
  trustEmoji: { fontSize: 20 },
  trustLabel: {
    flex: 1,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
  },
  trustScore: {
    fontSize: FontSize.sm,
    fontWeight: '600',
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.base,
    marginBottom: Spacing.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    gap: 2,
    ...Shadow.xs,
  },
  statEmoji: { fontSize: 20, marginBottom: 2 },
  statValue: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.text,
  },
  statLabel: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },

  // Impact card
  impactCard: {
    marginHorizontal: Spacing.base,
    marginBottom: Spacing.sm,
    padding: Spacing.base,
    backgroundColor: Colors.primaryMuted,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.primaryLight,
  },
  impactTitle: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 4,
  },
  impactValue: {
    fontSize: FontSize['3xl'],
    fontWeight: FontWeight.black,
    color: Colors.primary,
  },
  impactSub: {
    fontSize: FontSize.sm,
    color: Colors.primaryDark,
    marginBottom: Spacing.md,
  },
  impactBar: {
    height: 6,
    backgroundColor: Colors.primaryLight,
    borderRadius: Radius.full,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  },
  impactFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: Radius.full,
  },
  impactNote: {
    fontSize: FontSize.xs,
    color: Colors.primaryDark,
  },

  // Bio
  bio: {
    marginHorizontal: Spacing.base,
    marginBottom: Spacing.sm,
    padding: Spacing.base,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
  },
  bioText: {
    fontSize: FontSize.base,
    color: Colors.text,
    lineHeight: 22,
    fontStyle: 'italic',
  },

  // Settings
  settingsSection: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    marginHorizontal: Spacing.base,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
    ...Shadow.xs,
  },
  settingsSectionTitle: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.textSecondary,
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  settingLabel: {
    fontSize: FontSize.base,
    color: Colors.text,
  },
  settingArrow: {
    fontSize: FontSize.base,
    color: Colors.textTertiary,
  },
  verified: {
    color: Colors.primary,
    fontWeight: '600',
  },

  // My items
  myItemsSection: {
    marginTop: Spacing.sm,
  },

  // Auth prompt
  authPrompt: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing['2xl'],
  },
  authEmoji: { fontSize: 64, marginBottom: Spacing.base },
  authTitle: {
    fontSize: FontSize['2xl'],
    fontWeight: FontWeight.black,
    color: Colors.text,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  authSub: {
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.xl,
  },
  signInBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: Radius.full,
    marginBottom: Spacing.base,
    ...Shadow.md,
  },
  signInBtnText: {
    color: Colors.textInverse,
    fontSize: FontSize.base,
    fontWeight: '700',
  },
  browsing: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
});

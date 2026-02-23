import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { useAuth } from '@/store/auth-context';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Colors,
  Spacing,
  Radius,
  FontSize,
  FontWeight,
  Shadow,
} from '@/constants/theme';

type Mode = 'signin' | 'signup';

export default function AuthScreen() {
  const { signIn, signUp, loading } = useAuth();
  const [mode, setMode] = useState<Mode>('signin');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!email.includes('@')) errs.email = 'Enter a valid email';
    if (password.length < 6) errs.password = 'Password must be at least 6 characters';
    if (mode === 'signup' && username.trim().length < 2) errs.username = 'Username is too short';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      if (mode === 'signin') {
        await signIn(email, password);
      } else {
        await signUp(username, email, password);
      }
      router.back();
    } catch {
      setErrors({ general: 'Something went wrong. Please try again.' });
    }
  };

  const switchMode = () => {
    Haptics.selectionAsync();
    setMode(mode === 'signin' ? 'signup' : 'signin');
    setErrors({});
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar style="dark" />
      <SafeAreaView style={styles.header} edges={['top']}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <Text style={styles.closeBtnText}>✕</Text>
        </TouchableOpacity>
      </SafeAreaView>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Brand */}
        <View style={styles.brand}>
          <Text style={styles.logo}>stooping</Text>
          <Text style={styles.tagline}>Free items. Local community. Real impact.</Text>
        </View>

        {/* Mode tabs */}
        <View style={styles.modeTabs}>
          <TouchableOpacity
            style={[styles.modeTab, mode === 'signin' && styles.modeTabActive]}
            onPress={() => setMode('signin')}
          >
            <Text style={[styles.modeTabText, mode === 'signin' && styles.modeTabTextActive]}>
              Sign In
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeTab, mode === 'signup' && styles.modeTabActive]}
            onPress={() => setMode('signup')}
          >
            <Text style={[styles.modeTabText, mode === 'signup' && styles.modeTabTextActive]}>
              Sign Up
            </Text>
          </TouchableOpacity>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {errors.general && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorBannerText}>{errors.general}</Text>
            </View>
          )}

          {mode === 'signup' && (
            <Input
              label="Username"
              placeholder="berkeleybound"
              value={username}
              onChangeText={setUsername}
              error={errors.username}
              autoCapitalize="none"
              autoCorrect={false}
            />
          )}

          <Input
            label="Email"
            placeholder={mode === 'signup' ? 'you@berkeley.edu' : 'your@email.com'}
            value={email}
            onChangeText={setEmail}
            error={errors.email}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            hint={
              mode === 'signup'
                ? 'Use .edu email to get a Verified badge'
                : undefined
            }
          />

          <Input
            label="Password"
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            error={errors.password}
            secureTextEntry
          />

          <Button
            label={mode === 'signin' ? 'Sign In' : 'Create Account'}
            onPress={handleSubmit}
            loading={loading}
            size="lg"
            fullWidth
            style={{ marginTop: Spacing.sm }}
          />
        </View>

        {/* Divider */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Demo mode */}
        <TouchableOpacity
          style={styles.demoBtn}
          onPress={async () => {
            await signIn('alex@berkeley.edu', 'demo');
            router.back();
          }}
        >
          <Text style={styles.demoBtnText}>🎓 Continue as Demo User</Text>
        </TouchableOpacity>

        {/* Switch mode */}
        <TouchableOpacity style={styles.switchMode} onPress={switchMode}>
          <Text style={styles.switchModeText}>
            {mode === 'signin'
              ? "Don't have an account? Sign up →"
              : 'Already have an account? Sign in →'}
          </Text>
        </TouchableOpacity>

        {/* Benefits (signup mode) */}
        {mode === 'signup' && (
          <View style={styles.benefits}>
            {[
              '🏷 Post free items in under 30 seconds',
              '🌍 Track your environmental impact',
              '💬 Message posters directly',
              '🏆 Build your community trust score',
              '✅ Get verified with .edu email',
            ].map((benefit) => (
              <View key={benefit} style={styles.benefit}>
                <Text style={styles.benefitText}>{benefit}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.sm,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-end',
  },
  closeBtnText: { fontSize: 16, color: Colors.textSecondary, fontWeight: '600' },

  content: {
    padding: Spacing.xl,
    paddingBottom: 60,
  },

  // Brand
  brand: { alignItems: 'center', marginBottom: Spacing.xl },
  logo: {
    fontSize: FontSize['3xl'],
    fontWeight: FontWeight.black,
    color: Colors.primary,
    letterSpacing: -1,
  },
  tagline: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },

  // Mode tabs
  modeTabs: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceMuted,
    borderRadius: Radius.md,
    padding: 4,
    marginBottom: Spacing.xl,
  },
  modeTab: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    borderRadius: Radius.sm,
  },
  modeTabActive: { backgroundColor: Colors.surface, ...Shadow.xs },
  modeTabText: {
    fontSize: FontSize.base,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  modeTabTextActive: { color: Colors.text },

  // Form
  form: { gap: 0 },
  errorBanner: {
    padding: Spacing.md,
    backgroundColor: Colors.errorBg,
    borderRadius: Radius.md,
    marginBottom: Spacing.md,
  },
  errorBannerText: { color: Colors.error, fontSize: FontSize.sm, fontWeight: '500' },

  // Divider
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginVertical: Spacing.lg,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: Colors.border },
  dividerText: { fontSize: FontSize.sm, color: Colors.textTertiary },

  // Demo
  demoBtn: {
    padding: Spacing.md,
    backgroundColor: Colors.accentLight,
    borderRadius: Radius.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.accent + '50',
    marginBottom: Spacing.md,
  },
  demoBtnText: { fontSize: FontSize.base, fontWeight: '700', color: Colors.accent },

  // Switch mode
  switchMode: { alignItems: 'center', marginBottom: Spacing.xl },
  switchModeText: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: '600' },

  // Benefits
  benefits: {
    backgroundColor: Colors.primaryMuted,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.primaryLight,
  },
  benefit: {},
  benefitText: { fontSize: FontSize.sm, color: Colors.primaryDark, lineHeight: 20 },
});

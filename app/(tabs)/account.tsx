import { Image } from 'expo-image';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/context/auth';
import { Colors, Fonts, Palette } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { IconSymbol } from '@/components/ui/icon-symbol';

const LOGO_URI =
  'https://berkeleystooping.org/cdn/shop/files/Stooping_Club_Logo-removebg-preview.png';

type Mode = 'login' | 'signup';

const FOOTER_LINKS = [
  { label: 'About Us', url: 'https://berkeleystooping.org/pages/about-us' },
  { label: 'FAQs', url: 'https://berkeleystooping.org/pages/faqs' },
  { label: 'Donate', url: 'https://berkeleystooping.org/pages/donate' },
  { label: 'Contact', url: 'https://berkeleystooping.org/pages/contact' },
  { label: 'Privacy', url: 'https://berkeleystooping.org/pages/data-sharing-opt-out' },
];

function AuthForm() {
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];
  const { login, signup, loading, error } = useAuth();

  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [showPw, setShowPw] = useState(false);

  const valid =
    email.trim().length > 0 &&
    password.length >= 5 &&
    (mode === 'login' || (firstName.trim().length > 0 && lastName.trim().length > 0));

  const submit = async () => {
    if (!valid) return;
    if (mode === 'login') {
      await login(email.trim(), password);
    } else {
      await signup(email.trim(), password, firstName.trim(), lastName.trim());
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={styles.authScroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.authLogoWrap}>
          <Image source={{ uri: LOGO_URI }} style={styles.authLogo} contentFit="contain" />
          <Text style={[styles.authStoreName, { color: c.text, fontFamily: Fonts.serifBold }]}>
            Stooping Club
          </Text>
        </View>

        <View style={[styles.modeTabs, { backgroundColor: c.cardAlt, borderColor: c.border }]}>
          {(['login', 'signup'] as Mode[]).map((m) => (
            <Pressable
              key={m}
              style={[styles.modeTab, mode === m && { backgroundColor: c.tint }]}
              onPress={() => setMode(m)}
            >
              <Text style={[
                styles.modeTabText,
                { fontFamily: Fonts.sansMedium, color: mode === m ? '#fff' : c.textSecondary }
              ]}>
                {m === 'login' ? 'Sign In' : 'Create Account'}
              </Text>
            </Pressable>
          ))}
        </View>

        {error && (
          <View style={styles.errorBox}>
            <Text style={[styles.errorText, { fontFamily: Fonts.sans }]}>{error}</Text>
          </View>
        )}

        {mode === 'signup' && (
          <View style={styles.nameRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.label, { color: c.text, fontFamily: Fonts.sansMedium }]}>First name</Text>
              <TextInput
                style={[styles.input, { backgroundColor: c.card, borderColor: c.border, color: c.text, fontFamily: Fonts.sans }]}
                placeholder="Jane"
                placeholderTextColor={c.textSecondary}
                value={firstName}
                onChangeText={setFirstName}
                autoCapitalize="words"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.label, { color: c.text, fontFamily: Fonts.sansMedium }]}>Last name</Text>
              <TextInput
                style={[styles.input, { backgroundColor: c.card, borderColor: c.border, color: c.text, fontFamily: Fonts.sans }]}
                placeholder="Doe"
                placeholderTextColor={c.textSecondary}
                value={lastName}
                onChangeText={setLastName}
                autoCapitalize="words"
              />
            </View>
          </View>
        )}

        <View>
          <Text style={[styles.label, { color: c.text, fontFamily: Fonts.sansMedium }]}>Email</Text>
          <TextInput
            style={[styles.input, { backgroundColor: c.card, borderColor: c.border, color: c.text, fontFamily: Fonts.sans }]}
            placeholder="you@example.com"
            placeholderTextColor={c.textSecondary}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <View>
          <Text style={[styles.label, { color: c.text, fontFamily: Fonts.sansMedium }]}>Password</Text>
          <View style={[styles.pwRow, { backgroundColor: c.card, borderColor: c.border }]}>
            <TextInput
              style={[styles.pwInput, { color: c.text, fontFamily: Fonts.sans }]}
              placeholder="Min. 5 characters"
              placeholderTextColor={c.textSecondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPw}
            />
            <Pressable onPress={() => setShowPw((v) => !v)} hitSlop={8}>
              <IconSymbol name={showPw ? 'eye.slash' : 'eye'} size={17} color={c.icon} />
            </Pressable>
          </View>
        </View>

        <Pressable
          style={[styles.submitBtn, { backgroundColor: valid ? c.tint : c.border }]}
          onPress={submit}
          disabled={!valid || loading}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={[styles.submitText, { fontFamily: Fonts.sansBold }]}>
                {mode === 'login' ? 'Sign in' : 'Create account'}
              </Text>
          }
        </Pressable>

        <View style={[styles.footerLinks, { borderTopColor: c.border }]}>
          {FOOTER_LINKS.map(({ label, url }) => (
            <Pressable key={label} onPress={() => Linking.openURL(url)}>
              <Text style={[styles.footerLink, { color: c.tint, fontFamily: Fonts.sans }]}>{label}</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function ProfileView() {
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];
  const { customer, logout } = useAuth();

  const initials =
    [customer?.firstName?.[0], customer?.lastName?.[0]].filter(Boolean).join('') ||
    customer?.email?.[0]?.toUpperCase() ||
    '?';

  const fullName = [customer?.firstName, customer?.lastName].filter(Boolean).join(' ');

  return (
    <ScrollView contentContainerStyle={styles.profileScroll} showsVerticalScrollIndicator={false}>
      <View style={[styles.avatar, { backgroundColor: c.tint }]}>
        <Text style={[styles.avatarText, { fontFamily: Fonts.sansBold }]}>{initials}</Text>
      </View>
      <Text style={[styles.profileName, { color: c.text, fontFamily: Fonts.serifBold }]}>
        {fullName || 'Stooper'}
      </Text>
      <Text style={[styles.profileEmail, { color: c.textSecondary, fontFamily: Fonts.sans }]}>
        {customer?.email}
      </Text>

      <View style={[styles.menuSection, { borderColor: c.border }]}>
        {[
          { icon: 'person.circle', label: 'Edit Profile' },
          { icon: 'bell', label: 'Notifications' },
        ].map(({ icon, label }) => (
          <Pressable key={label} style={[styles.menuItem, { borderBottomColor: c.border }]}>
            <IconSymbol name={icon as any} size={20} color={c.tint} />
            <Text style={[styles.menuLabel, { color: c.text, fontFamily: Fonts.sans }]}>{label}</Text>
            <IconSymbol name="chevron.right" size={13} color={c.icon} />
          </Pressable>
        ))}
      </View>

      <View style={[styles.menuSection, { borderColor: c.border }]}>
        {FOOTER_LINKS.map(({ label, url }) => (
          <Pressable
            key={label}
            style={[styles.menuItem, { borderBottomColor: c.border }]}
            onPress={() => Linking.openURL(url)}
          >
            <IconSymbol name="safari" size={20} color={c.icon} />
            <Text style={[styles.menuLabel, { color: c.text, fontFamily: Fonts.sans }]}>{label}</Text>
            <IconSymbol name="arrow.up.right" size={13} color={c.icon} />
          </Pressable>
        ))}
      </View>

      <Pressable style={[styles.logoutBtn, { borderColor: '#EF4444' }]} onPress={logout}>
        <Text style={[styles.logoutText, { fontFamily: Fonts.sansMedium }]}>Sign out</Text>
      </Pressable>
    </ScrollView>
  );
}

export default function AccountScreen() {
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];
  const { customer } = useAuth();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.background }]} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: c.border }]}>
        <Text style={[styles.headerTitle, { color: c.text, fontFamily: Fonts.serifBold }]}>
          Account
        </Text>
      </View>
      {customer ? <ProfileView /> : <AuthForm />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 16, paddingVertical: 16, borderBottomWidth: 1 },
  headerTitle: { fontSize: 22 },
  authScroll: { padding: 24, gap: 16, paddingBottom: 48 },
  authLogoWrap: { alignItems: 'center', gap: 6, marginBottom: 8 },
  authLogo: { width: 60, height: 48 },
  authStoreName: { fontSize: 20 },
  modeTabs: {
    flexDirection: 'row',
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
  },
  modeTab: { flex: 1, paddingVertical: 10, alignItems: 'center' },
  modeTabText: { fontSize: 14 },
  errorBox: { backgroundColor: '#FEE2E2', borderRadius: 6, padding: 12 },
  errorText: { color: '#DC2626', fontSize: 14 },
  nameRow: { flexDirection: 'row', gap: 12 },
  label: { fontSize: 13, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 15,
  },
  pwRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 11,
    gap: 8,
  },
  pwInput: { flex: 1, fontSize: 15, padding: 0 },
  submitBtn: { borderRadius: 8, paddingVertical: 14, alignItems: 'center' },
  submitText: { color: '#fff', fontSize: 15 },
  footerLinks: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    borderTopWidth: 1,
    paddingTop: 20,
    justifyContent: 'center',
  },
  footerLink: { fontSize: 13 },
  profileScroll: { alignItems: 'center', padding: 24, gap: 12, paddingBottom: 48 },
  avatar: { width: 76, height: 76, borderRadius: 38, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontSize: 28 },
  profileName: { fontSize: 20, marginTop: 4 },
  profileEmail: { fontSize: 13 },
  menuSection: {
    width: '100%',
    borderWidth: 1,
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    gap: 12,
  },
  menuLabel: { flex: 1, fontSize: 15 },
  logoutBtn: {
    marginTop: 16,
    borderWidth: 1.5,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 36,
  },
  logoutText: { color: '#EF4444', fontSize: 15 },
});

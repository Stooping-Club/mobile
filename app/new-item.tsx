import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Dimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';

import { useItems } from '@/store/items-context';
import { useAuth } from '@/store/auth-context';
import { ItemCategory, PickupMethod } from '@/types';
import { CATEGORIES, QUICK_TAGS, PICKUP_METHODS } from '@/constants/categories';
import { Input, TextArea } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Colors,
  Spacing,
  Radius,
  FontSize,
  FontWeight,
  Shadow,
} from '@/constants/theme';

const { width } = Dimensions.get('window');

// Berkeley default location
const DEFAULT_LOCATION = { latitude: 37.8716, longitude: -122.2727 };

// ─── Step Indicator ───────────────────────────────────────────────────────────

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <View style={styles.steps}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={[styles.step, i <= current && styles.stepActive, i < current && styles.stepDone]}
        />
      ))}
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

const STEPS = 3;

export default function NewItemScreen() {
  const { user } = useAuth();
  const { addItem } = useItems();

  // Form state
  const [step, setStep] = useState(0);
  const [images, setImages] = useState<string[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ItemCategory | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [pickupMethod, setPickupMethod] = useState<PickupMethod>('curb');
  const [submitting, setSubmitting] = useState(false);

  // Suggested tags based on category
  const suggestedTags = category
    ? QUICK_TAGS.filter((t) => {
        if (category === 'furniture') return ['large', 'wood', 'metal', 'IKEA', 'set', 'like new', 'needs repair'].includes(t);
        if (category === 'electronics') return ['works great', 'needs repair', 'vintage', 'set'].includes(t);
        if (category === 'books') return ['set', 'like new', 'CS', 'textbooks'].includes(t);
        if (category === 'clothing') return ['like new', 'vintage', 'set', 'size M'].includes(t);
        return true;
      }).slice(0, 6)
    : QUICK_TAGS.slice(0, 6);

  const toggleTag = (tag: string) => {
    Haptics.selectionAsync();
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const pickImages = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Allow photo access to add images.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.85,
      selectionLimit: 5,
    });
    if (!result.canceled) {
      setImages((prev) => [...prev, ...result.assets.map((a) => a.uri)].slice(0, 5));
    }
  }, []);

  const takePhoto = useCallback(async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Allow camera access to take photos.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.85 });
    if (!result.canceled) {
      setImages((prev) => [...prev, result.assets[0].uri].slice(0, 5));
    }
  }, []);

  const canProceed = () => {
    if (step === 0) return images.length > 0 && title.trim().length > 3;
    if (step === 1) return !!category;
    return true;
  };

  const handleNext = () => {
    if (!canProceed()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (step < STEPS - 1) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      router.push('/auth');
      return;
    }
    setSubmitting(true);
    try {
      const item = await addItem({
        title: title.trim(),
        description: description.trim(),
        category: category!,
        tags: selectedTags,
        images: images.length > 0 ? images : ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800'],
        latitude: DEFAULT_LOCATION.latitude + (Math.random() - 0.5) * 0.02,
        longitude: DEFAULT_LOCATION.longitude + (Math.random() - 0.5) * 0.02,
        address: 'Berkeley, CA',
        status: 'available',
        userId: user.id,
        user,
        pickupMethod,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace(`/item/${item.id}`);
    } catch {
      Alert.alert('Error', 'Could not post item. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.authPrompt} edges={['top', 'bottom']}>
        <StatusBar style="dark" />
        <Text style={styles.authEmoji}>📦</Text>
        <Text style={styles.authTitle}>Post a Free Item</Text>
        <Text style={styles.authSub}>Sign in to post items for your community.</Text>
        <Button label="Sign In" onPress={() => router.push('/auth')} fullWidth />
        <TouchableOpacity style={{ marginTop: Spacing.base }} onPress={() => router.back()}>
          <Text style={styles.cancelLink}>Cancel</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Header */}
      <SafeAreaView style={styles.header} edges={['top']}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => (step > 0 ? setStep(step - 1) : router.back())}>
            <Text style={styles.headerBack}>{step > 0 ? '‹ Back' : 'Cancel'}</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {step === 0 ? 'Photos & Title' : step === 1 ? 'Details' : 'Pickup'}
          </Text>
          <Text style={styles.headerStep}>{step + 1}/{STEPS}</Text>
        </View>
        <StepIndicator current={step} total={STEPS} />
      </SafeAreaView>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Step 0: Photos + Title ── */}
        {step === 0 && (
          <View style={styles.stepContent}>
            {/* Photo picker */}
            <Text style={styles.label}>Photos</Text>
            <View style={styles.photoGrid}>
              {images.map((uri, i) => (
                <View key={i} style={styles.photoThumb}>
                  <Image source={{ uri }} style={styles.photoThumbImg} contentFit="cover" />
                  <TouchableOpacity
                    style={styles.photoRemove}
                    onPress={() => setImages((prev) => prev.filter((_, j) => j !== i))}
                  >
                    <Text style={styles.photoRemoveText}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}
              {images.length < 5 && (
                <TouchableOpacity style={styles.photoAdd} onPress={pickImages}>
                  <Text style={styles.photoAddIcon}>📷</Text>
                  <Text style={styles.photoAddText}>Add Photo</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.photoBtns}>
              <TouchableOpacity style={styles.photoBtn} onPress={takePhoto}>
                <Text style={styles.photoBtnText}>📸 Take Photo</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.photoBtn} onPress={pickImages}>
                <Text style={styles.photoBtnText}>🖼 From Library</Text>
              </TouchableOpacity>
            </View>

            <Input
              label="Title *"
              placeholder="e.g. Blue IKEA couch, great condition"
              value={title}
              onChangeText={setTitle}
              maxLength={80}
              hint={`${title.length}/80 — be specific to get more interest`}
            />

            <TextArea
              label="Description"
              placeholder="Describe the item — dimensions, condition, why you're giving it away..."
              value={description}
              onChangeText={setDescription}
              maxLength={500}
            />
          </View>
        )}

        {/* ── Step 1: Category + Tags ── */}
        {step === 1 && (
          <View style={styles.stepContent}>
            <Text style={styles.label}>Category *</Text>
            <View style={styles.categoryGrid}>
              {CATEGORIES.filter((c) => c.id !== 'all').map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryCard,
                    category === cat.id && styles.categoryCardActive,
                  ]}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setCategory(cat.id as ItemCategory);
                  }}
                >
                  <Text style={styles.categoryCardEmoji}>{cat.emoji}</Text>
                  <Text
                    style={[
                      styles.categoryCardLabel,
                      category === cat.id && styles.categoryCardLabelActive,
                    ]}
                  >
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* AI-suggested tags */}
            <Text style={[styles.label, { marginTop: Spacing.base }]}>
              Tags{' '}
              <Text style={styles.labelHint}>✨ AI suggested</Text>
            </Text>
            <View style={styles.tagGrid}>
              {suggestedTags.map((tag) => (
                <TouchableOpacity
                  key={tag}
                  style={[styles.tagChip, selectedTags.includes(tag) && styles.tagChipActive]}
                  onPress={() => toggleTag(tag)}
                >
                  <Text
                    style={[
                      styles.tagChipText,
                      selectedTags.includes(tag) && styles.tagChipTextActive,
                    ]}
                  >
                    #{tag}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* ── Step 2: Pickup method ── */}
        {step === 2 && (
          <View style={styles.stepContent}>
            <Text style={styles.label}>Pickup Method *</Text>
            <Text style={styles.sublabel}>
              Choose how people can pick up this item
            </Text>
            <View style={styles.pickupOptions}>
              {PICKUP_METHODS.map((method) => (
                <TouchableOpacity
                  key={method.id}
                  style={[
                    styles.pickupOption,
                    pickupMethod === method.id && styles.pickupOptionActive,
                  ]}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setPickupMethod(method.id);
                  }}
                >
                  <Text style={styles.pickupEmoji}>{method.emoji}</Text>
                  <View style={styles.pickupText}>
                    <Text
                      style={[
                        styles.pickupTitle,
                        pickupMethod === method.id && styles.pickupTitleActive,
                      ]}
                    >
                      {method.label}
                    </Text>
                    <Text style={styles.pickupDesc}>{method.description}</Text>
                  </View>
                  {pickupMethod === method.id && (
                    <Text style={styles.pickupCheck}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {/* Summary */}
            <View style={styles.summary}>
              <Text style={styles.summaryTitle}>Summary</Text>
              {images[0] && (
                <Image
                  source={{ uri: images[0] }}
                  style={styles.summaryImage}
                  contentFit="cover"
                />
              )}
              <Text style={styles.summaryItemTitle}>{title}</Text>
              {category && (
                <Text style={styles.summaryCat}>
                  {CATEGORIES.find((c) => c.id === category)?.emoji}{' '}
                  {CATEGORIES.find((c) => c.id === category)?.label}
                </Text>
              )}
            </View>
          </View>
        )}
      </ScrollView>

      {/* CTA */}
      <SafeAreaView style={styles.cta} edges={['bottom']}>
        <Button
          label={
            submitting
              ? 'Posting...'
              : step === STEPS - 1
              ? '🎉 Post Item'
              : 'Continue →'
          }
          onPress={handleNext}
          disabled={!canProceed() || submitting}
          loading={submitting}
          size="lg"
          fullWidth
        />
      </SafeAreaView>
    </View>
  );
}

const PHOTO_SIZE = (width - Spacing.base * 2 - Spacing.sm * 3) / 4;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  // Header
  header: {
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingBottom: Spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  headerBack: { fontSize: FontSize.base, color: Colors.primary, fontWeight: '600' },
  headerTitle: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.bold,
    color: Colors.text,
  },
  headerStep: { fontSize: FontSize.sm, color: Colors.textTertiary, width: 40, textAlign: 'right' },
  steps: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.base,
    gap: Spacing.sm,
  },
  step: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
  },
  stepActive: { backgroundColor: Colors.primaryLight },
  stepDone: { backgroundColor: Colors.primary },

  // Scroll
  scrollContent: { padding: Spacing.base, paddingBottom: 120 },
  stepContent: { gap: 0 },

  // Labels
  label: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.text, marginBottom: 8 },
  sublabel: { fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: Spacing.md, marginTop: -4 },
  labelHint: { fontWeight: '400', color: Colors.primary, fontSize: FontSize.xs },

  // Photos
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  photoThumb: {
    width: PHOTO_SIZE,
    height: PHOTO_SIZE,
    borderRadius: Radius.md,
    overflow: 'hidden',
    position: 'relative',
  },
  photoThumbImg: { width: '100%', height: '100%' },
  photoRemove: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(0,0,0,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoRemoveText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  photoAdd: {
    width: PHOTO_SIZE,
    height: PHOTO_SIZE,
    borderRadius: Radius.md,
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  photoAddIcon: { fontSize: 24 },
  photoAddText: { fontSize: FontSize.xs, color: Colors.textSecondary, fontWeight: '500' },
  photoBtns: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.base },
  photoBtn: {
    flex: 1,
    padding: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  photoBtnText: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.text },

  // Categories
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  categoryCard: {
    width: (width - Spacing.base * 2 - Spacing.sm * 4) / 5,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  categoryCardActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  categoryCardEmoji: { fontSize: 22 },
  categoryCardLabel: {
    fontSize: FontSize['2xs'],
    fontWeight: '600',
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  categoryCardLabelActive: { color: Colors.primary },

  // Tags
  tagGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  tagChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: Radius.full,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  tagChipActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  tagChipText: { fontSize: FontSize.xs, fontWeight: '600', color: Colors.textSecondary },
  tagChipTextActive: { color: Colors.primary },

  // Pickup
  pickupOptions: { gap: Spacing.sm, marginBottom: Spacing.xl },
  pickupOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  pickupOptionActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryMuted },
  pickupEmoji: { fontSize: 28 },
  pickupText: { flex: 1 },
  pickupTitle: { fontSize: FontSize.base, fontWeight: FontWeight.semibold, color: Colors.text },
  pickupTitleActive: { color: Colors.primary },
  pickupDesc: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  pickupCheck: { fontSize: 18, color: Colors.primary, fontWeight: '700' },

  // Summary
  summary: {
    padding: Spacing.base,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  summaryTitle: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.textSecondary },
  summaryImage: { width: '100%', height: 120, borderRadius: Radius.md },
  summaryItemTitle: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.text },
  summaryCat: { fontSize: FontSize.sm, color: Colors.textSecondary },

  // CTA
  cta: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.base,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    ...Shadow.lg,
  },

  // Auth
  authPrompt: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing['2xl'],
    gap: Spacing.base,
  },
  authEmoji: { fontSize: 64 },
  authTitle: { fontSize: FontSize['2xl'], fontWeight: FontWeight.black, color: Colors.text },
  authSub: { fontSize: FontSize.base, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22 },
  cancelLink: { fontSize: FontSize.base, color: Colors.textSecondary, textAlign: 'center' },
});

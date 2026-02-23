// ─── Feature Flags ────────────────────────────────────────────────────────────
// Toggle experimental features without a code deploy.

export const FEATURES = {
  // Core features (always on)
  MAP_VIEW: true,
  FEED_VIEW: true,
  POST_ITEM: true,
  MESSAGING: true,

  // Phase 2 features
  NEIGHBORHOODS: true,
  STORIES: true,
  SMART_TAGS: true,
  TRUST_SYSTEM: true,
  ENVIRONMENTAL_IMPACT: true,
  REAL_TIME_VIEWERS: true,
  SAVED_SEARCHES: true,
  TRENDING: true,
  SHARE: true,
  ONBOARDING: true,

  // Experimental
  AI_TAGS: false,         // Requires API key
  PUSH_NOTIFICATIONS: false, // Requires backend
  FIREBASE_SYNC: false,   // Requires Firebase config
  PAID_FEATURED: false,   // Future monetization
  CAMPUS_COMMUNITIES: false, // Future expansion
} as const;

export type FeatureFlag = keyof typeof FEATURES;

export function isEnabled(flag: FeatureFlag): boolean {
  return FEATURES[flag];
}

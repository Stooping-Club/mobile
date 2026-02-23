// ─── Privacy-Friendly Analytics ───────────────────────────────────────────────
// All events are local-only for MVP. Hook up to Firebase Analytics later.

type EventName =
  | 'item_viewed'
  | 'item_posted'
  | 'item_claimed'
  | 'item_interested'
  | 'message_sent'
  | 'story_posted'
  | 'story_reaction'
  | 'neighborhood_filter'
  | 'category_filter'
  | 'search_saved'
  | 'user_signed_up'
  | 'user_signed_in'
  | 'onboarding_completed'
  | 'item_shared'
  | 'item_reported';

interface EventProps {
  [key: string]: string | number | boolean | undefined;
}

const DEV_MODE = __DEV__;

export const analytics = {
  track(event: EventName, props?: EventProps): void {
    if (DEV_MODE) {
      console.log(`[Analytics] ${event}`, props ?? {});
    }
    // TODO: Hook up Firebase Analytics
    // firebaseAnalytics.logEvent(event, props);
  },

  screen(screenName: string): void {
    if (DEV_MODE) {
      console.log(`[Analytics] Screen: ${screenName}`);
    }
  },
};

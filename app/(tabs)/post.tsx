// This screen is never actually shown — the tab button uses a custom FAB
// that opens /new-item as a modal. This file exists only to satisfy the router.
import { useEffect } from 'react';
import { router } from 'expo-router';

export default function PostTab() {
  useEffect(() => {
    router.replace('/(tabs)');
  }, []);
  return null;
}

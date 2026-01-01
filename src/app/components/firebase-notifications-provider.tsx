"use client"

import { useFirebaseNotifications } from '@/hooks/use-firebase-notifications';

export function FirebaseNotificationsProvider() {
  useFirebaseNotifications();
  return null;
}

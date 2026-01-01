"use client"

import { useEffect } from 'react';
import { useFirebaseNotifications } from '@/hooks/use-firebase-notifications';

export function FirebaseNotificationsProvider() {
  useFirebaseNotifications();
  return null;
}

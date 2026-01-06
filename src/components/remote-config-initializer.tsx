'use client';

import { useEffect } from 'react';
import { getAllRemoteValues } from '@/lib/firebase';

/**
 * Component khởi tạo Firebase Remote Config ngay khi app load
 * Tự động fetch và cache toàn bộ API Keys
 */
export function RemoteConfigInitializer() {
  useEffect(() => {
    const initRemoteConfig = async () => {
      try {
        // Pre-fetch các API Keys để cache sẵn
        await getAllRemoteValues('TOMORROW_API_KEY_');
        await getAllRemoteValues('GEMINI_API_KEY');
      } catch (error) {
        console.error('❌ Lỗi khởi tạo Remote Config:', error);
      }
    };

    initRemoteConfig();
  }, []);

  return null; // Component này không render gì cả
}

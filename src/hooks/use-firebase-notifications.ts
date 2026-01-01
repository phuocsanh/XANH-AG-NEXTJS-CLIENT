"use client"

import { useEffect } from 'react';
import { requestForToken, onMessageListener } from '@/lib/firebase';
import http from '@/lib/http';

export function useFirebaseNotifications() {
  useEffect(() => {
    const setupNotifications = async () => {
      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          const token = await requestForToken();
          if (token) {
            console.log('FCM Token:', token);
            try {
              // Chỉ gửi token lên server nếu người dùng đã đăng nhập
              const accessToken = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
              if (accessToken) {
                await http.put('/users/fcm-token', { fcm_token: token });
                console.log('✅ FCM token đã được đồng bộ với server');
              } else {
                console.log('ℹ️ Chưa đăng nhập, bỏ qua việc đồng bộ FCM token');
              }
            } catch (error) {
              console.error('❌ Lỗi khi gửi FCM token lên server:', error);
            }
          }
        }
      } catch (error) {
        console.error('Notification setup error:', error);
      }
    };

    if (typeof window !== 'undefined' && 'Notification' in window) {
      setupNotifications();
      
      onMessageListener().then((payload: any) => {
        console.log('Foreground message:', payload);
        // Show notification
        if (payload.notification) {
          new Notification(payload.notification.title, {
            body: payload.notification.body,
            icon: '/assets/logo3.png'
          });
        }
      });
    }
  }, []);
}

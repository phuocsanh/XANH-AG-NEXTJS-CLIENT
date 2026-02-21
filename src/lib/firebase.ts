import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage, isSupported } from "firebase/messaging";
import { getRemoteConfig, fetchAndActivate, getValue, getAll } from "firebase/remote-config";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);

// Khởi tạo messaging một cách an toàn
export let messaging: any = null;

if (typeof window !== 'undefined') {
  try {
    // Kiểm tra xem trình duyệt có hỗ trợ Firebase Messaging không (Yêu cầu HTTPS hoặc localhost)
    isSupported().then((supported: boolean) => {
      if (supported) {
        messaging = getMessaging(app);
      } else {
        console.warn("🔔 Firebase Messaging không được hỗ trợ trên trình duyệt này (Có thể do bạn đang dùng HTTP thay vì HTTPS)");
      }
    }).catch((err: any) => {
      console.warn("🔔 Lỗi khi kiểm tra hỗ trợ Firebase Messaging:", err);
    });
  } catch (error) {
    console.error("🔔 Không thể khởi tạo Firebase Messaging:", error);
  }
}

export const remoteConfig = typeof window !== 'undefined' ? getRemoteConfig(app) : null;

if (remoteConfig) {
  // Khoảng thời gian fetch mặc định là 12 tiếng, set về 0 trong môi trường dev để cập nhật tức thì
  remoteConfig.settings.minimumFetchIntervalMillis = process.env.NODE_ENV === 'development' ? 0 : 43200000;
}

/**
 * Lấy giá trị từ Remote Config theo key
 */
export const getRemoteValue = async (key: string): Promise<string> => {
  if (!remoteConfig) return "";
  try {
    await fetchAndActivate(remoteConfig);
    const value = getValue(remoteConfig, key);
    return value.asString();
  } catch (error) {
    console.error(`Error fetching remote config for ${key}:`, error);
    return "";
  }
};

/**
 * Lấy tất cả giá trị từ Remote Config có prefix cụ thể
 */
export const getAllRemoteValues = async (prefix: string): Promise<string[]> => {
  if (!remoteConfig) return [];
  
  try {
    await fetchAndActivate(remoteConfig);
    const allValues = getAll(remoteConfig);
    
    return Object.keys(allValues)
      .filter(key => key.startsWith(prefix))
      .map(key => allValues[key]?.asString())
      .filter((val): val is string => !!val);
  } catch (error) {
    console.error(`❌ [getAllRemoteValues] Lỗi fetch prefix ${prefix}:`, error);
    return [];
  }
};

export const requestForToken = async () => {
  if (!messaging) return null;
  try {
    const currentToken = await getToken(messaging, { 
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY 
    });
    if (currentToken) {
      console.log('FCM token:', currentToken);
      return currentToken;
    }
    return null;
  } catch (err) {
    console.log('Error getting token:', err);
    return null;
  }
};

export const onMessageListener = () =>
  new Promise((resolve) => {
    if (!messaging) return;
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });

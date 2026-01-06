import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
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
export const messaging = typeof window !== 'undefined' ? getMessaging(app) : null;
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

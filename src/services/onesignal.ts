import OneSignal from 'react-onesignal';

let isInitialized = false;

export const initOneSignal = async () => {
  if (isInitialized) {
    return;
  }
  try {
    const appId = import.meta.env.VITE_ONESIGNAL_APP_ID;
    
    if (appId && appId !== 'dummy-app-id') {
      await OneSignal.init({
        appId: appId,
        allowLocalhostAsSecureOrigin: true,
      });
      isInitialized = true;
      try {
        OneSignal.Slidedown.promptPush();
      } catch {
        // ignore prompt errors if not supported or blocked
      }
    } else {
      console.warn("OneSignal VITE_ONESIGNAL_APP_ID not configured. Using browser fallback notifications.");
      if ("Notification" in window && Notification.permission !== "granted" && Notification.permission !== "denied") {
        Notification.requestPermission().catch(() => {});
      }
      isInitialized = true;
    }
  } catch (error: any) {
    const msg = error?.message || String(error);
    if (msg.includes('SDK already initialized')) {
      isInitialized = true;
    } else {
      console.warn('OneSignal initialization skipped or failed:', msg);
    }
  }
};

export const sendNotification = (title: string, message: string) => {
  console.log(`[OneSignal Mock] Notification: ${title} - ${message}`);
  // In a real implementation this would call a backend to trigger the push notification
  // via the OneSignal REST API, since client-to-client push is not secure/supported.
  
  // For local testing/demo we can use the browser's Notification API if granted
  if ("Notification" in window && Notification.permission === "granted") {
    new Notification(title, { body: message });
  }
};

export const triggerEmergencyAlert = (childName: string) => {
  sendNotification(
    "🚨 ALERTA DE EMERGÊNCIA", 
    `Emergência acionada para ${childName}. Verifique a localização imediatamente!`
  );
};

export const triggerChildFoundAlert = (childName: string) => {
  sendNotification(
    "✅ CRIANÇA ENCONTRADA", 
    `${childName} foi encontrada(o) e está segura(o).`
  );
};

export const triggerNearbyCaseAlert = (caseName: string, location: string) => {
  sendNotification(
    "👀 ALERTA DA COMUNIDADE", 
    `Novo caso reportado nas proximidades: ${caseName} visto(a) em ${location}.`
  );
};

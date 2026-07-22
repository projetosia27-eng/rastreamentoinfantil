const fs = require('fs');
let code = fs.readFileSync('src/services/onesignal.ts', 'utf8');

code = code.replace(
  'console.warn("OneSignal VITE_ONESIGNAL_APP_ID not configured. Mocking notifications.");',
  'console.warn("OneSignal VITE_ONESIGNAL_APP_ID not configured. Mocking notifications.");\n      if ("Notification" in window && Notification.permission !== "granted" && Notification.permission !== "denied") {\n        Notification.requestPermission();\n      }'
);

fs.writeFileSync('src/services/onesignal.ts', code);

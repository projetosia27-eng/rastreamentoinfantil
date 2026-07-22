const fs = require('fs');
let code = fs.readFileSync('src/data/app-state-store.ts', 'utf8');

if (!code.includes('import { triggerEmergencyAlert }')) {
  code = code.replace(
    "import { signal } from '../core/signals';",
    "import { signal } from '../core/signals';\nimport { triggerEmergencyAlert } from '../services/onesignal';"
  );
}

if (!code.includes('triggerEmergencyAlert(child.name);')) {
  code = code.replace(
    "isPanicActiveSignal.value = true;\n    \n    // Play local alarm",
    "isPanicActiveSignal.value = true;\n    triggerEmergencyAlert(child.name);\n    \n    // Play local alarm"
  );
}

fs.writeFileSync('src/data/app-state-store.ts', code);

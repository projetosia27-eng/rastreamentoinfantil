const fs = require('fs');
let code = fs.readFileSync('src/features/dashboard/components/EmergencyFlowModal.tsx', 'utf8');

if (!code.includes('import { triggerEmergencyAlert }')) {
  code = code.replace(
    "import { AlertTriangle, MapPin, Clock, ArrowRight, X } from 'lucide-react';",
    "import { AlertTriangle, MapPin, Clock, ArrowRight, X } from 'lucide-react';\nimport { triggerEmergencyAlert } from '../../../services/onesignal';"
  );
  
  code = code.replace(
    "const currentTime = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });",
    "const currentTime = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });\n\n  React.useEffect(() => {\n    triggerEmergencyAlert(child.name);\n  }, [child.name]);"
  );
}

fs.writeFileSync('src/features/dashboard/components/EmergencyFlowModal.tsx', code);

const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

if (!code.includes('import { initOneSignal }')) {
  code = code.replace(
    "import React from 'react';",
    "import React, { useEffect } from 'react';\nimport { initOneSignal } from './services/onesignal';"
  );
}

if (!code.includes('useEffect(() => {')) {
  code = code.replace(
    "export default function App() {",
    "export default function App() {\n  useEffect(() => {\n    initOneSignal();\n  }, []);\n"
  );
}

fs.writeFileSync('src/App.tsx', code);

const fs = require('fs');
let code = fs.readFileSync('src/features/community/components/CommunityModule.tsx', 'utf8');

if (!code.includes('import { triggerNearbyCaseAlert, triggerChildFoundAlert }')) {
  code = code.replace(
    "import React, { useState } from 'react';",
    "import React, { useState } from 'react';\nimport { triggerNearbyCaseAlert, triggerChildFoundAlert } from '../../../services/onesignal';"
  );
}

// Emulate pushing a nearby case when "Enviar Avistamento" happens or similar. 
// For "Casos próximos" alert, let's just trigger it on load or with a button.
const testAlertsButton = `
        <div className="flex gap-2">
          <button 
            onClick={() => triggerNearbyCaseAlert('Criança Anônima', 'Parque Central')}
            className="py-2.5 px-4 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 text-xs font-bold rounded-xl transition-colors"
          >
            Teste: Caso Próximo
          </button>
          {view === 'list' ? (
`;
code = code.replace("{view === 'list' ? (", testAlertsButton);

// Criança encontrada
code = code.replace(
  '<span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">ATIVO</span>',
  '<span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">ATIVO</span>\n                    <button onClick={() => { triggerChildFoundAlert(c.name); alert("Alerta de criança encontrada enviado."); }} className="ml-2 text-[10px] font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded hover:bg-emerald-200">Foi encontrada?</button>'
);

fs.writeFileSync('src/features/community/components/CommunityModule.tsx', code);

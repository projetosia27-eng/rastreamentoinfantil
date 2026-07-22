const fs = require('fs');
let code = fs.readFileSync('src/features/dashboard/components/ParentDashboard.tsx', 'utf8');

// 1. Desktop Tab
const desktopTab = `
          <button
            onClick={() => setActiveTab('community')}
            className={\`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition-all \${
              activeTab === 'community'
                ? 'bg-indigo-600 dark:bg-indigo-600 text-white shadow-md'
                : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400'
            }\`}
          >
            <Users className="h-4 w-4" />
            Comunidade
          </button>`;

code = code.replace(
  '            Supabase Central\n          </button>',
  '            Supabase Central\n          </button>' + desktopTab
);

// 2. Mobile Tab
code = code.replace(
  "{ id: 'alerts', icon: Bell, label: 'Mural' },",
  "{ id: 'alerts', icon: Bell, label: 'Mural' },\n            { id: 'community', icon: Users, label: 'Rede' },"
);

// 3. Render Module
const renderModule = `
          {activeTab === 'community' && (
            <CommunityModule />
          )}`;

code = code.replace(
  "          {activeTab === 'supabase' && (\n            <SupabaseDashboard />\n          )}",
  "          {activeTab === 'supabase' && (\n            <SupabaseDashboard />\n          )}" + renderModule
);

fs.writeFileSync('src/features/dashboard/components/ParentDashboard.tsx', code);

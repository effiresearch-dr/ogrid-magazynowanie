import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Battery, 
  Zap, 
  Settings, 
  Users, 
  FileText, 
  LogOut,
  ChevronRight
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  activeSubTab: string;
  setActiveSubTab: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, activeSubTab, setActiveSubTab }) => {
  const [isBessOpen, setIsBessOpen] = useState(true);
  const [isConfigOpen, setIsConfigOpen] = useState(true);

  const menuItems = [
    { id: 'dashboard', label: 'Pulpit', icon: LayoutDashboard },
    { 
      id: 'bess', 
      label: 'Magazynowanie', 
      icon: Battery,
      hasSubmenu: true,
      isOpen: isBessOpen,
      setIsOpen: setIsBessOpen,
      subItems: [
        { id: 'bess-desc', label: 'Moduł opisowy' },
        { id: 'bess-model', label: 'Moduł modelowania BESS' },
        { id: 'bess-reports', label: 'Moduł raportowy' },
        { id: 'bess-audit-logs', label: 'Logi Audytowe' },
      ]
    },
    { 
      id: 'configurators', 
      label: 'Konfiguratory', 
      icon: Settings,
      hasSubmenu: true,
      isOpen: isConfigOpen,
      setIsOpen: setIsConfigOpen,
      subItems: [
        { id: 'config-prices', label: 'Ceny i stawki' },
        { id: 'config-rules', label: 'Reguły wnioskowania' },
        { id: 'config-white-label', label: 'White-Label' },
      ]
    },
    { id: 'operations', label: 'Operacje', icon: Zap },
    { id: 'users', label: 'Użytkownicy', icon: Users },
    { id: 'audit', label: 'Logi Audytowe', icon: FileText },
    { id: 'settings', label: 'Konfiguracja', icon: Settings },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-[250px] bg-sidebar text-white flex flex-col z-50">
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center shadow-lg shadow-blue-900/20">
          <Battery className="text-white" size={24} />
        </div>
        <div>
          <h1 className="font-bold text-lg leading-tight tracking-tight">OGrid</h1>
          <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">Magazynowanie</p>
        </div>
      </div>

      <nav className="flex-1 px-3 mt-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => (
          <div key={item.id} className="space-y-1">
            <button
              onClick={() => {
                if (item.hasSubmenu) {
                  item.setIsOpen?.(!item.isOpen);
                  setActiveTab(item.id);
                  if (item.id === 'bess' && !activeSubTab.startsWith('bess-')) {
                    setActiveSubTab('bess-desc');
                  } else if (item.id === 'configurators' && !activeSubTab.startsWith('config-')) {
                    setActiveSubTab('config-prices');
                  }
                } else {
                  setActiveTab(item.id);
                  setActiveSubTab('');
                }
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                activeTab === item.id 
                  ? 'bg-accent text-white shadow-lg shadow-blue-900/40' 
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <item.icon size={20} className={activeTab === item.id ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'} />
              <span className="font-medium text-sm">{item.label}</span>
              {item.hasSubmenu ? (
                <ChevronRight 
                  size={14} 
                  className={`ml-auto transition-transform duration-200 ${item.isOpen ? 'rotate-90' : ''}`} 
                />
              ) : (
                activeTab === item.id && <ChevronRight size={14} className="ml-auto opacity-50" />
              )}
            </button>

            {item.hasSubmenu && item.isOpen && (
              <div className="ml-9 space-y-1 py-1">
                {item.subItems?.map((sub) => (
                  <button
                    key={sub.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setActiveSubTab(sub.id);
                    }}
                    className={`w-full text-left px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                      activeSubTab === sub.id 
                        ? 'text-white bg-white/10' 
                        : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                    }`}
                  >
                    {sub.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      <div className="p-4 mt-auto border-t border-white/10">
        <div className="flex items-center gap-3 px-2 py-3">
          <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold">
            ER
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold truncate">effiresearch@gmail.com</p>
            <p className="text-[10px] text-slate-500 uppercase font-bold">Admin App</p>
          </div>
          <button className="text-slate-500 hover:text-white transition-colors">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

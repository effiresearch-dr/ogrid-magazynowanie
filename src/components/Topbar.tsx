import React from 'react';
import { Bell, Search, User, ChevronDown, ChevronRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface TopbarProps {
  title: string;
  activeTab: string;
  activeSubTab?: string;
  modelingGoal?: 'arbitrage' | 'peak-shaving' | 'backup';
}

const Topbar: React.FC<TopbarProps> = ({ title, activeTab, activeSubTab, modelingGoal }) => {
  const { user } = useAuth();
  const getSubTabLabel = (id: string) => {
    switch (id) {
      case 'bess-desc': return 'Moduł opisowy';
      case 'bess-model': return 'Moduł modelowania BESS';
      case 'bess-reports': return 'Moduł raportowy';
      case 'bess-audit-logs': return 'Logi Audytowe';
      default: return '';
    }
  };

  const getGoalLabel = (goal: string) => {
    switch (goal) {
      case 'arbitrage': return 'Arbitraż';
      case 'peak-shaving': return 'Peak Shaving';
      case 'backup': return 'Backup';
      default: return '';
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-8 sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <nav className="flex items-center text-xs font-bold text-slate-400 uppercase tracking-widest gap-2">
          <span>OGrid</span>
          <ChevronRight size={12} className="text-slate-300" />
          <span className={!activeSubTab ? 'text-slate-900' : ''}>{title}</span>
          {activeSubTab && (
            <>
              <ChevronRight size={12} className="text-slate-300" />
              <span className="text-slate-900">{getSubTabLabel(activeSubTab)}</span>
            </>
          )}
        </nav>
        
        {modelingGoal && (
          <div className="ml-4 flex items-center gap-2 px-3 py-1 bg-slate-50 rounded-full border border-slate-100">
            <div className={`w-1.5 h-1.5 rounded-full ${
              modelingGoal === 'arbitrage' ? 'bg-amber-500' : 
              modelingGoal === 'peak-shaving' ? 'bg-blue-500' : 'bg-emerald-500'
            }`} />
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-tighter">
              Cel: {getGoalLabel(modelingGoal)}
            </span>
          </div>
        )}

        <div className="ml-8 relative hidden lg:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text" 
            placeholder="Szukaj w systemie..." 
            className="pl-10 pr-4 py-2 bg-slate-50 border-none rounded-full text-sm w-64 focus:ring-2 focus:ring-accent/20 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="px-2 py-1 bg-green-100 text-green-700 text-[10px] font-bold rounded uppercase tracking-wider">
            System Online
          </div>
          <span className="text-xs text-slate-400 font-medium">26.03.2026</span>
        </div>
        
        <button className="relative text-slate-400 hover:text-slate-600 transition-colors">
          <Bell size={20} />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full border-2 border-white">
            3
          </span>
        </button>

        <div className="h-8 w-px bg-slate-100"></div>

        <button className="flex items-center gap-2 hover:bg-slate-50 p-1 rounded-lg transition-colors">
          <div className="w-8 h-8 rounded-lg bg-accent/10 text-accent flex items-center justify-center">
            <User size={18} />
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-xs font-bold text-slate-900">{user?.user_metadata?.full_name || 'Użytkownik OGrid'}</p>
            <p className="text-[10px] text-slate-400 leading-none truncate max-w-[120px]">{user?.email}</p>
          </div>
          <ChevronDown size={14} className="text-slate-400" />
        </button>
      </div>
    </header>
  );
};

export default Topbar;

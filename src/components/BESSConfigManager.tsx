import React from 'react';
import { Battery, Settings, Shield, DollarSign, Trash2, Plus, X } from 'lucide-react';
import { BESSConfiguration } from '../App';
import { Card } from './UI';

interface BESSConfigManagerProps {
  bessConfigurations: BESSConfiguration[];
  setBessConfigurations: (configs: BESSConfiguration[]) => void;
  onClose?: () => void;
  isModal?: boolean;
}

export const BESSConfigManager: React.FC<BESSConfigManagerProps> = ({ 
  bessConfigurations, 
  setBessConfigurations,
  onClose,
  isModal = false
}) => {
  const addConfig = () => {
    const newConfig: BESSConfiguration = {
      id: Math.random().toString(36).substr(2, 9),
      name: 'Nowa Konfiguracja',
      companySize: 'medium',
      technology: 'LFP',
      inverterType: 'Hybrydowy',
      bmsSystem: 'Standard',
      coolingType: 'Powietrzne',
      housing: 'IP55',
      warrantyYears: 10,
      warrantyCycles: 6000,
      depthOfDischarge: 90,
      efficiency: 92,
      certifications: ['CE'],
      description: 'Opis...',
      capexPerMW: 1600000,
      opexPerYear: 20000
    };
    setBessConfigurations([...bessConfigurations, newConfig]);
  };

  const removeConfig = (id: string) => {
    if (confirm('Czy na pewno chcesz usunąć tę konfigurację?')) {
      setBessConfigurations(bessConfigurations.filter(c => c.id !== id));
    }
  };

  const updateConfig = (id: string, updates: Partial<BESSConfiguration>) => {
    setBessConfigurations(bessConfigurations.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const content = (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-black text-slate-900 tracking-tight">Konfiguracja Specyfikacji BESS</h3>
          <p className="text-xs text-slate-500">Zdefiniuj parametry techniczne i handlowe dla różnych wielkości przedsiębiorstw</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={addConfig}
            className="px-4 py-2 bg-accent text-white rounded-xl text-xs font-bold hover:bg-blue-600 transition-all flex items-center gap-2 shadow-lg shadow-blue-500/20"
          >
            <Plus size={14} /> Dodaj Nową
          </button>
          {isModal && onClose && (
            <button 
              onClick={onClose}
              className="p-2 bg-slate-100 text-slate-500 hover:text-slate-700 rounded-xl transition-all"
            >
              <X size={20} />
            </button>
          )}
        </div>
      </div>

      <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
        {bessConfigurations.map((config) => (
          <div key={config.id} className="p-6 bg-slate-50 border border-slate-100 rounded-3xl space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-accent shadow-sm border border-slate-100">
                  <Battery size={20} />
                </div>
                <div>
                  <input 
                    type="text"
                    value={config.name}
                    onChange={(e) => updateConfig(config.id, { name: e.target.value })}
                    className="text-sm font-black text-slate-900 bg-transparent border-none focus:ring-0 p-0 w-64"
                  />
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ID: {config.id}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <select 
                  value={config.companySize}
                  onChange={(e) => updateConfig(config.id, { companySize: e.target.value as any })}
                  className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-slate-600 outline-none"
                >
                  <option value="micro">Mikro</option>
                  <option value="small">Mała</option>
                  <option value="medium">Średnia</option>
                  <option value="large">Duża</option>
                  <option value="extra-large">Bardzo Duża</option>
                </select>
                <button 
                  onClick={() => removeConfig(config.id)}
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                  <Settings size={14} className="text-accent" /> Dane Techniczne
                </h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Technologia Ogniw</label>
                    <input 
                      type="text"
                      value={config.technology}
                      onChange={(e) => updateConfig(config.id, { technology: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold text-slate-900 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Typ Inwertera</label>
                    <input 
                      type="text"
                      value={config.inverterType}
                      onChange={(e) => updateConfig(config.id, { inverterType: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold text-slate-900 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">System BMS</label>
                    <input 
                      type="text"
                      value={config.bmsSystem}
                      onChange={(e) => updateConfig(config.id, { bmsSystem: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold text-slate-900 outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                  <Shield size={14} className="text-accent" /> Gwarancja i Wydajność
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Gwarancja (Lata)</label>
                    <input 
                      type="number"
                      value={config.warrantyYears}
                      onChange={(e) => updateConfig(config.id, { warrantyYears: Number(e.target.value) })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold text-slate-900 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Cykle</label>
                    <input 
                      type="number"
                      value={config.warrantyCycles}
                      onChange={(e) => updateConfig(config.id, { warrantyCycles: Number(e.target.value) })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold text-slate-900 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">DoD (%)</label>
                    <input 
                      type="number"
                      value={config.depthOfDischarge}
                      onChange={(e) => updateConfig(config.id, { depthOfDischarge: Number(e.target.value) })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold text-slate-900 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Sprawność (%)</label>
                    <input 
                      type="number"
                      value={config.efficiency}
                      onChange={(e) => updateConfig(config.id, { efficiency: Number(e.target.value) })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold text-slate-900 outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                  <DollarSign size={14} className="text-accent" /> Parametry Ekonomiczne
                </h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">CAPEX (PLN/MW)</label>
                    <input 
                      type="number"
                      value={config.capexPerMW}
                      onChange={(e) => updateConfig(config.id, { capexPerMW: Number(e.target.value) })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold text-slate-900 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">OPEX Roczny (PLN)</label>
                    <input 
                      type="number"
                      value={config.opexPerYear}
                      onChange={(e) => updateConfig(config.id, { opexPerYear: Number(e.target.value) })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold text-slate-900 outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-200">
              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Opis Handlowy</label>
                <textarea 
                  value={config.description}
                  onChange={(e) => updateConfig(config.id, { description: e.target.value })}
                  rows={3}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold text-slate-900 outline-none resize-none"
                />
              </div>
              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Certyfikaty (oddzielone przecinkiem)</label>
                <input 
                  type="text"
                  value={config.certifications.join(', ')}
                  onChange={(e) => {
                    const certs = e.target.value.split(',').map(s => s.trim()).filter(s => s !== '');
                    updateConfig(config.id, { certifications: certs });
                  }}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold text-slate-900 outline-none"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <div className="bg-white rounded-[32px] w-full max-w-5xl p-8 shadow-2xl border border-white/20 animate-in fade-in zoom-in duration-300">
          {content}
        </div>
      </div>
    );
  }

  return content;
};

import React, { useState } from 'react';
import { 
  Settings, 
  Database, 
  TrendingUp, 
  DollarSign, 
  Plus, 
  Save, 
  Download, 
  Upload, 
  Trash2,
  AlertCircle,
  CheckCircle2,
  BarChart2,
  BarChart3,
  FileText,
  Layout,
  Type,
  ShieldCheck,
  Eye,
  Grid,
  FileCode
} from 'lucide-react';
import { Card } from './UI';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  ReferenceLine,
  Label
} from 'recharts';

interface ConfigRule {
  id: string;
  metric: string;
  operator: '>' | '<' | '==';
  value: number;
  conclusion: string;
  priority: 'low' | 'medium' | 'high';
}

interface PriceData {
  id: string;
  year: string;
  avgPriceTGE: number;
  capexPerMW: number;
  opexPerYear: number;
  inflationRate: number;
  energyPriceForecast: number;
}

interface ElectricityPrice {
  id: string;
  period: string; // '2024', '2025', etc.
  type: 'average' | 'seasonal' | '8760';
  resolution: '15min' | '60min';
  values: number[]; // Can be 1 (avg), 12 (seasonal), or 8760
}

interface TariffZone {
  id: string;
  label: string;
  hours: string;
  rate: number;
}

interface Tariff {
  id: string;
  name: string;
  group: string;
  description: string;
  fixedFee: number;
  powerFee: number;
  zones: TariffZone[];
}

interface ReportSection {
  id: string;
  type: 'header' | 'kpi_grid' | 'chart' | 'legal_footer' | 'text';
  content?: string;
  source?: string;
  style?: string;
}

interface ReportTemplate {
  id: string;
  name: string;
  sections: ReportSection[];
}

interface ConfiguratorsProps {
  initialTab?: 'rules' | 'prices' | 'white-label' | 'report-builder';
  whiteLabel: {
    companyName: string;
    logoUrl: string;
    primaryColor: string;
    accentColor: string;
    contactEmail: string;
    contactPhone: string;
    website: string;
    footerText: string;
  };
  onUpdateWhiteLabel: (config: any) => void;
  onTabChange?: (tabId: string) => void;
}

const Configurators: React.FC<ConfiguratorsProps> = ({ initialTab, whiteLabel, onUpdateWhiteLabel, onTabChange }) => {
  const [rules, setRules] = useState<ConfigRule[]>([
    { id: '1', metric: 'roi', operator: '>', value: 15, conclusion: 'Inwestycja charakteryzuje się wysoką rentownością.', priority: 'high' },
    { id: '2', metric: 'paybackYears', operator: '<', value: 5, conclusion: 'Okres zwrotu jest bardzo atrakcyjny (poniżej 5 lat).', priority: 'medium' },
    { id: '3', metric: 'totalSavings5Y', operator: '>', value: 50000, conclusion: 'Roczne oszczędności przekraczają 50 000 PLN, co znacząco obniża koszty operacyjne.', priority: 'medium' },
  ]);

  const [prices, setPrices] = useState<PriceData[]>([
    { id: '1', year: '2022', avgPriceTGE: 560, capexPerMW: 1800000, opexPerYear: 30000, inflationRate: 14.4, energyPriceForecast: 600 },
    { id: '2', year: '2023', avgPriceTGE: 480, capexPerMW: 1650000, opexPerYear: 28000, inflationRate: 11.4, energyPriceForecast: 550 },
    { id: '3', year: '2024', avgPriceTGE: 420, capexPerMW: 1500000, opexPerYear: 25000, inflationRate: 5.1, energyPriceForecast: 500 },
  ]);

  const [electricityPrices, setElectricityPrices] = useState<ElectricityPrice[]>([
    { id: 'e1', period: '2024', type: 'average', resolution: '60min', values: [420] },
    { id: 'e2', period: '2024', type: 'seasonal', resolution: '60min', values: [500, 480, 450, 400, 380, 350, 360, 380, 420, 450, 500, 550] },
  ]);

  const [tariffs, setTariffs] = useState<Tariff[]>([
    {
      id: 't1',
      name: 'G11',
      group: 'G',
      description: 'Taryfa jednostrefowa dla gospodarstw domowych',
      fixedFee: 15.50,
      powerFee: 0,
      zones: [
        { id: 'z1', label: 'Całodobowa', hours: '0-24', rate: 0.35 }
      ]
    },
    {
      id: 't2',
      name: 'G12',
      group: 'G',
      description: 'Taryfa dwustrefowa (Dzień/Noc)',
      fixedFee: 18.20,
      powerFee: 0,
      zones: [
        { id: 'z2', label: 'Szczyt', hours: '6-13, 15-22', rate: 0.42 },
        { id: 'z3', label: 'Pozaszczyt', hours: '13-15, 22-6', rate: 0.25 }
      ]
    },
    {
      id: 't3',
      name: 'C11',
      group: 'C',
      description: 'Taryfa dla małych firm',
      fixedFee: 45.00,
      powerFee: 12.50,
      zones: [
        { id: 'z4', label: 'Całodobowa', hours: '0-24', rate: 0.55 }
      ]
    }
  ]);

  const [activeTab, setActiveTab] = useState<'rules' | 'prices' | 'white-label' | 'report-builder'>(initialTab || 'prices');

  const handleTabChange = (tab: 'rules' | 'prices' | 'white-label' | 'report-builder') => {
    setActiveTab(tab);
    if (onTabChange) {
      const subTabId = tab === 'rules' ? 'config-rules' : 
                       tab === 'white-label' ? 'config-white-label' : 
                       tab === 'report-builder' ? 'config-report-builder' : 
                       'config-prices';
      onTabChange(subTabId);
    }
  };
  const [isEditingWhiteLabel, setIsEditingWhiteLabel] = useState(false);
  const [tempWhiteLabel, setTempWhiteLabel] = useState(whiteLabel);

  const [reportTemplates, setReportTemplates] = useState<ReportTemplate[]>([
    {
      id: '1',
      name: 'Analiza Magazynu Energii - Premium',
      sections: [
        { id: 's1', type: 'header', content: 'Raport Techniczny: {client_name}' },
        { id: 's2', type: 'kpi_grid', source: 'simulation_results_kpi' },
        { id: 's3', type: 'chart', source: 'tge_price_projection', style: 'area-chart' },
        { id: 's4', type: 'text', content: 'Analiza wykazuje wysoką rentowność inwestycji w oparciu o model nieliniowy TGE.' },
        { id: 's5', type: 'legal_footer', content: 'Licencjodawca: EFFI Research Sp. z o.o.' }
      ]
    }
  ]);

  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>('1');

  React.useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);
  const [priceSubTab, setPriceSubTab] = useState<'electricity' | 'other' | 'tariffs' | 'forecasts'>('electricity');
  const [forecastSettings, setForecastSettings] = useState({
    distributionGrowthType: 'linear' as 'linear' | 'nonlinear',
    linearGrowthRate: 3.5,
    nonlinearGrowthRates: [4, 5, 3, 2, 2, 2, 2, 2, 2, 2], // 10 years
    energyPriceGrowthRate: 5.0
  });
  const [selectedPriceId, setSelectedPriceId] = useState<string | null>('e2');
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [clipboardText, setClipboardText] = useState('');

  const isElectricityValid = electricityPrices.every(ep => {
    const hasNegative = ep.values.some(v => v < 0);
    const hasWrongCount = (ep.type === 'seasonal' && ep.values.length !== 12) || 
                         (ep.type === '8760' && ep.values.length !== 8760 && ep.values.length !== 35040);
    return !hasNegative && !hasWrongCount && ep.values.length > 0;
  });

  const isOtherPricesValid = prices.every(p => 
    p.avgPriceTGE >= 0 && p.capexPerMW >= 0 && p.opexPerYear >= 0 && p.energyPriceForecast >= 0
  );

  const isTariffsValid = tariffs.every(t => 
    t.fixedFee >= 0 && t.powerFee >= 0 && t.zones.every(z => z.rate >= 0)
  );

  const isConfigValid = isElectricityValid && isOtherPricesValid && isTariffsValid;

  const selectedEP = electricityPrices.find(ep => ep.id === selectedPriceId);

  const getChartData = (ep: ElectricityPrice) => {
    if (ep.type === 'average') {
      return [
        { name: 'Start', value: ep.values[0] },
        { name: 'Koniec', value: ep.values[0] }
      ];
    }
    if (ep.type === 'seasonal') {
      const months = ['Sty', 'Lut', 'Mar', 'Kwi', 'Maj', 'Cze', 'Lip', 'Sie', 'Wrz', 'Paź', 'Lis', 'Gru'];
      return ep.values.map((v, i) => ({
        name: months[i] || `M${i+1}`,
        value: v
      }));
    }
    // 8760 - Sample every 24h for visualization if it's too many points, 
    // but for now let's try to show all or a subset
    if (ep.values.length > 500) {
      return ep.values.filter((_, i) => i % 24 === 0).map((v, i) => ({
        name: `D${i}`,
        value: v
      }));
    }
    return ep.values.map((v, i) => ({
      name: `H${i}`,
      value: v
    }));
  };

  const addRule = () => {
    const newRule: ConfigRule = {
      id: Math.random().toString(36).substr(2, 9),
      metric: 'roi',
      operator: '>',
      value: 0,
      conclusion: 'Nowy wniosek...',
      priority: 'medium'
    };
    setRules([...rules, newRule]);
  };

  const removeRule = (id: string) => {
    setRules(rules.filter(r => r.id !== id));
  };

  const updateRule = (id: string, updates: Partial<ConfigRule>) => {
    setRules(rules.map(r => r.id === id ? { ...r, ...updates } : r));
  };

  const addPrice = () => {
    const newPrice: PriceData = {
      id: Math.random().toString(36).substr(2, 9),
      year: new Date().getFullYear().toString(),
      avgPriceTGE: 0,
      capexPerMW: 0,
      opexPerYear: 0,
      inflationRate: 0,
      energyPriceForecast: 0
    };
    setPrices([...prices, newPrice]);
  };

  const removePrice = (id: string) => {
    setPrices(prices.filter(p => p.id !== id));
  };

  const updatePrice = (id: string, updates: Partial<PriceData>) => {
    setPrices(prices.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const handleSaveToSupabase = async () => {
    setIsSaving(true);
    // Simulate Supabase integration
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSaving(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleDownloadJSON = () => {
    const data = {
      rules,
      prices,
      electricityPrices,
      tariffs,
      lastUpdated: new Date().toISOString(),
      version: '1.4.0'
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ogrid-config-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const json = JSON.parse(e.target?.result as string);
          if (json.rules) setRules(json.rules);
          if (json.prices) setPrices(json.prices);
          if (json.electricityPrices) setElectricityPrices(json.electricityPrices);
          if (json.tariffs) setTariffs(json.tariffs);
          alert('Konfiguracja została pomyślnie załadowana z pliku.');
        } catch (err) {
          alert('Błąd podczas ładowania pliku JSON.');
        }
      };
      reader.readAsText(file);
    }
  };

  const handlePastePrices = (id: string) => {
    try {
      const values = clipboardText.split(/[\s,;]+/).map(v => Number(v.replace(',', '.'))).filter(v => !isNaN(v));
      if (values.length > 0) {
        const hasNegative = values.some(v => v < 0);
        if (hasNegative) {
          alert('Uwaga: Wykryto wartości ujemne. Ceny energii nie mogą być mniejsze od 0.');
          return;
        }
        setElectricityPrices(electricityPrices.map(ep => ep.id === id ? { ...ep, values } : ep));
        setClipboardText('');
        alert(`Zaimportowano ${values.length} wartości.`);
      }
    } catch (err) {
      alert('Błąd formatu danych w schowku.');
    }
  };

  const handleXlsUpload = (id: string) => {
    // Mock XLS upload - in real app we would use a library like 'xlsx'
    alert('Funkcja wgrywania pliku XLS wymaga biblioteki xlsx. W tej wersji demonstracyjnej użyj wklejania ze schowka.');
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-end">
        <div className="flex gap-3">
          <label className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all cursor-pointer">
            <Upload size={14} /> Importuj JSON
            <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
          </label>
          <button 
            onClick={handleDownloadJSON}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all"
          >
            <Download size={14} /> Eksportuj JSON
          </button>
          <button 
            onClick={handleSaveToSupabase}
            disabled={isSaving || !isConfigValid}
            className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-xl text-xs font-bold hover:bg-blue-600 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Save size={14} />
            )}
            Zapisz w Supabase
          </button>
        </div>
      </div>

      {showSuccess && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3 text-emerald-700 text-sm font-bold"
        >
          <CheckCircle2 size={20} />
          Dane zostały pomyślnie zsynchronizowane z bazą Supabase.
        </motion.div>
      )}

      <div className="flex gap-1 p-1 bg-slate-100 rounded-2xl w-fit">
        <button 
          onClick={() => handleTabChange('prices')}
          className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'prices' ? 'bg-white text-accent shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Ceny i Stawki
        </button>
        <button 
          onClick={() => handleTabChange('rules')}
          className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'rules' ? 'bg-white text-accent shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Reguły Wnioskowania
        </button>
        <button 
          onClick={() => handleTabChange('white-label')}
          className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'white-label' ? 'bg-white text-accent shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          White-Label
        </button>
        <button 
          onClick={() => handleTabChange('report-builder')}
          className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'report-builder' ? 'bg-white text-accent shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Kreator Raportów
        </button>
      </div>

      {activeTab === 'white-label' && (
        <Card 
          title="Konfiguracja White-Label" 
          subtitle="Dostosuj wygląd aplikacji i raportów do swojej marki"
          extra={
            !isEditingWhiteLabel ? (
              <button 
                onClick={() => {
                  setTempWhiteLabel(whiteLabel);
                  setIsEditingWhiteLabel(true);
                }}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all flex items-center gap-2"
              >
                <Settings size={14} /> Zmień
              </button>
            ) : (
              <div className="flex gap-2">
                <button 
                  onClick={() => setIsEditingWhiteLabel(false)}
                  className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all"
                >
                  Anuluj
                </button>
                <button 
                  onClick={() => {
                    onUpdateWhiteLabel(tempWhiteLabel);
                    setIsEditingWhiteLabel(false);
                  }}
                  className="px-4 py-2 bg-accent text-white rounded-xl text-xs font-bold hover:bg-blue-600 transition-all shadow-lg shadow-blue-500/20"
                >
                  Zapisz i zaktualizuj
                </button>
              </div>
            )
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="space-y-4">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">Dane Firmy</h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Nazwa Firmy</label>
                    <input 
                      type="text" 
                      value={isEditingWhiteLabel ? tempWhiteLabel.companyName : whiteLabel.companyName}
                      onChange={(e) => setTempWhiteLabel({ ...tempWhiteLabel, companyName: e.target.value })}
                      readOnly={!isEditingWhiteLabel}
                      className={`w-full border rounded-xl px-4 py-2 text-sm font-bold outline-none transition-all ${
                        isEditingWhiteLabel 
                          ? 'bg-white border-slate-300 text-slate-900 focus:ring-2 focus:ring-accent/20' 
                          : 'bg-slate-50 border-transparent text-slate-500 cursor-not-allowed'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Logo URL</label>
                    <input 
                      type="text" 
                      value={isEditingWhiteLabel ? tempWhiteLabel.logoUrl : whiteLabel.logoUrl}
                      onChange={(e) => setTempWhiteLabel({ ...tempWhiteLabel, logoUrl: e.target.value })}
                      readOnly={!isEditingWhiteLabel}
                      className={`w-full border rounded-xl px-4 py-2 text-sm font-bold outline-none transition-all ${
                        isEditingWhiteLabel 
                          ? 'bg-white border-slate-300 text-slate-900 focus:ring-2 focus:ring-accent/20' 
                          : 'bg-slate-50 border-transparent text-slate-500 cursor-not-allowed'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Tekst Stopki</label>
                    <input 
                      type="text" 
                      value={isEditingWhiteLabel ? tempWhiteLabel.footerText : whiteLabel.footerText}
                      onChange={(e) => setTempWhiteLabel({ ...tempWhiteLabel, footerText: e.target.value })}
                      readOnly={!isEditingWhiteLabel}
                      className={`w-full border rounded-xl px-4 py-2 text-sm font-bold outline-none transition-all ${
                        isEditingWhiteLabel 
                          ? 'bg-white border-slate-300 text-slate-900 focus:ring-2 focus:ring-accent/20' 
                          : 'bg-slate-50 border-transparent text-slate-500 cursor-not-allowed'
                      }`}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">Kontakt</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Email</label>
                    <input 
                      type="email" 
                      value={isEditingWhiteLabel ? tempWhiteLabel.contactEmail : whiteLabel.contactEmail}
                      onChange={(e) => setTempWhiteLabel({ ...tempWhiteLabel, contactEmail: e.target.value })}
                      readOnly={!isEditingWhiteLabel}
                      className={`w-full border rounded-xl px-4 py-2 text-sm font-bold outline-none transition-all ${
                        isEditingWhiteLabel 
                          ? 'bg-white border-slate-300 text-slate-900 focus:ring-2 focus:ring-accent/20' 
                          : 'bg-slate-50 border-transparent text-slate-500 cursor-not-allowed'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Telefon</label>
                    <input 
                      type="text" 
                      value={isEditingWhiteLabel ? tempWhiteLabel.contactPhone : whiteLabel.contactPhone}
                      onChange={(e) => setTempWhiteLabel({ ...tempWhiteLabel, contactPhone: e.target.value })}
                      readOnly={!isEditingWhiteLabel}
                      className={`w-full border rounded-xl px-4 py-2 text-sm font-bold outline-none transition-all ${
                        isEditingWhiteLabel 
                          ? 'bg-white border-slate-300 text-slate-900 focus:ring-2 focus:ring-accent/20' 
                          : 'bg-slate-50 border-transparent text-slate-500 cursor-not-allowed'
                      }`}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Strona WWW</label>
                  <input 
                    type="text" 
                    value={isEditingWhiteLabel ? tempWhiteLabel.website : whiteLabel.website}
                    onChange={(e) => setTempWhiteLabel({ ...tempWhiteLabel, website: e.target.value })}
                    readOnly={!isEditingWhiteLabel}
                    className={`w-full border rounded-xl px-4 py-2 text-sm font-bold outline-none transition-all ${
                      isEditingWhiteLabel 
                        ? 'bg-white border-slate-300 text-slate-900 focus:ring-2 focus:ring-accent/20' 
                        : 'bg-slate-50 border-transparent text-slate-500 cursor-not-allowed'
                    }`}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-4">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">Kolorystyka</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Kolor Główny</label>
                    <div className="flex gap-2">
                      <input 
                        type="color" 
                        value={isEditingWhiteLabel ? tempWhiteLabel.primaryColor : whiteLabel.primaryColor}
                        onChange={(e) => setTempWhiteLabel({ ...tempWhiteLabel, primaryColor: e.target.value })}
                        disabled={!isEditingWhiteLabel}
                        className={`w-10 h-10 rounded-lg border-none cursor-pointer ${!isEditingWhiteLabel ? 'opacity-50 grayscale' : ''}`}
                      />
                      <input 
                        type="text" 
                        value={isEditingWhiteLabel ? tempWhiteLabel.primaryColor : whiteLabel.primaryColor}
                        onChange={(e) => setTempWhiteLabel({ ...tempWhiteLabel, primaryColor: e.target.value })}
                        readOnly={!isEditingWhiteLabel}
                        className={`flex-1 border rounded-xl px-4 py-2 text-sm font-bold outline-none transition-all ${
                          isEditingWhiteLabel 
                            ? 'bg-white border-slate-300 text-slate-900 focus:ring-2 focus:ring-accent/20' 
                            : 'bg-slate-50 border-transparent text-slate-500 cursor-not-allowed'
                        }`}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Kolor Akcentu</label>
                    <div className="flex gap-2">
                      <input 
                        type="color" 
                        value={isEditingWhiteLabel ? tempWhiteLabel.accentColor : whiteLabel.accentColor}
                        onChange={(e) => setTempWhiteLabel({ ...tempWhiteLabel, accentColor: e.target.value })}
                        disabled={!isEditingWhiteLabel}
                        className={`w-10 h-10 rounded-lg border-none cursor-pointer ${!isEditingWhiteLabel ? 'opacity-50 grayscale' : ''}`}
                      />
                      <input 
                        type="text" 
                        value={isEditingWhiteLabel ? tempWhiteLabel.accentColor : whiteLabel.accentColor}
                        onChange={(e) => setTempWhiteLabel({ ...tempWhiteLabel, accentColor: e.target.value })}
                        readOnly={!isEditingWhiteLabel}
                        className={`flex-1 border rounded-xl px-4 py-2 text-sm font-bold outline-none transition-all ${
                          isEditingWhiteLabel 
                            ? 'bg-white border-slate-300 text-slate-900 focus:ring-2 focus:ring-accent/20' 
                            : 'bg-slate-50 border-transparent text-slate-500 cursor-not-allowed'
                        }`}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-slate-900 rounded-3xl text-white space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Podgląd Wizualny</h4>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-8 h-8 rounded flex items-center justify-center font-bold text-xs"
                      style={{ backgroundColor: isEditingWhiteLabel ? tempWhiteLabel.primaryColor : whiteLabel.primaryColor }}
                    >
                      {(isEditingWhiteLabel ? tempWhiteLabel.companyName : whiteLabel.companyName).substring(0, 2).toUpperCase()}
                    </div>
                    <span className="font-bold text-sm">{isEditingWhiteLabel ? tempWhiteLabel.companyName : whiteLabel.companyName}</span>
                  </div>
                  <div className="h-px bg-white/10 w-full" />
                  <div className="flex gap-2">
                    <div 
                      className="px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest"
                      style={{ backgroundColor: isEditingWhiteLabel ? tempWhiteLabel.accentColor : whiteLabel.accentColor }}
                    >
                      Przycisk Akcji
                    </div>
                    <div className="px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest bg-white/10">
                      Przycisk Poboczny
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {activeTab === 'report-builder' && (
        <div className="space-y-6">
          <Card title="Zarządzanie Szablonami Raportów" subtitle="Twórz i edytuj modułowe szablony raportów PDF">
            <div className="flex flex-wrap gap-4 mb-6">
              {reportTemplates.map(template => (
                <button
                  key={template.id}
                  onClick={() => setSelectedTemplateId(template.id)}
                  className={`px-4 py-3 rounded-2xl border-2 transition-all flex items-center gap-3 ${
                    selectedTemplateId === template.id 
                      ? 'border-accent bg-blue-50 text-accent shadow-md' 
                      : 'border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-200'
                  }`}
                >
                  <FileText size={18} />
                  <span className="text-sm font-bold">{template.name}</span>
                </button>
              ))}
              <button
                onClick={() => {
                  const newId = Math.random().toString(36).substr(2, 9);
                  const newTemplate: ReportTemplate = {
                    id: newId,
                    name: 'Nowy Szablon Raportu',
                    sections: [
                      { id: 'h1', type: 'header', content: 'Nagłówek Raportu' },
                      { id: 'f1', type: 'legal_footer', content: 'Stopka prawna' }
                    ]
                  };
                  setReportTemplates([...reportTemplates, newTemplate]);
                  setSelectedTemplateId(newId);
                }}
                className="px-4 py-3 rounded-2xl border-2 border-dashed border-slate-200 text-slate-400 hover:text-accent hover:border-accent hover:bg-blue-50 transition-all flex items-center gap-2"
              >
                <Plus size={18} />
                <span className="text-sm font-bold">Nowy Szablon</span>
              </button>
            </div>

            {selectedTemplateId && (
              <div className="space-y-6">
                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Nazwa Szablonu</label>
                    <input 
                      type="text"
                      value={reportTemplates.find(t => t.id === selectedTemplateId)?.name || ''}
                      onChange={(e) => {
                        setReportTemplates(reportTemplates.map(t => 
                          t.id === selectedTemplateId ? { ...t, name: e.target.value } : t
                        ));
                      }}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-accent/20"
                    />
                  </div>
                  <button 
                    onClick={() => {
                      if (confirm('Czy na pewno chcesz usunąć ten szablon?')) {
                        setReportTemplates(reportTemplates.filter(t => t.id !== selectedTemplateId));
                        setSelectedTemplateId(reportTemplates[0]?.id || null);
                      }
                    }}
                    className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all mt-5"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>

                <div className="space-y-4">
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                    <Layout size={16} className="text-accent" />
                    Struktura Raportu (Sekcje)
                  </h4>
                  
                  <div className="space-y-3">
                    {reportTemplates.find(t => t.id === selectedTemplateId)?.sections.map((section, index) => (
                      <motion.div 
                        layout
                        key={section.id}
                        className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-all group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 font-bold text-xs">
                            {index + 1}
                          </div>
                          <div className="flex-1 grid grid-cols-12 gap-4">
                            <div className="col-span-3">
                              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Typ Sekcji</label>
                              <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                                {section.type === 'header' && <FileText size={14} className="text-blue-500" />}
                                {section.type === 'kpi_grid' && <Grid size={14} className="text-emerald-500" />}
                                {section.type === 'chart' && <BarChart3 size={14} className="text-amber-500" />}
                                {section.type === 'text' && <Type size={14} className="text-purple-500" />}
                                {section.type === 'legal_footer' && <ShieldCheck size={14} className="text-slate-500" />}
                                <span className="capitalize">{section.type.replace('_', ' ')}</span>
                              </div>
                            </div>
                            <div className="col-span-7">
                              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">
                                {section.type === 'chart' || section.type === 'kpi_grid' ? 'Źródło Danych' : 'Treść / Szablon'}
                              </label>
                              <input 
                                type="text"
                                value={section.content || section.source || ''}
                                onChange={(e) => {
                                  const newTemplates = reportTemplates.map(t => {
                                    if (t.id === selectedTemplateId) {
                                      const newSections = t.sections.map(s => 
                                        s.id === section.id ? { ...s, [section.type === 'chart' || section.type === 'kpi_grid' ? 'source' : 'content']: e.target.value } : s
                                      );
                                      return { ...t, sections: newSections };
                                    }
                                    return t;
                                  });
                                  setReportTemplates(newTemplates);
                                }}
                                className="w-full bg-slate-50 border border-slate-100 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-600 outline-none focus:bg-white focus:border-slate-200"
                                placeholder={section.type === 'header' ? 'np. Raport dla {client_name}' : 'Wprowadź treść...'}
                              />
                            </div>
                            <div className="col-span-2 flex items-center justify-end gap-2">
                              <button 
                                onClick={() => {
                                  const t = reportTemplates.find(t => t.id === selectedTemplateId);
                                  if (t) {
                                    const newSections = t.sections.filter(s => s.id !== section.id);
                                    setReportTemplates(reportTemplates.map(rt => rt.id === selectedTemplateId ? { ...rt, sections: newSections } : rt));
                                  }
                                }}
                                className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3 pt-4">
                    {[
                      { type: 'header', label: 'Nagłówek', icon: FileText, color: 'bg-blue-50 text-blue-600' },
                      { type: 'kpi_grid', label: 'Siatka KPI', icon: Grid, color: 'bg-emerald-50 text-emerald-600' },
                      { type: 'chart', label: 'Wykres', icon: BarChart3, color: 'bg-amber-50 text-amber-600' },
                      { type: 'text', label: 'Blok Tekstu', icon: Type, color: 'bg-purple-50 text-purple-600' },
                      { type: 'legal_footer', label: 'Stopka', icon: ShieldCheck, color: 'bg-slate-50 text-slate-600' }
                    ].map(btn => (
                      <button
                        key={btn.type}
                        onClick={() => {
                          const t = reportTemplates.find(t => t.id === selectedTemplateId);
                          if (t) {
                            const newSection: ReportSection = {
                              id: Math.random().toString(36).substr(2, 9),
                              type: btn.type as any,
                              content: btn.type === 'text' || btn.type === 'header' || btn.type === 'legal_footer' ? 'Nowa sekcja...' : undefined,
                              source: btn.type === 'chart' || btn.type === 'kpi_grid' ? 'default_source' : undefined
                            };
                            setReportTemplates(reportTemplates.map(rt => rt.id === selectedTemplateId ? { ...rt, sections: [...rt.sections, newSection] } : rt));
                          }
                        }}
                        className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border border-transparent hover:border-slate-200 transition-all ${btn.color}`}
                      >
                        <btn.icon size={20} />
                        <span className="text-[10px] font-black uppercase tracking-widest">{btn.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}

      {activeTab === 'rules' ? (
        <Card title="Edytor Reguł Wnioskowania" subtitle="Definiuj automatyczne wnioski na podstawie wyników symulacji">
          <div className="space-y-4">
            <div className="grid grid-cols-12 gap-4 px-4 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
              <div className="col-span-2">Metryka</div>
              <div className="col-span-1">Operator</div>
              <div className="col-span-2">Wartość</div>
              <div className="col-span-4">Wniosek (Tekst)</div>
              <div className="col-span-2">Priorytet</div>
              <div className="col-span-1 text-right">Akcje</div>
            </div>
            
            {rules.map((rule) => (
              <motion.div 
                layout
                key={rule.id} 
                className="grid grid-cols-12 gap-4 items-center p-4 bg-slate-50 rounded-2xl border border-slate-100 group"
              >
                <div className="col-span-2">
                  <select 
                    value={rule.metric}
                    onChange={(e) => updateRule(rule.id, { metric: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-[10px] font-bold text-slate-900 focus:ring-2 focus:ring-accent/20 outline-none"
                  >
                    <option value="roi">ROI (%)</option>
                    <option value="paybackYears">Okres zwrotu (lata)</option>
                    <option value="totalSavings5Y">Oszczędności 5 lat (PLN)</option>
                    <option value="totalCosts">Całkowite koszty (PLN)</option>
                    <option value="lcoe">LCOE (PLN/MWh)</option>
                    <option value="irr">IRR (%)</option>
                  </select>
                </div>
                <div className="col-span-1">
                  <select 
                    value={rule.operator}
                    onChange={(e) => updateRule(rule.id, { operator: e.target.value as any })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-[10px] font-bold text-slate-900 focus:ring-2 focus:ring-accent/20 outline-none"
                  >
                    <option value=">">{'>'}</option>
                    <option value="<">{'<'}</option>
                    <option value="==">{'=='}</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <input 
                    type="number" 
                    value={rule.value}
                    onChange={(e) => updateRule(rule.id, { value: Number(e.target.value) })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-[10px] font-bold text-slate-900 focus:ring-2 focus:ring-accent/20 outline-none"
                  />
                </div>
                <div className="col-span-4">
                  <textarea 
                    value={rule.conclusion}
                    onChange={(e) => updateRule(rule.id, { conclusion: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-[10px] font-medium text-slate-600 focus:ring-2 focus:ring-accent/20 outline-none resize-none h-10"
                  />
                </div>
                <div className="col-span-2">
                  <select 
                    value={rule.priority}
                    onChange={(e) => updateRule(rule.id, { priority: e.target.value as any })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-[10px] font-bold text-slate-900 focus:ring-2 focus:ring-accent/20 outline-none"
                  >
                    <option value="low">Niski</option>
                    <option value="medium">Średni</option>
                    <option value="high">Wysoki</option>
                  </select>
                </div>
                <div className="col-span-1 text-right">
                  <button 
                    onClick={() => removeRule(rule.id)}
                    className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </motion.div>
            ))}

            <button 
              onClick={addRule}
              className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 hover:text-accent hover:border-accent hover:bg-blue-50 transition-all flex items-center justify-center gap-2 text-xs font-bold"
            >
              <Plus size={16} /> Dodaj nową regułę
            </button>
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          <div className="flex gap-4 border-b border-slate-100 pb-4">
            <button 
              onClick={() => setPriceSubTab('electricity')}
              className={`text-xs font-black uppercase tracking-widest pb-2 border-b-2 transition-all ${priceSubTab === 'electricity' ? 'border-accent text-accent' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
            >
              Energia Elektryczna
            </button>
            <button 
              onClick={() => setPriceSubTab('tariffs')}
              className={`text-xs font-black uppercase tracking-widest pb-2 border-b-2 transition-all ${priceSubTab === 'tariffs' ? 'border-accent text-accent' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
            >
              Taryfy Dystrybucyjne
            </button>
            <button 
              onClick={() => setPriceSubTab('forecasts')}
              className={`text-xs font-black uppercase tracking-widest pb-2 border-b-2 transition-all ${priceSubTab === 'forecasts' ? 'border-accent text-accent' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
            >
              Prognozy i Dynamika
            </button>
            <button 
              onClick={() => setPriceSubTab('other')}
              className={`text-xs font-black uppercase tracking-widest pb-2 border-b-2 transition-all ${priceSubTab === 'other' ? 'border-accent text-accent' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
            >
              Pozostałe (CAPEX/OPEX)
            </button>
          </div>

          {priceSubTab === 'electricity' ? (
            <Card title="Ceny Energii Elektrycznej" subtitle="Zarządzaj średnimi stawkami, modelami sezonowymi i profilami 8760">
              <div className="space-y-6">
                <div className="grid grid-cols-12 gap-4 px-4 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                  <div className="col-span-2">Okres (Rok)</div>
                  <div className="col-span-2">Typ Danych</div>
                  <div className="col-span-2">Rozdzielczość</div>
                  <div className="col-span-3">Wartości / Import</div>
                  <div className="col-span-2 text-right">Akcje</div>
                </div>

                {electricityPrices.map((ep) => {
                  const isInvalid = ep.values.some(v => v < 0) || ep.values.length === 0;
                  const hasWrongCount = (ep.type === 'seasonal' && ep.values.length !== 12) || 
                                       (ep.type === '8760' && ep.values.length !== 8760 && ep.values.length !== 35040); // 35040 for 15min

                  return (
                    <motion.div 
                      layout 
                      key={ep.id} 
                      className={`grid grid-cols-12 gap-4 items-center p-4 rounded-2xl border transition-all ${
                        isInvalid || hasWrongCount 
                          ? 'bg-red-50 border-red-200' 
                          : 'bg-slate-50 border-slate-100'
                      }`}
                    >
                      <div className="col-span-2">
                        <input 
                          type="text" 
                          value={ep.period}
                          onChange={(e) => setElectricityPrices(electricityPrices.map(p => p.id === ep.id ? { ...p, period: e.target.value } : p))}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-[10px] font-bold text-slate-900 outline-none"
                        />
                      </div>
                      <div className="col-span-2">
                        <select 
                          value={ep.type}
                          onChange={(e) => setElectricityPrices(electricityPrices.map(p => p.id === ep.id ? { ...p, type: e.target.value as any } : p))}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-[10px] font-bold text-slate-900 outline-none"
                        >
                          <option value="average">Średnia</option>
                          <option value="seasonal">Sezonowa (12)</option>
                          <option value="8760">Pełna (8760)</option>
                        </select>
                      </div>
                      <div className="col-span-2">
                        <select 
                          value={ep.resolution}
                          onChange={(e) => setElectricityPrices(electricityPrices.map(p => p.id === ep.id ? { ...p, resolution: e.target.value as any } : p))}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-[10px] font-bold text-slate-900 outline-none"
                        >
                          <option value="60min">60 min</option>
                          <option value="15min">15 min</option>
                        </select>
                      </div>
                      <div className="col-span-4 flex flex-col gap-1">
                        <div className="flex gap-2">
                          <input 
                            type="text"
                            placeholder="Wklej wartości..."
                            value={clipboardText}
                            onChange={(e) => setClipboardText(e.target.value)}
                            className={`flex-1 bg-white border rounded-xl px-3 py-2 text-[10px] font-medium text-slate-600 outline-none ${
                              isInvalid ? 'border-red-300 focus:ring-red-100' : 'border-slate-200 focus:ring-accent/20'
                            }`}
                          />
                          <button 
                            onClick={() => handlePastePrices(ep.id)}
                            className="p-2 bg-white border border-slate-200 rounded-xl text-accent hover:bg-slate-50 transition-all"
                            title="Wklej ze schowka"
                          >
                            <Plus size={14} />
                          </button>
                          <button 
                            onClick={() => handleXlsUpload(ep.id)}
                            className="p-2 bg-white border border-slate-200 rounded-xl text-emerald-600 hover:bg-slate-50 transition-all"
                            title="Wgraj XLS"
                          >
                            <Database size={14} />
                          </button>
                        </div>
                        {isInvalid && (
                          <span className="text-[9px] text-red-500 font-bold flex items-center gap-1">
                            <AlertCircle size={10} /> Wartości muszą być dodatnie
                          </span>
                        )}
                        {hasWrongCount && !isInvalid && (
                          <span className="text-[9px] text-amber-600 font-bold flex items-center gap-1">
                            <AlertCircle size={10} /> 
                            {ep.type === 'seasonal' ? 'Wymagane 12 wartości' : `Wymagane ${ep.resolution === '15min' ? '35040' : '8760'} wartości`}
                          </span>
                        )}
                      </div>
                      <div className="col-span-2 text-right flex justify-end gap-2">
                        <div className={`px-3 py-2 rounded-xl text-[10px] font-black ${
                          hasWrongCount ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {ep.values.length} poz.
                        </div>
                        <button 
                          onClick={() => setSelectedPriceId(ep.id)}
                          className={`p-2 rounded-lg transition-all ${selectedPriceId === ep.id ? 'bg-accent text-white' : 'text-slate-300 hover:text-accent hover:bg-blue-50'}`}
                          title="Podgląd wykresu"
                        >
                          <Eye size={16} />
                        </button>
                        <button 
                          onClick={() => setElectricityPrices(electricityPrices.filter(p => p.id !== ep.id))}
                          className="p-2 text-slate-300 hover:text-red-500 rounded-lg"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}

                <button 
                  onClick={() => setElectricityPrices([...electricityPrices, { id: Math.random().toString(), period: '2025', type: 'average', resolution: '60min', values: [0] }])}
                  className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 hover:text-accent hover:border-accent hover:bg-blue-50 transition-all flex items-center justify-center gap-2 text-xs font-bold"
                >
                  <Plus size={16} /> Dodaj nowy model cenowy
                </button>

                {selectedEP && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-8 pt-8 border-t border-slate-100"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-accent/10 text-accent rounded-xl flex items-center justify-center">
                          <BarChart2 size={20} />
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">Wizualizacja Danych: {selectedEP.period}</h4>
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                            Model: {selectedEP.type === 'average' ? 'Średnia' : selectedEP.type === 'seasonal' ? 'Sezonowy' : '8760h'} | 
                            Rozdzielczość: {selectedEP.resolution}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <div className="px-4 py-2 bg-slate-100 rounded-xl text-[10px] font-black text-slate-600 uppercase tracking-widest">
                          Min: {Math.min(...selectedEP.values).toFixed(2)} PLN
                        </div>
                        <div className="px-4 py-2 bg-slate-100 rounded-xl text-[10px] font-black text-slate-600 uppercase tracking-widest">
                          Max: {Math.max(...selectedEP.values).toFixed(2)} PLN
                        </div>
                        <div className="px-4 py-2 bg-accent/10 rounded-xl text-[10px] font-black text-accent uppercase tracking-widest">
                          Śr: {(selectedEP.values.reduce((a, b) => a + b, 0) / selectedEP.values.length).toFixed(2)} PLN
                        </div>
                      </div>
                    </div>

                    <div className="h-[300px] w-full bg-slate-50 rounded-3xl p-6 border border-slate-100">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={getChartData(selectedEP)}>
                          <defs>
                            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                          <XAxis 
                            dataKey="name" 
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
                            dy={10}
                          />
                          <YAxis 
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
                            dx={-10}
                          />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: '#1e293b', 
                              border: 'none', 
                              borderRadius: '12px',
                              color: '#fff',
                              fontSize: '10px',
                              fontWeight: 'bold'
                            }}
                            itemStyle={{ color: '#3b82f6' }}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="value" 
                            stroke="#3b82f6" 
                            strokeWidth={3}
                            fillOpacity={1} 
                            fill="url(#colorPrice)" 
                            animationDuration={1500}
                          />
                          {prices.find(p => p.year === selectedEP.period)?.energyPriceForecast && (
                            <ReferenceLine 
                              y={prices.find(p => p.year === selectedEP.period)?.energyPriceForecast} 
                              stroke="#f59e0b" 
                              strokeDasharray="5 5" 
                              strokeWidth={2}
                            >
                              <Label 
                                value={`Prognoza: ${prices.find(p => p.year === selectedEP.period)?.energyPriceForecast} PLN`} 
                                position="insideTopRight" 
                                fill="#f59e0b" 
                                fontSize={10} 
                                fontWeight="bold"
                                dy={-10}
                              />
                            </ReferenceLine>
                          )}
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                    {selectedEP.type === '8760' && (
                      <p className="mt-4 text-[10px] text-slate-400 font-medium text-center italic">
                        * Dla modelu 8760h wyświetlany jest uproszczony podgląd (średnie dobowe).
                      </p>
                    )}
                  </motion.div>
                )}
              </div>
            </Card>
          ) : priceSubTab === 'forecasts' ? (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-4">
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                      <TrendingUp size={16} className="text-accent" />
                      Dynamika Kosztów Dystrybucji
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Model Wzrostu</label>
                        <div className="flex gap-2 p-1 bg-slate-200/50 rounded-xl w-fit">
                          <button 
                            onClick={() => setForecastSettings({...forecastSettings, distributionGrowthType: 'linear'})}
                            className={`px-4 py-1.5 rounded-lg text-[10px] font-bold transition-all ${forecastSettings.distributionGrowthType === 'linear' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
                          >
                            Liniowy (%)
                          </button>
                          <button 
                            onClick={() => setForecastSettings({...forecastSettings, distributionGrowthType: 'nonlinear'})}
                            className={`px-4 py-1.5 rounded-lg text-[10px] font-bold transition-all ${forecastSettings.distributionGrowthType === 'nonlinear' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
                          >
                            Nieliniowy (Indywidualny)
                          </button>
                        </div>
                      </div>

                      {forecastSettings.distributionGrowthType === 'linear' ? (
                        <div>
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Stały wzrost roczny (%)</label>
                          <div className="flex items-center gap-3">
                            <input 
                              type="range" 
                              min="0" 
                              max="20" 
                              step="0.1"
                              value={forecastSettings.linearGrowthRate}
                              onChange={(e) => setForecastSettings({...forecastSettings, linearGrowthRate: Number(e.target.value)})}
                              className="flex-1 accent-accent"
                            />
                            <span className="text-sm font-bold text-slate-900 w-12">{forecastSettings.linearGrowthRate}%</span>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Wzrost w kolejnych latach (%)</label>
                          <div className="grid grid-cols-5 gap-2">
                            {forecastSettings.nonlinearGrowthRates.map((rate, i) => (
                              <div key={i}>
                                <label className="text-[8px] font-bold text-slate-400 block mb-1 text-center">Rok {i+1}</label>
                                <input 
                                  type="number"
                                  value={rate}
                                  onChange={(e) => {
                                    const newRates = [...forecastSettings.nonlinearGrowthRates];
                                    newRates[i] = Number(e.target.value);
                                    setForecastSettings({...forecastSettings, nonlinearGrowthRates: newRates});
                                  }}
                                  className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-[10px] font-bold text-center outline-none focus:ring-2 focus:ring-accent/20"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-4">
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                      <DollarSign size={16} className="text-emerald-500" />
                      Prognoza Cen Energii
                    </h4>
                    <div>
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Średni wzrost cen energii (%)</label>
                      <div className="flex items-center gap-3">
                        <input 
                          type="range" 
                          min="-10" 
                          max="30" 
                          step="0.5"
                          value={forecastSettings.energyPriceGrowthRate}
                          onChange={(e) => setForecastSettings({...forecastSettings, energyPriceGrowthRate: Number(e.target.value)})}
                          className="flex-1 accent-emerald-500"
                        />
                        <span className="text-sm font-bold text-slate-900 w-12">{forecastSettings.energyPriceGrowthRate}%</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-2 italic">Wartość ta jest używana do obliczeń ROI w horyzoncie 10-letnim.</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="p-6 bg-slate-900 rounded-3xl text-white space-y-4 h-full">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Podgląd Projekcji Kosztów</h4>
                    <div className="h-[250px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={Array.from({length: 10}).map((_, i) => {
                          let distFactor = 1;
                          if (forecastSettings.distributionGrowthType === 'linear') {
                            distFactor = Math.pow(1 + forecastSettings.linearGrowthRate/100, i);
                          } else {
                            for (let j = 0; j <= i; j++) {
                              distFactor *= (1 + forecastSettings.nonlinearGrowthRates[j]/100);
                            }
                          }
                          const energyFactor = Math.pow(1 + forecastSettings.energyPriceGrowthRate/100, i);
                          return {
                            year: 2024 + i,
                            dist: 100 * distFactor,
                            energy: 100 * energyFactor
                          };
                        })}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                          <XAxis dataKey="year" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                          <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px', fontSize: '10px' }}
                            itemStyle={{ fontWeight: 'bold' }}
                          />
                          <Line type="monotone" dataKey="dist" stroke="#3b82f6" strokeWidth={3} dot={false} name="Dystrybucja" />
                          <Line type="monotone" dataKey="energy" stroke="#10b981" strokeWidth={3} dot={false} name="Energia" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-white/5 rounded-2xl">
                        <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Skumulowany wzrost dystr.</div>
                        <div className="text-xl font-black text-blue-400">
                          +{Math.round((forecastSettings.distributionGrowthType === 'linear' 
                            ? Math.pow(1 + forecastSettings.linearGrowthRate/100, 10) 
                            : forecastSettings.nonlinearGrowthRates.reduce((acc, r) => acc * (1 + r/100), 1)
                          ) * 100 - 100)}%
                        </div>
                      </div>
                      <div className="p-3 bg-white/5 rounded-2xl">
                        <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Skumulowany wzrost energii</div>
                        <div className="text-xl font-black text-emerald-400">
                          +{Math.round(Math.pow(1 + forecastSettings.energyPriceGrowthRate/100, 10) * 100 - 100)}%
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : priceSubTab === 'tariffs' ? (
            <Card title="Zarządzanie Taryfami" subtitle="Definiuj grupy taryfowe i ich struktury kosztowe">
              <div className="space-y-6">
                {tariffs.map((tariff) => (
                  <motion.div 
                    layout 
                    key={tariff.id} 
                    className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-12 h-12 bg-white border border-slate-200 rounded-2xl flex items-center justify-center text-accent font-black text-lg">
                          {tariff.name}
                        </div>
                        <div className="flex-1 grid grid-cols-3 gap-4">
                          <div>
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Nazwa Taryfy</label>
                            <input 
                              type="text" 
                              value={tariff.name}
                              onChange={(e) => setTariffs(tariffs.map(t => t.id === tariff.id ? { ...t, name: e.target.value } : t))}
                              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 outline-none"
                            />
                          </div>
                          <div>
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Grupa</label>
                            <select 
                              value={tariff.group}
                              onChange={(e) => setTariffs(tariffs.map(t => t.id === tariff.id ? { ...t, group: e.target.value } : t))}
                              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 outline-none"
                            >
                              <option value="G">G (Domowa)</option>
                              <option value="C">C (Komercyjna)</option>
                              <option value="B">B (Przemysłowa)</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Opis</label>
                            <input 
                              type="text" 
                              value={tariff.description}
                              onChange={(e) => setTariffs(tariffs.map(t => t.id === tariff.id ? { ...t, description: e.target.value } : t))}
                              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 outline-none"
                            />
                          </div>
                        </div>
                      </div>
                      <button 
                        onClick={() => setTariffs(tariffs.filter(t => t.id !== tariff.id))}
                        className="ml-4 p-2 text-slate-300 hover:text-red-500 rounded-lg transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <h5 className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                          <DollarSign size={12} className="text-accent" /> Opłaty Stałe
                        </h5>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-white p-3 rounded-2xl border border-slate-200">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Stała (PLN/msc)</label>
                            <input 
                              type="number" 
                              value={tariff.fixedFee}
                              onChange={(e) => setTariffs(tariffs.map(t => t.id === tariff.id ? { ...t, fixedFee: Number(e.target.value) } : t))}
                              className="w-full text-sm font-black text-slate-900 outline-none"
                            />
                          </div>
                          <div className="bg-white p-3 rounded-2xl border border-slate-200">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Mocowa (PLN/kW/msc)</label>
                            <input 
                              type="number" 
                              value={tariff.powerFee}
                              onChange={(e) => setTariffs(tariffs.map(t => t.id === tariff.id ? { ...t, powerFee: Number(e.target.value) } : t))}
                              className="w-full text-sm font-black text-slate-900 outline-none"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h5 className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                            <TrendingUp size={12} className="text-emerald-500" /> Strefy i Składniki Zmienne
                          </h5>
                          <button 
                            onClick={() => {
                              const newZone = { id: Math.random().toString(), label: 'Nowa strefa', hours: '0-24', rate: 0 };
                              setTariffs(tariffs.map(t => t.id === tariff.id ? { ...t, zones: [...t.zones, newZone] } : t));
                            }}
                            className="text-[9px] font-black text-accent uppercase tracking-widest hover:underline"
                          >
                            + Dodaj Strefę
                          </button>
                        </div>
                        <div className="space-y-2">
                          {tariff.zones.map((zone) => (
                            <div key={zone.id} className="grid grid-cols-12 gap-2 items-center bg-white p-2 rounded-xl border border-slate-200">
                              <div className="col-span-4">
                                <input 
                                  type="text" 
                                  value={zone.label}
                                  placeholder="Etykieta"
                                  onChange={(e) => {
                                    const newZones = tariff.zones.map(z => z.id === zone.id ? { ...z, label: e.target.value } : z);
                                    setTariffs(tariffs.map(t => t.id === tariff.id ? { ...t, zones: newZones } : t));
                                  }}
                                  className="w-full text-[10px] font-bold text-slate-900 outline-none"
                                />
                              </div>
                              <div className="col-span-4">
                                <input 
                                  type="text" 
                                  value={zone.hours}
                                  placeholder="Godziny (np. 6-13)"
                                  onChange={(e) => {
                                    const newZones = tariff.zones.map(z => z.id === zone.id ? { ...z, hours: e.target.value } : z);
                                    setTariffs(tariffs.map(t => t.id === tariff.id ? { ...t, zones: newZones } : t));
                                  }}
                                  className="w-full text-[10px] font-medium text-slate-500 outline-none"
                                />
                              </div>
                              <div className="col-span-3">
                                <input 
                                  type="number" 
                                  value={zone.rate}
                                  placeholder="Stawka"
                                  onChange={(e) => {
                                    const newZones = tariff.zones.map(z => z.id === zone.id ? { ...z, rate: Number(e.target.value) } : z);
                                    setTariffs(tariffs.map(t => t.id === tariff.id ? { ...t, zones: newZones } : t));
                                  }}
                                  className="w-full text-[10px] font-black text-accent text-right outline-none"
                                />
                              </div>
                              <div className="col-span-1 text-right">
                                <button 
                                  onClick={() => {
                                    const newZones = tariff.zones.filter(z => z.id !== zone.id);
                                    setTariffs(tariffs.map(t => t.id === tariff.id ? { ...t, zones: newZones } : t));
                                  }}
                                  className="text-slate-300 hover:text-red-500"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}

                <button 
                  onClick={() => {
                    const newTariff: Tariff = {
                      id: Math.random().toString(),
                      name: 'Nowa Taryfa',
                      group: 'C',
                      description: 'Opis taryfy...',
                      fixedFee: 0,
                      powerFee: 0,
                      zones: [{ id: Math.random().toString(), label: 'Całodobowa', hours: '0-24', rate: 0 }]
                    };
                    setTariffs([...tariffs, newTariff]);
                  }}
                  className="w-full py-6 border-2 border-dashed border-slate-200 rounded-3xl text-slate-400 hover:text-accent hover:border-accent hover:bg-blue-50 transition-all flex items-center justify-center gap-2 text-xs font-bold"
                >
                  <Plus size={20} /> Dodaj nową grupę taryfową
                </button>
              </div>
            </Card>
          ) : (
            <Card title="Baza Nakładów i Stawek" subtitle="Historyczne parametry CAPEX/OPEX, inflacja i prognozy">
              <div className="space-y-4">
                <div className="grid grid-cols-12 gap-4 px-4 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                  <div className="col-span-1">Rok</div>
                  <div className="col-span-2">Cena TGE (MWh)</div>
                  <div className="col-span-2">CAPEX (MW)</div>
                  <div className="col-span-2">OPEX (rok)</div>
                  <div className="col-span-2">Inflacja (%)</div>
                  <div className="col-span-2">Prognoza Energii</div>
                  <div className="col-span-1 text-right">Akcje</div>
                </div>

                {prices.map((price) => {
                  const isPriceInvalid = price.avgPriceTGE < 0 || price.capexPerMW < 0 || price.opexPerYear < 0 || price.energyPriceForecast < 0;
                  
                  return (
                    <motion.div 
                      layout
                      key={price.id} 
                      className={`grid grid-cols-12 gap-4 items-center p-4 rounded-2xl border transition-all group ${
                        isPriceInvalid ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-100'
                      }`}
                    >
                      <div className="col-span-1">
                        <input 
                          type="text" 
                          value={price.year}
                          onChange={(e) => updatePrice(price.id, { year: e.target.value })}
                          className="w-full bg-white border border-slate-200 rounded-xl px-2 py-2 text-[10px] font-bold text-slate-900 focus:ring-2 focus:ring-accent/20 outline-none"
                        />
                      </div>
                      <div className="col-span-2">
                        <input 
                          type="number" 
                          value={price.avgPriceTGE}
                          onChange={(e) => updatePrice(price.id, { avgPriceTGE: Number(e.target.value) })}
                          className={`w-full bg-white border rounded-xl px-2 py-2 text-[10px] font-bold text-slate-900 focus:ring-2 outline-none ${
                            price.avgPriceTGE < 0 ? 'border-red-300 focus:ring-red-100' : 'border-slate-200 focus:ring-accent/20'
                          }`}
                        />
                      </div>
                      <div className="col-span-2">
                        <input 
                          type="number" 
                          value={price.capexPerMW}
                          onChange={(e) => updatePrice(price.id, { capexPerMW: Number(e.target.value) })}
                          className={`w-full bg-white border rounded-xl px-2 py-2 text-[10px] font-bold text-slate-900 focus:ring-2 outline-none ${
                            price.capexPerMW < 0 ? 'border-red-300 focus:ring-red-100' : 'border-slate-200 focus:ring-accent/20'
                          }`}
                        />
                      </div>
                      <div className="col-span-2">
                        <input 
                          type="number" 
                          value={price.opexPerYear}
                          onChange={(e) => updatePrice(price.id, { opexPerYear: Number(e.target.value) })}
                          className={`w-full bg-white border rounded-xl px-2 py-2 text-[10px] font-bold text-slate-900 focus:ring-2 outline-none ${
                            price.opexPerYear < 0 ? 'border-red-300 focus:ring-red-100' : 'border-slate-200 focus:ring-accent/20'
                          }`}
                        />
                      </div>
                      <div className="col-span-2">
                        <input 
                          type="number" 
                          value={price.inflationRate}
                          onChange={(e) => updatePrice(price.id, { inflationRate: Number(e.target.value) })}
                          className="w-full bg-white border border-slate-200 rounded-xl px-2 py-2 text-[10px] font-bold text-slate-900 focus:ring-2 focus:ring-accent/20 outline-none"
                        />
                      </div>
                      <div className="col-span-2">
                        <input 
                          type="number" 
                          value={price.energyPriceForecast}
                          onChange={(e) => updatePrice(price.id, { energyPriceForecast: Number(e.target.value) })}
                          className={`w-full bg-white border rounded-xl px-2 py-2 text-[10px] font-bold text-slate-900 focus:ring-2 outline-none ${
                            price.energyPriceForecast < 0 ? 'border-red-300 focus:ring-red-100' : 'border-slate-200 focus:ring-accent/20'
                          }`}
                        />
                      </div>
                      <div className="col-span-1 text-right">
                        <button 
                          onClick={() => removePrice(price.id)}
                          className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}

                <button 
                  onClick={addPrice}
                  className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 hover:text-accent hover:border-accent hover:bg-blue-50 transition-all flex items-center justify-center gap-2 text-xs font-bold"
                >
                  <Plus size={16} /> Dodaj wpis historyczny
                </button>
              </div>
            </Card>
          )}
        </div>
      )}

      <div className="p-6 bg-blue-50 rounded-3xl border border-blue-100 flex items-start gap-4">
        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-accent shadow-sm">
          <AlertCircle size={20} />
        </div>
        <div>
          <h4 className="text-sm font-bold text-slate-900 mb-1">Wskazówka dla Administratora</h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            Wszelkie zmiany wprowadzone w konfiguratorach są natychmiastowo uwzględniane w silniku obliczeniowym Kroku 3 oraz w systemie wnioskowania Kroku 4. 
            Zaleca się wykonanie eksportu JSON przed dokonaniem masowych zmian.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Configurators;

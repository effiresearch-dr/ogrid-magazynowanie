import React, { useState, useEffect } from 'react';
import { 
  User, 
  Building2, 
  Users, 
  Zap, 
  TrendingUp, 
  Battery, 
  Calendar, 
  Upload, 
  ChevronRight, 
  ChevronLeft,
  Info,
  CheckCircle2,
  AlertCircle,
  FileText,
  ShieldCheck,
  Settings,
  Calculator,
  BarChart3,
  Save,
  Home,
  Factory
} from 'lucide-react';
import { Card, TerminalLog, Modal } from './UI';
import { motion, AnimatePresence } from 'motion/react';
import { Report } from './BESSReports';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ComposedChart,
  Area,
  Cell
} from 'recharts';

interface BESSWizardProps {
  modelingGoal: 'arbitrage' | 'peak-shaving' | 'backup';
  setModelingGoal: (goal: 'arbitrage' | 'peak-shaving' | 'backup') => void;
  onOpenAuditLogs?: () => void;
  onSaveReport?: (report: Report) => void;
}

const BESSWizard: React.FC<BESSWizardProps> = ({ modelingGoal, setModelingGoal, onOpenAuditLogs, onSaveReport }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [logs, setLogs] = useState<string[]>([]);
  const [showFullDay, setShowFullDay] = useState(false);
  const [isLogsModalOpen, setIsLogsModalOpen] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  
  // Save Modal State
  const [saveForm, setSaveForm] = useState({
    reportName: '',
    clientName: '',
    clientNip: '',
    clientFullName: '',
    status: 'final' as 'final' | 'draft',
    notes: ''
  });
  
  // Step 1 State
  const [recipientType, setRecipientType] = useState<'individual' | 'company' | 'mixed'>('company');
  const [companySize, setCompanySize] = useState<'small' | 'medium' | 'large' | 'extra-large'>('medium');
  const [isCustomConsumption, setIsCustomConsumption] = useState(false);
  const [customConsumption, setCustomConsumption] = useState<number>(500);
  
  const [selectedProfile, setSelectedProfile] = useState<'linear' | 'standard' | 'individual'>('standard');
  const [linearValue, setLinearValue] = useState<number>(10.0);
  const [selectedTariff, setSelectedTariff] = useState<string>('C1x');
  const [individualMode, setIndividualMode] = useState<'daily' | 'seasonal'>('daily');
  const [selectedMonth, setSelectedMonth] = useState<number>(0);
  const [hourlyValues, setHourlyValues] = useState<number[]>(new Array(24).fill(0));

  // Step 2 State (TGE Analysis)
  const [selectedYears, setSelectedYears] = useState<string[]>(['2024']);
  const [showRCE, setShowRCE] = useState(true);
  const [tgeData, setTgeData] = useState<any[]>([]);
  const [analysisSummary, setAnalysisSummary] = useState({
    avgPrice: 0,
    maxPrice: 0,
    minPrice: 0,
    spread: 0
  });

  // Step 3 State (BESS Selection & Math)
  const [bessCapacity, setBessCapacity] = useState(1000); // kWh
  const [bessPower, setBessPower] = useState(500); // kW
  const [degradationRate, setDegradationRate] = useState(0.02); // 2%
  const [efficiency, setEfficiency] = useState(0.92); // 92%
  const [capexPerMW, setCapexPerMW] = useState(1500000); // PLN
  const [opexPerYear, setOpexPerYear] = useState(25000); // PLN
  
  const [projectionModel, setProjectionModel] = useState<'polynomial' | 'seasonal' | 'power'>('seasonal');
  const [polyParams, setPolyParams] = useState({ a: -2.5, b: 40, c: 500 });
  const [seasonalParams, setSeasonalParams] = useState({ r: 0.05, base: 500 });
  const [powerParams, setPowerParams] = useState({ a: 500, b: 1.1, c: 0 });
  
  const [roiData, setRoiData] = useState<any[]>([]);
  const [isEditingProjection, setIsEditingProjection] = useState(false);
  const [tempProjectionParams, setTempProjectionParams] = useState({
    poly: { ...polyParams },
    seasonal: { ...seasonalParams },
    power: { ...powerParams }
  });
  const [financialSummary, setFinancialSummary] = useState({
    totalSavings5Y: 0,
    totalCosts: 0,
    roi: 0,
    paybackYears: 0,
    npv: 0,
    irr: 0,
    lcoe: 0,
    peakReduction: 0
  });

  // Edit Mode State for BESS Parameters
  const [isEditingBESS, setIsEditingBESS] = useState(false);
  const [tempBessParams, setTempBessParams] = useState({
    power: bessPower,
    capacity: bessCapacity,
    capex: capexPerMW,
    opex: opexPerYear,
    degradation: degradationRate,
    efficiency: efficiency
  });

  // Formatting Helpers
  const formatNumber = (num: number, unit: string = '') => {
    const formatted = new Intl.NumberFormat('pl-PL', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(num).replace(/\u00a0/g, ' '); // Ensure standard space if needed, though pl-PL uses non-breaking space
    return `${formatted}${unit ? ' ' + unit : ''}`;
  };

  const formatPercent = (num: number) => {
    return `${Math.round(num * 100)}%`;
  };

  const addLog = (message: string) => {
    const time = new Date().toLocaleTimeString();
    setLogs(prev => [`[${time}] ${message}`, ...prev].slice(0, 50));
  };

  // Default values based on company size
  const defaultConsumptions = {
    'small': 100,
    'medium': 500,
    'large': 1000,
    'extra-large': 50000
  };

  const currentConsumption = isCustomConsumption ? customConsumption : defaultConsumptions[companySize];

  // Step 2: Data Generation Logic
  useEffect(() => {
    if (currentStep === 2) {
      const baseData = Array.from({ length: 24 }, (_, i) => {
        const hour = i;
        // Mock prices with some daily pattern (lower at night, higher in peaks)
        const basePrice = 400 + Math.sin((hour - 6) * Math.PI / 12) * 150 + (Math.random() - 0.5) * 40;
        
        const dataPoint: any = { hour: `${hour}:00`, hourNum: hour };
        
        if (selectedYears.includes('2022')) {
          dataPoint.price2022 = Number((basePrice * 1.4 + (Math.random() - 0.5) * 60).toFixed(2));
        }
        if (selectedYears.includes('2023')) {
          dataPoint.price2023 = Number((basePrice * 1.2 + (Math.random() - 0.5) * 50).toFixed(2));
        }
        if (selectedYears.includes('2024')) {
          dataPoint.price2024 = Number((basePrice + (Math.random() - 0.5) * 30).toFixed(2));
        }
        if (showRCE) {
          dataPoint.rce = Number((basePrice * 0.9 + (Math.random() - 0.5) * 40).toFixed(2));
        }
        
        // Add consumption for mixed chart
        dataPoint.consumption = Number((50 + Math.sin((hour - 8) * Math.PI / 12) * 30 + (Math.random() - 0.5) * 10).toFixed(2));
        
        return dataPoint;
      });

      setTgeData(baseData);

      // Simple summary calculations
      const allPrices = baseData.flatMap(d => [d.price2023, d.price2024, d.rce].filter(p => p !== undefined));
      if (allPrices.length > 0) {
        const avg = allPrices.reduce((a, b) => a + b, 0) / allPrices.length;
        const max = Math.max(...allPrices);
        const min = Math.min(...allPrices);
        setAnalysisSummary({
          avgPrice: Math.round(avg),
          maxPrice: Math.round(max),
          minPrice: Math.round(min),
          spread: Math.round(max - min)
        });
      }
    }
  }, [currentStep, selectedYears, showRCE]);

  // Step 3: Financial & ROI Calculations
  useEffect(() => {
    if (currentStep === 3) {
      const years = [1, 2, 3, 4, 5];
      const seasonalIndices = [1.2, 1.1, 1.0, 0.9, 0.8, 0.9, 1.1, 1.2, 1.0, 0.9, 1.1, 1.3];
      
      let totalSavings = 0;
      const yearlyData = years.map(year => {
        // Calculate average price for this year based on model
        let yearlyAvgPrice = 0;
        let basePrice = 1;
        if (projectionModel === 'polynomial') {
          yearlyAvgPrice = polyParams.a * Math.pow(year, 2) + polyParams.b * year + polyParams.c;
          basePrice = polyParams.c;
        } else if (projectionModel === 'seasonal') {
          const yearBase = seasonalParams.base * Math.pow(1 + seasonalParams.r, year);
          yearlyAvgPrice = (seasonalIndices.reduce((a, b) => a + b, 0) / 12) * yearBase;
          basePrice = seasonalParams.base;
        } else {
          yearlyAvgPrice = powerParams.a * Math.pow(year, powerParams.b) + powerParams.c;
          basePrice = powerParams.c;
        }

        const priceMultiplier = yearlyAvgPrice / (basePrice || 1);
        
        // Degradation impact
        const currentCapacity = bessCapacity * Math.pow(1 - degradationRate, year - 1);
        
        // Simplified Arbitrage Profit (assuming 300 cycles/year, 80% DoD, spread from Step 2 or default)
        // Spread scales with the projected price trend
        const baseSpread = analysisSummary.spread > 0 ? analysisSummary.spread : 250;
        const spread = baseSpread * priceMultiplier;
        
        const cyclesPerYear = 300;
        const annualSavings = currentCapacity * (spread / 1000) * efficiency * cyclesPerYear;
        
        totalSavings += annualSavings;
        
        return {
          year: `Rok ${year}`,
          savings: Math.round(annualSavings),
          capacity: Math.round(currentCapacity),
          price: Math.round(yearlyAvgPrice)
        };
      });

      const totalCapex = (bessPower / 1000) * capexPerMW;
      const totalOpex = opexPerYear * 5;
      const totalCosts = totalCapex + totalOpex;
      
      setRoiData(yearlyData);
      setFinancialSummary({
        totalSavings5Y: Math.round(totalSavings),
        totalCosts: Math.round(totalCosts),
        roi: Number(((totalSavings / totalCosts) * 100).toFixed(1)),
        paybackYears: Number((totalCosts / (totalSavings / 5)).toFixed(1)),
        npv: Math.round(totalSavings * 1.8 - totalCosts), // Simple NPV approximation
        irr: Number(((totalSavings / totalCosts) * 15).toFixed(1)), // Simple IRR approximation
        lcoe: Number((totalCosts / (bessCapacity * 4500 * 0.9)).toFixed(2)), // Simple LCOE
        peakReduction: Math.round(bessPower * 0.8)
      });
    }
  }, [currentStep, bessCapacity, bessPower, degradationRate, efficiency, capexPerMW, opexPerYear, projectionModel, polyParams, seasonalParams, powerParams, analysisSummary.spread]);

  // Effect to sync linear value with consumption
  useEffect(() => {
    if (selectedProfile === 'linear') {
      const calculatedKW = currentConsumption * 1000 / 8760;
      setLinearValue(Number(calculatedKW.toFixed(2)));
      addLog(`Synchronizacja profilu liniowego: ${calculatedKW.toFixed(2)} kW (na podstawie ${currentConsumption} MWh)`);
    }
  }, [currentConsumption, selectedProfile]);

  // Effect to handle modeling goal changes
  useEffect(() => {
    addLog(`Aktywowano cel modelowania: ${
      modelingGoal === 'arbitrage' ? 'Arbitraż' : 
      modelingGoal === 'peak-shaving' ? 'Peak Shaving' : 'Backup'
    }`);
    
    if (modelingGoal === 'peak-shaving') {
      setSelectedProfile('standard'); // Peak shaving usually needs standard or individual profile
    }
  }, [modelingGoal]);

  const getTariffs = () => {
    return [
      { id: 'G11', group: 'G', label: 'G11', icon: Home, desc: 'Jednostrefowa' },
      { id: 'G12', group: 'G', label: 'G12', icon: Home, desc: 'Dwustrefowa' },
      { id: 'C1x', group: 'C', label: 'C1x', icon: Building2, desc: 'Małe firmy' },
      { id: 'C2x', group: 'C', label: 'C2x', icon: Building2, desc: 'Średnie firmy' },
      { id: 'B11', group: 'B', label: 'B11', icon: Factory, desc: 'Duże firmy' },
      { id: 'B21', group: 'B', label: 'B21', icon: Factory, desc: 'Przemysł' },
    ];
  };

  useEffect(() => {
    const available = getTariffs();
    if (!available.find(t => t.id === selectedTariff)) {
      setSelectedTariff(available[0].id);
    }
  }, [recipientType, companySize]);

  const steps = [
    { id: 1, label: 'Parametry' },
    { id: 2, label: 'Analiza TGE' },
    { id: 3, label: 'Dobór BESS' },
    { id: 4, label: 'Finanse' }
  ];

  const Stepper = () => (
    <div className="relative mb-12">
      {/* Progress Line Background */}
      <div className="absolute top-4 left-0 w-full h-0.5 bg-slate-100 -z-10" />
      {/* Active Progress Line */}
      <motion.div 
        className="absolute top-4 left-0 h-0.5 bg-accent -z-10 origin-left"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: (currentStep - 1) / (steps.length - 1) }}
        transition={{ duration: 0.5, ease: "circOut" }}
      />
      
      <div className="flex justify-between">
        {steps.map((step, index) => {
          const isCompleted = currentStep > step.id;
          const isActive = currentStep === step.id;
          
          return (
            <div key={step.id} className="flex flex-col items-center gap-3">
              <motion.div 
                className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-black transition-all border-4 ${
                  isActive 
                    ? 'bg-white border-accent text-accent shadow-xl shadow-blue-500/20 scale-110' 
                    : isCompleted 
                      ? 'bg-accent border-accent text-white' 
                      : 'bg-white border-slate-100 text-slate-300'
                }`}
                animate={isActive ? { scale: 1.1 } : { scale: 1 }}
              >
                {isCompleted ? <CheckCircle2 size={18} /> : step.id}
              </motion.div>
              <span className={`text-[9px] font-black uppercase tracking-[0.2em] transition-colors ${
                isActive ? 'text-slate-900' : 'text-slate-400'
              }`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );

  const GoalSelector = () => (
    <div className="flex items-center justify-between p-2 bg-slate-50 rounded-2xl border border-slate-100 mb-8">
      <div className="flex items-center gap-3 px-3">
        <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white shrink-0">
          {modelingGoal === 'arbitrage' && <Zap size={16} />}
          {modelingGoal === 'peak-shaving' && <TrendingUp size={16} />}
          {modelingGoal === 'backup' && <ShieldCheck size={16} />}
        </div>
        <div>
          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Aktualny Cel</p>
          <p className="text-[10px] font-bold text-slate-900 leading-none">
            {modelingGoal === 'arbitrage' ? 'Arbitraż' : modelingGoal === 'peak-shaving' ? 'Peak Shaving' : 'Backup'}
          </p>
        </div>
      </div>
      <div className="flex gap-1">
        {(['arbitrage', 'peak-shaving', 'backup'] as const).map((goal) => (
          <button
            key={goal}
            onClick={() => {
              setModelingGoal(goal);
              addLog(`Zmieniono cel modelowania na: ${goal}`);
            }}
            className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
              modelingGoal === goal 
                ? 'bg-white text-accent shadow-sm border border-slate-200' 
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            {goal === 'arbitrage' ? 'Arbitraż' : goal === 'peak-shaving' ? 'Peak Shaving' : 'Backup'}
          </button>
        ))}
      </div>
    </div>
  );

  const renderStep4 = () => {
    // Inference logic (independent of AI)
    const conclusions = [
      { metric: 'roi', value: financialSummary.roi, operator: '>', threshold: 15, text: 'Inwestycja charakteryzuje się wysoką rentownością (ROI > 15%).' },
      { metric: 'paybackYears', value: financialSummary.paybackYears, operator: '<', threshold: 5, text: 'Okres zwrotu jest bardzo atrakcyjny (poniżej 5 lat).' },
      { metric: 'totalSavings5Y', value: financialSummary.totalSavings5Y, operator: '>', threshold: 50000, text: 'Roczne oszczędności przekraczają 50 000 PLN, co znacząco obniża koszty operacyjne.' },
      { metric: 'roi', value: financialSummary.roi, operator: '<', threshold: 5, text: 'Rentowność inwestycji jest niska, sugerowana optymalizacja parametrów technicznych.' },
    ];

    const activeConclusions = conclusions.filter(c => {
      if (c.operator === '>') return c.value > c.threshold;
      if (c.operator === '<') return c.value < c.threshold;
      if (c.operator === '==') return c.value === c.threshold;
      return false;
    });

    const costComparison = [
      { period: '12 miesięcy', withoutBess: Math.round(currentConsumption * 1000 * 0.8), withBess: Math.round(currentConsumption * 1000 * 0.8 - financialSummary.totalSavings5Y / 5) },
      { period: '2 lata', withoutBess: Math.round(currentConsumption * 1000 * 0.8 * 2.1), withBess: Math.round(currentConsumption * 1000 * 0.8 * 2.1 - financialSummary.totalSavings5Y * 0.4) },
      { period: '5 lat', withoutBess: Math.round(currentConsumption * 1000 * 0.8 * 5.5), withBess: Math.round(currentConsumption * 1000 * 0.8 * 5.5 - financialSummary.totalSavings5Y) },
      { period: '10 lat', withoutBess: Math.round(currentConsumption * 1000 * 0.8 * 12), withBess: Math.round(currentConsumption * 1000 * 0.8 * 12 - financialSummary.totalSavings5Y * 2.2) },
    ];

    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Podsumowanie Finansowe</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">ROI (5 lat)</span>
                  <span className="text-lg font-black text-slate-900">{financialSummary.roi}%</span>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Okres Zwrotu</span>
                  <span className="text-lg font-black text-slate-900">{financialSummary.paybackYears} lat</span>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">NPV (10 lat)</span>
                  <span className="text-lg font-black text-slate-900">{formatNumber(financialSummary.npv, 'PLN')}</span>
                </div>
                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                  <span className="text-[10px] font-bold text-emerald-700 uppercase block mb-1">IRR</span>
                  <span className="text-lg font-black text-emerald-600">{financialSummary.irr}%</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Porównanie Kosztów Energii</h4>
              <div className="overflow-hidden rounded-xl border border-slate-100">
                <table className="w-full text-left text-[10px]">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase">
                    <tr>
                      <th className="px-3 py-2">Okres</th>
                      <th className="px-3 py-2 text-right">Bez BESS</th>
                      <th className="px-3 py-2 text-right">Z BESS</th>
                      <th className="px-3 py-2 text-right text-emerald-600">Oszczędność</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {costComparison.map((row, i) => (
                      <tr key={i}>
                        <td className="px-3 py-2 font-bold text-slate-900">{row.period}</td>
                        <td className="px-3 py-2 text-right text-slate-500">{formatNumber(row.withoutBess, 'PLN')}</td>
                        <td className="px-3 py-2 text-right text-slate-900 font-bold">{formatNumber(row.withBess, 'PLN')}</td>
                        <td className="px-3 py-2 text-right text-emerald-600 font-black">-{formatNumber(row.withoutBess - row.withBess, 'PLN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Wnioski i Rekomendacje</h4>
              <div className="space-y-4">
                {activeConclusions.length > 0 ? (
                  activeConclusions.map((c, i) => (
                    <motion.div 
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      key={i} 
                      className="flex gap-4 p-4 bg-blue-50/50 rounded-2xl border border-blue-100"
                    >
                      <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-accent shrink-0 shadow-sm">
                        <TrendingUp size={16} />
                      </div>
                      <p className="text-sm font-medium text-slate-700 leading-relaxed">{c.text}</p>
                    </motion.div>
                  ))
                ) : (
                  <div className="p-8 text-center text-slate-400 italic">
                    Brak specyficznych wniosków dla obecnych parametrów.
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Założenia Analizy</h4>
              <div className="space-y-3">
                <div className="flex justify-between text-[10px] border-b border-slate-50 pb-2">
                  <span className="text-slate-400 font-bold uppercase">Moc BESS</span>
                  <span className="text-slate-900 font-black">{formatNumber(bessPower, 'kW')}</span>
                </div>
                <div className="flex justify-between text-[10px] border-b border-slate-50 pb-2">
                  <span className="text-slate-400 font-bold uppercase">Pojemność</span>
                  <span className="text-slate-900 font-black">{formatNumber(bessCapacity, 'kWh')}</span>
                </div>
                <div className="flex justify-between text-[10px] border-b border-slate-50 pb-2">
                  <span className="text-slate-400 font-bold uppercase">LCOE</span>
                  <span className="text-slate-900 font-black">{financialSummary.lcoe} PLN/kWh</span>
                </div>
                <div className="flex justify-between text-[10px] border-b border-slate-50 pb-2">
                  <span className="text-slate-400 font-bold uppercase">Redukcja Szczytu</span>
                  <span className="text-blue-600 font-black">-{financialSummary.peakReduction} kW</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Projekcja Oszczędności Rocznych</h4>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={roiData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="savings" name="Oszczędności (PLN)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    );
  };

  const renderStep3 = () => (
    <div className="space-y-8">
      {/* Constants & Assumptions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 relative overflow-hidden">
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                <Settings size={16} className="text-accent" /> Parametry Techniczno-Ekonomiczne
              </h4>
              {!isEditingBESS ? (
                <button 
                  onClick={() => {
                    setTempBessParams({
                      power: bessPower,
                      capacity: bessCapacity,
                      capex: capexPerMW,
                      opex: opexPerYear,
                      degradation: degradationRate,
                      efficiency: efficiency
                    });
                    setIsEditingBESS(true);
                  }}
                  className="px-4 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all flex items-center gap-2"
                >
                  <Settings size={12} /> Zmień
                </button>
              ) : (
                <div className="flex gap-2">
                   <button 
                    onClick={() => setIsEditingBESS(false)}
                    className="px-4 py-1.5 bg-white border border-slate-200 text-slate-400 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all"
                  >
                    Anuluj
                  </button>
                  <button 
                    onClick={() => {
                      setBessPower(tempBessParams.power);
                      setBessCapacity(tempBessParams.capacity);
                      setCapexPerMW(tempBessParams.capex);
                      setOpexPerYear(tempBessParams.opex);
                      setDegradationRate(tempBessParams.degradation);
                      setEfficiency(tempBessParams.efficiency);
                      setIsEditingBESS(false);
                      addLog('Zaktualizowano parametry techniczne BESS');
                    }}
                    className="px-4 py-1.5 bg-accent text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all flex items-center gap-2"
                  >
                    <CheckCircle2 size={12} /> Zapisz i zaktualizuj
                  </button>
                </div>
              )}
            </div>
            
            <div className={`grid grid-cols-2 sm:grid-cols-3 gap-4 transition-opacity ${!isEditingBESS ? 'opacity-80' : 'opacity-100'}`}>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase">CAPEX (PLN/MW)</p>
                <div className="flex items-center gap-2">
                  {isEditingBESS ? (
                    <input 
                      type="number" 
                      value={tempBessParams.capex} 
                      onChange={(e) => setTempBessParams({...tempBessParams, capex: Number(e.target.value)})}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 font-black text-slate-900 focus:ring-2 focus:ring-accent/20 outline-none"
                    />
                  ) : (
                    <p className="font-black text-slate-900">{formatNumber(capexPerMW, 'PLN')}</p>
                  )}
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase">OPEX (PLN/rok)</p>
                {isEditingBESS ? (
                  <input 
                    type="number" 
                    value={tempBessParams.opex} 
                    onChange={(e) => setTempBessParams({...tempBessParams, opex: Number(e.target.value)})}
                    className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 font-black text-slate-900 focus:ring-2 focus:ring-accent/20 outline-none"
                  />
                ) : (
                  <p className="font-black text-slate-900">{formatNumber(opexPerYear, 'PLN')}</p>
                )}
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Degradacja (/rok)</p>
                {isEditingBESS ? (
                  <div className="relative">
                    <input 
                      type="number" 
                      step="0.1"
                      value={tempBessParams.degradation * 100} 
                      onChange={(e) => setTempBessParams({...tempBessParams, degradation: Number(e.target.value) / 100})}
                      className="w-full bg-white border border-slate-200 rounded-lg pl-2 pr-6 py-1 font-black text-slate-900 focus:ring-2 focus:ring-accent/20 outline-none"
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">%</span>
                  </div>
                ) : (
                  <p className="font-black text-slate-900">{formatPercent(degradationRate)}</p>
                )}
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Sprawność (RTE)</p>
                {isEditingBESS ? (
                  <div className="relative">
                    <input 
                      type="number" 
                      step="0.1"
                      value={tempBessParams.efficiency * 100} 
                      onChange={(e) => setTempBessParams({...tempBessParams, efficiency: Number(e.target.value) / 100})}
                      className="w-full bg-white border border-slate-200 rounded-lg pl-2 pr-6 py-1 font-black text-slate-900 focus:ring-2 focus:ring-accent/20 outline-none"
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">%</span>
                  </div>
                ) : (
                  <p className="font-black text-slate-900">{formatPercent(efficiency)}</p>
                )}
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Moc (kW)</p>
                {isEditingBESS ? (
                  <input 
                    type="number" 
                    value={tempBessParams.power} 
                    onChange={(e) => setTempBessParams({...tempBessParams, power: Number(e.target.value)})}
                    className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 font-black text-slate-900 focus:ring-2 focus:ring-accent/20 outline-none"
                  />
                ) : (
                  <p className="font-black text-slate-900">{formatNumber(bessPower, 'kW')}</p>
                )}
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Pojemność (kWh)</p>
                {isEditingBESS ? (
                  <input 
                    type="number" 
                    value={tempBessParams.capacity} 
                    onChange={(e) => setTempBessParams({...tempBessParams, capacity: Number(e.target.value)})}
                    className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 font-black text-slate-900 focus:ring-2 focus:ring-accent/20 outline-none"
                  />
                ) : (
                  <p className="font-black text-slate-900">{formatNumber(bessCapacity, 'kWh')}</p>
                )}
              </div>
            </div>
            
            {!isEditingBESS && (
              <div className="absolute inset-0 bg-slate-900/5 backdrop-blur-[1px] flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer" onClick={() => setIsEditingBESS(true)}>
                <div className="bg-white px-4 py-2 rounded-xl shadow-xl flex items-center gap-2">
                  <Settings size={14} className="text-accent animate-spin-slow" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">Kliknij aby edytować</span>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                <Calculator size={16} className="text-accent" /> Model Projekcji Cen Energii
              </h4>
              {!isEditingProjection ? (
                <button 
                  onClick={() => {
                    setTempProjectionParams({
                      poly: { ...polyParams },
                      seasonal: { ...seasonalParams },
                      power: { ...powerParams }
                    });
                    setIsEditingProjection(true);
                  }}
                  className="px-4 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all flex items-center gap-2"
                >
                  <Settings size={12} /> Zmień
                </button>
              ) : (
                <div className="flex gap-2">
                   <button 
                    onClick={() => setIsEditingProjection(false)}
                    className="px-4 py-1.5 bg-white border border-slate-200 text-slate-400 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all"
                  >
                    Anuluj
                  </button>
                  <button 
                    onClick={() => {
                      setPolyParams(tempProjectionParams.poly);
                      setSeasonalParams(tempProjectionParams.seasonal);
                      setPowerParams(tempProjectionParams.power);
                      setIsEditingProjection(false);
                      addLog('Zaktualizowano parametry modelu projekcji cen');
                    }}
                    className="px-4 py-1.5 bg-accent text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all flex items-center gap-2"
                  >
                    <CheckCircle2 size={12} /> Zapisz i zaktualizuj
                  </button>
                </div>
              )}
            </div>

            <div className={`flex gap-2 mb-6 transition-opacity ${!isEditingProjection ? 'opacity-50 pointer-events-none' : ''}`}>
              {[
                { id: 'polynomial', label: 'Wielomianowy', icon: TrendingUp },
                { id: 'seasonal', label: 'Sezonowy', icon: Calendar },
                { id: 'power', label: 'Potęgowy', icon: Zap }
              ].map((model) => (
                <button
                  key={model.id}
                  onClick={() => {
                    setProjectionModel(model.id as any);
                    addLog(`Zmieniono model projekcji na: ${model.label}`);
                  }}
                  className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                    projectionModel === model.id 
                      ? 'border-accent bg-blue-50 text-accent' 
                      : 'border-slate-50 text-slate-400 hover:border-slate-100'
                  }`}
                >
                  <model.icon size={20} />
                  <span className="text-[10px] font-black uppercase tracking-tighter">{model.label}</span>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-4 p-4 bg-slate-50 rounded-xl">
              {projectionModel === 'polynomial' && (
                <>
                  <div className="space-y-1">
                    <p className="text-[8px] font-bold text-slate-400 uppercase">Parametr a</p>
                    {isEditingProjection ? (
                      <input type="number" value={tempProjectionParams.poly.a} onChange={e => setTempProjectionParams({...tempProjectionParams, poly: {...tempProjectionParams.poly, a: Number(e.target.value)}})} className="w-full bg-transparent font-bold text-xs border-b border-slate-200 focus:border-accent outline-none" />
                    ) : (
                      <p className="font-bold text-xs text-slate-900">{polyParams.a}</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <p className="text-[8px] font-bold text-slate-400 uppercase">Parametr b</p>
                    {isEditingProjection ? (
                      <input type="number" value={tempProjectionParams.poly.b} onChange={e => setTempProjectionParams({...tempProjectionParams, poly: {...tempProjectionParams.poly, b: Number(e.target.value)}})} className="w-full bg-transparent font-bold text-xs border-b border-slate-200 focus:border-accent outline-none" />
                    ) : (
                      <p className="font-bold text-xs text-slate-900">{polyParams.b}</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <p className="text-[8px] font-bold text-slate-400 uppercase">Cena Start (c)</p>
                    {isEditingProjection ? (
                      <input type="number" value={tempProjectionParams.poly.c} onChange={e => setTempProjectionParams({...tempProjectionParams, poly: {...tempProjectionParams.poly, c: Number(e.target.value)}})} className="w-full bg-transparent font-bold text-xs border-b border-slate-200 focus:border-accent outline-none" />
                    ) : (
                      <p className="font-bold text-xs text-slate-900">{formatNumber(polyParams.c, 'PLN')}</p>
                    )}
                  </div>
                </>
              )}
              {projectionModel === 'seasonal' && (
                <>
                  <div className="space-y-1">
                    <p className="text-[8px] font-bold text-slate-400 uppercase">Trend (r)</p>
                    {isEditingProjection ? (
                      <input type="number" step="0.01" value={tempProjectionParams.seasonal.r} onChange={e => setTempProjectionParams({...tempProjectionParams, seasonal: {...tempProjectionParams.seasonal, r: Number(e.target.value)}})} className="w-full bg-transparent font-bold text-xs border-b border-slate-200 focus:border-accent outline-none" />
                    ) : (
                      <p className="font-bold text-xs text-slate-900">{formatPercent(seasonalParams.r)}</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <p className="text-[8px] font-bold text-slate-400 uppercase">Cena Bazowa</p>
                    {isEditingProjection ? (
                      <input type="number" value={tempProjectionParams.seasonal.base} onChange={e => setTempProjectionParams({...tempProjectionParams, seasonal: {...tempProjectionParams.seasonal, base: Number(e.target.value)}})} className="w-full bg-transparent font-bold text-xs border-b border-slate-200 focus:border-accent outline-none" />
                    ) : (
                      <p className="font-bold text-xs text-slate-900">{formatNumber(seasonalParams.base, 'PLN')}</p>
                    )}
                  </div>
                </>
              )}
              {projectionModel === 'power' && (
                <>
                  <div className="space-y-1">
                    <p className="text-[8px] font-bold text-slate-400 uppercase">Mnożnik (a)</p>
                    {isEditingProjection ? (
                      <input type="number" value={tempProjectionParams.power.a} onChange={e => setTempProjectionParams({...tempProjectionParams, power: {...tempProjectionParams.power, a: Number(e.target.value)}})} className="w-full bg-transparent font-bold text-xs border-b border-slate-200 focus:border-accent outline-none" />
                    ) : (
                      <p className="font-bold text-xs text-slate-900">{tempProjectionParams.power.a}</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <p className="text-[8px] font-bold text-slate-400 uppercase">Wykładnik (b)</p>
                    {isEditingProjection ? (
                      <input type="number" step="0.1" value={tempProjectionParams.power.b} onChange={e => setTempProjectionParams({...tempProjectionParams, power: {...tempProjectionParams.power, b: Number(e.target.value)}})} className="w-full bg-transparent font-bold text-xs border-b border-slate-200 focus:border-accent outline-none" />
                    ) : (
                      <p className="font-bold text-xs text-slate-900">{tempProjectionParams.power.b}</p>
                    )}
                  </div>
                </>
              )}
            </div>

            {!isEditingProjection && (
              <div className="absolute inset-0 bg-slate-900/5 backdrop-blur-[1px] flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer" onClick={() => setIsEditingProjection(true)}>
                <div className="bg-white px-4 py-2 rounded-xl shadow-xl flex items-center gap-2">
                  <Settings size={14} className="text-accent animate-spin-slow" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">Kliknij aby edytować model</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="p-6 bg-accent rounded-3xl text-white shadow-xl shadow-blue-500/20">
            <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Prognozowany ROI (5 lat)</p>
            <p className="text-4xl font-black mb-4">{formatNumber(financialSummary.roi)}%</p>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="space-y-1">
                <p className="text-[8px] font-bold uppercase opacity-60">NPV (10 lat)</p>
                <p className="text-sm font-black">{formatNumber(financialSummary.npv, 'PLN')}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[8px] font-bold uppercase opacity-60">IRR</p>
                <p className="text-sm font-black">{financialSummary.irr}%</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-bold">
                <span className="opacity-60 uppercase">Okres zwrotu</span>
                <span>{formatNumber(financialSummary.paybackYears)} lat</span>
              </div>
              <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-white transition-all duration-1000" 
                  style={{ width: `${Math.min(100, (5 / financialSummary.paybackYears) * 100)}%` }} 
                />
              </div>
            </div>
          </div>

          <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase">LCOE (Koszt Energii)</span>
              <span className="text-sm font-black text-slate-900">{financialSummary.lcoe} PLN/kWh</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Redukcja Szczytu</span>
              <span className="text-sm font-black text-blue-600">-{financialSummary.peakReduction} kW</span>
            </div>
            <div className="h-px bg-slate-100" />
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Zysk Netto (5L)</span>
              <span className="text-sm font-black text-accent">{formatNumber(financialSummary.totalSavings5Y - financialSummary.totalCosts, 'PLN')}</span>
            </div>
          </div>

          <div className="p-6 bg-blue-50 rounded-3xl border border-blue-100 space-y-4">
            <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
              <ShieldCheck size={14} className="text-accent" />
              Strategia: {modelingGoal === 'arbitrage' ? 'Arbitraż' : modelingGoal === 'peak-shaving' ? 'Peak Shaving' : 'Backup'}
            </h4>
            <p className="text-[10px] text-slate-600 leading-relaxed">
              {modelingGoal === 'arbitrage' && 'Maksymalizacja zysku poprzez ładowanie magazynu w dolinach cenowych i rozładowywanie w szczytach TGE.'}
              {modelingGoal === 'peak-shaving' && 'Redukcja mocy zamówionej i opłat dystrybucyjnych poprzez wspomaganie zasilania w szczytach poboru.'}
              {modelingGoal === 'backup' && 'Zapewnienie ciągłości zasilania dla krytycznych odbiorników w przypadku awarii sieci zewnętrznej.'}
            </p>
          </div>
        </div>
      </div>

      {/* ROI Chart */}
      <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm">
        <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
          <BarChart3 size={16} className="text-accent" /> Projekcja Finansowa i Degradacja SOH
        </h4>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={roiData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} unit=" PLN" />
              <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} unit=" kWh" />
              <Tooltip 
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} 
                formatter={(value: any, name: string) => [formatNumber(value, name === 'Oszczędności' ? 'PLN' : 'kWh'), name]}
              />
              <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }} />
              <Bar yAxisId="left" dataKey="savings" name="Oszczędności" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Line yAxisId="right" type="monotone" dataKey="capacity" name="Pojemność (SOH)" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981' }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-8">
      {/* TGE Controls */}
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Konfiguracja Analizy Rynkowej</h4>
        <button 
          onClick={() => {
            setSelectedYears(['2024']);
            setShowRCE(true);
            addLog('Przywrócono domyślne założenia TGE');
          }}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black text-accent uppercase tracking-widest hover:bg-slate-50 transition-all"
        >
          <Upload size={14} /> Zaczytaj dane domyślne
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Dane Historyczne (TGE)</label>
          <div className="flex flex-wrap gap-2">
            {['2022', '2023', '2024'].map((year) => (
              <button
                key={year}
                onClick={() => {
                  const newYears = selectedYears.includes(year) 
                    ? selectedYears.filter(y => y !== year)
                    : [...selectedYears, year];
                  setSelectedYears(newYears);
                  addLog(`Zmieniono zakres lat TGE: ${newYears.join(', ')}`);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border-2 ${
                  selectedYears.includes(year)
                    ? 'border-accent bg-blue-50 text-accent'
                    : 'border-slate-100 text-slate-400 hover:border-slate-200'
                }`}
              >
                Rok {year}
              </button>
            ))}
            <button
              onClick={() => {
                setShowRCE(!showRCE);
                addLog(`Przełączono widoczność RCE: ${!showRCE ? 'Włączone' : 'Wyłączone'}`);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border-2 ${
                showRCE
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-600'
                  : 'border-slate-100 text-slate-400 hover:border-slate-200'
              }`}
            >
              RCE (Rynek Bilansujący)
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Średnia Cena</p>
            <p className="text-xl font-black text-slate-900">{formatNumber(analysisSummary.avgPrice, 'PLN/MWh')}</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Max Spread</p>
            <p className="text-xl font-black text-accent">{formatNumber(analysisSummary.spread, 'PLN')}</p>
          </div>
        </div>
      </div>

      {/* TGE Chart */}
      <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h4 className="font-bold text-slate-900 flex items-center gap-2">
            <TrendingUp size={18} className="text-accent" />
            Wizualizacja Cen i Profilu
          </h4>
          <div className="flex gap-4 text-[10px] font-bold uppercase tracking-widest">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-slate-400 rounded-full" />
              <span className="text-slate-500">TGE 2022</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-slate-300 rounded-full" />
              <span className="text-slate-500">TGE 2023</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-accent rounded-full" />
              <span className="text-slate-500">TGE 2024</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-emerald-500 rounded-full" />
              <span className="text-slate-500">RCE</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-slate-200 rounded-sm" />
              <span className="text-slate-500">Pobór</span>
            </div>
          </div>
        </div>

        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={tgeData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="hour" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fill: '#94a3b8' }}
              />
              <YAxis 
                yAxisId="left"
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fill: '#94a3b8' }}
                unit=" PLN"
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fill: '#94a3b8' }}
                unit=" kW"
              />
              <Tooltip 
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                formatter={(value: any, name: string) => [formatNumber(value, name === 'Pobór Energii' ? 'kW' : 'PLN/MWh'), name]}
              />
              <Bar 
                yAxisId="right" 
                dataKey="consumption" 
                fill="#f1f5f9" 
                radius={[4, 4, 0, 0]} 
                name="Pobór Energii"
              />
              {selectedYears.includes('2022') && (
                <Line 
                  yAxisId="left" 
                  type="monotone" 
                  dataKey="price2022" 
                  stroke="#cbd5e1" 
                  strokeWidth={1} 
                  strokeDasharray="5 5"
                  dot={false}
                  name="Cena 2022"
                />
              )}
              {selectedYears.includes('2023') && (
                <Line 
                  yAxisId="left" 
                  type="monotone" 
                  dataKey="price2023" 
                  stroke="#94a3b8" 
                  strokeWidth={2} 
                  dot={false}
                  name="Cena 2023"
                />
              )}
              {selectedYears.includes('2024') && (
                <Line 
                  yAxisId="left" 
                  type="monotone" 
                  dataKey="price2024" 
                  stroke="#3b82f6" 
                  strokeWidth={3} 
                  dot={false}
                  name="Cena 2024"
                />
              )}
              {showRCE && (
                <Area 
                  yAxisId="left" 
                  type="monotone" 
                  dataKey="rce" 
                  fill="#10b981" 
                  fillOpacity={0.1} 
                  stroke="#10b981" 
                  strokeWidth={2} 
                  dot={false}
                  name="RCE"
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* TGE Table */}
      <div className="space-y-4">
        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Szczegółowe Dane Godzinowe (PLN/MWh)</label>
        <div className="overflow-x-auto rounded-2xl border border-slate-100">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Godzina</th>
                {selectedYears.includes('2022') && <th className="px-4 py-3">Cena 2022</th>}
                {selectedYears.includes('2023') && <th className="px-4 py-3">Cena 2023</th>}
                {selectedYears.includes('2024') && <th className="px-4 py-3">Cena 2024</th>}
                {showRCE && <th className="px-4 py-3">RCE</th>}
                <th className="px-4 py-3">Pobór (kW)</th>
                <th className="px-4 py-3">Delta (Spread)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {(showFullDay ? tgeData : tgeData.slice(0, 12)).map((row, i) => (
                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3 font-bold text-slate-900">{row.hour}</td>
                  {selectedYears.includes('2022') && <td className="px-4 py-3 text-slate-400 italic">{formatNumber(row.price2022)}</td>}
                  {selectedYears.includes('2023') && <td className="px-4 py-3 text-slate-500">{formatNumber(row.price2023)}</td>}
                  {selectedYears.includes('2024') && <td className="px-4 py-3 text-slate-900 font-medium">{formatNumber(row.price2024)}</td>}
                  {showRCE && <td className="px-4 py-3 text-emerald-600">{formatNumber(row.rce)}</td>}
                  <td className="px-4 py-3 text-slate-500">{formatNumber(row.consumption)}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                      row.price2024 > analysisSummary.avgPrice ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
                    }`}>
                      {formatNumber(Math.abs(row.price2024 - analysisSummary.avgPrice))}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="p-3 bg-slate-50 text-center">
            <button 
              onClick={() => setShowFullDay(!showFullDay)}
              className="text-[10px] font-black text-accent uppercase tracking-widest hover:underline"
            >
              {showFullDay ? 'Pokaż mniej (12h)' : 'Pokaż pełną dobę (24h)'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-8">
      {/* Typ Odbiorcy */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Typ Odbiorcy</label>
          <div className="group relative">
            <Info size={14} className="text-slate-400 cursor-help hover:text-accent transition-colors" />
            <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 w-64 p-3 bg-slate-900 text-white text-[10px] rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 shadow-xl pointer-events-none">
              <p className="font-bold mb-1">Wpływ wyboru typu odbiorcy:</p>
              <ul className="space-y-1 list-disc pl-3">
                <li>Determinuje profil zużycia energii (np. biurowy vs przemysłowy).</li>
                <li>Wpływa na dostępne taryfy i modele rozliczeń w Kroku 2.</li>
                <li>Pozwala na precyzyjne dopasowanie parametrów BESS w Kroku 3.</li>
              </ul>
              <div className="absolute right-full top-1/2 -translate-y-1/2 border-8 border-transparent border-r-slate-900" />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { id: 'individual', label: 'Indywidualny', icon: User },
            { id: 'company', label: 'Firma', icon: Building2 },
            { id: 'mixed', label: 'Mieszany', icon: Users },
          ].map((type) => (
            <button
              key={type.id}
              onClick={() => {
                setRecipientType(type.id as any);
                addLog(`Zmieniono typ odbiorcy na: ${type.label}`);
              }}
              className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${
                recipientType === type.id 
                  ? 'border-accent bg-blue-50/50 text-accent' 
                  : 'border-slate-100 hover:border-slate-200 text-slate-500'
              }`}
            >
              <type.icon size={20} />
              <span className="font-bold">{type.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Wielkość Firmy (Conditional) */}
      <AnimatePresence>
        {recipientType === 'company' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4 overflow-hidden"
          >
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Wielkość Firmy</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { id: 'small', label: 'Mała' },
                { id: 'medium', label: 'Średnia' },
                { id: 'large', label: 'Duża' },
                { id: 'extra-large', label: 'Bardzo Duża' },
              ].map((size) => (
                <button
                  key={size.id}
                  onClick={() => {
                    setCompanySize(size.id as any);
                    addLog(`Zmieniono wielkość firmy na: ${size.label}`);
                  }}
                  className={`px-4 py-3 rounded-xl border-2 text-sm font-bold transition-all ${
                    companySize === size.id 
                      ? 'border-accent bg-blue-50/50 text-accent' 
                      : 'border-slate-100 hover:border-slate-200 text-slate-500'
                  }`}
                >
                  {size.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Roczne zużycie energii */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Roczne zużycie energii</label>
          <button 
            onClick={() => setIsCustomConsumption(!isCustomConsumption)}
            className="text-[10px] font-black text-accent uppercase tracking-widest hover:underline"
          >
            {isCustomConsumption ? 'Przywróć domyślne' : 'Zmień'}
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 relative group">
            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Całkowite (MWh)</p>
            {isCustomConsumption ? (
              <input 
                type="number"
                value={customConsumption}
                onChange={(e) => setCustomConsumption(Number(e.target.value))}
                className="text-3xl font-black text-slate-900 bg-transparent border-b-2 border-accent w-full focus:outline-none"
              />
            ) : (
              <p className="text-3xl font-black text-slate-900">{formatNumber(currentConsumption)} MWh</p>
            )}
            <p className="text-[10px] text-slate-400 mt-2 font-medium">
              {isCustomConsumption ? 'Wartość indywidualna' : 'Wartość domyślna dla typu firmy'}
            </p>
          </div>
          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Całkowite (kWh)</p>
            <p className="text-3xl font-black text-slate-900">{formatNumber(currentConsumption * 1000)} kWh</p>
            <p className="text-[10px] text-slate-400 mt-2 font-medium">Przeliczenie automatyczne</p>
          </div>
        </div>
      </div>

      {/* Model Poboru Energii */}
      <div className="space-y-4">
        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Model Poboru Energii (Profil PPE)</label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { id: 'linear', label: 'Profil Liniowy (Stały)', icon: TrendingUp },
            { id: 'standard', label: 'Profil Standardowy (Taryfowy)', icon: Zap },
            { id: 'individual', label: 'Profil Indywidualny', icon: User },
          ].map((profile) => (
            <button
              key={profile.id}
              onClick={() => {
                setSelectedProfile(profile.id as any);
                addLog(`Zmieniono profil poboru na: ${profile.label}`);
              }}
              className={`flex flex-col gap-3 p-6 rounded-2xl border-2 transition-all text-left ${
                selectedProfile === profile.id 
                  ? 'border-accent bg-blue-50/50' 
                  : 'border-slate-100 hover:border-slate-200'
              }`}
            >
              <profile.icon size={24} className={selectedProfile === profile.id ? 'text-accent' : 'text-slate-400'} />
              <div>
                <p className={`font-bold text-sm ${selectedProfile === profile.id ? 'text-accent' : 'text-slate-900'}`}>{profile.label}</p>
                <p className="text-[10px] text-slate-400 mt-1 leading-tight">
                  {profile.id === 'linear' && 'Stały pobór mocy przez całą dobę.'}
                  {profile.id === 'standard' && 'Na podstawie grup taryfowych (G, C, B).'}
                  {profile.id === 'individual' && 'Własne dane godzinowe lub sezonowe.'}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Profile Details (Conditional) */}
      <AnimatePresence mode="wait">
        {selectedProfile === 'linear' && (
          <motion.div
            key="linear-details"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900">Konfiguracja Profilu Liniowego</h4>
              <div className="px-3 py-1 bg-accent/10 text-accent text-[10px] font-black rounded-full uppercase tracking-wider">
                Automatyczna Synchronizacja
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Stały pobór mocy (kW)</p>
                <div className="flex items-center gap-4">
                  <input 
                    type="range" 
                    min="1" 
                    max="10000" 
                    step="0.1"
                    value={linearValue}
                    onChange={(e) => setLinearValue(Number(e.target.value))}
                    className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-accent"
                  />
                  <input 
                    type="number" 
                    value={linearValue}
                    onChange={(e) => setLinearValue(Number(e.target.value))}
                    className="w-24 px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-accent/20"
                  />
                </div>
              </div>
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed italic">
              * Wartość kW jest wyliczana jako: (Roczne zużycie kWh / 8760h). Zmiana mocy wpłynie na roczne zużycie.
            </p>
          </motion.div>
        )}

        {selectedProfile === 'standard' && (
          <motion.div
            key="standard-details"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900">Wybierz Grupę Taryfową</h4>
              <div className="flex gap-2">
                {['G', 'C', 'B'].map(g => (
                  <div key={g} className="flex items-center gap-1">
                    <div className={`w-2 h-2 rounded-full ${g === 'G' ? 'bg-blue-400' : g === 'C' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                    <span className="text-[9px] font-black text-slate-400 uppercase">{g}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {getTariffs().map((tariff) => (
                <button
                  key={tariff.id}
                  onClick={() => {
                    setSelectedTariff(tariff.id);
                    addLog(`Wybrano taryfę: ${tariff.id}`);
                  }}
                  className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                    selectedTariff === tariff.id 
                      ? 'border-accent bg-white shadow-lg shadow-blue-500/10' 
                      : 'border-white bg-white/50 text-slate-400 hover:border-slate-200'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                    selectedTariff === tariff.id 
                      ? 'bg-accent text-white' 
                      : 'bg-slate-100 text-slate-400'
                  }`}>
                    <tariff.icon size={20} />
                  </div>
                  <div className="text-center">
                    <p className={`font-black text-xs ${selectedTariff === tariff.id ? 'text-accent' : 'text-slate-900'}`}>{tariff.label}</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{tariff.desc}</p>
                  </div>
                  {selectedTariff === tariff.id && (
                    <motion.div 
                      layoutId="tariff-check"
                      className="absolute -top-1 -right-1 w-5 h-5 bg-accent text-white rounded-full flex items-center justify-center shadow-sm"
                    >
                      <CheckCircle2 size={12} />
                    </motion.div>
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {selectedProfile === 'individual' && (
          <motion.div
            key="individual-details"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-6"
          >
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900">Model Indywidualny</h4>
              <div className="flex gap-2">
                <button 
                  onClick={() => setIndividualMode('daily')}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${
                    individualMode === 'daily' ? 'bg-accent text-white' : 'bg-white text-slate-400'
                  }`}
                >
                  Uśredniona doba
                </button>
                <button 
                  onClick={() => setIndividualMode('seasonal')}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${
                    individualMode === 'seasonal' ? 'bg-accent text-white' : 'bg-white text-slate-400'
                  }`}
                >
                  Sezonowy dobowy
                </button>
              </div>
            </div>

            {individualMode === 'seasonal' && (
              <div className="flex flex-wrap gap-2">
                {['Sty', 'Lut', 'Mar', 'Kwi', 'Maj', 'Cze', 'Lip', 'Sie', 'Wrz', 'Paź', 'Lis', 'Gru'].map((m, i) => (
                  <button
                    key={m}
                    onClick={() => setSelectedMonth(i)}
                    className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all ${
                      selectedMonth === i ? 'bg-slate-900 text-white' : 'bg-white text-slate-400 hover:bg-slate-100'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            )}

            <div className="grid grid-cols-6 md:grid-cols-12 gap-2">
              {hourlyValues.map((val, i) => (
                <div key={i} className="space-y-1">
                  <p className="text-[8px] font-bold text-slate-400 text-center">{i}:00</p>
                  <input 
                    type="number"
                    value={val}
                    onChange={(e) => {
                      const newVals = [...hourlyValues];
                      newVals[i] = Number(e.target.value);
                      setHourlyValues(newVals);
                    }}
                    className="w-full px-1 py-2 bg-white border border-slate-200 rounded-lg text-center text-xs font-bold focus:outline-none focus:ring-2 focus:ring-accent/20"
                  />
                </div>
              ))}
            </div>

            <div className="flex justify-center">
              <button className="flex items-center gap-2 px-6 py-3 bg-white border border-dashed border-slate-300 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 transition-all group">
                <Upload size={16} className="group-hover:scale-110 transition-transform" />
                Wgraj plik XLS z profilem
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Wskaźnik Optymalizacji */}
      <div className="p-6 bg-slate-900 rounded-2xl text-white flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative">
        <div className="relative z-10 flex items-center gap-6">
          <div className="w-16 h-16 bg-accent/20 rounded-2xl flex items-center justify-center text-accent">
            <Zap size={32} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Wskaźnik Optymalizacji</p>
            <h4 className="text-2xl font-black tracking-tight">
              {selectedProfile === 'linear' ? 'Standardowy' : selectedProfile === 'standard' ? 'Optymalny' : 'Maksymalna Precyzja'}
            </h4>
            <p className="text-xs text-slate-400 mt-1">
              {selectedProfile === 'linear' && 'Uproszczony model obliczeniowy.'}
              {selectedProfile === 'standard' && `Uwzględnia taryfę ${selectedTariff} i ceny TGE.`}
              {selectedProfile === 'individual' && 'Modelowanie na danych rzeczywistych.'}
            </p>
          </div>
        </div>
        <div className="flex gap-2 relative z-10">
          {[1, 2, 3].map((dot) => (
            <div 
              key={dot} 
              className={`w-3 h-3 rounded-full transition-all duration-500 ${
                (selectedProfile === 'linear' && dot === 1) ||
                (selectedProfile === 'standard' && dot <= 2) ||
                (selectedProfile === 'individual' && dot <= 3)
                  ? 'bg-accent shadow-[0_0_10px_rgba(59,130,246,0.8)]' 
                  : 'bg-slate-700'
              }`} 
            />
          ))}
        </div>
        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-accent/10 rounded-full blur-3xl" />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Sticky Header for Stepper and GoalSelector */}
          <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md pt-4 pb-2 -mx-4 px-4 border-b border-slate-100 mb-4">
            <Stepper />
            <GoalSelector />
          </div>
          
          <Card 
            title={`Krok ${currentStep}: ${
              currentStep === 1 ? 'Konfiguracja Parametrów' : 
              currentStep === 2 ? 'Analiza Rynkowa TGE' : 
              currentStep === 3 ? 'Matematyka i Opłacalność' :
              'Raport i Wnioski'
            }`} 
            subtitle={
              currentStep === 1 ? 'Zdefiniuj profil poboru energii i typ odbiorcy' : 
              currentStep === 2 ? 'Analiza cen energii i potencjału arbitrażu' : 
              currentStep === 3 ? 'Modele projekcji cen i silnik obliczeniowy ROI' :
              'Zestawienie wyników, porównania i rekomendacje'
            }
          >
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            {currentStep === 4 && renderStep4()}

            <div className="mt-12 pt-8 border-t border-slate-100 flex justify-between">
              <button
                onClick={() => {
                  setCurrentStep(prev => Math.max(1, prev - 1));
                  addLog(`Powrót do Kroku ${currentStep - 1}`);
                }}
                disabled={currentStep === 1}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
                  currentStep === 1 ? 'text-slate-300 cursor-not-allowed' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <ChevronLeft size={20} /> Wstecz
              </button>
              <button
                onClick={() => {
                  if (currentStep < 4) {
                    setCurrentStep(prev => prev + 1);
                    addLog(`Przejście do Kroku ${currentStep + 1}`);
                  } else {
                    setIsSaveModalOpen(true);
                  }
                }}
                className="flex items-center gap-2 px-8 py-3 bg-accent text-white rounded-xl font-bold hover:bg-blue-600 transition-all shadow-lg shadow-blue-500/20 group"
              >
                {currentStep === 4 ? 'Zakończ i Zapisz' : 'Dalej'} <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </Card>
        </div>

        <div className="space-y-8">
          <TerminalLog 
            logs={logs} 
            onOpenFullLogs={onOpenAuditLogs} 
            onExpand={() => setIsLogsModalOpen(true)}
          />
          
          <Card title="Podsumowanie Wyboru" subtitle="Aktualne parametry symulacji">
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div className="flex items-center gap-3">
                <Building2 size={18} className="text-slate-400" />
                <span className="text-xs font-bold text-slate-600">Odbiorca</span>
              </div>
              <span className="text-xs font-black text-slate-900 uppercase">
                {recipientType === 'company' ? `Firma (${companySize})` : recipientType === 'individual' ? 'Indywidualny' : 'Mieszany'}
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div className="flex items-center gap-3">
                <Zap size={18} className="text-slate-400" />
                <span className="text-xs font-bold text-slate-600">Profil</span>
              </div>
              <span className="text-xs font-black text-slate-900 uppercase">
                {selectedProfile === 'linear' ? 'Liniowy' : selectedProfile === 'standard' ? `Taryfa ${selectedTariff}` : 'Indywidualny'}
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div className="flex items-center gap-3">
                <Battery size={18} className="text-slate-400" />
                <span className="text-xs font-bold text-slate-600">Zużycie</span>
              </div>
              <span className="text-xs font-black text-slate-900">{formatNumber(currentConsumption)} MWh/rok</span>
            </div>

            {currentStep >= 3 && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4 pt-4 border-t border-slate-100"
              >
                <div className="flex items-center justify-between p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                  <div className="flex items-center gap-3">
                    <Zap size={18} className="text-accent" />
                    <span className="text-xs font-bold text-slate-600">Moc BESS</span>
                  </div>
                  <span className="text-xs font-black text-accent">{formatNumber(bessPower, 'kW')}</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                  <div className="flex items-center gap-3">
                    <Battery size={18} className="text-accent" />
                    <span className="text-xs font-bold text-slate-600">Pojemność</span>
                  </div>
                  <span className="text-xs font-black text-accent">{formatNumber(bessCapacity, 'kWh')}</span>
                </div>
              </motion.div>
            )}
            
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 flex items-start gap-3">
              <CheckCircle2 className="text-emerald-600 shrink-0" size={18} />
              <p className="text-[10px] text-emerald-800 font-medium leading-relaxed">
                Wszystkie parametry są gotowe do analizy finansowej. Możesz przejść do kolejnego kroku.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>

    <Modal 
        isOpen={isLogsModalOpen} 
        onClose={() => setIsLogsModalOpen(false)} 
        title="Dziennik Zdarzeń Systemowych"
      >
        <div className="bg-slate-900 rounded-2xl p-8 font-mono text-xs leading-relaxed min-h-[400px]">
          {logs.map((log, i) => (
            <div key={i} className="mb-2 flex gap-4">
              <span className="text-slate-600 shrink-0">{log.split('] ')[0]}]</span>
              <span className="text-slate-300">{log.split('] ')[1]}</span>
            </div>
          ))}
          {logs.length === 0 && (
            <div className="text-slate-600 italic">Brak zarejestrowanych zdarzeń.</div>
          )}
        </div>
      </Modal>

      <Modal 
        isOpen={isSaveModalOpen} 
        onClose={() => setIsSaveModalOpen(false)} 
        title="Zapisz Raport Symulacji"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nazwa Raportu</label>
              <input 
                type="text" 
                placeholder="np. Symulacja BESS - Zakład Produkcyjny"
                value={saveForm.reportName}
                onChange={(e) => setSaveForm({...saveForm, reportName: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-accent/20 outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status Zapisu</label>
              <div className="flex gap-2 p-1 bg-slate-100 rounded-xl">
                <button 
                  onClick={() => setSaveForm({...saveForm, status: 'final'})}
                  className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${saveForm.status === 'final' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  Raport Końcowy
                </button>
                <button 
                  onClick={() => setSaveForm({...saveForm, status: 'draft'})}
                  className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${saveForm.status === 'draft' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  Wersja Robocza
                </button>
              </div>
            </div>
          </div>

          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-6">
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
              <User size={16} className="text-accent" /> Dane Klienta
            </h4>
            
            {recipientType === 'company' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nazwa Firmy</label>
                  <input 
                    type="text" 
                    value={saveForm.clientName}
                    onChange={(e) => setSaveForm({...saveForm, clientName: e.target.value})}
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-accent/20 outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Numer NIP</label>
                  <input 
                    type="text" 
                    value={saveForm.clientNip}
                    onChange={(e) => setSaveForm({...saveForm, clientNip: e.target.value})}
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-accent/20 outline-none"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Imię i Nazwisko</label>
                <input 
                  type="text" 
                  value={saveForm.clientFullName}
                  onChange={(e) => setSaveForm({...saveForm, clientFullName: e.target.value})}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-accent/20 outline-none"
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Dodatkowe Szczegóły / Notatki</label>
            <textarea 
              rows={3}
              value={saveForm.notes}
              onChange={(e) => setSaveForm({...saveForm, notes: e.target.value})}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-accent/20 outline-none resize-none"
              placeholder="Wprowadź dodatkowe informacje o projekcie..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button 
              onClick={() => setIsSaveModalOpen(false)}
              className="px-6 py-3 text-xs font-bold text-slate-500 hover:bg-slate-50 rounded-xl transition-all"
            >
              Anuluj
            </button>
            <button 
              onClick={() => {
                const newReport: Report = {
                  id: `REP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
                  name: saveForm.reportName || 'Nowa Symulacja',
                  client: recipientType === 'company' ? saveForm.clientName : saveForm.clientFullName,
                  nip: recipientType === 'company' ? saveForm.clientNip : saveForm.clientFullName,
                  date: new Date().toISOString().split('T')[0],
                  type: modelingGoal === 'arbitrage' ? 'Arbitraż' : modelingGoal === 'peak-shaving' ? 'Peak Shaving' : 'Backup',
                  customerType: recipientType,
                  companySize: recipientType === 'company' ? companySize : undefined,
                  savings: financialSummary.totalSavings5Y / 5,
                  status: saveForm.status === 'final' ? 'Zakończony' : 'Wersja Robocza',
                  roi: financialSummary.roi,
                  payback: financialSummary.paybackYears,
                  capacity: bessCapacity,
                  power: bessPower,
                  author: 'Jan Kowalski',
                  lcoe: financialSummary.lcoe,
                  npv: financialSummary.npv,
                  irr: financialSummary.irr,
                  peakReduction: financialSummary.peakReduction,
                  modelingGoal: modelingGoal
                };

                if (onSaveReport) {
                  onSaveReport(newReport);
                }

                addLog(`Zapisano raport: ${saveForm.reportName} jako ${saveForm.status === 'final' ? 'Raport Końcowy' : 'Wersja Robocza'}`);
                setIsSaveModalOpen(false);
                alert('Raport został pomyślnie zapisany w systemie i dodany do archiwum.');
              }}
              className="flex items-center gap-2 px-8 py-3 bg-accent text-white rounded-xl font-bold hover:bg-blue-600 transition-all shadow-lg shadow-blue-500/20"
            >
              <Save size={18} /> Potwierdź i Zapisz
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default BESSWizard;

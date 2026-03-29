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
  Factory,
  Play,
  Pause,
  Clock,
  LayoutGrid,
  Table as TableIcon,
  Eye,
  ArrowRight,
  TrendingDown,
  DollarSign,
  X
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
  AreaChart,
  Cell
} from 'recharts';

interface BESSWizardProps {
  modelingGoal: 'arbitrage' | 'peak-shaving' | 'backup';
  setModelingGoal: (goal: 'arbitrage' | 'peak-shaving' | 'backup') => void;
  onOpenAuditLogs?: () => void;
  onSaveReport?: (report: Report) => void;
  onNavigate?: (tab: string, subTab?: string) => void;
  forecastSettings: any;
  setForecastSettings: (settings: any) => void;
}

const BESSWizard: React.FC<BESSWizardProps> = ({ modelingGoal, setModelingGoal, onOpenAuditLogs, onSaveReport, onNavigate, forecastSettings, setForecastSettings }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [logs, setLogs] = useState<string[]>([]);
  const [showFullDay, setShowFullDay] = useState(false);
  const [isLogsModalOpen, setIsLogsModalOpen] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  
  // Forecast Edit State
  const [isForecastModalOpen, setIsForecastModalOpen] = useState(false);
  const [editingForecastType, setEditingForecastType] = useState<'distribution' | 'energy'>('distribution');
  const [tempForecastSettings, setTempForecastSettings] = useState(forecastSettings);

  useEffect(() => {
    if (isForecastModalOpen) {
      setTempForecastSettings(forecastSettings);
    }
  }, [isForecastModalOpen, forecastSettings]);
  
  // Chart Gallery State (Step 3)
  const [activeChartId, setActiveChartId] = useState('roi-degradation');
  const [showAllCharts, setShowAllCharts] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    let interval: any;
    if (isPlaying && !showAllCharts) {
      interval = setInterval(() => {
        const chartIds = ['roi-degradation', 'cashflow', 'lcoe-sensitivity', 'efficiency-curve'];
        const currentIndex = chartIds.indexOf(activeChartId);
        const nextIndex = (currentIndex + 1) % chartIds.length;
        setActiveChartId(chartIds[nextIndex]);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, activeChartId, showAllCharts]);

  const handleNextStep = () => {
    if (currentStep < 4) {
      setIsSimulating(true);
      setTimeout(() => {
        setCurrentStep(prev => prev + 1);
        setIsSimulating(false);
        addLog(`Przejście do Kroku ${currentStep + 1}`);
      }, 1500);
    } else {
      setIsSaveModalOpen(true);
    }
  };
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
  
  // PV Parameters
  const [pvPower, setPvPower] = useState(100); // kWp
  const [pvAzimuth, setPvAzimuth] = useState(180); // South
  const [pvTilt, setPvTilt] = useState(35); // degrees
  const [pvAnnualProduction, setPvAnnualProduction] = useState(100); // MWh
  const [pvCapex, setPvCapex] = useState(350000); // PLN
  
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

  // Scenario Results
  const [scenarios, setScenarios] = useState({
    baseline: { energyCost: 0, distributionCost: 0, total: 0, gridEnergy: 0 },
    pvOnly: { energyCost: 0, distributionCost: 0, total: 0, gridEnergy: 0, selfConsumption: 0, feedIn: 0 },
    pvBess: { energyCost: 0, distributionCost: 0, total: 0, gridEnergy: 0, selfConsumption: 0, feedIn: 0, peakReduction: 0 }
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
    if (currentStep === 3 || currentStep === 4) {
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
        const currentPvProduction = pvAnnualProduction * Math.pow(0.995, year - 1); // 0.5% degradation for PV
        
        // Simplified Arbitrage Profit (assuming 300 cycles/year, 80% DoD, spread from Step 2 or default)
        const baseSpread = analysisSummary.spread > 0 ? analysisSummary.spread : 250;
        const spread = baseSpread * priceMultiplier;
        
        const cyclesPerYear = 300;
        const bessSavings = currentCapacity * (spread / 1000) * efficiency * cyclesPerYear;
        
        // PV Savings (Self-consumption)
        // Assume 30% self-consumption for PV only, 60% for PV+BESS
        const pvOnlySelfConsumption = currentPvProduction * 0.3;
        const pvBessSelfConsumption = currentPvProduction * 0.6;
        
        const energyPrice = yearlyAvgPrice; // PLN/MWh
        const distributionPrice = 250 * priceMultiplier; // PLN/MWh
        
        const pvSavings = pvOnlySelfConsumption * (energyPrice + distributionPrice) / 1000;
        const extraBessSavings = (pvBessSelfConsumption - pvOnlySelfConsumption) * (energyPrice + distributionPrice) / 1000;
        
        const annualSavings = bessSavings + pvSavings + extraBessSavings;
        
        totalSavings += annualSavings;
        
        return {
          year: `Rok ${year}`,
          savings: Math.round(annualSavings),
          capacity: Math.round(currentCapacity),
          price: Math.round(yearlyAvgPrice)
        };
      });

      const totalCapex = (bessPower / 1000) * capexPerMW + pvCapex;
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

      // Calculate Scenarios for Step 4
      const energyPriceBase = 600; // PLN/MWh
      const distPriceBase = 250; // PLN/MWh
      
      const baselineEnergy = currentConsumption;
      const baselineCost = baselineEnergy * (energyPriceBase + distPriceBase);
      
      const pvOnlyGrid = Math.max(0, currentConsumption - pvAnnualProduction * 0.3);
      const pvOnlyCost = pvOnlyGrid * (energyPriceBase + distPriceBase);
      
      const pvBessGrid = Math.max(0, currentConsumption - pvAnnualProduction * 0.6);
      const pvBessCost = pvBessGrid * (energyPriceBase + distPriceBase);

      setScenarios({
        baseline: { 
          energyCost: baselineEnergy * energyPriceBase, 
          distributionCost: baselineEnergy * distPriceBase, 
          annualCost: baselineCost, 
          gridEnergy: baselineEnergy,
          annualSavings: 0,
          selfConsumptionRate: 0
        },
        pvOnly: { 
          energyCost: pvOnlyGrid * energyPriceBase, 
          distributionCost: pvOnlyGrid * distPriceBase, 
          annualCost: pvOnlyCost, 
          gridEnergy: pvOnlyGrid, 
          selfConsumptionRate: 30, 
          feedIn: 70,
          annualSavings: baselineCost - pvOnlyCost
        },
        pvBess: { 
          energyCost: pvBessGrid * energyPriceBase, 
          distributionCost: pvBessGrid * distPriceBase, 
          annualCost: pvBessCost, 
          gridEnergy: pvBessGrid, 
          selfConsumptionRate: 60, 
          feedIn: 40, 
          peakReduction: bessPower * 0.8,
          annualSavings: baselineCost - pvBessCost
        }
      });
    }
  }, [currentStep, bessCapacity, bessPower, degradationRate, efficiency, capexPerMW, opexPerYear, projectionModel, polyParams, seasonalParams, powerParams, analysisSummary.spread, pvAnnualProduction, pvCapex, currentConsumption]);

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
    <div className="relative mb-6">
      {/* Progress Line Background */}
      <div className="absolute top-3.5 left-0 w-full h-0.5 bg-slate-100 -z-10" />
      {/* Active Progress Line */}
      <motion.div 
        className="absolute top-3.5 left-0 h-0.5 bg-accent -z-10 origin-left"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: (currentStep - 1) / (steps.length - 1) }}
        transition={{ duration: 0.5, ease: "circOut" }}
      />
      
      <div className="flex justify-between">
        {steps.map((step, index) => {
          const isCompleted = currentStep > step.id;
          const isActive = currentStep === step.id;
          
          return (
            <div key={step.id} className="flex flex-col items-center gap-2">
              <motion.div 
                className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black transition-all border-2 ${
                  isActive 
                    ? 'bg-white border-accent text-accent shadow-lg shadow-blue-500/20 scale-110' 
                    : isCompleted 
                      ? 'bg-accent border-accent text-white' 
                      : 'bg-white border-slate-100 text-slate-300'
                }`}
                animate={isActive ? { scale: 1.1 } : { scale: 1 }}
              >
                {isCompleted ? <CheckCircle2 size={14} /> : step.id}
              </motion.div>
              <span className={`text-[8px] font-black uppercase tracking-widest transition-colors ${
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

  const SidebarConfig = () => (
    <div className="space-y-2 mb-4">
      {/* Modeling Goal */}
      <div className="flex items-center justify-between p-1.5 bg-slate-50 rounded-xl border border-slate-100">
        <div className="flex items-center gap-2 px-2">
          <div className="w-7 h-7 bg-slate-900 rounded-lg flex items-center justify-center text-white shrink-0">
            {modelingGoal === 'arbitrage' && <Zap size={14} />}
            {modelingGoal === 'peak-shaving' && <TrendingUp size={14} />}
            {modelingGoal === 'backup' && <ShieldCheck size={14} />}
          </div>
          <div>
            <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest leading-tight">Cel modelowania</p>
            <p className="text-[9px] font-bold text-slate-900 leading-none">
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
              className={`px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${
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

      {/* Distribution Dynamics */}
      <div className="flex items-center justify-between p-1.5 bg-slate-50 rounded-xl border border-slate-100">
        <div className="flex items-center gap-2 px-2">
          <div className="w-7 h-7 bg-blue-500 rounded-lg flex items-center justify-center text-white shrink-0">
            <TrendingUp size={14} />
          </div>
          <div>
            <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest leading-tight">Dynamika Kosztów Dystrybucji</p>
            <p className="text-[9px] font-bold text-slate-900 leading-none">
              {forecastSettings.distributionGrowthType === 'linear' 
                ? `Liniowy ${forecastSettings.linearGrowthRate}%` 
                : 'Nieliniowy (Indywidualny)'}
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            setEditingForecastType('distribution');
            setIsForecastModalOpen(true);
          }}
          className="px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest bg-white text-accent shadow-sm border border-slate-200 hover:bg-slate-50 transition-all"
        >
          Zmień
        </button>
      </div>

      {/* Energy Price Forecast */}
      <div className="flex items-center justify-between p-1.5 bg-slate-50 rounded-xl border border-slate-100">
        <div className="flex items-center gap-2 px-2">
          <div className="w-7 h-7 bg-emerald-500 rounded-lg flex items-center justify-center text-white shrink-0">
            <Zap size={14} />
          </div>
          <div>
            <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest leading-tight">Dynamika Cen Energii</p>
            <p className="text-[9px] font-bold text-slate-900 leading-none">
              {forecastSettings.energyPriceGrowthType === 'linear' 
                ? `Liniowy ${forecastSettings.energyPriceGrowthRate}%` 
                : 'Nieliniowy (Indywidualny)'}
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            setEditingForecastType('energy');
            setIsForecastModalOpen(true);
          }}
          className="px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest bg-white text-accent shadow-sm border border-slate-200 hover:bg-slate-50 transition-all"
        >
          Zmień
        </button>
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

    const scenarioData = [
      { name: 'Baseline', koszt: Math.round(scenarios.baseline.annualCost / 1000), color: '#94a3b8' },
      { name: 'PV Only', koszt: Math.round(scenarios.pvOnly.annualCost / 1000), color: '#fbbf24' },
      { name: 'PV + BESS', koszt: Math.round(scenarios.pvBess.annualCost / 1000), color: '#3b82f6' },
    ];

    return (
      <div className="space-y-8">
        {/* Executive Summary Section */}
        <div className="bg-slate-900 p-8 rounded-3xl text-white relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-accent mb-6">Executive Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Roczne Oszczędności</p>
                <p className="text-3xl font-black text-white">{formatNumber(financialSummary.totalSavings5Y / 5, 'PLN')}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Okres Zwrotu (SPBT)</p>
                <p className="text-3xl font-black text-white">{financialSummary.paybackYears} lat</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">NPV (10 lat)</p>
                <p className="text-3xl font-black text-emerald-400">{formatNumber(financialSummary.npv, 'PLN')}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Rekomendacja</p>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="text-emerald-400" size={24} />
                  <span className="text-xl font-black text-white uppercase">Inwestuj</span>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute right-0 top-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl -mr-20 -mt-20" />
        </div>

        {/* Scenario Comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Porównanie Scenariuszy (Koszty Roczne w tys. PLN)</h4>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={scenarioData} layout="vertical" margin={{ left: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 700, fill: '#1e293b' }} />
                  <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="koszt" radius={[0, 4, 4, 0]}>
                    {scenarioData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Kluczowe Metryki Scenariuszy</h4>
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Autokonsumpcja (PV+BESS)</p>
                <div className="flex items-end justify-between">
                  <span className="text-2xl font-black text-slate-900">{scenarios.pvBess.selfConsumptionRate}%</span>
                  <span className="text-[10px] font-bold text-emerald-600">+{scenarios.pvBess.selfConsumptionRate - scenarios.pvOnly.selfConsumptionRate}% vs PV Only</span>
                </div>
                <div className="w-full h-1.5 bg-slate-200 rounded-full mt-2 overflow-hidden">
                  <div className="h-full bg-accent" style={{ width: `${scenarios.pvBess.selfConsumptionRate}%` }} />
                </div>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Redukcja Energii z Sieci</p>
                <div className="flex items-end justify-between">
                  <span className="text-2xl font-black text-slate-900">{Math.round((1 - scenarios.pvBess.gridEnergy / scenarios.baseline.gridEnergy) * 100)}%</span>
                  <span className="text-[10px] font-bold text-slate-400">Oszczędność {formatNumber(scenarios.baseline.gridEnergy - scenarios.pvBess.gridEnergy, 'MWh')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Szczegóły Finansowe (5 lat)</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">ROI</span>
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
                      <th className="px-3 py-2">Scenariusz</th>
                      <th className="px-3 py-2 text-right">Energia (MWh)</th>
                      <th className="px-3 py-2 text-right">Koszt Roczny</th>
                      <th className="px-3 py-2 text-right text-emerald-600">Oszczędność</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    <tr>
                      <td className="px-3 py-2 font-bold text-slate-900">Baseline</td>
                      <td className="px-3 py-2 text-right text-slate-500">{formatNumber(scenarios.baseline.gridEnergy)}</td>
                      <td className="px-3 py-2 text-right text-slate-500">{formatNumber(scenarios.baseline.annualCost, 'PLN')}</td>
                      <td className="px-3 py-2 text-right text-emerald-600 font-black">-</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2 font-bold text-slate-900">PV Only</td>
                      <td className="px-3 py-2 text-right text-slate-500">{formatNumber(scenarios.pvOnly.gridEnergy)}</td>
                      <td className="px-3 py-2 text-right text-slate-500">{formatNumber(scenarios.pvOnly.annualCost, 'PLN')}</td>
                      <td className="px-3 py-2 text-right text-emerald-600 font-black">-{formatNumber(scenarios.baseline.annualCost - scenarios.pvOnly.annualCost, 'PLN')}</td>
                    </tr>
                    <tr className="bg-blue-50/50">
                      <td className="px-3 py-2 font-bold text-accent">PV + BESS</td>
                      <td className="px-3 py-2 text-right text-accent">{formatNumber(scenarios.pvBess.gridEnergy)}</td>
                      <td className="px-3 py-2 text-right text-accent font-black">{formatNumber(scenarios.pvBess.annualCost, 'PLN')}</td>
                      <td className="px-3 py-2 text-right text-emerald-600 font-black">-{formatNumber(scenarios.baseline.annualCost - scenarios.pvBess.annualCost, 'PLN')}</td>
                    </tr>
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
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                  <p className="text-xs font-bold text-emerald-800 mb-2 uppercase tracking-widest">Rekomendacja BESS</p>
                  <p className="text-sm text-emerald-700 leading-relaxed">
                    Zastosowanie magazynu energii o pojemności {bessCapacity} kWh pozwoli na zwiększenie autokonsumpcji o {scenarios.pvBess.selfConsumption - scenarios.pvOnly.selfConsumption} punktów procentowych, co przekłada się na dodatkowe {formatNumber((scenarios.pvOnly.total - scenarios.pvBess.total), 'PLN')} oszczędności rocznie.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Założenia Analizy</h4>
              <div className="space-y-3">
                <div className="flex justify-between text-[10px] border-b border-slate-50 pb-2">
                  <span className="text-slate-400 font-bold uppercase">Moc PV</span>
                  <span className="text-slate-900 font-black">{formatNumber(pvPower, 'kWp')}</span>
                </div>
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
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Projekcja Oszczędności Skumulowanych (10 lat)</h4>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={roiData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} unit=" PLN" />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Legend verticalAlign="top" height={36} />
                <Line type="monotone" dataKey="savings" name="Oszczędności Roczne" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="cumulative" name="Skumulowane" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sensitivity Analysis Table */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Analiza Wrażliwości NPV (zmiana cen energii vs CAPEX)</h4>
          <div className="overflow-x-auto rounded-xl border border-slate-100">
            <table className="w-full text-[10px] text-center">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase">
                <tr>
                  <th className="px-3 py-2 text-left">Zmiana CAPEX / Cena</th>
                  <th className="px-3 py-2">-20% Ceny</th>
                  <th className="px-3 py-2">-10% Ceny</th>
                  <th className="px-3 py-2">Bazowa</th>
                  <th className="px-3 py-2">+10% Ceny</th>
                  <th className="px-3 py-2">+20% Ceny</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {[
                  { label: '-10% CAPEX', values: [0.8, 0.9, 1.1, 1.3, 1.5] },
                  { label: 'Bazowy CAPEX', values: [0.7, 0.85, 1.0, 1.2, 1.4] },
                  { label: '+10% CAPEX', values: [0.6, 0.75, 0.9, 1.1, 1.3] }
                ].map((row, i) => (
                  <tr key={i}>
                    <td className="px-3 py-2 text-left font-bold text-slate-700 bg-slate-50/30">{row.label}</td>
                    {row.values.map((v, j) => (
                      <td key={j} className={`px-3 py-2 font-medium ${v >= 1 ? 'text-emerald-600' : 'text-red-500'}`}>
                        {formatNumber(financialSummary.npv * v, 'PLN')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-[9px] text-slate-400 mt-2 italic">
            * Wartości NPV wyliczone przy stopie dyskontowej 8%. Kolor zielony oznacza NPV powyżej scenariusza bazowego.
          </p>
        </div>
      </div>
    );
  };

  const renderStep3 = () => (
    <div className="space-y-8">
      {/* Technical Specs Header */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Technologia', value: 'LFP (LiFePO4)', icon: Battery },
          { label: 'Sprawność (RTE)', value: '92%', icon: Zap },
          { label: 'Głębokość Rozł.', value: '90% DoD', icon: TrendingDown },
          { label: 'Żywotność', value: '6000 cykli', icon: Clock },
        ].map((spec, i) => (
          <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-accent shadow-sm">
              <spec.icon size={16} />
            </div>
            <div>
              <p className="text-[9px] font-bold text-slate-400 uppercase">{spec.label}</p>
              <p className="text-xs font-black text-slate-900">{spec.value}</p>
            </div>
          </div>
        ))}
      </div>

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

      {/* Chart Gallery Section */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex flex-col lg:flex-row min-h-[500px]">
          {/* Sidebar Menu */}
          <div className="w-full lg:w-64 bg-slate-50 border-r border-slate-100 p-6 flex flex-col gap-2">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Analizy Wykresowe</h4>
            {[
              { id: 'roi-degradation', label: 'ROI i Degradacja', icon: BarChart3 },
              { id: 'cashflow', label: 'Przepływy Pieniężne', icon: TrendingUp },
              { id: 'lcoe-sensitivity', label: 'Wrażliwość LCOE', icon: Settings },
              { id: 'efficiency-curve', label: 'Krzywa Sprawności', icon: Zap }
            ].map((chart) => (
              <button
                key={chart.id}
                onClick={() => {
                  setActiveChartId(chart.id);
                  setShowAllCharts(false);
                }}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                  activeChartId === chart.id && !showAllCharts
                    ? 'bg-white text-accent shadow-sm border border-slate-200'
                    : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                <chart.icon size={16} />
                {chart.label}
              </button>
            ))}
            <div className="mt-auto pt-6 border-t border-slate-200">
              <button
                onClick={() => setShowAllCharts(!showAllCharts)}
                className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  showAllCharts
                    ? 'bg-slate-900 text-white shadow-lg'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {showAllCharts ? 'Ukryj Wszystkie' : 'Pokaż Wszystkie'}
              </button>
            </div>
          </div>

          {/* Main Chart Area */}
          <div className="flex-1 p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex gap-2">
                <button 
                  onClick={() => setIsPlaying(!isPlaying)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    isPlaying ? 'bg-accent text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                  {isPlaying ? 'Zatrzymaj Prezentację' : 'Tryb Prezentacji'}
                </button>
              </div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {showAllCharts ? 'Widok Zbiorczy' : `Wykres ${['roi-degradation', 'cashflow', 'lcoe-sensitivity', 'efficiency-curve'].indexOf(activeChartId) + 1} / 4`}
              </div>
            </div>

            <AnimatePresence mode="wait">
              {showAllCharts ? (
                <motion.div 
                  key="all-charts"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-8"
                >
                  <div className="h-[250px] bg-slate-50 rounded-2xl p-4 border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-4">ROI i Degradacja</p>
                    {renderActiveChart('roi-degradation')}
                  </div>
                  <div className="h-[250px] bg-slate-50 rounded-2xl p-4 border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-4">Przepływy Pieniężne</p>
                    {renderActiveChart('cashflow')}
                  </div>
                  <div className="h-[250px] bg-slate-50 rounded-2xl p-4 border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-4">Wrażliwość LCOE</p>
                    {renderActiveChart('lcoe-sensitivity')}
                  </div>
                  <div className="h-[250px] bg-slate-50 rounded-2xl p-4 border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-4">Krzywa Sprawności</p>
                    {renderActiveChart('efficiency-curve')}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key={activeChartId}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="h-full flex flex-col"
                >
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h4 className="text-lg font-black text-slate-900 uppercase tracking-tight">
                        {activeChartId === 'roi-degradation' && 'Projekcja ROI i Degradacja SOH'}
                        {activeChartId === 'cashflow' && 'Roczne Przepływy Pieniężne (Cash Flow)'}
                        {activeChartId === 'lcoe-sensitivity' && 'Analiza Wrażliwości LCOE'}
                        {activeChartId === 'efficiency-curve' && 'Krzywa Sprawności Systemu BESS'}
                      </h4>
                      <p className="text-xs text-slate-500">Szczegółowa analiza parametrów techniczno-ekonomicznych w czasie.</p>
                    </div>
                  </div>
                  <div className="flex-1 min-h-[350px]">
                    {renderActiveChart(activeChartId)}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );

  function renderActiveChart(id: string) {
    switch (id) {
      case 'roi-degradation':
        return (
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
        );
      case 'cashflow':
        const cashflowData = roiData.map((d, i) => ({
          ...d,
          net: d.savings - (i === 0 ? financialSummary.totalCosts : opexPerYear)
        }));
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={cashflowData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} unit=" PLN" />
              <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
              <Bar dataKey="net" name="Przepływ Netto" radius={[4, 4, 0, 0]}>
                {cashflowData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.net > 0 ? '#10b981' : '#ef4444'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        );
      case 'lcoe-sensitivity':
        const sensitivityData = [
          { name: '-20%', value: financialSummary.lcoe * 0.85 },
          { name: '-10%', value: financialSummary.lcoe * 0.92 },
          { name: 'Bazowy', value: financialSummary.lcoe },
          { name: '+10%', value: financialSummary.lcoe * 1.08 },
          { name: '+20%', value: financialSummary.lcoe * 1.15 },
        ];
        return (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sensitivityData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} unit=" PLN" />
              <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
              <Area type="monotone" dataKey="value" name="LCOE" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} />
            </AreaChart>
          </ResponsiveContainer>
        );
      case 'efficiency-curve':
        const curveData = Array.from({ length: 11 }, (_, i) => {
          const load = i * 10;
          return {
            load: `${load}%`,
            eff: load === 0 ? 0 : 85 + Math.sin(load / 100 * Math.PI) * 10 - (load > 80 ? (load - 80) * 0.5 : 0)
          };
        });
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={curveData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="load" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} unit="%" domain={[0, 100]} />
              <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
              <Line type="monotone" dataKey="eff" name="Sprawność" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        );
      default:
        return null;
    }
  }

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

      {/* Price Volatility Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Zmienność Cen (Volatility Index)</h4>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={tgeData.map(d => ({ ...d, volatility: Math.abs(d.price2024 - analysisSummary.avgPrice) }))}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} unit=" PLN" />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                <Area type="monotone" dataKey="volatility" name="Odchylenie od średniej" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.1} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-slate-900 p-6 rounded-2xl text-white flex flex-col justify-center">
          <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Potencjał Arbitrażu</p>
          <p className="text-3xl font-black text-accent mb-4">Wysoki</p>
          <p className="text-[10px] text-slate-400 leading-relaxed">
            Analiza zmienności wskazuje na liczne okna cenowe o rozpiętości powyżej {formatNumber(analysisSummary.spread * 0.7, 'PLN')}, co jest optymalne dla systemów BESS o cyklu 1-2 ładowań na dobę.
          </p>
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
      {/* JSON Import Button */}
      <div className="flex justify-end">
        <button 
          onClick={() => {
            const jsonInput = prompt('Wklej dane JSON analizy:');
            if (jsonInput) {
              try {
                const data = JSON.parse(jsonInput);
                if (data.customer) {
                  setRecipientType('company');
                  setCompanySize(data.customer.size || 'medium');
                  setCustomConsumption(data.customer.consumption_mwh || 500);
                  setIsCustomConsumption(true);
                  setSaveForm(prev => ({ ...prev, clientName: data.customer.name || '', clientNip: data.customer.nip || '' }));
                }
                if (data.pv) {
                  setPvPower(data.pv.power_kwp || 100);
                  setPvAnnualProduction(data.pv.annual_production_mwh || 100);
                  setPvCapex(data.pv.capex || 350000);
                }
                if (data.bess) {
                  setBessCapacity(data.bess.capacity_kwh || 1000);
                  setBessPower(data.bess.power_kw || 500);
                  setCapexPerMW(data.bess.capex_per_mw || 1500000);
                }
                addLog('Pomyślnie zaimportowano dane z JSON');
              } catch (e) {
                alert('Błąd parsowania JSON. Upewnij się, że format jest poprawny.');
              }
            }
          }}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg"
        >
          <Upload size={14} /> Importuj dane JSON
        </button>
      </div>

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

      {/* Parametry Instalacji PV */}
      <div className="space-y-4">
        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Parametry Instalacji PV</label>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <p className="text-[8px] font-bold text-slate-400 uppercase mb-1">Moc (kWp)</p>
            <input 
              type="number"
              value={pvPower}
              onChange={(e) => setPvPower(Number(e.target.value))}
              className="w-full bg-transparent font-black text-lg text-slate-900 focus:outline-none"
            />
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <p className="text-[8px] font-bold text-slate-400 uppercase mb-1">Azymut (°)</p>
            <input 
              type="number"
              value={pvAzimuth}
              onChange={(e) => setPvAzimuth(Number(e.target.value))}
              className="w-full bg-transparent font-black text-lg text-slate-900 focus:outline-none"
            />
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <p className="text-[8px] font-bold text-slate-400 uppercase mb-1">Nachylenie (°)</p>
            <input 
              type="number"
              value={pvTilt}
              onChange={(e) => setPvTilt(Number(e.target.value))}
              className="w-full bg-transparent font-black text-lg text-slate-900 focus:outline-none"
            />
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <p className="text-[8px] font-bold text-slate-400 uppercase mb-1">Prod. Roczna (MWh)</p>
            <input 
              type="number"
              value={pvAnnualProduction}
              onChange={(e) => setPvAnnualProduction(Number(e.target.value))}
              className="w-full bg-transparent font-black text-lg text-slate-900 focus:outline-none"
            />
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
      {/* Simulation Overlay */}
      <AnimatePresence>
        {isSimulating && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-6"
          >
            <div className="max-w-md w-full bg-white rounded-3xl p-8 text-center space-y-6 shadow-2xl">
              <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto relative">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 border-4 border-accent border-t-transparent rounded-full"
                />
                <Zap className="text-accent" size={32} />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Przetwarzanie Danych</h3>
                <p className="text-sm text-slate-500 mt-2">Silnik obliczeniowy analizuje tysiące punktów danych dla optymalnego doboru BESS...</p>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 1.5 }}
                  className="h-full bg-accent"
                />
              </div>
              <div className="flex justify-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <span>Monte Carlo</span>
                <span>•</span>
                <span>LCOE Analysis</span>
                <span>•</span>
                <span>Degradation Model</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-4">
        {/* Top Section: Stepper/Goal + Logs */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <div className="space-y-4">
            <Stepper />
            <SidebarConfig />
          </div>
          <div>
            <TerminalLog 
              logs={logs} 
              onOpenFullLogs={onOpenAuditLogs} 
              onExpand={() => setIsLogsModalOpen(true)}
            />
          </div>
        </div>

          {/* Horizontal Selection Summary */}
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap items-center gap-4 p-3 bg-white rounded-xl border border-slate-100 shadow-sm mb-4"
          >
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400">
                <Building2 size={14} />
              </div>
              <div>
                <p className="text-[7px] font-bold text-slate-400 uppercase tracking-widest">Odbiorca</p>
                <p className="text-[9px] font-black text-slate-900 uppercase">
                  {recipientType === 'company' ? `Firma (${companySize})` : recipientType === 'individual' ? 'Indywidualny' : 'Mieszany'}
                </p>
              </div>
            </div>
            <div className="w-px h-6 bg-slate-100 hidden md:block" />
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400">
                <Zap size={14} />
              </div>
              <div>
                <p className="text-[7px] font-bold text-slate-400 uppercase tracking-widest">Profil</p>
                <p className="text-[9px] font-black text-slate-900 uppercase">
                  {selectedProfile === 'linear' ? 'Liniowy' : selectedProfile === 'standard' ? `Taryfa ${selectedTariff}` : 'Indywidualny'}
                </p>
              </div>
            </div>
            <div className="w-px h-6 bg-slate-100 hidden md:block" />
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400">
                <Battery size={14} />
              </div>
              <div>
                <p className="text-[7px] font-bold text-slate-400 uppercase tracking-widest">Zużycie</p>
                <p className="text-[9px] font-black text-slate-900">{formatNumber(currentConsumption)} MWh/rok</p>
              </div>
            </div>
            
            <div className="w-px h-6 bg-slate-100 hidden md:block" />
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center text-accent">
                <Zap size={14} />
              </div>
              <div>
                <p className="text-[7px] font-bold text-slate-400 uppercase tracking-widest">Moc BESS</p>
                <p className="text-[9px] font-black text-accent">{formatNumber(bessPower, 'kW')}</p>
              </div>
            </div>
            <div className="w-px h-6 bg-slate-100 hidden md:block" />
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center text-accent">
                <Battery size={14} />
              </div>
              <div>
                <p className="text-[7px] font-bold text-slate-400 uppercase tracking-widest">Pojemność</p>
                <p className="text-[9px] font-black text-accent">{formatNumber(bessCapacity, 'kWh')}</p>
              </div>
            </div>
          </motion.div>
          
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
                onClick={handleNextStep}
                className="flex items-center gap-2 px-8 py-3 bg-accent text-white rounded-xl font-bold hover:bg-blue-600 transition-all shadow-lg shadow-blue-500/20 group"
              >
                {currentStep === 4 ? 'Zakończ i Zapisz' : 'Dalej'} <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </Card>
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
                  modelingGoal: modelingGoal,
                  pvPower: pvPower,
                  pvAnnualProduction: pvAnnualProduction,
                  scenarios: scenarios
                };

                if (onSaveReport) {
                  onSaveReport(newReport);
                }

                addLog(`Zapisano raport: ${saveForm.reportName} jako ${saveForm.status === 'final' ? 'Raport Końcowy' : 'Wersja Robocza'}`);
                setIsSaveModalOpen(false);
                setIsSuccessModalOpen(true);
              }}
              className="flex items-center gap-2 px-8 py-3 bg-accent text-white rounded-xl font-bold hover:bg-blue-600 transition-all shadow-lg shadow-blue-500/20"
            >
              <Save size={18} /> Potwierdź i Zapisz
            </button>
          </div>
        </div>
      </Modal>

      <Modal 
        isOpen={isSuccessModalOpen} 
        onClose={() => {
          setIsSuccessModalOpen(false);
          if (onNavigate) onNavigate('bess', 'bess-reports');
        }} 
        title="Raport Zapisany Pomyślnie"
      >
        <div className="flex flex-col items-center text-center p-8 space-y-6">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shadow-xl shadow-emerald-500/10">
            <CheckCircle2 size={40} />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-black text-slate-900 uppercase">Analiza Zakończona</h3>
            <p className="text-sm text-slate-500 leading-relaxed max-w-xs">
              Twój raport został wygenerowany i zapisany w archiwum. Możesz go teraz przejrzeć w module raportowym.
            </p>
          </div>
          <button 
            onClick={() => {
              setIsSuccessModalOpen(false);
              if (onNavigate) onNavigate('bess', 'bess-reports');
            }}
            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10"
          >
            Przejdź do Raportów
          </button>
        </div>
      </Modal>
      {/* Forecast Edit Modal */}
      <AnimatePresence>
        {isForecastModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-[32px] shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden"
            >
              <div className="p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white ${editingForecastType === 'distribution' ? 'bg-blue-500' : 'bg-emerald-500'}`}>
                      {editingForecastType === 'distribution' ? <TrendingUp size={24} /> : <Zap size={24} />}
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-900 tracking-tight">
                        {editingForecastType === 'distribution' ? 'Dynamika Kosztów Dystrybucji' : 'Dynamika Cen Energii'}
                      </h3>
                      <p className="text-slate-500 text-sm">Skonfiguruj parametry prognozy wzrostu</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsForecastModalOpen(false)}
                    className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Model Wzrostu</label>
                    <div className="flex gap-2 p-1 bg-slate-100 rounded-xl w-fit">
                      <button 
                        onClick={() => {
                          if (editingForecastType === 'distribution') {
                            setTempForecastSettings({...tempForecastSettings, distributionGrowthType: 'linear'});
                          } else {
                            setTempForecastSettings({...tempForecastSettings, energyPriceGrowthType: 'linear'});
                          }
                        }}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                          (editingForecastType === 'distribution' ? tempForecastSettings.distributionGrowthType : tempForecastSettings.energyPriceGrowthType) === 'linear' 
                            ? 'bg-white text-slate-900 shadow-sm' 
                            : 'text-slate-500'
                        }`}
                      >
                        Liniowy (%)
                      </button>
                      <button 
                        onClick={() => {
                          if (editingForecastType === 'distribution') {
                            setTempForecastSettings({...tempForecastSettings, distributionGrowthType: 'nonlinear'});
                          } else {
                            setTempForecastSettings({...tempForecastSettings, energyPriceGrowthType: 'nonlinear'});
                          }
                        }}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                          (editingForecastType === 'distribution' ? tempForecastSettings.distributionGrowthType : tempForecastSettings.energyPriceGrowthType) === 'nonlinear' 
                            ? 'bg-white text-slate-900 shadow-sm' 
                            : 'text-slate-500'
                        }`}
                      >
                        Nieliniowy (Indywidualny)
                      </button>
                    </div>
                  </div>

                  {(editingForecastType === 'distribution' ? tempForecastSettings.distributionGrowthType : tempForecastSettings.energyPriceGrowthType) === 'linear' ? (
                    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
                        Średni roczny wzrost (%)
                      </label>
                      <div className="flex items-center gap-4">
                        <input 
                          type="range" 
                          min="-10" 
                          max="30" 
                          step="0.5"
                          value={editingForecastType === 'distribution' ? tempForecastSettings.linearGrowthRate : tempForecastSettings.energyPriceGrowthRate}
                          onChange={(e) => {
                            if (editingForecastType === 'distribution') {
                              setTempForecastSettings({...tempForecastSettings, linearGrowthRate: Number(e.target.value)});
                            } else {
                              setTempForecastSettings({...tempForecastSettings, energyPriceGrowthRate: Number(e.target.value)});
                            }
                          }}
                          className={`flex-1 accent-${editingForecastType === 'distribution' ? 'blue' : 'emerald'}-500`}
                        />
                        <span className="text-lg font-black text-slate-900 w-16 text-right">
                          {editingForecastType === 'distribution' ? tempForecastSettings.linearGrowthRate : tempForecastSettings.energyPriceGrowthRate}%
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                        Wzrost w kolejnych latach (%)
                      </label>
                      <div className="grid grid-cols-5 gap-2">
                        {(editingForecastType === 'distribution' ? tempForecastSettings.nonlinearGrowthRates : tempForecastSettings.energyPriceNonlinearRates).map((rate: number, i: number) => (
                          <div key={i}>
                            <label className="text-[8px] font-bold text-slate-400 block mb-1 text-center">Rok {i+1}</label>
                            <input 
                              type="number"
                              value={rate}
                              onChange={(e) => {
                                if (editingForecastType === 'distribution') {
                                  const newRates = [...tempForecastSettings.nonlinearGrowthRates];
                                  newRates[i] = Number(e.target.value);
                                  setTempForecastSettings({...tempForecastSettings, nonlinearGrowthRates: newRates});
                                } else {
                                  const newRates = [...tempForecastSettings.energyPriceNonlinearRates];
                                  newRates[i] = Number(e.target.value);
                                  setTempForecastSettings({...tempForecastSettings, energyPriceNonlinearRates: newRates});
                                }
                              }}
                              className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-[10px] font-bold text-center outline-none focus:ring-2 focus:ring-accent/20"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setIsForecastModalOpen(false)}
                    className="flex-1 px-6 py-4 rounded-2xl text-sm font-black uppercase tracking-widest text-slate-500 bg-slate-100 hover:bg-slate-200 transition-all"
                  >
                    Anuluj
                  </button>
                  <button
                    onClick={() => {
                      setForecastSettings(tempForecastSettings);
                      setIsForecastModalOpen(false);
                      addLog(`Zaktualizowano parametry: ${editingForecastType === 'distribution' ? 'Dynamika Kosztów Dystrybucji' : 'Dynamika Cen Energii'}`);
                    }}
                    className={`flex-1 px-6 py-4 rounded-2xl text-sm font-black uppercase tracking-widest text-white shadow-lg transition-all ${
                      editingForecastType === 'distribution' ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-200' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200'
                    }`}
                  >
                    Zapisz i zaktualizuj
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BESSWizard;

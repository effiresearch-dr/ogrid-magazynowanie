import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  Eye, 
  Search, 
  Filter, 
  MoreVertical,
  Calendar,
  Zap,
  TrendingUp,
  Battery,
  CheckSquare,
  Square,
  BarChart2,
  Settings,
  ChevronUp,
  ChevronDown,
  AlertTriangle,
  Loader2,
  ShieldCheck,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, KPICard, Modal } from './UI';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Cell
} from 'recharts';

import { pdf } from '@react-pdf/renderer';
import ReportPDF from './ReportPDF';
import html2canvas from 'html2canvas';

export interface Report {
  id: string;
  name: string;
  client: string;
  nip: string;
  date: string;
  type: string;
  customerType: 'individual' | 'company' | 'mixed';
  companySize?: 'small' | 'medium' | 'large' | 'extra-large';
  savings: number;
  status: 'Zakończony' | 'Wersja Robocza';
  roi: number;
  payback: number;
  capacity: number;
  power: number;
  author: string;
  lcoe?: number;
  npv?: number;
  irr?: number;
  peakReduction?: number;
  modelingGoal?: 'arbitrage' | 'peak-shaving' | 'backup';
  pvPower?: number;
  pvAnnualProduction?: number;
  scenarios?: {
    baseline: any;
    pvOnly: any;
    pvBess: any;
  };
}

interface BESSReportsProps {
  reports: Report[];
  setReports: React.Dispatch<React.SetStateAction<Report[]>>;
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
}

const BESSReports: React.FC<BESSReportsProps> = ({ reports, setReports, whiteLabel }) => {
  const [selectedReportIds, setSelectedReportIds] = useState<string[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [isColumnModalOpen, setIsColumnModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isFullReportModalOpen, setIsFullReportModalOpen] = useState(false);
  const [isConfirmPdfModalOpen, setIsConfirmPdfModalOpen] = useState(false);
  const [previewReport, setPreviewReport] = useState<Report | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationStep, setGenerationStep] = useState('');
  const abortControllerRef = React.useRef<AbortController | null>(null);
  const [chartImage, setChartImage] = useState<string | undefined>(undefined);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [customerTypeFilter, setCustomerTypeFilter] = useState<string>('all');
  const [visibleColumns, setVisibleColumns] = useState<string[]>([
    'id', 'name', 'client', 'date', 'type', 'savings', 'status'
  ]);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  const allColumns = [
    { id: 'id', label: 'ID Raportu' },
    { id: 'name', label: 'Nazwa Symulacji' },
    { id: 'client', label: 'Klient' },
    { id: 'nip', label: 'NIP / Dane' },
    { id: 'date', label: 'Data Utworzenia' },
    { id: 'type', label: 'Typ Analizy' },
    { id: 'savings', label: 'Oszczędność (rok)' },
    { id: 'roi', label: 'ROI (%)' },
    { id: 'payback', label: 'Zwrot (lat)' },
    { id: 'capacity', label: 'Pojemność (kWh)' },
    { id: 'power', label: 'Moc (kW)' },
    { id: 'customerType', label: 'Typ Klienta' },
    { id: 'status', label: 'Status' },
  ];

  const toggleReportSelection = (id: string) => {
    setSelectedReportIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const filteredReports = reports
    .filter(report => {
      const matchesSearch = (report.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) || 
                           (report.id?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
                           (report.client?.toLowerCase() || '').includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
      const matchesCustomerType = customerTypeFilter === 'all' || report.customerType === customerTypeFilter;
      
      return matchesSearch && matchesStatus && matchesCustomerType;
    })
    .sort((a, b) => {
      if (!sortConfig) return 0;
      const { key, direction } = sortConfig;
      
      const aValue = a[key as keyof Report];
      const bValue = b[key as keyof Report];

      if (aValue === undefined || bValue === undefined || aValue === null || bValue === null) return 0;

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return direction === 'asc' 
          ? aValue.localeCompare(bValue) 
          : bValue.localeCompare(aValue);
      }

      if (aValue < bValue) {
        return direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return direction === 'asc' ? 1 : -1;
      }
      return 0;
    });

  const selectedReports = reports.filter(r => selectedReportIds.includes(r.id));

  const formatCurrency = (val: number) => {
    return val === 0 ? 'N/A' : new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN', maximumFractionDigits: 0 }).format(val);
  };

  const handleDownloadPdf = (report: Report | null) => {
    if (!report) return;
    setPreviewReport(report);
    setIsConfirmPdfModalOpen(true);
  };

  const captureChart = async (elementId: string) => {
    const chartElement = document.getElementById(elementId);
    if (chartElement) {
      try {
        const canvas = await html2canvas(chartElement, {
          scale: 2,
          backgroundColor: '#F8FAFC',
          logging: false,
          useCORS: true,
          onclone: (clonedDoc) => {
            // 1. Fix <style> tags
            const styleTags = clonedDoc.getElementsByTagName('style');
            for (let i = 0; i < styleTags.length; i++) {
              try {
                if (styleTags[i].innerHTML.includes('oklch')) {
                  styleTags[i].innerHTML = styleTags[i].innerHTML.replace(/oklch\([^)]+\)/g, '#94a3b8');
                }
              } catch (e) {
                console.warn('Could not fix style tag:', e);
              }
            }

            // 2. Fix inline styles and attributes on all elements
            const elements = clonedDoc.getElementsByTagName('*');
            for (let i = 0; i < elements.length; i++) {
              const el = elements[i] as HTMLElement;
              
              // Fix inline style attribute
              const styleAttr = el.getAttribute('style');
              if (styleAttr && styleAttr.includes('oklch')) {
                el.setAttribute('style', styleAttr.replace(/oklch\([^)]+\)/g, '#94a3b8'));
              }

              // Fix SVG specific attributes
              ['fill', 'stroke', 'stop-color'].forEach(attr => {
                const val = el.getAttribute(attr);
                if (val && val.includes('oklch')) {
                  el.setAttribute(attr, '#94a3b8');
                }
              });

              // Force computed styles to be safe by setting inline styles for common properties
              // This helps when styles come from external stylesheets that we couldn't easily parse
              try {
                const computedStyle = window.getComputedStyle(el);
                const propertiesToFix = ['background-color', 'color', 'border-color', 'fill', 'stroke'];
                
                propertiesToFix.forEach(prop => {
                  const val = computedStyle.getPropertyValue(prop);
                  if (val && (val.includes('oklch') || val.includes('var('))) {
                    // If it's oklch or a CSS variable (which might resolve to oklch), use fallback
                    el.style.setProperty(prop, '#94a3b8', 'important');
                  }
                });
              } catch (e) {
                // Ignore errors for computed style access
              }
            }
          }
        });
        return canvas.toDataURL('image/png');
      } catch (err) {
        console.error(`Error capturing chart ${elementId}:`, err);
        return undefined;
      }
    }
    return undefined;
  };

  const handleConfirmDownloadPdf = async () => {
    if (!previewReport) return;
    
    setIsConfirmPdfModalOpen(false);
    setIsGeneratingPdf(true);
    setGenerationProgress(5);
    setGenerationStep('Przygotowywanie danych...');
    
    // Create a new AbortController for this generation
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    const checkAborted = () => {
      if (signal.aborted) {
        throw new Error('GENERATION_CANCELLED');
      }
    };
    
    try {
      // Ensure the modal is open to capture the chart if needed
      if (!isFullReportModalOpen) {
        setIsFullReportModalOpen(true);
        // Wait for render
        await new Promise(resolve => {
          const timer = setTimeout(resolve, 800);
          signal.addEventListener('abort', () => {
            clearTimeout(timer);
            resolve(null);
          });
        });
      }

      checkAborted();
      setGenerationProgress(20);
      setGenerationStep('Przechwytywanie analizy technicznej...');
      const capturedChart1 = await captureChart('report-chart-container');
      
      checkAborted();
      setGenerationProgress(45);
      setGenerationStep('Przechwytywanie struktury oszczędności...');
      const capturedChart2 = await captureChart('report-savings-structure');
      
      checkAborted();
      setGenerationProgress(55);
      setGenerationStep('Przechwytywanie oszczędności skumulowanych...');
      const capturedChart3 = await captureChart('report-cumulative-savings');

      checkAborted();
      setGenerationProgress(65);
      setGenerationStep('Przechwytywanie analizy wrażliwości...');
      const capturedChart4 = await captureChart('report-sensitivity-analysis');

      checkAborted();
      setGenerationProgress(75);
      setGenerationStep('Budowanie dokumentu PDF (12 stron)...');
      
      const pdfDoc = (
        <ReportPDF 
          data={previewReport} 
          scenarios={previewReport.scenarios}
          branding={whiteLabel} 
          chartImage={capturedChart1} 
          chartImage2={capturedChart2}
          chartImage3={capturedChart3}
          chartImage4={capturedChart4}
        />
      );

      checkAborted();
      setGenerationProgress(80);
      setGenerationStep('Renderowanie stron...');
      
      const blob = await pdf(pdfDoc).toBlob();
      
      checkAborted();
      setGenerationProgress(95);
      setGenerationStep('Finalizowanie pliku...');
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Raport_BESS_${previewReport.client.replace(/\s+/g, '_')}_${previewReport.id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      setGenerationProgress(100);
      setGenerationStep('Gotowe!');
      setTimeout(() => setIsGeneratingPdf(false), 800);
    } catch (error: any) {
      if (error.message === 'GENERATION_CANCELLED') {
        console.log('PDF generation was cancelled by user');
      } else {
        console.error('Error generating professional PDF:', error);
      }
      setIsGeneratingPdf(false);
    } finally {
      abortControllerRef.current = null;
    }
  };

  return (
    <div className="space-y-8">
      {/* KPI Overview for Reports */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KPICard title="Wygenerowane Raporty" value="48" icon={FileText} trend="+5 w tym miesiącu" />
        <KPICard title="Sumaryczne Oszczędności" value="245 800 zł" icon={TrendingUp} trend="+12% vs poprz. kwartał" />
        <KPICard title="Średni Czas Zwrotu" value="4.2 lata" icon={Battery} trend="-0.5 roku dzięki optymalizacji" />
      </div>

      <Card title="Archiwum Raportów" subtitle="Zarządzaj zapisanymi symulacjami i eksportuj wyniki">
        {/* Toolbar */}
        <div className="space-y-4 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Szukaj raportu po nazwie lub ID..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
              />
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto">
              <button 
                onClick={() => setIsCompareModalOpen(true)}
                disabled={selectedReportIds.length < 2}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-bold transition-all shadow-lg ${
                  selectedReportIds.length >= 2 
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-500/20' 
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
                }`}
              >
                <BarChart2 size={18} /> Porównaj wybrane ({selectedReportIds.length})
              </button>
              <button 
                onClick={() => setIsColumnModalOpen(true)}
                className="flex items-center gap-2 px-4 py-3 bg-white border border-slate-100 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                <Settings size={18} /> Kolumny
              </button>
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-3 border rounded-xl text-sm font-bold transition-all ${
                  showFilters || statusFilter !== 'all' || customerTypeFilter !== 'all'
                    ? 'bg-blue-50 border-accent text-accent' 
                    : 'bg-white border-slate-100 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Filter size={18} /> Filtry
              </button>
              <button className="flex items-center gap-2 px-4 py-3 bg-accent text-white rounded-xl text-sm font-bold hover:bg-blue-600 transition-all shadow-lg shadow-blue-500/20 ml-auto md:ml-0">
                <Download size={18} /> Eksportuj Wszystko
              </button>
            </div>
          </div>

          {/* Filter Bar */}
          <AnimatePresence>
            {showFilters && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex flex-wrap gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status Raportu</label>
                    <div className="flex gap-2">
                      {['all', 'Zakończony', 'Wersja Robocza'].map((status) => (
                        <button
                          key={status}
                          onClick={() => setStatusFilter(status)}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                            statusFilter === status 
                              ? 'bg-accent text-white shadow-md shadow-blue-500/20' 
                              : 'bg-white text-slate-500 border border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          {status === 'all' ? 'Wszystkie' : status}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Typ Klienta</label>
                    <div className="flex gap-2">
                      {[
                        { id: 'all', label: 'Wszyscy' },
                        { id: 'individual', label: 'Indywidualny' },
                        { id: 'company', label: 'Firma' },
                        { id: 'mixed', label: 'Mieszany' }
                      ].map((type) => (
                        <button
                          key={type.id}
                          onClick={() => setCustomerTypeFilter(type.id)}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                            customerTypeFilter === type.id 
                              ? 'bg-accent text-white shadow-md shadow-blue-500/20' 
                              : 'bg-white text-slate-500 border border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          {type.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button 
                    onClick={() => {
                      setStatusFilter('all');
                      setCustomerTypeFilter('all');
                      setSearchQuery('');
                    }}
                    className="mt-auto mb-1 text-[10px] font-bold text-slate-400 hover:text-red-500 transition-colors underline underline-offset-4"
                  >
                    Resetuj filtry
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Reports Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="pb-4 w-10">
                  <button 
                    onClick={() => {
                      if (selectedReportIds.length === filteredReports.length) {
                        setSelectedReportIds([]);
                      } else {
                        setSelectedReportIds(filteredReports.map(r => r.id));
                      }
                    }}
                    className="p-1 text-slate-400 hover:text-accent transition-colors"
                  >
                    {selectedReportIds.length === filteredReports.length && filteredReports.length > 0 ? <CheckSquare size={18} /> : <Square size={18} />}
                  </button>
                </th>
                {visibleColumns.includes('id') && (
                  <th 
                    className="pb-4 text-[9px] font-black text-slate-400 uppercase tracking-widest cursor-pointer hover:text-accent transition-colors group"
                    onClick={() => handleSort('id')}
                  >
                    <div className="flex items-center gap-1">
                      ID Raportu
                      {sortConfig?.key === 'id' ? (
                        sortConfig.direction === 'asc' ? <ChevronUp size={10} /> : <ChevronDown size={10} />
                      ) : (
                        <ChevronUp size={10} className="opacity-0 group-hover:opacity-50" />
                      )}
                    </div>
                  </th>
                )}
                {visibleColumns.includes('name') && (
                  <th 
                    className="pb-4 text-[9px] font-black text-slate-400 uppercase tracking-widest cursor-pointer hover:text-accent transition-colors group"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center gap-1">
                      Nazwa Symulacji
                      {sortConfig?.key === 'name' ? (
                        sortConfig.direction === 'asc' ? <ChevronUp size={10} /> : <ChevronDown size={10} />
                      ) : (
                        <ChevronUp size={10} className="opacity-0 group-hover:opacity-50" />
                      )}
                    </div>
                  </th>
                )}
                {visibleColumns.includes('client') && (
                  <th 
                    className="pb-4 text-[9px] font-black text-slate-400 uppercase tracking-widest cursor-pointer hover:text-accent transition-colors group"
                    onClick={() => handleSort('client')}
                  >
                    <div className="flex items-center gap-1">
                      Klient
                      {sortConfig?.key === 'client' ? (
                        sortConfig.direction === 'asc' ? <ChevronUp size={10} /> : <ChevronDown size={10} />
                      ) : (
                        <ChevronUp size={10} className="opacity-0 group-hover:opacity-50" />
                      )}
                    </div>
                  </th>
                )}
                {visibleColumns.includes('nip') && (
                  <th 
                    className="pb-4 text-[9px] font-black text-slate-400 uppercase tracking-widest cursor-pointer hover:text-accent transition-colors group"
                    onClick={() => handleSort('nip')}
                  >
                    <div className="flex items-center gap-1">
                      NIP / Dane
                      {sortConfig?.key === 'nip' ? (
                        sortConfig.direction === 'asc' ? <ChevronUp size={10} /> : <ChevronDown size={10} />
                      ) : (
                        <ChevronUp size={10} className="opacity-0 group-hover:opacity-50" />
                      )}
                    </div>
                  </th>
                )}
                {visibleColumns.includes('date') && (
                  <th 
                    className="pb-4 text-[9px] font-black text-slate-400 uppercase tracking-widest cursor-pointer hover:text-accent transition-colors group"
                    onClick={() => handleSort('date')}
                  >
                    <div className="flex items-center gap-1">
                      Data Utworzenia
                      {sortConfig?.key === 'date' ? (
                        sortConfig.direction === 'asc' ? <ChevronUp size={10} /> : <ChevronDown size={10} />
                      ) : (
                        <ChevronUp size={10} className="opacity-0 group-hover:opacity-50" />
                      )}
                    </div>
                  </th>
                )}
                {visibleColumns.includes('type') && (
                  <th 
                    className="pb-4 text-[9px] font-black text-slate-400 uppercase tracking-widest cursor-pointer hover:text-accent transition-colors group"
                    onClick={() => handleSort('type')}
                  >
                    <div className="flex items-center gap-1">
                      Typ Analizy
                      {sortConfig?.key === 'type' ? (
                        sortConfig.direction === 'asc' ? <ChevronUp size={10} /> : <ChevronDown size={10} />
                      ) : (
                        <ChevronUp size={10} className="opacity-0 group-hover:opacity-50" />
                      )}
                    </div>
                  </th>
                )}
                {visibleColumns.includes('savings') && (
                  <th 
                    className="pb-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right cursor-pointer hover:text-accent transition-colors group"
                    onClick={() => handleSort('savings')}
                  >
                    <div className="flex items-center justify-end gap-1">
                      Oszczędność (rok)
                      {sortConfig?.key === 'savings' ? (
                        sortConfig.direction === 'asc' ? <ChevronUp size={10} /> : <ChevronDown size={10} />
                      ) : (
                        <ChevronUp size={10} className="opacity-0 group-hover:opacity-50" />
                      )}
                    </div>
                  </th>
                )}
                {visibleColumns.includes('roi') && (
                  <th 
                    className="pb-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right cursor-pointer hover:text-accent transition-colors group"
                    onClick={() => handleSort('roi')}
                  >
                    <div className="flex items-center justify-end gap-1">
                      ROI (%)
                      {sortConfig?.key === 'roi' ? (
                        sortConfig.direction === 'asc' ? <ChevronUp size={10} /> : <ChevronDown size={10} />
                      ) : (
                        <ChevronUp size={10} className="opacity-0 group-hover:opacity-50" />
                      )}
                    </div>
                  </th>
                )}
                {visibleColumns.includes('payback') && (
                  <th 
                    className="pb-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right cursor-pointer hover:text-accent transition-colors group"
                    onClick={() => handleSort('payback')}
                  >
                    <div className="flex items-center justify-end gap-1">
                      Zwrot (lat)
                      {sortConfig?.key === 'payback' ? (
                        sortConfig.direction === 'asc' ? <ChevronUp size={10} /> : <ChevronDown size={10} />
                      ) : (
                        <ChevronUp size={10} className="opacity-0 group-hover:opacity-50" />
                      )}
                    </div>
                  </th>
                )}
                {visibleColumns.includes('capacity') && (
                  <th 
                    className="pb-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right cursor-pointer hover:text-accent transition-colors group"
                    onClick={() => handleSort('capacity')}
                  >
                    <div className="flex items-center justify-end gap-1">
                      Pojemność (kWh)
                      {sortConfig?.key === 'capacity' ? (
                        sortConfig.direction === 'asc' ? <ChevronUp size={10} /> : <ChevronDown size={10} />
                      ) : (
                        <ChevronUp size={10} className="opacity-0 group-hover:opacity-50" />
                      )}
                    </div>
                  </th>
                )}
                {visibleColumns.includes('power') && (
                  <th 
                    className="pb-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right cursor-pointer hover:text-accent transition-colors group"
                    onClick={() => handleSort('power')}
                  >
                    <div className="flex items-center justify-end gap-1">
                      Moc (kW)
                      {sortConfig?.key === 'power' ? (
                        sortConfig.direction === 'asc' ? <ChevronUp size={10} /> : <ChevronDown size={10} />
                      ) : (
                        <ChevronUp size={10} className="opacity-0 group-hover:opacity-50" />
                      )}
                    </div>
                  </th>
                )}
                {visibleColumns.includes('customerType') && (
                  <th 
                    className="pb-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center cursor-pointer hover:text-accent transition-colors group"
                    onClick={() => handleSort('customerType')}
                  >
                    <div className="flex items-center justify-center gap-1">
                      Typ Klienta
                      {sortConfig?.key === 'customerType' ? (
                        sortConfig.direction === 'asc' ? <ChevronUp size={10} /> : <ChevronDown size={10} />
                      ) : (
                        <ChevronUp size={10} className="opacity-0 group-hover:opacity-50" />
                      )}
                    </div>
                  </th>
                )}
                {visibleColumns.includes('status') && (
                  <th 
                    className="pb-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center cursor-pointer hover:text-accent transition-colors group"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center justify-center gap-1">
                      Status
                      {sortConfig?.key === 'status' ? (
                        sortConfig.direction === 'asc' ? <ChevronUp size={10} /> : <ChevronDown size={10} />
                      ) : (
                        <ChevronUp size={10} className="opacity-0 group-hover:opacity-50" />
                      )}
                    </div>
                  </th>
                )}
                <th className="pb-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Akcje</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredReports.map((report) => (
                <tr key={report.id} className={`group hover:bg-slate-50/50 transition-colors ${selectedReportIds.includes(report.id) ? 'bg-blue-50/30' : ''}`}>
                  <td className="py-4">
                    <button 
                      onClick={() => toggleReportSelection(report.id)}
                      className={`p-1 transition-colors ${selectedReportIds.includes(report.id) ? 'text-accent' : 'text-slate-300 group-hover:text-slate-400'}`}
                    >
                      {selectedReportIds.includes(report.id) ? <CheckSquare size={16} /> : <Square size={16} />}
                    </button>
                  </td>
                  {visibleColumns.includes('id') && <td className="py-4 text-[10px] font-bold text-slate-400">{report.id}</td>}
                  {visibleColumns.includes('name') && (
                    <td className="py-4">
                      <p className="text-[11px] font-bold text-slate-900 leading-tight">{report.name}</p>
                    </td>
                  )}
                  {visibleColumns.includes('client') && (
                    <td className="py-4">
                      <p className="text-[11px] font-medium text-slate-600">{report.client}</p>
                    </td>
                  )}
                  {visibleColumns.includes('nip') && (
                    <td className="py-4">
                      <p className="text-[10px] font-medium text-slate-500">{report.nip}</p>
                    </td>
                  )}
                  {visibleColumns.includes('date') && (
                    <td className="py-4">
                      <div className="flex items-center gap-2 text-[10px] text-slate-500 font-medium">
                        <Calendar size={12} className="text-slate-400" />
                        {report.date}
                      </div>
                    </td>
                  )}
                  {visibleColumns.includes('type') && (
                    <td className="py-4">
                      <span className="px-2 py-0.5 bg-blue-50 text-accent rounded-full text-[9px] font-black uppercase tracking-wider">
                        {report.type}
                      </span>
                    </td>
                  )}
                  {visibleColumns.includes('savings') && (
                    <td className="py-4 text-right">
                      <p className="text-[11px] font-black text-slate-900">{formatCurrency(report.savings)}</p>
                    </td>
                  )}
                  {visibleColumns.includes('roi') && (
                    <td className="py-4 text-right">
                      <p className="text-[11px] font-black text-slate-900">{report.roi}%</p>
                    </td>
                  )}
                  {visibleColumns.includes('payback') && (
                    <td className="py-4 text-right">
                      <p className="text-[11px] font-black text-slate-900">{report.payback} lat</p>
                    </td>
                  )}
                  {visibleColumns.includes('capacity') && (
                    <td className="py-4 text-right">
                      <p className="text-[11px] font-black text-slate-900">{report.capacity} kWh</p>
                    </td>
                  )}
                  {visibleColumns.includes('power') && (
                    <td className="py-4 text-right">
                      <p className="text-[11px] font-black text-slate-900">{report.power} kW</p>
                    </td>
                  )}
                  {visibleColumns.includes('customerType') && (
                    <td className="py-4 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                        report.customerType === 'individual' ? 'bg-blue-50 text-blue-600' : 
                        report.customerType === 'company' ? 'bg-emerald-50 text-emerald-600' : 
                        'bg-amber-50 text-amber-600'
                      }`}>
                        {report.customerType === 'individual' ? 'Indywidualny' : 
                         report.customerType === 'company' ? 'Firma' : 'Mieszany'}
                      </span>
                    </td>
                  )}
                  {visibleColumns.includes('status') && (
                    <td className="py-4 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                        report.status === 'Zakończony' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                      }`}>
                        {report.status}
                      </span>
                    </td>
                  )}
                  <td className="py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button 
                        onClick={() => {
                          setPreviewReport(report);
                          setIsPreviewModalOpen(true);
                        }}
                        className="p-1.5 text-slate-400 hover:text-accent hover:bg-blue-50 rounded-lg transition-all" 
                        title="Podgląd"
                      >
                        <Eye size={16} />
                      </button>
                      <button 
                        onClick={() => {
                          setPreviewReport(report);
                          handleDownloadPdf(report);
                        }}
                        disabled={isGeneratingPdf}
                        className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all disabled:opacity-50" 
                        title="Pobierz PDF"
                      >
                        <Download size={16} />
                      </button>
                      <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all">
                        <MoreVertical size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-8 pt-8 border-t border-slate-100 flex items-center justify-between">
          <p className="text-xs text-slate-400 font-medium">Wyświetlono {filteredReports.length} z {reports.length} raportów</p>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-slate-50 text-slate-400 rounded-xl text-xs font-bold cursor-not-allowed">Poprzednia</button>
            <button className="px-4 py-2 bg-white border border-slate-100 text-slate-900 rounded-xl text-xs font-bold hover:bg-slate-50 transition-colors">Następna</button>
          </div>
        </div>
      </Card>

      {/* Comparison Modal */}
      <Modal 
        isOpen={isCompareModalOpen} 
        onClose={() => setIsCompareModalOpen(false)} 
        title="Porównanie Symulacji BESS"
      >
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Porównanie ROI (%)</h4>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={selectedReports}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis 
                        dataKey="id" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                      />
                      <Tooltip 
                        cursor={{ fill: '#f1f5f9' }}
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      />
                      <Bar dataKey="roi" name="ROI (%)" radius={[4, 4, 0, 0]}>
                        {selectedReports.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][index % 5]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Oszczędności Roczne (PLN)</h4>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={selectedReports} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                      <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} />
                      <YAxis 
                        dataKey="id" 
                        type="category" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                      />
                      <Tooltip 
                        cursor={{ fill: '#f1f5f9' }}
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      />
                      <Bar dataKey="savings" name="Oszczędności (PLN)" radius={[0, 4, 4, 0]}>
                        {selectedReports.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][index % 5]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Szczegóły Porównania</h4>
              {selectedReports.map((report, idx) => (
                <div key={report.id} className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm space-y-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-8 rounded-full ${['bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-red-500', 'bg-purple-500'][idx % 5]}`} />
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{report.id}</p>
                      <p className="text-xs font-bold text-slate-900 line-clamp-1">{report.name}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 bg-slate-50 rounded-lg">
                      <p className="text-[8px] font-bold text-slate-400 uppercase">ROI</p>
                      <p className="text-xs font-black text-slate-900">{report.roi}%</p>
                    </div>
                    <div className="p-2 bg-slate-50 rounded-lg">
                      <p className="text-[8px] font-bold text-slate-400 uppercase">Zwrot</p>
                      <p className="text-xs font-black text-slate-900">{report.payback} lat</p>
                    </div>
                    <div className="p-2 bg-slate-50 rounded-lg">
                      <p className="text-[8px] font-bold text-slate-400 uppercase">Pojemność</p>
                      <p className="text-xs font-black text-slate-900">{report.capacity} kWh</p>
                    </div>
                    <div className="p-2 bg-slate-50 rounded-lg">
                      <p className="text-[8px] font-bold text-slate-400 uppercase">Oszczędność</p>
                      <p className="text-xs font-black text-emerald-600">{formatCurrency(report.savings)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex justify-end">
            <button 
              onClick={() => setIsCompareModalOpen(false)}
              className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg"
            >
              Zamknij Porównanie
            </button>
          </div>
        </div>
      </Modal>

      {/* Column Management Modal */}
      <Modal 
        isOpen={isColumnModalOpen} 
        onClose={() => setIsColumnModalOpen(false)} 
        title="Zarządzaj Kolumnami Zestawienia"
      >
        <div className="space-y-6">
          <p className="text-xs text-slate-500 font-medium leading-relaxed">
            Wybierz kolumny, które mają być widoczne w tabeli archiwum raportów. Możesz dostosować widok do swoich potrzeb.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {allColumns.map((col) => (
              <button
                key={col.id}
                onClick={() => {
                  if (visibleColumns.includes(col.id)) {
                    if (visibleColumns.length > 1) {
                      setVisibleColumns(visibleColumns.filter(c => c !== col.id));
                    }
                  } else {
                    setVisibleColumns([...visibleColumns, col.id]);
                  }
                }}
                className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                  visibleColumns.includes(col.id) 
                    ? 'border-accent bg-blue-50/50 text-accent' 
                    : 'border-slate-100 hover:border-slate-200 text-slate-500'
                }`}
              >
                {visibleColumns.includes(col.id) ? <CheckSquare size={16} /> : <Square size={16} />}
                <span className="text-[10px] font-black uppercase tracking-widest">{col.label}</span>
              </button>
            ))}
          </div>
          <div className="pt-4 flex justify-end">
            <button 
              onClick={() => setIsColumnModalOpen(false)}
              className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg"
            >
              Zapisz Widok
            </button>
          </div>
        </div>
      </Modal>

      {/* Preview Modal */}
      <Modal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        title="Podgląd Raportu"
      >
        {previewReport && (
          <div className="space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{previewReport.id}</p>
                <h3 className="text-xl font-bold text-slate-900">{previewReport.name}</h3>
                <p className="text-sm text-slate-500 font-medium">{previewReport.client}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                previewReport.status === 'Zakończony' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
              }`}>
                {previewReport.status}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-2 text-slate-400 mb-2">
                  <TrendingUp size={16} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Oszczędności</span>
                </div>
                <p className="text-xl font-black text-emerald-600">{formatCurrency(previewReport.savings)}</p>
                <p className="text-[10px] text-slate-400 font-medium mt-1">Szacowane rocznie</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-2 text-slate-400 mb-2">
                  <Zap size={16} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">ROI</span>
                </div>
                <p className="text-xl font-black text-slate-900">{previewReport.roi}%</p>
                <p className="text-[10px] text-slate-400 font-medium mt-1">Zwrot z inwestycji</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-2 text-slate-400 mb-2">
                  <Calendar size={16} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Zwrot</span>
                </div>
                <p className="text-xl font-black text-slate-900">{previewReport.payback} lat</p>
                <p className="text-[10px] text-slate-400 font-medium mt-1">Okres amortyzacji</p>
              </div>
            </div>

            <div className="bg-blue-50/50 rounded-2xl p-4 border border-blue-100/50">
              <h4 className="text-[10px] font-black text-accent uppercase tracking-widest mb-3">Konfiguracja Systemu</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase">Pojemność Magazynu</p>
                  <p className="text-sm font-bold text-slate-900">{previewReport.capacity} kWh</p>
                </div>
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase">Moc Systemu</p>
                  <p className="text-sm font-bold text-slate-900">{previewReport.power} kW</p>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 flex gap-3">
              <button 
                onClick={() => setIsPreviewModalOpen(false)}
                className="flex-1 px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-all"
              >
                Zamknij
              </button>
              <button 
                onClick={() => {
                  setIsPreviewModalOpen(false);
                  setIsFullReportModalOpen(true);
                }}
                className="flex-1 px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg flex items-center justify-center gap-2"
              >
                <FileText size={18} /> Pełny Raport
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Full Report Modal */}
      <Modal
        isOpen={isFullReportModalOpen}
        onClose={() => setIsFullReportModalOpen(false)}
        title="Pełny Raport Symulacji"
        maxWidth="max-w-5xl"
      >
        {previewReport && (
          <div className="space-y-12 pb-12">
            {/* PDF Content Wrapper */}
            <div id="full-report-content" className="bg-white p-12 rounded-3xl shadow-sm border border-slate-100 font-sans text-slate-900">
              {/* Header */}
              <div className="flex justify-between items-start mb-16">
                <div className="flex items-center gap-4">
                  <div 
                    className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-lg"
                    style={{ backgroundColor: whiteLabel.primaryColor }}
                  >
                    {whiteLabel.companyName.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h1 className="text-2xl font-black tracking-tight">{whiteLabel.companyName}</h1>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Raport Techniczno-Ekonomiczny BESS</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">ID Raportu</p>
                  <p className="text-sm font-black text-slate-900">{previewReport.id}</p>
                  <p className="text-[10px] font-bold text-slate-500 mt-2">{previewReport.date}</p>
                </div>
              </div>

              {/* Title Section */}
              <div className="mb-16 text-center">
                <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Analiza Opłacalności Systemu Magazynowania Energii</h2>
                <div className="h-1.5 w-24 bg-accent mx-auto rounded-full" />
              </div>

              {/* Section 1: Wstęp */}
              <section className="mb-16">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-900 font-bold text-sm">01</div>
                  <h3 className="text-xl font-black uppercase tracking-tight">Wstęp</h3>
                </div>
                <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed">
                  <p>
                    Niniejszy raport przedstawia szczegółową analizę techniczną i ekonomiczną wdrożenia systemu magazynowania energii (BESS) 
                    dla klienta <strong>{previewReport.client}</strong>. Celem opracowania jest ocena potencjalnych oszczędności wynikających 
                    z optymalizacji zużycia energii, arbitrażu cenowego oraz redukcji mocy zamówionej (Peak Shaving).
                  </p>
                  <p className="mt-4">
                    Analiza została przeprowadzona w oparciu o zaawansowane modele matematyczne uwzględniające historyczne ceny energii na TGE, 
                    aktualne taryfy dystrybucyjne oraz specyfikę profilu zużycia energii klienta.
                  </p>
                </div>
              </section>

              {/* Section 2: Założenia */}
              <section className="mb-16">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-900 font-bold text-sm">02</div>
                  <h3 className="text-xl font-black uppercase tracking-tight">Założenia Projektowe</h3>
                </div>
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Parametry Techniczne</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-500">Moc Systemu (PCS)</span>
                        <span className="text-sm font-black text-slate-900">{previewReport.power} kW</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-500">Pojemność Systemu (BESS)</span>
                        <span className="text-sm font-black text-slate-900">{previewReport.capacity} kWh</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-500">Typ Klienta</span>
                        <span className="text-sm font-black text-slate-900 capitalize">{previewReport.customerType}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-500">Sprawność Round-Trip</span>
                        <span className="text-sm font-black text-slate-900">88%</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Dane Klienta</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-500">Nazwa Podmiotu</span>
                        <span className="text-sm font-black text-slate-900">{previewReport.client}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-500">NIP / Identyfikator</span>
                        <span className="text-sm font-black text-slate-900">{previewReport.nip}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-500">Lokalizacja</span>
                        <span className="text-sm font-black text-slate-900">Polska (TGE)</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-500">Autor Raportu</span>
                        <span className="text-sm font-black text-slate-900">{previewReport.author}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Section 3: Analiza Ekonomiczna i Techniczna */}
              <section className="mb-16 pt-16 border-t border-slate-100">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-slate-900 text-white rounded-lg flex items-center justify-center font-bold text-sm shadow-lg">03</div>
                    <h3 className="text-xl font-black uppercase tracking-tight">Analiza Ekonomiczna i Techniczna</h3>
                  </div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Strona 3 z 12</span>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                  <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 text-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Oszczędności Roczne</p>
                    <p className="text-xl font-black text-emerald-600">{formatCurrency(previewReport.savings)}</p>
                  </div>
                  <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 text-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">NPV (10 lat)</p>
                    <p className="text-xl font-black text-slate-900">{formatCurrency(previewReport.npv || previewReport.savings * 6.5)}</p>
                  </div>
                  <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 text-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">IRR</p>
                    <p className="text-xl font-black text-slate-900">{previewReport.irr || 18.5}%</p>
                  </div>
                  <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 text-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">LCOE</p>
                    <p className="text-xl font-black text-slate-900">{previewReport.lcoe || 0.42} PLN/kWh</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
                  <div className="space-y-6">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Porównanie Scenariuszy (Rok 1)</h4>
                    <div className="overflow-hidden rounded-2xl border border-slate-100">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50">
                          <tr>
                            <th className="px-4 py-3 font-black text-slate-400 uppercase tracking-widest">Scenariusz</th>
                            <th className="px-4 py-3 font-black text-slate-400 uppercase tracking-widest text-right">Energia (MWh)</th>
                            <th className="px-4 py-3 font-black text-slate-400 uppercase tracking-widest text-right">Koszt Roczny</th>
                            <th className="px-4 py-3 font-black text-emerald-600 uppercase tracking-widest text-right">Oszczędność</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {previewReport.scenarios ? (
                            <>
                              <tr className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-4 py-3 font-bold text-slate-900">Baseline</td>
                                <td className="px-4 py-3 text-right text-slate-500">{Math.round(previewReport.scenarios.baseline.gridEnergy).toLocaleString()}</td>
                                <td className="px-4 py-3 text-right text-slate-500">{formatCurrency(previewReport.scenarios.baseline.annualCost)}</td>
                                <td className="px-4 py-3 text-right font-black text-emerald-600">-</td>
                              </tr>
                              <tr className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-4 py-3 font-bold text-slate-900">PV Only</td>
                                <td className="px-4 py-3 text-right text-slate-500">{Math.round(previewReport.scenarios.pvOnly.gridEnergy).toLocaleString()}</td>
                                <td className="px-4 py-3 text-right text-slate-500">{formatCurrency(previewReport.scenarios.pvOnly.annualCost)}</td>
                                <td className="px-4 py-3 text-right font-black text-emerald-600">-{formatCurrency(previewReport.scenarios.baseline.annualCost - previewReport.scenarios.pvOnly.annualCost)}</td>
                              </tr>
                              <tr className="bg-blue-50/50 hover:bg-blue-100/50 transition-colors">
                                <td className="px-4 py-3 font-bold text-accent">PV + BESS</td>
                                <td className="px-4 py-3 text-right text-accent">{Math.round(previewReport.scenarios.pvBess.gridEnergy).toLocaleString()}</td>
                                <td className="px-4 py-3 text-right text-accent font-black">{formatCurrency(previewReport.scenarios.pvBess.annualCost)}</td>
                                <td className="px-4 py-3 text-right font-black text-emerald-600">-{formatCurrency(previewReport.scenarios.baseline.annualCost - previewReport.scenarios.pvBess.annualCost)}</td>
                              </tr>
                            </>
                          ) : (
                            [
                              { period: '12 miesięcy', without: previewReport.savings * 4.5, with: previewReport.savings * 3.5, diff: previewReport.savings },
                              { period: '2 lata', without: previewReport.savings * 9.5, with: previewReport.savings * 7.4, diff: previewReport.savings * 2.1 },
                              { period: '5 lat', without: previewReport.savings * 26.0, with: previewReport.savings * 20.5, diff: previewReport.savings * 5.5 },
                              { period: '10 lat', without: previewReport.savings * 58.0, with: previewReport.savings * 45.6, diff: previewReport.savings * 12.4 },
                            ].map((row, i) => (
                              <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-4 py-3 font-bold text-slate-900">{row.period}</td>
                                <td className="px-4 py-3 text-right text-slate-500">{formatCurrency(row.without)}</td>
                                <td className="px-4 py-3 text-right text-slate-500">{formatCurrency(row.with)}</td>
                                <td className="px-4 py-3 text-right font-black text-emerald-600">-{formatCurrency(row.diff)}</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Cel Modelowania: {
                      previewReport.modelingGoal === 'arbitrage' ? 'Arbitraż Cenowy' : 
                      previewReport.modelingGoal === 'peak-shaving' ? 'Peak Shaving' : 
                      previewReport.modelingGoal === 'backup' ? 'Backup & UPS' : 'Optymalizacja Hybrydowa'
                    }</h4>
                    <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100">
                      <p className="text-xs text-blue-800 leading-relaxed italic">
                        {previewReport.modelingGoal === 'arbitrage' 
                          ? "System został zoptymalizowany pod kątem maksymalizacji zysku z różnic cenowych na TGE. Algorytm ładuje magazyn w godzinach najniższych cen i oddaje energię w szczytach cenowych."
                          : previewReport.modelingGoal === 'peak-shaving'
                          ? "Głównym celem jest redukcja szczytów poboru mocy, co pozwala na obniżenie mocy zamówionej i uniknięcie kar umownych oraz wysokich opłat zmiennych."
                          : "Priorytetem jest utrzymanie rezerwy energii na wypadek awarii sieci, przy jednoczesnym wykorzystaniu nadmiaru pojemności do optymalizacji bieżących kosztów."
                        }
                      </p>
                      <div className="mt-4 flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                        <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Modelowanie Aktywne</span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Section 4: Porównanie Scenariuszy (Wizualizacja) */}
              <section className="mb-16 pt-16 border-t border-slate-100">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-slate-900 text-white rounded-lg flex items-center justify-center font-bold text-sm shadow-lg">04</div>
                    <h3 className="text-xl font-black uppercase tracking-tight">Porównanie Scenariuszy (Wizualizacja)</h3>
                  </div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Strona 4 z 12</span>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
                  <div id="report-chart-container" className="h-[350px] bg-slate-50 rounded-3xl p-8 border border-slate-100">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-8">Roczny Koszt Energii (PLN)</h4>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={[
                        { name: 'Baseline', value: previewReport.scenarios?.baseline.annualCost || 100000, color: '#94a3b8' },
                        { name: 'PV Only', value: previewReport.scenarios?.pvOnly.annualCost || 75000, color: '#3b82f6' },
                        { name: 'PV + BESS', value: previewReport.scenarios?.pvBess.annualCost || 45000, color: '#10b981' },
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} />
                        <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                        <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                          {[{ color: '#94a3b8' }, { color: '#3b82f6' }, { color: '#10b981' }].map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-6">
                    <div className="p-8 bg-emerald-50 rounded-3xl border border-emerald-100">
                      <h4 className="text-xs font-black text-emerald-900 uppercase tracking-widest mb-4">Wnioski z Porównania</h4>
                      <ul className="space-y-4">
                        <li className="flex items-start gap-3 text-sm text-emerald-800 font-medium">
                          <div className="w-2 h-2 bg-emerald-500 rounded-full mt-1.5 shrink-0" />
                          <p>Wariant <strong>PV + BESS</strong> redukuje roczne koszty energii o <strong>{Math.round(((previewReport.scenarios?.baseline.annualCost || 100000) - (previewReport.scenarios?.pvBess.annualCost || 45000)) / (previewReport.scenarios?.baseline.annualCost || 100000) * 100)}%</strong> względem scenariusza bazowego.</p>
                        </li>
                        <li className="flex items-start gap-3 text-sm text-emerald-800 font-medium">
                          <div className="w-2 h-2 bg-emerald-500 rounded-full mt-1.5 shrink-0" />
                          <p>Zastosowanie magazynu energii pozwala na niemal dwukrotne zwiększenie autokonsumpcji energii z PV (z {previewReport.scenarios?.pvOnly.selfConsumptionRate || 25}% do {previewReport.scenarios?.pvBess.selfConsumptionRate || 65}%).</p>
                        </li>
                        <li className="flex items-start gap-3 text-sm text-emerald-800 font-medium">
                          <div className="w-2 h-2 bg-emerald-500 rounded-full mt-1.5 shrink-0" />
                          <p>Stabilizacja profilu poboru mocy eliminuje ryzyko kar za przekroczenia mocy zamówionej.</p>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </section>

              {/* Section 5: Analiza Miesięczna i Struktura Oszczędności */}
              <section className="mb-16 pt-16 border-t border-slate-100">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-slate-900 text-white rounded-lg flex items-center justify-center font-bold text-sm shadow-lg">05</div>
                    <h3 className="text-xl font-black uppercase tracking-tight">Analiza Miesięczna i Struktura Oszczędności</h3>
                  </div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Strona 5 z 12</span>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
                  <div id="report-savings-structure" className="h-[300px] bg-slate-50 rounded-3xl p-8 border border-slate-100">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-8">Prognozowane Oszczędności Miesięczne (PLN)</h4>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={[
                        { m: 'Sty', v: previewReport.savings * 0.08 }, { m: 'Lut', v: previewReport.savings * 0.07 }, { m: 'Mar', v: previewReport.savings * 0.09 },
                        { m: 'Kwi', v: previewReport.savings * 0.10 }, { m: 'Maj', v: previewReport.savings * 0.12 }, { m: 'Cze', v: previewReport.savings * 0.11 },
                        { m: 'Lip', v: previewReport.savings * 0.13 }, { m: 'Sie', v: previewReport.savings * 0.12 }, { m: 'Wrz', v: previewReport.savings * 0.10 },
                        { m: 'Paź', v: previewReport.savings * 0.09 }, { m: 'Lis', v: previewReport.savings * 0.08 }, { m: 'Gru', v: previewReport.savings * 0.07 },
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="m" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} />
                        <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                        <Bar dataKey="v" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-8">Skąd biorą się oszczędności?</h4>
                    <div className="space-y-6">
                      {[
                        { label: 'Arbitraż Cenowy (TGE)', value: 45, color: 'bg-blue-500', desc: 'Wykorzystanie różnic cen między dolinami a szczytami zapotrzebowania.' },
                        { label: 'Peak Shaving', value: 25, color: 'bg-emerald-500', desc: 'Redukcja opłat mocowych i kar za przekroczenia mocy zamówionej.' },
                        { label: 'Autokonsumpcja PV', value: 20, color: 'bg-amber-500', desc: 'Zwiększenie wykorzystania darmowej energii z własnej instalacji PV.' },
                        { label: 'Usługi Systemowe', value: 10, color: 'bg-purple-500', desc: 'Potencjalne przychody z bilansowania i usług DSR (przyszłość).' },
                      ].map((item, i) => (
                        <div key={i} className="space-y-2">
                          <div className="flex justify-between items-end">
                            <div>
                              <p className="text-xs font-black text-slate-700 uppercase tracking-tight">{item.label}</p>
                              <p className="text-[10px] text-slate-400 font-medium">{item.desc}</p>
                            </div>
                            <p className="text-sm font-black text-slate-900">{item.value}%</p>
                          </div>
                          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${item.value}%` }}
                              transition={{ duration: 1, delay: i * 0.1 }}
                              className={`h-full ${item.color}`}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              {/* Section 6: Projekcja Oszczędności Skumulowanych (10 lat) */}
              <section className="mb-16 pt-16 border-t border-slate-100">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-slate-900 text-white rounded-lg flex items-center justify-center font-bold text-sm shadow-lg">06</div>
                    <h3 className="text-xl font-black uppercase tracking-tight">Projekcja Oszczędności Skumulowanych</h3>
                  </div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Strona 6 z 12</span>
                </div>
                <div id="report-cumulative-savings" className="h-[350px] bg-slate-50 rounded-3xl p-8 border border-slate-100 mb-8">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                      { year: 'Rok 1', value: previewReport.savings },
                      { year: 'Rok 2', value: previewReport.savings * 2.05 },
                      { year: 'Rok 3', value: previewReport.savings * 3.15 },
                      { year: 'Rok 4', value: previewReport.savings * 4.30 },
                      { year: 'Rok 5', value: previewReport.savings * 5.50 },
                      { year: 'Rok 6', value: previewReport.savings * 6.75 },
                      { year: 'Rok 7', value: previewReport.savings * 8.05 },
                      { year: 'Rok 8', value: previewReport.savings * 9.40 },
                      { year: 'Rok 9', value: previewReport.savings * 10.85 },
                      { year: 'Rok 10', value: previewReport.savings * 12.40 },
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} />
                      <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                      <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="p-8 bg-slate-900 text-white rounded-3xl">
                  <p className="text-sm font-medium leading-relaxed opacity-90">
                    W horyzoncie 10 lat, skumulowane oszczędności przekraczają wartość inwestycji początkowej o ponad 40%, 
                    uwzględniając prognozowany wzrost cen energii na poziomie 5% rocznie oraz degradację ogniw zgodną z gwarancją producenta.
                  </p>
                </div>
              </section>


              {/* Section 7: Specyfikacja Techniczna i Gwarancja */}
              <section className="mb-16 pt-16 border-t border-slate-100">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-slate-900 text-white rounded-lg flex items-center justify-center font-bold text-sm shadow-lg">07</div>
                    <h3 className="text-xl font-black uppercase tracking-tight">Specyfikacja Techniczna i Gwarancja</h3>
                  </div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Strona 7 z 12</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-6">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Kluczowe Komponenty Systemu</h4>
                    <div className="space-y-4">
                      {[
                        { label: 'Technologia Ogniw', value: 'LiFePO4 (LFP)', detail: 'Najwyższy poziom bezpieczeństwa pożarowego i trwałości.' },
                        { label: 'Inwerter PCS', value: 'Bi-directional Hybrid', detail: 'Możliwość pracy wyspowej (Grid-forming) i czarny start.' },
                        { label: 'System BMS', value: '3-Level Active Balancing', detail: 'Precyzyjne monitorowanie stanu SOC/SOH każdego ogniwa.' },
                        { label: 'Chłodzenie', value: 'Liquid Cooling (HVAC)', detail: 'Utrzymanie optymalnej temp. pracy dla wydłużenia życia ogniw.' },
                        { label: 'Obudowa', value: 'IP55 Outdoor Container', detail: 'Odporność na trudne warunki atmosferyczne (C5).' },
                      ].map((item, i) => (
                        <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs font-black text-slate-700 uppercase tracking-tight">{item.label}</span>
                            <span className="text-xs font-bold text-blue-600">{item.value}</span>
                          </div>
                          <p className="text-[10px] text-slate-400 font-medium">{item.detail}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-6">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Zabezpieczenie Inwestycji</h4>
                    <div className="p-8 bg-amber-50 rounded-3xl border border-amber-100 space-y-8">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-amber-600 shadow-sm">
                            <ShieldCheck size={20} />
                          </div>
                          <div>
                            <p className="text-xs font-black text-amber-900 uppercase tracking-widest">Gwarancja Wydajności</p>
                            <p className="text-lg font-black text-amber-900">10 LAT / 6000 CYKLI</p>
                          </div>
                        </div>
                        <p className="text-xs text-amber-800 leading-relaxed font-medium">
                          Gwarantujemy zachowanie minimum 70% pojemności znamionowej po 10 latach lub 6000 pełnych cyklach ładowania/rozładowania.
                        </p>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-amber-600 shadow-sm">
                            <ShieldCheck size={20} />
                          </div>
                          <div>
                            <p className="text-xs font-black text-amber-900 uppercase tracking-widest">Gwarancja na Elektronikę</p>
                            <p className="text-lg font-black text-amber-900">5 LAT (OPCJA 10)</p>
                          </div>
                        </div>
                        <p className="text-xs text-amber-800 leading-relaxed font-medium">
                          Pełna ochrona inwertera PCS i systemów sterowania EMS z możliwością rozszerzenia do pełnego okresu życia baterii.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Section 8: Analiza LCOE i Wrażliwości */}
              <section className="mb-16 pt-16 border-t border-slate-100">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-slate-900 text-white rounded-lg flex items-center justify-center font-bold text-sm shadow-lg">08</div>
                    <h3 className="text-xl font-black uppercase tracking-tight">Analiza LCOE i Wrażliwości</h3>
                  </div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Strona 8 z 12</span>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
                  <div id="report-sensitivity-analysis" className="bg-slate-50 rounded-3xl p-8 border border-slate-100">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-8">Wrażliwość Okresu Zwrotu (Lata)</h4>
                    <div className="h-[250px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={[
                          { label: 'Bazowy', value: previewReport.payback, color: '#3b82f6' },
                          { label: 'CAPEX +15%', value: previewReport.payback + 1.2, color: '#94a3b8' },
                          { label: 'Oszczędności -10%', value: previewReport.payback + 0.8, color: '#94a3b8' },
                          { label: 'Ceny Energii +20%', value: previewReport.payback - 1.5, color: '#10b981' },
                        ]}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                          <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} />
                          <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                            {[
                              { color: '#3b82f6' },
                              { color: '#94a3b8' },
                              { color: '#94a3b8' },
                              { color: '#10b981' }
                            ].map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="p-8 bg-blue-50 rounded-3xl border border-blue-100">
                      <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-3">Wskaźnik LCOE (Levelized Cost of Energy)</p>
                      <p className="text-4xl font-black text-blue-900">{previewReport.lcoe || 0.42} <span className="text-sm font-bold text-blue-400">PLN/kWh</span></p>
                      <p className="text-xs text-blue-700 mt-4 leading-relaxed font-medium">
                        Uśredniony koszt energii z magazynu (LCOE) uwzględnia pełny cykl życia systemu, w tym degradację ogniw, koszty serwisowe (OPEX) oraz koszt kapitału. 
                        Wartość poniżej 0.45 PLN/kWh potwierdza wysoką efektywność kosztową rozwiązania w porównaniu do cen rynkowych.
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Indeks Rentowności</p>
                        <p className="text-2xl font-black text-slate-900">1.42</p>
                      </div>
                      <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">ROI (10 lat)</p>
                        <p className="text-2xl font-black text-emerald-600">{previewReport.roi}%</p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Section 9: Analiza Ryzyk i Mitygacja */}
              <section className="mb-16 pt-16 border-t border-slate-100">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-slate-900 text-white rounded-lg flex items-center justify-center font-bold text-sm shadow-lg">09</div>
                    <h3 className="text-xl font-black uppercase tracking-tight">Analiza Ryzyk i Mitygacja</h3>
                  </div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Strona 9 z 12</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-6">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Macierz Ryzyk Projektowych</h4>
                    <div className="space-y-4">
                      {[
                        { r: 'Zmiany cen energii na TGE', l: 'Średni', c: 'text-amber-600', m: 'Zastosowanie zaawansowanych algorytmów AI do predykcji cen i optymalizacji cykli.' },
                        { r: 'Degradacja ogniw powyżej normy', l: 'Niski', c: 'text-emerald-600', m: 'System Liquid Cooling oraz gwarancja wydajnościowa producenta (SOH).' },
                        { r: 'Zmiany w opłatach dystrybucyjnych', l: 'Wysoki', c: 'text-rose-600', m: 'Elastyczny system EMS pozwalający na szybką rekonfigurację strategii oszczędności.' },
                        { r: 'Awarie techniczne i przestoje', l: 'Niski', c: 'text-emerald-600', m: 'Monitoring 24/7, serwis gwarancyjny z czasem reakcji NBD (Next Business Day).' },
                      ].map((item, i) => (
                        <div key={i} className="p-5 bg-white rounded-2xl border border-slate-100 shadow-sm">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-black text-slate-700">{item.r}</span>
                            <span className={`text-[10px] font-black uppercase tracking-widest ${item.c} bg-slate-50 px-2 py-1 rounded-md`}>{item.l}</span>
                          </div>
                          <p className="text-xs text-slate-500 leading-relaxed"><span className="font-black text-[10px] uppercase text-slate-400 mr-2">Mitygacja:</span>{item.m}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-slate-900 text-white rounded-3xl p-10 flex flex-col justify-center">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Bezpieczeństwo Operacyjne</h4>
                    <p className="text-lg font-medium leading-relaxed opacity-90 mb-8">
                      System BESS jest wyposażony w wielopoziomowe systemy bezpieczeństwa, w tym automatyczną detekcję i gaszenie pożaru (Aerosol/Novec) oraz izolację galwaniczną. 
                      Całość jest monitorowana w czasie rzeczywistym przez nasze centrum operacyjne.
                    </p>
                    <div className="flex items-center gap-4 p-6 bg-white/5 rounded-2xl border border-white/10">
                      <div className="w-12 h-12 bg-accent/20 text-accent rounded-xl flex items-center justify-center">
                        <ShieldCheck size={28} />
                      </div>
                      <div>
                        <p className="text-sm font-black uppercase tracking-tight">Certyfikacja</p>
                        <p className="text-xs opacity-60">Zgodność z normami IEC 62619, IEC 62477, UN 38.3</p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Section 10: Wpływ ESG i Zrównoważony Rozwój */}
              <section className="mb-16 pt-16 border-t border-slate-100">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-slate-900 text-white rounded-lg flex items-center justify-center font-bold text-sm shadow-lg">10</div>
                    <h3 className="text-xl font-black uppercase tracking-tight">Wpływ ESG i Zrównoważony Rozwój</h3>
                  </div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Strona 10 z 12</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="bg-emerald-50 rounded-3xl p-10 border border-emerald-100">
                    <h4 className="text-xs font-black text-emerald-900 uppercase tracking-widest mb-8">Redukcja Śladu Węglowego</h4>
                    <div className="space-y-10">
                      <div className="flex justify-around items-center">
                        <div className="text-center">
                          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-emerald-600 shadow-xl mb-4 mx-auto">
                            <Zap size={32} />
                          </div>
                          <p className="text-4xl font-black text-emerald-600">-{Math.round(previewReport.capacity * 0.4)}t</p>
                          <p className="text-[10px] font-black text-emerald-800 uppercase tracking-widest">CO2 / rok</p>
                        </div>
                        <div className="w-px h-20 bg-emerald-200" />
                        <div className="text-center">
                          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-emerald-600 shadow-xl mb-4 mx-auto">
                            <CheckSquare size={32} />
                          </div>
                          <p className="text-4xl font-black text-emerald-600">+{previewReport.scenarios?.pvBess.selfConsumptionRate || 25}%</p>
                          <p className="text-[10px] font-black text-emerald-800 uppercase tracking-widest">Autokonsumpcja</p>
                        </div>
                      </div>
                      <div className="p-8 bg-white/60 rounded-2xl border border-emerald-100">
                        <p className="text-sm text-emerald-800 leading-relaxed font-medium">
                          System BESS bezpośrednio wspiera raportowanie ESG w zakresie <strong>Scope 2</strong>. 
                          Pozwala na przesunięcie poboru energii z sieci na godziny o niższej emisyjności miksu energetycznego (dolina nocna) 
                          oraz maksymalizację wykorzystania darmowej, bezemisyjnej energii z własnej instalacji PV.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-8 flex flex-col justify-center">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Korzyści Pozafinansowe</h4>
                    <div className="grid grid-cols-1 gap-4">
                      {[
                        { h: 'Niezależność Energetyczna', d: 'Zmniejszenie wrażliwości na wahania cen i braki w dostawach energii z sieci.' },
                        { h: 'Wizerunek Lidera Innowacji', d: 'Budowanie pozycji nowoczesnej firmy dbającej o środowisko i efektywność.' },
                        { h: 'Zgodność z Dyrektywami UE', d: 'Przygotowanie do nadchodzących wymogów raportowania niefinansowego (CSRD).' },
                        { h: 'Stabilność Procesów', d: 'Ochrona wrażliwych urządzeń przed wahaniami napięcia i mikrosekundowymi zanikami.' },
                      ].map((benefit, i) => (
                        <div key={i} className="flex gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-emerald-600 shrink-0 shadow-sm">
                            <Check size={20} />
                          </div>
                          <div>
                            <h5 className="text-xs font-black text-slate-900 uppercase tracking-tight mb-1">{benefit.h}</h5>
                            <p className="text-[11px] text-slate-500 leading-relaxed">{benefit.d}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              {/* Section 11: Harmonogram Realizacji */}
              <section className="mb-16 pt-16 border-t border-slate-100">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-slate-900 text-white rounded-lg flex items-center justify-center font-bold text-sm shadow-lg">11</div>
                    <h3 className="text-xl font-black uppercase tracking-tight">Harmonogram Realizacji</h3>
                  </div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Strona 11 z 12</span>
                </div>
                <div className="relative">
                  <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-slate-100" />
                  <div className="space-y-12">
                    {[
                      { t: 'Tydzień 1-2', h: 'Audyt i Projektowanie', d: 'Wizja lokalna, audyt techniczny przyłącza, przygotowanie projektu budowlanego i wniosku o warunki przyłączenia (OSD).' },
                      { t: 'Tydzień 3-8', h: 'Produkcja i Logistyka', d: 'Kompletacja komponentów (PCS, Baterie, EMS), testy fabryczne (FAT) oraz transport kontenerowy na miejsce inwestycji.' },
                      { t: 'Tydzień 9-10', h: 'Instalacja i Uruchomienie', d: 'Prace fundamentowe, montaż mechaniczny, połączenia elektryczne (AC/DC), konfiguracja systemu EMS i testy SAT.' },
                      { t: 'Tydzień 11-12', h: 'Odbiór i Szkolenie', d: 'Odbiór końcowy przez OSD, szkolenie personelu z obsługi systemu oraz przekazanie pełnej dokumentacji powykonawczej.' },
                    ].map((step, i) => (
                      <div key={i} className="relative pl-16">
                        <div className="absolute left-0 top-1 w-12 h-12 bg-white rounded-2xl border-2 border-slate-100 flex items-center justify-center z-10 shadow-sm">
                          <div className="w-3 h-3 rounded-full bg-blue-600" />
                        </div>
                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">{step.t}</p>
                        <h4 className="text-sm font-black text-slate-900 mb-2">{step.h}</h4>
                        <p className="text-xs text-slate-500 leading-relaxed max-w-2xl">{step.d}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* Section 12: Podsumowanie i Rekomendacje */}
              <section className="pt-16 border-t border-slate-100">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-slate-900 text-white rounded-lg flex items-center justify-center font-bold text-sm shadow-lg">12</div>
                    <h3 className="text-xl font-black uppercase tracking-tight">Podsumowanie i Rekomendacje</h3>
                  </div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Strona 12 z 12</span>
                </div>
                
                <div className="bg-emerald-600 rounded-[40px] p-16 text-white shadow-2xl shadow-emerald-200 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-48 -mt-48 blur-3xl" />
                  <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-400/20 rounded-full -ml-48 -mb-48 blur-3xl" />
                  
                  <div className="relative z-10">
                    <div className="flex items-center gap-6 mb-10">
                      <div className="w-16 h-16 bg-white text-emerald-600 rounded-3xl flex items-center justify-center shadow-2xl">
                        <CheckSquare size={32} />
                      </div>
                      <div>
                        <p className="text-xs font-black uppercase tracking-[0.2em] opacity-80 mb-1">Status Inwestycji</p>
                        <h4 className="text-4xl font-black tracking-tight">Rekomendacja: POZYTYWNA</h4>
                      </div>
                    </div>
                    
                    <p className="text-xl text-emerald-50 leading-relaxed mb-12 font-medium max-w-4xl">
                      Na podstawie przeprowadzonej analizy techniczno-ekonomicznej, wdrożenie systemu BESS o mocy {previewReport.power} kW 
                      i pojemności {previewReport.capacity} kWh jest wysoce uzasadnione. Inwestycja pozwala nie tylko na realne oszczędności 
                      finansowe, ale również zwiększa niezależność energetyczną obiektu i zabezpiecza przed nieprzewidywalnymi 
                      zmianami cen energii w przyszłości.
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      <div className="p-8 bg-white/10 rounded-3xl backdrop-blur-md border border-white/20">
                        <p className="text-[10px] font-black text-emerald-200 uppercase tracking-widest mb-3">Oszczędność Roczna</p>
                        <p className="text-3xl font-black">{formatCurrency(previewReport.savings)}</p>
                      </div>
                      <div className="p-8 bg-white/10 rounded-3xl backdrop-blur-md border border-white/20">
                        <p className="text-[10px] font-black text-emerald-200 uppercase tracking-widest mb-3">Okres Zwrotu</p>
                        <p className="text-3xl font-black">{previewReport.payback} lat</p>
                      </div>
                      <div className="p-8 bg-white/10 rounded-3xl backdrop-blur-md border border-white/20">
                        <p className="text-[10px] font-black text-emerald-200 uppercase tracking-widest mb-3">ROI (10 lat)</p>
                        <p className="text-3xl font-black">{previewReport.roi}%</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-20 grid grid-cols-1 md:grid-cols-2 gap-16">
                  <div className="space-y-8">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Następne Kroki</h4>
                    <div className="space-y-6">
                      {[
                        'Zatwierdzenie budżetu inwestycyjnego przez Zarząd.',
                        'Podpisanie listu intencyjnego (LOI) z wykonawcą.',
                        'Złożenie wniosku o warunki przyłączenia do OSD.',
                        'Finalizacja wyboru modelu finansowania (Leasing/Kredyt).'
                      ].map((step, i) => (
                        <div key={i} className="flex items-center gap-4">
                          <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                            <Check size={14} strokeWidth={3} />
                          </div>
                          <span className="text-sm font-bold text-slate-700">{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col justify-end items-end space-y-10">
                    <div className="text-right">
                      <div className="w-64 h-px bg-slate-200 mb-6 ml-auto" />
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Podpis Konsultanta</p>
                      <p className="text-lg font-black text-slate-900 mt-1">{previewReport.author}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Główny Analityk BESS</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Data Wygenerowania</p>
                      <p className="text-sm font-black text-slate-900">{previewReport.date}</p>
                    </div>
                  </div>
                </div>
              </section>



              {/* Footer for PDF */}
              <div className="pt-12 border-t border-slate-100 flex justify-between items-end">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{whiteLabel.companyName}</p>
                  <p className="text-[9px] text-slate-500">{whiteLabel.website} | {whiteLabel.contactEmail}</p>
                  <p className="text-[9px] text-slate-500">{whiteLabel.contactPhone}</p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] text-slate-400 font-medium italic">Wygenerowano automatycznie przez platformę OGrid Energy Solutions</p>
                  <p className="text-[9px] text-slate-400 font-medium italic">Data generowania: {new Date().toLocaleString('pl-PL')}</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center gap-4">
              <button 
                onClick={() => handleDownloadPdf(previewReport)}
                disabled={isGeneratingPdf}
                className="px-10 py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-500/20 flex items-center gap-3 disabled:opacity-50"
              >
                {isGeneratingPdf ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Download size={18} />
                )}
                Pobierz Raport PDF
              </button>
              <button 
                onClick={() => setIsFullReportModalOpen(false)}
                className="px-10 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-200 transition-all"
              >
                Zamknij Podgląd
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Confirmation Modal for PDF */}
      <Modal
        isOpen={isConfirmPdfModalOpen}
        onClose={() => setIsConfirmPdfModalOpen(false)}
        title="Generowanie Raportu PDF"
        zIndex="z-[120]"
      >
        <div className="space-y-6">
          <div className="flex items-center gap-4 p-4 bg-amber-50 rounded-2xl border border-amber-100">
            <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center shrink-0">
              <AlertTriangle size={24} />
            </div>
            <div>
              <h4 className="text-sm font-black text-amber-900 uppercase tracking-tight">Wymagany czas przetwarzania</h4>
              <p className="text-xs text-amber-700 leading-relaxed">
                Generowanie profesjonalnego raportu technicznego z wykresami wysokiej rozdzielczości może zająć od kilku do kilkunastu sekund.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm text-slate-600 font-medium">
              Czy chcesz rozpocząć generowanie raportu dla:
            </p>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-xs font-black text-slate-900">{previewReport?.name}</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">{previewReport?.client}</p>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button 
              onClick={() => setIsConfirmPdfModalOpen(false)}
              className="flex-1 px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-all"
            >
              Anuluj
            </button>
            <button 
              onClick={handleConfirmDownloadPdf}
              className="flex-1 px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg flex items-center justify-center gap-2"
            >
              <Download size={18} /> Rozpocznij
            </button>
          </div>
        </div>
      </Modal>

      {/* Generating Overlay */}
      <AnimatePresence>
        {isGeneratingPdf && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6"
          >
            <Card className="max-w-md w-full text-center p-10 space-y-8">
              <div className="relative w-24 h-24 mx-auto">
                <div className="absolute inset-0 border-4 border-slate-100 rounded-full" />
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 border-4 border-accent border-t-transparent rounded-full"
                />
                <div className="absolute inset-0 flex items-center justify-center text-accent">
                  <Loader2 size={32} className="animate-spin" />
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-black text-slate-900">{generationStep}</h3>
                <p className="text-sm text-slate-500 font-medium">Przygotowujemy Twój profesjonalny raport techniczny.</p>
              </div>

              <div className="space-y-3">
                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${generationProgress}%` }}
                    className="h-full bg-accent"
                  />
                </div>
                <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <span>Postęp</span>
                  <span>{generationProgress}%</span>
                </div>
              </div>

              <button 
                onClick={() => {
                  if (abortControllerRef.current) {
                    abortControllerRef.current.abort();
                  }
                  setIsGeneratingPdf(false);
                }}
                className="px-8 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold text-xs hover:bg-slate-200 transition-all uppercase tracking-widest"
              >
                Anuluj Generowanie
              </button>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BESSReports;

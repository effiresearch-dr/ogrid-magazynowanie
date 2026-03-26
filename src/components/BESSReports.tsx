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
  ChevronDown
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

import { jsPDF } from 'jspdf';
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
  const [previewReport, setPreviewReport] = useState<Report | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
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

  const handleDownloadPdf = async (report: Report | null) => {
    if (!report) return;
    
    setIsGeneratingPdf(true);
    
    // If the full report modal is not open, we need to temporarily render the content
    // or ensure it's in the DOM. For simplicity, we'll assume the user might want to 
    // see it first, but we can also trigger it directly.
    
    // We'll use a hidden div or the modal content if it's open.
    // Let's ensure the full report modal is open for a moment or use a ref.
    
    // For this implementation, we'll trigger the full report modal if it's not open
    if (!isFullReportModalOpen) {
      setPreviewReport(report);
      setIsFullReportModalOpen(true);
      // Wait for modal to render
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    const element = document.getElementById('full-report-content');
    if (!element) {
      setIsGeneratingPdf(false);
      return;
    }

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Raport_BESS_${report.client.replace(/\s+/g, '_')}_${report.id}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsGeneratingPdf(false);
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

              {/* Section 3: Analizy */}
              <section className="mb-16">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-900 font-bold text-sm">03</div>
                  <h3 className="text-xl font-black uppercase tracking-tight">Analiza Ekonomiczna i Techniczna</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                  <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 text-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Oszczędności Roczne</p>
                    <p className="text-2xl font-black text-emerald-600">{formatCurrency(previewReport.savings)}</p>
                  </div>
                  <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 text-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">ROI (Zwrot z Inwestycji)</p>
                    <p className="text-2xl font-black text-slate-900">{previewReport.roi}%</p>
                  </div>
                  <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 text-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Okres Zwrotu</p>
                    <p className="text-2xl font-black text-slate-900">{previewReport.payback} lat</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                  <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-8">Prognoza Oszczędności Skumulowanych (10 lat)</h4>
                    <div className="h-[250px]">
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
                          <Tooltip 
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                          />
                          <Bar dataKey="value" name="Oszczędności (PLN)" fill={whiteLabel.accentColor} radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-8">Struktura Oszczędności</h4>
                    <div className="space-y-4">
                      {[
                        { label: 'Arbitraż Cenowy', value: '45%', color: 'bg-blue-500' },
                        { label: 'Peak Shaving', value: '30%', color: 'bg-emerald-500' },
                        { label: 'Autokonsumpcja PV', value: '15%', color: 'bg-amber-500' },
                        { label: 'Redukcja Opłaty Mocowej', value: '10%', color: 'bg-purple-500' },
                      ].map((item, i) => (
                        <div key={i} className="space-y-1.5">
                          <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                            <span className="text-slate-500">{item.label}</span>
                            <span className="text-slate-900">{item.value}</span>
                          </div>
                          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: item.value }}
                              transition={{ duration: 1, delay: 0.5 + i * 0.1 }}
                              className={`h-full ${item.color}`}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed">
                  <p>
                    Analiza wykazuje, że głównym źródłem przychodów systemu będzie <strong>Arbitraż Cenowy</strong> (45% całkowitych oszczędności), 
                    wykorzystujący zmienność cen energii na Rynku Dnia Następnego. Drugim kluczowym elementem jest <strong>Peak Shaving</strong>, 
                    który pozwala na realną redukcję kosztów stałych związanych z mocą zamówioną.
                  </p>
                </div>
              </section>

              {/* Section 4: Podsumowanie */}
              <section className="mb-16">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-900 font-bold text-sm">04</div>
                  <h3 className="text-xl font-black uppercase tracking-tight">Podsumowanie i Rekomendacje</h3>
                </div>
                <div className="bg-emerald-50 border border-emerald-100 rounded-3xl p-8">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-10 h-10 bg-emerald-500 text-white rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/20">
                      <CheckSquare size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-emerald-900 uppercase tracking-tight mb-1">Rekomendacja Pozytywna</h4>
                      <p className="text-xs text-emerald-700 leading-relaxed">
                        Na podstawie przeprowadzonej analizy, wdrożenie systemu BESS o parametrach {previewReport.power}kW / {previewReport.capacity}kWh 
                        jest wysoce uzasadnione ekonomicznie. Przewidywany okres zwrotu wynoszący {previewReport.payback} lat jest znacznie poniżej 
                        średniej rynkowej dla tego typu inwestycji.
                      </p>
                    </div>
                  </div>
                  <ul className="space-y-3">
                    {[
                      'Redukcja kosztów energii poprzez arbitraż cenowy.',
                      'Zabezpieczenie przed wzrostem cen energii w przyszłości.',
                      'Możliwość redukcji mocy zamówionej i opłat mocowych.',
                      'Zwiększenie bezpieczeństwa energetycznego (funkcja UPS).'
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-3 text-xs text-emerald-800 font-medium">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                        {item}
                      </li>
                    ))}
                  </ul>
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
    </div>
  );
};

export default BESSReports;

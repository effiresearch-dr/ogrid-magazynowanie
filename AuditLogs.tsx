/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import BESSWizard from './components/BESSWizard';
import BESSDescription from './components/BESSDescription';
import BESSReports, { Report } from './components/BESSReports';
import AuditLogs from './components/AuditLogs';
import Configurators from './components/Configurators';
import Dashboard from './components/Dashboard';
import { motion, AnimatePresence } from 'motion/react';
import { Cookie, Shield, ExternalLink, LayoutDashboard, Battery, Zap, TrendingUp, Users, FileText, Settings } from 'lucide-react';
import { KPICard, Card } from './components/UI';

export interface WhiteLabelConfig {
  companyName: string;
  logoUrl: string;
  primaryColor: string;
  accentColor: string;
  contactEmail: string;
  contactPhone: string;
  website: string;
  footerText: string;
}

export default function App() {
  const [activeTab, setActiveTab] = useState('bess');
  const [activeSubTab, setActiveSubTab] = useState('bess-desc');
  const [modelingGoal, setModelingGoal] = useState<'arbitrage' | 'peak-shaving' | 'backup'>('arbitrage');
  const [showCookieConsent, setShowCookieConsent] = useState(true);

  // White-label state
  const [whiteLabel, setWhiteLabel] = useState<WhiteLabelConfig>({
    companyName: 'OGRID ENERGY SOLUTIONS',
    logoUrl: 'https://ais-dev-22wtstsgcwx7csvsjbjj65-4399042101.europe-west1.run.app/logo.png', // Placeholder
    primaryColor: '#0f172a',
    accentColor: '#3b82f6',
    contactEmail: 'kontakt@ogrid.pl',
    contactPhone: '+48 123 456 789',
    website: 'www.ogrid.pl',
    footerText: '© 2026 OGRID ENERGY SOLUTIONS • V2.2.0'
  });

  const [forecastSettings, setForecastSettings] = useState({
    distributionGrowthType: 'linear' as 'linear' | 'nonlinear',
    linearGrowthRate: 3.5,
    nonlinearGrowthRates: [4, 5, 3, 2, 2, 2, 2, 2, 2, 2], // 10 years
    energyPriceGrowthType: 'linear' as 'linear' | 'nonlinear',
    energyPriceGrowthRate: 5.0,
    energyPriceNonlinearRates: [5, 6, 4, 3, 3, 3, 3, 3, 3, 3] // 10 years
  });
  
  // Shared reports state
  const [reports, setReports] = useState<Report[]>([
    { id: 'R-2024-001', name: 'Symulacja Przemysłowa A', date: '2024-03-15', status: 'Zakończony', client: 'TechCorp Sp. z o.o.', nip: '525-000-00-00', power: 500, capacity: 1000, savings: 125000, payback: 4.2, roi: 24.5, customerType: 'company', companySize: 'large', author: 'Jan Kowalski' },
    { id: 'R-2024-002', name: 'Analiza Biurowiec B', date: '2024-03-18', status: 'Wersja Robocza', client: 'GreenOffice SA', nip: '123-456-78-90', power: 250, capacity: 500, savings: 45000, payback: 5.8, roi: 18.2, customerType: 'company', companySize: 'medium', author: 'Anna Nowak' },
    { id: 'R-2024-003', name: 'Optymalizacja Magazyn C', date: '2024-03-20', status: 'Zakończony', client: 'Logistics Plus', nip: '987-654-32-10', power: 1000, capacity: 2000, savings: 280000, payback: 3.9, roi: 31.0, customerType: 'company', companySize: 'extra-large', author: 'Jan Kowalski' },
    { id: 'R-2024-004', name: 'Dom Jednorodzinny D', date: '2024-03-22', status: 'Zakończony', client: 'Marek Wiśniewski', nip: 'PL123456789', power: 10, capacity: 20, savings: 12000, payback: 6.5, roi: 15.4, customerType: 'individual', author: 'Piotr Zieliński' },
    { id: 'R-2024-005', name: 'Sklep Spożywczy E', date: '2024-03-24', status: 'Zakończony', client: 'Lokalny Sklep', nip: 'PL987654321', power: 50, capacity: 100, savings: 35000, payback: 5.2, roi: 19.8, customerType: 'company', companySize: 'small', author: 'Anna Nowak' },
    { id: 'R-2024-006', name: 'Gospodarstwo Mieszane F', date: '2024-03-25', status: 'Wersja Robocza', client: 'Agro-Mix', nip: 'PL555444333', power: 150, capacity: 300, savings: 85000, payback: 4.8, roi: 22.1, customerType: 'mixed', author: 'Jan Kowalski' },
  ]);

  const handleSaveReport = (newReport: Report) => {
    setReports(prev => [newReport, ...prev]);
  };

  useEffect(() => {
    const consent = localStorage.getItem('ogrid_cookie_consent');
    if (consent) setShowCookieConsent(false);
  }, []);

  const acceptCookies = () => {
    localStorage.setItem('ogrid_cookie_consent', 'true');
    setShowCookieConsent(false);
  };

  const renderContent = () => {
    if (activeTab === 'dashboard') {
      return (
        <motion.div
          key="dashboard"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <div className="mb-8">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Pulpit Zarządczy</h2>
            <p className="text-slate-500">Przegląd wydajności, symulacji i generowanych oszczędności.</p>
          </div>
          <Dashboard 
            reports={reports} 
            onNavigate={(tab, subTab) => {
              setActiveTab(tab);
              if (subTab) setActiveSubTab(subTab);
            }} 
          />
        </motion.div>
      );
    }

    if (activeTab === 'bess') {
      switch (activeSubTab) {
        case 'bess-desc':
          return (
            <motion.div
              key="bess-desc"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <div className="mb-8">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Moduł opisowy</h2>
                <p className="text-slate-500">Poznaj możliwości i korzyści płynące z systemów magazynowania energii.</p>
              </div>
              <BESSDescription 
                onStartModeling={() => setActiveSubTab('bess-model')} 
                modelingGoal={modelingGoal}
                setModelingGoal={setModelingGoal}
              />
            </motion.div>
          );
        case 'bess-model':
          return (
            <motion.div
              key="bess-model"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <div className="mb-8">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Moduł modelowania BESS</h2>
                <p className="text-slate-500">Zaawansowane modelowanie arbitrażu i optymalizacji systemów magazynowania.</p>
              </div>
              <BESSWizard 
                modelingGoal={modelingGoal} 
                setModelingGoal={setModelingGoal}
                onOpenAuditLogs={() => setActiveSubTab('bess-audit-logs')}
                onSaveReport={handleSaveReport}
                onNavigate={(tab, subTab) => {
                  setActiveTab(tab);
                  if (subTab) setActiveSubTab(subTab);
                }}
                forecastSettings={forecastSettings}
                setForecastSettings={setForecastSettings}
              />
            </motion.div>
          );
        case 'bess-reports':
          return (
            <motion.div
              key="bess-reports"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <div className="mb-8">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Moduł raportowy</h2>
                <p className="text-slate-500">Przeglądaj i eksportuj wyniki swoich symulacji i analiz.</p>
              </div>
              <BESSReports reports={reports} setReports={setReports} whiteLabel={whiteLabel} />
            </motion.div>
          );
        case 'bess-audit-logs':
          return (
            <motion.div
              key="bess-audit-logs"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <div className="mb-8">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Logi Audytowe</h2>
                <p className="text-slate-500">Pełna historia zdarzeń systemowych i operacji użytkownika.</p>
              </div>
              <AuditLogs />
            </motion.div>
          );
        default:
          return (
            <BESSWizard 
              modelingGoal={modelingGoal} 
              setModelingGoal={setModelingGoal}
              onOpenAuditLogs={() => setActiveSubTab('bess-audit-logs')}
            />
          );
      }
    }

    if (activeTab === 'configurators') {
      return (
        <motion.div
          key="configurators"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
        >
          <div className="mb-8">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Konfiguratory Systemowe</h2>
            <p className="text-slate-500">Zarządzaj regułami wnioskowania i stawkami rynkowymi.</p>
          </div>
          <Configurators 
            initialTab={
              activeSubTab === 'config-rules' ? 'rules' : 
              activeSubTab === 'config-white-label' ? 'white-label' : 
              activeSubTab === 'config-report-builder' ? 'report-builder' : 
              'prices'
            } 
            whiteLabel={whiteLabel}
            onUpdateWhiteLabel={setWhiteLabel}
            onTabChange={setActiveSubTab}
            forecastSettings={forecastSettings}
            setForecastSettings={setForecastSettings}
          />
        </motion.div>
      );
    }

    return (
      <motion.div
        key="other-content"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="flex flex-col items-center justify-center h-[60vh] text-slate-400"
      >
        <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mb-4">
          <Shield size={40} className="opacity-20" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">Moduł w przygotowaniu</h3>
        <p className="text-sm">Ten widok zostanie zaimplementowany w kolejnej iteracji.</p>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        activeSubTab={activeSubTab}
        setActiveSubTab={setActiveSubTab}
      />
      
      <main className="flex-1 ml-[250px] flex flex-col min-h-screen">
        <Topbar 
          title={activeTab === 'bess' ? 'Magazynowanie Energii' : 'Pulpit'} 
          activeTab={activeTab}
          activeSubTab={activeSubTab}
          modelingGoal={modelingGoal}
        />
        
        <div className="p-8 flex-1">
          <AnimatePresence mode="wait">
            {renderContent()}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <footer className="bg-white border-t border-slate-100 py-8 px-8 mt-auto">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-4">
              <div 
                className="w-8 h-8 rounded flex items-center justify-center text-white font-bold text-xs"
                style={{ backgroundColor: whiteLabel.primaryColor }}
              >
                {whiteLabel.companyName.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">{whiteLabel.companyName}</p>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest">Technology Provider</p>
              </div>
            </div>
            
            <nav className="flex items-center gap-6 text-[10px] font-bold uppercase tracking-widest text-slate-500">
              <a href="#" className="hover:text-accent transition-colors">Regulamin</a>
              <a href="#" className="hover:text-accent transition-colors">Polityka Prywatności</a>
              <a href="#" className="hover:text-accent transition-colors">Licencja</a>
              <a href="#" className="hover:text-accent transition-colors flex items-center gap-1">
                Download PDF <ExternalLink size={10} />
              </a>
            </nav>
            
            <p className="text-[10px] text-slate-400 font-medium">
              {whiteLabel.footerText}
            </p>
          </div>
        </footer>
      </main>

      {/* Cookie Consent */}
      <AnimatePresence>
        {showCookieConsent && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-full max-w-2xl px-4"
          >
            <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-2xl border border-white/10 flex flex-col md:flex-row items-center gap-6">
              <div className="w-12 h-12 bg-accent/20 text-accent rounded-xl flex items-center justify-center shrink-0">
                <Cookie size={24} />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h4 className="text-sm font-bold mb-1">Prywatność i Pliki Cookie</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Używamy plików cookie, aby zapewnić najlepszą jakość korzystania z naszej witryny i analizować ruch. 
                  Wszystkie dane są przetwarzane zgodnie z RODO.
                </p>
              </div>
              <div className="flex gap-3 shrink-0">
                <button className="text-xs font-bold px-4 py-2 hover:text-accent transition-colors">Ustawienia</button>
                <button 
                  onClick={acceptCookies}
                  className="bg-accent text-white text-xs font-bold px-6 py-2 rounded-lg hover:bg-blue-600 transition-all shadow-lg shadow-blue-500/20"
                >
                  Akceptuj
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

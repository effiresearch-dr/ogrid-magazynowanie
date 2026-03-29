import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Zap, 
  TrendingUp, 
  ShieldCheck, 
  ArrowRight,
  Battery,
  Layers,
  Download,
  Shield
} from 'lucide-react';
import { Card } from './UI';

interface BESSDescriptionProps {
  onStartModeling: () => void;
  modelingGoal: 'arbitrage' | 'peak-shaving' | 'backup';
  setModelingGoal: (goal: 'arbitrage' | 'peak-shaving' | 'backup') => void;
}

const BESSDescription: React.FC<BESSDescriptionProps> = ({ onStartModeling, modelingGoal, setModelingGoal }) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = () => {
    setIsDownloading(true);
    setTimeout(() => {
      setIsDownloading(false);
      alert("Pobieranie specyfikacji techniczno-handlowej (PDF)... Dokument zawiera analizę ROI, schematy oraz wybrane modele BESS.");
    }, 1500);
  };

  const goals = [
    {
      id: 'arbitrage',
      icon: Zap,
      title: "Arbitraż Cenowy",
      desc: "Inteligentne ładowanie w dolinach cenowych i rozładowywanie podczas szczytów zapotrzebowania.",
      color: "text-amber-500",
      bg: "bg-amber-50"
    },
    {
      id: 'peak-shaving',
      icon: TrendingUp,
      title: "Peak Shaving",
      desc: "Redukcja mocy zamówionej poprzez eliminację chwilowych skoków poboru energii z sieci.",
      color: "text-blue-500",
      bg: "bg-blue-50"
    },
    {
      id: 'backup',
      icon: ShieldCheck,
      title: "Backup & UPS",
      desc: "Gwarancja ciągłości zasilania dla procesów krytycznych w Twoim przedsiębiorstwie.",
      color: "text-emerald-500",
      bg: "bg-emerald-50"
    }
  ];

  return (
    <div className="space-y-12 pb-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-[2.5rem] bg-slate-900 text-white p-12 md:p-20">
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-l from-accent/50 to-transparent" />
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0 100 C 20 0 50 0 100 100 Z" fill="currentColor" />
          </svg>
        </div>

        <div className="relative z-10 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-accent/20 text-accent text-[10px] font-black uppercase tracking-[0.2em] mb-6">
              Optymalizacja inwestycyjna
            </span>
            <h1 className="text-5xl md:text-6xl font-black tracking-tight mb-8 leading-[0.95]">
              Przyszłość <span className="text-accent">Magazynowania</span> Energii.
            </h1>
            <p className="text-lg text-slate-400 mb-10 leading-relaxed">
              Poznaj zaawansowane narzędzie do modelowania i optymalizacji doboru i pracy systemów bateryjnych systemów magazynowania energii (BESS). 
              Zredukuj koszty, zwiększ autokonsumpcję oraz zabezpiecz swoją infrastrukturę i potrzeby energetyczne - uniknij błędów jako inwestor i użytkownik magazynu energii.
            </p>
            <div className="flex flex-wrap gap-4">
              <button 
                onClick={onStartModeling}
                className="bg-accent hover:bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold transition-all shadow-xl shadow-blue-500/20 flex items-center gap-3 group"
              >
                Rozpocznij modelowanie <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button 
                onClick={handleDownload}
                disabled={isDownloading}
                className="bg-white/5 hover:bg-white/10 text-white px-8 py-4 rounded-2xl font-bold transition-all border border-white/10 flex items-center gap-3"
              >
                {isDownloading ? "Generowanie..." : "Pobierz specyfikację"} <Download size={20} className={isDownloading ? "animate-bounce" : ""} />
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Interactive Goals Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Wybierz cel modelowania</h2>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Kliknij kartę, aby zobaczyć symulację</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {goals.map((goal) => (
            <motion.div
              key={goal.id}
              whileHover={{ y: -5 }}
              onClick={() => setModelingGoal(goal.id as any)}
              className="cursor-pointer"
            >
              <Card className={`h-full transition-all duration-300 border-2 ${
                modelingGoal === goal.id ? 'border-accent bg-blue-50/30' : 'hover:border-slate-200'
              }`}>
                <div className={`w-14 h-14 ${goal.bg} rounded-2xl flex items-center justify-center mb-6 transition-colors`}>
                  <goal.icon className={goal.color} size={28} />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-3 tracking-tight">{goal.title}</h3>
                <p className="text-slate-500 leading-relaxed text-sm">{goal.desc}</p>
                
                {modelingGoal === goal.id && (
                  <motion.div 
                    layoutId="active-goal"
                    className="mt-6 flex items-center gap-2 text-accent font-bold text-xs uppercase tracking-widest"
                  >
                    <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                    Wybrany cel
                  </motion.div>
                )}
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Dynamic Visualization Section */}
      <Card title="Wizualizacja Procesu" subtitle={`Symulacja dla celu: ${goals.find(g => g.id === modelingGoal)?.title}`}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 p-4">
          <div className="space-y-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={modelingGoal}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-8"
              >
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                  <h4 className="text-lg font-bold text-slate-900 mb-2">Charakterystyka modelu</h4>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    {modelingGoal === 'arbitrage' && "Model skupia się na maksymalizacji zysku z różnic cenowych na TGE (Rynek Dnia Następnego). System planuje cykle ładowania w godzinach najniższych cen."}
                    {modelingGoal === 'peak-shaving' && "Algorytm doboru priorytetyzuje redukcję szczytowego poboru mocy, co pozwala na obniżenie opłat dystrybucyjnych i uniknięcie kar za przekroczenie mocy zamówionej."}
                    {modelingGoal === 'backup' && "System utrzymuje rezerwę energii (SOC) na poziomie gwarantującym podtrzymanie kluczowych odbiorników w firmie lub gospodarstwie domowym w przypadku awarii sieci zewnętrznej."}
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Oszczędność</p>
                    <p className="text-2xl font-black text-slate-900">
                      {modelingGoal === 'arbitrage' ? "15-25%" : modelingGoal === 'peak-shaving' ? "30-45%" : "Bezpieczeństwo"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Priorytet</p>
                    <p className="text-2xl font-black text-accent">
                      {modelingGoal === 'arbitrage' ? "ROI" : modelingGoal === 'peak-shaving' ? "Moc" : "Ciągłość"}
                    </p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
          
          <div className="bg-slate-900 rounded-[2rem] p-8 flex flex-col items-center justify-center relative overflow-hidden min-h-[400px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={modelingGoal}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.1 }}
                className="w-full relative z-10"
              >
                {modelingGoal === 'arbitrage' && (
                  <div className="space-y-6">
                    <div className="relative h-48 w-full overflow-hidden bg-slate-800/50 rounded-2xl p-4">
                      {/* Scanning Line */}
                      <motion.div 
                        className="absolute top-0 bottom-0 w-1 bg-accent z-20 shadow-[0_0_20px_rgba(59,130,246,1)]"
                        animate={{ left: ['0%', '100%'] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                      />
                      
                      {/* Price Curve Line */}
                      <svg className="absolute inset-0 w-full h-full z-15 opacity-30" preserveAspectRatio="none">
                        <motion.path
                          d="M 0 150 Q 50 100 100 160 T 200 120 T 300 180 T 400 100 T 500 150"
                          fill="none"
                          stroke="white"
                          strokeWidth="2"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
                        />
                      </svg>

                      <div className="flex items-end gap-1.5 h-full relative z-10">
                        {[30, 20, 15, 25, 60, 90, 85, 70, 40, 35, 20, 15].map((h, i) => (
                          <div key={i} className="flex-1 flex flex-col justify-end gap-1 relative h-full">
                            <motion.div 
                              initial={{ height: 0 }}
                              animate={{ 
                                height: [`${h}%`, `${h + 15}%`, `${h}%`],
                                opacity: [0.6, 1, 0.6]
                              }}
                              transition={{
                                height: { duration: 2, repeat: Infinity, ease: "easeInOut", delay: i * 0.1 },
                                opacity: { duration: 2, repeat: Infinity, ease: "easeInOut", delay: i * 0.1 }
                              }}
                              className={`w-full rounded-t-md transition-colors duration-500 ${
                                h < 30 ? 'bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.6)]' : 
                                h > 70 ? 'bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.6)]' : 
                                'bg-slate-600'
                              }`}
                            />
                            {h < 30 && (
                              <motion.div 
                                animate={{ 
                                  opacity: [0, 1, 0], 
                                  scale: [0.8, 1.4, 0.8], 
                                  y: [0, -15, 0] 
                                }}
                                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                                className="absolute -top-10 left-1/2 -translate-x-1/2"
                              >
                                <Zap size={14} className="text-emerald-400" />
                              </motion.div>
                            )}
                            {h > 70 && (
                              <motion.div 
                                animate={{ 
                                  opacity: [0, 1, 0], 
                                  scale: [0.8, 1.4, 0.8], 
                                  y: [0, 15, 0] 
                                }}
                                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                                className="absolute -top-10 left-1/2 -translate-x-1/2"
                              >
                                <TrendingUp size={14} className="text-red-400" />
                              </motion.div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-between text-[9px] font-black text-slate-400 uppercase tracking-[0.15em]">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                        <span>Ładowanie (Tania Energia)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>Oddawanie (Szczyt Cenowy)</span>
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
                      </div>
                    </div>
                  </div>
                )}

                {modelingGoal === 'peak-shaving' && (
                  <div className="space-y-6">
                    <div className="relative h-40 w-full border-b border-slate-700">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ 
                          width: '100%',
                          opacity: [0.5, 1, 0.5]
                        }}
                        transition={{
                          width: { duration: 1 },
                          opacity: { duration: 2, repeat: Infinity }
                        }}
                        className="absolute top-1/2 left-0 w-full h-px bg-red-500 border-t border-dashed border-red-500 z-20 shadow-[0_0_10px_rgba(239,68,68,0.5)]"
                      >
                        <span className="absolute -top-4 right-0 text-[8px] font-bold text-red-500 uppercase">Limit Mocy</span>
                      </motion.div>
                      <div className="flex items-end gap-1 h-full">
                        {[40, 50, 45, 85, 95, 80, 40, 35, 90, 85, 40, 30].map((h, i) => (
                          <div key={i} className="flex-1 relative h-full flex flex-col justify-end">
                            <motion.div 
                              initial={{ height: 0 }}
                              animate={{ height: `${h}%` }}
                              className={`w-full rounded-t-sm ${h > 50 ? 'bg-accent' : 'bg-slate-700'}`}
                            />
                            {h > 50 && (
                              <motion.div 
                                initial={{ height: 0 }}
                                animate={{ height: `${h - 50}%` }}
                                className="absolute bottom-[50%] left-0 w-full bg-slate-900/80 border-x border-slate-900"
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                    <p className="text-center text-[10px] font-bold text-slate-500 uppercase tracking-widest">Redukcja szczytów przez BESS</p>
                  </div>
                )}

                {modelingGoal === 'backup' && (
                  <div className="flex flex-col items-center gap-8">
                    <div className="relative w-48 h-48">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="45" fill="none" stroke="#1e293b" strokeWidth="8" />
                        <motion.circle 
                          cx="50" cy="50" r="45" fill="none" stroke="#10b981" strokeWidth="8"
                          strokeDasharray="283"
                          initial={{ strokeDashoffset: 283 }}
                          animate={{ strokeDashoffset: 283 * (1 - 0.8) }}
                          transition={{ duration: 2 }}
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <motion.div
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <Battery className="text-emerald-500 mb-1" size={32} />
                        </motion.div>
                        <span className="text-2xl font-black text-white">80%</span>
                        <span className="text-[8px] font-bold text-slate-500 uppercase">Rezerwa UPS</span>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                        <span className="text-[10px] font-bold text-white uppercase tracking-widest">Sieć OK</span>
                      </div>
                      <div className="flex items-center gap-2 opacity-30">
                        <div className="w-2 h-2 bg-red-500 rounded-full" />
                        <span className="text-[10px] font-bold text-white uppercase tracking-widest">Awaria</span>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
            
            <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-accent/5 rounded-full blur-3xl" />
          </div>
        </div>
      </Card>

      {/* Technical Section: Electrical Diagram & Specs */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <Card title="Schemat Integracji" subtitle="Uproszczony schemat elektryczny systemu BESS">
          <div className="bg-slate-50 rounded-2xl p-8 flex items-center justify-center min-h-[400px]">
            <svg width="400" height="300" viewBox="0 0 400 300" className="text-slate-900">
              {/* Grid */}
              <rect x="20" y="120" width="60" height="60" rx="8" fill="white" stroke="currentColor" strokeWidth="2" />
              <text x="50" y="155" textAnchor="middle" className="text-[10px] font-black fill-slate-900">SIEĆ AC</text>
              
              {/* Inverter */}
              <rect x="160" y="100" width="80" height="100" rx="12" fill="white" stroke="currentColor" strokeWidth="2" />
              <text x="200" y="145" textAnchor="middle" className="text-[10px] font-black fill-slate-900">FALOWNIK</text>
              <text x="200" y="160" textAnchor="middle" className="text-[8px] font-bold fill-slate-400 uppercase">Hybrydowy</text>
              
              {/* Battery */}
              <rect x="320" y="120" width="60" height="60" rx="8" fill="white" stroke="currentColor" strokeWidth="2" />
              <text x="350" y="155" textAnchor="middle" className="text-[10px] font-black fill-slate-900">BATERIA</text>
              
              {/* Loads */}
              <rect x="160" y="20" width="80" height="40" rx="8" fill="white" stroke="currentColor" strokeWidth="2" />
              <text x="200" y="45" textAnchor="middle" className="text-[10px] font-black fill-slate-900">ODBIORY</text>

              {/* Connections */}
              <line x1="80" y1="150" x2="160" y2="150" stroke="currentColor" strokeWidth="2" strokeDasharray="4" />
              <line x1="240" y1="150" x2="320" y2="150" stroke="currentColor" strokeWidth="2" />
              <line x1="200" y1="100" x2="200" y2="60" stroke="currentColor" strokeWidth="2" />
              
              {/* Flow Arrows */}
              <motion.circle r="4" fill="#3b82f6" initial={{ cx: 80, cy: 150 }} animate={{ cx: 160 }} transition={{ duration: 2, repeat: Infinity }} />
              <motion.circle r="4" fill="#10b981" initial={{ cx: 320, cy: 150 }} animate={{ cx: 240 }} transition={{ duration: 2, repeat: Infinity }} />
            </svg>
          </div>
        </Card>

        <Card title="Specyfikacja Techniczna" subtitle="Przykładowe parametry jednostek BESS">
          <div className="overflow-hidden rounded-xl border border-slate-100">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-4 py-3 font-black text-[10px] text-slate-400 uppercase tracking-widest">Parametr</th>
                  <th className="px-4 py-3 font-black text-[10px] text-slate-400 uppercase tracking-widest">BESS-50</th>
                  <th className="px-4 py-3 font-black text-[10px] text-slate-400 uppercase tracking-widest">BESS-200</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {[
                  { p: "Moc znamionowa", v1: "50 kW", v2: "200 kW" },
                  { p: "Pojemność użyteczna", v1: "100 kWh", v2: "400 kWh" },
                  { p: "Technologia ogniw", v1: "LiFePO4", v2: "LiFePO4" },
                  { p: "Żywotność (cykle)", v1: "6000+", v2: "8000+" },
                  { p: "Sprawność Round-trip", v1: ">95%", v2: ">97%" },
                  { p: "Czas przełączenia UPS", v1: "<10ms", v2: "<10ms" },
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3 font-bold text-slate-900">{row.p}</td>
                    <td className="px-4 py-3 text-slate-500">{row.v1}</td>
                    <td className="px-4 py-3 text-slate-500">{row.v2}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-6 p-4 bg-blue-50 rounded-xl flex items-start gap-3">
            <Layers className="text-accent shrink-0" size={20} />
            <p className="text-xs text-slate-600 leading-relaxed">
              Wszystkie systemy OGrid są modułowe. Możliwość skalowania do 2MWh w ramach jednej szafy sterowniczej.
            </p>
          </div>
        </Card>
      </div>

      {/* Real Photo Mockup Section */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="space-y-6">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-tight">
            Design klasy przemysłowej. <br />
            Niezawodność klasy militarnej.
          </h2>
          <p className="text-slate-500 leading-relaxed">
            Nasze kontenery magazynowe są zaprojektowane do pracy w ekstremalnych warunkach od -30°C do +50°C. 
            Zintegrowany system gaszenia aerozolowego oraz aktywne chłodzenie cieczą gwarantują najwyższy poziom bezpieczeństwa.
          </p>
          <ul className="space-y-3">
            {['Certyfikacja CE & TUV', 'Monitoring 24/7 Cloud', 'Gwarancja 10 lat'].map((item, i) => (
              <li key={i} className="flex items-center gap-3 text-sm font-bold text-slate-700">
                <div className="w-5 h-5 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                  <ShieldCheck size={12} />
                </div>
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="relative group overflow-hidden rounded-[2.5rem]">
          <img 
            src="https://picsum.photos/seed/energy-storage/800/600" 
            alt="BESS Container" 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
          <div className="absolute bottom-8 left-8">
            <p className="text-white font-black text-xl">OGrid Container Series</p>
            <p className="text-white/70 text-xs font-bold uppercase tracking-widest">Model 2026 / 1.2 MWh</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="text-center py-12">
        <h2 className="text-3xl font-black text-slate-900 mb-6 tracking-tight">Gotowy na transformację energetyczną?</h2>
        <p className="text-slate-500 mb-10 max-w-xl mx-auto">
          Wybierz cel modelowania powyżej i przejdź do konfiguratora, aby otrzymać darmową analizę ROI dla Twojej firmy.
        </p>
        <div className="flex justify-center gap-4">
          <button 
            onClick={onStartModeling}
            className="bg-accent hover:bg-blue-600 text-white px-10 py-4 rounded-2xl font-bold transition-all shadow-xl shadow-blue-500/20"
          >
            Uruchom Kreator Modelu
          </button>
        </div>
      </section>
    </div>
  );
};

export default BESSDescription;

import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  Zap, 
  Users, 
  Battery, 
  ChevronRight, 
  ArrowUpRight, 
  PieChart as PieChartIcon, 
  BarChart3, 
  Calendar,
  Filter,
  User,
  Building2,
  Users as UsersIcon,
  Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  Legend 
} from 'recharts';
import { Report } from './BESSReports';
import { KPICard, Card } from './UI';

interface DashboardProps {
  reports: Report[];
  onNavigate: (tab: string, subTab?: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ reports, onNavigate }) => {
  const [userFilter, setUserFilter] = useState<string>('all');

  // Available authors for filtering
  const authors = useMemo(() => {
    const uniqueAuthors = Array.from(new Set(reports.map(r => r.author)));
    return ['all', ...uniqueAuthors];
  }, [reports]);

  // Data for Customer Type Distribution
  const customerTypeData = useMemo(() => {
    const counts = {
      individual: 0,
      company: 0,
      mixed: 0
    };
    reports.forEach(r => {
      counts[r.customerType]++;
    });
    return [
      { name: 'Indywidualny', value: counts.individual, color: '#3b82f6' },
      { name: 'Firma', value: counts.company, color: '#10b981' },
      { name: 'Mieszany', value: counts.mixed, color: '#f59e0b' }
    ];
  }, [reports]);

  // Data for Savings by Company Size
  const savingsBySizeData = useMemo(() => {
    const sizes = {
      small: 0,
      medium: 0,
      large: 0,
      'extra-large': 0
    };
    reports.filter(r => r.customerType === 'company').forEach(r => {
      if (r.companySize) {
        sizes[r.companySize] += r.savings;
      }
    });
    return [
      { name: 'Mała', value: sizes.small },
      { name: 'Średnia', value: sizes.medium },
      { name: 'Duża', value: sizes.large },
      { name: 'Bardzo Duża', value: sizes['extra-large'] }
    ];
  }, [reports]);

  // Data for Cumulative Growth Chart
  const growthData = useMemo(() => {
    const filteredReports = userFilter === 'all' 
      ? reports 
      : reports.filter(r => r.author === userFilter);
    
    // Sort by date
    const sorted = [...filteredReports].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    let cumulative = 0;
    return sorted.map(r => {
      cumulative++;
      return {
        date: r.date,
        count: cumulative,
        name: r.name
      };
    });
  }, [reports, userFilter]);

  const totalSavings = useMemo(() => reports.reduce((acc, r) => acc + r.savings, 0), [reports]);
  const avgROI = useMemo(() => reports.length > 0 ? reports.reduce((acc, r) => acc + r.roi, 0) / reports.length : 0, [reports]);

  return (
    <div className="space-y-8">
      {/* KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onClick={() => onNavigate('bess', 'bess-reports')}
          className="cursor-pointer"
        >
          <KPICard 
            title="Wszystkie Raporty" 
            value={reports.length.toString()} 
            icon={Battery} 
            trend="+2 w tym tygodniu" 
          />
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onClick={() => onNavigate('bess', 'bess-model')}
          className="cursor-pointer"
        >
          <KPICard 
            title="Aktywne Symulacje" 
            value={(reports.filter(r => r.status === 'Wersja Robocza').length + 3).toString()} 
            icon={Zap} 
            trend="+15% vs poprz. miesiąc" 
          />
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <KPICard 
            title="Całkowite Oszczędności" 
            value={`${(totalSavings / 1000).toFixed(1)}k PLN`} 
            icon={TrendingUp} 
            trend="+8% vs poprz. miesiąc" 
          />
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <KPICard 
            title="Średni ROI" 
            value={`${avgROI.toFixed(1)}%`} 
            icon={Users} 
          />
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Customer Type Distribution */}
        <Card title="Struktura Klientów" subtitle="Podział wg typu odbiorcy">
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={customerTypeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={8}
                  dataKey="value"
                  animationBegin={0}
                  animationDuration={1500}
                  stroke="none"
                >
                  {customerTypeData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color} 
                      className="hover:opacity-80 transition-opacity cursor-pointer outline-none"
                    />
                  ))}
                </Pie>
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      const total = reports.length || 1;
                      const percentage = ((data.value / total) * 100).toFixed(1);
                      return (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="bg-slate-900/95 backdrop-blur-md border border-slate-800 p-4 rounded-2xl shadow-2xl min-w-[160px]"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{data.name}</p>
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: data.color }} />
                          </div>
                          <div className="flex items-baseline gap-2">
                            <p className="text-2xl font-black text-white">{data.value}</p>
                            <p className="text-sm font-bold text-accent">{percentage}%</p>
                          </div>
                          <div className="mt-2 pt-2 border-t border-slate-800">
                            <p className="text-[10px] text-slate-500 font-medium">Udział w całej bazie raportów</p>
                          </div>
                        </motion.div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={60}
                  iconType="circle"
                  iconSize={10}
                  wrapperStyle={{ paddingTop: '20px' }}
                  formatter={(value, entry: any) => {
                    const data = customerTypeData.find(d => d.name === value);
                    const total = reports.length || 1;
                    const percentage = data ? ((data.value / total) * 100).toFixed(0) : 0;
                    return (
                      <span className="text-[11px] font-black text-slate-600 uppercase ml-2 tracking-tight">
                        {value} <span className="text-slate-400 font-bold ml-1">{percentage}%</span>
                      </span>
                    );
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Savings by Company Size */}
        <Card title="Oszczędności B2B" subtitle="Suma oszczędności wg wielkości firmy (PLN)">
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={savingsBySizeData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
                />
                <Tooltip 
                  cursor={{ fill: '#f1f5f9' }}
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    border: 'none', 
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '10px',
                    fontWeight: 'bold'
                  }}
                />
                <Bar dataKey="value" fill="#10b981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Recent Activity */}
        <Card title="Ostatnie Raporty" subtitle="Najnowsze wyniki symulacji">
          <div className="space-y-4">
            {reports.slice(0, 5).map((report, index) => (
              <motion.div 
                key={report.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => onNavigate('bess', 'bess-reports')}
                className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-accent transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${report.status === 'Zakończony' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                    {report.customerType === 'individual' ? <User size={20} /> : <Building2 size={20} />}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 group-hover:text-accent transition-colors">{report.name}</p>
                    <p className="text-[10px] text-slate-400 font-medium">{report.client}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-black text-slate-900">+{report.savings.toLocaleString()} PLN</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">{report.date}</p>
                </div>
              </motion.div>
            ))}
            <button 
              onClick={() => onNavigate('bess', 'bess-reports')}
              className="w-full py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-accent transition-colors"
            >
              Zobacz wszystkie raporty
            </button>
          </div>
        </Card>
      </div>

      {/* Growth Chart */}
      <Card 
        title="Przyrost Symulacji i Raportów" 
        subtitle="Skumulowana liczba wykonanych analiz w czasie"
      >
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-xl border border-slate-200">
                <Filter size={14} className="text-slate-400" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Filtruj użytkownika:</span>
              </div>
              <select 
                value={userFilter}
                onChange={(e) => setUserFilter(e.target.value)}
                className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-accent/20 outline-none"
              >
                {authors.map(author => (
                  <option key={author} value={author}>
                    {author === 'all' ? 'Wszyscy użytkownicy' : author}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-accent rounded-full" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Liczba Analiz</span>
              </div>
            </div>
          </div>

          <div className="h-[400px] w-full bg-slate-50 rounded-3xl p-6 border border-slate-100">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={growthData}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis 
                  dataKey="date" 
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
                  dataKey="count" 
                  stroke="#3b82f6" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorCount)" 
                  animationDuration={2000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;

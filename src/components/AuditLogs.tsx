import React from 'react';
import { Card } from './UI';
import { FileText, Search, Download, Filter } from 'lucide-react';

const AuditLogs: React.FC = () => {
  const logs = [
    { id: 1, time: '2026-03-26 11:15:10', user: 'admin@ogrid.pl', action: 'Zmiana celu modelowania', details: 'Arbitraż -> Peak Shaving', status: 'Sukces' },
    { id: 2, time: '2026-03-26 11:14:05', user: 'admin@ogrid.pl', action: 'Aktualizacja profilu PPE', details: 'Taryfa C1x -> C2x', status: 'Sukces' },
    { id: 3, time: '2026-03-26 11:12:45', user: 'system', action: 'Synchronizacja TGE', details: 'Pobrano ceny dla RCE', status: 'Sukces' },
    { id: 4, time: '2026-03-26 11:10:20', user: 'admin@ogrid.pl', action: 'Eksport raportu', details: 'REP-2026-001 (PDF)', status: 'Sukces' },
    { id: 5, time: '2026-03-26 11:05:15', user: 'admin@ogrid.pl', action: 'Logowanie', details: 'IP: 192.168.1.45', status: 'Sukces' },
    { id: 6, time: '2026-03-26 10:55:30', user: 'system', action: 'Błąd walidacji', details: 'Nieprawidłowy format pliku XLS', status: 'Błąd' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text" 
            placeholder="Szukaj w logach..." 
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/20"
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50">
            <Filter size={14} /> Filtruj
          </button>
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800">
            <Download size={14} /> Eksportuj CSV
          </button>
        </div>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Czas</th>
                <th className="py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Użytkownik</th>
                <th className="py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Akcja</th>
                <th className="py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Szczegóły</th>
                <th className="py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group">
                  <td className="py-4 px-4 text-xs font-mono text-slate-500">{log.time}</td>
                  <td className="py-4 px-4 text-xs font-bold text-slate-900">{log.user}</td>
                  <td className="py-4 px-4">
                    <span className="text-xs font-black text-accent uppercase tracking-tighter">{log.action}</span>
                  </td>
                  <td className="py-4 px-4 text-xs text-slate-600">{log.details}</td>
                  <td className="py-4 px-4 text-center">
                    <span className={`px-2 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                      log.status === 'Sukces' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default AuditLogs;

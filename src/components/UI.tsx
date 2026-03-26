import React from 'react';
import { motion } from 'motion/react';
import { ExternalLink, Maximize2, X } from 'lucide-react';

interface CardProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  footer?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ title, subtitle, children, className = '', footer }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col ${className}`}
    >
      {(title || subtitle) && (
        <div className="px-6 py-5 border-b border-slate-50">
          {title && <h3 className="text-lg font-bold text-slate-900">{title}</h3>}
          {subtitle && <p className="text-sm text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
      )}
      <div className="p-6 flex-1">
        {children}
      </div>
      {footer && (
        <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-50">
          {footer}
        </div>
      )}
    </motion.div>
  );
};

interface KPICardProps {
  label: string;
  value: string | number;
  description?: string;
  icon: React.ElementType;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: string;
}

export const KPICard: React.FC<KPICardProps> = ({ label, value, description, icon: Icon, trend, color = 'bg-accent' }) => {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-start gap-4">
      <div className={`w-12 h-12 ${color} bg-opacity-10 rounded-xl flex items-center justify-center text-accent`}>
        <Icon size={24} />
      </div>
      <div className="flex-1">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</p>
        <div className="flex items-baseline gap-2 mt-1">
          <h4 className="text-2xl font-bold text-slate-900">{value}</h4>
          {trend && (
            <span className={`text-xs font-bold ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {trend.isPositive ? '+' : '-'}{trend.value}%
            </span>
          )}
        </div>
        {description && <p className="text-xs text-slate-500 mt-1">{description}</p>}
      </div>
    </div>
  );
};

export const TerminalLog: React.FC<{ 
  logs: string[]; 
  onOpenFullLogs?: () => void;
  onExpand?: () => void;
}> = ({ logs, onOpenFullLogs, onExpand }) => {
  return (
    <div className="bg-slate-900 rounded-2xl p-4 shadow-xl border border-white/10 relative group">
      <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-2">
        <div className="flex gap-1.5 items-center">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
          <div className="w-2.5 h-2.5 rounded-full bg-amber-500/50" />
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/50" />
          <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest ml-2">System Log</span>
        </div>
        <div className="flex items-center gap-3">
          {onExpand && (
            <button 
              onClick={onExpand}
              className="text-slate-600 hover:text-white transition-colors"
              title="Powiększ"
            >
              <Maximize2 size={12} />
            </button>
          )}
          <button 
            onClick={onOpenFullLogs}
            className="text-[9px] font-black text-slate-500 uppercase tracking-widest hover:text-accent transition-colors flex items-center gap-1"
          >
            Pełne Logi <ExternalLink size={10} />
          </button>
        </div>
      </div>
      <div className="font-mono text-[9px] leading-relaxed h-[180px] overflow-y-auto custom-scrollbar">
        {logs.length === 0 ? (
          <div className="text-slate-600 italic">Oczekiwanie na zdarzenia systemowe...</div>
        ) : (
          logs.map((log, i) => (
            <div key={i} className="mb-1 flex gap-2">
              <span className="text-slate-700 shrink-0">{log.split('] ')[0]}]</span>
              <span className="text-slate-400">{log.split('] ')[1]}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export const Modal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
      >
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">{title}</h3>
            <p className="text-xs text-slate-500 font-medium">Podgląd rozszerzony modułu</p>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:border-slate-900 transition-all"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-8 overflow-y-auto flex-1">
          {children}
        </div>
      </motion.div>
    </div>
  );
};

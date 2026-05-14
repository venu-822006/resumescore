import React from 'react';
import { motion } from 'motion/react';
import { AlertCircle, RefreshCw, ShieldAlert, Cpu } from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface ErrorNoticeProps {
  error: {
    message: string;
    suggestion: string;
    code?: string;
  } | null;
  onRetry?: () => void;
  className?: string;
}

export function ErrorNotice({ error, onRetry, className }: ErrorNoticeProps) {
  if (!error) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "relative overflow-hidden bg-red-500/5 border border-red-500/20 rounded-[2rem] p-8 md:p-10",
        className
      )}
    >
      <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none text-red-500">
        <ShieldAlert size={120} />
      </div>

      <div className="flex flex-col md:flex-row items-center md:items-start gap-8 relative z-10">
        <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-400 shrink-0 border border-red-500/20 shadow-lg shadow-red-500/5">
          <AlertCircle size={32} />
        </div>
        
        <div className="flex-1 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-3 mb-3">
             <span className="text-[10px] font-mono font-black uppercase tracking-[0.3em] text-red-400/70 leading-none">Diagnostic Alert</span>
             <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          </div>
          
          <h3 className="text-xl font-black text-ink-primary uppercase tracking-tight mb-3">
            {error.message}
          </h3>
          
          <p className="text-sm text-ink-secondary leading-relaxed mb-6 font-medium max-w-xl">
            <span className="text-red-400/80 font-bold uppercase text-[10px] tracking-widest mr-2">Resolution:</span>
            {error.suggestion}
          </p>

          {onRetry && (
            <button
              onClick={onRetry}
              className="group flex items-center gap-3 px-6 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl font-bold text-[10px] uppercase tracking-[0.2em] transition-all border border-red-500/20 active:scale-95"
            >
              <RefreshCw size={14} className="group-hover:rotate-180 transition-transform duration-500" />
              Re-Initiate Protocol
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

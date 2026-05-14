import React from 'react';
import { 
  Trophy, 
  Target, 
  Map, 
  ChevronRight, 
  Sparkles,
  Zap,
  HelpCircle,
  CheckCircle2,
  Rocket
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { useAuth } from '../context/AuthContext';

export default function Dashboard({ 
  setActiveTab, 
  startTour 
}: { 
  setActiveTab: (tab: string) => void;
  startTour: () => void;
}) {
  const { user } = useAuth();
  const [lastScore, setLastScore] = React.useState<number | undefined>();
  const [resumeScore, setResumeScore] = React.useState<number | undefined>();
  
  const stats = [
    { label: 'Technical Skills', value: '85%', trend: '+5%', color: 'text-gold' },
    { label: 'Communication', value: 'High', trend: 'Steady', color: 'text-gold-bright' },
    { label: 'Resume Analysis', value: resumeScore ? `${resumeScore}%` : 'Analyze', trend: resumeScore ? 'Live' : 'Pending', color: 'text-gold' },
    { label: 'Portfolio Audit', value: 'Top 5%', trend: 'New', color: 'text-gold-bright' },
  ];

  React.useEffect(() => {
    async function fetchScore() {
      if (user) {
        const { doc, getDoc } = await import('firebase/firestore');
        const { db } = await import('../lib/firebase');
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const data = userSnap.data();
          setLastScore(data.lastReadinessScore);
          setResumeScore(data.resumeScore);
        }
      }
    }
    fetchScore();
  }, [user]);

  return (
    <div className="max-w-6xl mx-auto py-12 px-6 space-y-12">
      <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 pb-12 border-b border-white/5">
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-gold animate-pulse" />
            <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-ink-muted">Neural Stream Synchronized</span>
          </div>
          <h2 className="text-6xl font-black tracking-tighter text-ink-primary font-display uppercase leading-[0.85]">
            Command <span className="text-gold">Center</span>.
          </h2>
          <p className="text-ink-secondary text-lg max-w-xl font-medium leading-relaxed">
            Your trajectory to career mastery is being monitored. Access all strategic protocols below to calibrate your professional signal.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={startTour}
            className="px-5 py-2.5 bg-bg-secondary rounded-xl text-ink-primary text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border border-white/5 hover:border-gold/30 transition-all active:scale-95 shadow-sm"
          >
            <HelpCircle size={14} className="text-gold" />
            System Tour
          </button>
          {lastScore !== undefined && (
            <div className="px-5 py-2.5 bg-bg-tertiary rounded-xl text-gold text-[10px] font-black uppercase tracking-widest flex items-center gap-3 border border-gold/30 shadow-[0_0_20px_rgba(201,162,39,0.1)]">
              <Rocket size={14} />
              Readiness: {lastScore}%
            </div>
          )}
          <div className="px-5 py-2.5 bg-gold rounded-xl text-black text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-gold/20">
            <Zap size={14} fill="currentColor" />
            Tier: Professional
          </div>
        </div>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 border border-white/5 rounded-[2.5rem] overflow-hidden bg-white/5 backdrop-blur-sm">
        {stats.map((stat, i) => (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.1 }}
            key={stat.label}
            className={cn(
              "p-10 border-white/5 bg-bg-secondary hover:bg-white/5 transition-colors group",
              i !== 3 && "lg:border-r md:border-b last:border-b-0 lg:border-b-0"
            )}
          >
            <div className="flex items-center gap-4 mb-4">
              <span className="text-[10px] font-mono font-black text-ink-muted uppercase tracking-[0.2em]">{stat.label}</span>
              <div className="flex-1 h-[1px] bg-white/5 group-hover:bg-gold/20 transition-colors" />
            </div>
            <div className="flex items-end justify-between">
              <span className={cn("text-4xl font-bold font-display uppercase tracking-tighter", stat.color)}>{stat.value}</span>
              <div className="text-[10px] font-black text-gold bg-gold/10 border border-gold/20 px-2 py-1 rounded-lg uppercase tracking-tighter shadow-sm">
                {stat.trend}
              </div>
            </div>
          </motion.div>
        ))}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-10">
          <div className="bg-bg-tertiary rounded-[3rem] p-12 text-white relative overflow-hidden group border border-white/5 shadow-2xl">
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gold/5 blur-[120px] -translate-y-1/2 translate-x-1/2 group-hover:bg-gold/10 transition-all duration-700 pointer-events-none" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <Target size={20} className="text-gold" />
                <span className="text-[10px] font-mono font-black uppercase tracking-[0.4em] text-gold/60 leading-none">Operational Readiness Vector</span>
              </div>
              <h3 className="text-5xl font-black mb-8 leading-[1.1] font-display uppercase text-ink-primary tracking-tighter">
                {lastScore !== undefined 
                  ? `Your Readiness Score is currently ${lastScore}%` 
                  : "Assess your path to architectural dominance."}
              </h3>
              <p className="text-ink-secondary text-lg mb-10 max-w-xl leading-relaxed font-medium">
                {lastScore !== undefined 
                  ? "Neural data indicates areas of potential optimization. Execute a recalibration scan to identify high-impact growth vectors."
                  : "Calibrate your professional signal through our neural assessment matrix. We evaluate your baseline strengths and architectural gaps."}
              </p>
              <button 
                onClick={() => setActiveTab('readiness')}
                className="group bg-gold text-black px-12 py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-gold-bright transition-all flex items-center gap-4 active:scale-95 shadow-[0_20px_40px_-10px_rgba(201,162,39,0.3)]"
              >
                {lastScore !== undefined ? "Recalibrate Assessment" : "Initialize Diagnostic Scorer"} <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <button 
              onClick={() => setActiveTab('technical')}
              className="group bg-bg-secondary p-12 rounded-[2.5rem] border border-white/5 shadow-sm text-left hover:border-gold/30 hover:shadow-2xl transition-all active:scale-[0.98] relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover:opacity-[0.05] group-hover:scale-110 transition-all">
                <Target size={120} />
              </div>
              <div className="p-4 bg-bg-tertiary text-gold rounded-2xl w-fit mb-8 group-hover:scale-110 transition-transform shadow-lg border border-white/5">
                <Target size={28} />
              </div>
              <h4 className="text-2xl font-black mb-3 text-ink-primary uppercase tracking-tight">Technical Skills</h4>
              <p className="text-ink-secondary font-medium leading-relaxed">Execute a rigorous diagnostic on your architectural depth and pattern recognition.</p>
            </button>
            <button 
              onClick={() => setActiveTab('portfolio')}
              className="group bg-bg-secondary p-12 rounded-[2.5rem] border border-white/5 shadow-sm text-left hover:border-gold/30 hover:shadow-2xl transition-all active:scale-[0.98] relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover:opacity-[0.05] group-hover:scale-110 transition-all">
                <Sparkles size={120} />
              </div>
              <div className="p-4 bg-bg-tertiary text-gold rounded-2xl w-fit mb-8 group-hover:scale-110 transition-transform shadow-lg border border-white/5">
                <Sparkles size={28} />
              </div>
              <h4 className="text-2xl font-black mb-3 text-ink-primary uppercase tracking-tight">Portfolio Audit</h4>
              <p className="text-ink-secondary font-medium leading-relaxed">Calibrate your portfolio for maximum visual impact and narrative consistency.</p>
            </button>
          </div>
        </div>

        <div className="lg:col-span-4 bg-bg-tertiary p-10 rounded-[3rem] border border-white/5 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-10 pb-6 border-b border-white/5">
            <h4 className="text-[10px] font-mono font-black uppercase tracking-[0.3em] text-ink-muted text-center flex-1">Trajectory Roadmap</h4>
          </div>
          <div className="space-y-10 flex-1">
            {[
              { label: 'Technical Assessment', status: 'completed' },
              { label: 'Communication Scan', status: 'ongoing' },
              { label: 'Resume Scrutiny', status: 'pending' },
              { label: 'Portfolio Audit', status: 'pending' },
            ].map((step, i) => (
              <div key={step.label} className="flex items-start gap-6 group">
                <div className={cn(
                  "w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 font-mono text-xs font-black transition-all",
                  step.status === 'completed' ? "bg-gold/10 text-gold border border-gold/20 shadow-lg" :
                  step.status === 'ongoing' ? "bg-gold text-black animate-pulse shadow-[0_0_20px_rgba(201,162,39,0.3)]" :
                  "bg-bg-secondary border border-white/5 text-ink-muted"
                )}>
                  {step.status === 'completed' ? <CheckCircle2 size={16} /> : `0${i + 1}`}
                </div>
                <div className="space-y-1.5">
                  <p className={cn(
                    "text-sm font-black uppercase tracking-[0.05em]",
                    step.status === 'pending' ? "text-ink-muted" : "text-ink-primary"
                  )}>{step.label}</p>
                  <div className="flex items-center gap-2 px-2.5 py-1 bg-white/5 border border-white/5 rounded-lg w-fit">
                    <div className={cn(
                      "w-1 h-1 rounded-full",
                      step.status === 'completed' ? "bg-gold" :
                      step.status === 'ongoing' ? "bg-gold-bright" : "bg-bg-secondary"
                    )} />
                    <span className="text-[9px] text-ink-muted font-black uppercase tracking-widest">{step.status}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-12 p-8 bg-bg-primary rounded-[2rem] border border-white/5 shadow-xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-gold/5 to-transparent pointer-events-none" />
            <div className="relative z-10">
              <p className="text-[10px] font-mono font-black text-gold uppercase tracking-[0.3em] mb-4 text-center leading-none">Protocol Advice</p>
              <p className="text-sm text-ink-secondary leading-[1.8] font-medium text-center italic font-serif">
                "Quantify every achievement. Don't say 'improved performance'; say 'reduced latency by 40% using optimized Redis caching strategy'."
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

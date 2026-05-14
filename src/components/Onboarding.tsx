import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileSearch, 
  Globe, 
  CheckCircle2, 
  MessageSquare, 
  ArrowRight, 
  X,
  Zap,
  Sparkles,
  Target
} from 'lucide-react';
import { cn } from '../lib/utils';

interface Step {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ElementType;
  color: string;
  module: string;
}

const steps: Step[] = [
  {
    id: 'welcome',
    title: 'Welcome to',
    subtitle: 'InterviewReady.',
    description: 'The neural-enhanced platform designed to sharpen your professional signal and dominate high-stakes interviews.',
    icon: Zap,
    color: 'gold',
    module: 'System Initiative'
  },
  {
    id: 'readiness',
    title: 'Readiness',
    subtitle: 'Diagnostic.',
    description: 'Our core assessment engine. Calibrate your professional signal and identify the precise roadmap to career mastery.',
    icon: Target,
    color: 'gold',
    module: 'Readiness Scorer'
  },
  {
    id: 'resume',
    title: 'Resume',
    subtitle: 'Scrutiny Lab.',
    description: 'Analyze your narrative architecture. We identify "Soft Spots" and optimize keywords for algorithmic and human review.',
    icon: FileSearch,
    color: 'gold',
    module: 'Career Narrative Audit'
  },
  {
    id: 'portfolio',
    title: 'Visual',
    subtitle: 'Authority.',
    description: 'Audit your digital footprint. Perfect your visual hierarchy and project conversion to position yourself as an industry leader.',
    icon: Globe,
    color: 'gold',
    module: 'Visual Identity Scrutiny'
  },
  {
    id: 'technical',
    title: 'Technical',
    subtitle: 'Scrutiny.',
    description: 'Evaluate your code narrativa and architectural decisions. Ensure your technical stack matches modern industry demands.',
    icon: CheckCircle2,
    color: 'gold',
    module: 'Architectural Analysis'
  },
  {
    id: 'interview',
    title: 'Communication',
    subtitle: 'Forge.',
    description: 'Simulate high-pressure scenarios with our Neural Agents. Practice role-specific personas to eliminate communication lag.',
    icon: MessageSquare,
    color: 'gold',
    module: 'Persona Simulation'
  }
];

export function Onboarding({ onComplete }: { onComplete: () => void }) {
  const [currentStep, setCurrentStep] = React.useState(0);

  const next = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(s => s + 1);
    } else {
      onComplete();
    }
  };

  const skip = () => onComplete();

  const step = steps[currentStep];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-bg-primary/90 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-2xl bg-bg-secondary rounded-[3rem] shadow-2xl relative overflow-hidden border border-white/5"
      >
        {/* Background Accent */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gold/5 blur-[100px] pointer-events-none" />

        <div className="p-12 md:p-16 relative z-10">
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gold rounded-xl flex items-center justify-center text-black shadow-lg shadow-gold/20">
                <step.icon size={22} />
              </div>
              <span className="text-[10px] font-mono font-black uppercase tracking-[0.4em] text-gold/80">
                {step.module}
              </span>
            </div>
            <button 
              onClick={skip}
              className="p-2 text-ink-muted hover:text-ink-primary transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="min-h-[280px]"
            >
              <h2 className="text-5xl font-black tracking-tighter text-ink-primary font-display uppercase leading-[0.9] mb-6">
                {step.id === 'welcome' ? step.title : (
                  <>
                    {step.title} <span className="text-gold">{step.subtitle}</span>
                  </>
                )}
                {step.id === 'welcome' && <span className="block text-gold">{step.subtitle}</span>}
              </h2>
              <p className="text-ink-secondary text-lg font-medium leading-relaxed max-w-lg mb-8">
                {step.description}
              </p>
            </motion.div>
          </AnimatePresence>

          <div className="flex items-center justify-between mt-12 pt-8 border-t border-white/5">
            <div className="flex gap-2">
              {steps.map((_, i) => (
                <div 
                  key={i} 
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-500",
                    i === currentStep ? "w-8 bg-gold" : "w-1.5 bg-white/10"
                  )} 
                />
              ))}
            </div>

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={next}
              className="flex items-center gap-3 px-8 py-4 bg-gold text-black rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-gold-bright transition-all shadow-xl hover:shadow-gold/10"
            >
              {currentStep === steps.length - 1 ? 'Execute Protocol' : 'Next Transmission'}
              <ArrowRight size={16} />
            </motion.button>
          </div>
        </div>

        {/* Feature Tags */}
        <div className="absolute top-12 right-24 hidden md:flex flex-col gap-2 opacity-[0.03] pointer-events-none text-gold">
          <Sparkles size={120} strokeWidth={1} />
        </div>
      </motion.div>
    </div>
  );
}

import React from 'react';
import { useAuth } from '../context/AuthContext';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { GoogleGenAI, Type } from "@google/genai";
import { motion, AnimatePresence } from 'motion/react';
import { 
  Target, 
  TrendingUp, 
  CheckCircle2, 
  AlertCircle,
  Brain,
  Rocket,
  ShieldCheck,
  Zap,
  ArrowRight,
  ChevronRight,
  LayoutDashboard,
  Code2,
  FileText,
  MessageSquare,
  Briefcase
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { ErrorNotice } from './ErrorNotice';

interface AssessmentData {
  technical: string;
  resume: string;
  communication: string;
  portfolio: string;
}

interface ReadinessResult {
  overallScore: number;
  breakdown: {
    technical: number;
    resume: number;
    communication: number;
    portfolio: number;
  };
  personalizedPlan: {
    title: string;
    steps: string[];
  }[];
  verdict: string;
}

export default function ReadinessAssessment() {
  const { user } = useAuth();
  const [step, setStep] = React.useState(1);
  const [data, setData] = React.useState<AssessmentData>({
    technical: '',
    resume: '',
    communication: '',
    portfolio: ''
  });
  const [loading, setLoading] = React.useState(false);
  const [result, setResult] = React.useState<ReadinessResult | null>(null);
  const [error, setError] = React.useState<{ message: string, suggestion: string } | null>(null);

  React.useEffect(() => {
    async function loadPreviousResult() {
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists() && userSnap.data().readinessHistory) {
          // If we want to show the last one automatically
          // setResult(userSnap.data().readinessHistory.result); 
          // Actually, let's just let them re-run it or show a "Latest Result" card if I store it.
        }
      }
    }
    loadPreviousResult();
  }, [user]);

  const calculateScore = async () => {
    setLoading(true);
    setError(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      
      const prompt = `
        As an expert career coach and technical recruiter, evaluate this student's profile for interview readiness.
        
        Profile Input:
        - Technical Skills/Stack: ${data.technical}
        - Resume Highlights: ${data.resume}
        - Communication Experience: ${data.communication}
        - Portfolio Status: ${data.portfolio}
        
        Provide a detailed "Interview Readiness Score" (0-100) and a personalized improvement plan.
        Be rigorous and technical in your assessment.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              overallScore: { type: Type.NUMBER },
              breakdown: {
                type: Type.OBJECT,
                properties: {
                  technical: { type: Type.NUMBER },
                  resume: { type: Type.NUMBER },
                  communication: { type: Type.NUMBER },
                  portfolio: { type: Type.NUMBER }
                },
                required: ['technical', 'resume', 'communication', 'portfolio']
              },
              personalizedPlan: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    steps: { type: Type.ARRAY, items: { type: Type.STRING } }
                  },
                  required: ['title', 'steps']
                }
              },
              verdict: { type: Type.STRING }
            },
            required: ['overallScore', 'breakdown', 'personalizedPlan', 'verdict']
          }
        }
      });

      const assessmentResult = JSON.parse(response.text);
      setResult(assessmentResult);

      // Persist to Firebase if user exists
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, {
          lastReadinessScore: assessmentResult.overallScore,
          readinessHistory: {
            date: new Date().toISOString(),
            score: assessmentResult.overallScore,
            breakdown: assessmentResult.breakdown
          }
        });
      }
    } catch (err: any) {
      console.error('Readiness assessment error:', err);
      setError({
        message: "Diagnostic Sequence Interrupted",
        suggestion: "The assessment engine failed to compute your readiness vector. Ensure all profile fields are populated and re-initialize the diagnostic."
      });
    } finally {
      setLoading(false);
    }
  };

  if (result) {
    return (
      <div className="max-w-6xl mx-auto py-12 px-6">
        <header className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
            <span className="text-[10px] font-mono font-black uppercase tracking-[0.4em] text-ink-muted leading-none">Diagnostic Result</span>
          </div>
          <h2 className="text-6xl font-black tracking-tighter mb-6 text-ink-primary font-display uppercase leading-[0.9]">
            Readiness <span className="text-gold">Report</span>.
          </h2>
          <div className="flex items-center gap-8 bg-bg-secondary p-8 rounded-[2.5rem] border border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-[0.05] pointer-events-none group-hover:scale-110 transition-transform duration-700">
              <Rocket size={160} />
            </div>
            <div className="relative">
              <div className="w-32 h-32 rounded-full border-4 border-gold/20 flex items-center justify-center relative">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="58"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    className="text-white/5"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="58"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={364.4}
                    strokeDashoffset={364.4 - (364.4 * result.overallScore) / 100}
                    className="text-gold transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-black text-ink-primary leading-none">{result.overallScore}</span>
                  <span className="text-[10px] font-mono font-black text-ink-muted uppercase">Ready</span>
                </div>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-black text-ink-primary uppercase tracking-tight mb-2">Operational Vector: {result.verdict}</h3>
              <p className="text-ink-secondary font-medium leading-relaxed max-w-xl">
                Your professional signal has been calibrated. Based on the neural scan of your profile, here is your path to architectural mastery.
              </p>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-bg-secondary p-10 rounded-[3rem] border border-white/5 space-y-8 h-fit">
              <h4 className="text-xs font-black text-ink-muted uppercase tracking-[0.3em] border-b border-white/5 pb-6">Component Breakdown</h4>
              <div className="space-y-6">
                {[
                  { label: 'Technical', value: result.breakdown.technical, icon: Code2 },
                  { label: 'Narrative', value: result.breakdown.resume, icon: FileText },
                  { label: 'Communication', value: result.breakdown.communication, icon: MessageSquare },
                  { label: 'Authority', value: result.breakdown.portfolio, icon: Briefcase },
                ].map((item) => (
                  <div key={item.label} className="space-y-2">
                    <div className="flex justify-between items-center text-[10px] uppercase font-black tracking-widest">
                      <div className="flex items-center gap-2 text-ink-muted">
                        <item.icon size={12} className="text-gold" />
                        {item.label}
                      </div>
                      <span className="text-ink-primary">{item.value}%</span>
                    </div>
                    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${item.value}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="h-full bg-gold"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <button 
              onClick={() => {
                setResult(null);
                setStep(1);
              }}
              className="w-full bg-white/5 border border-white/5 hover:border-gold/30 hover:bg-white/10 p-6 rounded-2xl transition-all font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 text-ink-muted hover:text-gold"
            >
              <Zap size={14} />
              Re-Scan Profile
            </button>
          </div>

          <div className="lg:col-span-8 space-y-8">
            <div className="space-y-6">
              <h3 className="text-xs font-black text-ink-muted uppercase tracking-[0.3em]">Neural Roadmaps</h3>
              {result.personalizedPlan.map((plan, i) => (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  key={plan.title}
                  className="bg-bg-tertiary p-8 rounded-[2.5rem] border border-white/5 shadow-xl group hover:border-gold/20 transition-all"
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-gold/10 rounded-xl text-gold border border-gold/20 font-black font-mono text-sm">
                      0{i + 1}
                    </div>
                    <h4 className="text-xl font-black text-ink-primary uppercase tracking-tight">{plan.title}</h4>
                  </div>
                  <div className="space-y-4">
                    {plan.steps.map((step, si) => (
                      <div key={si} className="flex gap-4 items-start">
                        <div className="mt-1.5 w-1 h-1 rounded-full bg-gold shrink-0" />
                        <p className="text-ink-secondary text-sm font-medium leading-relaxed">{step}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <header className="mb-16">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
          <span className="text-[10px] font-mono font-black uppercase tracking-[0.4em] text-ink-muted leading-none">Diagnostic Assessment</span>
        </div>
        <h2 className="text-6xl font-black tracking-tighter mb-6 text-ink-primary font-display uppercase leading-[0.9]">
          Readiness <span className="text-gold">Scorer</span>.
        </h2>
        <p className="text-ink-secondary text-lg max-w-2xl font-medium leading-relaxed">
          Calibrate your professional signal through our neural assessment matrix. We evaluate your baseline strengths and architectural gaps to generate a roadmap for industry dominance.
        </p>
      </header>

      <div className="bg-bg-tertiary rounded-[3.5rem] border border-white/5 shadow-2xl p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none">
          <Brain size={250} />
        </div>

        <div className="relative mb-12">
          <div className="flex justify-between items-center mb-8">
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((s) => (
                <div 
                  key={s}
                  className={cn(
                    "w-8 h-1 rounded-full transition-all duration-500",
                    s <= step ? "bg-gold" : "bg-white/5"
                  )}
                />
              ))}
            </div>
            <span className="text-[10px] font-mono font-black text-ink-muted uppercase tracking-widest">Protocol Stage 0{step}</span>
          </div>

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Code2 size={16} className="text-gold" />
                    <label className="text-[10px] font-black text-ink-muted uppercase tracking-[0.3em]">Core Technical Stack</label>
                  </div>
                  <textarea 
                    value={data.technical}
                    onChange={(e) => setData({ ...data, technical: e.target.value })}
                    placeholder="List your primary languages, frameworks, and architectural experience..."
                    className="w-full bg-bg-secondary px-8 py-6 rounded-3xl border border-white/5 focus:ring-4 focus:ring-gold/5 focus:border-gold outline-none transition-all font-medium text-ink-primary placeholder:text-zinc-800 min-h-[160px] text-sm leading-relaxed"
                  />
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <FileText size={16} className="text-gold" />
                    <label className="text-[10px] font-black text-ink-muted uppercase tracking-[0.3em]">Resume Narrative Highlights</label>
                  </div>
                  <textarea 
                    value={data.resume}
                    onChange={(e) => setData({ ...data, resume: e.target.value })}
                    placeholder="Mention 3 key achievements from your professional history..."
                    className="w-full bg-bg-secondary px-8 py-6 rounded-3xl border border-white/5 focus:ring-4 focus:ring-gold/5 focus:border-gold outline-none transition-all font-medium text-ink-primary placeholder:text-zinc-800 min-h-[160px] text-sm leading-relaxed"
                  />
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div 
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <MessageSquare size={16} className="text-gold" />
                    <label className="text-[10px] font-black text-ink-muted uppercase tracking-[0.3em]">Communication Experience</label>
                  </div>
                  <textarea 
                    value={data.communication}
                    onChange={(e) => setData({ ...data, communication: e.target.value })}
                    placeholder="Describe your experience with teamwork, public speaking, or stakeholder management..."
                    className="w-full bg-bg-secondary px-8 py-6 rounded-3xl border border-white/5 focus:ring-4 focus:ring-gold/5 focus:border-gold outline-none transition-all font-medium text-ink-primary placeholder:text-zinc-800 min-h-[160px] text-sm leading-relaxed"
                  />
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div 
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Briefcase size={16} className="text-gold" />
                    <label className="text-[10px] font-black text-ink-muted uppercase tracking-[0.3em]">Portfolio Authority</label>
                  </div>
                  <textarea 
                    value={data.portfolio}
                    onChange={(e) => setData({ ...data, portfolio: e.target.value })}
                    placeholder="Provide details about your projects, documentation, or public contributions..."
                    className="w-full bg-bg-secondary px-8 py-6 rounded-3xl border border-white/5 focus:ring-4 focus:ring-gold/5 focus:border-gold outline-none transition-all font-medium text-ink-primary placeholder:text-zinc-800 min-h-[160px] text-sm leading-relaxed"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {error && <div className="mb-8"><ErrorNotice error={error} onRetry={() => step === 4 ? calculateScore() : setStep(step + 1)} /></div>}

        <div className="flex items-center justify-between pt-10 border-t border-white/5">
          <button
            onClick={() => setStep(prev => Math.max(1, prev - 1))}
            disabled={step === 1 || loading}
            className="px-8 py-4 text-[10px] font-black text-ink-muted uppercase tracking-widest hover:text-gold transition-colors disabled:opacity-30 disabled:pointer-events-none"
          >
            Go Back
          </button>
          
          <button
            onClick={() => {
              if (step < 4) {
                setStep(step + 1);
              } else {
                calculateScore();
              }
            }}
            disabled={loading}
            className={cn(
              "group bg-gold text-black px-12 py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-gold-bright transition-all flex items-center gap-4 active:scale-95 shadow-xl shadow-gold/10",
              loading && "opacity-50 cursor-not-allowed"
            )}
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                Processing Vector...
              </>
            ) : (
              <>
                {step === 4 ? 'Generate Readiness Score' : 'Next Protocol Step'}
                <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { TECH_TOPICS } from '@/src/constants/dataset';
import { evaluateTechnicalStream } from '@/src/services/gemini';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { ErrorNotice } from '@/src/components/ErrorNotice';
import { Loader2, Send, CheckCircle2 } from 'lucide-react';
import { cn } from '@/src/lib/utils';

export default function TechnicalEvaluator() {
  const [selectedTopic, setSelectedTopic] = React.useState(TECH_TOPICS[0].id);
  const [difficulty, setDifficulty] = React.useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [experience, setExperience] = React.useState('');
  const [evaluating, setEvaluating] = React.useState(false);
  const [result, setResult] = React.useState<string | null>(null);
  const [error, setError] = React.useState<{ message: string, suggestion: string } | null>(null);

  const handleEvaluate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!experience.trim()) return;

    setEvaluating(true);
    setResult(''); // Clear previous results and start showing the new one
    setError(null);
    try {
      const topic = TECH_TOPICS.find(t => t.id === selectedTopic)?.name || '';
      const stream = await evaluateTechnicalStream(topic, experience, difficulty);
      
      let fullText = '';
      for await (const chunk of stream) {
        const chunkText = chunk.text;
        fullText += chunkText;
        setResult(fullText);
      }
      
      if (!fullText) {
        throw new Error('NULL_SIGNAL');
      }
    } catch (err: any) {
      if (err.message === 'NULL_SIGNAL') {
        setError({
          message: "Null Signal Received",
          suggestion: "The assessment model failed to generate a response. Please refine your technical exposition or try a different protocol level."
        });
      } else {
        setError({
          message: "Neural Analysis Interrupted",
          suggestion: "The evaluation protocol was halted by a connection shift. Ensure your network trajectory is stable and initiate the scrutiny again."
        });
      }
      setResult(null);
    } finally {
      setEvaluating(false);
    }
  };

  const difficultyOptions: { id: 'Easy' | 'Medium' | 'Hard' }[] = [
    { id: 'Easy' },
    { id: 'Medium' },
    { id: 'Hard' }
  ];

  return (
    <div className="max-w-6xl mx-auto py-12 px-6">
      <header className="mb-16">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
          <span className="text-[10px] font-mono font-black uppercase tracking-[0.4em] text-ink-muted leading-none">Diagnostic Assessment</span>
        </div>
        <h2 className="text-6xl font-black tracking-tighter mb-6 text-ink-primary font-display uppercase leading-[0.9]">
          Technical <span className="text-gold">Skills</span>.
        </h2>
        <p className="text-ink-secondary text-lg max-w-2xl font-medium leading-relaxed">
          Deep-dive diagnostic of your technical architecture. Our AI baseline compares your experience against industry standards to identify high-signal skills.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-bg-secondary p-8 rounded-[2.5rem] border border-white/5 shadow-sm">
            <label className="block text-[10px] font-mono font-black text-ink-muted mb-6 uppercase tracking-[0.3em] leading-none">
              01. Protocol Selection
            </label>
            <div className="space-y-3 mb-10">
              {TECH_TOPICS.map((topic) => (
                <button
                  key={topic.id}
                  disabled={evaluating}
                  onClick={() => setSelectedTopic(topic.id)}
                  className={cn(
                    "w-full text-left px-5 py-4 rounded-2xl transition-all duration-300 border group box-border disabled:opacity-50 disabled:cursor-not-allowed",
                    selectedTopic === topic.id 
                      ? "bg-gold border-gold text-black shadow-xl translate-x-1" 
                      : "bg-bg-tertiary border-white/5 text-ink-muted hover:bg-bg-tertiary/80 hover:border-white/10"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-sm uppercase tracking-tight">{topic.name}</div>
                    {selectedTopic === topic.id && <div className="w-1.5 h-1.5 rounded-full bg-black/40 animate-pulse" />}
                  </div>
                  <div className={cn(
                    "text-[10px] uppercase font-mono font-black tracking-widest mt-2 leading-none",
                    selectedTopic === topic.id ? "text-black/50" : "text-ink-muted/50"
                  )}>{topic.category}</div>
                </button>
              ))}
            </div>

            <label className="block text-[10px] font-mono font-black text-ink-muted mb-4 uppercase tracking-[0.3em] leading-none">
              02. Complexity Level
            </label>
            <div className="grid grid-cols-3 gap-3">
              {difficultyOptions.map((opt) => (
                <button
                  key={opt.id}
                  disabled={evaluating}
                  onClick={() => setDifficulty(opt.id)}
                  className={cn(
                    "py-3 text-[10px] font-mono font-black rounded-xl border transition-all uppercase tracking-widest leading-none disabled:opacity-50 disabled:cursor-not-allowed",
                    difficulty === opt.id 
                      ? "bg-gold text-black border-gold shadow-xl" 
                      : "bg-bg-tertiary text-ink-muted border-white/5 hover:bg-bg-tertiary/80 hover:border-white/10"
                  )}
                >
                  {opt.id}
                </button>
              ))}
            </div>
          </div>

          <div className={cn(
            "bg-bg-tertiary text-ink-primary p-10 rounded-[2.5rem] border border-white/5 shadow-2xl relative overflow-hidden group transition-opacity",
            evaluating && "opacity-50"
          )}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 blur-3xl rounded-full" />
            <h4 className="font-mono font-black mb-8 flex items-center gap-3 text-[10px] uppercase tracking-[0.3em] leading-none">
              <div className="w-1.5 h-1.5 rounded-full bg-gold" />
              {difficulty} Benchmarks
            </h4>
            <ul className="space-y-5">
              {[
                difficulty === 'Easy' ? ['Syntax & Base API', 'Common Patterns', 'Error Lifecycle'] :
                difficulty === 'Medium' ? ['Performance Opt', 'Design Paradigms', 'State Orchestration'] :
                ['Distributed Design', 'Memory & GC', 'Kernel/Engine Depth']
              ].flat().map((item, i) => (
                <li key={i} className="flex items-center gap-4 group/item">
                  <div className="w-4 h-[1px] bg-gold/30 group-hover/item:w-6 group-hover/item:bg-gold transition-all" />
                  <span className="text-[11px] font-bold text-ink-muted group-hover/item:text-gold transition-colors uppercase tracking-tight">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="lg:col-span-8 space-y-10">
          <form onSubmit={handleEvaluate} className="bg-bg-secondary p-10 rounded-[3rem] border border-white/5 shadow-sm space-y-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-[0.01] pointer-events-none text-gold">
              <Send size={200} />
            </div>
            <div>
              <label className="block text-[10px] font-mono font-black text-ink-muted mb-4 uppercase tracking-[0.3em] leading-none">
                Exposition [ {TECH_TOPICS.find(t => t.id === selectedTopic)?.name} ]
              </label>
              <textarea
                value={experience}
                disabled={evaluating}
                onChange={(e) => setExperience(e.target.value)}
                placeholder="Talk about architectural decisions, low-level optimizations, and systems you've scaled..."
                className="w-full h-64 p-8 rounded-[2rem] bg-bg-tertiary border border-white/5 focus:ring-4 focus:ring-gold/5 focus:border-gold outline-none transition-all resize-none font-medium text-ink-secondary leading-relaxed scrollbar-hide text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            <button
              disabled={evaluating || !experience.trim()}
              className="group relative w-full py-6 bg-gold text-black rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-gold-bright disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_20px_40px_rgba(201,162,39,0.15)] active:scale-[0.98] overflow-hidden"
            >
              <span className="relative z-10 flex items-center justify-center gap-4">
                {evaluating ? (
                  <>
                    <Loader2 className="animate-spin w-5 h-5 text-black" />
                    Calibrating {difficulty} metrics...
                  </>
                ) : (
                  <>
                    <Send size={18} className="text-black group-hover:scale-110 transition-transform" />
                    Request X-Ray Evaluation
                  </>
                )}
              </span>
            </button>
          </form>

          <AnimatePresence>
            {error && (
              <ErrorNotice 
                error={error} 
                onRetry={() => handleEvaluate({ preventDefault: () => {} } as any)} 
              />
            )}
            
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -40 }}
                className="bg-bg-secondary p-12 md:p-16 rounded-[4rem] shadow-2xl border border-white/5 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-16 opacity-[0.02] pointer-events-none rotate-12 text-gold">
                  <CheckCircle2 size={300} />
                </div>
                
                <div className="flex items-center gap-6 mb-12 border-b border-white/5 pb-8">
                  <div className="w-16 h-[2px] bg-gold" />
                  <h3 className="text-3xl font-black text-ink-primary tracking-tight leading-none uppercase">Analysis Report</h3>
                </div>
                
                <div className="markdown-body prose prose-invert prose-headings:font-black prose-headings:text-ink-primary prose-p:text-ink-secondary prose-strong:text-gold lg:prose-lg prose-gold max-w-none font-serif">
                  <ReactMarkdown>{result}</ReactMarkdown>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

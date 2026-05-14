import React from 'react';
import { analyzeResume } from '@/src/services/gemini';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '../context/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Loader2, FileSearch, Sparkles, AlertCircle, Upload, FileType, CheckCircle2, RefreshCw, ShieldAlert, Target, TrendingUp } from 'lucide-react';
import { ErrorNotice } from '@/src/components/ErrorNotice';
import { cn } from '@/src/lib/utils';
import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';

// Set up PDF.js worker using a more reliable source for v5+ (uses .mjs)
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

export default function ResumeAnalyzer() {
  const { user } = useAuth();
  const [resumeText, setResumeText] = React.useState('');
  const [analyzing, setAnalyzing] = React.useState(false);
  const [resolving, setResolving] = React.useState(false);
  const [diagnosticIndex, setDiagnosticIndex] = React.useState(0);
  const [extracting, setExtracting] = React.useState(false);
  const [result, setResult] = React.useState<{
    score: number;
    feedbackMarkdown: string;
    keyTakeaways: string[];
  } | null>(null);
  const [dragActive, setDragActive] = React.useState(false);
  const [fileName, setFileName] = React.useState<string | null>(null);
  const [error, setError] = React.useState<{ message: string, suggestion: string } | null>(null);

  const diagnosticMessages = [
    "Ingesting narrative vector...",
    "Mapping semantic structure...",
    "Benchmark alignment check...",
    "Calibrating industry fit...",
    "Resolving neural score..."
  ];

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resumeText.trim()) return;

    setAnalyzing(true);
    setResult(null);
    setError(null);
    setDiagnosticIndex(0);

    const diagnosticInterval = setInterval(() => {
      setDiagnosticIndex(prev => (prev + 1) % diagnosticMessages.length);
    }, 1500);

    try {
      const feedback = await analyzeResume(resumeText);
      if (!feedback) throw new Error('NULL_SIGNAL');
      
      // Delay slightly for effect
      await new Promise(r => setTimeout(r, 800));
      setResult(feedback);

      // Persist score to Firestore
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, {
          resumeScore: feedback.score,
          'readinessHistory.date': new Date().toISOString(),
        });
      }
    } catch (err: any) {
      console.error('Scrutiny Error:', err);
      setError({
        message: "Neural Analysis Interrupted",
        suggestion: "The scrutinizer encountered a logic gap. Ensure your text is not empty and re-initiate the audit."
      });
    } finally {
      clearInterval(diagnosticInterval);
      setAnalyzing(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const extractTextFromFile = async (file: File) => {
    setExtracting(true);
    setFileName(file.name);
    setError(null);
    try {
      if (file.type === 'application/pdf') {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let fullText = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          // Improved extraction to capture all text fragments correctly
          const strings = content.items.map((item: any) => item.str || '');
          fullText += strings.join(' ') + '\n';
        }
        
        const finalContent = fullText.trim();
        if (finalContent.length < 50) {
           throw new Error('INSUFFICIENT_DATA');
        }
        setResumeText(finalContent);
      } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        const finalContent = result.value.trim();
        if (finalContent.length < 50) {
           throw new Error('INSUFFICIENT_DATA');
        }
        setResumeText(finalContent);
      } else {
        setError({
          message: "Protocol Mismatch",
          suggestion: "System only accepts .pdf or .docx data packets."
        });
      }
    } catch (err: any) {
      console.error('Extraction error:', err);
      setError({
        message: err.message === 'INSUFFICIENT_DATA' ? "Thin Data Stream" : "Extraction Collision",
        suggestion: err.message === 'INSUFFICIENT_DATA' 
          ? "The document contains too little extractable text. Ensure it is not an image-only PDF." 
          : "The parser failed to resolve the document structure. Try re-saving as a standard PDF."
      });
    } finally {
      setExtracting(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await extractTextFromFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await extractTextFromFile(e.target.files[0]);
    }
  };

  function ScoreCounter({ target, duration = 2000 }: { target: number, duration?: number }) {
    const [count, setCount] = React.useState(0);

    React.useEffect(() => {
      let startTimestamp: number | null = null;
      const step = (timestamp: number) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        setCount(Math.floor(progress * target));
        if (progress < 1) {
          window.requestAnimationFrame(step);
        }
      };
      window.requestAnimationFrame(step);
    }, [target, duration]);

    return <span>{count}</span>;
  }


  return (
    <div className="max-w-6xl mx-auto py-12 px-6">
      <header className="mb-16">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
          <span className="text-[10px] font-mono font-black uppercase tracking-[0.4em] text-ink-muted leading-none">Career Narrative Audit</span>
        </div>
        <h2 className="text-6xl font-black tracking-tighter mb-6 text-ink-primary font-display uppercase leading-[0.9]">
          Resume <span className="text-gold">Analysis</span>.
        </h2>
        <p className="text-ink-secondary text-lg max-w-2xl font-medium leading-relaxed">
          Benchmark your career narrative against industry standards. Our neural analysis identifies impact gaps and provides strategic optimization for tier-1 roles.
        </p>
      </header>

      <AnimatePresence mode="wait">
        {analyzing ? (
          <motion.div 
            key="analyzing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-24 space-y-10 bg-bg-tertiary rounded-[3.5rem] border border-white/5 shadow-2xl relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gold/5 blur-[120px] rounded-full animate-pulse" />
            <div className="relative">
              <div className="w-32 h-32 border-4 border-gold/10 border-t-gold rounded-full animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="text-gold animate-pulse" size={40} />
              </div>
            </div>
            <div className="text-center relative z-10">
              <h3 className="text-3xl font-black text-ink-primary uppercase tracking-tighter mb-4 italic transition-all duration-500">
                {diagnosticMessages[diagnosticIndex]}
              </h3>
              <div className="flex items-center justify-center gap-2">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div 
                    key={i} 
                    className={cn(
                      "w-2 h-2 rounded-full transition-all duration-500",
                      i === diagnosticIndex ? "bg-gold scale-125 shadow-[0_0_10px_rgba(201,162,39,0.8)]" : "bg-white/10"
                    )}
                  />
                ))}
              </div>
              <p className="text-ink-muted text-[10px] font-mono uppercase tracking-[0.4em] mt-8">Calibrating neural standard v2.4.9</p>
            </div>
          </motion.div>
        ) : (
          <div key="upload-zone" className="space-y-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* File Upload Zone */}
          <div 
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={cn(
              "relative min-h-[360px] flex flex-col items-center justify-center p-12 border transition-all duration-500 group overflow-hidden rounded-[3rem]",
              dragActive 
                ? "border-gold bg-gold/5 ring-4 ring-gold/5 shadow-2xl" 
                : "bg-bg-secondary border-white/5 hover:border-gold/30 hover:shadow-xl",
              (analyzing || extracting) ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
            )}
          >
            <input 
              type="file" 
              className="absolute inset-0 opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed" 
              accept=".pdf,.docx" 
              onChange={handleFileChange}
              disabled={analyzing || extracting}
            />
            
            {extracting ? (
              <div className="text-center animate-pulse">
                <Loader2 className="w-14 h-14 text-gold animate-spin mx-auto mb-6" />
                <p className="font-mono font-bold text-gold uppercase tracking-widest text-[10px]">Deciphering Document...</p>
              </div>
            ) : fileName ? (
              <div className="text-center">
                <div className="w-20 h-20 bg-gold text-black rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-gold/20 transition-transform group-hover:scale-110">
                  <CheckCircle2 size={40} />
                </div>
                <p className="text-xl font-bold text-ink-primary truncate max-w-[280px] mb-3">{fileName}</p>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-gold/10 rounded-full border border-gold/20">
                  <div className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
                  <span className="text-[10px] text-gold font-mono font-black uppercase tracking-[0.1em]">Ready for Analysis</span>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <div className="w-20 h-20 bg-bg-tertiary border border-white/5 text-ink-muted rounded-[2rem] flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform group-hover:bg-gold group-hover:text-black group-hover:border-gold shadow-lg">
                  <Upload size={36} />
                </div>
                <h4 className="text-2xl font-black text-ink-primary mb-3 uppercase tracking-tight">Ingest Resume</h4>
                <p className="text-ink-secondary mb-8 max-w-[240px] mx-auto text-sm font-medium leading-relaxed">Drag your .pdf or .docx here to begin automated extraction.</p>
                <div className="flex items-center gap-3 justify-center">
                  <span className="px-3 py-1.5 bg-bg-tertiary rounded-xl text-[10px] font-mono font-black text-ink-muted flex items-center gap-2 border border-white/5">
                    <FileType size={14} className="text-gold" /> PDF 2.0
                  </span>
                  <span className="px-3 py-1.5 bg-bg-tertiary rounded-xl text-[10px] font-mono font-black text-ink-muted flex items-center gap-2 border border-white/5">
                    <FileType size={14} className="text-gold" /> DOCX
                  </span>
                </div>
              </div>
            )}
            
            {dragActive && !analyzing && !extracting && (
              <div className="absolute inset-0 bg-gold/5 backdrop-blur-[4px] flex items-center justify-center border-4 border-gold/30 m-4 rounded-[2.5rem]">
                <p className="text-gold font-black text-2xl uppercase tracking-tighter scale-110 font-display">Drop File Now</p>
              </div>
            )}
          </div>

          {/* Text Preview / Edit Zone */}
          <div className={cn(
            "bg-bg-tertiary p-10 rounded-[3rem] border border-white/5 shadow-2xl flex flex-col relative group transition-opacity",
            analyzing && "opacity-50"
          )}>
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-gold animate-pulse" />
                <label className="text-[10px] font-mono font-black text-ink-muted uppercase tracking-[0.3em] leading-none">
                  Raw Data Stream
                </label>
              </div>
              {resumeText && !analyzing && (
                <button 
                  onClick={() => {
                    setResumeText('');
                    setFileName(null);
                  }}
                  className="text-[10px] text-ink-muted hover:text-gold transition-colors font-mono font-black uppercase tracking-widest flex items-center gap-2 leading-none"
                >
                  <RefreshCw size={12} />
                  Clear Buffers
                </button>
              )}
            </div>
            <textarea
              value={resumeText}
              disabled={analyzing}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="System awaiting input via upload or manual injection..."
              className="flex-1 w-full min-h-[240px] p-0 bg-transparent text-ink-secondary border-none outline-none font-mono text-xs leading-[1.8] resize-none scrollbar-hide placeholder:text-zinc-800 disabled:cursor-not-allowed"
            />
            <div className="mt-8 flex items-center justify-between pt-6 border-t border-white/5">
              <div className="text-[10px] font-mono text-ink-muted uppercase tracking-widest">
                CHARS_COUNT: {resumeText.length}
              </div>
              <div className="text-[10px] font-mono text-gold/40 flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-gold" />
                SYSTEM_LIVE
              </div>
            </div>
          </div>
        </div>
        
        <button
          onClick={handleAnalyze}
          disabled={analyzing || !resumeText.trim()}
          className="group relative w-full py-6 bg-gold text-black rounded-[2rem] font-black text-lg uppercase tracking-widest hover:bg-gold-bright disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_30px_60px_-15px_rgba(201,162,39,0.2)] active:scale-[0.98] overflow-hidden"
        >
          <span className="relative z-10 flex items-center justify-center gap-4">
            {analyzing ? (
              <>
                <Loader2 className="animate-spin w-6 h-6 text-black" />
                Neural Processor Online...
              </>
            ) : (
              <>
                <Sparkles size={24} className="text-black" />
                Initiate Scrutiny Analysis
              </>
            )}
          </span>
        </button>

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3"
          >
            <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={16} />
            <div>
              <p className="text-xs font-black text-red-500 uppercase tracking-wider mb-1">{error.message}</p>
              <p className="text-[10px] text-red-400 font-medium leading-relaxed">{error.suggestion}</p>
            </div>
          </motion.div>
        )}

        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 }}
              className="bg-bg-secondary p-12 md:p-16 rounded-[3rem] shadow-2xl border border-white/5 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-16 opacity-[0.02] pointer-events-none scale-150 rotate-12 text-gold">
                <Sparkles size={300} />
              </div>
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16 border-b border-white/5 pb-10">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-[2px] bg-gold" />
                  <div>
                    <p className="text-[10px] font-mono font-black text-ink-muted uppercase tracking-[0.4em] mb-2">Neural Audit Result</p>
                    <h3 className="text-4xl font-black text-ink-primary tracking-tight leading-none uppercase">Analysis Report</h3>
                  </div>
                </div>
                
                <div className="flex items-center gap-8 bg-bg-tertiary p-8 rounded-[2.5rem] border border-white/5 shadow-2xl relative overflow-hidden group min-w-[340px]">
                  <div className="absolute top-0 right-0 p-4 opacity-[0.03] pointer-events-none group-hover:scale-110 transition-transform duration-700">
                    <TrendingUp size={100} />
                  </div>
                  <div className="relative w-24 h-24 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="48"
                        cy="48"
                        r="44"
                        stroke="currentColor"
                        strokeWidth="6"
                        fill="transparent"
                        className="text-white/5"
                      />
                      <circle
                        cx="48"
                        cy="48"
                        r="44"
                        stroke="currentColor"
                        strokeWidth="6"
                        fill="transparent"
                        strokeDasharray={276.5}
                        strokeDashoffset={276.5 - (276.5 * result.score) / 100}
                        className="text-gold transition-all duration-1000 ease-out"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-black text-ink-primary leading-none">
                        <ScoreCounter target={result.score} />
                      </span>
                      <span className="text-[8px] font-mono font-black text-ink-muted uppercase">Ready</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-mono font-black text-ink-muted uppercase tracking-widest mb-1">Diagnostic Score</p>
                    <p className="text-xl font-black text-gold uppercase tracking-tight">
                      {result.score >= 85 ? 'High Resonance' : result.score >= 65 ? 'Core Stability' : 'Low Frequency'}
                    </p>
                    <p className="text-[9px] text-ink-secondary font-medium uppercase tracking-wider mt-1">Narrative Signal Level</p>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2">
                  <div className="markdown-body prose prose-invert max-w-none prose-headings:text-ink-primary prose-headings:font-black prose-p:text-ink-secondary prose-p:leading-[1.8] prose-strong:text-gold prose-li:text-ink-secondary lg:prose-lg prose-gold font-serif">
                    <ReactMarkdown>{result.feedbackMarkdown}</ReactMarkdown>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="bg-bg-tertiary p-8 rounded-[2rem] border border-white/5">
                    <h4 className="text-xs font-black text-ink-muted uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                      <Target size={14} className="text-gold" />
                      Key Takeaways
                    </h4>
                    <div className="space-y-4">
                      {result.keyTakeaways.map((takeaway, i) => (
                        <div key={i} className="flex gap-3 items-start">
                          <div className="mt-1.5 w-1 h-1 rounded-full bg-gold shrink-0" />
                          <p className="text-ink-secondary text-[11px] font-medium leading-relaxed">{takeaway}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-12 pt-12 border-t border-white/5 flex flex-wrap gap-6 items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="bg-bg-tertiary text-gold border border-white/5 px-5 py-2.5 rounded-xl text-[10px] font-mono font-black uppercase tracking-[0.2em] shadow-lg">
                    Expert Grade
                  </div>
                  <div className="text-ink-muted text-[10px] font-mono font-black uppercase tracking-[0.2em]">
                    Verified by Gemini 2.0 Flash
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )}
  </AnimatePresence>
</div>
  );
}

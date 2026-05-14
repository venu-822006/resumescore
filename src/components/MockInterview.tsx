import React from 'react';
import { PERSONAS } from '@/src/constants/dataset';
import { startMockInterview } from '@/src/services/gemini';
import { motion, AnimatePresence } from 'motion/react';
import { ErrorNotice } from '@/src/components/ErrorNotice';
import { 
  Loader2, 
  Send, 
  User, 
  Bot, 
  RefreshCw, 
  MessageSquare, 
  History, 
  ArrowLeft,
  Calendar,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface InterviewHistory {
  id: string;
  role: string;
  persona: string;
  date: string;
  messages: Message[];
}

export default function MockInterview() {
  const [selectedPersona, setSelectedPersona] = React.useState(PERSONAS[0].id);
  const [role, setRole] = React.useState('Software Engineer');
  const [isInterviewing, setIsInterviewing] = React.useState(false);
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [input, setInput] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [chatSession, setChatSession] = React.useState<any>(null);
  const [history, setHistory] = React.useState<InterviewHistory[]>([]);
  const [viewingPastInterview, setViewingPastInterview] = React.useState<InterviewHistory | null>(null);
  const [error, setError] = React.useState<{ message: string, suggestion: string } | null>(null);
  const [showHistoryModal, setShowHistoryModal] = React.useState(false);
  
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const handleTerminate = () => {
    saveToHistory();
    setIsInterviewing(false);
    setMessages([]);
    setChatSession(null);
  };

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+R: Terminate
      if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
        if (isInterviewing) {
          e.preventDefault();
          handleTerminate();
        }
      }
      // Ctrl+H: Toggle History
      if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
        e.preventDefault();
        if (isInterviewing) {
          setShowHistoryModal(prev => !prev);
        } else {
          // On setup screen, scroll to history
          const historyEl = document.getElementById('interview-history-sidebar');
          if (historyEl) {
            historyEl.scrollIntoView({ behavior: 'smooth' });
            historyEl.classList.add('ring-2', 'ring-gold', 'ring-offset-4', 'ring-offset-bg-primary');
            setTimeout(() => historyEl.classList.remove('ring-2', 'ring-gold', 'ring-offset-4', 'ring-offset-bg-primary'), 2000);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isInterviewing, messages, chatSession]);

  React.useEffect(() => {
    const saved = localStorage.getItem('interview_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse history', e);
      }
    }
  }, []);

  const saveToHistory = () => {
    if (messages.length === 0) return;

    const newEntry: InterviewHistory = {
      id: Date.now().toString(),
      role,
      persona: PERSONAS.find(p => p.id === selectedPersona)?.name || 'Unknown',
      date: new Date().toLocaleString(),
      messages
    };

    const updatedHistory = [newEntry, ...history].slice(0, 20); // Keep last 20
    setHistory(updatedHistory);
    localStorage.setItem('interview_history', JSON.stringify(updatedHistory));
  };

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleStart = async () => {
    setLoading(true);
    setError(null);
    try {
      const persona = PERSONAS.find(p => p.id === selectedPersona)?.name || '';
      const session = await startMockInterview(persona, role);
      setChatSession(session);
      
      const response = await session.sendMessage({ message: `I am ready. Please start the interview for the ${role} position.` });
      
      if (!response || !response.text) {
        throw new Error('NULL_SIGNAL');
      }

      setMessages([{ role: 'assistant', content: response.text }]);
      setIsInterviewing(true);
    } catch (err: any) {
      console.error(err);
      setError({
        message: "Neural Link Establishment Failure",
        suggestion: "The interview persona could not be initialized. This is typically a transient connection glitch. Re-attempt the session entry protocol."
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || !chatSession || loading) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const result = await chatSession.sendMessage({ message: userMessage });
      if (!result || !result.text) throw new Error('NULL_SIGNAL');
      setMessages(prev => [...prev, { role: 'assistant', content: result.text }]);
    } catch (err: any) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Connection lost. Please restart the interview session to restore the neural link.' }]);
    } finally {
      setLoading(false);
    }
  };

  if (viewingPastInterview) {
    return (
      <div className="h-[calc(100vh-4rem)] flex flex-col p-4">
        <div className="flex items-center justify-between px-8 py-6 bg-bg-secondary border-b border-white/5 rounded-t-[2rem] shadow-sm">
          <div className="flex items-center gap-5">
            <button 
              onClick={() => setViewingPastInterview(null)}
              className="p-3 bg-gold text-black rounded-xl hover:bg-gold-bright transition-all shadow-lg active:scale-95"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h3 className="font-black text-ink-primary uppercase tracking-tight text-lg">
                {viewingPastInterview.role} Transcript
              </h3>
              <p className="text-[10px] text-ink-muted flex items-center gap-2 font-mono uppercase tracking-[0.2em]">
                Archive Record <span className="text-gold"> {viewingPastInterview.persona} </span> • {viewingPastInterview.date}
              </p>
            </div>
          </div>
        </div>

        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-10 space-y-10 bg-bg-primary/50 backdrop-blur-sm scroll-smooth"
        >
          {viewingPastInterview.messages.map((msg, idx) => (
            <div
              key={idx}
              className={cn(
                "flex items-start gap-6 max-w-[75%]",
                msg.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
              )}
            >
              <div className={cn(
                "p-4 rounded-2xl border flex-shrink-0 shadow-lg transition-all",
                msg.role === 'user' 
                  ? "bg-gold border-gold text-black" 
                  : "bg-bg-tertiary border-white/5 text-gold"
              )}>
                {msg.role === 'user' ? <User size={20} strokeWidth={2.5} /> : <Bot size={20} strokeWidth={2.5} />}
              </div>
              <div className={cn(
                "p-8 rounded-[2rem] shadow-sm leading-relaxed text-sm font-medium",
                msg.role === 'user' 
                  ? "bg-gold/10 text-gold rounded-tr-none border border-gold/20" 
                  : "bg-bg-secondary text-ink-secondary border border-white/5 rounded-tl-none font-serif"
              )}>
                {msg.content}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isInterviewing) {
    return (
      <div className="h-[calc(100vh-4rem)] flex flex-col p-4">
        <div className="flex items-center justify-between px-8 py-6 bg-bg-secondary border-b border-white/5 rounded-t-[2rem] shadow-sm">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-bg-tertiary rounded-2xl text-gold shadow-xl shadow-gold/10 border border-white/5">
              <Bot size={24} strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="font-black text-ink-primary uppercase tracking-tight text-lg">
                {PERSONAS.find(p => p.id === selectedPersona)?.name}
              </h3>
              <p className="text-[10px] text-ink-muted flex items-center gap-2 font-mono uppercase tracking-[0.2em]">
                Live Link <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" /> <span className="text-gold"> {role} </span>
              </p>
            </div>
          </div>
          <button 
            onClick={handleTerminate}
            className="flex items-center gap-3 text-[10px] font-black text-ink-muted hover:text-rose-500 transition-all uppercase tracking-widest border border-white/5 px-6 py-3 rounded-2xl group"
            title="Ctrl+R to Terminate"
          >
            <RefreshCw size={14} className="group-hover:rotate-180 transition-transform duration-700" />
            Terminate Sequence
          </button>
        </div>

        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-10 space-y-10 bg-bg-primary/50 backdrop-blur-sm scroll-smooth"
        >
          {messages.map((msg, idx) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              key={idx}
              className={cn(
                "flex items-start gap-6 max-w-[75%]",
                msg.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
              )}
            >
              <div className={cn(
                "p-4 rounded-2xl border flex-shrink-0 shadow-lg transition-all",
                msg.role === 'user' 
                  ? "bg-gold border-gold text-black" 
                  : "bg-bg-tertiary border-white/5 text-gold"
              )}>
                {msg.role === 'user' ? <User size={20} strokeWidth={2.5} /> : <Bot size={20} strokeWidth={2.5} />}
              </div>
              <div className={cn(
                "p-8 rounded-[2rem] shadow-sm leading-relaxed text-sm font-medium",
                msg.role === 'user' 
                  ? "bg-gold/10 text-gold rounded-tr-none border border-gold/20" 
                  : "bg-bg-secondary text-ink-secondary border border-white/5 rounded-tl-none font-serif"
              )}>
                {msg.content}
              </div>
            </motion.div>
          ))}
          {loading && (
            <div className="mr-auto flex items-center gap-4 text-ink-muted text-[10px] font-mono font-black uppercase tracking-[0.3em] ml-20 bg-bg-secondary px-6 py-3 rounded-full border border-white/5 shadow-sm">
              <Loader2 size={14} className="animate-spin text-gold" />
              Neural Processing ...
            </div>
          )}
        </div>

        <div className="p-8 bg-bg-secondary border-t border-white/5 rounded-b-[2rem] shadow-2xl">
          <form onSubmit={handleSend} className="flex gap-4 max-w-5xl mx-auto">
            <input
              type="text"
              value={input}
              disabled={loading}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Input response data..."
              className="flex-1 px-8 py-5 bg-bg-tertiary rounded-[1.5rem] outline-none focus:ring-4 focus:ring-gold/5 focus:border-gold transition-all border border-white/5 font-bold text-ink-primary placeholder:text-ink-muted disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <button
              disabled={!input.trim() || loading}
              className="p-5 bg-gold text-black rounded-[1.5rem] shadow-2xl hover:bg-gold-bright disabled:opacity-50 transition-all active:scale-95 group min-w-[70px] flex items-center justify-center"
            >
              <Send size={24} className="text-black group-hover:scale-110 transition-transform" />
            </button>
          </form>
        </div>

        <AnimatePresence>
          {showHistoryModal && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowHistoryModal(false)}
                className="fixed inset-0 bg-black/80 backdrop-blur-md z-[60]"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, x: '-50%', y: '-50%' }}
                animate={{ opacity: 1, scale: 1, x: '-50%', y: '-50%' }}
                exit={{ opacity: 0, scale: 0.95, x: '-50%', y: '-50%' }}
                className="fixed top-1/2 left-1/2 w-full max-w-2xl h-[80vh] bg-bg-secondary border border-white/10 rounded-[3rem] z-[70] p-10 flex flex-col shadow-2xl"
              >
                <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/5">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gold/10 rounded-xl text-gold border border-gold/20">
                      <History size={20} />
                    </div>
                    <div>
                      <h3 className="font-black text-ink-primary uppercase tracking-tight text-lg">Neural Archive</h3>
                      <p className="text-[10px] text-ink-muted font-mono uppercase tracking-widest">Protocol Reference Layer</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowHistoryModal(false)}
                    className="p-3 hover:bg-white/5 rounded-xl transition-colors text-ink-muted"
                  >
                    <ArrowLeft size={20} />
                  </button>
                </div>
                
                <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-hide">
                  {history.length === 0 ? (
                    <div className="text-center py-20 opacity-20">
                      <Calendar size={48} className="mx-auto mb-4 text-gold" />
                      <p className="text-[10px] font-mono font-black uppercase tracking-widest">Buffer Empty</p>
                    </div>
                  ) : (
                    history.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          setShowHistoryModal(false);
                          setViewingPastInterview(item);
                        }}
                        className="w-full text-left bg-bg-tertiary p-6 rounded-2xl border border-white/5 hover:border-gold/30 hover:shadow-xl transition-all group relative overflow-hidden"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-[10px] font-black text-gold uppercase tracking-tighter bg-gold/10 border border-gold/20 px-2 py-0.5 rounded-md">
                            {item.role}
                          </span>
                          <ChevronRight size={14} className="text-ink-muted group-hover:text-gold group-hover:translate-x-1 transition-all" />
                        </div>
                        <div className="text-xs font-bold text-ink-primary group-hover:text-gold transition-colors leading-none">{item.persona}</div>
                        <div className="text-[9px] text-ink-muted mt-3 font-mono uppercase tracking-widest">{item.date}</div>
                      </button>
                    ))
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-12 px-6">
      <header className="mb-16">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
          <span className="text-[10px] font-mono font-black uppercase tracking-[0.4em] text-ink-muted leading-none">Persona Simulation</span>
        </div>
        <h2 className="text-6xl font-black tracking-tighter mb-6 text-ink-primary font-display uppercase leading-[0.9]">
          Communication <span className="text-gold">Gaps</span>.
        </h2>
        <p className="text-ink-secondary text-lg max-w-2xl font-medium leading-relaxed">
          Simulate high-stakes technical dialogues. Our neural persona engine adapts in real-time to challenge your narrative clarity and bridging capacity.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-10">
          <div className="bg-bg-secondary p-10 rounded-[2.5rem] border border-white/5 shadow-sm space-y-10 relative overflow-hidden group">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div>
                <label className="block text-[10px] font-mono font-black text-ink-muted mb-6 uppercase tracking-[0.3em] leading-none">
                  Persona Calibration
                </label>
                <div className="space-y-3">
                  {PERSONAS.map((p) => (
                    <button
                      key={p.id}
                      disabled={loading}
                      onClick={() => setSelectedPersona(p.id)}
                      className={cn(
                        "w-full text-left p-6 rounded-2xl transition-all duration-300 border disabled:opacity-50 disabled:cursor-not-allowed",
                        selectedPersona === p.id 
                          ? "bg-gold border-gold text-black shadow-xl" 
                          : "bg-bg-tertiary border-white/5 text-ink-secondary hover:border-gold/30"
                      )}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="font-bold text-sm uppercase tracking-tight leading-none">{p.name}</div>
                        {selectedPersona === p.id && <div className="w-1.5 h-1.5 rounded-full bg-black animate-pulse" />}
                      </div>
                      <div className={cn(
                        "text-[10px] uppercase font-black tracking-widest mt-1",
                        selectedPersona === p.id ? "text-black/60" : "text-ink-muted"
                      )}>{p.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-8">
                <div>
                  <label className="block text-[10px] font-mono font-black text-ink-muted mb-4 uppercase tracking-[0.3em] leading-none">
                    Target Vector [Role]
                  </label>
                  <input
                    type="text"
                    value={role}
                    disabled={loading}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="e.g. SYSTEMS_ARCHITECT_L6"
                    className="w-full px-6 py-4 rounded-2xl bg-bg-tertiary border border-white/5 focus:ring-4 focus:ring-gold/5 focus:border-gold outline-none transition-all font-bold text-ink-primary placeholder:text-ink-muted uppercase text-xs tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                <div className="p-8 bg-bg-primary rounded-[2rem] text-ink-primary relative overflow-hidden border border-white/5 shadow-2xl">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gold/5 blur-2xl pointer-events-none" />
                  <Bot className="mb-6 text-gold" size={32} />
                  <h3 className="text-[10px] font-mono font-black mb-3 uppercase tracking-[0.3em] text-gold/80 leading-none">Tactical Insight</h3>
                  <p className="text-xs text-ink-secondary leading-relaxed font-medium italic font-serif">
                    "The algorithm simulates high-pressure scrutiny. Maintain a structured STAR narrative and emphasize technical tradeoff analysis."
                  </p>
                </div>

                <button
                  onClick={handleStart}
                  disabled={loading}
                  className="group relative w-full py-5 bg-gold text-black rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-gold-bright disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl active:scale-[0.98] overflow-hidden"
                >
                  <span className="relative z-10 flex items-center justify-center gap-3">
                    {loading ? (
                      <>
                        <Loader2 className="animate-spin w-5 h-5 text-black" />
                        Initializing Link...
                      </>
                    ) : (
                      <>
                        <MessageSquare size={18} className="text-black" />
                        Enter Session
                      </>
                    )}
                  </span>
                </button>

                <AnimatePresence>
                  {error && (
                    <div className="mt-8">
                      <ErrorNotice error={error} onRetry={handleStart} />
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        <div id="interview-history-sidebar" className="lg:col-span-4 bg-bg-secondary rounded-[3rem] border border-white/5 p-10 flex flex-col h-full max-h-[700px] shadow-sm transition-all duration-500">
          <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/5">
            <div className="flex items-center gap-3">
              <History size={16} className="text-gold" />
              <h3 className="font-mono font-black uppercase tracking-[0.3em] text-[10px] text-ink-muted">Archived Transcripts</h3>
            </div>
            <div className="text-[9px] font-mono text-ink-muted opacity-50">Ctrl+H</div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-hide">
            {history.length === 0 ? (
              <div className="text-center py-20 opacity-20">
                <Calendar size={48} className="mx-auto mb-4 text-gold" />
                <p className="text-[10px] font-mono font-black uppercase tracking-widest">Buffer Empty</p>
              </div>
            ) : (
              history.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setViewingPastInterview(item)}
                  className="w-full text-left bg-bg-tertiary p-6 rounded-2xl border border-white/5 hover:border-gold/30 hover:shadow-xl transition-all group relative overflow-hidden"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-black text-gold uppercase tracking-tighter bg-gold/10 border border-gold/20 px-2 py-0.5 rounded-md">
                      {item.role}
                    </span>
                    <ChevronRight size={14} className="text-ink-muted group-hover:text-gold group-hover:translate-x-1 transition-all" />
                  </div>
                  <div className="text-xs font-bold text-ink-primary group-hover:text-gold transition-colors leading-none">{item.persona}</div>
                  <div className="text-[9px] text-ink-muted mt-3 font-mono uppercase tracking-widest">{item.date}</div>
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

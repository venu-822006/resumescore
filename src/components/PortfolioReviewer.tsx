import React from 'react';
import { reviewPortfolio, startPortfolioChat } from '@/src/services/gemini';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { ErrorNotice } from '@/src/components/ErrorNotice';
import { 
  Loader2, 
  Globe, 
  Sparkles, 
  Layout, 
  Target, 
  Zap, 
  MessageCircle,
  Send,
  User,
  Bot,
  AlertCircle,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function PortfolioReviewer() {
  const [url, setUrl] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [reviewing, setReviewing] = React.useState(false);
  const [result, setResult] = React.useState<string | null>(null);
  const [validationError, setValidationError] = React.useState<string | null>(null);
  const [error, setError] = React.useState<{ message: string, suggestion: string } | null>(null);

  // Chat states
  const [chatSession, setChatSession] = React.useState<any>(null);
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [chatInput, setChatInput] = React.useState('');
  const [loadingChat, setLoadingChat] = React.useState(false);
  const [isChatOpen, setIsChatOpen] = React.useState(false);

  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const validateUrl = (value: string) => {
    if (!value.trim()) return "URL is required";
    
    // Strict URL regex that requires at least a domain and TLD, optional protocol
    const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w \.-]*)*\/?$/i;
    
    if (!urlPattern.test(value.trim())) {
      return "Please enter a valid URL (e.g., https://yourportfolio.com)";
    }
    
    try {
      const normalizedValue = value.startsWith('http') ? value : `https://${value}`;
      new URL(normalizedValue);
      return null;
    } catch (e) {
      return "Critical: URL format corruption detected.";
    }
  };

  const handleReview = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const error = validateUrl(url);
    if (error) {
      setValidationError(error);
      return;
    }

    setValidationError(null);
    setReviewing(true);
    setResult(null);
    setMessages([]);
    setIsChatOpen(false);
    setError(null);
    
    try {
      const normalizedUrl = url.startsWith('http') ? url : `https://${url}`;
      const feedback = await reviewPortfolio(normalizedUrl, description);
      if (!feedback) throw new Error('NULL_SIGNAL');
      setResult(feedback);
      
      const session = await startPortfolioChat(feedback);
      setChatSession(session);
    } catch (err: any) {
      console.error('Portfolio Review Error:', err);
      if (err.message === 'NULL_SIGNAL') {
        setError({
          message: "Empty Audit Pipeline",
          suggestion: "The analysis engine returned no data. Ensure your portfolio URL is public and contains scrapable technical content."
        });
      } else {
        setError({
          message: "Visual Authority Sync Failure",
          suggestion: "The review protocol was interrupted. This often occurs when the site endpoint is protected by a firewall or script blocks. Verify accessibility and retry."
        });
      }
      setResult(null);
    } finally {
      setReviewing(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !chatSession || loadingChat) return;

    const userMsg = chatInput;
    setChatInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoadingChat(true);

    try {
      const response = await chatSession.sendMessage({ message: userMsg });
      setMessages(prev => [...prev, { role: 'assistant', content: response.text || '' }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Something went wrong. Please try again.' }]);
    } finally {
      setLoadingChat(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-12 px-6">
      <header className="mb-16">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
          <span className="text-[10px] font-mono font-black uppercase tracking-[0.4em] text-ink-muted leading-none">Visual Identity Audit</span>
        </div>
        <h2 className="text-6xl font-black tracking-tighter mb-6 text-ink-primary font-display uppercase leading-[0.9]">
          Portfolio <span className="text-gold">Audit</span>.
        </h2>
        <p className="text-ink-secondary text-lg max-w-2xl font-medium leading-relaxed">
          Fine-tune your personal brand and project showcase. Our model analyzes visual hierarchy, conversion psychology, and code narrative to position you as an industry leader.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        <div className={cn(
          "transition-all duration-700 space-y-10",
          result ? "lg:col-span-7" : "lg:col-span-12"
        )}>
          <div className="bg-bg-secondary p-10 rounded-[2.5rem] border border-white/5 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-10 relative overflow-hidden group">
            <div className="space-y-8">
              <div>
                <label className="block text-[10px] font-mono font-black text-ink-muted mb-4 uppercase tracking-[0.3em] flex items-center gap-2 leading-none">
                  01. Digital Endpoint [URL]
                </label>
                <motion.input
                  whileFocus={{ scale: 1.005, boxShadow: "0 20px 40px -10px rgba(201, 162, 39, 0.1)" }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  type="url"
                  value={url}
                  disabled={reviewing}
                  onChange={(e) => {
                    setUrl(e.target.value);
                    if (validationError) setValidationError(null);
                  }}
                  placeholder="https://yourportfolio.com"
                  className={cn(
                    "w-full px-6 py-4 rounded-2xl bg-bg-tertiary border outline-none transition-all font-bold text-ink-primary placeholder:text-ink-muted uppercase text-xs tracking-widest disabled:opacity-50 disabled:cursor-not-allowed",
                    validationError 
                      ? "border-red-500/50 focus:ring-4 focus:ring-red-500/5 focus:border-red-500" 
                      : "border-white/5 focus:ring-4 focus:ring-gold/5 focus:border-gold"
                  )}
                />
                {validationError && (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-2 text-[10px] text-red-400 mt-3 font-mono font-black uppercase tracking-widest bg-red-500/10 p-3 rounded-xl border border-red-500/20"
                  >
                    <AlertCircle size={14} />
                    {validationError}
                  </motion.div>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-mono font-black text-ink-muted mb-4 uppercase tracking-[0.3em] flex items-center gap-2 leading-none">
                  02. Project Context [Narrative]
                </label>
                <textarea
                  value={description}
                  disabled={reviewing}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your architectural decisions and the impact of your showcased work..."
                  className="w-full h-40 p-6 rounded-2xl bg-bg-tertiary border border-white/5 focus:ring-4 focus:ring-gold/5 focus:border-gold outline-none transition-all resize-none font-medium text-ink-secondary leading-relaxed scrollbar-hide text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleReview}
                disabled={reviewing || !url.trim()}
                className="group relative w-full py-5 bg-gold text-black rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-gold-bright disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl active:scale-[0.98] overflow-hidden"
              >
                <span className="relative z-10 flex items-center justify-center gap-3">
                  {reviewing ? (
                    <>
                      <Loader2 className="animate-spin w-5 h-5 text-black" />
                      Analyzing Signal...
                    </>
                  ) : (
                    <>
                      <Zap size={18} className="text-black" />
                      Execute Design Audit
                    </>
                  )}
                </span>
              </motion.button>
            </div>

            <div className="bg-bg-primary text-ink-primary rounded-[2rem] p-10 border border-white/5 shadow-2xl relative overflow-hidden flex flex-col justify-center gap-10">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 blur-3xl rounded-full" />
              {[
                { icon: Layout, title: "Visual Polish", desc: "Color theory, typography, & UI hierarchy analysis." },
                { icon: Target, title: "Conversion", desc: "CTA effectiveness and resume accessibility check." },
                { icon: Sparkles, title: "Code Narrative", desc: "Technical complexity and stack relevance review." }
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-5 group/item">
                  <div className="p-3 bg-bg-tertiary border border-white/5 rounded-xl text-gold group-hover/item:bg-gold group-hover/item:text-black transition-all transform group-hover/item:scale-110">
                    <item.icon size={18} />
                  </div>
                  <div>
                    <h4 className="font-black text-[10px] font-mono uppercase tracking-[0.2em] mb-1 leading-none">{item.title}</h4>
                    <p className="text-[10px] text-ink-muted font-bold uppercase tracking-tight leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <AnimatePresence>
            {error && (
              <div className="mt-10">
                <ErrorNotice error={error} onRetry={() => handleReview({ preventDefault: () => {} } as any)} />
              </div>
            )}
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -40 }}
                className="bg-bg-secondary p-12 md:p-16 rounded-[3rem] shadow-2xl border border-white/5 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-16 opacity-[0.02] pointer-events-none rotate-12 text-gold">
                  <Globe size={300} />
                </div>
                
                <div className="flex items-center justify-between mb-12 border-b border-white/5 pb-8">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-[2px] bg-gold" />
                    <h3 className="text-3xl font-black text-ink-primary tracking-tight leading-none uppercase">Neural Audit Report</h3>
                  </div>
                  <button 
                    onClick={() => setIsChatOpen(true)}
                    className="flex items-center gap-3 px-6 py-3 bg-gold/10 text-gold rounded-xl font-black text-[10px] uppercase tracking-widest border border-gold/20 hover:bg-gold/20 transition-all lg:hidden"
                  >
                    <MessageCircle size={14} />
                    Consult
                  </button>
                </div>
                
                <div className="markdown-body prose prose-invert prose-headings:font-black prose-headings:text-ink-primary prose-p:text-ink-secondary prose-strong:text-gold lg:prose-lg prose-gold max-w-none font-serif">
                  <ReactMarkdown>{result}</ReactMarkdown>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Chat Interface */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className={cn(
                "fixed inset-y-0 right-0 z-50 w-full md:w-[450px] bg-bg-secondary shadow-[0_0_100px_rgba(0,0,0,0.3)] flex flex-col transform transition-transform lg:static lg:col-span-5 lg:h-[800px] lg:rounded-[3rem] lg:border lg:border-white/5 lg:shadow-sm overflow-hidden",
                isChatOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"
              )}
            >
              <div className="p-8 border-b border-white/5 bg-bg-tertiary text-ink-primary flex items-center justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gold/5 blur-2xl pointer-events-none" />
                <div className="flex items-center gap-4 relative z-10">
                  <div className="p-3 bg-gold rounded-xl text-black shadow-lg shadow-gold/20">
                    <MessageCircle size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm uppercase tracking-widest leading-none">Consultation</h3>
                    <p className="text-[10px] text-ink-muted font-mono font-black uppercase tracking-[0.3em] mt-2 leading-none">Neural Agent Active</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsChatOpen(false)}
                  className="p-2 text-ink-muted hover:text-ink-primary transition-colors lg:hidden"
                >
                  <ChevronRight size={24} />
                </button>
              </div>

              <div 
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-8 space-y-8 bg-bg-primary/50 backdrop-blur-sm scrollbar-hide"
              >
                {messages.length === 0 && !loadingChat && (
                  <div className="text-center py-20 opacity-20">
                    <MessageCircle size={64} strokeWidth={1} className="mx-auto mb-6 text-gold" />
                    <p className="text-[10px] font-mono font-black uppercase tracking-[0.3em] px-12 leading-relaxed">Neural Buffer Initialized. Awaiting Specific Inquiries.</p>
                  </div>
                )}
                
                {messages.map((msg, idx) => (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={idx}
                    className={cn(
                      "flex items-start gap-4 max-w-[85%]",
                      msg.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
                    )}
                  >
                    <div className={cn(
                      "p-2 rounded-xl flex-shrink-0 shadow-lg border",
                      msg.role === 'user' ? "bg-gold border-gold text-black" : "bg-bg-tertiary border-white/5 text-gold"
                    )}>
                      {msg.role === 'user' ? <User size={16} strokeWidth={2.5} /> : <Bot size={16} strokeWidth={2.5} />}
                    </div>
                    <div className={cn(
                      "p-5 rounded-2xl text-[13px] font-medium leading-relaxed",
                      msg.role === 'user' 
                        ? "bg-gold/10 text-gold rounded-tr-none border border-gold/20" 
                        : "bg-bg-secondary text-ink-secondary border border-white/5 rounded-tl-none font-serif"
                    )}>
                      {msg.content}
                    </div>
                  </motion.div>
                ))}
                {loadingChat && (
                  <div className="flex items-center gap-4 text-ink-muted text-[10px] font-mono font-black uppercase tracking-[0.3em] ml-2">
                    <Loader2 size={14} className="animate-spin text-gold" />
                    Neural Processing...
                  </div>
                )}
              </div>

              <div className="p-8 border-t border-white/5 bg-bg-tertiary">
                <form onSubmit={handleSendMessage} className="flex gap-4">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Inquiry data..."
                    className="flex-1 px-6 py-4 bg-bg-primary rounded-2xl outline-none text-xs font-bold focus:ring-4 focus:ring-gold/5 focus:border-gold transition-all border border-white/5 uppercase tracking-widest placeholder:text-ink-muted text-ink-primary"
                  />
                  <button
                    disabled={!chatInput.trim() || loadingChat}
                    className="p-4 bg-gold text-black rounded-2xl shadow-xl hover:bg-gold-bright disabled:opacity-50 transition-all active:scale-95 group"
                  >
                    <Send size={20} className="text-black group-hover:scale-110 transition-transform" />
                  </button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

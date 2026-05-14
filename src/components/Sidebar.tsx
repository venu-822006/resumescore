import React from 'react';
import { 
  Code2, 
  FileText, 
  MessageSquare, 
  Briefcase, 
  LayoutDashboard,
  Menu,
  X,
  LogOut,
  Target
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const { user, logout } = useAuth();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'readiness', label: 'Readiness Score', icon: Target },
    { id: 'technical', label: 'Technical Skills', icon: Code2 },
    { id: 'resume', label: 'Resume Analysis', icon: FileText },
    { id: 'communication', label: 'Communication Gaps', icon: MessageSquare },
    { id: 'portfolio', label: 'Portfolio Audit', icon: Briefcase },
  ];

  return (
    <>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-[#141414] text-white rounded-md shadow-md"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <div className={cn(
        "fixed inset-y-0 left-0 z-40 w-72 bg-bg-primary text-ink-primary transition-transform duration-500 transform lg:translate-x-0 border-r border-white/5",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto p-8 space-y-12 custom-scrollbar">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-gold rounded-lg flex items-center justify-center text-black shadow-[0_0_20px_rgba(201,162,39,0.3)]">
                  <Code2 size={18} strokeWidth={3} />
                </div>
                <h1 className="text-xl font-black tracking-tighter uppercase font-display">
                  Interview<span className="text-gold">Ready</span>.
                </h1>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-[1px] w-4 bg-gold/30" />
                <p className="text-[10px] text-ink-muted uppercase tracking-[0.4em] font-black">
                  Neural Prep v1.0
                </p>
              </div>
            </div>

            <nav className="space-y-3">
              <p className="text-[10px] font-black text-ink-muted/50 uppercase tracking-[0.2em] mb-4 ml-2">Navigation</p>
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center gap-4 px-5 py-4 rounded-xl transition-all duration-300 group relative overflow-hidden border border-transparent",
                    activeTab === item.id 
                      ? "bg-white/5 text-gold border-white/5 shadow-xl" 
                      : "text-ink-muted hover:text-gold hover:bg-white/5"
                  )}
                >
                  <item.icon size={18} className={cn(
                    "transition-all duration-300",
                    activeTab === item.id ? "scale-110 text-gold" : "group-hover:scale-110"
                  )} />
                  <span className="font-bold text-sm uppercase tracking-wide">{item.label}</span>
                  
                  {activeTab === item.id && (
                    <motion.div 
                      layoutId="active-pill"
                      className="absolute right-4 w-1.5 h-1.5 rounded-full bg-gold shadow-[0_0_10px_rgba(201,162,39,0.8)]"
                    />
                  )}
                </button>
              ))}
            </nav>

            <div className="space-y-4 pb-4">
              {user && (
                <div 
                  onClick={() => setActiveTab('profile')}
                  className={cn(
                    "flex items-center gap-3 p-4 rounded-2xl border transition-all cursor-pointer group/user",
                    activeTab === 'profile' 
                      ? "bg-gold/10 border-gold shadow-lg" 
                      : "bg-white/5 border-white/5 hover:border-gold/30"
                  )}
                >
                  <img 
                    src={`https://ui-avatars.com/api/?name=${user.displayName}`} 
                    alt={user.displayName || 'User'} 
                    className={cn(
                      "w-10 h-10 rounded-xl border transition-all",
                      activeTab === 'profile' ? "grayscale-0 border-gold/50" : "border-white/10 grayscale group-hover/user:grayscale-0"
                    )}
                  />
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      "text-sm font-black truncate uppercase tracking-tight transition-colors",
                      activeTab === 'profile' ? "text-gold" : "text-ink-primary"
                    )}>
                      {user.displayName?.split(' ')[0] || 'Agent'}
                    </p>
                    <p className="text-[10px] text-ink-muted font-black uppercase tracking-widest truncate">
                      Identity Profile
                    </p>
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      logout();
                    }}
                    className="p-2 text-ink-muted hover:text-red-400 transition-colors"
                    title="Terminate Session"
                  >
                    <LogOut size={16} />
                  </button>
                </div>
              )}

              <div className="bg-white/5 rounded-2xl p-5 border border-white/5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gold/5 blur-2xl group-hover:bg-gold/10 transition-all pointer-events-none" />
                <p className="text-[10px] text-gold font-black mb-2 uppercase tracking-[0.2em]">System Status</p>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-2 h-2 rounded-full bg-gold animate-ping absolute inset-0" />
                    <div className="w-2 h-2 rounded-full bg-gold relative" />
                  </div>
                  <span className="text-xs font-bold text-ink-muted uppercase tracking-tighter">Gemini v2 Optimal</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

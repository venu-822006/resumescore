import React from 'react';
import { useAuth } from '../context/AuthContext';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { updateProfile } from 'firebase/auth';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User as UserIcon, 
  Mail, 
  Camera, 
  CheckCircle2, 
  AlertCircle,
  Save,
  ShieldCheck,
  Fingerprint
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { ErrorNotice } from './ErrorNotice';

export default function UserProfile() {
  const { user } = useAuth();
  const [displayName, setDisplayName] = React.useState(user?.displayName || '');
  const [photoURL, setPhotoURL] = React.useState(user?.photoURL || '');
  const [saving, setSaving] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [error, setError] = React.useState<{ message: string, suggestion: string } | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      // 1. Update Firebase Auth Profile
      await updateProfile(user, {
        displayName: displayName,
        photoURL: photoURL
      });

      // 2. Update Firestore User Document
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        await updateDoc(userRef, {
          displayName,
          photoURL,
          updatedAt: new Date().toISOString()
        });
      } else {
        await setDoc(userRef, {
          uid: user.uid,
          email: user.email,
          displayName,
          photoURL,
          createdAt: new Date().toISOString()
        });
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error('Profile update error:', err);
      setError({
        message: "Profile Sync Failed",
        suggestion: "The biometric handshake with our Firestore cluster was interrupted. Ensure your data stream is stable and retry the update protocol."
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-12 px-6">
      <header className="mb-16 flex flex-col md:flex-row md:items-end md:justify-between gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
            <span className="text-[10px] font-mono font-black uppercase tracking-[0.4em] text-ink-muted leading-none">Identity Management Layer</span>
          </div>
          <h2 className="text-6xl font-black tracking-tighter text-ink-primary font-display uppercase leading-[0.85]">
            User <span className="text-gold">Profile</span>.
          </h2>
          <p className="text-ink-secondary text-lg max-w-xl font-medium leading-relaxed">
            Manage your professional identity and neural link identifiers. Your data is encrypted and synced across all strategic nodes.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="px-5 py-2.5 bg-bg-secondary rounded-xl flex items-center gap-3 border border-white/5">
            <ShieldCheck size={14} className="text-gold" />
            <div className="text-right">
              <p className="text-[10px] font-black text-ink-primary uppercase tracking-widest leading-none">Auth Level</p>
              <p className="text-[9px] font-mono text-ink-muted uppercase mt-1">Verified Agent L2</p>
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Avatar & Card */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-bg-secondary p-10 rounded-[3rem] border border-white/5 shadow-2xl relative overflow-hidden group flex flex-col items-center text-center">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 blur-3xl rounded-full" />
            
            <div className="relative mb-8">
              <div className="w-32 h-32 rounded-[2.5rem] bg-bg-tertiary border border-white/5 p-1 overflow-hidden group-hover:scale-105 transition-transform duration-500 shadow-2xl">
                <img 
                  src={photoURL || `https://ui-avatars.com/api/?name=${displayName || user?.email}`} 
                  alt={displayName || 'User'} 
                  className="w-full h-full object-cover rounded-[2rem] grayscale group-hover:grayscale-0 transition-all duration-700"
                />
              </div>
              <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-gold rounded-xl flex items-center justify-center text-black shadow-lg border-4 border-bg-secondary">
                <Camera size={18} />
              </div>
            </div>

            <h3 className="text-2xl font-black text-ink-primary uppercase tracking-tight mb-2 truncate w-full">
              {displayName || 'Anonymous Agent'}
            </h3>
            <p className="text-xs font-mono text-ink-muted uppercase tracking-widest mb-8 border-b border-white/5 pb-6 w-full">
              {user?.email}
            </p>

            <div className="w-full space-y-4">
              <div className="flex items-center justify-between px-4 py-3 bg-bg-tertiary rounded-xl border border-white/5">
                <span className="text-[10px] font-bold text-ink-muted uppercase">Status</span>
                <span className="text-[10px] font-black text-gold uppercase tracking-widest">Active</span>
              </div>
              <div className="flex items-center justify-between px-4 py-3 bg-bg-tertiary rounded-xl border border-white/5">
                <span className="text-[10px] font-bold text-ink-muted uppercase">Joined</span>
                <span className="text-[10px] font-black text-ink-primary uppercase tracking-widest">
                  {user?.metadata.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'MAY 2024'}
                </span>
              </div>
            </div>
          </div>

          <div className="p-8 bg-bg-primary rounded-[2.5rem] border border-white/5 relative overflow-hidden italic font-serif">
            <div className="absolute inset-0 bg-gradient-to-br from-gold/5 to-transparent opacity-50" />
            <p className="text-sm text-ink-muted leading-relaxed relative z-10 text-center">
              "Your identity is your strongest asset in the architectural hierarchy. Calibrate your presence with precision."
            </p>
          </div>
        </div>

        {/* Right Column: Edit Form */}
        <div className="lg:col-span-8">
          <form onSubmit={handleSave} className="bg-bg-tertiary p-12 rounded-[3.5rem] border border-white/5 shadow-2xl space-y-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none">
              <Fingerprint size={200} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <UserIcon size={14} className="text-gold" />
                  <label className="text-[10px] font-black text-ink-muted uppercase tracking-[0.3em]">Operational Handle</label>
                </div>
                <input 
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. CORE_S_ARCHITECT"
                  className="w-full bg-bg-secondary px-6 py-5 rounded-2xl border border-white/5 focus:ring-4 focus:ring-gold/5 focus:border-gold outline-none transition-all font-bold text-ink-primary placeholder:text-zinc-800 uppercase tracking-widest text-xs"
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail size={14} className="text-ink-muted" />
                  <label className="text-[10px] font-black text-ink-muted uppercase tracking-[0.3em]">Secure Endpoint</label>
                </div>
                <input 
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full bg-bg-secondary/50 px-6 py-5 rounded-2xl border border-white/5 font-bold text-ink-muted/50 cursor-not-allowed uppercase tracking-widest text-xs"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Camera size={14} className="text-gold" />
                <label className="text-[10px] font-black text-ink-muted uppercase tracking-[0.3em]">Visual Identifier Matrix (URL)</label>
              </div>
              <input 
                type="url"
                value={photoURL}
                onChange={(e) => setPhotoURL(e.target.value)}
                placeholder="https://images.remote.com/avatar_id_772"
                className="w-full bg-bg-secondary px-6 py-5 rounded-2xl border border-white/5 focus:ring-4 focus:ring-gold/5 focus:border-gold outline-none transition-all font-bold text-ink-primary placeholder:text-zinc-800 text-xs"
              />
              <p className="text-[9px] text-zinc-600 font-mono tracking-tighter">PROVIDE A SECURE LINK TO AN EXTERNAL IMAGE RESOURCE FOR IDENTITY RENDERING.</p>
            </div>

            <div className="pt-6 border-t border-white/5">
              <AnimatePresence>
                {error && (
                  <div className="mb-8">
                    <ErrorNotice error={error} onRetry={() => handleSave({ preventDefault: () => {} } as any)} />
                  </div>
                )}
                {success && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="mb-8 p-6 bg-gold/10 border border-gold/30 rounded-2xl flex items-center gap-4 text-gold"
                  >
                    <CheckCircle2 size={24} />
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest">Protocol Success</p>
                      <p className="text-[10px] opacity-80 uppercase">Identity parameters synchronized with core ledger.</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                type="submit"
                disabled={saving}
                className={cn(
                  "w-full group bg-gold text-black px-12 py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-gold-bright transition-all flex items-center justify-center gap-4 active:scale-95 shadow-xl shadow-gold/10",
                  saving && "opacity-50 cursor-not-allowed"
                )}
              >
                {saving ? (
                  <>
                    <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    Synchronizing...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Commit Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

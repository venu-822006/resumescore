import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Code2, LogIn, UserPlus, Eye, EyeOff } from 'lucide-react';
import { motion } from 'motion/react';

export function Login() {
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(email, password, displayName);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-gold/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-gold/5 blur-[120px] rounded-full" />
      </div>

      <motion.div
        initial={{ opacity: 0.2, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <div className="bg-bg-secondary backdrop-blur-xl border border-white/5 p-12 rounded-[2.5rem] shadow-2xl relative overflow-hidden text-center">
          <div className="mb-12 inline-block">
            <div className="w-20 h-20 bg-gold rounded-3xl flex items-center justify-center text-black shadow-[0_0_50px_rgba(201,162,39,0.2)] mb-6 mx-auto transform rotate-12 group-hover:rotate-0 transition-transform duration-500">
              <Code2 size={40} strokeWidth={3} />
            </div>
            <h1 className="text-4xl font-black tracking-tighter uppercase text-ink-primary font-display leading-none">
              Interview<span className="text-gold">Ready</span>.
            </h1>
            <p className="text-[10px] text-zinc-500 uppercase tracking-[0.4em] font-mono mt-4">
              Neural Prep v1.0
            </p>
          </div>

          <p className="text-ink-secondary font-medium mb-10 leading-relaxed">
            Welcome to the future of technical preparation. {isLogin ? 'Sign in' : 'Create account'} to synchronize your neural profile across endpoints.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div>
                <input
                  type="text"
                  placeholder="Display Name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-4 py-3 bg-bg-primary border border-white/10 rounded-xl text-ink-primary placeholder-zinc-500 focus:outline-none focus:border-gold/50 transition-colors"
                  required
                />
              </div>
            )}

            <div>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-bg-primary border border-white/10 rounded-xl text-ink-primary placeholder-zinc-500 focus:outline-none focus:border-gold/50 transition-colors"
                required
              />
            </div>

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 pr-12 bg-bg-primary border border-white/10 rounded-xl text-ink-primary placeholder-zinc-500 focus:outline-none focus:border-gold/50 transition-colors"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {error && (
              <div className="text-red-400 text-sm text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="group relative w-full py-5 bg-gold text-black rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-gold-bright transition-all shadow-xl active:scale-[0.98] overflow-hidden flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLogin ? <LogIn size={20} className="text-black" /> : <UserPlus size={20} className="text-black" />}
              {loading ? 'Processing...' : (isLogin ? 'Neural Link [Login]' : 'Neural Link [Register]')}
            </button>
          </form>

          <div className="mt-6">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-zinc-500 hover:text-gold transition-colors text-sm"
            >
              {isLogin ? "Don't have an account? Register" : 'Already have an account? Login'}
            </button>
          </div>

          <div className="mt-10 pt-10 border-t border-white/5">
            <div className="flex items-center justify-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest leading-none">
                System Online • MongoDB Core
              </span>
            </div>
          </div>
        </div>

        <p className="text-[10px] text-zinc-600 text-center mt-8 uppercase tracking-[0.2em] font-black opacity-50 font-mono">
          Encrypted Session Required • All Traffic Logged
        </p>
      </motion.div>
    </div>
  );
}

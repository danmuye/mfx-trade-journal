import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  ArrowRight, 
  Activity, 
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import LogoSVG from './logo-muye-fx.svg';

// --- CONFIGURATION (Ensure these match your AuthScreen) ---
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const THEME = {
  colors: {
    bg: '#1a1a1a',
    card: 'rgba(30, 30, 30, 0.65)',
    cyan: '#00ffff',
    green: '#00ff88',
    red: '#ff4d4d',
    textMain: '#ffffff',
  }
};

// --- SHARED UI COMPONENTS (Grid, Particles, etc. from your AuthScreen) ---
const BackgroundGrid = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
    <div className="absolute inset-0 opacity-[0.03]" 
         style={{ backgroundImage: `linear-gradient(${THEME.colors.cyan} 1px, transparent 1px), linear-gradient(90deg, ${THEME.colors.cyan} 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />
    <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] via-transparent to-[#1a1a1a]" />
  </div>
);

const UpdatePasswordScreen = ({ onComplete }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      });

      if (updateError) throw updateError;

      setSuccess(true);
      // Wait 2 seconds then redirect or call success callback
      setTimeout(() => {
        if (onComplete) onComplete();
        else window.location.href = '/'; // Fallback to home
      }, 2000);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden font-sans"
      style={{ backgroundColor: THEME.colors.bg }}>
      <BackgroundGrid />
      
      {/* Reusing your CSS animations via a style tag */}
      <style>{`
        @keyframes shimmer { 100% { transform: translateX(100%); } }
        @keyframes logo-fade-in {
          0% { opacity: 0; transform: translateY(20px) scale(0.9); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>

      <div className="relative z-10 w-full max-w-md animate-logo-fade-in">
        <div className="rounded-2xl border backdrop-blur-xl p-6 shadow-2xl"
          style={{ 
            backgroundColor: THEME.colors.card,
            borderColor: 'rgba(0, 255, 255, 0.2)',
            boxShadow: '0 0 40px -10px rgba(0,0,0,0.7)'
          }}>
          
          <div className="flex flex-col items-center mb-6">
             <img src={LogoSVG} alt="Logo" className="max-w-[120px] mb-4" />
             <h2 className="text-2xl font-bold text-white mb-1">Secure Terminal</h2>
             <p className="text-gray-400 text-sm flex items-center gap-2">
               <Activity size={14} className="text-cyan-400 animate-pulse" />
               Update Your Access Credentials
             </p>
          </div>

          {error && (
            <div className="mb-4 bg-red-500/10 border border-red-500/50 rounded-lg p-3 flex items-center gap-3 text-red-200 text-sm">
              <AlertTriangle size={16} className="text-red-500 flex-shrink-0" />
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 bg-green-500/10 border border-green-500/50 rounded-lg p-3 flex items-center gap-3 text-green-200 text-sm">
              <CheckCircle2 size={16} className="text-green-500 flex-shrink-0" />
              Password updated successfully! Redirecting...
            </div>
          )}

          <form onSubmit={handleUpdatePassword}>
            <div className="relative mb-4">
              <input
                type="password"
                placeholder="New Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border bg-black/20 text-white outline-none focus:border-cyan-400 transition-all"
                style={{ borderColor: 'rgba(255,255,255,0.1)' }}
              />
              <Lock className="absolute left-4 top-3.5 text-gray-500" size={18} />
            </div>

            <div className="relative mb-6">
              <input
                type="password"
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border bg-black/20 text-white outline-none focus:border-cyan-400 transition-all"
                style={{ borderColor: 'rgba(255,255,255,0.1)' }}
              />
              <Lock className="absolute left-4 top-3.5 text-gray-500" size={18} />
            </div>

            <button
              type="submit"
              disabled={loading || success}
              className="w-full py-3 rounded-xl font-bold text-black text-lg relative overflow-hidden group transition-all transform hover:scale-[1.02]"
              style={{
                background: `linear-gradient(135deg, ${THEME.colors.cyan}, ${THEME.colors.green})`,
              }}
            >
              <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/30 to-transparent" />
              <span className="relative flex items-center justify-center gap-2">
                {loading ? "Updating..." : "Update Password"}
                <ArrowRight size={18} />
              </span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UpdatePasswordScreen;
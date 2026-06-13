import React, { useState, useMemo, useEffect } from 'react';
import { 
  AlertTriangle, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Activity, 
  Lock, 
  Mail,
  ArrowLeft 
} from 'lucide-react';

import LogoSVG from './logo-muye-fx.svg'; 

import { auth } from "./firebase";
import { 
  signInWithPopup, 
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail
} from "firebase/auth";

// --- THEME SYNCED WITH APP.JSX ---
const THEME = {
  bg: '#0C0F14',
  card: '#131619',
  accent: {
    green: '#3CFF64',
    purple: '#A479FF',
    red: '#FF4D4D',
    cyan: '#4FF3F9'
  },
  text: {
    primary: '#FFFFFF',
    muted: '#9CA3AF'
  }
};

// --- FOREX MARKET BACKGROUND ---
const ForexBackground = () => {
  // Generate random candlestick data for a continuous repeating pattern
  const candles = useMemo(() => {
    let currentPrice = 100;
    return Array.from({ length: 60 }).map((_, i) => {
      const isUp = Math.random() > 0.48;
      const bodySize = Math.random() * 30 + 5;
      const wickTop = Math.random() * 20;
      const wickBottom = Math.random() * 20;
      
      if (isUp) currentPrice += (Math.random() * 15);
      else currentPrice -= (Math.random() * 15);

      // Keep price within visible bounds roughly
      if (currentPrice > 180) currentPrice -= 20;
      if (currentPrice < 40) currentPrice += 20;

      return {
        id: i,
        x: i * 40,
        y: 200 - currentPrice,
        isUp,
        bodySize,
        wickTop,
        wickBottom
      };
    });
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 bg-[#0C0F14]">
      {/* Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-20" 
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />
      
      {/* Animated Candlesticks & Equity Curve */}
      <div className="absolute inset-0 opacity-[0.15] animate-chart-pan">
        <svg width="2400" height="100%" className="absolute bottom-0 h-full" preserveAspectRatio="none">
          {/* Equity Line Glow */}
          <path 
            d={`M -20,${candles[0].y + 100} ${candles.map(c => `L ${c.x},${c.y + 100}`).join(' ')}`}
            fill="none"
            stroke={THEME.accent.purple}
            strokeWidth="4"
            style={{ filter: 'drop-shadow(0 0 15px #A479FF)' }}
            className="opacity-40"
          />
          
          <g transform="translate(0, 100)">
            {candles.map((c) => (
              <g key={c.id}>
                {/* Wick */}
                <line 
                  x1={c.x + 10} y1={c.y - c.wickTop} 
                  x2={c.x + 10} y2={c.y + c.bodySize + c.wickBottom} 
                  stroke={c.isUp ? THEME.accent.green : THEME.accent.red} 
                  strokeWidth="2" 
                />
                {/* Body */}
                <rect 
                  x={c.x + 5} 
                  y={c.isUp ? c.y : c.y - c.bodySize} 
                  width="10" 
                  height={c.bodySize} 
                  fill={c.isUp ? THEME.accent.green : THEME.accent.red} 
                  rx="1"
                />
              </g>
            ))}
          </g>
        </svg>
      </div>

      {/* Radial Gradient Overlays for Depth */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(164,121,255,0.1)_0%,transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(60,255,100,0.05)_0%,transparent_50%)]" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0C0F14] via-transparent to-[#0C0F14]" />
    </div>
  );
};


// --- UI COMPONENTS ---
const MuyeFXLogo = () => (
  <div className="flex flex-col items-center mb-6 relative group animate-in fade-in zoom-in duration-700">
    {/* Glow background that brightens intensely on hover */}
    <div className="absolute inset-0 bg-[#3CFF64]/20 blur-[35px] rounded-full scale-[1.5] opacity-40 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
    <img 
      src={LogoSVG} 
      alt="MuyeFX Logo" 
      className="z-10 relative drop-shadow-[0_0_15px_rgba(60,255,100,0.2)] max-w-[140px] h-auto transition-all duration-500 group-hover:scale-105 group-hover:drop-shadow-[0_0_25px_rgba(60,255,100,0.6)]"
    />
  </div>
);

const PasswordStrength = ({ password }) => {
  if (!password) return null;

  const getStrength = (pass) => {
    let score = 0;
    if (pass.length > 7) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score;
  };

  const strength = getStrength(password);
  const bars = [1, 2, 3, 4];
  
  const colors = [
    THEME.accent.red,
    '#FFD860', // Yellow/Orange
    THEME.accent.cyan,
    THEME.accent.green
  ];

  return (
    <div className="flex gap-1.5 mt-2 h-1 overflow-hidden">
      {bars.map((level) => (
        <div
          key={level}
          className="h-full rounded-full flex-1 transition-all duration-500"
          style={{ backgroundColor: strength >= level ? colors[strength - 1] : '#ffffff10' }}
        />
      ))}
    </div>
  );
};

const InputField = ({ icon: Icon, type, placeholder, value, onChange, showPasswordToggle, onTogglePassword }) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="relative mb-4 group">
      <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-300
        ${isFocused ? 'text-[#A479FF]' : 'text-gray-500'}`}>
        <Icon size={18} />
      </div>
      
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder=" " 
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className="peer w-full pl-11 pr-4 py-3.5 rounded-xl border bg-[#0C0F14] text-white outline-none transition-all duration-300 text-sm font-medium"
        style={{
          borderColor: isFocused ? 'rgba(164,121,255,0.5)' : 'rgba(255,255,255,0.05)',
          boxShadow: isFocused ? `inset 0 0 0 1px rgba(164,121,255,0.2), 0 0 20px -5px rgba(164,121,255,0.15)` : 'inset 0 2px 4px rgba(0,0,0,0.5)'
        }}
      />
      
      <label className={`absolute left-11 transition-all duration-300 pointer-events-none
        ${value || isFocused 
          ? '-top-2.5 text-[10px] uppercase tracking-wider font-bold bg-[#131619] px-1.5 rounded text-[#A479FF]' 
          : 'top-3.5 text-gray-500 text-sm'}`}
      >
        {placeholder}
      </label>

      {showPasswordToggle && (
        <button
          type="button"
          onClick={onTogglePassword}
          className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-white transition-colors focus:outline-none"
        >
          {type === 'password' ? <Eye size={18} /> : <EyeOff size={18} />}
        </button>
      )}
    </div>
  );
};

// --- MAIN AUTH SCREEN COMPONENT ---
const AuthScreen = ({ onAuthSuccess }) => {
  const [authMode, setAuthMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const toggleAuthMode = () => {
    setSuccessMsg(null);
    setAuthMode(prev => prev === 'signin' ? 'signup' : 'signin');
    setError(null);
    setEmail('');
    setPassword('');
  };

  const switchToForgot = () => {
    setSuccessMsg(null);
    setAuthMode('forgot');
    setError(null);
    setPassword('');
  };

  const switchToLogin = () => {
    setSuccessMsg(null);
    setAuthMode('signin');
    setError(null);
  };
  
  useEffect(() => {
    if (error || successMsg) {
      const timer = setTimeout(() => {
        setError(null);
        setSuccessMsg(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, successMsg]);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      if (authMode === 'signup') {
        await createUserWithEmailAndPassword(auth, email, password);
        if (onAuthSuccess) onAuthSuccess();
      } 
      else if (authMode === 'signin') {
        await signInWithEmailAndPassword(auth, email, password);
        if (onAuthSuccess) onAuthSuccess();
      } 
      else if (authMode === 'forgot') {
        await sendPasswordResetEmail(auth, email);
        setSuccessMsg("Check your email for the password reset link.");
      }
    } catch (err) {
      const friendlyMessages = {
        'auth/invalid-credential': 'Invalid email or password. Please try again.',
        'auth/user-not-found': 'No account found with this email.',
        'auth/wrong-password': 'Incorrect password. Please try again.',
        'auth/invalid-email': 'Please enter a valid email address.',
        'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
        'auth/email-already-in-use': 'An account with this email already exists.',
        'auth/weak-password': 'Password should be at least 6 characters.',
        'auth/popup-closed-by-user': 'Sign-in popup was closed before completing.',
        'auth/popup-blocked': 'Popup was blocked by your browser. Please allow popups.',
        'auth/cancelled-popup-request': 'Another sign-in popup is already open.',
      };
      
      const code = err.code || '';
      setError(friendlyMessages[code] || err.message || 'An unknown error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      if (onAuthSuccess) onAuthSuccess();
    } catch (err) {
      setError(err.message || 'Google sign-in failed. Please try again.');
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 sm:p-6 overflow-hidden" style={{ backgroundColor: THEME.bg, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <ForexBackground />
      
      <style>{`
        @keyframes chart-pan {
          from { transform: translateX(0); }
          to { transform: translateX(-1200px); }
        }
        .animate-chart-pan {
          animation: chart-pan 40s linear infinite;
        }
        @keyframes subtle-bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
      `}</style>

      <div className="relative z-10 w-full max-w-md transition-all duration-500 transform animate-in fade-in zoom-in-95">
        <div className="rounded-[2rem] border p-6 sm:p-10 shadow-2xl backdrop-blur-xl relative overflow-hidden"
          style={{ 
            backgroundColor: `${THEME.card}E6`, // 90% opacity
            borderColor: 'rgba(255,255,255,0.05)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255,255,255,0.1)'
          }}>
          
          <MuyeFXLogo />

          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-2">
              {authMode === 'signup' ? 'Create Account' : authMode === 'forgot' ? 'Reset Password' : 'Welcome Back'}
            </h2>
            <p className="text-gray-400 text-xs sm:text-sm font-medium uppercase tracking-widest flex justify-center items-center gap-1.5">
              <Activity size={14} className="text-[#3CFF64] animate-[subtle-bounce_2s_ease-in-out_infinite]" />
              {authMode === 'signup' ? 'Start Tracking Your Edge' : authMode === 'forgot' ? 'Secure Your Terminal' : 'Access Your Journal'}
            </p>
          </div>

          <div className={`overflow-hidden transition-all duration-300 ease-in-out ${error || successMsg ? 'max-h-24 mb-4 opacity-100' : 'max-h-0 mb-0 opacity-0'}`}>
            {error && (
              <div className="bg-[#FF4D4D]/10 border border-[#FF4D4D]/30 rounded-xl p-3 flex items-center gap-3 text-[#FF4D4D] text-xs sm:text-sm font-medium">
                <AlertTriangle size={16} className="flex-shrink-0" />
                {error}
              </div>
            )}
            {successMsg && (
              <div className="bg-[#3CFF64]/10 border border-[#3CFF64]/30 rounded-xl p-3 flex items-center gap-3 text-[#3CFF64] text-xs sm:text-sm font-medium">
                <Mail size={16} className="flex-shrink-0" />
                {successMsg}
              </div>
            )}
          </div>

          <form onSubmit={handleAuth}>
            <InputField 
              icon={Mail}
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            
            {authMode !== 'forgot' && (
              <div className="relative mt-2">
                <InputField 
                  icon={Lock}
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  showPasswordToggle={true}
                  onTogglePassword={() => setShowPassword(!showPassword)}
                />
                
                {authMode === 'signup' && <PasswordStrength password={password} />}
                
                {authMode === 'signin' && (
                  <div className="absolute right-1 top-[51px]">
                    <button 
                      type="button"
                      onClick={switchToForgot}
                      className="text-[11px] font-bold uppercase tracking-wide text-[#A479FF]/80 hover:text-[#A479FF] transition-colors"
                    >
                      Forgot Password?
                    </button>
                  </div>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full ${authMode === 'signin' ? 'mt-8' : 'mt-6'} py-3.5 rounded-xl font-bold text-black text-sm sm:text-base relative overflow-hidden group transition-all duration-300 active:scale-[0.98] flex items-center justify-center gap-2`}
              style={{
                backgroundColor: THEME.accent.green,
                boxShadow: `0 0 20px -5px ${THEME.accent.green}`,
              }}
            >
              <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent z-10" />
              
              <span className="relative z-20 flex items-center justify-center gap-2">
                {loading ? (
                  <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                ) : (
                  <>
                    {authMode === 'signup' ? 'Create Account' : authMode === 'forgot' ? 'Send Recovery Link' : 'Sign In'}
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </span>
            </button>
          </form>

          {authMode !== 'forgot' && (
            <>
              <div className="my-6 flex items-center gap-4">
                <div className="h-px flex-1 bg-white/[0.05]" />
                <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Or Continue With</span>
                <div className="h-px flex-1 bg-white/[0.05]" />
              </div>

              <button
                onClick={handleGoogleSignIn}
                className="w-full flex items-center justify-center gap-3 py-3 rounded-xl border border-white/[0.05] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/[0.1] text-white transition-all duration-300 active:scale-[0.98]"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                <span className="font-semibold text-sm">Google</span>
              </button>
            </>
          )}

          <div className="mt-8 text-center">
            {authMode === 'forgot' ? (
              <button onClick={switchToLogin} className="group text-sm font-medium text-gray-400 hover:text-white transition-colors flex items-center justify-center gap-2 w-full">
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                Return to Login
              </button>
            ) : (
              <button onClick={toggleAuthMode} className="group text-sm font-medium text-gray-400 hover:text-white transition-colors">
                {authMode === 'signup' ? "Already have an account?" : "New to MFX Journal?"}
                <span className="ml-2 font-bold relative inline-block text-[#A479FF]">
                  {authMode === 'signup' ? 'Sign In' : 'Create Account'}
                  <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-[#A479FF] transition-all duration-300 group-hover:w-full" />
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;
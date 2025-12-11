import React, { useState, useMemo } from 'react';
import { 
  AlertTriangle, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Activity, 
  Lock, 
  Mail,
  Home,
  LogOut,
  ArrowLeft // Added for back navigation
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import LogoSVG from './logo-muye-fx.svg'; // Adjust path as needed

// --- CONFIGURATION & THEME ---
const getSupabaseConfig = () => {
  const supabaseUrl = 
  (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_SUPABASE_URL) ||
  (typeof import.meta !== 'undefined' && import.meta.env.VITE_SUPABASE_URL) ||
  (typeof process !== 'undefined' && process.env.REACT_APP_SUPABASE_URL) ||
  "https://fyjhwdweswkupxksqsde.supabase.co";

const supabaseAnonKey =
  (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) ||
  (typeof import.meta !== 'undefined' && import.meta.env.VITE_SUPABASE_ANON_KEY) ||
  (typeof process !== 'undefined' && process.env.REACT_APP_SUPABASE_ANON_KEY) ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5amh3ZHdlc3drdXB4a3Nxc2RlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM4NTMxNjYsImV4cCI6MjA3OTQyOTE2Nn0.O-dsEzLoMdoGuApWcy7U4G2Mg_dh4tqwgHYxeo902fE";

  if (supabaseUrl && supabaseAnonKey) {
    console.log("🔌 Using REAL Supabase client");
    return createClient(supabaseUrl, supabaseAnonKey);
  }

  console.warn("⚠️ Using MOCK Supabase client.");
  return {
    auth: {
      signUp: async ({ email }) => ({
        data: { user: { email } },
        error: null
      }),
      signInWithPassword: async ({ email }) => ({
        data: { user: { email } },
        error: null
      }),
      resetPasswordForEmail: async () => ({ data: {}, error: null }),
      signInWithOAuth: async () => ({ data: { url: '#' }, error: null })
    }
  };
};

const supabase = getSupabaseConfig();

const THEME = {
  colors: {
    bg: '#1a1a1a',
    card: 'rgba(30, 30, 30, 0.65)',
    cyan: '#00ffff',
    green: '#00ff88',
    red: '#ff4d4d',
    textMain: '#ffffff',
    textMuted: '#9ca3af',
  }
};

// --- BACKGROUND COMPONENTS ---
const BackgroundGrid = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
    <div 
      className="absolute inset-0 opacity-[0.03]" 
      style={{
        backgroundImage: `linear-gradient(${THEME.colors.cyan} 1px, transparent 1px), linear-gradient(90deg, ${THEME.colors.cyan} 1px, transparent 1px)`,
        backgroundSize: '40px 40px'
      }}
    />
    <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] via-transparent to-[#1a1a1a]" />
  </div>
);

const MovingChartBackground = () => {
  const linePath = "M0,100 Q150,50 300,100 T600,80 T900,120 T1200,60 T1500,100 T1800,80";
  
  return (
    <div className="absolute inset-0 overflow-hidden opacity-20 pointer-events-none z-0">
      <div className="absolute top-1/3 left-0 w-[200%] h-64 animate-chart-move-slow">
        <svg viewBox="0 0 1200 200" className="w-full h-full preserve-3d">
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={THEME.colors.green} stopOpacity="0.5" />
              <stop offset="100%" stopColor={THEME.colors.green} stopOpacity="0" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          <path 
            d={linePath} 
            fill="url(#chartGradient)" 
            stroke={THEME.colors.green} 
            strokeWidth="3"
            filter="url(#glow)"
          />
        </svg>
      </div>
      
      <div className="absolute top-1/2 left-0 w-[200%] h-48 animate-chart-move-fast">
        <svg viewBox="0 0 1200 200" className="w-full h-full">
          <path 
            d="M0,80 Q200,150 400,60 T800,100 T1200,40" 
            fill="none" 
            stroke={THEME.colors.cyan} 
            strokeWidth="2"
            strokeDasharray="5,5"
            opacity="0.6"
          />
        </svg>
      </div>
    </div>
  );
};

const Particles = () => {
  const particles = useMemo(() => [...Array(15)].map((_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    duration: Math.random() * 10 + 10
  })), []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full bg-white opacity-10"
          style={{
            left: `${p.x}%`,
            width: p.size,
            height: p.size,
            animation: `particle-float ${p.duration}s infinite linear ${Math.random() * -5}s`
          }}
        />
      ))}
    </div>
  );
};

// --- UI COMPONENTS ---
const MuyeFXLogo = () => (
  <div 
    className="flex flex-col items-center mb-4 relative group opacity-0 animate-logo-fade-in"
    style={{ animationDelay: '0.3s' }}
  >
    <div className="absolute inset-0 bg-green-500/20 blur-[30px] rounded-full scale-150 opacity-0 group-hover:opacity-50 transition-opacity duration-1000" />
    <img 
      src={LogoSVG} 
      alt="MuyeFX Logo" 
      className="z-10 drop-shadow-[0_0_8px_rgba(0,255,136,0.3)] max-w-[150px] h-auto"
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
    THEME.colors.red,
    '#FFA500',
    '#FFFF00',
    THEME.colors.green
  ];

  return (
    <div className="flex gap-1 mt-1.5 h-1 overflow-hidden">
      {bars.map((level) => (
        <div
          key={level}
          className="h-full rounded-full flex-1 transition-all duration-500"
          style={{ backgroundColor: strength >= level ? colors[strength - 1] : '#333' }}
        />
      ))}
    </div>
  );
};

const InputField = ({ icon: Icon, type, placeholder, value, onChange, showPasswordToggle, onTogglePassword }) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="relative mb-4 group transition-transform duration-300 hover:scale-[1.01]">
      <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-300
        ${isFocused ? 'text-cyan-400' : 'text-gray-500'}`}>
        <Icon size={16} />
      </div>
      
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder=" " 
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className="peer w-full pl-12 pr-4 py-3 rounded-xl border bg-black/20 text-white outline-none backdrop-blur-sm transition-all duration-300"
        style={{
          borderColor: isFocused ? THEME.colors.cyan : 'rgba(255,255,255,0.1)',
          boxShadow: isFocused ? `0 0 15px -3px ${THEME.colors.cyan}40` : 'none'
        }}
      />
      
      <label className={`absolute left-12 transition-all duration-300 pointer-events-none
        ${value || isFocused ? '-top-2 text-xs bg-[#1a1a1a] px-2 rounded-md border text-cyan-400' : 'top-3 text-gray-400 text-sm'}`}
        style={{ borderColor: value || isFocused ? 'rgba(0, 255, 255, 0.3)' : 'transparent' }}>
        {placeholder}
      </label>

      {showPasswordToggle && (
        <button
          type="button"
          onClick={onTogglePassword}
          className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-white transition-colors"
        >
          {type === 'password' ? <Eye size={16} /> : <EyeOff size={16} />}
        </button>
      )}
    </div>
  );
};

// --- AUTH SCREEN COMPONENT ---
const AuthScreen = ({ onAuthSuccess }) => {
  // authMode: 'signin' | 'signup' | 'forgot'
  const [authMode, setAuthMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null); // New state for success messages
  const [showPassword, setShowPassword] = useState(false);
  const [showError, setShowError] = useState(false);

  const toggleAuthMode = () => {
    setShowError(false);
    setSuccessMsg(null);
    setAuthMode(prev => prev === 'signin' ? 'signup' : 'signin');
    setError(null);
    setEmail('');
    setPassword('');
  };

  const switchToForgot = () => {
    setShowError(false);
    setSuccessMsg(null);
    setAuthMode('forgot');
    setError(null);
    // Keep email if typed
    setPassword('');
  };

  const switchToLogin = () => {
    setShowError(false);
    setSuccessMsg(null);
    setAuthMode('signin');
    setError(null);
  };
  
  React.useEffect(() => {
    if (error) {
      setShowError(true);
      const timer = setTimeout(() => setShowError(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setShowError(false);
    setSuccessMsg(null);

    try {
      if (authMode === 'signup') {
        const { error: authError } = await supabase.auth.signUp({ email, password });
        if (authError) throw authError;
        if (onAuthSuccess) onAuthSuccess();
      } 
      else if (authMode === 'signin') {
        const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
        if (authError) throw authError;
        if (onAuthSuccess) onAuthSuccess();
      } 
      else if (authMode === 'forgot') {
        // --- FORGOT PASSWORD LOGIC ---
        // Ensure this URL points to where your UpdatePasswordScreen is located
        const redirectTo = typeof window !== 'undefined' ? `${window.location.origin}/update-password` : undefined;
        
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: redirectTo,
        });
        
        if (resetError) throw resetError;
        setSuccessMsg("Check your email for the password reset link.");
      }

    } catch (err) {
      setError(err.message || 'An unknown error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    const { error: oauthError, data } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    });
    if (oauthError) setError(oauthError.message);
    if (data?.url) window.location.href = data.url;
  };

  // Helper text content based on mode
  const getHeaderText = () => {
    if (authMode === 'signup') return 'Create Journal Account';
    if (authMode === 'forgot') return 'Reset Password';
    return 'Welcome Back';
  };

  const getSubHeaderText = () => {
    if (authMode === 'signup') return 'Mastering the Mentals';
    if (authMode === 'forgot') return 'Enter email to receive recovery link';
    return 'Sign in to Continue Journalling';
  };

  const getButtonText = () => {
    if (authMode === 'signup') return 'Create Account';
    if (authMode === 'forgot') return 'Send Recovery Link';
    return 'Sign In';
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 sm:p-6 overflow-hidden font-sans"
      style={{ backgroundColor: THEME.colors.bg }}>
      <BackgroundGrid />
      <MovingChartBackground />
      <Particles />
      
      <style>{`
        @keyframes shimmer { 100% { transform: translateX(100%); } }
        @keyframes particle-float {
          0% { transform: translateY(110vh) rotate(0deg); opacity: 0; }
          20% { opacity: 0.2; }
          80% { opacity: 0.2; }
          100% { transform: translateY(-10vh) rotate(360deg); opacity: 0; }
        }
        @keyframes chart-move-slow { from { transform: translateX(0%); } to { transform: translateX(-50%); } }
        @keyframes chart-move-fast { from { transform: translateX(-20%); } to { transform: translateX(-70%); } }
        @keyframes logo-fade-in {
          0% { opacity: 0; transform: translateY(20px) scale(0.9); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-logo-fade-in { animation: logo-fade-in 0.8s ease-out forwards; }
        .animate-chart-move-slow { animation: chart-move-slow 20s linear infinite; }
        .animate-chart-move-fast { animation: chart-move-fast 25s linear infinite; }
      `}</style>

      <div className="relative z-10 w-full max-w-md transition-all duration-500 transform scale-100">
        <div className="rounded-2xl border backdrop-blur-xl p-5 sm:p-6 shadow-2xl transition-all duration-500"
          style={{ 
            backgroundColor: THEME.colors.card,
            borderColor: 'rgba(0, 255, 255, 0.2)',
            boxShadow: '0 0 40px -10px rgba(0,0,0,0.7)'
          }}>
          <MuyeFXLogo />

          <div className="text-center mb-6">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white mb-1 transition-all duration-500">
              {getHeaderText()}
            </h2>
            <p className="text-gray-400 text-xs sm:text-sm flex justify-center items-center gap-2">
              <Activity size={14} className="text-green-400 animate-pulse" />
              {getSubHeaderText()}
            </p>
          </div>

          <div className={`overflow-hidden transition-all duration-300 ease-in-out ${showError || successMsg ? 'max-h-24 mb-3' : 'max-h-0 mb-0'}`}>
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 flex items-center gap-3 text-red-200 text-xs sm:text-sm">
                <AlertTriangle size={16} className="text-red-500 flex-shrink-0" />
                {error}
              </div>
            )}
            {successMsg && (
              <div className="bg-green-500/10 border border-green-500/50 rounded-lg p-3 flex items-center gap-3 text-green-200 text-xs sm:text-sm">
                <Mail size={16} className="text-green-500 flex-shrink-0" />
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
            
            {/* Password Field: Hidden in Forgot Password Mode */}
            {authMode !== 'forgot' && (
              <div className="relative">
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
                
                {/* --- FORGOT PASSWORD LINK --- */}
                {authMode === 'signin' && (
                  <div className="absolute right-0 top-[60px] flex justify-end">
                    <button 
                      type="button"
                      onClick={switchToForgot}
                      className="text-xs text-cyan-400/80 hover:text-cyan-400 transition-colors"
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
              className={`w-full ${authMode === 'signin' ? 'mt-8' : 'mt-5'} py-3 rounded-xl font-bold text-black text-base sm:text-lg relative overflow-hidden group 
                          transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]`}
              style={{
                background: `linear-gradient(135deg, ${THEME.colors.cyan}, ${THEME.colors.green})`,
                boxShadow: `0 0 10px ${THEME.colors.green}00, 0 4px 15px -3px ${THEME.colors.green}60`,
              }}
              onMouseEnter={(e) => e.currentTarget.style.boxShadow = `0 0 20px ${THEME.colors.green}60, 0 4px 15px -3px ${THEME.colors.green}80`}
              onMouseLeave={(e) => e.currentTarget.style.boxShadow = `0 0 10px ${THEME.colors.green}00, 0 4px 15px -3px ${THEME.colors.green}60`}
            >
              <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/30 to-transparent z-10" />
              
              <span className="relative z-20 flex items-center justify-center gap-2">
                {loading ? (
                  <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                ) : (
                  <>
                    {getButtonText()}
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </span>
            </button>
          </form>

          {/* Social Logins - Only show if NOT in forgot mode */}
          {authMode !== 'forgot' && (
            <>
              <div className="my-4 flex items-center gap-4">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-600 to-transparent" />
                <span className="text-xs text-gray-500 uppercase tracking-widest">Or</span>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-600 to-transparent" />
              </div>

              <button
                onClick={handleGoogleSignIn}
                className="w-full flex items-center justify-center gap-3 py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white transition-all duration-300 group transform hover:scale-[1.02] active:scale-[0.98]"
                onMouseEnter={(e) => e.currentTarget.style.borderColor = THEME.colors.cyan}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                <span className="font-medium text-sm">Google Account</span>
              </button>
            </>
          )}

          <div className="mt-6 text-center">
            {authMode === 'forgot' ? (
              <button onClick={switchToLogin} className="group text-sm text-gray-400 hover:text-white transition-colors flex items-center justify-center gap-2 w-full">
                <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                Back to Log In
              </button>
            ) : (
              <button onClick={toggleAuthMode} className="group text-sm text-gray-400 hover:text-white transition-colors">
                {authMode === 'signup' ? "Already have an Account?" : "New to MuyeFX?"}
                <span className="ml-2 font-bold relative inline-block" style={{ color: THEME.colors.cyan }}>
                  {authMode === 'signup' ? 'Log In' : 'Create Account'}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-cyan-400 transition-all duration-300 group-hover:w-full" />
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const DashboardScreen = ({ onLogout }) => (
  <div className="relative min-h-screen flex items-center justify-center p-4 sm:p-6 font-sans text-white"
    style={{ backgroundColor: THEME.colors.bg }}>
    <BackgroundGrid />
    <div className="relative z-10 w-full max-w-lg text-center">
      <div className="rounded-2xl border backdrop-blur-xl p-10 shadow-2xl transition-all duration-500"
        style={{ 
          backgroundColor: THEME.colors.card,
          borderColor: 'rgba(0, 255, 255, 0.2)',
          boxShadow: `0 0 40px -10px ${THEME.colors.green}50`
        }}>
        <Home size={48} className="mx-auto text-green-400 mb-4 animate-bounce" />
        <h1 className="text-4xl font-extrabold mb-4 tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-green-400">
          Access Granted
        </h1>
        <p className="text-gray-400 mb-8 text-lg">
          Welcome to the MuyeFX Terminal. Your secure session is established. Proceed to trade floor.
        </p>
        <button
          onClick={onLogout}
          className="inline-flex items-center gap-2 py-3 px-6 rounded-xl font-bold text-black text-lg relative overflow-hidden group 
                     transition-all duration-300 transform hover:scale-[1.05] active:scale-[0.95]"
          style={{
            background: `linear-gradient(135deg, ${THEME.colors.red}, #ff8800)`,
            boxShadow: `0 0 10px ${THEME.colors.red}60, 0 4px 15px -3px ${THEME.colors.red}80`,
          }}
        >
          <LogOut size={20} />
          Log Out
        </button>
      </div>
    </div>
  </div>
);

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  return isAuthenticated ? (
    <DashboardScreen onLogout={handleLogout} />
  ) : (
    <AuthScreen onAuthSuccess={handleAuthSuccess} />
  );
};

export default App;
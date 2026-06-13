import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  Eye, 
  EyeOff,
  ArrowRight, 
  Activity, 
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { confirmPasswordReset, verifyPasswordResetCode } from 'firebase/auth';
import { auth } from './firebase';
import LogoSVG from './logo-muye-fx.svg';

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

const BackgroundGrid = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
    <div className="absolute inset-0 opacity-[0.03]" 
         style={{ backgroundImage: `linear-gradient(${THEME.colors.cyan} 1px, transparent 1px), linear-gradient(90deg, ${THEME.colors.cyan} 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />
    <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] via-transparent to-[#1a1a1a]" />
  </div>
);

const MovingChartBackground = () => {
  const linePath = "M0,100 Q150,50 300,100 T600,80 T900,120 T1200,60 T1500,100 T1800,80";
  return (
    <div className="absolute inset-0 overflow-hidden opacity-20 pointer-events-none z-0">
      <div className="absolute top-1/3 left-0 w-[200%] h-64 animate-chart-move-slow">
        <svg viewBox="0 0 1200 200" className="w-full h-full">
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={THEME.colors.green} stopOpacity="0.5" />
              <stop offset="100%" stopColor={THEME.colors.green} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={linePath} fill="url(#chartGradient)" stroke={THEME.colors.green} strokeWidth="3" />
        </svg>
      </div>
      <div className="absolute top-1/2 left-0 w-[200%] h-48 animate-chart-move-fast">
        <svg viewBox="0 0 1200 200" className="w-full h-full">
          <path d="M0,80 Q200,150 400,60 T800,100 T1200,40" fill="none" stroke={THEME.colors.cyan} strokeWidth="2" strokeDasharray="5,5" opacity="0.6" />
        </svg>
      </div>
    </div>
  );
};

const UpdatePasswordScreen = ({ onComplete }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [isValidLink, setIsValidLink] = useState(false);
  const [oobCode, setOobCode] = useState(null);

  // Validate the reset token on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('oobCode');
    const mode = urlParams.get('mode');
    
    if (!code || mode !== 'resetPassword') {
      setError("Invalid or expired reset link. Please request a new password reset email.");
      setIsValidLink(false);
      return;
    }

    // Verify the code is valid
    verifyPasswordResetCode(auth, code)
      .then(() => {
        setOobCode(code);
        setIsValidLink(true);
      })
      .catch((err) => {
        setError("Invalid or expired reset link. Please request a new password reset email.");
        setIsValidLink(false);
      });
  }, []);

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await confirmPasswordReset(auth, oobCode, password);
      
      setSuccess(true);
      setTimeout(() => {
        if (onComplete) onComplete();
        else window.location.href = '/';
      }, 2000);

    } catch (err) {
      let errorMessage = "Failed to update password. The link may be expired.";
      
      // Handle specific Firebase errors
      switch (err.code) {
        case 'auth/invalid-action-code':
          errorMessage = "Invalid or expired reset link. Please request a new one.";
          break;
        case 'auth/weak-password':
          errorMessage = "Password is too weak. Please use at least 6 characters.";
          break;
        case 'auth/expired-action-code':
          errorMessage = "Reset link has expired. Please request a new one.";
          break;
        default:
          errorMessage = err.message || errorMessage;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden font-sans"
      style={{ backgroundColor: THEME.colors.bg }}>
      <BackgroundGrid />
      <MovingChartBackground />
      
      <style>{`
        @keyframes shimmer { 100% { transform: translateX(100%); } }
        @keyframes logo-fade-in { 0% { opacity: 0; transform: translateY(20px) scale(0.9); } 100% { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes chart-move-slow { from { transform: translateX(0%); } to { transform: translateX(-50%); } }
        @keyframes chart-move-fast { from { transform: translateX(-20%); } to { transform: translateX(-70%); } }
        .animate-logo-fade-in { animation: logo-fade-in 0.8s ease-out forwards; }
        .animate-chart-move-slow { animation: chart-move-slow 20s linear infinite; }
        .animate-chart-move-fast { animation: chart-move-fast 25s linear infinite; }
      `}</style>

      <div className="relative z-10 w-full max-w-md animate-logo-fade-in">
        <div className="rounded-2xl border backdrop-blur-xl p-6 shadow-2xl"
          style={{ 
            backgroundColor: THEME.colors.card,
            borderColor: 'rgba(0, 255, 255, 0.2)',
            boxShadow: '0 0 40px -10px rgba(0,0,0,0.7)'
          }}>
          
          <div className="flex flex-col items-center mb-6">
             <img src={LogoSVG} alt="Logo" className="max-w-[120px] mb-3" />
             <h2 className="text-2xl font-bold text-white mb-1">Secure Terminal</h2>
             <p className="text-gray-400 text-sm flex items-center gap-2">
               <Activity size={14} className="text-cyan-400 animate-pulse" />
               Update Your Access Credentials
             </p>
          </div>

          {!isValidLink && error && (
            <div className="mb-4 bg-red-500/10 border border-red-500/50 rounded-lg p-3 flex items-center gap-3 text-red-200 text-sm">
              <AlertTriangle size={16} className="text-red-500 flex-shrink-0" />
              {error}
            </div>
          )}

          {isValidLink && (
            <>
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
                    type={showPassword ? "text" : "password"}
                    placeholder="New Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border bg-black/20 text-white outline-none focus:border-cyan-400 transition-all"
                    style={{ borderColor: 'rgba(255,255,255,0.1)' }}
                    disabled={!isValidLink}
                    minLength={6}
                  />
                  <Lock className="absolute left-4 top-3.5 text-gray-500" size={18} />
                  {password && (
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-3.5 text-gray-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  )}
                </div>

                <div className="relative mb-6">
                  <input
                    type={showConfirm ? "text" : "password"}
                    placeholder="Confirm New Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border bg-black/20 text-white outline-none focus:border-cyan-400 transition-all"
                    style={{ borderColor: 'rgba(255,255,255,0.1)' }}
                    disabled={!isValidLink}
                  />
                  <Lock className="absolute left-4 top-3.5 text-gray-500" size={18} />
                  {confirmPassword && (
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-4 top-3.5 text-gray-400 hover:text-white"
                    >
                      {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading || success || !isValidLink}
                  className="w-full py-3 rounded-xl font-bold text-black text-lg relative overflow-hidden group transition-all transform hover:scale-[1.02] disabled:opacity-50"
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
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default UpdatePasswordScreen;
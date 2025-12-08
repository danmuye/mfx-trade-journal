import React, { useState } from 'react';
import { AlertTriangle } from 'lucide-react'; 
import { supabase } from './supabase'; 
// ✅ ADD THIS IMPORT - adjust the path if your logo is in a different location
import logo from './logo-muye-fx.svg';

const THEME = {
  bg: '#0C0F14',
  card: '#131619',
  accentGreen: '#3CFF64',
  accentRed: '#FF4D4D',
  border: 'rgba(255, 255, 255, 0.05)',
  textLight: '#E5E7EB',
  textMuted: '#9CA3AF',
};

const AuthScreen = ({ onAuthSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const toggleMode = () => {
    setIsSignUp(prev => !prev);
    setError(null);
    setEmail('');
    setPassword('');
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const response = isSignUp
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password });

    const { error: authError } = response;
    setLoading(false);

    if (authError) {
      setError(authError.message);
    } else {
      onAuthSuccess?.();
      console.log(`${isSignUp ? 'Sign Up' : 'Sign In'} successful!`);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    const { error: oauthError, data } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin, 
      }
    });

    if (oauthError) {
        setError(oauthError.message);
    }
    if (data?.url) {
        window.location.href = data.url;
    }
  };

  const CustomInput = ({ id, type, placeholder, value, onChange }) => (
    <input
      id={id}
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required
      className="
        w-full p-4 text-base rounded-lg border-2 
        bg-transparent text-gray-200 
        border-white/10 focus:border-[#3CFF64] transition duration-300
        placeholder-gray-500
      "
      style={{
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
      }}
    />
  );

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 sm:p-6" 
      style={{ backgroundColor: THEME.bg }}
    >
      <div 
        className="
          w-full max-w-sm sm:max-w-md p-6 sm:p-10 rounded-2xl 
          shadow-2xl transition-all duration-700 ease-in-out
        "
        style={{ 
          backgroundColor: THEME.card,
          boxShadow: `0 10px 20px -5px rgba(0, 0, 0, 0.5), 0 0 0 1px ${THEME.border}`
        }}
      >
        
        {/* ✅ YOUR CUSTOM LOGO SECTION */}
        <div className="text-center mb-10">
          <img 
            src={logo} 
            alt="Muye FX Logo" 
            className="mx-auto w-20 h-12 mb-3 object-contain"
            style={{ filter: 'drop-shadow(0 0 10px rgba(60, 255, 100, 0.3))' }}
          />
          <h1 
            className="text-3xl font-extrabold" 
            style={{ color: THEME.textLight, letterSpacing: '-0.025em' }}
          >
            {isSignUp ? 'Create Your Account' : 'Welcome Back'}
          </h1>
          <p className="text-sm mt-1" style={{ color: THEME.textMuted }}>
            {isSignUp ? 'Mastering the Mentals' : 'Sign in to Continue to Your Journal'}
          </p>
        </div>

        {error && (
          <div 
            className="p-3 mb-4 rounded-lg text-sm font-medium flex items-center"
            style={{ 
                backgroundColor: `rgba(255, 77, 77, 0.1)`, 
                color: THEME.accentRed, 
                border: `1px solid ${THEME.accentRed}` 
            }}
          >
            <AlertTriangle className="w-4 h-4 mr-2 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* ✅ FIXED: Using Google favicon instead of SVG */}
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="
            w-full flex items-center justify-center py-3 px-4 mb-4 rounded-xl 
            font-semibold transition duration-300 ease-in-out
            text-base border-2 border-white/10 hover:border-white/30
          "
          style={{ backgroundColor: `rgba(255, 255, 255, 0.03)`, color: THEME.textLight }}
        >
          <img 
            src="https://www.google.com/favicon.ico" 
            alt="Google" 
            className="w-5 h-5 mr-3"
          />
          Continue with Google
        </button>
        
        <div className="flex items-center mb-6">
          <div className="flex-grow border-t border-white/5"></div>
          <span className="flex-shrink mx-4 text-sm font-medium" style={{ color: THEME.textMuted }}>OR</span>
          <div className="flex-grow border-t border-white/5"></div>
        </div>

        <form onSubmit={handleAuth} className="space-y-5">
          <CustomInput 
            id="email" 
            type="email" 
            placeholder="Email Address" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)}
          />
          <CustomInput 
            id="password" 
            type="password" 
            placeholder="Password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)}
          />
          
          <button
            type="submit"
            disabled={loading}
            className="
              w-full py-4 rounded-xl text-lg font-bold transition duration-300 ease-in-out
              transform hover:scale-[1.01] active:scale-[0.99]
            "
            style={{ 
              backgroundColor: THEME.accentGreen, 
              color: THEME.bg,
              boxShadow: `0 4px 15px -3px rgba(60, 255, 100, 0.4)`
            }}
          >
            {loading ? 'Processing...' : (isSignUp ? 'Create Account' : 'Sign In')}
          </button>
        </form>

        <p className="text-center mt-6 text-sm">
          <span className="mr-1" style={{ color: THEME.textMuted }}>
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}
          </span>
          <button 
            onClick={toggleMode}
            className="font-semibold transition duration-300 ease-in-out underline-offset-4 hover:underline"
            style={{ color: THEME.accentGreen }}
            aria-label={isSignUp ? 'Switch to Sign In' : 'Switch to Sign Up'}
          >
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthScreen;
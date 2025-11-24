import { createClient } from '@supabase/supabase-js';
import { useState, useEffect } from 'react';
import { Auth as SupabaseAuth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';

// ⚠️ FIX: Use import.meta.env to correctly access VITE environment variables in Vite projects.
// These variables must be defined in your .env file in the project root.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

// Check for missing keys and throw an error early
if (!supabaseUrl || !supabaseKey) {
  throw new Error("Supabase URL and/or Anon Key are missing. Please check your .env file and ensure they are prefixed with VITE_.");
}

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseKey);

// --- Custom Hook to handle User Authentication ---
export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for changes (login, logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return { 
    user, 
    loading, 
    signOut: () => supabase.auth.signOut() 
  };
}

// --- Login Component Wrapper ---
export const Auth = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[#050505] text-white">
      <div className="w-full max-w-md p-8 rounded-xl bg-gray-900/50 border border-white/10 backdrop-blur-xl">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-light tracking-wide">Welcome Back</h1>
          <p className="text-sm text-gray-500">Sign in to access your trade journal</p>
        </div>
        <SupabaseAuth 
          supabaseClient={supabase} 
          appearance={{ theme: ThemeSupa }} 
          theme="dark"
          providers={['google', 'github']} 
        />
      </div>
    </div>
  );
};
import { useState } from 'react'
import { useAuth } from './AuthContext'

export function Auth() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const { signIn, signUp } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    const { error } = isSignUp ? await signUp(email, password) : await signIn(email, password)
    if (error) alert(error.message)
  }

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center">
      <div className="w-full max-w-md p-8 rounded-xl bg-gray-900/40 backdrop-blur-xl border border-white/5">
        <h2 className="text-2xl font-light text-white mb-6">{isSignUp ? 'Sign Up' : 'Sign In'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-black/30 border border-white/10 rounded p-3 text-white" required />
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-black/30 border border-white/10 rounded p-3 text-white" required />
          <button type="submit" className="w-full py-3 rounded bg-cyan-500 hover:bg-cyan-400 text-black font-medium">{isSignUp ? 'Create Account' : 'Sign In'}</button>
          <button type="button" onClick={() => setIsSignUp(!isSignUp)} className="w-full text-gray-400 text-sm hover:text-white">{isSignUp ? 'Already have an account?' : 'Need an account?'}</button>
        </form>
      </div>
    </div>
  )
}
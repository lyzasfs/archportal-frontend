import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api'

function RegisterPage() {
  const [step, setStep] = useState(1)
  const [role, setRole] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleRoleSelect = (selectedRole) => {
    setRole(selectedRole)
    setStep(2)
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await api.post('/register', { name, email, password, role })
      const { user, token } = response.data

      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))

      if (user.role === 'client') {
        navigate('/client/dashboard')
      } else if (user.role === 'architect') {
        navigate('/architect/dashboard')
      } else if (user.role === 'admin') {
        navigate('/admin/dashboard')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f1ea] px-4 py-10">
      <div className="mx-auto grid max-w-6xl overflow-hidden rounded-[32px] bg-white shadow-[0_30px_80px_rgba(15,23,42,0.12)] lg:grid-cols-[1.1fr_0.9fr]">
        <div className="relative overflow-hidden bg-slate-900 p-8 text-white sm:p-10 lg:p-12">
          <div className="absolute -left-10 top-12 h-32 w-32 rounded-full bg-amber-500/20 blur-3xl" />
          <div className="absolute -right-10 bottom-10 h-40 w-40 rounded-full bg-orange-500/20 blur-3xl" />

          <div className="relative">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-lg font-black text-white shadow-lg shadow-amber-500/20">S</div>
              <div className="text-2xl font-black tracking-tight">
                SMH <span className="text-amber-400">SmartHireArch</span>
              </div>
            </div>

            <div className="mt-10 max-w-md">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-200">Create account</p>
              <h1 className="mt-3 text-4xl font-black tracking-tight">Join a smarter architecture network.</h1>
              <p className="mt-4 text-base text-slate-300">Sign up as a client to hire or as an architect to showcase your skills and find projects that match your expertise.</p>
            </div>

            <div className="mt-10 space-y-3 text-sm text-slate-200">
              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3"><span className="text-xl">🏠</span> Hire trusted design professionals</div>
              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3"><span className="text-xl">📐</span> Showcase your architecture expertise</div>
              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3"><span className="text-xl">⚡</span> Grow faster with a curated network</div>
            </div>
          </div>
        </div>

        <div className="p-8 sm:p-10 lg:p-12">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-black text-slate-900">Register</h2>
            <p className="mt-2 text-sm text-slate-500">Choose a role to continue</p>
          </div>

          {error && (
            <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">{error}</div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <button onClick={() => handleRoleSelect('client')} className="w-full rounded-[24px] border-2 border-slate-200 bg-slate-50 p-5 text-left transition hover:border-amber-400 hover:bg-amber-50">
                <div className="text-3xl">🏠</div>
                <div className="mt-3 text-xl font-black text-slate-900">Hire an Architect</div>
                <div className="mt-1 text-sm text-slate-500">I’m looking for an architect for my project</div>
              </button>

              <button onClick={() => handleRoleSelect('architect')} className="w-full rounded-[24px] border-2 border-slate-200 bg-slate-50 p-5 text-left transition hover:border-amber-400 hover:bg-amber-50">
                <div className="text-3xl">📐</div>
                <div className="mt-3 text-xl font-black text-slate-900">Join as an Architect</div>
                <div className="mt-1 text-sm text-slate-500">I want to showcase my work and find projects</div>
              </button>
            </div>
          )}

          {step === 2 && (
            <form onSubmit={handleRegister} className="space-y-5">
              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-center text-sm font-semibold text-amber-700">
                Registering as: <span className="font-black">{role === 'client' ? 'Client' : 'Architect'}</span>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Full name</label>
                <input type="text" placeholder="Enter your full name" value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-100" required />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Email address</label>
                <input type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-100" required />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Password</label>
                <input type="password" placeholder="Create a password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-100" required />
              </div>

              <button type="submit" disabled={loading} className="w-full rounded-full bg-gradient-to-r from-amber-500 to-orange-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-amber-500/25 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60">
                {loading ? 'Creating account...' : 'Create account'}
              </button>

              <button type="button" onClick={() => setStep(1)} className="w-full rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50">← Back</button>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-slate-500">Already have an account? <Link to="/login" className="font-semibold text-amber-600 hover:text-amber-700">Login here</Link></p>
          <p className="mt-3 text-center text-sm text-slate-500"><Link to="/" className="font-medium text-slate-600 hover:text-slate-900">← Back to Home</Link></p>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage
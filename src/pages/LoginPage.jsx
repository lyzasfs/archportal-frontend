import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api'

function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [loading, setLoading] = useState(false)
  const [forgotLoading, setForgotLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setInfo('')

    try {
      const response = await api.post('/login', { email, password })
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
      setError(err?.response?.data?.message || 'Invalid email or password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      setError('Please enter your email address first.')
      return
    }

    setForgotLoading(true)
    setError('')
    setInfo('')

    try {
      const response = await api.post('/forgot-password', { email })
      setInfo(response.data.message || 'Password reset email sent.')
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to send password reset email right now.')
    } finally {
      setForgotLoading(false)
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
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-200">Welcome back</p>
              <h1 className="mt-3 text-4xl font-black tracking-tight">Access your architecture workspace.</h1>
              <p className="mt-4 text-base text-slate-300">Review projects, manage opportunities, and stay connected with your professional network.</p>
            </div>

            <div className="mt-10 space-y-3 text-sm text-slate-200">
              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3"><span className="text-xl">✔</span> Manage active projects</div>
              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3"><span className="text-xl">✔</span> Stay updated with messages</div>
              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3"><span className="text-xl">✔</span> Track applications and hiring</div>
            </div>
          </div>
        </div>

        <div className="p-8 sm:p-10 lg:p-12">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-black text-slate-900">Login</h2>
            <p className="mt-2 text-sm text-slate-500">Enter your account details</p>
          </div>

          {error && (
            <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">{error}</div>
          )}

          {info && (
            <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">{info}</div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Email address</label>
              <input type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-100" required />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Password</label>
              <input type="password" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-100" required />
            </div>

            <button type="submit" disabled={loading} className="w-full rounded-full bg-gradient-to-r from-amber-500 to-orange-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-amber-500/25 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60">
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div className="mt-4 text-center">
            <button type="button" onClick={handleForgotPassword} disabled={forgotLoading} className="text-sm font-semibold text-amber-600 hover:text-amber-700 disabled:cursor-not-allowed disabled:opacity-60">
              {forgotLoading ? 'Sending reset link...' : 'Forgot password?'}
            </button>
          </div>

          <p className="mt-6 text-center text-sm text-slate-500">Don’t have an account? <Link to="/register" className="font-semibold text-amber-600 hover:text-amber-700">Register here</Link></p>
          <p className="mt-3 text-center text-sm text-slate-500"><Link to="/" className="font-medium text-slate-600 hover:text-slate-900">← Back to Home</Link></p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
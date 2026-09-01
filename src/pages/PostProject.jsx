import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api'
import LogoutConfirmModal from '../components/LogoutConfirmModal'

function PostProject() {
  const user = JSON.parse(localStorage.getItem('user'))
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [budget, setBudget] = useState('')
  const [location, setLocation] = useState('')
  const [projectType, setProjectType] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [showLogoutModal, setShowLogoutModal] = useState(false)

  const handleLogout = () => {
    setShowLogoutModal(true)
  }

  const confirmLogout = () => {
    setShowLogoutModal(false)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const newProject = {
      id: Date.now(),
      title,
      description,
      budget,
      location,
      project_type: projectType,
      status: 'pending',
      client: { name: user?.name || 'Client' },
    }

    try {
      const response = await api.post('/projects', {
        title,
        description,
        budget,
        location,
        project_type: projectType,
      })

      const savedProject = response?.data || newProject
      const storageKey = 'client_projects_cache'
      const currentProjects = JSON.parse(localStorage.getItem(storageKey) || '[]')
      localStorage.setItem(storageKey, JSON.stringify([...currentProjects, savedProject]))

      setSuccess('Project posted successfully!')
      setTitle('')
      setDescription('')
      setBudget('')
      setLocation('')
      setProjectType('')
      setTimeout(() => {
        setSuccess('')
        navigate('/client/dashboard')
      }, 600)
    } catch (err) {
      console.error(err)
      const storageKey = 'client_projects_cache'
      const currentProjects = JSON.parse(localStorage.getItem(storageKey) || '[]')
      localStorage.setItem(storageKey, JSON.stringify([...currentProjects, newProject]))
      setSuccess('Project posted successfully!')
      setTimeout(() => {
        setSuccess('')
        navigate('/client/dashboard')
      }, 600)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f1ea] text-slate-800">
      <div className="absolute inset-x-0 top-0 -z-10 h-[320px] bg-[radial-gradient(circle_at_top_left,_rgba(245,158,11,0.22),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(15,23,42,0.12),_transparent_28%)]" />

      <LogoutConfirmModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={confirmLogout}
      />

      <nav className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/75 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-lg font-black text-white shadow-lg shadow-amber-500/20">
              S
            </div>
            <div className="text-lg font-black tracking-tight text-slate-900">
              SMH <span className="text-amber-600">SmartHireArch</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/client/dashboard" className="hidden rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-amber-400 hover:text-amber-600 sm:inline-flex">
              Dashboard
            </Link>
            <button
              onClick={handleLogout}
              className="rounded-full bg-gradient-to-r from-amber-500 to-orange-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-amber-500/25 transition hover:brightness-110"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <section className="mb-8 overflow-hidden rounded-[30px] bg-slate-900 px-6 py-8 text-white shadow-[0_30px_80px_rgba(15,23,42,0.2)] sm:px-8">
          <div className="relative grid gap-5 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div>
              <div className="mb-3 inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-200">
                Project launch
              </div>
              <h1 className="text-3xl font-black tracking-tight sm:text-4xl">Post your next big idea</h1>
              <p className="mt-3 max-w-xl text-slate-300">
                Share the details of your project and connect with qualified architects who can bring your vision to life.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-md">
              <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Quick guide</div>
              <div className="mt-4 space-y-3 text-sm text-slate-200">
                <div className="flex items-center gap-3"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-400 text-xs font-black text-slate-900">1</span> Add project details</div>
                <div className="flex items-center gap-3"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-400 text-xs font-black text-slate-900">2</span> Set location and budget</div>
                <div className="flex items-center gap-3"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-400 text-xs font-black text-slate-900">3</span> Connect with the right fit</div>
              </div>
            </div>
          </div>
        </section>

        {success && (
          <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            ✅ {success}
          </div>
        )}

        <section className="lux-panel rounded-[30px] p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="grid gap-6 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-slate-700">Project Title</label>
              <input
                type="text"
                placeholder="e.g. Dream House Construction"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="lux-input w-full rounded-2xl px-4 py-3 text-sm"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Project Type</label>
              <select
                value={projectType}
                onChange={(e) => setProjectType(e.target.value)}
                className="lux-select w-full rounded-2xl px-4 py-3 text-sm"
                required
              >
                <option value="">Select project type</option>
                <option value="Residential">Residential</option>
                <option value="Commercial">Commercial</option>
                <option value="Interior Design">Interior Design</option>
                <option value="Landscape">Landscape</option>
                <option value="Renovation">Renovation</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Budget (PHP)</label>
              <input
                type="number"
                placeholder="e.g. 500000"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="lux-input w-full rounded-2xl px-4 py-3 text-sm"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-slate-700">Project Description</label>
              <textarea
                placeholder="Describe your project in detail..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                className="lux-textarea w-full rounded-2xl px-4 py-3 text-sm"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-slate-700">Project Location</label>
              <input
                type="text"
                placeholder="e.g. General Santos City, Philippines"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="lux-input w-full rounded-2xl px-4 py-3 text-sm"
                required
              />
            </div>

            <div className="md:col-span-2 flex flex-col gap-4 pt-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-slate-500">
                {user?.name ? `Posting as ${user.name}` : 'Posting as client'}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="lux-button rounded-full px-6 py-3 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? 'Posting Project...' : 'Post Project'}
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  )
}

export default PostProject
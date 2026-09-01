import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api'
import LogoutConfirmModal from '../components/LogoutConfirmModal'

const fallbackArchitectPhoto = 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=700&q=80'

function BrowseArchitects() {
  const user = JSON.parse(localStorage.getItem('user'))
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All')
  const [architects, setArchitects] = useState([])
  const [loading, setLoading] = useState(true)
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

  useEffect(() => {
    const fetchArchitects = async () => {
      try {
        const res = await api.get('/architects')
        const enriched = (res.data || []).map((arch) => ({
          ...arch,
          photo: arch.photo || arch.avatar || arch.architect_profile?.photo_url || arch.photo_url || fallbackArchitectPhoto,
        }))
        setArchitects(enriched)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchArchitects()
  }, [])

  const specializations = ['All', 'Residential', 'Commercial', 'Interior', 'Landscape']

  const filtered = architects.filter(a => {
    const isApproved = a.architect_profile?.status === 'approved' || !!a.architect_profile?.specialization
    if (!isApproved) return false

    const matchSearch = (a.name || '').toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'All' || a.architect_profile?.specialization === filter
    return matchSearch && matchFilter
  })

  const handleHire = (arch) => {
    navigate(`/messages?contact=${arch.id}`)
  }

  const handleMessage = (arch) => {
    navigate(`/messages?contact=${arch.id}`)
  }

  const handleViewProfile = (arch) => {
    navigate(`/client/architect/${arch.id}`)
  }

  const getArchitectProfileLabel = (arch) => {
    const specialization = arch?.architect_profile?.specialization?.trim()
    return specialization || 'Profile pending'
  }

  const getArchitectApprovalBadge = (arch) => {
    const specialization = arch?.architect_profile?.specialization?.trim()
    return specialization ? 'Approved architect' : 'Profile pending'
  }

  return (
    <div className="min-h-screen bg-[#f5f1ea] text-slate-800">
      <div className="absolute inset-x-0 top-0 -z-10 h-[260px] bg-[radial-gradient(circle_at_top_left,_rgba(245,158,11,0.22),_transparent_35%),radial-gradient(circle_at_top_right,_rgba(15,23,42,0.12),_transparent_30%)]" />

      <LogoutConfirmModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={confirmLogout}
      />

      <nav className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/75 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-lg font-black text-white shadow-lg shadow-amber-500/20">S</div>
            <div className="text-lg font-black tracking-tight text-slate-900">SMH <span className="text-amber-600">SmartHireArch</span></div>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/client/dashboard" className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-amber-400 hover:text-amber-600">Dashboard</Link>
            <button onClick={handleLogout} className="rounded-full bg-gradient-to-r from-amber-500 to-orange-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-amber-500/25 transition hover:brightness-110">Logout</button>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="mb-8 overflow-hidden rounded-[30px] bg-slate-900 px-6 py-8 text-white shadow-[0_30px_80px_rgba(15,23,42,0.2)] sm:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-200">Directory</p>
              <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Browse architects</h1>
            </div>
            <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200">{filtered.length} matching profiles</div>
          </div>
        </section>

        <section className="mb-8 rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_18px_60px_rgba(15,23,42,0.05)] sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
            <input type="text" placeholder="Search by name..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-100" />

            <div className="flex flex-wrap gap-2">
              {specializations.map((spec) => (
                <button key={spec} onClick={() => setFilter(spec)} className={`rounded-full px-3.5 py-2 text-sm font-semibold transition ${filter === spec ? 'bg-slate-900 text-white shadow-md' : 'border border-slate-200 bg-white text-slate-600 hover:border-amber-400 hover:text-amber-600'}`}>
                  {spec}
                </button>
              ))}
            </div>
          </div>
        </section>

        {loading ? (
          <div className="py-20 text-center text-slate-400">Loading architects...</div>
        ) : filtered.length === 0 ? (
          <div className="rounded-[28px] border border-slate-200 bg-white p-12 text-center shadow-[0_18px_60px_rgba(15,23,42,0.05)]">
            <div className="text-5xl">🔍</div>
            <p className="mt-4 text-xl font-bold text-slate-900">No architects found</p>
            <p className="mt-2 text-slate-500">Try clearing the current filters.</p>
            <button onClick={() => { setSearch(''); setFilter('All') }} className="mt-6 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-amber-500/25 transition hover:brightness-110">Clear filters</button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((arch) => (
              <div key={arch.id} className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_18px_60px_rgba(15,23,42,0.04)] transition hover:-translate-y-1 hover:shadow-[0_20px_80px_rgba(15,23,42,0.08)]">
                <img src={arch.photo} alt={arch.name} className="h-52 w-full object-cover" />
                <div className="p-5">
                  <div className="flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-900 to-slate-700 text-2xl text-white shadow-lg">👤</div>
                    <div>
                      <h3 className="text-lg font-black text-slate-900">{arch.name}</h3>
                      <p className="text-sm font-semibold text-amber-600">{getArchitectProfileLabel(arch)}</p>
                      <p className="text-xs text-slate-500">{arch.architect_profile?.years_of_experience || 0} years experience</p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${arch.architect_profile?.specialization ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                      {getArchitectApprovalBadge(arch)}
                    </span>
                  </div>

                  {arch.architect_profile?.bio && (
                    <p className="mt-4 text-sm leading-6 text-slate-600">{arch.architect_profile.bio}</p>
                  )}

                  <div className="mt-5 flex gap-2">
                    <button onClick={() => handleViewProfile(arch)} className="flex-1 rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-bold text-slate-700 transition hover:border-amber-400 hover:text-amber-600">View profile</button>
                    <button onClick={() => handleHire(arch)} className="flex-1 rounded-2xl bg-slate-900 px-3 py-2.5 text-sm font-bold text-white transition hover:bg-slate-700">Hire now</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

export default BrowseArchitects
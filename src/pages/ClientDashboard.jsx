import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api'
import LogoutConfirmModal from '../components/LogoutConfirmModal'

const fallbackArchitectPhoto = 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=700&q=80'

function ClientDashboard() {
  const user = JSON.parse(localStorage.getItem('user'))
  const navigate = useNavigate()
  const [projects, setProjects] = useState([])
  const [architects, setArchitects] = useState([])
  const [messages, setMessages] = useState([])
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
    const fetchData = async () => {
      try {
        const [projectsRes, architectsRes, messagesRes] = await Promise.all([
          api.get('/projects'),
          api.get('/architects'),
          api.get('/messages'),
        ])

        const cacheProjects = JSON.parse(localStorage.getItem('client_projects_cache') || '[]')
        const mergedProjects = [...(projectsRes.data || []), ...cacheProjects].filter(
          (project, index, array) => index === array.findIndex(item => item.id === project.id)
        )

        setProjects(mergedProjects)
        const approvedArchitects = (architectsRes.data || []).filter((arch) => {
          const profile = arch.architect_profile || {}
          return profile.status === 'approved' || !!profile.specialization
        })
        const enriched = approvedArchitects.map((arch) => ({
          ...arch,
          photo: arch.photo || arch.avatar || arch.architect_profile?.photo_url || arch.photo_url || fallbackArchitectPhoto,
        }))
        setArchitects(enriched)
        setMessages(messagesRes.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleHire = (arch) => {
    navigate(`/messages?contact=${arch.id}`)
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
      <div className="absolute inset-x-0 top-0 -z-10 h-[420px] bg-[radial-gradient(circle_at_top_left,_rgba(245,158,11,0.24),_transparent_35%),radial-gradient(circle_at_top_right,_rgba(15,23,42,0.14),_transparent_30%)]" />

      <LogoutConfirmModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={confirmLogout}
      />

      <nav className="sticky top-0 z-30 border-b border-white/30 bg-white/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-lg font-bold text-white shadow-lg shadow-amber-500/20">
              S
            </div>
            <div>
              <div className="text-lg font-black tracking-tight text-slate-900">
                SMH <span className="text-amber-600">SmartHireArch</span>
              </div>
            </div>
          </div>

          <div className="hidden items-center gap-6 md:flex">
            <span className="text-sm font-medium text-slate-600">Welcome, {user?.name}!</span>
            <Link to="/client/browse" className="text-sm font-medium text-slate-600 transition hover:text-amber-600">Browse Architects</Link>
            <Link to="/client/post-project" className="text-sm font-medium text-slate-600 transition hover:text-amber-600">Post Project</Link>
            <Link to="/messages" className="text-sm font-medium text-slate-600 transition hover:text-amber-600">Messages</Link>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={handleLogout} className="rounded-full bg-gradient-to-r from-amber-500 to-orange-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-amber-500/25 transition hover:brightness-110">Logout</button>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="relative mb-8 overflow-hidden rounded-[30px] bg-slate-900 px-6 py-8 text-white shadow-[0_30px_80px_rgba(15,23,42,0.25)] sm:px-8 lg:px-10">
          <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-amber-500/30 blur-3xl" />
          <div className="absolute bottom-0 right-10 h-32 w-32 rounded-full bg-orange-500/20 blur-3xl" />

          <div className="relative grid items-center gap-8 lg:grid-cols-[1.3fr_0.7fr]">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-amber-200">
                Design. Build. Grow.
              </div>
              <h1 className="max-w-xl text-3xl font-black tracking-tight sm:text-5xl">
                Bring your next project to life with the right architect.
              </h1>
              <p className="mt-4 max-w-lg text-base text-slate-300">
                Discover vetted professionals, compare expertise, and move from concept to construction with a smarter hiring process.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link to="/client/post-project" className="rounded-full bg-amber-400 px-5 py-3 text-sm font-bold text-slate-900 shadow-lg shadow-amber-500/30 transition hover:bg-amber-300">Post a Project</Link>
                <Link to="/client/browse" className="rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/10">Browse Architects</Link>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-md">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm text-slate-300">Portfolio snapshot</p>
                <span className="rounded-full bg-emerald-500/20 px-2 py-1 text-xs font-semibold text-emerald-300">Live</span>
              </div>

              <div className="space-y-4">
                <div className="rounded-2xl bg-white/5 p-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Qualified matches</div>
                  <div className="mt-2 flex items-end justify-between">
                    <span className="text-3xl font-black text-white">{architects.length}</span>
                    <span className="text-sm text-emerald-300">+18% this month</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-white/5 p-4">
                    <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Projects</div>
                    <div className="mt-2 text-2xl font-black text-white">{projects.length}</div>
                  </div>
                  <div className="rounded-2xl bg-white/5 p-4">
                    <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Messages</div>
                    <div className="mt-2 text-2xl font-black text-white">{messages.length}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-8 grid gap-5 md:grid-cols-3">
          {[
            { label: 'My Projects', value: projects.length, icon: '📋', accent: 'from-amber-100 to-orange-100', text: 'text-amber-700' },
            { label: 'Architects', value: architects.length, icon: '🏗️', accent: 'from-sky-100 to-blue-100', text: 'text-sky-700' },
            { label: 'Messages', value: messages.length, icon: '💬', accent: 'from-emerald-100 to-green-100', text: 'text-emerald-700' },
          ].map((stat) => (
            <div key={stat.label} className={`rounded-3xl border border-slate-200 bg-gradient-to-br ${stat.accent} p-5 shadow-sm`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                  <p className="mt-2 text-4xl font-black text-slate-900">{stat.value}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/80 text-2xl shadow-sm">{stat.icon}</div>
              </div>
            </div>
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.4fr_0.6fr]">
          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.05)]">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-400">Top talent</p>
                <h2 className="mt-2 text-2xl font-black text-slate-900">Featured Architects</h2>
              </div>
              <Link to="/client/browse" className="text-sm font-semibold text-amber-600 transition hover:text-amber-700">View all</Link>
            </div>

            {loading ? (
              <div className="py-10 text-center text-slate-400">Loading architects...</div>
            ) : architects.length === 0 ? (
              <div className="py-10 text-center text-slate-400">No architects available yet.</div>
            ) : (
              <div className="grid gap-4 md:grid-cols-3">
                {architects.slice(0, 3).map((arch) => (
                  <div key={arch.id} className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 transition hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/70">
                    <img src={arch.photo} alt={arch.name} className="h-32 w-full object-cover" />
                    <div className="p-4">
                      <div className="mb-4 flex items-center justify-between">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-900 to-slate-700 text-2xl text-white shadow-md">👤</div>
                        <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-700">Top rated</span>
                      </div>

                      <div>
                        <h3 className="text-lg font-bold text-slate-900">{arch.name}</h3>
                        <p className="mt-1 text-sm font-medium text-amber-600">{getArchitectProfileLabel(arch)}</p>
                        <p className="mt-1 text-xs text-slate-500">{arch.architect_profile?.years_of_experience || 0} years experience</p>
                      </div>

                      <div className="mt-4 flex items-center justify-between rounded-2xl bg-white px-3 py-2 text-xs text-slate-500">
                        <span className={`rounded-full px-2 py-1 font-bold ${arch.architect_profile?.specialization ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                          {getArchitectApprovalBadge(arch)}
                        </span>
                        <span>{arch.architect_profile?.location || 'Available'}</span>
                      </div>

                      <button onClick={() => handleHire(arch)} className="mt-4 w-full rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-slate-700">Hire Now</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <aside className="space-y-6">
            <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.05)]">
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-400">Quick actions</p>
              <div className="mt-4 space-y-3">
                <Link to="/client/post-project" className="flex items-center justify-between rounded-2xl bg-amber-50 p-4 text-left transition hover:bg-amber-100">
                  <div>
                    <div className="font-bold text-slate-900">Post a project</div>
                    <div className="text-sm text-slate-500">Find the perfect design partner</div>
                  </div>
                  <span className="text-2xl">→</span>
                </Link>

                <Link to="/client/browse" className="flex items-center justify-between rounded-2xl bg-sky-50 p-4 text-left transition hover:bg-sky-100">
                  <div>
                    <div className="font-bold text-slate-900">Browse talent</div>
                    <div className="text-sm text-slate-500">Compare expertise and profiles</div>
                  </div>
                  <span className="text-2xl">→</span>
                </Link>

                <Link to="/messages" className="flex items-center justify-between rounded-2xl bg-emerald-50 p-4 text-left transition hover:bg-emerald-100">
                  <div>
                    <div className="font-bold text-slate-900">Messages</div>
                    <div className="text-sm text-slate-500">Review conversations and updates</div>
                  </div>
                  <span className="text-2xl">→</span>
                </Link>
              </div>
            </div>
          </aside>
        </section>

        <section className="mt-8 rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.05)]">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-400">Pipeline</p>
              <h2 className="mt-2 text-2xl font-black text-slate-900">My Projects</h2>
            </div>
            <Link to="/client/post-project" className="rounded-full bg-gradient-to-r from-amber-500 to-orange-600 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-amber-500/25 transition hover:brightness-110">+ Post Project</Link>
          </div>

          {loading ? (
            <div className="py-12 text-center text-slate-400">Loading projects...</div>
          ) : projects.length === 0 ? (
            <div className="py-12 text-center">
              <p className="mb-4 text-slate-400">No projects posted yet.</p>
              <Link to="/client/post-project" className="rounded-full bg-slate-900 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-slate-700">Post Your First Project</Link>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-slate-200">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="px-5 py-4 font-semibold">Project Title</th>
                    <th className="px-5 py-4 font-semibold">Type</th>
                    <th className="px-5 py-4 font-semibold">Budget</th>
                    <th className="px-5 py-4 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map((project) => (
                    <tr key={project.id} className="border-t border-slate-200 bg-white">
                      <td className="px-5 py-4 font-semibold text-slate-800">{project.title}</td>
                      <td className="px-5 py-4 text-slate-600">{project.project_type}</td>
                      <td className="px-5 py-4 text-slate-600">₱{Number(project.budget).toLocaleString()}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                          project.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                          project.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          project.status === 'completed' ? 'bg-green-100 text-green-700' :
                          'bg-slate-200 text-slate-700'
                        }`}>
                          {project.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

export default ClientDashboard
import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api'
import LogoutConfirmModal from '../components/LogoutConfirmModal'

function ArchitectDashboard() {
  const user = JSON.parse(localStorage.getItem('user'))
  const navigate = useNavigate()
  const [applications, setApplications] = useState([])
  const [jobs, setJobs] = useState([])
  const [profile, setProfile] = useState(null)
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
        const [applicationsRes, jobsRes, profileRes, messagesRes] = await Promise.all([
          api.get('/applications'),
          api.get('/jobs'),
          api.get('/architect-profile'),
          api.get('/messages'),
        ])
        setApplications(applicationsRes.data)
        setJobs(jobsRes.data)
        setProfile(profileRes.data)
        setMessages(messagesRes.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const stats = [
    { label: 'Applications', value: applications.length, icon: '📋', color: 'from-amber-100 to-orange-100' },
    { label: 'Open jobs', value: jobs.length, icon: '🏗️', color: 'from-sky-100 to-blue-100' },
    { label: 'Messages', value: messages.length, icon: '💬', color: 'from-emerald-100 to-green-100' },
    { label: 'Portfolio', value: '0', icon: '🖼️', color: 'from-violet-100 to-purple-100' },
  ]

  return (
    <div className="min-h-screen bg-[#f5f1ea] text-slate-800">
      <div className="absolute inset-x-0 top-0 -z-10 h-[420px] bg-[radial-gradient(circle_at_top_left,_rgba(245,158,11,0.22),_transparent_35%),radial-gradient(circle_at_top_right,_rgba(15,23,42,0.14),_transparent_30%)]" />

      <LogoutConfirmModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={confirmLogout}
      />

      <nav className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/75 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-lg font-black text-white shadow-lg shadow-amber-500/20">
              S
            </div>
            <div className="text-lg font-black tracking-tight text-slate-900">
              SMH <span className="text-amber-600">SmartHireArch</span>
            </div>
          </div>

          <div className="hidden items-center gap-6 md:flex">
            <span className="text-sm font-medium text-slate-600">Welcome, {user?.name}!</span>
            <Link to="/architect/profile" className="text-sm font-medium text-slate-600 transition hover:text-amber-600">My Profile</Link>
            <Link to="/architect/jobs" className="text-sm font-medium text-slate-600 transition hover:text-amber-600">Job Postings</Link>
            <Link to="/messages" className="text-sm font-medium text-slate-600 transition hover:text-amber-600">Messages</Link>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={handleLogout} className="rounded-full bg-gradient-to-r from-amber-500 to-orange-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-amber-500/25 transition hover:brightness-110">Logout</button>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="mb-8 overflow-hidden rounded-[30px] bg-slate-900 px-6 py-8 text-white shadow-[0_30px_80px_rgba(15,23,42,0.25)] sm:px-8">
          <div className="grid items-center gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-200">
                Architect workspace
              </div>
              <h1 className="text-3xl font-black tracking-tight sm:text-5xl">Build your next opportunity with confidence.</h1>
              <p className="mt-4 max-w-xl text-base text-slate-300">Track applications, discover your next project, and manage your professional profile from one premium workspace.</p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-md">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm text-slate-300">Profile strength</p>
                <span className="rounded-full bg-emerald-500/20 px-2 py-1 text-xs font-semibold text-emerald-300">75%</span>
              </div>

              <div className="space-y-4">
                <div className="rounded-2xl bg-white/5 p-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Specialization</div>
                  <div className="mt-2 text-2xl font-black text-white">{profile?.specialization || 'Architect'}</div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-white/5 p-4">
                    <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Experience</div>
                    <div className="mt-2 text-2xl font-black text-white">{profile?.years_of_experience || 0}</div>
                  </div>
                  <div className="rounded-2xl bg-white/5 p-4">
                    <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Applications</div>
                    <div className="mt-2 text-2xl font-black text-white">{applications.length}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-8 grid gap-5 md:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className={`rounded-3xl border border-slate-200 bg-gradient-to-br ${stat.color} p-5 shadow-sm`}>
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

        <section className="grid gap-6 xl:grid-cols-[0.75fr_1.25fr]">
          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.05)]">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-2xl font-black text-slate-900">My Profile</h2>
              <Link to="/architect/profile" className="text-sm font-semibold text-amber-600 hover:text-amber-700">Edit</Link>
            </div>

            <div className="flex items-center gap-4 rounded-2xl bg-slate-50 p-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-900 to-slate-700 text-3xl text-white shadow-lg">
                👤
              </div>
              <div>
                <div className="text-xl font-black text-slate-900">{user?.name}</div>
                <div className="text-sm font-medium text-amber-600">{profile?.specialization || 'Architect'}</div>
                <div className="text-xs text-slate-500">{profile?.years_of_experience || 0} years of experience</div>
              </div>
            </div>

            <div className="mt-5 space-y-3 text-sm">
              <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                <span className="text-slate-500">Availability</span>
                <span className="font-bold text-emerald-600">Open to work</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                <span className="text-slate-500">Location</span>
                <span className="font-bold text-slate-800">{profile?.location || 'Not specified'}</span>
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.05)]">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-400">Discover</p>
                <h2 className="mt-2 text-2xl font-black text-slate-900">Open opportunities</h2>
              </div>
              <Link to="/architect/jobs" className="text-sm font-semibold text-amber-600 hover:text-amber-700">View all</Link>
            </div>

            {loading ? (
              <div className="py-10 text-center text-slate-400">Loading jobs...</div>
            ) : jobs.length === 0 ? (
              <div className="py-10 text-center text-slate-400">No jobs available yet.</div>
            ) : (
              <div className="space-y-3">
                {jobs.slice(0, 3).map((job) => (
                  <div key={job.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <div className="text-lg font-bold text-slate-900">{job.title}</div>
                        <div className="text-sm text-slate-500">{job.location} • {job.type}</div>
                      </div>
                      <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-700">New</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="mt-8 rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.05)]">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-400">Applications</p>
              <h2 className="mt-2 text-2xl font-black text-slate-900">My Applications</h2>
            </div>
            <Link to="/architect/jobs" className="rounded-full bg-gradient-to-r from-amber-500 to-orange-600 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-amber-500/25 transition hover:brightness-110">Browse jobs</Link>
          </div>

          {loading ? (
            <div className="py-12 text-center text-slate-400">Loading applications...</div>
          ) : applications.length === 0 ? (
            <div className="py-12 text-center">
              <p className="mb-4 text-slate-400">No applications yet.</p>
              <Link to="/architect/jobs" className="rounded-full bg-slate-900 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-slate-700">Apply now</Link>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-slate-200">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="px-5 py-4 font-semibold">Job title</th>
                    <th className="px-5 py-4 font-semibold">Location</th>
                    <th className="px-5 py-4 font-semibold">Date applied</th>
                    <th className="px-5 py-4 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((app) => (
                    <tr key={app.id} className="border-t border-slate-200 bg-white">
                      <td className="px-5 py-4 font-semibold text-slate-800">{app.job_posting?.title}</td>
                      <td className="px-5 py-4 text-slate-600">{app.job_posting?.location}</td>
                      <td className="px-5 py-4 text-slate-600">{new Date(app.created_at).toLocaleDateString()}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                          app.status === 'approved' ? 'bg-green-100 text-green-700' :
                          app.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {app.status}
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

export default ArchitectDashboard
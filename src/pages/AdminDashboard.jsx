import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api'
import LogoutConfirmModal from '../components/LogoutConfirmModal'

function AdminDashboard() {
  const user = JSON.parse(localStorage.getItem('user'))
  const navigate = useNavigate()
  const [hiringStatus, setHiringStatus] = useState(true)
  const [users, setUsers] = useState([])
  const [applications, setApplications] = useState([])
  const [messages, setMessages] = useState([])
  const [projects, setProjects] = useState([])
  const [stats, setStats] = useState({})
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedProject, setSelectedProject] = useState(null)
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [newJob, setNewJob] = useState({
    title: '', description: '', type: '', location: '', experience: '', deadline: ''
  })
  const [showJobForm, setShowJobForm] = useState(false)

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
        const [usersRes, applicationsRes, statsRes, hiringRes, jobsRes, projectsRes, messagesRes] = await Promise.all([
          api.get('/users'),
          api.get('/all-applications'),
          api.get('/stats'),
          api.get('/hiring-status'),
          api.get('/jobs'),
          api.get('/all-projects'),
          api.get('/messages'),
        ])
        setUsers(usersRes.data)
        setApplications(applicationsRes.data)
        setStats(statsRes.data)
        setHiringStatus(hiringRes.data.is_hiring)
        setJobs(jobsRes.data)
        setProjects(projectsRes.data)
        setMessages(messagesRes.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleHiringToggle = async () => {
    const nextState = !hiringStatus
    setHiringStatus(nextState)

    try {
      const res = await api.put('/hiring-status', { is_hiring: nextState })
      setHiringStatus(res.data.is_hiring)
    } catch (err) {
      console.error(err)
      setHiringStatus(hiringStatus)
    }
  }

  const handleApplicationStatus = async (id, status) => {
    const previousStatus = applications.find(app => app.id === id)?.status
    const optimisticUpdate = (currentApplications) =>
      currentApplications.map(app =>
        app.id === id ? { ...app, status } : app
      )

    setApplications(currentApplications => optimisticUpdate(currentApplications))

    try {
      await api.put(`/applications/${id}`, { status })
    } catch (err) {
      console.error(err)
      setApplications(currentApplications => currentApplications.map(app =>
        app.id === id ? { ...app, status: previousStatus } : app
      ))
    }
  }

  const handleProjectStatus = async (id, status) => {
    const previousStatus = projects.find(p => p.id === id)?.status
    const optimisticUpdate = (currentProjects) =>
      currentProjects.map(p =>
        p.id === id ? { ...p, status } : p
      )

    setProjects(currentProjects => optimisticUpdate(currentProjects))

    if (selectedProject?.id === id) {
      setSelectedProject({ ...selectedProject, status })
      setSelectedProject(null)
    }

    try {
      await api.put(`/projects/${id}/status`, { status })
    } catch (err) {
      console.error(err)
      setProjects(currentProjects => currentProjects.map(p =>
        p.id === id ? { ...p, status: previousStatus } : p
      ))
    }
  }

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return
    const previousUsers = users
    setUsers(currentUsers => currentUsers.filter(u => u.id !== id))

    try {
      await api.delete(`/users/${id}`)
    } catch (err) {
      console.error(err)
      setUsers(previousUsers)
    }
  }

  const handlePostJob = async (e) => {
    e.preventDefault()
    const previousJobs = jobs

    try {
      const res = await api.post('/jobs', newJob)
      setJobs(currentJobs => [...currentJobs, res.data])
      setNewJob({ title: '', description: '', type: '', location: '', experience: '', deadline: '' })
      setShowJobForm(false)
    } catch (err) {
      console.error(err)
      setJobs(previousJobs)
    }
  }

  const handleDeleteJob = async (id) => {
    if (!window.confirm('Are you sure?')) return
    const previousJobs = jobs
    setJobs(currentJobs => currentJobs.filter(j => j.id !== id))

    try {
      await api.delete(`/jobs/${id}`)
    } catch (err) {
      console.error(err)
      setJobs(previousJobs)
    }
  }

  const tabs = ['overview', 'users', 'applications', 'projects', 'jobs', 'messages']

  const getArchitectStatusBadge = (userItem) => {
    const hasProfile = Boolean(
      userItem?.architect_profile ||
      userItem?.profile ||
      userItem?.specialization ||
      userItem?.bio ||
      userItem?.location
    )

    if (userItem?.role !== 'architect') {
      return { label: userItem?.role || 'User', tone: 'bg-blue-100 text-blue-700' }
    }

    const relation = userItem?.architect_profile || userItem?.architectProfile || {}
    const approved = userItem?.approved === true || userItem?.is_approved === true || userItem?.status === 'approved' || relation?.approved === true || relation?.status === 'approved' || relation?.is_approved === true

    if (approved || hasProfile) {
      return { label: 'Approved architect', tone: 'bg-emerald-100 text-emerald-700' }
    }

    return { label: 'Profile pending', tone: 'bg-amber-100 text-amber-700' }
  }

  return (
    <div className="min-h-screen bg-[#f5f1ea] text-slate-800">
      <div className="absolute inset-x-0 top-0 -z-10 h-[420px] bg-[radial-gradient(circle_at_top_left,_rgba(245,158,11,0.22),_transparent_35%),radial-gradient(circle_at_top_right,_rgba(15,23,42,0.12),_transparent_35%)]" />

      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-w-lg w-full rounded-[28px] bg-white p-8 shadow-[0_30px_80px_rgba(15,23,42,0.25)]">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-black text-slate-900">Project details</h2>
              <button onClick={() => setSelectedProject(null)} className="text-3xl text-slate-400 transition hover:text-slate-600">×</button>
            </div>

            <div className="space-y-4 text-sm">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Client</p>
                <p className="mt-1 text-base font-bold text-slate-900">{selectedProject.client?.name}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Project title</p>
                <p className="mt-1 text-base font-bold text-slate-900">{selectedProject.title}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Project type</p>
                <p className="mt-1 text-slate-700">{selectedProject.project_type}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Budget</p>
                <p className="mt-1 text-slate-700">₱{Number(selectedProject.budget).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Location</p>
                <p className="mt-1 text-slate-700">{selectedProject.location || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Description</p>
                <p className="mt-1 text-slate-700">{selectedProject.description}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Status</p>
                <span className={`mt-1 inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                  selectedProject.status === 'approved' ? 'bg-green-100 text-green-700' :
                  selectedProject.status === 'open' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {selectedProject.status}
                </span>
              </div>
            </div>

            {selectedProject.status === 'open' && (
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <button onClick={() => handleProjectStatus(selectedProject.id, 'approved')} className="rounded-2xl bg-green-100 px-4 py-3 text-sm font-bold text-green-700 transition hover:bg-green-200">Approve</button>
                <button onClick={() => handleProjectStatus(selectedProject.id, 'rejected')} className="rounded-2xl bg-red-100 px-4 py-3 text-sm font-bold text-red-700 transition hover:bg-red-200">Reject</button>
              </div>
            )}

            <button onClick={() => setSelectedProject(null)} className="mt-6 w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-bold text-white transition hover:bg-slate-700">Close</button>
          </div>
        </div>
      )}

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

          <div className="flex items-center gap-3">
            <span className="hidden text-sm font-medium text-slate-600 md:inline">Welcome, {user?.name}!</span>
            <Link to="/admin/dashboard" className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-amber-400 hover:text-amber-600">Dashboard</Link>
            <a href="/" target="_blank" rel="noreferrer" className="rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700 transition hover:border-amber-300 hover:bg-amber-100">Client preview</a>
            <button onClick={handleLogout} className="rounded-full bg-gradient-to-r from-amber-500 to-orange-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-amber-500/25 transition hover:brightness-110">Logout</button>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="mb-8 overflow-hidden rounded-[30px] bg-slate-900 px-6 py-8 text-white shadow-[0_30px_80px_rgba(15,23,42,0.25)] sm:px-8">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-200">
                Platform overview
              </div>
              <h1 className="text-3xl font-black tracking-tight sm:text-5xl">Admin control center</h1>
              <p className="mt-4 max-w-xl text-base text-slate-300">Manage staff, review applications, approve projects, publish jobs, and oversee platform growth in one place.</p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-md">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm text-slate-300">Hiring status</p>
                <span className={`rounded-full px-2 py-1 text-xs font-semibold ${hiringStatus ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'}`}>{hiringStatus ? 'Hiring' : 'Paused'}</span>
              </div>

              <div className="space-y-4">
                <div className="rounded-2xl bg-white/5 p-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Users</div>
                  <div className="mt-2 text-3xl font-black text-white">{users.length}</div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-white/5 p-4">
                    <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Projects</div>
                    <div className="mt-2 text-2xl font-black text-white">{projects.length}</div>
                  </div>
                  <div className="rounded-2xl bg-white/5 p-4">
                    <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Jobs</div>
                    <div className="mt-2 text-2xl font-black text-white">{jobs.length}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="mb-8 flex gap-2 flex-wrap">
          {tabs.map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`rounded-full px-4 py-2 text-sm font-semibold capitalize transition ${activeTab === tab ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/10' : 'bg-white text-slate-600 shadow-sm hover:bg-slate-50'}`}>
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <div>
            <div className="mb-6 grid gap-5 md:grid-cols-4">
              {[
                { label: 'Total users', value: stats.total_users || 0, icon: '👥', color: 'from-amber-100 to-orange-100' },
                { label: 'Architects', value: stats.architects || 0, icon: '📐', color: 'from-sky-100 to-blue-100' },
                { label: 'Clients', value: stats.clients || 0, icon: '🏠', color: 'from-emerald-100 to-green-100' },
                { label: 'Messages', value: messages.length, icon: '💬', color: 'from-violet-100 to-purple-100' },
              ].map((stat) => (
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
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.05)]">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black text-slate-900">Hiring status</h2>
                  <p className="text-sm text-slate-500">Toggle whether the platform is currently accepting new projects and applicants.</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`text-sm font-bold ${hiringStatus ? 'text-emerald-600' : 'text-red-500'}`}>{hiringStatus ? 'Currently hiring' : 'Not hiring'}</span>
                  <button onClick={handleHiringToggle} className={`relative h-7 w-14 rounded-full transition-colors ${hiringStatus ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                    <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${hiringStatus ? 'left-8' : 'left-1'}`} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.05)]">
            <h2 className="mb-5 text-2xl font-black text-slate-900">Manage users</h2>
            {loading ? (
              <div className="py-10 text-center text-slate-400">Loading users...</div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-slate-200">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-500">
                    <tr>
                      <th className="px-5 py-4 font-semibold">Name</th>
                      <th className="px-5 py-4 font-semibold">Email</th>
                      <th className="px-5 py-4 font-semibold">Role</th>
                      <th className="px-5 py-4 font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => {
                      const architectStatus = getArchitectStatusBadge(u)

                      return (
                        <tr key={u.id} className="border-t border-slate-200 bg-white">
                          <td className="px-5 py-4 font-semibold text-slate-800">{u.name}</td>
                          <td className="px-5 py-4 text-slate-600">{u.email}</td>
                          <td className="px-5 py-4">
                            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : u.role === 'architect' ? architectStatus.tone : 'bg-blue-100 text-blue-700'}`}>
                              {u.role === 'architect' ? architectStatus.label : u.role}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                          <div className="flex flex-wrap gap-2">
                              {u.role === 'architect' && (
                                <button
                                  onClick={() => navigate(`/architect/profile?architectId=${u.id}`)}
                                  className="text-sm font-semibold text-amber-600 transition hover:text-amber-700"
                                >
                                  Edit profile
                                </button>
                              )}
                              <button onClick={() => handleDeleteUser(u.id)} className="text-sm font-semibold text-red-500 transition hover:text-red-700">Delete</button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'applications' && (
          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.05)]">
            <h2 className="mb-5 text-2xl font-black text-slate-900">Architect applications</h2>
            {loading ? (
              <div className="py-10 text-center text-slate-400">Loading applications...</div>
            ) : applications.length === 0 ? (
              <div className="py-10 text-center text-slate-400">No applications yet.</div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-slate-200">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-500">
                    <tr>
                      <th className="px-5 py-4 font-semibold">Applicant</th>
                      <th className="px-5 py-4 font-semibold">Job</th>
                      <th className="px-5 py-4 font-semibold">Resume</th>
                      <th className="px-5 py-4 font-semibold">Portfolio</th>
                      <th className="px-5 py-4 font-semibold">Status</th>
                      <th className="px-5 py-4 font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applications.map((app) => (
                      <tr key={app.id} className="border-t border-slate-200 bg-white">
                        <td className="px-5 py-4 font-semibold text-slate-800">{app.user?.name}</td>
                        <td className="px-5 py-4 text-slate-600">{app.job_posting?.title}</td>
                        <td className="px-5 py-4">
                          {app.resume ? <a href={app.resume.startsWith('http') ? app.resume : `http://localhost/archportal-backend/public/storage/${app.resume}`} target="_blank" rel="noreferrer" className="font-semibold text-amber-600 hover:text-amber-700">View Resume</a> : <span className="text-slate-400">No resume</span>}
                        </td>
                        <td className="px-5 py-4">
                          {app.portfolio ? <a href={app.portfolio.startsWith('http') ? app.portfolio : `http://localhost/archportal-backend/public/storage/${app.portfolio}`} target="_blank" rel="noreferrer" className="font-semibold text-amber-600 hover:text-amber-700">View Portfolio</a> : <span className="text-slate-400">No portfolio</span>}
                        </td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${app.status === 'approved' ? 'bg-green-100 text-green-700' : app.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                            {app.status}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          {app.status === 'pending' && (
                            <div className="flex gap-2">
                              <button onClick={() => handleApplicationStatus(app.id, 'approved')} className="rounded-full bg-green-100 px-3 py-1.5 text-xs font-bold text-green-700 transition hover:bg-green-200">Approve</button>
                              <button onClick={() => handleApplicationStatus(app.id, 'rejected')} className="rounded-full bg-red-100 px-3 py-1.5 text-xs font-bold text-red-700 transition hover:bg-red-200">Reject</button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'projects' && (
          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.05)]">
            <h2 className="mb-5 text-2xl font-black text-slate-900">Client project requests</h2>
            {loading ? (
              <div className="py-10 text-center text-slate-400">Loading projects...</div>
            ) : projects.length === 0 ? (
              <div className="py-10 text-center text-slate-400">No project requests yet.</div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-slate-200">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-500">
                    <tr>
                      <th className="px-5 py-4 font-semibold">Client</th>
                      <th className="px-5 py-4 font-semibold">Project</th>
                      <th className="px-5 py-4 font-semibold">Type</th>
                      <th className="px-5 py-4 font-semibold">Budget</th>
                      <th className="px-5 py-4 font-semibold">Status</th>
                      <th className="px-5 py-4 font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projects.map((project) => (
                      <tr key={project.id} className="border-t border-slate-200 bg-white">
                        <td className="px-5 py-4 font-semibold text-slate-800">{project.client?.name}</td>
                        <td className="px-5 py-4 text-slate-600">{project.title}</td>
                        <td className="px-5 py-4 text-slate-600">{project.project_type}</td>
                        <td className="px-5 py-4 text-slate-600">₱{Number(project.budget).toLocaleString()}</td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${project.status === 'approved' ? 'bg-green-100 text-green-700' : project.status === 'open' ? 'bg-yellow-100 text-yellow-700' : project.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                            {project.status}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex flex-wrap gap-2">
                            <button onClick={() => setSelectedProject(project)} className="rounded-full bg-blue-100 px-3 py-1.5 text-xs font-bold text-blue-700 transition hover:bg-blue-200">View</button>
                            {project.status === 'open' && (
                              <>
                                <button onClick={() => handleProjectStatus(project.id, 'approved')} className="rounded-full bg-green-100 px-3 py-1.5 text-xs font-bold text-green-700 transition hover:bg-green-200">Approve</button>
                                <button onClick={() => handleProjectStatus(project.id, 'rejected')} className="rounded-full bg-red-100 px-3 py-1.5 text-xs font-bold text-red-700 transition hover:bg-red-200">Reject</button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'jobs' && (
          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.05)]">
            <div className="mb-5 flex items-center justify-between gap-4">
              <h2 className="text-2xl font-black text-slate-900">Job postings</h2>
              <button onClick={() => setShowJobForm(!showJobForm)} className="rounded-full bg-gradient-to-r from-amber-500 to-orange-600 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-amber-500/25 transition hover:brightness-110">{showJobForm ? 'Cancel' : '+ Add job'}</button>
            </div>

            {showJobForm && (
              <form onSubmit={handlePostJob} className="mb-6 rounded-[28px] border border-slate-200 bg-slate-50 p-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">Job title</label>
                    <input type="text" value={newJob.title} onChange={(e) => setNewJob({ ...newJob, title: e.target.value })} placeholder="e.g. Senior Architect" className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-100" required />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">Type</label>
                    <select value={newJob.type} onChange={(e) => setNewJob({ ...newJob, type: e.target.value })} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-100" required>
                      <option value="">Select type</option>
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Contract">Contract</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">Location</label>
                    <input type="text" value={newJob.location} onChange={(e) => setNewJob({ ...newJob, location: e.target.value })} placeholder="e.g. General Santos City" className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-100" required />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">Experience</label>
                    <input type="text" value={newJob.experience} onChange={(e) => setNewJob({ ...newJob, experience: e.target.value })} placeholder="e.g. 3+ years" className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-100" required />
                  </div>
                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-semibold text-slate-700">Description</label>
                    <textarea value={newJob.description} onChange={(e) => setNewJob({ ...newJob, description: e.target.value })} placeholder="Describe the role..." rows={3} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-100" required />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">Deadline</label>
                    <input type="date" value={newJob.deadline} onChange={(e) => setNewJob({ ...newJob, deadline: e.target.value })} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-100" />
                  </div>
                </div>

                <button type="submit" className="mt-5 rounded-full bg-slate-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-700">Post job</button>
              </form>
            )}

            {loading ? (
              <div className="py-10 text-center text-slate-400">Loading jobs...</div>
            ) : jobs.length === 0 ? (
              <div className="py-10 text-center text-slate-400">No job postings yet.</div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-slate-200">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-500">
                    <tr>
                      <th className="px-5 py-4 font-semibold">Title</th>
                      <th className="px-5 py-4 font-semibold">Type</th>
                      <th className="px-5 py-4 font-semibold">Location</th>
                      <th className="px-5 py-4 font-semibold">Status</th>
                      <th className="px-5 py-4 font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jobs.map((job) => (
                      <tr key={job.id} className="border-t border-slate-200 bg-white">
                        <td className="px-5 py-4 font-semibold text-slate-800">{job.title}</td>
                        <td className="px-5 py-4 text-slate-600">{job.type}</td>
                        <td className="px-5 py-4 text-slate-600">{job.location}</td>
                        <td className="px-5 py-4"><span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">{job.status}</span></td>
                        <td className="px-5 py-4"><button onClick={() => handleDeleteJob(job.id)} className="text-sm font-semibold text-red-500 transition hover:text-red-700">Delete</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'messages' && (
          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.05)]">
            <h2 className="mb-5 text-2xl font-black text-slate-900">Messages and inquiries</h2>
            <Link to="/messages" className="rounded-full bg-gradient-to-r from-amber-500 to-orange-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-amber-500/25 transition hover:brightness-110">Open messages</Link>
          </div>
        )}
      </main>
    </div>
  )
}

export default AdminDashboard
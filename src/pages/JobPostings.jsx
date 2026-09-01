import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api'
import LogoutConfirmModal from '../components/LogoutConfirmModal'

function JobPostings() {
  const user = JSON.parse(localStorage.getItem('user'))
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [jobs, setJobs] = useState([])
  const [applied, setApplied] = useState([])
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState(null)
  const [showApplyForm, setShowApplyForm] = useState(null)
  const [coverLetter, setCoverLetter] = useState('')
  const [resume, setResume] = useState(null)
  const [portfolio, setPortfolio] = useState(null)
  const [applicationError, setApplicationError] = useState('')
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
        const [jobsRes, applicationsRes] = await Promise.all([
          api.get('/jobs'),
          api.get('/applications'),
        ])
        setJobs(jobsRes.data)
        setApplied(applicationsRes.data.map(a => a.job_posting_id))
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleApply = async (e, jobId) => {
    e.preventDefault()

    if (!resume || !portfolio) {
      setApplicationError('Please upload both your resume and portfolio before submitting the application.')
      return
    }

    const previousApplied = applied
    setApplying(jobId)
    setApplicationError('')
    setApplied(currentApplied => [...currentApplied, jobId])

    try {
      const formData = new FormData()
      formData.append('job_posting_id', jobId)
      formData.append('cover_letter', coverLetter)
      formData.append('resume', resume)
      formData.append('portfolio', portfolio)

      await api.post('/applications', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      setShowApplyForm(null)
      setCoverLetter('')
      setResume(null)
      setPortfolio(null)
    } catch (err) {
      console.error(err)
      setApplied(previousApplied)
      setApplicationError('Unable to submit application right now. Please try again.')
    } finally {
      setApplying(null)
    }
  }

  const filtered = jobs.filter(j =>
    j.title.toLowerCase().includes(search.toLowerCase()) ||
    j.location.toLowerCase().includes(search.toLowerCase())
  )

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
            <Link to="/architect/dashboard" className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-amber-400 hover:text-amber-600">Dashboard</Link>
            <button onClick={handleLogout} className="rounded-full bg-gradient-to-r from-amber-500 to-orange-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-amber-500/25 transition hover:brightness-110">Logout</button>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="mb-8 overflow-hidden rounded-[30px] bg-slate-900 px-6 py-8 text-white shadow-[0_30px_80px_rgba(15,23,42,0.2)] sm:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-200">Opportunities</p>
              <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Job postings</h1>
            </div>
            <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200">{filtered.length} roles available</div>
          </div>
        </section>

        <section className="mb-8 rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_18px_60px_rgba(15,23,42,0.05)] sm:p-6">
          <input type="text" placeholder="Search by job title or location..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-100" />
        </section>

        {loading ? (
          <div className="py-20 text-center text-slate-400">Loading jobs...</div>
        ) : filtered.length === 0 ? (
          <div className="rounded-[28px] border border-slate-200 bg-white p-12 text-center shadow-[0_18px_60px_rgba(15,23,42,0.05)]">
            <div className="text-5xl">🔍</div>
            <p className="mt-4 text-xl font-bold text-slate-900">No jobs found</p>
            <p className="mt-2 text-slate-500">Try another search term or clear your filters.</p>
            <button onClick={() => setSearch('')} className="mt-6 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-amber-500/25 transition hover:brightness-110">Clear search</button>
          </div>
        ) : (
          <div className="space-y-6">
            {filtered.map((job) => (
              <div key={job.id} className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.04)]">
                <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900">{job.title}</h2>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">{job.type}</span>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">📍 {job.location}</span>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">🏆 {job.experience}</span>
                    </div>
                  </div>
                  <div className="text-sm text-slate-500">Deadline: {job.deadline ? new Date(job.deadline).toLocaleDateString() : 'Open'}</div>
                </div>

                <p className="mb-5 text-sm leading-6 text-slate-600">{job.description}</p>

                {applied.includes(job.id) ? (
                  <button disabled className="rounded-full bg-green-100 px-5 py-2.5 text-sm font-bold text-green-700 cursor-not-allowed">✅ Applied</button>
                ) : showApplyForm === job.id ? (
                  <form onSubmit={(e) => handleApply(e, job.id)} className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                    <h3 className="mb-4 text-lg font-black text-slate-900">Apply for {job.title}</h3>

                    <div className="space-y-4">
                      {applicationError && (
                        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">{applicationError}</div>
                      )}

                      <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700">Cover letter</label>
                        <textarea value={coverLetter} onChange={(e) => setCoverLetter(e.target.value)} placeholder="Tell us why you're a great fit..." rows={4} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-100" />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700">Resume (PDF)</label>
                        <input type="file" accept=".pdf,.doc,.docx" required onChange={(e) => setResume(e.target.files[0])} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-100" />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700">Portfolio</label>
                        <input type="file" accept=".pdf,.jpg,.jpeg,.png,.zip" required onChange={(e) => setPortfolio(e.target.files[0])} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-100" />
                      </div>
                    </div>

                    <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                      <button type="submit" disabled={applying === job.id} className="flex-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-amber-500/25 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60">{applying === job.id ? 'Submitting...' : 'Submit application'}</button>
                      <button type="button" onClick={() => setShowApplyForm(null)} className="flex-1 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:border-amber-400 hover:text-amber-600">Cancel</button>
                    </div>
                  </form>
                ) : (
                  <button onClick={() => setShowApplyForm(job.id)} className="rounded-full bg-gradient-to-r from-amber-500 to-orange-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-amber-500/25 transition hover:brightness-110">Apply now</button>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

export default JobPostings
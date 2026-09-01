import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api'

const projectCarousel = [
  {
    title: 'Modern Villa',
    year: '2023',
    desc: 'A premium hillside residence designed around natural light, texture, and family living.',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Commercial Complex',
    year: '2022',
    desc: 'A contemporary urban workspace balancing functionality, branding, and community flow.',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Green Office',
    year: '2021',
    desc: 'A sustainable workplace shaped by natural ventilation, wellness, and filtered daylight.',
    image: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80',
  },
]

const defaultArchitectPhotos = [
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=700&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=700&q=80',
  'https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=700&q=80',
]

function LandingPage() {
  const user = JSON.parse(localStorage.getItem('user'))
  const navigate = useNavigate()
  const [hiringStatus, setHiringStatus] = useState(false)
  const [architects, setArchitects] = useState([])
  const [activeWork, setActiveWork] = useState(0)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [hiringRes, architectsRes] = await Promise.all([
          api.get('/hiring-status'),
          api.get('/architects'),
        ])
        setHiringStatus(hiringRes.data.is_hiring)
        const enriched = (architectsRes.data || []).map((member, index) => ({
          ...member,
          photo: member.photo || member.avatar || defaultArchitectPhotos[index % defaultArchitectPhotos.length],
        }))
        setArchitects(enriched)
      } catch (err) {
        console.error(err)
      }
    }
    fetchData()
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveWork((current) => (current + 1) % projectCarousel.length)
    }, 4500)
    return () => clearInterval(interval)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/')
  }

  const getDashboardLink = () => {
    if (!user) return '/login'
    if (user.role === 'client') return '/client/dashboard'
    if (user.role === 'architect') return '/architect/dashboard'
    if (user.role === 'admin') return '/admin/dashboard'
  }

  const handlePrimaryAction = () => {
    if (!user) return navigate('/register')
    if (user.role === 'client') return navigate('/client/browse')
    if (user.role === 'architect') return navigate('/architect/jobs')
    return navigate('/admin/dashboard')
  }

  const currentProject = projectCarousel[activeWork]

  return (
    <div className="min-h-screen bg-[#f5f1ea] text-slate-800">
      <nav className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/75 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-lg font-black text-white shadow-lg shadow-amber-500/20">
              S
            </div>
            <div className="text-lg font-black tracking-tight text-slate-900">
              SMH <span className="text-amber-600">SmartHireArch</span>
            </div>
          </div>

          <div className="hidden items-center gap-8 md:flex">
            <a href="#about" className="text-sm font-medium text-slate-600 transition hover:text-amber-600">About</a>
            <a href="#team" className="text-sm font-medium text-slate-600 transition hover:text-amber-600">Our Team</a>
            <a href="#works" className="text-sm font-medium text-slate-600 transition hover:text-amber-600">Our Works</a>
            <a href="#contact" className="text-sm font-medium text-slate-600 transition hover:text-amber-600">Contact</a>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                <span className="hidden text-sm font-medium text-slate-600 lg:inline">Welcome, {user.name}!</span>
                <Link to={getDashboardLink()} className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-amber-400 hover:text-amber-600">My Dashboard</Link>
                <button onClick={handleLogout} className="rounded-full bg-gradient-to-r from-amber-500 to-orange-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-amber-500/25 transition hover:brightness-110">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-amber-400 hover:text-amber-600">Login</Link>
                <Link to="/register" className="rounded-full bg-gradient-to-r from-amber-500 to-orange-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-amber-500/25 transition hover:brightness-110">Get Started</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <section className="relative overflow-hidden bg-slate-900 px-4 pb-20 pt-16 text-white sm:px-6 lg:px-8">
        <div className="absolute -left-16 top-20 h-64 w-64 rounded-full bg-amber-500/20 blur-3xl" />
        <div className="absolute -right-16 bottom-0 h-64 w-64 rounded-full bg-orange-500/20 blur-3xl" />

        <div className="mx-auto grid max-w-7xl items-center gap-10 py-14 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="relative z-10">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-200">
              Architecture marketplace
            </div>
            <h1 className="max-w-xl text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
              Find the right architect for your next vision.
            </h1>
            <p className="mt-5 max-w-lg text-lg text-slate-300">
              Connect with vetted professionals, discover trusted talent, and bring exceptional design ideas to life with confidence.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <button onClick={handlePrimaryAction} className="rounded-full bg-amber-400 px-6 py-3 text-sm font-bold text-slate-900 shadow-lg shadow-amber-500/30 transition hover:bg-amber-300">Hire an architect</button>
              <Link to={user ? getDashboardLink() : '/register'} className="rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/10">Join as architect</Link>
            </div>
          </div>

          <div className="relative z-10 rounded-[30px] border border-white/10 bg-white/5 p-5 backdrop-blur-md">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-slate-300">Trusted platform</p>
              <span className="rounded-full bg-emerald-500/20 px-2 py-1 text-xs font-semibold text-emerald-300">Live</span>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl bg-white/5 p-4">
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Vetted designers</div>
                <div className="mt-2 text-3xl font-black text-white">{architects.length}</div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-white/5 p-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Projects</div>
                  <div className="mt-2 text-2xl font-black text-white">250+</div>
                </div>
                <div className="rounded-2xl bg-white/5 p-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Clients</div>
                  <div className="mt-2 text-2xl font-black text-white">1200+</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="about" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-600">About us</p>
          <h2 className="mt-3 text-3xl font-black text-slate-900 sm:text-4xl">Connecting bold ideas with expert architects.</h2>
          <p className="mx-auto mt-5 max-w-3xl text-lg text-slate-600">We help clients find the right design talent and support architects in growing their business, building trust, and securing the next opportunity.</p>
        </div>
      </section>

      {hiringStatus && (
        <section className="bg-gradient-to-r from-amber-500 to-orange-600 py-6 text-center">
          <p className="text-lg font-bold text-white">
            🏛️ We are currently hiring — <button onClick={() => navigate(user ? getDashboardLink() : '/register')} className="underline">Apply now</button>
          </p>
        </section>
      )}

      <section id="team" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-600">Our team</p>
          <h2 className="mt-3 text-3xl font-black text-slate-900">Meet the specialists behind the platform</h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {architects.length === 0 ? (
            <div className="col-span-full py-10 text-center text-slate-400">No team members yet.</div>
          ) : (
            architects.slice(0, 3).map((member) => (
              <div key={member.id} className="overflow-hidden rounded-[28px] border border-slate-200 bg-white text-center shadow-[0_18px_60px_rgba(15,23,42,0.05)]">
                <img src={member.photo} alt={member.name} className="h-64 w-full object-cover" />
                <div className="p-6">
                  <h3 className="text-xl font-black text-slate-900">{member.name}</h3>
                  <p className="mt-2 text-sm font-semibold text-amber-600">{member.architect_profile?.specialization || 'Architect'}</p>
                  <p className="mt-2 text-sm text-slate-500">{member.architect_profile?.years_of_experience || 0} years of experience</p>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <section id="works" className="bg-white px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-600">Our work</p>
            <h2 className="mt-3 text-3xl font-black text-slate-900">Signature projects and achievements</h2>
          </div>

          <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-slate-50 shadow-[0_18px_60px_rgba(15,23,42,0.04)]">
            <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
              <div className="relative min-h-[440px]">
                <img src={currentProject.image} alt={currentProject.title} className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/75 via-slate-900/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-200">{currentProject.year}</p>
                  <h3 className="mt-2 text-3xl font-black">{currentProject.title}</h3>
                  <p className="mt-3 max-w-xl text-sm text-slate-200">{currentProject.desc}</p>
                </div>
              </div>

              <div className="flex flex-col justify-center bg-white p-6">
                <div className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Project gallery</div>
                <div className="space-y-3">
                  {projectCarousel.map((project, index) => (
                    <button
                      key={project.title}
                      onClick={() => setActiveWork(index)}
                      className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition ${activeWork === index ? 'border-amber-400 bg-amber-50' : 'border-slate-200 bg-slate-50 hover:border-slate-300'}`}
                    >
                      <img src={project.image} alt={project.title} className="h-16 w-20 rounded-xl object-cover" />
                      <div>
                        <div className="text-sm font-black text-slate-900">{project.title}</div>
                        <div className="text-xs text-slate-500">{project.year}</div>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="mt-6 flex items-center justify-between">
                  <button onClick={() => setActiveWork((activeWork - 1 + projectCarousel.length) % projectCarousel.length)} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:border-amber-400 hover:text-amber-600">Previous</button>
                  <button onClick={() => setActiveWork((activeWork + 1) % projectCarousel.length)} className="rounded-full bg-slate-900 px-4 py-2 text-sm font-bold text-white transition hover:bg-slate-700">Next</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="contact" className="bg-slate-900 px-4 py-20 text-center text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-300">Contact</p>
          <h2 className="mt-3 text-3xl font-black">Let’s build something exceptional.</h2>
          <div className="mt-8 space-y-2 text-slate-300">
            <p>📧 contact@smharchportal.com</p>
            <p>📞 +63 912 500 6254</p>
            <p>📍 Davao City, Philippines</p>
          </div>
        </div>
      </section>

      <footer className="bg-slate-950 px-4 py-5 text-center text-sm text-slate-400 sm:px-6 lg:px-8">
        © 2025 SMH SmartHireArch. All rights reserved.
      </footer>
    </div>
  )
}

export default LandingPage
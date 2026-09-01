import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import api from '../api'

const fallbackArchitectPhotos = [
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1556157382-97eda2d62296?auto=format&fit=crop&w=1200&q=80',
]

const defaultPortfolio = [
  {
    title: 'Modern Coastal Villa',
    description: 'Luxury family residence with layered outdoor spaces and warm natural textures.',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Skyline Residence',
    description: 'Urban high-rise apartment redesign focused on daylight, flow, and calm interiors.',
    image: 'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Boutique Commercial Space',
    description: 'A premium retail environment designed to elevate the brand experience.',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Garden Courtyard Home',
    description: 'An indoor-outdoor living concept that blends structure, greenery, and light.',
    image: 'https://images.unsplash.com/photo-1448630360428-65456885c650?auto=format&fit=crop&w=1200&q=80',
  },
]

function ArchitectDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [architect, setArchitect] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showConsultation, setShowConsultation] = useState(false)
  const [consultation, setConsultation] = useState({
    name: '',
    email: '',
    projectType: 'Residential',
    date: '',
    time: '09:00',
    message: '',
  })
  const [bookingSent, setBookingSent] = useState(false)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [reviewForm, setReviewForm] = useState({
    name: '',
    role: 'Client',
    rating: 5,
    comment: '',
  })

  useEffect(() => {
    const fetchArchitect = async () => {
      try {
        const res = await api.get('/architects')
        const found = (res.data || []).find((item) => String(item.id) === String(id))

        if (found) {
          const profile = found.architect_profile || {}
          const galleryImages = Array.isArray(profile.gallery_images)
            ? profile.gallery_images
            : typeof profile.gallery_images === 'string'
              ? profile.gallery_images.split(',').map((image) => image.trim()).filter(Boolean)
              : Array.isArray(profile.gallery_urls)
                ? profile.gallery_urls
                : []

          const imageList = galleryImages.length ? galleryImages : defaultPortfolio.map((item) => item.image)

          setArchitect({
            ...found,
            photo: found.photo || found.avatar || profile.photo_url || fallbackArchitectPhotos[(Number(found.id) || 0) % fallbackArchitectPhotos.length],
            galleryImages: imageList,
            profile: {
              ...profile,
              portfolio: profile.portfolio || 'Portfolio details coming soon.',
              awards: profile.awards || 'Professional design experience and project delivery.',
            },
          })
        } else {
          setArchitect(null)
        }
      } catch (err) {
        console.error(err)
        setArchitect(null)
      } finally {
        setLoading(false)
      }
    }

    fetchArchitect()
  }, [id])

  const handleHire = () => {
    navigate(`/messages?contact=${architect.id}`)
  }

  const handleConsultationSubmit = async (event) => {
    event.preventDefault()

    const storedUser = JSON.parse(localStorage.getItem('user'))
    const bookingRequest = {
      architect_id: Number(id),
      name: consultation.name || storedUser?.name || 'Client',
      email: consultation.email,
      project_type: consultation.projectType,
      preferred_date: consultation.date,
      preferred_time: consultation.time,
      message: consultation.message,
    }

    try {
      await api.post('/consultations', bookingRequest)
    } catch (err) {
      console.error(err)
      const storageKey = `architect_consultations_${id}`
      const existing = JSON.parse(localStorage.getItem(storageKey) || 'null')
      const nextBookings = existing && Array.isArray(existing) ? [...existing, bookingRequest] : [bookingRequest]
      localStorage.setItem(storageKey, JSON.stringify(nextBookings))
    }

    setBookingSent(true)
    setShowConsultation(false)
    setTimeout(() => setBookingSent(false), 3500)
  }

  const handleReviewSubmit = async (event) => {
    event.preventDefault()

    const storedUser = JSON.parse(localStorage.getItem('user'))
    const newReview = {
      architect_id: Number(id),
      name: reviewForm.name || storedUser?.name || 'Client',
      role: reviewForm.role || 'Client',
      rating: Number(reviewForm.rating),
      comment: reviewForm.comment.trim(),
    }

    try {
      const response = await api.post('/reviews', newReview)
      const savedReview = response?.data || newReview

      const storageKey = `architect_reviews_${id}`
      const existing = JSON.parse(localStorage.getItem(storageKey) || 'null')
      const nextReviews = (Array.isArray(existing) && existing.length ? existing : [
        {
          name: 'Maria Santos',
          role: 'Homeowner',
          rating: 5,
          comment: 'The design process was thoughtful, transparent, and highly collaborative. The final plan exceeded our expectations.',
        },
        {
          name: 'Daniel Cruz',
          role: 'Developer',
          rating: 5,
          comment: 'Professional communication and excellent design quality from concept to execution. We felt supported throughout.',
        },
        {
          name: 'Rina Gomez',
          role: 'Boutique Brand Owner',
          rating: 4,
          comment: 'Great attention to detail and a strong understanding of how to make a space both functional and memorable.',
        },
      ])

      const mergedReviews = [...nextReviews, savedReview]
      localStorage.setItem(storageKey, JSON.stringify(mergedReviews))
      setReviewForm({ name: '', role: 'Client', rating: 5, comment: '' })
      setShowReviewForm(false)
    } catch (err) {
      console.error(err)
      const storageKey = `architect_reviews_${id}`
      const existing = JSON.parse(localStorage.getItem(storageKey) || 'null')
      const fallbackReviews = existing && Array.isArray(existing) && existing.length ? existing : [
        {
          name: 'Maria Santos',
          role: 'Homeowner',
          rating: 5,
          comment: 'The design process was thoughtful, transparent, and highly collaborative. The final plan exceeded our expectations.',
        },
        {
          name: 'Daniel Cruz',
          role: 'Developer',
          rating: 5,
          comment: 'Professional communication and excellent design quality from concept to execution. We felt supported throughout.',
        },
        {
          name: 'Rina Gomez',
          role: 'Boutique Brand Owner',
          rating: 4,
          comment: 'Great attention to detail and a strong understanding of how to make a space both functional and memorable.',
        },
      ]

      const mergedReviews = [...fallbackReviews, newReview]
      localStorage.setItem(storageKey, JSON.stringify(mergedReviews))
      setReviewForm({ name: '', role: 'Client', rating: 5, comment: '' })
      setShowReviewForm(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f1ea] text-slate-500">
        Loading architect profile...
      </div>
    )
  }

  if (!architect) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f1ea] text-slate-500">
        Architect not found.
      </div>
    )
  }

  const profile = architect.architect_profile || {}
  const galleryImages = architect.galleryImages && architect.galleryImages.length ? architect.galleryImages : defaultPortfolio.map((item) => item.image)

  const storedReviews = JSON.parse(localStorage.getItem(`architect_reviews_${id}`) || 'null')
  const reviews = Array.isArray(storedReviews) && storedReviews.length ? storedReviews : [
    {
      name: 'Maria Santos',
      role: 'Homeowner',
      rating: 5,
      comment: 'The design process was thoughtful, transparent, and highly collaborative. The final plan exceeded our expectations.',
    },
    {
      name: 'Daniel Cruz',
      role: 'Developer',
      rating: 5,
      comment: 'Professional communication and excellent design quality from concept to execution. We felt supported throughout.',
    },
    {
      name: 'Rina Gomez',
      role: 'Boutique Brand Owner',
      rating: 4,
      comment: 'Great attention to detail and a strong understanding of how to make a space both functional and memorable.',
    },
  ]

  const averageRating = (reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / reviews.length).toFixed(1)

  return (
    <div className="min-h-screen bg-[#f5f1ea] text-slate-800">
      {bookingSent && (
        <div className="fixed inset-x-0 top-5 z-50 mx-auto w-[min(92vw,500px)] rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 shadow-lg shadow-emerald-100">
          Consultation request sent successfully. The architect will contact you shortly.
        </div>
      )}

      {showConsultation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="w-full max-w-xl rounded-[30px] bg-white p-6 shadow-[0_30px_80px_rgba(15,23,42,0.25)] sm:p-8">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-600">Book a consultation</p>
                <h2 className="mt-2 text-2xl font-black text-slate-900">Schedule with {architect.name}</h2>
              </div>
              <button onClick={() => setShowConsultation(false)} className="text-3xl text-slate-400 transition hover:text-slate-600">×</button>
            </div>

            <form onSubmit={handleConsultationSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Full name</label>
                  <input type="text" value={consultation.name} onChange={(event) => setConsultation({ ...consultation, name: event.target.value })} required className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-100" />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Email</label>
                  <input type="email" value={consultation.email} onChange={(event) => setConsultation({ ...consultation, email: event.target.value })} required className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-100" />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Project type</label>
                  <select value={consultation.projectType} onChange={(event) => setConsultation({ ...consultation, projectType: event.target.value })} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-100">
                    <option>Residential</option>
                    <option>Commercial</option>
                    <option>Interior</option>
                    <option>Landscape</option>
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Preferred date</label>
                  <input type="date" value={consultation.date} onChange={(event) => setConsultation({ ...consultation, date: event.target.value })} required className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-100" />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Preferred time</label>
                <input type="time" value={consultation.time} onChange={(event) => setConsultation({ ...consultation, time: event.target.value })} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-100" />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Project brief</label>
                <textarea value={consultation.message} onChange={(event) => setConsultation({ ...consultation, message: event.target.value })} rows={4} placeholder="Tell us about your project goals, timeline, and requirements..." className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-100" />
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button type="submit" className="flex-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-amber-500/25 transition hover:brightness-110">Confirm booking</button>
                <button type="button" onClick={() => setShowConsultation(false)} className="flex-1 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:border-amber-400 hover:text-amber-600">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showReviewForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="w-full max-w-xl rounded-[30px] bg-white p-6 shadow-[0_30px_80px_rgba(15,23,42,0.25)] sm:p-8">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-600">Submit review</p>
                <h2 className="mt-2 text-2xl font-black text-slate-900">Rate {architect.name}</h2>
              </div>
              <button onClick={() => setShowReviewForm(false)} className="text-3xl text-slate-400 transition hover:text-slate-600">×</button>
            </div>

            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Your name</label>
                  <input type="text" value={reviewForm.name} onChange={(event) => setReviewForm({ ...reviewForm, name: event.target.value })} placeholder="Your name" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-100" />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Role</label>
                  <input type="text" value={reviewForm.role} onChange={(event) => setReviewForm({ ...reviewForm, role: event.target.value })} placeholder="Client, Homeowner..." className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-100" />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Your rating</label>
                <div className="flex gap-2 text-3xl text-amber-500">
                  {[1,2,3,4,5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                      className={star <= reviewForm.rating ? 'text-amber-500' : 'text-slate-300'}
                      aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Review</label>
                <textarea value={reviewForm.comment} onChange={(event) => setReviewForm({ ...reviewForm, comment: event.target.value })} rows={5} placeholder="Share your experience working with this architect..." required className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-100" />
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button type="submit" className="flex-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-amber-500/25 transition hover:brightness-110">Submit review</button>
                <button type="button" onClick={() => setShowReviewForm(false)} className="flex-1 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:border-amber-400 hover:text-amber-600">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="absolute inset-x-0 top-0 -z-10 h-[260px] bg-[radial-gradient(circle_at_top_left,_rgba(245,158,11,0.22),_transparent_35%),radial-gradient(circle_at_top_right,_rgba(15,23,42,0.12),_transparent_30%)]" />

      <nav className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/75 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-lg font-black text-white shadow-lg shadow-amber-500/20">S</div>
            <div className="text-lg font-black tracking-tight text-slate-900">SMH <span className="text-amber-600">SmartHireArch</span></div>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/client/browse" className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-amber-400 hover:text-amber-600">Browse</Link>
            <Link to="/client/dashboard" className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-amber-400 hover:text-amber-600">Dashboard</Link>
            <button onClick={handleHire} className="rounded-full bg-gradient-to-r from-amber-500 to-orange-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-amber-500/25 transition hover:brightness-110">Hire now</button>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_20px_70px_rgba(15,23,42,0.06)]">
          <div className="grid gap-0 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="relative min-h-[420px]">
              <img src={architect.photo} alt={architect.name} className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 via-slate-900/35 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                <div className="mb-2 inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-200">Verified architect</div>
                <h1 className="text-3xl font-black sm:text-5xl">{architect.name}</h1>
                <p className="mt-2 text-sm font-medium text-slate-200">{profile.specialization || 'Architect'} • {profile.years_of_experience || 0} years experience</p>
              </div>
            </div>

            <div className="p-6 sm:p-8">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-600">Professional profile</p>
                  <h2 className="mt-2 text-3xl font-black text-slate-900">About the architect</h2>
                </div>
                <div className="rounded-full bg-amber-100 px-3 py-1 text-sm font-bold text-amber-700">⭐ 4.9</div>
              </div>

              <p className="text-base leading-7 text-slate-600">{profile.bio || 'No bio added yet, but this professional is ready to bring vision and structure to your next project.'}</p>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Specialty</div>
                  <div className="mt-2 text-lg font-black text-slate-900">{profile.specialization || 'General Architecture'}</div>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Experience</div>
                  <div className="mt-2 text-lg font-black text-slate-900">{profile.years_of_experience || 0} Years</div>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Location</div>
                  <div className="mt-2 text-lg font-black text-slate-900">{profile.location || 'Available worldwide'}</div>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Availability</div>
                  <div className="mt-2 text-lg font-black text-emerald-600">Open for projects</div>
                </div>
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <button onClick={() => setShowConsultation(true)} className="flex-1 rounded-full border border-amber-300 bg-amber-50 px-6 py-3 text-sm font-bold text-amber-700 transition hover:bg-amber-100">Book consultation</button>
                <button onClick={handleHire} className="flex-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-amber-500/25 transition hover:brightness-110">Hire this architect</button>
                <Link to="/client/browse" className="flex-1 rounded-full border border-slate-200 bg-white px-6 py-3 text-center text-sm font-bold text-slate-700 transition hover:border-amber-400 hover:text-amber-600">Back to directory</Link>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-10 rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.05)] sm:p-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-600">Portfolio</p>
              <h2 className="mt-2 text-3xl font-black text-slate-900">Recent work</h2>
            </div>
            <div className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-600">{galleryImages.length} projects</div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {galleryImages.map((image, index) => (
              <div key={`${image}-${index}`} className="overflow-hidden rounded-[26px] border border-slate-200 bg-slate-50 shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/70">
                <img src={image} alt={`${architect.name} project ${index + 1}`} className="h-52 w-full object-cover" />
                <div className="p-4">
                  <h3 className="text-lg font-black text-slate-900">{defaultPortfolio[index]?.title || `Project ${index + 1}`}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{defaultPortfolio[index]?.description || profile.portfolio || 'A featured project demonstrating thoughtful design and execution.'}</p>
                </div>
              </div>
            ))}
          </div>

          {(profile.awards || profile.portfolio) && (
            <div className="mt-8 grid gap-6 md:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-5">
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Achievements</div>
                <div className="mt-3 text-base leading-7 text-slate-700">{profile.awards || 'Award-winning design practice and project delivery excellence.'}</div>
              </div>
              <div className="rounded-2xl bg-slate-50 p-5">
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Highlights</div>
                <div className="mt-3 text-base leading-7 text-slate-700">{profile.portfolio || 'Portfolio highlights and architectural work delivered across residential, commercial, and interior design projects.'}</div>
              </div>
            </div>
          )}
        </section>

        <section className="mt-10 rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.05)] sm:p-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-600">Client feedback</p>
              <h2 className="mt-2 text-3xl font-black text-slate-900">Reviews & ratings</h2>
            </div>
            <button onClick={() => setShowReviewForm(true)} className="rounded-full bg-gradient-to-r from-amber-500 to-orange-600 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-amber-500/25 transition hover:brightness-110">Leave a review</button>
          </div>

          <div className="mb-5 flex items-center justify-between">
            <div className="rounded-full bg-amber-100 px-3 py-1 text-sm font-bold text-amber-700">⭐ {averageRating}</div>
            <div className="text-sm text-slate-500">{reviews.length} total reviews</div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[0.6fr_1.4fr]">
            <div className="rounded-[28px] bg-slate-50 p-5">
              <div className="text-5xl font-black text-slate-900">{averageRating}</div>
              <div className="mt-2 flex text-2xl text-amber-500">
                {'★★★★★'}
              </div>
              <p className="mt-3 text-sm text-slate-500">Based on {reviews.length} client reviews</p>
            </div>

            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={`${review.name}-${review.role}`} className="rounded-[24px] border border-slate-200 bg-white p-5">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div>
                      <div className="text-lg font-black text-slate-900">{review.name}</div>
                      <div className="text-sm text-slate-500">{review.role}</div>
                    </div>
                    <div className="text-lg text-amber-500">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</div>
                  </div>
                  <p className="text-sm leading-7 text-slate-600">“{review.comment}”</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default ArchitectDetail

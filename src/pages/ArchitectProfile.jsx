import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import api from '../api'
import LogoutConfirmModal from '../components/LogoutConfirmModal'

const defaultProfileImage = 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=1200&q=80'

function ArchitectProfile() {
  const user = JSON.parse(localStorage.getItem('user'))
  const navigate = useNavigate()
  const routerLocation = useLocation()
  const queryParams = new URLSearchParams(routerLocation.search)
  const selectedArchitectId = queryParams.get('architectId')
  const isAdmin = user?.role === 'admin'
  const isAdminEditingArchitect = isAdmin && selectedArchitectId
  const targetArchitectId = isAdminEditingArchitect ? Number(selectedArchitectId) : Number(user?.id)

  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(user?.name || '')
  const [photoUrl, setPhotoUrl] = useState(defaultProfileImage)
  const [profileFile, setProfileFile] = useState(null)
  const [galleryUrls, setGalleryUrls] = useState('')
  const [bio, setBio] = useState('')
  const [specialization, setSpecialization] = useState('')
  const [experience, setExperience] = useState('')
  const [location, setLocation] = useState('')
  const [serviceAreas, setServiceAreas] = useState('')
  const [awards, setAwards] = useState('')
  const [portfolio, setPortfolio] = useState('')
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [loading, setLoading] = useState(true)

  const handleLogout = () => {
    setShowLogoutModal(true)
  }

  const confirmLogout = () => {
    setShowLogoutModal(false)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/')
  }

  const applyProfileData = (profileData) => {
    const profile = profileData || {}
    const userProfile = profile.architect_profile || profile

    setName(userProfile.name || profile.name || user?.name || '')
    setPhotoUrl(userProfile.photo_url || userProfile.profile_photo || userProfile.photo || profile.photo_url || profile.profile_photo || profile.photo || defaultProfileImage)
    setGalleryUrls(Array.isArray(userProfile.gallery_images)
      ? userProfile.gallery_images.join(',')
      : Array.isArray(profile.gallery_images)
        ? profile.gallery_images.join(',')
        : typeof userProfile.gallery_images === 'string'
          ? userProfile.gallery_images
          : typeof profile.gallery_images === 'string'
            ? profile.gallery_images
            : userProfile.gallery_urls || profile.gallery_urls || '')
    setBio(userProfile.bio || profile.bio || '')
    setSpecialization(userProfile.specialization || profile.specialization || '')
    setExperience(userProfile.years_of_experience ?? profile.years_of_experience ?? '')
    setLocation(userProfile.location || profile.location || '')
    setServiceAreas(userProfile.service_areas || profile.service_areas || userProfile.services || profile.services || '')
    setAwards(userProfile.awards || profile.awards || '')
    setPortfolio(userProfile.portfolio || profile.portfolio || '')
  }

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (isAdminEditingArchitect) {
          const usersRes = await api.get('/users')
          const userList = Array.isArray(usersRes.data) ? usersRes.data : []
          const architect = userList.find((entry) => Number(entry.id) === Number(selectedArchitectId))
          const profile = architect?.architect_profile || architect?.architectProfile || {}

          applyProfileData({ ...architect, ...profile })
          return
        }

        const res = await api.get('/architect-profile')
        if (res.data) {
          applyProfileData(res.data)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [user?.name, isAdminEditingArchitect, selectedArchitectId])

  const handleSave = async (e) => {
    e.preventDefault()
    try {
      const cleanedGallery = galleryUrls
        .split(',')
        .map((url) => url.trim())
        .filter(Boolean)

      const formData = new FormData()
      formData.append('name', name)
      formData.append('gallery_images', JSON.stringify(cleanedGallery))
      formData.append('bio', bio)
      formData.append('specialization', specialization)
      formData.append('years_of_experience', experience)
      formData.append('location', location)
      formData.append('service_areas', serviceAreas)
      formData.append('awards', awards)
      formData.append('portfolio', portfolio)

      if (profileFile) {
        formData.append('profile_photo', profileFile)
      } else if (photoUrl && photoUrl !== defaultProfileImage) {
        formData.append('photo_url', photoUrl)
      }

      const endpoint = isAdminEditingArchitect && targetArchitectId
        ? `/admin/architect-profile/${targetArchitectId}`
        : '/architect-profile'

      const response = await api.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      applyProfileData(response.data)
      setSuccess('Profile updated successfully!')
      setEditing(false)
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError('Failed to update profile. Please try again.')
    }
  }

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    setProfileFile(file)

    const reader = new FileReader()
    reader.onload = () => {
      setPhotoUrl(reader.result)
    }
    reader.readAsDataURL(file)
  }

  const handleGalleryUpload = (event) => {
    const files = Array.from(event.target.files || [])
    if (!files.length) return

    Promise.all(
      files.map((file) => new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result)
        reader.onerror = reject
        reader.readAsDataURL(file)
      }))
    )
      .then((images) => {
        const existing = galleryUrls
          .split(',')
          .map((url) => url.trim())
          .filter(Boolean)

        setGalleryUrls([...existing, ...images].join(', '))
      })
      .catch(() => setError('One or more images could not be uploaded.'))
  }

  const canEdit = user?.role === 'architect' || isAdmin
  const parsedGallery = galleryUrls
    .split(',')
    .map((url) => url.trim())
    .filter(Boolean)

  return (
    <div className="min-h-screen bg-[#f5f1ea] text-slate-800">
      <div className="absolute inset-x-0 top-0 -z-10 h-[260px] bg-[radial-gradient(circle_at_top_left,_rgba(245,158,11,0.22),_transparent_35%),radial-gradient(circle_at_top_right,_rgba(15,23,42,0.14),_transparent_30%)]" />

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
            {user?.role === 'architect' && <Link to="/architect/dashboard" className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-amber-400 hover:text-amber-600">Dashboard</Link>}
            {user?.role === 'admin' && <Link to="/admin/dashboard" className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-amber-400 hover:text-amber-600">Dashboard</Link>}
            <button onClick={handleLogout} className="rounded-full bg-gradient-to-r from-amber-500 to-orange-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-amber-500/25 transition hover:brightness-110">Logout</button>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {success && (<div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">✅ {success}</div>)}
        {error && (<div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">{error}</div>)}

        <section className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.05)] sm:p-8">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-600">Portfolio</p>
              <h1 className="mt-2 text-3xl font-black text-slate-900">{isAdmin ? 'Architect profile management' : 'My profile'}</h1>
            </div>

            {canEdit && (
              <button onClick={() => setEditing(!editing)} className="rounded-full border border-amber-400 bg-amber-50 px-4 py-2 text-sm font-bold text-amber-700 transition hover:bg-amber-100">{editing ? 'Cancel' : 'Edit profile'}</button>
            )}
          </div>

          <div className="mb-8 overflow-hidden rounded-[28px] bg-slate-50 p-5">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <img src={photoUrl || defaultProfileImage} alt={name || user?.name} className="h-24 w-24 rounded-2xl object-cover shadow-lg" />
              <div>
                <div className="text-2xl font-black text-slate-900">{name || user?.name}</div>
                <div className="text-sm font-semibold text-amber-600">{isAdmin ? 'Admin-managed architect profile' : 'Architect'}</div>
                <div className="text-sm text-slate-500">{user?.email}</div>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="py-10 text-center text-slate-400">Loading profile...</div>
          ) : editing && canEdit ? (
            <form onSubmit={handleSave} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Architect name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-100" />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Profile image</label>
                <div className="space-y-3">
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-full file:border-0 file:bg-amber-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-amber-700 hover:file:bg-amber-200" />
                  <input type="url" value={photoUrl} onChange={(e) => setPhotoUrl(e.target.value)} placeholder="Or paste an image URL" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-100" />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Gallery images</label>
                <div className="space-y-3">
                  <input type="file" accept="image/*" multiple onChange={handleGalleryUpload} className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-full file:border-0 file:bg-slate-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-slate-700 hover:file:bg-slate-200" />
                  <textarea value={galleryUrls} onChange={(e) => setGalleryUrls(e.target.value)} rows={3} placeholder="Or paste image URLs separated by commas" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-100" />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Bio</label>
                <textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell clients about yourself..." rows={4} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-100" />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Specialization</label>
                <input type="text" value={specialization} onChange={(e) => setSpecialization(e.target.value)} placeholder="e.g. Residential, Commercial, Interior Design" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-100" />
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Years of experience</label>
                  <input type="number" value={experience} onChange={(e) => setExperience(e.target.value)} placeholder="e.g. 5" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-100" />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Location</label>
                  <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Davao City" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-100" />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Service areas</label>
                <input type="text" value={serviceAreas} onChange={(e) => setServiceAreas(e.target.value)} placeholder="e.g. Residential, Commercial, Interior styling" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-100" />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Awards & recognitions</label>
                <textarea value={awards} onChange={(e) => setAwards(e.target.value)} rows={3} placeholder="Add awards, certificates, or notable recognitions..." className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-100" />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Portfolio summary</label>
                <textarea value={portfolio} onChange={(e) => setPortfolio(e.target.value)} rows={3} placeholder="Briefly describe significant projects and portfolio highlights..." className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-100" />
              </div>

              <button type="submit" className="w-full rounded-full bg-gradient-to-r from-amber-500 to-orange-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-amber-500/25 transition hover:brightness-110">Save changes</button>
            </form>
          ) : (
            <div className="space-y-5">
              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Bio</div>
                <div className="mt-2 text-slate-700">{bio || 'No bio added yet.'}</div>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Specialization</div>
                <div className="mt-2 text-slate-700">{specialization || 'Not specified yet.'}</div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Years of experience</div>
                  <div className="mt-2 text-slate-700">{experience ? `${experience} years` : 'Not specified yet.'}</div>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Location</div>
                  <div className="mt-2 text-slate-700">{location || 'Not specified yet.'}</div>
                </div>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Service areas</div>
                <div className="mt-2 text-slate-700">{serviceAreas || 'Not specified yet.'}</div>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Awards & recognitions</div>
                <div className="mt-2 text-slate-700">{awards || 'No awards entered yet.'}</div>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Portfolio summary</div>
                <div className="mt-2 text-slate-700">{portfolio || 'No portfolio summary entered yet.'}</div>
              </div>

              {parsedGallery.length > 0 && (
                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Gallery</div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {parsedGallery.map((image, index) => (
                      <img key={`${image}-${index}`} src={image} alt={`${name || user?.name} portfolio ${index + 1}`} className="h-32 w-full rounded-2xl object-cover shadow-sm" />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

export default ArchitectProfile
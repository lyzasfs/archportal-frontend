import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import api from '../api'
import LogoutConfirmModal from '../components/LogoutConfirmModal'

function MessagingPage() {
  const user = JSON.parse(localStorage.getItem('user'))
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [users, setUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
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
    const fetchUsers = async () => {
      try {
        const res = await api.get('/users')
        const otherUsers = user.role === 'admin'
          ? res.data.filter(u => u.id !== user.id)
          : res.data.filter(u => u.role === 'admin')
        setUsers(otherUsers)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchUsers()
  }, [])

  useEffect(() => {
    if (selectedUser) {
      fetchConversation(selectedUser.id)
    }
  }, [selectedUser])

  useEffect(() => {
    if (!loading && users.length > 0) {
      const contactId = searchParams.get('contact')
      if (contactId) {
        const match = users.find(u => String(u.id) === String(contactId))
        if (match) {
          setSelectedUser(match)
          return
        }
      }

      if (!selectedUser) {
        setSelectedUser(users[0])
      }
    }
  }, [loading, users, searchParams, selectedUser])

  const fetchConversation = async (userId) => {
    try {
      const res = await api.get(`/messages/${userId}`)
      setMessages(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  const handleSend = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedUser) return
    setSending(true)
    try {
      const res = await api.post('/messages', {
        receiver_id: selectedUser.id,
        content: newMessage,
      })
      setMessages([...messages, res.data])
      setNewMessage('')
    } catch (err) {
      console.error(err)
    } finally {
      setSending(false)
    }
  }

  const getDashboardLink = () => {
    if (user.role === 'client') return '/client/dashboard'
    if (user.role === 'architect') return '/architect/dashboard'
    if (user.role === 'admin') return '/admin/dashboard'
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
            <Link to={getDashboardLink()} className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-amber-400 hover:text-amber-600">Dashboard</Link>
            <button onClick={handleLogout} className="rounded-full bg-gradient-to-r from-amber-500 to-orange-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-amber-500/25 transition hover:brightness-110">Logout</button>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="mb-8 overflow-hidden rounded-[30px] bg-slate-900 px-6 py-8 text-white shadow-[0_30px_80px_rgba(15,23,42,0.2)] sm:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-200">Communication</p>
              <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Messages</h1>
            </div>
            <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200">{users.length} connected contacts</div>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <aside className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-[0_18px_60px_rgba(15,23,42,0.05)]">
            <h2 className="mb-4 text-xl font-black text-slate-900">Conversations</h2>

            {loading ? (
              <div className="py-10 text-center text-slate-400">Loading contacts...</div>
            ) : users.length === 0 ? (
              <div className="py-10 text-center text-slate-400">No users found.</div>
            ) : (
              <div className="space-y-2">
                {users.map((u) => (
                  <button key={u.id} onClick={() => setSelectedUser(u)} className={`flex w-full items-center gap-3 rounded-[20px] p-3 text-left transition ${selectedUser?.id === u.id ? 'border border-amber-200 bg-amber-50' : 'bg-slate-50 hover:bg-slate-100'}`}>
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-900 to-slate-700 text-xl text-white shadow-md">👤</div>
                    <div>
                      <div className="font-bold text-slate-900">{u.name}</div>
                      <div className="text-xs text-slate-500">{u.role}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </aside>

          <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_18px_60px_rgba(15,23,42,0.05)]">
            {selectedUser ? (
              <>
                <header className="flex items-center gap-3 border-b border-slate-200 p-5">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-xl">👤</div>
                  <div>
                    <div className="text-lg font-black text-slate-900">{selectedUser.name}</div>
                    <div className="text-xs text-slate-500">{selectedUser.role}</div>
                  </div>
                </header>

                <div className="flex min-h-[420px] max-h-[520px] flex-col gap-3 overflow-y-auto bg-slate-50 p-5">
                  {messages.length === 0 ? (
                    <div className="flex h-full items-center justify-center text-center text-slate-400">No messages yet. Say hello! 👋</div>
                  ) : (
                    messages.map((msg) => (
                      <div key={msg.id} className={`flex ${msg.sender_id === user.id ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs rounded-2xl px-4 py-2 text-sm ${msg.sender_id === user.id ? 'bg-slate-900 text-white rounded-br-none' : 'bg-white text-slate-800 shadow-sm rounded-bl-none'}`}>
                          {msg.content}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <form onSubmit={handleSend} className="flex gap-3 border-t border-slate-200 p-5">
                  <input type="text" placeholder="Type a message..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)} className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-100" />
                  <button type="submit" disabled={sending || !newMessage.trim()} className="rounded-full bg-gradient-to-r from-amber-500 to-orange-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-amber-500/25 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60">{sending ? 'Sending...' : 'Send'}</button>
                </form>
              </>
            ) : (
              <div className="flex min-h-[420px] items-center justify-center text-center">
                <div>
                  <div className="text-5xl">💬</div>
                  <p className="mt-4 text-slate-500">Select a user to start messaging</p>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  )
}

export default MessagingPage
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import ClientDashboard from './pages/ClientDashboard'
import ArchitectDashboard from './pages/ArchitectDashboard'
import AdminDashboard from './pages/AdminDashboard'
import ArchitectProfile from './pages/ArchitectProfile'
import BrowseArchitects from './pages/BrowseArchitects'
import ArchitectDetail from './pages/ArchitectDetail'
import PostProject from './pages/PostProject'
import JobPostings from './pages/JobPostings'
import MessagingPage from './pages/MessagingPage'
import ProtectedRoute from './ProtectedRoute'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/client/dashboard" element={
          <ProtectedRoute allowedRoles={['client']}>
            <ClientDashboard />
          </ProtectedRoute>
        } />
        <Route path="/architect/dashboard" element={
          <ProtectedRoute allowedRoles={['architect']}>
            <ArchitectDashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin/dashboard" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/architect/profile" element={
          <ProtectedRoute allowedRoles={['architect', 'admin']}>
            <ArchitectProfile />
          </ProtectedRoute>
        } />
        <Route path="/client/browse" element={
          <ProtectedRoute allowedRoles={['client']}>
            <BrowseArchitects />
          </ProtectedRoute>
        } />
        <Route path="/client/architect/:id" element={
          <ProtectedRoute allowedRoles={['client']}>
            <ArchitectDetail />
          </ProtectedRoute>
        } />
        <Route path="/client/post-project" element={
          <ProtectedRoute allowedRoles={['client']}>
            <PostProject />
          </ProtectedRoute>
        } />
        <Route path="/architect/jobs" element={
          <ProtectedRoute allowedRoles={['architect']}>
            <JobPostings />
          </ProtectedRoute>
        } />
        <Route path="/messages" element={
          <ProtectedRoute allowedRoles={['client', 'architect', 'admin']}>
            <MessagingPage />
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  )
}

export default App
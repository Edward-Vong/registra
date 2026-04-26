import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Homepage from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Upload from './pages/Upload'
import About from './pages/About'
import AdminPanel from './pages/AdminPanel'
import ArtworkDetail from './pages/ArtworkDetail'
import Profile from './pages/Profile'
import VerifyEmail from './pages/VerifyEmail'
import ResetKey from './pages/ResetKey'
import ProtectedRoute from './components/ProtectedRoute'
import VerifiedRoute from './components/VerifiedRoute'
import AdminRoute from './components/AdminRoute'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/about" element={<About />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/reset-key" element={<ResetKey />} />
        <Route path="/dashboard" element={
          <VerifiedRoute><Dashboard /></VerifiedRoute>
        } />
        <Route path="/upload" element={
          <VerifiedRoute><Upload /></VerifiedRoute>
        } />
        <Route path="/profile" element={
          <VerifiedRoute><Profile /></VerifiedRoute>
        } />
        <Route path="/portfolio/:certificateId" element={
          <VerifiedRoute><ArtworkDetail /></VerifiedRoute>
        } />
        <Route path="/admin" element={
          <AdminRoute><AdminPanel /></AdminRoute>
        } />
        <Route path="/admin/certificates/:certificateId" element={
          <AdminRoute><ArtworkDetail /></AdminRoute>
        } />
      </Routes>
    </BrowserRouter>
  )
}
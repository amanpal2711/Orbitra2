import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import useAuthStore from './stores/authStore'
import useLenis from './hooks/useLenis'
import PageTransition from './components/layout/PageTransition'
import ProtectedRoute from './components/ProtectedRoute'
import LandingPage from './pages/LandingPage'
import Dashboard from './pages/Dashboard'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import UploadPage from './pages/UploadPage'
import ItineraryDetailPage from './pages/ItineraryDetailPage'
import SharedItineraryPage from './pages/SharedItineraryPage'

function AppContent() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  useLenis()

  return (
    <PageTransition>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'rgba(20, 23, 20, 0.94)',
            color: '#f2ede4',
            border: '1px solid rgba(242, 237, 228, 0.08)',
            boxShadow: '0 18px 36px rgba(0, 0, 0, 0.35)',
            backdropFilter: 'blur(16px)',
          },
          success: {
            iconTheme: {
              primary: '#2e8b7a',
              secondary: '#f2ede4',
            },
          },
          error: {
            iconTheme: {
              primary: '#e76f51',
              secondary: '#f2ede4',
            },
          },
        }}
      />

      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/share/:shareToken" element={<SharedItineraryPage />} />
        <Route path="/" element={isAuthenticated ? <Dashboard /> : <LandingPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/generate" element={<UploadPage />} />
          <Route path="/itinerary/:id" element={<ItineraryDetailPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </PageTransition>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}

export default App

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Lock, Mail, Plane, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import useAuthStore from '../stores/authStore'
import api from '../utils/api'

function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const login = useAuthStore((state) => state.login)
  const navigate = useNavigate()

  const validateForm = () => {
    const nextErrors = {}

    if (!email) {
      nextErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      nextErrors.email = 'Please enter a valid email'
    }

    if (!password) {
      nextErrors.password = 'Password is required'
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!validateForm()) return

    setLoading(true)

    try {
      const response = await api.post('/auth/login', { email, password })
      login(response.data.user, response.data.token)
      toast.success('Welcome back')
      navigate('/', { replace: true })
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--bg-base)] px-4 py-6 text-[#f2ede4]">
      <div className="section-shell grid min-h-[calc(100vh-3rem)] items-center gap-8 lg:grid-cols-[1fr_0.9fr]">
        <section className="relative overflow-hidden rounded-[32px] border border-[var(--border)] bg-[linear-gradient(180deg,rgba(22,25,21,0.94),rgba(12,14,12,0.98))] p-8 md:p-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(212,168,83,0.14),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(46,139,122,0.14),transparent_28%)]" />
          <div className="relative z-10 max-w-xl">
            <Link to="/" className="inline-flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[var(--border)] bg-white/5 text-[#d4a853]">
                <Plane className="h-5 w-5" />
              </span>
              <span className="font-display text-4xl">Orbitra</span>
            </Link>

            <h1 className="mt-10 font-display text-[clamp(3rem,6vw,5.8rem)] leading-[0.94]">
              Return to your next trip.
            </h1>
            <p className="mt-5 max-w-lg text-lg leading-8 text-[var(--text-muted)]">
              Sign in to the luxury itinerary workspace, where your travels are organized with a
              more editorial, premium feel.
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {[
                ['Secure', 'JWT-backed private sessions'],
                ['Fast', 'Instant route access and share links'],
              ].map(([title, text]) => (
                <div key={title} className="glass-panel rounded-[24px] p-5">
                  <p className="font-ui text-xs uppercase tracking-[0.3em] text-[#d4a853]">{title}</p>
                  <p className="mt-3 text-sm leading-6 text-[var(--text-muted)]">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="surface-card rounded-[32px] p-6 md:p-8">
          <div className="mb-8">
            <p className="section-kicker">Welcome back</p>
            <h2 className="mt-3 font-display text-4xl text-[#f2ede4]">Login to Orbitra</h2>
            <p className="mt-2 text-[var(--text-muted)]">
              Continue into your dashboard, generate trips, or open shared itineraries.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="mb-2 block font-ui text-xs uppercase tracking-[0.3em] text-[var(--text-muted)]">
                Email Address
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--text-dim)]" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value)
                    if (errors.email) setErrors((prev) => ({ ...prev, email: null }))
                  }}
                  placeholder="you@example.com"
                  className={`travel-input pl-11 ${errors.email ? 'border-[#e76f51]' : ''}`}
                />
              </div>
              {errors.email && <p className="mt-2 text-sm text-[#e76f51]">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block font-ui text-xs uppercase tracking-[0.3em] text-[var(--text-muted)]">
                Password
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--text-dim)]" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value)
                    if (errors.password) setErrors((prev) => ({ ...prev, password: null }))
                  }}
                  placeholder="Enter your password"
                  className={`travel-input pl-11 pr-12 ${errors.password ? 'border-[#e76f51]' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-dim)] transition-colors hover:text-[#f2ede4]"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && <p className="mt-2 text-sm text-[#e76f51]">{errors.password}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="travel-button travel-button-gold w-full justify-center py-4 text-base"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <p className="mt-6 text-center font-ui text-sm text-[var(--text-muted)]">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="text-[#d4a853] transition-colors hover:text-[#f2ede4]">
              Create one
            </Link>
          </p>
        </section>
      </div>
    </div>
  )
}

export default LoginPage

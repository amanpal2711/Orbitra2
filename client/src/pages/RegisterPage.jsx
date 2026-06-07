import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Check, Eye, EyeOff, Lock, Mail, Loader2, Plane, User, X } from 'lucide-react'
import toast from 'react-hot-toast'
import useAuthStore from '../stores/authStore'
import api from '../utils/api'

const passwordRequirements = [
  { key: 'length', label: 'At least 8 characters', test: (value) => value.length >= 8 },
  { key: 'upper', label: 'Uppercase letter', test: (value) => /[A-Z]/.test(value) },
  { key: 'lower', label: 'Lowercase letter', test: (value) => /[a-z]/.test(value) },
  { key: 'number', label: 'Number', test: (value) => /[0-9]/.test(value) },
  { key: 'special', label: 'Special character', test: (value) => /[^a-zA-Z0-9]/.test(value) },
]

function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const login = useAuthStore((state) => state.login)
  const navigate = useNavigate()

  const passwordStrength = passwordRequirements.filter((requirement) =>
    requirement.test(formData.password)
  ).length

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }))
    }
  }

  const validateForm = () => {
    const nextErrors = {}

    if (!formData.name.trim()) {
      nextErrors.name = 'Full name is required'
    } else if (formData.name.trim().length < 2) {
      nextErrors.name = 'Name must be at least 2 characters'
    }

    if (!formData.email) {
      nextErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      nextErrors.email = 'Please enter a valid email'
    }

    if (passwordStrength < passwordRequirements.length) {
      nextErrors.password = 'Password does not meet all requirements'
    }

    if (!formData.confirmPassword) {
      nextErrors.confirmPassword = 'Please confirm your password'
    } else if (formData.password !== formData.confirmPassword) {
      nextErrors.confirmPassword = 'Passwords do not match'
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!validateForm()) return

    setLoading(true)

    try {
      const response = await api.post('/auth/register', {
        name: formData.name.trim(),
        email: formData.email,
        password: formData.password,
      })

      login(response.data.user, response.data.token)
      toast.success('Account created successfully')
      navigate('/', { replace: true })
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const strengthLabel =
    ['Weak', 'Fair', 'Good', 'Strong', 'Very Strong'][passwordStrength - 1] || 'Weak'

  return (
    <div className="min-h-screen bg-[var(--bg-base)] px-4 py-6 text-[#f2ede4]">
      <div className="section-shell grid min-h-[calc(100vh-3rem)] items-center gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="surface-card relative overflow-hidden rounded-[32px] p-8 md:p-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(212,168,83,0.16),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(46,139,122,0.14),transparent_25%)]" />
          <div className="relative z-10">
            <Link to="/" className="inline-flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[var(--border)] bg-white/5 text-[#d4a853]">
                <Plane className="h-5 w-5" />
              </span>
              <span className="font-display text-4xl">Orbitra</span>
            </Link>

            <h1 className="mt-10 font-display text-[clamp(3rem,6vw,5.8rem)] leading-[0.94]">
              Create a travel workspace that feels premium.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-[var(--text-muted)]">
              Build an account to generate itineraries, manage saved trips, and share elegant
              travel plans with the rest of your group.
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {[
                ['Private', 'Secure auth and protected routes'],
                ['Polished', 'Dark editorial interface by design'],
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
            <p className="section-kicker">Get started</p>
            <h2 className="mt-3 font-display text-4xl text-[#f2ede4]">Create your account</h2>
            <p className="mt-2 text-[var(--text-muted)]">
              Join Orbitra and begin generating trips in a more refined interface.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-2 block font-ui text-xs uppercase tracking-[0.3em] text-[var(--text-muted)]">
                Full Name
              </label>
              <div className="relative">
                <User className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--text-dim)]" />
                <input
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Jane Doe"
                  className={`travel-input pl-11 ${errors.name ? 'border-[#e76f51]' : ''}`}
                />
              </div>
              {errors.name && <p className="mt-2 text-sm text-[#e76f51]">{errors.name}</p>}
            </div>

            <div>
              <label className="mb-2 block font-ui text-xs uppercase tracking-[0.3em] text-[var(--text-muted)]">
                Email Address
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--text-dim)]" />
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className={`travel-input pl-11 ${errors.email ? 'border-[#e76f51]' : ''}`}
                />
              </div>
              {errors.email && <p className="mt-2 text-sm text-[#e76f51]">{errors.email}</p>}
            </div>

            <div>
              <label className="mb-2 block font-ui text-xs uppercase tracking-[0.3em] text-[var(--text-muted)]">
                Password
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--text-dim)]" />
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a strong password"
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

              {formData.password && (
                <div className="mt-4 space-y-3 rounded-[24px] border border-[var(--border)] bg-white/4 p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/8">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#2e8b7a] via-[#d4a853] to-[#f2ede4] transition-all duration-300"
                        style={{ width: `${(passwordStrength / passwordRequirements.length) * 100}%` }}
                      />
                    </div>
                    <span className="font-ui text-xs uppercase tracking-[0.25em] text-[var(--text-muted)]">
                      {strengthLabel}
                    </span>
                  </div>

                  <div className="grid gap-2 sm:grid-cols-2">
                    {passwordRequirements.map((requirement) => {
                      const met = requirement.test(formData.password)
                      return (
                        <div
                          key={requirement.key}
                          className={`flex items-center gap-2 text-xs ${met ? 'text-[#f2ede4]' : 'text-[var(--text-muted)]'}`}
                        >
                          {met ? <Check className="h-3.5 w-3.5 text-[#2e8b7a]" /> : <X className="h-3.5 w-3.5" />}
                          <span>{requirement.label}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="mb-2 block font-ui text-xs uppercase tracking-[0.3em] text-[var(--text-muted)]">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--text-dim)]" />
                <input
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  className={`travel-input pl-11 pr-12 ${errors.confirmPassword ? 'border-[#e76f51]' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((value) => !value)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-dim)] transition-colors hover:text-[#f2ede4]"
                  aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-2 text-sm text-[#e76f51]">{errors.confirmPassword}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="travel-button travel-button-gold w-full justify-center py-4 text-base"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <p className="mt-6 text-center font-ui text-sm text-[var(--text-muted)]">
            Already have an account?{' '}
            <Link to="/login" className="text-[#d4a853] transition-colors hover:text-[#f2ede4]">
              Sign in
            </Link>
          </p>
        </section>
      </div>
    </div>
  )
}

export default RegisterPage

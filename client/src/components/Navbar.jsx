import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { LogOut, Menu, Plane, Sparkles, X } from 'lucide-react'
import useAuthStore from '../stores/authStore'

const publicLinks = [
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Features', href: '#features' },
  { label: 'Testimonials', href: '#testimonials' },
  { label: 'Pricing', href: '#pricing' },
]

const appLinks = [
  { label: 'Dashboard', href: '/' },
  { label: 'Generate', href: '/generate' },
]

function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { user, logout, isAuthenticated } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 18)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMobileMenuOpen(false)
  }, [location.pathname])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const isHome = location.pathname === '/' && !isAuthenticated
  const links = isHome ? publicLinks : appLinks

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled || mobileMenuOpen ? 'bg-[rgba(13,15,14,0.82)] backdrop-blur-xl' : 'bg-transparent'
      }`}
    >
      <div
        className={`section-shell flex items-center justify-between transition-[height] duration-300 ${
          scrolled || mobileMenuOpen ? 'h-[56px]' : 'h-[72px]'
        }`}
      >
        <Link to="/" className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[var(--border)] bg-[rgba(255,255,255,0.04)] text-[#d4a853] shadow-lg">
            <Sparkles className="h-5 w-5" />
          </span>
          <span className="font-display text-3xl text-[#f2ede4]">Orbitra</span>
        </Link>

        <nav className="hidden items-center gap-7 lg:flex">
          {links.map((link) =>
            link.href.startsWith('#') ? (
              <a key={link.label} href={link.href} className="nav-link nav-link-underline">
                {link.label}
              </a>
            ) : (
              <Link
                key={link.label}
                to={link.href}
                className={`nav-link nav-link-underline ${location.pathname === link.href ? 'active' : ''}`}
              >
                {link.label}
              </Link>
            )
          )}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          {isAuthenticated ? (
            <>
              <div className="flex items-center gap-3 rounded-full border border-[var(--border)] bg-white/5 px-4 py-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#d4a853]/15 text-sm font-semibold text-[#d4a853]">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div className="text-left">
                  <p className="font-ui text-xs uppercase tracking-[0.25em] text-[var(--text-muted)]">
                    Welcome back
                  </p>
                  <p className="font-ui text-sm text-[#f2ede4]">{user?.name || 'Traveler'}</p>
                </div>
              </div>
              <button onClick={handleLogout} className="travel-button travel-button-ghost">
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="travel-button travel-button-ghost">
                Login
              </Link>
              <Link to="/register" className="travel-button travel-button-gold">
                Get Started
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setMobileMenuOpen((value) => !value)}
          className="lg:hidden flex h-11 w-11 items-center justify-center rounded-full border border-[var(--border)] bg-white/5 text-[#f2ede4]"
          aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="border-t border-[var(--border)] bg-[rgba(13,15,14,0.96)] backdrop-blur-xl lg:hidden">
          <div className="section-shell py-5">
            <div className="grid gap-3">
              {links.map((link, index) =>
                link.href.startsWith('#') ? (
                  <a
                    key={link.label}
                    href={link.href}
                    style={{ animationDelay: `${index * 70}ms` }}
                    className="rounded-2xl border border-[var(--border)] bg-white/4 px-4 py-4 font-ui text-sm text-[#f2ede4] transition-all hover:border-[#d4a853]/30 hover:bg-white/6"
                  >
                    {link.label}
                  </a>
                ) : (
                  <Link
                    key={link.label}
                    to={link.href}
                    style={{ animationDelay: `${index * 70}ms` }}
                    className="rounded-2xl border border-[var(--border)] bg-white/4 px-4 py-4 font-ui text-sm text-[#f2ede4] transition-all hover:border-[#d4a853]/30 hover:bg-white/6"
                  >
                    {link.label}
                  </Link>
                )
              )}
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              {isAuthenticated ? (
                <button
                  onClick={handleLogout}
                  className="travel-button travel-button-ghost w-full justify-center"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              ) : (
                <>
                  <Link to="/login" className="travel-button travel-button-ghost flex-1 justify-center">
                    Login
                  </Link>
                  <Link to="/register" className="travel-button travel-button-gold flex-1 justify-center">
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

export default Navbar

import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import {
  CalendarDays,
  Compass,
  FileText,
  Globe2,
  Loader2,
  LogOut,
  MapPinned,
  Menu,
  Plus,
  Share2,
  Sparkles,
  Trash2,
  User,
} from 'lucide-react'
import useAuthStore from '../stores/authStore'
import api from '../utils/api'
import { normalizeItinerary, unwrapApiData } from '../utils/normalizeItinerary'
import toast from 'react-hot-toast'

const sidebarLinks = [
  { label: 'My Trips', href: '#my-trips', icon: FileText },
  { label: 'Generate New', href: '/generate', icon: Sparkles },
  { label: 'Saved Places', href: '#saved-places', icon: MapPinned },
  { label: 'Settings', href: '#settings', icon: Globe2 },
]

const tripBackdrop = [
  'https://res.cloudinary.com/demo/image/upload/v1690000000/samples/landscapes/road.jpg',
  'https://res.cloudinary.com/demo/image/upload/v1690000000/samples/landscapes/girl-urban-view.jpg',
  'https://res.cloudinary.com/demo/image/upload/v1690000000/samples/landscapes/nature-mountains.jpg',
]

const calculateStats = (items) => {
  const now = new Date()
  const thisMonth = items.filter((itinerary) => {
    const createdDate = new Date(itinerary.createdAt)
    return (
      createdDate.getMonth() === now.getMonth() &&
      createdDate.getFullYear() === now.getFullYear()
    )
  })

  const uniqueDestinations = new Set(
    items
      .map((i) => i.destination?.split(',').pop()?.trim())
      .filter(Boolean)
  )

  return {
    total: items.length,
    thisMonth: thisMonth.length,
    countries: uniqueDestinations.size,
  }
}

function Dashboard() {
  const { user, logout } = useAuthStore()
  const [itineraries, setItineraries] = useState([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState(null)
  const [stats, setStats] = useState({ total: 0, thisMonth: 0, countries: 0 })

  useEffect(() => {
    fetchItineraries()
  }, [])

  const summaryCards = useMemo(
    () => [
      {
        label: 'Total itineraries',
        value: stats.total,
        icon: FileText,
        tone: 'text-[#d4a853]',
      },
      {
        label: 'This month',
        value: stats.thisMonth,
        icon: CalendarDays,
        tone: 'text-[#2e8b7a]',
      },
      {
        label: 'Countries',
        value: stats.countries,
        icon: Globe2,
        tone: 'text-[#f2ede4]',
      },
    ],
    [stats]
  )

  const fetchItineraries = async () => {
    try {
      const response = await api.get('/itineraries')
      const list = unwrapApiData(response) || []
      const normalized = list.map(normalizeItinerary)
      setItineraries(normalized)
      setStats(calculateStats(normalized))
    } catch {
      toast.error('Failed to load itineraries')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (e, id) => {
    e.preventDefault()
    e.stopPropagation()

    if (!window.confirm('Are you sure you want to delete this itinerary?')) return

    setDeletingId(id)
    try {
      await api.delete(`/itineraries/${id}`)
      const remaining = itineraries.filter((i) => i._id !== id)
      setItineraries(remaining)
      setStats(calculateStats(remaining))
      toast.success('Itinerary deleted successfully')
    } catch {
      toast.error('Failed to delete itinerary')
    } finally {
      setDeletingId(null)
    }
  }

  const handleShare = async (e, id) => {
    e.preventDefault()
    e.stopPropagation()

    try {
      const response = await api.post(`/itineraries/${id}/share`)
      const { shareToken } = unwrapApiData(response)
      const shareUrl = `${window.location.origin}/share/${shareToken}`

      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl)
        toast.success('Share link copied to clipboard')
      } else {
        toast.success(`Share URL: ${shareUrl}`)
      }
    } catch {
      toast.error('Failed to generate share link')
    }
  }

  const handleLogout = () => {
    logout()
    window.location.href = '/login'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-base)] px-4 py-8 text-[#f2ede4]">
        <div className="section-shell grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
          <aside className="hidden rounded-[28px] border border-[var(--border)] bg-[var(--bg-surface)] p-5 lg:block">
            <div className="h-10 w-36 shimmer rounded-2xl" />
            <div className="mt-8 space-y-3">
              <div className="h-12 shimmer rounded-2xl" />
              <div className="h-12 shimmer rounded-2xl" />
              <div className="h-12 shimmer rounded-2xl" />
              <div className="h-12 shimmer rounded-2xl" />
            </div>
          </aside>

          <main className="space-y-6">
            <div className="h-40 shimmer rounded-[32px]" />
            <div className="grid gap-4 md:grid-cols-3">
              <div className="h-32 shimmer rounded-[24px]" />
              <div className="h-32 shimmer rounded-[24px]" />
              <div className="h-32 shimmer rounded-[24px]" />
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="h-80 shimmer rounded-[28px]" />
              ))}
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[#f2ede4]">
      <div className="mx-auto flex min-h-screen max-w-[1800px]">
        <aside className="sticky top-0 hidden h-screen w-[240px] shrink-0 border-r border-[var(--border)] bg-[rgba(13,15,14,0.92)] px-5 py-6 backdrop-blur-xl lg:flex lg:flex-col">
          <Link to="/" className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[var(--border)] bg-white/5 text-[#d4a853]">
              <Compass className="h-5 w-5" />
            </span>
            <span className="font-display text-3xl">Orbitra</span>
          </Link>

          <div className="mt-8 rounded-[26px] border border-[var(--border)] bg-white/4 p-4">
            <p className="font-ui text-xs uppercase tracking-[0.3em] text-[var(--text-muted)]">Traveler</p>
            <div className="mt-3 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#d4a853]/15 text-[#d4a853]">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div>
                <p className="font-ui text-sm text-[#f2ede4]">{user?.name || 'Traveler'}</p>
                <p className="font-ui text-xs text-[var(--text-muted)]">{user?.email || ''}</p>
              </div>
            </div>
          </div>

          <nav className="mt-8 space-y-2">
            {sidebarLinks.map((link) => {
              const Icon = link.icon
              return link.href.startsWith('/') ? (
                <Link
                  key={link.label}
                  to={link.href}
                  className="flex items-center gap-3 rounded-2xl border border-transparent px-4 py-3 font-ui text-sm text-[var(--text-muted)] transition-all hover:border-[#d4a853]/20 hover:bg-white/5 hover:text-[#f2ede4]"
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </Link>
              ) : (
                <a
                  key={link.label}
                  href={link.href}
                  className="flex items-center gap-3 rounded-2xl border border-transparent px-4 py-3 font-ui text-sm text-[var(--text-muted)] transition-all hover:border-[#d4a853]/20 hover:bg-white/5 hover:text-[#f2ede4]"
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </a>
              )
            })}
          </nav>

          <div className="mt-auto space-y-3">
            <Link to="/generate" className="travel-button travel-button-gold w-full justify-center">
              <Sparkles className="h-4 w-4" />
              Generate New
            </Link>
            <button onClick={handleLogout} className="travel-button travel-button-ghost w-full justify-center">
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </aside>

        <main className="flex-1 px-4 py-6 pb-24 lg:px-8 lg:py-8">
          <div className="mb-6 flex items-center justify-between gap-4 lg:hidden">
            <Link to="/" className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[var(--border)] bg-white/5 text-[#d4a853]">
                <Compass className="h-5 w-5" />
              </span>
              <span className="font-display text-3xl">Orbitra</span>
            </Link>
            <button
              onClick={handleLogout}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--border)] bg-white/5 text-[#f2ede4]"
              aria-label="Logout"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>

          <section className="surface-card relative overflow-hidden rounded-[32px] p-6 md:p-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(212,168,83,0.14),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(46,139,122,0.12),transparent_25%)]" />
            <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <p className="section-kicker">Dashboard</p>
                <h1 className="mt-3 font-display text-[clamp(2.8rem,5vw,5.2rem)] leading-[0.94]">
                  Welcome back, {user?.name?.split(' ')[0] || 'Traveler'}.
                </h1>
                <p className="mt-4 max-w-2xl text-lg leading-8 text-[var(--text-muted)]">
                  Generate your next itinerary, review the trips already in your library, and keep
                  everything beautifully organized.
                </p>
              </div>

              <Link to="/generate" className="travel-button travel-button-gold">
                <Plus className="h-4 w-4" />
                Generate New Trip
              </Link>
            </div>
          </section>

          <section className="mt-6 grid gap-4 md:grid-cols-3">
            {summaryCards.map((card) => {
              const Icon = card.icon
              return (
                <div key={card.label} className="glass-panel rounded-[24px] p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-ui text-xs uppercase tracking-[0.3em] text-[var(--text-muted)]">
                        {card.label}
                      </p>
                      <p className="mt-3 font-display text-5xl text-[#f2ede4]">{card.value}</p>
                    </div>
                    <div className={`flex h-12 w-12 items-center justify-center rounded-2xl border border-[var(--border)] bg-white/5 ${card.tone}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                  </div>
                </div>
              )
            })}
          </section>

          <section className="mt-6 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
            <div id="saved-places" className="surface-card rounded-[28px] p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="section-kicker">Generate view</p>
                  <h2 className="mt-2 font-display text-4xl text-[#f2ede4]">Your next journey starts here.</h2>
                </div>
                <Link to="/generate" className="travel-button travel-button-ghost">
                  Open wizard
                </Link>
              </div>

              <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                {[
                  'Destination',
                  'Dates',
                  'Budget',
                  'Preferences',
                ].map((label) => (
                  <div key={label} className="rounded-[24px] border border-[var(--border)] bg-white/4 p-4">
                    <p className="font-ui text-xs uppercase tracking-[0.28em] text-[var(--text-muted)]">{label}</p>
                    <p className="mt-3 text-sm leading-7 text-[#f2ede4]">
                      {label === 'Destination'
                        ? 'Marrakech, Morocco'
                        : label === 'Dates'
                        ? '12 Sep - 18 Sep'
                        : label === 'Budget'
                        ? 'Flexible'
                        : 'Food, art, and rooftop dinners'}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-4 rounded-[24px] border border-[#d4a853]/20 bg-[#d4a853]/8 p-5">
                <div className="flex items-center gap-3">
                  <Sparkles className="h-5 w-5 text-[#d4a853]" />
                  <p className="font-ui text-xs uppercase tracking-[0.3em] text-[#d4a853]">
                    Gemini is crafting your journey...
                  </p>
                </div>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--text-muted)]">
                  Hit the wizard to generate a structured, exportable itinerary with the same
                  premium presentation this dashboard uses.
                </p>
              </div>
            </div>

            <div className="surface-card rounded-[28px] p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="section-kicker">Saved places</p>
                  <h2 className="mt-2 font-display text-3xl text-[#f2ede4]">Travel notes</h2>
                </div>
                <Menu className="h-5 w-5 text-[var(--text-muted)]" />
              </div>

              <div className="mt-5 space-y-3">
                {[
                  'Morning coffee near Jardin Majorelle',
                  'Rooftop dinner with a view of the medina',
                  'Private transfer booked for departure day',
                ].map((item) => (
                  <div key={item} className="rounded-[20px] border border-[var(--border)] bg-white/4 p-4 text-sm leading-7 text-[var(--text-muted)]">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section id="my-trips" className="mt-8">
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <p className="section-kicker">My trips</p>
                <h2 className="mt-2 font-display text-4xl text-[#f2ede4]">Trips in your library</h2>
              </div>
              <Link to="/generate" className="hidden travel-button travel-button-ghost md:inline-flex">
                <Sparkles className="h-4 w-4" />
                Generate another
              </Link>
            </div>

            {itineraries.length === 0 ? (
              <div className="surface-card rounded-[32px] p-10 text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#d4a853]/10 text-[#d4a853]">
                  <Compass className="h-10 w-10" />
                </div>
                <h3 className="mt-6 font-display text-3xl text-[#f2ede4]">No itineraries yet</h3>
                <p className="mx-auto mt-3 max-w-xl text-[var(--text-muted)]">
                  Start with your first generated trip and Orbitra will turn it into a polished
                  travel plan.
                </p>
                <Link to="/generate" className="travel-button travel-button-gold mt-8">
                  <Sparkles className="h-4 w-4" />
                  Generate Your First Trip
                </Link>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {itineraries.map((itinerary, index) => (
                  <Link
                    key={itinerary._id}
                    to={`/itinerary/${itinerary._id}`}
                    className="group surface-card overflow-hidden rounded-[28px] transition-all duration-300 hover:-translate-y-1"
                  >
                    <div className="relative overflow-hidden">
                      <img
                        src={tripBackdrop[index % tripBackdrop.length]}
                        alt={itinerary.destination}
                        className="aspect-[16/9] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(6,8,7,0.88))]" />
                      <div className="absolute inset-x-0 bottom-0 p-5">
                        <p className="font-ui text-[11px] uppercase tracking-[0.3em] text-[#d4a853]">
                          Travel dossier
                        </p>
                        <h3 className="mt-2 font-display text-3xl text-[#f2ede4]">{itinerary.destination}</h3>
                      </div>
                    </div>

                    <div className="p-5">
                      <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                        <CalendarDays className="h-4 w-4" />
                        {itinerary.createdAt
                          ? format(new Date(itinerary.createdAt), 'MMM dd, yyyy')
                          : 'Date unavailable'}
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {(itinerary.preferences || '')
                          .split(',')
                          .slice(0, 3)
                          .map((pref) => {
                            const value = pref.trim()
                            if (!value) return null
                            return (
                              <span
                                key={value}
                                className="rounded-full border border-[var(--border)] bg-white/4 px-3 py-1 font-ui text-[11px] uppercase tracking-[0.25em] text-[var(--text-muted)]"
                              >
                                {value}
                              </span>
                            )
                          })}
                      </div>

                      <div className="mt-5 flex items-center justify-between gap-3">
                        <span className="font-ui text-sm text-[var(--text-muted)]">
                          {Math.max(
                            1,
                            Math.ceil(
                              (new Date(itinerary.endDate) - new Date(itinerary.startDate)) /
                                (1000 * 60 * 60 * 24)
                            )
                          )}{' '}
                          days
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => handleShare(e, itinerary._id)}
                            className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] bg-white/4 text-[#f2ede4] transition-all hover:border-[#d4a853]/25 hover:text-[#d4a853]"
                            aria-label="Share"
                          >
                            <Share2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={(e) => handleDelete(e, itinerary._id)}
                            disabled={deletingId === itinerary._id}
                            className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] bg-white/4 text-[#f2ede4] transition-all hover:border-[#e76f51]/25 hover:text-[#e76f51]"
                            aria-label="Delete"
                          >
                            {deletingId === itinerary._id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>

          <div className="mt-8 rounded-[28px] border border-[var(--border)] bg-white/4 p-5 text-sm text-[var(--text-muted)]">
            <div className="flex flex-wrap items-center gap-3">
              <User className="h-4 w-4 text-[#d4a853]" />
              <span id="settings">Settings and saved places can be expanded here without changing the backend.</span>
            </div>
          </div>
        </main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--border)] bg-[rgba(13,15,14,0.92)] px-3 py-3 backdrop-blur-xl lg:hidden">
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: 'Trips', href: '#my-trips', icon: FileText },
            { label: 'Generate', href: '/generate', icon: Sparkles },
            { label: 'Saved', href: '#saved-places', icon: MapPinned },
            { label: 'Logout', action: handleLogout, icon: LogOut },
          ].map((item) => {
            const Icon = item.icon
            if (item.action) {
              return (
                <button
                  key={item.label}
                  onClick={item.action}
                  className="flex flex-col items-center gap-1 rounded-2xl px-2 py-2 text-[11px] uppercase tracking-[0.22em] text-[var(--text-muted)]"
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </button>
              )
            }
            return item.href.startsWith('/') ? (
              <Link
                key={item.label}
                to={item.href}
                className="flex flex-col items-center gap-1 rounded-2xl px-2 py-2 text-[11px] uppercase tracking-[0.22em] text-[var(--text-muted)]"
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            ) : (
              <a
                key={item.label}
                href={item.href}
                className="flex flex-col items-center gap-1 rounded-2xl px-2 py-2 text-[11px] uppercase tracking-[0.22em] text-[var(--text-muted)]"
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </a>
            )
          })}
        </div>
      </nav>
    </div>
  )
}

export default Dashboard

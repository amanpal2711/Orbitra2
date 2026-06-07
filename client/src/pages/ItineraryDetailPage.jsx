import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { format } from 'date-fns'
import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  DollarSign,
  Download,
  ExternalLink,
  FileText,
  Hash,
  Hotel,
  Loader2,
  MapPin,
  Plane,
  Share2,
  Sparkles,
  Sun,
  Moon,
  User,
  AlertTriangle,
  Info,
} from 'lucide-react'
import Navbar from '../components/Navbar'
import api from '../utils/api'
import { normalizeItinerary, unwrapApiData } from '../utils/normalizeItinerary'
import toast from 'react-hot-toast'

const timeOfDayStyles = {
  morning: {
    badge: 'bg-[#d4a853]/12 text-[#d4a853]',
    icon: Sun,
    iconColor: 'text-[#d4a853]',
  },
  afternoon: {
    badge: 'bg-[#2e8b7a]/12 text-[#2e8b7a]',
    icon: Sun,
    iconColor: 'text-[#2e8b7a]',
  },
  evening: {
    badge: 'bg-[#7c6cff]/12 text-[#c9c2ff]',
    icon: Moon,
    iconColor: 'text-[#c9c2ff]',
  },
}

function ItineraryDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [itinerary, setItinerary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeDay, setActiveDay] = useState(0)
  const [sharing, setSharing] = useState(false)
  const [expandedTips, setExpandedTips] = useState(false)
  const [expandedDocs, setExpandedDocs] = useState(false)

  useEffect(() => {
    fetchItinerary()
  }, [id])

  const fetchItinerary = async () => {
    try {
      const response = await api.get(`/itineraries/${id}`)
      const normalized = normalizeItinerary(unwrapApiData(response))
      setItinerary(normalized)
      if (normalized?.days?.length > 0) {
        setActiveDay(0)
      }
    } catch {
      toast.error('Failed to load itinerary')
      navigate('/')
    } finally {
      setLoading(false)
    }
  }

  const handleShare = async () => {
    setSharing(true)
    try {
      const response = await api.post(`/itineraries/${itinerary._id}/share`)
      const { shareToken } = unwrapApiData(response)
      const shareUrl = `${window.location.origin}/share/${shareToken}`

      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl)
      }

      setItinerary((prev) => ({ ...prev, shareToken }))
      toast.success('Share link copied')
    } catch {
      toast.error('Could not copy link. Try again.')
    } finally {
      setSharing(false)
    }
  }

  const getTimeOfDay = (time) => {
    const hour = parseInt(time.split(':')[0], 10)
    if (hour < 12) return 'morning'
    if (hour < 17) return 'afternoon'
    return 'evening'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-base)] px-4 py-8 text-[#f2ede4]">
        <Navbar />
        <div className="section-shell pt-28">
          <div className="h-72 shimmer rounded-[32px]" />
          <div className="mt-6 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="space-y-4">
              <div className="h-64 shimmer rounded-[28px]" />
              <div className="h-64 shimmer rounded-[28px]" />
            </div>
            <div className="h-[520px] shimmer rounded-[28px]" />
          </div>
        </div>
      </div>
    )
  }

  if (!itinerary) return null

  const duration = Math.ceil(
    (new Date(itinerary.endDate) - new Date(itinerary.startDate)) / (1000 * 60 * 60 * 24)
  )

  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[#f2ede4]">
      <Navbar />

      <div className="section-shell pb-20 pt-28">
        <Link to="/" className="travel-button travel-button-ghost mb-6">
          <ArrowLeft className="h-4 w-4" />
          Back to dashboard
        </Link>

        <section className="surface-card relative overflow-hidden rounded-[32px] p-6 md:p-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(212,168,83,0.14),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(46,139,122,0.12),transparent_22%)]" />
          <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full border border-[var(--border)] bg-white/4 px-3 py-1 font-ui text-[11px] uppercase tracking-[0.28em] text-[var(--text-muted)]">
                  {duration} Day{duration > 1 ? 's' : ''} Trip
                </span>
                {itinerary.preferences && (
                  <span className="rounded-full border border-[var(--border)] bg-white/4 px-3 py-1 font-ui text-[11px] uppercase tracking-[0.28em] text-[var(--text-muted)]">
                    {itinerary.preferences}
                  </span>
                )}
              </div>

              <h1 className="mt-5 font-display text-[clamp(3rem,6vw,5.8rem)] leading-[0.94]">
                {itinerary.destination}
              </h1>

              <div className="mt-4 flex flex-wrap gap-5 text-sm text-[var(--text-muted)]">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-[#d4a853]" />
                  {format(new Date(itinerary.startDate), 'MMM d, yyyy')} -{' '}
                  {format(new Date(itinerary.endDate), 'MMM d, yyyy')}
                </div>
                {itinerary.budget && (
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-[#2e8b7a]" />
                    ${itinerary.budget.toLocaleString()} estimated
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleShare}
                disabled={sharing}
                className="travel-button travel-button-ghost"
              >
                {sharing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Share2 className="h-4 w-4" />}
                Share
              </button>
              <button className="travel-button travel-button-gold">
                <Download className="h-4 w-4" />
                PDF
              </button>
            </div>
          </div>
        </section>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-6">
            {(itinerary.airline || itinerary.hotel || itinerary.travelerName || itinerary.bookingReference) && (
              <section className="surface-card rounded-[28px] p-6">
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#d4a853]/12 text-[#d4a853]">
                    <Info className="h-5 w-5" />
                  </div>
                  <h2 className="font-display text-4xl text-[#f2ede4]">Trip overview</h2>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {itinerary.airline && (
                    <div className="rounded-[22px] border border-[var(--border)] bg-white/4 p-4">
                      <div className="flex items-start gap-3">
                        <Plane className="mt-1 h-5 w-5 text-[#d4a853]" />
                        <div>
                          <p className="font-ui text-xs uppercase tracking-[0.3em] text-[var(--text-muted)]">Airline</p>
                          <p className="mt-2 text-[#f2ede4]">{itinerary.airline}</p>
                          {itinerary.flightNumber && <p className="mt-1 text-sm text-[var(--text-muted)]">Flight: {itinerary.flightNumber}</p>}
                        </div>
                      </div>
                    </div>
                  )}

                  {itinerary.hotel && (
                    <div className="rounded-[22px] border border-[var(--border)] bg-white/4 p-4">
                      <div className="flex items-start gap-3">
                        <Hotel className="mt-1 h-5 w-5 text-[#2e8b7a]" />
                        <div>
                          <p className="font-ui text-xs uppercase tracking-[0.3em] text-[var(--text-muted)]">Hotel</p>
                          <p className="mt-2 text-[#f2ede4]">{itinerary.hotel}</p>
                          {itinerary.checkIn && itinerary.checkOut && (
                            <p className="mt-1 text-sm text-[var(--text-muted)]">
                              {format(new Date(itinerary.checkIn), 'MMM d')} - {format(new Date(itinerary.checkOut), 'MMM d, yyyy')}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {itinerary.travelerName && (
                    <div className="rounded-[22px] border border-[var(--border)] bg-white/4 p-4">
                      <div className="flex items-start gap-3">
                        <User className="mt-1 h-5 w-5 text-[#d4a853]" />
                        <div>
                          <p className="font-ui text-xs uppercase tracking-[0.3em] text-[var(--text-muted)]">Traveler</p>
                          <p className="mt-2 text-[#f2ede4]">{itinerary.travelerName}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {itinerary.bookingReference && (
                    <div className="rounded-[22px] border border-[var(--border)] bg-white/4 p-4">
                      <div className="flex items-start gap-3">
                        <Hash className="mt-1 h-5 w-5 text-[#f2ede4]" />
                        <div>
                          <p className="font-ui text-xs uppercase tracking-[0.3em] text-[var(--text-muted)]">Booking reference</p>
                          <p className="mt-2 font-mono text-sm text-[#f2ede4]">{itinerary.bookingReference}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </section>
            )}

            {itinerary.days?.length > 0 && (
              <section className="surface-card rounded-[28px] p-6">
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#2e8b7a]/12 text-[#2e8b7a]">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <h2 className="font-display text-4xl text-[#f2ede4]">Day-by-day itinerary</h2>
                </div>

                <div className="mb-6 flex flex-wrap gap-2">
                  {itinerary.days.map((day, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveDay(index)}
                      className={`rounded-full px-4 py-2 font-ui text-sm transition-all ${
                        activeDay === index
                          ? 'bg-[#d4a853] text-[#10110f]'
                          : 'border border-[var(--border)] bg-white/4 text-[var(--text-muted)] hover:text-[#f2ede4]'
                      }`}
                    >
                      Day {index + 1}
                    </button>
                  ))}
                </div>

                {itinerary.days[activeDay] && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-display text-3xl text-[#f2ede4]">
                        {itinerary.days[activeDay].title || `Day ${activeDay + 1}`}
                      </h3>
                      {itinerary.days[activeDay].description && (
                        <p className="mt-2 text-[var(--text-muted)]">
                          {itinerary.days[activeDay].description}
                        </p>
                      )}
                    </div>

                    <div className="space-y-3">
                      {itinerary.days[activeDay].activities?.map((activity, index) => {
                        const timeOfDay = getTimeOfDay(activity.time || '12:00')
                        const style = timeOfDayStyles[timeOfDay]
                        const TimeIcon = style.icon

                        return (
                          <div
                            key={index}
                            className="rounded-[24px] border border-[var(--border)] bg-white/4 p-4 transition-all hover:border-[#d4a853]/20"
                          >
                            <div className="flex items-start gap-4">
                              <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${style.badge}`}>
                                <TimeIcon className={`h-5 w-5 ${style.iconColor}`} />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className={`rounded-full px-3 py-1 font-ui text-[11px] uppercase tracking-[0.28em] ${style.badge}`}>
                                    {activity.time || 'All day'}
                                  </span>
                                  {activity.duration && (
                                    <span className="flex items-center gap-1 font-ui text-xs text-[var(--text-muted)]">
                                      <Clock className="h-3.5 w-3.5" />
                                      {activity.duration}
                                    </span>
                                  )}
                                </div>
                                <h4 className="mt-3 text-2xl text-[#f2ede4]">{activity.name}</h4>
                                {activity.location && (
                                  <p className="mt-2 flex items-center gap-2 text-sm text-[var(--text-muted)]">
                                    <MapPin className="h-4 w-4" />
                                    {activity.location}
                                  </p>
                                )}
                                {activity.description && (
                                  <p className="mt-3 text-sm leading-7 text-[var(--text-muted)]">
                                    {activity.description}
                                  </p>
                                )}
                                {activity.tips && (
                                  <p className="mt-3 flex items-start gap-2 text-sm text-[#d4a853]">
                                    <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                                    <span>{activity.tips}</span>
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </section>
            )}

            {itinerary.travelTips?.length > 0 && (
              <section className="surface-card rounded-[28px] p-6">
                <button onClick={() => setExpandedTips(!expandedTips)} className="flex w-full items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#2e8b7a]/12 text-[#2e8b7a]">
                      <CheckCircle className="h-5 w-5" />
                    </div>
                    <h2 className="font-display text-4xl text-[#f2ede4]">Travel tips</h2>
                  </div>
                  {expandedTips ? <ChevronUp className="h-5 w-5 text-[var(--text-muted)]" /> : <ChevronDown className="h-5 w-5 text-[var(--text-muted)]" />}
                </button>

                {expandedTips && (
                  <div className="mt-6 space-y-3">
                    {itinerary.travelTips.map((tip, index) => (
                      <div key={index} className="rounded-[20px] border border-[var(--border)] bg-white/4 p-4 text-[var(--text-muted)]">
                        {tip}
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}
          </div>

          <aside className="space-y-6">
            {itinerary.recommendations && (
              <section className="surface-card rounded-[28px] p-6">
                <h2 className="font-display text-4xl text-[#f2ede4]">Recommendations</h2>

                <div className="mt-5 space-y-5">
                  {itinerary.recommendations.restaurants?.length > 0 && (
                    <div>
                      <p className="font-ui text-xs uppercase tracking-[0.3em] text-[var(--text-muted)]">Restaurants</p>
                      <div className="mt-3 space-y-2">
                        {itinerary.recommendations.restaurants.map((item, index) => (
                          <div key={index} className="rounded-[18px] border border-[var(--border)] bg-white/4 p-3 text-sm text-[#f2ede4]">
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {itinerary.recommendations.hotels?.length > 0 && (
                    <div>
                      <p className="font-ui text-xs uppercase tracking-[0.3em] text-[var(--text-muted)]">Hotels</p>
                      <div className="mt-3 space-y-2">
                        {itinerary.recommendations.hotels.map((item, index) => (
                          <div key={index} className="rounded-[18px] border border-[var(--border)] bg-white/4 p-3 text-sm text-[#f2ede4]">
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {itinerary.recommendations.attractions?.length > 0 && (
                    <div>
                      <p className="font-ui text-xs uppercase tracking-[0.3em] text-[var(--text-muted)]">Attractions</p>
                      <div className="mt-3 space-y-2">
                        {itinerary.recommendations.attractions.map((item, index) => (
                          <div key={index} className="rounded-[18px] border border-[var(--border)] bg-white/4 p-3 text-sm text-[#f2ede4]">
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </section>
            )}

            {itinerary.documents?.length > 0 && (
              <section className="surface-card rounded-[28px] p-6">
                <button onClick={() => setExpandedDocs(!expandedDocs)} className="flex w-full items-center justify-between">
                  <h2 className="font-display text-3xl text-[#f2ede4]">
                    Documents ({itinerary.documents.length})
                  </h2>
                  {expandedDocs ? <ChevronUp className="h-5 w-5 text-[var(--text-muted)]" /> : <ChevronDown className="h-5 w-5 text-[var(--text-muted)]" />}
                </button>

                {expandedDocs && (
                  <div className="mt-5 space-y-3">
                    {itinerary.documents.map((doc, index) => (
                      <a
                        key={index}
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between rounded-[20px] border border-[var(--border)] bg-white/4 p-3 transition-all hover:border-[#d4a853]/25"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-[#d4a853]" />
                          <span className="truncate text-sm text-[#f2ede4]">{doc.name}</span>
                        </div>
                        <ExternalLink className="h-4 w-4 text-[var(--text-muted)]" />
                      </a>
                    ))}
                  </div>
                )}
              </section>
            )}

            <section className="surface-card rounded-[28px] p-6">
              <h2 className="font-display text-4xl text-[#f2ede4]">Quick actions</h2>
              <div className="mt-5 space-y-3">
                <button className="travel-button travel-button-ghost w-full justify-between">
                  <span>Edit itinerary</span>
                  <ExternalLink className="h-4 w-4" />
                </button>
                <button className="travel-button travel-button-gold w-full justify-between">
                  <span>Download PDF</span>
                  <Download className="h-4 w-4" />
                </button>
                <Link to="/" className="travel-button travel-button-ghost w-full justify-between">
                  <span>Back to dashboard</span>
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  )
}

export default ItineraryDetailPage

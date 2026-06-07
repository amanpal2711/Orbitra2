import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { format } from 'date-fns'
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Clock,
  DollarSign,
  Share2,
  Download,
  Plane,
  Hotel,
  User,
  Hash,
  Loader2,
  ChevronDown,
  ChevronUp,
  Sun,
  Moon,
  FileText,
  ExternalLink,
  CheckCircle,
  AlertTriangle,
  Info,
} from 'lucide-react'
import Navbar from '../components/Navbar'
import api from '../utils/api'
import { normalizeItinerary, unwrapApiData } from '../utils/normalizeItinerary'
import toast from 'react-hot-toast'

// Time of day color coding
const timeOfDayStyles = {
  morning: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    badge: 'bg-amber-100 text-amber-700',
    icon: Sun,
    iconColor: 'text-amber-500',
  },
  afternoon: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    badge: 'bg-blue-100 text-blue-700',
    icon: Sun,
    iconColor: 'text-blue-500',
  },
  evening: {
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    badge: 'bg-purple-100 text-purple-700',
    icon: Moon,
    iconColor: 'text-purple-500',
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
      if (normalized?.days && normalized.days.length > 0) {
        setActiveDay(0)
      }
    } catch (error) {
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
      } else {
        const el = document.createElement('textarea')
        el.value = shareUrl
        document.body.appendChild(el)
        el.select()
        document.execCommand('copy')
        document.body.removeChild(el)
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
    const hour = parseInt(time.split(':')[0])
    if (hour < 12) return 'morning'
    if (hour < 17) return 'afternoon'
    return 'evening'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading your itinerary...</p>
        </div>
      </div>
    )
  }

  if (!itinerary) {
    return null
  }

  const duration = Math.ceil(
    (new Date(itinerary.endDate) - new Date(itinerary.startDate)) / (1000 * 60 * 60 * 24)
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Link */}
        <Link
          to="/"
          className="inline-flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors mb-6"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="font-medium">Back to Dashboard</span>
        </Link>

        {/* Hero Section */}
        <div className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 rounded-3xl shadow-2xl p-8 md:p-12 mb-8 overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

          <div className="relative z-10">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-4">
                  <span className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-sm font-medium rounded-full">
                    {duration} Day{duration > 1 ? 's' : ''} Trip
                  </span>
                  {itinerary.preferences && (
                    <span className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-sm font-medium rounded-full">
                      {itinerary.preferences}
                    </span>
                  )}
                </div>

                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                  {itinerary.destination}
                </h1>

                <div className="flex flex-wrap items-center gap-6 text-white/90">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5" />
                    <span className="font-medium">
                      {format(new Date(itinerary.startDate), 'MMM d, yyyy')} -{' '}
                      {format(new Date(itinerary.endDate), 'MMM d, yyyy')}
                    </span>
                  </div>

                  {itinerary.budget && (
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-5 w-5" />
                      <span className="font-medium">
                        ${itinerary.budget.toLocaleString()} estimated
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleShare}
                  disabled={sharing}
                  className="flex items-center space-x-2 px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-colors disabled:opacity-50"
                >
                  {sharing ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Share2 className="h-5 w-5" />
                  )}
                  <span className="font-medium">Share</span>
                </button>

                <button className="flex items-center space-x-2 px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-colors">
                  <Download className="h-5 w-5" />
                  <span className="font-medium">PDF</span>
                </button>
              </div>
            </div>

            {/* Booking Reference Summary */}
            {itinerary.bookingReference && (
              <div className="mt-6 pt-6 border-t border-white/20">
                <div className="flex items-center space-x-2 text-white/80">
                  <Hash className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    Booking Reference: {itinerary.bookingReference}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Trip Overview Card */}
            {(itinerary.airline || itinerary.hotel || itinerary.travelerName) && (
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mr-3">
                    <Info className="h-5 w-5 text-blue-600" />
                  </div>
                  Trip Overview
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {itinerary.airline && (
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Plane className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Airline</p>
                        <p className="font-semibold text-gray-800">{itinerary.airline}</p>
                        {itinerary.flightNumber && (
                          <p className="text-sm text-gray-500">
                            Flight: {itinerary.flightNumber}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {itinerary.hotel && (
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Hotel className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Hotel</p>
                        <p className="font-semibold text-gray-800">{itinerary.hotel}</p>
                        {itinerary.checkIn && itinerary.checkOut && (
                          <p className="text-sm text-gray-500">
                            {format(new Date(itinerary.checkIn), 'MMM d')} -{' '}
                            {format(new Date(itinerary.checkOut), 'MMM d, yyyy')}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {itinerary.travelerName && (
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <User className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Traveler</p>
                        <p className="font-semibold text-gray-800">{itinerary.travelerName}</p>
                      </div>
                    </div>
                  )}

                  {itinerary.bookingReference && (
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Hash className="h-5 w-5 text-amber-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Booking Reference</p>
                        <p className="font-semibold text-gray-800 font-mono">
                          {itinerary.bookingReference}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Day-by-Day Itinerary Timeline */}
            {itinerary.days && itinerary.days.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                  <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center mr-3">
                    <Calendar className="h-5 w-5 text-purple-600" />
                  </div>
                  Day-by-Day Itinerary
                </h2>

                {/* Day Tabs */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {itinerary.days.map((day, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveDay(index)}
                      className={`px-4 py-2 rounded-xl font-medium transition-all ${
                        activeDay === index
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      Day {index + 1}
                    </button>
                  ))}
                </div>

                {/* Active Day Content */}
                {itinerary.days[activeDay] && (
                  <div className="space-y-4">
                    <div className="mb-4">
                      <h3 className="text-xl font-bold text-gray-800">
                        {itinerary.days[activeDay].title || `Day ${activeDay + 1}`}
                      </h3>
                      {itinerary.days[activeDay].description && (
                        <p className="text-gray-600 mt-1">
                          {itinerary.days[activeDay].description}
                        </p>
                      )}
                    </div>

                    {itinerary.days[activeDay].activities &&
                      itinerary.days[activeDay].activities.map((activity, actIndex) => {
                        const timeOfDay = getTimeOfDay(activity.time || '12:00')
                        const style = timeOfDayStyles[timeOfDay]
                        const TimeIcon = style.icon

                        return (
                          <div
                            key={actIndex}
                            className={`p-4 rounded-xl border-l-4 ${style.bg} ${style.border} transition-all hover:shadow-md`}
                          >
                            <div className="flex items-start gap-4">
                              <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${style.badge}`}>
                                <TimeIcon className={`h-6 w-6 ${style.iconColor}`} />
                              </div>

                              <div className="flex-1">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${style.badge}`}>
                                        {activity.time || 'All Day'}
                                      </span>
                                      {activity.duration && (
                                        <span className="flex items-center text-xs text-gray-500">
                                          <Clock className="h-3 w-3 mr-1" />
                                          {activity.duration}
                                        </span>
                                      )}
                                    </div>

                                    <h4 className="text-lg font-bold text-gray-800">
                                      {activity.name}
                                    </h4>

                                    {activity.location && (
                                      <p className="flex items-center text-sm text-gray-500 mt-1">
                                        <MapPin className="h-4 w-4 mr-1" />
                                        {activity.location}
                                      </p>
                                    )}

                                    {activity.description && (
                                      <p className="text-gray-600 text-sm mt-2">
                                        {activity.description}
                                      </p>
                                    )}

                                    {activity.tips && (
                                      <p className="text-gray-500 text-sm italic mt-2 flex items-center">
                                        <AlertTriangle className="h-4 w-4 mr-1 flex-shrink-0" />
                                        {activity.tips}
                                      </p>
                                    )}
                                  </div>

                                  {activity.cost && (
                                    <div className="text-right flex-shrink-0">
                                      <p className="text-sm text-gray-500">Est. Cost</p>
                                      <p className="text-lg font-bold text-gray-800">
                                        ${activity.cost}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                  </div>
                )}
              </div>
            )}

            {/* Travel Tips Section (Expandable) */}
            {itinerary.travelTips && itinerary.travelTips.length > 0 &&(
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <button
                  onClick={() => setExpandedTips(!expandedTips)}
                  className="w-full flex items-center justify-between"
                >
                  <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                    <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mr-3">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    Travel Tips
                  </h2>
                  {expandedTips ? (
                    <ChevronUp className="h-5 w-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                  )}
                </button>

                {expandedTips && (
                  <div className="mt-6 space-y-3">
                    {itinerary.travelTips.map((tip, index) => (
                      <div
                        key={index}
                        className="flex items-start space-x-3 p-3 bg-green-50 rounded-xl"
                      >
                        <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <p className="text-gray-700">{tip}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Recommendations */}
            {itinerary.recommendations && (
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <h2 className="text-xl font-bold text-gray-800 mb-6">Recommendations</h2>

                {itinerary.recommendations.restaurants && (
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                      Restaurants
                    </h3>
                    <ul className="space-y-2">
                      {itinerary.recommendations.restaurants.map((restaurant, index) => (
                        <li
                          key={index}
                          className="flex items-center space-x-2 text-gray-700"
                        >
                          <span className="w-1.5 h-1.5 bg-amber-400 rounded-full" />
                          <span>{restaurant}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {itinerary.recommendations.hotels && (
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                      Hotels
                    </h3>
                    <ul className="space-y-2">
                      {itinerary.recommendations.hotels.map((hotel, index) => (
                        <li
                          key={index}
                          className="flex items-center space-x-2 text-gray-700"
                        >
                          <span className="w-1.5 h-1.5 bg-purple-400 rounded-full" />
                          <span>{hotel}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {itinerary.recommendations.attractions && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                      Must-See Attractions
                    </h3>
                    <ul className="space-y-2">
                      {itinerary.recommendations.attractions.map((attraction, index) => (
                        <li
                          key={index}
                          className="flex items-center space-x-2 text-gray-700"
                        >
                          <span className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                          <span>{attraction}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Uploaded Documents (Expandable) */}
            {itinerary.documents && itinerary.documents.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <button
                  onClick={() => setExpandedDocs(!expandedDocs)}
                  className="w-full flex items-center justify-between"
                >
                  <h2 className="text-xl font-bold text-gray-800 flex items-center">
                    <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center mr-3">
                      <FileText className="h-5 w-5 text-gray-600" />
                    </div>
                    Documents ({itinerary.documents.length})
                  </h2>
                  {expandedDocs ? (
                    <ChevronUp className="h-5 w-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                  )}
                </button>

                {expandedDocs && (
                  <div className="mt-6 space-y-3">
                    {itinerary.documents.map((doc, index) => (
                      <a
                        key={index}
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <FileText className="h-5 w-5 text-gray-500" />
                          <span className="text-sm font-medium text-gray-700 truncate max-w-xs">
                            {doc.name}
                          </span>
                        </div>
                        <ExternalLink className="h-4 w-4 text-gray-400" />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-lg p-6 text-white">
              <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <button className="w-full flex items-center justify-between px-4 py-3 bg-white/20 backdrop-blur-sm rounded-xl hover:bg-white/30 transition-colors">
                  <span className="font-medium">Edit Itinerary</span>
                  <ExternalLink className="h-4 w-4" />
                </button>
                <button className="w-full flex items-center justify-between px-4 py-3 bg-white/20 backdrop-blur-sm rounded-xl hover:bg-white/30 transition-colors">
                  <span className="font-medium">Download PDF</span>
                  <Download className="h-4 w-4" />
                </button>
                <Link
                  to="/"
                  className="w-full flex items-center justify-between px-4 py-3 bg-white/20 backdrop-blur-sm rounded-xl hover:bg-white/30 transition-colors"
                >
                  <span className="font-medium">Back to Dashboard</span>
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ItineraryDetailPage

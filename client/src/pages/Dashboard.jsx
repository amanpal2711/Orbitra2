import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import {
  Plus,
  MapPin,
  Calendar,
  Share2,
  Trash2,
  Globe,
  FileText,
  Sparkles,
  Plane,
  Clock,
  Loader2,
} from 'lucide-react'
import Navbar from '../components/Navbar'
import useAuthStore from '../stores/authStore'
import api from '../utils/api'
import { normalizeItinerary, unwrapApiData } from '../utils/normalizeItinerary'
import toast from 'react-hot-toast'

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
  const { user } = useAuthStore()
  const [itineraries, setItineraries] = useState([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState(null)
  const [stats, setStats] = useState({ total: 0, thisMonth: 0, countries: 0 })

  useEffect(() => {
    fetchItineraries()
  }, [])

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
    } catch (error) {
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
        toast.success('Share link copied to clipboard!')
      } else {
        toast.success(`Share URL: ${shareUrl}`)
      }
    } catch (error) {
      toast.error('Failed to generate share link')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading your itineraries...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Welcome back, {user?.name?.split(' ')[0] || 'Traveler'}!
          </h1>
          <p className="text-gray-600">
            Ready to plan your next adventure?
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium mb-1">Total Itineraries</p>
                <p className="text-3xl font-bold text-gray-800">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium mb-1">This Month</p>
                <p className="text-3xl font-bold text-gray-800">{stats.thisMonth}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium mb-1">Countries Visited</p>
                <p className="text-3xl font-bold text-gray-800">{stats.countries}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Globe className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">Your Itineraries</h2>
          <Link
            to="/generate"
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
          >
            <Plus className="h-5 w-5" />
            <span>Generate New Itinerary</span>
          </Link>
        </div>

        {/* Itineraries Grid */}
        {itineraries.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-2xl shadow-sm p-12 border border-gray-100 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Plane className="h-12 w-12 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">
                No itineraries yet
              </h3>
              <p className="text-gray-600 mb-8">
                Start your travel planning journey by creating your first AI-powered
                itinerary. Just upload your travel documents and let the magic happen!
              </p>
              <Link
                to="/generate"
                className="inline-flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
              >
                <Sparkles className="h-5 w-5" />
                <span>Create Your First Itinerary</span>
              </Link>
            </div>
          </div>
        ) : (
          /* Itineraries Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {itineraries.map((itinerary) => (
              <Link
                key={itinerary._id}
                to={`/itinerary/${itinerary._id}`}
                className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:border-blue-200 transition-all duration-300"
              >
                {/* Card Thumbnail */}
                <div className="relative h-40 bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                      <MapPin className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center space-x-3">
                    <button
                      onClick={(e) => handleShare(e, itinerary._id)}
                      className="p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
                      title="Share"
                    >
                      <Share2 className="h-5 w-5 text-white" />
                    </button>
                    <button
                      onClick={(e) => handleDelete(e, itinerary._id)}
                      disabled={deletingId === itinerary._id}
                      className="p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-red-500/50 transition-colors disabled:opacity-50"
                      title="Delete"
                    >
                      {deletingId === itinerary._id ? (
                        <Loader2 className="h-5 w-5 text-white animate-spin" />
                      ) : (
                        <Trash2 className="h-5 w-5 text-white" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-5">
                  <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-1">
                    {itinerary.destination}
                  </h3>
                  
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>
                        {itinerary.createdAt
                        ? format(new Date(itinerary.createdAt), "MMM dd, yyyy")
                        : "Date unavailable"}
                      </span>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="h-4 w-4 mr-2" />
                      <span>
                        {Math.max(
                          1,
                          Math.ceil(
                            (new Date(itinerary.endDate) - new Date(itinerary.startDate)) /
                              (1000 * 60 * 60 * 24)
                          )
                        )}{' '}
                        days
                      </span>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-500">
                      <Plane className="h-4 w-4 mr-2" />
                      <span>
                        Created {format(new Date(itinerary.createdAt), 'MMM d, yyyy')}
                      </span>
                    </div>
                  </div>

                  {/* Preferences tags */}
                  {itinerary.preferences && (
                    <div className="mt-4 flex flex-wrap gap-1">
                      {itinerary.preferences.split(',').slice(0, 3).map((pref, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-50 text-blue-600 text-xs font-medium rounded-full"
                        >
                          {pref.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard

import { useState, useCallback, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDropzone } from 'react-dropzone'
import {
  Upload,
  FileText,
  Image,
  X,
  Sparkles,
  MapPin,
  Loader2,
  CheckCircle,
  AlertCircle,
  File,
  Trash2,
} from 'lucide-react'
import api from '../utils/api'
import { unwrapApiData } from '../utils/normalizeItinerary'
import toast from 'react-hot-toast'

const MAX_FILES = 5
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

const ACCEPTED_FILE_TYPES = {
  'application/pdf': ['.pdf'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
}

function UploadPage() {
  const [files, setFiles] = useState([])
  const [destination, setDestination] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [preferences, setPreferences] = useState('')
  const [loading, setLoading] = useState(false)
  const [progressStep, setProgressStep] = useState(0)
  const filesRef = useRef([])
  const navigate = useNavigate()

  useEffect(() => {
    filesRef.current = files
  }, [files])

  useEffect(() => {
    return () => {
      filesRef.current.forEach((file) => {
        if (file.preview) {
          URL.revokeObjectURL(file.preview)
        }
      })
    }
  }, [])

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    // Handle rejected files
    if (rejectedFiles.length > 0) {
      rejectedFiles.forEach((file) => {
        if (file.errors[0]?.code === 'file-too-large') {
          toast.error(`${file.file.name} is too large. Max size is 10MB.`)
        } else if (file.errors[0]?.code === 'file-invalid-type') {
          toast.error(`${file.file.name} is not a supported file type.`)
        }
      })
    }

    // Check if we exceed max files
    const totalFiles = files.length + acceptedFiles.length
    if (totalFiles > MAX_FILES) {
      toast.error(`You can only upload a maximum of ${MAX_FILES} files.`)
      return
    }

    // Add accepted files with preview URLs for images
    const newFiles = acceptedFiles.map((file) =>
      Object.assign(file, {
        preview: file.type.startsWith('image/')
          ? URL.createObjectURL(file)
          : null,
        formattedSize: formatFileSize(file.size),
      })
    )

    setFiles((prev) => [...prev, ...newFiles])
  }, [files])

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    accept: ACCEPTED_FILE_TYPES,
    maxFiles: MAX_FILES,
    maxSize: MAX_FILE_SIZE,
    onDrop,
  })

  const removeFile = (fileToRemove) => {
    setFiles((prev) => {
      const newFiles = prev.filter((file) => file !== fileToRemove)
      // Revoke preview URL to avoid memory leak
      if (fileToRemove.preview) {
        URL.revokeObjectURL(fileToRemove.preview)
      }
      return newFiles
    })
  }

  const removeAllFiles = () => {
    files.forEach((file) => {
      if (file.preview) {
        URL.revokeObjectURL(file.preview)
      }
    })
    setFiles([])
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (files.length === 0) {
      toast.error('Please upload at least one file')
      return
    }

    if (!destination || !startDate || !endDate) {
      toast.error('Please fill in all required trip details')
      return
    }

    setLoading(true)
    setProgressStep(1)
    let stepTimer

    try {
      const formData = new FormData()
      files.forEach((file) => {
        formData.append('documents', file)
      })
      formData.append('destination', destination)
      formData.append('startDate', startDate)
      formData.append('endDate', endDate)
      if (preferences) {
        formData.append('preferences', preferences)
      }

      // Simulate step progression for better UX
      stepTimer = setInterval(() => {
        setProgressStep((prev) => Math.min(prev + 1, 3))
      }, 1500)

      const response = await api.post('/itineraries/generate', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      clearInterval(stepTimer)
      setProgressStep(3)

      toast.success('Itinerary generated successfully!')
      const created = unwrapApiData(response)
      navigate(`/itinerary/${created._id}`)
    } catch (error) {
      setProgressStep(0)
      toast.error(error.response?.data?.message || 'Failed to generate itinerary')
    } finally {
      if (stepTimer) {
        clearInterval(stepTimer)
      }
      setLoading(false)
    }
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (file) => {
    if (file.type === 'application/pdf') {
      return <FileText className="h-8 w-8 text-red-500" />
    }
    if (file.type.startsWith('image/')) {
      return <Image className="h-8 w-8 text-blue-500" />
    }
    return <File className="h-8 w-8 text-gray-500" />
  }

  const progressSteps = [
    { label: 'Uploading documents...', icon: Upload },
    { label: 'Extracting booking details...', icon: Sparkles },
    { label: 'Generating your itinerary...', icon: MapPin },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <header className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl mb-4 shadow-lg">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Generate Your Itinerary
          </h1>
          <p className="text-gray-600 max-w-lg mx-auto">
            Upload your travel documents (flight confirmations, hotel bookings, etc.) and let our AI
            create a personalized itinerary for you.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Trip Details Card */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
              <MapPin className="h-5 w-5 mr-2 text-blue-600" />
              Trip Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="destination" className="text-sm font-medium text-gray-700">
                  Destination <span className="text-red-500">*</span>
                </label>
                <input
                  id="destination"
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="e.g., Paris, France"
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="startDate" className="text-sm font-medium text-gray-700">
                  Start Date <span className="text-red-500">*</span>
                </label>
                <input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="endDate" className="text-sm font-medium text-gray-700">
                  End Date <span className="text-red-500">*</span>
                </label>
                <input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="preferences" className="text-sm font-medium text-gray-700">
                  Preferences (Optional)
                </label>
                <input
                  id="preferences"
                  type="text"
                  value={preferences}
                  onChange={(e) => setPreferences(e.target.value)}
                  placeholder="e.g., vegetarian, museums, adventure"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>
          </div>

          {/* File Upload Card */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                <Upload className="h-5 w-5 mr-2 text-blue-600" />
                Upload Documents
              </h2>
              {files.length > 0 && (
                <button
                  type="button"
                  onClick={removeAllFiles}
                  className="text-sm text-red-500 hover:text-red-700 flex items-center transition-colors"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Remove All
                </button>
              )}
            </div>

            {/* Dropzone */}
            <div
              {...getRootProps()}
              className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 ${
                isDragActive
                  ? 'border-blue-500 bg-blue-50 scale-[1.02]'
                  : isDragReject
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
              }`}
            >
              <input {...getInputProps()} />
              
              <div className="flex flex-col items-center">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-all ${
                  isDragActive ? 'bg-blue-100' : 'bg-gray-100'
                }`}>
                  <Upload className={`h-8 w-8 ${isDragActive ? 'text-blue-600' : 'text-gray-400'}`} />
                </div>
                
                <p className="text-lg font-medium text-gray-700 mb-2">
                  {isDragActive
                    ? 'Drop your files here...'
                    : 'Drag & drop files here, or click to select'}
                </p>
                
                <p className="text-sm text-gray-500 mb-4">
                  Maximum {MAX_FILES} files, up to 10MB each
                </p>

                {/* Supported format badges */}
                <div className="flex flex-wrap justify-center gap-2">
                  {['PDF', 'JPG', 'PNG', 'WebP'].map((format) => (
                    <span
                      key={format}
                      className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full"
                    >
                      {format}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* File List */}
            {files.length > 0 && (
              <div className="mt-6 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-600">
                    {files.length} of {MAX_FILES} files uploaded
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {files.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center p-3 bg-gray-50 rounded-xl border border-gray-200 hover:border-blue-300 transition-colors"
                    >
                      {/* Thumbnail or Icon */}
                      <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-white flex items-center justify-center border border-gray-200 overflow-hidden">
                        {file.preview ? (
                          <img
                            src={file.preview}
                            alt={file.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          getFileIcon(file)
                        )}
                      </div>

                      {/* File Info */}
                      <div className="ml-3 flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">
                          {file.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {file.formattedSize} • {file.type || 'Unknown type'}
                        </p>
                      </div>

                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={() => removeFile(file)}
                        className="ml-2 p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Progress Indicator */}
          {loading && (
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">
                Generating Your Itinerary
              </h2>

              <div className="space-y-4">
                {progressSteps.map((step, index) => {
                  const Icon = step.icon
                  const isActive = index === progressStep
                  const isCompleted = index < progressStep
                  const isPending = index > progressStep

                  return (
                    <div
                      key={index}
                      className={`flex items-center p-4 rounded-xl transition-all duration-500 ${
                        isActive
                          ? 'bg-blue-50 border-2 border-blue-200'
                          : isCompleted
                          ? 'bg-green-50 border-2 border-green-200'
                          : 'bg-gray-50 border-2 border-gray-100'
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 transition-all ${
                          isActive
                            ? 'bg-blue-100 text-blue-600 animate-pulse'
                            : isCompleted
                            ? 'bg-green-100 text-green-600'
                            : 'bg-gray-100 text-gray-400'
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle className="h-5 w-5" />
                        ) : isActive ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <Icon className="h-5 w-5" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p
                          className={`font-medium ${
                            isActive
                              ? 'text-blue-800'
                              : isCompleted
                              ? 'text-green-800'
                              : 'text-gray-400'
                          }`}
                        >
                          {step.label}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Submit Button */}
          {!loading && (
            <button
              type="submit"
              disabled={files.length === 0 || !destination || !startDate || !endDate}
              className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center space-x-3"
            >
              <Sparkles className="h-5 w-5" />
              <span>Generate Itinerary with AI</span>
            </button>
          )}
        </form>

        {/* Footer Info */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 flex items-center justify-center">
            <AlertCircle className="h-4 w-4 mr-1" />
            Your documents are processed securely and deleted after itinerary generation.
          </p>
        </div>
      </div>
    </div>
  )
}

export default UploadPage

import { useState, useCallback, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDropzone } from 'react-dropzone'
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  File,
  FileText,
  Image,
  Loader2,
  MapPinned,
  Sparkles,
  Trash2,
  Upload,
  X,
} from 'lucide-react'
import api from '../utils/api'
import { unwrapApiData } from '../utils/normalizeItinerary'
import toast from 'react-hot-toast'

const MAX_FILES = 5
const MAX_FILE_SIZE = 10 * 1024 * 1024

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

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
  }

  const onDrop = useCallback(
    (acceptedFiles, rejectedFiles) => {
      if (rejectedFiles.length > 0) {
        rejectedFiles.forEach((file) => {
          if (file.errors[0]?.code === 'file-too-large') {
            toast.error(`${file.file.name} is too large. Max size is 10MB.`)
          } else if (file.errors[0]?.code === 'file-invalid-type') {
            toast.error(`${file.file.name} is not a supported file type.`)
          }
        })
      }

      const totalFiles = filesRef.current.length + acceptedFiles.length
      if (totalFiles > MAX_FILES) {
        toast.error(`You can only upload a maximum of ${MAX_FILES} files.`)
        return
      }

      const newFiles = acceptedFiles.map((file) =>
        Object.assign(file, {
          preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
          formattedSize: formatFileSize(file.size),
        })
      )

      setFiles((prev) => [...prev, ...newFiles])
    },
    []
  )

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    accept: ACCEPTED_FILE_TYPES,
    maxFiles: MAX_FILES,
    maxSize: MAX_FILE_SIZE,
    onDrop,
  })

  const removeFile = (fileToRemove) => {
    setFiles((prev) => {
      const next = prev.filter((file) => file !== fileToRemove)
      if (fileToRemove.preview) {
        URL.revokeObjectURL(fileToRemove.preview)
      }
      return next
    })
  }

  const removeAllFiles = () => {
    files.forEach((file) => {
      if (file.preview) URL.revokeObjectURL(file.preview)
    })
    setFiles([])
  }

  const getFileIcon = (file) => {
    if (file.type === 'application/pdf') {
      return <FileText className="h-8 w-8 text-[#e76f51]" />
    }
    if (file.type.startsWith('image/')) {
      return <Image className="h-8 w-8 text-[#2e8b7a]" />
    }
    return <File className="h-8 w-8 text-[var(--text-muted)]" />
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

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

      stepTimer = window.setInterval(() => {
        setProgressStep((prev) => Math.min(prev + 1, 3))
      }, 1400)

      const response = await api.post('/itineraries/generate', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      window.clearInterval(stepTimer)
      setProgressStep(3)

      toast.success('Itinerary generated successfully')
      const created = unwrapApiData(response)
      navigate(`/itinerary/${created._id}`)
    } catch (error) {
      setProgressStep(0)
      toast.error(error.response?.data?.message || 'Failed to generate itinerary')
    } finally {
      if (stepTimer) window.clearInterval(stepTimer)
      setLoading(false)
    }
  }

  const progressSteps = [
    { label: 'Uploading documents', icon: Upload },
    { label: 'Extracting details', icon: Sparkles },
    { label: 'Generating itinerary', icon: MapPinned },
  ]

  return (
    <div className="min-h-screen bg-[var(--bg-base)] px-4 py-6 text-[#f2ede4]">
      <div className="section-shell">
        <div className="mb-6 flex items-center justify-between gap-4">
          <Link to="/" className="travel-button travel-button-ghost">
            <ArrowLeft className="h-4 w-4" />
            Back to dashboard
          </Link>
            <div className="hidden items-center gap-2 rounded-full border border-[var(--border)] bg-white/4 px-4 py-2 font-ui text-xs uppercase tracking-[0.3em] text-[var(--text-muted)] md:flex">
            <Upload className="h-4 w-4 text-[#d4a853]" />
            Generate wizard
          </div>
        </div>

        <form onSubmit={handleSubmit} className="surface-card overflow-hidden rounded-[32px] p-6 md:p-8">
          <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <div>
              <p className="section-kicker">Generate itinerary</p>
              <h1 className="mt-3 font-display text-[clamp(3rem,5vw,5.2rem)] leading-[0.95]">
                Upload documents and let Gemini shape the trip.
              </h1>
              <p className="mt-4 max-w-2xl text-lg leading-8 text-[var(--text-muted)]">
                Start with your destination, dates, and travel documents. Orbitra will produce a
                structured itinerary that feels polished and ready to share.
              </p>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                {[
                  ['01', 'Trip details'],
                  ['02', 'Document upload'],
                  ['03', 'AI generation'],
                ].map(([num, label]) => (
                  <div key={num} className="rounded-[24px] border border-[var(--border)] bg-white/4 p-4">
                    <p className="font-display text-4xl text-[#d4a853]">{num}</p>
                    <p className="mt-3 font-ui text-xs uppercase tracking-[0.3em] text-[var(--text-muted)]">
                      {label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[28px] border border-[var(--border)] bg-[rgba(8,10,9,0.8)] p-5">
              <h2 className="font-display text-4xl text-[#f2ede4]">Trip details</h2>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="mb-2 block font-ui text-xs uppercase tracking-[0.3em] text-[var(--text-muted)]">
                    Destination
                  </label>
                  <input
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="e.g., Paris, France"
                    className="travel-input"
                  />
                </div>

                <div>
                  <label className="mb-2 block font-ui text-xs uppercase tracking-[0.3em] text-[var(--text-muted)]">
                    Start date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="travel-input"
                  />
                </div>

                <div>
                  <label className="mb-2 block font-ui text-xs uppercase tracking-[0.3em] text-[var(--text-muted)]">
                    End date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="travel-input"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block font-ui text-xs uppercase tracking-[0.3em] text-[var(--text-muted)]">
                    Preferences
                  </label>
                  <input
                    type="text"
                    value={preferences}
                    onChange={(e) => setPreferences(e.target.value)}
                    placeholder="Food, adventure, accessibility, pacing..."
                    className="travel-input"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="rounded-[28px] border border-[var(--border)] bg-[rgba(8,10,9,0.8)] p-5">
              <div className="mb-5 flex items-center justify-between gap-4">
                <h2 className="font-display text-4xl text-[#f2ede4]">Upload documents</h2>
                {files.length > 0 && (
                  <button
                    type="button"
                    onClick={removeAllFiles}
                    className="travel-button travel-button-ghost"
                  >
                    <Trash2 className="h-4 w-4" />
                    Remove all
                  </button>
                )}
              </div>

              <div
                {...getRootProps()}
                className={`cursor-expand rounded-[28px] border-2 border-dashed p-8 text-center transition-all duration-300 ${
                  isDragActive
                    ? 'border-[#d4a853] bg-[#d4a853]/8'
                    : isDragReject
                    ? 'border-[#e76f51] bg-[#e76f51]/8'
                    : 'border-[var(--border)] bg-white/4 hover:border-[#d4a853]/30 hover:bg-white/5'
                }`}
              >
                <input {...getInputProps()} />
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#d4a853]/10 text-[#d4a853]">
                  <Upload className="h-7 w-7" />
                </div>
                <p className="mt-5 font-display text-3xl text-[#f2ede4]">
                  {isDragActive ? 'Drop the files here' : 'Drag and drop, or click to browse'}
                </p>
                <p className="mt-2 text-sm text-[var(--text-muted)]">
                  Up to {MAX_FILES} files, max 10MB each. PDF, JPG, PNG, and WebP are supported.
                </p>
              </div>

              {files.length > 0 && (
                <div className="mt-5 grid gap-3 md:grid-cols-2">
                  {files.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 rounded-[22px] border border-[var(--border)] bg-white/4 p-3"
                    >
                      <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-base)]">
                        {file.preview ? (
                          <img src={file.preview} alt={file.name} className="h-full w-full object-cover" />
                        ) : (
                          getFileIcon(file)
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-[#f2ede4]">{file.name}</p>
                        <p className="text-xs text-[var(--text-muted)]">
                          {file.formattedSize} · {file.type || 'Unknown type'}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(file)}
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] bg-white/4 text-[var(--text-muted)] transition-all hover:text-[#e76f51]"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-[28px] border border-[var(--border)] bg-[rgba(8,10,9,0.8)] p-5">
              <div className="mb-5 flex items-center justify-between gap-4">
                <h2 className="font-display text-4xl text-[#f2ede4]">Generation status</h2>
                <div className="rounded-full border border-[#2e8b7a]/30 bg-[#2e8b7a]/10 px-3 py-1 font-ui text-[11px] uppercase tracking-[0.28em] text-[#2e8b7a]">
                  live
                </div>
              </div>

              {loading ? (
                <div className="space-y-3">
                  {progressSteps.map((step, index) => {
                    const Icon = step.icon
                    const isActive = index === progressStep
                    const isCompleted = index < progressStep

                    return (
                      <div
                        key={step.label}
                        className={`flex items-center gap-4 rounded-[22px] border p-4 ${
                          isActive
                            ? 'border-[#d4a853]/25 bg-[#d4a853]/8'
                            : isCompleted
                            ? 'border-[#2e8b7a]/25 bg-[#2e8b7a]/8'
                            : 'border-[var(--border)] bg-white/4'
                        }`}
                      >
                        <div
                          className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                            isActive
                              ? 'bg-[#d4a853]/12 text-[#d4a853]'
                              : isCompleted
                              ? 'bg-[#2e8b7a]/12 text-[#2e8b7a]'
                              : 'bg-white/4 text-[var(--text-muted)]'
                          }`}
                        >
                          {isCompleted ? <CheckCircle className="h-5 w-5" /> : isActive ? <Loader2 className="h-5 w-5 animate-spin" /> : <Icon className="h-5 w-5" />}
                        </div>
                        <div>
                          <p className="font-ui text-xs uppercase tracking-[0.28em] text-[var(--text-muted)]">
                            Step {index + 1}
                          </p>
                          <p className="mt-1 text-lg text-[#f2ede4]">{step.label}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="rounded-[26px] border border-[var(--border)] bg-[var(--bg-base)] p-5">
                  <p className="font-ui text-xs uppercase tracking-[0.3em] text-[var(--text-muted)]">
                    Ready to generate
                  </p>
                  <p className="mt-3 text-lg leading-8 text-[var(--text-muted)]">
                    Add your files and trip details, then launch the generator to create a
                    polished itinerary.
                  </p>
                  <div className="mt-6 rounded-[22px] border border-[var(--border)] bg-white/4 p-4">
                    <p className="text-sm leading-7 text-[#f2ede4]">
                      <strong className="text-[#d4a853]">Tip:</strong> Travel confirmations and
                      PDFs help the AI output better structured trips.
                    </p>
                  </div>
                </div>
              )}

              {!loading && (
                <button
                  type="submit"
                  disabled={files.length === 0 || !destination || !startDate || !endDate}
                  className="travel-button travel-button-gold mt-5 w-full justify-center py-4 text-base"
                >
                  <Sparkles className="h-5 w-5" />
                  Generate Itinerary
                </button>
              )}
            </div>
          </div>

          <div className="mt-6 rounded-[24px] border border-[var(--border)] bg-white/4 px-5 py-4 text-sm text-[var(--text-muted)]">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-4 w-4 text-[#d4a853]" />
              <p>Your documents are processed securely and are only used to generate your itinerary.</p>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default UploadPage

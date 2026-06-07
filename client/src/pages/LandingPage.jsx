import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Check,
  ChevronDown,
  Cloud,
  Compass,
  Globe2,
  Layers3,
  MapPinned,
  Menu,
  MoonStar,
  Sparkles,
  Star,
  Ticket,
  Wind,
} from 'lucide-react'
import Navbar from '../components/Navbar'
import useScrollReveal from '../hooks/useScrollReveal'

const tickerItems = [
  '4.9/5 traveler rating',
  '"Felt curated by a real concierge."',
  '"Saved me hours of planning."',
  '"Beautiful, calm, and genuinely useful."',
  '12k+ generated itineraries',
  'Cloudinary-powered uploads',
]

const howItWorks = [
  {
    number: '01',
    title: 'Upload your travel context',
    description: 'Drop confirmations, destination notes, and preference signals in one place.',
    icon: Cloud,
  },
  {
    number: '02',
    title: 'Let Gemini build the flow',
    description: 'Orbitra shapes timing, places, and pacing into a polished daily sequence.',
    icon: Sparkles,
  },
  {
    number: '03',
    title: 'Refine, share, and go',
    description: 'Export, collaborate, or claim a shared trip without losing the structure.',
    icon: Compass,
  },
]

const featureCards = [
  {
    title: 'Editorial itinerary previews',
    description: 'A magazine-like trip view with layered depth and a premium dark finish.',
    span: 'md:col-span-2',
    image:
      'https://res.cloudinary.com/demo/image/upload/v1690000000/samples/landscapes/girl-urban-view.jpg',
  },
  {
    title: 'Cloud uploads',
    description: 'JPG, PNG, WebP, and PDF travel documents flow directly into your trip.',
    icon: Cloud,
  },
  {
    title: 'Team-ready sharing',
    description: 'Share links, hand off trips, and keep the ownership model clear.',
    icon: Layers3,
  },
  {
    title: 'PDF export',
    description: 'Hand off a polished itinerary that feels designed, not generated.',
    icon: Ticket,
  },
  {
    title: 'AI-assisted pacing',
    description: 'Days stay balanced with enough breathing room to feel expensive.',
    icon: Wind,
  },
]

const testimonials = [
  {
    name: 'Maya Chen',
    location: 'Singapore',
    quote: 'Orbitra turned a messy set of confirmations into a trip I could trust.',
  },
  {
    name: 'Arjun Patel',
    location: 'Dubai',
    quote: 'The interface feels like a premium travel magazine, not a typical SaaS dashboard.',
  },
  {
    name: 'Sofia Laurent',
    location: 'Barcelona',
    quote: 'The shared itinerary flow is clean enough that my whole group actually used it.',
  },
]

const pricing = [
  {
    tier: 'Free',
    price: '$0',
    description: 'For testing the waters and planning a single polished trip.',
    features: ['3 itineraries', 'Basic export', 'Shared links'],
  },
  {
    tier: 'Pro',
    price: '$19',
    description: 'Best for frequent travelers who want a better planning ritual.',
    features: ['Unlimited itineraries', 'Priority generation', 'Advanced exports'],
    featured: true,
  },
  {
    tier: 'Team',
    price: '$49',
    description: 'For small groups, agencies, or families planning together.',
    features: ['Multi-user collaboration', 'Shared workspaces', 'Team controls'],
  },
]

function SectionReveal({ children, className = '' }) {
  const ref = useRef(null)
  useScrollReveal(ref)

  return (
    <div ref={ref} className={`reveal-ready ${className}`}>
      {children}
    </div>
  )
}

function LandingPage() {
  const [typedText, setTypedText] = useState('')
  const [testimonialIndex, setTestimonialIndex] = useState(1)
  const demoRef = useRef(null)
  const testimonialRailRef = useRef(null)
  const isDraggingRef = useRef(false)
  const dragStartRef = useRef({ x: 0, scrollLeft: 0 })

  const demoLines = useMemo(
    () => [
      'Day 1 - Arrival, coffee in the old quarter, and a sunset rooftop dinner.',
      'Day 2 - Gallery morning, long lunch, and a slow coastal evening.',
      'Day 3 - Market walk, spa pause, and a curated farewell meal.',
    ],
    []
  )

  useEffect(() => {
    const text = demoLines.join(' ')
    let index = 0
    let cancelled = false
    setTypedText('')

    const type = () => {
      if (cancelled) return
      index += 1
      setTypedText(text.slice(0, index))
      if (index < text.length) {
        window.setTimeout(type, 18)
      }
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          type()
        }
      },
      { threshold: 0.45 }
    )

    if (demoRef.current) {
      observer.observe(demoRef.current)
    }

    return () => {
      cancelled = true
      observer.disconnect()
    }
  }, [demoLines])

  const handleRailPointerDown = (event) => {
    const rail = testimonialRailRef.current
    if (!rail) return
    isDraggingRef.current = true
    rail.setPointerCapture?.(event.pointerId)
    dragStartRef.current = {
      x: event.clientX,
      scrollLeft: rail.scrollLeft,
    }
  }

  const handleRailPointerMove = (event) => {
    const rail = testimonialRailRef.current
    if (!rail || !isDraggingRef.current) return
    const delta = event.clientX - dragStartRef.current.x
    rail.scrollLeft = dragStartRef.current.scrollLeft - delta
  }

  const handleRailPointerUp = () => {
    isDraggingRef.current = false
    const next = (testimonialIndex + 1) % testimonials.length
    setTestimonialIndex(next)
  }

  return (
    <div id="top" className="relative">
      <Navbar />

      <main>
        <section className="relative min-h-[100dvh] overflow-hidden pt-24">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(46,139,122,0.2),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(212,168,83,0.12),transparent_32%)]" />
            <div className="noise-overlay" style={{ filter: 'url(#grain)' }} />
            <svg className="absolute h-0 w-0" aria-hidden="true">
              <filter id="grain">
                <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch" />
                <feColorMatrix type="saturate" values="0" />
              </filter>
            </svg>
          </div>

          <div className="section-shell relative z-10 grid min-h-[calc(100dvh-6rem)] items-center gap-12 pb-16 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="max-w-3xl">
              <p className="section-kicker mb-5">Luxury editorial travel SaaS</p>
              <h1 className="font-display text-[clamp(3.2rem,8vw,6.5rem)] leading-[0.92] text-[#f2ede4] text-balance">
                Your Journey,
                <br />
                Designed by <span className="text-[#d4a853]">AI</span>.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--text-muted)] font-ui">
                Orbitra generates personalized travel itineraries in seconds powered by Gemini AI,
                with a warmer, more cinematic interface that feels built for premium travel.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link to="/register" className="travel-button travel-button-gold">
                  Generate My Trip
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <a href="#demo" className="travel-button travel-button-ghost">
                  See a Demo
                </a>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-3 text-sm font-ui text-[var(--text-muted)]">
                <div className="flex items-center gap-2 rounded-full border border-[var(--border)] bg-white/5 px-3 py-2">
                  <Star className="h-4 w-4 text-[#d4a853]" />
                  4.9 traveler satisfaction
                </div>
                <div className="flex items-center gap-2 rounded-full border border-[var(--border)] bg-white/5 px-3 py-2">
                  <MapPinned className="h-4 w-4 text-[#2e8b7a]" />
                  AI-powered routes, docs, and sharing
                </div>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-[520px]">
              <div className="absolute -left-8 top-12 h-48 w-48 rounded-full bg-[#d4a853]/10 blur-3xl" />
              <div className="absolute -bottom-10 right-0 h-56 w-56 rounded-full bg-[#2e8b7a]/10 blur-3xl" />

              <div className="glass-panel relative overflow-hidden rounded-[28px] p-5">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="font-ui text-xs uppercase tracking-[0.35em] text-[var(--text-muted)]">
                      Live preview
                    </p>
                    <p className="mt-1 font-display text-3xl text-[#f2ede4]">Marrakech Escape</p>
                  </div>
                  <div className="rounded-full border border-[#d4a853]/30 bg-[#d4a853]/10 px-3 py-1 font-ui text-[11px] uppercase tracking-[0.28em] text-[#d4a853]">
                    AI live
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-[1.2fr_0.8fr]">
                  <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[#111311]">
                    <img
                      src="https://res.cloudinary.com/demo/image/upload/v1690000000/samples/landscapes/beach-boat.jpg"
                      alt="Trip preview"
                      className="aspect-[4/3] w-full object-cover opacity-90"
                      loading="lazy"
                    />
                  </div>

                  <div className="space-y-3">
                    {[
                      ['Day 1', 'Medina, tea ritual, rooftop dinner'],
                      ['Day 2', 'Museum morning, gardens, live music'],
                      ['Day 3', 'Spa reset, market walk, departure'],
                    ].map(([day, text], index) => (
                      <div
                        key={day}
                        className={`rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-4 ${
                          index === 1 ? 'shadow-glow' : ''
                        }`}
                      >
                        <p className="font-ui text-[11px] uppercase tracking-[0.3em] text-[#d4a853]">
                          {day}
                        </p>
                        <p className="mt-2 text-sm leading-6 text-[var(--text-primary)]">{text}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between rounded-2xl border border-[var(--border)] bg-[#101210] px-4 py-3">
                  <div>
                    <p className="font-ui text-xs uppercase tracking-[0.25em] text-[var(--text-muted)]">
                      Destination card
                    </p>
                    <p className="mt-1 text-sm text-[var(--text-primary)]">Warm gold. Soft teal. Calm pacing.</p>
                  </div>
                  <MoonStar className="h-5 w-5 text-[#d4a853]" />
                </div>
              </div>

              <div className="pointer-events-none absolute -left-4 top-20 hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-4 shadow-2xl md:block animate-slow-drift">
                <p className="font-ui text-[10px] uppercase tracking-[0.3em] text-[var(--text-muted)]">
                  Floating card
                </p>
                <p className="mt-2 font-display text-2xl text-[#f2ede4]">Kyoto morning walk</p>
              </div>
              <div className="pointer-events-none absolute -right-8 bottom-16 hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-4 shadow-2xl md:block animate-slow-drift">
                <p className="font-ui text-[10px] uppercase tracking-[0.3em] text-[var(--text-muted)]">
                  Floating card
                </p>
                <p className="mt-2 font-display text-2xl text-[#f2ede4]">Lisbon sunset dinner</p>
              </div>
            </div>
          </div>

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center font-ui text-[11px] uppercase tracking-[0.35em] text-[var(--text-muted)]">
            <ChevronDown className="mx-auto mb-2 h-5 w-5 animate-bounce text-[#d4a853]" />
            scroll to explore
          </div>
        </section>

        <section className="overflow-hidden border-y border-[var(--border)] bg-[var(--bg-surface)] py-5 -rotate-1">
          <div className="marquee-track whitespace-nowrap text-sm font-ui uppercase tracking-[0.3em] text-[var(--text-muted)]">
            {[...tickerItems, ...tickerItems].map((item, index) => (
              <div key={`${item}-${index}`} className="flex items-center gap-4 px-6">
                <span className="text-[#d4a853]">✦</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </section>

        <section id="how-it-works" className="section-shell py-28">
          <SectionReveal className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="lg:sticky lg:top-28 lg:self-start">
              <p className="section-kicker mb-4">How it works</p>
              <h2 className="section-title max-w-xl text-balance">Plan smarter. Travel better.</h2>
              <p className="section-copy mt-5 max-w-xl text-lg leading-8">
                Orbitra turns your travel documents and preferences into a polished itinerary with
                a premium editorial feel, so the planning stage becomes part of the experience.
              </p>
            </div>

            <div className="relative space-y-6">
              {howItWorks.map((step) => {
                const Icon = step.icon
                return (
                  <div
                    key={step.number}
                    className="surface-card relative overflow-hidden rounded-[24px] p-6 md:p-7"
                  >
                    <div className="absolute -right-5 -top-7 font-display text-[6rem] leading-none text-[#d4a853]/12">
                      {step.number}
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#d4a853]/20 bg-[#d4a853]/10 text-[#d4a853]">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-ui text-xs uppercase tracking-[0.32em] text-[#d4a853]">
                          {step.number}
                        </p>
                        <h3 className="mt-2 font-display text-3xl text-[#f2ede4]">{step.title}</h3>
                        <p className="mt-3 max-w-lg text-base leading-7 text-[var(--text-muted)]">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </SectionReveal>
        </section>

        <section id="features" className="section-shell py-10">
          <SectionReveal>
            <div className="grid gap-3 md:grid-cols-3">
              <div className="md:col-span-2">
                <div className="glass-panel flex h-full flex-col justify-between overflow-hidden rounded-[28px] p-5 md:p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <p className="section-kicker">Feature showcase</p>
                      <h2 className="mt-2 font-display text-4xl text-[#f2ede4]">
                        A bento grid with real travel utility.
                      </h2>
                    </div>
                    <Globe2 className="h-7 w-7 text-[#d4a853]" />
                  </div>
                  <div className="overflow-hidden rounded-[20px] border border-[var(--border)] bg-[#101210]">
                    <img
                      src="https://res.cloudinary.com/demo/image/upload/v1690000000/samples/landscapes/nature-mountains.jpg"
                      alt="Itinerary preview"
                      className="aspect-[16/9] w-full object-cover opacity-90"
                      loading="lazy"
                    />
                  </div>
                  <p className="mt-4 max-w-2xl text-[var(--text-muted)]">
                    This is the visual center of the product: a premium itinerary view, built to
                    feel calm, organized, and confidently designed.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {featureCards.slice(1, 3).map((card) => {
                  const Icon = card.icon
                  return (
                    <div key={card.title} className="surface-card rounded-[24px] p-5">
                      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl border border-[#d4a853]/20 bg-[#d4a853]/10 text-[#d4a853]">
                        <Icon className="h-5 w-5" />
                      </div>
                      <h3 className="font-display text-2xl text-[#f2ede4]">{card.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">{card.description}</p>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="mt-3 grid gap-3 md:grid-cols-3">
              {featureCards.slice(3).map((card) => {
                const Icon = card.icon
                return (
                  <div key={card.title} className="surface-card rounded-[24px] p-5">
                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl border border-[#d4a853]/20 bg-[#d4a853]/10 text-[#d4a853]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-display text-2xl text-[#f2ede4]">{card.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">{card.description}</p>
                  </div>
                )
              })}
            </div>
          </SectionReveal>
        </section>

        <section id="demo" className="section-shell py-28">
          <SectionReveal>
            <div
              ref={demoRef}
              className="grid gap-6 overflow-hidden rounded-[32px] border border-[var(--border)] bg-[linear-gradient(180deg,rgba(24,27,23,0.96),rgba(14,16,14,0.98))] p-5 md:p-6 lg:grid-cols-[0.95fr_1.05fr]"
            >
              <div className="surface-card rounded-[24px] p-5">
                <p className="section-kicker mb-3">Itinerary preview</p>
                <h2 className="font-display text-4xl text-[#f2ede4]">Generate, then refine.</h2>
                <div className="mt-6 space-y-4">
                  {['Destination', 'Dates', 'Budget', 'Preferences'].map((label) => (
                    <div key={label}>
                      <label className="mb-2 block font-ui text-xs uppercase tracking-[0.3em] text-[var(--text-muted)]">
                        {label}
                      </label>
                      <div className="travel-input flex items-center justify-between">
                        <span className="text-[var(--text-dim)]">
                          {label === 'Destination'
                            ? 'Marrakech, Morocco'
                            : label === 'Dates'
                            ? '12 Sep - 18 Sep'
                            : label === 'Budget'
                            ? '$2,400'
                            : 'Food, art, and rooftop dinners'}
                        </span>
                        <Menu className="h-4 w-4 text-[var(--text-dim)]" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="surface-card flex min-h-[460px] flex-col rounded-[24px] p-5">
                <div className="mb-4 flex items-center justify-between">
                  <p className="section-kicker">AI output</p>
                  <div className="rounded-full border border-[#2e8b7a]/30 bg-[#2e8b7a]/10 px-3 py-1 font-ui text-[11px] uppercase tracking-[0.25em] text-[#2e8b7a]">
                    generating
                  </div>
                </div>
                <div className="rounded-[22px] border border-[var(--border)] bg-[var(--bg-base)] p-5">
                  <p className="font-ui text-xs uppercase tracking-[0.35em] text-[#d4a853]">
                    Gemini is crafting your journey...
                  </p>
                  <p className="mt-4 min-h-[180px] text-lg leading-8 text-[#f2ede4]">
                    {typedText}
                    <span className="animate-type-blink text-[#d4a853]">|</span>
                  </p>
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  {[
                    'Morning gallery walk',
                    'Long lunch by the courtyard',
                    'Sunset dinner on the terrace',
                  ].map((item, index) => (
                    <div
                      key={item}
                      className={`rounded-2xl border border-[var(--border)] p-4 ${
                        index === 1 ? 'bg-[#d4a853]/8 shadow-glow' : 'bg-white/3'
                      }`}
                    >
                      <p className="font-ui text-[11px] uppercase tracking-[0.25em] text-[var(--text-muted)]">
                        Day {index + 1}
                      </p>
                      <p className="mt-2 text-sm text-[#f2ede4]">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </SectionReveal>
        </section>

        <section id="testimonials" className="section-shell py-20">
          <SectionReveal>
            <div className="mb-6 flex items-end justify-between gap-4">
              <div>
                <p className="section-kicker">Testimonials</p>
                <h2 className="section-title mt-2 text-4xl lg:text-5xl">Built to feel trusted.</h2>
              </div>
              <div className="hidden rounded-full border border-[var(--border)] px-4 py-2 font-ui text-xs uppercase tracking-[0.28em] text-[var(--text-muted)] md:block">
                Drag to explore
              </div>
            </div>

            <div
              ref={testimonialRailRef}
              onPointerDown={handleRailPointerDown}
              onPointerMove={handleRailPointerMove}
              onPointerUp={handleRailPointerUp}
              onPointerLeave={handleRailPointerUp}
              className="flex gap-4 overflow-x-auto pb-4 [scrollbar-width:none] snap-x snap-mandatory"
            >
              {testimonials.map((item, index) => (
                <article
                  key={item.name}
                  className={`min-w-[280px] flex-1 snap-center rounded-[24px] border p-5 transition-all md:min-w-[340px] ${
                    testimonialIndex === index
                      ? 'border-[#d4a853]/40 bg-[#d4a853]/8 shadow-glow'
                      : 'border-[var(--border)] bg-[var(--bg-surface)]'
                  }`}
                >
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#d4a853]/10 text-[#d4a853]">
                      {item.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-display text-2xl text-[#f2ede4]">{item.name}</h3>
                      <p className="font-ui text-xs uppercase tracking-[0.25em] text-[var(--text-muted)]">
                        {item.location}
                      </p>
                    </div>
                  </div>
                  <p className="text-[var(--text-muted)] leading-7">{item.quote}</p>
                  <div className="mt-4 flex items-center gap-1 text-[#d4a853]">
                    {[...Array(5)].map((_, starIndex) => (
                      <Star key={starIndex} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                </article>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-center gap-2">
              {testimonials.map((_, index) => (
                <span
                  key={index}
                  className={`h-2.5 rounded-full transition-all ${
                    testimonialIndex === index ? 'w-8 bg-[#d4a853]' : 'w-2.5 bg-white/20'
                  }`}
                />
              ))}
            </div>
          </SectionReveal>
        </section>

        <section id="pricing" className="section-shell py-24">
          <SectionReveal>
            <div className="mb-8 text-center">
              <p className="section-kicker">Pricing</p>
              <h2 className="section-title mt-3">Simple plans for every kind of traveler.</h2>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              {pricing.map((plan) => (
                <article
                  key={plan.tier}
                  className={`glass-panel rounded-[28px] p-6 ${
                    plan.featured ? 'border-[#d4a853]/40 shadow-glow' : ''
                  }`}
                >
                  {plan.featured && (
                    <div className="mb-4 inline-flex rounded-full border border-[#d4a853]/30 bg-[#d4a853]/10 px-3 py-1 font-ui text-[11px] uppercase tracking-[0.28em] text-[#d4a853]">
                      Most Popular
                    </div>
                  )}
                  <p className="font-ui text-xs uppercase tracking-[0.35em] text-[var(--text-muted)]">
                    {plan.tier}
                  </p>
                  <div className="mt-4 flex items-end gap-2">
                    <span className="font-display text-6xl text-[#f2ede4]">{plan.price}</span>
                    <span className="pb-2 font-ui text-sm uppercase tracking-[0.25em] text-[var(--text-muted)]">
                      / month
                    </span>
                  </div>
                  <p className="mt-4 text-[var(--text-muted)] leading-7">{plan.description}</p>
                  <ul className="mt-6 space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-3 text-sm text-[#f2ede4]">
                        <Check className="h-4 w-4 text-[#2e8b7a]" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Link
                    to="/register"
                    className={`mt-6 travel-button w-full ${
                      plan.featured ? 'travel-button-gold' : 'travel-button-ghost'
                    }`}
                  >
                    Choose {plan.tier}
                  </Link>
                </article>
              ))}
            </div>
          </SectionReveal>
        </section>

        <section className="section-shell pb-24 pt-10">
          <SectionReveal>
            <div className="relative overflow-hidden rounded-[32px] border border-[var(--border)]">
              <img
                src="https://res.cloudinary.com/demo/image/upload/v1690000000/samples/landscapes/river.jpg"
                alt="Destination background"
                className="absolute inset-0 h-full w-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(6,8,7,0.92),rgba(6,8,7,0.56))]" />
              <div className="relative z-10 flex min-h-[360px] flex-col justify-between p-6 md:p-10">
                <div>
                  <p className="section-kicker">Final CTA</p>
                  <h2 className="mt-4 max-w-2xl font-display text-[clamp(3rem,7vw,6rem)] leading-[0.95] text-[#f2ede4]">
                    Ready to Explore?
                  </h2>
                </div>
                <div className="flex flex-wrap items-center gap-4">
                  <Link to="/register" className="travel-button travel-button-gold text-base">
                    Start building
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link to="/login" className="travel-button travel-button-ghost text-base">
                    Login
                  </Link>
                </div>
              </div>
            </div>
          </SectionReveal>
        </section>
      </main>

      <footer className="border-t border-[var(--border)] bg-[var(--bg-base)]">
        <div className="section-shell flex flex-col gap-6 py-8 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-display text-2xl text-[#f2ede4]">Orbitra</p>
            <p className="mt-2 font-ui text-sm text-[var(--text-muted)]">
              AI-powered itinerary design for premium travel.
            </p>
          </div>

          <div className="flex flex-wrap gap-4 font-ui text-sm text-[var(--text-muted)]">
            <a href="#demo" className="nav-link nav-link-underline">
              Demo
            </a>
            <Link to="/login" className="nav-link nav-link-underline">
              Login
            </Link>
            <Link to="/register" className="nav-link nav-link-underline">
              Get Started
            </Link>
            <a href="#top" className="nav-link nav-link-underline">
              Back to top
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage

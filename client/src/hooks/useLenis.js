import { useEffect } from 'react'

export default function useLenis() {
  useEffect(() => {
    if (typeof window === 'undefined') return undefined

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches

    if (prefersReducedMotion || isCoarsePointer) {
      return undefined
    }

    let lenisInstance = null
    let gsapInstance = null
    let tickerFn = null
    let cancelled = false

    const teardown = () => {
      if (gsapInstance && tickerFn) {
        try {
          gsapInstance.ticker.remove(tickerFn)
        } catch {
          // no-op
        }
      }
      if (lenisInstance?.destroy) {
        lenisInstance.destroy()
      }
    }

    const start = async () => {
      try {
        const [{ default: Lenis }, gsapModule, scrollTriggerModule] = await Promise.all([
          import('lenis'),
          import('gsap'),
          import('gsap/ScrollTrigger'),
        ])

        if (cancelled) return

        const { gsap } = gsapModule
        const { ScrollTrigger } = scrollTriggerModule

        gsap.registerPlugin(ScrollTrigger)

        lenisInstance = new Lenis({
          duration: 1.4,
          easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          direction: 'vertical',
          gestureDirection: 'vertical',
          smooth: true,
          smoothTouch: false,
          touchMultiplier: 2,
        })

        lenisInstance.on('scroll', ScrollTrigger.update)
        tickerFn = (time) => lenisInstance.raf(time * 1000)
        gsap.ticker.add(tickerFn)
        gsap.ticker.lagSmoothing(0)

        gsapInstance = gsap
      } catch {
        // If GSAP or Lenis is unavailable in a local environment, fall back to native scrolling.
      }
    }

    start()

    return () => {
      cancelled = true
      teardown()
    }
  }, [])
}

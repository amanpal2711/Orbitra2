import { useEffect } from 'react'

export default function useScrollReveal(ref, options = {}) {
  useEffect(() => {
    const element = ref?.current
    if (!element || typeof window === 'undefined') return undefined

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (prefersReducedMotion) {
      element.classList.add('reveal-visible')
      return undefined
    }

    let cleanup = () => {}

    const run = async () => {
      try {
        const [{ gsap }, { ScrollTrigger }] = await Promise.all([
          import('gsap'),
          import('gsap/ScrollTrigger'),
        ])

        gsap.registerPlugin(ScrollTrigger)

        const tween = gsap.fromTo(
          element,
          { opacity: 0, y: 60, filter: 'blur(6px)' },
          {
            opacity: 1,
            y: 0,
            filter: 'blur(0px)',
            duration: 0.9,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: element,
              start: 'top 85%',
              end: 'top 20%',
              toggleActions: 'play none none reverse',
              ...options,
            },
          }
        )

        cleanup = () => {
          tween.kill()
        }
      } catch {
        const observer = new IntersectionObserver(
          ([entry]) => {
            if (entry.isIntersecting) {
              element.classList.add('reveal-visible')
              observer.disconnect()
            }
          },
          { threshold: 0.15 }
        )

        observer.observe(element)
        cleanup = () => observer.disconnect()
      }
    }

    run()

    return () => cleanup()
  }, [ref, JSON.stringify(options)])
}

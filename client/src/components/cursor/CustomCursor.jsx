import { useEffect, useRef, useState } from 'react'

function CustomCursor() {
  const cursorRef = useRef({ x: 0, y: 0 })
  const targetRef = useRef({ x: 0, y: 0 })
  const rafRef = useRef(0)
  const [hovered, setHovered] = useState(false)
  const [pressed, setPressed] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return undefined

    const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches
    if (isCoarsePointer) return undefined

    setVisible(true)

    const onMove = (event) => {
      targetRef.current = { x: event.clientX, y: event.clientY }
    }

    const onDown = () => setPressed(true)
    const onUp = () => setPressed(false)
    const onOver = (event) => {
      const target = event.target
      if (target?.closest?.('a, button, [role="button"], input, textarea, select, .cursor-expand')) {
        setHovered(true)
      }
    }
    const onOut = (event) => {
      const target = event.target
      if (target?.closest?.('a, button, [role="button"], input, textarea, select, .cursor-expand')) {
        setHovered(false)
      }
    }

    const animate = () => {
      cursorRef.current.x += (targetRef.current.x - cursorRef.current.x) * 0.08
      cursorRef.current.y += (targetRef.current.y - cursorRef.current.y) * 0.08

      if (cursorRef.current.x || cursorRef.current.y) {
        const el = document.documentElement
        el.style.setProperty('--cursor-x', `${cursorRef.current.x}px`)
        el.style.setProperty('--cursor-y', `${cursorRef.current.y}px`)
      }

      rafRef.current = requestAnimationFrame(animate)
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mousedown', onDown)
    window.addEventListener('mouseup', onUp)
    window.addEventListener('mouseover', onOver)
    window.addEventListener('mouseout', onOut)
    rafRef.current = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mousedown', onDown)
      window.removeEventListener('mouseup', onUp)
      window.removeEventListener('mouseover', onOver)
      window.removeEventListener('mouseout', onOut)
    }
  }, [])

  if (!visible) return null

  return (
    <div
      className="cursor-ring"
      style={{
        left: 'var(--cursor-x, 0px)',
        top: 'var(--cursor-y, 0px)',
        transform: 'translate(-50%, -50%)',
      }}
    >
      <div
        className={`relative flex items-center justify-center rounded-full border ${
          pressed ? 'scale-[0.65]' : hovered ? 'scale-100' : 'scale-[0.25]'
        }`}
        style={{
          width: hovered ? '40px' : '10px',
          height: hovered ? '40px' : '10px',
          borderColor: hovered ? 'rgba(212,168,83,0.8)' : 'rgba(242,237,228,0.9)',
          background: hovered ? 'rgba(212,168,83,0.14)' : 'rgba(242,237,228,0.92)',
          boxShadow: hovered ? '0 0 0 14px rgba(212,168,83,0.08)' : '0 0 0 10px rgba(242,237,228,0.04)',
          transition: 'width 180ms ease, height 180ms ease, transform 180ms ease, background 180ms ease',
        }}
      >
        {hovered && !pressed && (
          <span className="font-ui text-[9px] font-bold tracking-[0.3em] text-[#10110f]">
            EXPLORE
          </span>
        )}
        {pressed && (
          <span
            className="absolute inset-0 rounded-full animate-pulse-ring"
            style={{ border: '1px solid rgba(212,168,83,0.55)' }}
          />
        )}
      </div>
    </div>
  )
}

export default CustomCursor

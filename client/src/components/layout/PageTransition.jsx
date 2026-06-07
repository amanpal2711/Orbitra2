import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

function PageTransition({ children }) {
  const location = useLocation()
  const [phase, setPhase] = useState('idle')

  useEffect(() => {
    setPhase('entering')
    const timer = window.setTimeout(() => {
      setPhase('idle')
    }, 420)

    return () => window.clearTimeout(timer)
  }, [location.pathname])

  return (
    <>
      {children}
      <div className={`page-curtain ${phase === 'entering' ? 'is-entering' : ''}`} />
    </>
  )
}

export default PageTransition

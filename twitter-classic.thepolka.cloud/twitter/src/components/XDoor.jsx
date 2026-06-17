import { useEffect, useRef } from 'react'
import './XDoor.css'

export default function XDoor({ onClose }) {
  const dialogRef = useRef(null)

  useEffect(() => {
    dialogRef.current?.focus()
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="xdoor-overlay" role="presentation" onClick={onClose}>
      <div
        className="xdoor-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="xdoor-title"
        tabIndex={-1}
        ref={dialogRef}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="xdoor-glyph">&#10005;</div>
        <h2 id="xdoor-title">Stepping out front?</h2>
        <p>
          The Back Room stays open behind you. X is the public storefront — a
          different room, different rules, run by a different owner.
        </p>
        <div className="xdoor-actions">
          <a
            className="xdoor-go"
            href="https://x.com"
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
          >
            Go to x.com
          </a>
          <button className="xdoor-stay" onClick={onClose}>
            Stay in the Back Room
          </button>
        </div>
      </div>
    </div>
  )
}

import { useCallback, useEffect, useRef, useState } from 'react'
import { CloseIcon } from './Icons.jsx'

/**
 * Scans a student card at the counter.
 *
 * Asks for the camera, shows the live view and watches for a QR/barcode using
 * the browser's BarcodeDetector. Browsers without it (Safari, Firefox today)
 * still get the camera plus a box to key the card number in by hand.
 *
 * The camera only works on https or localhost — on a plain http LAN address
 * the browser blocks it, so we say so instead of failing silently.
 */
export default function CardScanner({ open, amount, onClose, onScan }) {
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const loopRef = useRef(0)

  const [status, setStatus] = useState('starting')   // starting | live | denied | insecure | unsupported
  const [detail, setDetail] = useState('')
  const [manual, setManual] = useState('')

  const stop = useCallback(() => {
    cancelAnimationFrame(loopRef.current)
    window.clearTimeout(loopRef.current)
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
  }, [])

  useEffect(() => {
    if (!open) return undefined
    let cancelled = false

    const start = async () => {
      if (!window.isSecureContext) {
        setStatus('insecure')
        return
      }
      if (!navigator.mediaDevices?.getUserMedia) {
        setStatus('unsupported')
        return
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1280 } },
          audio: false,
        })
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop())
          return
        }
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play().catch(() => {})
        }
        setStatus('live')
        watch()
      } catch (err) {
        setStatus(err?.name === 'NotAllowedError' ? 'denied' : 'unsupported')
        setDetail(err?.message || '')
      }
    }

    const watch = async () => {
      if (!('BarcodeDetector' in window)) {
        setDetail('This browser cannot read codes automatically — type the card number below.')
        return
      }
      const detector = new window.BarcodeDetector({ formats: ['qr_code', 'code_128', 'code_39', 'ean_13'] })

      const tick = async () => {
        if (cancelled || !videoRef.current) return
        try {
          const found = await detector.detect(videoRef.current)
          if (found.length) {
            const value = found[0].rawValue?.trim()
            if (value) {
              stop()
              onScan(value)
              return
            }
          }
        } catch { /* a frame that could not be read; try the next one */ }
        loopRef.current = window.setTimeout(() => requestAnimationFrame(tick), 220)
      }
      tick()
    }

    start()
    return () => {
      cancelled = true
      stop()
    }
  }, [open, onScan, stop])

  useEffect(() => {
    if (!open) return undefined
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  const submitManual = (e) => {
    e.preventDefault()
    const value = manual.trim()
    if (value.length >= 4) {
      stop()
      onScan(value)
    }
  }

  return (
    <div className="modal-wrap" role="dialog" aria-modal="true" aria-label="Scan student card">
      <div className="modal-scrim" onClick={onClose} />

      <div className="order-modal scanner">
        <div className="modal-head">
          <h2>Scan student card</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close scanner">
            <CloseIcon />
          </button>
        </div>

        <div className="scan-stage">
          <video ref={videoRef} playsInline muted className="scan-video" />
          <div className="scan-frame" aria-hidden="true" />

          {status !== 'live' && (
            <div className="scan-msg">
              {status === 'starting' && <p>Asking for the camera…</p>}
              {status === 'denied' && (
                <p>Camera permission was refused. Allow it in the browser&rsquo;s address bar, or key the card number in below.</p>
              )}
              {status === 'insecure' && (
                <p>
                  The camera only opens on <strong>https</strong> or <strong>localhost</strong>. On a plain
                  http address the browser blocks it — key the card number in below for now.
                </p>
              )}
              {status === 'unsupported' && (
                <p>No camera available here{detail ? ` (${detail})` : ''}. Key the card number in below.</p>
              )}
            </div>
          )}
        </div>

        <div className="modal-foot">
          <p className="scan-hint">
            {status === 'live'
              ? 'Hold the card’s QR code inside the frame'
              : 'Camera unavailable — enter the number printed on the card'}
          </p>

          <form className="scan-manual" onSubmit={submitManual}>
            <input
              type="text" placeholder="HB-2024-0518 or card code"
              value={manual} onChange={(e) => setManual(e.target.value)}
            />
            <button className="btn" type="submit" disabled={manual.trim().length < 4}>
              Charge ₹{amount}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

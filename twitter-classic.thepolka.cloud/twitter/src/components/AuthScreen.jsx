import { useState } from 'react'
import { signIn, signUp, resendVerificationEmail } from '../lib/auth'
import './AuthScreen.css'

export default function AuthScreen({ onAuthed }) {
  const [mode, setMode] = useState('signin') // 'signin' | 'signup' | 'check-email'
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [resendStatus, setResendStatus] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    if (mode === 'signup') {
      const { data, error: err } = await signUp(username, email, password)
      setLoading(false)

      if (err) {
        setError(err)
        return
      }

      if (data?.session) {
        // Email confirmation disabled — straight in.
        onAuthed(data)
      } else {
        // Email confirmation required.
        setMode('check-email')
      }
      return
    }

    // signin
    const { data, error: err } = await signIn(username, password)
    setLoading(false)

    if (err) {
      setError(err)
      return
    }

    onAuthed(data)
  }

  async function handleResend() {
    setResendStatus('sending')
    const { ok, error: err } = await resendVerificationEmail(email)
    setResendStatus(ok ? 'sent' : err)
  }

  if (mode === 'check-email') {
    return (
      <div className="auth-screen">
        <div className="auth-card">
          <div className="auth-mark">&#9670;</div>
          <h1>Check your inbox</h1>
          <p className="auth-subtitle">
            We sent a verification link to <strong>{email}</strong>. Click it
            to unlock the door — then come back here and sign in.
          </p>
          <button className="auth-submit" type="button" onClick={() => setMode('signin')}>
            Back to sign in
          </button>
          <button
            className="auth-resend"
            type="button"
            onClick={handleResend}
            disabled={resendStatus === 'sending'}
          >
            {resendStatus === 'sending'
              ? 'Sending…'
              : resendStatus === 'sent'
              ? 'Email sent again'
              : 'Resend email'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <div className="auth-mark">&#9670;</div>
        <h1>The Back Room</h1>
        <p className="auth-subtitle">
          A members-only feed. Pick a username, verify your email once, and
          you&rsquo;re in.
        </p>

        <div className="auth-tabs">
          <button
            className={mode === 'signin' ? 'auth-tab auth-tab-active' : 'auth-tab'}
            onClick={() => { setMode('signin'); setError(null) }}
            type="button"
          >
            Sign in
          </button>
          <button
            className={mode === 'signup' ? 'auth-tab auth-tab-active' : 'auth-tab'}
            onClick={() => { setMode('signup'); setError(null) }}
            type="button"
          >
            Create account
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <label className="auth-label" htmlFor="username">
            {mode === 'signup' ? 'Username' : 'Username or email'}
          </label>
          <input
            id="username"
            className="auth-input"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="midnight_owl"
            autoComplete="username"
            required
          />

          {mode === 'signup' ? (
            <>
              <label className="auth-label" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                className="auth-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
              <p className="auth-hint">
                Only used to verify you&rsquo;re a real person and for
                account recovery. Never shown to other users.
              </p>
            </>
          ) : null}

          <label className="auth-label" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            className="auth-input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 6 characters"
            autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
            required
          />

          {error ? <div className="auth-error" role="alert">{error}</div> : null}

          <button className="auth-submit" type="submit" disabled={loading}>
            {loading ? 'One moment…' : mode === 'signup' ? 'Knock and enter' : 'Enter'}
          </button>
        </form>

        <p className="auth-footnote">
          Usernames: 3-20 characters, letters/numbers/underscores only.
        </p>
      </div>
    </div>
  )
}

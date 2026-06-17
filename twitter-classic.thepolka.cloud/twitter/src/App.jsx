import { useEffect, useState } from 'react'
import { supabase } from './lib/supabaseClient'
import { signOut, getCurrentSession } from './lib/auth'
import { fetchFeed } from './lib/posts'
import { hasSurveyResponse } from './lib/survey'
import AuthScreen from './components/AuthScreen'
import NavBar from './components/NavBar'
import Composer from './components/Composer'
import Feed from './components/Feed'
import XDoor from './components/XDoor'
import SurveyModal from './components/SurveyModal'
import './App.css'

export default function App() {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showXDoor, setShowXDoor] = useState(false)
  const [showSurvey, setShowSurvey] = useState(false)
  const [feedError, setFeedError] = useState(null)

  // Restore session on load + listen for auth changes
  useEffect(() => {
    getCurrentSession().then((s) => {
      setSession(s)
      setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s)
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  // Load profile (username) once we have a session
  useEffect(() => {
    if (!session?.user) return

    let active = true

    supabase
      .from('profiles')
      .select('id, username')
      .eq('id', session.user.id)
      .single()
      .then(({ data, error }) => {
        if (active && !error) setProfile(data)
      })

    return () => { active = false }
  }, [session])

  // Load the feed once authenticated
  useEffect(() => {
    if (!session) return

    let active = true
    fetchFeed().then(({ data, error }) => {
      if (!active) return
      if (error) setFeedError(error)
      else setPosts(data ?? [])
    })

    return () => { active = false }
  }, [session])

  // Check for the one-time news source survey
  useEffect(() => {
    if (!session?.user) return

    let active = true
    hasSurveyResponse(session.user.id).then(({ answered, error }) => {
      if (!active) return
      if (!error && !answered) setShowSurvey(true)
    })

    return () => { active = false }
  }, [session])

  function handlePosted(newPost) {
    setPosts((prev) => [newPost, ...prev])
  }

  function handleDeleted(postId) {
    setPosts((prev) => prev.filter((p) => p.id !== postId))
  }

  async function handleSignOut() {
    await signOut()
    setPosts([])
    setProfile(null)
  }

  if (loading) {
    return <div className="app-loading">Loading…</div>
  }

  if (!session) {
    return <AuthScreen onAuthed={() => {}} />
  }

  return (
    <div className="app">
      <NavBar
        user={profile}
        onSignOut={handleSignOut}
        onToggleX={() => setShowXDoor(true)}
      />

      <main className="app-main">
        <Composer user={session.user} onPosted={handlePosted} />

        {feedError ? (
          <div className="app-error" role="alert">
            Couldn&apos;t load the feed: {feedError}
          </div>
        ) : (
          <Feed posts={posts} currentUserId={session.user.id} onDeleted={handleDeleted} />
        )}
      </main>

      <footer className="app-footer">
        <a href="https://thepolka.cloud" target="_blank" rel="noopener noreferrer">
          The Polkadot Cloud
        </a>
        <span className="app-footer-dot">&middot;</span>
        <span>The Back Room</span>
      </footer>

      {showXDoor ? <XDoor onClose={() => setShowXDoor(false)} /> : null}
      {showSurvey ? (
        <SurveyModal userId={session.user.id} onDone={() => setShowSurvey(false)} />
      ) : null}
    </div>
  )
}

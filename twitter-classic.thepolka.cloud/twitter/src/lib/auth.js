import { supabase } from './supabaseClient'

function validateUsername(username) {
  const clean = username.trim()
  if (clean.length < 3 || clean.length > 20) {
    return 'Username must be 3-20 characters.'
  }
  if (!/^[a-zA-Z0-9_]+$/.test(clean)) {
    return 'Username can only contain letters, numbers, and underscores.'
  }
  return null
}

function validateEmail(email) {
  const clean = email.trim()
  // Basic shape check — Supabase does the real validation server-side.
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) {
    return 'Enter a valid email address.'
  }
  return null
}

function validatePassword(password) {
  if (password.length < 6) {
    return 'Password must be at least 6 characters.'
  }
  return null
}

/**
 * Sign up with username, email, and password.
 * Sends a verification email via Supabase Auth. The user's row in
 * `profiles` is created via a database trigger (see supabase_schema.sql)
 * once their auth account exists, so it works even before they confirm
 * their email.
 */
export async function signUp(username, email, password) {
  const usernameError = validateUsername(username)
  if (usernameError) return { error: usernameError }

  const emailError = validateEmail(email)
  if (emailError) return { error: emailError }

  const passwordError = validatePassword(password)
  if (passwordError) return { error: passwordError }

  const clean = username.trim().toLowerCase()
  const cleanEmail = email.trim().toLowerCase()

  const { data, error } = await supabase.auth.signUp({
    email: cleanEmail,
    password,
    options: {
      data: { username: clean },
    },
  })

  if (error) {
    const msg = error.message?.toLowerCase() ?? ''
    if (msg.includes('already registered')) {
      return { error: 'That email is already registered.' }
    }
    if (msg.includes('duplicate') || msg.includes('unique') || msg.includes('profiles_username_key')) {
      return { error: 'That username is already taken.' }
    }
    return { error: error.message }
  }

  // If email confirmation is required, data.session will be null and
  // data.user will exist but be unconfirmed. The caller should show a
  // "check your email" screen in that case.
  return { data }
}

/**
 * Sign in with either a username or an email, plus password.
 * If the identifier looks like a username (no "@"), we look up the
 * associated email from `profiles` first.
 */
export async function signIn(identifier, password) {
  const clean = identifier.trim()
  let email = clean.toLowerCase()

  if (!clean.includes('@')) {
    const { data: profile, error: lookupError } = await supabase
      .from('profiles')
      .select('email')
      .eq('username', clean.toLowerCase())
      .maybeSingle()

    if (lookupError || !profile) {
      return { error: 'Wrong username/email or password.' }
    }
    email = profile.email
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    if (error.message?.toLowerCase().includes('email not confirmed')) {
      return { error: 'Please verify your email before signing in. Check your inbox.' }
    }
    return { error: 'Wrong username/email or password.' }
  }

  return { data }
}

export async function resendVerificationEmail(email) {
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email: email.trim().toLowerCase(),
  })
  if (error) return { error: error.message }
  return { ok: true }
}

export async function signOut() {
  return supabase.auth.signOut()
}

export async function getCurrentSession() {
  const { data } = await supabase.auth.getSession()
  return data.session
}

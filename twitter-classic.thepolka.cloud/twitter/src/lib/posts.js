import { supabase } from './supabaseClient'

const MAX_POST_LENGTH = 280

export function validatePostContent(content) {
  const trimmed = content.trim()
  if (trimmed.length === 0) return 'Write something before posting.'
  if (trimmed.length > MAX_POST_LENGTH) return `Posts are limited to ${MAX_POST_LENGTH} characters.`
  return null
}

export async function fetchFeed(limit = 50) {
  const { data, error } = await supabase
    .from('posts')
    .select('id, content, created_at, user_id, profiles(username)')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) return { error: error.message }
  return { data }
}

export async function createPost(userId, content) {
  const error = validatePostContent(content)
  if (error) return { error }

  const { data, error: dbError } = await supabase
    .from('posts')
    .insert({ user_id: userId, content: content.trim() })
    .select('id, content, created_at, user_id, profiles(username)')
    .single()

  if (dbError) return { error: dbError.message }
  return { data }
}

export async function deletePost(postId) {
  const { error } = await supabase.from('posts').delete().eq('id', postId)
  if (error) return { error: error.message }
  return { ok: true }
}

export { MAX_POST_LENGTH }

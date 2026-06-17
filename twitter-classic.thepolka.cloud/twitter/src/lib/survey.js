import { supabase } from './supabaseClient'

export const NEWS_SOURCE_OPTIONS = [
  { value: 'online', label: 'Online (websites, social media, apps)' },
  { value: 'tv', label: 'TV' },
  { value: 'print', label: 'Print papers / magazines' },
  { value: 'word_of_mouth', label: 'Word of mouth' },
]

export async function hasSurveyResponse(userId) {
  const { data, error } = await supabase
    .from('survey_responses')
    .select('user_id')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) return { error: error.message }
  return { answered: !!data }
}

export async function submitSurveyResponse(userId, newsSource) {
  const { error } = await supabase
    .from('survey_responses')
    .insert({ user_id: userId, news_source: newsSource })

  if (error) return { error: error.message }
  return { ok: true }
}

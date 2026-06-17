import { useState } from 'react'
import { NEWS_SOURCE_OPTIONS, submitSurveyResponse } from '../lib/survey'
import './SurveyModal.css'

export default function SurveyModal({ userId, onDone }) {
  const [selected, setSelected] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  async function handleSubmit() {
    if (!selected) return
    setSubmitting(true)
    setError(null)

    const { error: err } = await submitSurveyResponse(userId, selected)

    setSubmitting(false)

    if (err) {
      setError(err)
      return
    }

    onDone()
  }

  return (
    <div className="survey-overlay" role="presentation">
      <div
        className="survey-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="survey-title"
      >
        <div className="survey-glyph" aria-hidden="true">&#9670;</div>
        <h2 id="survey-title">One quick question</h2>
        <p>Where do you usually get your news from?</p>

        <div className="survey-options">
          {NEWS_SOURCE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={
                selected === opt.value
                  ? 'survey-option survey-option-selected'
                  : 'survey-option'
              }
              onClick={() => setSelected(opt.value)}
              aria-pressed={selected === opt.value}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {error ? <div className="survey-error" role="alert">{error}</div> : null}

        <button
          className="survey-submit"
          onClick={handleSubmit}
          disabled={!selected || submitting}
        >
          {submitting ? 'Saving…' : 'Continue'}
        </button>

        <p className="survey-footnote">
          Used anonymously for aggregate stats only. Asked once.
        </p>
      </div>
    </div>
  )
}

import { useState } from 'react'
import { createPost, MAX_POST_LENGTH } from '../lib/posts'
import './Composer.css'

export default function Composer({ user, onPosted }) {
  const [content, setContent] = useState('')
  const [error, setError] = useState(null)
  const [posting, setPosting] = useState(false)

  const remaining = MAX_POST_LENGTH - content.length

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setPosting(true)

    const { data, error: err } = await createPost(user.id, content)

    setPosting(false)

    if (err) {
      setError(err)
      return
    }

    setContent('')
    onPosted(data)
  }

  return (
    <form className="composer" onSubmit={handleSubmit}>
      <textarea
        className="composer-input"
        placeholder="What's the password tonight?"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        maxLength={MAX_POST_LENGTH + 20}
        rows={3}
      />
      <div className="composer-footer">
        <span className={remaining < 0 ? 'composer-count composer-count-over' : 'composer-count'}>
          {remaining}
        </span>
        {error ? <span className="composer-error" role="alert">{error}</span> : null}
        <button className="composer-submit" type="submit" disabled={posting}>
          {posting ? 'Posting…' : 'Post'}
        </button>
      </div>
    </form>
  )
}

import { deletePost } from '../lib/posts'
import './Feed.css'

function timeAgo(dateString) {
  const date = new Date(dateString)
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)

  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h`
  const days = Math.floor(hours / 24)
  return `${days}d`
}

function PostCard({ post, currentUserId, onDeleted }) {
  const username = post.profiles?.username ?? 'unknown'
  const isOwn = post.user_id === currentUserId

  async function handleDelete() {
    const { ok, error } = await deletePost(post.id)
    if (ok) onDeleted(post.id)
    else console.error(error)
  }

  return (
    <article className="post">
      <div className="post-avatar" aria-hidden="true">
        {username.charAt(0).toUpperCase()}
      </div>
      <div className="post-body">
        <div className="post-header">
          <span className="post-username">@{username}</span>
          <span className="post-dot">&middot;</span>
          <time className="post-time" dateTime={post.created_at}>
            {timeAgo(post.created_at)}
          </time>
          {isOwn ? (
            <button className="post-delete" onClick={handleDelete} aria-label="Delete post">
              Remove
            </button>
          ) : null}
        </div>
        <p className="post-content">{post.content}</p>
      </div>
    </article>
  )
}

export default function Feed({ posts, currentUserId, onDeleted }) {
  if (posts.length === 0) {
    return (
      <div className="feed-empty">
        <p>The room is quiet. Be the first to say something tonight.</p>
      </div>
    )
  }

  return (
    <div className="feed">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} currentUserId={currentUserId} onDeleted={onDeleted} />
      ))}
    </div>
  )
}

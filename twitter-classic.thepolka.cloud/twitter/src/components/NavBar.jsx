import './NavBar.css'

export default function NavBar({ user, onSignOut, onToggleX }) {
  return (
    <header className="navbar">
      <div className="navbar-inner">
        <div className="navbar-brand">
          <span className="navbar-mark">&#9670;</span>
          <span className="navbar-title">The Back Room</span>
        </div>

        <nav className="navbar-tabs" aria-label="Feed selection">
          <button className="tab tab-active" aria-current="page">
            Classic
          </button>
          <button className="tab" onClick={onToggleX}>
            X
            <span className="tab-hint">opens x.com</span>
          </button>
        </nav>

        <div className="navbar-user">
          {user ? (
            <>
              <span className="navbar-username">@{user.username}</span>
              <button className="navbar-signout" onClick={onSignOut}>
                Sign out
              </button>
            </>
          ) : null}
        </div>
      </div>
    </header>
  )
}

export function Header({
  onOpenDocs,
  onToggleConsole,
  onToggleConfig,
  isConfigOpen,
  isConsoleOpen,
  logsCount,
  hasErrorLog,
}) {
  return (
    <header className="app-header">
      <div className="header-left">
        <div className="brand-logo-container">
          <span className="brand-emoji">🐄</span>
          <div className="brand-badge-glow"></div>
        </div>
        <div className="brand-titles">
          <div className="brand-top-row">
            <span className="brand-name">DearCows</span>
            <span className="badge badge-green">
              <span className="status-dot-pulse"></span>
              WABA v3
            </span>
          </div>
          <h1 className="brand-subtitle">WhatsApp Notification & QA Testing Suite</h1>
        </div>
      </div>

      <div className="header-actions">
        {/* Base URL & Settings Config Button */}
        <button
          className={`btn-header ${isConfigOpen ? 'active' : ''}`}
          onClick={onToggleConfig}
          title="Configure Base URL, Headers, and Proxy"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
          <span>API Config</span>
        </button>

        {/* API Docs Button */}
        <button
          className="btn-header"
          onClick={onOpenDocs}
          title="View endpoint specs and cURL snippets"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
          </svg>
          <span>Docs & cURL</span>
        </button>

        {/* Logs Console Toggle */}
        <button
          className={`btn-header ${isConsoleOpen ? 'active' : ''} ${hasErrorLog ? 'has-error' : ''}`}
          onClick={onToggleConsole}
          title="Toggle Network & Activity Inspector"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="4 17 10 11 4 5" />
            <line x1="12" y1="19" x2="20" y2="19" />
          </svg>
          <span>Console</span>
          {logsCount > 0 && (
            <span className={`logs-counter-pill ${hasErrorLog ? 'error' : ''}`}>
              {logsCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}

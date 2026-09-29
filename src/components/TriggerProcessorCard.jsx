import { useState } from 'react';

export function TriggerProcessorCard({
  onTrigger,
  isTriggering,
  lastTriggerResult,
  autoRefreshUsers,
  onToggleAutoRefresh,
}) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="trigger-card">
      <div className="trigger-card-glow"></div>

      <div className="trigger-card-content">
        <div className="trigger-header-row">
          <div className="trigger-title-group">
            <div className="cron-pill">
              <span className="cron-pulse"></span>
              API 1 • CRON SIMULATOR
            </div>
            <h2 className="trigger-heading">Trigger WhatsApp Queue Processor</h2>
          </div>
          <div className="rate-limit-pill" title="Meta Cloud API Rate Limiting Policy">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span>Meta Delay: 6s / user</span>
          </div>
        </div>

        <p className="trigger-description">
          Simulates the <strong>14:00 & 14:30 daily cron jobs</strong> on-demand. Evaluates all active users,
          enqueues notifications for <strong>Low Balance</strong> or <strong>Vacations Ending</strong>, and drains the queue in background.
        </p>

        {/* Feature Pills */}
        <div className="trigger-tags-list">
          <span className="trigger-tag">
            <span className="tag-icon">⚠️</span>
            Low Balance Detection
          </span>
          <span className="trigger-tag">
            <span className="tag-icon">🏖️</span>
            Vacation Ending Alerts
          </span>
          <span className="trigger-tag">
            <span className="tag-icon">⚡</span>
            Async Background Drain
          </span>
          <span className="trigger-tag">
            <span className="tag-icon">🛡️</span>
            HTTP Non-blocking
          </span>
        </div>

        {/* Action Row */}
        <div className="trigger-action-bar">
          <button
            className="btn-trigger-action"
            onClick={onTrigger}
            disabled={isTriggering}
            id="trigger-waba-queue-btn"
          >
            {isTriggering ? (
              <>
                <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                  <path d="M12 2a10 10 0 0 1 10 10" />
                </svg>
                <span>Dispatching Queue Processor...</span>
              </>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
                <span>Trigger Queue Processor</span>
              </>
            )}
          </button>

          <label className="checkbox-label" title="Automatically call getWabaUsers after triggering">
            <input
              type="checkbox"
              checked={autoRefreshUsers}
              onChange={(e) => onToggleAutoRefresh(e.target.checked)}
            />
            <span>Auto-refresh users after trigger</span>
          </label>
        </div>

        {/* Last Result Feedback Box */}
        {lastTriggerResult && (
          <div className={`trigger-result-box ${lastTriggerResult.error ? 'is-error' : 'is-success'}`}>
            <div className="result-header">
              <div className="result-status-indicator">
                {lastTriggerResult.error ? (
                  <span className="badge badge-red">Failed</span>
                ) : (
                  <span className="badge badge-green">Dispatched Successfully</span>
                )}
                <span className="result-time">{lastTriggerResult.timestamp}</span>
              </div>
              <button
                className="btn-text-sm"
                onClick={() => setShowDetails(!showDetails)}
              >
                {showDetails ? 'Hide JSON' : 'View Raw Response'}
              </button>
            </div>

            <p className="result-message">
              {lastTriggerResult.data?.message || lastTriggerResult.message}
            </p>

            {showDetails && (
              <pre className="result-json-view font-mono">
                {JSON.stringify(lastTriggerResult.data || lastTriggerResult, null, 2)}
              </pre>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

import { useState } from 'react';

export function ActivityConsole({
  logs = [],
  isOpen,
  onClose,
  onClear,
  onCopyText,
}) {
  const [selectedLogId, setSelectedLogId] = useState(null);
  const [filterErrorsOnly, setFilterErrorsOnly] = useState(false);

  if (!isOpen) return null;

  const displayLogs = filterErrorsOnly ? logs.filter((l) => l.error) : logs;
  const activeLog = logs.find((l) => l.id === selectedLogId) || logs[0];

  const handleCopyJson = (obj, label) => {
    navigator.clipboard.writeText(JSON.stringify(obj, null, 2));
    if (onCopyText) onCopyText(`Copied ${label} JSON to clipboard!`);
  };

  return (
    <div className="activity-drawer">
      <div className="drawer-header">
        <div className="drawer-title-row">
          <div className="terminal-dots">
            <span className="dot dot-red"></span>
            <span className="dot dot-yellow"></span>
            <span className="dot dot-green"></span>
          </div>
          <span className="drawer-title">Network & Activity Inspector</span>
          <span className="badge badge-neutral font-mono">{logs.length} logged</span>
        </div>

        <div className="drawer-controls">
          <label className="checkbox-label" style={{ fontSize: '0.78rem' }}>
            <input
              type="checkbox"
              checked={filterErrorsOnly}
              onChange={(e) => setFilterErrorsOnly(e.target.checked)}
            />
            <span>Errors Only</span>
          </label>

          <button className="btn-drawer-action" onClick={onClear} title="Clear all recorded entries">
            Clear Logs
          </button>
          <button className="btn-icon" onClick={onClose} aria-label="Close inspector">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      <div className="drawer-body">
        {/* Left: Log list */}
        <div className="logs-list-column">
          {displayLogs.length === 0 ? (
            <div className="no-logs-msg font-mono">
              {logs.length === 0
                ? 'No network activity yet. Execute an API above to inspect requests & responses.'
                : 'No error entries found.'}
            </div>
          ) : (
            displayLogs.map((log) => {
              const isSelected = activeLog && activeLog.id === log.id;
              const isPost = log.method === 'POST';

              return (
                <div
                  key={log.id}
                  className={`log-item-row ${isSelected ? 'selected' : ''} ${log.error ? 'is-error' : ''}`}
                  onClick={() => setSelectedLogId(log.id)}
                >
                  <div className="log-item-top">
                    <span className={`method-badge font-mono ${isPost ? 'badge-post' : 'badge-get'}`}>
                      {log.method}
                    </span>
                    <span className={`status-badge font-mono ${log.error ? 'status-err' : 'status-ok'}`}>
                      {log.status || (log.error ? 'ERR' : '200')}
                    </span>
                    <span className="log-duration font-mono">{log.duration}ms</span>
                  </div>
                  <div className="log-endpoint font-mono" title={log.endpoint}>
                    {log.endpoint}
                  </div>
                  <div className="log-time font-mono">{log.timestamp}</div>
                </div>
              );
            })
          )}
        </div>

        {/* Right: Detailed inspector */}
        <div className="log-details-column">
          {activeLog ? (
            <div className="log-detail-content">
              {/* URL & Summary Bar */}
              <div className="detail-meta-bar font-mono">
                <div className="detail-meta-row">
                  <span className="meta-k">Endpoint:</span>
                  <span className="meta-v highlight">{activeLog.endpoint}</span>
                </div>
                <div className="detail-meta-row">
                  <span className="meta-k">Full URL:</span>
                  <span className="meta-v">{activeLog.url}</span>
                </div>
                <div className="detail-meta-row">
                  <span className="meta-k">Status:</span>
                  <span className={`meta-v ${activeLog.error ? 'text-red' : 'text-green'}`}>
                    {activeLog.status} ({activeLog.statusText || (activeLog.error ? 'Error' : 'OK')})
                  </span>
                  <span className="meta-k" style={{ marginLeft: '16px' }}>Time:</span>
                  <span className="meta-v">{activeLog.timestamp} ({activeLog.duration}ms)</span>
                </div>
              </div>

              {/* Request Payload */}
              {activeLog.requestBody && (
                <div className="code-block-section">
                  <div className="code-block-header">
                    <span>Request Body (JSON)</span>
                    <button
                      className="btn-copy-code"
                      onClick={() => handleCopyJson(activeLog.requestBody, 'Request Body')}
                    >
                      Copy Request
                    </button>
                  </div>
                  <pre className="code-preview font-mono">
                    {JSON.stringify(activeLog.requestBody, null, 2)}
                  </pre>
                </div>
              )}

              {/* Response Payload */}
              <div className="code-block-section" style={{ flex: 1 }}>
                <div className="code-block-header">
                  <span>Response Body</span>
                  <button
                    className="btn-copy-code"
                    onClick={() => handleCopyJson(activeLog.response, 'Response')}
                  >
                    Copy Response
                  </button>
                </div>
                <pre className="code-preview font-mono">
                  {JSON.stringify(activeLog.response, null, 2)}
                </pre>
              </div>
            </div>
          ) : (
            <div className="no-selection-msg font-mono">
              Select an item on the left to inspect request/response details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { DEFAULT_BASE_URL } from '../services/api';

const PRESET_URLS = [
  { label: 'Local 3015 (Default)', url: 'http://localhost:3015/api/v3/taskRunner', desc: 'Direct Node backend port 3015' },
  { label: 'Vite Proxy', url: '/api/v3/taskRunner', desc: 'Proxies /api through Vite to port 3015' },
  { label: 'Local 5000', url: 'http://localhost:5000/api/v3/taskRunner', desc: 'Node backend port 5000' },
  { label: 'Local 3000', url: 'http://localhost:3000/api/v3/taskRunner', desc: 'Node backend port 3000' },
];

export function ConfigBar({
  config,
  onUpdateConfig,
  onPing,
  isPinging,
  onClose,
}) {
  const [localUrl, setLocalUrl] = useState(config.baseUrl);
  const [localToken, setLocalToken] = useState(config.authToken);

  const handleSave = (e) => {
    e.preventDefault();
    onUpdateConfig({
      baseUrl: localUrl.trim() || DEFAULT_BASE_URL,
      authToken: localToken.trim(),
    });
  };

  const handleSelectPreset = (url) => {
    setLocalUrl(url);
    onUpdateConfig({ baseUrl: url });
  };

  return (
    <div className="config-panel">
      <div className="config-panel-inner">
        <div className="config-panel-header">
          <div className="config-header-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
            <span>API Gateway & Connection Settings</span>
          </div>
          <button className="btn-icon" onClick={onClose} aria-label="Close configuration">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSave} className="config-form">
          <div className="config-row">
            <div className="config-field" style={{ flex: 2 }}>
              <label htmlFor="base-url-input">
                TaskRunner Base URL
                <span className="label-tip">Current: {config.baseUrl}</span>
              </label>
              <div className="input-group">
                <input
                  id="base-url-input"
                  type="text"
                  value={localUrl}
                  onChange={(e) => setLocalUrl(e.target.value)}
                  placeholder="/api/v3/taskRunner or http://localhost:5000/api/v3/taskRunner"
                  className="config-input font-mono"
                />
                <button type="submit" className="btn-save">
                  Save
                </button>
              </div>
            </div>

            <div className="config-field" style={{ flex: 1.5 }}>
              <label htmlFor="auth-token-input">
                Authorization Header (Optional)
                <span className="label-tip">Bearer token if required</span>
              </label>
              <input
                id="auth-token-input"
                type="password"
                value={localToken}
                onChange={(e) => setLocalToken(e.target.value)}
                placeholder="Optional JWT or API key..."
                className="config-input font-mono"
              />
            </div>
          </div>

          <div className="presets-row">
            <span className="presets-label">Quick Presets:</span>
            <div className="preset-buttons">
              {PRESET_URLS.map((preset) => (
                <button
                  type="button"
                  key={preset.url}
                  className={`preset-btn ${config.baseUrl === preset.url ? 'active' : ''}`}
                  onClick={() => handleSelectPreset(preset.url)}
                  title={preset.desc}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            <div className="config-actions-right">
              <button
                type="button"
                className="btn-ping"
                onClick={onPing}
                disabled={isPinging}
                title="Test network connectivity to getWabaUsers"
              >
                {isPinging ? (
                  <>
                    <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                      <path d="M12 2a10 10 0 0 1 10 10" />
                    </svg>
                    Testing...
                  </>
                ) : (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <polygon points="10 8 16 12 10 16 10 8"/>
                    </svg>
                    Test Ping
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        <div className="config-footer-note">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="16" x2="12" y2="12"/>
            <line x1="12" y1="8" x2="12.01" y2="8"/>
          </svg>
          <span>
            <strong>Tip:</strong> Using <code>/api/v3/taskRunner</code> proxies requests through Vite dev server to <code>http://localhost:3015</code> avoiding browser CORS issues.
          </span>
        </div>
      </div>
    </div>
  );
}

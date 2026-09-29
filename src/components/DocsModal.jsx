import { useState } from 'react';

export function DocsModal({ isOpen, onClose, baseUrl = '/api/v3/taskRunner', onCopyText }) {
  const [copiedIndex, setCopiedIndex] = useState(null);

  if (!isOpen) return null;

  const cleanBase = baseUrl.replace(/\/+$/, '');

  const handleCopy = (text, idx, label) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 1800);
    if (onCopyText) onCopyText(`Copied ${label} snippet to clipboard!`);
  };

  const curl1 = `curl -X POST "${cleanBase}/triggerWhatsappQueueProcessor" \\
  -H "Accept: application/json"`;

  const curl2 = `curl -X GET "${cleanBase}/getWabaUsers" \\
  -H "Accept: application/json"`;

  const curl3 = `curl -X POST "${cleanBase}/updateUserBalance" \\
  -H "Content-Type: application/json" \\
  -d '{"userId": "64c9d81f2b1a9c30f4e1a001", "amount": 5}'`;

  const curl4 = `curl -X POST "${cleanBase}/clearWhatsappQueue" \\
  -H "Accept: application/json"`;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container docs-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-group">
            <span className="badge badge-green">QA & Frontend Reference</span>
            <h3>WhatsApp Integration Testing APIs</h3>
          </div>
          <button className="btn-icon" onClick={onClose} aria-label="Close modal">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="docs-modal-body">
          <div className="docs-intro-card">
            <p>
              These endpoints have been created under the <code>taskRunner</code> route specifically to help the QA and Frontend teams test the WhatsApp notification system and manipulate user states without needing direct database access.
            </p>
            <div className="docs-base-url-pill font-mono">
              <strong>Base Route:</strong> <code>{baseUrl}</code>
            </div>
          </div>

          {/* Endpoint 1 */}
          <div className="doc-endpoint-card">
            <div className="doc-endpoint-header">
              <div className="endpoint-method-pill post">POST</div>
              <code className="endpoint-path">/triggerWhatsappQueueProcessor</code>
            </div>
            <div className="doc-section-title">1. Trigger WhatsApp Queue Processor</div>
            <p className="doc-text">
              Simulates the 14:00 and 14:30 daily cron jobs on demand. It evaluates all active users, enqueues notifications for those with Low Balance or Vacations Ending, and immediately starts draining the queue to send messages.
            </p>
            <div className="doc-note-box">
              <strong>Note:</strong> Because processing thousands of users with Meta's rate limits (6 seconds per user) takes time, this API kicks off the job in the background and responds immediately so your HTTP request does not timeout.
            </div>

            <div className="curl-snippet-box">
              <div className="curl-header">
                <span>cURL Example</span>
                <button
                  className="btn-copy-code"
                  onClick={() => handleCopy(curl1, 1, 'API 1 cURL')}
                >
                  {copiedIndex === 1 ? '✓ Copied' : 'Copy cURL'}
                </button>
              </div>
              <pre className="curl-pre font-mono">{curl1}</pre>
            </div>
          </div>

          {/* Endpoint 2 */}
          <div className="doc-endpoint-card">
            <div className="doc-endpoint-header">
              <div className="endpoint-method-pill get">GET</div>
              <code className="endpoint-path">/getWabaUsers</code>
            </div>
            <div className="doc-section-title">2. Get WABA Test Users</div>
            <p className="doc-text">
              Fetches a clean list of test users specifically created for WhatsApp testing. It looks for any user where the <code>lastName</code> contains the word "WABA".
            </p>

            <div className="curl-snippet-box">
              <div className="curl-header">
                <span>cURL Example</span>
                <button
                  className="btn-copy-code"
                  onClick={() => handleCopy(curl2, 2, 'API 2 cURL')}
                >
                  {copiedIndex === 2 ? '✓ Copied' : 'Copy cURL'}
                </button>
              </div>
              <pre className="curl-pre font-mono">{curl2}</pre>
            </div>
          </div>

          {/* Endpoint 3 */}
          <div className="doc-endpoint-card">
            <div className="doc-endpoint-header">
              <div className="endpoint-method-pill post">POST</div>
              <code className="endpoint-path">/updateUserBalance</code>
            </div>
            <div className="doc-section-title">3. Update User Balance (Ledger Safe)</div>
            <p className="doc-text">
              Instantly updates a user's wallet balance (in liters/quantity) and automatically writes a corresponding <code>BalanceHistory</code> ledger record to ensure database integrity. It also automatically resets the user's <code>lowBalanceDays</code> state so they stop receiving low-balance alerts after being recharged.
            </p>

            <div className="doc-params-table-wrapper">
              <table className="doc-params-table font-mono">
                <thead>
                  <tr>
                    <th>Field</th>
                    <th>Type</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><code>userId</code></td>
                    <td>string</td>
                    <td>The MongoDB ObjectId of the user</td>
                  </tr>
                  <tr>
                    <td><code>amount</code></td>
                    <td>number</td>
                    <td>Quantity (liters) to add or remove (can be positive or negative)</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="curl-snippet-box">
              <div className="curl-header">
                <span>cURL Example</span>
                <button
                  className="btn-copy-code"
                  onClick={() => handleCopy(curl3, 3, 'API 3 cURL')}
                >
                  {copiedIndex === 3 ? '✓ Copied' : 'Copy cURL'}
                </button>
              </div>
              <pre className="curl-pre font-mono">{curl3}</pre>
            </div>
          </div>

          {/* Endpoint 4 */}
          <div className="doc-endpoint-card">
            <div className="doc-endpoint-header">
              <div className="endpoint-method-pill post">POST</div>
              <code className="endpoint-path">/clearWhatsappQueue</code>
            </div>
            <div className="doc-section-title">4. Clear WhatsApp Queue</div>
            <p className="doc-text">
              Instantly clears all pending and processing notifications from the queue. Returns exactly how many documents were deleted.
            </p>

            <div className="curl-snippet-box">
              <div className="curl-header">
                <span>cURL Example</span>
                <button
                  className="btn-copy-code"
                  onClick={() => handleCopy(curl4, 4, 'API 4 cURL')}
                >
                  {copiedIndex === 4 ? '✓ Copied' : 'Copy cURL'}
                </button>
              </div>
              <pre className="curl-pre font-mono">{curl4}</pre>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

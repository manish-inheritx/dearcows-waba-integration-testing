import { useState, useEffect, useCallback } from 'react';
import { getWhatsappQueueStatus } from '../services/api';

export function QueueStatusModal({ isOpen, onClose, config }) {
  const [queueData, setQueueData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchQueueStatus = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await getWhatsappQueueStatus({ config });
      setQueueData(res.data || []);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to fetch queue status');
    } finally {
      setIsLoading(false);
    }
  }, [config]);

  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchQueueStatus();
    }
  }, [isOpen, fetchQueueStatus]);

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 1000 }}>
      <div className="modal-container docs-modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '1100px', width: '95%' }}>
        <div className="modal-header">
          <div className="modal-title-group">
            <span className="badge badge-neutral">Queue Logs</span>
            <h3>WhatsApp Notification Queue Status</h3>
          </div>
          <button className="btn-icon" onClick={onClose} aria-label="Close modal">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        
        <div className="docs-modal-body" style={{ maxHeight: '75vh', overflowY: 'auto', padding: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <p className="doc-text" style={{ margin: 0 }}>
              Showing {queueData.length} item(s) in the queue.
            </p>
            <button className="btn-trigger-action" style={{ padding: '6px 12px', fontSize: '0.9rem' }} onClick={fetchQueueStatus} disabled={isLoading}>
               {isLoading ? 'Refreshing...' : 'Refresh Status'}
            </button>
          </div>

          {error && (
            <div className="result-json-view font-mono" style={{ color: '#ef4444', marginBottom: '1rem', border: '1px solid #ef4444' }}>
              Error: {error}
            </div>
          )}

          {queueData.length === 0 && !isLoading && !error ? (
            <p className="doc-text" style={{ textAlign: 'center', padding: '3rem', opacity: 0.7 }}>The WhatsApp queue is currently empty.</p>
          ) : (
            <div className="table-responsive">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Phone</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Created / Processed</th>
                    <th>API Response (Celitix)</th>
                  </tr>
                </thead>
                <tbody>
                  {queueData.map((item) => {
                    const statusClass = 
                      item.status === 'sent' ? 'badge-green' : 
                      item.status === 'failed' ? 'badge-red' : 
                      'badge-neutral';
                      
                    return (
                      <tr key={item._id}>
                        <td>
                          {item._userId ? `${item._userId.firstName || ''} ${item._userId.lastName || ''}` : 'Unknown'}
                        </td>
                        <td className="font-mono">{item.phoneNumber || 'N/A'}</td>
                        <td>
                          <span className="badge badge-neutral" style={{ whiteSpace: 'nowrap' }}>
                            {item.type?.replace('_', ' ') || 'Unknown'}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${statusClass}`} style={{ textTransform: 'capitalize' }}>
                            {item.status}
                          </span>
                        </td>
                        <td className="font-mono" style={{ fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                          <div style={{ color: 'var(--text-muted)', marginBottom: '4px' }}>
                            {new Date(item.createdAt).toLocaleString()}
                          </div>
                          <div>
                            {item.processedAt ? new Date(item.processedAt).toLocaleString() : 'Pending'}
                          </div>
                        </td>
                        <td>
                          <pre className="font-mono" style={{ margin: 0, padding: '8px', background: 'rgba(0,0,0,0.3)', fontSize: '0.75rem', borderRadius: '4px', maxWidth: '350px', overflowX: 'auto', whiteSpace: 'pre-wrap' }}>
                            {item.apiResponse ? JSON.stringify(item.apiResponse, null, 2) : 'N/A'}
                          </pre>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

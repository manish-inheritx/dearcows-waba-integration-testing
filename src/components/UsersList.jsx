import { useState, useMemo } from 'react';

export function UsersList({
  users = [],
  isLoading,
  onRefresh,
  onOpenBalanceModal,
  onQuickAdjust,
  onCopyText,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL'); // ALL, LOW_BALANCE, POSITIVE, DAILY
  const [viewMode, setViewMode] = useState('TABLE'); // TABLE, CARDS
  const [copiedKey, setCopiedKey] = useState(null);

  const handleCopy = (text, key, label) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
    if (onCopyText) onCopyText(`Copied ${label}: ${text}`);
  };

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      // Search
      const search = searchTerm.toLowerCase().trim();
      const fullName = `${u.firstName || ''} ${u.lastName || ''}`.toLowerCase();
      const phone = String(u.phoneNumber || '');
      const id = String(u._id || '').toLowerCase();
      const matchesSearch = !search || fullName.includes(search) || phone.includes(search) || id.includes(search);

      if (!matchesSearch) return false;

      // Filter tabs
      const bal = Number(u.balance || 0);
      if (filterType === 'LOW_BALANCE') return bal <= 0;
      if (filterType === 'POSITIVE') return bal > 0;
      if (filterType === 'DAILY') return (u.deliveryType || '').toLowerCase() === 'daily';

      return true;
    });
  }, [users, searchTerm, filterType]);

  const stats = useMemo(() => {
    const total = users.length;
    const lowBalCount = users.filter((u) => Number(u.balance || 0) <= 0).length;
    const safeBalCount = users.filter((u) => Number(u.balance || 0) > 0).length;
    return { total, lowBalCount, safeBalCount };
  }, [users]);

  return (
    <div className="users-section">
      {/* Section Header */}
      <div className="users-section-header">
        <div className="users-header-left">
          <div className="users-title-row">
            <span className="badge badge-blue">API 2 • USER DIRECTORY</span>
            <h2 className="users-heading">WABA Test Users</h2>
            <span className="users-count-tag font-mono">{users.length} total</span>
          </div>
          <p className="users-subtext">
            Filtering database users where <code>lastName</code> contains <strong>"WABA"</strong>. Ready for notification testing.
          </p>
        </div>

        <div className="users-header-right">
          {/* View Mode Toggle */}
          <div className="view-toggle-group">
            <button
              className={`view-toggle-btn ${viewMode === 'TABLE' ? 'active' : ''}`}
              onClick={() => setViewMode('TABLE')}
              title="Table view"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="6" x2="21" y2="6"/>
                <line x1="3" y1="12" x2="21" y2="12"/>
                <line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>
            <button
              className={`view-toggle-btn ${viewMode === 'CARDS' ? 'active' : ''}`}
              onClick={() => setViewMode('CARDS')}
              title="Card grid view"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7"/>
                <rect x="14" y="3" width="7" height="7"/>
                <rect x="14" y="14" width="7" height="7"/>
                <rect x="3" y="14" width="7" height="7"/>
              </svg>
            </button>
          </div>

          {/* Refresh Button */}
          <button
            className="btn-refresh"
            onClick={onRefresh}
            disabled={isLoading}
            id="refresh-waba-users-btn"
            title="Fetch latest user records from server"
          >
            <svg
              className={isLoading ? 'animate-spin' : ''}
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
            >
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
            </svg>
            <span>{isLoading ? 'Fetching...' : 'Refresh Users'}</span>
          </button>
        </div>
      </div>

      {/* Quick Stats Bar */}
      <div className="stats-cards-grid">
        <div className="mini-stat-card">
          <div className="mini-stat-icon stat-total">👥</div>
          <div className="mini-stat-info">
            <span className="mini-stat-val font-mono">{stats.total}</span>
            <span className="mini-stat-label">Total WABA Test Users</span>
          </div>
        </div>

        <div className="mini-stat-card" style={{ borderColor: stats.lowBalCount > 0 ? 'rgba(239, 68, 68, 0.4)' : undefined }}>
          <div className="mini-stat-icon stat-alert">⚠️</div>
          <div className="mini-stat-info">
            <span className="mini-stat-val font-mono text-red">{stats.lowBalCount}</span>
            <span className="mini-stat-label">Low Balance (≤ 0L) • Cron Candidates</span>
          </div>
        </div>

        <div className="mini-stat-card">
          <div className="mini-stat-icon stat-safe">✅</div>
          <div className="mini-stat-info">
            <span className="mini-stat-val font-mono text-green">{stats.safeBalCount}</span>
            <span className="mini-stat-label">Safe Balance (&gt; 0L)</span>
          </div>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="filter-controls-row">
        <div className="search-input-box">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            placeholder="Search by name, phone (+91), or MongoDB ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          {searchTerm && (
            <button className="clear-search-btn" onClick={() => setSearchTerm('')}>
              ×
            </button>
          )}
        </div>

        <div className="filter-tabs-row">
          <button
            className={`filter-tab ${filterType === 'ALL' ? 'active' : ''}`}
            onClick={() => setFilterType('ALL')}
          >
            All Users ({users.length})
          </button>
          <button
            className={`filter-tab tab-low-balance ${filterType === 'LOW_BALANCE' ? 'active' : ''}`}
            onClick={() => setFilterType('LOW_BALANCE')}
          >
            ⚠️ Low Balance (≤ 0L) ({stats.lowBalCount})
          </button>
          <button
            className={`filter-tab tab-positive ${filterType === 'POSITIVE' ? 'active' : ''}`}
            onClick={() => setFilterType('POSITIVE')}
          >
            ✓ Safe Balance ({stats.safeBalCount})
          </button>
          <button
            className={`filter-tab ${filterType === 'DAILY' ? 'active' : ''}`}
            onClick={() => setFilterType('DAILY')}
          >
            Daily Delivery
          </button>
        </div>
      </div>

      {/* Main Table or Card Grid */}
      {filteredUsers.length === 0 ? (
        <div className="empty-users-state">
          <div className="empty-icon">🔍</div>
          <h3>No matching WABA users found</h3>
          <p>
            {users.length === 0
              ? 'No users with "WABA" in their lastName were returned from the server.'
              : 'Try clearing your search query or switching filter tabs.'}
          </p>
          {users.length === 0 && (
            <button className="btn-refresh" onClick={onRefresh} style={{ marginTop: '16px' }}>
              Retry Fetching Users
            </button>
          )}
        </div>
      ) : viewMode === 'TABLE' ? (
        <div className="table-wrapper">
          <table className="users-table">
            <thead>
              <tr>
                <th>User / Name</th>
                <th>Phone & Chat</th>
                <th>Balance (Liters)</th>
                <th>Regular Qty</th>
                <th>Delivery</th>
                <th>Mongo ID</th>
                <th style={{ textAlign: 'right' }}>Ledger Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => {
                const bal = Number(user.balance || 0);
                const isLow = bal <= 0;
                const phoneDigits = String(user.phoneNumber || '').replace(/\D/g, '');
                const waUrl = phoneDigits ? `https://wa.me/91${phoneDigits}` : null;

                return (
                  <tr key={user._id} className={isLow ? 'row-low-balance' : ''}>
                    {/* User Name */}
                    <td>
                      <div className="user-name-cell">
                        <div className="user-avatar-sm">
                          {(user.firstName?.[0] || 'U')}
                        </div>
                        <div>
                          <div className="user-full-name">
                            {user.firstName}{' '}
                            <span className="waba-highlight">{user.lastName}</span>
                          </div>
                          {user.rewardBalance > 0 && (
                            <div className="reward-tag font-mono">
                              ⭐ {user.rewardBalance} Reward
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Phone & WhatsApp link */}
                    <td>
                      <div className="phone-cell font-mono">
                        <span className="phone-text">{user.phoneNumber || 'N/A'}</span>
                        <div className="phone-actions">
                          <button
                            className="btn-cell-icon"
                            onClick={() => handleCopy(user.phoneNumber, `phone-${user._id}`, 'phone')}
                            title="Copy Phone Number"
                          >
                            {copiedKey === `phone-${user._id}` ? '✓' : (
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                              </svg>
                            )}
                          </button>
                          {waUrl && (
                            <a
                              href={waUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="btn-cell-icon wa-link"
                              title="Open in WhatsApp Web"
                            >
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                              </svg>
                            </a>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Balance */}
                    <td>
                      <div className="balance-cell">
                        <span className={`balance-badge font-mono ${isLow ? 'is-low' : 'is-positive'}`}>
                          {bal} L
                        </span>
                        {isLow && (
                          <span className="badge badge-red" style={{ fontSize: '0.68rem', padding: '1px 6px' }}>
                            Alert Target
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Regular Qty */}
                    <td>
                      <span className="font-mono">{user.regularQuantity ?? 1} L / order</span>
                    </td>

                    {/* Delivery */}
                    <td>
                      <span className="badge badge-neutral">
                        {user.deliveryType || 'Standard'}
                      </span>
                    </td>

                    {/* Mongo ID */}
                    <td>
                      <button
                        className="id-copy-pill font-mono"
                        onClick={() => handleCopy(user._id, `id-${user._id}`, 'User ID')}
                        title={`Click to copy full ID: ${user._id}`}
                      >
                        <span>{user._id ? user._id.slice(-6) : 'N/A'}</span>
                        <span className="copy-hint">
                          {copiedKey === `id-${user._id}` ? '✓ Copied' : 'copy'}
                        </span>
                      </button>
                    </td>

                    {/* Actions */}
                    <td style={{ textAlign: 'right' }}>
                      <div className="row-actions-group">
                        {/* Quick inline stepper */}
                        <div className="inline-stepper">
                          <button
                            className="btn-step-sub"
                            onClick={() => onQuickAdjust(user, -1)}
                            title="Deduct 1 Liter"
                          >
                            -1L
                          </button>
                          <button
                            className="btn-step-add"
                            onClick={() => onQuickAdjust(user, 1)}
                            title="Add 1 Liter"
                          >
                            +1L
                          </button>
                          <button
                            className="btn-step-add"
                            onClick={() => onQuickAdjust(user, 5)}
                            title="Add 5 Liters"
                          >
                            +5L
                          </button>
                        </div>

                        {/* Custom Modal Trigger */}
                        <button
                          className="btn-adjust-custom"
                          onClick={() => onOpenBalanceModal(user)}
                          title="Open Ledger Safe custom balance editor"
                        >
                          Custom...
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        /* Cards View */
        <div className="users-card-grid">
          {filteredUsers.map((user) => {
            const bal = Number(user.balance || 0);
            const isLow = bal <= 0;
            const phoneDigits = String(user.phoneNumber || '').replace(/\D/g, '');
            const waUrl = phoneDigits ? `https://wa.me/91${phoneDigits}` : null;

            return (
              <div key={user._id} className={`user-card-item ${isLow ? 'card-low-balance' : ''}`}>
                <div className="card-top-row">
                  <div className="card-user-info">
                    <div className="user-avatar-sm">
                      {(user.firstName?.[0] || 'U')}
                    </div>
                    <div>
                      <div className="user-full-name">
                        {user.firstName}{' '}
                        <span className="waba-highlight">{user.lastName}</span>
                      </div>
                      <span className="badge badge-neutral" style={{ marginTop: '2px' }}>
                        {user.deliveryType || 'Daily'}
                      </span>
                    </div>
                  </div>

                  <div className="card-balance-box">
                    <span className="card-balance-label">Balance</span>
                    <span className={`card-balance-val font-mono ${isLow ? 'text-red' : 'text-green'}`}>
                      {bal} L
                    </span>
                  </div>
                </div>

                <div className="card-meta-list font-mono">
                  <div className="card-meta-item">
                    <span className="meta-icon">📞</span>
                    <span className="meta-val">{user.phoneNumber || 'N/A'}</span>
                    <button
                      className="btn-mini-copy"
                      onClick={() => handleCopy(user.phoneNumber, `phone-${user._id}`, 'phone')}
                    >
                      {copiedKey === `phone-${user._id}` ? '✓' : 'Copy'}
                    </button>
                    {waUrl && (
                      <a href={waUrl} target="_blank" rel="noreferrer" className="wa-icon-link">
                        WhatsApp ↗
                      </a>
                    )}
                  </div>

                  <div className="card-meta-item">
                    <span className="meta-icon">🆔</span>
                    <span className="meta-val">{user._id}</span>
                    <button
                      className="btn-mini-copy"
                      onClick={() => handleCopy(user._id, `id-${user._id}`, 'User ID')}
                    >
                      {copiedKey === `id-${user._id}` ? '✓' : 'Copy'}
                    </button>
                  </div>

                  <div className="card-meta-item">
                    <span className="meta-icon">🥛</span>
                    <span className="meta-val">Regular: {user.regularQuantity ?? 1} L/order</span>
                    {user.rewardBalance > 0 && (
                      <span className="reward-tag">⭐ {user.rewardBalance} Reward</span>
                    )}
                  </div>
                </div>

                {isLow && (
                  <div className="card-alert-strip">
                    ⚠️ Low Balance: Will receive WABA reminder on next cron trigger!
                  </div>
                )}

                {/* Card Action Buttons */}
                <div className="card-actions-footer">
                  <div className="inline-stepper">
                    <button
                      className="btn-step-sub"
                      onClick={() => onQuickAdjust(user, -1)}
                      title="Deduct 1 Liter"
                    >
                      -1L
                    </button>
                    <button
                      className="btn-step-add"
                      onClick={() => onQuickAdjust(user, 1)}
                      title="Add 1 Liter"
                    >
                      +1L
                    </button>
                    <button
                      className="btn-step-add"
                      onClick={() => onQuickAdjust(user, 5)}
                      title="Add 5 Liters"
                    >
                      +5L
                    </button>
                  </div>
                  <button
                    className="btn-adjust-custom"
                    onClick={() => onOpenBalanceModal(user)}
                  >
                    Adjust Balance...
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

import { useState } from 'react';

const QUICK_AMOUNTS = [
  { label: '+1 L', val: 1 },
  { label: '+2 L', val: 2 },
  { label: '+5 L', val: 5 },
  { label: '+10 L', val: 10 },
  { label: '-1 L', val: -1 },
  { label: '-2 L', val: -2 },
  { label: '-5 L', val: -5 },
  { label: '-10 L', val: -10 },
];

export function UserBalanceModal({
  user,
  isOpen,
  onClose,
  onUpdateBalance,
  isUpdating,
}) {
  const [amount, setAmount] = useState('5');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen || !user) return null;

  const currentBalance = Number(user.balance || 0);
  const numAmount = parseFloat(amount);
  const isValidNum = !isNaN(numAmount) && numAmount !== 0;
  const projectedBalance = isValidNum
    ? Math.round((currentBalance + numAmount) * 100) / 100
    : currentBalance;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isValidNum) {
      setErrorMsg('Please enter a valid non-zero amount in liters.');
      return;
    }
    setErrorMsg('');
    onUpdateBalance({
      userId: user._id,
      amount: numAmount,
      user,
    });
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-title-group">
            <span className="badge badge-purple">API 3 • LEDGER SAFE</span>
            <h3>Update User Wallet Balance</h3>
          </div>
          <button className="btn-icon" onClick={onClose} aria-label="Close modal">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* User Card Inside Modal */}
        <div className="modal-user-card">
          <div className="modal-user-avatar">
            {(user.firstName?.[0] || 'U')}{(user.lastName?.[0] || 'W')}
          </div>
          <div className="modal-user-info">
            <div className="modal-user-name">
              {user.firstName} {user.lastName}
            </div>
            <div className="modal-user-meta font-mono">
              <span>📞 {user.phoneNumber || 'N/A'}</span>
              <span>ID: {user._id?.slice(-8) || user._id}</span>
            </div>
          </div>
          <div className="modal-user-balance-pill">
            <span className="pill-label">Current Balance</span>
            <span className={`pill-value font-mono ${currentBalance <= 0 ? 'text-red' : 'text-green'}`}>
              {currentBalance} L
            </span>
          </div>
        </div>

        {/* Ledger Safety Note */}
        <div className="ledger-safety-alert">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#25d366" strokeWidth="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            <path d="m9 12 2 2 4-4"/>
          </svg>
          <div>
            <strong>Ledger Integrity Guaranteed:</strong> Automatically creates a <code>BalanceHistory</code> ledger entry and resets <code>lowBalanceDays</code> counter so the user stops receiving low-balance warnings.
          </div>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {/* Quick Presets */}
          <div className="quick-presets-group">
            <label className="input-label">Quick Amount Presets (Liters)</label>
            <div className="quick-presets-grid">
              {QUICK_AMOUNTS.map((item) => {
                const isSelected = numAmount === item.val;
                const isPositive = item.val > 0;
                return (
                  <button
                    type="button"
                    key={item.label}
                    className={`preset-chip ${isSelected ? 'selected' : ''} ${isPositive ? 'preset-pos' : 'preset-neg'}`}
                    onClick={() => setAmount(String(item.val))}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Amount Input */}
          <div className="form-field">
            <label htmlFor="balance-amount-input" className="input-label">
              Adjustment Amount (in Liters)
              <span className="label-tip">Use negative values to deduct (e.g., -2)</span>
            </label>
            <div className="amount-input-wrapper">
              <input
                id="balance-amount-input"
                type="number"
                step="any"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setErrorMsg('');
                }}
                placeholder="e.g. 5 or -2.5"
                className="amount-input font-mono"
                autoFocus
              />
              <span className="unit-label">Liters (L)</span>
            </div>
            {errorMsg && <div className="form-error-msg">{errorMsg}</div>}
          </div>

          {/* Calculation Preview */}
          <div className="calculation-preview-box">
            <div className="calc-row">
              <span className="calc-label">Current Wallet Balance:</span>
              <span className="calc-val font-mono">{currentBalance} L</span>
            </div>
            <div className="calc-row">
              <span className="calc-label">Adjustment:</span>
              <span className={`calc-val font-mono ${numAmount >= 0 ? 'text-green' : 'text-red'}`}>
                {numAmount >= 0 ? `+${numAmount || 0}` : numAmount || 0} L
              </span>
            </div>
            <div className="calc-divider"></div>
            <div className="calc-row calc-result">
              <span className="calc-label"><strong>Projected Balance:</strong></span>
              <span className={`calc-val-lg font-mono ${projectedBalance <= 0 ? 'text-red' : 'text-green'}`}>
                <strong>{projectedBalance} L</strong>
              </span>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="modal-actions-bar">
            <button
              type="button"
              className="btn-cancel"
              onClick={onClose}
              disabled={isUpdating}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-confirm-balance"
              disabled={isUpdating || !isValidNum}
              id="confirm-update-balance-btn"
            >
              {isUpdating ? (
                <>
                  <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                    <path d="M12 2a10 10 0 0 1 10 10" />
                  </svg>
                  <span>Updating Ledger...</span>
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 6L9 17l-5-5"/>
                  </svg>
                  <span>Confirm Balance Update</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

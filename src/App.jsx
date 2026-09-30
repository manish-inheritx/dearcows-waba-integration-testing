import { useState, useEffect, useCallback } from 'react';
import './App.css';
import { Header } from './components/Header';
import { ConfigBar } from './components/ConfigBar';
import { TriggerProcessorCard } from './components/TriggerProcessorCard';
import { UsersList } from './components/UsersList';
import { UserBalanceModal } from './components/UserBalanceModal';
import { ActivityConsole } from './components/ActivityConsole';
import { DocsModal } from './components/DocsModal';
import { ToastContainer } from './components/Toast';
import { QueueStatusModal } from './components/QueueStatusModal';
import {
  getStoredConfig,
  saveStoredConfig,
  triggerWhatsappQueueProcessor,
  getWabaUsers,
  updateUserBalance,
  clearWhatsappQueue,
} from './services/api';

export default function App() {
  const [config, setConfig] = useState(getStoredConfig);
  const [users, setUsers] = useState([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isTriggeringQueue, setIsTriggeringQueue] = useState(false);
  const [isClearingQueue, setIsClearingQueue] = useState(false);
  const [lastTriggerResult, setLastTriggerResult] = useState(null);
  const [autoRefreshUsers, setAutoRefreshUsers] = useState(true);

  // Modals & Panels state
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isConsoleOpen, setIsConsoleOpen] = useState(false);
  const [isDocsOpen, setIsDocsOpen] = useState(false);
  const [isQueueStatusModalOpen, setIsQueueStatusModalOpen] = useState(false);
  const [selectedUserForModal, setSelectedUserForModal] = useState(null);
  const [isUpdatingBalance, setIsUpdatingBalance] = useState(false);
  const [isPinging, setIsPinging] = useState(false);

  // Activity logs and toasts
  const [logs, setLogs] = useState([]);
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((title, message, type = 'info') => {
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4200);
  }, []);

  const dismissToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleLogEntry = useCallback((entry) => {
    setLogs((prev) => [entry, ...prev].slice(0, 100)); // Keep up to 100 entries
  }, []);

  // Fetch WABA test users
  const fetchUsers = useCallback(async (customCfg = config) => {
    setIsLoadingUsers(true);
    try {
      const res = await getWabaUsers({
        config: customCfg,
        onLogEntry: handleLogEntry,
      });

      const list = Array.isArray(res.data) ? res.data : [];
      setUsers(list);
      return list;
    } catch (err) {
      console.error('Failed to fetch WABA users:', err);
      addToast(
        'Fetch Users Failed',
        err.message || 'Could not retrieve WABA users. Check Base URL or backend status.',
        'error'
      );
      return [];
    } finally {
      setIsLoadingUsers(false);
    }
  }, [config, addToast, handleLogEntry]);

  // Synchronize on load and config change
  useEffect(() => {
    let ignore = false;
    async function load() {
      setIsLoadingUsers(true);
      try {
        const res = await getWabaUsers({
          config,
          onLogEntry: handleLogEntry,
        });
        if (!ignore) {
          const list = Array.isArray(res.data) ? res.data : [];
          setUsers(list);
        }
      } catch (err) {
        if (!ignore) {
          console.error('Failed to fetch WABA users:', err);
          addToast(
            'Fetch Users Failed',
            err.message || 'Could not retrieve WABA users. Check Base URL or backend status.',
            'error'
          );
        }
      } finally {
        if (!ignore) {
          setIsLoadingUsers(false);
        }
      }
    }
    load();
    return () => {
      ignore = true;
    };
  }, [config, handleLogEntry, addToast]);

  // Update Config
  const handleUpdateConfig = (newCfg) => {
    const updated = { ...config, ...newCfg };
    setConfig(updated);
    saveStoredConfig(updated);
    addToast('Configuration Saved', `Target Base URL: ${updated.baseUrl}`, 'success');
  };

  // API 1: Trigger WhatsApp Queue Processor
  const handleTriggerQueue = async () => {
    setIsTriggeringQueue(true);
    setLastTriggerResult(null);

    try {
      const res = await triggerWhatsappQueueProcessor({
        config,
        onLogEntry: handleLogEntry,
      });

      setLastTriggerResult({
        error: false,
        timestamp: new Date().toLocaleTimeString(),
        data: res,
        message: res.message || 'Eligible users enqueued. Processor started.',
      });

      addToast(
        'Queue Processor Triggered',
        res.message || 'WhatsApp notification queue processor started in background.',
        'success'
      );

      if (autoRefreshUsers) {
        setTimeout(() => {
          fetchUsers();
        }, 600);
      }
    } catch (err) {
      console.error('Trigger queue error:', err);
      setLastTriggerResult({
        error: true,
        timestamp: new Date().toLocaleTimeString(),
        data: err.response || null,
        message: err.message || 'Failed to trigger queue processor.',
      });
      addToast('Trigger Failed', err.message, 'error');
    } finally {
      setIsTriggeringQueue(false);
    }
  };

  const handleClearQueue = async () => {
    setIsClearingQueue(true);
    setLastTriggerResult(null);

    try {
      const res = await clearWhatsappQueue({
        config,
        onLogEntry: handleLogEntry,
      });

      setLastTriggerResult({
        error: false,
        timestamp: new Date().toLocaleTimeString(),
        data: res,
        message: res.message || 'Queue cleared successfully.',
      });

      addToast(
        'Queue Cleared',
        res.message || 'WhatsApp notification queue has been cleared.',
        'success'
      );
    } catch (err) {
      console.error('Clear queue error:', err);
      setLastTriggerResult({
        error: true,
        timestamp: new Date().toLocaleTimeString(),
        data: err.response || null,
        message: err.message || 'Failed to clear queue.',
      });
      addToast('Clear Failed', err.message, 'error');
    } finally {
      setIsClearingQueue(false);
    }
  };

  // API 3: Update User Balance (from Modal)
  const handleUpdateUserBalance = async ({ userId, amount, user }) => {
    setIsUpdatingBalance(true);
    try {
      await updateUserBalance({
        userId,
        amount,
        config,
        onLogEntry: handleLogEntry,
      });

      addToast(
        'Balance Updated (Ledger Safe)',
        `Adjusted by ${amount >= 0 ? `+${amount}` : amount}L for ${user.firstName} ${user.lastName}.`,
        'success'
      );

      setSelectedUserForModal(null);

      // Optimistically update or refetch
      setUsers((prev) =>
        prev.map((u) => {
          if (u._id === userId) {
            const newBal = Math.round((Number(u.balance || 0) + Number(amount)) * 100) / 100;
            return { ...u, balance: newBal, lowBalanceDays: 0 };
          }
          return u;
        })
      );

      // Also trigger a background sync
      fetchUsers();
    } catch (err) {
      console.error('Update balance error:', err);
      addToast('Balance Update Failed', err.message, 'error');
    } finally {
      setIsUpdatingBalance(false);
    }
  };

  // Quick inline balance adjust (+1, +5, -1)
  const handleQuickAdjust = async (user, delta) => {
    try {
      await updateUserBalance({
        userId: user._id,
        amount: delta,
        config,
        onLogEntry: handleLogEntry,
      });

      addToast(
        'Balance Adjusted',
        `${user.firstName} ${user.lastName} balance updated by ${delta > 0 ? `+${delta}` : delta} L`,
        'success'
      );

      setUsers((prev) =>
        prev.map((u) => {
          if (u._id === user._id) {
            const newBal = Math.round((Number(u.balance || 0) + delta) * 100) / 100;
            return { ...u, balance: newBal, lowBalanceDays: 0 };
          }
          return u;
        })
      );
    } catch (err) {
      console.error('Quick adjust error:', err);
      addToast('Quick Adjust Failed', err.message, 'error');
    }
  };

  // Ping connection
  const handlePing = async () => {
    setIsPinging(true);
    const start = Date.now();
    try {
      console.log(config)
      await getWabaUsers({
        config,
        onLogEntry: handleLogEntry,
      });
      const ms = Date.now() - start;
      addToast('Connectivity Confirmed', `Server reachable in ${ms}ms at ${config.baseUrl}`, 'success');
    } catch (err) {
      addToast('Ping Failed', err.message, 'error');
    } finally {
      setIsPinging(false);
    }
  };

  const hasErrorLog = logs.some((l) => l.error);

  return (
    <div className="app-container">
      {/* Top Navbar */}
      <Header
        onOpenDocs={() => setIsDocsOpen(true)}
        onToggleConsole={() => setIsConsoleOpen(!isConsoleOpen)}
        onToggleConfig={() => setIsConfigOpen(!isConfigOpen)}
        isConfigOpen={isConfigOpen}
        isConsoleOpen={isConsoleOpen}
        logsCount={logs.length}
        hasErrorLog={hasErrorLog}
      />

      {/* Expandable Config Bar */}
      {isConfigOpen && (
        <ConfigBar
          config={config}
          onUpdateConfig={handleUpdateConfig}
          onPing={handlePing}
          isPinging={isPinging}
          onClose={() => setIsConfigOpen(false)}
        />
      )}

      {/* Main Dashboard Workspace */}
      <main className="main-content">
        {/* API 1: Queue Trigger Card */}
        <TriggerProcessorCard
          onTrigger={handleTriggerQueue}
          isTriggering={isTriggeringQueue}
          onClearQueue={handleClearQueue}
          isClearingQueue={isClearingQueue}
          onViewQueueStatus={() => setIsQueueStatusModalOpen(true)}
          lastTriggerResult={lastTriggerResult}
          autoRefreshUsers={autoRefreshUsers}
          onToggleAutoRefresh={setAutoRefreshUsers}
        />

        {/* API 2: WABA Test Users Table / Cards */}
        <UsersList
          users={users}
          isLoading={isLoadingUsers}
          onRefresh={() => fetchUsers(config)}
          onOpenBalanceModal={(user) => setSelectedUserForModal(user)}
          onQuickAdjust={handleQuickAdjust}
          onCopyText={(msg) => addToast('Copied', msg, 'info')}
        />
      </main>

      {/* API 3: Ledger Safe Balance Modal */}
      <UserBalanceModal
        key={selectedUserForModal?._id || 'none'}
        user={selectedUserForModal}
        isOpen={Boolean(selectedUserForModal)}
        onClose={() => setSelectedUserForModal(null)}
        onUpdateBalance={handleUpdateUserBalance}
        isUpdating={isUpdatingBalance}
      />

      {/* Network & Activity Console */}
      <ActivityConsole
        logs={logs}
        isOpen={isConsoleOpen}
        onClose={() => setIsConsoleOpen(false)}
        onClear={() => setLogs([])}
        onCopyText={(msg) => addToast('Copied', msg, 'info')}
      />

      {/* API Documentation & cURL Modal */}
      <DocsModal
        isOpen={isDocsOpen}
        onClose={() => setIsDocsOpen(false)}
        baseUrl={config.baseUrl}
        onCopyText={(msg) => addToast('Copied', msg, 'info')}
      />

      {/* API 5: Queue Status Modal */}
      <QueueStatusModal
        isOpen={isQueueStatusModalOpen}
        onClose={() => setIsQueueStatusModalOpen(false)}
        config={config}
      />

      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

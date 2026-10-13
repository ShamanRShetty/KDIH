import useOnlineStatus from '../hooks/useOnlineStatus';
import './OfflineIndicator.css';

/**
 * Offline / Online Connection Status Indicator Banner.
 * Clearly informs the user when they are offline, noting that all local
 * phrases, search, and guided dialogs remain fully functional from the offline cache.
 */
export default function OfflineIndicator() {
  const { isOnline } = useOnlineStatus();

  if (isOnline) {
    return null;
  }

  return (
    <div
      className="offline-indicator"
      role="status"
      aria-live="polite"
    >
      <div className="container offline-indicator-inner">
        <span className="offline-icon" aria-hidden="true">📡</span>
        <span className="offline-text">
          <strong>Offline Mode Active</strong> — All local Kannada phrases, search, and guided conversations remain fully available.
        </span>
      </div>
    </div>
  );
}

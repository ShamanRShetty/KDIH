import useOnlineStatus from '../hooks/useOnlineStatus';
import { AlertCircleIcon } from './Icons';
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
        <AlertCircleIcon size={16} />
        <span className="offline-text">
          <strong>Offline Mode Active:</strong> All 69 verified phrases, audio pronunciation, and practice flashcards are running from local browser cache.
        </span>
      </div>
    </div>
  );
}

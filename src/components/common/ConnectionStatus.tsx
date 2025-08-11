import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Wifi, WifiOff, RefreshCw, AlertCircle } from 'lucide-react';
import { offlineStorage } from '@/lib/offline-storage';
import { toast } from 'sonner';

interface ConnectionStatusProps {
  className?: string;
}

export function ConnectionStatus({ className }: ConnectionStatusProps) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [unsyncedCount, setUnsyncedCount] = useState(0);
  const [lastSyncTime, setLastSyncTime] = useState<string>('');

  useEffect(() => {
    const handleConnectionChange = (event: CustomEvent) => {
      setIsOnline(event.detail.status === 'online');
      setLastSyncTime(event.detail.timestamp);
      
      if (event.detail.status === 'online') {
        toast.success('Connection restored! Syncing data...');
      } else {
        toast.warning('Working offline. Changes will sync when connection is restored.');
      }
    };

    const updateUnsyncedCount = async () => {
      const count = await offlineStorage.getUnsyncedCount();
      setUnsyncedCount(count);
    };

    // Set up event listeners
    window.addEventListener('connection-change', handleConnectionChange as EventListener);
    
    // Update unsynced count periodically
    updateUnsyncedCount();
    const interval = setInterval(updateUnsyncedCount, 5000);

    return () => {
      window.removeEventListener('connection-change', handleConnectionChange as EventListener);
      clearInterval(interval);
    };
  }, []);

  const handleForceSync = async () => {
    if (!isOnline) {
      toast.error('Cannot sync while offline');
      return;
    }

    toast.info('Forcing sync...');
    // Trigger sync by dispatching online event
    window.dispatchEvent(new Event('online'));
  };

  if (isOnline && unsyncedCount === 0) {
    return null; // Don't show anything when online and synced
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {!isOnline && (
        <Badge variant="destructive" className="flex items-center gap-1">
          <WifiOff className="w-3 h-3" />
          Offline
        </Badge>
      )}
      
      {isOnline && unsyncedCount > 0 && (
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="flex items-center gap-1">
            <RefreshCw className="w-3 h-3" />
            {unsyncedCount} pending
          </Badge>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleForceSync}
            className="h-6 px-2 text-xs"
          >
            Sync Now
          </Button>
        </div>
      )}
      
      {!isOnline && unsyncedCount > 0 && (
        <Badge variant="outline" className="flex items-center gap-1 text-orange-600 border-orange-200">
          <AlertCircle className="w-3 h-3" />
          {unsyncedCount} changes pending
        </Badge>
      )}
    </div>
  );
}

// Global connection indicator for mobile
export function GlobalConnectionIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handleConnectionChange = (event: CustomEvent) => {
      const online = event.detail.status === 'online';
      setIsOnline(online);
      setShow(true);
      
      // Hide after 3 seconds if online, keep visible if offline
      if (online) {
        setTimeout(() => setShow(false), 3000);
      }
    };

    window.addEventListener('connection-change', handleConnectionChange as EventListener);
    
    // Show initial state if offline
    if (!isOnline) {
      setShow(true);
    }

    return () => {
      window.removeEventListener('connection-change', handleConnectionChange as EventListener);
    };
  }, []);

  if (!show) return null;

  return (
    <div className={`fixed top-4 right-4 z-50 animate-fade-in ${
      isOnline ? 'online-indicator' : 'offline-indicator'
    }`}>
      <div className="flex items-center gap-2">
        {isOnline ? (
          <>
            <Wifi className="w-4 h-4" />
            Back Online
          </>
        ) : (
          <>
            <WifiOff className="w-4 h-4" />
            Working Offline
          </>
        )}
      </div>
    </div>
  );
}
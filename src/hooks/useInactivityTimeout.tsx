
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface UseInactivityTimeoutProps {
  timeout?: number; // in milliseconds
  onTimeout: () => void;
}

export const useInactivityTimeout = ({ 
  timeout = 5 * 60 * 1000, // 5 minutes default
  onTimeout 
}: UseInactivityTimeoutProps) => {
  const [isActive, setIsActive] = useState(true);
  const { isAuthenticated } = useAuth();

  const resetTimer = useCallback(() => {
    setIsActive(true);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;

    let timeoutId: NodeJS.Timeout;

    const handleActivity = () => {
      resetTimer();
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setIsActive(false);
        onTimeout();
      }, timeout);
    };

    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click'
    ];

    // Initialize timer
    timeoutId = setTimeout(() => {
      setIsActive(false);
      onTimeout();
    }, timeout);

    // Add event listeners
    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    return () => {
      clearTimeout(timeoutId);
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
    };
  }, [isAuthenticated, timeout, onTimeout, resetTimer]);

  return { isActive, resetTimer };
};

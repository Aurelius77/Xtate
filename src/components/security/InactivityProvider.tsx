
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useInactivityTimeout } from '@/hooks/useInactivityTimeout';
import { useAuth } from '@/contexts/SecureAuthContext';
import PasscodeModal from './PasscodeModal';

interface InactivityContextType {
  isLocked: boolean;
  resetTimer: () => void;
}

const InactivityContext = createContext<InactivityContextType | undefined>(undefined);

export const useInactivity = () => {
  const context = useContext(InactivityContext);
  if (!context) {
    throw new Error('useInactivity must be used within InactivityProvider');
  }
  return context;
};

interface InactivityProviderProps {
  children: ReactNode;
}

export const InactivityProvider = ({ children }: InactivityProviderProps) => {
  const [isLocked, setIsLocked] = useState(false);
  const { isAuthenticated } = useAuth();

  const { resetTimer } = useInactivityTimeout({
    timeout: 5 * 60 * 1000, // 5 minutes
    onTimeout: () => setIsLocked(true)
  });

  // Logging out (including from inside the lock modal itself) must dismiss the
  // modal — otherwise it stays mounted over the landing page after redirect,
  // since isLocked is local state with nothing else to clear it.
  useEffect(() => {
    if (!isAuthenticated) setIsLocked(false);
  }, [isAuthenticated]);

  const handleUnlock = () => {
    setIsLocked(false);
    resetTimer();
  };

  return (
    <InactivityContext.Provider value={{ isLocked, resetTimer }}>
      {children}
      <PasscodeModal isOpen={isLocked} onUnlock={handleUnlock} />
    </InactivityContext.Provider>
  );
};

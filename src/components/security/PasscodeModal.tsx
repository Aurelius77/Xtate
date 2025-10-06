
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/SecureAuthContext';

interface PasscodeModalProps {
  isOpen: boolean;
  onUnlock: () => void;
}

const PasscodeModal = ({ isOpen, onUnlock }: PasscodeModalProps) => {
  const [passcode, setPasscode] = useState('');
  const [showPasscode, setShowPasscode] = useState(false);
  const [error, setError] = useState('');
  const { user, logout } = useAuth();

  // Simple passcode - in production, this would be hashed and stored securely
  const defaultPasscode = '1234';

  useEffect(() => {
    if (isOpen) {
      setPasscode('');
      setError('');
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passcode === defaultPasscode) {
      onUnlock();
      setPasscode('');
      setError('');
    } else {
      setError('Invalid passcode');
      setPasscode('');
    }
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md glass-card border-cyan-400/20 [&>button]:hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-cyan-50">
            <Shield className="h-5 w-5 text-cyan-400" />
            Session Locked
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-cyan-200 text-sm">
            Your session has been locked due to inactivity. Enter your passcode to continue.
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="passcode" className="text-cyan-100">Passcode</Label>
              <div className="relative">
                <Input
                  id="passcode"
                  type={showPasscode ? 'text' : 'password'}
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="Enter passcode"
                  className="glass-input pr-10"
                  autoFocus
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowPasscode(!showPasscode)}
                >
                  {showPasscode ? (
                    <EyeOff className="h-4 w-4 text-cyan-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-cyan-400" />
                  )}
                </Button>
              </div>
              {error && (
                <p className="text-red-400 text-sm">{error}</p>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                type="submit"
                className="flex-1 bg-cyan-600 hover:bg-cyan-700"
                disabled={!passcode}
              >
                Unlock
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleLogout}
                className="flex-1 border-red-400/30 text-red-400 hover:bg-red-400/10"
              >
                Logout
              </Button>
            </div>
          </form>

          <div className="text-center">
            <p className="text-xs text-cyan-300">
              Logged in as: {user?.full_name}
            </p>
            <p className="text-xs text-cyan-400 mt-1">
              Demo passcode: 1234
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PasscodeModal;


import React, { useState, useEffect } from 'react';
import bcrypt from 'bcryptjs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/SecureAuthContext';
import { supabase } from '@/integrations/supabase/client';

interface PasscodeModalProps {
  isOpen: boolean;
  onUnlock: () => void;
}

const isFourDigits = (value: string) => /^\d{4}$/.test(value);

const PasscodeModal = ({ isOpen, onUnlock }: PasscodeModalProps) => {
  const [passcode, setPasscode] = useState('');
  const [confirmPasscode, setConfirmPasscode] = useState('');
  const [showPasscode, setShowPasscode] = useState(false);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const { user, logout, refreshAuth } = useAuth();

  const needsSetup = !user?.inactivity_pin_hash;

  useEffect(() => {
    if (isOpen) {
      setPasscode('');
      setConfirmPasscode('');
      setError('');
    }
  }, [isOpen]);

  const handleSetupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!isFourDigits(passcode)) {
      setError('PIN must be exactly 4 digits');
      return;
    }
    if (passcode !== confirmPasscode) {
      setError('PINs do not match');
      return;
    }

    setIsSaving(true);
    try {
      const hash = bcrypt.hashSync(passcode, 10);
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ inactivity_pin_hash: hash })
        .eq('id', user.id);
      if (updateError) throw updateError;

      await refreshAuth();
      onUnlock();
      setPasscode('');
      setConfirmPasscode('');
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not set PIN');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUnlockSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (user?.inactivity_pin_hash && bcrypt.compareSync(passcode, user.inactivity_pin_hash)) {
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
          {needsSetup ? (
            <>
              <p className="text-cyan-200 text-sm">
                Set a 4-digit PIN to protect your session. You'll use this to unlock after inactivity.
              </p>
              <form onSubmit={handleSetupSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-passcode" className="text-cyan-100">New PIN</Label>
                  <Input
                    id="new-passcode"
                    type={showPasscode ? 'text' : 'password'}
                    inputMode="numeric"
                    maxLength={4}
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value.replace(/\D/g, ''))}
                    placeholder="4-digit PIN"
                    className="glass-input"
                    autoFocus
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-passcode" className="text-cyan-100">Confirm PIN</Label>
                  <Input
                    id="confirm-passcode"
                    type={showPasscode ? 'text' : 'password'}
                    inputMode="numeric"
                    maxLength={4}
                    value={confirmPasscode}
                    onChange={(e) => setConfirmPasscode(e.target.value.replace(/\D/g, ''))}
                    placeholder="Re-enter PIN"
                    className="glass-input"
                  />
                  {error && <p className="text-red-400 text-sm">{error}</p>}
                </div>
                <div className="flex gap-2">
                  <Button type="submit" className="flex-1 bg-cyan-600 hover:bg-cyan-700" disabled={isSaving}>
                    {isSaving ? 'Saving...' : 'Set PIN & Unlock'}
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
            </>
          ) : (
            <>
              <p className="text-cyan-200 text-sm">
                Your session has been locked due to inactivity. Enter your PIN to continue.
              </p>
              <form onSubmit={handleUnlockSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="passcode" className="text-cyan-100">PIN</Label>
                  <div className="relative">
                    <Input
                      id="passcode"
                      type={showPasscode ? 'text' : 'password'}
                      inputMode="numeric"
                      maxLength={4}
                      value={passcode}
                      onChange={(e) => setPasscode(e.target.value.replace(/\D/g, ''))}
                      placeholder="Enter PIN"
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
                    disabled={!isFourDigits(passcode)}
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
            </>
          )}

          <div className="text-center">
            <p className="text-xs text-cyan-300">
              Logged in as: {user?.full_name}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PasscodeModal;

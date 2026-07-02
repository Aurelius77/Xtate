import { useState } from 'react';
import bcrypt from 'bcryptjs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/SecureAuthContext';
import { supabase } from '@/integrations/supabase/client';

interface SetPinDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const isFourDigits = (value: string) => /^\d{4}$/.test(value);

const SetPinDialog = ({ isOpen, onClose }: SetPinDialogProps) => {
  const { toast } = useToast();
  const { user, refreshAuth } = useAuth();
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!isFourDigits(pin)) {
      toast({ title: 'Invalid PIN', description: 'PIN must be exactly 4 digits.', variant: 'destructive' });
      return;
    }
    if (pin !== confirmPin) {
      toast({ title: 'PIN Mismatch', description: 'The PINs you entered do not match.', variant: 'destructive' });
      return;
    }

    setIsSaving(true);
    try {
      const hash = bcrypt.hashSync(pin, 10);
      const { error } = await supabase.from('profiles').update({ inactivity_pin_hash: hash }).eq('id', user.id);
      if (error) throw error;

      await refreshAuth();
      toast({ title: 'PIN Updated', description: 'Your session lock PIN has been set.' });
      setPin('');
      setConfirmPin('');
      onClose();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not update PIN.';
      toast({ title: 'Update Failed', description: message, variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Set Session PIN</DialogTitle>
          <DialogDescription>This 4-digit PIN unlocks your session after an inactivity lock.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new-pin">New PIN</Label>
            <Input
              id="new-pin"
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
              placeholder="4-digit PIN"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-pin">Confirm PIN</Label>
            <Input
              id="confirm-pin"
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
              placeholder="Re-enter PIN"
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save PIN'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SetPinDialog;

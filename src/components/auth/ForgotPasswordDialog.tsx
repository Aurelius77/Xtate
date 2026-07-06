import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ForgotPasswordDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const ForgotPasswordDialog = ({ isOpen, onClose }: ForgotPasswordDialogProps) => {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setIsSending(false);

    if (error) {
      toast({ title: 'Password Reset Failed', description: error.message, variant: 'destructive' });
      return;
    }

    toast({ title: 'Check Your Email', description: 'If an account exists for that email, a reset link has been sent.' });
    setEmail('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-sm bg-white border-none rounded-3xl shadow-2xl p-8">
        <DialogHeader>
          <DialogTitle className="font-display text-xl font-bold text-slate-900 tracking-tight">Reset Your Password</DialogTitle>
          <DialogDescription className="text-slate-500">Enter your email and we'll send you a link to reset your password.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reset-email" className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Email Address</Label>
            <Input
              id="reset-email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 border-gray-100 bg-gray-50 rounded-xl font-semibold text-slate-900 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-blue-100 focus-visible:ring-offset-0"
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20"
            disabled={isSending}
          >
            {isSending ? 'Sending...' : 'Send Reset Link'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ForgotPasswordDialog;

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { validatePassword } from '@/lib/security';

const ResetPassword = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [hasRecoverySession, setHasRecoverySession] = useState<boolean | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Supabase exchanges the recovery link for a session automatically and fires
    // PASSWORD_RECOVERY; getSession() also resolves once that exchange completes.
    supabase.auth.getSession().then(({ data }) => {
      setHasRecoverySession(!!data.session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || (session && hasRecoverySession === null)) {
        setHasRecoverySession(true);
      }
    });

    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({ title: 'Password Mismatch', description: 'Please ensure passwords match', variant: 'destructive' });
      return;
    }

    const validation = validatePassword(password);
    if (!validation.isValid) {
      toast({ title: 'Weak Password', description: validation.errors[0], variant: 'destructive' });
      return;
    }

    setIsSaving(true);
    const { error } = await supabase.auth.updateUser({ password });
    setIsSaving(false);

    if (error) {
      toast({ title: 'Reset Failed', description: error.message, variant: 'destructive' });
      return;
    }

    toast({ title: 'Password Updated', description: 'Your password has been reset. You can now sign in.' });
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Set a New Password</CardTitle>
          <CardDescription>Choose a new password for your XTATE account.</CardDescription>
        </CardHeader>
        <CardContent>
          {hasRecoverySession === false ? (
            <p className="text-sm text-muted-foreground">
              This reset link is invalid or has expired. Please request a new one from the sign-in screen.
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-new-password">Confirm Password</Label>
                <Input
                  id="confirm-new-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isSaving || hasRecoverySession === null}>
                {isSaving ? 'Updating...' : 'Update Password'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPassword;

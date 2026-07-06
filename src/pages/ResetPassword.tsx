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

  const inputClass = "h-12 border-gray-100 bg-gray-50 rounded-xl font-semibold text-slate-900 focus-visible:ring-2 focus-visible:ring-blue-100 focus-visible:ring-offset-0";
  const labelClass = "text-[11px] font-bold text-gray-400 uppercase tracking-wider";

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-sm bg-white border border-gray-100 rounded-3xl shadow-xl shadow-slate-200/50">
        <CardHeader className="p-8 pb-4">
          <CardTitle className="font-display text-2xl font-bold text-slate-900 tracking-tight">Set a New Password</CardTitle>
          <CardDescription className="text-slate-500">Choose a new password for your XTATE account.</CardDescription>
        </CardHeader>
        <CardContent className="p-8 pt-0">
          {hasRecoverySession === false ? (
            <p className="text-sm text-slate-500">
              This reset link is invalid or has expired. Please request a new one from the sign-in screen.
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password" className={labelClass}>New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={inputClass}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-new-password" className={labelClass}>Confirm Password</Label>
                <Input
                  id="confirm-new-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={inputClass}
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20"
                disabled={isSaving || hasRecoverySession === null}
              >
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

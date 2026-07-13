import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/SecureAuthContext';
import { logAuditEvent } from '@/lib/auditLog';
import type { Tables } from '@/integrations/supabase/types';

type TenantPlan = Tables<'tenants'>['plan'];

interface NewTenantWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}

const STEPS = ['Estate Details', 'Subdomain', 'Plan', 'Admin User'];

const emptyState = () => ({
  name: '',
  address: '',
  currency: 'NGN',
  timezone: 'Africa/Lagos',
  slug: '',
  plan: 'standard' as TenantPlan,
  adminFullName: '',
  adminEmail: '',
  adminPhone: '',
  adminPassword: '',
});

const NewTenantWizard = ({ isOpen, onClose, onCreated }: NewTenantWizardProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(emptyState());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reset = () => {
    setStep(0);
    setForm(emptyState());
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const canAdvance = () => {
    if (step === 0) return form.name.trim().length > 1;
    if (step === 1) return form.slug.trim().length > 1;
    if (step === 2) return !!form.plan;
    return true;
  };

  const handleNext = () => {
    if (!canAdvance()) {
      toast({ title: 'Missing Information', description: 'Please fill in this step before continuing.', variant: 'destructive' });
      return;
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const handleBack = () => setStep((s) => Math.max(s - 1, 0));

  const handleSubmit = async () => {
    if (form.adminFullName.trim().length < 2 || !form.adminEmail.trim() || form.adminPassword.length < 8) {
      toast({ title: 'Missing Admin Details', description: 'Provide a valid admin name, email, and password (8+ characters).', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);
    try {
      const slug = form.slug.toLowerCase().replace(/\s+/g, '-');

      const { data: estate, error: estateError } = await supabase
        .from('estates')
        .insert({ name: form.name, slug, subscription_plan: form.plan })
        .select()
        .single();
      if (estateError) throw estateError;

      const { data: tenant, error: tenantError } = await supabase
        .from('tenants')
        .insert({
          estate_id: estate.id,
          name: form.name,
          slug,
          plan: form.plan,
          status: 'active',
          currency: form.currency,
          timezone: form.timezone,
          address: form.address || null,
        })
        .select()
        .single();
      if (tenantError) throw tenantError;

      await Promise.all([
        supabase.from('estate_settings').insert({ estate_id: estate.id, brand_name: form.name }),
        supabase.from('subscriptions').insert({ estate_id: estate.id, plan: form.plan, status: 'trial' }),
        supabase.from('tenant_billing').insert({ tenant_id: tenant.id, plan: form.plan, status: 'trial', amount: 0 }),
      ]);

      const { data: adminResult, error: adminError } = await supabase.functions.invoke<{ ok: boolean; error?: string }>(
        'create-tenant-admin',
        {
          body: {
            fullName: form.adminFullName,
            email: form.adminEmail,
            password: form.adminPassword,
            phone: form.adminPhone,
            estateId: estate.id,
            tenantId: tenant.id,
          },
        },
      );

      if (adminError) throw new Error(adminError.message);
      if (!adminResult?.ok) throw new Error(adminResult?.error || 'Admin account creation failed');

      if (user) {
        await logAuditEvent(user.id, tenant.id, 'tenant_created', 'tenant', tenant.id, {
          name: form.name,
          slug,
          plan: form.plan,
        });
      }

      toast({ title: 'Tenant Created', description: `${form.name} is live with an admin account for ${form.adminEmail}.` });
      handleClose();
      onCreated();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not create tenant.';
      toast({ title: 'Tenant Creation Failed', description: message, variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="bg-card border-border sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>New Tenant Wizard</DialogTitle>
          <DialogDescription>Step {step + 1} of {STEPS.length}: {STEPS[step]}</DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-2 mb-2">
          {STEPS.map((label, index) => (
            <div key={label} className="flex-1 flex items-center gap-2">
              <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                index < step ? 'bg-emerald-500 text-white' : index === step ? 'bg-violet-600 text-white' : 'bg-muted text-muted-foreground'
              }`}>
                {index < step ? <Check className="h-3.5 w-3.5" /> : index + 1}
              </div>
              {index < STEPS.length - 1 && <div className={`h-0.5 flex-1 ${index < step ? 'bg-emerald-500' : 'bg-muted'}`} />}
            </div>
          ))}
        </div>

        <div className="space-y-4 pt-2 min-h-[220px]">
          {step === 0 && (
            <>
              <div>
                <Label>Estate Name</Label>
                <Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="e.g. Victoria Gardens" />
              </div>
              <div>
                <Label>Address</Label>
                <Input value={form.address} onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))} placeholder="Estate address" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Currency</Label>
                  <Input value={form.currency} onChange={(e) => setForm((p) => ({ ...p, currency: e.target.value.toUpperCase() }))} maxLength={3} />
                </div>
                <div>
                  <Label>Timezone</Label>
                  <Input value={form.timezone} onChange={(e) => setForm((p) => ({ ...p, timezone: e.target.value }))} />
                </div>
              </div>
            </>
          )}

          {step === 1 && (
            <div>
              <Label>Subdomain Slug</Label>
              <Input value={form.slug} onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))} placeholder="e.g. victoria-gardens" />
              <p className="text-xs text-muted-foreground mt-2">Residents will access this estate at {form.slug || 'slug'}.xtate.app</p>
            </div>
          )}

          {step === 2 && (
            <div>
              <Label>Plan</Label>
              <Select value={form.plan} onValueChange={(v) => setForm((p) => ({ ...p, plan: v as TenantPlan }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {step === 3 && (
            <>
              <div>
                <Label>Admin Full Name</Label>
                <Input value={form.adminFullName} onChange={(e) => setForm((p) => ({ ...p, adminFullName: e.target.value }))} placeholder="Estate admin's name" />
              </div>
              <div>
                <Label>Admin Email</Label>
                <Input type="email" value={form.adminEmail} onChange={(e) => setForm((p) => ({ ...p, adminEmail: e.target.value }))} placeholder="admin@estate.com" />
              </div>
              <div>
                <Label>Admin Phone</Label>
                <Input value={form.adminPhone} onChange={(e) => setForm((p) => ({ ...p, adminPhone: e.target.value }))} placeholder="+234..." />
              </div>
              <div>
                <Label>Temporary Password</Label>
                <Input type="text" value={form.adminPassword} onChange={(e) => setForm((p) => ({ ...p, adminPassword: e.target.value }))} placeholder="8+ chars, upper/lower/number/symbol" />
              </div>
            </>
          )}
        </div>

        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={step === 0 ? handleClose : handleBack} disabled={isSubmitting}>
            {step === 0 ? 'Cancel' : 'Back'}
          </Button>
          {step < STEPS.length - 1 ? (
            <Button onClick={handleNext}>Next</Button>
          ) : (
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? 'Creating Tenant...' : 'Create Tenant'}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NewTenantWizard;

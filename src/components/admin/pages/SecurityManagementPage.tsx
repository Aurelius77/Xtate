import React, { useCallback, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Shield, Plus, User, Edit2, Trash2, Eye, EyeOff, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useEstateId } from '@/hooks/useEstateId';

type Shift = 'day' | 'night' | 'rotational';

interface SecurityPersonnel {
  user_id: string;
  full_name: string;
  email: string;
  phone: string;
  employee_id: string;
  shift: Shift;
  is_active: boolean;
  created_at: string;
  last_login: string | null;
}

interface SecurityStaffQueryRow {
  user_id: string;
  employee_id: string;
  shift: Shift;
  is_active: boolean;
  created_at: string;
  last_login: string | null;
  profile: {
    full_name: string | null;
    email: string | null;
    phone: string | null;
  } | null;
}

interface FormData {
  full_name: string;
  email: string;
  phone: string;
  employee_id: string;
  shift: Shift;
  password: string;
}

type DbError = { message: string };
type DbResult<T> = Promise<{ data: T | null; error: DbError | null }>;
type SecurityStaffUpdate = Partial<Pick<SecurityPersonnel, 'employee_id' | 'shift' | 'is_active'>>;
type SecurityStaffClient = {
  from(table: 'security_staff'): {
    select(columns: string): {
      eq(column: string, value: string): {
        order(column: string, options: { ascending: boolean }): DbResult<SecurityStaffQueryRow[]>;
      };
    };
    update(values: SecurityStaffUpdate): {
      eq(column: string, value: string): DbResult<null>;
    };
  };
};

const securityClient = supabase as unknown as SecurityStaffClient;

const emptyForm: FormData = {
  full_name: '',
  email: '',
  phone: '',
  employee_id: '',
  shift: 'day',
  password: '',
};

const SecurityManagementPage = () => {
  const estateId = useEstateId();
  const [securityPersonnel, setSecurityPersonnel] = useState<SecurityPersonnel[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedPersonnel, setSelectedPersonnel] = useState<SecurityPersonnel | null>(null);
  const [formData, setFormData] = useState<FormData>(emptyForm);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const resetForm = () => {
    setFormData(emptyForm);
    setShowPassword(false);
  };

  const loadSecurityPersonnel = useCallback(async () => {
    if (!estateId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data, error } = await securityClient
      .from('security_staff')
      .select(`
        user_id, employee_id, shift, is_active, created_at, last_login,
        profile:profiles!security_staff_user_id_fkey(full_name, email, phone)
      `)
      .eq('estate_id', estateId)
      .order('created_at', { ascending: false });

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      setSecurityPersonnel((data || []).map((person) => ({
        user_id: person.user_id,
        full_name: person.profile?.full_name || 'Unknown',
        email: person.profile?.email || '-',
        phone: person.profile?.phone || '-',
        employee_id: person.employee_id,
        shift: person.shift,
        is_active: person.is_active,
        created_at: person.created_at,
        last_login: person.last_login,
      })));
    }
    setLoading(false);
  }, [estateId, toast]);

  useEffect(() => {
    void loadSecurityPersonnel();
  }, [loadSecurityPersonnel]);

  const handleCreatePersonnel = async () => {
    if (!formData.full_name || !formData.email || !formData.employee_id || !formData.password) {
      toast({ title: 'Error', description: 'Please fill in all required fields', variant: 'destructive' });
      return;
    }

    setSaving(true);
    const { data, error } = await supabase.functions.invoke<{ ok: boolean; error?: string }>('create-security-account', {
      body: {
        fullName: formData.full_name,
        email: formData.email,
        phone: formData.phone,
        employeeId: formData.employee_id,
        shift: formData.shift,
        password: formData.password,
      },
    });

    setSaving(false);
    if (error || !data?.ok) {
      toast({ title: 'Create Failed', description: error?.message || data?.error || 'Could not create security personnel.', variant: 'destructive' });
      return;
    }

    resetForm();
    setIsCreateDialogOpen(false);
    toast({ title: 'Security Personnel Created', description: `${formData.full_name} can now access the security dashboard.` });
    await loadSecurityPersonnel();
  };

  const handleEditPersonnel = async () => {
    if (!selectedPersonnel || !formData.full_name || !formData.email || !formData.employee_id) {
      toast({ title: 'Error', description: 'Please fill in all required fields', variant: 'destructive' });
      return;
    }

    setSaving(true);
    const [profileRes, staffRes] = await Promise.all([
      supabase
        .from('profiles')
        .update({
          full_name: formData.full_name.trim(),
          phone: formData.phone.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', selectedPersonnel.user_id),
      securityClient
        .from('security_staff')
        .update({
          employee_id: formData.employee_id.trim(),
          shift: formData.shift,
        })
        .eq('user_id', selectedPersonnel.user_id),
    ]);

    setSaving(false);
    if (profileRes.error || staffRes.error) {
      toast({
        title: 'Update Failed',
        description: profileRes.error?.message || staffRes.error?.message || 'Could not update security personnel.',
        variant: 'destructive',
      });
      return;
    }

    resetForm();
    setIsEditDialogOpen(false);
    setSelectedPersonnel(null);
    toast({ title: 'Security Personnel Updated', description: 'Personnel details have been saved.' });
    await loadSecurityPersonnel();
  };

  const handleTogglePersonnel = async (personnel: SecurityPersonnel) => {
    const { error } = await securityClient
      .from('security_staff')
      .update({ is_active: !personnel.is_active })
      .eq('user_id', personnel.user_id);

    if (error) {
      toast({ title: 'Update Failed', description: error.message, variant: 'destructive' });
      return;
    }

    toast({
      title: 'Status Updated',
      description: `Security personnel ${personnel.is_active ? 'deactivated' : 'activated'} successfully.`,
    });
    await loadSecurityPersonnel();
  };

  const sendPasswordReset = async (personnel: SecurityPersonnel) => {
    const { error } = await supabase.auth.resetPasswordForEmail(personnel.email, {
      redirectTo: `${window.location.origin}/auth`,
    });

    if (error) {
      toast({ title: 'Reset Failed', description: error.message, variant: 'destructive' });
      return;
    }

    toast({ title: 'Password Reset Sent', description: `Reset email sent to ${personnel.email}.` });
  };

  const openEditDialog = (personnel: SecurityPersonnel) => {
    setSelectedPersonnel(personnel);
    setFormData({
      full_name: personnel.full_name === 'Unknown' ? '' : personnel.full_name,
      email: personnel.email === '-' ? '' : personnel.email,
      phone: personnel.phone === '-' ? '' : personnel.phone,
      employee_id: personnel.employee_id,
      shift: personnel.shift,
      password: '',
    });
    setIsEditDialogOpen(true);
  };

  const formatDateTime = (dateString: string) => new Date(dateString).toLocaleString();

  const renderFormFields = (isEdit = false) => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor={isEdit ? 'edit_full_name' : 'full_name'} className="text-cyan-200">Full Name *</Label>
          <Input
            id={isEdit ? 'edit_full_name' : 'full_name'}
            value={formData.full_name}
            onChange={(event) => setFormData({ ...formData, full_name: event.target.value })}
            className="glass border-cyan-400/30 text-cyan-100"
            disabled={saving}
          />
        </div>
        <div>
          <Label htmlFor={isEdit ? 'edit_employee_id' : 'employee_id'} className="text-cyan-200">Employee ID *</Label>
          <Input
            id={isEdit ? 'edit_employee_id' : 'employee_id'}
            value={formData.employee_id}
            onChange={(event) => setFormData({ ...formData, employee_id: event.target.value })}
            className="glass border-cyan-400/30 text-cyan-100"
            disabled={saving}
          />
        </div>
      </div>

      <div>
        <Label htmlFor={isEdit ? 'edit_email' : 'email'} className="text-cyan-200">Email *</Label>
        <Input
          id={isEdit ? 'edit_email' : 'email'}
          type="email"
          value={formData.email}
          onChange={(event) => setFormData({ ...formData, email: event.target.value })}
          className="glass border-cyan-400/30 text-cyan-100"
          disabled={saving || isEdit}
        />
      </div>

      <div>
        <Label htmlFor={isEdit ? 'edit_phone' : 'phone'} className="text-cyan-200">Phone</Label>
        <Input
          id={isEdit ? 'edit_phone' : 'phone'}
          value={formData.phone}
          onChange={(event) => setFormData({ ...formData, phone: event.target.value })}
          className="glass border-cyan-400/30 text-cyan-100"
          disabled={saving}
        />
      </div>

      <div>
        <Label htmlFor={isEdit ? 'edit_shift' : 'shift'} className="text-cyan-200">Shift</Label>
        <select
          id={isEdit ? 'edit_shift' : 'shift'}
          value={formData.shift}
          onChange={(event) => setFormData({ ...formData, shift: event.target.value as Shift })}
          className="w-full glass border-cyan-400/30 text-cyan-100 bg-transparent p-2 rounded-md"
          disabled={saving}
        >
          <option value="day" className="bg-slate-800">Day Shift</option>
          <option value="night" className="bg-slate-800">Night Shift</option>
          <option value="rotational" className="bg-slate-800">Rotational</option>
        </select>
      </div>

      {!isEdit && (
        <div>
          <Label htmlFor="password" className="text-cyan-200">Temporary Password *</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(event) => setFormData({ ...formData, password: event.target.value })}
              className="glass border-cyan-400/30 text-cyan-100 pr-10"
              disabled={saving}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-cyan-400"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-cyan-50 flex items-center gap-2">
            <Shield className="h-6 w-6" />
            Security Management
          </h2>
          <p className="text-cyan-200">Manage security personnel accounts and access</p>
        </div>

        <Button className="glass bg-blue-600/20 hover:bg-blue-600/30 text-cyan-100" onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Security Personnel
        </Button>
      </div>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="glass-card border-cyan-400/20 bg-slate-950 text-cyan-50">
          <DialogHeader>
            <DialogTitle>Create Security Personnel</DialogTitle>
            <DialogDescription className="text-cyan-200">Create a security dashboard account for this estate.</DialogDescription>
          </DialogHeader>
          {renderFormFields(false)}
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsCreateDialogOpen(false); resetForm(); }} className="glass border-cyan-400/30 text-cyan-100" disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleCreatePersonnel} className="glass bg-blue-600/20 hover:bg-blue-600/30 text-cyan-100" disabled={saving}>
              {saving ? 'Creating...' : 'Create Personnel'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card className="glass-card border-cyan-400/20">
        <CardHeader>
          <CardTitle className="text-cyan-50 flex items-center gap-2">
            <User className="h-5 w-5" />
            Security Personnel ({loading ? '...' : securityPersonnel.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-cyan-300 text-sm">Loading security personnel...</p>
          ) : securityPersonnel.length === 0 ? (
            <p className="text-cyan-300 text-sm">No security personnel created yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-cyan-400/20">
                  <TableHead className="text-cyan-200">Name</TableHead>
                  <TableHead className="text-cyan-200">Employee ID</TableHead>
                  <TableHead className="text-cyan-200">Email</TableHead>
                  <TableHead className="text-cyan-200">Shift</TableHead>
                  <TableHead className="text-cyan-200">Status</TableHead>
                  <TableHead className="text-cyan-200">Last Login</TableHead>
                  <TableHead className="text-cyan-200">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {securityPersonnel.map((personnel) => (
                  <TableRow key={personnel.user_id} className="border-cyan-400/20">
                    <TableCell className="text-cyan-100 font-medium">{personnel.full_name}</TableCell>
                    <TableCell className="text-cyan-100 font-mono">{personnel.employee_id}</TableCell>
                    <TableCell className="text-cyan-100">{personnel.email}</TableCell>
                    <TableCell className="text-cyan-100 capitalize">{personnel.shift}</TableCell>
                    <TableCell>
                      <Badge className={personnel.is_active ? 'bg-green-500/20 text-green-400 border-green-400/30' : 'bg-red-500/20 text-red-400 border-red-400/30'}>
                        {personnel.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-cyan-100 text-sm">{personnel.last_login ? formatDateTime(personnel.last_login) : 'Never'}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" onClick={() => openEditDialog(personnel)} className="glass border-cyan-400/30 text-cyan-100 hover:bg-cyan-600/20">
                          <Edit2 className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => sendPasswordReset(personnel)} className="glass border-cyan-400/30 text-cyan-100 hover:bg-cyan-600/20">
                          <Mail className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleTogglePersonnel(personnel)}
                          className={`glass border-cyan-400/30 ${personnel.is_active ? 'text-red-400 hover:bg-red-600/20' : 'text-green-400 hover:bg-green-600/20'}`}
                        >
                          {personnel.is_active ? <Trash2 className="h-3 w-3" /> : <Shield className="h-3 w-3" />}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="glass-card border-cyan-400/20 bg-slate-950 text-cyan-50">
          <DialogHeader>
            <DialogTitle>Edit Security Personnel</DialogTitle>
            <DialogDescription className="text-cyan-200">Update personnel details and shift assignment.</DialogDescription>
          </DialogHeader>
          {renderFormFields(true)}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditDialogOpen(false);
                resetForm();
                setSelectedPersonnel(null);
              }}
              className="glass border-cyan-400/30 text-cyan-100"
              disabled={saving}
            >
              Cancel
            </Button>
            <Button onClick={handleEditPersonnel} className="glass bg-blue-600/20 hover:bg-blue-600/30 text-cyan-100" disabled={saving}>
              {saving ? 'Updating...' : 'Update Personnel'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SecurityManagementPage;

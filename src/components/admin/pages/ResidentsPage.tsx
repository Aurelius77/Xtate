import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import ResidentStats from './residents/ResidentStats';
import ResidentFilters from './residents/ResidentFilters';
import ResidentTable from './residents/ResidentTable';
import { supabase } from '@/integrations/supabase/client';
import { useEstateId } from '@/hooks/useEstateId';
import { useToast } from '@/hooks/use-toast';
import { useTenant } from '@/contexts/TenantContext';
import type { Database } from '@/integrations/supabase/types';

type DueStatus = Database['public']['Enums']['due_status'];

interface ResidentListItem {
  id: string;
  userId: string;
  name: string;
  unit: string;
  phone: string;
  email: string;
  status: string;
  dues: string;
  outstandingDues: number;
  createdAt: string;
}

interface ResidentQueryRow {
  id: string;
  user_id: string;
  house_unit_number: string | null;
  is_active: boolean;
  created_at: string;
  profile: {
    full_name: string | null;
    email: string | null;
    phone: string | null;
  } | null;
  resident_dues: {
    amount: number | string;
    status: DueStatus;
  }[] | null;
}

interface AddResidentForm {
  fullName: string;
  email: string;
  phone: string;
  houseUnit: string;
  password: string;
}

interface EditResidentForm {
  fullName: string;
  phone: string;
  houseUnit: string;
}

const emptyAddForm: AddResidentForm = {
  fullName: '',
  email: '',
  phone: '',
  houseUnit: '',
  password: '',
};

const formatCurrency = (amount: number) => `₦${amount.toLocaleString()}`;

const ResidentsPage = () => {
  const estateId = useEstateId();
  const { tenantId, tenantSlug } = useTenant();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [residents, setResidents] = useState<ResidentListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [viewId, setViewId] = useState<string | null>(null);
  const [addForm, setAddForm] = useState<AddResidentForm>(emptyAddForm);
  const [editForm, setEditForm] = useState<EditResidentForm>({ fullName: '', phone: '', houseUnit: '' });

  const loadResidents = useCallback(async () => {
    if (!estateId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from('residents')
      .select(`
        id, user_id, house_unit_number, is_active, created_at,
        profile:profiles!residents_user_id_fkey(full_name, email, phone),
        resident_dues(amount, status)
      `)
      .eq('estate_id', estateId)
      .order('created_at', { ascending: false });

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      setLoading(false);
      return;
    }

    setResidents(((data || []) as ResidentQueryRow[]).map((resident) => {
      const outstandingDues = (resident.resident_dues || [])
        .filter((due) => due.status !== 'paid')
        .reduce((sum, due) => sum + Number(due.amount), 0);

      return {
        id: resident.id,
        userId: resident.user_id,
        name: resident.profile?.full_name || 'Unknown',
        unit: resident.house_unit_number || '-',
        phone: resident.profile?.phone || '-',
        email: resident.profile?.email || '-',
        status: resident.is_active ? 'active' : 'inactive',
        dues: formatCurrency(outstandingDues),
        outstandingDues,
        createdAt: resident.created_at,
      };
    }));
    setLoading(false);
  }, [estateId, toast]);

  useEffect(() => {
    void loadResidents();
  }, [loadResidents]);

  const selectedResident = useMemo(
    () => residents.find((resident) => resident.id === viewId) || null,
    [residents, viewId],
  );

  const editingResident = useMemo(
    () => residents.find((resident) => resident.id === editId) || null,
    [editId, residents],
  );

  const filteredResidents = residents.filter((resident) => {
    const matchesSearch = resident.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resident.unit.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resident.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || resident.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const handleStatusToggle = async (id: string) => {
    const resident = residents.find((row) => row.id === id);
    if (!resident) return;

    const newActive = resident.status !== 'active';
    const { error } = await supabase.from('residents').update({ is_active: newActive }).eq('id', id);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return;
    }

    setResidents((prev) => prev.map((row) => row.id === id ? { ...row, status: newActive ? 'active' : 'inactive' } : row));
  };

  const handleDeactivateResident = async (id: string) => {
    if (!confirm('Deactivate this resident? Their auth account will remain, but estate access can be treated as inactive.')) return;

    const { error } = await supabase.from('residents').update({ is_active: false }).eq('id', id);
    if (error) {
      toast({ title: 'Deactivate Failed', description: error.message, variant: 'destructive' });
      return;
    }

    toast({ title: 'Resident Deactivated', description: 'Resident status changed to inactive.' });
    await loadResidents();
  };

  const openEdit = (id: string) => {
    const resident = residents.find((row) => row.id === id);
    if (!resident) return;

    setEditForm({
      fullName: resident.name === 'Unknown' ? '' : resident.name,
      phone: resident.phone === '-' ? '' : resident.phone,
      houseUnit: resident.unit === '-' ? '' : resident.unit,
    });
    setEditId(id);
  };

  const handleAddResident = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!tenantId && !tenantSlug) {
      toast({ title: 'Tenant Not Ready', description: 'Resident account creation needs a tenant context.', variant: 'destructive' });
      return;
    }

    setSaving(true);
    const { data, error } = await supabase.functions.invoke<{ ok: boolean; error?: string }>('create-resident-account', {
      body: {
        fullName: addForm.fullName,
        email: addForm.email,
        phone: addForm.phone,
        houseUnit: addForm.houseUnit,
        password: addForm.password,
        tenantId: tenantId || undefined,
        tenantSlug: tenantSlug || undefined,
      },
    });

    setSaving(false);
    if (error || !data?.ok) {
      toast({ title: 'Create Resident Failed', description: error?.message || data?.error || 'Could not create resident.', variant: 'destructive' });
      return;
    }

    toast({ title: 'Resident Added', description: 'A resident account has been created.' });
    setAddForm(emptyAddForm);
    setAddOpen(false);
    await loadResidents();
  };

  const handleSaveResident = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingResident) return;

    setSaving(true);
    const [profileRes, residentRes] = await Promise.all([
      supabase
        .from('profiles')
        .update({
          full_name: editForm.fullName.trim(),
          phone: editForm.phone.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', editingResident.userId),
      supabase
        .from('residents')
        .update({ house_unit_number: editForm.houseUnit.trim() })
        .eq('id', editingResident.id),
    ]);

    setSaving(false);
    if (profileRes.error || residentRes.error) {
      toast({
        title: 'Save Failed',
        description: profileRes.error?.message || residentRes.error?.message || 'Could not update resident.',
        variant: 'destructive',
      });
      return;
    }

    toast({ title: 'Resident Updated', description: 'Resident details have been saved.' });
    setEditId(null);
    await loadResidents();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-cyan-50">Residents</h1>
          <p className="text-cyan-200">Manage estate residents and their information</p>
        </div>
        <Button className="bg-cyan-600 hover:bg-cyan-700 text-white" onClick={() => setAddOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Resident
        </Button>
      </div>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="glass-card border-cyan-400/20 bg-slate-950 text-cyan-50 sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Add Resident</DialogTitle>
            <DialogDescription className="text-cyan-200">
              Create a resident account for this estate.
            </DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleAddResident}>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="resident-name" className="text-cyan-100">Full Name</Label>
                <Input id="resident-name" value={addForm.fullName} onChange={(event) => setAddForm((form) => ({ ...form, fullName: event.target.value }))} className="glass border-cyan-400/30 text-cyan-100" disabled={saving} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="resident-unit" className="text-cyan-100">House/Unit</Label>
                <Input id="resident-unit" value={addForm.houseUnit} onChange={(event) => setAddForm((form) => ({ ...form, houseUnit: event.target.value }))} className="glass border-cyan-400/30 text-cyan-100" disabled={saving} required />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="resident-email" className="text-cyan-100">Email</Label>
                <Input id="resident-email" type="email" value={addForm.email} onChange={(event) => setAddForm((form) => ({ ...form, email: event.target.value }))} className="glass border-cyan-400/30 text-cyan-100" disabled={saving} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="resident-phone" className="text-cyan-100">Phone</Label>
                <Input id="resident-phone" value={addForm.phone} onChange={(event) => setAddForm((form) => ({ ...form, phone: event.target.value }))} className="glass border-cyan-400/30 text-cyan-100" disabled={saving} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="resident-password" className="text-cyan-100">Temporary Password</Label>
              <Input id="resident-password" type="password" value={addForm.password} onChange={(event) => setAddForm((form) => ({ ...form, password: event.target.value }))} className="glass border-cyan-400/30 text-cyan-100" disabled={saving} required />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" className="glass border-cyan-400/30 text-cyan-100 hover:bg-cyan-500/20" onClick={() => setAddOpen(false)} disabled={saving}>Cancel</Button>
              <Button type="submit" className="bg-cyan-600 hover:bg-cyan-700 text-white" disabled={saving}>{saving ? 'Creating...' : 'Create Resident'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingResident} onOpenChange={(open) => !open && setEditId(null)}>
        <DialogContent className="glass-card border-cyan-400/20 bg-slate-950 text-cyan-50 sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Edit Resident</DialogTitle>
            <DialogDescription className="text-cyan-200">Update resident profile and unit details.</DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleSaveResident}>
            <div className="space-y-2">
              <Label htmlFor="edit-resident-name" className="text-cyan-100">Full Name</Label>
              <Input id="edit-resident-name" value={editForm.fullName} onChange={(event) => setEditForm((form) => ({ ...form, fullName: event.target.value }))} className="glass border-cyan-400/30 text-cyan-100" disabled={saving} required />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-resident-phone" className="text-cyan-100">Phone</Label>
                <Input id="edit-resident-phone" value={editForm.phone} onChange={(event) => setEditForm((form) => ({ ...form, phone: event.target.value }))} className="glass border-cyan-400/30 text-cyan-100" disabled={saving} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-resident-unit" className="text-cyan-100">House/Unit</Label>
                <Input id="edit-resident-unit" value={editForm.houseUnit} onChange={(event) => setEditForm((form) => ({ ...form, houseUnit: event.target.value }))} className="glass border-cyan-400/30 text-cyan-100" disabled={saving} required />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" className="glass border-cyan-400/30 text-cyan-100 hover:bg-cyan-500/20" onClick={() => setEditId(null)} disabled={saving}>Cancel</Button>
              <Button type="submit" className="bg-cyan-600 hover:bg-cyan-700 text-white" disabled={saving}>{saving ? 'Saving...' : 'Save Resident'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedResident} onOpenChange={(open) => !open && setViewId(null)}>
        <DialogContent className="glass-card border-cyan-400/20 bg-slate-950 text-cyan-50 sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedResident?.name || 'Resident'}</DialogTitle>
            <DialogDescription className="text-cyan-200">Resident account summary</DialogDescription>
          </DialogHeader>
          {selectedResident && (
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-cyan-300">Email</p><p className="text-cyan-100">{selectedResident.email}</p></div>
              <div><p className="text-cyan-300">Phone</p><p className="text-cyan-100">{selectedResident.phone}</p></div>
              <div><p className="text-cyan-300">Unit</p><p className="text-cyan-100">{selectedResident.unit}</p></div>
              <div><p className="text-cyan-300">Status</p><p className="text-cyan-100">{selectedResident.status}</p></div>
              <div><p className="text-cyan-300">Outstanding Dues</p><p className="text-cyan-100">{selectedResident.dues}</p></div>
              <div><p className="text-cyan-300">Joined</p><p className="text-cyan-100">{new Date(selectedResident.createdAt).toLocaleDateString()}</p></div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ResidentFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
      />

      <ResidentStats residents={residents} />

      {loading ? (
        <p className="text-cyan-300 text-sm">Loading residents...</p>
      ) : (
        <ResidentTable
          residents={filteredResidents}
          onStatusToggle={handleStatusToggle}
          onDeactivate={handleDeactivateResident}
          onEdit={openEdit}
          onView={setViewId}
        />
      )}
    </div>
  );
};

export default ResidentsPage;

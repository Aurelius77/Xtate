import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ResidentStats from './residents/ResidentStats';
import ResidentFilters from './residents/ResidentFilters';
import ResidentTable from './residents/ResidentTable';
import { supabase } from '@/integrations/supabase/client';
import { useEstateId } from '@/hooks/useEstateId';
import { useToast } from '@/hooks/use-toast';

interface ResidentListItem {
  id: string;
  name: string;
  unit: string;
  phone: string;
  email: string;
  status: string;
  dues: string;
}

interface ResidentQueryRow {
  id: string;
  house_unit_number: string | null;
  is_active: boolean;
  profile: {
    full_name: string | null;
    email: string | null;
    phone: string | null;
  } | null;
}

const ResidentsPage = () => {
  const estateId = useEstateId();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [residents, setResidents] = useState<ResidentListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!estateId) return;
    const fetchResidents = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('residents')
        .select('id, house_unit_number, is_active, created_at, user_id, profile:profiles!residents_user_id_fkey(full_name, email, phone)')
        .eq('estate_id', estateId);
      if (error) { console.error(error); setLoading(false); return; }
      setResidents(((data || []) as ResidentQueryRow[]).map((r) => ({
        id: r.id,
        name: r.profile?.full_name || 'Unknown',
        unit: r.house_unit_number || '-',
        phone: r.profile?.phone || '-',
        email: r.profile?.email || '-',
        status: r.is_active ? 'active' : 'inactive',
        dues: '₦0',
      })));
      setLoading(false);
    };
    fetchResidents();
  }, [estateId]);

  const filteredResidents = residents.filter(resident => {
    const matchesSearch = resident.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resident.unit.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || resident.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const handleStatusToggle = async (id: string) => {
    const resident = residents.find(r => r.id === id);
    if (!resident) return;
    const newActive = resident.status !== 'active';
    const { error } = await supabase.from('residents').update({ is_active: newActive }).eq('id', id);
    if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); return; }
    setResidents(prev => prev.map(r => r.id === id ? { ...r, status: newActive ? 'active' : 'inactive' } : r));
  };

  const handleDeleteResident = async (id: string) => {
    if (!confirm('Are you sure you want to delete this resident?')) return;
    toast({ title: 'Note', description: 'Resident deletion requires backend support.' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-cyan-50">Residents</h1>
          <p className="text-cyan-200">Manage estate residents and their information</p>
        </div>
        <Button className="bg-cyan-600 hover:bg-cyan-700 text-white">
          <Plus className="h-4 w-4 mr-2" />
          Add Resident
        </Button>
      </div>

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
          onDelete={handleDeleteResident}
        />
      )}
    </div>
  );
};

export default ResidentsPage;

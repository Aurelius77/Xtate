import React, { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/SecureAuthContext';
import { useToast } from '@/hooks/use-toast';

type SearchItem = {
  id: string;
  label: string;
  detail: string;
  page: string;
};

interface ResidentSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNavigate: (page: string) => void;
}

const ResidentSearchDialog = ({ open, onOpenChange, onNavigate }: ResidentSearchDialogProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [query, setQuery] = useState('');
  const [items, setItems] = useState<SearchItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !user) return;

    const loadItems = async () => {
      setLoading(true);
      const { data: resident } = await supabase
        .from('residents')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!resident?.id) {
        setItems([]);
        setLoading(false);
        return;
      }

      const [duesRes, complaintsRes, codesRes, documentsRes, meetingsRes] = await Promise.all([
        supabase.from('resident_dues').select('id, amount, status, due:dues(title, due_date)').eq('resident_id', resident.id).limit(50),
        supabase.from('complaints').select('id, title, status, created_at').eq('resident_id', resident.id).limit(50),
        supabase.from('access_codes').select('id, access_code, visitor_name, status').eq('resident_id', resident.id).limit(50),
        supabase.from('documents').select('id, title, category').eq('is_public', true).limit(50),
        supabase.from('meetings').select('id, title, meeting_date').limit(50),
      ]);

      const errors = [duesRes.error, complaintsRes.error, codesRes.error, documentsRes.error, meetingsRes.error].filter(Boolean);
      if (errors[0]) {
        toast({ title: 'Search Error', description: errors[0].message, variant: 'destructive' });
      }

      const searchItems: SearchItem[] = [
        ...((duesRes.data ?? []) as Array<{ id: string; amount: number; status: string; due: { title: string | null; due_date: string | null } | null }>).map((due) => ({
          id: `due-${due.id}`,
          label: due.due?.title || 'Untitled due',
          detail: `Due - ${due.status} - NGN ${Number(due.amount).toLocaleString()}`,
          page: 'dues',
        })),
        ...(complaintsRes.data ?? []).map((complaint) => ({
          id: `complaint-${complaint.id}`,
          label: complaint.title,
          detail: `Complaint - ${complaint.status}`,
          page: 'complaints',
        })),
        ...(codesRes.data ?? []).map((code) => ({
          id: `code-${code.id}`,
          label: `${code.access_code} - ${code.visitor_name}`,
          detail: `Access Code - ${code.status}`,
          page: 'my-access-codes',
        })),
        ...(documentsRes.data ?? []).map((document) => ({
          id: `document-${document.id}`,
          label: document.title,
          detail: `Document - ${document.category || 'General'}`,
          page: 'documents',
        })),
        ...(meetingsRes.data ?? []).map((meeting) => ({
          id: `meeting-${meeting.id}`,
          label: meeting.title,
          detail: `Meeting - ${new Date(meeting.meeting_date).toLocaleDateString()}`,
          page: 'meetings',
        })),
      ];

      setItems(searchItems);
      setLoading(false);
    };

    void loadItems();
  }, [open, toast, user]);

  const filteredItems = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return items.slice(0, 12);
    return items.filter((item) => `${item.label} ${item.detail}`.toLowerCase().includes(needle)).slice(0, 20);
  }, [items, query]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card border-cyan-400/20 max-w-2xl">
        <DialogHeader><DialogTitle className="text-cyan-50">Search Resident Dashboard</DialogTitle></DialogHeader>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-cyan-300" />
          <Input className="pl-10 glass border-cyan-400/30 text-cyan-100" placeholder="Search dues, complaints, access codes, documents, meetings..." value={query} onChange={(event) => setQuery(event.target.value)} />
        </div>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {loading ? (
            <p className="text-cyan-200">Loading search index...</p>
          ) : filteredItems.length === 0 ? (
            <p className="text-cyan-200">No results found.</p>
          ) : (
            filteredItems.map((item) => (
              <Button
                key={item.id}
                variant="ghost"
                className="w-full justify-start h-auto p-3 text-left hover:bg-cyan-500/10"
                onClick={() => {
                  onNavigate(item.page);
                  onOpenChange(false);
                }}
              >
                <div>
                  <p className="text-cyan-50 font-medium">{item.label}</p>
                  <p className="text-xs text-cyan-300">{item.detail}</p>
                </div>
              </Button>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ResidentSearchDialog;

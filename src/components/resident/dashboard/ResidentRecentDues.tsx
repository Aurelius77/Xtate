import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Clock, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/SecureAuthContext';

interface DueItem {
  id: string;
  title: string;
  amount: number;
  dueDate: string;
  status: string;
}

const ResidentRecentDues = () => {
  const { user } = useAuth();
  const [recentDues, setRecentDues] = useState<DueItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchDues = async () => {
      try {
        const { data: resident } = await supabase
          .from('residents')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (!resident) { setLoading(false); return; }

        const { data, error } = await supabase
          .from('resident_dues')
          .select(`
            id, amount, status,
            due:dues(title, due_date)
          `)
          .eq('resident_id', resident.id)
          .order('id', { ascending: false })
          .limit(5);

        if (error) throw error;

        const items: DueItem[] = (data || []).map((d: any) => ({
          id: d.id,
          title: d.due?.title || 'Untitled Due',
          amount: Number(d.amount),
          dueDate: d.due?.due_date || '',
          status: d.status,
        }));

        setRecentDues(items);
      } catch (error) {
        console.error('Failed to fetch dues:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDues();
  }, [user]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid': return <Badge className="bg-green-500/20 text-green-400 border-green-400/30">Paid</Badge>;
      case 'pending': return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-400/30">Pending</Badge>;
      case 'overdue': return <Badge className="bg-red-500/20 text-red-400 border-red-400/30">Overdue</Badge>;
      default: return <Badge className="bg-gray-500/20 text-gray-400 border-gray-400/30">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'overdue': return <Clock className="h-4 w-4 text-red-400" />;
      default: return <Clock className="h-4 w-4 text-yellow-400" />;
    }
  };

  return (
    <Card className="glass-card border-cyan-400/20 lg:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-cyan-50">
          <DollarSign className="h-5 w-5" />
          Recent Dues
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-cyan-300 text-sm">Loading dues...</p>
        ) : recentDues.length === 0 ? (
          <p className="text-cyan-300 text-sm">No dues assigned yet.</p>
        ) : (
          <div className="space-y-4">
            {recentDues.map((due) => (
              <div key={due.id} className="flex items-center justify-between p-3 rounded-lg glass border border-cyan-400/20">
                <div className="flex items-center gap-3">
                  {getStatusIcon(due.status)}
                  <div>
                    <p className="font-medium text-cyan-100">{due.title}</p>
                    <p className="text-sm text-cyan-300">Due: {due.dueDate ? new Date(due.dueDate).toLocaleDateString() : 'N/A'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-cyan-100">₦{due.amount.toLocaleString()}</p>
                  {getStatusBadge(due.status)}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ResidentRecentDues;

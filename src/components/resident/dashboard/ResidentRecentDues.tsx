import React, { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Clock, CheckCircle, ArrowRight, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/SecureAuthContext';

interface DueItem {
  id: string;
  title: string;
  amount: number;
  dueDate: string;
  status: string;
}

interface ResidentDueQueryRow {
  id: string;
  amount: number | string;
  status: string;
  due: {
    title: string | null;
    due_date: string | null;
  } | null;
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

        const items: DueItem[] = ((data || []) as ResidentDueQueryRow[]).map((d) => ({
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
      case 'paid':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-green-700 bg-green-50 px-2.5 py-1 rounded-full border border-green-100">
            <CheckCircle className="h-3 w-3" />
            Paid
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-100">
            <Clock className="h-3 w-3" />
            Pending
          </span>
        );
      case 'overdue':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-700 bg-red-50 px-2.5 py-1 rounded-full border border-red-100">
            <AlertCircle className="h-3 w-3" />
            Overdue
          </span>
        );
      case 'pending_confirmation':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
            <Clock className="h-3 w-3" />
            Confirming
          </span>
        );
      default:
        return (
          <span className="inline-flex text-[11px] font-semibold text-gray-600 bg-gray-50 px-2.5 py-1 rounded-full border border-gray-100">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-lg hover:shadow-gray-100/50 transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-gray-900">Recent Dues</h3>
          <p className="text-sm text-gray-500 mt-0.5">Your latest dues activity</p>
        </div>
        <div className="h-9 w-9 bg-green-50 rounded-xl grid place-content-center">
          <DollarSign className="h-4 w-4 text-green-600" />
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-14 bg-gray-50 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : recentDues.length === 0 ? (
        <div className="h-40 flex flex-col items-center justify-center text-center">
          <DollarSign className="h-8 w-8 text-gray-300 mb-2" />
          <p className="text-sm text-gray-400">No dues assigned yet</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {recentDues.map((due) => (
            <div
              key={due.id}
              className="flex items-center justify-between p-3 rounded-xl bg-gray-50/80 hover:bg-gray-100/80 transition-colors border border-gray-100/50"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={`h-9 w-9 rounded-xl grid place-content-center flex-shrink-0 ${due.status === 'paid' ? 'bg-green-50' :
                    due.status === 'overdue' ? 'bg-red-50' :
                      'bg-amber-50'
                  }`}>
                  {due.status === 'paid' ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : due.status === 'overdue' ? (
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  ) : (
                    <Clock className="h-4 w-4 text-amber-500" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{due.title}</p>
                  <p className="text-xs text-gray-500">
                    Due: {due.dueDate ? new Date(due.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0 ml-2">
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">₦{due.amount.toLocaleString()}</p>
                  {getStatusBadge(due.status)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ResidentRecentDues;

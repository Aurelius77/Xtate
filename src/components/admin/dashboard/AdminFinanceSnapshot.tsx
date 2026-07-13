import React, { useEffect, useState } from 'react';
import { Calculator, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useEstateId } from '@/hooks/useEstateId';

interface AdminFinanceSnapshotProps {
  onNavigate?: (page: string) => void;
}

interface ExpenseRecord { amount: number; status: string; expense_date: string }

const AdminFinanceSnapshot = ({ onNavigate }: AdminFinanceSnapshotProps) => {
  const estateId = useEstateId();
  const [thisMonthTotal, setThisMonthTotal] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!estateId) { setLoading(false); return; }
    (async () => {
      setLoading(true);
      const { data } = await (supabase as unknown as { from: (t: 'expenses') => { select: (c: string) => { eq: (k: string, v: string) => Promise<{ data: ExpenseRecord[] | null }> } } })
        .from('expenses').select('amount, status, expense_date').eq('estate_id', estateId);

      const rows = data ?? [];
      const now = new Date();
      const total = rows
        .filter((e) => {
          const d = new Date(e.expense_date);
          return e.status === 'approved' && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        })
        .reduce((sum, e) => sum + Number(e.amount), 0);
      const pending = rows.filter((e) => e.status === 'pending').length;

      setThisMonthTotal(total);
      setPendingCount(pending);
      setLoading(false);
    })();
  }, [estateId]);

  return (
    <Card className="bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col h-full">
      <CardContent className="p-6 flex flex-col h-full">
        <div className="flex items-center justify-between mb-6">
          <div className="h-11 w-11 bg-amber-50 rounded-2xl flex items-center justify-center shadow-sm">
            <Calculator className="h-5 w-5 text-amber-600" />
          </div>
          {pendingCount > 0 && (
            <span className="bg-amber-50 text-amber-600 text-[10px] font-black px-2 py-1 rounded-full">
              {pendingCount} pending
            </span>
          )}
        </div>

        <div className="flex-1">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Expenses This Month</p>
          <h3 className="text-xl xl:text-[1.6rem] font-black text-gray-900 mt-1 leading-tight tracking-tight truncate">
            {loading ? '...' : `₦${thisMonthTotal.toLocaleString()}`}
          </h3>
          <p className="text-xs text-gray-400 mt-1 font-medium">Approved expenses</p>
        </div>

        <div className="mt-6">
          <button
            onClick={() => onNavigate?.('expenses')}
            className="w-full flex items-center justify-center gap-1.5 text-blue-600 font-bold py-2 text-sm hover:underline decoration-2 underline-offset-4"
          >
            View Expenses <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminFinanceSnapshot;

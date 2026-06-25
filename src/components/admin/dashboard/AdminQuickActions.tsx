import React from 'react';
import { UserPlus, Wallet, Receipt, Megaphone, Calculator, Database, FileText } from 'lucide-react';

interface AdminQuickActionsProps {
  setCurrentPage: (page: string) => void;
}

const ACTIONS = [
  { label: 'Add Resident', icon: UserPlus, page: 'residents' },
  { label: 'Record Payment', icon: Wallet, page: 'dues' },
  { label: 'Create Invoice', icon: Receipt, page: 'dues' },
  { label: 'New Announcement', icon: Megaphone, page: 'broadcast' },
  { label: 'Add Expense', icon: Calculator, page: 'expenses' },
  { label: 'Bulk Import', icon: Database, page: 'data-import' },
  { label: 'Generate Report', icon: FileText, page: 'dashboard' },
];

const AdminQuickActions = ({ setCurrentPage }: AdminQuickActionsProps) => {
  return (
    <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-4 flex items-center justify-between gap-4 w-full xl:col-span-12 mt-6">
      <div className="flex items-center gap-2 px-4 border-r border-gray-50 mr-2">
        <p className="text-xs font-black text-gray-900 uppercase tracking-widest whitespace-nowrap">Quick Actions</p>
      </div>

      <div className="flex-1 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
        {ACTIONS.map((action, i) => (
          <button
            key={i}
            onClick={() => setCurrentPage(action.page)}
            className="flex items-center gap-2.5 px-4 py-2.5 bg-gray-50/50 hover:bg-blue-50 rounded-xl transition-all group whitespace-nowrap"
          >
            <div className="h-7 w-7 bg-white rounded-lg flex items-center justify-center shadow-sm group-hover:bg-blue-600 transition-all">
              <action.icon className="h-3.5 w-3.5 text-gray-400 group-hover:text-white transition-all" />
            </div>
            <span className="text-[11px] font-bold text-gray-600 group-hover:text-blue-700 transition-all">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default AdminQuickActions;

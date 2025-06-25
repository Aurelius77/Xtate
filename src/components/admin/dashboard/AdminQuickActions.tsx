
import React from 'react';
import { Plus, DollarSign, Calendar, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface AdminQuickActionsProps {
  setCurrentPage: (page: string) => void;
}

const AdminQuickActions = ({ setCurrentPage }: AdminQuickActionsProps) => {
  return (
    <Card className="glass-card border-cyan-400/20">
      <CardHeader>
        <CardTitle className="font-medium text-cyan-50">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button 
          className="w-full glass hover:bg-white/20 justify-start gap-3 text-cyan-200 hover:text-cyan-50"
          onClick={() => setCurrentPage('residents')}
        >
          <Plus className="h-4 w-4" />
          Add New Resident
        </Button>
        <Button 
          className="w-full glass hover:bg-white/20 justify-start gap-3 text-cyan-200 hover:text-cyan-50"
          onClick={() => setCurrentPage('dues')}
        >
          <DollarSign className="h-4 w-4" />
          Create Due
        </Button>
        <Button 
          className="w-full glass hover:bg-white/20 justify-start gap-3 text-cyan-200 hover:text-cyan-50"
          onClick={() => setCurrentPage('meetings')}
        >
          <Calendar className="h-4 w-4" />
          Schedule Meeting
        </Button>
        <Button 
          className="w-full glass hover:bg-white/20 justify-start gap-3 text-cyan-200 hover:text-cyan-50"
          onClick={() => setCurrentPage('documents')}
        >
          <FileText className="h-4 w-4" />
          Send Announcement
        </Button>
      </CardContent>
    </Card>
  );
};

export default AdminQuickActions;

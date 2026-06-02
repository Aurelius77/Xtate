
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, FileText, Calendar, MessageSquare, Key } from 'lucide-react';

interface ResidentQuickActionsProps {
  onNavigate: (page: string) => void;
}

const ResidentQuickActions = ({ onNavigate }: ResidentQuickActionsProps) => {
  const quickActions = [
    {
      title: 'Generate Access Code',
      description: 'Create visitor access codes',
      icon: Key,
      color: 'text-blue-400',
      bgColor: 'bg-blue-400/10',
      page: 'generate-access-code'
    },
    {
      title: 'Report Issue',
      description: 'Submit a new complaint',
      icon: MessageSquare,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-400/10',
      page: 'complaints'
    },
    {
      title: 'View Documents',
      description: 'Access estate documents',
      icon: FileText,
      color: 'text-green-400',
      bgColor: 'bg-green-400/10',
      page: 'documents'
    },
    {
      title: 'Check Meetings',
      description: 'View upcoming meetings',
      icon: Calendar,
      color: 'text-purple-400',
      bgColor: 'bg-purple-400/10',
      page: 'meetings'
    }
  ];

  return (
    <Card className="glass-card border-cyan-400/20 lg:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-cyan-50">
          <Plus className="h-5 w-5" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {quickActions.map((action, index) => (
            <Button
              key={index}
              variant="outline"
              className="h-auto p-4 glass border-cyan-400/30 text-left flex flex-col items-start gap-2 hover:bg-white/5"
              onClick={() => onNavigate(action.page)}
            >
              <div className={`h-8 w-8 ${action.bgColor} rounded-lg grid place-content-center`}>
                <action.icon className={`h-4 w-4 ${action.color}`} />
              </div>
              <div>
                <p className="font-medium text-cyan-100">{action.title}</p>
                <p className="text-xs text-cyan-300">{action.description}</p>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ResidentQuickActions;

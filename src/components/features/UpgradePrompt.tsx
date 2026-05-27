import { Lock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface UpgradePromptProps {
  feature?: string;
  message?: string;
}

const UpgradePrompt = ({ feature = 'this feature', message }: UpgradePromptProps) => {
  return (
    <Card className="border-cyan-400/20 bg-slate-900/60">
      <CardContent className="flex items-center justify-between gap-4 p-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-cyan-500/10 grid place-content-center">
            <Lock className="h-4 w-4 text-cyan-300" />
          </div>
          <p className="text-sm text-cyan-100">
            {message || `Upgrade your XTATE plan to unlock ${feature}.`}
          </p>
        </div>
        <Button size="sm" className="bg-white/10 hover:bg-white/20 text-cyan-100">
          Upgrade
        </Button>
      </CardContent>
    </Card>
  );
};

export default UpgradePrompt;

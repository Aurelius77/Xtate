import React from 'react';
import { Wallet, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface ResidentWalletCardProps {
    label?: string;
}

const ResidentWalletCard = ({ label = 'Estate Wallet Balance' }: ResidentWalletCardProps) => {
    const [showBalance, setShowBalance] = React.useState(true);

    return (
        <Card className="bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col h-full">
            <CardContent className="p-6 flex flex-col h-full">
                {/* Header row */}
                <div className="flex items-center justify-between mb-6">
                    <div className="h-11 w-11 bg-amber-50 rounded-2xl flex items-center justify-center shadow-sm">
                        <Wallet className="h-5 w-5 text-amber-600" />
                    </div>
                    <button
                        onClick={() => setShowBalance(!showBalance)}
                        className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
                        aria-label="Toggle balance visibility"
                    >
                        {showBalance ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </button>
                </div>

                {/* Balance */}
                <div className="flex-1">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</p>
                    <h3
                        className="text-xl xl:text-[1.6rem] font-black text-gray-900 mt-1 leading-tight tracking-tight truncate"
                        title={showBalance ? '₦1,245,800.00' : undefined}
                    >
                        {showBalance ? '₦1,245,800.00' : '₦ ••••••••'}
                    </h3>
                    <p className="text-xs text-gray-400 mt-1 font-medium">Available Balance</p>
                </div>

                {/* Actions */}
                <div className="mt-6 space-y-2">
                    <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl transition-all shadow-lg shadow-blue-600/20 text-sm active:scale-[0.98]">
                        Fund Wallet
                    </button>
                    <button className="w-full flex items-center justify-center gap-1.5 text-blue-600 font-bold py-2 text-sm hover:underline decoration-2 underline-offset-4">
                        View Wallet <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                </div>
            </CardContent>
        </Card>
    );
};

export default ResidentWalletCard;

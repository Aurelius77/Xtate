import React from 'react';
import { Wallet, Eye, EyeOff, ArrowRight } from 'lucide-react';

interface ResidentWalletCardProps {
    label?: string;
}

const ResidentWalletCard = ({ label = 'Estate Wallet Balance' }: ResidentWalletCardProps) => {
    const [showBalance, setShowBalance] = React.useState(true);

    return (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <div className="h-10 w-10 bg-amber-50 rounded-xl flex items-center justify-center">
                    <Wallet className="h-5 w-5 text-amber-600" />
                </div>
                <button
                    onClick={() => setShowBalance(!showBalance)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                    {showBalance ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </button>
            </div>

            <div className="flex-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">{label}</p>
                <h3 className="text-2xl font-black text-gray-900 mt-1">
                    {showBalance ? '₦1,245,800.00' : '₦ ••••••••'}
                </h3>
                <p className="text-[10px] text-gray-400 mt-1">Available Balance</p>
            </div>

            <div className="mt-6 flex flex-col gap-2">
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-blue-600/20 text-sm">
                    Fund Wallet
                </button>
                <button className="w-full flex items-center justify-center gap-2 text-blue-600 font-bold py-2 text-sm hover:underline decoration-2 underline-offset-4">
                    View Wallet <ArrowRight className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
};

export default ResidentWalletCard;

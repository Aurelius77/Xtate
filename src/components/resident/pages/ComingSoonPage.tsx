import React from 'react';
import { Rocket, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ComingSoonPageProps {
    title: string;
    onBack: () => void;
}

const ComingSoonPage = ({ title, onBack }: ComingSoonPageProps) => {
    return (
        <div className="h-full flex flex-col items-center justify-center p-8 bg-white rounded-3xl border border-gray-100 shadow-sm text-center">
            <div className="h-20 w-20 bg-blue-50 rounded-3xl flex items-center justify-center mb-6">
                <Rocket className="h-10 w-10 text-blue-600 animate-pulse" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-2">{title}</h2>
            <p className="text-gray-500 max-w-md mx-auto mb-8 font-medium">
                We're working hard to bring you the best-in-class {title.toLowerCase()} management experience. This feature will be available shortly!
            </p>
            <Button
                onClick={onBack}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-8 py-6 font-bold shadow-lg shadow-blue-600/20"
            >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
            </Button>
        </div>
    );
};

export default ComingSoonPage;

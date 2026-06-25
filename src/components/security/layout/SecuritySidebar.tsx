import React from 'react';
import {
    LayoutDashboard, UserPlus, FileText, Bell,
    ShieldAlert, Settings, HelpCircle, LogOut,
    ChevronRight, Home, Smartphone
} from 'lucide-react';
import { useTenant } from '@/contexts/TenantContext';

interface SecuritySidebarProps {
    currentPage: string;
    setCurrentPage: (page: string) => void;
    onLogout: () => void;
}

const SecuritySidebar = ({ currentPage, setCurrentPage, onLogout }: SecuritySidebarProps) => {
    const { branding } = useTenant();
    const brandName = branding?.name || 'EstateOS';

    const menuSections = [
        {
            title: 'ACCESS CONTROL',
            items: [
                { icon: Smartphone, label: 'Verification Portal', page: 'dashboard' },
                { icon: UserPlus, label: 'Expected Visitors', page: 'visitors' },
                { icon: FileText, label: 'Gate Logs', page: 'logs' },
            ]
        },
        {
            title: 'COMMUNICATION',
            items: [
                { icon: Bell, label: 'Security Alerts', page: 'alerts', badge: 2 },
                { icon: ShieldAlert, label: 'Emergency Signal', page: 'emergency' },
            ]
        },
        {
            title: 'SYSTEM',
            items: [
                { icon: HelpCircle, label: 'Support Desk', page: 'support' },
                { icon: Settings, label: 'Terminal Settings', page: 'settings' },
            ]
        }
    ];

    return (
        <aside className="w-64 h-full bg-white border-r border-gray-100 flex flex-col overflow-hidden z-40 animate-in slide-in-from-left duration-500">
            {/* Brand */}
            <div className="px-6 py-6 flex items-center gap-3">
                <div className="h-9 w-9 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-600/20">
                    <ShieldAlert className="h-5 w-5 text-white" />
                </div>
                <div>
                    <h2 className="text-sm font-black text-gray-900 leading-tight">{brandName}</h2>
                    <p className="text-[10px] font-bold text-gray-400 mt-0.5 uppercase tracking-wider">Security Command ⌄</p>
                </div>
            </div>

            <div className="px-4 py-2">
                <button
                    onClick={() => setCurrentPage('dashboard')}
                    className={`flex items-center gap-3 w-full px-4 py-2.5 rounded-xl transition-all duration-200 ${currentPage === 'dashboard' ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-600/20 font-bold' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                    <LayoutDashboard className="h-4 w-4" />
                    <span className="text-sm">Command Center</span>
                </button>
            </div>

            {/* Navigation Area */}
            <div className="flex-1 overflow-y-auto px-4 space-y-7 py-4 custom-scrollbar">
                {menuSections.map((section) => (
                    <div key={section.title} className="space-y-1.5">
                        <h3 className="text-[10px] font-black text-gray-400 px-4 mb-2 tracking-[0.15em] uppercase">
                            {section.title}
                        </h3>
                        <div className="space-y-0.5">
                            {section.items.map((item) => {
                                const isActive = currentPage === item.page;
                                return (
                                    <button
                                        key={item.label}
                                        onClick={() => setCurrentPage(item.page)}
                                        className={`flex items-center justify-between w-full px-4 py-2.5 rounded-xl transition-all duration-200 ${isActive
                                            ? 'bg-emerald-50 text-emerald-600 font-bold'
                                            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900 group'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <item.icon className={`h-4 w-4 transition-colors ${isActive ? 'text-emerald-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
                                            <span className="text-xs">{item.label}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {item.badge && (
                                                <span className="bg-rose-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full shadow-lg shadow-rose-500/20">
                                                    {item.badge}
                                                </span>
                                            )}
                                            <ChevronRight className={`h-3 w-3 opacity-30 transition-transform ${isActive ? 'translate-x-0.5' : ''}`} />
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-50 bg-gray-50/10">
                <button
                    onClick={onLogout}
                    className="flex items-center gap-3 w-full px-4 py-3 text-rose-500 hover:bg-rose-50 rounded-xl transition-all font-bold text-xs group"
                >
                    <LogOut className="h-4 w-4 text-rose-400 group-hover:text-rose-500" />
                    <span>Sign Out</span>
                </button>
            </div>
        </aside>
    );
};

export default SecuritySidebar;

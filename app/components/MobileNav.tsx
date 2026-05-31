import React from 'react';
import { Plus, X, Menu, Moon, Sun } from 'lucide-react';

interface MenuItem {
    id: string;
    label: string;
    icon: React.ElementType;
}

interface MobileNavProps {
    activeMenu: string;
    setActiveMenu: (id: string) => void;
    isMobileMenuOpen: boolean;
    setIsMobileMenuOpen: (open: boolean) => void;
    isRightPanelOpen: boolean;
    setIsRightPanelOpen: (open: boolean) => void;
    theme: 'light' | 'dark';
    setTheme: (theme: 'light' | 'dark') => void;
    isLight: boolean;
    menuItems: MenuItem[];
}

export default function MobileNav({
    activeMenu,
    setActiveMenu,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    isRightPanelOpen,
    setIsRightPanelOpen,
    theme,
    setTheme,
    isLight,
    menuItems
}: MobileNavProps) {
    return (
        <>
        {/* Mobile top bar */}
        <div className={`md:hidden fixed top-0 left-0 right-0 h-16 ${isLight ? 'bg-white border-zinc-200' : 'bg-[#141417] border-[#26262B]'} border-b px-4 flex items-center justify-between z-30`}>
        <div className="flex items-center gap-2.5">
        <div className="h-8 w-8 bg-[#1E1E22] border border-zinc-800 rounded-lg flex items-center justify-center font-black text-xs tracking-tighter">
        <span className="text-amber-500">T</span>
        <span className="text-zinc-100">B</span>
        </div>
        <span className="text-xs font-black uppercase tracking-wider text-amber-500">
        Trackerbuddy <span className="text-zinc-400 dark:text-zinc-500 font-medium font-mono text-[10px] ml-1">• {activeMenu}</span>
        </span>
        </div>
        <div className="flex items-center gap-2">
        <button
        onClick={() => setIsRightPanelOpen(!isRightPanelOpen)}
        className={`p-2 rounded-lg border transition-transform ${isLight ? 'bg-zinc-50 border-zinc-200 text-zinc-700' : 'bg-zinc-900 border-zinc-800 text-zinc-300'} ${isRightPanelOpen ? 'rotate-45 text-rose-500 border-rose-500/30' : ''}`}
        >
        <Plus className="h-4 w-4" />
        </button>
        <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className={`p-2 rounded-lg ${isLight ? 'bg-zinc-100 text-zinc-900' : 'bg-zinc-800 text-white'}`}
        >
        {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
        </div>
        </div>

        {/* Mobile menu overlay */}
        {isMobileMenuOpen && (
            <div className={`md:hidden fixed inset-0 top-16 z-40 flex flex-col p-6 space-y-2 backdrop-blur-md ${isLight ? 'bg-white/95' : 'bg-[#0F0F11]/95'}`}>
            {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                    <button
                    key={item.id}
                    onClick={() => {
                        setActiveMenu(item.id);
                        setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all ${activeMenu === item.id ? 'bg-amber-500 text-black font-bold' : isLight ? 'bg-zinc-100 text-zinc-800' : 'bg-zinc-900 text-zinc-300'}`}
                    >
                    <Icon className="h-4 w-4" />
                    <span className="text-xs font-semibold">{item.label}</span>
                    </button>
                );
            })}
            <button
            onClick={() => { setTheme(isLight ? 'dark' : 'light'); setIsMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-4 p-3 rounded-xl ${isLight ? 'bg-zinc-100 text-zinc-800' : 'bg-zinc-900 text-zinc-300'}`}
            >
            {isLight ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            <span className="text-xs font-semibold">{isLight ? 'Dark Mode' : 'Light Mode'}</span>
            </button>
            </div>
        )}
        </>
    );
}

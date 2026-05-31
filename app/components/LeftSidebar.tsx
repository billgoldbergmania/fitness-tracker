import React from 'react';
import { Plus, Moon, Sun, Settings } from 'lucide-react';

interface MenuItem {
    id: string;
    label: string;
    icon: React.ElementType;
}

interface LeftSidebarProps {
    menuItems: MenuItem[];
    activeMenu: string;
    setActiveMenu: (id: string) => void;
    isLight: boolean;
    theme: 'light' | 'dark';
    setTheme: (theme: 'light' | 'dark') => void;
    isRightPanelOpen: boolean;
    setIsRightPanelOpen: (open: boolean) => void;
}

export default function LeftSidebar({
    menuItems,
    activeMenu,
    setActiveMenu,
    isLight,
    theme,
    setTheme,
    isRightPanelOpen,
    setIsRightPanelOpen
}: LeftSidebarProps) {
    const leftSidebarBg = isLight ? 'bg-white border-zinc-200' : 'bg-[#141417] border-[#26262B]';

    return (
        <aside className={`w-24 border-r ${leftSidebarBg} flex flex-col items-center py-8 justify-between hidden md:flex z-20 shrink-0`}>
        <div className="space-y-10 flex flex-col items-center w-full">
        <div className="h-12 w-12 bg-[#1E1E22] border border-zinc-800 rounded-xl flex items-center justify-center font-black text-lg shadow-inner tracking-tighter">
        <span className="text-amber-500">T</span>
        <span className="text-zinc-100">B</span>
        </div>
        <nav className="flex flex-col items-center gap-4 w-full px-2">
        {/* Show all menu items (no slice) */}
        {menuItems.map((item) => {
            const Icon = item.icon;
            return (
                <button
                key={item.id}
                onClick={() => setActiveMenu(item.id)}
                className={`h-12 w-12 rounded-xl flex items-center justify-center transition-all duration-200 relative group
                    ${activeMenu === item.id
                        ? 'bg-amber-500 text-black font-bold shadow-md'
            : isLight ? 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900' : 'text-zinc-400 hover:bg-zinc-800/60 hover:text-white'}`}
            title={item.label}
            >
            <Icon className="h-5 w-5" />
            </button>
            );
        })}
        <div className={`w-8 h-[1px] ${isLight ? 'bg-zinc-200' : 'bg-zinc-800'} my-1`} />

        <button
        onClick={() => setIsRightPanelOpen(!isRightPanelOpen)}
        className={`h-12 w-12 rounded-xl flex items-center justify-center transition-all duration-300 border
            ${isRightPanelOpen
                ? 'bg-rose-500/10 text-rose-500 border-rose-500/30 rotate-45'
    : isLight ? 'bg-zinc-50 text-zinc-600 border-zinc-200 hover:bg-zinc-100' : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:bg-zinc-800'}`}
    title={isRightPanelOpen ? "Collapse Engine Panel" : "Expand Engine Panel"}
    >
    <Plus className="h-5 w-5" />
    </button>
    </nav>
    </div>

    <div className="flex flex-col items-center gap-4 w-full">
    <button
    onClick={() => setTheme(isLight ? 'dark' : 'light')}
    className={`h-10 w-10 rounded-xl flex items-center justify-center transition-colors ${isLight ? 'text-zinc-500 hover:bg-zinc-100' : 'text-zinc-400 hover:bg-zinc-800'}`}
    title={isLight ? "Activate Dark Mode" : "Activate Light Mode"}
    >
    {isLight ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
    </button>

    <button
    onClick={() => setActiveMenu('settings')}
    className={`h-12 w-12 rounded-xl flex items-center justify-center transition-all ${activeMenu === 'settings' ? 'bg-amber-500 text-black shadow-md' : isLight ? 'text-zinc-500 hover:bg-zinc-100' : 'text-zinc-400 hover:bg-zinc-800'}`}
    title="Settings Panel"
    >
    <Settings className="h-5 w-5" />
    </button>
    </div>
    </aside>
    );
}

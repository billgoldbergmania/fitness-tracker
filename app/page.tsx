'use client';

import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import {
    Scale,
    Dumbbell,
    Sparkles,
    ArrowDown,
    ArrowUp,
    LayoutDashboard,
    BarChart3,
    History,
    Settings,
    Plus,
    X,
    ChevronRight
} from 'lucide-react';
import { logWeight, logWorkout, getDashboardData, WeightData, WorkoutData } from '../lib/actions';

export default function Dashboard() {
    // Navigation & Layout States
    const [activeMenu, setActiveMenu] = useState('dashboard');
    const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);

    // Dashboard Core Data State
    const [data, setData] = useState<{
        weightData: WeightData[];
        benchData: WorkoutData[];
        metrics: { currentWeight: number; weightChange: number; currentBench1RM: number; maxBench1RM: number };
    } | null>(null);

    // Form Inputs States
    const [weightDate, setWeightDate] = useState(new Date().toISOString().split('T')[0]);
    const [weightVal, setWeightVal] = useState('');
    const [workoutDate, setWorkoutDate] = useState(new Date().toISOString().split('T')[0]);
    const [benchWeight, setBenchWeight] = useState('');
    const [benchReps, setBenchReps] = useState('');

    const refreshData = async () => {
        const res = await getDashboardData();
        setData(res);
    };

    useEffect(() => {
        refreshData();
        // Auto-collapse right panel on small viewports
        if (window.innerWidth < 1024) {
            setIsRightPanelOpen(false);
        }
    }, []);

    const handleWeightSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!weightVal) return;
        await logWeight(weightDate, parseFloat(weightVal));
        setWeightVal('');
        refreshData();
    };

    const handleWorkoutSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!benchWeight || !benchReps) return;
        await logWorkout(workoutDate, 'Bench Press', parseFloat(benchWeight), parseInt(benchReps));
        setBenchWeight('');
        setBenchReps('');
        refreshData();
    };

    if (!data) {
        return (
            <div className="flex h-screen w-screen items-center justify-center bg-[#F8F9FA] text-slate-500 font-medium text-sm">
            <div className="flex flex-col items-center gap-3">
            <div className="h-6 w-6 border-2 border-slate-400 border-t-transparent animate-spin rounded-full" />
            <span className="tracking-tight text-slate-600">Loading your health network...</span>
            </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen w-screen bg-[#F8F9FA] text-[#1E1E24] font-sans antialiased overflow-hidden selection:bg-slate-200">

        {/* 1. LEFT UTILITY SIDEBAR (Figma High-Fidelity Style) */}
        <aside className="w-20 border-r border-[#EBEAE6] bg-white flex flex-col items-center py-7 justify-between hidden sm:flex z-20">
        <div className="space-y-10 flex flex-col items-center w-full">
        {/* Brand Mark */}
        <div className="h-10 w-10 bg-[#FFF2E6] rounded-xl flex items-center justify-center text-[#D97706] shadow-sm tracking-tighter font-bold text-lg">
        H
        </div>

        {/* Main Action Menu Navigation */}
        <nav className="flex flex-col items-center gap-4 w-full px-2">
        <button
        onClick={() => setActiveMenu('dashboard')}
        title="Dashboard Overview"
        className={`h-11 w-11 rounded-xl flex items-center justify-center transition-all duration-200 ${activeMenu === 'dashboard' ? 'bg-[#232325] text-white shadow-sm' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-800'}`}
        >
        <LayoutDashboard className="h-5 w-5" />
        </button>
        <button
        onClick={() => setActiveMenu('analytics')}
        title="Advanced Analytics (Coming Soon)"
        className={`h-11 w-11 rounded-xl flex items-center justify-center transition-all duration-200 ${activeMenu === 'analytics' ? 'bg-[#232325] text-white shadow-sm' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-800'}`}
        >
        <BarChart3 className="h-5 w-5" />
        </button>
        <button
        onClick={() => setActiveMenu('history')}
        title="Log History (Coming Soon)"
        className={`h-11 w-11 rounded-xl flex items-center justify-center transition-all duration-200 ${activeMenu === 'history' ? 'bg-[#232325] text-white shadow-sm' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-800'}`}
        >
        <History className="h-5 w-5" />
        </button>

        <div className="w-8 h-[1px] bg-slate-100 my-2" />

        {/* Quick Toggle Action for Entry Panel */}
        <button
        onClick={() => setIsRightPanelOpen(!isRightPanelOpen)}
        title="Toggle Log Panel"
        className={`h-11 w-11 rounded-xl flex items-center justify-center transition-all duration-200 ${isRightPanelOpen ? 'bg-amber-50 text-amber-600 border border-amber-200' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
        >
        <Plus className={`h-5 w-5 transition-transform duration-200 ${isRightPanelOpen ? 'rotate-45' : ''}`} />
        </button>
        </nav>
        </div>

        {/* User Workspace Config Node */}
        <button
        onClick={() => setActiveMenu('settings')}
        className={`h-11 w-11 rounded-xl flex items-center justify-center transition-all duration-200 ${activeMenu === 'settings' ? 'bg-[#232325] text-white' : 'text-slate-400 hover:bg-slate-50'}`}
        >
        <Settings className="h-5 w-5" />
        </button>
        </aside>

        {/* VIEWPORT CONTROLLER CONTAINER */}
        <div className="flex-1 flex overflow-hidden relative">

        {/* 2. CENTRAL MAIN WORKSPACE (Light Minimalist Canvas) */}
        <main className="flex-1 flex flex-col h-full overflow-hidden p-6 md:p-8 lg:p-10 space-y-6">

        {/* Typography Responsive Header */}
        <div className="flex items-center justify-between shrink-0">
        <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#16161a]">Health Overview</h1>
        <p className="text-xs font-medium text-slate-400 mt-0.5">Metrics parsed in metric parameters (kg)</p>
        </div>

        {/* Mobile Log Action Button */}
        <button
        onClick={() => setIsRightPanelOpen(true)}
        className="lg:hidden flex items-center gap-1.5 bg-[#232325] text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-sm"
        >
        <Plus className="h-4 w-4" /> Add Entry
        </button>
        </div>

        {/* Render Conditional Content Based on Left Sidebar Navigation Selection */}
        {activeMenu !== 'dashboard' ? (
            <div className="flex-1 bg-white border border-[#EBEAE6] rounded-2xl p-8 flex flex-col items-center justify-center text-center">
            <div className="h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 mb-3">
            <Sparkles className="h-5 w-5" />
            </div>
            <h3 className="text-base font-semibold text-slate-800 capitalize">{activeMenu} Module</h3>
            <p className="text-xs text-slate-400 max-w-xs mt-1">This functional workspace view is being mapped to match upcoming health ecosystem extensions.</p>
            <button onClick={() => setActiveMenu('dashboard')} className="mt-4 text-xs font-semibold text-indigo-600 hover:underline">Return to Dashboard</button>
            </div>
        ) : (
            <div className="flex-1 flex flex-col min-h-0 overflow-y-auto lg:overflow-hidden space-y-6 pr-1">

            {/* High-Contrast Scorecard Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 shrink-0">

            {/* Body Weight Metric */}
            <div className="bg-white rounded-2xl p-5 border border-[#EBEAE6] shadow-[0_4px_20px_rgba(235,234,230,0.3)] flex flex-col justify-between transition-transform hover:translate-y-[-2px] duration-200">
            <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 tracking-wide uppercase">Weight Parameter</span>
            <div className="bg-[#FFF2E6] p-2 rounded-xl text-[#D97706]"><Scale className="h-4 w-4" /></div>
            </div>
            <div className="mt-3">
            <div className="flex items-baseline gap-1">
            <span className="text-4xl font-bold tracking-tight text-[#16161a]">{data.metrics.currentWeight || '--'}</span>
            <span className="text-xs font-bold text-slate-400">kg</span>
            </div>
            <div className="mt-2.5 flex items-center gap-1.5 text-xs font-semibold">
            {data.metrics.weightChange <= 0 ? (
                <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg flex items-center gap-0.5">
                <ArrowDown className="h-3 w-3" /> {data.metrics.weightChange} kg
                </span>
            ) : (
                <span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded-lg flex items-center gap-0.5">
                <ArrowUp className="h-3 w-3" /> +{data.metrics.weightChange} kg
                </span>
            )}
            <span className="text-slate-400 font-normal">vs last entry</span>
            </div>
            </div>
            </div>

            {/* Real-time Day 1RM Performance Metric */}
            <div className="bg-white rounded-2xl p-5 border border-[#EBEAE6] shadow-[0_4px_20px_rgba(235,234,230,0.3)] flex flex-col justify-between transition-transform hover:translate-y-[-2px] duration-200">
            <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 tracking-wide uppercase">Current Day 1RM</span>
            <div className="bg-[#FFF0F2] p-2 rounded-xl text-[#E11D48]"><Dumbbell className="h-4 w-4" /></div>
            </div>
            <div className="mt-3">
            <div className="flex items-baseline gap-1">
            <span className="text-4xl font-bold tracking-tight text-[#16161a]">{data.metrics.currentBench1RM || '--'}</span>
            <span className="text-xs font-bold text-slate-400">kg</span>
            </div>
            <div className="mt-2.5 text-slate-400 text-[11px] font-normal flex items-center gap-1">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-rose-500" /> Max calculated lift load from latest training date
            </div>
            </div>
            </div>

            {/* Ultimate Ceiling Metric */}
            <div className="bg-white rounded-2xl p-5 border border-[#EBEAE6] shadow-[0_4px_20px_rgba(235,234,230,0.3)] flex flex-col justify-between transition-transform hover:translate-y-[-2px] duration-200">
            <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 tracking-wide uppercase">All-Time Ceiling</span>
            <div className="bg-[#E6F4F1] p-2 rounded-xl text-[#0D9488]"><Sparkles className="h-4 w-4" /></div>
            </div>
            <div className="mt-3">
            <div className="flex items-baseline gap-1">
            <span className="text-4xl font-bold tracking-tight text-[#16161a]">{data.metrics.maxBench1RM || '--'}</span>
            <span className="text-xs font-bold text-slate-400">kg</span>
            </div>
            <div className="mt-2.5 text-slate-400 text-[11px] font-normal flex items-center gap-1">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-teal-500" /> Peak calculation standard threshold ever logged
            </div>
            </div>
            </div>

            </div>

            {/* Viewport Bound Graph Panel Layout Layer */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-5 min-h-0">

            {/* Weight Vector Chart */}
            <div className="bg-white border border-[#EBEAE6] p-5 rounded-2xl shadow-[0_4px_20px_rgba(235,234,230,0.3)] flex flex-col min-h-[260px] lg:min-h-0">
            <div className="mb-3 shrink-0">
            <h3 className="text-sm font-bold text-[#16161a]">Body Mass Progress</h3>
            <p className="text-xs text-slate-400 font-medium">Daily entries vs rolling trend outputs</p>
            </div>
            <div className="flex-1 min-h-0 w-full">
            {data.weightData.length === 0 ? (
                <div className="h-full w-full flex items-center justify-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">No historical weight records available</div>
            ) : (
                <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.weightData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F0EA" vertical={false} />
                <XAxis dataKey="date" stroke="#A1A1AA" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#A1A1AA" fontSize={10} tickLine={false} axisLine={false} domain={['dataMin - 2', 'dataMax + 2']} />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#EBEAE6', borderRadius: '12px', fontSize: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} />
                <Line type="monotone" dataKey="weight" name="Weight" stroke="#D97706" strokeWidth={2.5} dot={{ r: 2.5, fill: '#D97706', strokeWidth: 0 }} />
                <Line type="monotone" dataKey="movingAvg" name="7D Trend" stroke="#0D9488" strokeWidth={1.5} strokeDasharray="4 4" dot={false} connectNulls />
                </LineChart>
                </ResponsiveContainer>
            )}
            </div>
            </div>

            {/* Strength Metrics Chart */}
            <div className="bg-white border border-[#EBEAE6] p-5 rounded-2xl shadow-[0_4px_20px_rgba(235,234,230,0.3)] flex flex-col min-h-[260px] lg:min-h-0">
            <div className="mb-3 shrink-0">
            <h3 className="text-sm font-bold text-[#16161a]">Strength Yield Trends</h3>
            <p className="text-xs text-slate-400 font-medium">Progression curves tracking volume performance</p>
            </div>
            <div className="flex-1 min-h-0 w-full">
            {data.benchData.length === 0 ? (
                <div className="h-full w-full flex items-center justify-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">No historical strength data recorded</div>
            ) : (
                <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.benchData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F0EA" vertical={false} />
                <XAxis dataKey="date" stroke="#A1A1AA" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#A1A1AA" fontSize={10} tickLine={false} axisLine={false} domain={['dataMin - 5', 'dataMax + 5']} />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#EBEAE6', borderRadius: '12px', fontSize: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} />
                <Line type="monotone" dataKey="estimated_1rm" name="Estimated 1RM" stroke="#E11D48" strokeWidth={2.5} dot={{ r: 2.5, fill: '#E11D48', strokeWidth: 0 }} />
                </LineChart>
                </ResponsiveContainer>
            )}
            </div>
            </div>

            </div>
            </div>
        )}
        </main>

        {/* 3. RIGHT ACTIVE UTILITY DRAWER (Matte Charcoal Interactive Deck) */}
        <aside className={`
            fixed inset-y-0 right-0 z-50 w-[360px] bg-[#232325] text-white p-6 flex flex-col justify-between border-l border-[#1A1A1C] transition-transform duration-300 transform
            lg:relative lg:translate-x-0 lg:z-10 shrink-0 h-full
            ${isRightPanelOpen ? 'translate-x-0' : 'translate-x-full'}
            `}>

            {/* Header Utilities */}
            <div className="flex items-center justify-between shrink-0 pb-2">
            <div>
            <h2 className="text-base font-bold tracking-tight text-white">Quick Entry Log</h2>
            <p className="text-xs text-[#95959A] mt-0.5">Append parameters directly into database registers</p>
            </div>

            {/* Collapse Close Button Panel */}
            <button
            onClick={() => setIsRightPanelOpen(false)}
            className="p-1.5 bg-[#2E2E32] rounded-lg text-slate-400 hover:text-white transition-colors duration-200"
            >
            <X className="h-4 w-4" />
            </button>
            </div>

            {/* Form Scroll Context Layer */}
            <div className="flex-1 overflow-y-auto space-y-5 py-4 pr-1 scrollbar-thin">

            {/* Weight Input Box */}
            <div className="bg-[#2D2D31] rounded-xl p-4 border border-[#3D3D43] space-y-3 shadow-inner">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#D97706]">
            <Scale className="h-3.5 w-3.5" />
            <span>Body Mass Index</span>
            </div>
            <form onSubmit={handleWeightSubmit} className="space-y-3 text-xs">
            <div className="space-y-1">
            <label className="text-[#A5A5AA] font-medium">Log Horizon Date</label>
            <input type="date" value={weightDate} onChange={(e) => setWeightDate(e.target.value)} className="w-full bg-[#1E1E20] border border-[#48484E] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#D97706] transition-colors" />
            </div>
            <div className="space-y-1">
            <label className="text-[#A5A5AA] font-medium">Mass Parameters (kg)</label>
            <input type="number" step="0.1" placeholder="e.g. 74.5" value={weightVal} onChange={(e) => setWeightVal(e.target.value)} className="w-full bg-[#1E1E20] border border-[#48484E] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#D97706] transition-colors" />
            </div>
            <button type="submit" className="w-full bg-[#F6ECD9] hover:bg-[#EFE2CE] text-[#564223] font-bold py-2 rounded-lg transition-colors duration-150 tracking-tight mt-1">
            Save Weight Entry
            </button>
            </form>
            </div>

            {/* Bench Press Set Input Box */}
            <div className="bg-[#2D2D31] rounded-xl p-4 border border-[#3D3D43] space-y-3 shadow-inner">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#E11D48]">
            <Dumbbell className="h-3.5 w-3.5" />
            <span>Bench Press Set</span>
            </div>
            <form onSubmit={handleWorkoutSubmit} className="space-y-3 text-xs">
            <div className="space-y-1">
            <label className="text-[#A5A5AA] font-medium">Log Horizon Date</label>
            <input type="date" value={workoutDate} onChange={(e) => setWorkoutDate(e.target.value)} className="w-full bg-[#1E1E20] border border-[#48484E] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#E11D48] transition-colors" />
            </div>
            <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
            <label className="text-[#A5A5AA] font-medium">Load (kg)</label>
            <input type="number" step="0.5" placeholder="80" value={benchWeight} onChange={(e) => setBenchWeight(e.target.value)} className="w-full bg-[#1E1E20] border border-[#48484E] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#E11D48] transition-colors" />
            </div>
            <div className="space-y-1">
            <label className="text-[#A5A5AA] font-medium">Repetitions</label>
            <input type="number" placeholder="5" value={benchReps} onChange={(e) => setBenchReps(e.target.value)} className="w-full bg-[#1E1E20] border border-[#48484E] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#E11D48] transition-colors" />
            </div>
            </div>
            <button type="submit" className="w-full bg-[#F6ECD9] hover:bg-[#EFE2CE] text-[#564223] font-bold py-2 rounded-lg transition-colors duration-150 tracking-tight mt-1">
            Save Workout Set
            </button>
            </form>
            </div>

            </div>

            {/* Quick Indicator Link Context */}
            <div className="pt-3 border-t border-[#313135] shrink-0 flex items-center justify-between text-[11px] text-[#95959A] font-medium">
            <span>Database Status</span>
            <span className="flex items-center gap-1 text-emerald-400 font-semibold">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" /> Connected
            </span>
            </div>

            </aside>

            {/* Floating Sidebar Restore Handle (When collapsed on Desktop) */}
            {!isRightPanelOpen && (
                <button
                onClick={() => setIsRightPanelOpen(true)}
                className="hidden lg:flex absolute right-0 top-1/2 transform -translate-y-1/2 bg-[#232325] hover:bg-[#323236] text-white p-1 rounded-l-xl border-l border-y border-[#3A3A3F] z-10 transition-colors shadow-md"
                title="Open Data Panel"
                >
                <ChevronRight className="h-4 w-4 rotate-180" />
                </button>
            )}

            </div>
            </div>
    );
}

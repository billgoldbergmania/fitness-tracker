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
    Trash2,
    ChevronRight,
    ChevronDown,
    Wrench,
    Download,
    Calculator,
    Trophy,
    Camera,
    Menu,
    ImageIcon,
    Sun,
    Moon
} from 'lucide-react';
import {
    logWeight,
    createExercise,
    deleteExercise,
    logWorkoutSet,
    deleteWorkoutSet,
    getDashboardData,
    updateSetting,
    WeightData,
    Exercise,
    WorkoutSet
} from '../lib/actions';

interface ProgressPhoto {
    id: string;
    date: string;
    url: string;
    caption: string;
}

export default function Dashboard() {
    const [activeMenu, setActiveMenu] = useState('dashboard');
    const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [targetExercise, setTargetExercise] = useState<number>(0);
    const [expandedDays, setExpandedDays] = useState<Record<string, boolean>>({});

    // Theme Toggle Engine
    const [theme, setTheme] = useState<'light' | 'dark'>('light');

    // Progress Photos State
    const [photos, setPhotos] = useState<ProgressPhoto[]>([]);
    const [photoDate, setPhotoDate] = useState(new Date().toISOString().split('T')[0]);
    const [photoCaption, setPhotoCaption] = useState('');
    const [photoFile, setPhotoFile] = useState<string | null>(null);

    // Core Database Sync State
    const [data, setData] = useState<{
        weightData: WeightData[];
        exercises: Exercise[];
        selectedExerciseData: { date: string; estimated_1rm: number }[];
        fullHistoryFeed: WorkoutSet[];
        activeExerciseId: number;
        settings: { weight_unit: 'kg' | 'lbs'; height_unit: 'cm' | 'in'; one_rm_formula: 'brzycki' | 'epley' };
        metrics: { currentWeight: number; weightChange: number; currentBench1RM: number; maxBench1RM: number };
    } | null>(null);

    // Input Fields States
    const [weightDate, setWeightDate] = useState(new Date().toISOString().split('T')[0]);
    const [weightVal, setWeightVal] = useState('');
    const [workoutDate, setWorkoutDate] = useState(new Date().toISOString().split('T')[0]);
    const [logExerciseId, setLogExerciseId] = useState<string>('');
    const [benchWeight, setBenchWeight] = useState('');
    const [benchReps, setBenchReps] = useState('');
    const [newExerciseName, setNewExerciseName] = useState('');

    // Utility Calculators States
    const [calcWeight, setCalcWeight] = useState('100');
    const [calcReps, setCalcReps] = useState('5');
    const [plateTarget, setPlateTarget] = useState('100');
    const [plateBar, setPlateBar] = useState('20');
    const [bmiHeight, setBmiHeight] = useState('180');
    const [bmiWeight, setBmiWeight] = useState('80');
    const [tdeeWeight, setTdeeWeight] = useState('80');
    const [tdeeHeight, setTdeeHeight] = useState('180');
    const [tdeeAge, setTdeeAge] = useState('25');
    const [tdeeGender, setTdeeGender] = useState('male');
    const [tdeeActivity, setTdeeActivity] = useState('1.55');

    useEffect(() => {
        document.title = "Trackerbuddy";
        refreshData();
        const savedPhotos = localStorage.getItem('workout_progress_photos');
        if (savedPhotos) {
            try { setPhotos(JSON.parse(savedPhotos)); } catch (e) { console.error(e); }
        }
        if (window.innerWidth < 1024) setIsRightPanelOpen(false);
    }, [targetExercise]);

        const refreshData = async (exerciseId?: number) => {
            const res = await getDashboardData(exerciseId || targetExercise);
            setData(res);
            if (!targetExercise && res.exercises.length > 0) setTargetExercise(res.exercises[0].id);
            if (!logExerciseId && res.exercises.length > 0) setLogExerciseId(res.exercises[0].id.toString());
        };

            const handleWeightSubmit = async (e: React.FormEvent) => {
                e.preventDefault();
                if (!weightVal) return;
                await logWeight(weightDate, parseFloat(weightVal));
                setWeightVal('');
                refreshData();
            };

            const handleWorkoutSubmit = async (e: React.FormEvent) => {
                e.preventDefault();
                if (!benchWeight || !benchReps || !logExerciseId) return;
                await logWorkoutSet(workoutDate, parseInt(logExerciseId), parseFloat(benchWeight), parseInt(benchReps), data?.settings.one_rm_formula);
                setBenchWeight('');
                setBenchReps('');
                refreshData();
            };

            const handleCreateExercise = async (e: React.FormEvent) => {
                e.preventDefault();
                if (!newExerciseName) return;
                await createExercise(newExerciseName);
                setNewExerciseName('');
                refreshData();
            };

            const toggleDayExpansion = (day: string) => {
                setExpandedDays(prev => ({ ...prev, [day]: !prev[day] }));
            };

            const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
                const file = e.target.files?.[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => { setPhotoFile(reader.result as string); };
                    reader.readAsDataURL(file);
                }
            };

            const handleSavePhoto = (e: React.FormEvent) => {
                e.preventDefault();
                if (!photoFile) return;
                const newPhoto: ProgressPhoto = {
                    id: Math.random().toString(36).substr(2, 9),
                    date: photoDate,
                    url: photoFile,
                    caption: photoCaption || 'Workout Progression Entry'
                };
                const updated = [newPhoto, ...photos];
                setPhotos(updated);
                localStorage.setItem('workout_progress_photos', JSON.stringify(updated));
                setPhotoCaption('');
                setPhotoFile(null);
            };

            const handleDeletePhoto = (id: string) => {
                const updated = photos.filter(p => p.id !== id);
                setPhotos(updated);
                localStorage.setItem('workout_progress_photos', JSON.stringify(updated));
            };

            const exportToCSV = () => {
                if (!data) return;
                let csvContent = "data:text/csv;charset=utf-8,Type,Date,Exercise,Weight,Reps,Estimated 1RM\n";
                data.weightData.forEach(w => { csvContent += `Weight,${w.date},Bodyweight,${w.weight},,\n`; });
                data.fullHistoryFeed.forEach(s => { csvContent += `Set,${s.date},"${s.exercise_name}",${s.weight},${s.reps},${s.estimated_1rm}\n`; });
                const encodedUri = encodeURI(csvContent);
                const link = document.createElement("a");
                link.setAttribute("href", encodedUri);
                link.setAttribute("download", `trackerbuddy_export_${new Date().toISOString().split('T')[0]}.csv`);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            };

            if (!data) {
                return (
                    <div className="flex h-screen w-screen items-center justify-center bg-[#141417] text-zinc-400 font-medium text-sm">
                    <div className="flex flex-col items-center gap-2">
                    <div className="h-5 w-5 border-2 border-amber-500 border-t-transparent animate-spin rounded-full" />
                    <span className="text-xs tracking-wider uppercase text-zinc-500">Loading Trackerbuddy...</span>
                    </div>
                    </div>
                );
            }

            const groupedHistory = data.fullHistoryFeed.reduce((acc, set) => {
                if (!acc[set.date]) acc[set.date] = [];
                acc[set.date].push(set);
                return acc;
            }, {} as Record<string, WorkoutSet[]>);

            const personalBests = data.exercises.map(ex => {
                const setsForExercise = data.fullHistoryFeed.filter(s => s.exercise_name === ex.name);
                if (setsForExercise.length === 0) return { ...ex, maxWeight: 0, max1RM: 0, totalSets: 0 };
                return {
                    ...ex,
                    maxWeight: Math.max(...setsForExercise.map(s => s.weight)),
                                                     max1RM: Math.max(...setsForExercise.map(s => s.estimated_1rm)),
                                                     totalSets: setsForExercise.length
                };
            }).filter(ex => ex.totalSets > 0);

            const isLbs = data.settings.weight_unit === 'lbs';
            const unitLabel = isLbs ? 'lbs' : 'kg';

            // Calculator Math Computations
            const computed1RM = Math.round((parseFloat(calcWeight) * (1 + parseInt(calcReps) / 30)) * 10) / 10;
            const totalPlateWeightTarget = parseFloat(plateTarget);
            const barWeight = parseFloat(plateBar);
            const sideWeightNeeded = (totalPlateWeightTarget - barWeight) / 2;
            const availablePlates = isLbs ? [45, 35, 25, 10, 5, 2.5] : [25, 20, 15, 10, 5, 2.5, 1.25];
            let remainingSideWeight = sideWeightNeeded;
            const plateBreakdown: number[] = [];
            if (remainingSideWeight > 0) {
                availablePlates.forEach(p => {
                    while (remainingSideWeight >= p) {
                        plateBreakdown.push(p);
                        remainingSideWeight -= p;
                    }
                });
            }

            const hMeters = data.settings.height_unit === 'in' ? parseFloat(bmiHeight) * 0.0254 : parseFloat(bmiHeight) / 100;
            const wKg = isLbs ? parseFloat(bmiWeight) * 0.453592 : parseFloat(bmiWeight);
            const computedBMI = hMeters > 0 ? Math.round((wKg / (hMeters * hMeters)) * 10) / 10 : 0;

            const tdeeWKg = isLbs ? parseFloat(tdeeWeight) * 0.453592 : parseFloat(tdeeWeight);
            const tdeeHCm = data.settings.height_unit === 'in' ? parseFloat(tdeeHeight) * 2.54 : parseFloat(tdeeHeight);
            let bmr = 10 * tdeeWKg + 6.25 * tdeeHCm - 5 * parseInt(tdeeAge);
            bmr = tdeeGender === 'male' ? bmr + 5 : bmr - 161;
            const computedTDEE = Math.round(bmr * parseFloat(tdeeActivity));

            const activeExerciseName = data.exercises.find(e => e.id === targetExercise)?.name || 'Exercise';

            const menuItems = [
                { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
                { id: 'analytics', label: 'Analytics Curve', icon: BarChart3 },
                { id: 'pbs', label: 'Personal Bests', icon: Trophy },
                { id: 'photos', label: 'Progress Ledger', icon: Camera },
                { id: 'history', label: 'Timeline History', icon: History },
                { id: 'tools', label: 'Calculation Suite', icon: Wrench },
                { id: 'settings', label: 'Settings Panel', icon: Settings },
            ];

            const isLight = theme === 'light';
            const mainStageBg = isLight ? 'bg-[#FAF9F6]' : 'bg-[#0F0F11]';
            const leftSidebarBg = isLight ? 'bg-white border-zinc-200' : 'bg-[#141417] border-[#26262B]';
            const cardBg = isLight ? 'bg-white border-zinc-200/80 shadow-sm' : 'bg-[#141417] border-[#26262B] shadow-xl';
            const mainText = isLight ? 'text-zinc-900' : 'text-[#E4E4E7]';

            return (
                <div className={`flex h-screen w-screen ${mainStageBg} ${mainText} font-sans antialiased overflow-hidden`}>

                {/* 1. DESKTOP LEFT CONTROL SIDEBAR PANEL (Typo Fixed from 'md:flex进') */}
                <aside className={`w-24 border-r ${leftSidebarBg} flex flex-col items-center py-8 justify-between hidden md:flex z-20 shrink-0`}>
                <div className="space-y-10 flex flex-col items-center w-full">
                {/* Custom Dual-Tone High Fidelity Premium Logo Mark */}
                <div className="h-12 w-12 bg-[#1E1E22] border border-zinc-800 rounded-xl flex items-center justify-center font-black text-lg shadow-inner tracking-tighter">
                <span className="text-amber-500">T</span>
                <span className="text-zinc-100">B</span>
                </div>
                <nav className="flex flex-col items-center gap-4 w-full px-2">
                {menuItems.slice(0, 6).map((item) => {
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
            title={isRightPanelOpen ? "Hide Metrics Panel" : "Show Metrics Panel"}
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

            {/* 2. RESPONSIVE MOBILE TOP NAVIGATION BAR WITH EXPLICIT ACCENT BRANDING */}
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

            {/* MOBILE NAV OVERLAY MODAL */}
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

            {/* CENTRAL PRIMARY STAGE VIEWPORT */}
            <div className="flex-1 flex overflow-hidden relative pt-16 md:pt-0">
            <main className="flex-1 flex flex-col h-full overflow-hidden p-4 md:p-8 space-y-6">

            {/* Main Top Header Block with Permanent Premium Branding Anchor */}
            <div className="hidden md:flex items-center justify-between shrink-0">
            <div>
            <div className="flex items-center gap-2">
            <span className="text-xl font-black tracking-tight uppercase text-amber-500">Trackerbuddy</span>
            <span className="text-zinc-300 dark:text-zinc-700 font-light text-lg">/</span>
            <h1 className="text-xl font-black tracking-tight uppercase text-zinc-500 dark:text-zinc-400">{activeMenu}</h1>
            </div>
            <p className="text-xs font-medium text-zinc-400 mt-0.5">your personal weight and fitness tracker</p>
            </div>
            <div>
            {activeMenu === 'dashboard' && data.exercises.length > 0 && (
                <select
                value={targetExercise}
                onChange={(e) => setTargetExercise(parseInt(e.target.value))}
                className={`border rounded-xl text-xs font-bold px-4 py-2 text-zinc-700 outline-none cursor-pointer ${isLight ? 'bg-white border-zinc-200' : 'bg-[#141417] border-[#26262B] text-zinc-200'}`}
                >
                {data.exercises.map(ex => <option key={ex.id} value={ex.id}>{ex.name}</option>)}
                </select>
            )}
            </div>
            </div>

            {/* VIEWPORT CONTROLLER SWITCHES */}
            <div className="flex-1 min-h-0 overflow-y-auto pr-1">

            {/* COMPONENT 1: DASHBOARD VIEW */}
            {activeMenu === 'dashboard' && (
                <div className="h-full flex flex-col space-y-6 min-h-0">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 shrink-0">
                <div className={`${cardBg} rounded-2xl p-5 flex flex-col justify-between`}>
                <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-zinc-400 tracking-wider uppercase">Body Mass Vector</span>
                <div className="bg-amber-500/10 p-2 rounded-xl text-amber-500"><Scale className="h-4 w-4" /></div>
                </div>
                <div className="mt-4 flex items-baseline gap-1.5">
                <span className="text-3xl font-black tracking-tight">{data.metrics.currentWeight || '--'}</span>
                <span className="text-xs font-bold text-zinc-400">{unitLabel}</span>
                <div className="ml-3 inline-block">
                {data.metrics.weightChange <= 0 ? (
                    <span className="text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-md text-[10px] font-black flex items-center gap-0.5">
                    <ArrowDown className="h-3 w-3" /> {Math.abs(data.metrics.weightChange)} {unitLabel}
                    </span>
                ) : (
                    <span className="text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-md text-[10px] font-black flex items-center gap-0.5">
                    <ArrowUp className="h-3 w-3" /> +{data.metrics.weightChange} {unitLabel}
                    </span>
                )}
                </div>
                </div>
                </div>

                <div className={`${cardBg} rounded-2xl p-5 flex flex-col justify-between`}>
                <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-zinc-400 tracking-wider uppercase">Active Peak 1RM ({activeExerciseName})</span>
                <div className="bg-rose-500/10 p-2 rounded-xl text-rose-500"><Dumbbell className="h-4 w-4" /></div>
                </div>
                <div className="mt-4 flex items-baseline gap-1.5">
                <span className="text-3xl font-black tracking-tight">{data.metrics.currentBeach1RM || '--'}</span>
                <span className="text-xs font-bold text-zinc-400">{unitLabel}</span>
                </div>
                </div>

                <div className={`${cardBg} rounded-2xl p-5 flex flex-col justify-between`}>
                <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-zinc-400 tracking-wider uppercase">All-Time Peak Strength Ceiling</span>
                <div className="bg-emerald-500/10 p-2 rounded-xl text-emerald-500"><Sparkles className="h-4 w-4" /></div>
                </div>
                <div className="mt-4 flex items-baseline gap-1.5">
                <span className="text-3xl font-black tracking-tight">{data.metrics.maxBench1RM || '--'}</span>
                <span className="text-xs font-bold text-zinc-400">{unitLabel}</span>
                </div>
                </div>
                </div>

                <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-5 min-h-0">
                <div className={`${cardBg} p-5 rounded-2xl flex flex-col h-[260px] lg:h-full`}>
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-4">Body Mass Parameter Tracking</h3>
                <div className="flex-1 min-h-0 w-full">
                <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.weightData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={isLight ? "#E4E4E7" : "#26262B"} vertical={false} />
                <XAxis dataKey="date" stroke="#71717A" fontSize={10} tickLine={false} />
                <YAxis stroke="#71717A" fontSize={10} tickLine={false} domain={['dataMin - 3', 'dataMax + 3']} />
                <Tooltip contentStyle={isLight ? { backgroundColor: '#fff', borderColor: '#E4E4E7' } : { backgroundColor: '#141417', borderColor: '#26262B', color: '#fff' }} />
                <Line type="monotone" dataKey="weight" stroke="#D97706" strokeWidth={3} dot={false} />
                </LineChart>
                </ResponsiveContainer>
                </div>
                </div>

                <div className={`${cardBg} p-5 rounded-2xl flex flex-col h-[260px] lg:h-full`}>
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-4">{activeExerciseName} Strength Trajectory</h3>
                <div className="flex-1 min-h-0 w-full">
                <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.selectedExerciseData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={isLight ? "#E4E4E7" : "#26262B"} vertical={false} />
                <XAxis dataKey="date" stroke="#71717A" fontSize={10} tickLine={false} />
                <YAxis stroke="#71717A" fontSize={10} tickLine={false} domain={['dataMin - 10', 'dataMax + 10']} />
                <Tooltip contentStyle={isLight ? { backgroundColor: '#fff', borderColor: '#E4E4E7' } : { backgroundColor: '#141417', borderColor: '#26262B', color: '#fff' }} />
                <Line type="monotone" dataKey="estimated_1rm" stroke="#E11D48" strokeWidth={3} dot={{ r: 4, strokeWidth: 0, fill: '#E11D48' }} />
                </LineChart>
                </ResponsiveContainer>
                </div>
                </div>
                </div>
                </div>
            )}

            {/* COMPONENT 2: ANALYTICS CURVE */}
            {activeMenu === 'analytics' && (
                <div className={`${cardBg} rounded-2xl p-5 h-full flex flex-col min-h-0 space-y-4`}>
                <div className="flex items-center justify-between shrink-0">
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Analytical Metric Dynamic Curve</h3>
                <select
                value={targetExercise}
                onChange={(e) => setTargetExercise(parseInt(e.target.value))}
                className={`border rounded-xl text-xs font-bold px-3 py-1.5 outline-none ${isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-[#1E1E22] border-[#26262B] text-white'}`}
                >
                {data.exercises.map(ex => <option key={ex.id} value={ex.id}>{ex.name}</option>)}
                </select>
                </div>
                <div className="flex-1 min-h-0 w-full">
                <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.selectedExerciseData}>
                <CartesianGrid strokeDasharray="3 3" stroke={isLight ? "#E4E4E7" : "#26262B"} />
                <XAxis dataKey="date" stroke="#71717A" fontSize={11} />
                <YAxis stroke="#71717A" fontSize={11} />
                <Tooltip contentStyle={isLight ? { backgroundColor: '#fff', borderColor: '#E4E4E7' } : { backgroundColor: '#141417', borderColor: '#26262B', color: '#fff' }} />
                <Line type="monotone" dataKey="estimated_1rm" name="Calculated Top 1RM" stroke="#E11D48" strokeWidth={3} dot={{ r: 5 }} />
                </LineChart>
                </ResponsiveContainer>
                </div>
                </div>
            )}

            {/* COMPONENT 3: PERSONAL BESTS */}
            {activeMenu === 'pbs' && (
                <div className="space-y-4">
                <div className="border-b border-zinc-200/60 dark:border-zinc-800 pb-3">
                <h3 className="text-sm font-bold uppercase tracking-wider">Absolute Performance Hall of Fame</h3>
                <p className="text-xs text-zinc-400 mt-0.5">Automatically tracked absolute metrics and calculated peak limits.</p>
                </div>
                {personalBests.length === 0 ? (
                    <div className={`${cardBg} rounded-2xl p-8 text-center text-zinc-400 text-xs`}>
                    No logs found. Add sets in the right parameters panel to log dynamic records.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {personalBests.map((pb) => (
                        <div key={pb.id} className={`${cardBg} rounded-2xl p-5 relative overflow-hidden group transition-all hover:border-amber-500/40`}>
                        <div className="absolute -right-3 -bottom-3 text-zinc-200/40 dark:text-zinc-800/20 group-hover:text-amber-500/5 transition-colors">
                        <Trophy className="h-24 w-24" />
                        </div>
                        <h4 className="text-sm font-black tracking-tight mb-3 border-b border-zinc-100 dark:border-zinc-800 pb-1.5">{pb.name}</h4>
                        <div className="space-y-2 relative z-10 text-xs">
                        <div className="flex justify-between items-center">
                        <span className="text-zinc-400">Peak Ground Weight:</span>
                        <span className={`font-bold px-2 py-0.5 rounded ${isLight ? 'bg-zinc-100 text-zinc-800' : 'bg-zinc-800 text-white'}`}>{pb.maxWeight} {unitLabel}</span>
                        </div>
                        <div className="flex justify-between items-center">
                        <span className="text-zinc-400">Calculated Max 1RM:</span>
                        <span className="font-black text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">{pb.max1RM} {unitLabel}</span>
                        </div>
                        <div className="flex justify-between items-center text-[10px] text-zinc-400 pt-1">
                        <span>Total Volume Register:</span>
                        <span>{pb.totalSets} complete sets</span>
                        </div>
                        </div>
                        </div>
                    ))}
                    </div>
                )}
                </div>
            )}

            {/* COMPONENT 4: PROGRESS PHOTOS */}
            {activeMenu === 'photos' && (
                <div className="space-y-6">
                <div className={`${cardBg} rounded-2xl p-5`}>
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-4">Log Progress Snapshot</h3>
                <form onSubmit={handleSavePhoto} className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs items-end">
                <div className="space-y-1.5">
                <label className="text-zinc-400 font-medium">Snapshot Date</label>
                <input type="date" value={photoDate} onChange={e => setPhotoDate(e.target.value)} className={`w-full border rounded-xl px-3 py-2 focus:outline-none ${isLight ? 'bg-zinc-50 border-zinc-200 text-zinc-900' : 'bg-[#1E1E22] border-[#26262B] text-white'}`} />
                </div>
                <div className="space-y-1.5">
                <label className="text-zinc-400 font-medium">Log Image File</label>
                <input type="file" accept="image/*" onChange={handlePhotoUpload} className="w-full text-zinc-400 file:mr-4 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-amber-500/10 file:text-amber-500 cursor-pointer" />
                </div>
                <div className="space-y-1.5">
                <label className="text-zinc-400 font-medium">Caption / Linked Workout Note</label>
                <input type="text" placeholder="Conditioning check following dynamic workout..." value={photoCaption} onChange={e => setPhotoCaption(e.target.value)} className={`w-full border rounded-xl px-3 py-2 focus:outline-none ${isLight ? 'bg-zinc-50 border-zinc-200 text-zinc-900' : 'bg-[#1E1E22] border-[#26262B] text-white'}`} />
                </div>
                <div className="md:col-span-3 flex justify-end pt-1">
                <button type="submit" disabled={!photoFile} className="bg-amber-500 disabled:opacity-40 text-black font-black text-xs px-5 py-2.5 rounded-xl transition-colors hover:bg-amber-400">
                Save Progression Photo
                </button>
                </div>
                </form>
                </div>

                <div className="space-y-3">
                <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Chronological Image Log Grid</h4>
                {photos.length === 0 ? (
                    <div className={`${cardBg} rounded-2xl p-10 text-center text-zinc-400 text-xs flex flex-col items-center justify-center gap-2`}>
                    <ImageIcon className="h-6 w-6 text-zinc-300" />
                    <span>No visual records logged yet. Upload progress snapshots above.</span>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {photos.map(p => (
                        <div key={p.id} className={`${cardBg} rounded-2xl overflow-hidden flex flex-col group`}>
                        <div className="relative aspect-[4/3] bg-zinc-950 overflow-hidden">
                        <img src={p.url} alt={p.caption} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        <button
                        onClick={() => handleDeletePhoto(p.id)}
                        className="absolute top-2 right-2 bg-black/60 hover:bg-rose-600 p-2 rounded-xl text-white transition-colors"
                        title="Delete snapshot"
                        >
                        <Trash2 className="h-3.5 w-3.5" />
                        </button>
                        <div className="absolute bottom-2 left-2 bg-black/70 px-2 py-0.5 rounded text-[10px] font-bold text-amber-400">
                        {p.date}
                        </div>
                        </div>
                        <div className="p-3.5 flex-1 bg-white dark:bg-[#141417]">
                        <p className="text-xs text-zinc-600 dark:text-zinc-300 font-medium line-clamp-2">{p.caption}</p>
                        </div>
                        </div>
                    ))}
                    </div>
                )}
                </div>
                </div>
            )}

            {/* COMPONENT 5: TIMELINE HISTORY */}
            {activeMenu === 'history' && (
                <div className={`${cardBg} rounded-2xl p-5 h-full flex flex-col min-h-0 space-y-4`}>
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Chronological Training Logs Matrix</h3>
                <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
                {Object.keys(groupedHistory).length === 0 ? (
                    <p className="text-zinc-400 text-center py-8">Timeline registers currently empty.</p>
                ) : (
                    Object.entries(groupedHistory).map(([date, sets]) => {
                        const isExpanded = expandedDays[date] !== false;
                        return (
                            <div key={date} className={`border rounded-xl overflow-hidden ${isLight ? 'border-zinc-200 bg-zinc-50/50' : 'border-zinc-800 bg-zinc-900/20'}`}>
                            <button
                            onClick={() => toggleDayExpansion(date)}
                            className={`w-full flex items-center justify-between p-3.5 transition-colors border-b font-bold ${isLight ? 'bg-zinc-100/80 hover:bg-zinc-200/50 border-zinc-200 text-zinc-800' : 'bg-[#1C1C21] hover:bg-zinc-800/60 border-zinc-800 text-zinc-200'}`}
                            >
                            <div className="flex items-center gap-3">
                            <span className={isLight ? 'text-zinc-900' : 'text-white'}>{date}</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${isLight ? 'bg-zinc-200 text-zinc-600' : 'bg-zinc-800 text-zinc-400'}`}>{sets.length} Sets Logged</span>
                            </div>
                            {isExpanded ? <ChevronDown className="h-4 w-4 text-zinc-400" /> : <ChevronRight className="h-4 w-4 text-zinc-400" />}
                            </button>

                            {isExpanded && (
                                <div className="p-2 space-y-1.5">
                                {sets.map(set => (
                                    <div key={set.id} className={`flex items-center justify-between p-3 border rounded-xl transition-all ${isLight ? 'bg-white border-zinc-200/80 hover:border-zinc-300' : 'bg-[#141417] border-zinc-800/60 hover:border-zinc-700'}`}>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 flex-1 items-center">
                                    <span className="font-bold">{set.exercise_name}</span>
                                    <span className="text-zinc-400 font-medium">{set.weight} {unitLabel} × {set.reps} Reps</span>
                                    <span className="text-rose-500 font-black text-[11px] sm:text-right">Est 1RM: {set.estimated_1rm} {unitLabel}</span>
                                    </div>
                                    <button
                                    onClick={async () => { if(confirm("Prune this set log parameter?")) { await deleteWorkoutSet(set.id); refreshData(); } }}
                                    className="text-zinc-400 hover:text-rose-500 p-2 rounded-lg hover:bg-rose-500/10 transition-colors ml-4"
                                    >
                                    <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                    </div>
                                ))}
                                </div>
                            )}
                            </div>
                        );
                    })
                )}
                </div>
                </div>
            )}

            {/* COMPONENT 6: CALCULATION SUITE */}
            {activeMenu === 'tools' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
                <div className={`${cardBg} rounded-2xl p-5 space-y-4`}>
                <div className="flex items-center gap-2 font-bold border-b pb-3 border-zinc-100 dark:border-zinc-800">
                <Calculator className="h-4 w-4 text-rose-500" />
                <span className="uppercase tracking-wider text-[11px] text-zinc-400">1RM Predictor Matrix</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                <label className="text-zinc-400 font-medium">Load Weight ({unitLabel})</label>
                <input type="number" value={calcWeight} onChange={e => setCalcWeight(e.target.value)} className={`w-full border rounded-xl px-3 py-2 ${isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-[#1E1E22] border-[#26262B] text-white'}`} />
                </div>
                <div className="space-y-1.5">
                <label className="text-zinc-400 font-medium">Repetitions Checked</label>
                <input type="number" value={calcReps} onChange={e => setCalcReps(e.target.value)} className={`w-full border rounded-xl px-3 py-2 ${isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-[#1E1E22] border-[#26262B] text-white'}`} />
                </div>
                </div>
                <div className="bg-rose-500/10 p-4 rounded-xl border border-rose-500/10 flex justify-between items-center">
                <span className="font-semibold text-rose-600 dark:text-rose-300">Estimated Absolute Peak</span>
                <span className="text-lg font-black text-rose-500">{computed1RM} {unitLabel}</span>
                </div>
                </div>

                <div className={`${cardBg} rounded-2xl p-5 space-y-4`}>
                <div className="flex items-center gap-2 font-bold border-b pb-3 border-zinc-100 dark:border-zinc-800">
                <Dumbbell className="h-4 w-4 text-emerald-500" />
                <span className="uppercase tracking-wider text-[11px] text-zinc-400">Barbell Load Blueprint</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                <label className="text-zinc-400 font-medium">Target Load ({unitLabel})</label>
                <input type="number" value={plateTarget} onChange={e => setPlateTarget(e.target.value)} className={`w-full border rounded-xl px-3 py-2 ${isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-[#1E1E22] border-[#26262B] text-white'}`} />
                </div>
                <div className="space-y-1.5">
                <label className="text-zinc-400 font-medium">Bar Core Mass</label>
                <input type="number" value={plateBar} onChange={e => setPlateBar(e.target.value)} className={`w-full border rounded-xl px-3 py-2 ${isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-[#1E1E22] border-[#26262B] text-white'}`} />
                </div>
                </div>
                <div className="bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/10 flex flex-col gap-2">
                <span className="font-semibold text-emerald-600 dark:text-emerald-300">Plates needed per side profile:</span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                {plateBreakdown.length === 0 ? <span className="text-zinc-400 text-[11px]">No plates required</span> : plateBreakdown.map((p, i) => (
                    <span key={i} className="bg-zinc-800 text-white px-2.5 py-1 rounded-md font-black text-[10px] border border-zinc-700">{p} {unitLabel}</span>
                ))}
                </div>
                </div>
                </div>

                <div className={`${cardBg} rounded-2xl p-5 space-y-4`}>
                <div className="flex items-center gap-2 font-bold border-b pb-3 border-zinc-100 dark:border-zinc-800">
                <Scale className="h-4 w-4 text-amber-500" />
                <span className="uppercase tracking-wider text-[11px] text-zinc-400">Body Mass Index Matrix</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                <label className="text-zinc-400 font-medium">Height ({data.settings.height_unit})</label>
                <input type="number" value={bmiHeight} onChange={e => setBmiHeight(e.target.value)} className={`w-full border rounded-xl px-3 py-2 ${isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-[#1E1E22] border-[#26262B] text-white'}`} />
                </div>
                <div className="space-y-1.5">
                <label className="text-zinc-400 font-medium">Weight ({unitLabel})</label>
                <input type="number" value={bmiWeight} onChange={e => setBmiWeight(e.target.value)} className={`w-full border rounded-xl px-3 py-2 ${isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-[#1E1E22] border-[#26262B] text-white'}`} />
                </div>
                </div>
                <div className="bg-amber-500/10 p-4 rounded-xl border border-amber-500/10 flex justify-between items-center">
                <span className="font-semibold text-amber-600 dark:text-amber-300">Calculated BMI Index Scalar</span>
                <span className="text-lg font-black text-amber-500">{computedBMI}</span>
                </div>
                </div>

                <div className={`${cardBg} rounded-2xl p-5 space-y-4`}>
                <div className="flex items-center gap-2 font-bold border-b pb-3 border-zinc-100 dark:border-zinc-800">
                <Sparkles className="h-4 w-4 text-purple-500" />
                <span className="uppercase tracking-wider text-[11px] text-zinc-400">TDEE Energy Coefficient</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                <label className="text-[10px] text-zinc-400">Age</label>
                <input type="number" value={tdeeAge} onChange={e => setTdeeAge(e.target.value)} className={`w-full border rounded-xl px-2 py-1.5 ${isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-[#1E1E22] border-[#26262B] text-white'}`} />
                </div>
                <div className="space-y-1">
                <label className="text-[10px] text-zinc-400">Gender</label>
                <select value={tdeeGender} onChange={e => setTdeeGender(e.target.value)} className={`w-full border rounded-xl px-2 py-1.5 outline-none ${isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-[#1E1E22] border-[#26262B] text-white'}`}>
                <option value="male">Male</option>
                <option value="female">Female</option>
                </select>
                </div>
                <div className="space-y-1">
                <label className="text-[10px] text-zinc-400">Activity Level</label>
                <select value={tdeeActivity} onChange={e => setTdeeActivity(e.target.value)} className={`w-full border rounded-xl px-1 py-1.5 outline-none ${isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-[#1E1E22] border-[#26262B] text-white'}`}>
                <option value="1.2">Sedentary</option>
                <option value="1.375">Light</option>
                <option value="1.55">Moderate</option>
                <option value="1.725">Heavy</option>
                </select>
                </div>
                </div>
                <div className="bg-purple-500/10 p-4 rounded-xl border border-purple-500/10 flex justify-between items-center">
                <span className="font-semibold text-purple-600 dark:text-purple-300">Daily Balance Limit</span>
                <span className="text-lg font-black text-purple-500">{computedTDEE} kcal</span>
                </div>
                </div>
                </div>
            )}

            {/* COMPONENT 7: SETTINGS PANEL */}
            {activeMenu === 'settings' && (
                <div className="space-y-6 max-w-4xl text-xs">

                <div className={`${cardBg} rounded-2xl p-6 space-y-4`}>
                <div>
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Automated Workspace Data Exports</h3>
                <p className="text-[11px] text-zinc-400 mt-1">Acquire an external spreadsheet snapshot of your logged body parameters and performance history logs.</p>
                </div>
                <div className="pt-2">
                <button
                onClick={exportToCSV}
                className={`inline-flex items-center justify-center gap-2.5 px-5 py-3 rounded-xl font-bold transition-all shadow-sm border
                    ${isLight ? 'bg-zinc-100 hover:bg-zinc-200 border-zinc-300 text-zinc-800' : 'bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-white'}`}
                    >
                    <Download className="h-4 w-4 text-amber-500" /> Export Performance Ledger (.CSV)
                    </button>
                    </div>
                    </div>

                    <div className={`${cardBg} rounded-2xl p-6 space-y-5`}>
                    <div>
                    <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Localization Parameter Standardizations</h3>
                    <p className="text-[11px] text-zinc-400 mt-1">Configure global structural units applied dynamically system-wide across all views.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-1">
                    <div className="space-y-2">
                    <label className="text-zinc-400 font-bold block">Weight Metric Scale</label>
                    <select
                    value={data.settings.weight_unit}
                    onChange={async (e) => { await updateSetting('weight_unit', e.target.value); refreshData(); }}
                    className={`w-full border rounded-xl px-3.5 py-3 font-semibold outline-none cursor-pointer ${isLight ? 'bg-zinc-50 border-zinc-200 text-zinc-800' : 'bg-[#1E1E22] border-[#26262B] text-zinc-200'}`}
                    >
                    <option value="kg">Metric System (kg)</option>
                    <option value="lbs">Imperial System (lbs)</option>
                    </select>
                    </div>

                    <div className="space-y-2">
                    <label className="text-zinc-400 font-bold block">Height Coordinates Scale</label>
                    <select
                    value={data.settings.height_unit}
                    onChange={async (e) => { await updateSetting('height_unit', e.target.value); refreshData(); }}
                    className={`w-full border rounded-xl px-3.5 py-3 font-semibold outline-none cursor-pointer ${isLight ? 'bg-zinc-50 border-zinc-200 text-zinc-800' : 'bg-[#1E1E22] border-[#26262B] text-zinc-200'}`}
                    >
                    <option value="cm">Centimeters Scale (cm)</option>
                    <option value="in">Inches Scale (in)</option>
                    </select>
                    </div>

                    <div className="space-y-2">
                    <label className="text-zinc-400 font-bold block">1RM Analytical Formula Curve</label>
                    <select
                    value={data.settings.one_rm_formula}
                    onChange={async (e) => { await updateSetting('one_rm_formula', e.target.value); refreshData(); }}
                    className={`w-full border rounded-xl px-3.5 py-3 font-semibold outline-none cursor-pointer ${isLight ? 'bg-zinc-50 border-zinc-200 text-zinc-800' : 'bg-[#1E1E22] border-[#26262B] text-zinc-200'}`}
                    >
                    <option value="brzycki">Brzycki Index Optimization (High Precision)</option>
                    <option value="epley">Epley Volumetric Formula Curve</option>
                    </select>
                    </div>
                    </div>
                    </div>

                    <div className={`${cardBg} rounded-2xl p-6 space-y-4`}>
                    <div>
                    <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Exercise Tracked Index Masterlist</h3>
                    <p className="text-[11px] text-zinc-400 mt-1">Append custom structural target exercise movements directly into selection entry list structures.</p>
                    </div>

                    <form onSubmit={handleCreateExercise} className="flex gap-3 max-w-xl pt-1">
                    <input
                    type="text"
                    placeholder="e.g. Incline Bench Press"
                    value={newExerciseName}
                    onChange={(e) => setNewExerciseName(e.target.value)}
                    className={`flex-1 border rounded-xl px-4 py-3 font-medium outline-none text-xs ${isLight ? 'bg-zinc-50 border-zinc-200 text-zinc-800' : 'bg-[#1E1E22] border-[#26262B] text-zinc-200'}`}
                    />
                    <button type="submit" className="bg-amber-500 text-black font-black text-xs px-5 py-3 rounded-xl hover:bg-amber-400 transition-colors shadow-sm shrink-0">
                    Register Exercise
                    </button>
                    </form>

                    <div className="pt-2">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-2">Registered Active Exercises ({data.exercises.length})</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-60 overflow-y-auto pr-1">
                    {data.exercises.map(ex => (
                        <div key={ex.id} className={`flex items-center justify-between p-3 border rounded-xl ${isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-[#1E1E22] border-zinc-800'}`}>
                        <span className="font-bold text-zinc-400 dark:text-zinc-300">{ex.name}</span>
                        <button
                        onClick={async () => { if(confirm(`Prune exercise "${ex.name}"? This action cascades and purges all logs linked here.`)) { await deleteExercise(ex.id); refreshData(); } }}
                        className="text-zinc-400 hover:text-rose-500 p-1.5 rounded-lg transition-colors"
                        >
                        <X className="h-4 w-4" />
                        </button>
                        </div>
                    ))}
                    </div>
                    </div>
                    </div>

                    </div>
            )}

            </div>
            </main>

            {/* 3. RIGHT ACTIVE CHARCOAL DATA ENTRY DECK PANEL */}
            {isRightPanelOpen && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 lg:hidden" onClick={() => setIsRightPanelOpen(false)} />
            )}
            <aside className={`
                fixed inset-y-0 right-0 z-50 w-[340px] bg-[#1E1E22] text-white p-6 flex flex-col justify-between border-l border-zinc-800/80 transition-transform duration-300 transform lg:pt-8 pt-20
                lg:relative lg:translate-x-0 lg:z-10 shrink-0 h-full
                ${isRightPanelOpen ? 'translate-x-0' : 'translate-x-full'}
                `}>
                <div className="flex items-center justify-between shrink-0 pb-3 border-b border-zinc-800/60">
                <div>
                <h2 className="text-sm font-black text-white uppercase tracking-wider">Enter Weight and Exercises</h2>
                <p className="text-[11px] text-zinc-500 mt-0.5">Register your current weight or fitness sets</p>
                </div>
                <button
                onClick={() => setIsRightPanelOpen(false)}
                className="p-1.5 bg-zinc-800 border border-zinc-700 rounded-xl text-zinc-400 hover:text-white transition-colors lg:hidden"
                >
                <X className="h-4 w-4" />
                </button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-5 py-4 text-xs pr-1">

                <div className="bg-[#141417] rounded-2xl p-4 border border-zinc-800/60 space-y-3.5 shadow-md">
                <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-amber-500">
                <Scale className="h-3.5 w-3.5" />
                <span>Body Weight Tracker</span>
                </div>
                <form onSubmit={handleWeightSubmit} className="space-y-3">
                <div className="space-y-1">
                <label className="text-zinc-500 font-semibold">Date</label>
                <input type="date" value={weightDate} onChange={(e) => setWeightDate(e.target.value)} className="w-full bg-[#1E1E22] border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500 transition-colors" />
                </div>
                <div className="space-y-1">
                <label className="text-zinc-500 font-semibold">Bodyweight ({unitLabel})</label>
                <input type="number" step="0.1" placeholder="e.g. 74.2" value={weightVal} onChange={(e) => setWeightVal(e.target.value)} className="w-full bg-[#1E1E22] border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500 transition-colors" />
                </div>
                <button type="submit" className="w-full bg-amber-500 hover:bg-amber-400 text-black font-black py-2.5 rounded-xl transition-colors tracking-wide uppercase text-[10px] shadow-md">
                Save Body Weight
                </button>
                </form>
                </div>

                <div className="bg-[#141417] rounded-2xl p-4 border border-zinc-800/60 space-y-3.5 shadow-md">
                <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-rose-500">
                <Dumbbell className="h-3.5 w-3.5" />
                <span>Exercise Tracker</span>
                </div>
                <form onSubmit={handleWorkoutSubmit} className="space-y-3">
                <div className="space-y-1">
                <label className="text-zinc-500 font-semibold">Exercise</label>
                <select
                value={logExerciseId}
                onChange={(e) => setLogExerciseId(e.target.value)}
                className="w-full bg-[#1E1E22] border border-zinc-800 rounded-xl px-2.5 py-2 text-white focus:outline-none focus:border-rose-500 transition-colors"
                >
                {data.exercises.map(ex => <option key={ex.id} value={ex.id}>{ex.name}</option>)}
                </select>
                </div>
                <div className="space-y-1">
                <label className="text-zinc-500 font-semibold">Date</label>
                <input type="date" value={workoutDate} onChange={(e) => setWorkoutDate(e.target.value)} className="w-full bg-[#1E1E22] border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500 transition-colors" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                <label className="text-zinc-500 font-semibold">Load ({unitLabel})</label>
                <input type="number" step="0.5" placeholder="85" value={benchWeight} onChange={(e) => setBenchWeight(e.target.value)} className="w-full bg-[#1E1E22] border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500 transition-colors" />
                </div>
                <div className="space-y-1">
                <label className="text-zinc-500 font-semibold">Repetitions</label>
                <input type="number" placeholder="5" value={benchReps} onChange={(e) => setBenchReps(e.target.value)} className="w-full bg-[#1E1E22] border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500 transition-colors" />
                </div>
                </div>
                <button type="submit" className="w-full bg-rose-500 hover:bg-rose-400 text-white font-black py-2.5 rounded-xl transition-colors tracking-wide uppercase text-[10px] shadow-md">
                Save Exercise
                </button>
                </form>
                </div>

                </div>

                <div className="pt-3.5 border-t border-zinc-800 shrink-0 flex items-center justify-between text-[10px] text-zinc-500 font-bold tracking-tight">
                <span>Trackerbuddy</span>
                <span className="text-zinc-400">by Billgoldbergmania</span>
                </div>
                </aside>

                {/* Right Sidebar Floating Access Button */}
                {!isRightPanelOpen && (
                    <button
                    onClick={() => setIsRightPanelOpen(true)}
                    className={`hidden lg:flex absolute right-0 top-1/2 transform -translate-y-1/2 p-1.5 rounded-l-xl border-l border-y z-10 transition-all shadow-md
                        ${isLight ? 'bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50' : 'bg-[#141417] border-zinc-800 text-white hover:bg-zinc-800'}`}
                        title="Open Data Input Deck"
                        >
                        <ChevronRight className="h-4 w-4 rotate-180 text-amber-500" />
                        </button>
                )}

                </div>
                </div>
            );
}

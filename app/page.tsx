'use client';

import React, { useState, useEffect, useRef } from 'react';
import type { WeightData, Exercise, WorkoutSet } from '../lib/actions';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import {
    Scale, Dumbbell, Sparkles, ArrowDown, ArrowUp, LayoutDashboard, BarChart3,
    History, Settings, Plus, X, Trash2, ChevronRight, ChevronDown, Wrench, Download,
    Calculator, Trophy, Camera, Menu, ImageIcon, Sun, Moon, Target, TrendingUp,
    Layers, Calendar, User, Zap, Bell, Timer, AlertTriangle, Flame, Ruler
} from 'lucide-react';

import { updateSetting } from '../lib/actions';
import {
    logWeight,
    deleteWeight,
    createExercise,
    deleteExercise,
    logWorkoutSet,
    deleteWorkoutSet,
    getDashboardData,
    getUsers,
    addUser,
    getWeightGoal,
    setWeightGoal as setWeightGoalAction,
    getUserProfile,
    updateUserProfile,
    getDefaultExercise,
    setDefaultExercise
} from '@/lib/actions-client';

import { getCurrentUserId, setCurrentUserId } from '@/lib/user-client';

import LeftSidebar from './components/LeftSidebar';
import MobileNav from './components/MobileNav';
import RightPanel from './components/RightPanel';
import DashboardView from './components/views/DashboardView';
import AnalyticsView from './components/views/AnalyticsView';
import PersonalBestsView from './components/views/PersonalBestsView';
import ProgressPhotosView from './components/views/ProgressPhotosView';
import HistoryView from './components/views/HistoryView';
import ToolsView from './components/views/ToolsView';
import SettingsView from './components/views/SettingsView';
import WorkoutsView from './components/views/WorkoutsView';

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
    const [historySearch, setHistorySearch] = useState('');

    const [theme, setTheme] = useState<'light' | 'dark'>('light');

    const [weightGoal, setWeightGoal] = useState<string>('');
    const [weightGoalInput, setWeightGoalInput] = useState('');

    const [panelWeightOpen, setPanelWeightOpen] = useState(true);
    const [panelExerciseOpen, setPanelExerciseOpen] = useState(true);

    const [profileAge, setProfileAge] = useState<string>('');
    const [profileGender, setProfileGender] = useState<string>('male');
    const [profileHeight, setProfileHeight] = useState<string>('');
    const [profileSaved, setProfileSaved] = useState(false);
    const [profileHeightCm, setProfileHeightCm] = useState<number | null>(null);
    const [profileGenderState, setProfileGenderState] = useState<string | null>(null);

    const [photos, setPhotos] = useState<ProgressPhoto[]>([]);
    const [photoDate, setPhotoDate] = useState(new Date().toISOString().split('T')[0]);
    const [photoCaption, setPhotoCaption] = useState('');
    const [photoFile, setPhotoFile] = useState<string | null>(null);

    const [data, setData] = useState<{
        weightData: WeightData[];
        exercises: Exercise[];
        selectedExerciseData: { date: string; estimated_1rm: number }[];
        fullHistoryFeed: WorkoutSet[];
        activeExerciseId: number;
        settings: { weight_unit: 'kg' | 'lbs'; height_unit: 'cm' | 'in'; one_rm_formula: 'brzycki' | 'epley' };
        metrics: { currentWeight: number; weightChange: number; currentBench1RM: number; maxBench1RM: number };
    } | null>(null);

    const [weightDate, setWeightDate] = useState(new Date().toISOString().split('T')[0]);
    const [weightVal, setWeightVal] = useState('');
    const [workoutDate, setWorkoutDate] = useState(new Date().toISOString().split('T')[0]);
    const [logExerciseId, setLogExerciseId] = useState<string>('');
    const [benchWeight, setBenchWeight] = useState('');
    const [benchReps, setBenchReps] = useState('');
    const [newExerciseName, setNewExerciseName] = useState('');

    const [calcWeight, setCalcWeight] = useState('100');
    const [calcReps, setCalcReps] = useState('5');
    const [plateTarget, setPlateTarget] = useState('100');
    const [plateBar, setPlateBar] = useState('20');
    const [bmiHeight, setBmiHeight] = useState(() => typeof window !== 'undefined' ? localStorage.getItem('tb_profile_height') || '180' : '180');
    const [bmiWeight, setBmiWeight] = useState('80');
    const [tdeeWeight, setTdeeWeight] = useState('80');
    const [tdeeHeight, setTdeeHeight] = useState(() => typeof window !== 'undefined' ? localStorage.getItem('tb_profile_height') || '180' : '180');
    const [tdeeAge, setTdeeAge] = useState(() => typeof window !== 'undefined' ? localStorage.getItem('tb_profile_age') || '25' : '25');
    const [tdeeGender, setTdeeGender] = useState(() => typeof window !== 'undefined' ? localStorage.getItem('tb_profile_gender') || 'male' : 'male');
    const [tdeeActivity, setTdeeActivity] = useState('1.55');

    const [currentUserName, setCurrentUserName] = useState<string>('');
    const initialized = useRef(false);

    // -------------------- Helper functions --------------------
    const refreshData = async (exerciseId?: number) => {
        const targetId = exerciseId !== undefined ? exerciseId : targetExercise;
        const res = await getDashboardData(targetId || undefined);
        setData(res);
        if (!logExerciseId && res.exercises.length > 0) {
            setLogExerciseId(res.exercises[0].id.toString());
        }
    };

    const refreshUserName = async () => {
        try {
            const users = await getUsers();
            const activeId = getCurrentUserId();
            const active = users.find(u => u.id === activeId);
            setCurrentUserName(active?.name || 'User');
        } catch (e) {
            console.error('Failed to load user name', e);
        }
    };

    // -------------------- Initial data load (once) --------------------
    useEffect(() => {
        if (initialized.current) return;
        initialized.current = true;

        const init = async () => {
            document.title = "Trackerbuddy";
            if (window.innerWidth < 1024) setIsRightPanelOpen(false);

            // Load user name
            await refreshUserName();

            // Load profile, weight goal, and default exercise in parallel
            const [profile, goal, defaultExId] = await Promise.all([
                getUserProfile(),
                                                                   getWeightGoal(),
                                                                   getDefaultExercise()
            ]);

            setProfileAge(profile.age?.toString() || '');
            setProfileGender(profile.gender || 'male');
            setProfileHeight(profile.height_cm?.toString() || '');
            setProfileHeightCm(profile.height_cm);
            setProfileGenderState(profile.gender);
            setWeightGoal(goal !== null ? goal.toString() : '');

            // Determine which exercise to show
            let targetId = defaultExId;
            if (!targetId) {
                // No default saved – we need to fetch exercises first
                const tempData = await getDashboardData(0); // temporary to get list
                if (tempData.exercises.length > 0) {
                    targetId = tempData.exercises[0].id;
                }
            }

            if (targetId && targetId !== 0) {
                setTargetExercise(targetId);
                const freshData = await getDashboardData(targetId);
                setData(freshData);
                if (freshData.exercises.length > 0) {
                    setLogExerciseId(freshData.exercises[0].id.toString()); // ← always set, not guarded
                }

            } else if (!targetId) {
                // still no exercises? just load empty data
                const emptyData = await getDashboardData(0);
                setData(emptyData);
            }
        };

        init();
    }, []);  // empty dependency array ensures it runs exactly once

    // -------------------- User switching (page reload) --------------------
    // The switch user handler in SettingsView triggers a page reload for simplicity.

    // -------------------- Event handlers (unchanged) --------------------
    const handleWeightSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!weightVal) return;
        await logWeight(weightDate, parseFloat(weightVal));
        setWeightVal('');
        await refreshData();
    };

    const handleDeleteWeight = async (date: string) => {
        if (!confirm('Remove this weight entry?')) return;
        try {
            await deleteWeight(date);
            await refreshData();
        } catch (err) {
            console.error('deleteWeight failed:', err);
            alert(`Delete failed: ${err instanceof Error ? err.message : String(err)}`);
        }
    };

    const handleSaveWeightGoal = async (e: React.FormEvent) => {
        e.preventDefault();
        const val = weightGoalInput.trim();
        if (!val) return;
        const goalNum = parseFloat(val);
        if (isNaN(goalNum)) return;
        try {
            await setWeightGoalAction(goalNum);
            setWeightGoal(val);
            setWeightGoalInput('');
        } catch (err) {
            console.error('Failed to save weight goal', err);
            alert('Failed to save weight goal');
        }
    };

    const handleWorkoutSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!benchWeight || !benchReps || !logExerciseId) return;
        await logWorkoutSet(workoutDate, parseInt(logExerciseId), parseFloat(benchWeight), parseInt(benchReps), data?.settings.one_rm_formula);
        setBenchWeight('');
        setBenchReps('');
        await refreshData();
    };

    const handleCreateExercise = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newExerciseName) return;
        await createExercise(newExerciseName);
        setNewExerciseName('');
        await refreshData();
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
            <span className="text-xs tracking-wider uppercase text-zinc-500">Loading Trackerbuddy Engine...</span>
            </div>
            </div>
        );
    }

    // --- Computed values (same as before) ---
    const activeExerciseName = data.exercises.find(e => e.id === targetExercise)?.name || 'Exercise';
    const activeExerciseSets = data.fullHistoryFeed.filter(s =>
    s.exercise_id === targetExercise || s.exercise_name?.toLowerCase() === activeExerciseName?.toLowerCase()
    );
    const realMax1RMSets = activeExerciseSets.filter(s => s.reps === 1);
    const maxExercise1RM = realMax1RMSets.length > 0 ? Math.round(Math.max(...realMax1RMSets.map(s => s.weight)) * 10) / 10 : 0;
    const totalVolumeLifted = activeExerciseSets.reduce((sum, s) => sum + (s.weight * s.reps), 0);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const weeklyVolumeLifted = activeExerciseSets.filter(s => new Date(s.date) >= sevenDaysAgo).reduce((sum, s) => sum + (s.weight * s.reps), 0);
    const exerciseFrequencyMap = data.fullHistoryFeed.reduce((acc, s) => {
        acc[s.exercise_name] = (acc[s.exercise_name] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);
    const sortedExercisePopularity = Object.entries(exerciseFrequencyMap).sort((a, b) => b[1] - a[1]).map(entry => entry[0]);
    const exercisePopularityRank = sortedExercisePopularity.indexOf(activeExerciseName) + 1;
    const groupedHistory = data.fullHistoryFeed.reduce((acc, set) => {
        if (!acc[set.date]) acc[set.date] = [];
        acc[set.date].push(set);
        return acc;
    }, {} as Record<string, WorkoutSet[]>);
    const personalBests = data.exercises.map(ex => {
        const setsForExercise = data.fullHistoryFeed.filter(s => s.exercise_id === ex.id || s.exercise_name?.toLowerCase() === ex.name?.toLowerCase());
        if (setsForExercise.length === 0) return { ...ex, maxWeight: 0, max1RM: 0, totalSets: 0 };
        const real1RMSets = setsForExercise.filter(s => s.reps === 1);
        return {
            ...ex,
            maxWeight: Math.max(...setsForExercise.map(s => s.weight)),
                                             max1RM: real1RMSets.length > 0 ? Math.max(...real1RMSets.map(s => s.weight)) : 0,
                                             totalSets: setsForExercise.length
        };
    }).filter(ex => ex.totalSets > 0);
    const isLbs = data.settings.weight_unit === 'lbs';
    const unitLabel = isLbs ? 'lbs' : 'kg';
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
    const isLight = theme === 'light';
    const cardBg = isLight ? 'bg-white border-zinc-200/80 shadow-sm' : 'bg-[#141417] border-[#26262B] shadow-xl';
    const mainStageBg = isLight ? 'bg-[#FAF9F6]' : 'bg-[#0F0F11]';
    const mainText = isLight ? 'text-zinc-900' : 'text-[#E4E4E7]';

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'workouts', label: 'Workouts', icon: Dumbbell },
        { id: 'pbs', label: 'Personal Bests', icon: Trophy },
        { id: 'photos', label: 'Progression Pictures', icon: Camera },
        { id: 'analytics', label: 'Analytics', icon: BarChart3 },
        { id: 'history', label: 'History', icon: History },
        { id: 'tools', label: 'Tools', icon: Wrench },
    ];

    return (
        <div className={`flex h-screen w-screen ${mainStageBg} ${mainText} font-sans antialiased overflow-hidden`}>
        <LeftSidebar
        menuItems={menuItems}
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
        isLight={isLight}
        theme={theme}
        setTheme={setTheme}
        isRightPanelOpen={isRightPanelOpen}
        setIsRightPanelOpen={setIsRightPanelOpen}
        />

        <div className="flex-1 flex overflow-hidden relative pt-16 md:pt-0">
        <main className="flex-1 flex flex-col h-full overflow-hidden p-4 md:p-8 space-y-6">
        {/* Desktop top bar */}
        <div className="hidden md:flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
        <div>
        <div className="flex items-center gap-2 text-xl font-black tracking-tighter uppercase">
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-400">TRACKER</span>
        <span className="text-amber-500">BUDDY</span>
        <span className="text-zinc-300 dark:text-zinc-800 font-light mx-1">/</span>
        <h1 className="text-zinc-400 dark:text-zinc-500 font-bold tracking-widest text-base self-center">{activeMenu.toUpperCase()}</h1>
        </div>
        <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 mt-1">your personal weight & performance telemetry platform</p>
        </div>
        <div className="flex items-center gap-1.5 ml-3">
        <User className="h-3.5 w-3.5 text-amber-500" />
        <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">{currentUserName}</span>
        </div>
        </div>
        {(activeMenu === 'dashboard' || activeMenu === 'analytics') && data.exercises.length > 0 && (
            <select
            value={targetExercise}
            onChange={async (e) => {
                const id = parseInt(e.target.value);
                setTargetExercise(id);
                await refreshData(id);
            }}
            className={`border rounded-xl text-xs font-bold px-4 py-2 text-zinc-700 outline-none cursor-pointer ${isLight ? 'bg-white border-zinc-200' : 'bg-[#141417] border-[#26262B] text-zinc-200'}`}
            >
            {data.exercises.map(ex => <option key={ex.id} value={ex.id}>{ex.name}</option>)}
            </select>
        )}
        </div>

        {/* Mobile exercise selector */}
        {(activeMenu === 'dashboard' || activeMenu === 'analytics') && data.exercises.length > 0 && (
            <div className="md:hidden shrink-0">
            <select
            value={targetExercise}
            onChange={async (e) => {
                const id = parseInt(e.target.value);
                setTargetExercise(id);
                await refreshData(id);
            }}
            className={`w-full border rounded-xl text-xs font-bold px-4 py-2.5 outline-none cursor-pointer ${isLight ? 'bg-white border-zinc-200 text-zinc-700' : 'bg-[#141417] border-[#26262B] text-zinc-200'}`}
            >
            {data.exercises.map(ex => <option key={ex.id} value={ex.id}>{ex.name}</option>)}
            </select>
            </div>
        )}

        <div className="flex-1 min-h-0 overflow-y-auto pr-1">
        {activeMenu === 'dashboard' && (
            <DashboardView
            data={data}
            unitLabel={unitLabel}
            cardBg={cardBg}
            isLight={isLight}
            activeExerciseName={activeExerciseName}
            maxExercise1RM={maxExercise1RM}
            exercisePopularityRank={exercisePopularityRank}
            heightCm={profileHeightCm}
            gender={profileGenderState}
            />
        )}
        {activeMenu === 'analytics' && (
            <AnalyticsView
            data={data}
            activeExerciseName={activeExerciseName}
            totalVolumeLifted={totalVolumeLifted}
            weeklyVolumeLifted={weeklyVolumeLifted}
            maxExercise1RM={maxExercise1RM}
            exercisePopularityRank={exercisePopularityRank}
            cardBg={cardBg}
            isLight={isLight}
            />
        )}
        {activeMenu === 'pbs' && (
            <PersonalBestsView
            personalBests={personalBests}
            unitLabel={unitLabel}
            cardBg={cardBg}
            />
        )}
        {activeMenu === 'photos' && (
            <ProgressPhotosView
            cardBg={cardBg}
            isLight={isLight}
            />
        )}
        {activeMenu === 'history' && (
            <HistoryView
            data={data}
            expandedDays={expandedDays}
            toggleDayExpansion={toggleDayExpansion}
            historySearch={historySearch}
            setHistorySearch={setHistorySearch}
            handleDeleteWeight={handleDeleteWeight}
            unitLabel={unitLabel}
            deleteWorkoutSet={deleteWorkoutSet}
            refreshData={refreshData}
            cardBg={cardBg}
            isLight={isLight}
            />
        )}
        {activeMenu === 'tools' && (
            <ToolsView
            unitLabel={unitLabel}
            settings={data.settings}
            isLight={isLight}
            calcWeight={calcWeight}
            setCalcWeight={setCalcWeight}
            calcReps={calcReps}
            setCalcReps={setCalcReps}
            computed1RM={computed1RM}
            plateTarget={plateTarget}
            setPlateTarget={setPlateTarget}
            plateBar={plateBar}
            setPlateBar={setPlateBar}
            plateBreakdown={plateBreakdown}
            bmiHeight={bmiHeight}
            setBmiHeight={setBmiHeight}
            bmiWeight={bmiWeight}
            setBmiWeight={setBmiWeight}
            computedBMI={computedBMI}
            tdeeWeight={tdeeWeight}
            setTdeeWeight={setTdeeWeight}
            tdeeHeight={tdeeHeight}
            setTdeeHeight={setTdeeHeight}
            tdeeAge={tdeeAge}
            setTdeeAge={setTdeeAge}
            tdeeGender={tdeeGender}
            setTdeeGender={setTdeeGender}
            tdeeActivity={tdeeActivity}
            setTdeeActivity={setTdeeActivity}
            computedTDEE={computedTDEE}
            cardBg={cardBg}
            />
        )}
        {activeMenu === 'workouts' && (
            <WorkoutsView
            cardBg={cardBg}
            isLight={isLight}
            exercises={data.exercises}
            />
        )}
        {activeMenu === 'settings' && (
            <SettingsView
            theme={theme}
            setTheme={setTheme}
            isLight={isLight}
            data={data}
            refreshData={refreshData}
            refreshUserName={refreshUserName}
            exportToCSV={exportToCSV}
            profileAge={profileAge}
            setProfileAge={setProfileAge}
            profileGender={profileGender}
            setProfileGender={setProfileGender}
            profileHeight={profileHeight}
            setProfileHeight={setProfileHeight}
            profileSaved={profileSaved}
            setProfileSaved={setProfileSaved}
            newExerciseName={newExerciseName}
            setNewExerciseName={setNewExerciseName}
            handleCreateExercise={handleCreateExercise}
            deleteExercise={deleteExercise}
            weightGoal={weightGoal}
            setWeightGoal={setWeightGoal}
            unitLabel={unitLabel}
            tdeeAge={tdeeAge}
            setTdeeAge={setTdeeAge}
            tdeeGender={tdeeGender}
            setTdeeGender={setTdeeGender}
            tdeeHeight={tdeeHeight}
            setTdeeHeight={setTdeeHeight}
            cardBg={cardBg}
            />
        )}
        </div>
        </main>

        <RightPanel
        isRightPanelOpen={isRightPanelOpen}
        setIsRightPanelOpen={setIsRightPanelOpen}
        panelWeightOpen={panelWeightOpen}
        setPanelWeightOpen={setPanelWeightOpen}
        panelExerciseOpen={panelExerciseOpen}
        setPanelExerciseOpen={setPanelExerciseOpen}
        weightDate={weightDate}
        setWeightDate={setWeightDate}
        weightVal={weightVal}
        setWeightVal={setWeightVal}
        handleWeightSubmit={handleWeightSubmit}
        weightGoal={weightGoal}
        weightGoalInput={weightGoalInput}
        setWeightGoalInput={setWeightGoalInput}
        handleSaveWeightGoal={handleSaveWeightGoal}
        unitLabel={unitLabel}
        data={data}
        logExerciseId={logExerciseId}
        setLogExerciseId={setLogExerciseId}
        workoutDate={workoutDate}
        setWorkoutDate={setWorkoutDate}
        benchWeight={benchWeight}
        setBenchWeight={setBenchWeight}
        benchReps={benchReps}
        setBenchReps={setBenchReps}
        handleWorkoutSubmit={handleWorkoutSubmit}
        />

        {!isRightPanelOpen && (
            <button
            onClick={() => setIsRightPanelOpen(true)}
            className={`hidden lg:flex absolute right-0 top-1/2 transform -translate-y-1/2 p-2 rounded-l-xl border-l border-y z-10 transition-all shadow-md
                ${isLight ? 'bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50' : 'bg-[#141417] border-zinc-800 text-white hover:bg-zinc-800'}`}
                title="Open Metric Engine Panel"
                >
                <ChevronRight className="h-4 w-4 rotate-180 text-amber-500" />
                </button>
        )}
        </div>

        <MobileNav
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        isRightPanelOpen={isRightPanelOpen}
        setIsRightPanelOpen={setIsRightPanelOpen}
        theme={theme}
        setTheme={setTheme}
        isLight={isLight}
        menuItems={menuItems}
        currentUserName={currentUserName}
        />
        </div>
    );
}

import React from 'react';
import { Scale, Dumbbell, X, Target, ChevronDown } from 'lucide-react';

interface RightPanelProps {
    isRightPanelOpen: boolean;
    setIsRightPanelOpen: (open: boolean) => void;
    panelWeightOpen: boolean;
    setPanelWeightOpen: (open: boolean) => void;
    panelExerciseOpen: boolean;
    setPanelExerciseOpen: (open: boolean) => void;
    weightDate: string;
    setWeightDate: (date: string) => void;
    weightVal: string;
    setWeightVal: (val: string) => void;
    handleWeightSubmit: (e: React.FormEvent) => void;
    weightGoal: string;
    weightGoalInput: string;
    setWeightGoalInput: (val: string) => void;
    handleSaveWeightGoal: (e: React.FormEvent) => void;
    unitLabel: string;
    data: any; // full data object
    logExerciseId: string;
    setLogExerciseId: (id: string) => void;
    workoutDate: string;
    setWorkoutDate: (date: string) => void;
    benchWeight: string;
    setBenchWeight: (val: string) => void;
    benchReps: string;
    setBenchReps: (val: string) => void;
    handleWorkoutSubmit: (e: React.FormEvent) => void;
}

export default function RightPanel({
    isRightPanelOpen,
    setIsRightPanelOpen,
    panelWeightOpen,
    setPanelWeightOpen,
    panelExerciseOpen,
    setPanelExerciseOpen,
    weightDate,
    setWeightDate,
    weightVal,
    setWeightVal,
    handleWeightSubmit,
    weightGoal,
    weightGoalInput,
    setWeightGoalInput,
    handleSaveWeightGoal,
    unitLabel,
    data,
    logExerciseId,
    setLogExerciseId,
    workoutDate,
    setWorkoutDate,
    benchWeight,
    setBenchWeight,
    benchReps,
    setBenchReps,
    handleWorkoutSubmit
}: RightPanelProps) {
    const currentWeight = data.weightData.length > 0 ? data.weightData[data.weightData.length - 1].weight : null;
    const goal = parseFloat(weightGoal);
    const hasGoal = !isNaN(goal) && goal > 0;
    const progress = hasGoal && currentWeight ? Math.min(100, Math.max(0, (() => {
        const startWeight = data.weightData.length > 1 ? data.weightData[0].weight : currentWeight;
        const total = Math.abs(goal - startWeight);
        const done = Math.abs(currentWeight - startWeight);
        return total > 0 ? (done / total) * 100 : 100;
    })())) : 0;

    return (
        <>
        {/* Overlay for mobile */}
        {isRightPanelOpen && (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 lg:hidden" onClick={() => setIsRightPanelOpen(false)} />
        )}
        <aside className={`
            fixed inset-y-0 right-0 z-50 bg-[#1E1E22] text-white flex flex-col border-zinc-800/80 transition-all duration-300 ease-in-out h-full
            lg:relative lg:inset-auto lg:z-10
            ${isRightPanelOpen
                ? 'translate-x-0 w-[340px] border-l opacity-100'
    : 'translate-x-full lg:translate-x-0 w-0 p-0 opacity-0 overflow-hidden border-l-0'}
    `}>
    <div className="flex flex-col h-full p-6 pt-20 lg:pt-6 min-h-0">
    <div className="flex items-center justify-between shrink-0 pb-3 border-b border-zinc-800/60">
    <div>
    <h2 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
    <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
    METRICS LOG ENGINE
    </h2>
    <p className="text-[10px] text-zinc-500 font-mono uppercase mt-0.5">telemetry commit port</p>
    </div>
    <button
    onClick={() => setIsRightPanelOpen(false)}
    className="p-1.5 bg-zinc-800 border border-zinc-700 rounded-xl text-zinc-400 hover:text-white transition-colors lg:hidden"
    >
    <X className="h-4 w-4" />
    </button>
    </div>

    <div className="flex-1 overflow-y-auto space-y-3 py-4 text-xs pr-1">
    {/* Body weight tracker */}
    <div className="bg-[#141417] rounded-2xl border border-zinc-800/60 shadow-md overflow-hidden">
    <button
    onClick={() => setPanelWeightOpen(v => !v)}
    className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-zinc-800/30 transition-colors"
    >
    <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-amber-500">
    <Scale className="h-3.5 w-3.5" />
    <span>Body Weight Tracker</span>
    </div>
    <ChevronDown className={`h-3.5 w-3.5 text-zinc-500 transition-transform duration-200 ${panelWeightOpen ? '' : '-rotate-90'}`} />
    </button>

    {panelWeightOpen && (
        <div className="px-4 pb-4 space-y-3.5 border-t border-zinc-800/40 pt-3.5">
        {/* Weight goal */}
        <div className="space-y-2">
        <div className="flex items-center justify-between">
        <label className="text-zinc-500 font-semibold flex items-center gap-1">
        <Target className="h-3 w-3 text-amber-500" /> Weight Goal ({unitLabel})
        </label>
        {hasGoal && (
            <button onClick={() => { localStorage.removeItem('trackerbuddy_weight_goal'); window.location.reload(); }} className="text-zinc-600 hover:text-rose-500 transition-colors">
            <X className="h-3 w-3" />
            </button>
        )}
        </div>
        {hasGoal ? (
            <div className="space-y-1.5">
            <div className="flex justify-between text-[10px]">
            <span className="text-zinc-500">{currentWeight ?? '--'} {unitLabel}</span>
            <span className="text-amber-500 font-bold">{goal} {unitLabel}</span>
            </div>
            <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-amber-500 to-orange-400 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
            <p className="text-[10px] text-zinc-600 text-right">{Math.round(progress)}% to goal</p>
            </div>
        ) : (
            <form onSubmit={handleSaveWeightGoal} className="flex gap-2">
            <input type="number" step="0.1" placeholder={`Target (${unitLabel})`} value={weightGoalInput} onChange={e => setWeightGoalInput(e.target.value)} className="flex-1 bg-[#1E1E22] border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500 transition-colors placeholder:text-zinc-700" />
            <button type="submit" className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-500 font-black px-3 py-2 rounded-xl transition-colors shrink-0 border border-amber-500/20">
            <Target className="h-3.5 w-3.5" />
            </button>
            </form>
        )}
        </div>

        {/* Log new weight */}
        <form onSubmit={handleWeightSubmit} className="space-y-2.5">
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
    )}
    </div>

    {/* Exercise tracker */}
    <div className="bg-[#141417] rounded-2xl border border-zinc-800/60 shadow-md overflow-hidden">
    <button
    onClick={() => setPanelExerciseOpen(v => !v)}
    className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-zinc-800/30 transition-colors"
    >
    <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-rose-500">
    <Dumbbell className="h-3.5 w-3.5" />
    <span>Exercise Tracker</span>
    </div>
    <ChevronDown className={`h-3.5 w-3.5 text-zinc-500 transition-transform duration-200 ${panelExerciseOpen ? '' : '-rotate-90'}`} />
    </button>

    {panelExerciseOpen && (
        <div className="px-4 pb-4 space-y-3 border-t border-zinc-800/40 pt-3.5">
        <form onSubmit={handleWorkoutSubmit} className="space-y-3">
        <div className="space-y-1">
        <label className="text-zinc-500 font-semibold">Exercise</label>
        <select
        value={logExerciseId}
        onChange={(e) => setLogExerciseId(e.target.value)}
        className="w-full bg-[#1E1E22] border border-zinc-800 rounded-xl px-2.5 py-2 text-white focus:outline-none focus:border-rose-500 transition-colors"
        >
        {data.exercises.map((ex: any) => <option key={ex.id} value={ex.id}>{ex.name}</option>)}
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
        <label className="text-zinc-500 font-semibold">Reps</label>
        <input type="number" placeholder="5" value={benchReps} onChange={(e) => setBenchReps(e.target.value)} className="w-full bg-[#1E1E22] border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500 transition-colors" />
        </div>
        </div>
        <button type="submit" className="w-full bg-rose-500 hover:bg-rose-400 text-white font-black py-2.5 rounded-xl transition-colors tracking-wide uppercase text-[10px] shadow-md">
        Save Exercise
        </button>
        </form>
        </div>
    )}
    </div>

    {/* Bottom brand card */}
    <div className="hidden xl:block pt-2">
    <div className="relative overflow-hidden rounded-2xl bg-zinc-950 p-5 border border-zinc-800/50 select-none group">
    <div className="flex flex-col tracking-tighter leading-none font-black uppercase">
    <span className="text-zinc-800 text-[28px] transition-colors duration-300 group-hover:text-zinc-700">RAW.</span>
    <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 font-black tracking-tight text-[38px] my-0.5">HEAVY.</span>
    <span className="text-zinc-600/30 text-[26px] tracking-normal line-through decoration-rose-500/40 decoration-2">LIMITLESS.</span>
    </div>
    <div className="mt-4 flex items-center justify-between text-[9px] text-zinc-600 font-mono tracking-wider uppercase border-t border-zinc-800/40 pt-3">
    <span>PERFORMANCE MODULE</span>
    <span className="text-emerald-500 font-bold flex items-center gap-1">
    <span className="h-1 w-1 rounded-full bg-emerald-500 animate-ping" />
    CONNECTED
    </span>
    </div>
    </div>
    </div>

    <div className="pt-1 flex items-center justify-between text-[10px] text-zinc-700 font-mono tracking-tight shrink-0">
    <span>TRACKERBUDDY</span>
    <span>BY BILLGOLDBERGMANIA</span>
    </div>
    </div>
    </div>
    </aside>
    </>
    );
}

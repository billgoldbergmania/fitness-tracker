'use client';

import React, { useEffect } from 'react';
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
    data: any;
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
    useEffect(() => {
        if (isRightPanelOpen && window.innerWidth < 1024) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isRightPanelOpen]);

    const currentWeight = data.weightData.length > 0 ? data.weightData[data.weightData.length - 1].weight : null;
    const goal = parseFloat(weightGoal);
    const hasGoal = !isNaN(goal) && goal > 0;
    const progress = hasGoal && currentWeight ? Math.min(100, Math.max(0, (() => {
        const startWeight = data.weightData.length > 1 ? data.weightData[0].weight : currentWeight;
        const total = Math.abs(goal - startWeight);
        const done = Math.abs(currentWeight - startWeight);
        return total > 0 ? (done / total) * 100 : 100;
    })())) : 0;

    // Fixed dark styles – no light mode
    const panelBg = 'bg-[#1E1E22]';
    const textColor = 'text-white';
    const borderColor = 'border-zinc-800/80';
    const cardBg = 'bg-[#141417]';
    const cardBorder = 'border-zinc-800/60';
    const inputBg = 'bg-[#1E1E22] border-zinc-800 text-white';
    const labelColor = 'text-zinc-500';

    return (
        <>
        {isRightPanelOpen && (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 lg:hidden" onClick={() => setIsRightPanelOpen(false)} />
        )}
        <aside className={`
            fixed inset-y-0 right-0 z-50 flex flex-col transition-all duration-300 ease-in-out
            lg:relative lg:inset-auto lg:z-10 h-full
            ${isRightPanelOpen
                ? 'translate-x-0 w-[340px] border-l opacity-100'
    : 'translate-x-full lg:translate-x-0 w-0 p-0 opacity-0 overflow-hidden border-l-0'}
    ${panelBg} ${textColor} ${borderColor}
    `}>
    <div className="flex flex-col h-full min-h-0 overflow-y-auto">
    <div className="flex-1 px-5 py-5 space-y-5">
    {/* Header */}
    <div className="flex items-center justify-between shrink-0 pb-2 border-b ${borderColor}">
    <div>
    <h2 className="text-[11px] font-black uppercase tracking-widest flex items-center gap-2">
    <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
    <span className="text-white">METRICS LOG ENGINE</span>
    </h2>
    <p className="text-[9px] text-zinc-500 font-mono uppercase mt-0.5">telemetry commit port</p>
    </div>
    <button
    onClick={() => setIsRightPanelOpen(false)}
    className="p-1.5 rounded-xl border bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-white"
    >
    <X className="h-3.5 w-3.5" />
    </button>
    </div>

    {/* Body Weight Tracker */}
    <div className={`rounded-xl border shadow-md overflow-hidden ${cardBg} ${cardBorder}`}>
    <button
    onClick={() => setPanelWeightOpen(!panelWeightOpen)}
    className="w-full flex items-center justify-between px-3 py-2.5 transition-colors hover:bg-zinc-800/30"
    >
    <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-amber-500 text-[10px]">
    <Scale className="h-3.5 w-3.5" />
    <span>Body Weight Tracker</span>
    </div>
    <ChevronDown className={`h-3 w-3 text-zinc-500 transition-transform duration-200 ${panelWeightOpen ? '' : '-rotate-90'}`} />
    </button>

    {panelWeightOpen && (
        <div className={`px-3 pb-3 space-y-3 border-t pt-3 ${borderColor}`}>
        {/* Weight goal */}
        <div className="space-y-1.5">
        <div className="flex items-center justify-between">
        <label className={`font-semibold flex items-center gap-1 text-[10px] ${labelColor}`}>
        <Target className="h-3 w-3 text-amber-500" /> Weight Goal ({unitLabel})
        </label>
        {hasGoal && (
            <button onClick={() => { localStorage.removeItem('trackerbuddy_weight_goal'); window.location.reload(); }} className="text-zinc-600 hover:text-rose-500">
            <X className="h-3 w-3" />
            </button>
        )}
        </div>
        {hasGoal ? (
            <div className="space-y-1">
            <div className="flex justify-between text-[9px]">
            <span className="text-zinc-500">{currentWeight ?? '--'} {unitLabel}</span>
            <span className="text-amber-500 font-bold">{goal} {unitLabel}</span>
            </div>
            <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-amber-500 to-orange-400 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
            <p className="text-[9px] text-zinc-600 text-right">{Math.round(progress)}% to goal</p>
            </div>
        ) : (
            <form onSubmit={handleSaveWeightGoal} className="flex gap-2">
            <input type="number" step="0.1" placeholder={`Target (${unitLabel})`} value={weightGoalInput} onChange={e => setWeightGoalInput(e.target.value)} className={`flex-1 rounded-lg px-2 py-1.5 text-[10px] focus:outline-none focus:border-amber-500 ${inputBg}`} />
            <button type="submit" className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-500 font-black px-3 py-1.5 rounded-lg text-[10px]">
            <Target className="h-3 w-3" />
            </button>
            </form>
        )}
        </div>

        {/* Log new weight */}
        <form onSubmit={handleWeightSubmit} className="space-y-2">
        <div className="space-y-0.5">
        <label className={`font-semibold text-[10px] ${labelColor}`}>Date</label>
        <input type="date" value={weightDate} onChange={(e) => setWeightDate(e.target.value)} className={`w-full rounded-lg px-2 py-1.5 text-[10px] ${inputBg}`} />
        </div>
        <div className="space-y-0.5">
        <label className={`font-semibold text-[10px] ${labelColor}`}>Bodyweight ({unitLabel})</label>
        <input type="number" step="0.1" placeholder="e.g. 74.2" value={weightVal} onChange={(e) => setWeightVal(e.target.value)} className={`w-full rounded-lg px-2 py-1.5 text-[10px] ${inputBg}`} />
        </div>
        <button type="submit" className="w-full bg-amber-500 hover:bg-amber-400 text-black font-black py-2 rounded-lg text-[10px] tracking-wide uppercase shadow-md">
        Save Body Weight
        </button>
        </form>
        </div>
    )}
    </div>

    {/* Exercise Tracker */}
    <div className={`rounded-xl border shadow-md overflow-hidden ${cardBg} ${cardBorder}`}>
    <button
    onClick={() => setPanelExerciseOpen(!panelExerciseOpen)}
    className="w-full flex items-center justify-between px-3 py-2.5 transition-colors hover:bg-zinc-800/30"
    >
    <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-rose-500 text-[10px]">
    <Dumbbell className="h-3.5 w-3.5" />
    <span>Exercise Tracker</span>
    </div>
    <ChevronDown className={`h-3 w-3 text-zinc-500 transition-transform duration-200 ${panelExerciseOpen ? '' : '-rotate-90'}`} />
    </button>

    {panelExerciseOpen && (
        <div className={`px-3 pb-3 space-y-3 border-t pt-3 ${borderColor}`}>
        <form onSubmit={handleWorkoutSubmit} className="space-y-2.5">
        <div className="space-y-0.5">
        <label className={`font-semibold text-[10px] ${labelColor}`}>Exercise</label>
        <select
        value={logExerciseId}
        onChange={(e) => setLogExerciseId(e.target.value)}
        className={`w-full rounded-lg px-2 py-1.5 text-[10px] ${inputBg}`}
        >
        {data.exercises.map((ex: any) => <option key={ex.id} value={ex.id}>{ex.name}</option>)}
        </select>
        </div>
        <div className="space-y-0.5">
        <label className={`font-semibold text-[10px] ${labelColor}`}>Date</label>
        <input type="date" value={workoutDate} onChange={(e) => setWorkoutDate(e.target.value)} className={`w-full rounded-lg px-2 py-1.5 text-[10px] ${inputBg}`} />
        </div>
        <div className="grid grid-cols-2 gap-2">
        <div className="space-y-0.5">
        <label className={`font-semibold text-[10px] ${labelColor}`}>Load ({unitLabel})</label>
        <input type="number" step="0.5" placeholder="85" value={benchWeight} onChange={(e) => setBenchWeight(e.target.value)} className={`w-full rounded-lg px-2 py-1.5 text-[10px] ${inputBg}`} />
        </div>
        <div className="space-y-0.5">
        <label className={`font-semibold text-[10px] ${labelColor}`}>Reps</label>
        <input type="number" placeholder="5" value={benchReps} onChange={(e) => setBenchReps(e.target.value)} className={`w-full rounded-lg px-2 py-1.5 text-[10px] ${inputBg}`} />
        </div>
        </div>
        <button type="submit" className="w-full bg-rose-500 hover:bg-rose-400 text-white font-black py-2 rounded-lg text-[10px] tracking-wide uppercase shadow-md">
        Save Exercise
        </button>
        </form>
        </div>
    )}
    </div>

    {/* Footer */}
    <div className={`pt-2 flex items-center justify-between text-[9px] text-zinc-500 font-mono tracking-tight border-t pt-3 ${borderColor}`}>
    <span>TRACKERBUDDY</span>
    <span>BY BILLGOLDBERGMANIA</span>
    </div>
    </div>
    </div>
    </aside>
    </>
    );
}

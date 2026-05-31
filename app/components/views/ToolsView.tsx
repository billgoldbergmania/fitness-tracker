import React from 'react';
import { Calculator, Dumbbell, Scale, Sparkles } from 'lucide-react';

interface ToolsViewProps {
    unitLabel: string;
    settings: { weight_unit: 'kg' | 'lbs'; height_unit: 'cm' | 'in'; one_rm_formula: string };
    isLight: boolean;
    calcWeight: string;
    setCalcWeight: (val: string) => void;
    calcReps: string;
    setCalcReps: (val: string) => void;
    computed1RM: number;
    plateTarget: string;
    setPlateTarget: (val: string) => void;
    plateBar: string;
    setPlateBar: (val: string) => void;
    plateBreakdown: number[];
    bmiHeight: string;
    setBmiHeight: (val: string) => void;
    bmiWeight: string;
    setBmiWeight: (val: string) => void;
    computedBMI: number;
    tdeeWeight: string;
    setTdeeWeight: (val: string) => void;
    tdeeHeight: string;
    setTdeeHeight: (val: string) => void;
    tdeeAge: string;
    setTdeeAge: (val: string) => void;
    tdeeGender: string;
    setTdeeGender: (val: string) => void;
    tdeeActivity: string;
    setTdeeActivity: (val: string) => void;
    computedTDEE: number;
    cardBg: string;
}

export default function ToolsView({
    unitLabel,
    settings,
    isLight,
    calcWeight,
    setCalcWeight,
    calcReps,
    setCalcReps,
    computed1RM,
    plateTarget,
    setPlateTarget,
    plateBar,
    setPlateBar,
    plateBreakdown,
    bmiHeight,
    setBmiHeight,
    bmiWeight,
    setBmiWeight,
    computedBMI,
    tdeeWeight,
    setTdeeWeight,
    tdeeHeight,
    setTdeeHeight,
    tdeeAge,
    setTdeeAge,
    tdeeGender,
    setTdeeGender,
    tdeeActivity,
    setTdeeActivity,
    computedTDEE,
    cardBg
}: ToolsViewProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
        {/* 1RM Predictor */}
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

        {/* Barbell Load Blueprint */}
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

        {/* BMI Calculator */}
        <div className={`${cardBg} rounded-2xl p-5 space-y-4`}>
        <div className="flex items-center gap-2 font-bold border-b pb-3 border-zinc-100 dark:border-zinc-800">
        <Scale className="h-4 w-4 text-amber-500" />
        <span className="uppercase tracking-wider text-[11px] text-zinc-400">Body Mass Index Matrix</span>
        </div>
        <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
        <label className="text-zinc-400 font-medium">Height ({settings.height_unit})</label>
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

        {/* TDEE Calculator */}
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
    );
}

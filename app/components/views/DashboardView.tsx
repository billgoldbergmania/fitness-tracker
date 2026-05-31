import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Scale, Trophy, TrendingUp, ArrowDown, ArrowUp, Activity, Quote } from 'lucide-react';

interface DashboardViewProps {
    data: any;
    unitLabel: string;
    cardBg: string;
    isLight: boolean;
    activeExerciseName: string;
    maxExercise1RM: number;
    exercisePopularityRank: number;
    heightCm: number | null;
    gender: string | null;
}

const motivationalQuotes = [
    "The only bad workout is the one that didn't happen.",
"Strength does not come from the body. It comes from the will.",
"You don't have to be extreme, just consistent.",
"The weight doesn't care who's lifting it, only that it's lifted.",
"Your body can stand almost anything. It's your mind you have to convince.",
"Small daily improvements are the key to staggering long-term results.",
"The pain you feel today will be the strength you feel tomorrow.",
"Discipline is the bridge between goals and accomplishment.",
"Make every rep count. Half reps = half results.",
"The only easy day was yesterday.",
"Don't count the days, make the days count.",
"Strive for progress, not perfection.",
"You are stronger than you think.",
"The bar never lies. Put in the work.",
"Rest when you're tired, not when you're done.",
"Train insane or remain the same.",
"Success is the sum of small efforts, repeated day in and day out.",
"It's not about being the best. It's about being better than you were yesterday.",
"The harder you work, the harder it is to surrender.",
"Don't stop when it hurts. Stop when you're done."
];

export default function DashboardView({
    data,
    unitLabel,
    cardBg,
    isLight,
    activeExerciseName,
    maxExercise1RM,
    exercisePopularityRank,
    heightCm,
    gender
}: DashboardViewProps) {
    const currentWeight = data.weightData.length > 0 ? data.weightData[data.weightData.length - 1].weight : null;

    let bmi = null;
    let bmiCategory = '';
    let explanation = '';
    if (currentWeight && heightCm && heightCm > 0) {
        const heightM = heightCm / 100;
        bmi = currentWeight / (heightM * heightM);
        bmi = Math.round(bmi * 10) / 10;
        if (bmi < 18.5) bmiCategory = 'Underweight';
        else if (bmi < 25) bmiCategory = 'Normal weight';
        else if (bmi < 30) bmiCategory = 'Overweight';
        else bmiCategory = 'Obese';
        explanation = `For athletes, BMI may overestimate body fat due to muscle mass. Use this as a rough guide.`;
    }

    let pbDate = '';
    if (maxExercise1RM > 0) {
        const pbSet = data.fullHistoryFeed.find(
            (s: any) => s.exercise_name === activeExerciseName && s.reps === 1 && s.weight === maxExercise1RM
        );
        if (pbSet) pbDate = pbSet.date;
    }

    const today = new Date();
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
    const quote = motivationalQuotes[dayOfYear % motivationalQuotes.length];

    return (
        <div className="space-y-4">
        {/* Row 1: Metric cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className={`${cardBg} rounded-2xl p-3 flex flex-col justify-between`}>
        <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold text-zinc-400 tracking-wider uppercase">Body Mass Vector</span>
        <div className="bg-amber-500/10 p-1.5 rounded-xl text-amber-500"><Scale className="h-3.5 w-3.5" /></div>
        </div>
        <div className="mt-2 flex items-baseline gap-1.5">
        <span className="text-2xl font-black tracking-tight">{currentWeight ?? '--'}</span>
        <span className="text-xs font-bold text-zinc-400">{unitLabel}</span>
        <div className="ml-2">
        {data.metrics.weightChange <= 0 ? (
            <span className="text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded-md text-[10px] font-black flex items-center gap-0.5">
            <ArrowDown className="h-2.5 w-2.5" /> {Math.abs(data.metrics.weightChange)} {unitLabel}
            </span>
        ) : (
            <span className="text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded-md text-[10px] font-black flex items-center gap-0.5">
            <ArrowUp className="h-2.5 w-2.5" /> +{data.metrics.weightChange} {unitLabel}
            </span>
        )}
        </div>
        </div>
        </div>

        <div className={`${cardBg} rounded-2xl p-3 flex flex-col justify-between`}>
        <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold text-zinc-400 tracking-wider uppercase">Personal Best 1RM ({activeExerciseName})</span>
        <div className="bg-amber-500/10 p-1.5 rounded-xl text-amber-500"><Trophy className="h-3.5 w-3.5" /></div>
        </div>
        <div className="mt-2 flex items-baseline gap-1.5">
        <span className="text-2xl font-black tracking-tight">{maxExercise1RM || '—'}</span>
        <span className="text-xs font-bold text-zinc-400">{unitLabel}</span>
        </div>
        </div>

        <div className={`${cardBg} rounded-2xl p-3 flex flex-col justify-between`}>
        <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold text-zinc-400 tracking-wider uppercase">Exercise Volume Rank</span>
        <div className="bg-purple-500/10 p-1.5 rounded-xl text-purple-500"><TrendingUp className="h-3.5 w-3.5" /></div>
        </div>
        <div className="mt-2 flex items-baseline gap-1.5">
        <span className="text-2xl font-black tracking-tight">#{exercisePopularityRank || '—'}</span>
        <span className="text-xs font-bold text-zinc-400">of {data.exercises.length}</span>
        </div>
        </div>
        </div>

        {/* Row 2: Two charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className={`${cardBg} p-3 rounded-2xl`}>
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">Body Mass Parameter Tracking</h3>
        <div className="h-52 w-full">
        <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data.weightData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={isLight ? "#E4E4E7" : "#26262B"} vertical={false} />
        <XAxis dataKey="date" stroke="#71717A" fontSize={9} tickLine={false} />
        <YAxis stroke="#71717A" fontSize={9} tickLine={false} domain={['dataMin - 3', 'dataMax + 3']} />
        <Tooltip contentStyle={isLight ? { backgroundColor: '#fff', borderColor: '#E4E4E7' } : { backgroundColor: '#141417', borderColor: '#26262B', color: '#fff' }} />
        <Line type="monotone" dataKey="weight" stroke="#D97706" strokeWidth={2} dot={false} />
        </LineChart>
        </ResponsiveContainer>
        </div>
        </div>

        <div className={`${cardBg} p-3 rounded-2xl`}>
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">{activeExerciseName} Strength Trajectory</h3>
        <div className="h-52 w-full">
        <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data.selectedExerciseData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={isLight ? "#E4E4E7" : "#26262B"} vertical={false} />
        <XAxis dataKey="date" stroke="#71717A" fontSize={9} tickLine={false} />
        <YAxis stroke="#71717A" fontSize={9} tickLine={false} domain={['dataMin - 10', 'dataMax + 10']} />
        <Tooltip contentStyle={isLight ? { backgroundColor: '#fff', borderColor: '#E4E4E7' } : { backgroundColor: '#141417', borderColor: '#26262B', color: '#fff' }} />
        <Line type="monotone" dataKey="estimated_1rm" stroke="#E11D48" strokeWidth={2} dot={{ r: 3, fill: '#E11D48' }} />
        </LineChart>
        </ResponsiveContainer>
        </div>
        </div>
        </div>

        {/* Row 3: Two info cards + Quote (full width) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* BMI Card */}
        <div className={`${cardBg} rounded-2xl p-3 flex flex-col`}>
        <div className="flex items-center gap-2 mb-1">
        <Activity className="h-3.5 w-3.5 text-emerald-500" />
        <h3 className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Current BMI</h3>
        </div>
        {bmi !== null ? (
            <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black tracking-tight">{bmi}</span>
            <span className="text-[11px] text-zinc-400">{bmiCategory}</span>
            </div>
        ) : (
            <div className="text-zinc-400 text-xs">Set height in Settings</div>
        )}
        <div className="mt-2 text-[10px] text-zinc-500 leading-relaxed border-t border-zinc-100 dark:border-zinc-800 pt-2">
        {explanation || "BMI uses weight and height. For athletes, muscle mass may skew results."}
        </div>
        </div>

        {/* PB Card */}
        <div className={`${cardBg} rounded-2xl p-3 flex flex-col`}>
        <div className="flex items-center gap-2 mb-1">
        <Trophy className="h-3.5 w-3.5 text-amber-500" />
        <h3 className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">{activeExerciseName} – Peak</h3>
        </div>
        {maxExercise1RM > 0 ? (
            <>
            <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black tracking-tight">{maxExercise1RM}</span>
            <span className="text-xs text-zinc-400">{unitLabel}</span>
            {pbDate && <span className="text-[9px] text-zinc-400 ml-1">{pbDate}</span>}
            </div>
            <div className="mt-2 text-[10px] text-zinc-500 leading-relaxed border-t border-zinc-100 dark:border-zinc-800 pt-2">
            Heaviest single repetition logged.
            </div>
            </>
        ) : (
            <div className="text-zinc-400 text-xs">Log a 1‑rep set to see your true max.</div>
        )}
        </div>
        </div>

        {/* Full-width Quote Card at bottom */}
        <div className={`${cardBg} rounded-2xl p-3 flex flex-col`}>
        <div className="flex items-start gap-2">
        <Quote className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs italic text-zinc-600 dark:text-zinc-300 leading-relaxed">“{quote}”</p>
        </div>
        <div className="mt-1 text-[9px] text-right text-zinc-400">— daily dose</div>
        </div>
        </div>
    );
}

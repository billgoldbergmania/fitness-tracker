import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Scale, Trophy, TrendingUp, ArrowDown, ArrowUp } from 'lucide-react';

interface DashboardViewProps {
    data: any;
    unitLabel: string;
    cardBg: string;
    isLight: boolean;
    activeExerciseName: string;
    maxExercise1RM: number;
    exercisePopularityRank: number;
}

export default function DashboardView({
    data,
    unitLabel,
    cardBg,
    isLight,
    activeExerciseName,
    maxExercise1RM,
    exercisePopularityRank
}: DashboardViewProps) {
    return (
        <div className="h-full flex flex-col space-y-6 min-h-0">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 shrink-0">
        <div className={`${cardBg} rounded-2xl p-5 flex flex-col justify-between`}>
        <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold text-zinc-400 tracking-wider uppercase">Body Mass Vector</span>
        <div className="bg-amber-500/10 p-2 rounded-xl text-amber-500"><Scale className="h-4 w-4" /></div>
        </div>
        <div className="mt-4 flex items-baseline gap-1.5">
        <span className="text-3xl font-black tracking-tight">{data.weightData.length > 0 ? data.weightData[data.weightData.length - 1].weight : '--'}</span>
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
        <span className="text-[10px] font-bold text-zinc-400 tracking-wider uppercase">Personal Best 1RM ({activeExerciseName})</span>
        <div className="bg-amber-500/10 p-2 rounded-xl text-amber-500"><Trophy className="h-4 w-4" /></div>
        </div>
        <div className="mt-4 flex items-baseline gap-1.5">
        <span className="text-3xl font-black tracking-tight">{maxExercise1RM || '--'}</span>
        <span className="text-xs font-bold text-zinc-400">{unitLabel}</span>
        </div>
        </div>

        <div className={`${cardBg} rounded-2xl p-5 flex flex-col justify-between`}>
        <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold text-zinc-400 tracking-wider uppercase">Exercise Volume Rank</span>
        <div className="bg-purple-500/10 p-2 rounded-xl text-purple-500"><TrendingUp className="h-4 w-4" /></div>
        </div>
        <div className="mt-4 flex items-baseline gap-1.5">
        <span className="text-3xl font-black tracking-tight">#{exercisePopularityRank || '--'}</span>
        <span className="text-xs font-bold text-zinc-400">of {data.exercises.length}</span>
        </div>
        </div>
        </div>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-5 min-h-0">
        <div className={`${cardBg} p-5 rounded-2xl flex flex-col h-72 lg:h-full`}>
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-4">Body Mass Parameter Tracking</h3>
        <div className="h-64 w-full">
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

        <div className={`${cardBg} p-5 rounded-2xl flex flex-col h-72 lg:h-full`}>
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-4">{activeExerciseName} Strength Trajectory</h3>
        <div className="h-64 w-full">
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
    );
}

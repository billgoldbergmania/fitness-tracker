import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Layers, Calendar, TrendingUp, Trophy } from 'lucide-react';

interface AnalyticsViewProps {
    data: any;
    activeExerciseName: string;
    totalVolumeLifted: number;
    weeklyVolumeLifted: number;
    maxExercise1RM: number;
    exercisePopularityRank: number;
    cardBg: string;
    isLight: boolean;
}

export default function AnalyticsView({
    data,
    activeExerciseName,
    totalVolumeLifted,
    weeklyVolumeLifted,
    maxExercise1RM,
    exercisePopularityRank,
    cardBg,
    isLight
}: AnalyticsViewProps) {
    return (
        <div className="h-full flex flex-col space-y-6 min-h-0">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 shrink-0 text-xs">
        <div className={`${cardBg} rounded-2xl p-4 flex flex-col justify-between`}>
        <div className="flex items-center justify-between text-zinc-400">
        <span className="font-bold uppercase tracking-wider text-[10px]">Total Tonnage Lifted</span>
        <Layers className="h-4 w-4 text-amber-500" />
        </div>
        <div className="mt-2">
        <span className="text-2xl font-black">{totalVolumeLifted.toLocaleString()}</span>
        <span className="text-[10px] text-zinc-400 ml-1 font-bold uppercase">kg</span>
        </div>
        </div>

        <div className={`${cardBg} rounded-2xl p-4 flex flex-col justify-between`}>
        <div className="flex items-center justify-between text-zinc-400">
        <span className="font-bold uppercase tracking-wider text-[10px]">Weekly Workload (7d)</span>
        <Calendar className="h-4 w-4 text-emerald-500" />
        </div>
        <div className="mt-2">
        <span className="text-2xl font-black">{weeklyVolumeLifted.toLocaleString()}</span>
        <span className="text-[10px] text-zinc-400 ml-1 font-bold uppercase">kg</span>
        </div>
        </div>

        <div className={`${cardBg} rounded-2xl p-4 flex flex-col justify-between`}>
        <div className="flex items-center justify-between text-zinc-400">
        <span className="font-bold uppercase tracking-wider text-[10px]">Peak 1RM (Real)</span>
        <TrendingUp className="h-4 w-4 text-rose-500" />
        </div>
        <div className="mt-2">
        <span className="text-2xl font-black">{maxExercise1RM || '--'}</span>
        <span className="text-[10px] text-zinc-400 ml-1 font-bold uppercase">kg</span>
        </div>
        </div>

        <div className={`${cardBg} rounded-2xl p-4 flex flex-col justify-between`}>
        <div className="flex items-center justify-between text-zinc-400">
        <span className="font-bold uppercase tracking-wider text-[10px]">Exercise Volume Rank</span>
        <Trophy className="h-4 w-4 text-purple-500" />
        </div>
        <div className="mt-2">
        <span className="text-2xl font-black">#{exercisePopularityRank || '--'}</span>
        <span className="text-[10px] text-zinc-400 ml-1 font-medium">out of {data.exercises.length}</span>
        </div>
        </div>
        </div>

        <div className={`${cardBg} rounded-2xl p-5 flex-1 flex flex-col min-h-[300px]`}>
        <div className="mb-4">
        <h3 className="text-xs font-black text-zinc-400 uppercase tracking-wider">Analytical Metric Dynamic Curve ({activeExerciseName})</h3>
        <p className="text-[10px] text-zinc-400 mt-0.5">Visual representation of calculated performance increments over historical data parameters.</p>
        </div>
        <div className="h-64 lg:flex-1 w-full style={{ minHeight: 200 }}">
        <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data.selectedExerciseData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={isLight ? "#E4E4E7" : "#26262B"} />
        <XAxis dataKey="date" stroke="#71717A" fontSize={11} />
        <YAxis stroke="#71717A" fontSize={11} />
        <Tooltip contentStyle={isLight ? { backgroundColor: '#fff', borderColor: '#E4E4E7' } : { backgroundColor: '#141417', borderColor: '#26262B', color: '#fff' }} />
        <Line type="monotone" dataKey="estimated_1rm" name="Tracked 1RM" stroke="#E11D48" strokeWidth={3} dot={{ r: 5 }} />
        </LineChart>
        </ResponsiveContainer>
        </div>
        </div>
        </div>
    );
}

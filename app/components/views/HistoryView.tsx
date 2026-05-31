import React from 'react';
import { Scale, Dumbbell, Trash2, ChevronRight, ChevronDown } from 'lucide-react';

interface WorkoutSet {
    id: number;
    date: string;
    exercise_name: string;
    weight: number;
    reps: number;
    estimated_1rm?: number;
}

interface HistoryViewProps {
    data: any;
    expandedDays: Record<string, boolean>;
    toggleDayExpansion: (day: string) => void;
    historySearch: string;
    setHistorySearch: (search: string) => void;
    handleDeleteWeight: (date: string) => void;
    unitLabel: string;
    deleteWorkoutSet: (id: number) => Promise<void>;
    refreshData: () => void;
    cardBg: string;
    isLight: boolean;
}

export default function HistoryView({
    data,
    expandedDays,
    toggleDayExpansion,
    historySearch,
    setHistorySearch,
    handleDeleteWeight,
    unitLabel,
    deleteWorkoutSet,
    refreshData,
    cardBg,
    isLight
}: HistoryViewProps) {
    const groupedHistory = data.fullHistoryFeed.reduce((acc: Record<string, WorkoutSet[]>, set: WorkoutSet) => {
        if (!acc[set.date]) acc[set.date] = [];
        acc[set.date].push(set);
        return acc;
    }, {});

    return (
        <div className="space-y-4 h-full flex flex-col min-h-0">
        {/* Weight log */}
        <div className={`${cardBg} rounded-2xl overflow-hidden shrink-0`}>
        <div className={`flex items-center gap-2 p-4 border-b ${isLight ? 'border-zinc-100' : 'border-zinc-800/60'}`}>
        <Scale className="h-3.5 w-3.5 text-amber-500" />
        <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Weight Log</span>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${isLight ? 'bg-zinc-100 text-zinc-500' : 'bg-zinc-800 text-zinc-400'}`}>{data.weightData.length} entries</span>
        </div>
        {data.weightData.length === 0 ? (
            <p className="text-zinc-400 text-center py-6 text-xs">No weight logs yet.</p>
        ) : (
            <div className="max-h-64 overflow-y-auto text-xs">
            {(() => {
                const byMonth: Record<string, any[]> = {};
                [...data.weightData].reverse().forEach((w: any) => {
                    const month = w.date.slice(0, 7);
                    if (!byMonth[month]) byMonth[month] = [];
                    byMonth[month].push(w);
                });
                return Object.entries(byMonth).map(([month, entries]) => {
                    const isMonthExpanded = expandedDays[`wt-${month}`] === true;
                    const monthLabel = new Date(month + '-01').toLocaleString('default', { month: 'long', year: 'numeric' });
                    return (
                        <div key={`wt-${month}`} className={`border-b last:border-b-0 ${isLight ? 'border-zinc-100' : 'border-zinc-800/40'}`}>
                        <button
                        onClick={() => toggleDayExpansion(`wt-${month}`)}
                        className={`w-full flex items-center justify-between px-4 py-3 font-bold transition-colors ${isLight ? 'hover:bg-zinc-50 text-zinc-800' : 'hover:bg-zinc-800/20 text-zinc-200'}`}
                        >
                        <div className="flex items-center gap-3">
                        <span>{monthLabel}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${isLight ? 'bg-zinc-100 text-zinc-500' : 'bg-zinc-800 text-zinc-400'}`}>{entries.length} entries</span>
                        </div>
                        {isMonthExpanded ? <ChevronDown className="h-3.5 w-3.5 text-zinc-400" /> : <ChevronRight className="h-3.5 w-3.5 text-zinc-400" />}
                        </button>
                        {isMonthExpanded && (
                            <div className={`divide-y ${isLight ? 'divide-zinc-100' : 'divide-zinc-800/40'}`}>
                            {entries.map((w: any) => (
                                <div key={`weight-${w.date}`} className={`flex items-center justify-between px-6 py-2.5 group ${isLight ? 'hover:bg-zinc-50' : 'hover:bg-zinc-800/20'}`}>
                                <span className={`font-mono ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>{w.date}</span>
                                <div className="flex items-center gap-3">
                                <span className="font-black text-amber-500">{w.weight} {unitLabel}</span>
                                <button
                                onClick={() => handleDeleteWeight(w.date)}
                                className="p-1.5 rounded-lg transition-colors text-zinc-400 hover:text-rose-500 hover:bg-rose-500/10 opacity-0 group-hover:opacity-100"
                                title="Delete entry"
                                >
                                <Trash2 className="h-3 w-3" />
                                </button>
                                </div>
                                </div>
                            ))}
                            </div>
                        )}
                        </div>
                    );
                });
            })()}
            </div>
        )}
        </div>

        {/* Workout sets */}
        <div className={`${cardBg} rounded-2xl p-4 flex flex-col flex-1 min-h-0 space-y-3`}>
        <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
        <Dumbbell className="h-3.5 w-3.5 text-rose-500" />
        <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Workout Sets</span>
        </div>
        <input
        value={historySearch}
        onChange={e => setHistorySearch(e.target.value)}
        placeholder="Search exercise..."
        className={`text-xs border rounded-xl px-3 py-1.5 w-40 focus:outline-none focus:border-amber-500 transition-colors ${isLight ? 'bg-zinc-50 border-zinc-200 text-zinc-800 placeholder:text-zinc-400' : 'bg-[#1E1E22] border-zinc-700 text-white placeholder:text-zinc-600'}`}
        />
        </div>
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 text-xs">
        {(() => {
            const q = historySearch.toLowerCase().trim();
            const filteredHistory = Object.entries(groupedHistory)
            .map(([date, sets]) => {
                const filtered = q ? sets.filter(s => s.exercise_name?.toLowerCase().includes(q)) : sets;
                return [date, filtered] as [string, WorkoutSet[]];
            })
            .filter(([, sets]) => sets.length > 0)
            .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime());

            if (filteredHistory.length === 0) return (
                <p className="text-zinc-400 text-center py-8">{q ? 'No results found.' : 'Timeline registers currently empty.'}</p>
            );

            return filteredHistory.map(([date, sets]) => {
                const isExpanded = expandedDays[date] === true;
                return (
                    <div key={date} className={`border rounded-xl overflow-hidden ${isLight ? 'border-zinc-200 bg-zinc-50/50' : 'border-zinc-800 bg-zinc-900/20'}`}>
                    <button
                    onClick={() => toggleDayExpansion(date)}
                    className={`w-full flex items-center justify-between p-3.5 transition-colors font-bold ${isLight ? 'bg-zinc-100/80 hover:bg-zinc-200/50 text-zinc-800' : 'bg-[#1C1C21] hover:bg-zinc-800/60 text-zinc-200'}`}
                    >
                    <div className="flex items-center gap-3">
                    <span className={isLight ? 'text-zinc-900' : 'text-white'}>{date}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${isLight ? 'bg-zinc-200 text-zinc-600' : 'bg-zinc-800 text-zinc-400'}`}>{sets.length} sets</span>
                    </div>
                    {isExpanded ? <ChevronDown className="h-4 w-4 text-zinc-400" /> : <ChevronRight className="h-4 w-4 text-zinc-400" />}
                    </button>
                    {isExpanded && (
                        <div className="p-2 space-y-1.5">
                        {sets.map(set => (
                            <div key={set.id} className={`flex items-center justify-between p-3 border rounded-xl transition-all ${isLight ? 'bg-white border-zinc-200/80 hover:border-zinc-300' : 'bg-[#141417] border-zinc-800/60 hover:border-zinc-700'}`}>
                            <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                            <span className="font-bold truncate">{set.exercise_name}</span>
                            <span className="text-zinc-400">{set.weight} {unitLabel} × {set.reps} reps</span>
                            </div>
                            <button
                            onClick={async () => { if(confirm('Remove this set?')) { await deleteWorkoutSet(set.id); refreshData(); } }}
                            className="text-zinc-400 hover:text-rose-500 p-2 rounded-lg hover:bg-rose-500/10 transition-colors ml-3 shrink-0"
                            >
                            <Trash2 className="h-3.5 w-3.5" />
                            </button>
                            </div>
                        ))}
                        </div>
                    )}
                    </div>
                );
            });
        })()}
        </div>
        </div>
        </div>
    );
}

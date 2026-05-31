import React from 'react';
import { Trophy } from 'lucide-react';

interface PersonalBest {
    id: number;
    name: string;
    maxWeight: number;
    max1RM: number;
    totalSets: number;
}

interface PersonalBestsViewProps {
    personalBests: PersonalBest[];
    unitLabel: string;
    cardBg: string;
}

export default function PersonalBestsView({ personalBests, unitLabel, cardBg }: PersonalBestsViewProps) {
    return (
        <div className="space-y-4">
        <div className="border-b border-zinc-200/60 dark:border-zinc-800 pb-3">
        <h3 className="text-sm font-black uppercase tracking-wider">Absolute Performance Hall of Fame</h3>
        <p className="text-xs text-zinc-400 mt-0.5">Automatically tracked metrics and calculated peak limits.</p>
        </div>
        {personalBests.length === 0 ? (
            <div className={`${cardBg} rounded-2xl p-8 text-center text-zinc-400 text-xs`}>
            No logs found. Add sets in the right parameters panel to log records.
            </div>
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {personalBests.map((pb) => (
                <div key={pb.id} className={`${cardBg} rounded-2xl p-5 relative overflow-hidden group transition-all hover:border-amber-500/40 flex flex-col justify-between min-h-[180px]`}>
                <div className="absolute -right-3 -bottom-3 text-zinc-200/40 dark:text-zinc-800/10 group-hover:text-amber-500/5 transition-colors pointer-events-none">
                <Trophy className="h-28 w-28" />
                </div>
                <div className="relative z-10">
                <h4 className="text-sm font-black uppercase tracking-wider text-zinc-800 dark:text-zinc-200 border-b border-zinc-100 dark:border-zinc-800/80 pb-2 mb-4">{pb.name}</h4>
                {pb.max1RM ? (
                    <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-amber-500 tracking-wider uppercase block">Peak 1RM</span>
                    <div className="flex items-baseline gap-1.5">
                    <span className="text-5xl font-black font-mono tracking-tight text-amber-500">{Math.round(pb.max1RM * 10) / 10}</span>
                    <span className="text-sm font-bold text-amber-500 uppercase">{unitLabel}</span>
                    </div>
                    </div>
                ) : (
                    <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-zinc-400 tracking-wider uppercase block">Max Weight Lifted</span>
                    <div className="flex items-baseline gap-1.5">
                    <span className="text-5xl font-black font-mono tracking-tight text-zinc-500">{pb.maxWeight}</span>
                    <span className="text-sm font-bold text-zinc-400 uppercase">{unitLabel}</span>
                    </div>
                    <span className="text-[10px] text-zinc-400 mt-1 block">No 1-rep sets logged yet</span>
                    </div>
                )}
                </div>
                <div className="flex justify-between items-center text-[10px] text-zinc-400 font-mono border-t border-zinc-100 dark:border-zinc-800/60 pt-3 mt-4 relative z-10">
                <span>VOLUME ENGINE</span>
                <span className="font-bold text-zinc-600 dark:text-zinc-400">{pb.totalSets} SETS RECORDED</span>
                </div>
                </div>
            ))}
            </div>
        )}
        </div>
    );
}

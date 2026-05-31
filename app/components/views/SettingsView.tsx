import React from 'react';
import { Sun, Moon, User, Ruler, Dumbbell, Download, AlertTriangle, Trash2, X } from 'lucide-react';

interface SettingsViewProps {
    theme: 'light' | 'dark';
    setTheme: (theme: 'light' | 'dark') => void;
    isLight: boolean;
    data: any;
    refreshData: () => void;
    exportToCSV: () => void;
    profileAge: string;
    setProfileAge: (age: string) => void;
    profileGender: string;
    setProfileGender: (gender: string) => void;
    profileHeight: string;
    setProfileHeight: (height: string) => void;
    profileSaved: boolean;
    setProfileSaved: (saved: boolean) => void;
    newExerciseName: string;
    setNewExerciseName: (name: string) => void;
    handleCreateExercise: (e: React.FormEvent) => void;
    deleteExercise: (id: number) => Promise<void>;
    weightGoal: string;
    setWeightGoal: (goal: string) => void;
    unitLabel: string;
    tdeeAge: string;
    setTdeeAge: (age: string) => void;
    tdeeGender: string;
    setTdeeGender: (gender: string) => void;
    tdeeHeight: string;
    setTdeeHeight: (height: string) => void;
    cardBg: string;
}

export default function SettingsView({
    theme,
    setTheme,
    isLight,
    data,
    refreshData,
    exportToCSV,
    profileAge,
    setProfileAge,
    profileGender,
    setProfileGender,
    profileHeight,
    setProfileHeight,
    profileSaved,
    setProfileSaved,
    newExerciseName,
    setNewExerciseName,
    handleCreateExercise,
    deleteExercise,
    weightGoal,
    setWeightGoal,
    unitLabel,
    tdeeAge,
    setTdeeAge,
    tdeeGender,
    setTdeeGender,
    tdeeHeight,
    setTdeeHeight,
    cardBg
}: SettingsViewProps) {
    return (
        <div className="space-y-5 w-full text-xs">
        {/* Row 1: Appearance + Profile */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Appearance */}
        <div className={`${cardBg} rounded-2xl p-6 space-y-4`}>
        <div className="flex items-center gap-2 border-b pb-3 border-zinc-100 dark:border-zinc-800">
        <Sun className="h-4 w-4 text-amber-500" />
        <div>
        <h3 className="text-xs font-black uppercase tracking-wider">Display & Appearance</h3>
        <p className="text-[10px] text-zinc-400 mt-0.5">Visual theme for the interface.</p>
        </div>
        </div>
        <div className="space-y-1.5">
        <label className="text-zinc-400 font-bold block">Interface Theme</label>
        <div className="flex gap-3">
        <button onClick={() => setTheme('light')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border font-bold transition-all ${theme === 'light' ? 'bg-amber-500 border-amber-500 text-black shadow-md' : isLight ? 'bg-zinc-50 border-zinc-200 text-zinc-600 hover:bg-zinc-100' : 'bg-[#1E1E22] border-zinc-700 text-zinc-400 hover:bg-zinc-800'}`}>
        <Sun className="h-3.5 w-3.5" /> Light
        </button>
        <button onClick={() => setTheme('dark')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border font-bold transition-all ${theme === 'dark' ? 'bg-amber-500 border-amber-500 text-black shadow-md' : isLight ? 'bg-zinc-50 border-zinc-200 text-zinc-600 hover:bg-zinc-100' : 'bg-[#1E1E22] border-zinc-700 text-zinc-400 hover:bg-zinc-800'}`}>
        <Moon className="h-3.5 w-3.5" /> Dark
        </button>
        </div>
        </div>
        <div className="space-y-1.5 pt-1">
        <label className="text-zinc-400 font-bold block">Dashboard Default Exercise</label>
        <select
        value={localStorage.getItem('trackerbuddy_default_exercise') || (data.exercises[0]?.id.toString() || '')}
        onChange={(e) => { localStorage.setItem('trackerbuddy_default_exercise', e.target.value); window.location.reload(); }}
        className={`w-full border rounded-xl px-3.5 py-3 font-semibold outline-none cursor-pointer ${isLight ? 'bg-zinc-50 border-zinc-200 text-zinc-800' : 'bg-[#1E1E22] border-[#26262B] text-zinc-200'}`}
        >
        {data.exercises.map((ex: any) => <option key={ex.id} value={ex.id}>{ex.name}</option>)}
        </select>
        </div>
        </div>

        {/* Profile */}
        <div className={`${cardBg} rounded-2xl p-6 space-y-4`}>
        <div className="flex items-center gap-2 border-b pb-3 border-zinc-100 dark:border-zinc-800">
        <User className="h-4 w-4 text-blue-500" />
        <div>
        <h3 className="text-xs font-black uppercase tracking-wider">Athlete Profile</h3>
        <p className="text-[10px] text-zinc-400 mt-0.5">Pre-fills BMI & TDEE calculators in Tools.</p>
        </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
        <label className="text-zinc-400 font-bold">Age</label>
        <input type="number" value={profileAge} onChange={e => setProfileAge(e.target.value)} placeholder="e.g. 28" className={`w-full border rounded-xl px-3 py-2.5 font-medium outline-none ${isLight ? 'bg-zinc-50 border-zinc-200 text-zinc-800' : 'bg-[#1E1E22] border-[#26262B] text-zinc-200'}`} />
        </div>
        <div className="space-y-1">
        <label className="text-zinc-400 font-bold">Height ({data.settings.height_unit})</label>
        <input type="number" value={profileHeight} onChange={e => setProfileHeight(e.target.value)} placeholder={data.settings.height_unit === 'cm' ? '180' : '71'} className={`w-full border rounded-xl px-3 py-2.5 font-medium outline-none ${isLight ? 'bg-zinc-50 border-zinc-200 text-zinc-800' : 'bg-[#1E1E22] border-[#26262B] text-zinc-200'}`} />
        </div>
        <div className="col-span-2 space-y-1">
        <label className="text-zinc-400 font-bold">Biological Sex</label>
        <div className="flex gap-3">
        {['male', 'female'].map(g => (
            <button key={g} onClick={() => setProfileGender(g)} className={`flex-1 py-2.5 rounded-xl border font-bold capitalize transition-all ${profileGender === g ? 'bg-blue-500 border-blue-500 text-white' : isLight ? 'bg-zinc-50 border-zinc-200 text-zinc-600 hover:bg-zinc-100' : 'bg-[#1E1E22] border-zinc-700 text-zinc-400 hover:bg-zinc-800'}`}>{g}</button>
        ))}
        </div>
        </div>
        </div>
        <button
        onClick={() => {
            localStorage.setItem('tb_profile_age', profileAge);
            localStorage.setItem('tb_profile_gender', profileGender);
            localStorage.setItem('tb_profile_height', profileHeight);
            setProfileSaved(true);
            setTimeout(() => setProfileSaved(false), 2000);
        }}
        className="w-full bg-blue-500 hover:bg-blue-400 text-white font-black py-2.5 rounded-xl transition-colors text-[10px] uppercase tracking-wide"
        >
        {profileSaved ? '✓ Saved' : 'Save Profile'}
        </button>
        </div>
        </div>

        {/* Row 2: Units & Measurements */}
        <div className={`${cardBg} rounded-2xl p-6 space-y-4`}>
        <div className="flex items-center gap-2 border-b pb-3 border-zinc-100 dark:border-zinc-800">
        <Ruler className="h-4 w-4 text-emerald-500" />
        <div>
        <h3 className="text-xs font-black uppercase tracking-wider">Units & Measurements</h3>
        <p className="text-[10px] text-zinc-400 mt-0.5">Global unit system applied across all metrics.</p>
        </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-1.5">
        <label className="text-zinc-400 font-bold block">Weight Unit</label>
        <div className="flex gap-2">
        {[{val:'kg',label:'kg'},{val:'lbs',label:'lbs'}].map(opt => (
            <button key={opt.val} onClick={async () => { await import('@/lib/actions').then(m => m.updateSetting('weight_unit', opt.val)); refreshData(); }} className={`flex-1 py-2.5 rounded-xl border font-bold transition-all text-[11px] ${data.settings.weight_unit === opt.val ? 'bg-emerald-500 border-emerald-500 text-white' : isLight ? 'bg-zinc-50 border-zinc-200 text-zinc-600 hover:bg-zinc-100' : 'bg-[#1E1E22] border-zinc-700 text-zinc-400 hover:bg-zinc-800'}`}>{opt.label}</button>
        ))}
        </div>
        </div>
        <div className="space-y-1.5">
        <label className="text-zinc-400 font-bold block">Height Unit</label>
        <div className="flex gap-2">
        {[{val:'cm',label:'cm'},{val:'in',label:'in'}].map(opt => (
            <button key={opt.val} onClick={async () => { await import('@/lib/actions').then(m => m.updateSetting('height_unit', opt.val)); refreshData(); }} className={`flex-1 py-2.5 rounded-xl border font-bold transition-all text-[11px] ${data.settings.height_unit === opt.val ? 'bg-emerald-500 border-emerald-500 text-white' : isLight ? 'bg-zinc-50 border-zinc-200 text-zinc-600 hover:bg-zinc-100' : 'bg-[#1E1E22] border-zinc-700 text-zinc-400 hover:bg-zinc-800'}`}>{opt.label}</button>
        ))}
        </div>
        </div>
        <div className="space-y-1.5">
        <label className="text-zinc-400 font-bold block">1RM Formula</label>
        <select value={data.settings.one_rm_formula} onChange={async (e) => { await import('@/lib/actions').then(m => m.updateSetting('one_rm_formula', e.target.value)); refreshData(); }} className={`w-full border rounded-xl px-3 py-2.5 font-semibold outline-none cursor-pointer ${isLight ? 'bg-zinc-50 border-zinc-200 text-zinc-800' : 'bg-[#1E1E22] border-[#26262B] text-zinc-200'}`}>
        <option value="brzycki">Brzycki</option>
        <option value="epley">Epley</option>
        </select>
        </div>
        </div>
        </div>

        {/* Row 3: Exercise Library */}
        <div className={`${cardBg} rounded-2xl p-6 space-y-4`}>
        <div className="flex items-center gap-2 border-b pb-3 border-zinc-100 dark:border-zinc-800">
        <Dumbbell className="h-4 w-4 text-rose-500" />
        <div>
        <h3 className="text-xs font-black uppercase tracking-wider">Exercise Library</h3>
        <p className="text-[10px] text-zinc-400 mt-0.5">Manage tracked movements.</p>
        </div>
        </div>
        <div className="flex gap-3">
        <input type="text" placeholder="e.g. Incline Bench Press" value={newExerciseName} onChange={(e) => setNewExerciseName(e.target.value)} className={`flex-1 border rounded-xl px-4 py-2.5 font-medium outline-none ${isLight ? 'bg-zinc-50 border-zinc-200 text-zinc-800' : 'bg-[#1E1E22] border-[#26262B] text-zinc-200'}`} onKeyDown={e => { if(e.key==='Enter') { e.preventDefault(); handleCreateExercise(e as any); }}} />
        <button onClick={async (e) => { e.preventDefault(); if(!newExerciseName) return; await handleCreateExercise(e as any); }} className="bg-amber-500 text-black font-black px-5 py-2.5 rounded-xl hover:bg-amber-400 transition-colors shrink-0">
        Add
        </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
        {data.exercises.map((ex: any) => (
            <div key={ex.id} className={`flex items-center justify-between p-3 border rounded-xl ${isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-[#1E1E22] border-zinc-800'}`}>
            <span className="font-bold text-zinc-500 dark:text-zinc-300">{ex.name}</span>
            <button onClick={async () => { if(confirm(`Delete "${ex.name}"? All linked sets will also be removed.`)) { await deleteExercise(ex.id); refreshData(); } }} className="text-zinc-400 hover:text-rose-500 p-1.5 rounded-lg transition-colors">
            <Trash2 className="h-3.5 w-3.5" />
            </button>
            </div>
        ))}
        </div>
        </div>

        {/* Row 4: Export + Danger Zone */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Export */}
        <div className={`${cardBg} rounded-2xl p-6 space-y-4`}>
        <div className="flex items-center gap-2 border-b pb-3 border-zinc-100 dark:border-zinc-800">
        <Download className="h-4 w-4 text-amber-500" />
        <div>
        <h3 className="text-xs font-black uppercase tracking-wider">Data Export</h3>
        <p className="text-[10px] text-zinc-400 mt-0.5">Download a full snapshot of your logs.</p>
        </div>
        </div>
        <p className="text-zinc-400 leading-relaxed">Exports all body weight entries, workout sets, and exercise history as a CSV file you can open in Excel or Sheets.</p>
        <button onClick={exportToCSV} className={`w-full inline-flex items-center justify-center gap-2.5 px-5 py-3 rounded-xl font-bold transition-all border ${isLight ? 'bg-zinc-100 hover:bg-zinc-200 border-zinc-300 text-zinc-800' : 'bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-white'}`}>
        <Download className="h-4 w-4 text-amber-500" /> Export as CSV
        </button>
        </div>

        {/* Danger Zone */}
        <div className={`rounded-2xl p-6 space-y-4 border ${isLight ? 'bg-rose-50/50 border-rose-200' : 'bg-rose-950/20 border-rose-900/40'}`}>
        <div className="flex items-center gap-2 border-b pb-3 border-rose-200 dark:border-rose-900/40">
        <AlertTriangle className="h-4 w-4 text-rose-500" />
        <div>
        <h3 className="text-xs font-black uppercase tracking-wider text-rose-600 dark:text-rose-400">Danger Zone</h3>
        <p className="text-[10px] text-rose-400/70 mt-0.5">Irreversible destructive actions.</p>
        </div>
        </div>
        <div className="space-y-2.5">
        <div className={`flex items-center justify-between p-3 rounded-xl border ${isLight ? 'bg-white border-rose-200' : 'bg-[#1E1E22] border-rose-900/30'}`}>
        <div>
        <p className="font-bold text-zinc-700 dark:text-zinc-300">Clear Weight Log</p>
        <p className="text-[10px] text-zinc-400 mt-0.5">Removes all body weight entries.</p>
        </div>
        <button onClick={() => { if(confirm('Clear ALL weight log entries? This cannot be undone.')) { data.weightData.forEach((w: any) => import('@/lib/actions').then(m => m.deleteWeight(w.date))); setTimeout(refreshData, 300); } }} className="px-3 py-2 bg-rose-500 hover:bg-rose-600 text-white font-black rounded-xl text-[10px] transition-colors shrink-0">
        Clear
        </button>
        </div>
        <div className={`flex items-center justify-between p-3 rounded-xl border ${isLight ? 'bg-white border-rose-200' : 'bg-[#1E1E22] border-rose-900/30'}`}>
        <div>
        <p className="font-bold text-zinc-700 dark:text-zinc-300">Clear Workout History</p>
        <p className="text-[10px] text-zinc-400 mt-0.5">Removes all logged sets permanently.</p>
        </div>
        <button onClick={() => { if(confirm('Clear ALL workout sets? This cannot be undone.')) { data.fullHistoryFeed.forEach((s: any) => import('@/lib/actions').then(m => m.deleteWorkoutSet(s.id)));
        setTimeout(refreshData, 300); } }} className="px-3 py-2 bg-rose-500 hover:bg-rose-600 text-white font-black rounded-xl text-[10px] transition-colors shrink-0">
        Clear
        </button>
        </div>
        </div>
        </div>
        </div>
        </div>
    );
}

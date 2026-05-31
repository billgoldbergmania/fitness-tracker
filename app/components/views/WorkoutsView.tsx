'use client';

import { useEffect, useState, useRef } from 'react';
import { Dumbbell, Plus, Trash2, Edit2, Save, X, Play, Check } from 'lucide-react';
import {
    getRoutines,
    getRoutine,
    createRoutine,
    updateRoutine,
    deleteRoutine,
    startWorkoutSession,
    logSessionSet,
    completeWorkoutSession,
    getLastSuccessfulWeight,
} from '@/lib/actions-client';

interface WorkoutsViewProps {
    cardBg: string;
    isLight: boolean;
    exercises: any[];
}

export default function WorkoutsView({ cardBg, isLight, exercises }: WorkoutsViewProps) {
    const [routines, setRoutines] = useState<any[]>([]);
    const [selectedRoutine, setSelectedRoutine] = useState<any>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState('');
    const [editExercises, setEditExercises] = useState<any[]>([]);

    const [activeSessionId, setActiveSessionId] = useState<number | null>(null);
    const [activeRoutine, setActiveRoutine] = useState<any>(null);
    const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
    const [currentSetNumber, setCurrentSetNumber] = useState(1);
    const [currentWeight, setCurrentWeight] = useState('');
    const [currentReps, setCurrentReps] = useState('');
    const [isWarmup, setIsWarmup] = useState(false);
    const [workoutNotes, setWorkoutNotes] = useState('');
    const [showSummary, setShowSummary] = useState(false);
    const [sessionSets, setSessionSets] = useState<any[]>([]);
    const loadingSuggestedRef = useRef(false);

    const inputBg = isLight ? 'bg-white border-zinc-200 text-zinc-900' : 'bg-[#1E1E22] border-zinc-800 text-white';
    const selectBg = isLight ? 'bg-white border-zinc-200 text-zinc-900' : 'bg-[#1E1E22] border-zinc-800 text-white';
    const buttonHover = isLight ? 'hover:bg-zinc-100' : 'hover:bg-zinc-800';

    const loadRoutines = async () => {
        try {
            const data = await getRoutines();
            setRoutines(data);
        } catch (e) {
            console.error('Failed to load routines', e);
        }
    };

    useEffect(() => {
        loadRoutines();
    }, []);

    useEffect(() => {
        if (activeRoutine && activeRoutine.exercises && activeRoutine.exercises[currentExerciseIndex] && !loadingSuggestedRef.current) {
            const ex = activeRoutine.exercises[currentExerciseIndex];
            const loadSuggested = async () => {
                loadingSuggestedRef.current = true;
                try {
                    const last = await getLastSuccessfulWeight(ex.exercise_id);
                    if (last) {
                        setCurrentWeight(last.weight.toString());
                        setCurrentReps(last.reps.toString());
                    } else {
                        setCurrentWeight(ex.target_weight?.toString() || '');
                        setCurrentReps(ex.target_reps?.toString() || '');
                    }
                } catch (err) {
                    console.error('Failed to load suggested weight', err);
                } finally {
                    loadingSuggestedRef.current = false;
                }
            };
            loadSuggested();
        }
    }, [activeRoutine, currentExerciseIndex]);

    const handleSelectRoutine = async (routineId: number) => {
        try {
            const routine = await getRoutine(routineId);
            setSelectedRoutine(routine);
            setIsEditing(false);
        } catch (e) {
            console.error(e);
        }
    };

    const handleCreateRoutine = () => {
        setEditName('');
        setEditExercises([]);
        setIsEditing(true);
        setSelectedRoutine(null);
    };

    const handleEditRoutine = () => {
        if (!selectedRoutine) return;
        setEditName(selectedRoutine.name);
        setEditExercises(selectedRoutine.exercises.map((ex: any, idx: number) => ({
            exercise_id: ex.exercise_id,
            order_index: idx,
            target_sets: ex.target_sets ?? 3,
            target_reps: ex.target_reps ?? 5,
            target_weight: ex.target_weight ?? null,
            rest_seconds: ex.rest_seconds ?? 60
        })));
        setIsEditing(true);
    };

    const handleSaveRoutine = async () => {
        if (!editName.trim()) return;
        const exercisesToSave = editExercises.map((ex, idx) => ({
            ...ex,
            order_index: idx,
            target_sets: Number(ex.target_sets) || 3,
                                                                target_reps: Number(ex.target_reps) || 5,
                                                                target_weight: ex.target_weight ? Number(ex.target_weight) : null,
                                                                rest_seconds: Number(ex.rest_seconds) || 60
        }));
        try {
            if (selectedRoutine) {
                await updateRoutine(selectedRoutine.id, editName, exercisesToSave);
            } else {
                const newId = await createRoutine(editName);
                // Convert bigint to number
                await updateRoutine(Number(newId), editName, exercisesToSave);
            }
            setIsEditing(false);
            setSelectedRoutine(null);
            await loadRoutines();
        } catch (err) {
            console.error('Save routine failed', err);
            alert('Error saving routine');
        }
    };

    const handleDeleteRoutine = async (id: number) => {
        if (confirm('Delete this routine? All associated data will be lost.')) {
            try {
                await deleteRoutine(id);
                if (selectedRoutine?.id === id) setSelectedRoutine(null);
                await loadRoutines();
            } catch (err) {
                console.error('Delete failed', err);
                alert('Error deleting routine');
            }
        }
    };

    const addExerciseToEdit = () => {
        setEditExercises([...editExercises, {
            exercise_id: exercises[0]?.id,
            target_sets: 3,
            target_reps: 5,
            target_weight: null,
            rest_seconds: 60
        }]);
    };

    const updateExerciseInEdit = (idx: number, field: string, value: any) => {
        const updated = [...editExercises];
        updated[idx][field] = value;
        setEditExercises(updated);
    };

    const removeExerciseFromEdit = (idx: number) => {
        setEditExercises(editExercises.filter((_, i) => i !== idx));
    };

    const handleStartWorkout = async (routineId: number) => {
        try {
            const sessionId = await startWorkoutSession(routineId);
            // Convert bigint to number
            setActiveSessionId(Number(sessionId));
            const routine = await getRoutine(routineId);
            setActiveRoutine(routine);
            setCurrentExerciseIndex(0);
            setCurrentSetNumber(1);
            setSessionSets([]);
            setShowSummary(false);
        } catch (err) {
            console.error('Start workout failed', err);
            alert('Error starting workout');
        }
    };

    const handleLogSet = async () => {
        if (!activeRoutine || !activeSessionId) return;
        const weight = parseFloat(currentWeight);
        const reps = parseInt(currentReps);
        if (isNaN(weight) || isNaN(reps)) {
            alert('Enter valid weight and reps');
            return;
        }

        const currentExercise = activeRoutine.exercises[currentExerciseIndex];
        try {
            await logSessionSet(activeSessionId, currentExercise.exercise_id, currentSetNumber, weight, reps, isWarmup, false);
            setSessionSets(prev => [...prev, {
                exercise_name: currentExercise.exercise_name,
                set_number: currentSetNumber,
                weight,
                reps,
                is_warmup: isWarmup
            }]);

            const totalSets = currentExercise.target_sets;
            if (currentSetNumber < totalSets) {
                setCurrentSetNumber(currentSetNumber + 1);
            } else {
                if (currentExerciseIndex + 1 < activeRoutine.exercises.length) {
                    setCurrentExerciseIndex(currentExerciseIndex + 1);
                    setCurrentSetNumber(1);
                } else {
                    setShowSummary(true);
                }
            }
            setCurrentWeight('');
            setCurrentReps('');
            setIsWarmup(false);
        } catch (err) {
            console.error('Log set failed', err);
            alert('Error logging set');
        }
    };

    const handleCompleteWorkout = async () => {
        if (activeSessionId) {
            try {
                await completeWorkoutSession(activeSessionId, workoutNotes);
                setActiveSessionId(null);
                setActiveRoutine(null);
                setShowSummary(false);
                await loadRoutines();
                alert('Workout saved successfully!');
            } catch (err) {
                console.error('Complete workout failed', err);
                alert('Error saving workout');
            }
        }
    };

    // Render routine editor
    if (isEditing) {
        return (
            <div className={`${cardBg} rounded-2xl p-6 space-y-4`}>
            <div className="flex items-center justify-between border-b pb-3">
            <h2 className="text-sm font-black uppercase tracking-wider">
            {selectedRoutine ? 'Edit Routine' : 'Create Routine'}
            </h2>
            <button onClick={() => setIsEditing(false)} className={`p-1 rounded-lg ${buttonHover}`}>
            <X className="h-4 w-4" />
            </button>
            </div>
            <div className="space-y-3">
            <input
            type="text"
            placeholder="Routine name"
            value={editName}
            onChange={e => setEditName(e.target.value)}
            className={`w-full border rounded-xl px-4 py-2 ${inputBg}`}
            />
            <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-400">Exercises</label>
            {editExercises.map((ex, idx) => (
                <div key={idx} className={`p-3 border rounded-xl space-y-2 ${isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-[#1E1E22] border-zinc-800'}`}>
                <div className="flex gap-2">
                <select
                value={ex.exercise_id}
                onChange={e => updateExerciseInEdit(idx, 'exercise_id', parseInt(e.target.value))}
                className={`flex-1 border rounded-lg px-2 py-1 text-xs ${selectBg}`}
                >
                {exercises.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                </select>
                <button onClick={() => removeExerciseFromEdit(idx)} className="text-rose-500 p-1">
                <Trash2 className="h-3.5 w-3.5" />
                </button>
                </div>
                <div className="grid grid-cols-4 gap-2 text-[10px]">
                <div>
                <label className="block text-zinc-500">Sets</label>
                <input
                type="number"
                value={ex.target_sets ?? ''}
                onChange={e => updateExerciseInEdit(idx, 'target_sets', e.target.value === '' ? 0 : parseInt(e.target.value))}
                className={`w-full border rounded px-1 py-1 text-xs ${inputBg}`}
                />
                </div>
                <div>
                <label className="block text-zinc-500">Reps</label>
                <input
                type="number"
                value={ex.target_reps ?? ''}
                onChange={e => updateExerciseInEdit(idx, 'target_reps', e.target.value === '' ? 0 : parseInt(e.target.value))}
                className={`w-full border rounded px-1 py-1 text-xs ${inputBg}`}
                />
                </div>
                <div>
                <label className="block text-zinc-500">Target kg</label>
                <input
                type="number"
                placeholder="optional"
                value={ex.target_weight ?? ''}
                onChange={e => updateExerciseInEdit(idx, 'target_weight', e.target.value === '' ? null : parseFloat(e.target.value))}
                className={`w-full border rounded px-1 py-1 text-xs ${inputBg}`}
                />
                </div>
                <div>
                <label className="block text-zinc-500">Rest (sec)</label>
                <input
                type="number"
                value={ex.rest_seconds ?? ''}
                onChange={e => updateExerciseInEdit(idx, 'rest_seconds', e.target.value === '' ? 0 : parseInt(e.target.value))}
                className={`w-full border rounded px-1 py-1 text-xs ${inputBg}`}
                />
                </div>
                </div>
                </div>
            ))}
            <button onClick={addExerciseToEdit} className={`w-full border border-dashed rounded-xl py-2 text-xs ${buttonHover}`}>
            + Add Exercise
            </button>
            </div>
            <button onClick={handleSaveRoutine} className="w-full bg-amber-500 text-black font-bold py-2 rounded-xl hover:bg-amber-400">
            Save Routine
            </button>
            </div>
            </div>
        );
    }

    // Render active workout
    if (activeRoutine && !showSummary) {
        const currentExercise = activeRoutine.exercises[currentExerciseIndex];
        const totalExercises = activeRoutine.exercises.length;
        const totalSets = currentExercise.target_sets;
        return (
            <div className={`${cardBg} rounded-2xl p-6 space-y-5`}>
            <div className="flex items-center justify-between">
            <h2 className="text-sm font-black uppercase tracking-wider">Active Workout</h2>
            <button onClick={() => { setActiveSessionId(null); setActiveRoutine(null); }} className="text-rose-500 text-xs">Cancel</button>
            </div>
            <div className="text-center">
            <p className="text-xs text-zinc-400">{activeRoutine.name}</p>
            <p className="text-lg font-black mt-1">{currentExercise.exercise_name}</p>
            <p className="text-xs mt-1">Set {currentSetNumber} of {totalSets} | Exercise {currentExerciseIndex+1} of {totalExercises}</p>
            </div>
            <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
            <label className="text-xs text-zinc-400">Weight (kg)</label>
            <input type="number" step="0.5" value={currentWeight} onChange={e => setCurrentWeight(e.target.value)} className={`w-full border rounded-xl px-3 py-2 ${inputBg}`} />
            </div>
            <div className="space-y-1">
            <label className="text-xs text-zinc-400">Reps</label>
            <input type="number" value={currentReps} onChange={e => setCurrentReps(e.target.value)} className={`w-full border rounded-xl px-3 py-2 ${inputBg}`} />
            </div>
            </div>
            <div className="flex items-center gap-2">
            <input type="checkbox" id="warmup" checked={isWarmup} onChange={e => setIsWarmup(e.target.checked)} />
            <label htmlFor="warmup" className="text-xs">Warmup set</label>
            </div>
            <button onClick={handleLogSet} className="w-full bg-amber-500 text-black font-bold py-2.5 rounded-xl hover:bg-amber-400">
            Log Set
            </button>
            </div>
            <div className="border-t pt-3">
            <h3 className="text-xs font-bold mb-2">Sets logged:</h3>
            <div className="max-h-40 overflow-y-auto space-y-1 text-xs">
            {sessionSets.map((set, idx) => (
                <div key={idx} className="flex justify-between">
                <span>{set.exercise_name} – Set {set.set_number}</span>
                <span>{set.weight} kg × {set.reps} {set.is_warmup && '(warmup)'}</span>
                </div>
            ))}
            </div>
            </div>
            </div>
        );
    }

    // Render summary (workout complete)
    if (showSummary && activeRoutine) {
        return (
            <div className={`${cardBg} rounded-2xl p-6 space-y-4`}>
            <div className="text-center">
            <Check className="h-12 w-12 text-emerald-500 mx-auto" />
            <h2 className="text-lg font-black mt-2">Workout Complete!</h2>
            <p className="text-xs text-zinc-400">{activeRoutine.name}</p>
            </div>
            <textarea
            placeholder="Add notes (optional)"
            value={workoutNotes}
            onChange={e => setWorkoutNotes(e.target.value)}
            className={`w-full border rounded-xl p-3 text-xs ${inputBg}`}
            rows={3}
            />
            <button onClick={handleCompleteWorkout} className="w-full bg-emerald-500 text-white font-bold py-2.5 rounded-xl hover:bg-emerald-600">
            Finish & Save
            </button>
            </div>
        );
    }

    // Render routines list (default view)
    return (
        <div className="space-y-4">
        <div className="flex items-center justify-between">
        <h2 className="text-sm font-black uppercase tracking-wider">My Routines</h2>
        <button onClick={handleCreateRoutine} className="flex items-center gap-1 text-xs bg-amber-500 text-black px-3 py-1.5 rounded-xl hover:bg-amber-400">
        <Plus className="h-3.5 w-3.5" /> Create
        </button>
        </div>

        {routines.length === 0 ? (
            <div className={`${cardBg} rounded-2xl p-8 text-center text-zinc-400 text-xs`}>
            No routines yet. Click "Create" to build your first workout.
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {routines.map(routine => (
                <div key={routine.id} className={`${cardBg} rounded-2xl p-4 flex flex-col border ${selectedRoutine?.id === routine.id ? 'border-amber-500' : ''}`}>
                <div className="flex items-center justify-between">
                <h3 className="font-black">{routine.name}</h3>
                <div className="flex gap-1">
                <button onClick={() => handleSelectRoutine(routine.id)} className={`p-1.5 rounded-lg ${buttonHover}`}>
                <Play className="h-3.5 w-3.5" />
                </button>
                <button onClick={handleEditRoutine} className={`p-1.5 rounded-lg ${buttonHover}`}>
                <Edit2 className="h-3.5 w-3.5" />
                </button>
                <button onClick={() => handleDeleteRoutine(routine.id)} className="p-1.5 rounded-lg hover:bg-rose-500/10 text-rose-500">
                <Trash2 className="h-3.5 w-3.5" />
                </button>
                </div>
                </div>
                {selectedRoutine?.id === routine.id && (
                    <div className="mt-3 pt-3 border-t space-y-2">
                    <p className="text-xs text-zinc-400">Exercises:</p>
                    {selectedRoutine.exercises?.map((ex: any, idx: number) => (
                        <div key={idx} className="text-xs flex justify-between">
                        <span>{ex.exercise_name}</span>
                        <span>{ex.target_sets}×{ex.target_reps}</span>
                        </div>
                    ))}
                    <button onClick={() => handleStartWorkout(routine.id)} className="w-full mt-2 bg-amber-500 text-black font-bold py-1.5 rounded-xl text-xs hover:bg-amber-400">
                    Start Workout
                    </button>
                    </div>
                )}
                </div>
            ))}
            </div>
        )}
        </div>
    );
}

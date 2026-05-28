'use server';

import db from './db';
import { revalidatePath } from 'next/cache';

export interface WeightData {
    date: string;
    weight: number;
    movingAvg: number | null;
}

export interface Exercise {
    id: number;
    name: string;
}

export interface WorkoutSet {
    id: number;
    date: string;
    exercise_id: number;
    exercise_name: string;
    weight: number;
    reps: number;
    estimated_1rm: number;
}

export interface UserSettings {
    weight_unit: 'kg' | 'lbs';
    height_unit: 'cm' | 'in';
    one_rm_formula: 'brzycki' | 'epley';
}

// Initialize Expanded Relational Database Architecture
db.exec(`
CREATE TABLE IF NOT EXISTS weight_logs (
    date TEXT PRIMARY KEY,
    weight REAL NOT NULL
);

CREATE TABLE IF NOT EXISTS exercises (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS workout_sets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    exercise_id INTEGER NOT NULL,
    weight REAL NOT NULL,
    reps INTEGER NOT NULL,
    estimated_1rm REAL NOT NULL,
    FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS user_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
);
`);

// Pre-seed core metrics configurations and initial exercises
const baseExercises = db.prepare(`SELECT COUNT(*) as count FROM exercises`).get() as { count: number };
if (baseExercises.count === 0) {
    const seed = db.prepare(`INSERT INTO exercises (name) VALUES (?)`);
    ['Bench Press', 'Squat', 'Deadlift', 'Overhead Press'].forEach(ex => seed.run(ex));
}

const defaultSettings = [
    { key: 'weight_unit', value: 'kg' },
{ key: 'height_unit', value: 'cm' },
{ key: 'one_rm_formula', value: 'brzycki' }
];
const checkSettings = db.prepare(`SELECT COUNT(*) as count FROM user_settings`).get() as { count: number };
if (checkSettings.count === 0) {
    const seedSetting = db.prepare(`INSERT INTO user_settings (key, value) VALUES (?, ?)`);
    defaultSettings.forEach(s => seedSetting.run(s.key, s.value));
}

// Settings Management Actions
export async function updateSetting(key: string, value: string) {
    db.prepare(`INSERT INTO user_settings (key, value) ON CONFLICT(key) DO UPDATE SET value = excluded.value`).run(key, value);
    revalidatePath('/');
}

export async function getUserSettings(): Object {
    const rows = db.prepare(`SELECT key, value FROM user_settings`).all() as { key: string; value: string }[];
    return rows.reduce((acc, row) => ({ ...acc, [row.key]: row.value }), {});
}

// Logger Actions
export async function logWeight(date: string, weight: number) {
    db.prepare(`INSERT INTO weight_logs (date, weight) VALUES (?, ?) ON CONFLICT(date) DO UPDATE SET weight = excluded.weight`).run(date, weight);
    revalidatePath('/');
}

export async function deleteWeight(date: string) {
    db.prepare(`DELETE FROM weight_logs WHERE date = ?`).run(date);
    revalidatePath('/');
}

export async function createExercise(name: string) {
    try {
        db.prepare(`INSERT INTO exercises (name) VALUES (?)`).run(name.trim());
        revalidatePath('/');
    } catch (e) {
        throw new Error("Exercise designation register conflict.");
    }
}

export async function deleteExercise(id: number) {
    db.prepare(`DELETE FROM exercises WHERE id = ?`).run(id);
    revalidatePath('/');
}

export async function logWorkoutSet(date: string, exerciseId: number, weight: number, reps: number, formula: 'brzycki' | 'epley' = 'brzycki') {
    let estimated_1rm = weight;
    if (reps > 1) {
        estimated_1rm = formula === 'epley'
        ? weight * (1 + reps / 30)
        : weight / (1.0278 - 0.0278 * reps);
    }
    estimated_1rm = Math.round(estimated_1rm * 10) / 10;

    db.prepare(`
    INSERT INTO workout_sets (date, exercise_id, weight, reps, estimated_1rm)
    VALUES (?, ?, ?, ?, ?)
    `).run(date, exerciseId, weight, reps, estimated_1rm);
    revalidatePath('/');
}

export async function deleteWorkoutSet(id: number) {
    db.prepare(`DELETE FROM workout_sets WHERE id = ?`).run(id);
    revalidatePath('/');
}

// High-Density Data Fetching
export async function getDashboardData(selectedExerciseId?: number) {
    const settings = await getUserSettings() as UserSettings;
    const isImperial = settings.weight_unit === 'lbs';

    // Weight logs fetch with moving average calculation
    const weightRows = db.prepare(`SELECT date, weight FROM weight_logs ORDER BY date ASC`).all() as { date: string; weight: number }[];
    const weightData: WeightData[] = weightRows.map((row, index) => {
        const startIdx = Math.max(0, index - 6);
        const subset = weightRows.slice(startIdx, index + 1);
        const sum = subset.reduce((acc, curr) => acc + curr.weight, 0);

        let displayWeight = row.weight;
        let movingAvg = subset.length >= 4 ? sum / subset.length : null;

        if (isImperial) {
            displayWeight = displayWeight * 2.20462;
            if (movingAvg) movingAvg = movingAvg * 2.20462;
        }

        return {
            date: row.date,
            weight: Math.round(displayWeight * 10) / 10,
                                                    movingAvg: movingAvg ? Math.round(movingAvg * 10) / 10 : null,
        };
    });

    const exercises = db.prepare(`SELECT id, name FROM exercises ORDER BY name ASC`).all() as Exercise[];
    const activeExerciseId = selectedExerciseId || exercises[0]?.id || 0;

    const chartSets = db.prepare(`
    SELECT date, MAX(estimated_1rm) as estimated_1rm
    FROM workout_sets
    WHERE exercise_id = ?
    GROUP BY date
    ORDER BY date ASC
    `).all(activeExerciseId) as { date: string; estimated_1rm: number }[];

    const formattedChartSets = chartSets.map(s => ({
        date: s.date,
        estimated_1rm: Math.round((isImperial ? s.estimated_1rm * 2.20462 : s.estimated_1rm) * 10) / 10
    }));

    const fullHistoryFeed = db.prepare(`
    SELECT w.id, w.date, w.exercise_id, w.weight, w.reps, w.estimated_1rm, e.name as exercise_name
    FROM workout_sets w
    JOIN exercises e ON w.exercise_id = e.id
    ORDER BY w.date DESC, w.id DESC
    `).all() as WorkoutSet[];

    const formattedHistoryFeed = fullHistoryFeed.map(set => ({
        ...set,
        weight: Math.round((isImperial ? set.weight * 2.20462 : set.weight) * 10) / 10,
                                                             estimated_1rm: Math.round((isImperial ? set.estimated_1rm * 2.20462 : set.estimated_1rm) * 10) / 10
    }));

    // Summary Metrics
    const latestWeight = weightData[weightData.length - 1]?.weight || 0;
    const prevWeight = weightData[weightData.length - 2]?.weight || 0;
    const weightChange = latestWeight && prevWeight ? Math.round((latestWeight - prevWeight) * 10) / 10 : 0;

    const highestRow = db.prepare(`SELECT MAX(estimated_1rm) as max1rm FROM workout_sets WHERE exercise_id = ?`).get(activeExerciseId) as { max1rm: number | null };
    const maxBench1RM = highestRow?.max1rm ? (isImperial ? highestRow.max1rm * 2.20462 : highestRow.max1rm) : 0;

    const latestDateRow = db.prepare(`SELECT date FROM workout_sets WHERE exercise_id = ? ORDER BY date DESC LIMIT 1`).get(activeExerciseId) as { date: string } | undefined;
    let currentBench1RM = 0;
    if (latestDateRow) {
        const currentMaxRow = db.prepare(`SELECT MAX(estimated_1rm) as max_1rm FROM workout_sets WHERE exercise_id = ? AND date = ?`).get(activeExerciseId, latestDateRow.date) as { max_1rm: number | null };
        currentBench1RM = currentMaxRow?.max_1rm ? (isImperial ? currentMaxRow.max_1rm * 2.20462 : currentMaxRow.max_1rm) : 0;
    }

    return {
        weightData,
        exercises,
        selectedExerciseData: formattedChartSets,
        fullHistoryFeed: formattedHistoryFeed,
        activeExerciseId,
        settings,
        metrics: {
            currentWeight: Math.round(latestWeight * 10) / 10,
            weightChange,
            currentBench1RM: Math.round(currentBench1RM * 10) / 10,
            maxBench1RM: Math.round(maxBench1RM * 10) / 10
        }
    };
}

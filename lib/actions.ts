'use server';

import db from './db';
import { revalidatePath } from 'next/cache';

export interface WeightData {
    date: string;
    weight: number;
    movingAvg: number | null;
}

export interface WorkoutData {
    date: string;
    exercise_name: string;
    weight: number;
    reps: number;
    estimated_1rm: number;
}

// Log daily weight (Metric KG)
export async function logWeight(date: string, weight: number) {
    const insert = db.prepare(`
    INSERT INTO weight_logs (date, weight)
    VALUES (?, ?)
    ON CONFLICT(date) DO UPDATE SET weight = excluded.weight
    `);
    insert.run(date, weight);
    revalidatePath('/');
}

// Log a workout set (Metric KG)
export async function logWorkout(date: string, exercise: string, weight: number, reps: number) {
    // Epley formula calculation for estimated 1RM
    const estimated_1rm = reps === 1 ? weight : Math.round(weight * (1 + reps / 30) * 10) / 10;

    const insert = db.prepare(`
    INSERT INTO workout_logs (date, exercise_name, weight, reps, estimated_1rm)
    VALUES (?, ?, ?, ?, ?)
    `);
    insert.run(date, exercise, weight, reps, estimated_1rm);
    revalidatePath('/');
}

// Fetch compiled metrics for the dashboard matching the layout parameters
export async function getDashboardData() {
    const weightRows = db.prepare(`SELECT date, weight FROM weight_logs ORDER BY date ASC`).all() as { date: string; weight: number }[];

    const weightData: WeightData[] = weightRows.map((row, index) => {
        const startIdx = Math.max(0, index - 6);
        const subset = weightRows.slice(startIdx, index + 1);
        const sum = subset.reduce((acc, curr) => acc + curr.weight, 0);
        const movingAvg = Math.round((sum / subset.length) * 10) / 10;

        return {
            date: row.date,
            weight: row.weight,
            movingAvg: subset.length >= 4 ? movingAvg : null,
        };
    });

    const benchRows = db.prepare(`
    SELECT date, exercise_name, weight, reps, estimated_1rm
    FROM workout_logs
    WHERE exercise_name = 'Bench Press'
    ORDER BY date ASC
    `).all() as WorkoutData[];

    // Metrics extraction
    const latestWeight = weightData[weightData.length - 1]?.weight || 0;
    const previousWeight = weightData[weightData.length - 2]?.weight || 0;
    const weightChange = latestWeight && previousWeight ? Math.round((latestWeight - previousWeight) * 10) / 10 : 0;

    // Global historical peak
    const highest1RMRow = db.prepare(`SELECT MAX(estimated_1rm) as max1rm FROM workout_logs WHERE exercise_name = 'Bench Press'`).get() as { max1rm: number | null };
    const maxBench1RM = highest1RMRow?.max1rm || 0;

    // FIX: Find the latest training date, then pull the MAXIMUM 1RM achieved on that exact day
    const latestBenchDateRow = db.prepare(`
    SELECT date FROM workout_logs
    WHERE exercise_name = 'Bench Press'
    ORDER BY date DESC LIMIT 1
    `).get() as { date: string } | undefined;

    let currentBench1RM = 0;
    if (latestBenchDateRow) {
        const currentBenchRow = db.prepare(`
        SELECT MAX(estimated_1rm) as max_1rm
        FROM workout_logs
        WHERE exercise_name = 'Bench Press' AND date = ?
        `).get(latestBenchDateRow.date) as { max_1rm: number | null };
        currentBench1RM = currentBenchRow?.max_1rm || 0;
    }

    return {
        weightData,
        benchData: benchRows,
        metrics: {
            currentWeight: latestWeight,
            weightChange,
            currentBench1RM,
            maxBench1RM
        }
    };
}

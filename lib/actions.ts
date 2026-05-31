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

// ========== SAFE DATABASE INITIALIZATION ==========
db.exec(`
CREATE TABLE IF NOT EXISTS weight_logs (
    date TEXT PRIMARY KEY,
    weight REAL NOT NULL
);

CREATE TABLE IF NOT EXISTS exercises (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    user_id INTEGER NOT NULL DEFAULT 1,
    UNIQUE(name, user_id)
);

CREATE TABLE IF NOT EXISTS workout_sets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    exercise_id INTEGER NOT NULL,
    weight REAL NOT NULL,
    reps INTEGER NOT NULL,
    estimated_1rm REAL NOT NULL,
    user_id INTEGER NOT NULL DEFAULT 1,
    FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS user_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS progress_photos (
    id TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL,
    date TEXT NOT NULL,
    url TEXT NOT NULL,
    caption TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Workout routines
CREATE TABLE IF NOT EXISTS routines (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS routine_exercises (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    routine_id INTEGER NOT NULL,
    exercise_id INTEGER NOT NULL,
    order_index INTEGER NOT NULL,
    target_sets INTEGER NOT NULL DEFAULT 3,
    target_reps INTEGER NOT NULL DEFAULT 5,
    target_weight REAL,
    rest_seconds INTEGER DEFAULT 60,
    FOREIGN KEY (routine_id) REFERENCES routines(id) ON DELETE CASCADE,
                                              FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS workout_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    routine_id INTEGER NOT NULL,
    date TEXT NOT NULL,
    completed_at DATETIME,
    notes TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                                             FOREIGN KEY (routine_id) REFERENCES routines(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS workout_session_sets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id INTEGER NOT NULL,
    exercise_id INTEGER NOT NULL,
    set_number INTEGER NOT NULL,
    weight REAL NOT NULL,
    reps INTEGER NOT NULL,
    is_warmup BOOLEAN DEFAULT 0,
    is_failure BOOLEAN DEFAULT 0,
    notes TEXT,
    FOREIGN KEY (session_id) REFERENCES workout_sessions(id) ON DELETE CASCADE,
                                                 FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE
);
`);

// Add missing columns (safe, no drops)
try {
    const weightCols = db.prepare(`PRAGMA table_info(weight_logs)`).all() as { name: string }[];
    if (!weightCols.some(c => c.name === 'user_id')) {
        db.exec(`ALTER TABLE weight_logs ADD COLUMN user_id INTEGER NOT NULL DEFAULT 1`);
    }
} catch (e) { /* ignore */ }

try {
    const workoutCols = db.prepare(`PRAGMA table_info(workout_sets)`).all() as { name: string }[];
    if (!workoutCols.some(c => c.name === 'user_id')) {
        db.exec(`ALTER TABLE workout_sets ADD COLUMN user_id INTEGER NOT NULL DEFAULT 1`);
    }
} catch (e) { /* ignore */ }

try {
    const userCols = db.prepare(`PRAGMA table_info(users)`).all() as { name: string }[];
    if (!userCols.some(c => c.name === 'weight_goal')) {
        db.exec(`ALTER TABLE users ADD COLUMN weight_goal REAL`);
    }
    if (!userCols.some(c => c.name === 'age')) {
        db.exec(`ALTER TABLE users ADD COLUMN age INTEGER`);
    }
    if (!userCols.some(c => c.name === 'gender')) {
        db.exec(`ALTER TABLE users ADD COLUMN gender TEXT`);
    }
    if (!userCols.some(c => c.name === 'height_cm')) {
        db.exec(`ALTER TABLE users ADD COLUMN height_cm REAL`);
    }
    if (!userCols.some(c => c.name === 'default_exercise_id')) {
        db.exec(`ALTER TABLE users ADD COLUMN default_exercise_id INTEGER`);
    }
} catch (e) { /* ignore */ }

// Migrate weight_logs to composite primary key (date, user_id)
try {
    db.exec(`
    CREATE TABLE weight_logs_new (
        date TEXT NOT NULL,
        weight REAL NOT NULL,
        user_id INTEGER NOT NULL,
        PRIMARY KEY (date, user_id)
    );
    INSERT INTO weight_logs_new (date, weight, user_id) SELECT date, weight, user_id FROM weight_logs;
    DROP TABLE weight_logs;
    ALTER TABLE weight_logs_new RENAME TO weight_logs;
    `);
} catch (e) {
    // Already migrated – ignore
}

// Insert default user if missing
db.prepare(`INSERT OR IGNORE INTO users (id, name) VALUES (1, 'Default User')`).run();

// Seed default settings
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

// ========== USER MANAGEMENT ==========
export async function getUsers() {
    return db.prepare(`SELECT id, name FROM users ORDER BY name`).all() as { id: number; name: string }[];
}

export async function addUser(name: string) {
    const existing = db.prepare(`SELECT id FROM users WHERE name = ?`).get(name);
    if (existing) throw new Error("User name already exists");
    const info = db.prepare(`INSERT INTO users (name) VALUES (?)`).run(name.trim());
    const newUserId = info.lastInsertRowid as number;
    const defaultExercises = ['Bench Press', 'Squat', 'Deadlift', 'Overhead Press'];
    const insertExercise = db.prepare(`INSERT INTO exercises (name, user_id) VALUES (?, ?)`);
    for (const ex of defaultExercises) {
        insertExercise.run(ex, newUserId);
    }
    revalidatePath('/');
}

export async function updateUserName(userId: number, newName: string) {
    const existing = db.prepare(`SELECT id FROM users WHERE name = ? AND id != ?`).get(newName, userId);
    if (existing) throw new Error("Another user already has that name");
    db.prepare(`UPDATE users SET name = ? WHERE id = ?`).run(newName.trim(), userId);
    revalidatePath('/');
}

export async function deleteUser(userId: number) {
    const count = db.prepare(`SELECT COUNT(*) as count FROM users`).get() as { count: number };
    if (count.count <= 1) throw new Error("Cannot delete the only user");
    db.prepare(`DELETE FROM weight_logs WHERE user_id = ?`).run(userId);
    db.prepare(`DELETE FROM workout_sets WHERE user_id = ?`).run(userId);
    db.prepare(`DELETE FROM exercises WHERE user_id = ?`).run(userId);
    db.prepare(`DELETE FROM progress_photos WHERE user_id = ?`).run(userId);
    db.prepare(`DELETE FROM users WHERE id = ?`).run(userId);
    revalidatePath('/');
}

export async function setDefaultExercise(userId: number, exerciseId: number | null) {
    db.prepare(`UPDATE users SET default_exercise_id = ? WHERE id = ?`).run(exerciseId, userId);
    revalidatePath('/');
}

export async function getDefaultExercise(userId: number): Promise<number | null> {
    const row = db.prepare(`SELECT default_exercise_id FROM users WHERE id = ?`).get(userId) as { default_exercise_id: number | null } | undefined;
    return row?.default_exercise_id ?? null;
}

// ========== WEIGHT GOAL (PER USER) ==========
export async function setWeightGoal(userId: number, goal: number) {
    db.prepare(`UPDATE users SET weight_goal = ? WHERE id = ?`).run(goal, userId);
    revalidatePath('/');
}

export async function getWeightGoal(userId: number): Promise<number | null> {
    const row = db.prepare(`SELECT weight_goal FROM users WHERE id = ?`).get(userId) as { weight_goal: number | null } | undefined;
    return row?.weight_goal ?? null;
}

// ========== ATHLETE PROFILE (PER USER) ==========
export async function getUserProfile(userId: number) {
    const row = db.prepare(`SELECT age, gender, height_cm FROM users WHERE id = ?`).get(userId) as { age: number | null; gender: string | null; height_cm: number | null } | undefined;
    return {
        age: row?.age ?? null,
        gender: row?.gender ?? null,
        height_cm: row?.height_cm ?? null,
    };
}

export async function updateUserProfile(userId: number, age: number | null, gender: string | null, height_cm: number | null) {
    db.prepare(`UPDATE users SET age = ?, gender = ?, height_cm = ? WHERE id = ?`).run(age, gender, height_cm, userId);
    revalidatePath('/');
}

// ========== SETTINGS ==========
export async function updateSetting(key: string, value: string) {
    db.prepare(`INSERT INTO user_settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value`).run(key, value);
    revalidatePath('/');
}

export async function getUserSettings(): Promise<Record<string, string>> {
    const rows = db.prepare(`SELECT key, value FROM user_settings`).all() as { key: string; value: string }[];
    return rows.reduce((acc, row) => ({ ...acc, [row.key]: row.value }), {});
}

// ========== WEIGHT LOGS ==========
export async function logWeight(date: string, weight: number, userId: number) {
    db.prepare(`INSERT INTO weight_logs (date, weight, user_id) VALUES (?, ?, ?) ON CONFLICT(date, user_id) DO UPDATE SET weight = excluded.weight`)
    .run(date, weight, userId);
    revalidatePath('/');
}

export async function deleteWeight(date: string, userId: number) {
    db.prepare(`DELETE FROM weight_logs WHERE date = ? AND user_id = ?`).run(date, userId);
    revalidatePath('/');
}

// ========== EXERCISES ==========
export async function createExercise(name: string, userId: number) {
    try {
        db.prepare(`INSERT INTO exercises (name, user_id) VALUES (?, ?)`).run(name.trim(), userId);
        revalidatePath('/');
    } catch (e) {
        throw new Error("Exercise already exists for this user.");
    }
}

export async function deleteExercise(id: number, userId: number) {
    db.prepare(`DELETE FROM exercises WHERE id = ? AND user_id = ?`).run(id, userId);
    revalidatePath('/');
}

// ========== WORKOUT SETS ==========
export async function logWorkoutSet(date: string, exerciseId: number, weight: number, reps: number, userId: number, formula: 'brzycki' | 'epley' = 'brzycki') {
    let estimated_1rm = weight;
    if (reps > 1) {
        estimated_1rm = formula === 'epley'
        ? weight * (1 + reps / 30)
        : weight / (1.0278 - 0.0278 * reps);
    }
    estimated_1rm = Math.round(estimated_1rm * 10) / 10;
    db.prepare(`
    INSERT INTO workout_sets (date, exercise_id, weight, reps, estimated_1rm, user_id)
    VALUES (?, ?, ?, ?, ?, ?)
    `).run(date, exerciseId, weight, reps, estimated_1rm, userId);
    revalidatePath('/');
}

export async function deleteWorkoutSet(id: number, userId: number) {
    db.prepare(`DELETE FROM workout_sets WHERE id = ? AND user_id = ?`).run(id, userId);
    revalidatePath('/');
}

// ========== PROGRESS PHOTOS ==========
export async function savePhoto(userId: number, id: string, date: string, url: string, caption: string) {
    db.prepare(`INSERT INTO progress_photos (id, user_id, date, url, caption) VALUES (?, ?, ?, ?, ?)`)
    .run(id, userId, date, url, caption);
    revalidatePath('/');
}

export async function getPhotos(userId: number) {
    return db.prepare(`SELECT id, date, url, caption FROM progress_photos WHERE user_id = ? ORDER BY date DESC`).all(userId);
}

export async function deletePhoto(id: string, userId: number) {
    db.prepare(`DELETE FROM progress_photos WHERE id = ? AND user_id = ?`).run(id, userId);
    revalidatePath('/');
}

// ========== DASHBOARD DATA ==========
export async function getDashboardData(selectedExerciseId?: number, userId?: number) {
    if (!userId) throw new Error("userId required");
    const settings = await getUserSettings() as UserSettings;
    const isImperial = settings.weight_unit === 'lbs';

    const weightRows = db.prepare(`SELECT date, weight FROM weight_logs WHERE user_id = ? ORDER BY date ASC`).all(userId) as { date: string; weight: number }[];
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

    const exercises = db.prepare(`SELECT id, name FROM exercises WHERE user_id = ? ORDER BY name ASC`).all(userId) as Exercise[];
    const activeExerciseId = selectedExerciseId || exercises[0]?.id || 0;

    // Get actual 1RM (reps=1) for each date, or fallback to heaviest weight that day
    const chartSets = db.prepare(`
    SELECT date,
    MAX(CASE WHEN reps = 1 THEN weight ELSE NULL END) as actual_1rm,
                                 MAX(weight) as max_weight
                                 FROM workout_sets
                                 WHERE exercise_id = ? AND user_id = ?
                                 GROUP BY date
                                 ORDER BY date ASC
                                 `).all(activeExerciseId, userId) as { date: string; actual_1rm: number | null; max_weight: number }[];

                                 const formattedChartSets = chartSets.map(s => {
                                     let value = s.actual_1rm !== null ? s.actual_1rm : s.max_weight;
                                     if (isImperial) value = value * 2.20462;
                                     return {
                                         date: s.date,
                                         estimated_1rm: Math.round(value * 10) / 10,
                                                                          is_actual: s.actual_1rm !== null   // used for tooltip
                                     };
                                 });

    const fullHistoryFeed = db.prepare(`
    SELECT w.id, w.date, w.exercise_id, w.weight, w.reps, w.estimated_1rm, e.name as exercise_name
    FROM workout_sets w
    JOIN exercises e ON w.exercise_id = e.id
    WHERE w.user_id = ?
    ORDER BY w.date DESC, w.id DESC
    `).all(userId) as WorkoutSet[];

    const formattedHistoryFeed = fullHistoryFeed.map(set => ({
        ...set,
        weight: Math.round((isImperial ? set.weight * 2.20462 : set.weight) * 10) / 10,
                                                             estimated_1rm: Math.round((isImperial ? set.estimated_1rm * 2.20462 : set.estimated_1rm) * 10) / 10
    }));

    const latestWeight = weightData[weightData.length - 1]?.weight || 0;
    const prevWeight = weightData[weightData.length - 2]?.weight || 0;
    const weightChange = latestWeight && prevWeight ? Math.round((latestWeight - prevWeight) * 10) / 10 : 0;

    const highestRow = db.prepare(`SELECT MAX(estimated_1rm) as max1rm FROM workout_sets WHERE exercise_id = ? AND user_id = ?`).get(activeExerciseId, userId) as { max1rm: number | null };
    const maxBench1RM = highestRow?.max1rm ? (isImperial ? highestRow.max1rm * 2.20462 : highestRow.max1rm) : 0;

    const latestDateRow = db.prepare(`SELECT date FROM workout_sets WHERE exercise_id = ? AND user_id = ? ORDER BY date DESC LIMIT 1`).get(activeExerciseId, userId) as { date: string } | undefined;
    let currentBench1RM = 0;
    if (latestDateRow) {
        const currentMaxRow = db.prepare(`SELECT MAX(estimated_1rm) as max_1rm FROM workout_sets WHERE exercise_id = ? AND date = ? AND user_id = ?`).get(activeExerciseId, latestDateRow.date, userId) as { max_1rm: number | null };
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
// ========== WORKOUT ROUTINES ==========
export async function getRoutines(userId: number) {
    return db.prepare(`SELECT * FROM routines WHERE user_id = ? ORDER BY created_at DESC`).all(userId);
}

export async function getRoutine(userId: number, routineId: number) {
    const routine = db.prepare(`SELECT * FROM routines WHERE id = ? AND user_id = ?`).get(routineId, userId);
    if (!routine) return null;
    const exercises = db.prepare(`
    SELECT re.*, e.name as exercise_name
    FROM routine_exercises re
    JOIN exercises e ON re.exercise_id = e.id
    WHERE re.routine_id = ?
    ORDER BY re.order_index
    `).all(routineId);
    return { ...routine, exercises };
}

export async function createRoutine(userId: number, name: string) {
    const info = db.prepare(`INSERT INTO routines (user_id, name) VALUES (?, ?)`).run(userId, name);
    return info.lastInsertRowid;
}

export async function updateRoutine(userId: number, routineId: number, name: string, exercises: any[]) {
    db.prepare(`UPDATE routines SET name = ? WHERE id = ? AND user_id = ?`).run(name, routineId, userId);
    db.prepare(`DELETE FROM routine_exercises WHERE routine_id = ?`).run(routineId);
    const insert = db.prepare(`INSERT INTO routine_exercises (routine_id, exercise_id, order_index, target_sets, target_reps, target_weight, rest_seconds) VALUES (?, ?, ?, ?, ?, ?, ?)`);
    for (const ex of exercises) {
        insert.run(routineId, ex.exercise_id, ex.order_index, ex.target_sets, ex.target_reps, ex.target_weight || null, ex.rest_seconds || 60);
    }
    revalidatePath('/');
}

export async function deleteRoutine(userId: number, routineId: number) {
    db.prepare(`DELETE FROM routines WHERE id = ? AND user_id = ?`).run(routineId, userId);
    revalidatePath('/');
}

// ========== WORKOUT SESSIONS ==========
export async function startWorkoutSession(userId: number, routineId: number) {
    const date = new Date().toISOString().split('T')[0];
    const info = db.prepare(`INSERT INTO workout_sessions (user_id, routine_id, date) VALUES (?, ?, ?)`).run(userId, routineId, date);
    return info.lastInsertRowid;
}

export async function getActiveSession(userId: number, sessionId: number) {
    return db.prepare(`SELECT * FROM workout_sessions WHERE id = ? AND user_id = ?`).get(sessionId, userId);
}

export async function logSessionSet(sessionId: number, exerciseId: number, setNumber: number, weight: number, reps: number, isWarmup: boolean, isFailure: boolean) {
    db.prepare(`
    INSERT INTO workout_session_sets (session_id, exercise_id, set_number, weight, reps, is_warmup, is_failure)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(sessionId, exerciseId, setNumber, weight, reps, isWarmup ? 1 : 0, isFailure ? 1 : 0);
    revalidatePath('/');
}

export async function completeWorkoutSession(sessionId: number, notes?: string) {
    // Mark session completed
    db.prepare(`UPDATE workout_sessions SET completed_at = CURRENT_TIMESTAMP, notes = ? WHERE id = ?`).run(notes || null, sessionId);

    // Get session details
    const session = db.prepare(`SELECT user_id, date, routine_id FROM workout_sessions WHERE id = ?`).get(sessionId);
    if (!session) return;

    // Get all sets of this session
    const sets = db.prepare(`SELECT * FROM workout_session_sets WHERE session_id = ?`).all(sessionId);

    // Insert each set into workout_sets (for history and analytics)
    const insertSet = db.prepare(`INSERT INTO workout_sets (date, exercise_id, weight, reps, estimated_1rm, user_id) VALUES (?, ?, ?, ?, ?, ?)`);
    for (const set of sets) {
        const estimated_1rm = set.reps > 1 ? Math.round(set.weight * (1 + set.reps / 30) * 10) / 10 : set.weight;
        insertSet.run(session.date, set.exercise_id, set.weight, set.reps, estimated_1rm, session.user_id);
    }

    revalidatePath('/');
}

export async function getLastSuccessfulWeight(userId: number, exerciseId: number) {
    const row = db.prepare(`
    SELECT weight, reps FROM workout_sets
    WHERE user_id = ? AND exercise_id = ? AND estimated_1rm > 0
    ORDER BY date DESC LIMIT 1
    `).get(userId, exerciseId);
    return row as { weight: number; reps: number } | null;
}

export async function getWorkoutSessions(userId: number) {
    return db.prepare(`
    SELECT ws.*, r.name as routine_name
    FROM workout_sessions ws
    JOIN routines r ON ws.routine_id = r.id
    WHERE ws.user_id = ?
    ORDER BY ws.date DESC
    `).all(userId);
}

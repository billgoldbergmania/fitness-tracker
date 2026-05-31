'use client';

import { getCurrentUserId } from './user-client';
import * as serverActions from './actions';

export async function logWeight(date: string, weight: number) {
    const userId = getCurrentUserId();
    return serverActions.logWeight(date, weight, userId);
}

export async function deleteWeight(date: string) {
    const userId = getCurrentUserId();
    return serverActions.deleteWeight(date, userId);
}

export async function createExercise(name: string) {
    const userId = getCurrentUserId();
    return serverActions.createExercise(name, userId);
}

export async function deleteExercise(id: number) {
    const userId = getCurrentUserId();
    return serverActions.deleteExercise(id, userId);
}

export async function logWorkoutSet(date: string, exerciseId: number, weight: number, reps: number, formula?: 'brzycki' | 'epley') {
    const userId = getCurrentUserId();
    return serverActions.logWorkoutSet(date, exerciseId, weight, reps, userId, formula);
}

export async function deleteWorkoutSet(id: number) {
    const userId = getCurrentUserId();
    return serverActions.deleteWorkoutSet(id, userId);
}

export async function getDashboardData(selectedExerciseId?: number) {
    const userId = getCurrentUserId();
    return serverActions.getDashboardData(selectedExerciseId, userId);
}

export async function getUsers() {
    return serverActions.getUsers();
}

export async function addUser(name: string) {
    return serverActions.addUser(name);
}

export async function updateUserName(userId: number, newName: string) {
    return serverActions.updateUserName(userId, newName);
}

export async function deleteUser(userId: number) {
    return serverActions.deleteUser(userId);
}

export async function setWeightGoal(goal: number) {
    const userId = getCurrentUserId();
    return serverActions.setWeightGoal(userId, goal);
}

export async function getWeightGoal() {
    const userId = getCurrentUserId();
    return serverActions.getWeightGoal(userId);
}

// Athlete profile
export async function getUserProfile() {
    const userId = getCurrentUserId();
    return serverActions.getUserProfile(userId);
}

export async function updateUserProfile(age: number | null, gender: string | null, height_cm: number | null) {
    const userId = getCurrentUserId();
    return serverActions.updateUserProfile(userId, age, gender, height_cm);
}

// Photos
export async function savePhoto(id: string, date: string, url: string, caption: string) {
    const userId = getCurrentUserId();
    return serverActions.savePhoto(userId, id, date, url, caption);
}

export async function getPhotos() {
    const userId = getCurrentUserId();
    return serverActions.getPhotos(userId);
}

export async function deletePhoto(id: string) {
    const userId = getCurrentUserId();
    return serverActions.deletePhoto(id, userId);
}

export async function setDefaultExercise(exerciseId: number | null) {
    const userId = getCurrentUserId();
    return serverActions.setDefaultExercise(userId, exerciseId);
}

export async function getDefaultExercise() {
    const userId = getCurrentUserId();
    return serverActions.getDefaultExercise(userId);
}
// ========== WORKOUT ROUTINES ==========
export async function getRoutines() {
    const userId = getCurrentUserId();
    return serverActions.getRoutines(userId);
}

export async function getRoutine(routineId: number) {
    const userId = getCurrentUserId();
    return serverActions.getRoutine(userId, routineId);
}

export async function createRoutine(name: string) {
    const userId = getCurrentUserId();
    return serverActions.createRoutine(userId, name);
}

export async function updateRoutine(routineId: number, name: string, exercises: any[]) {
    const userId = getCurrentUserId();
    return serverActions.updateRoutine(userId, routineId, name, exercises);
}

export async function deleteRoutine(routineId: number) {
    const userId = getCurrentUserId();
    return serverActions.deleteRoutine(userId, routineId);
}

// ========== WORKOUT SESSIONS ==========
export async function startWorkoutSession(routineId: number) {
    const userId = getCurrentUserId();
    return serverActions.startWorkoutSession(userId, routineId);
}

export async function getActiveSession(sessionId: number) {
    const userId = getCurrentUserId();
    return serverActions.getActiveSession(userId, sessionId);
}

export async function logSessionSet(sessionId: number, exerciseId: number, setNumber: number, weight: number, reps: number, isWarmup: boolean, isFailure: boolean) {
    return serverActions.logSessionSet(sessionId, exerciseId, setNumber, weight, reps, isWarmup, isFailure);
}

export async function completeWorkoutSession(sessionId: number, notes?: string) {
    return serverActions.completeWorkoutSession(sessionId, notes);
}

export async function getLastSuccessfulWeight(exerciseId: number) {
    const userId = getCurrentUserId();
    return serverActions.getLastSuccessfulWeight(userId, exerciseId);
}

export async function getWorkoutSessions() {
    const userId = getCurrentUserId();
    return serverActions.getWorkoutSessions(userId);
}

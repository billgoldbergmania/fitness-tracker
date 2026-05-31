const STORAGE_KEY = 'trackerbuddy_current_user_id';

export function setCurrentUserId(userId: number) {
    if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, userId.toString());
    }
}

export function getCurrentUserId(): number {
    if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) return parseInt(stored);
    }
    return 1;
}

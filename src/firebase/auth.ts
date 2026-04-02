import { signInAnonymously, onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './firebaseConfig';

function getOfflineUid(): string {
    const key = 'velocity_offline_uid';
    try {
        let id = sessionStorage.getItem(key);
        if (!id) {
            id =
                typeof crypto !== 'undefined' && 'randomUUID' in crypto
                    ? `offline_${crypto.randomUUID()}`
                    : `offline_${Date.now()}`;
            sessionStorage.setItem(key, id);
        }
        return id;
    } catch {
        return `offline_${Date.now()}`;
    }
}

/**
 * UID for Firestore sync: Firebase user when available, stable offline id otherwise.
 */
export function getPlayerIdForSync(): string {
    return auth.currentUser?.uid ?? getOfflineUid();
}

/**
 * Never blocks game startup. Invalid API keys on Vercel only log a warning.
 */
export function startAuthInBackground(): void {
    try {
        const unsub = onAuthStateChanged(auth, async (user: User | null) => {
            if (user) return;
            try {
                await signInAnonymously(auth);
            } catch (error) {
                console.warn('Firebase: anonymous sign-in skipped (offline or invalid config).', error);
                unsub();
            }
        });
    } catch (error) {
        console.warn('Firebase: auth not available.', error);
    }
}

import { doc, setDoc, getDocs, collection, query, orderBy, limit, serverTimestamp } from 'firebase/firestore';
import { db } from './firebaseConfig';

export interface UserProfile {
    uid: string;
    level: number;
    xp: number;
    stars: number;
    updatedAt: any;
}

/**
 * Synchronizes player progress to Firestore with offline-first support.
 */
export async function syncProfile(uid: string, level: number, xp: number, stars: number): Promise<void> {
    const userRef = doc(db, 'users', uid);
    
    // Firestore automatically handles offline caching and background syncing
    await setDoc(userRef, {
        uid,
        level,
        xp,
        stars,
        updatedAt: serverTimestamp()
    }, { merge: true });

    console.log(`Firebase: Profile synced for ${uid} (Level ${level}, Stars ${stars})`);
}

/**
 * Fetches the global top 50 leaderboard by stars.
 */
export async function getGlobalLeaderboard(): Promise<UserProfile[]> {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, orderBy('stars', 'desc'), limit(50));
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => d.data() as UserProfile);
}

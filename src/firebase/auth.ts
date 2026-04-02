import { signInAnonymously, onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './firebaseConfig';

/**
 * Handles anonymous authentication for first-time players.
 */
export async function initAuth(): Promise<User> {
    return new Promise((resolve, reject) => {
        onAuthStateChanged(auth, async (user: User | null) => {
            if (user) {
                console.log(`Firebase: User signed in as ${user.uid}`);
                resolve(user);
            } else {
                try {
                    const credential = await signInAnonymously(auth);
                    console.log('Firebase: Anonymous login successful.');
                    resolve(credential.user);
                } catch (error) {
                    console.error('Firebase Auth Error:', error);
                    reject(error);
                }
            }
        });
    });
}

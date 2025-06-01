import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';

export async function ensureUserDocument(userId: string) {
    try {
        if (!db) {
            throw new Error('Firebase is not initialized');
        }

        if (!auth?.currentUser) {
            throw new Error('No authenticated user');
        }

        // Verify that the current user matches the requested userId
        if (auth.currentUser.uid !== userId) {
            throw new Error('User ID mismatch');
        }

        console.log('Ensuring user document for:', userId);
        const userRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userRef);

        if (!userDoc.exists()) {
            console.log('Creating new user document for:', userId);
            const userData = {
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                email: auth.currentUser.email,
                displayName: auth.currentUser.displayName || '',
                lastActive: serverTimestamp(),
                uid: userId // Add uid field for additional security
            };
            
            try {
                await setDoc(userRef, userData);
                console.log('User document created successfully');
            } catch (error) {
                console.error('Error creating user document:', error);
                if (error instanceof Error) {
                    console.error('Error details:', {
                        message: error.message,
                        name: error.name,
                        stack: error.stack
                    });
                }
                throw new Error('Failed to create user document: ' + (error instanceof Error ? error.message : 'Unknown error'));
            }
        } else {
            console.log('Updating existing user document for:', userId);
            try {
                await setDoc(userRef, {
                    lastActive: serverTimestamp(),
                    updatedAt: serverTimestamp(),
                    email: auth.currentUser.email,
                    displayName: auth.currentUser.displayName || ''
                }, { merge: true });
                console.log('User document updated successfully');
            } catch (error) {
                console.error('Error updating user document:', error);
                if (error instanceof Error) {
                    console.error('Error details:', {
                        message: error.message,
                        name: error.name,
                        stack: error.stack
                    });
                }
                throw new Error('Failed to update user document: ' + (error instanceof Error ? error.message : 'Unknown error'));
            }
        }
    } catch (error) {
        console.error('Error in ensureUserDocument:', error);
        if (error instanceof Error) {
            console.error('Error details:', {
                message: error.message,
                name: error.name,
                stack: error.stack
            });
        }
        throw error;
    }
} 

"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, User, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, onSnapshot, setDoc, Timestamp, updateDoc, increment } from 'firebase/firestore';
import type { AuthCredential } from '@/types';
import { useRouter } from 'next/navigation';

interface Subscription {
  status: 'subscribed' | 'unsubscribed';
  planId: string | null;
  endDate: Date | null;
  monthlyStoryLimit: number;
  storiesGeneratedThisMonth: number;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  subscription: Subscription;
  signUp: (credentials: AuthCredential) => Promise<any>;
  signIn: (credentials: AuthCredential) => Promise<any>;
  logOut: () => void;
  incrementStoryCount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<Subscription>({
    status: 'unsubscribed',
    planId: null,
    endDate: null,
    monthlyStoryLimit: 0,
    storiesGeneratedThisMonth: 0,
  });
  const router = useRouter();

  useEffect(() => {
    if (!auth || !db) {
      console.warn("Firebase is not configured. Please add your Firebase credentials to your .env file. Auth features are disabled.");
      setLoading(false);
      setSubscription({ status: 'unsubscribed', planId: null, endDate: null, monthlyStoryLimit: 0, storiesGeneratedThisMonth: 0 });
      return;
    }

    let userSubscriptionUnsubscribe: (() => void) | undefined;

    const authUnsubscribe = onAuthStateChanged(auth, (user) => {
      if (userSubscriptionUnsubscribe) {
        userSubscriptionUnsubscribe();
      }

      setUser(user);
      
      if (user && db) { // <-- Added check for db
        const userDocRef = doc(db, 'users', user.uid);
        
        userSubscriptionUnsubscribe = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            const userData = docSnap.data();
            const endDate = (userData.subscriptionEndDate as Timestamp)?.toDate();
            const isStillSubscribed = userData.subscriptionStatus === 'subscribed' && endDate && endDate > new Date();

            if (isStillSubscribed) {
              setSubscription({
                status: 'subscribed',
                planId: userData.planId || null,
                endDate: endDate,
                monthlyStoryLimit: userData.monthlyStoryLimit || 0,
                storiesGeneratedThisMonth: userData.storiesGeneratedThisMonth || 0,
              });
            } else {
              setSubscription({ status: 'unsubscribed', planId: null, endDate: null, monthlyStoryLimit: 0, storiesGeneratedThisMonth: 0 });
            }
          } else {
            setSubscription({ status: 'unsubscribed', planId: null, endDate: null, monthlyStoryLimit: 0, storiesGeneratedThisMonth: 0 });
          }
          setLoading(false);
        }, (error) => {
          console.error("Error fetching user subscription status:", error);
          setSubscription({ status: 'unsubscribed', planId: null, endDate: null, monthlyStoryLimit: 0, storiesGeneratedThisMonth: 0 });
          setLoading(false);
        });

      } else {
        setSubscription({ status: 'unsubscribed', planId: null, endDate: null, monthlyStoryLimit: 0, storiesGeneratedThisMonth: 0 });
        setLoading(false);
      }
    });

    return () => {
        authUnsubscribe();
        if (userSubscriptionUnsubscribe) {
            userSubscriptionUnsubscribe();
        }
    };
  }, []);

  const signUp = async (credentials: AuthCredential) => {
    if (!auth || !db) return Promise.reject(new Error("Firebase is not configured."));
    const userCredential = await createUserWithEmailAndPassword(auth, credentials.email, credentials.password);
    const user = userCredential.user;

    await setDoc(doc(db, "users", user.uid), {
      email: user.email,
      subscriptionStatus: 'unsubscribed',
      createdAt: new Date(),
      monthlyStoryLimit: 0,
      storiesGeneratedThisMonth: 0,
    });

    return userCredential;
  };

  const signIn = (credentials: AuthCredential) => {
    if (!auth) return Promise.reject(new Error("Firebase is not configured."));
    return signInWithEmailAndPassword(auth, credentials.email, credentials.password);
  };
  
  const incrementStoryCount = async () => {
      if(user && db) {
          const userDocRef = doc(db, 'users', user.uid);
          await updateDoc(userDocRef, {
              storiesGeneratedThisMonth: increment(1),
          });
      }
  };

  const logOut = () => {
    router.push('/');
    if (auth) {
      signOut(auth);
    }
  };

  const value = {
    user,
    loading,
    subscription,
    signUp,
    signIn,
    logOut,
    incrementStoryCount,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

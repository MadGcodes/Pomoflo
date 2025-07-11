// Updated authcontext.tsx with Firebase integration

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile as firebaseUpdateProfile,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { FIREBASE_AUTH, FIREBASE_DB } from '../../firebase.js'; // Adjust the import path as necessary

interface User {
  uid: string;
  email: string;
  displayName: string | null;
  isAdmin: boolean;
  photoURL?: string | null;
}

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string, isAdmin: boolean) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const signUp = async (email: string, password: string, name: string, isAdmin: boolean) => {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(FIREBASE_AUTH, email, password);
      const user = userCredential.user;

      
      // Make sure name is non-empty and a string
      if (!name || typeof name !== "string") {
        throw new Error("Invalid name");
      }


      await firebaseUpdateProfile(user, {
        displayName: name,
      });

      await setDoc(doc(FIREBASE_DB, 'users', user.uid), {
        uid: user.uid,
        email: user.email ?? email,
        displayName: name,
        isAdmin,
      });

      setCurrentUser({
        uid: user.uid,
        email: user.email!,
        displayName: name,
        isAdmin,
        photoURL: user.photoURL,
      });
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(FIREBASE_AUTH, email, password);
      const user = userCredential.user;

      const userDoc = await getDoc(doc(FIREBASE_DB, 'users', user.uid));
      const isAdmin = userDoc.exists() ? userDoc.data().isAdmin : false;

      setCurrentUser({
        uid: user.uid,
        email: user.email!,
        displayName: user.displayName,
        isAdmin,
        photoURL: user.photoURL,
      });
    } catch (error) {
      console.error('Signin error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    await firebaseSignOut(FIREBASE_AUTH);
    setCurrentUser(null);
  };

  const updateProfile = async (data: Partial<User>) => {
    setLoading(true);
    try {
      if (FIREBASE_AUTH.currentUser && data.displayName) {
        await firebaseUpdateProfile(FIREBASE_AUTH.currentUser, {
          displayName: data.displayName,
        });
      }

      if (currentUser) {
        const updatedUser = { ...currentUser, ...data };
        await setDoc(doc(FIREBASE_DB, 'users', currentUser.uid), updatedUser);
        setCurrentUser(updatedUser);
      }
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(FIREBASE_AUTH, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(FIREBASE_DB, 'users', user.uid));
        const isAdmin = userDoc.exists() ? userDoc.data().isAdmin : false;

        setCurrentUser({
          uid: user.uid,
          email: user.email!,
          displayName: user.displayName,
          isAdmin,
          photoURL: user.photoURL,
        });
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider
      value={{ currentUser, loading, signIn, signUp, signOut, updateProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
};

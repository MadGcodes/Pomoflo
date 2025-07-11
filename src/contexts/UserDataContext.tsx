import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';  // Make sure the `AuthContext` provides `currentUser`
import { FIREBASE_DB } from '../../firebase';
import { doc, setDoc, getDoc, onSnapshot, collection, addDoc, deleteDoc } from 'firebase/firestore';

// Define types for our user data context
interface DailyProgress {
  date: string; // YYYY-MM-DD format
  studyHours: number;
  pomodoros: number;
}

interface Note {
  id: string;
  content: string;
  imageUrl?: string;
  createdAt: number;
}

export interface UserProfile {
  uid: string; // User ID, must be required now
  nickname: string;
  areaOfStudy: string;
  goals: string;
  totalStudyHours: number;
  totalPomodoros: number;
  dailyProgress: DailyProgress[];
  notes: Note[];
}

interface UserDataContextType {
  profile: UserProfile | null;
  isLoading: boolean;
  updateProfile: (data: Partial<UserProfile>) => void;
  addStudyTime: (seconds: number) => void;
  incrementPomodoro: () => void;
  addNote: (content: string, imageUrl?: string) => void;
  deleteNote: (id: string) => void;
}

// Default profile
const defaultProfile: UserProfile = {
  uid: '', // Initially empty, but will be filled when user logs in
  nickname: '',
  areaOfStudy: '',
  goals: '',
  totalStudyHours: 0,
  totalPomodoros: 0,
  dailyProgress: [],
  notes: [],
};

// Create the context
const UserDataContext = createContext<UserDataContextType | null>(null);

// Custom hook to use the user data context
export const useUserData = () => {
  const context = useContext(UserDataContext);
  if (!context) {
    throw new Error('useUserData must be used within a UserDataProvider');
  }
  return context;
};

// User data provider component
export const UserDataProvider = ({ children }: { children: ReactNode }) => {
  const { currentUser } = useAuth(); // Ensure currentUser is not null and has uid
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load profile when user changes
  useEffect(() => {
    const loadProfile = async () => {
      setIsLoading(true);
      if (currentUser) {
        try {
          const userDocRef = doc(FIREBASE_DB, "users", currentUser.uid);
          const userSnapshot = await getDoc(userDocRef);
          if (userSnapshot.exists()) {
            const userProfile = userSnapshot.data() as UserProfile;
            setProfile(userProfile);
          } else {
            const newProfile = { ...defaultProfile, uid: currentUser.uid };
            setProfile(newProfile);
            // 👇 THIS IS MISSING: Save the new profile to Firestore
            await setDoc(userDocRef, newProfile); // Save the new profile
          }

          // Real-time sync for notes
          const notesRef = collection(FIREBASE_DB, "users", currentUser.uid, "notes");
          onSnapshot(notesRef, (snapshot) => {
            const notes: Note[] = snapshot.docs.map(doc => {
              const noteData = doc.data();
              return {
                id: doc.id,
                content: noteData.content,
                imageUrl: noteData.imageUrl, // this might be undefined if it's not available
                createdAt: noteData.createdAt,
              };
            });
            setProfile(prev => prev ? { ...prev, notes } : prev);
          });
        } catch (error) {
          console.error("Failed to load profile:", error);
          setProfile(defaultProfile);
        }
      } else {
        setProfile(null);
      }
      setIsLoading(false);
    };

    loadProfile();
  }, [currentUser]);

  // Save profile data to Firestore
  const saveProfileToFirestore = async (updatedProfile: UserProfile) => {
    if (!currentUser) return;
    try {
      const userDocRef = doc(FIREBASE_DB, "users", currentUser.uid);
      await setDoc(userDocRef, updatedProfile, { merge: true });
    } catch (error) {
      console.error("Error saving profile:", error);
    }
  };

  const updateProfile = (data: Partial<UserProfile>) => {
    if (!profile) return;

    const updatedProfile = { ...profile, ...data };
    setProfile(updatedProfile);
    saveProfileToFirestore(updatedProfile);
  };

  const addStudyTime = (seconds: number) => {
    if (!profile || !currentUser) return;

    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const hours = seconds / 3600; // Convert seconds to hours

    setProfile(prev => {
      if (!prev) return null;

      // Update daily progress
      let updatedDailyProgress = [...prev.dailyProgress];
      const todayIndex = updatedDailyProgress.findIndex(day => day.date === today);

      if (todayIndex >= 0) {
        // Update existing entry
        updatedDailyProgress[todayIndex] = {
          ...updatedDailyProgress[todayIndex],
          studyHours: updatedDailyProgress[todayIndex].studyHours + hours
        };
      } else {
        // Create new entry for today
        updatedDailyProgress.push({
          date: today,
          studyHours: hours,
          pomodoros: 0
        });
      }

      const updatedProfile = {
        ...prev,
        totalStudyHours: parseFloat((prev.totalStudyHours + hours).toFixed(2)),
        dailyProgress: updatedDailyProgress
      };

      saveProfileToFirestore(updatedProfile); // Sync with Firestore

      return updatedProfile;
    });
  };

  const incrementPomodoro = () => {
    if (!profile || !currentUser) return;

    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    setProfile(prev => {
      if (!prev) return null;

      // Update daily progress
      let updatedDailyProgress = [...prev.dailyProgress];
      const todayIndex = updatedDailyProgress.findIndex(day => day.date === today);

      if (todayIndex >= 0) {
        // Update existing entry
        updatedDailyProgress[todayIndex] = {
          ...updatedDailyProgress[todayIndex],
          pomodoros: updatedDailyProgress[todayIndex].pomodoros + 1
        };
      } else {
        // Create new entry for today
        updatedDailyProgress.push({
          date: today,
          studyHours: 0,
          pomodoros: 1
        });
      }

      const updatedProfile = {
        ...prev,
        totalPomodoros: prev.totalPomodoros + 1,
        dailyProgress: updatedDailyProgress
      };

      saveProfileToFirestore(updatedProfile); // Sync with Firestore

      return updatedProfile;
    });
  };

  const addNote = async (content: string, imageUrl?: string) => {
    if (!profile || !currentUser) return;

    const newNote = {
      content,
      imageUrl,
      createdAt: Date.now(),
    };

    try {
      const notesRef = collection(FIREBASE_DB, "users", currentUser.uid, "notes");
      const docRef = await addDoc(notesRef, newNote);
      const newNoteWithId = { id: docRef.id, ...newNote };

      setProfile(prev => prev ? { ...prev, notes: [newNoteWithId, ...prev.notes] } : prev);
    } catch (error) {
      console.error("Error adding note:", error);
    }
  };

  const deleteNote = async (id: string) => {
    if (!profile || !currentUser) return;

    try {
      const noteRef = doc(FIREBASE_DB, "users", currentUser.uid, "notes", id);
      await deleteDoc(noteRef);
      setProfile(prev => prev ? { ...prev, notes: prev.notes.filter(note => note.id !== id) } : prev);
    } catch (error) {
      console.error("Error deleting note:", error);
    }
  };

  const value = {
    profile,
    isLoading,
    updateProfile,
    addStudyTime,
    incrementPomodoro,
    addNote,
    deleteNote
  };

  return <UserDataContext.Provider value={value}>{children}</UserDataContext.Provider>;
};

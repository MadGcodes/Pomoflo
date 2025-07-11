import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useRef,
} from 'react';
import { useToast } from "@/hooks/use-toast";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
} from 'firebase/firestore';
import { FIREBASE_AUTH as auth, FIREBASE_DB as firestore } from '../../firebase';
import { onAuthStateChanged } from 'firebase/auth';


interface PomodoroSettings {
  pomodoroDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  longBreakInterval: number;
}

interface PomodoroContextType {
  settings: PomodoroSettings;
  currentTimer: 'pomodoro' | 'shortBreak' | 'longBreak';
  isRunning: boolean;
  isPaused: boolean;
  completedPomodoros: number;
  totalSessionTime: number;
  points: number;
  motivationalQuote: string;
  selectedSound: string | null;
  superFocusMode: boolean;
  updateSettings: (newSettings: Partial<PomodoroSettings>) => void;
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  completePomodoro: () => void;
  switchToPomodoro: () => void;
  switchToShortBreak: () => void;
  switchToLongBreak: () => void;
  toggleSuperFocusMode: () => void;
  startQRCodeScanner: () => void;
  setSelectedSound: (soundId: string | null) => void;
  playAmbientSound: (soundId: string) => void;
  stopAmbientSound: () => void;
  isPlayingSound: boolean;
} 

const defaultSettings: PomodoroSettings = {
  pomodoroDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  longBreakInterval: 4,
};

const PomodoroContext = createContext<PomodoroContextType | null>(null);
export const usePomodoro = () => {
  const context = useContext(PomodoroContext);
  if (!context) {
    throw new Error("usePomodoro must be used within PomodoroProvider");
  }
  return context;
};

export const PomodoroProvider = ({ children }: { children: ReactNode }) => {
  const { toast } = useToast();

  const [settings, setSettings] = useState<PomodoroSettings>(defaultSettings);
  const [currentTimer, setCurrentTimer] = useState<'pomodoro' | 'shortBreak' | 'longBreak'>('pomodoro');
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const [totalSessionTime, setTotalSessionTime] = useState(0);
  const [points, setPoints] = useState(0);
  const [motivationalQuote, setMotivationalQuote] = useState("Stay focused and productive!");
  const [selectedSound, setSelectedSound] = useState<string | null>(null);
  const [isPlayingSound, setIsPlayingSound] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [audioPlayer, setAudioPlayer] = useState<HTMLAudioElement | null>(null);
  const [superFocusMode, setSuperFocusMode] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // 🔐 Monitor Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUserId(user?.uid ?? null);
    });
    return () => unsubscribe();
  }, []);

  // 🔄 Load user data from Firestore on login
  useEffect(() => {
    if (!userId) return;

    const userDocRef = doc(firestore, 'users', userId);
    const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setSettings(data.settings ?? defaultSettings);
        setCompletedPomodoros(data.completedPomodoros ?? 0);
        setTotalSessionTime(data.totalSessionTime ?? 0);
        setPoints(data.points ?? 0);
        setSuperFocusMode(data.superFocusMode ?? false);
        setSelectedSound(data.selectedSound ?? 'none');
      }
    });

    return () => unsubscribe();
  }, [userId]);

  // 💾 Save user state to Firestore
  const syncToFirestore = async (updates: Partial<any>) => {
    if (!userId) return;
    const userDocRef = doc(firestore, 'users', userId);
    try {
      await updateDoc(userDocRef, updates);
    } catch {
      await setDoc(userDocRef, updates, { merge: true });
    }
  };

  // 🎯 Fetch motivational quote
  const [wasRunning, setWasRunning] = useState(false);

  useEffect(() => {
    const fallbackQuotes = [
      "Push yourself, because no one else is going to do it for you.",
      "The secret to getting ahead is getting started.",
      "Don’t watch the clock; do what it does. Keep going.",
      "It’s not about having time. It’s about making time.",
      "Success is the sum of small efforts repeated day in and day out.",
      "You don’t have to be extreme, just consistent.",
      "Small progress is still progress.",
      "Your only limit is your mind.",
    ];
  
    const fetchQuote = async () => {
      try {
        const response = await fetch("https://zenquotes.io/api/random");
        const data = await response.json();
        if (data && data[0]?.q && data[0]?.a) {
          setMotivationalQuote(`${data[0].q} — ${data[0].a}`);
        } else {
          throw new Error("Invalid quote format");
        }
      } catch (error) {
        console.error("Failed to fetch quote, using fallback:", error);
        const randomIndex = Math.floor(Math.random() * fallbackQuotes.length);
        setMotivationalQuote(fallbackQuotes[randomIndex]);
      }
    };
  
    if (currentTimer === 'pomodoro' && isRunning && !wasRunning) {
      fetchQuote();
    }
  
    setWasRunning(isRunning);
  }, [currentTimer, isRunning, wasRunning]);
  

  // ⏱ Point system
  useEffect(() => {
    if (totalSessionTime > 0 && totalSessionTime % 300 === 0) {
      setPoints((prev) => {
        const newPoints = prev + 1;
        toast({ title: "+1 Point Earned!", description: "5 minutes of focus time." });
        syncToFirestore({ points: newPoints });
        return newPoints;
      });
    }
  }, [totalSessionTime]);

  // 🔧 Update settings
  const updateSettings = (newSettings: Partial<PomodoroSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      syncToFirestore({ settings: updated });
      return updated;
    });
  };

  const startTimer = () => setIsRunning(true);
  const pauseTimer = () => {
    setIsPaused(true);
    setIsRunning(false);
    toast({ title: "Timer Paused" });
  };
  const resetTimer = () => {
    setIsRunning(false);
    setIsPaused(false);
    setCurrentTimer('pomodoro');
  };

  const completePomodoro = () => {
    const count = completedPomodoros + 1;
    setCompletedPomodoros(count);
    toast({ title: "Pomodoro Completed!", description: `You've done ${count} sessions.` });
    syncToFirestore({ completedPomodoros: count });

    if (count % settings.longBreakInterval === 0) {
      switchToLongBreak();
    } else {
      switchToShortBreak();
    }
  };

  const switchToPomodoro = () => {
    setCurrentTimer('pomodoro');
    resetTimer();
  };

  const switchToShortBreak = () => {
    setCurrentTimer('shortBreak');
    resetTimer();
  };

  const switchToLongBreak = () => {
    setCurrentTimer('longBreak');
    resetTimer();
  };

  const toggleSuperFocusMode = () => {
    setSuperFocusMode((prev) => {
      const updated = !prev;
      syncToFirestore({ superFocusMode: updated });
      toast({
        title: updated ? "Super Focus On" : "Super Focus Off",
        description: updated
          ? "Flip your phone face down to auto-start the timer."
          : "Motion-based trigger disabled.",
      });
      return updated;
    });
  };



// Function to play selected sound
const playAmbientSound = (soundId: string) => {
  const soundOptions = {
    cafe: "/sounds/cafe.mp3",
    waves: "/sounds/waves.mp3",
    white: "/sounds/white.mp3",
    pencil: "/sounds/pencil.mp3",
    lofi: "/sounds/lofi.mp3",
  };

  const src = soundOptions[soundId];
  if (!src) return;

  // Stop previous sound
  if (audioPlayer) {
    audioPlayer.pause();
    audioPlayer.currentTime = 0;
  }

  const newAudio = new Audio(src);
  newAudio.loop = true; // Make sure it loops for ambient sound
  newAudio.play();
  setAudioPlayer(newAudio);
  setIsPlayingSound(true);
  setSelectedSound(soundId);
  syncToFirestore({ selectedSound: soundId });
};

// Function to stop sound
const stopAmbientSound = () => {
  if (audioPlayer) {
    audioPlayer.pause();
    audioPlayer.currentTime = 0;
  }
  setAudioPlayer(null);
  setIsPlayingSound(false);
};



  // 📱 Accelerometer (Super Focus Mode)
  useEffect(() => {
    let lastMovementTime = Date.now();
  
    const handleMotion = (e: DeviceMotionEvent) => {
      if (!superFocusMode) return;
  
      const z = e.accelerationIncludingGravity?.z ?? 0;
      const x = e.accelerationIncludingGravity?.x ?? 0;
      const y = e.accelerationIncludingGravity?.y ?? 0;
  
      const totalAcceleration = Math.sqrt(x * x + y * y + z * z);
  
      const isFaceDown = z < -9;
      const isFaceUp = z > 9;
      const isMovingTooMuch = totalAcceleration > 18; // Adjust sensitivity here
  
      const now = Date.now();
  
      if (isFaceDown && !isRunning && !isPaused) {
        startTimer();
        toast({
          title: "Super Focus Activated",
          description: "Face down detected. Timer started.",
        });
      } else if ((isFaceUp || isMovingTooMuch) && isRunning) {
        if (now - lastMovementTime > 1000) { // throttle toast
          pauseTimer();
          toast({
            title: isFaceUp ? "Face Up Detected" : "Too Much Motion",
            description: isFaceUp
              ? "Phone flipped. Timer paused."
              : "Calm down! You're moving too much. Timer paused.",
          });
          lastMovementTime = now;
        }
      }
    };
  
    if (superFocusMode && typeof window !== 'undefined') {
      window.addEventListener('devicemotion', handleMotion, true);
    }
  
    return () => {
      window.removeEventListener('devicemotion', handleMotion, true);
    };
  }, [superFocusMode, isRunning, isPaused]);
  

  const startQRCodeScanner = () => {
    toast({
      title: "QR Code Scanner",
      description: "Pretend a QR code was scanned. Starting Pomodoro!",
    });
    switchToPomodoro();
    startTimer();
  };

  const value: PomodoroContextType = {
    settings,
    currentTimer,
    isRunning,
    isPaused,
    completedPomodoros,
    totalSessionTime,
    points,
    motivationalQuote,
    selectedSound,
    superFocusMode,
    updateSettings,
    startTimer,
    pauseTimer,
    resetTimer,
    completePomodoro,
    switchToPomodoro,
    switchToShortBreak,
    switchToLongBreak,
    setSelectedSound: (sound) => {
      setSelectedSound(sound);
      syncToFirestore({ selectedSound: sound });
    },
    playAmbientSound,
    stopAmbientSound,
    isPlayingSound,
    toggleSuperFocusMode,
    startQRCodeScanner,
  };

  return (
    <PomodoroContext.Provider value={value}>
      {children}
    </PomodoroContext.Provider>
  );
};

import { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw } from "lucide-react";
import { Button } from "./ui/button";
import { usePomodoro } from "@/contexts/PomodoroContext";

interface TimerProps {
  initialTime: number; // in seconds
  type: "pomodoro" | "shortBreak" | "longBreak";
  onComplete: () => void;
  onTimeUpdate: (timeRemaining: number) => void;
  superFocusMode: boolean; // Whether Super Focus Mode is on or off
  resetToDefault: () => void; // Function to reset the timer to default time when Super Focus Mode is off
}

const Timer = ({
  initialTime,
  type,
  onComplete,
  onTimeUpdate,
  superFocusMode,
  resetToDefault
}: TimerProps) => {
  const {
    isRunning,
    isPaused,
    startTimer,
    pauseTimer,
    resetTimer,
    currentTimer,
  } = usePomodoro();
  
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setTimeLeft(initialTime);
    // Reset timer state when initialTime or type changes
  }, [initialTime, type]);

  useEffect(() => {
    if (isRunning && !isPaused && timeLeft > 0) {
      // Start the timer
      timerRef.current = setInterval(() => {
        const newTimeLeft = timeLeft - 1;
        setTimeLeft(newTimeLeft);
        onTimeUpdate(newTimeLeft);

        if (newTimeLeft === 0) {
          onComplete(); // Call onComplete when timer hits 0
        }
      }, 1000);
    } else if (timeLeft === 0) {
      clearInterval(timerRef.current!); // Clear interval if timer hits 0
      onComplete();
    } else {
      // Pause the timer if isPaused is true or isRunning is false
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    // Cleanup interval on unmount
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRunning, isPaused, timeLeft, onComplete, onTimeUpdate]);



  const formatTime = () => {
    // Format time in MM:SS format
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `${minutes < 10 ? '0' : ''}${minutes} : ${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const getTypeLabel = () => {
    // Return the appropriate label based on the timer type
    switch (type) {
      case "pomodoro":
        return "Focus";
      case "shortBreak":
        return "Short Break";
      case "longBreak":
        return "Long Break";
      default:
        return "Focus";
    }
  };

  const progress = ((initialTime - timeLeft) / initialTime) * 100; // Calculate the progress percentage

  const getTimerStyles = () => {
    // Styles for the circular timer with progress
    if (!isRunning) {
      return {
        borderColor: 'white',
        borderWidth: '2px',
      };
    }

    return {
      background: `conic-gradient(#9b87f5 ${progress}%, transparent ${progress}%)`,
      // Only show rotation animation on the progress ring (if any)
    };
  };

  return (
    <div className="flex flex-col items-center">
      <div 
        className="w-64 h-64 rounded-full flex items-center justify-center border-2 border-white relative overflow-hidden"
        style={getTimerStyles()}
      >
        <div className="bg-pomoflo-background w-[95%] h-[95%] rounded-full flex items-center justify-center z-10">
          <div className="text-center">
            <div className="text-4xl font-bold text-white">{formatTime()}</div>
            <div className="text-sm mt-1 text-white">{getTypeLabel()}</div>
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-center gap-4 mt-6">
        <Button
          variant="outline"
          size="icon"
          onClick={resetTimer}
          className="rounded-full border-white text-white hover:bg-pomoflo-darkPurple/30"
        >
          <RotateCcw size={18} />
        </Button>
        
        {!isRunning || isPaused ? (
          <Button
            variant="outline"
            size="icon"
            onClick={startTimer}
            className="rounded-full border-white text-white bg-pomoflo-purple hover:bg-pomoflo-purple/80"
          >
            <Play size={18} className="ml-1" />
          </Button>
        ) : (
          <Button
            variant="outline"
            size="icon"
            onClick={pauseTimer}
            className="rounded-full border-white text-white hover:bg-pomoflo-darkPurple/30"
          >
            <Pause size={18} />
          </Button>
        )}
      </div>
      
      <style>
        {`
          @keyframes rotate {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
        `}
      </style>
    </div>
  );
};

export default Timer;

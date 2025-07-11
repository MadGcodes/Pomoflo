import { useState, useEffect } from 'react';
import { usePomodoro } from '@/contexts/PomodoroContext';
import { useTasks } from '@/contexts/TaskContext';
import { useUserData } from '@/contexts/UserDataContext';
import Timer from '@/components/Timer';
import { Button } from '@/components/ui/button';
import {
  Music,
  Settings,
  ListTodo,
  BarChart3,
  UserCircle2,
  FileText,
  QrCode,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();
  const {
    settings,
    currentTimer,
    isRunning,
    resetTimer,
    completedPomodoros,
    points,
    motivationalQuote,
    superFocusMode,
    toggleSuperFocusMode,
    completePomodoro,
    switchToPomodoro,
  } = usePomodoro();
  const { tasks } = useTasks();
  const { addStudyTime, incrementPomodoro } = useUserData();

  const [isQRScanOpen, setIsQRScanOpen] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const currentTask = tasks.find((task) => !task.completed);

  const getTimerDuration = () => {
    switch (currentTimer) {
      case 'pomodoro':
        return settings.pomodoroDuration * 60;
      case 'shortBreak':
        return settings.shortBreakDuration * 60;
      case 'longBreak':
        return settings.longBreakDuration * 60;
      default:
        return settings.pomodoroDuration * 60;
    }
  };

  const handleTimerComplete = () => {
    if (currentTimer === 'pomodoro') {
      completePomodoro();
      incrementPomodoro();
    } else {
      switchToPomodoro();
    }
  };

  const handleTimeUpdate = (timeRemaining: number) => {
    if (currentTimer === 'pomodoro' && isRunning) {
      addStudyTime(1);
    }
  };

  useEffect(() => {
    const simulateMotionSensor = () => {
      if (typeof window !== 'undefined') {
        window.addEventListener('deviceorientation', (event) => {
          console.log('Device orientation changed', event);
        });

        window.addEventListener('devicemotion', (event) => {
          console.log('Device motion detected', event);
        });
      }
    };

    simulateMotionSensor();

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('deviceorientation', () => {});
        window.removeEventListener('devicemotion', () => {});
      }
    };
  }, []);

  const renderSessionIndicators = () => {
    const totalIndicators = 4;
    return (
      <div className="flex justify-center mt-4 mb-8">
        {Array.from({ length: totalIndicators }).map((_, index) => (
          <div
            key={index}
            className={`w-3 h-3 mx-1 rounded-full border border-white ${
              index < completedPomodoros % settings.longBreakInterval
                ? 'bg-white'
                : 'bg-transparent'
            }`}
          />
        ))}
      </div>
    );
  };

  const getMessage = () => {
    if (currentTimer === 'pomodoro') {
      return motivationalQuote;
    } else if (currentTimer === 'shortBreak') {
      return 'Take a short break. Breathe and relax.';
    } else {
      return "Time for a longer break. You've earned it!";
    }
  };

  const handleQRScan = () => {
    navigate('/qr');
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden pomoflo-container bg-pomoflo-background">
      <header className="sticky top-0 z-10 bg-pomoflo-background p-4 flex justify-between items-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/sounds')}
          className="text-white hover:bg-pomoflo-darkPurple/20"
        >
          <Music size={24} />
        </Button>
        <div className="bg-white/10 px-3 py-1 rounded-full text-white text-sm flex items-center">
          <span className="mr-1">🪙</span>
          <span>{points}</span>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <main className="flex flex-col items-center justify-center w-full">
          <div className="w-full max-w-md">
            <Timer
              initialTime={getTimerDuration()}
              type={currentTimer}
              onComplete={handleTimerComplete}
              onTimeUpdate={handleTimeUpdate}
              isRunning={isRunning}
              isPaused={isPaused}
              superFocusMode={superFocusMode}
              resetToDefault={resetTimer}
            />

            {renderSessionIndicators()}

            <p className="text-white text-center my-6 max-w-xs text-sm">{getMessage()}</p>

            {currentTask && (
              <div className="bg-pomoflo-darkPurple/20 rounded-lg p-3 w-full mb-6">
                <p className="text-white text-sm truncate">{currentTask.title}</p>
              </div>
            )}

            <div className="w-full mb-4">
              <Button
                variant="outline"
                className={`w-full rounded-lg border-white text-sm font-medium ${
                  superFocusMode
                    ? 'bg-pomoflo-purple text-white'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
                onClick={toggleSuperFocusMode}
              >
                {superFocusMode ? 'Super Focus ON' : 'Super Focus OFF'}
              </Button>
            </div>

            <Button
              variant="outline"
              className="w-full text-white border-white bg-white/10 hover:bg-white/20 text-sm font-medium rounded-lg mb-6"
              onClick={handleQRScan}
            >
              <QrCode size={16} className="mr-2" /> Scan QR Code
            </Button>
          </div>
        </main>

        <footer className="sticky bottom-0 z-10 bg-pomoflo-background py-2 px-4">
          <div className="flex justify-between">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/settings')}
              className="text-white hover:bg-pomoflo-darkPurple/20"
            >
              <Settings size={24} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/tasks')}
              className="text-white hover:bg-pomoflo-darkPurple/20"
            >
              <ListTodo size={24} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/notes')}
              className="text-white hover:bg-pomoflo-darkPurple/20"
            >
              <FileText size={24} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/progress')}
              className="text-white hover:bg-pomoflo-darkPurple/20"
            >
              <BarChart3 size={24} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/profile')}
              className="text-white hover:bg-pomoflo-darkPurple/20"
            >
              <UserCircle2 size={24} />
            </Button>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Home;

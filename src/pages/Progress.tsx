import { useState, useEffect } from "react";
import { useUserData } from "@/contexts/UserDataContext";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CalendarDays } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { FIREBASE_DB } from "../../firebase"; // Import Firebase configuration and Firestore
import { doc, getDoc } from "firebase/firestore";

const Progress = () => {
  const navigate = useNavigate();
  const { profile } = useUserData();
  const [view, setView] = useState<'weekly' | 'monthly'>('weekly');
  const [userProgress, setUserProgress] = useState<any>(null);
  const db = FIREBASE_DB; // Firestore instance

  // Fetch user progress data from Firestore
  const fetchUserProgress = async () => {
    if (!profile?.uid) return;

    console.log("Fetching progress for user:", profile.uid);

    const userDocRef = doc(db, "users", profile.uid);
    const docSnapshot = await getDoc(userDocRef);
    
    if (docSnapshot.exists()) {
      const data = docSnapshot.data();
      console.log("User progress data:", data);
      console.log("Daily progress data:", data?.dailyProgress);  // Log dailyProgress directly
      setUserProgress(data);  // Save data to state
    } else {
      console.log("No user progress data found");
    }
  };

  useEffect(() => {
    if (profile?.uid) {
      fetchUserProgress();
    }
  }, [profile?.uid]);

  // Format data for the chart
  const getChartData = () => {
    if (!userProgress?.dailyProgress) return [];

    const daysToShow = view === 'weekly' ? 7 : 30;

    const dates = Array.from({ length: daysToShow }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (daysToShow - 1 - i));
      return date.toISOString().split('T')[0];
    });

    return dates.map(date => {
      const dayData = userProgress.dailyProgress.find(progress => progress.date === date);
      return {
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        hours: dayData ? dayData.studyHours : 0,
        pomodoros: dayData ? dayData.pomodoros : 0,
      };
    });
  };

  // Get today's stats
  const getTodayStats = () => {
    if (!userProgress?.dailyProgress) return { hours: 0, minutes: 0, pomodoros: 0 };
  
    const today = new Date().toISOString().split('T')[0];
    const todayData = userProgress.dailyProgress.find(day => day.date === today);
  
    if (!todayData) return { hours: 0, minutes: 0, pomodoros: 0 };
  
    const hours = Math.floor(todayData.studyHours);
    const minutes = Math.round(((todayData.studyHours) - hours) * 60);
  
    return { hours, minutes};
  };
  
  const todayStats = getTodayStats();
  const chartData = getChartData();


  const getTotalStats = () => {
    if (!userProgress?.dailyProgress) return { totalHours: 0, totalPomodoros: 0 };
  
    return userProgress.dailyProgress.reduce(
      (totals, day) => {
        totals.totalHours += day.studyHours || 0;
        totals.totalPomodoros += day.pomodoros || 0;
        return totals;
      },
      { totalHours: 0, totalPomodoros: 0 }
    );
  };
  const totalStats = getTotalStats();


  const getTotalPomodorosAndStudyHours = () => {
    let totalPomodoros = 0;
    let totalStudyHours = 0;
  
    if (userProgress?.dailyProgress) {
      userProgress.dailyProgress.forEach(day => {
        totalPomodoros += day.pomodoros || 0;  // Add pomodoros for each day
        totalStudyHours += day.studyHours || 0;  // Add study hours for each day
      });
    }
  
    return { totalPomodoros, totalStudyHours };
  };
  
  const { totalPomodoros, totalStudyHours } = getTotalPomodorosAndStudyHours();

  
  return (
    <div className="flex h-screen overflow-y-auto flex-col pomoflo-container bg-pomoflo-background">
      <header className="flex items-center p-4">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => navigate('/home')}
          className="text-white hover:bg-pomoflo-darkPurple/20 mr-auto"
        >
          <ArrowLeft size={24} />
        </Button>
        <div className="mx-auto font-bold text-lg text-white">Progress</div>
        <div className="bg-white/10 px-3 py-1 rounded-full text-white text-sm flex items-center ml-auto">
          <span className="mr-1">🪙</span>
          <span>0</span>
        </div>
      </header>
      
      <div className="p-4 flex-1">
        {/* Today's stats */}
        <div className="bg-pomoflo-darkPurple/20 rounded-lg p-4 mb-6">
          <h3 className="text-white font-medium mb-2">Today's Study Time</h3>
          <div className="text-white text-2xl font-bold">
            {todayStats.hours} hrs {todayStats.minutes} mins
          </div>
          <div className="text-white mt-1">
            {todayStats.pomodoros} Pomodoro{todayStats.pomodoros === 1 ? '' : 's'}
          </div>
        </div>
        
        {/* Toggle between weekly and monthly view */}
        <div className="flex justify-center mb-6">
          <div className="bg-pomoflo-darkPurple/30 rounded-full p-1 flex">
            <Button
              variant="ghost"
              className={`rounded-full px-6 py-1 ${view === 'weekly' ? 'bg-pomoflo-purple text-white' : 'text-white/70'}`}
              onClick={() => setView('weekly')}
            >
              Weekly
            </Button>
            <Button
              variant="ghost"
              className={`rounded-full px-6 py-1 ${view === 'monthly' ? 'bg-pomoflo-purple text-white' : 'text-white/70'}`}
              onClick={() => setView('monthly')}
            >
              Monthly
            </Button>
          </div>
        </div>
        
        {/* Chart */}
        <div className="bg-pomoflo-darkPurple/20 rounded-lg p-4 mb-6 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12, fill: 'white' }} 
                tickLine={false}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: 'white' }} 
                tickLine={false}
                axisLine={false}
                unit="hr"
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1A1F2C', border: 'none', borderRadius: '8px', padding: '8px' }} 
                labelStyle={{ color: 'white' }}
                itemStyle={{ color: '#9b87f5' }}
              />
              <Bar 
                dataKey="hours" 
                fill="#9b87f5" 
                radius={[4, 4, 0, 0]} 
                name="Study Hours" 
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        {/* Stats summary */}
        <div className="flex space-x-4">
          <div className="bg-pomoflo-darkPurple/20 rounded-lg p-4 flex-1">
            <h3 className="text-white/70 text-sm mb-1">No. of Pomodoro Sessions</h3>
            <div className="text-white text-xl font-bold">
              {userProgress?.totalPomodoros}
            </div>
          </div>
          <div className="bg-pomoflo-darkPurple/20 rounded-lg p-4 flex-1">
            <h3 className="text-white/70 text-sm mb-1">Total Focus Time</h3>
            <div className="text-white text-xl font-bold">
            {totalStats.totalHours.toFixed(1)} hrs

            </div>
          </div>
        </div>
        
        <div className="mt-6 flex justify-center">
          <Button
            variant="outline"
            className="bg-transparent border-white/30 text-white"
            onClick={() => {}}
          >
            <CalendarDays size={18} className="mr-2" /> View Full Calendar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Progress;

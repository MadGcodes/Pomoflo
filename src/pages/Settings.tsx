import { useState, useEffect } from "react";
import { usePomodoro } from "@/contexts/PomodoroContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { doc, setDoc, getDoc } from "firebase/firestore"; // Adjust based on your Firebase file structure
import { getAuth } from "firebase/auth";
import { FIREBASE_DB } from "../../firebase"; // Adjust based on your Firebase file structure

const Settings = () => {
  const navigate = useNavigate();
  const { settings, updateSettings } = usePomodoro();
  const { toast } = useToast();
  const db = FIREBASE_DB; // Firestore instance
  
  const [formData, setFormData] = useState({
    pomodoroDuration: settings.pomodoroDuration,
    shortBreakDuration: settings.shortBreakDuration,
    longBreakDuration: settings.longBreakDuration,
    longBreakInterval: settings.longBreakInterval,
  });

  const user = getAuth().currentUser;

  // Sync local state with context
  useEffect(() => {
    if (user) {
      const fetchUserSettings = async () => {
        try {
          const userSettingsDocRef = doc(db, "users", user.uid, "settings", "pomodoroSettings");
          const docSnap = await getDoc(userSettingsDocRef);
          if (docSnap.exists()) {
            const userSettings = docSnap.data();
            setFormData({
              pomodoroDuration: userSettings.pomodoroDuration || settings.pomodoroDuration,
              shortBreakDuration: userSettings.shortBreakDuration || settings.shortBreakDuration,
              longBreakDuration: userSettings.longBreakDuration || settings.longBreakDuration,
              longBreakInterval: userSettings.longBreakInterval || settings.longBreakInterval,
            });
          } else {
            // Fallback to default settings if no settings are found in Firestore
            setFormData({
              pomodoroDuration: settings.pomodoroDuration,
              shortBreakDuration: settings.shortBreakDuration,
              longBreakDuration: settings.longBreakDuration,
              longBreakInterval: settings.longBreakInterval,
            });
          }
        } catch (error) {
          console.error("Error fetching user settings: ", error);
        }
      };
      
      fetchUserSettings();
    }
  }, [user, settings]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = parseInt(value) || 0;
    
    setFormData(prev => ({
      ...prev,
      [name]: numValue > 0 ? numValue : prev[name as keyof typeof prev],
    }));
  };
  
  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to save settings.",
      });
      return;
    }

    // Validate durations
    const validData = {
      ...formData,
      pomodoroDuration: Math.max(5, Math.min(90, formData.pomodoroDuration)),
      shortBreakDuration: Math.max(1, Math.min(30, formData.shortBreakDuration)),
      longBreakDuration: Math.max(5, Math.min(60, formData.longBreakDuration)),
      longBreakInterval: Math.max(1, Math.min(10, formData.longBreakInterval)),
    };

    // Save to Firestore
    try {
      const userSettingsDocRef = doc(db, "users", user.uid, "settings", "pomodoroSettings");
      await setDoc(userSettingsDocRef, validData);
      
      // Update context after saving to Firestore
      updateSettings(validData);
      
      toast({
        title: "Settings Saved",
        description: "Your timer settings have been updated.",
      });
    } catch (error) {
      console.error("Error saving settings: ", error);
      toast({
        title: "Error",
        description: "There was an issue saving your settings.",
      });
    }
  };
  
  return (
    <div className="flex min-h-screen flex-col pomoflo-container bg-pomoflo-background">
      <header className="flex items-center p-4">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => navigate('/home')}
          className="text-white hover:bg-pomoflo-darkPurple/20 mr-auto"
        >
          <ArrowLeft size={24} />
        </Button>
        <div className="mx-auto font-bold text-lg text-white">Settings</div>
        <div className="bg-white/10 px-3 py-1 rounded-full text-white text-sm flex items-center ml-auto">
          <span className="mr-1">🪙</span>
          <span>7</span>
        </div>
      </header>
      
      <div className="p-4 flex-1">
        <div className="space-y-6">
          <div>
            <h3 className="text-white mb-4 font-medium">Timer Settings</h3>
            
            <div className="bg-pomoflo-darkPurple/20 rounded-lg p-4 space-y-4">
              <div>
                <label className="text-white/70 text-sm block mb-2">
                  Pomodoro Duration (minutes)
                </label>
                <div className="relative">
                  <Input
                    type="number"
                    name="pomodoroDuration"
                    value={formData.pomodoroDuration}
                    onChange={handleChange}
                    min="5"
                    max="90"
                    className="bg-pomoflo-darkPurple/30 border-none text-white pl-4 pr-12"
                  />
                  <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/50">
                    mins
                  </span>
                </div>
              </div>
              
              <div>
                <label className="text-white/70 text-sm block mb-2">
                  Short Break Duration (minutes)
                </label>
                <div className="relative">
                  <Input
                    type="number"
                    name="shortBreakDuration"
                    value={formData.shortBreakDuration}
                    onChange={handleChange}
                    min="1"
                    max="30"
                    className="bg-pomoflo-darkPurple/30 border-none text-white pl-4 pr-12"
                  />
                  <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/50">
                    mins
                  </span>
                </div>
              </div>
              
              <div>
                <label className="text-white/70 text-sm block mb-2">
                  Long Break Duration (minutes)
                </label>
                <div className="relative">
                  <Input
                    type="number"
                    name="longBreakDuration"
                    value={formData.longBreakDuration}
                    onChange={handleChange}
                    min="5"
                    max="60"
                    className="bg-pomoflo-darkPurple/30 border-none text-white pl-4 pr-12"
                  />
                  <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/50">
                    mins
                  </span>
                </div>
              </div>
              
              <div>
                <label className="text-white/70 text-sm block mb-2">
                  Long Break After (pomodoros)
                </label>
                <div className="relative">
                  <Input
                    type="number"
                    name="longBreakInterval"
                    value={formData.longBreakInterval}
                    onChange={handleChange}
                    min="1"
                    max="10"
                    className="bg-pomoflo-darkPurple/30 border-none text-white pl-4 pr-12"
                  />
                  <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/50">
                    sessions
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="pt-4">
            <Button
              className="w-full bg-pomoflo-purple"
              onClick={handleSubmit}
            >
              <Save size={18} className="mr-2" /> Save Settings
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;

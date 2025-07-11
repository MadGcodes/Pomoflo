import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useUserData } from "@/contexts/UserDataContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Camera, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { FIREBASE_DB } from "../../firebase";
import { doc, getDoc } from "firebase/firestore";

const Profile = () => {
  const navigate = useNavigate();
  const { currentUser, signOut } = useAuth();
  const { profile, updateProfile } = useUserData();
  const { toast } = useToast();
  const [fetchedData, setFetchedData] = useState<{ totalStudyHours: number; totalPomodoros: number } | null>(null);

  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    nickname: "",
    areaOfStudy: "",
    goals: "",
  });

  // Load profile into form state
  useEffect(() => {
    if (profile) {
      setFormData({
        nickname: profile.nickname || "",
        areaOfStudy: profile.areaOfStudy || "",
        goals: profile.goals || "",
      });
    }
  }, [profile]);

  // Fetch fresh Firestore values
  useEffect(() => {
    const fetchUserStats = async () => {
      if (!currentUser) return;
      try {
        const docRef = doc(FIREBASE_DB, "users", currentUser.uid);
        const snapshot = await getDoc(docRef);
        if (snapshot.exists()) {
          const data = snapshot.data();
          setFetchedData({
            totalStudyHours: data.totalStudyHours || 0,
            totalPomodoros: data.totalPomodoros || 0,
          });
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserStats();
  }, [currentUser]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    updateProfile(formData);
    setEditing(false);
    toast({
      title: "Profile Updated",
      description: "Your profile details have been saved successfully.",
    });
  };

  const handleImageUpload = () => {
    toast({
      title: "Image Upload",
      description: "This would open the device camera or gallery in the Expo app.",
    });
  };

  const handleLogout = () => {
    signOut();
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen flex-col pomoflo-container bg-pomoflo-background">
      <header className="flex items-center p-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/home")}
          className="text-white hover:bg-pomoflo-darkPurple/20 mr-auto"
        >
          <ArrowLeft size={24} />
        </Button>
        <div className="mx-auto font-bold text-lg text-white">Profile</div>
        <div className="bg-white/10 px-3 py-1 rounded-full text-white text-sm flex items-center ml-auto">
          <span className="mr-1">🪙</span>
          <span>7</span>
        </div>
      </header>

      <div className="p-4 flex-1 overflow-y-auto pb-24">
        <div className="flex flex-col items-center max-w-md mx-auto">
          <div className="relative mb-4">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-pomoflo-darkPurple/40 flex items-center justify-center">
              {profile?.nickname ? (
                <img src="/lovable-uploads/avatar.png" alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl text-white">{currentUser?.displayName?.[0] || "U"}</span>
              )}
            </div>
            <Button
              variant="outline"
              size="icon"
              className="absolute bottom-0 right-0 bg-pomoflo-purple text-white border-none rounded-full h-8 w-8"
              onClick={handleImageUpload}
            >
              <Camera size={16} />
            </Button>
          </div>

          <h2 className="text-white text-xl font-bold">{profile?.nickname || currentUser?.displayName || "User"}</h2>
          <p className="text-white/70 text-sm">{currentUser?.email}</p>

          <div className="w-full bg-pomoflo-darkPurple/20 rounded-xl p-4 mt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-white font-medium">Total Hours Focused</h3>
              <div className="text-white font-semibold">
                {(fetchedData?.totalStudyHours ?? 0).toFixed(2)} hrs
              </div>
            </div>
            <div className="flex justify-between items-center">
              <h3 className="text-white font-medium">No. of Pomodoro Sessions</h3>
              <div className="text-white font-semibold">
                {fetchedData?.totalPomodoros ?? "0"}
              </div>
            </div>
          </div>

          {editing ? (
            <div className="w-full mt-6 space-y-4">
              <div>
                <label className="text-white text-sm mb-1 block">Nickname</label>
                <Input
                  name="nickname"
                  value={formData.nickname}
                  onChange={handleChange}
                  className="bg-pomoflo-darkPurple/20 border-none text-white"
                />
              </div>
              <div>
                <label className="text-white text-sm mb-1 block">Area of Study</label>
                <Input
                  name="areaOfStudy"
                  value={formData.areaOfStudy}
                  onChange={handleChange}
                  className="bg-pomoflo-darkPurple/20 border-none text-white"
                />
              </div>
              <div>
                <label className="text-white text-sm mb-1 block">Goals</label>
                <Textarea
                  name="goals"
                  value={formData.goals}
                  onChange={handleChange}
                  rows={4}
                  className="bg-pomoflo-darkPurple/20 border-none text-white resize-none"
                />
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 bg-transparent border-white text-white"
                  onClick={() => setEditing(false)}
                >
                  Cancel
                </Button>
                <Button className="flex-1 bg-pomoflo-purple" onClick={handleSubmit}>
                  <Save size={16} className="mr-2" /> Save
                </Button>
              </div>
            </div>
          ) : (
            <div className="w-full mt-6 space-y-4">
              {profile?.nickname || profile?.areaOfStudy || profile?.goals ? (
                <>
                  {profile?.areaOfStudy && (
                    <div>
                      <h3 className="text-white/70 text-sm">Area of Study</h3>
                      <p className="text-white">{profile.areaOfStudy}</p>
                    </div>
                  )}

                  {profile?.goals && (
                    <div>
                      <h3 className="text-white/70 text-sm">Goals</h3>
                      <p className="text-white">{profile.goals}</p>
                    </div>
                  )}

                  <Button className="w-full bg-pomoflo-purple" onClick={() => setEditing(true)}>
                    Edit Profile
                  </Button>
                </>
              ) : (
                <Button className="w-full bg-pomoflo-purple" onClick={() => setEditing(true)}>
                  Complete Your Profile
                </Button>
              )}

              <Button
                variant="outline"
                className="w-full bg-transparent border-white/30 text-white"
                onClick={handleLogout}
              >
                Sign Out
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;

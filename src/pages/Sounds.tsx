import { useNavigate } from "react-router-dom";
import { usePomodoro } from "@/contexts/PomodoroContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Volume2, Check } from "lucide-react";

const Sounds = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    selectedSound,
    setSelectedSound,
    playAmbientSound,
    stopAmbientSound,
    isPlayingSound,
  } = usePomodoro();

  // Available sound options
  const soundOptions = [
    { id: "cafe", name: "Café Music", src: "/sounds/cafe.mp3" },
    { id: "waves", name: "Sea Waves", src: "/sounds/waves.mp3" },
    { id: "white", name: "White Noise", src: "/sounds/white.mp3" },
    { id: "pencil", name: "Pencil Sounds", src: "/sounds/pencil.mp3" },
    { id: "lofi", name: "Lo-Fi Music", src: "/sounds/lofi.mp3" },
  ];

  const handleSelectSound = (soundId: string) => {
    if (isPlayingSound && selectedSound === soundId) {
      stopAmbientSound();
    } else {
      playAmbientSound(soundId);
      toast({
        title: "Sound Selected",
        description: `${
          soundOptions.find((s) => s.id === soundId)?.name
        } will play during your focus sessions.`,
      });
    }
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
        <div className="mx-auto font-bold text-lg text-white">
          Ambient Sounds
        </div>
        <div className="bg-white/10 px-3 py-1 rounded-full text-white text-sm flex items-center ml-auto">
          <span className="mr-1">🪙</span>
          <span>7</span>
        </div>
      </header>

      <div className="p-4 space-y-3 flex-1">
        {soundOptions.map((sound) => (
          <Button
            key={sound.id}
            variant="outline"
            className={`w-full justify-between py-6 px-4 rounded-xl ${
              selectedSound === sound.id
                ? "bg-pomoflo-purple text-white border-pomoflo-purple"
                : "bg-pomoflo-darkPurple/20 text-white border-pomoflo-darkPurple/30"
            }`}
            onClick={() => handleSelectSound(sound.id)}
          >
            <span>{sound.name}</span>
            <div className="flex items-center">
              {selectedSound === sound.id && <Check size={18} className="mr-2" />}
              <Volume2 size={18} />
            </div>
          </Button>
        ))}

        <div className="mt-8">
          <h3 className="text-white text-sm mb-4">Bluetooth Audio</h3>
          <Button
            variant="outline"
            className="w-full justify-center py-4 px-4 rounded-xl bg-pomoflo-darkPurple/40 text-white border-pomoflo-purple"
          >
            Connect to Bluetooth Device
          </Button>
          <p className="text-white/60 text-xs mt-2 text-center">
            Connect to a Bluetooth speaker or headphones to enhance your focus experience
          </p>
        </div>
      </div>
    </div>
  );
};

export default Sounds;

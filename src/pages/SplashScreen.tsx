
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SplashScreen = () => {
  const navigate = useNavigate();
  const [currentScreen, setCurrentScreen] = useState(0);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentScreen < 2) {
        setCurrentScreen(currentScreen + 1);
      } else {
        navigate('/login');
      }
    }, 1500);
    
    return () => clearTimeout(timer);
  }, [currentScreen, navigate]);

  const renderContent = () => {
    switch (currentScreen) {
      case 0:
        return (
          <div className="flex flex-col items-center justify-center">
            <div className="w-32 h-32 mb-4">
              <img src="/lovable-uploads/spll.png" alt="Pomoflo Logo" className="w-full h-full object-contain" />
            </div>
          </div>
        );
      case 1:
        return (
          <div className="flex flex-col items-center justify-center">
            <div className="w-80 h-80 mb-4">
              <img src="/lovable-uploads/spll.png" alt="Pomoflo Logo" className="w-full h-full object-contain" />
            </div>
          </div>
        );
      case 2:
        return (
          <div className="flex flex-col items-center justify-center">
            <div className="w-48 h-48 mb-8">
              <img src="/lovable-uploads/spll.png" alt="Pomoflo Logo" className="w-full h-full object-contain" />
            </div>
            <h1 className="text-4xl font-bold mb-2 pomoflo-text">pomoflo</h1>
            <p className="text-white mb-6">Stay Focused<br />Flow Effortlessly</p>
            <button 
              onClick={() => navigate('/login')}
              className="rounded-full bg-white text-pomoflo-purple px-8 py-2 font-semibold"
            >
              Let's Go!
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center pomoflo-container bg-pomoflo-background">
      <div className="w-full p-6">
        {renderContent()}
      </div>
    </div>
  );
};

export default SplashScreen;

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    navigate('/splash');
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-pomoflo-background">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4 text-white">Loading Pomoflo...</h1>
      </div>
    </div>
  );
};

export default Index;

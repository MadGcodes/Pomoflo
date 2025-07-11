
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
    
    try {
      setError('');
      setLoading(true);
      await signIn(email, password);
      navigate('/home');
    } catch (err) {
      setError('Failed to sign in. Please check your credentials.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center pomoflo-container bg-pomoflo-background">
      <div className="w-full p-6">
        <div className="mb-8 flex justify-center">
          <Link to="/splash" className="text-white">
            <div className="w-40 h-40 mx-auto mb-2">
              <img src="/lovable-uploads/spll.png" alt="Pomoflo Logo" className="w-full h-full object-contain" />
            </div>
          </Link>
        </div>
        
        <div className="bg-white rounded-3xl p-6">
          <h1 className="text-3xl font-bold text-center mb-6 text-pomoflo-purple">Login</h1>
          
          {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-1">
                Email ID
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com"
                className="w-full rounded-lg"
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-medium mb-1">
                Password
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            
            <Button
              type="submit"
              className="w-full bg-pomoflo-purple hover:bg-pomoflo-darkPurple text-white font-medium py-2 px-4 rounded-full"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </Button>
            
            <p className="mt-4 text-center text-gray-600 text-sm">
              Don't have an account?{" "}
              <Link to="/signup" className="text-pomoflo-purple font-medium">
                Sign up
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;

import { useState, useEffect } from 'react';
import { Phone, Mail, Lock } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import { useAuth } from '../hooks/useAuth';
import RehabLogo from "@/assets/rehab_main_logo.png";
import { getDashboardPath } from '../utils/navigation';

export default function Login() {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    login: '',
    password: '',
    remember: false
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Check for success message from password reset
  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      // Clear the message after 5 seconds
      setTimeout(() => setSuccessMessage(''), 5000);
      
      // Clear location state
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const handleSwitchToRegister = () => {
    navigate('/register');
  };

  const handleForgotPassword = () => {
    navigate('/forgot-password');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setSuccessMessage('');

    try {
      const result = await login(formData);
      
      if (result.data.success) {
        const from = location.state?.from?.pathname || '/';
        const dashboardPath = getDashboardPath(result.data.user.role);
        navigate(from !== '/' ? from : dashboardPath, { replace: true });
      } else {
        if (result.data.requires_verification) {
          navigate(`/verify/${encodeURIComponent(result.data.contact_number)}?reverification=true`, { 
            replace: true 
          });
        } else {
          setErrors({ login: result.data.message || 'Login failed' });
        }
      }
    } catch (error) {
      console.error('Login error:', error);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen dark:bg-gray-900 flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto rounded-xl flex items-center justify-center overflow-hidden">
            <img 
              src={RehabLogo} 
              alt="Rehab Logo" 
              className="object-contain" 
            />
          </div>
          <p className="text-sm text-gray-600 mt-3 dark:text-gray-400">
            Sign in to your account to continue
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 space-y-6">
          {/* Success Message */}
          {successMessage && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-3">
              <p className="text-sm text-green-600 dark:text-green-400 text-center">
                {successMessage}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email or Phone Number"
              type="text"
              value={formData.login}
              onChange={(e) => setFormData({ ...formData, login: e.target.value })}
              placeholder="Enter your email or phone"
              icon={formData.login.includes('@') ? Mail : Phone}
              error={errors.login}
              required
            />

            <Input
              label="Password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Enter your password"
              icon={Lock}
              showPasswordToggle={true}
              required
            />

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.remember}
                  onChange={(e) => setFormData({ ...formData, remember: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Remember me</span>
              </label>
              
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                Forgot password?
              </button>
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              loading={loading}
              disabled={!formData.login || !formData.password}
            >
              Sign In
            </Button>
          </form>

          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Don't have an account?{' '}
              <button
                onClick={handleSwitchToRegister}
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Register as Patient
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
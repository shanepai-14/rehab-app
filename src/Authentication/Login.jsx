import  { useState} from 'react';


import { 
  Phone, 
  Mail, 
  Lock, 
  Shield,
} from 'lucide-react';
import { useNavigate ,useLocation } from 'react-router-dom';

import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import { useAuth } from '../hooks/useAuth';

import api from '../Services/api';
import { getDashboardPath } from '../utils/navigation';

export default function  Login ({  }) {
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

const handleSwitchToRegister = () => {
    navigate('/register');
  };

const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      // Use AuthContext login method instead of direct API call
      const result = await login(formData);
      console.log(result);
      if (result.data.success) {
         const from = location.state?.from?.pathname || '/';
        const dashboardPath = getDashboardPath(result.data.user.role);
        console.log('Login successful, redirecting to:', from !== '/' ? from : dashboardPath);
        navigate(from !== '/' ? from : dashboardPath, { replace: true });
      } else {
        console.log(result);
        if(result.data.requires_verification){
    navigate(`/verify/${encodeURIComponent(result.data.contact_number)}?reverification=true`, { 
        replace: true 
      });
        }else {
          setErrors({ login: result.data.message || 'Login failed' });
        }
     
      }
    } catch (error) {
      console.error('Login error:', error);
      // setErrors({ 
      //   login: error.message || 'Something went wrong. Please try again.' 
      // });
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-blue-600 rounded-xl flex items-center justify-center mb-4">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome Back
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Sign in to your account to continue
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 space-y-6">
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
};
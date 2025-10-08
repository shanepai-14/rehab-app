import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Lock, CheckCircle } from 'lucide-react';
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import api from '../Services/api';
import RehabLogo from "@/assets/rehab_main_logo.png";

export default function NewPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const { resetToken, contactNumber } = location.state || {};
  
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Redirect if no reset token
  if (!resetToken) {
    navigate('/forgot-password', { replace: true });
    return null;
  }

  const validatePassword = (password) => {
    if (password.length < 8) {
      return 'Password must be at least 8 characters long';
    }
    if (!/[A-Z]/.test(password)) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!/[a-z]/.test(password)) {
      return 'Password must contain at least one lowercase letter';
    }
    if (!/[0-9]/.test(password)) {
      return 'Password must contain at least one number';
    }
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    // Validate passwords
    const passwordError = validatePassword(formData.password);
    if (passwordError) {
      setErrors({ password: passwordError });
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrors({ confirmPassword: 'Passwords do not match' });
      setLoading(false);
      return;
    }

    try {
      const response = await api.post('/auth/reset-password', {
        reset_token: resetToken,
        contact_number: contactNumber,
        new_password: formData.password,
        confirm_password: formData.confirmPassword
      });

      if (response.data.success) {
        // Show success and redirect to login
        navigate('/login', {
          state: { 
            message: 'Password reset successful! Please login with your new password.',
            type: 'success'
          }
        });
      } else {
        setErrors({ general: response.data.message || 'Failed to reset password' });
      }
    } catch (error) {
      console.error('Reset password error:', error);
      setErrors({ 
        general: error.response?.data?.message || 'Failed to reset password. Please try again.' 
      });
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4 py-8">
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
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Create New Password
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Enter your new password below
          </p>
        </div>

        {/* Form */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {errors.general && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3">
                <p className="text-sm text-red-600 dark:text-red-400 text-center">
                  {errors.general}
                </p>
              </div>
            )}

            <Input
              label="New Password"
              type="password"
              value={formData.password}
              onChange={(e) => {
                setFormData({ ...formData, password: e.target.value });
                setErrors({});
              }}
              placeholder="Enter new password"
              icon={Lock}
              showPasswordToggle={true}
              error={errors.password}
              required
            />

            <Input
              label="Confirm Password"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => {
                setFormData({ ...formData, confirmPassword: e.target.value });
                setErrors({});
              }}
              placeholder="Confirm new password"
              icon={Lock}
              showPasswordToggle={true}
              error={errors.confirmPassword}
              required
            />

            {/* Password Requirements */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
              <p className="text-xs font-medium text-blue-900 dark:text-blue-300 mb-2">
                Password Requirements:
              </p>
              <ul className="text-xs text-blue-700 dark:text-blue-400 space-y-1">
                <li className="flex items-center">
                  <CheckCircle className="h-3 w-3 mr-2" />
                  At least 8 characters
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-3 w-3 mr-2" />
                  One uppercase letter
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-3 w-3 mr-2" />
                  One lowercase letter
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-3 w-3 mr-2" />
                  One number
                </li>
              </ul>
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              loading={loading}
              disabled={!formData.password || !formData.confirmPassword}
            >
              Reset Password
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
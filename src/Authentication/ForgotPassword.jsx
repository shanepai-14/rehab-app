import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, Mail, ArrowLeft } from 'lucide-react';
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import api from '../Services/api';
import RehabLogo from "@/assets/rehab_main_logo.png";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [contactInfo, setContactInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/forgot-password', { 
        contact: contactInfo 
      });

      if (response.data.success) {
        // Navigate to OTP verification page with reset password flow
        navigate(`/reset-password/verify/${encodeURIComponent(response.data.contact_number)}`, {
          state: { fromForgotPassword: true }
        });
      } else {
        setError(response.data.message || 'Failed to send verification code');
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      setError(error.response?.data?.message || 'Account not found or error occurred');
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
            Forgot Password?
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Enter your email or phone number to receive a verification code
          </p>
        </div>

        {/* Form */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email or Phone Number"
              type="text"
              value={contactInfo}
              onChange={(e) => {
                setContactInfo(e.target.value);
                setError('');
              }}
              placeholder="Enter your email or phone"
              icon={contactInfo.includes('@') ? Mail : Phone}
              error={error}
              required
            />

            <Button 
              type="submit" 
              className="w-full" 
              loading={loading}
              disabled={!contactInfo}
            >
              Send Verification Code
            </Button>
          </form>

          <div className="text-center">
            <button
              onClick={() => navigate('/login')}
              className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Shield } from 'lucide-react';
import Button from "../components/ui/Button";
import api from '../Services/api';

export default function ResetPasswordOTP() {
  const navigate = useNavigate();
  const location = useLocation();
  const { phoneNumber } = useParams();
  
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(60);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpCode = otp.join('');
    
    if (otpCode.length !== 6) {
      setError('Please enter the complete 6-digit code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/verify-reset-otp', {
        contact_number: phoneNumber,
        otp: otpCode
      });

      if (response.data.success) {
        // Navigate to new password page with reset token
        navigate('/reset-password/new', {
          state: { 
            resetToken: response.data.reset_token,
            contactNumber: phoneNumber
          }
        });
      } else {
        setError('Invalid verification code. Please try again.');
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      setError(error.response?.data?.message || 'Verification failed. Please try again.');
    }
    
    setLoading(false);
  };

  const handleResend = async () => {
    setResendLoading(true);
    setError('');
    
    try {
      const response = await api.post('/forgot-password', {
        contact: phoneNumber
      });

      if (response.data.success) {
        setResendTimer(60);
        setOtp(['', '', '', '', '', '']);
        
        setTimeout(() => {
          document.getElementById('otp-0')?.focus();
        }, 100);
      } else {
        setError(response.data.message || 'Failed to resend code. Please try again.');
      }
    } catch (error) {
      console.error('Resend error:', error);
      setError(error.response?.data?.message || 'Failed to resend code. Please try again.');
    }
    
    setResendLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-blue-600 rounded-xl flex items-center justify-center mb-4">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Verify Your Identity
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Enter the 6-digit code sent to
          </p>
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {phoneNumber}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex justify-center space-x-3">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  inputMode="numeric"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value.replace(/\D/g, ''))}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-12 text-center text-lg font-bold border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  autoComplete="off"
                />
              ))}
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3">
                <p className="text-sm text-red-600 dark:text-red-400 text-center">{error}</p>
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full" 
              loading={loading}
              disabled={otp.join('').length !== 6}
            >
              Verify Code
            </Button>
          </form>

          <div className="text-center space-y-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Didn't receive the code?
            </p>
            {resendTimer > 0 ? (
              <p className="text-sm font-medium text-gray-500">
                Resend in {resendTimer}s
              </p>
            ) : (
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleResend}
                loading={resendLoading}
              >
                Resend Code
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
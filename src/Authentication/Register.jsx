import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Input from "../components/ui/Input";
import Button from "../components/ui/Button";

import api from '../Services/api';
import useAuth from '../hooks/useAuth';

import { 
  Phone, 
  Mail, 
  Lock, 
  UserPlus,
  User,
  MapPin,
  Check,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';

export default function Register({ onSwitchToLogin }) {
  const navigate = useNavigate();
  const { register, setPendingVerification } = useAuth();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    last_name: '',
    first_name: '',
    middle_initial: '',
    sex: '',
    birth_date: '',
    address: '',
    contact_number: '',
    province: '',
    district: '',
    email: '',
    password: '',
    confirm_password: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const provinces = [
    'Davao del Norte',
    'Davao del Sur', 
    'Davao Oriental',
    'Davao Occidental',
    'Davao de Oro'
  ];

  const steps = [
    { number: 1, title: 'Personal Info', icon: User },
    { number: 2, title: 'Contact Details', icon: Phone },
    { number: 3, title: 'Location', icon: MapPin },
    { number: 4, title: 'Security', icon: Lock }
  ];

  const validateStep = (step) => {
    const newErrors = {};

    switch(step) {
      case 1:
        if (!formData.first_name) newErrors.first_name = 'First name is required';
        if (!formData.last_name) newErrors.last_name = 'Last name is required';
        if (!formData.sex) newErrors.sex = 'Sex is required';
        if (!formData.birth_date) newErrors.birth_date = 'Birth date is required';
        break;
      
      case 2:
        if (!formData.contact_number) {
          newErrors.contact_number = 'Contact number is required';
        } else {
          const phoneRegex = /^09\d{9}$/;
          if (!phoneRegex.test(formData.contact_number)) {
            newErrors.contact_number = 'Please enter a valid Philippine phone number (09xxxxxxxxx)';
          }
        }
        if (!formData.address) newErrors.address = 'Address is required';
        break;
      
      case 3:
        if (!formData.province) newErrors.province = 'Province is required';
        if (!formData.district) newErrors.district = 'District is required';
        break;
      
      case 4:
        if (!formData.password) {
          newErrors.password = 'Password is required';
        } else if (formData.password.length < 8) {
          newErrors.password = 'Password must be at least 8 characters';
        }
        if (formData.password !== formData.confirm_password) {
          newErrors.confirm_password = 'Passwords do not match';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep(4)) return;

    setLoading(true);
    setErrors({});

    try {
      const result = await register(formData);

      if (result.data.success) {
        setPendingVerification(formData.contact_number);
        navigate(`/verify/${encodeURIComponent(formData.contact_number)}`, { 
          replace: true 
        });
      } else {
        setErrors({ 
          submit: result.message || 'Registration failed. Please try again.' 
        });
      }
    } catch (error) {
      console.error('Registration error:', error);
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        setErrors({ 
          submit: error.response?.data?.message || 'Registration failed. Please try again.' 
        });
      }
    }
    
    setLoading(false);
  };

  const renderStepContent = () => {
    switch(currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="First Name"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                placeholder="Enter first name"
                error={errors.first_name}
                required
              />
              <Input
                label="Last Name"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                placeholder="Enter last name"
                error={errors.last_name}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Middle Initial"
                value={formData.middle_initial}
                onChange={(e) => setFormData({ ...formData, middle_initial: e.target.value.slice(0, 1) })}
                placeholder="M"
                maxLength="1"
              />
              
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Sex <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.sex}
                  onChange={(e) => setFormData({ ...formData, sex: e.target.value })}
                  className={`w-full px-3 py-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white text-sm sm:text-base ${errors.sex ? 'border-red-500' : 'border-gray-300'}`}
                >
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                {errors.sex && <p className="text-sm text-red-600">{errors.sex}</p>}
              </div>

              <Input
                label="Birth Date"
                type="date"
                value={formData.birth_date}
                onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                error={errors.birth_date}
                required
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <Input
              label="Contact Number"
              value={formData.contact_number}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 11);
                setFormData({ ...formData, contact_number: value });
              }}
              placeholder="09123456789"
              icon={Phone}
              error={errors.contact_number}
              required
              maxLength="11"
            />

            <Input
              label="Email (Optional)"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="your.email@example.com"
              icon={Mail}
              error={errors.email}
            />

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Address <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Enter complete address"
                rows="4"
                className={`w-full px-3 py-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 text-sm sm:text-base ${errors.address ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.address && <p className="text-sm text-red-600">{errors.address}</p>}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Province <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.province}
                onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                className={`w-full px-3 py-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white text-sm sm:text-base ${errors.province ? 'border-red-500' : 'border-gray-300'}`}
              >
                <option value="">Select Province</option>
                {provinces.map(province => (
                  <option key={province} value={province}>{province}</option>
                ))}
              </select>
              {errors.province && <p className="text-sm text-red-600">{errors.province}</p>}
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                District <span className="text-red-500">*</span>
              </label>
              <div className="flex space-x-6 pt-2">
                {[1, 2, 3].map(district => (
                  <label key={district} className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="district"
                      value={district}
                      checked={formData.district === district.toString()}
                      onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">District {district}</span>
                  </label>
                ))}
              </div>
              {errors.district && <p className="text-sm text-red-600">{errors.district}</p>}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <Input
              label="Password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Create password (min. 8 characters)"
              icon={Lock}
              showPasswordToggle={true}
              error={errors.password}
              required
              minLength="8"
            />
            <Input
              label="Confirm Password"
              type="password"
              value={formData.confirm_password}
              onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
              placeholder="Confirm password"
              icon={Lock}
              showPasswordToggle={true}
              error={errors.confirm_password}
              required
            />

            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Review Your Information</h4>
              <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <p><strong>Name:</strong> {formData.first_name} {formData.middle_initial && formData.middle_initial + '.'} {formData.last_name}</p>
                <p><strong>Contact:</strong> {formData.contact_number}</p>
                {formData.email && <p><strong>Email:</strong> {formData.email}</p>}
                <p><strong>Location:</strong> {formData.province}, District {formData.district}</p>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-blue-600 rounded-xl flex items-center justify-center mb-4">
            <UserPlus className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Patient Registration
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Step {currentStep} of 4: {steps[currentStep - 1].title}
          </p>
        </div>

        {/* Stepper */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-8">
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              const isCompleted = currentStep > step.number;
              const isCurrent = currentStep === step.number;
              
              return (
                <div key={step.number} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                      isCompleted ? 'bg-green-500' : 
                      isCurrent ? 'bg-blue-600' : 
                      'bg-gray-300 dark:bg-gray-600'
                    }`}>
                      {isCompleted ? (
                        <Check className="h-5 w-5 text-white" />
                      ) : (
                        <StepIcon className="h-5 w-5 text-white" />
                      )}
                    </div>
                    <span className={`text-xs mt-2 hidden sm:block ${
                      isCurrent ? 'text-blue-600 dark:text-blue-400 font-medium' : 
                      'text-gray-500 dark:text-gray-400'
                    }`}>
                      {step.title}
                    </span>
                  </div>
                  
                  {index < steps.length - 1 && (
                    <div className={`h-1 flex-1 mx-2 transition-all ${
                      isCompleted ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit}>
            <div className="min-h-[320px]">
              {renderStepContent()}
            </div>

            {errors.submit && (
              <div className="mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                <p className="text-sm text-red-600 dark:text-red-400">{errors.submit}</p>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div>
                {currentStep > 1 && (
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleBack}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1 inline" />
                    Back
                  </Button>
                )}
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={onSwitchToLogin}
                >
                  Cancel
                </Button>
                
                {currentStep < 4 ? (
                  <Button
                    type="button"
                    onClick={handleNext}
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1 inline" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    loading={loading}
                  >
                    Create Account
                  </Button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
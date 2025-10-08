import { useState, useMemo } from "react";
import { 
  Phone, 
  Mail, 
  Lock, 
  UserPlus,
  AlertCircle,
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  User,
  MapPin,
  Briefcase,
  Search,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import apiService from "../Services/api";
import { philippineLocations } from '../data/philippineLocations';

// Searchable Select Component
const SearchableSelect = ({ 
  label, 
  value, 
  onChange, 
  options, 
  placeholder, 
  disabled, 
  error,
  required = false 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredOptions = useMemo(() => {
    if (!searchTerm) return options;
    return options.filter(option =>
      option.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [options, searchTerm]);

  const handleSelect = (option) => {
    onChange(option);
    setSearchTerm('');
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange('');
    setSearchTerm('');
  };

  return (
    <div className="space-y-1 relative">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      
      <div className="relative">
        <div
          className={`w-full px-3 py-3 border rounded-xl shadow-sm flex items-center justify-between cursor-pointer dark:bg-gray-800 dark:border-gray-600 dark:text-white text-sm sm:text-base ${
            error ? 'border-red-500' : 'border-gray-300'
          } ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-700' : 'hover:border-blue-400'}`}
          onClick={() => !disabled && setIsOpen(!isOpen)}
        >
          <span className={value ? 'text-gray-900 dark:text-white' : 'text-gray-400'}>
            {value || placeholder}
          </span>
          <div className="flex items-center gap-2">
            {value && !disabled && (
              <X
                size={16}
                className="text-gray-400 hover:text-gray-600"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClear();
                }}
              />
            )}
            <Search size={16} className="text-gray-400" />
          </div>
        </div>

        {isOpen && !disabled && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />

            {/* Dropdown */}
            <div className="absolute z-20 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl shadow-lg max-h-60 overflow-hidden">
              {/* Search Input */}
              <div className="p-2 border-b border-gray-200 dark:border-gray-700">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={`Search ${label.toLowerCase()}...`}
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                    autoFocus
                  />
                </div>
              </div>

              {/* Options List */}
              <div className="overflow-y-auto max-h-48">
                {filteredOptions.length > 0 ? (
                  filteredOptions.map((option) => (
                    <div
                      key={option}
                      onClick={() => handleSelect(option)}
                      className={`px-4 py-2 cursor-pointer hover:bg-blue-50 dark:hover:bg-gray-700 text-sm ${
                        value === option
                          ? 'bg-blue-100 dark:bg-gray-700 text-blue-600 dark:text-blue-400 font-medium'
                          : 'text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {option}
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 text-center">
                    No results found
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default function CreateDoctorForm({ onBack }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    middle_initial: '',
    sex: '',
    birth_date: '',
    address: '',
    contact_number: '',
    province: '',
    municipality: '',
    barangay: '',
    district: '',
    email: '',
    password: '',
    password_confirmation: '',
    specialization: '',
    license_number: ''
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [createdDoctor, setCreatedDoctor] = useState(null);

  // Get available provinces
  const provinces = Object.keys(philippineLocations);

  // Get municipalities based on selected province
  const municipalities = useMemo(() => {
    if (!formData.province) return [];
    return Object.keys(philippineLocations[formData.province]?.municipalities || {});
  }, [formData.province]);

  // Get barangays based on selected municipality
  const barangays = useMemo(() => {
    if (!formData.province || !formData.municipality) return [];
    return philippineLocations[formData.province]?.municipalities[formData.municipality] || [];
  }, [formData.province, formData.municipality]);

  const steps = [
    { number: 1, title: 'Personal Info', icon: User },
    { number: 2, title: 'Contact & Address', icon: MapPin },
    { number: 3, title: 'Account & Professional', icon: Briefcase }
  ];

  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.first_name.trim()) newErrors.first_name = 'First name is required';
      if (!formData.last_name.trim()) newErrors.last_name = 'Last name is required';
      if (!formData.sex) newErrors.sex = 'Sex is required';
      if (!formData.birth_date) newErrors.birth_date = 'Birth date is required';
      if (formData.middle_initial && formData.middle_initial.length > 1) {
        newErrors.middle_initial = 'Middle initial must be a single character';
      }
    }

if (step === 2) {
      if (!formData.address.trim()) newErrors.address = 'Address is required';
      if (!formData.province.trim()) newErrors.province = 'Province is required';
      if (!formData.municipality.trim()) newErrors.municipality = 'Municipality/City is required';
      if (!formData.barangay.trim()) newErrors.barangay = 'Barangay is required';
      if (!formData.district) newErrors.district = 'District is required';
      if (!formData.contact_number.trim()) {
        newErrors.contact_number = 'Contact number is required';
      } else if (!/^09[0-9]{9}$/.test(formData.contact_number)) {
        newErrors.contact_number = 'Contact number must be in format 09XXXXXXXXX';
      }
    }

    if (step === 3) {
      if (!formData.email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address';
      }
      
      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else if (formData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters';
      }
      
      if (!formData.password_confirmation) {
        newErrors.password_confirmation = 'Password confirmation is required';
      } else if (formData.password !== formData.password_confirmation) {
        newErrors.password_confirmation = 'Passwords do not match';
      }
    }

    return newErrors;
  };

  const handleNext = () => {
    const stepErrors = validateStep(currentStep);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }
    
    setErrors({});
    setCurrentStep(prev => Math.min(prev + 1, steps.length));
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    setErrors({});
    setApiError('');
    
    const finalErrors = validateStep(3);
    if (Object.keys(finalErrors).length > 0) {
      setErrors(finalErrors);
      return;
    }

    setLoading(true);
    
    try {
      const submitData = { ...formData };
      
      if (!submitData.middle_initial?.trim()) delete submitData.middle_initial;
      if (!submitData.specialization?.trim()) delete submitData.specialization;
      if (!submitData.license_number?.trim()) delete submitData.license_number;

      const response = await apiService.createDoctor(submitData);
      
      if (response.data.success) {
        setCreatedDoctor(response.data.doctor);
        setSuccess(true);
        toast.success('Doctor account created successfully');
      } else {
        setApiError(response.data.message || 'Failed to create doctor account');
        toast.error(response.data.message || 'Failed to create doctor account');
      }
    } catch (error) {
      console.error('Create doctor error:', error);
      
      if (error.response?.status === 422 && error.response?.data?.errors) {
        setErrors(error.response.data.errors);
        
        Object.entries(error.response.data.errors).forEach(([field, messages]) => {
          if (Array.isArray(messages)) {
            messages.forEach(message => {
              toast.error(message);
            });
          } else {
            toast.error(messages);
          }
        });
      } else if (error.response?.status === 401) {
        const errorMsg = 'Authentication failed. Please log in again.';
        setApiError(errorMsg);
        toast.error(errorMsg);
      } else if (error.response?.status === 403) {
        const errorMsg = 'You do not have permission to create doctor accounts.';
        setApiError(errorMsg);
        toast.error(errorMsg);
      } else {
        const errorMsg = error.response?.data?.message || error.message || 'Failed to create doctor account. Please try again.';
        setApiError(errorMsg);
        toast.error(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Reset dependent fields when parent selection changes
  const handleProvinceChange = (province) => {
    setFormData(prev => ({
      ...prev,
      province,
      municipality: '',
      barangay: ''
    }));
    if (errors.province) {
      setErrors(prev => ({ ...prev, province: '' }));
    }
  };

  const handleMunicipalityChange = (municipality) => {
    setFormData(prev => ({
      ...prev,
      municipality,
      barangay: ''
    }));
    if (errors.municipality) {
      setErrors(prev => ({ ...prev, municipality: '' }));
    }
  };

  const handleBarangayChange = (barangay) => {
    setFormData(prev => ({ ...prev, barangay }));
    if (errors.barangay) {
      setErrors(prev => ({ ...prev, barangay: '' }));
    }
  };

  if (success) {
    return (
      <div className="fixed inset-0 bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <div className="max-w-md w-full shadow-xl bg-white text-center space-y-6">
          <div className="mx-auto h-16 w-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Doctor Created Successfully!</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              The doctor account has been successfully created for:
            </p>
            {createdDoctor && (
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-6">
                <p className="font-medium text-gray-900 dark:text-white">{createdDoctor.name}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{createdDoctor.email}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{createdDoctor.contact_number}</p>
              </div>
            )}
          </div>
          <Button onClick={onBack} className="w-full">
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0  bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="max-w-3xl w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl my-8">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            disabled={loading}
          >
            ←
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Create Doctor Account</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">Step {currentStep} of {steps.length}</p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-8">
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              const isActive = currentStep === step.number;
              const isCompleted = currentStep > step.number;
              
              return (
                <div key={step.number} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                      isCompleted ? 'bg-green-500 text-white' :
                      isActive ? 'bg-blue-600 text-white' :
                      'bg-gray-200 dark:bg-gray-700 text-gray-500'
                    }`}>
                      {isCompleted ? <CheckCircle size={24} /> : <StepIcon size={24} />}
                    </div>
                    <p className={`mt-2 text-xs sm:text-sm font-medium ${
                      isActive ? 'text-blue-600 dark:text-blue-400' :
                      isCompleted ? 'text-green-600 dark:text-green-400' :
                      'text-gray-500'
                    }`}>
                      {step.title}
                    </p>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`flex-1 h-1 mx-4 transition-all ${
                      currentStep > step.number ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>

          {/* API Error Alert */}
          {apiError && (
            <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-center space-x-3">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0" />
              <p className="text-red-800 dark:text-red-200">{apiError}</p>
            </div>
          )}

          {/* Step 1: Personal Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Personal Information</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  value={formData.first_name}
                  onChange={(e) => handleInputChange('first_name', e.target.value)}
                  placeholder="Enter first name"
                  error={errors.first_name}
                  required
                />
                <Input
                  label="Last Name"
                  value={formData.last_name}
                  onChange={(e) => handleInputChange('last_name', e.target.value)}
                  placeholder="Enter last name"
                  error={errors.last_name}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  label="Middle Initial"
                  value={formData.middle_initial}
                  onChange={(e) => handleInputChange('middle_initial', e.target.value.slice(0, 1))}
                  placeholder="M"
                  maxLength="1"
                  error={errors.middle_initial}
                />
                
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Sex <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.sex}
                    onChange={(e) => handleInputChange('sex', e.target.value)}
                    className={`w-full px-3 py-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white text-sm sm:text-base ${
                      errors.sex ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    required
                  >
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                  {errors.sex && (
                    <p className="text-sm text-red-600 dark:text-red-400">{errors.sex}</p>
                  )}
                </div>

                <Input
                  label="Birth Date"
                  type="date"
                  value={formData.birth_date}
                  onChange={(e) => handleInputChange('birth_date', e.target.value)}
                  error={errors.birth_date}
                  required
                />
              </div>
            </div>
          )}

          {/* Step 2: Contact & Address */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Contact & Address</h3>
              
              <Input
                label="Contact Number"
                value={formData.contact_number}
                onChange={(e) => handleInputChange('contact_number', e.target.value)}
                placeholder="09123456789"
                icon={Phone}
                error={errors.contact_number}
                required
              />

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Enter complete address (House/Unit/Building No., Street)"
                  rows="3"
                  className={`w-full px-3 py-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 text-sm sm:text-base ${
                    errors.address ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.address && <p className="text-sm text-red-600">{errors.address}</p>}
              </div>

              {/* Province Searchable Select */}
              <SearchableSelect
                label="Province"
                value={formData.province}
                onChange={handleProvinceChange}
                options={provinces}
                placeholder="Select Province"
                error={errors.province}
                required
              />

              {/* Municipality Searchable Select */}
              <SearchableSelect
                label="Municipality/City"
                value={formData.municipality}
                onChange={handleMunicipalityChange}
                options={municipalities}
                placeholder={formData.province ? 'Select Municipality/City' : 'Select province first'}
                disabled={!formData.province}
                error={errors.municipality}
                required
              />

              {/* Barangay Searchable Select */}
              <SearchableSelect
                label="Barangay"
                value={formData.barangay}
                onChange={handleBarangayChange}
                options={barangays}
                placeholder={formData.municipality ? 'Select Barangay' : 'Select municipality first'}
                disabled={!formData.municipality}
                error={errors.barangay}
                required
              />

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  District <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.district}
                  onChange={(e) => handleInputChange('district', e.target.value)}
                  className={`w-full px-3 py-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white text-sm sm:text-base ${
                    errors.district ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  required
                >
                  <option value="">Select District</option>
                  <option value="1">District 1</option>
                  <option value="2">District 2</option>
                  <option value="3">District 3</option>
                </select>
                {errors.district && (
                  <p className="text-sm text-red-600 dark:text-red-400">{errors.district}</p>
                )}
              </div>

              {/* Location Summary */}
              {formData.province && formData.municipality && formData.barangay && (
                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                  <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                    Complete Address:
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {formData.barangay}, {formData.municipality}, {formData.province}
                    {formData.district && ` - District ${formData.district}`}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Account & Professional */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Account Credentials</h3>
                
                <Input
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="doctor@hospital.com"
                  icon={Mail}
                  error={errors.email}
                  required
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    placeholder="Create password"
                    icon={Lock}
                    showPasswordToggle={true}
                    error={errors.password}
                    required
                  />
                  <Input
                    label="Confirm Password"
                    type="password"
                    value={formData.password_confirmation}
                    onChange={(e) => handleInputChange('password_confirmation', e.target.value)}
                    placeholder="Confirm password"
                    icon={Lock}
                    showPasswordToggle={true}
                    error={errors.password_confirmation}
                    required
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Professional Information <span className="text-sm font-normal text-gray-500">(Optional)</span>
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Specialization"
                    value={formData.specialization}
                    onChange={(e) => handleInputChange('specialization', e.target.value)}
                    placeholder="e.g., Cardiology, Pediatrics"
                    error={errors.specialization}
                  />
                  <Input
                    label="License Number"
                    value={formData.license_number}
                    onChange={(e) => handleInputChange('license_number', e.target.value)}
                    placeholder="Medical license number"
                    error={errors.license_number}
                  />
                </div>
              </div>

              {/* Review Summary */}
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Review Doctor Information</h4>
                <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <p><strong>Name:</strong> {formData.first_name} {formData.middle_initial && formData.middle_initial + '.'} {formData.last_name}</p>
                  <p><strong>Sex:</strong> {formData.sex}</p>
                  <p><strong>Birth Date:</strong> {formData.birth_date}</p>
                  <p><strong>Contact:</strong> {formData.contact_number}</p>
                  <p><strong>Email:</strong> {formData.email}</p>
                  <p><strong>Address:</strong> {formData.address}</p>
                  <p><strong>Location:</strong> {formData.barangay}, {formData.municipality}, {formData.province} - District {formData.district}</p>
                  {formData.specialization && <p><strong>Specialization:</strong> {formData.specialization}</p>}
                  {formData.license_number && <p><strong>License:</strong> {formData.license_number}</p>}
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-3 mt-8">
            {currentStep > 1 && (
              <Button 
                variant="secondary"
                onClick={handlePrevious}
                disabled={loading}
                className="flex items-center gap-2"
              >
                <ChevronLeft size={20} />
                Previous
              </Button>
            )}
            
            <div className="flex-1" />
            
            {currentStep < steps.length ? (
              <Button 
                onClick={handleNext}
                className="flex items-center gap-2"
              >
                Next
                <ChevronRight size={20} />
              </Button>
            ) : (
              <Button 
                onClick={handleSubmit}
                loading={loading}
                className="flex items-center gap-2"
              >
                {loading ? 'Creating...' : 'Create Doctor Account'}
                <UserPlus size={20} />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
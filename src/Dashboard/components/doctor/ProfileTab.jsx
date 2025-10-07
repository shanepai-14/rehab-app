// src/Dashboard/components/doctor/ProfileTab.jsx

import { useState, useMemo } from 'react';
import { 
  User, 
  Edit2, 
  Save, 
  X,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Loader2,
  Search,
  Award,
  Briefcase,
  LogOut
} from 'lucide-react';
import apiService from '../../../Services/api';
import { toast } from 'sonner';
import { philippineLocations } from '../../../data/philippineLocations';

const formatDate = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toISOString().split('T')[0];
};
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
                    onClick={(e) => e.stopPropagation()}
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

const ProfileTab = ({ user, onUserUpdate, onLogout }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    middle_initial: user?.middle_initial || '',
    sex: user?.sex || 'male',
    birth_date: formatDate(user?.birth_date) || '',
    address: user?.address || '',
    province: user?.province || '',
    municipality: user?.municipality || '',
    barangay: user?.barangay || '',
    license_number: user?.license_number || '',
    specialization: user?.specialization || ''
  });

  // Medical Specializations
  const specializations = [
    'General Medicine',
    'Internal Medicine',
    'Pediatrics',
    'Obstetrics and Gynecology',
    'Surgery',
    'Orthopedics',
    'Cardiology',
    'Dermatology',
    'Neurology',
    'Psychiatry',
    'Radiology',
    'Anesthesiology',
    'Ophthalmology',
    'ENT (Otorhinolaryngology)',
    'Urology',
    'Nephrology',
    'Pulmonology',
    'Gastroenterology',
    'Endocrinology',
    'Oncology',
    'Pathology',
    'Emergency Medicine',
    'Family Medicine',
    'Infectious Disease',
    'Rheumatology'
  ].sort();

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

  // Reset dependent fields when parent selection changes
  const handleProvinceChange = (province) => {
    setFormData(prev => ({
      ...prev,
      province,
      municipality: '',
      barangay: ''
    }));
  };

  const handleMunicipalityChange = (municipality) => {
    setFormData(prev => ({
      ...prev,
      municipality,
      barangay: ''
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      const response = await apiService.put('/profile', formData);
      
      if (response.data.success) {
        toast.success('Profile updated successfully');
        setIsEditing(false);
        
        // Update user data in parent component if callback provided
        if (onUserUpdate && response.data.data) {
          onUserUpdate(response.data.data);
        }
      } else {
        toast.error(response.data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset form data
    setFormData({
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      middle_initial: user?.middle_initial || '',
      sex: user?.sex || 'male',
      birth_date: user?.birth_date || '',
      address: user?.address || '',
      province: user?.province || '',
      municipality: user?.municipality || '',
      barangay: user?.barangay || '',
      license_number: user?.license_number || '',
      specialization: user?.specialization || ''
    });
    setIsEditing(false);
  };

  const calculateAge = (birthDate) => {
    if (!birthDate) return 'N/A';
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Profile Header Card */}
      <div className="bg-gradient-to-r from-green-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center ring-4 ring-white/30">
              <User className="h-10 w-10 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">
                Dr. {user?.first_name} {user?.middle_initial && `${user.middle_initial}.`} {user?.last_name}
              </h2>
              <p className="text-blue-100">{user?.specialization || 'Not provided'}</p>
              <p className="text-blue-100 text-sm">District {user?.district}</p>
            </div>
          </div>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-white text-green-600 rounded-lg hover:bg-blue-50 transition-colors flex items-center space-x-2 font-medium"
            >
              <Edit2 className="w-4 h-4" />
              <span>Edit Profile</span>
            </button>
          )}
        </div>
      </div>

      {/* Profile Information */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Personal Information
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {isEditing ? 'Update your personal details' : 'View your personal information'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            {/* Read-only Fields */}
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 space-y-4">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Account Information (Cannot be changed)
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    <Mail className="w-4 h-4 mr-2" />
                    Email
                  </label>
                  <input
                    type="email"
                    value={user?.email || 'Not provided'}
                    disabled
                    className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-500 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="flex items-center text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    <Phone className="w-4 h-4 mr-2" />
                    Contact Number
                  </label>
                  <input
                    type="text"
                    value={user?.contact_number}
                    disabled
                    className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-500 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="flex items-center text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    <MapPin className="w-4 h-4 mr-2" />
                    Assigned District
                  </label>
                  <input
                    type="text"
                    value={`District ${user?.district}`}
                    disabled
                    className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-500 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            {/* Professional Information */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 space-y-4 border border-blue-200 dark:border-blue-800">
              <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-3 flex items-center">
                <Briefcase className="w-4 h-4 mr-2" />
                Professional Information
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Award className="w-4 h-4 mr-2" />
                    License Number *
                  </label>
                  <input
                    type="text"
                    name="license_number"
                    value={formData.license_number}
                    onChange={handleInputChange}
                    disabled={!isEditing || loading}
                    required
                    placeholder="e.g., 0123456"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${
                      isEditing ? 'border-gray-300 dark:border-gray-600' : 'bg-gray-50 dark:bg-gray-800 border-gray-200 cursor-not-allowed'
                    }`}
                  />
                </div>

                {/* Specialization Searchable Select */}
                {isEditing ? (
                  <SearchableSelect
                    label="Specialization"
                    value={formData.specialization}
                    onChange={(specialization) => setFormData(prev => ({ ...prev, specialization }))}
                    options={specializations}
                    placeholder="Select Specialization"
                    disabled={loading}
                    required
                  />
                ) : (
                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <Briefcase className="w-4 h-4 mr-2" />
                      Specialization *
                    </label>
                    <input
                      type="text"
                      value={formData.specialization}
                      disabled
                      className="w-full px-4 py-2 border rounded-lg bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 cursor-not-allowed dark:text-white"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Editable Fields */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  First Name *
                </label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  disabled={!isEditing || loading}
                  required
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${
                    isEditing ? 'border-gray-300 dark:border-gray-600' : 'bg-gray-50 dark:bg-gray-800 border-gray-200 cursor-not-allowed'
                  }`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Middle Initial
                </label>
                <input
                  type="text"
                  name="middle_initial"
                  value={formData.middle_initial}
                  onChange={handleInputChange}
                  disabled={!isEditing || loading}
                  maxLength="1"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${
                    isEditing ? 'border-gray-300 dark:border-gray-600' : 'bg-gray-50 dark:bg-gray-800 border-gray-200 cursor-not-allowed'
                  }`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Last Name *
                </label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  disabled={!isEditing || loading}
                  required
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${
                    isEditing ? 'border-gray-300 dark:border-gray-600' : 'bg-gray-50 dark:bg-gray-800 border-gray-200 cursor-not-allowed'
                  }`}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <User className="w-4 h-4 mr-2" />
                  Sex *
                </label>
                <select
                  name="sex"
                  value={formData.sex}
                  onChange={handleInputChange}
                  disabled={!isEditing || loading}
                  required
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${
                    isEditing ? 'border-gray-300 dark:border-gray-600' : 'bg-gray-50 dark:bg-gray-800 border-gray-200 cursor-not-allowed'
                  }`}
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Calendar className="w-4 h-4 mr-2" />
                  Birth Date *
                </label>
                <input
                  type="date"
                  name="birth_date"
                  value={formData.birth_date}
                  onChange={handleInputChange}
                  disabled={!isEditing || loading}
                  required
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${
                    isEditing ? 'border-gray-300 dark:border-gray-600' : 'bg-gray-50 dark:bg-gray-800 border-gray-200 cursor-not-allowed'
                  }`}
                />
                {formData.birth_date && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Age: {calculateAge(formData.birth_date)} years old
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <MapPin className="w-4 h-4 mr-2" />
                Complete Address *
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                disabled={!isEditing || loading}
                required
                rows="3"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white resize-none ${
                  isEditing ? 'border-gray-300 dark:border-gray-600' : 'bg-gray-50 dark:bg-gray-800 border-gray-200 cursor-not-allowed'
                }`}
                placeholder="House No., Street, Barangay, Municipality, Province"
              />
            </div>

            {/* Location Fields with Searchable Dropdowns */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Province Searchable Select */}
              {isEditing ? (
                <SearchableSelect
                  label="Province"
                  value={formData.province}
                  onChange={handleProvinceChange}
                  options={provinces}
                  placeholder="Select Province"
                  disabled={loading}
                  required
                />
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Province *
                  </label>
                  <input
                    type="text"
                    value={formData.province}
                    disabled
                    className="w-full px-4 py-2 border rounded-lg bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 cursor-not-allowed dark:text-white"
                  />
                </div>
              )}

              {/* Municipality Searchable Select */}
              {isEditing ? (
                <SearchableSelect
                  label="Municipality/City"
                  value={formData.municipality}
                  onChange={handleMunicipalityChange}
                  options={municipalities}
                  placeholder={formData.province ? 'Select Municipality/City' : 'Select province first'}
                  disabled={!formData.province || loading}
                  required
                />
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Municipality
                  </label>
                  <input
                    type="text"
                    value={formData.municipality}
                    disabled
                    className="w-full px-4 py-2 border rounded-lg bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 cursor-not-allowed dark:text-white"
                  />
                </div>
              )}

              {/* Barangay Searchable Select */}
              {isEditing ? (
                <SearchableSelect
                  label="Barangay"
                  value={formData.barangay}
                  onChange={(barangay) => setFormData(prev => ({ ...prev, barangay }))}
                  options={barangays}
                  placeholder={formData.municipality ? 'Select Barangay' : 'Select municipality first'}
                  disabled={!formData.municipality || loading}
                  required
                />
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Barangay
                  </label>
                  <input
                    type="text"
                    value={formData.barangay}
                    disabled
                    className="w-full px-4 py-2 border rounded-lg bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 cursor-not-allowed dark:text-white"
                  />
                </div>
              )}
            </div>

            {/* Location Summary when editing */}
            {isEditing && formData.province && formData.municipality && formData.barangay && (
              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                  📍 Complete Location:
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {formData.barangay}, {formData.municipality}, {formData.province}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            {isEditing && (
              <div className="flex space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={loading}
                  className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium flex items-center justify-center space-x-2"
                >
                  <X className="w-4 h-4" />
                  <span>Cancel</span>
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </form>
      </div>

      {/* Professional Summary Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Professional Summary
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-gray-600 dark:text-gray-400">License Number</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {user?.license_number || 'Not provided'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600 dark:text-gray-400">Specialization</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {user?.specialization || 'Not provided'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600 dark:text-gray-400">Assigned District</span>
            <span className="font-medium text-gray-900 dark:text-white">
              District {user?.district}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600 dark:text-gray-400">Member Since</span>
            <span className="text-gray-900 dark:text-white">
              {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
            </span>
          </div>
        </div>
      </div>

      {/* Logout Button */}
      {onLogout && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <button
            onClick={onLogout}
            className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center justify-center space-x-2"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
                    </button>
        </div>
      )}
    </div>
  );
};

export default ProfileTab;
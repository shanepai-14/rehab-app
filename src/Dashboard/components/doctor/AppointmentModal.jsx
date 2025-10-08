import { useState, useEffect, useRef } from 'react';
import moment from 'moment';
import { 
  XCircle, 
  X,
  Check,
  UserCheck,
  Loader2,
  Search,
  Users,
  Clock,
  CheckCircle,
  XCircle as XCircleIcon,
  PlayCircle,
  Calendar,
  UserX
} from 'lucide-react';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { toast } from 'sonner';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';

// Status configuration with colors and icons
const STATUS_CONFIG = {
  scheduled: { 
    label: 'Scheduled', 
    color: 'bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-200',
    activeColor: 'bg-blue-600 text-white border-blue-600',
    icon: Calendar
  },
  confirmed: { 
    label: 'Confirmed', 
    color: 'bg-green-100 text-green-800 border-green-300 hover:bg-green-200',
    activeColor: 'bg-green-600 text-white border-green-600',
    icon: CheckCircle
  },
  in_progress: { 
    label: 'In Progress', 
    color: 'bg-purple-100 text-purple-800 border-purple-300 hover:bg-purple-200',
    activeColor: 'bg-purple-600 text-white border-purple-600',
    icon: PlayCircle
  },
  completed: { 
    label: 'Completed', 
    color: 'bg-teal-100 text-teal-800 border-teal-300 hover:bg-teal-200',
    activeColor: 'bg-teal-600 text-white border-teal-600',
    icon: CheckCircle
  },
  cancelled: { 
    label: 'Cancelled', 
    color: 'bg-red-100 text-red-800 border-red-300 hover:bg-red-200',
    activeColor: 'bg-red-600 text-white border-red-600',
    icon: XCircleIcon
  },
  no_show: { 
    label: 'No Show', 
    color: 'bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-200',
    activeColor: 'bg-gray-600 text-white border-gray-600',
    icon: UserX
  }
};

const AppointmentModal = ({ isOpen, onClose, appointment, patients, onSave, isLoading }) => {
  const [formData, setFormData] = useState({
    patientIds: [],
    date: '',
    time: '',
    agenda: 'consultation',
    priority: 'normal',
    status: 'scheduled', // Added status field
    details: '',
    duration: 30
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // New state for multi-patient searchable dropdown
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedPatients, setSelectedPatients] = useState([]);
  
  // Refs for managing focus and clicks outside
  const searchInputRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (appointment && appointment.resource) {
      // Handle existing appointment with multiple patients
      const appointmentPatients = appointment.resource?.patients || [];
      
      setSelectedPatients(appointmentPatients);
      setSearchTerm('');
      
      setFormData({
        patientIds: appointmentPatients.map(p => p.id),
        date: moment(appointment.start).format('YYYY-MM-DD'),
        time: moment(appointment.start).format('HH:mm'),
        agenda: appointment.resource.agenda?.toLowerCase() || 'consultation',
        priority: appointment.resource.priority || 'normal',
        status: appointment.resource.status || 'scheduled', // Load status
        details: appointment.resource.details || '',
        duration: appointment.resource.duration || 30
      });
    } else {
      // New appointment - reset everything
      setSelectedPatients([]);
      setSearchTerm('');
      setFormData({
        patientIds: [],
        date: moment().format('YYYY-MM-DD'),
        time: '09:00',
        agenda: 'consultation',
        priority: 'normal',
        status: 'scheduled', // Default status
        details: '',
        duration: 30
      });
    }
  }, [appointment, patients, isOpen]);

  // Filter patients based on search term
  const filteredPatients = patients?.filter(patient => {
    const fullName = `${patient.first_name} ${patient.last_name}`.toLowerCase();
    const district = (patient.district || '').toLowerCase();
    const municipality = (patient.municipality || '').toLowerCase();
    const search = searchTerm.toLowerCase();
    return fullName.includes(search) || district.includes(search) || municipality.includes(search);
  }) || [];

  // Handle patient toggle (select/deselect)
  const handlePatientToggle = (patient) => {
    const isSelected = selectedPatients.some(p => p.id === patient.id);
    
    if (isSelected) {
      const newSelected = selectedPatients.filter(p => p.id !== patient.id);
      setSelectedPatients(newSelected);
      setFormData({ 
        ...formData, 
        patientIds: newSelected.map(p => p.id) 
      });
    } else {
      const newSelected = [...selectedPatients, patient];
      setSelectedPatients(newSelected);
      setFormData({ 
        ...formData, 
        patientIds: newSelected.map(p => p.id) 
      });
    }
  };

  // Handle "Select All" / "Deselect All"
  const handleSelectAll = () => {
    if (selectedPatients.length === filteredPatients.length && filteredPatients.length > 0) {
      setSelectedPatients([]);
      setFormData({ ...formData, patientIds: [] });
    } else {
      setSelectedPatients(filteredPatients);
      setFormData({ 
        ...formData, 
        patientIds: filteredPatients.map(p => p.id) 
      });
    }
  };

  // Remove patient from selected list
  const handleRemovePatient = (patientId) => {
    const newSelected = selectedPatients.filter(p => p.id !== patientId);
    setSelectedPatients(newSelected);
    setFormData({ 
      ...formData, 
      patientIds: newSelected.map(p => p.id) 
    });
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setIsDropdownOpen(true);
  };

  // Handle clicks outside dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setIsDropdownOpen(false);
      searchInputRef.current?.blur();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.patientIds.length === 0) {
      toast.error('Please select at least one patient');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const appointmentData = {
        patientIds: formData.patientIds,
        start: moment(`${formData.date} ${formData.time}`).toDate(),
        end: moment(`${formData.date} ${formData.time}`)
             .add(formData.duration, 'minutes').toDate(),
        agenda: formData.agenda,
        priority: formData.priority,
        status: formData.status, // Include status
        details: formData.details,
        duration: formData.duration,
        patients: selectedPatients
      };
      
      await onSave(appointmentData);
      onClose();
    } catch (error) {
      console.error('Error saving appointment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !isSubmitting) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const allSelected = filteredPatients.length > 0 && 
                     selectedPatients.length === filteredPatients.length;

  return (
    <div 
      className="fixed inset-0 bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl mx-auto max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white rounded-t-xl border-b border-gray-200 px-4 sm:px-6 py-4 z-10">
          <div className="flex justify-between items-center">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">
              {appointment ? 'Edit Appointment' : 'New Appointment'}
            </h2>
            <button 
              onClick={onClose} 
              disabled={isSubmitting}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1 disabled:opacity-50"
              aria-label="Close modal"
            >
              <XCircle className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-6">
          {isLoading ? (
            <LoadingSpinner message="Loading patients..." />
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              {/* Patient Selection - Multi-select with Search */}
              <div className="relative" ref={dropdownRef}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Users className="w-4 h-4 inline mr-1" />
                  Select Patients * ({selectedPatients.length} selected)
                </label>
                
                {/* Search Input */}
                <div className="relative">
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    onFocus={() => setIsDropdownOpen(true)}
                    onKeyDown={handleKeyDown}
                    className="w-full p-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                    placeholder="Search patients by name, district, or municipality..."
                    disabled={isSubmitting}
                    autoComplete="off"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
                
                {/* Dropdown List with Select All */}
                {isDropdownOpen && (
                  <div className="absolute z-20 w-full mt-2 bg-white border border-gray-300 rounded-lg shadow-xl max-h-64 overflow-y-auto">
                    {filteredPatients.length > 0 ? (
                      <>
                        {/* Select All Button */}
                        <button
                          type="button"
                          onClick={handleSelectAll}
                          className="sticky top-0 w-full text-left px-4 py-3 bg-blue-50 hover:bg-blue-100 border-b-2 border-blue-200 transition-colors font-medium text-blue-700 flex items-center justify-between"
                          disabled={isSubmitting}
                        >
                          <span className="flex items-center">
                            <UserCheck className="w-5 h-5 mr-2" />
                            {allSelected ? 'Deselect All' : 'Select All'}
                          </span>
                          <span className="text-sm text-blue-600">
                            ({filteredPatients.length} patients)
                          </span>
                        </button>

                        {/* Patient List */}
                        {filteredPatients.map(patient => {
                          const isSelected = selectedPatients.some(p => p.id === patient.id);
                          return (
                            <button
                              key={patient.id}
                              type="button"
                              onClick={() => handlePatientToggle(patient)}
                              className={`w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors ${
                                isSelected ? 'bg-blue-50' : ''
                              }`}
                              disabled={isSubmitting}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center">
                                    <span className="font-medium text-gray-900">
                                      {patient.first_name} {patient.last_name}
                                    </span>
                                    {isSelected && (
                                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                        Selected
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-sm text-gray-500 mt-0.5">
                                    District {patient.district}
                                    {` • ${patient.municipality} • ${patient.patient_type?.toUpperCase()}`}
                                  </div>
                                </div>
                                {isSelected && (
                                  <Check className="w-5 h-5 text-blue-600 flex-shrink-0" />
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </>
                    ) : (
                      <div className="px-4 py-3 text-gray-500 text-sm text-center">
                        {searchTerm ? 'No patients found matching your search' : 'No patients available'}
                      </div>
                    )}
                  </div>
                )}
                
                {/* Selected Patients Display */}
                {selectedPatients.length > 0 && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="text-sm font-medium text-gray-700 mb-2">
                      Selected Patients ({selectedPatients.length}):
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {selectedPatients.map((patient) => (
                        <span
                          key={patient.id}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800 font-medium"
                        >
                          {patient.first_name} {patient.last_name}
                          <button
                            type="button"
                            onClick={() => handleRemovePatient(patient.id)}
                            className="ml-2 text-blue-600 hover:text-blue-800 focus:outline-none"
                            disabled={isSubmitting}
                            aria-label={`Remove ${patient.first_name} ${patient.last_name}`}
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Validation message */}
                {formData.patientIds.length === 0 && (
                  <p className="mt-2 text-sm text-gray-500">
                    Please select at least one patient
                  </p>
                )}
              </div>

              {/* Date and Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    min={moment().format('YYYY-MM-DD')}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Time *
                  </label>
                  <input
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                    required
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              {/* Appointment Status - Interactive Chips */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Appointment Status *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {Object.entries(STATUS_CONFIG).map(([statusKey, config]) => {
                    const Icon = config.icon;
                    const isActive = formData.status === statusKey;
                    
                    return (
                      <button
                        key={statusKey}
                        type="button"
                        onClick={() => setFormData({ ...formData, status: statusKey })}
                        disabled={isSubmitting}
                        className={`
                          relative px-3 py-2.5 rounded-lg border-2 transition-all duration-200
                          flex items-center justify-center gap-2 font-medium text-sm
                          ${isActive ? config.activeColor : config.color}
                          disabled:opacity-50 disabled:cursor-not-allowed
                          transform ${isActive ? 'scale-105 shadow-md' : 'hover:scale-102'}
                        `}
                      >
                        <Icon className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{config.label}</span>
                        {isActive && (
                          <Check className="w-4 h-4 flex-shrink-0 ml-auto" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Appointment Type and Priority */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Appointment Type *
                  </label>
                  <select
                    value={formData.agenda}
                    onChange={(e) => setFormData({ ...formData, agenda: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm sm:text-base"
                    required
                    disabled={isSubmitting}
                  >
                    <option value="individual_counseling">Individual Counseling</option>
                    <option value="family_counseling">Family Counseling</option>
                    <option value="couple_counseling">Couple Counseling</option>
                    <option value="monthly_reporting">Monthly Reporting</option>
                    <option value="family_conference">Family Conference</option>
                    <option value="discharge_conference">Discharge Conference</option>
                    <option value="evaluation_call">Evaluation Call</option>
                    <option value="consultation">Consultation</option>
                    <option value="follow_up">Follow-up</option>
                    <option value="check_up">Check-up</option>
                    <option value="emergency">Emergency</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority *
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm sm:text-base"
                    required
                    disabled={isSubmitting}
                  >
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration (minutes) *
                </label>
                <input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 30 })}
                  min="15"
                  max="240"
                  step="15"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                  required
                  disabled={isSubmitting}
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Details / Notes
                </label>
                <textarea
                  value={formData.details}
                  onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-24 sm:h-28 resize-none text-sm sm:text-base"
                  placeholder="Additional notes or special instructions..."
                  rows={4}
                  disabled={isSubmitting}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="w-full sm:flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors font-medium disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || formData.patientIds.length === 0}
                  className="w-full sm:flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    appointment ? 'Update Appointment' : 'Create Appointment'
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AppointmentModal;
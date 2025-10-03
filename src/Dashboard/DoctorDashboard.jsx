import { useState, useEffect, useCallback ,useRef } from 'react';
import moment from 'moment';
import { 
  Clock, 
  XCircle, 
  Edit, 
  User,
  Phone,
  Activity,
  TrendingUp,
  Loader2,
  Search,
  LogOut,
  Bell
} from 'lucide-react';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import apiService from '../Services/api';
import { toast } from 'sonner';
import AppointmentCalendar from './components/doctor/AppointmentCalendar';
import UpcomingAppointments from './components/doctor/UpcomingAppointments';
import ErrorAlert from './components/doctor/ErrorAlert';
import PatientsModal from './components/doctor/PatientsModal';
import DashboardStats from './components/doctor/DashboardStats';
import QuickActions from './components/doctor/QuickActions';
import LoadingSpinner from './components/doctor/LoadingSpinner';import NotificationBell from './components/NotificationBell';


const AppointmentModal = ({ isOpen, onClose, appointment, patients, onSave, isLoading }) => {
  const [formData, setFormData] = useState({
    patientId: '',
    date: '',
    time: '',
    agenda: 'consultation',
    priority: 'normal',
    details: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // New state for searchable dropdown
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  
  // Refs for managing focus and clicks outside
  const searchInputRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (appointment && appointment.resource) {
      const patient = patients?.find(p => p.id === appointment.resource.patientId);
      setSelectedPatient(patient);
      setSearchTerm(patient ? `${patient.first_name} ${patient.last_name} - ${patient.district || 'Unknown District'}` : '');
      
      setFormData({
        patientId: appointment.resource.patientId || '',
        date: moment(appointment.start).format('YYYY-MM-DD'),
        time: moment(appointment.start).format('HH:mm'),
        agenda: appointment.resource.agenda?.toLowerCase() || 'consultation',
        priority: appointment.resource.priority || 'normal',
        details: appointment.resource.agenda || ''
      });
    } else {
      setSelectedPatient(null);
      setSearchTerm('');
      setFormData({
        patientId: '',
        date: moment().format('YYYY-MM-DD'),
        time: '09:00',
        agenda: 'consultation',
        priority: 'normal',
        details: ''
      });
    }
  }, [appointment, patients]);

  // Filter patients based on search term
  const filteredPatients = patients?.filter(patient => {
    const fullName = `${patient.first_name} ${patient.last_name}`.toLowerCase();
    const district = (patient.district || '').toLowerCase();
    const search = searchTerm.toLowerCase();
    return fullName.includes(search) || district.includes(search);
  }) || [];

  // Handle patient selection
  const handlePatientSelect = (patient) => {
    setSelectedPatient(patient);
    setSearchTerm(`${patient.first_name} ${patient.last_name} - ${patient.district || 'Unknown District'}`);
    setFormData({ ...formData, patientId: patient.id });
    setIsDropdownOpen(false);
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setIsDropdownOpen(true);
    
    // Clear selection if search term doesn't match selected patient
    if (selectedPatient && !value.includes(selectedPatient.first_name)) {
      setSelectedPatient(null);
      setFormData({ ...formData, patientId: '' });
    }
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
    setIsSubmitting(true);
    
    try {
      const appointmentData = {
        ...formData,
        start: moment(`${formData.date} ${formData.time}`).toDate(),
        end: moment(`${formData.date} ${formData.time}`).add(1, 'hour').toDate()
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

  return (
    <div 
      className="fixed inset-0  bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl mx-auto max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white rounded-t-xl border-b border-gray-200 px-4 sm:px-6 py-4">
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
              {/* Patient Selection - Searchable Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Patient *
                </label>
                <div className="relative">
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    onFocus={() => setIsDropdownOpen(true)}
                    onKeyDown={handleKeyDown}
                    className="w-full p-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                    placeholder="Search for a patient..."
                    required
                    disabled={isSubmitting}
                    autoComplete="off"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
                
                {/* Dropdown List */}
                {isDropdownOpen && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {filteredPatients.length > 0 ? (
                      <>
                        {filteredPatients.map(patient => (
                          <button
                            key={patient.id}
                            type="button"
                            onClick={() => handlePatientSelect(patient)}
                            className="w-full text-left px-4 py-3 hover:bg-blue-50 focus:bg-blue-50 focus:outline-none border-b border-gray-100 last:border-b-0 transition-colors"
                            disabled={isSubmitting}
                          >
                            <div className="flex flex-col">
                              <span className="font-medium text-gray-900">
                                {patient.first_name} {patient.last_name} - {patient.district_name}
                              </span>

                            </div>
                          </button>
                        ))}
                      </>
                    ) : (
                      <div className="px-4 py-3 text-gray-500 text-sm">
                        {searchTerm ? 'No patients found matching your search' : 'No patients available'}
                      </div>
                    )}
                  </div>
                )}
                
                {/* Validation message */}
                {searchTerm && !selectedPatient && (
                  <p className="mt-1 text-sm text-red-600">
                    Please select a patient from the dropdown
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

              {/* Appointment Type and Priority */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Appointment Type
                  </label>
                  <select
                    value={formData.agenda}
                    onChange={(e) => setFormData({ ...formData, agenda: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm sm:text-base"
                    disabled={isSubmitting}
                  >
                    <option value="consultation">Consultation</option>
                    <option value="follow_up">Follow-up</option>
                    <option value="check_up">Check-up</option>
                    <option value="emergency">Emergency</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm sm:text-base"
                    disabled={isSubmitting}
                  >
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
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
                  disabled={isSubmitting || (searchTerm && !selectedPatient)}
                  className="w-full sm:flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors font-medium disabled:opacity-50 flex items-center justify-center"
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

// Appointment Details Modal
const AppointmentDetailsModal = ({ isOpen, onClose, appointment, onEdit, onStatusUpdate, isUpdating }) => {
  if (!isOpen || !appointment) return null;

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-purple-100 text-purple-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'no_show': return 'bg-gray-100 text-gray-800';
      case 'in_progress': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const statusActions = [
    { label: 'Confirm', value: 'confirmed', color: 'bg-green-600 hover:bg-green-700' },
    { label: 'Start', value: 'in_progress', color: 'bg-blue-600 hover:bg-blue-700' },
    { label: 'Complete', value: 'completed', color: 'bg-purple-600 hover:bg-purple-700' },
    { label: 'Cancel', value: 'cancelled', color: 'bg-red-600 hover:bg-red-700' },
    { label: 'No Show', value: 'no_show', color: 'bg-gray-600 hover:bg-gray-700' }
  ];

  const handleStatusUpdate = async (newStatus) => {
    try {
      await onStatusUpdate(appointment.id, newStatus);
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  return (
    <div className="fixed inset-0  bg-opacity-20 backdrop-blur-sm flex items-center justify-center z-50 shadow-xl">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Appointment Details</h2>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600"
            disabled={isUpdating}
          >
            <XCircle className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center">
            <User className="h-5 w-5 text-gray-400 mr-3" />
            <div>
              <p className="font-medium">{appointment.resource?.patient}</p>
              <p className="text-sm text-gray-600">{appointment.resource?.agenda}</p>
            </div>
          </div>

          <div className="flex items-center">
            <Clock className="h-5 w-5 text-gray-400 mr-3" />
            <div>
              <p className="font-medium">{moment(appointment.start).format('MMMM Do, YYYY')}</p>
              <p className="text-sm text-gray-600">
                {moment(appointment.start).format('h:mm A')} - {moment(appointment.end).format('h:mm A')}
              </p>
            </div>
          </div>

          {appointment.resource?.phone && (
            <div className="flex items-center">
              <Phone className="h-5 w-5 text-gray-400 mr-3" />
              <p>{appointment.resource.phone}</p>
            </div>
          )}

          <div className="flex items-center">
            <Activity className="h-5 w-5 text-gray-400 mr-3" />
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.resource?.status)}`}>
              {appointment.resource?.status?.replace('_', ' ') || 'pending'}
            </span>
          </div>

          {appointment.resource?.priority && (
            <div className="flex items-center">
              <TrendingUp className="h-5 w-5 text-gray-400 mr-3" />
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                appointment.resource.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                appointment.resource.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                appointment.resource.priority === 'low' ? 'bg-gray-100 text-gray-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                {appointment.resource.priority} priority
              </span>
            </div>
          )}

          {appointment.resource?.details && (
            <div className="pt-2 border-t">
              <p className="text-sm text-gray-600"><strong>Notes:</strong> {appointment.resource.details}</p>
            </div>
          )}

          <div className="pt-4 border-t">
            <h4 className="font-medium mb-2">Quick Actions</h4>
            {isUpdating ? (
              <LoadingSpinner message="Updating status..." />
            ) : (
              <div className="flex flex-wrap gap-2">
                {statusActions.map(action => (
                  <button
                    key={action.value}
                    onClick={() => handleStatusUpdate(action.value)}
                    className={`px-3 py-1 text-xs text-white rounded ${action.color} transition-colors`}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={() => onEdit(appointment)}
              disabled={isUpdating}
              className="flex items-center flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors justify-center disabled:opacity-50"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </button>
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Dashboard Component
const DoctorDashboard = ({ user , onLogout }) => {
  const [dashboardData, setDashboardData] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isPatientsModalOpen, setIsPatientsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [loadingPatients, setLoadingPatients] = useState(false);

  const transformAppointmentsToCalendar = (appointmentsData) => {
    if (!appointmentsData || !appointmentsData.data) return [];

    return appointmentsData.data.map(appointment => {
      // Combine date + time safely
      const start = moment(
        `${appointment.appointment_date.split('T')[0]} ${appointment.appointment_time}`,
        "YYYY-MM-DD HH:mm"
      ).toDate();

      const end = moment(start).add(1, "hour").toDate();

      return {
        id: appointment.id,
        title: `${appointment.patient?.first_name || 'Unknown'} - ${appointment.agenda || 'Appointment'}`,
        start,
        end,
        resource: {
          patient: appointment.patient?.first_name,
          status: appointment.status,
          agenda: appointment.agenda,
          phone: appointment.patient?.contact_number,
          priority: appointment.priority,
          details: appointment.details,
          appointmentId: appointment.id,
          patientId: appointment.patient_id,
          doctorId: appointment.doctor_id
        }
      };
    });
  };

  // Load initial data
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get dashboard data using apiService
      const [dashboardResponse, appointmentsResponse, patientsResponse] = await Promise.all([
        apiService.getDoctorDashboard(),
        apiService.get('/appointments'),
        apiService.getDoctorPatients()
      ]);

      // Set dashboard stats
      if (dashboardResponse?.data) {
        const stats = dashboardResponse.data.data.stats || {};
        setDashboardData({
          stats: {
            totalAppointments: stats.total_appointments || 0,
            todayAppointments: stats.today_appointments || 0,
            pendingAppointments: stats.upcoming_appointments || 0,
            completedAppointments: stats.completed_appointments || 0
          }
        });
      }

      // Transform and set appointments
      const transformedAppointments = transformAppointmentsToCalendar(appointmentsResponse.data.data);

      setAppointments(transformedAppointments);

      // Set patients
      if (patientsResponse?.data) {
        setPatients(patientsResponse.data.data.data);
      }

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setError(error.message || 'Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handle appointment selection from calendar
  const handleSelectEvent = useCallback((event) => {
    setSelectedAppointment(event);
    setIsDetailsModalOpen(true);
  }, []);

  // Handle slot selection for new appointment
  const handleSelectSlot = useCallback((slotInfo) => {
    const newAppointment = {
      start: slotInfo.start,
      end: slotInfo.end
    };
    setEditingAppointment(newAppointment);
    setIsEditModalOpen(true);
  }, []);

  // Handle creating new appointment
  const handleNewAppointment = async () => {
    if (patients.length === 0) {
      setLoadingPatients(true);
      try {
        const patientsResponse = await apiService.getDoctorPatients();
        if (patientsResponse?.data) {
          setPatients(patientsResponse.data.data.data);
        }
      } catch (error) {
        console.error('Error loading patients:', error);
        setError('Failed to load patients. Please try again.');
      } finally {
        setLoadingPatients(false);
      }
    }
    
    setEditingAppointment(null);
    setIsEditModalOpen(true);
  };

  const handleViewPatients = () => {
  setIsPatientsModalOpen(true);
};

  // Handle editing appointment
  const handleEditAppointment = (appointment) => {
    setEditingAppointment(appointment);
    setIsDetailsModalOpen(false);
    setIsEditModalOpen(true);
  };

 

const handleSaveAppointment = async (appointmentData) => {
  try {
    if (editingAppointment?.id) {
      // Update existing appointment
      const updateData = {
        patient_id: appointmentData.patientId,
        appointment_date: moment(appointmentData.start).format('YYYY-MM-DD'),
        appointment_time: moment(appointmentData.start).format('HH:mm'),
        agenda: appointmentData.agenda,
        priority: appointmentData.priority,
        details: appointmentData.details
      };

      const response = await apiService.put(`/appointments/${editingAppointment.id}`, updateData);

      toast.success('Appointment updated successfully');

      // Update local state
      setAppointments(prev => 
        prev.map(apt => {
          if (apt.id === editingAppointment.id) {
            const patient = patients.find(p => p.id == appointmentData.patientId);
            return {
              ...apt,
              title: `${patient?.first_name} - ${appointmentData.agenda}`,
              start: appointmentData.start,
              end: appointmentData.end,
              resource: {
                ...apt.resource,
                patient: patient?.first_name,
                agenda: appointmentData.agenda,
                priority: appointmentData.priority,
                details: appointmentData.details,
                phone: patient?.contact_number,
                patientId: appointmentData.patientId
              }
            };
          }
          return apt;
        })
      );
    } else {
      // Create new appointment
      const createData = {
        patient_id: appointmentData.patientId,
        appointment_date: moment(appointmentData.start).format('YYYY-MM-DD'),
        appointment_time: moment(appointmentData.start).format('HH:mm'),
        agenda: appointmentData.agenda,
        priority: appointmentData.priority || 'normal',
        details: appointmentData.details || '',
        status: 'scheduled'
      };

      const response = await apiService.post('/appointments', createData);

      if (!response.data.success) {
        console.log(response.data);
        // Handle conflict or validation errors
        if (response.data.details?.conflict_type === 'doctor') {
          toast.error(
            `Schedule conflict with Dr. ${response.data.details.existing_appointment?.id} 
             at ${response.data.details.existing_appointment?.raw_time} 
             (${response.data.details.existing_appointment?.duration})`
          );
        } else {
          toast.error(response.data.message || 'Failed to create appointment');
        }
        return; // stop execution
      }

      // ✅ Success
      toast.success('Appointment created successfully');

      const newAppointment = response.data.data.appointment;
      const patient = patients.find(p => p.id == appointmentData.patientId);
      
      const calendarEvent = {
        id: newAppointment.id,
        title: `${patient?.first_name} - ${appointmentData.agenda}`,
        start: appointmentData.start,
        end: appointmentData.end,
        resource: {
          patient: patient?.first_name,
          status: 'scheduled',
          agenda: appointmentData.agenda,
          priority: appointmentData.priority || 'normal',
          details: appointmentData.details,
          phone: patient?.contact_number,
          appointmentId: newAppointment.id,
          patientId: appointmentData.patientId,
          doctorId: newAppointment.doctor_id
        }
      };
      
      setAppointments(prev => [...prev, calendarEvent]);

      // Update dashboard stats
      setDashboardData(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          stats: {
            ...prev.stats,
            totalAppointments: prev.stats.totalAppointments + 1,
            pendingAppointments: prev.stats.pendingAppointments + 1
          }
        };
      });
    }
  } catch (error) {
  console.error('Error saving appointment:', error);

  if (error.response?.data?.errors) {
    // Loop through validation errors
    Object.values(error.response.data.errors).forEach((messages) => {
      messages.forEach((msg) => toast.error(msg));
    });
  } else {
    // Fallback generic error
    const message =
      error.response?.data?.message ||
      'An unexpected error occurred while saving appointment';
    toast.error(message);
  }
}
};


  // Handle status updates
  const handleStatusUpdate = async (appointmentId, newStatus) => {
    try {
      setIsUpdatingStatus(true);
      
      await apiService.patch(`/appointments/${appointmentId}/status`, { status: newStatus });
      
      // Update local state
      setAppointments(prev =>
        prev.map(apt =>
          apt.id === appointmentId
            ? { ...apt, resource: { ...apt.resource, status: newStatus } }
            : apt
        )
      );
      
      // Update selected appointment if it's the one being updated
      if (selectedAppointment?.id === appointmentId) {
        setSelectedAppointment(prev => ({
          ...prev,
          resource: { ...prev.resource, status: newStatus }
        }));
      }
      
      // Update dashboard stats based on status change
      setDashboardData(prev => {
        if (!prev) return prev;
        
        const newStats = { ...prev.stats };
        if (newStatus === 'completed') {
          newStats.completedAppointments += 1;
        } else if (newStatus === 'confirmed') {
          newStats.pendingAppointments = Math.max(0, newStats.pendingAppointments - 1);
        }
        return { ...prev, stats: newStats };
      });

      setIsDetailsModalOpen(false);
    } catch (error) {
      console.error('Error updating appointment status:', error);
      setError('Failed to update appointment status. Please try again.');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Retry function for error states
  const handleRetry = () => {
    loadData();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm mb-2">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Doctor Portal</h1>
            <div className="flex items-center space-x-3">
              <button className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
               <NotificationBell/>
              </button>
              <button 
                onClick={onLogout}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

        {/* Error Alert */}
        {error && (
          <ErrorAlert error={error} onRetry={handleRetry} />
        )}

        {/* Dashboard Stats */}
        {dashboardData && <DashboardStats stats={dashboardData.stats} />}

        {/* Quick Actions */}
        <QuickActions onNewAppointment={handleNewAppointment} onViewPatients={handleViewPatients} />

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Main Calendar - Takes 3/4 of the width on large screens */}
          <div className="xl:col-span-3">
            <AppointmentCalendar
              appointments={appointments}
              onSelectEvent={handleSelectEvent}
              onSelectSlot={handleSelectSlot}
              loading={false}
            />
          </div>

          {/* Sidebar with upcoming appointments */}
          <div className="xl:col-span-1">
            <UpcomingAppointments 
              appointments={appointments} 
              loading={false}
            />
          </div>
        </div>

        {/* Modals */}
        <AppointmentDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
          appointment={selectedAppointment}
          onEdit={handleEditAppointment}
          onStatusUpdate={handleStatusUpdate}
          isUpdating={isUpdatingStatus}
        />

        <AppointmentModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          appointment={editingAppointment}
          patients={patients}
          onSave={handleSaveAppointment}
          isLoading={loadingPatients}
        />

        <PatientsModal
        isOpen={isPatientsModalOpen}
        onClose={() => setIsPatientsModalOpen(false)}
        patients={patients}
        loading={loadingPatients}
      />
      </div>
    </div>
  );
};

export default DoctorDashboard;
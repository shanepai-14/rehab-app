import { useState, useEffect, useCallback } from 'react';
import moment from 'moment';
import { 
  LogOut,
  LayoutDashboard,
  Calendar,
  Users,
  MessageSquare,
  User
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
import AppointmentDetailsModal from './components/doctor/AppointmentDetailsModal'; 
import AppointmentModal from './components/doctor/AppointmentModal';
import NotificationBell from './components/NotificationBell';
import ChatTab from './components/doctor/ChatTab';
import { formatText } from '../utils/navigation';
import ProfileTab from './components/doctor/ProfileTab';

// Main Dashboard Component
const DoctorDashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState(0);
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

  // Define tabs
  const tabs = [
    { label: 'Overview', icon: LayoutDashboard },
    { label: 'Appointments', icon: Calendar },
    { label: 'Patients', icon: Users },
    { label: 'Chat', icon: MessageSquare },
    { label: 'Profile', icon: User }
  ];

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

      // Transform appointments with multi-patient support
      if (appointmentsResponse?.data?.data) {
        const appointmentsData = appointmentsResponse.data.data.data || appointmentsResponse.data.data;
        
        const calendarEvents = appointmentsData.map(apt => {
          // Handle multiple patients
          const patients = apt.patients || [];
          const patientNames = apt.patient_names || 
                            patients.map(p => p.name || `${p.first_name} ${p.last_name}`).join(', ') || 
                            apt.patient || 
                            'Unknown';
          
          // Create a more descriptive title for multi-patient appointments
          const patientDisplay = apt.is_multi_patient 
            ? `${apt.patient_count} Patients: ${patientNames}`
            : patientNames;
          
          return {
            id: apt.id,
            title: `${patientDisplay} - ${formatText(apt.agenda)}`,
            start: new Date(`${apt.appointment_date} ${apt.raw_time}`),
            end: new Date(
              moment(`${apt.appointment_date} ${apt.raw_time}`)
                .add(apt.duration || 30, 'minutes')
                .format('YYYY-MM-DD HH:mm')
            ),
            resource: {
              // Multiple patients data
              patients: patients,
              patientIds: patients.map(p => p.id),
              patient_count: apt.patient_count || patients.length || 1,
              patient_names: patientNames,
              is_multi_patient: apt.is_multi_patient || false,
              
              // Backward compatibility
              patientId: apt.patient_id || (patients[0]?.id),
              patient: patientNames,
              
              // Appointment details
              agenda: apt.agenda,
              priority: apt.priority,
              details: apt.details,
              status: apt.status,
              duration: apt.duration || 30,
              location: apt.location,
              
              // Contact info (first patient for backward compatibility)
              phone: patients[0]?.contact_number || apt.patient?.contact_number,
              
              // Meta information
              is_today: apt.is_today,
              is_upcoming: apt.is_upcoming,
              status_color: apt.status_color,
              priority_color: apt.priority_color,
              
              // Full appointment object for reference
              fullAppointment: apt
            }
          };
        });
        
        setAppointments(calendarEvents);
      }

      // Set patients
      if (patientsResponse?.data) {
        setPatients(patientsResponse.data.data.data || patientsResponse.data.data);
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

  // Handle status updates
  const handleSaveAppointment = async (appointmentData) => {
    try {
      if (editingAppointment?.id) {
        // Update existing appointment with multiple patients
        const updateData = {
          patient_ids: appointmentData.patientIds,
          appointment_date: moment(appointmentData.start).format('YYYY-MM-DD'),
          appointment_time: moment(appointmentData.start).format('HH:mm'),
          agenda: appointmentData.agenda,
          priority: appointmentData.priority,
          details: appointmentData.details,
          duration: appointmentData.duration
        };

        const response = await apiService.put(
          `/appointments/${editingAppointment.id}`, 
          updateData
        );

        if (!response.data.success) {
          toast.error(response.data.message || 'Failed to update appointment');
          return;
        }

        toast.success('Appointment updated successfully');

        // Update local state with multiple patients
        setAppointments(prev => 
          prev.map(apt => {
            if (apt.id === editingAppointment.id) {
              const patientNames = appointmentData.patients
                .map(p => p.first_name)
                .join(', ');
              
              return {
                ...apt,
                title: `${patientNames} - ${formatText(appointmentData.agenda)}`,
                start: appointmentData.start,
                end: appointmentData.end,
                resource: {
                  ...apt.resource,
                  patients: appointmentData.patients,
                  patientIds: appointmentData.patientIds,
                  patient: patientNames,
                  agenda: appointmentData.agenda,
                  priority: appointmentData.priority,
                  details: appointmentData.details,
                  duration: appointmentData.duration
                }
              };
            }
            return apt;
          })
        );
      } else {
        // Create new appointment with multiple patients
        const createData = {
          patient_ids: appointmentData.patientIds,
          appointment_date: moment(appointmentData.start).format('YYYY-MM-DD'),
          appointment_time: moment(appointmentData.start).format('HH:mm'),
          agenda: appointmentData.agenda,
          priority: appointmentData.priority || 'normal',
          details: appointmentData.details || '',
          duration: appointmentData.duration || 30,
          status: 'scheduled'
        };

        const response = await apiService.post('/appointments', createData);

        if (!response.data.success) {
          // Handle conflict or validation errors
          if (response.data.details?.conflict_type === 'doctor') {
            toast.error(
              `Schedule conflict: Another appointment exists at ${response.data.details.existing_appointment?.time}`
            );
          } else if (response.data.details?.conflict_type === 'patient') {
            toast.error(
              `Patient ${response.data.details.patient_name} has a conflicting appointment at ${response.data.details.existing_appointment?.time}`
            );
          } else {
            toast.error(response.data.message || 'Failed to create appointment');
          }
          return;
        }

        toast.success(
          `Appointment created successfully with ${appointmentData.patientIds.length} patient(s)`
        );

        const newAppointment = response.data.data.appointment;
        const patientNames = appointmentData.patients
          .map(p => p.first_name)
          .join(', ');
        
        const calendarEvent = {
          id: newAppointment.id,
          title: `${patientNames} - ${formatText(appointmentData.agenda)}`,
          start: appointmentData.start,
          end: appointmentData.end,
          resource: {
            patients: appointmentData.patients,
            patientIds: appointmentData.patientIds,
            patient: patientNames,
            agenda: appointmentData.agenda,
            priority: appointmentData.priority,
            details: appointmentData.details,
            duration: appointmentData.duration,
            status: 'scheduled',
            phone: appointmentData.patients[0]?.contact_number
          }
        };

        setAppointments(prev => [...prev, calendarEvent]);
      }

      setIsEditModalOpen(false);
      setEditingAppointment(null);

    } catch (error) {
      console.error('Error saving appointment:', error);
      toast.error('An error occurred while saving the appointment');
    }
  };
  
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

  // Render content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 0: // Overview
        return (
          <>
            {/* Dashboard Stats */}
            {dashboardData && <DashboardStats stats={dashboardData.stats} />}

            {/* Quick Actions */}
            <QuickActions onNewAppointment={handleNewAppointment} onViewPatients={handleViewPatients} />

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 pb-20">
              {/* Main Calendar */}
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
          </>
        );

      case 1: // Appointments
        return (
          <div className="pb-20">
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Appointments</h2>
              <p className="text-gray-600 dark:text-gray-400">Manage your appointments</p>
            </div>
            
            <QuickActions onNewAppointment={handleNewAppointment} onViewPatients={handleViewPatients} />
            
            <AppointmentCalendar
              appointments={appointments}
              onSelectEvent={handleSelectEvent}
              onSelectSlot={handleSelectSlot}
              loading={false}
            />
          </div>
        );

      case 2: // Patients
        return (
          <div className="pb-20">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">My Patients</h2>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Total: {patients.length} patients
                  </p>
                </div>
                <button
                  onClick={() => loadData()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Refresh
                </button>
              </div>

              {/* Patient List */}
              <div className="space-y-3">
                {patients.length > 0 ? (
                  patients.map((patient) => (
                    <div
                      key={patient.id}
                      className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center font-semibold">
                            {patient.first_name?.charAt(0)}{patient.last_name?.charAt(0)}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                              {patient.first_name} {patient.last_name}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {patient.contact_number}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-500">
                              District {patient.district} • {patient.municipality || 'N/A'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            patient.patient_type === 'senior' ? 'bg-purple-100 text-purple-800' :
                            patient.patient_type === 'pwd' ? 'bg-orange-100 text-orange-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {patient.patient_type || 'Regular'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    No patients found
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 3: // Chat
        return (
          <ChatTab user={user}></ChatTab>
        );

      case 4: // Profile
        return (
          <ProfileTab user={user}></ProfileTab>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-16">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 shadow-sm mb-2 sticky top-0 z-40">
          <div className="px-4 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Case Manager</h1>
              <div className="flex items-center space-x-3">
                <NotificationBell />
                <button 
                  onClick={onLogout}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 md:hidden"
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

        {/* Tab Content */}
        <div className="px-4">
          {renderTabContent()}
        </div>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-50">
          <div className="flex justify-around py-2 max-w-7xl mx-auto">
            {tabs.map((tab, index) => {
              const Icon = tab.icon;
              const isActive = activeTab === index;
              return (
                <button
                  key={index}
                  onClick={() => setActiveTab(index)}
                  className={`flex flex-col items-center py-2 px-4 rounded-lg transition-colors ${
                    isActive 
                      ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400' 
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                >
                  <Icon className="h-5 w-5 mb-1" />
                  <span className="text-xs font-medium">{tab.label}</span>
                </button>
              );
            })}
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
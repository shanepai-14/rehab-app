import { useState, useEffect, useCallback } from "react";
import moment from 'moment';
import { 
  User, 
  Calendar,
  Activity,
  Users,
  LogOut,
   MessageSquare,
  Clock,
  MapPin,
  AlertCircle
} from 'lucide-react';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import apiService from '../Services/api';
import { toast } from 'sonner';
import ProfileTab from "./components/patient/ProfileTab";
import AppointmentsTab from "./AppointmentsTab";
import NotificationBell from "./components/NotificationBell";
import ChatTab from "./components/patient/ChatTab";
import { formatText } from "../utils/navigation";
import MotivationalQuotes from "./components/patient/MotivationalQuotes";
import { usePusherNotifications } from '../hooks/usePusherNotifications';

// Loading Spinner Component
const LoadingSpinner = ({ message = "Loading..." }) => (
  <div className="flex items-center justify-center p-8">
    <div className="flex flex-col items-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <p className="mt-4 text-gray-600">{message}</p>
    </div>
  </div>
);

// Appointment Details Modal for Patients (Read-only)
const PatientAppointmentDetailsModal = ({ isOpen, onClose, appointment }) => {
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

  return (
    <div className="fixed inset-0  bg-opacity-20 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Appointment Details</h2>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600"
          >
            <User className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center">
            <User className="h-5 w-5 text-gray-400 mr-3" />
            <div>
              <p className="font-medium">{appointment.resource?.doctor}</p>
              <p className="text-sm text-gray-600">{appointment.resource?.specialization}</p>
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

          {appointment.resource?.location && (
            <div className="flex items-center">
              <MapPin className="h-5 w-5 text-gray-400 mr-3" />
              <p>{appointment.resource.location}</p>
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
              <AlertCircle className="h-5 w-5 text-gray-400 mr-3" />
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

          <div className="pt-2 border-t">
            <p className="text-sm text-gray-600"><strong>Type:</strong> {formatText(appointment.resource?.agenda) || 'Consultation'}</p>
          </div>

          {appointment.resource?.details && (
            <div className="pt-2 border-t">
              <p className="text-sm text-gray-600"><strong>Notes:</strong> {appointment.resource.details}</p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function PatientDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState(0);
  const [appointments, setAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const tabs = [
    { icon: Activity, label: 'Overview' },
    { icon: Calendar, label: 'Appointments' },
     { label: 'Chat', icon: MessageSquare, badge: unreadCount },
    { icon: User, label: 'Profile' }
  ];

    const handleNewMessage = useCallback((data) => {
  // Only increment if message is for this user (not sent by them)
  if (data.receiver_contact_number === user.contact_number) {
    setUnreadCount(prev => prev + 1);
  }
}, [user.contact_number]);

// Use the hook with the callback
usePusherNotifications(user, handleNewMessage);

  const loadUnreadCount = async () => {
  try {
    const response = await apiService.get('/chat/unread-count');
    if (response.data.success) {
      setUnreadCount(response.data.data.unread_count || 0);
    }
  } catch (error) {
    console.error('Error loading unread count:', error);
  }
};

  // Transform patient appointments to calendar format
  const transformAppointmentsToCalendar = (appointmentsData) => {
    if (!appointmentsData || !appointmentsData.data) return [];

    return appointmentsData.data.map(appointment => {
      const start = moment(
        `${appointment.date} ${appointment.raw_time}`,
        "YYYY-MM-DD HH:mm"
      ).toDate();

      const end = moment(start).add(appointment.duration || 60, "minutes").toDate();

      return {
        id: appointment.id,
        title: `${appointment.doctor || 'Dr. Unknown'} - ${formatText(appointment.agenda) || 'Appointment'}`,
        start,
        end,
        resource: {
          patient: user.name,
          doctor: appointment.doctor,
          specialization: appointment.specialization,
          status: appointment.status,
          agenda: formatText(appointment.agenda),
          priority: appointment.priority,
          details: appointment.details,
          location: appointment.location,
          appointmentId: appointment.id,
          patientId: appointment.patient_id,
          doctorId: appointment.doctor_id
        }
      };
    });
  };

  // Load patient appointments
  const loadAppointments = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiService.getPatientAppointments();
      
      if (response?.data?.success) {
        const transformedAppointments = transformAppointmentsToCalendar(response.data);
        setAppointments(transformedAppointments);
        
        // Calculate some basic stats for the dashboard
        const appointmentsData = response.data.data || [];
        const today = moment().format('YYYY-MM-DD');
        const upcoming = appointmentsData.filter(apt => apt.date >= today && apt.status !== 'completed').length;
        const completed = appointmentsData.filter(apt => apt.status === 'completed').length;
        const todayAppointments = appointmentsData.filter(apt => apt.date === today).length;

        setDashboardData({
          stats: {
            totalAppointments: appointmentsData.length,
            upcomingAppointments: upcoming,
            completedAppointments: completed,
            todayAppointments: todayAppointments
          }
        });
      } else {
        setError('Failed to load appointments');
      }
    } catch (error) {
      console.error('Error loading appointments:', error);
      setError(error.message || 'Failed to load appointments. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
    loadUnreadCount();
  }, []);

  // Handle appointment selection from calendar
  const handleSelectEvent = useCallback((event) => {
    setSelectedAppointment(event);
    setIsDetailsModalOpen(true);
  }, []);

  // Handle slot selection (disabled for patients)
  const handleSelectSlot = useCallback(() => {
    toast.info('Please contact your doctor to schedule new appointments');
  }, []);

  // Retry function for error states
  const handleRetry = () => {
    loadAppointments();
  };

  const OverviewTab = () => (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
        <h2 className="text-xl font-bold mb-2">Welcome back, {user.name}!</h2>
        <p className="text-blue-100">Here's your health overview for today</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <Calendar className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Upcoming Appointments</p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {dashboardData?.stats?.upcomingAppointments || 0}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {dashboardData?.stats?.completedAppointments || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Today's Appointments */}
      {dashboardData?.stats?.todayAppointments > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Today's Appointments</h3>
          <div className="space-y-3">
            {appointments
              .filter(apt => moment(apt.start).format('YYYY-MM-DD') === moment().format('YYYY-MM-DD'))
              .map(apt => (
                <div key={apt.id} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className={`w-2 h-8 rounded-full ${
                    apt.resource?.status === 'confirmed' ? 'bg-green-500' :
                    apt.resource?.status === 'scheduled' ? 'bg-blue-500' :
                    apt.resource?.status === 'pending' ? 'bg-yellow-500' :
                    'bg-gray-500'
                  }`}></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {apt.resource?.doctor} - {formatText(apt.resource?.agenda)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {moment(apt.start).format('h:mm A')}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

        <MotivationalQuotes/>
      
    </div>
  );


 



  const renderTabContent = () => {
    if (loading && activeTab !== 0) {
      return <LoadingSpinner message="Loading..." />;
    }

    switch (activeTab) {
      case 0:
        return <OverviewTab />;
      case 1:
        return <AppointmentsTab  
        appointments={appointments} 
        handleRetry={handleRetry} 
        error={error} 
        handleSelectEvent={handleSelectEvent}
        handleSelectSlot={handleSelectSlot}
        loading={loading}
        />;
      case 2:
        return <ChatTab user={user} />;  
      case 3:
        return <ProfileTab  user={user}/>;
      default:
        return <OverviewTab />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Patient Portal</h1>
            <div className="flex items-center space-x-3">
              <button className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                <NotificationBell />
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

      {/* Main Content */}
      <div className="px-4 py-6">
        {renderTabContent()}
      </div>

      {/* Appointment Details Modal */}
      <PatientAppointmentDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        appointment={selectedAppointment}
      />

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="flex justify-around py-2">
          {tabs.map((tab, index) => {
            const Icon = tab.icon;
            const isActive = activeTab === index;
            return (
       <button
                key={index}
                onClick={() => setActiveTab(index)}
                className={`flex flex-col items-center py-2 px-4 rounded-lg transition-colors relative ${
                  isActive 
                    ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400' 
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                <div className="relative">
                  <Icon className="h-5 w-5 mb-1" />
                  {tab.badge > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
                      {tab.badge > 9 ? '9+' : tab.badge}
                    </span>
                  )}
                </div>
                <span className="text-xs font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
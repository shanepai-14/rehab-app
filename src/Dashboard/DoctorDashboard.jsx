import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import { 
  Plus, 
  Users, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Edit, 
  Trash2,
  User,
  MapPin,
  Phone,
  Mail,
  Activity,
  TrendingUp,
  CalendarDays
} from 'lucide-react';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

// Mock API functions - replace with actual API calls
const api = {
  async getDashboardData() {
    return {
      stats: {
        totalAppointments: 45,
        todayAppointments: 8,
        pendingAppointments: 12,
        completedAppointments: 33
      },
      upcomingAppointments: [
        { id: 1, patient: 'John Doe', time: '09:00 AM', type: 'Consultation' },
        { id: 2, patient: 'Jane Smith', time: '10:30 AM', type: 'Follow-up' }
      ]
    };
  },

  async getAppointments() {
    const now = new Date();
    return [
      {
        id: 1,
        title: 'John Doe - Consultation',
        start: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 0),
        end: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 10, 0),
        resource: { patient: 'John Doe', status: 'confirmed', type: 'Consultation', phone: '+1234567890' }
      },
      {
        id: 2,
        title: 'Jane Smith - Follow-up',
        start: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 14, 30),
        end: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 15, 30),
        resource: { patient: 'Jane Smith', status: 'pending', type: 'Follow-up', phone: '+1234567891' }
      },
      {
        id: 3,
        title: 'Bob Johnson - Check-up',
        start: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 11, 0),
        end: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 12, 0),
        resource: { patient: 'Bob Johnson', status: 'completed', type: 'Check-up', phone: '+1234567892' }
      }
    ];
  },

  async getAccessiblePatients() {
    return [
      { id: 1, name: 'John Doe', phone: '+1234567890', district: 'Downtown', email: 'john@email.com' },
      { id: 2, name: 'Jane Smith', phone: '+1234567891', district: 'Downtown', email: 'jane@email.com' },
      { id: 3, name: 'Bob Johnson', phone: '+1234567892', district: 'Downtown', email: 'bob@email.com' },
      { id: 4, name: 'Alice Wilson', phone: '+1234567893', district: 'Downtown', email: 'alice@email.com' }
    ];
  },

  async createAppointment(data) {
    console.log('Creating appointment:', data);
    return { id: Date.now(), ...data };
  },

  async updateAppointmentStatus(id, status) {
    console.log('Updating appointment status:', id, status);
    return { success: true };
  },

  async updateAppointment(id, data) {
    console.log('Updating appointment:', id, data);
    return { success: true };
  }
};

// Dashboard Stats Component
const DashboardStats = ({ stats }) => {
  const statCards = [
    { title: 'Total', value: stats.totalAppointments, icon: CalendarDays, color: 'bg-blue-500' },
    { title: 'Today', value: stats.todayAppointments, icon: Clock, color: 'bg-green-500' },
    { title: 'Pending', value: stats.pendingAppointments, icon: Activity, color: 'bg-yellow-500' },
    { title: 'Completed', value: stats.completedAppointments, icon: CheckCircle, color: 'bg-purple-500' }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {statCards.map((stat, index) => (
        <div key={index} className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{stat.title}</p>
              <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
            </div>
            <div className={`${stat.color} p-3 rounded-lg`}>
              <stat.icon className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};


// Quick Actions Component
const QuickActions = ({ onNewAppointment }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-3">Quick Actions</h3>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={onNewAppointment}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Appointment
        </button>
        <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
          <Users className="h-4 w-4 mr-2" />
          View Patients
        </button>

      </div>
    </div>
  );
};

// Appointment Modal Component
const AppointmentModal = ({ isOpen, onClose, appointment, patients, onSave }) => {
  const [formData, setFormData] = useState({
    patientId: '',
    date: '',
    time: '',
    type: 'consultation',
    notes: ''
  });

  useEffect(() => {
    if (appointment) {
      setFormData({
        patientId: appointment.patientId || '',
        date: moment(appointment.start).format('YYYY-MM-DD'),
        time: moment(appointment.start).format('HH:mm'),
        type: appointment.resource?.type?.toLowerCase() || 'consultation',
        notes: appointment.notes || ''
      });
    } else {
      setFormData({
        patientId: '',
        date: moment().format('YYYY-MM-DD'),
        time: '09:00',
        type: 'consultation',
        notes: ''
      });
    }
  }, [appointment]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const appointmentData = {
      ...formData,
      start: moment(`${formData.date} ${formData.time}`).toDate(),
      end: moment(`${formData.date} ${formData.time}`).add(1, 'hour').toDate()
    };
    onSave(appointmentData);
    onClose();
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0  bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50 p-0"
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
              className="text-gray-400 hover:text-gray-600 transition-colors p-1"
              aria-label="Close modal"
            >
              <XCircle className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-6">
          <div className="space-y-4 sm:space-y-6">
            {/* Patient Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Patient *
              </label>
              <select
                value={formData.patientId}
                onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm sm:text-base"
                required
              >
                <option value="">Select a patient</option>
                {patients?.map(patient => (
                  <option key={patient.id} value={patient.id}>
                    {patient.name} - {patient.district}
                  </option>
                ))}
              </select>
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
                />
              </div>
            </div>

            {/* Appointment Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Appointment Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm sm:text-base"
              >
                <option value="consultation">Consultation</option>
                <option value="follow-up">Follow-up</option>
                <option value="check-up">Check-up</option>
                <option value="emergency">Emergency</option>
              </select>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-24 sm:h-28 resize-none text-sm sm:text-base"
                placeholder="Additional notes or special instructions..."
                rows={4}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="w-full sm:flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors font-medium"
            >
              {appointment ? 'Update Appointment' : 'Create Appointment'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Appointment Details Modal
const AppointmentDetailsModal = ({ isOpen, onClose, appointment, onEdit, onStatusUpdate }) => {
  if (!isOpen || !appointment) return null;

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const statusActions = [
    { label: 'Confirm', value: 'confirmed', color: 'bg-green-600 hover:bg-green-700' },
    { label: 'Start', value: 'in-progress', color: 'bg-blue-600 hover:bg-blue-700' },
    { label: 'Complete', value: 'completed', color: 'bg-purple-600 hover:bg-purple-700' },
    { label: 'Cancel', value: 'cancelled', color: 'bg-red-600 hover:bg-red-700' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Appointment Details</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XCircle className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center">
            <User className="h-5 w-5 text-gray-400 mr-3" />
            <div>
              <p className="font-medium">{appointment.resource?.patient}</p>
              <p className="text-sm text-gray-600">{appointment.resource?.type}</p>
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
              {appointment.resource?.status || 'pending'}
            </span>
          </div>

          <div className="pt-4 border-t">
            <h4 className="font-medium mb-2">Quick Actions</h4>
            <div className="flex flex-wrap gap-2">
              {statusActions.map(action => (
                <button
                  key={action.value}
                  onClick={() => onStatusUpdate(appointment.id, action.value)}
                  className={`px-3 py-1 text-xs text-white rounded ${action.color} transition-colors`}
                >
                  {action.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={() => onEdit(appointment)}
              className="flex items-center flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors justify-center"
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

// Main Calendar Component using React Big Calendar
const AppointmentCalendar = ({ appointments, onSelectEvent, onSelectSlot }) => {
  // Event styling based on appointment status
  const eventStyleGetter = (event) => {
    let backgroundColor = '#3174ad';
    
    if (event.resource?.status === 'confirmed') {
      backgroundColor = '#10b981';
    } else if (event.resource?.status === 'pending') {
      backgroundColor = '#f59e0b';
    } else if (event.resource?.status === 'completed') {
      backgroundColor = '#8b5cf6';
    } else if (event.resource?.status === 'cancelled') {
      backgroundColor = '#ef4444';
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '5px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block'
      }
    };
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Appointment Calendar</h2>
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-yellow-500 rounded mr-2"></div>
            <span>Pending</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
            <span>Confirmed</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-purple-500 rounded mr-2"></div>
            <span>Completed</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-500 rounded mr-2"></div>
            <span>Cancelled</span>
          </div>
        </div>
      </div>
      
      <div style={{ height: '600px' }}>
        <Calendar
          localizer={localizer}
          events={appointments}
          startAccessor="start"
          endAccessor="end"
          onSelectEvent={onSelectEvent}
          onSelectSlot={onSelectSlot}
          selectable
          eventPropGetter={eventStyleGetter}
          views={['month', 'week', 'day', 'agenda']}
          defaultView="week"
          step={30}
          timeslots={2}
          min={new Date(0, 0, 0, 8, 0, 0)}
          max={new Date(0, 0, 0, 18, 0, 0)}
          popup
          showMultiDayTimes
          culture="en-US"
        />
      </div>
    </div>
  );
};

// Upcoming Appointments Widget
const UpcomingAppointments = ({ appointments }) => {
  const today = new Date();
  const upcomingAppts = appointments
    .filter(apt => new Date(apt.start) >= today)
    .sort((a, b) => new Date(a.start) - new Date(b.start))
    .slice(0, 5);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Appointments</h3>
      {upcomingAppts.length === 0 ? (
        <p className="text-gray-600">No upcoming appointments</p>
      ) : (
        <div className="space-y-3">
          {upcomingAppts.map(apt => (
            <div key={apt.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-3 ${
                  apt.resource?.status === 'confirmed' ? 'bg-green-500' :
                  apt.resource?.status === 'pending' ? 'bg-yellow-500' :
                  apt.resource?.status === 'completed' ? 'bg-purple-500' : 'bg-gray-500'
                }`}></div>
                <div>
                  <p className="font-medium text-gray-900">{apt.resource?.patient}</p>
                  <p className="text-sm text-gray-600">{apt.resource?.type}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {moment(apt.start).format('h:mm A')}
                </p>
                <p className="text-xs text-gray-600">
                  {moment(apt.start).format('MMM DD')}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Main Dashboard Component
const DoctorDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [dashboardData, appointmentsData, patientsData] = await Promise.all([
          api.getDashboardData(),
          api.getAppointments(),
          api.getAccessiblePatients()
        ]);

        setDashboardData(dashboardData);
        setAppointments(appointmentsData);
        setPatients(patientsData);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

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
  const handleNewAppointment = () => {
    setEditingAppointment(null);
    setIsEditModalOpen(true);
  };

  // Handle editing appointment
  const handleEditAppointment = (appointment) => {
    setEditingAppointment(appointment);
    setIsDetailsModalOpen(false);
    setIsEditModalOpen(true);
  };

  // Handle saving appointment
  const handleSaveAppointment = async (appointmentData) => {
    try {
      if (editingAppointment?.id) {
        // Update existing appointment
        await api.updateAppointment(editingAppointment.id, appointmentData);
        setAppointments(prev => 
          prev.map(apt => 
            apt.id === editingAppointment.id 
              ? { ...apt, ...appointmentData, title: `${patients.find(p => p.id == appointmentData.patientId)?.name} - ${appointmentData.type}` }
              : apt
          )
        );
      } else {
        // Create new appointment
        const newAppointment = await api.createAppointment(appointmentData);
        const patient = patients.find(p => p.id == appointmentData.patientId);
        
        const calendarEvent = {
          id: newAppointment.id,
          title: `${patient?.name} - ${appointmentData.type}`,
          start: appointmentData.start,
          end: appointmentData.end,
          resource: {
            patient: patient?.name,
            status: 'pending',
            type: appointmentData.type,
            phone: patient?.phone
          }
        };
        
        setAppointments(prev => [...prev, calendarEvent]);

        // Update dashboard stats
        setDashboardData(prev => ({
          ...prev,
          stats: {
            ...prev.stats,
            totalAppointments: prev.stats.totalAppointments + 1,
            pendingAppointments: prev.stats.pendingAppointments + 1
          }
        }));
      }
    } catch (error) {
      console.error('Error saving appointment:', error);
    }
  };

  // Handle status updates
  const handleStatusUpdate = async (appointmentId, newStatus) => {
    try {
      await api.updateAppointmentStatus(appointmentId, newStatus);
      setAppointments(prev =>
        prev.map(apt =>
          apt.id === appointmentId
            ? { ...apt, resource: { ...apt.resource, status: newStatus } }
            : apt
        )
      );
      
      // Update dashboard stats
      setDashboardData(prev => {
        const newStats = { ...prev.stats };
        if (newStatus === 'completed') {
          newStats.completedAppointments += 1;
          newStats.pendingAppointments -= 1;
        } else if (newStatus === 'confirmed') {
          newStats.pendingAppointments -= 1;
        }
        return { ...prev, stats: newStats };
      });

      setIsDetailsModalOpen(false);
    } catch (error) {
      console.error('Error updating appointment status:', error);
    }
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
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Doctor Dashboard</h1>
          <p className="text-gray-600">Manage your appointments and patients efficiently</p>
        </div>

        {/* Dashboard Stats */}
        {dashboardData && <DashboardStats stats={dashboardData.stats} />}

        {/* Quick Actions */}
        <QuickActions onNewAppointment={handleNewAppointment} />

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Main Calendar - Takes 3/4 of the width on large screens */}
          <div className="xl:col-span-3">
            <AppointmentCalendar
              appointments={appointments}
              onSelectEvent={handleSelectEvent}
              onSelectSlot={handleSelectSlot}
            />
          </div>

          {/* Sidebar with upcoming appointments */}
          <div className="xl:col-span-1">
            <UpcomingAppointments appointments={appointments} />
          </div>
        </div>

        {/* Modals */}
        <AppointmentDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
          appointment={selectedAppointment}
          onEdit={handleEditAppointment}
          onStatusUpdate={handleStatusUpdate}
        />

        <AppointmentModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          appointment={editingAppointment}
          patients={patients}
          onSave={handleSaveAppointment}
        />
      </div>
    </div>
  );
};

export default DoctorDashboard;
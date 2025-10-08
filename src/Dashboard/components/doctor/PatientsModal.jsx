import { useState } from 'react';
import { 
  Users, 
  XCircle, 
  Table,
  User,
  MapPin,
  Phone,
  Mail,
  Grid3X3,
  ArrowLeft,
  Calendar,
  Clock,
} from 'lucide-react';
import apiService from '../../../Services/api';

const PatientsModal = ({ isOpen, onClose, patients, loading }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewType, setViewType] = useState('table');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [viewingAppointments, setViewingAppointments] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(false);

  const filteredPatients = patients?.filter(patient =>
    patient.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.contact_number?.includes(searchTerm) ||
    patient.district?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // Fetch appointments for a specific patient
  const fetchPatientAppointments = async (patientId) => {
    setAppointmentsLoading(true);
    try {
      const response = await apiService.get(`/appointments/patients/${patientId}`);

      if (response.data.success) {
        setAppointments(response.data.data);
      } else {
        console.error('Failed to fetch appointments:', response.message);
        setAppointments([]);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setAppointments([]);
    } finally {
      setAppointmentsLoading(false);
    }
  };

  const handleViewPatient = (patient) => {
    console.log(patient);
    setSelectedPatient(patient);
    setViewingAppointments(true);
    fetchPatientAppointments(patient.id);
  };

  const handleBackToPatients = () => {
    setSelectedPatient(null);
    setViewingAppointments(false);
    setAppointments([]);
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high':
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'medium':
      case 'normal':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex">
      <div className="bg-white w-full h-full flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center">
              {viewingAppointments && (
                <button
                  onClick={handleBackToPatients}
                  className="mr-4 text-gray-600 hover:text-gray-900 p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
              )}
              <h2 className="text-2xl font-semibold text-gray-900">
                {viewingAppointments ? `${selectedPatient?.name || 'Patient'}'s Appointments` : 'My Patients'}
              </h2>
            </div>
            <button 
              onClick={onClose} 
              className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
            >
              <XCircle className="h-6 w-6" />
            </button>
          </div>
          
          {!viewingAppointments && (
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <input
                  type="text"
                  placeholder="Search patients by name, phone, or district..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <User className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
              
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewType('table')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewType === 'table'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <div className="flex items-center">
                    <Table className="h-4 w-4 mr-2" />
                    Table
                  </div>
                </button>
                <button
                  onClick={() => setViewType('card')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewType === 'card'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <div className="flex items-center">
                    <Grid3X3 className="h-4 w-4 mr-2" />
                    Cards
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden">
          {viewingAppointments ? (
            // Appointments View
            <div className="h-full overflow-auto px-6 py-4">
              {/* Patient Info Card */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                <div className="flex items-center">
                  <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
                    <User className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {selectedPatient?.name || `${selectedPatient?.first_name} ${selectedPatient?.last_name}`.trim()}
                    </h3>
                    <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                      {selectedPatient?.contact_number && (
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 mr-2 text-gray-400" />
                          {selectedPatient.contact_number}
                        </div>
                      )}
                      {selectedPatient?.email && (
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 mr-2 text-gray-400" />
                          {selectedPatient.email}
                        </div>
                      )}
                      {selectedPatient?.district && (
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                          District {selectedPatient.district}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Appointments Table */}
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    Appointment History
                  </h3>
                </div>
                
                {appointmentsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <p className="text-gray-600">Loading appointments...</p>
                    </div>
                  </div>
                ) : appointments.length === 0 ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-600 text-lg">No appointments found for this patient.</p>
                    </div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Time
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Agenda
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Doctor
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Priority
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Location
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {appointments.map(appointment => (
                          <tr key={appointment.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center text-sm text-gray-900">
                                <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                                {appointment.formatted_date || appointment.appointment_date}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center text-sm text-gray-900">
                                <Clock className="h-4 w-4 mr-2 text-gray-400" />
                                {appointment.appointment_time}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900 max-w-xs truncate">
                                {appointment.agenda || '-'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{appointment.doctor || 'Unassigned'}</div>
                              {appointment.doctor_specialization && (
                                <div className="text-xs text-gray-500">{appointment.doctor_specialization}</div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                                {appointment.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(appointment.priority)}`}>
                                {appointment.priority}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-start text-sm text-gray-600">
                                <MapPin className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0 mt-0.5" />
                                <span className="line-clamp-2">{appointment.location || '-'}</span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          ) : loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading patients...</p>
              </div>
            </div>
          ) : filteredPatients.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 text-lg">
                  {searchTerm ? 'No patients found matching your search.' : 'No patients assigned to you.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="h-full overflow-auto">
              {viewType === 'table' ? (
                <div className="px-6 py-4">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Name
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Contact
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Email
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            District
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredPatients.map(patient => (
                          <tr key={patient.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10">
                                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                    <User className="h-5 w-5 text-blue-600" />
                                  </div>
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">
                                    {patient.name || `${patient.first_name} ${patient.last_name}`.trim()}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{patient.contact_number || '-'}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{patient.email || '-'}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{patient.district || '-'}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button 
                                onClick={() => handleViewPatient(patient)}
                                className="text-blue-600 hover:text-blue-900 font-medium"
                              >
                                View
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="px-6 py-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredPatients.map(patient => (
                      <div key={patient.id} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                        <div className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex-shrink-0">
                              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                                <User className="h-6 w-6 text-blue-600" />
                              </div>
                            </div>
                            <div className="ml-4 flex-1">
                              <h3 className="text-lg font-semibold text-gray-900 truncate">
                                {patient.name || `${patient.first_name} ${patient.last_name}`.trim()}
                              </h3>
                            </div>
                          </div>
                          
                          <div className="space-y-3">
                            {patient.contact_number && (
                              <div className="flex items-center text-sm text-gray-600">
                                <Phone className="h-4 w-4 mr-3 text-gray-400 flex-shrink-0" />
                                <span className="truncate">{patient.contact_number}</span>
                              </div>
                            )}
                            
                            {patient.email && (
                              <div className="flex items-center text-sm text-gray-600">
                                <Mail className="h-4 w-4 mr-3 text-gray-400 flex-shrink-0" />
                                <span className="truncate">{patient.email}</span>
                              </div>
                            )}
                            
                            {patient.district && (
                              <div className="flex items-center text-sm text-gray-600">
                                <MapPin className="h-4 w-4 mr-3 text-gray-400 flex-shrink-0" />
                                <span className="truncate">District {patient.district}</span>
                              </div>
                            )}
                          </div>
                          
                          <div className="mt-6">
                            <button 
                              onClick={() => handleViewPatient(patient)}
                              className="w-full px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                            >
                              View Details
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer with Results Count */}
        {!loading && !viewingAppointments && filteredPatients.length > 0 && (
          <div className="bg-gray-50 border-t border-gray-200 px-6 py-3 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">{filteredPatients.length}</span> of{' '}
                <span className="font-medium">{patients?.length || 0}</span> patients
              </div>
              <div className="text-sm text-gray-500">
                {searchTerm && `Filtered by: "${searchTerm}"`}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientsModal;
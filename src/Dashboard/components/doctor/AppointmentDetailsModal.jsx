import moment from 'moment';
import { 
  Calendar,
  CheckCircle,
  XCircle,
  PlayCircle,
  UserX,
  Clock
} from 'lucide-react';

// Status configuration matching the AppointmentModal
const STATUS_CONFIG = {
  scheduled: { 
    label: 'Scheduled', 
    color: 'bg-blue-100 text-blue-800 border-blue-300',
    icon: Calendar
  },
  confirmed: { 
    label: 'Confirmed', 
    color: 'bg-green-100 text-green-800 border-green-300',
    icon: CheckCircle
  },
  in_progress: { 
    label: 'In Progress', 
    color: 'bg-purple-100 text-purple-800 border-purple-300',
    icon: PlayCircle
  },
  completed: { 
    label: 'Completed', 
    color: 'bg-teal-100 text-teal-800 border-teal-300',
    icon: CheckCircle
  },
  cancelled: { 
    label: 'Cancelled', 
    color: 'bg-red-100 text-red-800 border-red-300',
    icon: XCircle
  },
  no_show: { 
    label: 'No Show', 
    color: 'bg-gray-100 text-gray-800 border-gray-300',
    icon: UserX
  }
};

const formatText = (text) => {
  if (!text) return '';
  return text.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
};

const AppointmentDetailsModal = ({ appointment, onClose, onEdit, isOpen, isUpdatingStatus }) => {
  if (!appointment) return null;
  if (!isOpen) return null;

  const patients = appointment.resource?.patients || [];
  const hasMultiplePatients = patients.length > 1;
  const status = appointment.resource?.status || 'scheduled';
  const statusConfig = STATUS_CONFIG[status] || STATUS_CONFIG.scheduled;
  const StatusIcon = statusConfig.icon;

  return (
    <div className="fixed inset-0  bg-opacity-50 flex items-center justify-center z-50 p-2">
      <div className="bg-white rounded-lg shadow-xl max-w-xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h3 className="text-xl font-semibold mb-4">Appointment Details</h3>
          
          {/* Status Display - Prominent Chip */}
          <div className="mb-4 pb-4 border-b border-gray-200">
            <label className="text-sm font-medium text-gray-600 block mb-2">Status</label>
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border-2 font-medium ${statusConfig.color}`}>
              <StatusIcon className="w-5 h-5" />
              <span>{statusConfig.label}</span>
            </div>
          </div>

          {/* Patient Information */}
          <div className="mb-4">
            <label className="text-sm font-medium text-gray-600">
              Patient{hasMultiplePatients ? 's' : ''}
            </label>
            {hasMultiplePatients ? (
              <div className="mt-2 space-y-2">
                {patients.map((patient, index) => (
                  <div key={index} className="flex items-center p-2 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center mr-2 text-sm font-medium">
                      {patient.first_name?.charAt(0) || patient.name?.charAt(0) || (index + 1)}
                    </div>
                    <div>
                      <div className="text-sm font-medium">
                        {patient.first_name && patient.last_name 
                          ? `${patient.first_name} ${patient.last_name}`
                          : patient.name}
                      </div>
                      {patient.contact_number && (
                        <div className="text-xs text-gray-500">{patient.contact_number}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-900 mt-1">
                {patients[0]?.first_name && patients[0]?.last_name
                  ? `${patients[0].first_name} ${patients[0].last_name}`
                  : appointment.resource?.patient}
              </p>
            )}
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-600">Date & Time</label>
              <p className="text-gray-900">
                {moment(appointment.start).format('MMMM D, YYYY [at] h:mm A')}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Duration: {appointment.resource?.duration || 30} minutes
              </p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-600">Type</label>
              <p className="text-gray-900 capitalize">{formatText(appointment.resource?.agenda)}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-600">Priority</label>
              <span className={`inline-block px-3 py-1 rounded-lg text-sm font-medium border-2 ${
                appointment.resource?.priority === 'urgent' 
                  ? 'bg-red-100 text-red-800 border-red-300' :
                appointment.resource?.priority === 'high' 
                  ? 'bg-orange-100 text-orange-800 border-orange-300' :
                appointment.resource?.priority === 'low' 
                  ? 'bg-gray-100 text-gray-800 border-gray-300' :
                'bg-blue-100 text-blue-800 border-blue-300'
              }`}>
                {appointment.resource?.priority || 'Normal'}
              </span>
            </div>

            {appointment.resource?.details && (
              <div>
                <label className="text-sm font-medium text-gray-600">Details</label>
                <p className="text-gray-900 mt-1 text-sm bg-gray-50 p-3 rounded-lg">
                  {appointment.resource.details}
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Close
            </button>
            <button
              onClick={() => onEdit(appointment)}
              disabled={isUpdatingStatus}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUpdatingStatus ? 'Updating...' : 'Edit'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentDetailsModal;
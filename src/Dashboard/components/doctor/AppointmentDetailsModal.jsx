
import moment from 'moment';
import { formatText } from '../../../utils/navigation';

// Appointment Details Modal
const AppointmentDetailsModal = ({ appointment, onClose, onEdit, isOpen , isUpdatingStatus }) => {
  if (!appointment) return null;

  if (!isOpen) return null;

  const patients = appointment.resource?.patients || [];
  const hasMultiplePatients = patients.length > 1;

  return (
    <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50 p-2">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          <h3 className="text-xl font-semibold mb-4">Appointment Details</h3>
          
          {/* Patient Information */}
          <div className="mb-4">
            <label className="text-sm font-medium text-gray-600">
              Patient{hasMultiplePatients ? 's' : ''}
            </label>
            {hasMultiplePatients ? (
              <div className="mt-2 space-y-2">
                {patients.map((patient, index) => (
                  <div key={index} className="flex items-center p-2 bg-gray-50 rounded">
                    <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center mr-2 text-sm font-medium">
                      {patient.name?.charAt(0) || (index + 1)}
                    </div>
                    <div>
                      <div className="text-sm font-medium">{patient.name}</div>
                      {patient.contact_number && (
                        <div className="text-xs text-gray-500">{patient.contact_number}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-900 mt-1">{appointment.resource?.patient}</p>
            )}
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-600">Date & Time</label>
              <p className="text-gray-900">
                {moment(appointment.start).format('MMMM D, YYYY [at] h:mm A')}
              </p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-600">Type</label>
              <p className="text-gray-900 capitalize">{formatText(appointment.resource?.agenda)}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-600">Priority</label>
              <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                appointment.resource?.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                appointment.resource?.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                appointment.resource?.priority === 'low' ? 'bg-gray-100 text-gray-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                {appointment.resource?.priority || 'Normal'}
              </span>
            </div>

            {appointment.resource?.details && (
              <div>
                <label className="text-sm font-medium text-gray-600">Details</label>
                <p className="text-gray-900">{appointment.resource.details}</p>
              </div>
            )}
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Close
            </button>
            <button
              onClick={() => onEdit(appointment)}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Edit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentDetailsModal;
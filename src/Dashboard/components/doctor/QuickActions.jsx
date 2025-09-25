import { 
  Plus, 
  Users, 
} from 'lucide-react';

const QuickActions = ({ onNewAppointment, onViewPatients }) => {
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
        <button 
          onClick={onViewPatients}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Users className="h-4 w-4 mr-2" />
          View Patients
        </button>
      </div>
    </div>
  );
};

export default QuickActions
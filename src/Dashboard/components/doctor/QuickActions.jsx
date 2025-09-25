import { 
  Plus, 
  Users, 
} from 'lucide-react';

const QuickActions = ({ onNewAppointment, onViewPatients }) => {
  return (
    <>
      {/* Desktop/Tablet View */}
      <div className="hidden sm:block bg-white rounded-lg shadow-md p-4 mb-6 mx-1">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Quick Actions</h3>
        <div className="flex gap-2">
          <button
            onClick={onNewAppointment}
            className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-base"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Appointment
          </button>
          <button 
            onClick={onViewPatients}
            className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-base"
          >
            <Users className="h-4 w-4 mr-2" />
            View Patients
          </button>
        </div>
      </div>

      {/* Mobile FAB Icons */}
      <div className="sm:hidden fixed bottom-6 right-4 flex flex-col space-y-3 z-40">
        {/* New Appointment FAB */}
        <button
          onClick={onNewAppointment}
          className="group relative w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 active:scale-95 transition-all duration-200 flex items-center justify-center"
          aria-label="New Appointment"
        >
          <Plus className="h-6 w-6" />
          
          {/* Tooltip */}
          <div className="absolute right-full mr-3 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
            New Appointment
            <div className="absolute top-1/2 -right-1 w-2 h-2 bg-gray-900 rotate-45 transform -translate-y-1/2"></div>
          </div>
        </button>

        {/* View Patients FAB */}
        <button
          onClick={onViewPatients}
          className="group relative w-14 h-14 bg-green-600 text-white rounded-full shadow-lg hover:bg-green-700 active:scale-95 transition-all duration-200 flex items-center justify-center"
          aria-label="View Patients"
        >
          <Users className="h-6 w-6" />
          
          {/* Tooltip */}
          <div className="absolute right-full mr-3 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
            View Patients
            <div className="absolute top-1/2 -right-1 w-2 h-2 bg-gray-900 rotate-45 transform -translate-y-1/2"></div>
          </div>
        </button>
      </div>
    </>
  );
};

export default QuickActions;
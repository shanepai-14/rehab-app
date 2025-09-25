import { 
  User, 
} from 'lucide-react';



 const DoctorsTab = ({ appointments }) => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Your Healthcare Team</h3>
        <div className="space-y-4">
          {/* Extract unique doctors from appointments */}
          {[...new Map(appointments.map(apt => [apt.resource?.doctorId, apt.resource])).values()]
            .filter(resource => resource?.doctor)
            .map((resource, index) => (
              <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 dark:text-white">{resource.doctor}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{resource.specialization || 'General Medicine'}</p>
                </div>
              </div>
            ))}
          
          {appointments.length === 0 && !loading && (
            <p className="text-gray-600 dark:text-gray-400 text-center py-8">
              No doctors found. Schedule an appointment to see your healthcare team.
            </p>
          )}
        </div>
      </div>
    </div>
  );

  export default DoctorsTab;
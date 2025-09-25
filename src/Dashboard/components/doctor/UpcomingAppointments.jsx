import moment from 'moment';


const UpcomingAppointments = ({ appointments, loading }) => {
  const today = new Date();
  const upcomingAppts = appointments
    .filter(apt => new Date(apt.start) >= today)
    .sort((a, b) => new Date(a.start) - new Date(b.start))
    .slice(0, 5);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Appointments</h3>
      {loading ? (
        <LoadingSpinner message="Loading appointments..." />
      ) : upcomingAppts.length === 0 ? (
        <p className="text-gray-600">No upcoming appointments</p>
      ) : (
        <div className="space-y-3">
          {upcomingAppts.map(apt => (
            <div key={apt.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-3 ${
                  apt.resource?.status === 'confirmed' ? 'bg-green-500' :
                  apt.resource?.status === 'scheduled' ? 'bg-blue-500' :
                  apt.resource?.status === 'pending' ? 'bg-yellow-500' :
                  apt.resource?.status === 'completed' ? 'bg-purple-500' :
                  apt.resource?.status === 'in_progress' ? 'bg-indigo-500' : 'bg-gray-500'
                }`}></div>
                <div>
                  <p className="font-medium text-gray-900">{apt.resource?.patient}</p>
                  <p className="text-sm text-gray-600">{apt.resource?.agenda}</p>
                  {apt.resource?.priority && apt.resource.priority !== 'normal' && (
                    <span className={`inline-block text-xs px-2 py-1 rounded mt-1 ${
                      apt.resource.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                      apt.resource.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {apt.resource.priority}
                    </span>
                  )}
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

export default UpcomingAppointments;
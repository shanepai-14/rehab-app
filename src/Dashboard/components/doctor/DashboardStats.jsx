import { 
  Clock, 
  CheckCircle, 
  Activity,
  CalendarDays,
} from 'lucide-react';

const DashboardStats = ({ stats }) => {
  const statCards = [
    { title: 'Total', value: stats.totalAppointments, icon: CalendarDays, color: 'bg-blue-500' },
    { title: 'Today', value: stats.todayAppointments, icon: Clock, color: 'bg-green-500' },
    { title: 'Pending', value: stats.pendingAppointments, icon: Activity, color: 'bg-yellow-500' },
    { title: 'Completed', value: stats.completedAppointments, icon: CheckCircle, color: 'bg-purple-500' }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2 mb-4">
      {statCards.map((stat, index) => (
        <div key={index} className="bg-white rounded-lg shadow-md p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{stat.title}</p>
              <p className="text-1xl font-semibold text-gray-900">{stat.value}</p>
            </div>
            <div className={`${stat.color} p-3 rounded-lg`}>
              <stat.icon className="h-4 w-4 text-white" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DashboardStats;
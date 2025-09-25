import AppointmentCalendar from './components/doctor/AppointmentCalendar';
import UpcomingAppointments from './components/doctor/UpcomingAppointments';
import ErrorAlert from './components/doctor/ErrorAlert';



  const AppointmentsTab = ({ appointments , handleRetry , error , handleSelectEvent , handleSelectSlot  , loading}) => (
    <div className="space-y-6">
      {/* Error Alert */}
      {error && (
        <ErrorAlert error={error} onRetry={handleRetry} />
      )}

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Main Calendar - Takes 3/4 of the width on large screens */}
        <div className="xl:col-span-3">
          <AppointmentCalendar
            appointments={appointments}
            onSelectEvent={handleSelectEvent}
            onSelectSlot={handleSelectSlot}
            loading={loading}
          />
        </div>

        {/* Sidebar with upcoming appointments */}
        <div className="xl:col-span-1">
          <UpcomingAppointments 
            appointments={appointments} 
            loading={loading}
          />
        </div>
      </div>
    </div>
  );

  export default AppointmentsTab;

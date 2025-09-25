import { useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import CustomToolbar from './CustoomToolbar';

const localizer = momentLocalizer(moment);


const AppointmentCalendar = ({ appointments, onSelectEvent, onSelectSlot, loading }) => {
  // Add state for current view and date
  const [currentView, setCurrentView] = useState('day');
  const [currentDate, setCurrentDate] = useState(new Date());

  // Event styling based on appointment status
  const eventStyleGetter = (event) => {
    let backgroundColor = '#3174ad';
    
    const status = event.resource?.status;
    if (status === 'confirmed') {
      backgroundColor = '#10b981';
    } else if (status === 'scheduled') {
      backgroundColor = '#3b82f6';
    } else if (status === 'pending') {
      backgroundColor = '#f59e0b';
    } else if (status === 'completed') {
      backgroundColor = '#8b5cf6';
    } else if (status === 'cancelled') {
      backgroundColor = '#ef4444';
    } else if (status === 'in_progress') {
      backgroundColor = '#6366f1';
    } else if (status === 'no_show') {
      backgroundColor = '#6b7280';
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '5px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block',
         fontSize: '11px', // Smaller font size
        lineHeight: '1.2', // Tighter line spacing
        padding: '2px 4px'
      }
    };
  };

  // Handle view changes
  const handleViewChange = (view) => {
    setCurrentView(view);
  };

  // Handle navigation (when user clicks prev/next arrows)
  const handleNavigate = (date) => {
    setCurrentDate(date);
  };

  // Handle "Today" button click
  const handleTodayClick = () => {
    setCurrentDate(new Date());
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4">
        <LoadingSpinner message="Loading appointments..." />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
  
      <div style={{ height: '600px' }} className="rbc-calendar text-xs [&_.rbc-toolbar_button]:px-2 [&_.rbc-toolbar_button]:py-1 [&_.rbc-toolbar_button]:text-xs [&_.rbc-toolbar_button]:rounded-md">
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
          view={currentView} // Controlled view
          onView={handleViewChange} // Handle view changes from calendar toolbar
          date={currentDate} // Controlled date
          onNavigate={handleNavigate} // Handle date navigation
          step={30}
          timeslots={2}
          min={new Date(0, 0, 0, 8, 0, 0)}
          max={new Date(0, 0, 0, 18, 0, 0)}
          popup
          showMultiDayTimes
          culture="en-US"
          // Optional: Hide the default toolbar if you want to use only custom buttons
          // toolbar={false}
          components={{
            toolbar: CustomToolbar, // 👈 use custom toolbar
          }}
        />
      </div>
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mt-2 space-y-4 lg:space-y-0">
        
        {/* Status Legend */}
<div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
  <div className="flex items-center">
    <div className="w-2.5 h-2.5 bg-blue-500 rounded mr-1.5"></div>
    <span>Scheduled</span>
  </div>
  <div className="flex items-center">
    <div className="w-2.5 h-2.5 bg-yellow-500 rounded mr-1.5"></div>
    <span>Pending</span>
  </div>
  <div className="flex items-center">
    <div className="w-2.5 h-2.5 bg-green-500 rounded mr-1.5"></div>
    <span>Confirmed</span>
  </div>
  <div className="flex items-center">
    <div className="w-2.5 h-2.5 bg-indigo-500 rounded mr-1.5"></div>
    <span>In Progress</span>
  </div>
  <div className="flex items-center">
    <div className="w-2.5 h-2.5 bg-purple-500 rounded mr-1.5"></div>
    <span>Completed</span>
  </div>
  <div className="flex items-center">
    <div className="w-2.5 h-2.5 bg-red-500 rounded mr-1.5"></div>
    <span>Cancelled</span>
  </div>
</div>

      </div>
    </div>
  );
};

export default AppointmentCalendar;
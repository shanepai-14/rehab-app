import moment from 'moment';
import {
  ChevronLeft, 
  ChevronRight,
} from 'lucide-react';

const CustomToolbar = ({ date, label, onNavigate, onView, view }) => {
  const displayDate = date ?? label ?? new Date();
  const formatted = moment(displayDate).format("dddd, MMM D");

  const views = ["month", "week", "day", "agenda"];

  return (
    <div className="mb-2">
      {/* Mobile: date above */}
      <div className="block sm:hidden text-center font-semibold text-gray-700 mb-2">
        {formatted}
      </div>

      {/* Row: left controls, (center date on sm+), right views */}
      <div className="flex items-center justify-between">
        {/* Left: Today + arrows (always left) */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onNavigate("TODAY")}
            className="px-2 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300"
            aria-label="Today"
          >
            Today
          </button>

          <button
            onClick={() => onNavigate("PREV")}
            className="p-1 text-xs bg-gray-200 rounded hover:bg-gray-300"
            aria-label="Previous"
          >
            <ChevronLeft size={14} />
          </button>

          <button
            onClick={() => onNavigate("NEXT")}
            className="p-1 text-xs bg-gray-200 rounded hover:bg-gray-300"
            aria-label="Next"
          >
            <ChevronRight size={14} />
          </button>
        </div>

        {/* Center date only visible on tablet+ to keep it centered */}
        <div className="hidden sm:block text-center font-semibold text-gray-700 flex-1">
          {formatted}
        </div>

        {/* Right: view buttons (always right) */}
        <div className="flex items-center space-x-1">
          {views.map((v) => (
            <button
              key={v}
              onClick={() => onView(v)}
              className={
                "px-2 py-1 text-xs rounded " +
                (view === v ? "bg-blue-600 text-white" : "bg-gray-200 hover:bg-gray-300")
              }
              aria-pressed={view === v}
            >
              {v}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CustomToolbar
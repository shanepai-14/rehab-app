

export default function ProgressCard ({  title, progress, color, icon: Icon, subtitle }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg dark:shadow-gray-900/20">
      <div className="flex items-center mb-3">
        <div className={`p-2 rounded-lg ${color} mr-3`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</h3>
          {subtitle && (
            <p className="text-xs text-gray-500 dark:text-gray-500">{subtitle}</p>
          )}
        </div>
      </div>
      <div className="mb-2">
        <div className="flex items-center justify-between mb-1">
          <span className="text-2xl font-bold text-gray-900 dark:text-white">{progress}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${color}`}
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

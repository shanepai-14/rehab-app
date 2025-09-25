import { 
  AlertCircle,
} from 'lucide-react';

const ErrorAlert = ({ error, onRetry }) => {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
      <div className="flex items-center">
        <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
        <div className="flex-1">
          <h3 className="text-sm font-medium text-red-800">Error Loading Data</h3>
          <p className="text-sm text-red-700">{error}</p>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="ml-3 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorAlert;
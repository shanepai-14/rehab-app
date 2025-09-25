import { 
Loader2,
} from 'lucide-react';

const LoadingSpinner = ({ message = "Loading..." }) => {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600 mb-2" />
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  );
};


export default LoadingSpinner;
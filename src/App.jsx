// App.jsx - Main Application with React Router
import React, { useState, useEffect, createContext, useContext } from 'react';
import { Toaster } from 'sonner'
import { 
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
  useParams,
  createBrowserRouter,
  RouterProvider
} from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';


// Import your existing components
import AdminDashboard from './Dashboard/AdminDashboard';
import PatientDashboard from './Dashboard/PatientDashboard';
import DoctorDashboard from './Dashboard/DoctorDashboard';
import Login from './Authentication/Login';
import OTPVerification from './Authentication/OTPVerification';
import Register from './Authentication/Register';
import { getDashboardPath } from './utils/navigation';


// ==================== ROUTE PROTECTION ====================
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  if (user) {
    const dashboardPath = getDashboardPath(user.role);
    return <Navigate to={dashboardPath} replace />;
  }

  return children;
};



// ==================== ENHANCED COMPONENTS ====================

// Enhanced Login Component


// Enhanced Register Component
const RegisterWithRouter = () => {
  const navigate = useNavigate();

  const handleSwitchToLogin = () => {
    navigate('/login', { replace: true });
  };

  return (
    <Register 
      onSwitchToLogin={handleSwitchToLogin}
    />
  );
};

// Enhanced OTP Verification
const OTPVerificationWithRouter = () => {
  const navigate = useNavigate();
  const { phoneNumber } = useParams();
  const { verifyOTP, pendingVerification } = useAuth();

  const actualPhoneNumber = phoneNumber || pendingVerification;

  useEffect(() => {
    if (!actualPhoneNumber) {
      navigate('/login', { replace: true });
    }
  }, [actualPhoneNumber, navigate]);

  const handleVerify = async () => {
    // Verification successful, redirect to patient dashboard
    navigate('/patient', { replace: true });
  };

  const handleResend = (phone) => {
    console.log('Resending OTP to', phone);
  };

  if (!actualPhoneNumber) {
    return null;
  }

  return (
    <OTPVerification
      phoneNumber={actualPhoneNumber}
      onVerify={handleVerify}
      onResend={handleResend}
    />
  );
};

// Enhanced Dashboard Components
const PatientDashboardWithRouter = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return <PatientDashboard user={user} onLogout={handleLogout} />;
};

const DoctorDashboardWithRouter = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return <DoctorDashboard user={user} onLogout={handleLogout} />;
};

const AdminDashboardWithRouter = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return <AdminDashboard user={user} onLogout={handleLogout} />;
};

// ==================== ERROR PAGES ====================
const Unauthorized = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleGoBack = () => {
    if (user) {
      const dashboardPath = getDashboardPath(user.role);
      navigate(dashboardPath, { replace: true });
    } else {
      navigate('/login', { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="mx-auto h-16 w-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
          <svg className="h-8 w-8 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Access Denied
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            You don't have permission to access this page.
          </p>
        </div>
        <button
          onClick={handleGoBack}
          className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          Go Back
        </button>
      </div>
    </div>
  );
};

const NotFound = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleGoHome = () => {
    if (user) {
      const dashboardPath = getDashboardPath(user.role);
      navigate(dashboardPath, { replace: true });
    } else {
      navigate('/login', { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="mx-auto h-16 w-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
          <span className="text-2xl font-bold text-gray-600 dark:text-gray-400">404</span>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Page Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            The page you're looking for doesn't exist.
          </p>
        </div>
        <button
          onClick={handleGoHome}
          className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          Go Home
        </button>
      </div>
    </div>
  );
};

// ==================== MAIN APP COMPONENT ====================
const routes = [
  // Public Routes - Redirect to dashboard if already authenticated
  {
    path: "/login",
    element: (
      <PublicRoute>
        <Login/>
      </PublicRoute>
    )
  },
  {
    path: "/register",
    element: (
      <PublicRoute>
        <RegisterWithRouter />
      </PublicRoute>
    )
  },
  
  // OTP Verification Route - Accessible during registration flow
  {
    path: "/verify/:phoneNumber",
    element: <OTPVerificationWithRouter />
  },
  
  // Protected Dashboard Routes - Role-based access
  {
    path: "/patient/*",
    element: (
      <ProtectedRoute allowedRoles={['patient']}>
        <PatientDashboardWithRouter />
       </ProtectedRoute>
    )
  },
  {
    path: "/doctor/*",
    element: (
      <ProtectedRoute allowedRoles={['doctor']}>
        <DoctorDashboardWithRouter />
      </ProtectedRoute>
    )
  },
  {
    path: "/admin/*",
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <AdminDashboardWithRouter />
      </ProtectedRoute>
    )
  },
  
  // Default Route - Redirect authenticated users to their dashboard
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <Navigate to="/patient" replace />
      </ProtectedRoute>
    )
  },
  
  // Error Routes
  {
    path: "/unauthorized",
    element: <Unauthorized />
  },
  {
    path: "*",
    element: <NotFound />
  }
];

// Create the router with the routes array
const router = createBrowserRouter(routes);

// App component using RouterProvider
const App = () => {
  return (
    <AuthProvider>
    <Toaster richColors position="top-right" closeButton/>
      <RouterProvider router={router} />
    </AuthProvider>
  );
};

export default App;
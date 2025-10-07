export const getDefaultRoute = (userRole) => {
  const routes = {
    patient: '/patient',
    doctor: '/doctor',
    admin: '/admin'
  };
  return routes[userRole] || '/patient';
};


export const getDashboardPath = (role) => {
  switch (role) {
    case 'admin': return '/admin';
    case 'doctor': return '/doctor';
    case 'patient': return '/patient';
    default: return '/patient';
  }
};

export const formatText = (text) => {
  return text
    .split('_') // split by underscore
    .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // capitalize each word
    .join(' '); // join with space
}

export const isPublicRoute = (pathname) => {
  const publicRoutes = ['/login', '/register', '/verify', '/unauthorized', '/404'];
  return publicRoutes.some(route => pathname.startsWith(route));
};

export const getUserPermissions = (userRole) => {
  const permissions = {
    patient: ['read:own_profile', 'read:own_appointments'],
    doctor: ['read:patients', 'write:prescriptions', 'read:appointments'],
    admin: ['read:all_users', 'write:all_users', 'manage:system']
  };
  return permissions[userRole] || [];
};
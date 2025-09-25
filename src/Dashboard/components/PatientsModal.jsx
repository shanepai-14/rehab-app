import { useState } from 'react';
import { 
  Users, 
  XCircle, 
  Table,
  User,
  MapPin,
  Phone,
  Mail,
  Grid3X3,
} from 'lucide-react';



const PatientsModal = ({ isOpen, onClose, patients, loading }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewType, setViewType] = useState('table'); // 'table' or 'card'

  const filteredPatients = patients?.filter(patient =>
    patient.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.contact_number?.includes(searchTerm) ||
    patient.district?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex">
      <div className="bg-white w-full h-full flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-gray-900">My Patients</h2>
            <button 
              onClick={onClose} 
              className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
            >
              <XCircle className="h-6 w-6" />
            </button>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search patients by name, phone, or district..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <User className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
            
            {/* View Toggle Buttons */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewType('table')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewType === 'table'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center">
                  <Table className="h-4 w-4 mr-2" />
                  Table
                </div>
              </button>
              <button
                onClick={() => setViewType('card')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewType === 'card'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center">
                  <Grid3X3 className="h-4 w-4 mr-2" />
                  Cards
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <LoadingSpinner message="Loading patients..." />
            </div>
          ) : filteredPatients.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 text-lg">
                  {searchTerm ? 'No patients found matching your search.' : 'No patients assigned to you.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="h-full overflow-auto">
              {viewType === 'table' ? (
                // Table View
                <div className="px-6 py-4">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Name
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Contact
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Email
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            District
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredPatients.map(patient => (
                          <tr key={patient.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10">
                                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                    <User className="h-5 w-5 text-blue-600" />
                                  </div>
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">
                                    {patient.name || `${patient.first_name} ${patient.last_name}`.trim()}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{patient.contact_number || '-'}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{patient.email || '-'}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{patient.district || '-'}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button className="text-blue-600 hover:text-blue-900 mr-4">
                                View
                              </button>
                              {/* <button className="text-gray-600 hover:text-gray-900">
                                Edit
                              </button> */}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                // Card View
                <div className="px-6 py-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredPatients.map(patient => (
                      <div key={patient.id} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                        <div className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex-shrink-0">
                              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                                <User className="h-6 w-6 text-blue-600" />
                              </div>
                            </div>
                            <div className="ml-4 flex-1">
                              <h3 className="text-lg font-semibold text-gray-900 truncate">
                                {patient.name || `${patient.first_name} ${patient.last_name}`.trim()}
                              </h3>
                            </div>
                          </div>
                          
                          <div className="space-y-3">
                            {patient.contact_number && (
                              <div className="flex items-center text-sm text-gray-600">
                                <Phone className="h-4 w-4 mr-3 text-gray-400 flex-shrink-0" />
                                <span className="truncate">{patient.contact_number}</span>
                              </div>
                            )}
                            
                            {patient.email && (
                              <div className="flex items-center text-sm text-gray-600">
                                <Mail className="h-4 w-4 mr-3 text-gray-400 flex-shrink-0" />
                                <span className="truncate">{patient.email}</span>
                              </div>
                            )}
                            
                            {patient.district && (
                              <div className="flex items-center text-sm text-gray-600">
                                <MapPin className="h-4 w-4 mr-3 text-gray-400 flex-shrink-0" />
                                <span className="truncate">District {patient.district}</span>
                              </div>
                            )}
                          </div>
                          
                          <div className="mt-6 flex space-x-2">
                            <button className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors">
                              View Details
                            </button>
                            {/* <button className="px-3 py-2 border border-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-50 transition-colors">
                              Edit
                            </button> */}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer with Results Count */}
        {!loading && filteredPatients.length > 0 && (
          <div className="bg-gray-50 border-t border-gray-200 px-6 py-3 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">{filteredPatients.length}</span> of{' '}
                <span className="font-medium">{patients?.length || 0}</span> patients
              </div>
              <div className="text-sm text-gray-500">
                {searchTerm && `Filtered by: "${searchTerm}"`}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientsModal;
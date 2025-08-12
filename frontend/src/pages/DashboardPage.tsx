import { useQuery } from '@tanstack/react-query';
import { apiService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { 
  ClockIcon, 
  CalendarIcon, 
  UserGroupIcon,
  CheckCircleIcon,
  XCircleIcon 
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../components/LoadingSpinner';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  const { data: activeEntry, isLoading: activeEntryLoading } = useQuery({
    queryKey: ['activeEntry'],
    queryFn: apiService.getMyActiveEntry,
    retry: false,
  });

  const { data: timeEntries = [], isLoading: entriesLoading } = useQuery({
    queryKey: ['timeEntries'],
    queryFn: apiService.getMyTimeEntries,
  });

  const { data: vacationRequests = [], isLoading: vacationLoading } = useQuery({
    queryKey: ['vacationRequests'],
    queryFn: apiService.getMyVacationRequests,
  });

  if (activeEntryLoading || entriesLoading || vacationLoading) {
    return <LoadingSpinner />;
  }

  const todayEntries = timeEntries.filter(entry => {
    const entryDate = new Date(entry.clock_in_time).toDateString();
    const today = new Date().toDateString();
    return entryDate === today;
  });

  const pendingVacations = vacationRequests.filter(req => req.status === 'pending');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back, {user?.full_name}!</p>
      </div>

      {/* Quick Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-primary-100 rounded-lg">
              <ClockIcon className="h-6 w-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Current Status</p>
              <p className="text-lg font-semibold text-gray-900">
                {activeEntry ? 'Clocked In' : 'Not Working'}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CalendarIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Today's Entries</p>
              <p className="text-lg font-semibold text-gray-900">{todayEntries.length}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <UserGroupIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Pending Requests</p>
              <p className="text-lg font-semibold text-gray-900">{pendingVacations.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Current Status Details */}
      {activeEntry && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Current Shift</h2>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-800 font-medium">Currently Working</p>
                <p className="text-green-700 text-sm">
                  Started at {new Date(activeEntry.clock_in_time).toLocaleTimeString()}
                </p>
                {activeEntry.location && (
                  <p className="text-green-700 text-sm">Location: {activeEntry.location.name}</p>
                )}
              </div>
              <div className="text-right">
                <p className="text-green-800 font-medium">
                  {Math.floor((Date.now() - new Date(activeEntry.clock_in_time).getTime()) / (1000 * 60 * 60))}h 
                  {Math.floor(((Date.now() - new Date(activeEntry.clock_in_time).getTime()) % (1000 * 60 * 60)) / (1000 * 60))}m
                </p>
                <p className="text-green-700 text-sm">Duration</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Vacation Requests */}
      {vacationRequests.length > 0 && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Vacation Requests</h2>
          <div className="space-y-3">
            {vacationRequests.slice(0, 5).map((request) => (
              <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">
                      {new Date(request.date).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-500">{request.reason}</p>
                  </div>
                  <div className="flex items-center">
                    {request.status === 'approved' && (
                      <CheckCircleIcon className="h-5 w-5 text-green-500" />
                    )}
                    {request.status === 'rejected' && (
                      <XCircleIcon className="h-5 w-5 text-red-500" />
                    )}
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                      request.status === 'approved' ? 'bg-green-100 text-green-800' :
                      request.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {request.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => window.location.href = '/time-tracking'}
            className="btn-primary flex items-center justify-center"
          >
            <ClockIcon className="h-5 w-5 mr-2" />
            Time Tracking
          </button>
          <button
            onClick={() => window.location.href = '/vacation'}
            className="btn-secondary flex items-center justify-center"
          >
            <CalendarIcon className="h-5 w-5 mr-2" />
            Vacation Requests
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;

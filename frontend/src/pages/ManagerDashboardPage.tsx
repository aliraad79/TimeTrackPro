import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../services/api';
import { TimeEntry, VacationRequest } from '../types';
import { 
  UserGroupIcon, 
  ClockIcon, 
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon 
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';

const ManagerDashboardPage: React.FC = () => {
  const queryClient = useQueryClient();

  const { data: activeEmployees = [], isLoading: employeesLoading } = useQuery({
    queryKey: ['activeEmployees'],
    queryFn: apiService.getActiveEmployees,
  });

  const { data: pendingRequests = [], isLoading: requestsLoading } = useQuery({
    queryKey: ['pendingRequests'],
    queryFn: apiService.getPendingRequests,
  });

  const approveVacationMutation = useMutation({
    mutationFn: apiService.approveVacationRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingRequests'] });
      toast.success('Request approved successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to approve request');
    },
  });

  const rejectVacationMutation = useMutation({
    mutationFn: ({ requestId, reason }: { requestId: number; reason: string }) =>
      apiService.rejectVacationRequest(requestId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingRequests'] });
      toast.success('Request rejected successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to reject request');
    },
  });

  const handleApprove = (requestId: number) => {
    if (window.confirm('Are you sure you want to approve this request?')) {
      approveVacationMutation.mutate(requestId);
    }
  };

  const handleReject = (requestId: number) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (reason) {
      rejectVacationMutation.mutate({ requestId, reason });
    }
  };

  if (employeesLoading || requestsLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Manager Dashboard</h1>
        <p className="text-gray-600">Monitor your team and manage requests</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <UserGroupIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Active Employees</p>
              <p className="text-2xl font-bold text-gray-900">{activeEmployees.length}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <CalendarIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Pending Requests</p>
              <p className="text-2xl font-bold text-gray-900">{pendingRequests.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Active Employees */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Currently Working</h2>
        
        {activeEmployees.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No employees currently working</p>
        ) : (
          <div className="space-y-3">
            {activeEmployees.map((entry) => (
              <div key={entry.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                      <span className="text-sm font-medium text-primary-700">
                        {entry.user?.full_name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{entry.user?.full_name}</p>
                      <p className="text-sm text-gray-500">{entry.user?.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Started at</p>
                    <p className="font-medium text-gray-900">
                      {new Date(entry.clock_in_time).toLocaleTimeString()}
                    </p>
                    <p className="text-sm text-gray-500">
                      {Math.floor((Date.now() - new Date(entry.clock_in_time).getTime()) / (1000 * 60 * 60))}h 
                      {Math.floor(((Date.now() - new Date(entry.clock_in_time).getTime()) % (1000 * 60 * 60)) / (1000 * 60))}m
                    </p>
                  </div>
                </div>
                {entry.location && (
                  <div className="mt-2 flex items-center text-sm text-gray-500">
                    <ClockIcon className="h-4 w-4 mr-1" />
                    {entry.location.name}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pending Vacation Requests */}
      {pendingRequests.length > 0 && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Pending Vacation Requests</h2>
          <div className="space-y-4">
            {pendingRequests.map((request) => (
              <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-medium text-gray-900">{request.user?.full_name}</h3>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Pending
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-1">
                      {new Date(request.start_date).toLocaleDateString()} - {new Date(request.end_date).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-600 mb-1">
                      <span className="font-medium">Type:</span> {request.vacation_type.replace('_', ' ')}
                    </p>
                    <p className="text-sm text-gray-600 mb-1">
                      <span className="font-medium">Duration:</span> {request.duration_days} day(s)
                    </p>
                    <p className="text-sm text-gray-600 mb-2">
                      <span className="font-medium">Reason:</span> {request.reason}
                    </p>
                    
                    {request.notes && (
                      <p className="text-sm text-gray-500">
                        <span className="font-medium">Notes:</span> {request.notes}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleApprove(request.id)}
                      disabled={approveVacationMutation.isPending}
                      className="btn-success flex items-center"
                    >
                      <CheckCircleIcon className="h-4 w-4 mr-1" />
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(request.id)}
                      disabled={rejectVacationMutation.isPending}
                      className="btn-danger flex items-center"
                    >
                      <XCircleIcon className="h-4 w-4 mr-1" />
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerDashboardPage;

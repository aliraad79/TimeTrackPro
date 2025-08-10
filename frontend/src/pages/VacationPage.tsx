import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../services/api';
import { VacationRequest, VacationRequestCreate } from '../types';
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';

const VacationPage: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<VacationRequestCreate>({
    start_date: '',
    end_date: '',
    vacation_type: 'vacation',
    reason: '',
    notes: '',
  });

  const queryClient = useQueryClient();

  const { data: vacationRequests = [], isLoading } = useQuery({
    queryKey: ['vacationRequests'],
    queryFn: apiService.getMyVacationRequests,
  });

  const createVacationMutation = useMutation({
    mutationFn: apiService.createVacationRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vacationRequests'] });
      setShowForm(false);
      setFormData({
        start_date: '',
        end_date: '',
        vacation_type: 'vacation',
        reason: '',
        notes: '',
      });
      toast.success('Vacation request submitted successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to submit request');
    },
  });

  const cancelVacationMutation = useMutation({
    mutationFn: apiService.cancelVacationRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vacationRequests'] });
      toast.success('Request cancelled successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to cancel request');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createVacationMutation.mutate(formData);
  };

  const handleCancel = (requestId: number) => {
    if (window.confirm('Are you sure you want to cancel this request?')) {
      cancelVacationMutation.mutate(requestId);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Vacation Requests</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary flex items-center"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          New Request
        </button>
      </div>

      {/* New Request Form */}
      {showForm && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">New Vacation Request</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  required
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  required
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  className="input"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <select
                value={formData.vacation_type}
                onChange={(e) => setFormData({ ...formData, vacation_type: e.target.value as any })}
                className="input"
              >
                <option value="vacation">Vacation</option>
                <option value="sick_leave">Sick Leave</option>
                <option value="personal_day">Personal Day</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason
              </label>
              <textarea
                required
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                className="input"
                rows={3}
                placeholder="Please provide a reason for your request..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Additional Notes (Optional)
              </label>
              <textarea
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="input"
                rows={2}
                placeholder="Any additional information..."
              />
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={createVacationMutation.isPending}
                className="btn-primary"
              >
                {createVacationMutation.isPending ? 'Submitting...' : 'Submit Request'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Vacation Requests List */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">My Requests</h2>
        
        {vacationRequests.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No vacation requests found</p>
        ) : (
          <div className="space-y-4">
            {vacationRequests.map((request) => (
              <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-medium text-gray-900">
                        {new Date(request.start_date).toLocaleDateString()} - {new Date(request.end_date).toLocaleDateString()}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        request.status === 'approved' ? 'bg-green-100 text-green-800' :
                        request.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {request.status}
                      </span>
                    </div>
                    
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
                    
                    {request.rejection_reason && (
                      <p className="text-sm text-red-600 mt-2">
                        <span className="font-medium">Rejection Reason:</span> {request.rejection_reason}
                      </p>
                    )}
                  </div>
                  
                  {request.status === 'pending' && (
                    <button
                      onClick={() => handleCancel(request.id)}
                      disabled={cancelVacationMutation.isPending}
                      className="btn-danger flex items-center"
                    >
                      <XMarkIcon className="h-4 w-4 mr-1" />
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VacationPage;

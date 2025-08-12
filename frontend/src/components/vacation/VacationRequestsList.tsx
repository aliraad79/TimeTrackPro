import React from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { VacationRequest } from "../../types";

interface VacationRequestsListProps {
  vacationRequests: VacationRequest[];
  onCancel: (requestId: number) => void;
  isCancelling: boolean;
}

const VacationRequestsList: React.FC<VacationRequestsListProps> = ({
  vacationRequests,
  onCancel,
  isCancelling,
}) => (
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
                    {new Date(request.date).toLocaleDateString()}
                  </h3>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      request.status === "approved"
                        ? "bg-green-100 text-green-800"
                        : request.status === "rejected"
                        ? "bg-red-100 text-red-800"
                        : request.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {request.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-1">
                  <span className="font-medium">Type:</span> {request.vacation_type.replace("_", " ")}
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  <span className="font-medium">Reason:</span> {request.reason}
                </p>
                {request.rejection_reason && (
                  <p className="text-sm text-red-600 mt-2">
                    <span className="font-medium">Rejection Reason:</span> {request.rejection_reason}
                  </p>
                )}
              </div>
              {request.status === "pending" && (
                <button
                  onClick={() => onCancel(request.id)}
                  disabled={isCancelling}
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
);

export default VacationRequestsList;

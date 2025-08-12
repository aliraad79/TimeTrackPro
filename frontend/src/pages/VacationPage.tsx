import { PlusIcon } from "@heroicons/react/24/outline";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import toast from "react-hot-toast";
import LoadingSpinner from "../components/LoadingSpinner";
import { apiService } from "../services/api";
import { VacationRequestCreate } from "../types";
import VacationRequestForm from "../components/vacation/VacationRequestForm";
import VacationRequestsList from "../components/vacation/VacationRequestsList";

const VacationPage: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<VacationRequestCreate>({
    date: "",
    vacation_type: "personal_day",
    reason: "",
  });

  const queryClient = useQueryClient();

  const { data: vacationRequests = [], isLoading } = useQuery({
    queryKey: ["vacationRequests"],
    queryFn: apiService.getMyVacationRequests,
  });

  const createVacationMutation = useMutation({
    mutationFn: (data: VacationRequestCreate) => apiService.createVacationRequest(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vacationRequests"] });
      setShowForm(false);
      setFormData({ date: "", vacation_type: "personal_day", reason: "" });
      toast.success("Vacation request submitted successfully!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Failed to submit request");
    },
  });

  const cancelVacationMutation = useMutation({
    mutationFn: apiService.cancelVacationRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vacationRequests"] });
      toast.success("Request cancelled successfully!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Failed to cancel request");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createVacationMutation.mutate(formData);
  };

  const handleCancel = (requestId: number) => {
    if (window.confirm("Are you sure you want to cancel this request?")) {
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

      {showForm && (
        <VacationRequestForm
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleSubmit}
          onCancel={() => setShowForm(false)}
          isSubmitting={createVacationMutation.isPending}
        />
      )}

      <VacationRequestsList
        vacationRequests={vacationRequests}
        onCancel={handleCancel}
        isCancelling={cancelVacationMutation.isPending}
      />
    </div>
  );
};

export default VacationPage;

import React from "react";
import { VacationRequestCreate } from "../../types";

interface VacationRequestFormProps {
  formData: VacationRequestCreate;
  setFormData: (data: VacationRequestCreate) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

const VacationRequestForm: React.FC<VacationRequestFormProps> = ({
  formData,
  setFormData,
  onSubmit,
  onCancel,
  isSubmitting,
}) => (
  <div className="card">
    <h2 className="text-lg font-semibold text-gray-900 mb-4">
      New Vacation Request
    </h2>
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date
          </label>
          <input
            type="date"
            required
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
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
          onChange={(e) =>
            setFormData({
              ...formData,
              vacation_type: e.target.value as any,
            })
          }
          className="input"
        >
          <option value="personal_day">Personal Day</option>
          <option value="sick_leave">Sick Leave</option>
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
      <div className="flex space-x-3">
        <button type="submit" disabled={isSubmitting} className="btn-primary">
          {isSubmitting ? "Submitting..." : "Submit Request"}
        </button>
        <button type="button" onClick={onCancel} className="btn-secondary">
          Cancel
        </button>
      </div>
    </form>
  </div>
);

export default VacationRequestForm;

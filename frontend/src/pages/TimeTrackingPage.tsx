import { ClockIcon, MapPinIcon } from "@heroicons/react/24/outline";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import LoadingSpinner from "../components/LoadingSpinner";
import { apiService } from "../services/api";
import { Location } from "../types";

const TimeTrackingPage: React.FC = () => {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    null
  );
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [locationError, setLocationError] = useState<string>("");

  const queryClient = useQueryClient();

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      // navigator.geolocation.getCurrentPosition(
      //   (position) => {
      //     setUserLocation({
      //       lat: position.coords.latitude,
      //       lng: position.coords.longitude,
      //     });
      //     setLocationError("");
      //   },
      //   (error) => {
      //     setLocationError(
      //       "Unable to get your location. Please enable location services."
      //     );
      //     console.error("Location error:", error);
      //   }
      // );
      setUserLocation({
        lat: 40.741895,
        lng: -73.989308,
      });
      setLocationError("");
    } else {
      setLocationError("Geolocation is not supported by this browser.");
    }
  }, []);

  // Queries
  const { data: locations = [], isLoading: locationsLoading } = useQuery({
    queryKey: ["locations"],
    queryFn: apiService.getLocations,
  });

  const { data: activeEntry, isLoading: activeEntryLoading } = useQuery({
    queryKey: ["activeEntry"],
    queryFn: apiService.getMyActiveEntry,
    retry: false,
  });

  const { data: timeEntries = [], isLoading: entriesLoading } = useQuery({
    queryKey: ["timeEntries"],
    queryFn: apiService.getMyTimeEntries,
  });

  // Mutations
  const clockInMutation = useMutation({
    mutationFn: apiService.clockIn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activeEntry"] });
      queryClient.invalidateQueries({ queryKey: ["timeEntries"] });
      toast.success("Successfully clocked in!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Failed to clock in");
    },
  });

  const clockOutMutation = useMutation({
    mutationFn: apiService.clockOut,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activeEntry"] });
      queryClient.invalidateQueries({ queryKey: ["timeEntries"] });
      toast.success("Successfully clocked out!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Failed to clock out");
    },
  });

  const handleClockIn = () => {
    if (!selectedLocation || !userLocation) {
      toast.error(
        "Please select a location and ensure location access is enabled"
      );
      return;
    }

    clockInMutation.mutate({
      location_id: selectedLocation.id,
      latitude: userLocation.lat,
      longitude: userLocation.lng,
      accuracy: 10, // Default accuracy
    });
  };

  const handleClockOut = () => {
    if (!userLocation) {
      toast.error("Unable to get your location");
      return;
    }

    clockOutMutation.mutate({
      latitude: userLocation.lat,
      longitude: userLocation.lng,
      accuracy: 10,
    });
  };

  if (locationsLoading || activeEntryLoading || entriesLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Time Tracking</h1>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <MapPinIcon className="h-4 w-4" />
          {userLocation ? (
            <span>
              Location: {userLocation.lat.toFixed(4)},{" "}
              {userLocation.lng.toFixed(4)}
            </span>
          ) : (
            <span>Getting location...</span>
          )}
        </div>
      </div>

      {locationError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700 text-sm">{locationError}</p>
        </div>
      )}

      {/* Clock In/Out Section */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Current Status
        </h2>

        {activeEntry ? (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <ClockIcon className="h-5 w-5 text-green-600 mr-2" />
                <span className="text-green-800 font-medium">
                  Currently Clocked In
                </span>
              </div>
              <p className="text-green-700 text-sm mt-1">
                Started at{" "}
                {new Date(activeEntry.clock_in_time).toLocaleTimeString()}
              </p>
            </div>

            <button
              onClick={handleClockOut}
              disabled={clockOutMutation.isPending}
              className="btn-danger w-full"
            >
              {clockOutMutation.isPending ? "Clocking Out..." : "Clock Out"}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center">
                <ClockIcon className="h-5 w-5 text-gray-600 mr-2" />
                <span className="text-gray-800 font-medium">
                  Not Clocked In
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Work Location
              </label>
              <select
                value={selectedLocation?.id || ""}
                onChange={(e) => {
                  const location = locations.find(
                    (loc) => loc.id === parseInt(e.target.value)
                  );
                  setSelectedLocation(location || null);
                }}
                className="input"
              >
                <option value="">Choose a location...</option>
                {locations.map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.name} - {location.address}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleClockIn}
              disabled={!selectedLocation || clockInMutation.isPending}
              className="btn-success w-full"
            >
              {clockInMutation.isPending ? "Clocking In..." : "Clock In"}
            </button>
          </div>
        )}
      </div>

      {/* Recent Time Entries */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Recent Time Entries
        </h2>

        {timeEntries.length === 0 ? (
          <p className="text-gray-500 text-center py-4">
            No time entries found
          </p>
        ) : (
          <div className="space-y-3">
            {timeEntries.slice(0, 10).map((entry) => (
              <div
                key={entry.id}
                className="border border-gray-200 rounded-lg p-4"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-900">
                      {new Date(entry.clock_in_time).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(entry.clock_in_time).toLocaleTimeString()} -
                      {entry.clock_out_time
                        ? new Date(entry.clock_out_time).toLocaleTimeString()
                        : "Active"}
                    </p>
                    {entry.location && (
                      <p className="text-sm text-gray-500">
                        {entry.location.name}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    {entry.duration_minutes && (
                      <p className="font-medium text-gray-900">
                        {Math.floor(entry.duration_minutes / 60)}h{" "}
                        {entry.duration_minutes % 60}m
                      </p>
                    )}
                    {entry.is_active && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Active
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TimeTrackingPage;

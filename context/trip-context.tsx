"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  getTrips as fetchTrips,
  getTrip as fetchTrip,
  createTrip as createTripAction,
  updateTrip as updateTripAction,
  deleteTrip as deleteTripAction,
} from "@/app/actions/trip-actions";
import {
  createActivity as createActivityAction,
  updateActivity as updateActivityAction,
  deleteActivity as deleteActivityAction,
  reorderActivities as reorderActivitiesAction,
} from "@/app/actions/activity-actions";
import { useAuth } from "@/context/auth-context";

// Initial trip data (will be overwritten by data from server)
const initialTripsData = {};

// Define the types
export type Collaborator = {
  id: string;
  name: string;
  color: string;
  email?: string;
};

export type Day = {
  id: string;
  date: string;
  title: string;
  number: string;
};

export type Activity = {
  id: number;
  time: string;
  title: string;
  description: string;
  location: string;
  category: string;
  position?: {
    lat: number;
    lng: number;
  };
  website?: string;
  phoneNumber?: string;
  image?: string;
};

export type Trip = {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  location: string;
  collaborators: Collaborator[];
  days: Day[];
  activities: Record<string, Activity[]>;
  image?: string;
  isCollaborative?: boolean;
  owner?: {
    id: string;
    name: string;
  } | null;
};

export type TripsData = Record<string, Trip>;

// Create the context
type TripContextType = {
  trips: TripsData;
  addTrip: (trip: Trip) => Promise<void>;
  updateTrip: (trip: Trip) => Promise<void>;
  deleteTrip: (id: string) => Promise<void>;
  getTrip: (id: string) => Trip | undefined;
  addActivity: (dayId: string, activity: Omit<Activity, "id">) => Promise<void>;
  updateActivity: (activity: Activity) => Promise<void>;
  deleteActivity: (activityId: number) => Promise<void>;
  reorderActivities: (dayId: string, activityIds: number[]) => Promise<void>;
  isLoading: boolean;
  error: string | null;
};

const TripContext = createContext<TripContextType | undefined>(undefined);

// Create a provider component
export function TripProvider({ children }: { children: ReactNode }) {
  const [trips, setTrips] = useState<TripsData>(initialTripsData);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  // Fetch trips from the server on initial load or when auth state changes
  useEffect(() => {
    // Only fetch trips if the user is authenticated
    if (!isAuthenticated) {
      setTrips(initialTripsData);
      setIsLoading(false);
      return;
    }

    async function loadTrips() {
      try {
        setIsLoading(true);
        setError(null);

        const tripsData = await fetchTrips();

        // Convert array to record object with id as key
        const tripsRecord = tripsData.reduce((acc: TripsData, trip: Trip) => {
          acc[trip.id] = trip;
          return acc;
        }, {} as TripsData);

        setTrips(tripsRecord);
      } catch (err) {
        console.error("Error loading trips:", err);
        setError("Failed to load trips");
      } finally {
        setIsLoading(false);
      }
    }

    loadTrips();
  }, [isAuthenticated]);

  const addTrip = async (trip: Trip) => {
    try {
      setIsLoading(true);

      // Prepare the data for server action
      const { id, ...tripData } = trip;

      // Call server action to create trip
      const newTrip = await createTripAction({
        title: trip.title,
        startDate: trip.startDate,
        endDate: trip.endDate,
        location: trip.location,
        image: trip.image,
        days: trip.days,
        collaborators: trip.collaborators,
      });

      // Update local state
      const updatedTrip = await fetchTrip(newTrip.id);
      if (updatedTrip) {
        setTrips((prev) => ({
          ...prev,
          [updatedTrip.id]: updatedTrip,
        }));
      }
    } catch (err) {
      console.error("Error adding trip:", err);
      setError("Failed to add trip");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateTrip = async (trip: Trip) => {
    try {
      setIsLoading(true);

      // Call server action
      await updateTripAction(trip.id, {
        title: trip.title,
        startDate: trip.startDate,
        endDate: trip.endDate,
        location: trip.location,
        image: trip.image,
      });

      // Refresh trip data
      const updatedTrip = await fetchTrip(trip.id);
      if (updatedTrip) {
        setTrips((prev) => ({
          ...prev,
          [trip.id]: updatedTrip,
        }));
      }
    } catch (err) {
      console.error("Error updating trip:", err);
      setError("Failed to update trip");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteTrip = async (id: string) => {
    try {
      setIsLoading(true);

      // Call server action
      await deleteTripAction(id);

      // Update local state
      setTrips((prev) => {
        const newTrips = { ...prev };
        delete newTrips[id];
        return newTrips;
      });
    } catch (err) {
      console.error("Error deleting trip:", err);
      setError("Failed to delete trip");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const getTrip = (id: string) => {
    return trips[id];
  };

  const addActivity = async (dayId: string, activity: Omit<Activity, "id">) => {
    try {
      setIsLoading(true);

      // Call server action
      await createActivityAction(dayId, {
        time: activity.time,
        title: activity.title,
        description: activity.description,
        location: activity.location,
        category: activity.category,
        position: activity.position,
        website: activity.website,
        phoneNumber: activity.phoneNumber,
        image: activity.image,
      });

      // Find the trip that contains this day
      const tripId = Object.values(trips).find((trip) =>
        trip.days.some((day) => day.id === dayId)
      )?.id;

      if (tripId) {
        // Refresh trip data
        const updatedTrip = await fetchTrip(tripId);
        if (updatedTrip) {
          setTrips((prev) => ({
            ...prev,
            [tripId]: updatedTrip,
          }));
        }
      }
    } catch (err) {
      console.error("Error adding activity:", err);
      setError("Failed to add activity");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateActivity = async (activity: Activity) => {
    try {
      setIsLoading(true);

      // Find the day and trip that contain this activity
      let tripId: string | undefined;
      let dayId: string | undefined;

      for (const trip of Object.values(trips)) {
        for (const [dId, activities] of Object.entries(trip.activities)) {
          if (activities.some((a) => a.id === activity.id)) {
            tripId = trip.id;
            dayId = dId;
            break;
          }
        }
        if (tripId) break;
      }

      if (!tripId || !dayId) {
        throw new Error("Activity not found");
      }

      // Call server action
      await updateActivityAction(activity.id, {
        time: activity.time,
        title: activity.title,
        description: activity.description,
        location: activity.location,
        category: activity.category,
        position: activity.position,
        website: activity.website,
        phoneNumber: activity.phoneNumber,
        image: activity.image,
      });

      // Refresh trip data
      const updatedTrip = await fetchTrip(tripId);
      if (updatedTrip) {
        setTrips((prev) => ({
          ...prev,
          [tripId!]: updatedTrip,
        }));
      }
    } catch (err) {
      console.error("Error updating activity:", err);
      setError("Failed to update activity");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteActivity = async (activityId: number) => {
    try {
      setIsLoading(true);

      // Find the day and trip that contain this activity
      let tripId: string | undefined;
      let dayId: string | undefined;

      for (const trip of Object.values(trips)) {
        for (const [dId, activities] of Object.entries(trip.activities)) {
          if (activities.some((a) => a.id === activityId)) {
            tripId = trip.id;
            dayId = dId;
            break;
          }
        }
        if (tripId) break;
      }

      if (!tripId || !dayId) {
        throw new Error("Activity not found");
      }

      // Call server action
      await deleteActivityAction(activityId);

      // Refresh trip data
      const updatedTrip = await fetchTrip(tripId);
      if (updatedTrip) {
        setTrips((prev) => ({
          ...prev,
          [tripId!]: updatedTrip,
        }));
      }
    } catch (err) {
      console.error("Error deleting activity:", err);
      setError("Failed to delete activity");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const reorderActivities = async (dayId: string, activityIds: number[]) => {
    try {
      setIsLoading(true);

      // Find the trip that contains this day
      const tripId = Object.values(trips).find((trip) =>
        trip.days.some((day) => day.id === dayId)
      )?.id;

      if (!tripId) {
        throw new Error("Day not found");
      }

      // Call server action
      await reorderActivitiesAction(dayId, activityIds);

      // Since our server doesn't actually store order, we'll update our local state
      // with the new order
      setTrips((prev) => {
        const trip = { ...prev[tripId] };
        const activities = [...(trip.activities[dayId] || [])];

        // Sort activities based on the provided order of IDs
        activities.sort((a, b) => {
          return activityIds.indexOf(a.id) - activityIds.indexOf(b.id);
        });

        // Update the activities for this day
        trip.activities = {
          ...trip.activities,
          [dayId]: activities,
        };

        return {
          ...prev,
          [tripId]: trip,
        };
      });
    } catch (err) {
      console.error("Error reordering activities:", err);
      setError("Failed to reorder activities");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TripContext.Provider
      value={{
        trips,
        addTrip,
        updateTrip,
        deleteTrip,
        getTrip,
        addActivity,
        updateActivity,
        deleteActivity,
        reorderActivities,
        isLoading,
        error,
      }}
    >
      {children}
    </TripContext.Provider>
  );
}

// Create a hook to use the trip context
export function useTrips() {
  const context = useContext(TripContext);
  if (context === undefined) {
    throw new Error("useTrips must be used within a TripProvider");
  }
  return context;
}

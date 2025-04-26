"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

// Initial trip data
const initialTripsData = {
  nyc: {
    id: "nyc",
    title: "NYC Trip",
    startDate: "May 1, 2023",
    endDate: "May 5, 2023",
    location: "NYC",
    collaborators: [
      { id: "1", name: "Alex", color: "bg-green-500" },
      { id: "2", name: "Sam", color: "bg-blue-500" },
      { id: "3", name: "Taylor", color: "bg-purple-500" },
      { id: "4", name: "Jordan", color: "bg-yellow-500" },
      { id: "5", name: "Casey", color: "bg-pink-500" },
      { id: "6", name: "Riley", color: "bg-indigo-500" },
    ],
    days: [
      { id: "day1", date: "May 1", title: "Day 1", number: "1" },
      { id: "day2", date: "May 2", title: "Day 2", number: "2" },
      { id: "day3", date: "May 3", title: "Day 3", number: "3" },
      { id: "day4", date: "May 4", title: "Day 4", number: "4" },
      { id: "day5", date: "May 5", title: "Day 5", number: "5" },
    ],
    activities: {
      day1: [
        {
          id: 1,
          time: "09:00 AM",
          title: "Breakfast at Coastal Cafe",
          description:
            "Start your day with a delicious breakfast at this local favorite.",
          location: "123 Beach Drive",
          category: "Food",
        },
        {
          id: 2,
          time: "11:00 AM",
          title: "City Museum Tour",
          description:
            "Explore the city's rich history through interactive exhibits.",
          location: "456 History Lane",
          category: "Culture",
        },
        {
          id: 3,
          time: "02:00 PM",
          title: "Lunch at Urban Bistro",
          description:
            "Enjoy a relaxing lunch with local cuisine and great views.",
          location: "789 Downtown Ave",
          category: "Food",
        },
      ],
      day2: [
        {
          id: 6,
          time: "10:00 AM",
          title: "Hiking at National Park",
          description:
            "Enjoy a moderate hike with stunning views of the valley.",
          location: "National Park Trail #5",
          category: "Nature",
        },
      ],
      day3: [],
      day4: [],
      day5: [],
    },
  },
  cali: {
    id: "cali",
    title: "Cali Trip",
    startDate: "June 15, 2023",
    endDate: "June 21, 2023",
    location: "California",
    collaborators: [
      { id: "2", name: "Sam", color: "bg-blue-500" },
      { id: "3", name: "Taylor", color: "bg-purple-500" },
      { id: "5", name: "Casey", color: "bg-pink-500" },
      { id: "7", name: "Morgan", color: "bg-red-500" },
    ],
    days: [
      { id: "day1", date: "June 15", title: "Day 1", number: "1" },
      { id: "day2", date: "June 16", title: "Day 2", number: "2" },
      { id: "day3", date: "June 17", title: "Day 3", number: "3" },
      { id: "day4", date: "June 18", title: "Day 4", number: "4" },
      { id: "day5", date: "June 19", title: "Day 5", number: "5" },
      { id: "day6", date: "June 20", title: "Day 6", number: "6" },
      { id: "day7", date: "June 21", title: "Day 7", number: "7" },
    ],
    activities: {
      day1: [
        {
          id: 1,
          time: "10:00 AM",
          title: "Golden Gate Bridge Visit",
          description: "Visit the iconic Golden Gate Bridge and take photos.",
          location: "Golden Gate Bridge",
          category: "Sightseeing",
        },
      ],
      day2: [],
      day3: [],
      day4: [],
      day5: [],
      day6: [],
      day7: [],
    },
  },
  paris: {
    id: "paris",
    title: "Paris Trip",
    startDate: "August 10, 2023",
    endDate: "August 17, 2023",
    location: "Paris",
    collaborators: [
      { id: "1", name: "Alex", color: "bg-green-500" },
      { id: "4", name: "Jordan", color: "bg-yellow-500" },
      { id: "5", name: "Casey", color: "bg-pink-500" },
    ],
    days: [
      { id: "day1", date: "August 10", title: "Day 1", number: "1" },
      { id: "day2", date: "August 11", title: "Day 2", number: "2" },
      { id: "day3", date: "August 12", title: "Day 3", number: "3" },
      { id: "day4", date: "August 13", title: "Day 4", number: "4" },
      { id: "day5", date: "August 14", title: "Day 5", number: "5" },
      { id: "day6", date: "August 15", title: "Day 6", number: "6" },
      { id: "day7", date: "August 16", title: "Day 7", number: "7" },
      { id: "day8", date: "August 17", title: "Day 8", number: "8" },
    ],
    activities: {
      day1: [
        {
          id: 1,
          time: "09:00 AM",
          title: "Eiffel Tower Visit",
          description: "Visit the iconic Eiffel Tower.",
          location: "Eiffel Tower",
          category: "Sightseeing",
        },
      ],
      day2: [],
      day3: [],
      day4: [],
      day5: [],
      day6: [],
      day7: [],
      day8: [],
    },
  },
  tokyo: {
    id: "tokyo",
    title: "Tokyo Trip",
    startDate: "October 5, 2023",
    endDate: "October 15, 2023",
    location: "Tokyo",
    collaborators: [
      { id: "1", name: "Alex", color: "bg-green-500" },
      { id: "3", name: "Taylor", color: "bg-purple-500" },
      { id: "6", name: "Riley", color: "bg-indigo-500" },
    ],
    days: [
      { id: "day1", date: "October 5", title: "Day 1", number: "1" },
      { id: "day2", date: "October 6", title: "Day 2", number: "2" },
      { id: "day3", date: "October 7", title: "Day 3", number: "3" },
      { id: "day4", date: "October 8", title: "Day 4", number: "4" },
      { id: "day5", date: "October 9", title: "Day 5", number: "5" },
      { id: "day6", date: "October 10", title: "Day 6", number: "6" },
      { id: "day7", date: "October 11", title: "Day 7", number: "7" },
      { id: "day8", date: "October 12", title: "Day 8", number: "8" },
      { id: "day9", date: "October 13", title: "Day 9", number: "9" },
      { id: "day10", date: "October 14", title: "Day 10", number: "10" },
      { id: "day11", date: "October 15", title: "Day 11", number: "11" },
    ],
    activities: {
      day1: [
        {
          id: 1,
          time: "10:00 AM",
          title: "Tokyo Tower Visit",
          description: "Visit the iconic Tokyo Tower.",
          location: "Tokyo Tower",
          category: "Sightseeing",
        },
      ],
      day2: [],
      day3: [],
      day4: [],
      day5: [],
      day6: [],
      day7: [],
      day8: [],
      day9: [],
      day10: [],
      day11: [],
    },
  },
};

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
};

export type TripsData = Record<string, Trip>;

// Create the context
type TripContextType = {
  trips: TripsData;
  addTrip: (trip: Trip) => void;
  getTrip: (id: string) => Trip | undefined;
};

const TripContext = createContext<TripContextType | undefined>(undefined);

// Create a provider component
export function TripProvider({ children }: { children: ReactNode }) {
  const [trips, setTrips] = useState<TripsData>(initialTripsData);

  // Load trips from localStorage on mount
  useEffect(() => {
    const savedTrips = localStorage.getItem("trips");
    if (savedTrips) {
      try {
        setTrips(JSON.parse(savedTrips));
      } catch (error) {
        console.error("Failed to parse trips from localStorage:", error);
      }
    }
  }, []);

  // Save trips to localStorage when they change
  useEffect(() => {
    localStorage.setItem("trips", JSON.stringify(trips));
  }, [trips]);

  // Add a new trip
  const addTrip = (trip: Trip) => {
    setTrips((prevTrips) => ({
      ...prevTrips,
      [trip.id]: trip,
    }));
  };

  // Get a trip by ID
  const getTrip = (id: string) => {
    return trips[id];
  };

  return (
    <TripContext.Provider value={{ trips, addTrip, getTrip }}>
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

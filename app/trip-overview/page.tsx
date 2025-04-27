"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Clock,
  Plus,
  ChevronRight,
  ChevronLeft,
  Search,
  Utensils,
  Landmark,
  Hotel,
  X,
  Heart,
  MoreVertical,
  Edit,
  Trash,
  GripVertical,
  Car,
  ArrowRight,
  Bike,
  User,
  Bus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  InfoWindow,
  StandaloneSearchBox,
  DirectionsRenderer,
} from "@react-google-maps/api";
import { useTrips } from "@/context/trip-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// Sample trip data
const tripsData = {
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
      { id: "7", name: "Morgan", color: "bg-red-500" },
      { id: "8", name: "Jamie", color: "bg-orange-500" },
      { id: "9", name: "Quinn", color: "bg-teal-500" },
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

// Update the activity interface to include position data
// Add this near the top of the file where we define types
interface ActivityPosition {
  lat: number;
  lng: number;
}

interface Activity {
  id: number;
  time: string;
  title: string;
  description: string;
  location: string;
  category: string;
  position?: ActivityPosition;
}

interface TransitInfo {
  origin: string;
  destination: string;
  driving: {
    distance: string;
    duration: string;
    durationValue: number; // in seconds
  };
  walking?: {
    distance: string;
    duration: string;
    durationValue: number;
  };
  bicycling?: {
    distance: string;
    duration: string;
    durationValue: number;
  };
  transit?: {
    distance: string;
    duration: string;
    durationValue: number;
  };
  _timestamp?: number; // Store when the transit info was calculated
  selectedMode?: "walking" | "bicycling" | "driving" | "transit"; // Add this line
}

export default function TripOverview() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tripId = searchParams.get("id") || "nyc";
  const { getTrip } = useTrips();

  const [selectedDay, setSelectedDay] = useState("day1");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddingActivity, setIsAddingActivity] = useState(false);
  const [trip, setTrip] = useState(getTrip(tripId));

  // Add these new state variables for the map
  const [mapCenter, setMapCenter] = useState({ lat: 40.7128, lng: -74.006 }); // Default to NYC coordinates
  const [selectedMarker, setSelectedMarker] = useState<null | {
    id: number;
    title: string;
  }>(null);

  // Set up Google Maps loader
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries: ["places"],
  });

  // Add map reference
  const mapRef = useRef<google.maps.Map | null>(null);

  // Add search input ref for focusing
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Update map center based on trip location
  useEffect(() => {
    const currentTrip = getTrip(tripId);
    // This would ideally be a geocoding call to get coordinates for trip.location
    // For simplicity, we're using hardcoded values for common locations
    if (currentTrip) {
      setTrip(currentTrip);
      setSelectedDay(currentTrip.days[0]?.id || "");
      // const locationCoordinates: {
      //   [key: string]: { lat: number; lng: number };
      // } = {
      //   NYC: { lat: 40.7128, lng: -74.006 },
      //   California: { lat: 36.7783, lng: -119.4179 },
      //   Paris: { lat: 48.8566, lng: 2.3522 },
      //   Tokyo: { lat: 35.6762, lng: 139.6503 },
      // };

      // setMapCenter(
      //   locationCoordinates[trip.location] || { lat: 40.7128, lng: -74.006 }
      // );
    } else {
      router.push("/");
    }
  }, [tripId, router, getTrip]);

  // Define the saved locations interface
  interface SavedLocation {
    id: number;
    title: string;
    description: string;
    location: string;
    category: string;
    rating?: number;
    price?: string;
    image?: string;
    placeId?: string;
    position?: ActivityPosition;
  }

  // Initialize state for saved locations
  const [savedLocations, setSavedLocations] = useState<{
    restaurants: SavedLocation[];
    activities: SavedLocation[];
    hotels: SavedLocation[];
    museums: SavedLocation[];
    transit: SavedLocation[];
  }>({
    restaurants: [],
    activities: [],
    hotels: [],
    museums: [],
    transit: [],
  });

  // Add the function to save a location
  const saveLocation = () => {
    if (!searchedLocation) return;

    const placeType = getPlaceTypeName(searchedLocation.placeTypes);

    // Map the place type to a category in our savedLocations state
    let category:
      | "restaurants"
      | "activities"
      | "hotels"
      | "museums"
      | "transit";

    switch (placeType) {
      case "Restaurant":
        category = "restaurants";
        break;
      case "Hotel":
        category = "hotels";
        break;
      case "Museum":
        category = "museums";
        break;
      case "Transit":
        category = "transit";
        break;
      default:
        category = "activities"; // Default to activities for other types
    }

    // Create the saved location object
    const newSavedLocation: SavedLocation = {
      id: Date.now(), // Generate a unique ID
      title: activityName || searchedLocation.name,
      description: activityDescription || `Saved ${placeType.toLowerCase()}`,
      location: searchedLocation.address,
      category: placeType,
      placeId: searchedLocation.placeId,
      position: searchedLocation.position,
    };

    // Update the state with the new saved location
    setSavedLocations((prev) => ({
      ...prev,
      [category]: [...prev[category], newSavedLocation],
    }));

    // Show a success message or feedback
    alert(`Saved to ${category}!`);
  };

  // Modify the getCurrentCategoryData function to use the new state
  const getCurrentCategoryData = () => {
    switch (selectedCategory) {
      case "restaurants":
        return savedLocations.restaurants;
      case "activities":
        return savedLocations.activities;
      case "hotels":
        return savedLocations.hotels;
      case "museums":
        return savedLocations.museums;
      case "transit":
        return savedLocations.transit;
      default:
        return [];
    }
  };

  // Map markers for the selected day
  const getMapMarkers = () => {
    if (!trip) return [];

    const dayActivities =
      trip.activities[selectedDay as keyof typeof trip.activities] || [];

    return dayActivities.map((activity: any, index) => {
      // Use stored position if available, otherwise create a position based on index
      const position = activity.position || {
        lat: mapCenter.lat + ((index % 5) * 0.01 - 0.02),
        lng: mapCenter.lng + (Math.floor(index / 5) * 0.01 - 0.02),
      };

      return {
        id: activity.id,
        title: activity.title,
        location: activity.location,
        position: position,
        index: index + 1,
      };
    });
  };

  // Get category-specific filters
  const getCategoryFilters = () => {
    switch (selectedCategory) {
      case "restaurants":
        return ["All", "Seafood", "Italian", "Japanese", "American", "Indian"];
      case "activities":
        return ["All", "Culture", "Nature", "Adventure", "Food", "Shopping"];
      case "hotels":
        return ["All", "Luxury", "Boutique", "Mid-range", "B&B", "Lodge"];
      case "museums":
        return ["All", "Art", "Science", "History", "Interactive", "Specialty"];
      case "searchResult":
        return []; // Return empty array for search results
      default:
        return ["All"];
    }
  };

  // Handle category selection
  const handleCategorySelect = (category: string) => {
    if (selectedCategory === category) {
      setSelectedCategory(""); // Toggle off if already selected
      setSearchQuery(""); // Clear search query
      setIsAddingActivity(false);
    } else {
      setSelectedCategory(category);
      setSearchQuery(""); // Clear search query
      setIsAddingActivity(false); // Exit add activity mode
    }
  };

  // Handle adding an activity
  const handleAddActivity = () => {
    setIsAddingActivity(true);
    setSelectedCategory(""); // Clear selected category
    setSearchQuery(""); // Clear search query

    // Focus the search input after state updates
    setTimeout(() => {
      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }
    }, 100);
  };

  // Close middle panel
  const closeMiddlePanel = () => {
    setSelectedCategory("");
    setIsAddingActivity(false);
    setSearchQuery("");
  };

  // Get category display name
  const getSearchPlaceholder = () => {
    if (isAddingActivity) {
      return "Search location";
    } else if (selectedCategory) {
      switch (selectedCategory) {
        case "restaurants":
          return "Saved Restaurants";
        case "activities":
          return "Saved Things to do";
        case "hotels":
          return "Saved Hotels";
        case "museums":
          return "Saved Museums";
        default:
          return "Search on map...";
      }
    } else {
      return "Search on map...";
    }
  };

  // Check if middle panel should be shown
  const showMiddlePanel = selectedCategory || isAddingActivity;

  // Add these new state variables
  const [searchBox, setSearchBox] =
    useState<google.maps.places.SearchBox | null>(null);
  const [searchedLocation, setSearchedLocation] = useState<{
    position: google.maps.LatLngLiteral;
    address: string;
    name: string;
    placeId: string;
    placeTypes?: string[];
  } | null>(null);

  // Add these new state variables for custom autocomplete
  const [predictions, setPredictions] = useState<
    google.maps.places.AutocompletePrediction[]
  >([]);
  const [showPredictions, setShowPredictions] = useState(false);
  const autocompleteService =
    useRef<google.maps.places.AutocompleteService | null>(null);
  const placesService = useRef<google.maps.places.PlacesService | null>(null);

  // Setup Places autocomplete service
  useEffect(() => {
    if (isLoaded && mapRef.current) {
      autocompleteService.current =
        new google.maps.places.AutocompleteService();
      placesService.current = new google.maps.places.PlacesService(
        mapRef.current
      );
    }
  }, [isLoaded, mapRef.current]);

  // Handle search input changes
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (value.length > 2 && autocompleteService.current) {
      autocompleteService.current.getPlacePredictions(
        { input: value },
        (results, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && results) {
            setPredictions(results);
            setShowPredictions(true);
          }
        }
      );
    } else {
      setPredictions([]);
      setShowPredictions(false);
    }
  };

  // Add this new state variable with the other state variables
  const [activityName, setActivityName] = useState("");

  // Handle selecting a prediction
  const handleSelectPrediction = (
    prediction: google.maps.places.AutocompletePrediction | null,
    isCustom = false
  ) => {
    setShowPredictions(false);

    if (isCustom) {
      // For custom selection, we'll just use the text as the name
      setSearchedLocation({
        position: mapCenter, // Default to current map center
        address: searchQuery,
        name: searchQuery,
        placeId: "custom-location",
        placeTypes: ["custom"], // Default type for custom locations
      });

      // Initialize the activity name with the location name
      setActivityName(searchQuery);

      setSelectedCategory("searchResult");
      return;
    }

    if (!prediction || !placesService.current) return;

    placesService.current.getDetails(
      {
        placeId: prediction.place_id,
        fields: ["name", "geometry", "formatted_address", "types"], // Added types field
      },
      (place, status) => {
        if (
          status === google.maps.places.PlacesServiceStatus.OK &&
          place &&
          place.geometry
        ) {
          // Center the map on the selected place
          if (mapRef.current && place.geometry.location) {
            mapRef.current.panTo(place.geometry.location);
            mapRef.current.setZoom(14);
          }

          // Store location details for display
          setSearchedLocation({
            position: {
              lat: place.geometry.location!.lat(),
              lng: place.geometry.location!.lng(),
            },
            address: place.formatted_address || "",
            name: place.name || "",
            placeId: place.place_id || "",
            placeTypes: place.types || [], // Store the place types
          });

          // Initialize the activity name with the location name
          setActivityName(place.name || "");

          // Open the middle panel to show details
          setSelectedCategory("searchResult");
        }
      }
    );
  };

  // Add these new state variables below the other state variables declarations
  const [editMode, setEditMode] = useState(false);
  const [activityTime, setActivityTime] = useState("");
  const [activityDescription, setActivityDescription] = useState("");

  // Add a helper function to get a friendly place type name
  const getPlaceTypeName = (types: string[] | undefined): string => {
    if (!types || types.length === 0) return "Place";

    // Map common Google place types to user-friendly names
    if (types.includes("restaurant") || types.includes("food"))
      return "Restaurant";
    if (types.includes("cafe")) return "Restaurant";
    if (types.includes("bar")) return "Restaurant";
    if (types.includes("hotel") || types.includes("lodging")) return "Hotel";
    if (types.includes("museum")) return "Museum";
    if (types.includes("park")) return "Things to do";
    if (types.includes("tourist_attraction")) return "Things to do";
    if (types.includes("store") || types.includes("Things to do"))
      return "Shop";
    if (types.includes("movie_theater")) return "Things to do";
    if (types.includes("gym")) return "Things to do";
    if (types.includes("custom")) return "Things to do";

    // Add transit detection for transportation-related places
    // TODO: only airport works for now, need to figure out how to detect other transit types
    if (
      types.includes("airport") ||
      types.includes("train_station") ||
      types.includes("bus_station") ||
      types.includes("transit_station") ||
      types.includes("subway_station") ||
      types.includes("light_rail_station") ||
      types.includes("ferry_terminal")
    )
      return "Transit";

    // Default to a generic name
    return "Things to do";
  };

  // Add this new state variable with the other state variables
  const [editingActivityId, setEditingActivityId] = useState<number | null>(
    null
  );

  // Add these handler functions after the other handler functions
  const handleEditActivity = (activity: any) => {
    // Set the activity details to edit
    setActivityName(activity.title);
    setActivityTime(activity.time);
    setActivityDescription(activity.description);

    // Create a searchedLocation object from the activity
    setSearchedLocation({
      position: activity.position || mapCenter, // Use stored position if available
      address: activity.location,
      name: activity.title,
      placeId: `activity-${activity.id}`,
      placeTypes: [activity.category.toLowerCase()],
    });

    // Set the edit mode
    setSelectedCategory("searchResult");
    setEditMode(true);

    // Store the activity ID for updating
    setEditingActivityId(activity.id);
  };

  const handleDeleteActivity = (activityId: number) => {
    if (!trip || !selectedDay) return;

    // Create a copy of the current trip
    const updatedTrip = { ...trip };

    // Filter out the activity with the given ID
    updatedTrip.activities[selectedDay] = updatedTrip.activities[
      selectedDay
    ].filter((activity: any) => activity.id !== activityId);

    // Update the trip
    setTrip(updatedTrip);
  };

  // Modify the handleAddToItinerary function to handle updates
  const handleAddToItinerary = () => {
    if (!trip || !selectedDay) return;

    // Create a new activity object
    const newActivity = {
      id: editingActivityId || Date.now(), // Use existing ID if editing, or create new one
      time: activityTime || "",
      title: activityName || (searchedLocation ? searchedLocation.name : ""),
      description: activityDescription || "",
      location: searchedLocation ? searchedLocation.address : "",
      category: searchedLocation
        ? getPlaceTypeName(searchedLocation.placeTypes)
        : "Place",
      // Store the position if we have it from searchedLocation
      position: searchedLocation ? searchedLocation.position : undefined,
    };

    // Create a copy of the current trip
    const updatedTrip = { ...trip };

    // Ensure the day property exists on activities
    if (!updatedTrip.activities[selectedDay]) {
      updatedTrip.activities[selectedDay] = [];
    }

    if (editingActivityId) {
      // Update existing activity
      updatedTrip.activities[selectedDay] = updatedTrip.activities[
        selectedDay
      ].map((activity: any) =>
        activity.id === editingActivityId ? newActivity : activity
      );
    } else {
      // Add a new activity
      updatedTrip.activities[selectedDay] = [
        ...updatedTrip.activities[selectedDay],
        newActivity,
      ];
    }

    // Update the trip
    setTrip(updatedTrip);

    // Reset the UI state
    setSelectedCategory("");
    setIsAddingActivity(false);
    setSearchQuery("");
    setSearchedLocation(null);
    setActivityName("");
    setActivityTime("");
    setActivityDescription("");
    setEditMode(false);
    setEditingActivityId(null);
  };

  // Add a function to handle reordering of activities
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!trip || !over || active.id === over.id) return;

    const currentActivities = trip.activities[selectedDay];
    if (!currentActivities) return;

    const oldIndex = currentActivities.findIndex(
      (activity: any) => activity.id === active.id
    );
    const newIndex = currentActivities.findIndex(
      (activity: any) => activity.id === over.id
    );

    // Create a copy of the trip
    const updatedTrip = { ...trip };

    // Reorder the activities
    updatedTrip.activities[selectedDay] = arrayMove(
      currentActivities,
      oldIndex,
      newIndex
    );

    // Update the trip state
    setTrip(updatedTrip);
  };

  // Initialize sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Add a state to track the selected marker position
  const [selectedMarkerPosition, setSelectedMarkerPosition] =
    useState<google.maps.LatLngLiteral | null>(null);

  // Create a separate SortableActivityCard component to use with the sortable context
  function SortableActivityCard({
    activity,
    index,
  }: {
    activity: any;
    index: number;
  }) {
    const { attributes, listeners, setNodeRef, transform, transition } =
      useSortable({ id: activity.id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    };

    // Add a handler to focus on the map marker when clicking the card
    const handleCardClick = (e: React.MouseEvent) => {
      // Don't trigger when clicking the grip handle or dropdown
      if (
        e.target instanceof Element &&
        (e.target.closest('[role="button"]') ||
          e.target.closest(".grip-handle") ||
          e.target.closest(".dropdown-area"))
      ) {
        return;
      }

      // Find the marker position for this activity
      const position = activity.position || {
        lat: mapCenter.lat + ((index % 5) * 0.01 - 0.02),
        lng: mapCenter.lng + (Math.floor(index / 5) * 0.01 - 0.02),
      };

      // Store the position for the InfoWindow
      setSelectedMarkerPosition(position);

      // Center the map on this position
      if (mapRef.current) {
        mapRef.current.panTo(position);
        mapRef.current.setZoom(15);
      }

      // Select the marker to show its info window
      setSelectedMarker({
        id: activity.id,
        title: activity.title,
      });
    };

    return (
      <Card
        key={activity.id}
        ref={setNodeRef}
        style={style}
        onClick={handleCardClick}
        className="relative border-gray-200 dark:border-gray-700 bg-white dark:bg-black transition-shadow hover:shadow-md cursor-pointer text-left"
      >
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center">
              <div
                {...attributes}
                {...listeners}
                className="absolute -left-1 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center cursor-grab active:cursor-grabbing grip-handle"
              >
                <GripVertical className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              </div>
              <div className="ml-4">
                <CardTitle className="text-base text-left">
                  {activity.title}
                </CardTitle>
                <CardDescription className="text-xs text-left">
                  {activity.time}
                </CardDescription>
              </div>
            </div>
            <div className="dropdown-area">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-gray-500"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => handleEditActivity(activity)}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit info
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleDeleteActivity(activity.id)}
                  >
                    <Trash className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pb-2 pl-[2.5rem]">
          <p className="text-sm text-left">{activity.description}</p>
        </CardContent>
        <CardFooter className="pl-[2.5rem] pt-0">
          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 text-left">
            <MapPin className="mr-1 h-3 w-3" />
            {activity.location}
          </div>
          <Badge
            variant="outline"
            className="ml-auto border-gray-200 dark:border-gray-700"
          >
            {activity.category}
          </Badge>
        </CardFooter>
      </Card>
    );
  }

  // Add state variables for transit info
  const [transitInfo, setTransitInfo] = useState<{
    [key: string]: TransitInfo;
  }>({});
  const [isLoadingTransit, setIsLoadingTransit] = useState<{
    [key: string]: boolean;
  }>({});

  // Calculate transit information between two activities
  const calculateTransit = async (
    origin: string,
    destination: string,
    transitKey: string
  ) => {
    if (!origin || !destination || origin === destination) return;

    // Set loading state for this specific transit calculation
    setIsLoadingTransit((prev) => ({ ...prev, [transitKey]: true }));

    // Check if we already have this transit info and it's not too old (less than 15 minutes)
    const existingInfo = transitInfo[transitKey];
    const now = Date.now();
    const cacheTime = 15 * 60 * 1000; // 15 minutes in milliseconds

    if (
      existingInfo &&
      existingInfo.driving &&
      existingInfo._timestamp &&
      now - existingInfo._timestamp < cacheTime
    ) {
      // Cache hit, use existing data
      setIsLoadingTransit((prev) => ({ ...prev, [transitKey]: false }));
      return;
    }

    try {
      // We'll use a local API endpoint to proxy our request to Google's Distance Matrix API
      // In a real application, you would create an API route to handle this
      // For this example, we'll simulate the API call with mock data

      // In a real implementation, you'd make this API call:
      /*
      const response = await fetch('/api/distance-matrix', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          origins: [origin],
          destinations: [destination],
          modes: ['driving', 'walking', 'bicycling', 'transit']
        }),
      });
      const data = await response.json();
      */

      // For now, let's simulate a response with mock data
      // This would normally come from the Google Distance Matrix API
      await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate API delay

      const mockDistance = Math.floor(Math.random() * 20) + 1; // 1-20 km
      const mockDrivingTime = Math.floor(
        mockDistance * 60 * (0.8 + Math.random() * 0.4)
      ); // ~60 sec per km with some variation
      const mockWalkingTime = mockDrivingTime * (12 + Math.random() * 4); // 12-16x driving time
      const mockBikingTime = mockDrivingTime * (3 + Math.random() * 2); // 3-5x driving time
      const mockTransitTime = mockDrivingTime * (1.5 + Math.random()); // 1.5-2.5x driving time

      const formatDistanceString = (dist: number) => `${dist.toFixed(1)} km`;
      const formatDurationString = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        return hours > 0 ? `${hours}h ${minutes}min` : `${minutes} min`;
      };

      const newTransitInfo: TransitInfo = {
        origin,
        destination,
        driving: {
          distance: formatDistanceString(mockDistance),
          duration: formatDurationString(mockDrivingTime),
          durationValue: mockDrivingTime,
        },
        walking: {
          distance: formatDistanceString(mockDistance),
          duration: formatDurationString(mockWalkingTime),
          durationValue: mockWalkingTime,
        },
        bicycling: {
          distance: formatDistanceString(mockDistance),
          duration: formatDurationString(mockBikingTime),
          durationValue: mockBikingTime,
        },
        transit: {
          distance: formatDistanceString(mockDistance),
          duration: formatDurationString(mockTransitTime),
          durationValue: mockTransitTime,
        },
        _timestamp: now,
      };

      setTransitInfo((prev) => ({ ...prev, [transitKey]: newTransitInfo }));
    } catch (error) {
      console.error("Error calculating transit time:", error);
    } finally {
      setIsLoadingTransit((prev) => ({ ...prev, [transitKey]: false }));
    }
  };

  // Add this effect to calculate transit times when activities change
  useEffect(() => {
    if (!trip || !selectedDay) return;

    const activities = trip.activities[selectedDay] || [];
    if (activities.length <= 1) return;

    // Calculate transit times between consecutive activities
    for (let i = 0; i < activities.length - 1; i++) {
      const origin = activities[i].location;
      const destination = activities[i + 1].location;
      const transitKey = `${activities[i].id}_${activities[i + 1].id}`;

      calculateTransit(origin, destination, transitKey);
    }
  }, [trip, selectedDay]);

  // Add the TransitRow component
  function TransitRow({
    originActivity,
    destinationActivity,
  }: {
    originActivity: any;
    destinationActivity: any;
  }) {
    const transitKey = `${originActivity.id}_${destinationActivity.id}`;
    const info = transitInfo[transitKey];
    const isLoading = isLoadingTransit[transitKey];
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedMode, setSelectedMode] = useState<
      "walking" | "bicycling" | "driving" | "transit"
    >(info?.selectedMode || "driving");

    // Initialize transit info if needed
    useEffect(() => {
      if (!info && !isLoading) {
        // If we don't have info yet and not loading, calculate it
        calculateTransit(
          originActivity.location,
          destinationActivity.location,
          transitKey
        );
      }
    }, [
      info,
      isLoading,
      originActivity.location,
      destinationActivity.location,
      transitKey,
    ]);

    // Update local selected mode when dialog opens
    useEffect(() => {
      if (isDialogOpen && info) {
        setSelectedMode(info.selectedMode || "driving");
      }
    }, [isDialogOpen, info]);

    // Handle confirming the selected transportation mode
    const handleConfirm = () => {
      if (info) {
        // Update the transit info with the selected mode
        setTransitInfo((prev) => ({
          ...prev,
          [transitKey]: {
            ...prev[transitKey],
            selectedMode: selectedMode,
          },
        }));
      }
      setIsDialogOpen(false);
    };

    // Get current mode data to display in the transit row
    const getCurrentModeData = () => {
      if (!info) return null;

      switch (info.selectedMode || "driving") {
        case "walking":
          return {
            icon: <User className="h-4 w-4 text-blue-500 dark:text-blue-300" />,
            distance: info.walking?.distance || "N/A",
            duration: info.walking?.duration || "N/A",
          };
        case "bicycling":
          return {
            icon: <Bike className="h-4 w-4 text-blue-500 dark:text-blue-300" />,
            distance: info.bicycling?.distance || "N/A",
            duration: info.bicycling?.duration || "N/A",
          };
        case "transit":
          return {
            icon: <Bus className="h-4 w-4 text-blue-500 dark:text-blue-300" />,
            distance: info.transit?.distance || "N/A",
            duration: info.transit?.duration || "N/A",
          };
        default:
          return {
            icon: <Car className="h-4 w-4 text-blue-500 dark:text-blue-300" />,
            distance: info.driving?.distance || "N/A",
            duration: info.driving?.duration || "N/A",
          };
      }
    };

    const modeData = getCurrentModeData();

    return (
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <div className="flex items-center justify-between px-6 py-2 mx-2 my-1  dark:bg-gray-900 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <div className="flex items-center">
              <div className="p-1.5 bg-blue-100 dark:bg-blue-900 rounded-full mr-3">
                {isLoading ? (
                  <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-full"></div>
                ) : modeData ? (
                  modeData.icon
                ) : (
                  <Car className="h-4 w-4 text-blue-500 dark:text-blue-300" />
                )}
              </div>
              {isLoading ? (
                <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
              ) : info ? (
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {modeData?.distance}
                </span>
              ) : (
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  Calculating...
                </span>
              )}
            </div>

            <div className="flex items-center">
              {isLoading ? (
                <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 animate-pulse rounded mr-2"></div>
              ) : info ? (
                <span className="text-sm text-gray-600 dark:text-gray-300 mr-2">
                  {modeData?.duration}
                </span>
              ) : (
                <span className="text-sm text-gray-600 dark:text-gray-300 mr-2">
                  --
                </span>
              )}
              <ArrowRight className="h-4 w-4 text-gray-400" />
            </div>
          </div>
        </DialogTrigger>

        <DialogContent className="sm:max-w-md">
          <DialogTitle className="sr-only">
            Transportation options from {originActivity.title} to{" "}
            {destinationActivity.title}
          </DialogTitle>
          <div className="space-y-4 py-2">
            <div className="flex items-center justify-between text-sm px-2">
              <div>
                <div className="font-semibold">{originActivity.title}</div>
                <div className="text-gray-500 text-xs">
                  {originActivity.location}
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-400 mx-2" />
              <div>
                <div className="font-semibold">{destinationActivity.title}</div>
                <div className="text-gray-500 text-xs">
                  {destinationActivity.location}
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700"></div>

            <div className="space-y-2 px-2">
              <h3 className="text-lg font-semibold mb-4">
                Select Transportation
              </h3>

              {/* Walking option */}
              <div
                className={`flex items-center justify-between p-3 rounded-xl cursor-pointer 
                  ${
                    selectedMode === "walking"
                      ? "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"
                      : isLoading
                      ? "bg-gray-100 dark:bg-gray-800"
                      : "bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                onClick={() => setSelectedMode("walking")}
              >
                <div className="flex items-center">
                  <div
                    className={`p-2 rounded-full mr-3 ${
                      selectedMode === "walking"
                        ? "bg-blue-100 dark:bg-blue-800"
                        : "bg-gray-200 dark:bg-gray-700"
                    }`}
                  >
                    <User
                      className={`h-5 w-5 ${
                        selectedMode === "walking"
                          ? "text-blue-500 dark:text-blue-300"
                          : "text-gray-700 dark:text-gray-300"
                      }`}
                    />
                  </div>
                  <div>
                    <div className="font-medium">Walking</div>
                    {isLoading ? (
                      <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 animate-pulse rounded mt-1"></div>
                    ) : info?.walking ? (
                      <div className="text-xs text-gray-500">
                        {info.walking.distance}
                      </div>
                    ) : (
                      <div className="text-xs text-gray-500">
                        Calculating...
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  {isLoading ? (
                    <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
                  ) : info?.walking ? (
                    <div className="font-medium">{info.walking.duration}</div>
                  ) : (
                    <div className="font-medium">--</div>
                  )}
                </div>
              </div>

              {/* Biking option */}
              <div
                className={`flex items-center justify-between p-3 rounded-xl cursor-pointer 
                  ${
                    selectedMode === "bicycling"
                      ? "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"
                      : isLoading
                      ? "bg-gray-100 dark:bg-gray-800"
                      : "bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                onClick={() => setSelectedMode("bicycling")}
              >
                <div className="flex items-center">
                  <div
                    className={`p-2 rounded-full mr-3 ${
                      selectedMode === "bicycling"
                        ? "bg-blue-100 dark:bg-blue-800"
                        : "bg-gray-200 dark:bg-gray-700"
                    }`}
                  >
                    <Bike
                      className={`h-5 w-5 ${
                        selectedMode === "bicycling"
                          ? "text-blue-500 dark:text-blue-300"
                          : "text-gray-700 dark:text-gray-300"
                      }`}
                    />
                  </div>
                  <div>
                    <div className="font-medium">Biking</div>
                    {isLoading ? (
                      <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 animate-pulse rounded mt-1"></div>
                    ) : info?.bicycling ? (
                      <div className="text-xs text-gray-500">
                        {info.bicycling.distance}
                      </div>
                    ) : (
                      <div className="text-xs text-gray-500">
                        Calculating...
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  {isLoading ? (
                    <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
                  ) : info?.bicycling ? (
                    <div className="font-medium">{info.bicycling.duration}</div>
                  ) : (
                    <div className="font-medium">--</div>
                  )}
                </div>
              </div>

              {/* Driving option */}
              <div
                className={`flex items-center justify-between p-3 rounded-xl cursor-pointer 
                  ${
                    selectedMode === "driving"
                      ? "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"
                      : isLoading
                      ? "bg-gray-100 dark:bg-gray-800"
                      : "bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                onClick={() => setSelectedMode("driving")}
              >
                <div className="flex items-center">
                  <div
                    className={`p-2 rounded-full mr-3 ${
                      selectedMode === "driving"
                        ? "bg-blue-100 dark:bg-blue-800"
                        : "bg-gray-200 dark:bg-gray-700"
                    }`}
                  >
                    <Car
                      className={`h-5 w-5 ${
                        selectedMode === "driving"
                          ? "text-blue-500 dark:text-blue-300"
                          : "text-gray-700 dark:text-gray-300"
                      }`}
                    />
                  </div>
                  <div>
                    <div className="font-medium">Driving</div>
                    {isLoading ? (
                      <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 animate-pulse rounded mt-1"></div>
                    ) : info?.driving ? (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {info.driving.distance}
                      </div>
                    ) : (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        计算中...
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  {isLoading ? (
                    <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
                  ) : info?.driving ? (
                    <div className="font-medium">{info.driving.duration}</div>
                  ) : (
                    <div className="font-medium">--</div>
                  )}
                </div>
              </div>

              {/* Public transit option */}
              <div
                className={`flex items-center justify-between p-3 rounded-xl cursor-pointer 
                  ${
                    selectedMode === "transit"
                      ? "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"
                      : isLoading
                      ? "bg-gray-100 dark:bg-gray-800"
                      : "bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                onClick={() => setSelectedMode("transit")}
              >
                <div className="flex items-center">
                  <div
                    className={`p-2 rounded-full mr-3 ${
                      selectedMode === "transit"
                        ? "bg-blue-100 dark:bg-blue-800"
                        : "bg-gray-200 dark:bg-gray-700"
                    }`}
                  >
                    <Bus
                      className={`h-5 w-5 ${
                        selectedMode === "transit"
                          ? "text-blue-500 dark:text-blue-300"
                          : "text-gray-700 dark:text-gray-300"
                      }`}
                    />
                  </div>
                  <div>
                    <div className="font-medium">Public Transit</div>
                    {isLoading ? (
                      <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 animate-pulse rounded mt-1"></div>
                    ) : info?.transit ? (
                      <div className="text-xs text-gray-500">
                        {info.transit.distance}
                      </div>
                    ) : (
                      <div className="text-xs text-gray-500">
                        Calculating...
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  {isLoading ? (
                    <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
                  ) : info?.transit ? (
                    <div className="font-medium">{info.transit.duration}</div>
                  ) : (
                    <div className="font-medium">--</div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-center">
              <Button className="w-32" onClick={handleConfirm}>
                Confirm
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Add these new state variables near the other map-related state variables
  const [showDirections, setShowDirections] = useState(false);
  const [directionsResponse, setDirectionsResponse] =
    useState<google.maps.DirectionsResult | null>(null);

  // Add a function to calculate and display directions between activities
  const calculateDirections = async () => {
    if (!trip || !selectedDay || !isLoaded) {
      console.log("Cannot calculate directions: missing prerequisites");
      return;
    }

    const activities = trip.activities[selectedDay];
    if (!activities || activities.length < 2) {
      alert("Need at least two activities to show directions");
      return;
    }

    console.log("Calculating directions for activities:", activities);

    try {
      const directionsService = new google.maps.DirectionsService();

      // Create waypoints from activities (except first and last which are origin and destination)
      const waypoints = activities.slice(1, -1).map((activity: any) => ({
        location: activity.location,
        stopover: true,
      }));

      console.log("Origin:", activities[0].location);
      console.log("Destination:", activities[activities.length - 1].location);
      console.log("Waypoints:", waypoints);

      const result = await directionsService.route({
        origin: activities[0].location,
        destination: activities[activities.length - 1].location,
        waypoints: waypoints,
        optimizeWaypoints: false, // Keep the order as specified
        travelMode: google.maps.TravelMode.DRIVING,
      });

      console.log("Directions result:", result);
      setDirectionsResponse(result);
      setShowDirections(true);

      // Center the map on the route
      if (mapRef.current && result.routes[0]?.bounds) {
        mapRef.current.fitBounds(result.routes[0].bounds);
      }
    } catch (error) {
      console.error("Error calculating directions:", error);
      alert(
        "Could not calculate directions. Please check activity addresses. Error: " +
          error
      );
    }
  };

  // Add a toggle directions function
  const toggleDirections = () => {
    if (showDirections) {
      // If directions are shown, hide them
      setShowDirections(false);
      setDirectionsResponse(null);
    } else {
      // If directions aren't shown, calculate and show them
      calculateDirections();
    }
  };

  if (!trip) return null;

  // Get the activities for the selected day
  const dayActivities =
    trip.activities[selectedDay as keyof typeof trip.activities] || [];

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white">
      {/* Navigation Bar */}
      <header className="border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="mr-4">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-black dark:text-white"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="text-xl font-bold text-black dark:text-white">
              <span className="flex items-center gap-2">{trip.title}</span>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {trip.startDate} - {trip.endDate}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* Collaborator Avatars */}
            <div className="flex -space-x-2 mr-2">
              {trip.collaborators?.slice(0, 5).map((collaborator) => (
                <Avatar
                  key={collaborator.id}
                  className={`h-8 w-8 border-2 border-white dark:border-black ${collaborator.color}`}
                >
                  <AvatarFallback className="text-xs">
                    {collaborator.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              ))}
              {trip.collaborators && trip.collaborators.length > 5 && (
                <Avatar className="h-8 w-8 border-2 border-white dark:border-black bg-gray-200 dark:bg-gray-700">
                  <AvatarFallback className="text-xs">
                    +{trip.collaborators.length - 5}
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
            <Button
              variant="outline"
              className="border-gray-200 bg-transparent hover:bg-gray-100 hover:text-black dark:border-gray-700 dark:hover:bg-gray-800 dark:hover:text-white"
            >
              Share Trip
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-73px)] w-full overflow-hidden bg-background">
        {/* Left Sidebar - Day Selector */}
        <div
          className={`flex flex-col border-r border-gray-200 dark:border-gray-700 bg-muted/40 transition-all duration-300 ${
            isCollapsed ? "w-[60px]" : "w-[100px]"
          }`}
        >
          <div className="flex items-center justify-between p-2 border-b border-gray-200 dark:border-gray-700">
            <Calendar className={`h-5 w-5 ${isCollapsed ? "mx-auto" : ""}`} />
            {!isCollapsed && <span className="text-sm font-medium">Days</span>}
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setIsCollapsed(!isCollapsed)}
            >
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
          </div>
          <ScrollArea className="flex-1">
            <div className="flex flex-col gap-1 p-2">
              {trip.days.map((day) => (
                <Button
                  key={day.id}
                  variant={selectedDay === day.id ? "default" : "ghost"}
                  className={`flex flex-col items-center justify-center h-16 ${
                    isCollapsed ? "p-1" : "p-2"
                  }`}
                  onClick={() => setSelectedDay(day.id)}
                >
                  {!isCollapsed && <span className="text-xs">{day.date}</span>}
                  <span
                    className={`font-medium ${
                      isCollapsed ? "text-xs" : "text-sm"
                    }`}
                  >
                    {isCollapsed ? day.number : day.title}
                  </span>
                </Button>
              ))}
              <Button
                variant="ghost"
                className={`flex items-center justify-center h-16 ${
                  isCollapsed ? "p-1" : "p-2"
                }`}
              >
                <Plus className="h-5 w-5" />
                {!isCollapsed && <span className="text-xs mt-1">Add Day</span>}
              </Button>
            </div>
          </ScrollArea>
        </div>

        {/* Main Content Area */}
        <div className="flex flex-1 overflow-hidden">
          {/* First Panel - Day Overview */}
          <div
            className={`${
              selectedCategory ? "w-1/4" : "w-1/4"
            } border-r border-gray-200 dark:border-gray-700 flex flex-col `}
          >
            <div className="border-b border-gray-200 dark:border-gray-700 p-4">
              <h2 className="text-xl font-bold">Trip Overview</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {trip.days.find((day) => day.id === selectedDay)?.date}, 2023 •{" "}
                {trip.location}
              </p>
            </div>
            <ScrollArea className="flex-1">
              <div className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">
                    {trip.days.find((day) => day.id === selectedDay)?.title} -{" "}
                    {trip.days.find((day) => day.id === selectedDay)?.date}
                  </h3>
                  {isLoaded && dayActivities.length > 1 && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1"
                      onClick={toggleDirections}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4"
                      >
                        <path d="M12 19V5" />
                        <path d="M5 12h14" />
                        <path d="m12 5-3 3 3-3 3 3-3-3z" />
                        <path d="m12 19 3-3-3 3-3-3 3 3z" />
                      </svg>
                      {showDirections ? "Hide Route" : "Show Route"}
                    </Button>
                  )}
                </div>
                <div className="space-y-4 ">
                  {dayActivities.length > 0 ? (
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={handleDragEnd}
                    >
                      <SortableContext
                        items={dayActivities.map(
                          (activity: any) => activity.id
                        )}
                        strategy={verticalListSortingStrategy}
                      >
                        {dayActivities.map((activity: any, index: number) => (
                          <div key={activity.id}>
                            <SortableActivityCard
                              activity={activity}
                              index={index}
                            />
                            {/* Add transit info row after each activity except the last one */}
                            {index < dayActivities.length - 1 && (
                              <TransitRow
                                originActivity={activity}
                                destinationActivity={dayActivities[index + 1]}
                              />
                            )}
                          </div>
                        ))}
                      </SortableContext>
                    </DndContext>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <div className="mb-4 rounded-full bg-muted/50 p-3">
                        <Calendar className="h-6 w-6 text-gray-500 dark:text-gray-400" />
                      </div>
                      <h3 className="mb-1 text-lg font-medium">
                        No activities yet
                      </h3>
                      <p className="mb-4 text-sm text-gray-500 dark:text-gray-400 max-w-xs">
                        Start planning your day by adding activities from the
                        map panel
                      </p>
                    </div>
                  )}
                  <Button
                    variant="outline"
                    className="w-full border-gray-200 bg-transparent hover:bg-gray-100 hover:text-black dark:border-gray-700 dark:hover:bg-gray-800 dark:hover:text-white"
                    onClick={handleAddActivity}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Activity
                  </Button>
                </div>
              </div>
            </ScrollArea>
          </div>

          {/* Middle Panel - Category Content (Only shown when a category is selected) */}
          {showMiddlePanel && (
            <div className="w-[580px] border-r border-gray-200 dark:border-gray-700 flex flex-col">
              <div className="border-b border-gray-200 dark:border-gray-700 p-4">
                {/* Search Bar */}
                <div className="w-[550px] rounded-full bg-white shadow-lg mb-4">
                  <div className="flex items-center p-2">
                    <Search className="ml-2 h-5 w-5 text-gray-500" />
                    <div className="flex-1 relative">
                      <Input
                        placeholder={getSearchPlaceholder()}
                        className="border-0 bg-transparent pl-2 shadow-none focus-visible:ring-0 w-full focus:outline-none"
                        value={searchQuery}
                        onChange={handleSearchInputChange}
                        onFocus={() =>
                          searchQuery.length > 2 && setShowPredictions(true)
                        }
                        ref={searchInputRef}
                      />

                      {showPredictions && (
                        <div className="absolute top-full left-0 w-full bg-white z-50 mt-1 rounded-md shadow-lg overflow-hidden">
                          <div
                            className="p-2 hover:bg-gray-100 cursor-pointer border-b flex justify-between"
                            onClick={() => handleSelectPrediction(null, true)}
                          >
                            <span>{searchQuery}</span>
                            <span className="text-gray-500 text-sm">
                              custom
                            </span>
                          </div>

                          {predictions.map((prediction) => (
                            <div
                              key={prediction.place_id}
                              className="p-2 hover:bg-gray-100 cursor-pointer"
                              onClick={() => handleSelectPrediction(prediction)}
                            >
                              <div className="flex items-center">
                                <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                                <span>{prediction.description}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-gray-500 ml-auto"
                      onClick={() => {
                        closeMiddlePanel();
                        setShowPredictions(false);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Category Buttons */}
                <div className="flex flex-wrap gap-1 mb-4">
                  <Button
                    variant={
                      selectedCategory === "restaurants"
                        ? "default"
                        : "secondary"
                    }
                    className="rounded-full bg-white px-4 shadow-md hover:bg-gray-100 dark:bg-white dark:text-black dark:hover:bg-gray-100"
                    onClick={() => handleCategorySelect("restaurants")}
                  >
                    <Utensils className="mr-2 h-4 w-4" />
                    Restaurants
                  </Button>
                  <Button
                    variant={
                      selectedCategory === "hotels" ? "default" : "secondary"
                    }
                    className="rounded-full bg-white px-4 shadow-md hover:bg-gray-100 dark:bg-white dark:text-black dark:hover:bg-gray-100"
                    onClick={() => handleCategorySelect("hotels")}
                  >
                    <Hotel className="mr-2 h-4 w-4" />
                    Hotels
                  </Button>
                  <Button
                    variant={
                      selectedCategory === "activities"
                        ? "default"
                        : "secondary"
                    }
                    className="rounded-full bg-white px-4 shadow-md hover:bg-gray-100 dark:bg-white dark:text-black dark:hover:bg-gray-100"
                    onClick={() => handleCategorySelect("activities")}
                  >
                    <Landmark className="mr-2 h-4 w-4" />
                    Things to do
                  </Button>
                  <Button
                    variant={
                      selectedCategory === "museums" ? "default" : "secondary"
                    }
                    className="rounded-full bg-white px-4 shadow-md hover:bg-gray-100 dark:bg-white dark:text-black dark:hover:bg-gray-100"
                    onClick={() => handleCategorySelect("museums")}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mr-2 h-4 w-4"
                    >
                      <path d="M2 20h20" />
                      <path d="M5 4v16" />
                      <path d="M19 4v16" />
                      <path d="M5 4h14" />
                      <path d="M5 12h14" />
                    </svg>
                    Museums
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold capitalize">
                      {isAddingActivity && !searchedLocation
                        ? "Recent Searches"
                        : selectedCategory === "searchResult"
                        ? "Activity Details"
                        : "Results"}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {isAddingActivity && !searchedLocation
                        ? "Search for a location to add"
                        : selectedCategory === "searchResult"
                        ? "Edit details below to customize this activity"
                        : `${
                            getCurrentCategoryData().length
                          } options available`}
                    </p>
                  </div>
                  {selectedCategory === "searchResult" ? (
                    <Button
                      variant="ghost"
                      className="text-sm font-medium"
                      onClick={() => setEditMode(!editMode)}
                    >
                      {editMode ? "Done" : "Edit"}
                    </Button>
                  ) : isAddingActivity && !searchedLocation ? (
                    // Don't show any buttons for Recent Searches
                    <></>
                  ) : (
                    <div className="flex items-center gap-4">
                      <Button
                        variant="ghost"
                        className="flex items-center gap-1 rounded-full px-4 py-2 text-sm font-medium text-black hover:shadow-md transition-shadow dark:bg-gray-800 dark:text-white"
                      >
                        Sort by
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="ml-1 h-4 w-4"
                        >
                          <path d="m6 9 6 6 6-6" />
                        </svg>
                      </Button>
                      <Button
                        variant="ghost"
                        className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:shadow-md transition-shadow dark:text-blue-400"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-4 w-4"
                        >
                          <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                          <polyline points="16 6 12 2 8 6" />
                          <line x1="12" y1="2" x2="12" y2="15" />
                        </svg>
                        Share
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              <div className="border-b border-gray-200 dark:border-gray-700">
                {selectedCategory !== "searchResult" && !isAddingActivity && (
                  <Tabs defaultValue="all">
                    <TabsList className="w-full justify-start rounded-none border-b border-gray-200 dark:border-gray-700 bg-transparent p-0 overflow-x-auto">
                      {getCategoryFilters().map((filter) => (
                        <TabsTrigger
                          key={filter.toLowerCase()}
                          value={filter.toLowerCase()}
                          className="rounded-none border-b-2 border-b-transparent px-4 py-2 data-[state=active]:border-b-black dark:data-[state=active]:border-b-white data-[state=active]:bg-transparent data-[state=active]:text-black dark:data-[state=active]:text-white"
                        >
                          {filter}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </Tabs>
                )}
              </div>
              <ScrollArea className="flex-1">
                <div className="grid gap-4 p-4">
                  {isAddingActivity && !searchedLocation ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <div className="mb-4 rounded-full bg-muted/50 p-3">
                        <Search className="h-6 w-6 text-gray-500 dark:text-gray-400" />
                      </div>
                      <h3 className="mb-1 text-lg font-medium">
                        Search for a location
                      </h3>
                      <p className="mb-4 text-sm text-gray-500 dark:text-gray-400 max-w-xs">
                        Type in the search bar above to find places to add to
                        your itinerary
                      </p>
                    </div>
                  ) : selectedCategory === "searchResult" &&
                    searchedLocation ? (
                    <div className="p-4">
                      {editMode ? (
                        <div className="mb-4">
                          <label className="text-sm font-medium">
                            Activity Name
                          </label>
                          <Input
                            value={activityName}
                            onChange={(e) => setActivityName(e.target.value)}
                            placeholder="Enter activity name"
                            className="mt-1"
                          />
                        </div>
                      ) : (
                        <h2 className="text-lg font-semibold mb-2">
                          {activityName || searchedLocation.name}
                        </h2>
                      )}

                      <div className="space-y-3 mb-4">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-5 w-5 text-gray-500" />
                          <span className="text-sm">
                            {searchedLocation.address}
                          </span>
                        </div>
                      </div>

                      {editMode ? (
                        <div className="space-y-4 mb-6">
                          <div>
                            <label className="text-sm font-medium">Time</label>
                            <Input
                              value={activityTime}
                              onChange={(e) => setActivityTime(e.target.value)}
                              placeholder="Enter time (e.g. 9:00 AM)"
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium">Notes</label>
                            <Input
                              value={activityDescription}
                              onChange={(e) =>
                                setActivityDescription(e.target.value)
                              }
                              placeholder="Enter notes"
                              className="mt-1"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3 mb-6">
                          <div className="flex items-center gap-2">
                            <Clock className="h-5 w-5 text-gray-500" />
                            <span className="text-sm">
                              {activityTime || "No time specified"}
                            </span>
                          </div>
                          <div className="flex items-start gap-2">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="20"
                              height="20"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="h-5 w-5 text-gray-500 mt-0.5"
                            >
                              <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
                              <path d="M13 2v7h7" />
                            </svg>
                            <span className="text-sm">
                              {activityDescription || "Custom notes"}
                            </span>
                          </div>
                        </div>
                      )}

                      <div className="flex gap-4 mb-6">
                        <Button
                          className="flex-1"
                          onClick={handleAddToItinerary}
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          {editingActivityId
                            ? "Update Activity"
                            : "Add to Itinerary"}
                        </Button>
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={saveLocation}
                        >
                          <Heart className="mr-2 h-4 w-4" />
                          Save {getPlaceTypeName(searchedLocation?.placeTypes)}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    getCurrentCategoryData().map((item) => (
                      <Card
                        key={item.id}
                        className="overflow-hidden border-gray-200 dark:border-gray-700 bg-white dark:bg-black"
                      >
                        <div className="flex">
                          <img
                            src={item.image || "/placeholder.svg"}
                            alt={item.title}
                            className="h-[100px] w-[100px] object-cover"
                          />
                          <div className="flex flex-1 flex-col p-4">
                            <div className="flex items-center justify-between">
                              <h4 className="font-semibold">{item.title}</h4>
                              <Badge
                                variant="outline"
                                className="border-gray-200 dark:border-gray-700"
                              >
                                {item.category}
                              </Badge>
                            </div>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                              {item.description}
                            </p>
                            <div className="mt-auto flex items-center justify-between">
                              <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                                <MapPin className="mr-1 h-3 w-3" />
                                {item.location}
                              </div>
                              <div className="flex items-center">
                                <span className="text-xs font-medium mr-2">
                                  ★ {item.rating}
                                </span>
                                <span className="text-xs font-medium">
                                  {item.price}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 ml-2 text-black dark:text-white"
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              </ScrollArea>
            </div>
          )}

          {/* Right Panel - Map View with Search and Category Buttons */}
          <div
            className={`${showMiddlePanel ? "flex-1" : "w-3/4"} flex flex-col`}
          >
            <div className="relative flex-1">
              {/* Map Container */}
              <div className="absolute inset-0 bg-[#e8eaed] overflow-hidden">
                {isLoaded ? (
                  <GoogleMap
                    mapContainerStyle={{ width: "100%", height: "100%" }}
                    center={mapCenter}
                    zoom={12}
                    onLoad={(map) => {
                      mapRef.current = map;
                    }}
                    options={{
                      zoomControl: false, // We have our own zoom buttons
                      mapTypeControl: false,
                      streetViewControl: false,
                      fullscreenControl: false,
                    }}
                  >
                    {/* Render Activity Markers */}
                    {!selectedCategory &&
                      getMapMarkers().map((marker) => (
                        <Marker
                          key={marker.id}
                          position={marker.position}
                          label={{
                            text: marker.index.toString(),
                            color: "white",
                            className: "font-bold",
                          }}
                          icon={{
                            url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
                          }}
                          onClick={() => setSelectedMarker(marker)}
                        />
                      ))}
                    {/* Render Category Markers */}
                    {selectedCategory &&
                      getCurrentCategoryData().map((item, index) => (
                        <Marker
                          key={item.id}
                          position={{
                            // In a real app, you'd store actual coordinates with each location
                            lat: mapCenter.lat + (Math.random() * 0.05 - 0.025),
                            lng: mapCenter.lng + (Math.random() * 0.05 - 0.025),
                          }}
                          icon={{
                            url:
                              selectedCategory === "restaurants"
                                ? "https://maps.google.com/mapfiles/ms/icons/red-dot.png"
                                : selectedCategory === "activities"
                                ? "https://maps.google.com/mapfiles/ms/icons/yellow-dot.png"
                                : "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
                          }}
                          onClick={() =>
                            setSelectedMarker({
                              id: item.id,
                              title: item.title,
                            })
                          }
                        />
                      ))}

                    {/* Info Window for selected marker */}
                    {selectedMarker && selectedMarkerPosition && (
                      <InfoWindow
                        position={selectedMarkerPosition}
                        onCloseClick={() => {
                          setSelectedMarker(null);
                          setSelectedMarkerPosition(null);
                        }}
                      >
                        <div className="p-1">
                          <p className="font-medium text-sm">
                            {selectedMarker.title}
                          </p>
                        </div>
                      </InfoWindow>
                    )}
                    {/* Searched Location Marker */}
                    {searchedLocation && (
                      <Marker
                        position={searchedLocation.position}
                        animation={google.maps.Animation.DROP}
                        onClick={() => {
                          setSelectedMarker({
                            id: 999, // Use a unique ID
                            title: searchedLocation.name,
                          });
                        }}
                      />
                    )}
                    {showDirections && directionsResponse && (
                      <DirectionsRenderer
                        directions={directionsResponse}
                        options={{
                          polylineOptions: {
                            strokeColor: "#4285F4",
                            strokeWeight: 5,
                            strokeOpacity: 0.8,
                          },
                          suppressMarkers: false,
                        }}
                      />
                    )}
                  </GoogleMap>
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <p>Loading map...</p>
                  </div>
                )}
              </div>

              {/* Map Controls */}
              <div className="absolute right-4 top-1/2 flex -translate-y-1/2 flex-col gap-2">
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-8 w-8 rounded-full bg-white shadow-md"
                >
                  <Plus className="h-4 w-4" />
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-8 w-8 rounded-full bg-white shadow-md"
                >
                  <span className="text-sm font-bold">−</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
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
  GoogleMap,
  useJsApiLoader,
  Marker,
  InfoWindow,
} from "@react-google-maps/api";
import { useTrips } from "@/context/trip-context";

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
  });

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

  // Sample data for different categories
  const categoryData = {
    restaurants: [
      {
        id: 201,
        title: "Oceanview Restaurant",
        description:
          "Fine dining with fresh seafood and panoramic ocean views.",
        location: "100 Harbor Drive",
        category: "Seafood",
        rating: 4.8,
        price: "$",
        image: "/placeholder.svg?height=100&width=150",
      },
      {
        id: 202,
        title: "Trattoria Italiana",
        description:
          "Authentic Italian cuisine in a cozy, family-friendly atmosphere.",
        location: "250 Main Street",
        category: "Italian",
        rating: 4.6,
        price: "$",
        image: "/placeholder.svg?height=100&width=150",
      },
    ],
    activities: [
      {
        id: 101,
        title: "Art Museum",
        description:
          "Explore contemporary and classical art from around the world.",
        location: "100 Culture Blvd",
        category: "Culture",
        rating: 4.7,
        price: "$",
        image: "/placeholder.svg?height=100&width=150",
      },
      {
        id: 102,
        title: "Waterfall Hike",
        description:
          "A moderate 2-hour hike to a spectacular 50-foot waterfall.",
        location: "Wilderness Park Trail",
        category: "Nature",
        rating: 4.9,
        price: "$",
        image: "/placeholder.svg?height=100&width=150",
      },
    ],
    hotels: [
      {
        id: 301,
        title: "Grand Oceanfront Resort",
        description:
          "Luxury beachfront resort with full amenities and spa services.",
        location: "1 Beachfront Drive",
        category: "Luxury",
        rating: 4.9,
        price: "$",
        image: "/placeholder.svg?height=100&width=150",
      },
    ],
  };

  // Get current category data
  const getCurrentCategoryData = () => {
    switch (selectedCategory) {
      case "restaurants":
        return categoryData.restaurants;
      case "activities":
        return categoryData.activities;
      case "hotels":
        return categoryData.hotels;
      default:
        return [];
    }
  };

  // Map markers for the selected day
  const getMapMarkers = () => {
    return (
      trip?.activities[selectedDay as keyof typeof trip.activities]?.map(
        (activity) => ({
          id: activity.id,
          title: activity.title,
          location: activity.location,
        })
      ) || []
    );
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
          return "Restaurants";
        case "activities":
          return "Things to do";
        case "hotels":
          return "Hotels";
        case "museums":
          return "Museums";
        default:
          return "Search on map...";
      }
    } else {
      return "Search on map...";
    }
  };

  // Check if middle panel should be shown
  const showMiddlePanel = selectedCategory || isAddingActivity;

  if (!trip) return null;

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
                <h3 className="text-lg font-semibold mb-4">
                  {trip.days.find((day) => day.id === selectedDay)?.title} -{" "}
                  {trip.days.find((day) => day.id === selectedDay)?.date}
                </h3>
                <div className="space-y-4">
                  {trip.activities[selectedDay as keyof typeof trip.activities]
                    ?.length > 0 ? (
                    trip.activities[
                      selectedDay as keyof typeof trip.activities
                    ]?.map((activity, index) => (
                      <Card
                        key={activity.id}
                        className="relative border-gray-200 dark:border-gray-700 bg-white dark:bg-black"
                      >
                        <div className="absolute left-4 top-0 h-full w-0.5 bg-gray-300 dark:bg-gray-600" />
                        <CardHeader className="pb-2">
                          <div className="flex items-center">
                            <div className="absolute -left-1 top-6 flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 dark:border-gray-700 bg-background">
                              <Clock className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                            </div>
                            <div className="ml-12">
                              <CardTitle className="text-base">
                                {activity.title}
                              </CardTitle>
                              <CardDescription className="text-xs">
                                {activity.time}
                              </CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="pb-2 pl-[5.5rem]">
                          <p className="text-sm">{activity.description}</p>
                        </CardContent>
                        <CardFooter className="pl-[5.5rem] pt-0">
                          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
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
                    ))
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
                    <Input
                      placeholder={getSearchPlaceholder()}
                      className="border-0 bg-transparent pl-2 shadow-none focus-visible:ring-0"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-gray-500"
                      onClick={closeMiddlePanel}
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
                      {isAddingActivity ? "Recent Searches" : "Results"}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {isAddingActivity
                        ? "Search for a location to add"
                        : `${
                            getCurrentCategoryData().length
                          } options available`}
                    </p>
                  </div>
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
                </div>
              </div>
              <div className="border-b border-gray-200 dark:border-gray-700">
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
              </div>
              <ScrollArea className="flex-1">
                <div className="grid gap-4 p-4">
                  {isAddingActivity ? (
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
                    options={{
                      zoomControl: false, // We have our own zoom buttons
                      mapTypeControl: false,
                      streetViewControl: false,
                      fullscreenControl: false,
                    }}
                  >
                    {/* Render Activity Markers */}
                    {!selectedCategory &&
                      getMapMarkers().map((marker, index) => (
                        <Marker
                          key={marker.id}
                          position={{
                            // In a real app, you'd store actual coordinates with each activity
                            // This is just creating dummy positions for visualization
                            lat: mapCenter.lat + (Math.random() * 0.05 - 0.025),
                            lng: mapCenter.lng + (Math.random() * 0.05 - 0.025),
                          }}
                          label={{
                            text: (index + 1).toString(),
                            color: "white",
                            className: "font-bold",
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
                    {selectedMarker && (
                      <InfoWindow
                        position={{
                          lat: mapCenter.lat + (Math.random() * 0.05 - 0.025),
                          lng: mapCenter.lng + (Math.random() * 0.05 - 0.025),
                        }}
                        onCloseClick={() => setSelectedMarker(null)}
                      >
                        <div className="p-1">
                          <p className="font-medium text-sm">
                            {selectedMarker.title}
                          </p>
                        </div>
                      </InfoWindow>
                    )}
                  </GoogleMap>
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <p>Loading map...</p>
                  </div>
                )}
              </div>

              {/* Search and Category Controls - Floating above the map */}
              {!showMiddlePanel && (
                <div className="absolute left-4 top-4 z-10 flex flex-col gap-2">
                  {/* Search Bar - Width matches the total width of all buttons */}
                  <div className="w-[550px] rounded-full bg-white shadow-lg">
                    <div className="flex items-center p-2">
                      <Search className="ml-2 h-5 w-5 text-gray-500" />
                      <Input
                        placeholder={getSearchPlaceholder()}
                        className="border-0 bg-transparent pl-2 shadow-none focus-visible:ring-0"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                      {selectedCategory && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-gray-500"
                          onClick={() => {
                            setSelectedCategory("");
                            setSearchQuery("");
                          }}
                        />
                      )}
                    </div>
                  </div>

                  {/* Category Buttons */}
                  {/* <div className="absolute left-4 top-20 z-10 flex gap-2 overflow-x-auto"> */}
                  <div className="flex gap-2">
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
                </div>
              )}

              {/* Map Markers - Show either day activities or selected category items */}
              <div className="absolute inset-0 pointer-events-none">
                {selectedCategory
                  ? getCurrentCategoryData().map((item, index) => (
                      <div
                        key={item.id}
                        className="absolute flex flex-col items-center"
                        style={{
                          left: `${15 + (index % 5) * 15}%`,
                          top: `${20 + Math.floor(index / 5) * 15}%`,
                        }}
                      >
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-full shadow-lg
                          ${
                            selectedCategory === "restaurants"
                              ? "bg-rose-500"
                              : selectedCategory === "activities"
                              ? "bg-amber-500"
                              : "bg-sky-500"
                          } text-white`}
                        >
                          {selectedCategory === "restaurants" ? (
                            <Utensils className="h-4 w-4" />
                          ) : selectedCategory === "activities" ? (
                            <Landmark className="h-4 w-4" />
                          ) : (
                            <Hotel className="h-4 w-4" />
                          )}
                        </div>
                        <div className="mt-1 rounded-md bg-white p-2 text-xs shadow-md max-w-[120px] truncate">
                          {item.title}
                        </div>
                      </div>
                    ))
                  : getMapMarkers().map((marker, index) => (
                      <div
                        key={marker.id}
                        className="absolute flex flex-col items-center"
                        style={{
                          left: `${20 + index * 15}%`,
                          top: `${30 + index * 10}%`,
                        }}
                      >
                        {/* <div className="flex h-8 w-8 items-center justify-center rounded-full bg-black dark:bg-white text-white dark:text-black shadow-lg">
                          {index + 1}
                        </div>
                        <div className="mt-1 rounded-md bg-white p-2 text-xs shadow-md">
                          {marker.title}
                        </div> */}
                      </div>
                    ))}
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

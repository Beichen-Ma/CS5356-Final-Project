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
  ChevronDown,
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
  Star,
  Share2,
  Mail,
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
  DialogFooter,
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
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
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
import { ProtectedRoute } from "@/components/protected-route";
import { AuthNav } from "@/components/auth-nav";

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
  location?: string;
  category: string;
  position?: ActivityPosition;
  website?: string;
  phoneNumber?: string;
  locationPosition?: ActivityPosition;
  image?: string;
  editorialSummary?: string;
  accessibility?: string[];
  serviceOptions?: string[];
  planningTips?: string[];
  kidFriendly?: boolean;
  openingHours?: string[];
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

// Create a ShareTripDialog component
function ShareTripDialog({
  trip,
  isOpen,
  onClose,
}: {
  trip: any;
  isOpen: boolean;
  onClose: () => void;
}) {
  const [email, setEmail] = useState("");
  const [emails, setEmails] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleAddEmail = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    if (emails.includes(email)) {
      setError("This email is already added");
      return;
    }

    setEmails([...emails, email]);
    setEmail("");
    setError("");
  };

  const handleRemoveEmail = (emailToRemove: string) => {
    setEmails(emails.filter((e) => e !== emailToRemove));
  };

  const handleShare = () => {
    if (emails.length === 0) {
      setError("Please add at least one email address");
      return;
    }

    setIsSubmitting(true);
    setError("");

    // Simulate API call
    setTimeout(() => {
      // In a real app, you would send these emails to your API
      console.log(`Sharing trip ${trip.id} with:`, emails);
      setSuccess(
        `Trip "${trip.title}" shared with ${emails.length} ${
          emails.length === 1 ? "person" : "people"
        }`
      );
      setIsSubmitting(false);

      // Reset and close after success message displayed
      setTimeout(() => {
        setEmails([]);
        setSuccess("");
        onClose();
      }, 2000);
    }, 1000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && email) {
      e.preventDefault();
      handleAddEmail();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogTitle className="flex items-center gap-2">
          <Share2 className="h-5 w-5" />
          Share Trip
        </DialogTitle>
        <div className="py-4">
          <div className="mb-4">
            <h3 className="text-lg font-medium">{trip?.title}</h3>
            <p className="text-sm text-gray-500">
              Share this trip with friends and family
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Input
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
                onKeyDown={handleKeyDown}
                placeholder="Enter email address"
                className="flex-1"
              />
              <Button onClick={handleAddEmail} type="button">
                Add
              </Button>
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}
            {success && <p className="text-sm text-green-500">{success}</p>}

            {emails.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {emails.map((email) => (
                  <Badge
                    key={email}
                    variant="secondary"
                    className="flex items-center gap-1 px-2 py-1"
                  >
                    <Mail className="h-3 w-3" />
                    {email}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 hover:bg-transparent"
                      onClick={() => handleRemoveEmail(email)}
                    >
                      <X className="h-3 w-3" />
                      <span className="sr-only">Remove</span>
                    </Button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleShare} disabled={isSubmitting}>
            {isSubmitting ? "Sharing..." : "Share Trip"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function TripOverviewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tripId = searchParams.get("id") || "nyc";
  const { getTrip } = useTrips();

  const [selectedDay, setSelectedDay] = useState<string | "overview">(
    "overview"
  );
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
      image: searchedLocation.image, // Add the image URL from searchedLocation
      rating: searchedLocation.rating,
      price: searchedLocation.priceLevel
        ? "$".repeat(searchedLocation.priceLevel)
        : undefined,
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

    // Always filter out custom activities (those with location="none")
    const validActivities = dayActivities.filter(
      (activity: any) => activity.location !== "none"
    );

    // If showing directions, renumber the markers sequentially
    if (showDirections) {
      // Map them to markers with consecutive numbers
      return validActivities.map((activity: any, index) => {
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
          index: index + 1, // Consecutive numbers starting from 1
        };
      });
    }

    // Regular case: return all valid activities with their original indices
    return validActivities.map((activity: any, index) => {
      // Find the original index of this activity in the full list
      const originalIndex = dayActivities.findIndex(
        (a: any) => a.id === activity.id
      );

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
        index: originalIndex + 1, // Keep the original numbering from the full list
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
      // setIsAddingActivity(false);
    } else {
      setSelectedCategory(category);
      setSearchQuery(""); // Clear search query
      // Do not set isAddingActivity to false here, so the UI remains visible
    }
  };

  // Handle adding an activity
  const handleAddActivity = () => {
    setIsAddingActivity(true);
    setSelectedCategory(""); // Clear selected category
    setSearchQuery(""); // Clear search query
    setMiddlePanelCollapsed(false); // Expand the middle panel if it was collapsed
    setEditMode(false); // Reset edit mode so category buttons will display
    setEditingActivityId(null); // Clear any editing activity ID

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
    isCustomActivity?: boolean;
    website?: string;
    phoneNumber?: string;
    image?: string;
    rating?: number;
    reviewCount?: number;
    priceLevel?: number;
    description?: string;
    editorialSummary?: string;
    accessibility?: string[];
    serviceOptions?: string[];
    planningTips?: string[];
    kidFriendly?: boolean;
    openingHours?: string[];
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
        address: "none", // Set address to "none" for custom activities
        name: searchQuery,
        placeId: "custom-location",
        placeTypes: ["custom"], // Default type for custom locations
        isCustomActivity: true, // Flag to indicate this is a custom activity
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
        fields: [
          "name",
          "geometry",
          "formatted_address",
          "types",
          "website",
          "formatted_phone_number",
          "photos",
          "rating",
          "user_ratings_total",
          "price_level",
          "editorial_summary",
          "opening_hours",
          "business_status",
        ],
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

          // Get the image URL if available
          let photoUrl = "";
          if (place.photos && place.photos.length > 0) {
            photoUrl = place.photos[0].getUrl({
              maxWidth: 500,
              maxHeight: 300,
            });
          }

          // Extract accessibility options
          const accessibility: string[] = [];
          if ((place as any).wheelchair_accessible_entrance)
            accessibility.push("Wheelchair accessible entrance");

          // Extract category-based information
          const serviceOptions: string[] = [];
          const planningTips: string[] = [];

          // Determine place categories based on types
          const types = place.types || [];
          if (
            types.includes("restaurant") ||
            types.includes("cafe") ||
            types.includes("bar")
          ) {
            // For restaurants/cafes/bars
            serviceOptions.push("Food & drinks available");
            planningTips.push("Consider calling for reservations");
          }

          if (
            types.includes("museum") ||
            types.includes("art_gallery") ||
            types.includes("tourist_attraction")
          ) {
            // For attractions
            planningTips.push("Check opening times before visiting");
            planningTips.push("May have admission fees");
          }

          if (types.includes("lodging") || types.includes("hotel")) {
            // For hotels
            serviceOptions.push("Accommodation services");
            planningTips.push("Advance booking recommended");
          }

          if (types.includes("shopping_mall") || types.includes("store")) {
            // For shopping
            serviceOptions.push("Shopping available");
          }

          // Infer kid-friendliness from types
          const kidFriendly =
            types.includes("amusement_park") ||
            types.includes("zoo") ||
            types.includes("aquarium") ||
            types.includes("museum") ||
            types.includes("park");

          // Get opening hours if available
          let openingHours: string[] = [];
          if (place.opening_hours && place.opening_hours.weekday_text) {
            openingHours = place.opening_hours.weekday_text;
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
            placeTypes: place.types || [],
            website: place.website || "",
            phoneNumber: place.formatted_phone_number || "",
            image: photoUrl,
            rating: place.rating,
            reviewCount: place.user_ratings_total,
            priceLevel: place.price_level,
            editorialSummary: (place as any).editorial_summary
              ? (place as any).editorial_summary.overview
              : undefined,
            accessibility: accessibility.length > 0 ? accessibility : undefined,
            serviceOptions:
              serviceOptions.length > 0 ? serviceOptions : undefined,
            planningTips: planningTips.length > 0 ? planningTips : undefined,
            kidFriendly: (place as any).good_for_children || false,
            openingHours: openingHours.length > 0 ? openingHours : undefined,
          });

          // Initialize the activity name with the location name
          setActivityName(place.name || "");

          // Open the middle panel to show details
          setSelectedCategory("searchResult");

          // If we were editing a location, exit location editing mode
          if (editingLocation) {
            setEditingLocation(false);
          }
        }
      }
    );
  };

  // Add these new state variables below the other state variables declarations
  const [editMode, setEditMode] = useState(false);
  const [editingLocation, setEditingLocation] = useState(false);
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
  const [middlePanelCollapsed, setMiddlePanelCollapsed] = useState(false);

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
      website: activity.website || "",
      phoneNumber: activity.phoneNumber || "",
      image: activity.image || "", // Preserve the image URL when editing
      editorialSummary: activity.editorialSummary || "",
      accessibility: activity.accessibility || [],
      serviceOptions: activity.serviceOptions || [],
      planningTips: activity.planningTips || [],
      kidFriendly: activity.kidFriendly || false,
      openingHours: activity.openingHours || [],
    });

    // Set the edit mode
    setSelectedCategory("searchResult");
    setEditMode(true);
    setEditingLocation(false);
    setMiddlePanelCollapsed(false); // Expand the middle panel if it was collapsed

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
      // Store website and phone number if available
      website: searchedLocation?.website || "",
      phoneNumber: searchedLocation?.phoneNumber || "",
      // Store the image URL if available
      image: searchedLocation?.image || "",
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
    setEditingLocation(false);
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

  // Add a state to track whether marker was selected from map or activity list
  const [markerSelectedFromMap, setMarkerSelectedFromMap] = useState(false);

  // Add state variable to remember selected activity
  const [selectedActivityId, setSelectedActivityId] = useState<number | null>(
    null
  );

  // Add a clean useEffect for click outside handling
  useEffect(() => {
    // Only add the listener if an activity is selected
    if (selectedActivityId === null) return;

    // Handle click outside
    const handleClickOutside = (event: MouseEvent) => {
      // Skip if clicking on a card, dropdown, or handle
      if (
        event.target instanceof Element &&
        (event.target.closest(".card-activity") ||
          event.target.closest('[role="button"]') ||
          event.target.closest(".grip-handle") ||
          event.target.closest(".dropdown-area"))
      ) {
        return;
      }

      // Deselect the activity
      setSelectedActivityId(null);

      // Only clear marker if it wasn't selected from the map
      if (!markerSelectedFromMap) {
        setSelectedMarker(null);
        setSelectedMarkerPosition(null);
      }
    };

    // Add click listener
    document.addEventListener("mousedown", handleClickOutside);

    // Cleanup on unmount
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [selectedActivityId, markerSelectedFromMap]);

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
          e.target.closest(".dropdown-area") ||
          e.target.closest(".activity-image"))
      ) {
        return;
      }

      // Toggle selection - deselect if clicking the same card again
      if (selectedActivityId === activity.id) {
        // Deselect this activity
        setSelectedActivityId(null);
        setSelectedMarker(null);
        setSelectedMarkerPosition(null);

        // If we're showing directions, fit the map to the route bounds when deselecting
        if (showDirections && directionsResponse && mapRef.current) {
          const bounds = directionsResponse.routes[0]?.bounds;
          if (bounds) {
            mapRef.current.fitBounds(bounds);
          }
        }
        return;
      }

      // Set this activity as selected
      setSelectedActivityId(activity.id);

      // Find the marker position for this activity
      const position = activity.position || {
        lat: mapCenter.lat + ((index % 5) * 0.01 - 0.02),
        lng: mapCenter.lng + (Math.floor(index / 5) * 0.01 - 0.02),
      };

      // Store the position for highlighting the marker
      setSelectedMarkerPosition(position);

      // Center the map on this position
      if (mapRef.current) {
        mapRef.current.panTo(position);
        mapRef.current.setZoom(15);
      }

      // Set the selected marker for highlighting, but don't show info window
      setSelectedMarker({
        id: activity.id,
        title: activity.title,
      });

      // Set flag to indicate selection is from activity list, not map click
      setMarkerSelectedFromMap(false);
    };

    // Check if this activity is currently selected
    const isSelected = selectedActivityId === activity.id;

    return (
      <Card
        key={activity.id}
        ref={setNodeRef}
        style={style}
        onClick={handleCardClick}
        className={`card-activity relative bg-white dark:bg-black transition-shadow hover:shadow-md cursor-pointer text-left ${
          isSelected
            ? "border-2 border-red-500"
            : "border border-gray-200 dark:border-gray-700"
        } flex items-center overflow-hidden`}
      >
        <div
          {...attributes}
          {...listeners}
          className="flex-shrink-0 w-10 flex items-center justify-center cursor-grab active:cursor-grabbing grip-handle group bg-gray-50 dark:bg-gray-900"
          data-tooltip="Drag to reorder"
        >
          <GripVertical className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          <div className="absolute left-10 -top-1 px-2 py-1 bg-black text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity z-50 whitespace-nowrap">
            Drag to reorder
          </div>
        </div>

        {activity.image && (
          <div className="activity-image flex-shrink-0 px-3 py-2">
            <div className="w-20 h-20 overflow-hidden rounded-lg">
              <img
                src={activity.image}
                alt={activity.title}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}

        <div className="flex-1 flex flex-col">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center">
                <div>
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
                      className="text-red-500 focus:bg-red-100 dark:focus:bg-red-900/50 focus:text-red-600 dark:focus:text-red-400"
                    >
                      <Trash className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pb-2">
            <p className="text-sm text-left">{activity.description}</p>
          </CardContent>
          <CardFooter className="pt-0">
            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 text-left">
              <MapPin className="mr-1 h-3 w-3" />
              {activity.location}
            </div>
            <Badge
              variant="outline"
              className={`ml-auto border-gray-200 dark:border-gray-700`}
            >
              {activity.category}
            </Badge>
          </CardFooter>
        </div>
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
      // Use Google Maps Distance Matrix Service directly
      const distanceMatrixService = new google.maps.DistanceMatrixService();

      // Initialize the transit info object
      const newTransitInfo: TransitInfo = {
        origin,
        destination,
        driving: {
          distance: "",
          duration: "",
          durationValue: 0,
        },
        _timestamp: now,
      };

      // Function to get distance and duration for each mode
      const getModeData = async (mode: google.maps.TravelMode) => {
        try {
          const response = await distanceMatrixService.getDistanceMatrix({
            origins: [origin],
            destinations: [destination],
            travelMode: mode,
            unitSystem: google.maps.UnitSystem.METRIC,
          });

          if (
            response.rows[0]?.elements[0]?.status === "OK" &&
            response.rows[0]?.elements[0]?.distance &&
            response.rows[0]?.elements[0]?.duration
          ) {
            const result = response.rows[0].elements[0];
            return {
              distance: result.distance.text,
              duration: result.duration.text,
              durationValue: result.duration.value, // duration in seconds
            };
          }
          return null;
        } catch (error) {
          console.error(`Error fetching ${mode} data:`, error);
          return null;
        }
      };

      // Get data for each mode of transportation
      const drivingData = await getModeData(google.maps.TravelMode.DRIVING);
      if (drivingData) newTransitInfo.driving = drivingData;

      const walkingData = await getModeData(google.maps.TravelMode.WALKING);
      if (walkingData) newTransitInfo.walking = walkingData;

      const bicyclingData = await getModeData(google.maps.TravelMode.BICYCLING);
      if (bicyclingData) newTransitInfo.bicycling = bicyclingData;

      const transitData = await getModeData(google.maps.TravelMode.TRANSIT);
      if (transitData) newTransitInfo.transit = transitData;

      // Set default selected mode if not already set
      if (!newTransitInfo.selectedMode) {
        newTransitInfo.selectedMode = "driving";
      }

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
        // Check if either origin or destination is a custom activity (location="none")
        if (
          originActivity.location === "none" ||
          destinationActivity.location === "none"
        ) {
          // Skip transit calculation for custom activities
          return;
        }

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

    // Get all activities for the day
    const allActivities = trip.activities[selectedDay];
    if (!allActivities || allActivities.length < 2) {
      alert("Need at least two activities to show directions");
      return;
    }

    // Filter out custom activities (those with location="none" or empty location)
    const activities = allActivities.filter(
      (activity: any) =>
        activity.location &&
        activity.location !== "none" &&
        activity.location !== ""
    );

    // Check if we still have enough activities after filtering
    if (activities.length < 2) {
      alert(
        "Need at least two activities with valid locations to show directions"
      );
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

  // Handle day selection
  const handleDaySelect = (dayId: string | "overview") => {
    setSelectedDay(dayId);
    if (dayId !== "overview") {
      // Reset other states when selecting a specific day
      setSelectedMarker(null);
      setSelectedMarkerPosition(null);
      setMarkerSelectedFromMap(false);
      setSelectedActivityId(null);
    }
  };

  if (!trip) return null;

  // Get the activities for the selected day
  const dayActivities =
    selectedDay !== "overview"
      ? trip.activities[selectedDay as keyof typeof trip.activities] || []
      : Object.values(trip.activities).flat();

  // Function to toggle location editing mode
  const toggleLocationEditing = () => {
    setEditingLocation(!editingLocation);

    // When enabling location editing, focus the search input after state updates
    if (!editingLocation) {
      setTimeout(() => {
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }, 100);
    }
  };

  const handleLocationDelete = () => {
    if (editingActivityId) {
      const activityToUpdate = dayActivities.find(
        (activity) => activity.id === editingActivityId
      );
      if (activityToUpdate) {
        // Create a new object with an empty location string instead of deleting it
        const updatedActivity = {
          ...activityToUpdate,
          location: "", // Set to empty string instead of deleting
          position: undefined, // Clear the position without deleting the property
        };

        // Update the activity in the dayActivities array
        const updatedActivities = dayActivities.map((activity) =>
          activity.id === editingActivityId ? updatedActivity : activity
        );

        // Update the trip object with the modified activities
        const updatedTrip = { ...trip };
        updatedTrip.activities[selectedDay as keyof typeof trip.activities] =
          updatedActivities;
        setTrip(updatedTrip);
      }
    }

    // Reset location editing mode
    setEditingLocation(false);
  };

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white">
      {/* Navigation Bar */}
      <header className="border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="mx-auto flex items-center justify-between">
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
              <span className="flex items-center gap-2">
                {trip.title} • {trip.location}
              </span>
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
              {/* Overview Button */}
              <Button
                variant={selectedDay === "overview" ? "default" : "ghost"}
                className={`flex flex-col items-center justify-center h-16 ${
                  isCollapsed ? "p-1" : "p-2"
                }`}
                onClick={() => handleDaySelect("overview")}
              >
                {!isCollapsed && <span className="text-xs">Trip</span>}
                <span
                  className={`font-medium ${
                    isCollapsed ? "text-xs" : "text-sm"
                  }`}
                >
                  {isCollapsed ? (
                    <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center">
                      {trip.days.length}
                    </span>
                  ) : (
                    "Overview"
                  )}
                </span>
              </Button>

              {/* Separator Line */}
              <div className="h-px bg-gray-200 dark:bg-gray-700 my-1"></div>

              {/* Day Buttons */}
              {trip.days.map((day) => (
                <Button
                  key={day.id}
                  variant={selectedDay === day.id ? "default" : "ghost"}
                  className={`flex flex-col items-center justify-center h-16 ${
                    isCollapsed ? "p-1" : "p-2"
                  }`}
                  onClick={() => handleDaySelect(day.id)}
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
              {/* <Button
                variant="ghost"
                className={`flex items-center justify-center h-16 ${
                  isCollapsed ? "p-1" : "p-2"
                }`}
              >
                <Plus className="h-5 w-5" />
                {!isCollapsed && <span className="text-xs mt-1">Add Day</span>}
              </Button> */}
            </div>
          </ScrollArea>
        </div>

        {/* Main Content Area */}
        <div className="flex flex-1 overflow-hidden">
          {/* First Panel - Day Overview */}
          <div
            className={`${
              selectedCategory ? "w-1/3" : "w-1/3"
            } border-r border-gray-200 dark:border-gray-700 flex flex-col `}
          >
            <div className="border-b border-gray-200 dark:border-gray-700 p-4">
              {selectedDay === "overview" ? (
                <h2 className="text-xl font-bold">Trip Overview</h2>
              ) : (
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold">
                    {trip.days.find((day) => day.id === selectedDay)?.title} -{" "}
                    {trip.days.find((day) => day.id === selectedDay)?.date}
                  </h2>

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
              )}
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {trip.startDate} - {trip.endDate} • {trip.location}
              </p>
            </div>
            <div className="flex flex-col h-[calc(100%-66px)] relative">
              <ScrollArea className="flex-1">
                <div className="p-4 pb-20">
                  {selectedDay === "overview" ? (
                    // Overview Panel Content - Show all days
                    <div className="space-y-6">
                      {trip.days.map((day) => (
                        <div key={day.id} className="space-y-4">
                          <div className="flex justify-between items-center">
                            <h3 className="text-lg font-semibold">
                              {day.title} - {day.date}
                            </h3>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDaySelect(day.id)}
                              className="text-xs"
                            >
                              View Details
                            </Button>
                          </div>

                          {/* Day Activities Preview */}
                          <div className="space-y-2">
                            {trip.activities[day.id]?.length > 0 ? (
                              trip.activities[day.id]
                                .slice(0, 2)
                                .map((activity: any) => (
                                  <Card
                                    key={activity.id}
                                    className="border border-gray-200 dark:border-gray-700"
                                  >
                                    <CardContent className="p-3">
                                      <div className="flex items-center justify-between">
                                        <div>
                                          <p className="font-medium">
                                            {activity.title}
                                          </p>
                                          <p className="text-xs text-gray-500">
                                            {activity.time}
                                          </p>
                                        </div>
                                        <Badge
                                          variant="outline"
                                          className="border-gray-200 dark:border-gray-700"
                                        >
                                          {activity.category}
                                        </Badge>
                                      </div>
                                    </CardContent>
                                  </Card>
                                ))
                            ) : (
                              <div className="text-center p-3 text-gray-500 dark:text-gray-400 text-sm border border-dashed border-gray-200 dark:border-gray-700 rounded">
                                No activities planned yet
                              </div>
                            )}

                            {/* Show "more activities" message if more than 2 */}
                            {(trip.activities[day.id]?.length || 0) > 2 && (
                              <div className="text-center p-1">
                                <Button
                                  variant="link"
                                  size="sm"
                                  onClick={() => handleDaySelect(day.id)}
                                  className="text-xs"
                                >
                                  +{(trip.activities[day.id]?.length || 0) - 2}{" "}
                                  more activities
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    // Specific Day Content
                    <div className="space-y-4">
                      {/* Remove the Show/Hide Route button duplicated here */}

                      {/* Rest of existing specific day content with DndContext */}
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
                            {dayActivities.map(
                              (activity: any, index: number) => (
                                <div key={activity.id}>
                                  <SortableActivityCard
                                    activity={activity}
                                    index={index}
                                  />
                                  {/* Add transit info row after each activity except the last one */}
                                  {index < dayActivities.length - 1 &&
                                    // Only show transit info if neither the origin nor destination is a custom activity
                                    (activity.location !== "none" &&
                                    dayActivities[index + 1].location !==
                                      "none" ? (
                                      <TransitRow
                                        originActivity={activity}
                                        destinationActivity={
                                          dayActivities[index + 1]
                                        }
                                      />
                                    ) : (
                                      // Show a simplified divider for custom activities
                                      <div className="flex items-center justify-center py-2 mx-2 my-1">
                                        <div className="h-px w-full bg-gray-200 dark:bg-gray-700"></div>
                                      </div>
                                    ))}
                                </div>
                              )
                            )}
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
                            Start planning your day by clicking the button below
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </ScrollArea>

              {/* Fixed Add Activity Button */}
              <div className="absolute bottom-2 left-0 right-0 p-4 bg-white dark:bg-black border-t border-gray-200 dark:border-gray-700 shadow-md z-10">
                <Button
                  variant="outline"
                  className="w-full border-gray-200 bg-transparent hover:bg-gray-100 hover:text-black dark:border-gray-700 dark:hover:bg-gray-800 dark:hover:text-white"
                  onClick={handleAddActivity}
                  disabled={selectedDay === "overview"}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  {selectedDay === "overview"
                    ? "Select a day to add activity"
                    : "Add Activity"}
                </Button>
              </div>
            </div>
          </div>

          {/* Middle Panel - Category Content (Only shown when a category is selected) */}
          {showMiddlePanel && (
            <div
              className={`${
                middlePanelCollapsed ? "w-[0px]" : "w-[580px]"
              } border-r border-gray-200 dark:border-gray-700 flex flex-col relative transition-all duration-300 ease-in-out`}
            >
              <div className="absolute -right-4 top-1/2 transform -translate-y-1/2 z-10">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 rounded-full shadow-md bg-white dark:bg-gray-800"
                        onClick={() =>
                          setMiddlePanelCollapsed(!middlePanelCollapsed)
                        }
                      >
                        {middlePanelCollapsed ? (
                          <ChevronRight className="h-4 w-4" />
                        ) : (
                          <ChevronLeft className="h-4 w-4" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>
                        {middlePanelCollapsed ? "Expand" : "Collapse"} middle
                        panel
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              {!middlePanelCollapsed && (
                <>
                  <div className="border-b border-gray-200 dark:border-gray-700 p-4">
                    {/* Search Bar - Only show if adding activity or editing location */}
                    {(isAddingActivity || editingLocation) && (
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
                                searchQuery.length > 2 &&
                                setShowPredictions(true)
                              }
                              ref={searchInputRef}
                            />

                            {showPredictions && (
                              <div className="absolute top-full left-0 w-full bg-white z-50 mt-1 rounded-md shadow-lg overflow-hidden">
                                <div
                                  className="p-2 hover:bg-gray-100 cursor-pointer border-b flex justify-between"
                                  onClick={() =>
                                    handleSelectPrediction(null, true)
                                  }
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
                                    onClick={() =>
                                      handleSelectPrediction(prediction)
                                    }
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
                              if (editingLocation) {
                                setEditingLocation(false);
                              } else {
                                closeMiddlePanel();
                              }
                              setShowPredictions(false);
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Category Buttons - Only show if adding activity */}
                    {isAddingActivity && !editMode && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        <Button
                          variant={
                            selectedCategory === "restaurants"
                              ? "default"
                              : "secondary"
                          }
                          className={`rounded-full bg-white px-4 shadow-md hover:bg-gray-100 dark:bg-white dark:text-black dark:hover:bg-gray-100 ${
                            selectedCategory === "restaurants"
                              ? "text-blue-600"
                              : "text-gray-700"
                          }`}
                          onClick={() => handleCategorySelect("restaurants")}
                        >
                          <Utensils className="mr-2 h-4 w-4" />
                          Restaurants
                        </Button>
                        <Button
                          variant={
                            selectedCategory === "hotels"
                              ? "default"
                              : "secondary"
                          }
                          className={`rounded-full bg-white px-4 shadow-md hover:bg-gray-100 dark:bg-white dark:text-black dark:hover:bg-gray-100 ${
                            selectedCategory === "hotels"
                              ? "text-blue-600"
                              : "text-gray-700"
                          }`}
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
                          className={`rounded-full bg-white px-4 shadow-md hover:bg-gray-100 dark:bg-white dark:text-black dark:hover:bg-gray-100 ${
                            selectedCategory === "activities"
                              ? "text-blue-600"
                              : "text-gray-700"
                          }`}
                          onClick={() => handleCategorySelect("activities")}
                        >
                          <Landmark className="mr-2 h-4 w-4" />
                          Things to do
                        </Button>
                        <Button
                          variant={
                            selectedCategory === "museums"
                              ? "default"
                              : "secondary"
                          }
                          className={`rounded-full bg-white px-4 shadow-md hover:bg-gray-100 dark:bg-white dark:text-black dark:hover:bg-gray-100 ${
                            selectedCategory === "museums"
                              ? "text-blue-600"
                              : "text-gray-700"
                          }`}
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
                    )}
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-lg font-semibold capitalize">
                          {isAddingActivity && !searchedLocation
                            ? "Recent Searches"
                            : selectedCategory === "searchResult"
                            ? "Activity Details"
                            : "Saved Results"}
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
                            onClick={() => setIsShareModalOpen(true)}
                          >
                            <Share2 className="h-4 w-4" />
                            Share
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="border-b border-gray-200 dark:border-gray-700">
                    {selectedCategory !== "searchResult" &&
                      !isAddingActivity && (
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
                            Type in the search bar above to find places to add
                            to your itinerary
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
                                onChange={(e) =>
                                  setActivityName(e.target.value)
                                }
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
                            {editMode ? (
                              <div
                                className={`flex items-center gap-2 p-2 border rounded-md ${
                                  editingLocation
                                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                                    : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                                } cursor-pointer transition-colors`}
                                onClick={toggleLocationEditing}
                              >
                                <MapPin className="h-5 w-5 text-gray-500" />
                                <div className="flex-1">
                                  <span className="text-sm">
                                    {searchedLocation.address !== "none"
                                      ? searchedLocation.address
                                      : "No location - click to set"}
                                  </span>
                                  {editingLocation && (
                                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                                      Search above to change location
                                    </p>
                                  )}
                                </div>
                                {!editingLocation && (
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4 text-gray-400"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      d="M9 5l7 7-7 7"
                                    />
                                  </svg>
                                )}
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <MapPin className="h-5 w-5 text-gray-500" />
                                <span className="text-sm">
                                  {searchedLocation.address !== "none"
                                    ? searchedLocation.address
                                    : "No location specified"}
                                </span>
                              </div>
                            )}
                          </div>

                          {editMode ? (
                            <div className="space-y-4 mb-6">
                              <div>
                                <label className="text-sm font-medium">
                                  Time
                                </label>
                                <Input
                                  value={activityTime}
                                  onChange={(e) =>
                                    setActivityTime(e.target.value)
                                  }
                                  placeholder="Enter time (e.g. 9:00 AM)"
                                  className="mt-1"
                                />
                              </div>
                              <div>
                                <label className="text-sm font-medium">
                                  Notes
                                </label>
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

                          {!editMode && (
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
                                Save{" "}
                                {getPlaceTypeName(searchedLocation?.placeTypes)}
                              </Button>
                            </div>
                          )}

                          {/* Additional information section */}
                          <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-4">
                            <h3 className="text-sm font-semibold mb-3">
                              Additional Information
                            </h3>

                            {/* Place Image */}
                            {searchedLocation?.image && (
                              <div className="mb-3">
                                <img
                                  src={
                                    searchedLocation.image || "/placeholder.svg"
                                  }
                                  alt={searchedLocation.name}
                                  className="w-full h-40 object-cover rounded-md"
                                />
                              </div>
                            )}

                            {/* Rating and Reviews */}
                            {searchedLocation?.rating && (
                              <div className="flex items-center gap-2 mb-3">
                                <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                                <span className="text-sm font-medium">
                                  {searchedLocation.rating}
                                </span>
                                {searchedLocation?.reviewCount && (
                                  <span className="text-sm text-gray-500">
                                    ({searchedLocation.reviewCount} reviews)
                                  </span>
                                )}
                              </div>
                            )}

                            {/* Place Type */}
                            {/* <div className="flex items-center gap-2 mb-3">
                              <MapPin className="h-5 w-5 text-gray-500" />
                              <span className="text-sm">
                                {getPlaceTypeName(searchedLocation?.placeTypes)}
                              </span>
                              {searchedLocation?.priceLevel && (
                                <span className="text-sm ml-2">
                                  {"$".repeat(searchedLocation.priceLevel)}
                                </span>
                              )}
                            </div> */}

                            {/* Website */}
                            <div className="flex items-center gap-2 mb-2">
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
                                className="h-5 w-5 text-gray-500"
                              >
                                <circle cx="12" cy="12" r="10" />
                                <line x1="2" y1="12" x2="22" y2="12" />
                                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                              </svg>
                              {searchedLocation?.website ? (
                                <a
                                  href={searchedLocation.website}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline truncate max-w-[300px]"
                                >
                                  {searchedLocation.website}
                                </a>
                              ) : (
                                <span className="text-sm text-gray-500">
                                  No website available
                                </span>
                              )}
                            </div>

                            {/* Phone Number */}
                            <div className="flex items-center gap-2">
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
                                className="h-5 w-5 text-gray-500"
                              >
                                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                              </svg>
                              {searchedLocation?.phoneNumber ? (
                                <a
                                  href={`tel:${searchedLocation.phoneNumber}`}
                                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                                >
                                  {searchedLocation.phoneNumber}
                                </a>
                              ) : (
                                <span className="text-sm text-gray-500">
                                  No phone number available
                                </span>
                              )}
                            </div>

                            {/* Editorial Summary */}
                            {searchedLocation?.editorialSummary && (
                              <div className="mt-4 mb-3">
                                <h4 className="text-sm font-semibold mb-2">
                                  About
                                </h4>
                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                  {searchedLocation.editorialSummary}
                                </p>
                              </div>
                            )}

                            {/* Opening Hours */}
                            {searchedLocation?.openingHours &&
                              searchedLocation.openingHours.length > 0 && (
                                <div className="mt-4 mb-3">
                                  <h4 className="text-sm font-semibold mb-2">
                                    Opening Hours
                                  </h4>
                                  <ul className="text-sm space-y-1 text-gray-700 dark:text-gray-300">
                                    {searchedLocation.openingHours.map(
                                      (hours, index) => (
                                        <li
                                          key={index}
                                          className="flex items-start"
                                        >
                                          <span className="mr-2">•</span>
                                          <span>{hours}</span>
                                        </li>
                                      )
                                    )}
                                  </ul>
                                </div>
                              )}

                            {/* Accessibility */}
                            {searchedLocation?.accessibility &&
                              searchedLocation.accessibility.length > 0 && (
                                <div className="mt-4 mb-3">
                                  <h4 className="text-sm font-semibold mb-2">
                                    Accessibility
                                  </h4>
                                  <ul className="text-sm space-y-1 text-gray-700 dark:text-gray-300">
                                    {searchedLocation.accessibility.map(
                                      (item, index) => (
                                        <li
                                          key={index}
                                          className="flex items-start"
                                        >
                                          <span className="mr-2">•</span>
                                          <span>{item}</span>
                                        </li>
                                      )
                                    )}
                                  </ul>
                                </div>
                              )}

                            {/* Service Options */}
                            {searchedLocation?.serviceOptions &&
                              searchedLocation.serviceOptions.length > 0 && (
                                <div className="mt-4 mb-3">
                                  <h4 className="text-sm font-semibold mb-2">
                                    Service Options
                                  </h4>
                                  <ul className="text-sm space-y-1 text-gray-700 dark:text-gray-300">
                                    {searchedLocation.serviceOptions.map(
                                      (item, index) => (
                                        <li
                                          key={index}
                                          className="flex items-start"
                                        >
                                          <span className="mr-2">•</span>
                                          <span>{item}</span>
                                        </li>
                                      )
                                    )}
                                  </ul>
                                </div>
                              )}

                            {/* Planning Tips */}
                            {searchedLocation?.planningTips &&
                              searchedLocation.planningTips.length > 0 && (
                                <div className="mt-4 mb-3">
                                  <h4 className="text-sm font-semibold mb-2">
                                    Planning
                                  </h4>
                                  <ul className="text-sm space-y-1 text-gray-700 dark:text-gray-300">
                                    {searchedLocation.planningTips.map(
                                      (item, index) => (
                                        <li
                                          key={index}
                                          className="flex items-start"
                                        >
                                          <span className="mr-2">•</span>
                                          <span>{item}</span>
                                        </li>
                                      )
                                    )}
                                  </ul>
                                </div>
                              )}

                            {/* Kid Friendly */}
                            {searchedLocation?.kidFriendly && (
                              <div className="mt-4 mb-3">
                                <h4 className="text-sm font-semibold mb-2">
                                  Family
                                </h4>
                                <div className="flex items-start text-sm text-gray-700 dark:text-gray-300">
                                  <span className="mr-2">•</span>
                                  <span>Good for children</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        getCurrentCategoryData().map((item) => (
                          <Card
                            key={item.id}
                            className="overflow-hidden border-gray-200 dark:border-gray-700 bg-white dark:bg-black"
                          >
                            <div className="flex items-center">
                              <img
                                src={item.image || "/placeholder.svg"}
                                alt={item.title}
                                className="w-20 h-20 object-cover rounded-lg"
                              />
                              <div className="flex flex-1 flex-col p-4">
                                <div className="flex items-center justify-between">
                                  <h4 className="font-semibold">
                                    {item.title}
                                  </h4>
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
                </>
              )}
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

                      // Add listener for map drag to deselect activity
                      map.addListener("dragstart", () => {
                        // If we had a selected activity
                        if (selectedActivityId !== null) {
                          setSelectedActivityId(null);
                          if (!markerSelectedFromMap) {
                            setSelectedMarker(null);
                            setSelectedMarkerPosition(null);

                            // If showing directions, fit to route bounds
                            if (showDirections && directionsResponse) {
                              const bounds =
                                directionsResponse.routes[0]?.bounds;
                              if (bounds) {
                                map.fitBounds(bounds);
                              }
                            }
                          }
                        }
                      });

                      // Add listener for map click to deselect activity
                      map.addListener("click", () => {
                        if (selectedActivityId !== null) {
                          setSelectedActivityId(null);
                          if (!markerSelectedFromMap) {
                            setSelectedMarker(null);
                            setSelectedMarkerPosition(null);
                          }
                        }
                      });
                    }}
                    options={{
                      zoomControl: false,
                      mapTypeControl: false,
                      streetViewControl: false,
                      fullscreenControl: false,
                    }}
                  >
                    {/* Render Activity Markers - Never show markers for custom activities */}
                    {!selectedCategory &&
                      getMapMarkers().map((marker) => (
                        <Marker
                          key={marker.id}
                          position={marker.position}
                          label={{
                            text: marker.index.toString(),
                            color: "white",
                            className: "font-bold",
                            fontSize: "15px",
                            fontWeight: "bold",
                          }}
                          icon={{
                            url:
                              selectedMarker && selectedMarker.id === marker.id
                                ? "https://maps.google.com/mapfiles/ms/icons/green-dot.png" // Highlight selected marker
                                : "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
                            scaledSize:
                              selectedMarker && selectedMarker.id === marker.id
                                ? new google.maps.Size(52, 52) // Make selected marker larger
                                : new google.maps.Size(38, 38), // Make default markers larger too
                          }}
                          onClick={() => {
                            setSelectedMarker(marker);
                            setSelectedMarkerPosition(marker.position);
                            setMarkerSelectedFromMap(true);
                          }}
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
                            scaledSize: new google.maps.Size(38, 38), // Make category markers larger too
                          }}
                          onClick={() => {
                            const position = {
                              lat:
                                mapCenter.lat + (Math.random() * 0.05 - 0.025),
                              lng:
                                mapCenter.lng + (Math.random() * 0.05 - 0.025),
                            };
                            setSelectedMarker({
                              id: item.id,
                              title: item.title,
                            });
                            setSelectedMarkerPosition(position);
                            setMarkerSelectedFromMap(true);
                          }}
                        />
                      ))}

                    {/* Info Window for selected marker */}
                    {selectedMarker &&
                      selectedMarkerPosition &&
                      markerSelectedFromMap && (
                        <InfoWindow
                          position={selectedMarkerPosition}
                          onCloseClick={() => {
                            setSelectedMarker(null);
                            setSelectedMarkerPosition(null);
                            setMarkerSelectedFromMap(false);
                            setSelectedActivityId(null); // Clear selected activity when closing info window
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
                    {searchedLocation && !searchedLocation.isCustomActivity && (
                      <Marker
                        position={searchedLocation.position}
                        animation={google.maps.Animation.DROP}
                        icon={{
                          url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
                          scaledSize: new google.maps.Size(38, 38),
                        }}
                        onClick={() => {
                          setSelectedMarker({
                            id: 999, // Use a unique ID
                            title: searchedLocation.name,
                          });
                          setSelectedMarkerPosition(searchedLocation.position);
                          setMarkerSelectedFromMap(true);
                        }}
                      />
                    )}
                    {showDirections && directionsResponse && (
                      <DirectionsRenderer
                        directions={directionsResponse}
                        options={{
                          polylineOptions: {
                            strokeColor: "#1452ff",
                            strokeWeight: 5,
                            strokeOpacity: 0.8,
                          },
                          suppressMarkers: true,
                        }}
                      />
                    )}
                    {/* Render searched location */}
                    {searchedLocation &&
                      selectedCategory === "searchResult" && (
                        <>
                          {searchedLocation.address !== "none" &&
                            !searchedLocation.isCustomActivity && (
                              <Marker
                                position={searchedLocation.position}
                                onClick={() => {
                                  setSelectedMarker({
                                    id: 999, // Use a unique ID that won't conflict with activity IDs
                                    title: searchedLocation.name,
                                  });
                                  setSelectedMarkerPosition(
                                    searchedLocation.position
                                  );
                                }}
                                icon={{
                                  url: "/icons/location-black.svg",
                                  scaledSize: new google.maps.Size(32, 32),
                                }}
                              />
                            )}
                          {selectedMarker &&
                            selectedMarker.id === 999 &&
                            selectedMarkerPosition && (
                              <InfoWindow
                                position={selectedMarkerPosition}
                                onCloseClick={() => {
                                  setSelectedMarker(null);
                                  setSelectedMarkerPosition(null);
                                }}
                              >
                                <div className="text-sm">
                                  <p className="font-semibold">
                                    {searchedLocation.name}
                                  </p>
                                  {searchedLocation.address !== "none" && (
                                    <p className="text-gray-600">
                                      {searchedLocation.address}
                                    </p>
                                  )}
                                </div>
                              </InfoWindow>
                            )}
                        </>
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

      {/* Share Trip Modal */}
      <ShareTripDialog
        trip={trip}
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
      />
    </div>
  );
}

export default function TripOverview() {
  return (
    <ProtectedRoute>
      <TripOverviewContent />
    </ProtectedRoute>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ThemeToggle } from "@/components/theme-toggle";
import { NewTripModal } from "@/components/new-trip-modal";
import { cn } from "@/lib/utils";
import { useTrips } from "@/context/trip-context";
import { useAuth } from "@/context/auth-context";
import { AuthNav } from "@/components/auth-nav";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function TripsPage() {
  const router = useRouter();
  const { trips, isLoading, deleteTrip } = useTrips();
  const { isAuthenticated, user } = useAuth();
  const [filter, setFilter] = useState("all");
  const [createdByMe, setCreatedByMe] = useState(false);
  const [isNewTripModalOpen, setIsNewTripModalOpen] = useState(false);
  const [tripToEdit, setTripToEdit] = useState<string | undefined>(undefined);
  const [tripToDelete, setTripToDelete] = useState<string | null>(null);

  // Current user ID from auth context
  const currentUserId = user?.id || "";

  const handleCardClick = (id: string) => {
    router.push(`/trip-overview?id=${id}`);
  };

  const handleEditTrip = (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Prevent card click from triggering
    setTripToEdit(id);
    setIsNewTripModalOpen(true);
  };

  const handleDeleteTrip = async () => {
    if (!tripToDelete) return;

    try {
      await deleteTrip(tripToDelete);
      setTripToDelete(null);
    } catch (error) {
      console.error("Failed to delete trip:", error);
    }
  };

  // Add the "New Trip" card to the beginning of the array
  const tripsArray = [
    {
      id: "new",
      title: "New Trip",
      isNew: true,
    },
    ...Object.values(trips),
  ];

  // Filter trips based on selected filters
  const filteredTrips = tripsArray.filter((trip) => {
    // Always include the "New Trip" card
    if ("isNew" in trip) return true;

    // Apply "Created by me" filter if selected
    // Use the first collaborator as a proxy for the creator
    if (createdByMe && trip.collaborators.length > 0) {
      // Assume first collaborator is the creator
      const isCreatedByCurrentUser = trip.collaborators[0].id === currentUserId;
      if (!isCreatedByCurrentUser) return false;
    }

    // Apply date filters for Past/Ongoing
    if (filter !== "all") {
      const today = new Date();
      const startDate = new Date(trip.startDate);
      const endDate = new Date(trip.endDate);

      if (filter === "past" && endDate >= today) return false;
      if (filter === "ongoing" && (startDate > today || endDate < today))
        return false;
    }

    return true;
  });

  // When closing the modal, reset the tripToEdit state
  const handleModalOpenChange = (open: boolean) => {
    setIsNewTripModalOpen(open);
    if (!open) {
      setTripToEdit(undefined);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white">
      {/* Navigation Bar */}
      <header className="border-b border-gray-200 px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center">
            <div className="mr-10 text-xl font-bold text-black dark:text-white">
              <span className="flex items-center gap-2">
                <img src="/logo.png" alt="Travel Planner" className="h-8 w-8" />
                Travel Planner
              </span>
            </div>
          </div>
          <Tabs defaultValue="trips" className="w-[400px]">
            <TabsList className="grid w-full grid-cols-3 bg-transparent dark:bg-transparent">
              <TabsTrigger
                value="explore"
                className="data-[state=active]:bg-transparent data-[state=active]:text-black dark:data-[state=active]:text-white data-[state=active]:shadow-none"
              >
                {/* Explore */}
              </TabsTrigger>
              <TabsTrigger
                value="trips"
                className="data-[state=active]:bg-transparent data-[state=active]:text-black dark:data-[state=active]:text-white data-[state=active]:shadow-none"
              >
                {/* Trips */}
              </TabsTrigger>
              <TabsTrigger
                value="database"
                className="data-[state=active]:bg-transparent data-[state=active]:text-black dark:data-[state=active]:text-white data-[state=active]:shadow-none"
              >
                {/* Database */}
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="flex items-center">
            <AuthNav />
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* Filters */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFilter("all")}
              className={cn(
                "border-gray-200 bg-transparent text-sm hover:bg-gray-100 hover:text-black dark:border-gray-700 dark:hover:bg-gray-800 dark:hover:text-white",
                filter === "all" &&
                  "bg-gray-100 text-black dark:bg-gray-800 dark:text-white"
              )}
            >
              All
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFilter("ongoing")}
              className={cn(
                "border-gray-200 bg-transparent text-sm hover:bg-gray-100 hover:text-black dark:border-gray-700 dark:hover:bg-gray-800 dark:hover:text-white",
                filter === "ongoing" &&
                  "bg-gray-100 text-black dark:bg-gray-800 dark:text-white"
              )}
            >
              Ongoing
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFilter("past")}
              className={cn(
                "border-gray-200 bg-transparent text-sm hover:bg-gray-100 hover:text-black dark:border-gray-700 dark:hover:bg-gray-800 dark:hover:text-white",
                filter === "past" &&
                  "bg-gray-100 text-black dark:bg-gray-800 dark:text-white"
              )}
            >
              Past
            </Button>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Checkbox
                id="createdByMe"
                checked={createdByMe}
                onCheckedChange={(checked) => setCreatedByMe(!!checked)}
                className="border-gray-300 data-[state=checked]:bg-black data-[state=checked]:text-white dark:border-gray-600 dark:data-[state=checked]:bg-white dark:data-[state=checked]:text-black"
              />
              <label
                htmlFor="createdByMe"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Created by me
              </label>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="border-gray-200 bg-transparent text-sm hover:bg-gray-100 hover:text-black dark:border-gray-700 dark:hover:bg-gray-800 dark:hover:text-white"
            >
              Sort
            </Button>
            <div className="relative">
              <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <Input
                placeholder="Search trips..."
                className="w-[250px] border-gray-200 bg-transparent pl-8 text-sm placeholder:text-gray-500 focus-visible:ring-gray-300 dark:border-gray-700 dark:focus-visible:ring-gray-600"
              />
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white"></div>
          </div>
        ) : filteredTrips.length === 0 ||
          (filteredTrips.length === 1 && "isNew" in filteredTrips[0]) ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Card
              className="border-gray-200 border-dashed bg-white dark:bg-black hover:border-gray-300 dark:hover:border-gray-600 cursor-pointer"
              onClick={() => setIsNewTripModalOpen(true)}
            >
              <CardContent className="p-4">
                <div className="flex h-full flex-col items-center justify-center py-10">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-gray-300 text-black dark:border-gray-600 dark:text-white">
                    <Plus className="h-8 w-8" />
                  </div>
                  <h3 className="text-lg font-medium text-black dark:text-white">
                    New Trip
                  </h3>
                </div>
              </CardContent>
            </Card>

            {/* Add information card for first-time users */}
            <Card className="border-gray-200 bg-white dark:bg-black dark:border-gray-700">
              <CardContent className="p-5">
                <div className="flex flex-col gap-3">
                  <h3 className="text-lg font-medium text-black dark:text-white">
                    Welcome to Travel Planner!
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Create your first trip by clicking the "New Trip" card.
                  </p>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 list-disc pl-5 mt-2 space-y-1">
                    <li>Plan your itinerary by day</li>
                    <li>Invite collaborators</li>
                    <li>Track locations and activities</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredTrips.map((trip) => (
              <Card
                key={trip.id}
                className={cn(
                  "border-gray-200 bg-white dark:border-gray-700 dark:bg-black hover:border-gray-300 dark:hover:border-gray-600 group relative",
                  !("isNew" in trip) && "cursor-pointer"
                )}
                onClick={() => !("isNew" in trip) && handleCardClick(trip.id)}
              >
                <CardContent className="p-4">
                  {"isNew" in trip ? (
                    <div
                      className="flex h-full flex-col items-center justify-center py-8 cursor-pointer"
                      onClick={() => setIsNewTripModalOpen(true)}
                    >
                      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-gray-300 text-black dark:border-gray-600 dark:text-white">
                        <Plus className="h-8 w-8" />
                      </div>
                      <h3 className="text-lg font-medium text-black dark:text-white">
                        New Trip
                      </h3>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <img
                            src={trip.image || "/placeholder.svg"}
                            alt={trip.title}
                            className="h-12 w-12 rounded-md object-cover"
                          />
                          <div>
                            <h3 className="text-lg font-medium text-black dark:text-white">
                              {trip.title}
                            </h3>
                            <div className="h-1 w-16 bg-gray-300 dark:bg-gray-600 mt-1"></div>
                          </div>
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {trip.days.length} days
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {trip.startDate} - {trip.endDate}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {trip.location}
                      </div>
                      <div className="h-1 w-full bg-gray-200 dark:bg-gray-700"></div>
                      <div className="flex items-center justify-between mb-0">
                        <div className="flex items-center">
                          <div className="flex -space-x-2.5">
                            {trip.collaborators
                              ?.slice(0, 5)
                              .map((collaborator) => (
                                <Avatar
                                  key={collaborator.id}
                                  className={`h-6 w-6 border border-white dark:border-black ${collaborator.color}`}
                                >
                                  <AvatarFallback className="text-xs">
                                    {collaborator.name.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                              ))}
                          </div>
                          {trip.collaborators &&
                            trip.collaborators.length > 5 && (
                              <span className="text-sm text-gray-600 dark:text-gray-400 ml-3">
                                +{trip.collaborators.length - 5}
                              </span>
                            )}
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {!trip.isCollaborative ? (
                                <>
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEditTrip(e, trip.id);
                                    }}
                                    className="cursor-pointer"
                                  >
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Manage Trip Info
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setTripToDelete(trip.id);
                                    }}
                                    className="cursor-pointer text-red-600 focus:text-red-600"
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete Trip
                                  </DropdownMenuItem>
                                </>
                              ) : (
                                <DropdownMenuItem className="cursor-not-allowed opacity-50">
                                  <Pencil className="mr-2 h-4 w-4" />
                                  View Only
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                      {trip.isCollaborative && trip.owner && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 italic">
                          Shared by {trip.owner.name}
                        </div>
                      )}
                      {user &&
                        !trip.isCollaborative &&
                        trip.collaborators.length > 0 &&
                        trip.collaborators[0].id === user.id && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 italic">
                            Created by you
                          </div>
                        )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* New Trip Modal */}
      <NewTripModal
        open={isNewTripModalOpen}
        onOpenChange={handleModalOpenChange}
        tripToEdit={tripToEdit}
      />

      {/* Delete Trip Confirmation Dialog */}
      <AlertDialog
        open={!!tripToDelete}
        onOpenChange={() => setTripToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure you want to delete this trip?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              trip and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTrip}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

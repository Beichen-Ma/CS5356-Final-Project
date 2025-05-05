"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search } from "lucide-react";
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

export default function Dashboard() {
  const router = useRouter();
  const { trips } = useTrips();
  const [filter, setFilter] = useState("all");
  const [createdByMe, setCreatedByMe] = useState(false);
  const [newTripModalOpen, setNewTripModalOpen] = useState(false);

  // Mock current user ID
  const currentUserId = "1"; // Alex

  const tripsArray = [
    {
      id: "new",
      title: "New Trip",
      isNew: true,
    },
    ...Object.values(trips),
  ];

  // Filter trips based on "Created by me" checkbox
  const filteredTrips = tripsArray.filter((trip) => {
    if ("isNew" in trip) return true;
    if (createdByMe)
      return trip.collaborators.some(
        (c) => c.id === currentUserId && c.id === "1"
      ); // Assuming creator is first collaborator

    // Apply "Created by me" filter if selected
    if (createdByMe && !trip.collaborators.some((c) => c.id === currentUserId))
      return false;
    // Apply date filters for Past/Ongoing
    if (filter !== "all") {
      // Parse the end date from the trip
      const endDateParts = trip.endDate?.split(", ");
      if (endDateParts?.length === 2) {
        const [monthDay, year] = endDateParts;
        const [month, day] = monthDay.split(" ");

        // Create Date objects for comparison
        const months = {
          January: 0,
          February: 1,
          March: 2,
          April: 3,
          May: 4,
          June: 5,
          July: 6,
          August: 7,
          September: 8,
          October: 9,
          November: 10,
          December: 11,
        };

        const tripEndDate = new Date(
          parseInt(year),
          months[month as keyof typeof months],
          parseInt(day)
        );
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Set to beginning of today

        // Filter based on date comparison
        if (filter === "past" && tripEndDate >= today) return false;
        if (filter === "ongoing" && tripEndDate < today) return false;
      }
    }

    return true;
  });

  // Navigate to trip overview page
  const navigateToTrip = (tripId: string) => {
    router.push(`/trip-overview?id=${tripId}`);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white">
      {/* Navigation Bar */}
      <header className="border-b border-gray-200 px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center">
            <div className="mr-10 text-xl font-bold text-black dark:text-white">
              <span className="flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6"
                >
                  <path d="M12 2a10 10 0 1 0 10 10H12V2Z" />
                  <path d="M12 2a10 10 0 0 1 10 10" />
                  <path d="M12 12h10" />
                </svg>
                TripPlanner
              </span>
            </div>
          </div>
          <Tabs defaultValue="trips" className="w-[400px]">
            <TabsList className="grid w-full grid-cols-3 bg-transparent dark:bg-transparent">
              <TabsTrigger
                value="explore"
                className="data-[state=active]:bg-transparent data-[state=active]:text-black dark:data-[state=active]:text-white data-[state=active]:shadow-none"
              >
                Explore
              </TabsTrigger>
              <TabsTrigger
                value="trips"
                className="data-[state=active]:bg-transparent data-[state=active]:text-black dark:data-[state=active]:text-white data-[state=active]:shadow-none"
              >
                Trips
              </TabsTrigger>
              <TabsTrigger
                value="database"
                className="data-[state=active]:bg-transparent data-[state=active]:text-black dark:data-[state=active]:text-white data-[state=active]:shadow-none"
              >
                Database
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="flex items-center">
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

        {/* Trip Cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTrips.map((trip) => (
            <Card
              key={trip.id}
              className={cn(
                "border-gray-200 bg-white dark:border-gray-700 dark:bg-black hover:border-gray-300 dark:hover:border-gray-600",
                !("isNew" in trip) && "cursor-pointer"
              )}
              onClick={() => !("isNew" in trip) && navigateToTrip(trip.id)}
            >
              <CardContent className="p-4">
                {"isNew" in trip ? (
                  <div
                    className="flex h-full flex-col items-center justify-center py-8 cursor-pointer"
                    onClick={() => setNewTripModalOpen(true)}
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
                    <div className="h-1 w-full bg-gray-200 dark:bg-gray-700"></div>
                    <div className="flex items-center justify-end mb-0">
                      <div className="flex -space-x-2.5">
                        {trip.collaborators?.slice(0, 5).map((collaborator) => (
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
                      {trip.collaborators && trip.collaborators.length > 5 && (
                        <span className="text-sm text-gray-600 dark:text-gray-400 ml-3">
                          +{trip.collaborators.length - 5}
                        </span>
                      )}
                    </div>
                    {trip.collaborators.some((c) => c.id === currentUserId) && (
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
      </main>

      {/* New Trip Modal */}
      <NewTripModal
        open={newTripModalOpen}
        onOpenChange={setNewTripModalOpen}
      />
    </div>
  );
}

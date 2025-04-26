"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { v4 as uuidv4 } from "uuid";
import type { DateRange } from "react-day-picker";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DateRangePicker } from "@/components/date-range-picker";
import { CollaboratorSelector } from "@/components/collaborator-selector";

// type Collaborator = {
//   id: string;
//   name: string;
//   email: string;
//   color: string;
// };
import { useTrips, type Collaborator, type Trip } from "@/context/trip-context";

interface NewTripModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewTripModal({ open, onOpenChange }: NewTripModalProps) {
  const router = useRouter();
  const { addTrip } = useTrips();
  const [tripName, setTripName] = React.useState("");
  const [location, setLocation] = React.useState("");
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>();
  const [selectedCollaborators, setSelectedCollaborators] = React.useState<
    Collaborator[]
  >([]);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!tripName || !dateRange?.from || !dateRange?.to || !location) {
      return;
    }

    setIsSubmitting(true);

    // Generate a unique ID for the new trip
    const tripId = uuidv4();

    // Format dates
    const startDate = format(dateRange.from, "MMMM d, yyyy");
    const endDate = format(dateRange.to, "MMMM d, yyyy");

    // Calculate number of days
    const days =
      Math.round(
        (dateRange.to.getTime() - dateRange.from.getTime()) /
          (1000 * 60 * 60 * 24)
      ) + 1;

    // Create days array
    const daysArray = Array.from({ length: days }, (_, i) => {
      const date = new Date(dateRange.from!);
      date.setDate(date.getDate() + i);
      return {
        id: `day${i + 1}`,
        date: format(date, "MMM d"),
        title: `Day ${i + 1}`,
        number: `${i + 1}`,
      };
    });

    // Create activities object
    const activities = daysArray.reduce((acc, day) => {
      acc[day.id] = [];
      return acc;
    }, {} as Record<string, any>);

    // Create new trip object
    const newTrip: Trip = {
      id: tripId,
      title: tripName,
      startDate,
      endDate,
      location,
      collaborators: [
        { id: "1", name: "Alex", color: "bg-green-500" }, // Current user
        ...selectedCollaborators,
      ],
      days: daysArray,
      activities,
      image: "/placeholder.svg?height=80&width=80",
    };

    // Add the new trip to the context
    addTrip(newTrip);

    // Reset form and close modal
    setTripName("");
    setLocation("");
    setDateRange(undefined);
    setSelectedCollaborators([]);
    setIsSubmitting(false);
    onOpenChange(false);

    // Navigate to the trip overview page
    router.push(`/trip-overview?id=${tripId}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-white dark:bg-black border-gray-200 dark:border-gray-700">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-xl text-black dark:text-white">
              Create New Trip
            </DialogTitle>
            <DialogDescription>
              Fill in the details below to create your new trip. Click create
              when you're done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="tripName" className="text-sm">
                Trip Name
              </Label>
              <Input
                id="tripName"
                placeholder="Enter trip name"
                value={tripName}
                onChange={(e) => setTripName(e.target.value)}
                className="border-gray-200 bg-transparent focus-visible:ring-gray-300 dark:border-gray-700 dark:focus-visible:ring-gray-600"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="location" className="text-sm">
                Location
              </Label>
              <Input
                id="location"
                placeholder="Enter location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="border-gray-200 bg-transparent focus-visible:ring-gray-300 dark:border-gray-700 dark:focus-visible:ring-gray-600"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="date" className="text-sm">
                Trip Dates
              </Label>
              <DateRangePicker
                dateRange={dateRange}
                onDateRangeChange={setDateRange}
              />
            </div>
            <div className="grid gap-2">
              <Label className="text-sm">Invite Collaborators</Label>
              <CollaboratorSelector
                selectedCollaborators={selectedCollaborators}
                onCollaboratorsChange={setSelectedCollaborators}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-gray-200 bg-transparent hover:bg-gray-100 hover:text-black dark:border-gray-700 dark:hover:bg-gray-800 dark:hover:text-white"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                !tripName ||
                !location ||
                !dateRange?.from ||
                !dateRange?.to ||
                isSubmitting
              }
              className="bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
            >
              {isSubmitting ? "Creating..." : "Create Trip"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

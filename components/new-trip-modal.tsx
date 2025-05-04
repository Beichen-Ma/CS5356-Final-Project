"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { v4 as uuidv4 } from "uuid";
import type { DateRange } from "react-day-picker";
import { Image, Upload } from "lucide-react";

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
import { Switch } from "@/components/ui/switch";

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
  const [coverImage, setCoverImage] = React.useState<string>(
    "/placeholder.svg?height=80&width=80"
  );
  const [isFlexible, setIsFlexible] = React.useState(false);
  const [numberOfDays, setNumberOfDays] = React.useState<number>(1);
  const [datesConfirmed, setDatesConfirmed] = React.useState(false);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleCoverImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setCoverImage(imageUrl);
    }
  };

  const handleConfirmDates = () => {
    setDatesConfirmed(true);
  };

  const handleResetDates = () => {
    setDatesConfirmed(false);
    setDateRange(undefined);
    setNumberOfDays(1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!tripName || !location) {
      return;
    }

    if (!isFlexible && (!dateRange?.from || !dateRange?.to)) {
      return;
    }

    setIsSubmitting(true);

    // Generate a unique ID for the new trip
    const tripId = uuidv4();

    let startDate, endDate, daysArray, days;

    if (isFlexible) {
      // Flexible mode: just use number of days
      startDate = "Flexible";
      endDate = `${numberOfDays} days`;
      days = numberOfDays;

      daysArray = Array.from({ length: days }, (_, i) => {
        return {
          id: `day${i + 1}`,
          date: `Day ${i + 1}`,
          title: `Day ${i + 1}`,
          number: `${i + 1}`,
        };
      });
    } else {
      // Fixed dates mode - we know dateRange.from and dateRange.to exist here
      const fromDate = dateRange!.from!;
      const toDate = dateRange!.to!;

      startDate = format(fromDate, "MMMM d, yyyy");
      endDate = format(toDate, "MMMM d, yyyy");

      // Calculate number of days
      days =
        Math.round(
          (toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24)
        ) + 1;

      // Create days array
      daysArray = Array.from({ length: days }, (_, i) => {
        const date = new Date(fromDate);
        date.setDate(date.getDate() + i);
        return {
          id: `day${i + 1}`,
          date: format(date, "MMM d"),
          title: `Day ${i + 1}`,
          number: `${i + 1}`,
        };
      });
    }

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
      image: coverImage,
    };

    // Add the new trip to the context
    addTrip(newTrip);

    // Reset form and close modal
    setTripName("");
    setLocation("");
    setDateRange(undefined);
    setSelectedCollaborators([]);
    setCoverImage("/placeholder.svg?height=80&width=80");
    setIsFlexible(false);
    setNumberOfDays(1);
    setDatesConfirmed(false);
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

          {/* Cover Image Upload */}
          <div className="mt-4 flex justify-center">
            <div
              className="relative h-32 w-full rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 flex items-center justify-center cursor-pointer overflow-hidden"
              onClick={handleCoverImageClick}
            >
              {coverImage !== "/placeholder.svg?height=80&width=80" ? (
                <img
                  src={coverImage}
                  alt="Trip cover"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="text-center flex flex-col items-center">
                  <Upload className="h-8 w-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Upload Cover Photo
                  </span>
                </div>
              )}
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />
            </div>
          </div>

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
              <div className="flex justify-between items-center">
                <Label htmlFor="date" className="text-sm">
                  Trip Dates
                </Label>
                <div className="flex items-center gap-2">
                  <Label htmlFor="flexible" className="text-sm">
                    Flexible
                  </Label>
                  <Switch
                    id="flexible"
                    checked={isFlexible}
                    onCheckedChange={setIsFlexible}
                    disabled={datesConfirmed}
                  />
                </div>
              </div>

              {datesConfirmed ? (
                <div className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800 rounded-md">
                  <span className="text-sm">
                    {isFlexible
                      ? `${numberOfDays} days (flexible)`
                      : dateRange?.from && dateRange?.to
                      ? `${format(dateRange.from, "MMM d, yyyy")} - ${format(
                          dateRange.to,
                          "MMM d, yyyy"
                        )}`
                      : ""}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleResetDates}
                    className="text-xs border-gray-200 bg-transparent hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
                  >
                    Change
                  </Button>
                </div>
              ) : (
                <>
                  {isFlexible ? (
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min="1"
                        max="30"
                        value={numberOfDays}
                        onChange={(e) =>
                          setNumberOfDays(parseInt(e.target.value) || 1)
                        }
                        className="border-gray-200 bg-transparent focus-visible:ring-gray-300 dark:border-gray-700 dark:focus-visible:ring-gray-600"
                      />
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        days
                      </span>
                      <Button
                        type="button"
                        size="sm"
                        onClick={handleConfirmDates}
                        className="ml-2 bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
                      >
                        Confirm
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <DateRangePicker
                        dateRange={dateRange}
                        onDateRangeChange={setDateRange}
                      />
                      {dateRange?.from && dateRange?.to && (
                        <Button
                          type="button"
                          size="sm"
                          onClick={handleConfirmDates}
                          className="w-full bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
                        >
                          Confirm Dates
                        </Button>
                      )}
                    </div>
                  )}
                </>
              )}
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
                (!isFlexible && (!dateRange?.from || !dateRange?.to)) ||
                (isFlexible && numberOfDays < 1) ||
                !datesConfirmed ||
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

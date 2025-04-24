"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
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

type Collaborator = {
  id: string;
  name: string;
  email: string;
  color: string;
};

interface NewTripModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewTripModal({ open, onOpenChange }: NewTripModalProps) {
  const router = useRouter();
  const [tripName, setTripName] = React.useState("");
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>();
  const [selectedCollaborators, setSelectedCollaborators] = React.useState<
    Collaborator[]
  >([]);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!tripName || !dateRange?.from || !dateRange?.to) {
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      onOpenChange(false);

      // Reset form
      setTripName("");
      setDateRange(undefined);
      setSelectedCollaborators([]);

      // Redirect to trip overview page
      router.push("/trip-overview");
    }, 1000);
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
                !tripName || !dateRange?.from || !dateRange?.to || isSubmitting
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

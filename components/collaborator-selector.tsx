"use client";

import * as React from "react";
import { Check, ChevronsUpDown, X, PlusCircle } from "lucide-react";

import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useTrips, type Collaborator } from "@/context/trip-context";
import { v4 as uuidv4 } from "uuid";
import { Input } from "@/components/ui/input";

interface CollaboratorSelectorProps {
  selectedCollaborators: Collaborator[];
  onCollaboratorsChange: (collaborators: Collaborator[]) => void;
}

// Sample collaborator data - in a real app, this would come from an API
const sampleCollaborators: Collaborator[] = [
  {
    id: "1",
    name: "Alex Johnson",
    email: "alex@example.com",
    color: "bg-green-500",
  },
  {
    id: "2",
    name: "Sam Wilson",
    email: "sam@example.com",
    color: "bg-blue-500",
  },
  {
    id: "3",
    name: "Taylor Smith",
    email: "taylor@example.com",
    color: "bg-purple-500",
  },
  {
    id: "4",
    name: "Jordan Lee",
    email: "jordan@example.com",
    color: "bg-yellow-500",
  },
  {
    id: "5",
    name: "Casey Brown",
    email: "casey@example.com",
    color: "bg-pink-500",
  },
  {
    id: "6",
    name: "Riley Garcia",
    email: "riley@example.com",
    color: "bg-indigo-500",
  },
  {
    id: "7",
    name: "Morgan Davis",
    email: "morgan@example.com",
    color: "bg-red-500",
  },
  {
    id: "8",
    name: "Jamie Miller",
    email: "jamie@example.com",
    color: "bg-orange-500",
  },
  {
    id: "9",
    name: "Quinn Wilson",
    email: "quinn@example.com",
    color: "bg-teal-500",
  },
];

export function CollaboratorSelector({
  selectedCollaborators,
  onCollaboratorsChange,
}: CollaboratorSelectorProps) {
  const [open, setOpen] = React.useState(false);
  const [emailInput, setEmailInput] = React.useState("");
  const [error, setError] = React.useState("");

  const handleSelect = (collaborator: Collaborator) => {
    if (selectedCollaborators.some((c) => c.id === collaborator.id)) {
      onCollaboratorsChange(
        selectedCollaborators.filter((c) => c.id !== collaborator.id)
      );
    } else {
      onCollaboratorsChange([...selectedCollaborators, collaborator]);
    }
  };

  const removeCollaborator = (collaborator: Collaborator) => {
    onCollaboratorsChange(
      selectedCollaborators.filter((c) => c.id !== collaborator.id)
    );
  };

  const handleAddByEmail = () => {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailInput)) {
      setError("Please enter a valid email address");
      return;
    }

    // Check if already added
    if (selectedCollaborators.some((c) => c.email === emailInput)) {
      setError("This email is already added");
      return;
    }

    // Generate random color for the avatar
    const colors = [
      "bg-blue-500",
      "bg-green-500",
      "bg-purple-500",
      "bg-yellow-500",
      "bg-pink-500",
      "bg-indigo-500",
      "bg-red-500",
    ];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    // Create a new collaborator with the email
    const newCollaborator: Collaborator = {
      id: uuidv4(),
      name: emailInput.split("@")[0], // Use first part of email as name
      email: emailInput,
      color: randomColor,
    };

    // Add to selected collaborators
    onCollaboratorsChange([...selectedCollaborators, newCollaborator]);

    // Reset input and error
    setEmailInput("");
    setError("");
  };

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between border-gray-200 bg-transparent hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
          >
            <span className="text-sm font-normal">
              {selectedCollaborators.length > 0
                ? `${selectedCollaborators.length} collaborator${
                    selectedCollaborators.length > 1 ? "s" : ""
                  } selected`
                : "Add collaborators"}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder="Search people..." />
            <CommandList>
              <CommandEmpty>No person found.</CommandEmpty>
              <CommandGroup>
                {sampleCollaborators.map((collaborator) => (
                  <CommandItem
                    key={collaborator.id}
                    value={collaborator.name}
                    onSelect={() => handleSelect(collaborator)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedCollaborators.some(
                          (c) => c.id === collaborator.id
                        )
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                    <div className="flex items-center gap-2">
                      <Avatar className={`h-6 w-6 ${collaborator.color}`}>
                        <AvatarFallback className="text-xs">
                          {collaborator.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm">{collaborator.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {collaborator.email}
                        </p>
                      </div>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
            <div className="border-t border-gray-200 p-2 dark:border-gray-700">
              <p className="px-2 py-1 text-xs text-gray-500 dark:text-gray-400">
                Or add by email
              </p>
              <div className="flex items-center gap-2 px-2 py-1">
                <Input
                  type="email"
                  placeholder="collaborator@example.com"
                  value={emailInput}
                  onChange={(e) => {
                    setEmailInput(e.target.value);
                    setError("");
                  }}
                  className="h-8 text-sm"
                />
                <Button
                  onClick={handleAddByEmail}
                  size="sm"
                  className="shrink-0"
                >
                  <PlusCircle className="mr-1 h-4 w-4" />
                  Add
                </Button>
              </div>
              {error && (
                <p className="mt-1 px-2 text-xs text-red-500">{error}</p>
              )}
            </div>
          </Command>
        </PopoverContent>
      </Popover>

      {selectedCollaborators.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-2">
          {selectedCollaborators.map((collaborator) => (
            <Badge
              key={collaborator.id}
              variant="outline"
              className="flex items-center gap-1 border-gray-200 bg-gray-100 text-sm dark:border-gray-700 dark:bg-gray-800"
            >
              <Avatar className={`mr-1 h-4 w-4 ${collaborator.color}`}>
                <AvatarFallback className="text-[10px]">
                  {collaborator.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              {collaborator.email || collaborator.name}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 text-muted-foreground hover:bg-transparent hover:text-foreground"
                onClick={() => removeCollaborator(collaborator)}
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Remove {collaborator.name}</span>
              </Button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

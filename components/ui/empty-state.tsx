import React from "react";
import { Button } from "./button";
import { Plus } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
  showCreateButton?: boolean;
  onCreateClick?: () => void;
}

export function EmptyState({
  title,
  description,
  showCreateButton = false,
  onCreateClick,
}: EmptyStateProps) {
  return (
    <div className="text-center py-12">
      <h3 className="text-xl font-semibold mb-4">{title}</h3>
      <p className="text-gray-600 mb-6">{description}</p>
      {showCreateButton && (
        <Button onClick={onCreateClick}>
          <Plus className="h-4 w-4 mr-2" />
          Create Trip
        </Button>
      )}
    </div>
  );
}

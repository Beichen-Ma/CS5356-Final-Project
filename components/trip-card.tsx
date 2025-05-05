import React from "react";
import { CalendarRange, MapPin } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface Collaborator {
  id: string;
  name: string;
  color?: string;
  email?: string;
}

interface TripCardProps {
  id: string;
  title: string;
  location: string;
  startDate: string;
  endDate: string;
  image?: string;
  days: any[];
  collaborators: Collaborator[];
  onClick: (id: string) => void;
}

export function TripCard({
  id,
  title,
  location,
  startDate,
  endDate,
  image,
  days,
  collaborators,
  onClick,
}: TripCardProps) {
  return (
    <Card
      className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow duration-200 border border-gray-200"
      onClick={() => onClick(id)}
    >
      <div className="h-32 bg-gray-100 relative">
        {image ? (
          <img src={image} alt={title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <MapPin className="h-8 w-8 text-gray-400" />
          </div>
        )}
      </div>
      <CardContent className="p-4">
        <h3 className="text-md font-semibold truncate text-gray-900">
          {title}
        </h3>
        <div className="flex items-center text-gray-500 mt-1">
          <MapPin className="h-3.5 w-3.5 mr-1" />
          <span className="text-xs truncate">{location}</span>
        </div>
        <div className="flex items-center text-gray-500 mt-1">
          <CalendarRange className="h-3.5 w-3.5 mr-1" />
          <span className="text-xs">
            {startDate} - {endDate}
          </span>
        </div>
      </CardContent>
      <CardFooter className="border-t border-gray-200 py-2 px-4 bg-gray-50">
        <div className="flex items-center justify-between w-full">
          <div className="flex -space-x-2">
            {collaborators.slice(0, 3).map((collaborator) => (
              <Avatar
                key={collaborator.id}
                className="border-2 border-white h-6 w-6"
              >
                <AvatarFallback className="text-xs bg-blue-500 text-white">
                  {collaborator.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
            ))}
            {collaborators.length > 3 && (
              <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center text-xs border-2 border-white">
                +{collaborators.length - 3}
              </div>
            )}
          </div>
          <span className="text-xs text-gray-500">{days.length} days</span>
        </div>
      </CardFooter>
    </Card>
  );
}

"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]/route";

export type TripFormData = {
  title: string;
  startDate: string;
  endDate: string;
  location: string;
  image?: string;
  days: {
    date: string;
    title: string;
    number: string;
  }[];
  collaborators: {
    id: string;
    name: string;
    color: string;
  }[];
};

export async function getTrips() {
  try {
    // Get the current session to determine the user
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      // Return an empty array if no authenticated user
      return [];
    }

    const userId = session.user.id;

    const trips = await prisma.trip.findMany({
      where: { userId },
      include: {
        days: {
          include: {
            activities: true,
          },
        },
        collaborators: {
          include: {
            collaborator: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Transform the data structure to match the expected format in the client
    return trips.map((trip: any) => ({
      id: trip.id,
      title: trip.title,
      startDate: trip.startDate,
      endDate: trip.endDate,
      location: trip.location,
      image: trip.image || "/placeholder.svg?height=80&width=80",
      collaborators: trip.collaborators.map((c: any) => ({
        id: c.collaborator.id,
        name: c.collaborator.name,
        color: c.collaborator.color,
        email: c.collaborator.email || undefined,
      })),
      days: trip.days.map((day: any) => ({
        id: day.id,
        date: day.date,
        title: day.title,
        number: day.number,
      })),
      activities: trip.days.reduce((acc: any, day: any) => {
        acc[day.id] = day.activities.map((activity: any) => ({
          id: activity.id,
          time: activity.time || "",
          title: activity.title,
          description: activity.description || "",
          location: activity.location || "",
          category: activity.category,
          position: activity.position
            ? JSON.parse(activity.position)
            : undefined,
          website: activity.website || undefined,
          phoneNumber: activity.phoneNumber || undefined,
          image: activity.image || undefined,
        }));
        return acc;
      }, {} as Record<string, any>),
    }));
  } catch (error) {
    console.error("Error fetching trips:", error);
    throw new Error("Failed to fetch trips");
  }
}

export async function getTrip(id: string) {
  try {
    // Get the current session to determine the user
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return null;
    }

    const userId = session.user.id;

    const trip = await prisma.trip.findFirst({
      where: {
        id,
        userId, // Only fetch the trip if it belongs to the current user
      },
      include: {
        days: {
          include: {
            activities: true,
          },
        },
        collaborators: {
          include: {
            collaborator: true,
          },
        },
      },
    });

    if (!trip) {
      return null;
    }

    // Transform to client format
    return {
      id: trip.id,
      title: trip.title,
      startDate: trip.startDate,
      endDate: trip.endDate,
      location: trip.location,
      image: trip.image || "/placeholder.svg?height=80&width=80",
      collaborators: trip.collaborators.map((c: any) => ({
        id: c.collaborator.id,
        name: c.collaborator.name,
        color: c.collaborator.color,
        email: c.collaborator.email || undefined,
      })),
      days: trip.days.map((day: any) => ({
        id: day.id,
        date: day.date,
        title: day.title,
        number: day.number,
      })),
      activities: trip.days.reduce((acc: any, day: any) => {
        acc[day.id] = day.activities.map((activity: any) => ({
          id: activity.id,
          time: activity.time || "",
          title: activity.title,
          description: activity.description || "",
          location: activity.location || "",
          category: activity.category,
          position: activity.position
            ? JSON.parse(activity.position)
            : undefined,
          website: activity.website || undefined,
          phoneNumber: activity.phoneNumber || undefined,
          image: activity.image || undefined,
        }));
        return acc;
      }, {} as Record<string, any>),
    };
  } catch (error) {
    console.error("Error fetching trip:", error);
    throw new Error("Failed to fetch trip");
  }
}

export async function createTrip(data: TripFormData) {
  try {
    // Get the current session to determine the user
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      throw new Error("Authentication required");
    }

    const userId = session.user.id;

    // Store existing or create new collaborators
    const collaboratorIds = await Promise.all(
      data.collaborators.map(async (collaborator) => {
        // Check if collaborator already exists
        let existingCollaborator = await prisma.collaborator.findUnique({
          where: { id: collaborator.id },
        });

        // If not, create a new one
        if (!existingCollaborator) {
          existingCollaborator = await prisma.collaborator.create({
            data: {
              id: collaborator.id,
              name: collaborator.name,
              color: collaborator.color,
            },
          });
        }

        return existingCollaborator.id;
      })
    );

    // Create the trip with nested relations and associate with user
    const trip = await prisma.trip.create({
      data: {
        title: data.title,
        startDate: data.startDate,
        endDate: data.endDate,
        location: data.location,
        image: data.image,
        userId, // Associate trip with user
        days: {
          create: data.days.map((day) => ({
            date: day.date,
            title: day.title,
            number: day.number,
          })),
        },
        collaborators: {
          create: collaboratorIds.map((id) => ({
            collaboratorId: id,
          })),
        },
      },
      include: {
        days: true,
      },
    });

    revalidatePath("/");
    revalidatePath("/trip-overview");

    return trip;
  } catch (error) {
    console.error("Error creating trip:", error);
    throw new Error("Failed to create trip");
  }
}

export async function updateTrip(id: string, data: Partial<TripFormData>) {
  try {
    // Get the current session to determine the user
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      throw new Error("Authentication required");
    }

    const userId = session.user.id;

    // Make sure the trip belongs to the current user
    const trip = await prisma.trip.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!trip) {
      throw new Error(
        "Trip not found or you don't have permission to modify it"
      );
    }

    const updatedTrip = await prisma.trip.update({
      where: { id },
      data: {
        title: data.title,
        startDate: data.startDate,
        endDate: data.endDate,
        location: data.location,
        image: data.image,
      },
    });

    revalidatePath("/");
    revalidatePath(`/trip-overview?id=${id}`);

    return updatedTrip;
  } catch (error) {
    console.error("Error updating trip:", error);
    throw new Error("Failed to update trip");
  }
}

export async function deleteTrip(id: string) {
  try {
    // Get the current session to determine the user
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      throw new Error("Authentication required");
    }

    const userId = session.user.id;

    // Make sure the trip belongs to the current user
    const trip = await prisma.trip.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!trip) {
      throw new Error(
        "Trip not found or you don't have permission to delete it"
      );
    }

    await prisma.trip.delete({
      where: { id },
    });

    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("Error deleting trip:", error);
    throw new Error("Failed to delete trip");
  }
}

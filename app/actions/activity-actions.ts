"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export type ActivityFormData = {
  time?: string;
  title: string;
  description?: string;
  location?: string;
  category: string;
  position?: { lat: number; lng: number };
  website?: string;
  phoneNumber?: string;
  image?: string;
};

export async function getActivities(dayId: string) {
  try {
    const activities = await prisma.activity.findMany({
      where: { dayId },
      orderBy: { id: "asc" },
    });

    return activities.map((activity: any) => ({
      id: activity.id,
      time: activity.time || "",
      title: activity.title,
      description: activity.description || "",
      location: activity.location || "",
      category: activity.category,
      position: activity.position ? JSON.parse(activity.position) : undefined,
      website: activity.website || undefined,
      phoneNumber: activity.phoneNumber || undefined,
      image: activity.image || undefined,
    }));
  } catch (error) {
    console.error("Error fetching activities:", error);
    throw new Error("Failed to fetch activities");
  }
}

export async function createActivity(dayId: string, data: ActivityFormData) {
  try {
    const activity = await prisma.activity.create({
      data: {
        time: data.time || "",
        title: data.title,
        description: data.description || "",
        location: data.location || "",
        category: data.category,
        position: data.position ? JSON.stringify(data.position) : null,
        website: data.website,
        phoneNumber: data.phoneNumber,
        image: data.image,
        dayId,
      },
    });

    // Find the trip id to revalidate the correct path
    const day = await prisma.day.findUnique({
      where: { id: dayId },
      select: { tripId: true },
    });

    if (day) {
      revalidatePath(`/trip-overview?id=${day.tripId}`);
    }

    return activity;
  } catch (error) {
    console.error("Error creating activity:", error);
    throw new Error("Failed to create activity");
  }
}

export async function updateActivity(
  id: number,
  data: Partial<ActivityFormData>
) {
  try {
    const activity = await prisma.activity.update({
      where: { id },
      data: {
        time: data.time,
        title: data.title,
        description: data.description,
        location: data.location,
        category: data.category,
        position: data.position ? JSON.stringify(data.position) : undefined,
        website: data.website,
        phoneNumber: data.phoneNumber,
        image: data.image,
      },
      include: {
        day: {
          select: {
            tripId: true,
          },
        },
      },
    });

    if (activity.day) {
      revalidatePath(`/trip-overview?id=${activity.day.tripId}`);
    }

    return activity;
  } catch (error) {
    console.error("Error updating activity:", error);
    throw new Error("Failed to update activity");
  }
}

export async function deleteActivity(id: number) {
  try {
    // Get the trip ID before deleting for path revalidation
    const activity = await prisma.activity.findUnique({
      where: { id },
      include: {
        day: {
          select: {
            tripId: true,
          },
        },
      },
    });

    const tripId = activity?.day?.tripId;

    await prisma.activity.delete({
      where: { id },
    });

    if (tripId) {
      revalidatePath(`/trip-overview?id=${tripId}`);
    }

    return { success: true };
  } catch (error) {
    console.error("Error deleting activity:", error);
    throw new Error("Failed to delete activity");
  }
}

export async function reorderActivities(dayId: string, activityIds: number[]) {
  try {
    // We don't have a direct order field in our schema, so we'll handle ordering on the client side
    // This function is mainly for verification and to trigger revalidation

    // Get the day to find trip id
    const day = await prisma.day.findUnique({
      where: { id: dayId },
      select: { tripId: true },
    });

    if (day) {
      revalidatePath(`/trip-overview?id=${day.tripId}`);
    }

    return { success: true, orderedIds: activityIds };
  } catch (error) {
    console.error("Error reordering activities:", error);
    throw new Error("Failed to reorder activities");
  }
}

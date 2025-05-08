"use server";

import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";
import { revalidatePath } from "next/cache";

export type UserFormData = {
  name: string;
  email: string;
  password: string;
};

export async function registerUser(data: UserFormData) {
  try {
    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      return { success: false, message: "Email already in use" };
    }

    // Hash the password
    const hashedPassword = await hash(data.password, 10);

    // Create the user
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
      },
    });

    return {
      success: true,
      message: "User registered successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    };
  } catch (error) {
    console.error("Error registering user:", error);
    return { success: false, message: "Failed to register user" };
  }
}

export async function getUserTrips(userId: string) {
  try {
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
      activities: trip.days.reduce((acc: Record<string, any>, day: any) => {
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
    console.error("Error fetching user trips:", error);
    throw new Error("Failed to fetch user trips");
  }
}

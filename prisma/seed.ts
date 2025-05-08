import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Clean database
  await prisma.collaboratorOnTrip.deleteMany();
  await prisma.activity.deleteMany();
  await prisma.day.deleteMany();
  await prisma.trip.deleteMany();
  await prisma.collaborator.deleteMany();
  await prisma.user.deleteMany();

  // Create test user
  const hashedPassword = await hash("password123", 10);
  const testUser = await prisma.user.create({
    data: {
      id: "test-user-1",
      name: "Test User",
      email: "user@example.com",
      password: hashedPassword,
    },
  });

  console.log(`Created test user: ${testUser.email}`);

  // Create collaborators
  const alex = await prisma.collaborator.create({
    data: {
      id: "1",
      name: "Alex",
      color: "bg-green-500",
    },
  });

  const sam = await prisma.collaborator.create({
    data: {
      id: "2",
      name: "Sam",
      color: "bg-blue-500",
    },
  });

  const taylor = await prisma.collaborator.create({
    data: {
      id: "3",
      name: "Taylor",
      color: "bg-purple-500",
    },
  });

  const jordan = await prisma.collaborator.create({
    data: {
      id: "4",
      name: "Jordan",
      color: "bg-yellow-500",
    },
  });

  const casey = await prisma.collaborator.create({
    data: {
      id: "5",
      name: "Casey",
      color: "bg-pink-500",
    },
  });

  // Create NYC Trip
  const nycTrip = await prisma.trip.create({
    data: {
      id: "nyc",
      title: "NYC Trip",
      startDate: "May 1, 2023",
      endDate: "May 5, 2023",
      location: "NYC",
      image: "/placeholder.svg?height=80&width=80",
      userId: testUser.id, // Associate with test user
      collaborators: {
        create: [
          { collaboratorId: alex.id },
          { collaboratorId: sam.id },
          { collaboratorId: taylor.id },
          { collaboratorId: jordan.id },
          { collaboratorId: casey.id },
        ],
      },
    },
  });

  // Create NYC Trip days
  const nycDays = await Promise.all(
    Array.from({ length: 5 }, (_, i) => {
      return prisma.day.create({
        data: {
          id: `day${i + 1}`,
          date: `May ${i + 1}`,
          title: `Day ${i + 1}`,
          number: `${i + 1}`,
          tripId: nycTrip.id,
        },
      });
    })
  );

  // Create activities for NYC day 1
  await Promise.all([
    prisma.activity.create({
      data: {
        id: 1,
        time: "09:00 AM",
        title: "Breakfast at Coastal Cafe",
        description:
          "Start your day with a delicious breakfast at this local favorite.",
        location: "123 Beach Drive",
        category: "Food",
        dayId: nycDays[0].id,
      },
    }),
    prisma.activity.create({
      data: {
        id: 2,
        time: "11:00 AM",
        title: "City Museum Tour",
        description:
          "Explore the city's rich history through interactive exhibits.",
        location: "456 History Lane",
        category: "Culture",
        dayId: nycDays[0].id,
      },
    }),
    prisma.activity.create({
      data: {
        id: 3,
        time: "02:00 PM",
        title: "Lunch at Urban Bistro",
        description:
          "Enjoy a relaxing lunch with local cuisine and great views.",
        location: "789 Downtown Ave",
        category: "Food",
        dayId: nycDays[0].id,
      },
    }),
  ]);

  // Create activity for NYC day 2
  await prisma.activity.create({
    data: {
      id: 6,
      time: "10:00 AM",
      title: "Hiking at National Park",
      description: "Enjoy a moderate hike with stunning views of the valley.",
      location: "National Park Trail #5",
      category: "Nature",
      dayId: nycDays[1].id,
    },
  });

  console.log(`Database has been seeded.`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

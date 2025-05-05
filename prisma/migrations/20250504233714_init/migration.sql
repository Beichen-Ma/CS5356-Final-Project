-- CreateTable
CREATE TABLE "Trip" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "startDate" TEXT NOT NULL,
    "endDate" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "image" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Day" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    CONSTRAINT "Day_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Activity" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "time" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "location" TEXT,
    "category" TEXT NOT NULL,
    "position" TEXT,
    "website" TEXT,
    "phoneNumber" TEXT,
    "image" TEXT,
    "dayId" TEXT NOT NULL,
    CONSTRAINT "Activity_dayId_fkey" FOREIGN KEY ("dayId") REFERENCES "Day" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Collaborator" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "color" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "CollaboratorOnTrip" (
    "collaboratorId" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,

    PRIMARY KEY ("collaboratorId", "tripId"),
    CONSTRAINT "CollaboratorOnTrip_collaboratorId_fkey" FOREIGN KEY ("collaboratorId") REFERENCES "Collaborator" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CollaboratorOnTrip_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

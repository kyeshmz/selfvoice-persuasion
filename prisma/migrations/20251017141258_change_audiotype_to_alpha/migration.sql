-- AlterTable: Change audioType column to alpha
PRAGMA foreign_keys=off;

-- Create new Rating table with alpha
CREATE TABLE "Rating_new" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "experimentId" TEXT NOT NULL,
    "alpha" REAL NOT NULL,
    "naturalness" INTEGER NOT NULL,
    "persuasiveness" INTEGER NOT NULL,
    "trustworthiness" INTEGER NOT NULL,
    "preference" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Rating_experimentId_fkey" FOREIGN KEY ("experimentId") REFERENCES "Experiment" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Drop old Rating table
DROP TABLE IF EXISTS "Rating";

-- Rename new table
ALTER TABLE "Rating_new" RENAME TO "Rating";

PRAGMA foreign_keys=on;

/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Demographics` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Demographics` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Demographics" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "participantId" TEXT NOT NULL,
    "age" TEXT NOT NULL,
    "firstLanguage" TEXT NOT NULL,
    "gender" TEXT,
    "aiUse" TEXT,
    "country" TEXT,
    CONSTRAINT "Demographics_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "Participant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Demographics" ("age", "aiUse", "country", "firstLanguage", "gender", "id", "participantId") SELECT "age", "aiUse", "country", "firstLanguage", "gender", "id", "participantId" FROM "Demographics";
DROP TABLE "Demographics";
ALTER TABLE "new_Demographics" RENAME TO "Demographics";
CREATE UNIQUE INDEX "Demographics_participantId_key" ON "Demographics"("participantId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

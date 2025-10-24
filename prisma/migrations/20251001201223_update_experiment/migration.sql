/*
  Warnings:

  - You are about to drop the column `sessionId` on the `Experiment` table. All the data in the column will be lost.
  - You are about to drop the column `studyId` on the `Experiment` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Participant" ADD COLUMN "voiceId" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Experiment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "voiceEmbeddings" JSONB,
    "participantId" TEXT NOT NULL,
    "completedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Experiment_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "Participant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Experiment" ("completedAt", "createdAt", "id", "participantId") SELECT "completedAt", "createdAt", "id", "participantId" FROM "Experiment";
DROP TABLE "Experiment";
ALTER TABLE "new_Experiment" RENAME TO "Experiment";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

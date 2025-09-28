/*
  Warnings:

  - You are about to drop the column `audioCheckPassed` on the `Participant` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Participant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "externalId" TEXT NOT NULL,
    "consentGiven" BOOLEAN NOT NULL DEFAULT false,
    "demographics" JSONB,
    "audioFile" TEXT,
    "eligible" BOOLEAN NOT NULL DEFAULT true,
    "ineligibilityReason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Participant" ("audioFile", "consentGiven", "createdAt", "demographics", "eligible", "externalId", "id") SELECT "audioFile", "consentGiven", "createdAt", "demographics", "eligible", "externalId", "id" FROM "Participant";
DROP TABLE "Participant";
ALTER TABLE "new_Participant" RENAME TO "Participant";
CREATE UNIQUE INDEX "Participant_externalId_key" ON "Participant"("externalId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

/*
  Warnings:

  - You are about to drop the column `demographics` on the `Participant` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Participant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "externalId" TEXT NOT NULL,
    "consentGiven" BOOLEAN NOT NULL DEFAULT false,
    "audioFile" TEXT,
    "eligible" BOOLEAN NOT NULL DEFAULT true,
    "ineligibilityReason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "voiceId" TEXT
);
INSERT INTO "new_Participant" ("audioFile", "consentGiven", "createdAt", "eligible", "externalId", "id", "ineligibilityReason", "voiceId") SELECT "audioFile", "consentGiven", "createdAt", "eligible", "externalId", "id", "ineligibilityReason", "voiceId" FROM "Participant";
DROP TABLE "Participant";
ALTER TABLE "new_Participant" RENAME TO "Participant";
CREATE UNIQUE INDEX "Participant_externalId_key" ON "Participant"("externalId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

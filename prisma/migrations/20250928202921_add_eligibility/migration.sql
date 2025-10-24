-- AlterTable
ALTER TABLE "Experiment" ADD COLUMN "completedAt" DATETIME;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Participant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "externalId" TEXT NOT NULL,
    "consentGiven" BOOLEAN NOT NULL DEFAULT false,
    "demographics" JSONB,
    "audioFile" TEXT,
    "audioCheckPassed" BOOLEAN,
    "eligible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Participant" ("audioCheckPassed", "audioFile", "consentGiven", "createdAt", "demographics", "externalId", "id") SELECT "audioCheckPassed", "audioFile", "consentGiven", "createdAt", "demographics", "externalId", "id" FROM "Participant";
DROP TABLE "Participant";
ALTER TABLE "new_Participant" RENAME TO "Participant";
CREATE UNIQUE INDEX "Participant_externalId_key" ON "Participant"("externalId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateTable
CREATE TABLE "Rating" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "experimentId" TEXT NOT NULL,
    "audioType" TEXT NOT NULL,
    "naturalness" INTEGER NOT NULL,
    "persuasiveness" INTEGER NOT NULL,
    "trustworthiness" INTEGER NOT NULL,
    "preference" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Rating_experimentId_fkey" FOREIGN KEY ("experimentId") REFERENCES "Experiment" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Drop the ratings JSON column from Experiment
PRAGMA foreign_keys=off;
CREATE TABLE "Experiment_new" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "participantId" TEXT NOT NULL,
    "voiceEmbeddings" TEXT,
    "experimentFile" TEXT,
    "completedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Experiment_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "Participant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "Experiment_new" ("id", "participantId", "voiceEmbeddings", "experimentFile", "completedAt", "createdAt")
SELECT "id", "participantId", "voiceEmbeddings", "experimentFile", "completedAt", "createdAt" FROM "Experiment";
DROP TABLE "Experiment";
ALTER TABLE "Experiment_new" RENAME TO "Experiment";
PRAGMA foreign_keys=on;

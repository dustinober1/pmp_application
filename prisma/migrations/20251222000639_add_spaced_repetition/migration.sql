-- CreateTable
CREATE TABLE "daily_goals" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "flashcardGoal" INTEGER NOT NULL DEFAULT 20,
    "questionsGoal" INTEGER NOT NULL DEFAULT 25,
    "cardsReviewedToday" INTEGER NOT NULL DEFAULT 0,
    "questionsAnsweredToday" INTEGER NOT NULL DEFAULT 0,
    "lastResetDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "daily_goals_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_flash_card_reviews" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "flashCardId" TEXT NOT NULL,
    "reviewedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "difficulty" TEXT NOT NULL DEFAULT 'GOOD',
    "easeFactor" REAL NOT NULL DEFAULT 2.5,
    "interval" INTEGER NOT NULL DEFAULT 1,
    "lapses" INTEGER NOT NULL DEFAULT 0,
    "nextReviewAt" DATETIME NOT NULL,
    "reviewCount" INTEGER NOT NULL DEFAULT 1,
    CONSTRAINT "flash_card_reviews_flashCardId_fkey" FOREIGN KEY ("flashCardId") REFERENCES "flashcards" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "flash_card_reviews_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_flash_card_reviews" ("difficulty", "flashCardId", "id", "nextReviewAt", "reviewCount", "reviewedAt", "userId") SELECT "difficulty", "flashCardId", "id", "nextReviewAt", "reviewCount", "reviewedAt", "userId" FROM "flash_card_reviews";
DROP TABLE "flash_card_reviews";
ALTER TABLE "new_flash_card_reviews" RENAME TO "flash_card_reviews";
CREATE UNIQUE INDEX "flash_card_reviews_userId_flashCardId_key" ON "flash_card_reviews"("userId", "flashCardId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "daily_goals_userId_key" ON "daily_goals"("userId");

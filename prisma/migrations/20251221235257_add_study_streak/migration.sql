-- CreateTable
CREATE TABLE "study_streaks" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "currentStreak" INTEGER NOT NULL DEFAULT 0,
    "longestStreak" INTEGER NOT NULL DEFAULT 0,
    "lastStudyDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "totalStudyDays" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "study_streaks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_user_answers" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "selectedAnswerIndex" INTEGER NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    "answeredAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "timeSpentSeconds" INTEGER NOT NULL,
    CONSTRAINT "user_answers_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "questions" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "user_answers_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "user_test_sessions" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_user_answers" ("answeredAt", "id", "isCorrect", "questionId", "selectedAnswerIndex", "sessionId", "timeSpentSeconds") SELECT "answeredAt", "id", "isCorrect", "questionId", "selectedAnswerIndex", "sessionId", "timeSpentSeconds" FROM "user_answers";
DROP TABLE "user_answers";
ALTER TABLE "new_user_answers" RENAME TO "user_answers";
CREATE UNIQUE INDEX "user_answers_sessionId_questionId_key" ON "user_answers"("sessionId", "questionId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "study_streaks_userId_key" ON "study_streaks"("userId");

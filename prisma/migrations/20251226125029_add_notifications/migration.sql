-- DropForeignKey
ALTER TABLE "study_streaks" DROP CONSTRAINT "study_streaks_userId_fkey";

-- AddForeignKey
ALTER TABLE "study_streaks" ADD CONSTRAINT "study_streaks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

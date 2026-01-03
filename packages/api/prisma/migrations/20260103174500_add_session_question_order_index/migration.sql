-- Add orderIndex field to PracticeSessionQuestion table for consistent pagination
-- This enables efficient lazy loading of questions in batches

ALTER TABLE "practice_session_questions" ADD COLUMN "orderIndex" INTEGER;

-- Create index for efficient pagination queries
CREATE INDEX "idx_practice_session_questions_session_order" 
ON "practice_session_questions" ("sessionId", "orderIndex");

-- Populate orderIndex for existing records based on createdAt order
WITH ordered_questions AS (
  SELECT 
    id,
    ROW_NUMBER() OVER (PARTITION BY "sessionId" ORDER BY "answeredAt" ASC, id ASC) as rn
  FROM "practice_session_questions"
)
UPDATE "practice_session_questions" psq
SET "orderIndex" = oq.rn
FROM ordered_questions oq
WHERE psq.id = oq.id;

-- Set NOT NULL constraint after populating existing data
ALTER TABLE "practice_session_questions" ALTER COLUMN "orderIndex" SET NOT NULL;

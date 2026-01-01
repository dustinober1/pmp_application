-- CreateTable
CREATE TABLE "ebook_chapters" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "orderIndex" INTEGER NOT NULL,
    "isPremium" BOOLEAN NOT NULL DEFAULT false,
    "minTier" TEXT NOT NULL DEFAULT 'free',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ebook_chapters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ebook_sections" (
    "id" TEXT NOT NULL,
    "chapterId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL,
    "prevSection" TEXT,
    "nextSection" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ebook_sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_ebook_progress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "lastChapterId" TEXT,
    "lastSectionId" TEXT,
    "completedSections" TEXT[] NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_ebook_progress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ebook_chapters_slug_key" ON "ebook_chapters"("slug");

-- CreateIndex
CREATE INDEX "ebook_chapters_orderIndex_idx" ON "ebook_chapters"("orderIndex");

-- CreateIndex
CREATE INDEX "ebook_chapters_isPremium_idx" ON "ebook_chapters"("isPremium");

-- CreateIndex
CREATE UNIQUE INDEX "ebook_sections_chapterId_slug_key" ON "ebook_sections"("chapterId", "slug");

-- CreateIndex
CREATE INDEX "ebook_sections_chapterId_orderIndex_idx" ON "ebook_sections"("chapterId", "orderIndex");

-- CreateIndex
CREATE UNIQUE INDEX "user_ebook_progress_userId_key" ON "user_ebook_progress"("userId");

-- AddForeignKey
ALTER TABLE "ebook_sections" ADD CONSTRAINT "ebook_sections_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "ebook_chapters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_ebook_progress" ADD CONSTRAINT "user_ebook_progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

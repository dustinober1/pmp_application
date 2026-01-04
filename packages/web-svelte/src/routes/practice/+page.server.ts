import type { Load } from "@sveltejs/kit";
import { getPracticeStats, getDomains, type PracticeStats, type Domain } from "$lib/utils/practiceData";

interface PracticePageStats extends PracticeStats {
  totalSessions: number;
  bestScore: number;
  weakDomains: string[];
}

export const load: Load = async () => {
  try {
    const [testbankStats, domains] = await Promise.all([
      getPracticeStats(),
      getDomains(),
    ]);

    // Create stats object with testbank data plus default user progress values
    // User-specific stats (sessions, bestScore, weakDomains) would typically come from user progress storage
    const stats: PracticePageStats = {
      ...testbankStats,
      totalSessions: 0,
      bestScore: 0,
      weakDomains: [],
    };

    // Mock exams are not currently implemented - return empty array
    const mockExams: any[] = [];

    return {
      stats,
      domains,
      mockExams,
      error: null,
    };
  } catch (error) {
    console.error("Failed to load practice data:", error);
    return {
      stats: null,
      domains: [],
      mockExams: [],
      error:
        error instanceof Error ? error.message : "Failed to load practice data",
    };
  }
};

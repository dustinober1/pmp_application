import type { Load } from "@sveltejs/kit";
import { contentApi } from "$lib/utils/api";

export const load: Load = async ({ params }) => {
  const taskId = params.taskId;

  try {
    // Fetch all tasks to find the specific one
    const tasksResponse = await contentApi.getTasks("all");
    const task =
      tasksResponse.data?.tasks?.find((t) => t.id === taskId) || null;

    // Fetch study guide
    let studyGuide = null;
    try {
      const guideResponse = await contentApi.getStudyGuide(taskId);
      studyGuide = guideResponse.data?.studyGuide || null;
    } catch (err) {
      console.warn("Study guide not found:", err);
    }

    return {
      task,
      studyGuide,
      error: null,
    };
  } catch (error) {
    console.error("Failed to load study guide:", error);
    return {
      task: null,
      studyGuide: null,
      error:
        error instanceof Error ? error.message : "Failed to load study guide",
    };
  }
};

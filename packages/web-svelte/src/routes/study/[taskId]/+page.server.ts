import type { Load } from "@sveltejs/kit";
import { getTaskById, getStudyGuide } from "$lib/utils/studyData";

export const load: Load = async ({ params }) => {
  const taskId = params.taskId;

  try {
    // Fetch the specific task
    const task = await getTaskById(taskId);

    // Fetch study guide
    let studyGuide = null;
    try {
      studyGuide = await getStudyGuide(taskId);
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

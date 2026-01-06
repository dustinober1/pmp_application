import { error } from "@sveltejs/kit";
import { getModule, getModuleContent } from "$lib/utils/moduleLoader";

export async function load({ params }) {
  const { moduleId } = params;
  const module = await getModule(moduleId);

  if (!module) {
    throw error(404, "Module not found");
  }

  const content = await getModuleContent(moduleId, "index");
  if (!content) {
    throw error(404, "Module content not found");
  }

  return {
    module,
    content,
    sectionId: "index",
  };
}

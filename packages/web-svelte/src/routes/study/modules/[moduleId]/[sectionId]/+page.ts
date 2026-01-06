import { error } from "@sveltejs/kit";
import { getModule, getModuleContent } from "$lib/utils/moduleLoader";

export async function load({ params }) {
  const { moduleId, sectionId } = params;
  const module = await getModule(moduleId);

  if (!module) {
    throw error(404, "Module not found");
  }

  const content = await getModuleContent(moduleId, sectionId);
  if (!content) {
    throw error(404, "Section content not found");
  }

  const currentSection = module.sections.find((s) => s.id === sectionId);

  return {
    module,
    content,
    sectionId,
    title: currentSection?.title || sectionId,
  };
}

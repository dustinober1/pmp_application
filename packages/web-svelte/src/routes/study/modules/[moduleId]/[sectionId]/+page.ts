import { error } from "@sveltejs/kit";
import { getModules, getModule, getModuleContent } from "$lib/utils/moduleLoader";
import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ params }) => {
  const { moduleId, sectionId } = params;
  const modules = await getModules();
  const moduleIndex = modules.findIndex((m) => m.id === moduleId);
  const module = modules[moduleIndex];

  if (!module) {
    throw error(404, "Module not found");
  }

  const content = await getModuleContent(moduleId, sectionId);
  if (!content) {
    throw error(404, "Section content not found");
  }

  const sectionIndex = module.sections.findIndex((s) => s.id === sectionId);
  const currentSection = module.sections[sectionIndex];

  // Calculate previous section
  let prevSection = null;
  if (sectionIndex > 0) {
    prevSection = {
      moduleId: module.id,
      sectionId: module.sections[sectionIndex - 1].id,
      title: module.sections[sectionIndex - 1].title,
    };
  } else if (moduleIndex > 0) {
    const prevModule = modules[moduleIndex - 1];
    const lastSection = prevModule.sections[prevModule.sections.length - 1];
    prevSection = {
      moduleId: prevModule.id,
      sectionId: lastSection.id,
      title: lastSection.title,
    };
  }

  // Calculate next section
  let nextSection = null;
  if (sectionIndex < module.sections.length - 1) {
    nextSection = {
      moduleId: module.id,
      sectionId: module.sections[sectionIndex + 1].id,
      title: module.sections[sectionIndex + 1].title,
    };
  } else if (moduleIndex < modules.length - 1) {
    const nextModule = modules[moduleIndex + 1];
    const firstSection = nextModule.sections[0];
    nextSection = {
      moduleId: nextModule.id,
      sectionId: firstSection.id,
      title: firstSection.title,
    };
  }

  return {
    module,
    content,
    sectionId,
    title: currentSection?.title || sectionId,
    prevSection,
    nextSection,
  };
}

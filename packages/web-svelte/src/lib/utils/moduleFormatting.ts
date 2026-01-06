export function getModuleNumber(moduleId: string): string | null {
  const match = moduleId.match(/^(\d+)/);
  if (!match) return null;
  return match[1].padStart(2, "0");
}

export function getModuleShortTitle(moduleTitle: string): string {
  const match = moduleTitle.match(/^Module\s*\d+\s*:\s*(.+)$/i);
  return (match?.[1] ?? moduleTitle).trim();
}

export function getModuleBreadcrumbLabel(moduleId: string, moduleTitle: string): string {
  const moduleNumber = getModuleNumber(moduleId);
  const shortTitle = getModuleShortTitle(moduleTitle);
  return moduleNumber ? `Module ${moduleNumber}: ${shortTitle}` : moduleTitle;
}


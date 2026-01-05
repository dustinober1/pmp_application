import { getModules } from '$lib/utils/moduleLoader';
import { loadDomains } from '$lib/utils/studyData';

export const prerender = true;

export async function load() {
    try {
        const [domains, modules] = await Promise.all([
            loadDomains(),
            getModules()
        ]);

        return {
            domains,
            modules,
            error: null
        };
    } catch (err) {
        console.error('Failed to load study data:', err);
        return {
            domains: [],
            modules: [],
            error: err instanceof Error ? err.message : 'Failed to load study content'
        };
    }
}

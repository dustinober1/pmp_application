<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import Card from './ui/Card.svelte';

    interface Props {
        title: string;
        link: string;
        linkText: string;
        children?: import('svelte').Snippet;
    }

    let { title, link, linkText, children }: Props = $props();

    // Resolve relative link against the module path
    const resolvedLink = $derived(link.startsWith('.') 
        ? `${base}/study/modules/${$page.params.moduleId}/${link.substring(2)}`
        : link);
</script>

<Card variant="default" class="p-8 flex flex-col group">
    <h4 class="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3 font-serif group-hover:text-primary transition-colors">{title}</h4>
    <div class="text-base text-gray-600 dark:text-gray-400 mb-6 flex-grow leading-relaxed">
        {@render children?.()}
    </div>
    <div class="mt-auto">
        <a href={resolvedLink} class="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary text-primary hover:text-white font-semibold text-sm rounded-full transition-all duration-300">
            {linkText}
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
        </a>
    </div>
</Card>

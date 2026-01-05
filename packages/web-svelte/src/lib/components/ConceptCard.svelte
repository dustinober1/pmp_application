<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/stores';

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

<div class="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-100 dark:border-gray-700 p-6 flex flex-col hover:shadow-md transition-shadow">
    <h4 class="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">{title}</h4>
    <div class="text-sm text-gray-600 dark:text-gray-400 mb-4 flex-grow">
        {@render children?.()}
    </div>
    <a href={resolvedLink} class="text-indigo-600 dark:text-indigo-400 font-medium text-sm hover:underline flex items-center gap-1">
        {linkText}
    </a>
</div>

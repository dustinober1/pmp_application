<script lang="ts">
    import { base } from '$app/paths';
    import SanitizedMarkdown from '$lib/components/SanitizedMarkdown.svelte';
    import QuizComponent from '$lib/components/QuizComponent.svelte';
    import ConceptGrid from '$lib/components/ConceptGrid.svelte';
    import ConceptCard from '$lib/components/ConceptCard.svelte';
    import TriangleViz from '$lib/components/TriangleViz.svelte';
    import PowerInterestGrid from '$lib/components/PowerInterestGrid.svelte';

    export let data;

    type Block = 
        | { type: 'markdown'; content: string }
        | { type: 'quiz'; title: string; questions: any[] }
        | { type: 'triangle-viz' }
        | { type: 'power-interest-grid'; htmlContent: any }
        | { type: 'concept-grid'; cards: any[] };

    function parseContent(content: string): Block[] {
        const blocks: Block[] = [];
        let remaining = content;

        // Regular expressions for our components
        const quizRegex = /<QuizComponent\s+title="([^"]+)"\s+:questions="([\s\S]+?)"\s*\/>/;
        const triangleRegex = /<TriangleViz\s*\/>/;
        const powerInterestRegex = /<PowerInterestGrid>([\s\S]+?)<\/PowerInterestGrid>/;
        const conceptGridRegex = /<ConceptGrid>([\s\S]+?)<\/ConceptGrid>/;

        while (remaining.length > 0) {
            // Find the first occurrence of any component
            const matches = [
                { type: 'quiz', match: remaining.match(quizRegex) },
                { type: 'triangle-viz', match: remaining.match(triangleRegex) },
                { type: 'power-interest-grid', match: remaining.match(powerInterestRegex) },
                { type: 'concept-grid', match: remaining.match(conceptGridRegex) }
            ].filter(m => m.match).sort((a, b) => (a.match!.index || 0) - (b.match!.index || 0));

            if (matches.length === 0) {
                blocks.push({ type: 'markdown', content: remaining });
                break;
            }

            const firstMatch = matches[0];
            const matchIndex = firstMatch.match!.index || 0;

            // Add markdown before the component
            if (matchIndex > 0) {
                blocks.push({ type: 'markdown', content: remaining.substring(0, matchIndex) });
            }

            // Process the component
            if (firstMatch.type === 'quiz') {
                const [fullMatch, title, questionsRaw] = firstMatch.match!;
                try {
                    const questions = JSON.parse(questionsRaw.replace(/'/g, '"').replace(/(\w+):/g, '"$1":'));
                    blocks.push({ type: 'quiz', title, questions });
                } catch (e) {
                    console.error('Quiz parse error', e);
                    blocks.push({ type: 'markdown', content: fullMatch });
                }
                remaining = remaining.substring(matchIndex + firstMatch.match![0].length);
            } else if (firstMatch.type === 'triangle-viz') {
                blocks.push({ type: 'triangle-viz' });
                remaining = remaining.substring(matchIndex + firstMatch.match![0].length);
            } else if (firstMatch.type === 'power-interest-grid') {
                const [fullMatch, innerContent] = firstMatch.match!;
                const htmlContent = {
                    manage: innerContent.match(/<template #manage>([\s\S]+?)<\/template>/)?.[1] || '',
                    satisfy: innerContent.match(/<template #satisfy>([\s\S]+?)<\/template>/)?.[1] || '',
                    inform: innerContent.match(/<template #inform>([\s\S]+?)<\/template>/)?.[1] || '',
                    monitor: innerContent.match(/<template #monitor>([\s\S]+?)<\/template>/)?.[1] || ''
                };
                blocks.push({ type: 'power-interest-grid', htmlContent });
                remaining = remaining.substring(matchIndex + fullMatch.length);
            } else if (firstMatch.type === 'concept-grid') {
                const [fullMatch, innerContent] = firstMatch.match!;
                const cards = [];
                const cardRegex = /<ConceptCard\s+title="([^"]+)"\s+link="([^"]+)"\s+linkText="([^"]+)">([\s\S]+?)<\/ConceptCard>/g;
                let cardMatch;
                while ((cardMatch = cardRegex.exec(innerContent)) !== null) {
                    cards.push({
                        title: cardMatch[1],
                        link: cardMatch[2],
                        linkText: cardMatch[3],
                        content: cardMatch[4].trim()
                    });
                }
                blocks.push({ type: 'concept-grid', cards });
                remaining = remaining.substring(matchIndex + fullMatch.length);
            } else {
                // Should not happen, but for safety
                remaining = remaining.substring(matchIndex + 1);
            }
        }

        return blocks;
    }

    	$: blocks = parseContent(data.content);
    
        // Fix relative links in markdown content
        function fixLinks(content: string) {
            // Replace href="./something" with href="{base}/study/modules/{moduleId}/something"
            return content.replace(/href="\.\/([^"]+)"/g, `href="${base}/study/modules/${data.module.id}/$1"`);
        }
    
        $: processedBlocks = blocks.map(b => b.type === 'markdown' ? { ...b, content: fixLinks(b.content) } : b);
    </script>
    
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
    	<div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
    		<nav class="mb-8 flex items-center gap-4 text-sm">
    			<a href="{base}/study" class="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
    				Study Hub
    			</a>
    			<span class="text-gray-400">/</span>
    			<a href="{base}/study/modules/{data.module.id}" class="text-indigo-600 dark:text-indigo-400 hover:underline">
    				{data.module.title}
    			</a>
                <span class="text-gray-400">/</span>
                <span class="text-gray-600 dark:text-gray-300 truncate">{data.title}</span>
    		</nav>
    
    		<article class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 sm:p-12 border border-gray-100 dark:border-gray-700">
    			{#each processedBlocks as block}
                    {#if block.type === 'markdown'}
                        <SanitizedMarkdown content={block.content} />
                    {:else if block.type === 'quiz'}
                        <QuizComponent title={block.title} questions={block.questions} />
                    {:else if block.type === 'triangle-viz'}
                        <TriangleViz />
                    {:else if block.type === 'power-interest-grid'}
                        <PowerInterestGrid htmlContent={block.htmlContent} />
                    {:else if block.type === 'concept-grid'}
                        <ConceptGrid>
                            {#each block.cards as card}
                                <ConceptCard title={card.title} link={card.link} linkText={card.linkText}>
                                    <p>{card.content}</p>
                                </ConceptCard>
                            {/each}
                        </ConceptGrid>
                    {/if}
                {/each}
    		</article>
            <div class="mt-8 flex justify-between">
            <a href="{base}/study/modules/{data.module.id}" class="text-indigo-600 dark:text-indigo-400 hover:underline font-medium">
                ← Back to Module Overview
            </a>
        </div>
	</div>
</div>
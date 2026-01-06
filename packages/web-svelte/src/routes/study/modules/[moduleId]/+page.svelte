<script lang="ts">
	import { base } from '$app/paths';
	import { onMount } from 'svelte';
	import SanitizedMarkdown from '$lib/components/SanitizedMarkdown.svelte';
	import QuizComponent from '$lib/components/QuizComponent.svelte';
	import ConceptGrid from '$lib/components/ConceptGrid.svelte';
	import ConceptCard from '$lib/components/ConceptCard.svelte';
	import TriangleViz from '$lib/components/TriangleViz.svelte';
	import PowerInterestGrid from '$lib/components/PowerInterestGrid.svelte';
	import { getModuleNumber, getModuleShortTitle } from '$lib/utils/moduleFormatting';
	import { getModule, getModuleContent, type StudyModule } from '$lib/utils/moduleLoader';

	export let data: { moduleId: string };

	let module: StudyModule | null = null;
	let content: string | null = null;
	let loading = true;
	let error: string | null = null;

	type Block = 
		| { type: 'markdown'; content: string }
		| { type: 'quiz'; title: string; questions: any[] }
		| { type: 'triangle-viz' }
		| { type: 'power-interest-grid'; htmlContent: any }
		| { type: 'concept-grid'; cards: any[] };

	function parseContent(rawContent: string): Block[] {
		const blocks: Block[] = [];
		let remaining = rawContent;

		const quizRegex = /<QuizComponent\s+title="([^"]+)"\s+:questions="([\s\S]+?)"\s*\/>/;
		const triangleRegex = /<TriangleViz\s*\/>/;
		const powerInterestRegex = /<PowerInterestGrid>([\s\S]+?)<\/PowerInterestGrid>/;
		const conceptGridRegex = /<ConceptGrid>([\s\S]+?)<\/ConceptGrid>/;

		while (remaining.length > 0) {
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

			if (matchIndex > 0) {
				blocks.push({ type: 'markdown', content: remaining.substring(0, matchIndex) });
			}

			if (firstMatch.type === 'quiz') {
				const [fullMatch, title, questionsRaw] = firstMatch.match!;
				try {
					const questions = JSON.parse(questionsRaw.replace(/'/g, '"').replace(/(\w+):/g, '"$1":'));
					blocks.push({ type: 'quiz', title, questions });
				} catch (e) {
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
				remaining = remaining.substring(matchIndex + 1);
			}
		}

		return blocks;
	}

	// Fix relative links in markdown content for index page
	function fixLinks(rawContent: string, moduleId: string) {
		return rawContent.replace(/href="\.\/([^"]+)"/g, `href="${base}/study/modules/${moduleId}/$1"`);
	}

	onMount(async () => {
		try {
			module = await getModule(data.moduleId);
			if (!module) {
				error = 'Module not found';
				loading = false;
				return;
			}
			content = await getModuleContent(data.moduleId, 'index');
			if (!content) {
				error = 'Module content not found';
			}
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to load module';
		} finally {
			loading = false;
		}
	});

	$: blocks = content ? parseContent(content) : [];
	$: processedBlocks = module ? blocks.map(b => b.type === 'markdown' ? { ...b, content: fixLinks(b.content, module!.id) } : b) : [];
	$: moduleNumber = module ? getModuleNumber(module.id) : '';
	$: moduleShortTitle = module ? getModuleShortTitle(module.title) : '';
</script>

{#if loading}
<div class="min-h-screen bg-stone-50 dark:bg-stone-950 flex items-center justify-center">
	<div class="text-center">
		<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
		<p class="text-stone-600 dark:text-stone-400">Loading module...</p>
	</div>
</div>
{:else if error}
<div class="min-h-screen bg-stone-50 dark:bg-stone-950 flex items-center justify-center">
	<div class="text-center max-w-md mx-auto px-6">
		<h1 class="text-2xl font-bold text-stone-900 dark:text-stone-100 mb-4">Error</h1>
		<p class="text-stone-600 dark:text-stone-400 mb-6">{error}</p>
		<a href="{base}/study" class="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
			Back to Study Hub
		</a>
	</div>
</div>
{:else if module}
<div class="min-h-screen bg-stone-50 dark:bg-stone-950 pb-20">
	<!-- Hero Header Section -->
	<header class="bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 pt-12 pb-16 mb-12">
		<div class="max-w-4xl mx-auto px-6">
			<nav class="mb-8 flex items-center gap-3 text-sm font-medium">
				<a href="{base}/study" class="text-stone-500 hover:text-primary transition-colors flex items-center gap-1">
					<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
						<path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
					</svg>
					Study Hub
				</a>
				<span class="text-stone-300">/</span>
				<span class="text-stone-400">Modules</span>
				<span class="text-stone-300">/</span>
				<span class="text-primary">{moduleNumber ? `Module ${moduleNumber}` : module.title}</span>
			</nav>

			<div class="mb-4">
				<span class="inline-flex items-center px-3 py-1 text-xs font-bold tracking-wide text-primary bg-primary/10 rounded-full">
					{moduleNumber ? `Module ${moduleNumber}` : 'Module'}
				</span>
			</div>
			<h1 class="text-4xl md:text-5xl font-black text-stone-900 dark:text-stone-100 mb-4 font-serif leading-tight">
				{moduleShortTitle}
			</h1>
			<p class="text-xl text-stone-600 dark:text-stone-400 max-w-2xl leading-relaxed">
				{module.description}
			</p>
		</div>
	</header>

	<div class="max-w-4xl mx-auto px-6">
		<article class="prose prose-stone prose-lg dark:prose-invert max-w-none prose-headings:font-serif prose-headings:font-black prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-img:rounded-2xl prose-img:shadow-lg">
			{#each processedBlocks as block}
				{#if block.type === 'markdown'}
					<SanitizedMarkdown content={block.content} />
				{:else if block.type === 'quiz'}
					<div class="my-12">
						<QuizComponent title={block.title} questions={block.questions} />
					</div>
				{:else if block.type === 'triangle-viz'}
					<div class="my-12">
						<TriangleViz />
					</div>
				{:else if block.type === 'power-interest-grid'}
					<div class="my-12">
						<PowerInterestGrid htmlContent={block.htmlContent} />
					</div>
				{:else if block.type === 'concept-grid'}
					<div class="my-12">
						<ConceptGrid>
							{#each block.cards as card}
								<ConceptCard title={card.title} link={card.link} linkText={card.linkText}>
									<p>{card.content}</p>
								</ConceptCard>
							{/each}
						</ConceptGrid>
					</div>
				{/if}
			{/each}
		</article>
	</div>
</div>
{/if}

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
 <a href="{base}/study/modules/{data.module.id}" class="text-stone-500 hover:text-primary transition-colors">
 {data.module.title}
 </a>
 <span class="text-stone-300">/</span>
 <span class="text-primary truncate">{data.title}</span>
 </nav>

 <h1 class="text-4xl md:text-5xl font-black text-stone-900 dark:text-stone-100 mb-4 font-serif leading-tight">
 {data.title}
 </h1>
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

 <footer class="mt-16 pt-8 border-t border-stone-200 dark:border-stone-800 flex justify-between">
 <a href="{base}/study/modules/{data.module.id}" class="inline-flex items-center gap-2 text-stone-500 hover:text-primary font-medium transition-colors">
 <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
 <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
 </svg>
 Back to Module Overview
 </a>
 </footer>
 </div>
</div>
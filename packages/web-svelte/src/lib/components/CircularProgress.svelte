<script lang="ts">
	import { onMount } from 'svelte';

	interface Props {
		percentage: number;
		label: string;
		description?: string;
		size?: number;
		strokeWidth?: number;
		color?: 'blue' | 'purple' | 'emerald' | 'amber';
		animate?: boolean;
		showLabel?: boolean;
	}

	let {
		percentage,
		label,
		description = '',
		size = 120,
		strokeWidth = 8,
		color = 'blue',
		animate = true,
		showLabel = true
	}: Props = $props();

	let currentProgress = $state(0);
	let isVisible = $state(false);

	const radius = (size - strokeWidth) / 2;
	const circumference = 2 * Math.PI * radius;
	const offset = $derived(circumference - (currentProgress / 100) * circumference);

	const colorClasses = {
		blue: {
			stroke: '#3b82f6',
			text: 'text-blue-600 dark:text-blue-400',
			bg: 'from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30'
		},
		purple: {
			stroke: '#8b5cf6',
			text: 'text-purple-600 dark:text-purple-400',
			bg: 'from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30'
		},
		emerald: {
			stroke: '#10b981',
			text: 'text-emerald-600 dark:text-emerald-400',
			bg: 'from-emerald-50 to-emerald-100 dark:from-emerald-900/30 dark:to-emerald-800/30'
		},
		amber: {
			stroke: '#f59e0b',
			text: 'text-amber-600 dark:text-amber-400',
			bg: 'from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/30'
		}
	};

	const selectedColor = $derived(colorClasses[color]);

	onMount(() => {
		isVisible = true;
		if (animate) {
			const duration = 1500;
			const startTime = performance.now();
			const startValue = 0;

			const animateProgress = (currentTime: number) => {
				const elapsed = currentTime - startTime;
				const progress = Math.min(elapsed / duration, 1);
				const easeOutCubic = 1 - Math.pow(1 - progress, 3);
				currentProgress = startValue + (percentage - startValue) * easeOutCubic;

				if (progress < 1) {
					requestAnimationFrame(animateProgress);
				}
			};

			requestAnimationFrame(animateProgress);
		} else {
			currentProgress = percentage;
		}
	});
</script>

<div class="flex flex-col items-center gap-3">
	<div class="relative" style="width: {size}px; height: {size}px;">
		<svg
			class="transform -rotate-90"
			width={size}
			height={size}
			style="filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1));"
		>
			<!-- Background circle -->
			<circle
				cx={size / 2}
				cy={size / 2}
				r={radius}
				fill="none"
				stroke="currentColor"
				stroke-width={strokeWidth}
				class="text-gray-200 dark:text-gray-700"
				stroke-linecap="round"
			/>

			<!-- Progress circle -->
			<circle
				cx={size / 2}
				cy={size / 2}
				r={radius}
				fill="none"
				stroke={selectedColor.stroke}
				stroke-width={strokeWidth}
				stroke-linecap="round"
				stroke-dasharray={circumference}
				stroke-dashoffset={offset}
				class="transition-all duration-300 ease-out"
				style:transition-stroke-dashoffset={animate ? 'stroke-dashoffset 1.5s ease-out' : 'none'}
			/>
		</svg>

		{#if showLabel}
			<div
				class="absolute inset-0 flex flex-col items-center justify-center"
				style="font-size: {size * 0.2}px;"
			>
				<span class="font-bold {selectedColor.text} leading-none">
					{Math.round(currentProgress)}%
				</span>
			</div>
		{/if}
	</div>

	<div class="text-center">
		<h3 class="text-sm font-semibold text-gray-900 dark:text-gray-100">{label}</h3>
		{#if description}
			<p class="text-xs text-gray-600 dark:text-gray-400 mt-0.5">{description}</p>
		{/if}
	</div>
</div>

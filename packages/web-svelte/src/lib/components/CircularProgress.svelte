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
			text: 'text-primary',
			bg: 'from-primary/10 to-primary/20',
			ring: 'text-primary'
		},
		purple: {
			text: 'text-secondary',
			bg: 'from-secondary/10 to-secondary/20',
			ring: 'text-secondary'
		},
		emerald: {
			text: 'text-primary',
			bg: 'from-primary/20 to-primary/30',
			ring: 'text-primary'
		},
		amber: {
			text: 'text-secondary',
			bg: 'from-secondary/20 to-secondary/30',
			ring: 'text-secondary'
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
			style="filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.05));"
		>
			<!-- Background circle -->
			<circle
				cx={size / 2}
				cy={size / 2}
				r={radius}
				fill="none"
				stroke="currentColor"
				stroke-width={strokeWidth}
				class="text-muted/30"
				stroke-linecap="round"
			/>

			<!-- Progress circle -->
			<circle
				cx={size / 2}
				cy={size / 2}
				r={radius}
				fill="none"
				stroke="currentColor"
				stroke-width={strokeWidth}
				stroke-linecap="round"
				stroke-dasharray={circumference}
				stroke-dashoffset={offset}
				class="transition-all duration-300 ease-out {selectedColor.ring}"
				style:transition-stroke-dashoffset={animate ? 'stroke-dashoffset 1.5s ease-out' : 'none'}
			/>
		</svg>

		{#if showLabel}
			<div
				class="absolute inset-0 flex flex-col items-center justify-center"
				style="font-size: {size * 0.2}px;"
			>
				<span class="font-bold font-serif {selectedColor.text} leading-none">
					{Math.round(currentProgress)}%
				</span>
			</div>
		{/if}
	</div>

	<div class="text-center">
		<h3 class="text-sm font-bold font-serif text-foreground">{label}</h3>
		{#if description}
			<p class="text-xs text-muted-foreground mt-0.5">{description}</p>
		{/if}
	</div>
</div>

<script lang="ts">
	import { type Snippet } from 'svelte';

	interface Props {
		variant?: 'default' | 'feature' | 'flat';
		class?: string;
		children?: Snippet;
	}

	let {
		variant = 'default',
		class: className = '',
		children
	}: Props = $props();

	const baseStyles = "relative overflow-hidden transition-all duration-500";
	
	const variants = {
		default: "bg-white/50 backdrop-blur-sm border border-border/50 rounded-3xl shadow-soft hover:shadow-hover hover:-translate-y-1",
		feature: "bg-[#FEFEFA] border border-border/50 rounded-[2rem] shadow-soft hover:shadow-hover hover:-translate-y-1",
		flat: "bg-muted/30 border border-transparent rounded-2xl"
	};

	const classes = $derived(`${baseStyles} ${variants[variant]} ${className}`);
</script>

<div class={classes}>
	<!-- Organic noise/texture overlay for cards -->
	<div class="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-multiply bg-[url('data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E')]"></div>
	
	<div class="relative z-10 h-full">
		{@render children?.()}
	</div>
</div>

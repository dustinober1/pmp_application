<script lang="ts">
	import { type Snippet } from 'svelte';

	interface Props {
		variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
		size?: 'sm' | 'default' | 'lg';
		href?: string;
		type?: 'button' | 'submit' | 'reset';
		disabled?: boolean;
		class?: string;
		onclick?: (event: MouseEvent) => void;
		children?: Snippet;
	}

	let {
		variant = 'primary',
		size = 'default',
		href = undefined,
		type = 'button',
		disabled = false,
		class: className = '',
		onclick,
		children
	}: Props = $props();

	const baseStyles = "inline-flex items-center justify-center rounded-full font-bold transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2";

	const variants = {
		primary: "bg-primary text-primary-foreground shadow-soft hover:shadow-hover hover:scale-105",
		secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-sm hover:scale-105",
		outline: "border-2 border-border text-foreground hover:border-primary hover:text-primary bg-transparent",
		ghost: "text-primary hover:bg-primary/10"
	};

	const sizes = {
		sm: "h-10 px-6 text-sm",
		default: "h-12 px-8 text-base",
		lg: "h-14 px-10 text-lg"
	};

	const classes = $derived(`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`);
</script>

{#if href}
	<a {href} class={classes} {onclick} role="button" tabindex="0">
		{@render children?.()}
	</a>
{:else}
	<button {type} class={classes} {disabled} {onclick}>
		{@render children?.()}
	</button>
{/if}

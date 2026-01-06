<script lang="ts">
	interface Props {
		value?: string | number;
		type?: string;
		placeholder?: string;
		class?: string;
		oninput?: (event: Event) => void;
		onchange?: (event: Event) => void;
	}

	let {
		value = $bindable(''),
		type = 'text',
		placeholder = '',
		class: className = '',
		oninput,
		onchange
	}: Props = $props();
</script>

<input
	{type}
	bind:value
	{placeholder}
	{oninput}
	{onchange}
	class="flex h-12 w-full rounded-full border border-border bg-white/50 px-6 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300 {className}"
/>

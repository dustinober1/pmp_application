<script lang="ts">
	interface Props {
		value?: string | number;
		type?: string;
		placeholder?: string;
		class?: string;
		id?: string;
		label?: string;
		'aria-label'?: string;
		'aria-describedby'?: string;
		required?: boolean;
		oninput?: (event: Event) => void;
		onchange?: (event: Event) => void;
	}

	let {
		value = $bindable(''),
		type = 'text',
		placeholder = '',
		class: className = '',
		id,
		label,
		'aria-label': ariaLabel,
		'aria-describedby': ariaDescribedBy,
		required = false,
		oninput,
		onchange
	}: Props = $props();
</script>

{#if label}
	<label for={id} class="block text-sm font-medium text-foreground mb-2">
		{label}
		{#if required}
			<span class="text-destructive" aria-label="required">*</span>
		{/if}
	</label>
{/if}
<input
	{type}
	{id}
	bind:value
	{placeholder}
	{required}
	aria-label={ariaLabel || (label ? undefined : placeholder)}
	aria-describedby={ariaDescribedBy}
	{oninput}
	{onchange}
	class="flex h-12 w-full rounded-full border border-border bg-white/50 px-6 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300 {className}"
/>

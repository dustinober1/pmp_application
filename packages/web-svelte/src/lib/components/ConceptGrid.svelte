<script lang="ts">
 interface Props {
 children?: import('svelte').Snippet;
 }

 let { children }: Props = $props();
</script>

<div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6 my-8">
 {@render children?.()}
</div>

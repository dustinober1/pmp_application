<script lang="ts">
	import { base } from '$app/paths';
	import '../app.css';
	import Navbar from '$lib/components/Navbar.svelte';
	import Footer from '$lib/components/Footer.svelte';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href="{base}/logo.png" />
</svelte:head>

<div class="min-h-screen flex flex-col">
	<Navbar />
	<main class="flex-1">{@render children()}</main>
	<Footer />
</div>

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
	<!-- Skip to main content link -->
	<a
		href="#main-content"
		class="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-full focus:shadow-lg"
	>
		Skip to main content
	</a>
	<header role="banner">
		<Navbar />
	</header>
	<main id="main-content" class="flex-1" tabindex="-1">{@render children()}</main>
	<Footer />
</div>

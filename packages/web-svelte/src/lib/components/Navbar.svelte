<script lang="ts">
	import { page } from '$app/stores';
	import { locale, t } from '$lib/stores/i18n';
	import { base } from '$app/paths';
	import ECOBadge from '$lib/components/ECOBadge.svelte';

	let mobileMenuOpen = $state(false);
	let darkMode = $state(false);
	let touchStartX = $state(0);
	let touchEndX = $state(0);

	// Check initial dark mode setting
	$effect(() => {
		darkMode = document.documentElement.classList.contains('dark');
	});

	// Helper function to check if a path is active
	function isActive(path: string): boolean {
		if (path === '/') return $page.url.pathname === base || $page.url.pathname === `${base}/`;
		const resolved = `${base}${path}`;
		return $page.url.pathname === resolved || $page.url.pathname.startsWith(`${resolved}/`);
	}

	function toggleDarkMode() {
		darkMode = !darkMode;
		document.documentElement.classList.toggle('dark', darkMode);
	}

	function handleLocaleToggle() {
		locale.toggle();
	}

	// Touch gesture handlers for mobile navigation
	function handleTouchStart(e: TouchEvent) {
		touchStartX = e.changedTouches[0].screenX;
	}

	function handleTouchEnd(e: TouchEvent) {
		touchEndX = e.changedTouches[0].screenX;
		handleSwipe();
	}

	function handleSwipe() {
		const swipeThreshold = 50;
		const diff = touchStartX - touchEndX;

		// Swipe left - close mobile menu
		if (diff > swipeThreshold && mobileMenuOpen) {
			mobileMenuOpen = false;
		}
		// Swipe right - open mobile menu
		else if (diff < -swipeThreshold && !mobileMenuOpen) {
			mobileMenuOpen = true;
		}
	}

	function closeMobileMenu() {
		mobileMenuOpen = false;
	}

	const currentLocale = $locale;
	const nextLocale = currentLocale === 'es' ? 'en' : 'es';
</script>

<nav 
	class="sticky top-4 z-50 mx-4 lg:mx-auto max-w-6xl rounded-full bg-white/70 dark:bg-slate-950/70 backdrop-blur-md border border-border/50 shadow-soft transition-all duration-300"
	ontouchstart={handleTouchStart}
	ontouchend={handleTouchEnd}
>
	<div class="px-4 sm:px-6 lg:px-8">
		<div class="flex justify-between items-center h-16">
			<!-- Logo -->
			<div class="flex items-center">
				<a href="{base}/" class="flex items-center gap-3 group">
					<div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center transition-colors duration-300 group-hover:bg-primary">
						<img
							src="{base}/logo.png"
							alt="PMP Study Pro Logo"
							class="w-6 h-6 object-contain"
							loading="lazy"
						/>
					</div>
					<span class="font-serif font-bold text-lg text-foreground tracking-tight hidden sm:block">PMP Study Pro</span>
				</a>
			</div>

			<!-- Desktop Navigation -->
			<div class="hidden md:flex items-center gap-6">
				{#each ['dashboard', 'study', 'flashcards', 'practice', 'exams', 'formulas'] as item}
					<a
						href="{base}/{item}"
						class="px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 {isActive(`/${item}`)
							? 'bg-primary text-primary-foreground shadow-md'
							: 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}"
					>
						{$t(item.charAt(0).toUpperCase() + item.slice(1))}
					</a>
				{/each}
			</div>

			<!-- User Menu -->
			<div class="flex items-center gap-2">
				<!-- Theme Toggle -->
				<button
					type="button"
					onclick={toggleDarkMode}
					class="w-8 h-8 rounded-full bg-muted/30 flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-all duration-300"
					aria-label={darkMode ? $t('Switch to light mode') : $t('Switch to dark mode')}
				>
					{#if darkMode}
						<svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
							<path d="M10 15a5 5 0 100-10 5 5 0 000 10z" />
						</svg>
					{:else}
						<svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
							<path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
						</svg>
					{/if}
				</button>

				<!-- Language Toggle (Hidden on Mobile) -->
				<button
					type="button"
					onclick={handleLocaleToggle}
					class="hidden sm:flex w-8 h-8 rounded-full bg-muted/30 flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-all duration-300"
					aria-label={`Change language to ${nextLocale}`}
				>
					<span class="text-xs font-bold">{currentLocale.toUpperCase()}</span>
				</button>

				<!-- Mobile Menu Button -->
				<button
					type="button"
					onclick={() => (mobileMenuOpen = !mobileMenuOpen)}
					class="md:hidden w-8 h-8 rounded-full bg-muted/30 flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-all duration-300"
					aria-expanded={mobileMenuOpen}
					aria-controls="mobile-navigation"
					aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
				>
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
						{#if mobileMenuOpen}
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M6 18L18 6M6 6l12 12" />
						{:else}
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M4 6h16M4 12h16M4 18h16" />
						{/if}
					</svg>
				</button>
			</div>
		</div>

		<!-- Mobile Navigation Menu -->
		{#if mobileMenuOpen}
			<div
				id="mobile-navigation"
				class="md:hidden pb-4 space-y-2 animate-in fade-in slide-in-from-top-2 duration-200"
				role="navigation"
				aria-label="Mobile navigation"
			>
				{#each ['dashboard', 'study', 'flashcards', 'practice', 'exams', 'formulas'] as item}
					<a
						href="{base}/{item}"
						onclick={closeMobileMenu}
						class="block px-4 py-2 rounded-lg text-sm font-medium transition-colors {isActive(`/${item}`)
							? 'bg-primary text-primary-foreground'
							: 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}"
					>
						{$t(item.charAt(0).toUpperCase() + item.slice(1))}
					</a>
				{/each}

				<!-- Mobile Language Toggle -->
				<div class="border-t border-border/30 pt-2 mt-2">
					<button
						type="button"
						onclick={() => {
							handleLocaleToggle();
							closeMobileMenu();
						}}
						class="w-full text-left px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
					>
						Language: {currentLocale.toUpperCase()}
					</button>
				</div>
			</div>
		{/if}
	</div>
</nav>

<style>
	/* Smooth animations */
	@media (prefers-reduced-motion: reduce) {
		:global(*) {
			animation-duration: 0.01ms !important;
			animation-iteration-count: 1 !important;
			transition-duration: 0.01ms !important;
		}
	}

	/* Touch-friendly targets */
	button,
	a {
		min-height: 44px;
		min-width: 44px;
	}
</style>

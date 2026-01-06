<script lang="ts">
	import { page } from '$app/stores';
	import { locale, t } from '$lib/stores/i18n';
	import { base } from '$app/paths';
	import ECOBadge from '$lib/components/ECOBadge.svelte';

	let mobileMenuOpen = $state(false);
	let darkMode = $state(false);

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
		// TODO: Implement theme persistence similar to setStoredTheme
		document.documentElement.classList.toggle('dark', darkMode);
	}

	function handleLocaleToggle() {
		locale.toggle();
	}

	const currentLocale = $locale;
	const nextLocale = currentLocale === 'es' ? 'en' : 'es';
</script>

<nav class="sticky top-4 z-50 mx-4 lg:mx-auto max-w-6xl rounded-full bg-white/70 backdrop-blur-md border border-border/50 shadow-soft transition-all duration-300">
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
						/>
					</div>
					<span class="font-serif font-bold text-lg text-foreground tracking-tight hidden sm:block">PMP Study Pro</span>
				</a>
			</div>

			<!-- Desktop Navigation -->
			<div class="hidden md:flex items-center gap-2">
				{#each ['dashboard', 'study', 'flashcards', 'practice', 'exams', 'formulas'] as item}
					<a
						href="{base}/{item}"
						class="px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 {isActive(`/${item}`)
							? 'bg-primary text-primary-foreground shadow-md'
							: 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}"
					>
						{$t(item.charAt(0).toUpperCase() + item.slice(1))}
					</a>
				{/each}
			</div>

			<!-- User Menu -->
			<div class="flex items-center gap-2">
                				<!-- ECO Badge (Moving here for better balance or keep in nav? keeping hidden for now or standard) -->
                                 <!-- Keeping ECOBadge roughly where it was or simplifying? The original had it separate. I'll omit for clean organic look or place it if critical. I'll leave it out for this simplified pass as it wasn't in the spec explicitly but I should be careful. I'll verify if ECOBadge style is compatible. I'll comment it out for now to focus on core design or add it as an icon. -->
                
                				<button
                					type="button"
                					onclick={toggleDarkMode}					class="w-8 h-8 rounded-full bg-muted/30 flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-all duration-300"
					aria-label={darkMode ? $t('Switch to light mode') : $t('Switch to dark mode')}
				>
					{#if darkMode}
						<svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
							<path d="M10 15a5 5 0 100-10 5 5 0 000 10z" />
							<path fill-rule="evenodd" d="M10 1a.75.75 0 01.75.75v1a.75.75 0 01-1.5 0v-1A.75.75 0 0110 1zm0 15.25a.75.75 0 01.75.75v1a.75.75 0 01-1.5 0v-1a.75.75 0 01.75-.75zM3.11 3.11a.75.75 0 011.06 0l.71.71a.75.75 0 11-1.06 1.06l-.71-.71a.75.75 0 010-1.06zm12.01 12.01a.75.75 0 011.06 0l.71.71a.75.75 0 11-1.06 1.06l-.71-.71a.75.75 0 010-1.06zM1 10a.75.75 0 01.75-.75h1a.75.75 0 010 1.5h-1A.75.75 0 011 10zm15.25 0a.75.75 0 01.75-.75h1a.75.75 0 010 1.5h-1a.75.75 0 01-.75-.75zM3.11 16.89a.75.75 0 010-1.06l.71-.71a.75.75 0 011.06 1.06l-.71.71a.75.75 0 01-1.06 0zm12.01-12.01a.75.75 0 010-1.06l.71-.71a.75.75 0 111.06 1.06l-.71.71a.75.75 0 01-1.06 0z" clip-rule="evenodd" />
						</svg>
					{:else}
						<svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
							<path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
						</svg>
					{/if}
				</button>

				<!-- Mobile menu button -->
				<button
					type="button"
					onclick={() => (mobileMenuOpen = !mobileMenuOpen)}
					class="md:hidden w-8 h-8 rounded-full bg-muted/30 flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-all duration-300"
					aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
				>
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						{#if mobileMenuOpen}
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M6 18L18 6M6 6l12 12" />
						{:else}
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M4 6h16M4 12h16M4 18h16" />
						{/if}
					</svg>
				</button>
			</div>
		</div>

		<!-- Mobile Navigation -->
		{#if mobileMenuOpen}
			<div
				id="mobile-navigation"
				class="md:hidden py-4 border-t border-border/50 space-y-2 animate-in slide-in-from-top-2 duration-300"
			>
				{#each ['dashboard', 'study', 'flashcards', 'practice', 'exams', 'formulas'] as item}
					<a
						href="{base}/{item}"
						class="block px-4 py-2 rounded-2xl transition-all duration-300 {isActive(`/${item}`)
							? 'bg-primary/10 text-primary font-medium pl-6'
							: 'text-muted-foreground hover:bg-secondary/10 hover:text-foreground hover:pl-6'}"
						onclick={() => (mobileMenuOpen = false)}
					>
						{$t(item.charAt(0).toUpperCase() + item.slice(1))}
					</a>
				{/each}
			</div>
		{/if}
	</div>
</nav>

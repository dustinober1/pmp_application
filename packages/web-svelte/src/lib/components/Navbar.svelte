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

<nav class="glass border-b border-[var(--border)] sticky top-0 z-50">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="flex justify-between h-16">
			<!-- Logo -->
			<div class="flex items-center">
				<a href="{base}/" class="flex items-center gap-2">
					<div
						class="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--primary)] to-purple-600 flex items-center justify-center"
					>
						<span class="text-white font-bold text-sm" aria-hidden="true">PM</span>
					</div>
					<span class="font-semibold text-lg hidden sm:block">PMP Study Pro</span>
				</a>
			</div>

			<!-- Desktop Navigation -->
			<div class="hidden md:flex items-center gap-4">
				<!-- ECO Badge -->
				<ECOBadge variant="navbar" />
			</div>

			<div class="hidden md:flex items-center gap-6">
				<a
					href="{base}/dashboard"
					class="transition relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-full after:h-0.5 after:bg-[var(--primary)] after:transition-opacity {isActive('/dashboard')
						? 'text-[var(--primary)] after:opacity-100'
						: 'text-[var(--foreground-muted)] hover:text-[var(--foreground)] after:opacity-0'}"
				>
					{$t('Dashboard')}
				</a>
				<a
					href="{base}/study"
					class="transition relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-full after:h-0.5 after:bg-[var(--primary)] after:transition-opacity {isActive('/study')
						? 'text-[var(--primary)] after:opacity-100'
						: 'text-[var(--foreground-muted)] hover:text-[var(--foreground)] after:opacity-0'}"
				>
					{$t('Study')}
				</a>
				<a
					href="{base}/flashcards"
					class="transition relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-full after:h-0.5 after:bg-[var(--primary)] after:transition-opacity {isActive('/flashcards')
						? 'text-[var(--primary)] after:opacity-100'
						: 'text-[var(--foreground-muted)] hover:text-[var(--foreground)] after:opacity-0'}"
				>
					{$t('Flashcards')}
				</a>
				<a
					href="{base}/practice"
					class="transition relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-full after:h-0.5 after:bg-[var(--primary)] after:transition-opacity {isActive('/practice')
						? 'text-[var(--primary)] after:opacity-100'
						: 'text-[var(--foreground-muted)] hover:text-[var(--foreground)] after:opacity-0'}"
				>
					{$t('Practice')}
				</a>
				<a
					href="{base}/formulas"
					class="transition relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-full after:h-0.5 after:bg-[var(--primary)] after:transition-opacity {isActive('/formulas')
						? 'text-[var(--primary)] after:opacity-100'
						: 'text-[var(--foreground-muted)] hover:text-[var(--foreground)] after:opacity-0'}"
				>
					{$t('Formulas')}
				</a>
			</div>

			<!-- User Menu -->
			<div class="flex items-center gap-4">
				<button
					type="button"
					onclick={handleLocaleToggle}
					class="p-2 text-gray-400 hover:text-white transition-colors text-xs font-semibold"
					aria-label="Change language"
					title={nextLocale.toUpperCase()}
				>
					{currentLocale.toUpperCase()}
				</button>

				<button
					type="button"
					onclick={toggleDarkMode}
					class="p-2 text-gray-400 hover:text-white transition-colors"
					aria-label={darkMode ? $t('Switch to light mode') : $t('Switch to dark mode')}
				>
					{#if darkMode}
						<svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
							<path d="M10 15a5 5 0 100-10 5 5 0 000 10z" />
							<path
								fill-rule="evenodd"
								d="M10 1a.75.75 0 01.75.75v1a.75.75 0 01-1.5 0v-1A.75.75 0 0110 1zm0 15.25a.75.75 0 01.75.75v1a.75.75 0 01-1.5 0v-1a.75.75 0 01.75-.75zM3.11 3.11a.75.75 0 011.06 0l.71.71a.75.75 0 11-1.06 1.06l-.71-.71a.75.75 0 010-1.06zm12.01 12.01a.75.75 0 011.06 0l.71.71a.75.75 0 11-1.06 1.06l-.71-.71a.75.75 0 010-1.06zM1 10a.75.75 0 01.75-.75h1a.75.75 0 010 1.5h-1A.75.75 0 011 10zm15.25 0a.75.75 0 01.75-.75h1a.75.75 0 010 1.5h-1a.75.75 0 01-.75-.75zM3.11 16.89a.75.75 0 010-1.06l.71-.71a.75.75 0 011.06 1.06l-.71.71a.75.75 0 01-1.06 0zm12.01-12.01a.75.75 0 010-1.06l.71-.71a.75.75 0 111.06 1.06l-.71.71a.75.75 0 01-1.06 0z"
								clip-rule="evenodd"
							/>
						</svg>
					{:else}
						<svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
							<path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
						</svg>
					{/if}
				</button>

				<!-- Mobile menu button -->
				<button
					type="button"
					onclick={() => (mobileMenuOpen = !mobileMenuOpen)}
					class="md:hidden p-2 text-[var(--foreground-muted)]"
					aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
					aria-expanded={mobileMenuOpen}
					aria-controls="mobile-navigation"
				>
					<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						{#if mobileMenuOpen}
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width={2}
								d="M6 18L18 6M6 6l12 12"
							/>
						{:else}
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width={2}
								d="M4 6h16M4 12h16M4 18h16"
							/>
						{/if}
					</svg>
				</button>
			</div>
		</div>

		<!-- Mobile Navigation -->
		{#if mobileMenuOpen}
			<div
				id="mobile-navigation"
				class="md:hidden py-4 border-t border-[var(--border)]"
				aria-label="Mobile navigation"
			>
				<div class="flex flex-col gap-2">
					<a
						href="{base}/dashboard"
						class="px-4 py-2 rounded-lg transition {isActive('/dashboard')
							? 'bg-[var(--primary)]/20 text-[var(--primary)] font-medium'
							: 'hover:bg-[var(--secondary)]'}"
					>
						{$t('Dashboard')}
					</a>
					<a
						href="{base}/study"
						class="px-4 py-2 rounded-lg transition {isActive('/study')
							? 'bg-[var(--primary)]/20 text-[var(--primary)] font-medium'
							: 'hover:bg-[var(--secondary)]'}"
					>
						{$t('Study')}
					</a>
					<a
						href="{base}/flashcards"
						class="px-4 py-2 rounded-lg transition {isActive('/flashcards')
							? 'bg-[var(--primary)]/20 text-[var(--primary)] font-medium'
							: 'hover:bg-[var(--secondary)]'}"
					>
						{$t('Flashcards')}
					</a>
					<a
						href="{base}/practice"
						class="px-4 py-2 rounded-lg transition {isActive('/practice')
							? 'bg-[var(--primary)]/20 text-[var(--primary)] font-medium'
							: 'hover:bg-[var(--secondary)]'}"
					>
						{$t('Practice')}
					</a>
					<a
						href="{base}/formulas"
						class="px-4 py-2 rounded-lg transition {isActive('/formulas')
							? 'bg-[var(--primary)]/20 text-[var(--primary)] font-medium'
							: 'hover:bg-[var(--secondary)]'}"
					>
						{$t('Formulas')}
					</a>
				</div>
			</div>
		{/if}
	</div>
</nav>

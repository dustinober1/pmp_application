<script lang="ts">
	// Test monorepo integration by importing from shared package
	import type { User, TierName } from '@pmp/shared';

	// Example usage to verify types are available
	const testUser: User = {
		id: 'test-id',
		email: 'test@example.com',
		name: 'Test User',
		emailVerified: true,
		failedLoginAttempts: 0,
		lockedUntil: null,
		tier: 'free' as TierName,
		createdAt: new Date(),
		updatedAt: new Date()
	};
</script>

<div class="min-h-screen bg-md-background text-md-on-background p-8">
	<div class="max-w-4xl mx-auto">
		<h1 class="text-4xl font-bold text-md-primary mb-4">
			Welcome to PMP Study Pro - SvelteKit Edition
		</h1>

		<div class="bg-md-surface-container rounded-lg p-6 shadow-md mb-6">
			<h2 class="text-2xl font-semibold text-md-on-surface mb-3">
				Monorepo Integration Test
			</h2>
			<p class="text-md-on-surface-variant mb-4">
				✅ Successfully imported types from @pmp/shared package
			</p>

			<div class="bg-md-surface-container-low rounded p-4 font-mono text-sm">
				<p class="mb-2"><strong>User Type:</strong></p>
				<pre class="bg-md-surface-container-highest p-2 rounded overflow-x-auto">{JSON.stringify(testUser, null, 2)}</pre>
			</div>
		</div>

		<div class="bg-md-primary-container rounded-lg p-6 text-md-on-primary-container">
			<h3 class="text-xl font-semibold mb-2">Next Steps</h3>
			<ul class="list-disc list-inside space-y-1">
				<li>Authentication pages (login, register)</li>
				<li>Practice sessions interface</li>
				<li>Flashcard system</li>
				<li>Study guides and progress tracking</li>
				<li>Subscription management</li>
			</ul>
		</div>

		<p class="mt-6 text-sm text-md-outline">
			Visit <a href="https://svelte.dev/docs/kit" class="text-md-primary hover:underline">svelte.dev/docs/kit</a>
			to read the SvelteKit documentation
		</p>
	</div>
</div>

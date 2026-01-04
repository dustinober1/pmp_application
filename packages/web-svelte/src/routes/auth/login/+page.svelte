<script lang="ts">
	import { authStore, isLoading } from '$lib/stores/auth';
	import { validateEmail } from '$lib/utils/validation';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

	const REMEMBER_ME_EMAIL_KEY = 'pmp_remember_email';
	const REMEMBER_ME_FLAG_KEY = 'pmp_remember_flag';

	let email = $state('');
	let password = $state('');
	let error = $state('');
	let submitting = $state(false);
	let emailError = $state('');
	let emailTouched = $state(false);
	let rememberMe = $state(false);

	// Load remembered email on mount
	$effect(() => {
		if (typeof window !== 'undefined') {
			try {
				const rememberedEmail = localStorage.getItem(REMEMBER_ME_EMAIL_KEY);
				const rememberFlag = localStorage.getItem(REMEMBER_ME_FLAG_KEY);

				if (rememberedEmail && rememberFlag === 'true') {
					email = rememberedEmail;
					rememberMe = true;
				}
			} catch (err) {
				// Silently fail if localStorage is not accessible
			}
		}
	});

	async function handleSubmit(e: Event) {
		e.preventDefault();
		error = '';

		// Validate email on submit
		if (!validateEmail(email)) {
			emailError = 'Please enter a valid email address';
			return;
		}

		submitting = true;

		try {
			await authStore.login(email, password, rememberMe);

			// Save or clear remembered email based on checkbox
			if (typeof window !== 'undefined') {
				try {
					if (rememberMe) {
						localStorage.setItem(REMEMBER_ME_EMAIL_KEY, email);
						localStorage.setItem(REMEMBER_ME_FLAG_KEY, 'true');
					} else {
						localStorage.removeItem(REMEMBER_ME_EMAIL_KEY);
						localStorage.removeItem(REMEMBER_ME_FLAG_KEY);
					}
				} catch (err) {
					// Silently fail
				}
			}

			const requestedNext = $page.url.searchParams.get('next');
			const next =
				requestedNext && requestedNext.startsWith('/') && !requestedNext.startsWith('//')
					? requestedNext
					: '/dashboard';
			goto(next);
		} catch (err) {
			const message = err instanceof Error ? err.message : 'Login failed';
			error = message;
		} finally {
			submitting = false;
		}
	}

	function handleEmailChange(value: string) {
		email = value;
		if (emailTouched && value && !validateEmail(value)) {
			emailError = 'Please enter a valid email address';
		} else {
			emailError = '';
		}
	}

	function handleEmailBlur() {
		emailTouched = true;
		if (email && !validateEmail(email)) {
			emailError = 'Please enter a valid email address';
		}
	}
</script>

<div class="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden">
	<!-- Organic Blur Shapes -->
	<div class="blur-shape bg-md-primary w-96 h-96 top-0 left-0 -translate-x-1/2 -translate-y-1/2"></div>
	<div class="blur-shape bg-md-tertiary w-96 h-96 bottom-0 right-0 translate-x-1/2 translate-y-1/2"></div>

	<div class="card w-full max-w-md animate-slideUp relative z-10 bg-md-surface-container">
		<div class="text-center mb-8">
			<a href="/" class="inline-flex items-center gap-2 mb-6">
				<div class="w-10 h-10 rounded-full bg-md-primary flex items-center justify-center">
					<span class="text-md-on-primary font-bold" aria-hidden="true">PM</span>
				</div>
			</a>
			<h1 class="text-2xl font-bold text-md-on-surface">Welcome Back</h1>
			<p class="text-md-on-surface-variant mt-2">Sign in to continue your PMP journey</p>
		</div>

		<form onsubmit={handleSubmit} class="space-y-6">
			{#if error}
				<div class="p-3 rounded-lg bg-md-error-container text-md-on-error-container text-sm">
					{error}
				</div>
			{/if}

			<div>
				<label for="email" class="block text-sm font-medium mb-1 text-md-on-surface-variant">
					Email
				</label>
				<input
					id="email"
					type="email"
					bind:value={email}
					oninput={(e) => handleEmailChange(e.currentTarget.value)}
					onblur={handleEmailBlur}
					class="input"
					class:border-md-error={emailError}
					class:focus:border-md-error={emailError}
					class:focus:ring-md-error={emailError}
					placeholder="you@example.com"
					required
					aria-invalid={emailError ? 'true' : 'false'}
					aria-describedby={emailError ? 'email-error' : undefined}
				/>
				{#if emailError}
					<p id="email-error" class="mt-1 text-sm text-md-error" role="alert">
						{emailError}
					</p>
				{/if}
			</div>

			<div>
				<label for="password" class="block text-sm font-medium mb-1 text-md-on-surface-variant">
					Password
				</label>
				<input
					id="password"
					type="password"
					bind:value={password}
					class="input"
					placeholder="••••••••"
					required
				/>
			</div>

			<div class="flex items-center justify-between text-sm">
				<label class="flex items-center gap-2 text-md-on-surface-variant cursor-pointer">
					<input
						type="checkbox"
						bind:checked={rememberMe}
						class="rounded border-md-outline text-md-primary focus:ring-md-primary w-4 h-4"
					/>
					<span>Remember me</span>
				</label>
				<a href="/auth/forgot-password" class="text-md-primary hover:underline">
					Forgot password?
				</a>
			</div>

			<button type="submit" disabled={submitting || $isLoading} class="btn btn-primary w-full">
				{submitting ? 'Signing in...' : 'Sign In'}
			</button>
		</form>

		<p class="text-center text-sm text-md-on-surface-variant mt-6">
			Don't have an account?
			<a href="/auth/register" class="text-md-primary font-medium hover:underline">Sign up for free</a>
		</p>
	</div>
</div>

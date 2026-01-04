<script lang="ts">
	import { authStore, isLoading } from '$lib/stores/auth';
	import { validateEmail } from '$lib/utils/validation';
	import { goto } from '$app/navigation';

	let name = $state('');
	let email = $state('');
	let password = $state('');
	let confirmPassword = $state('');
	let error = $state('');
	let submitting = $state(false);
	let emailError = $state('');
	let emailTouched = $state(false);
	let showPassword = $state(false);
	let termsAccepted = $state(false);
	let termsError = $state('');

	async function handleSubmit(e: Event) {
		e.preventDefault();
		error = '';
		termsError = '';

		// Validate email on submit
		if (!validateEmail(email)) {
			emailError = 'Please enter a valid email address';
			return;
		}

		if (password !== confirmPassword) {
			error = 'Passwords do not match';
			return;
		}

		if (password.length < 8) {
			error = 'Password must be at least 8 characters';
			return;
		}

		// Validate terms acceptance
		if (!termsAccepted) {
			termsError = 'You must accept the Terms of Service and Privacy Policy to continue';
			return;
		}

		submitting = true;

		try {
			await authStore.register(email, password, name);
			goto('/auth/verify-email');
		} catch (err) {
			const message = err instanceof Error ? err.message : 'Registration failed';
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
			<h1 class="text-2xl font-bold text-md-on-surface">Create Your Account</h1>
			<p class="text-md-on-surface-variant mt-2">Start your PMP certification journey today</p>
		</div>

		<form onsubmit={handleSubmit} class="space-y-6">
			{#if error}
				<div class="p-3 rounded-lg bg-md-error-container text-md-on-error-container text-sm">
					{error}
				</div>
			{/if}

			<div>
				<label for="name" class="block text-sm font-medium mb-1 text-md-on-surface-variant">
					Full Name
				</label>
				<input
					id="name"
					type="text"
					bind:value={name}
					class="input"
					placeholder="John Doe"
					required
				/>
			</div>

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
				<div class="relative">
					<input
						id="password"
						type={showPassword ? 'text' : 'password'}
						bind:value={password}
						class="input pr-10"
						placeholder="••••••••"
						required
						minlength={8}
					/>
					<button
						type="button"
						onclick={() => (showPassword = !showPassword)}
						class="absolute right-3 top-1/2 -translate-y-1/2 text-md-on-surface-variant hover:text-md-on-surface"
						aria-label={showPassword ? 'Hide password' : 'Show password'}
					>
						{showPassword ? '👁️' : '👁️‍🗨️'}
					</button>
				</div>
				<p class="text-xs text-md-on-surface-variant mt-1">Minimum 8 characters</p>
			</div>

			<div>
				<label
					for="confirmPassword"
					class="block text-sm font-medium mb-1 text-md-on-surface-variant"
				>
					Confirm Password
				</label>
				<input
					id="confirmPassword"
					type="password"
					bind:value={confirmPassword}
					class="input"
					placeholder="••••••••"
					required
				/>
			</div>

			<div class="flex items-start gap-2 text-sm text-md-on-surface-variant">
				<input
					id="terms-checkbox"
					type="checkbox"
					bind:checked={termsAccepted}
					onchange={(e) => {
						if (e.currentTarget.checked) {
							termsError = '';
						}
					}}
					class="rounded mt-1 text-md-primary focus:ring-md-primary cursor-pointer"
					class:border-md-error={termsError}
					class:focus:border-md-error={termsError}
					class:focus:ring-md-error={termsError}
					aria-invalid={termsError ? 'true' : 'false'}
					aria-describedby={termsError ? 'terms-error' : undefined}
				/>
				<label for="terms-checkbox" class="cursor-pointer flex-1">
					<span>
						I agree to the
						<a href="/terms" class="text-md-primary hover:underline">Terms of Service</a>
						and
						<a href="/privacy" class="text-md-primary hover:underline">Privacy Policy</a>
					</span>
				</label>
			</div>
			{#if termsError}
				<p id="terms-error" class="text-sm text-md-error mt-1" role="alert">
					{termsError}
				</p>
			{/if}

			<button
				type="submit"
				disabled={submitting || $isLoading}
				class="btn btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
			>
				{#if submitting}
					Creating account...
				{:else if $isLoading}
					Loading...
				{:else}
					Create Account
				{/if}
			</button>
		</form>

		<p class="text-center text-sm text-md-on-surface-variant mt-6">
			Already have an account?
			<a href="/auth/login" class="text-md-primary font-medium hover:underline">Sign in</a>
		</p>
	</div>
</div>

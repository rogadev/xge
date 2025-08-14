<script lang="ts">
	import { handleError } from '$lib/utils/errors.js';

	interface Props {
		children: any;
		fallbackMessage?: string;
		showRetry?: boolean;
		onRetry?: () => void;
		context?: string;
	}

	let {
		children,
		fallbackMessage = 'Something went wrong. Please try again.',
		showRetry = true,
		onRetry,
		context = 'Component'
	}: Props = $props();

	let hasError = $state(false);
	let errorInfo = $state<{ message: string; severity: string } | null>(null);

	// Error handler function
	function handleComponentError(error: unknown) {
		console.error(`Error in ${context}:`, error);

		const info = handleError(error, context);
		errorInfo = {
			message: info.message,
			severity: info.severity
		};

		hasError = true;
	}

	// Retry function
	function retry() {
		hasError = false;
		errorInfo = null;
		if (onRetry) {
			onRetry();
		}
	}

	// Reset error state when component props change
	$effect(() => {
		if (children) {
			hasError = false;
			errorInfo = null;
		}
	});
</script>

{#if hasError && errorInfo}
	<!-- Error UI -->
	<div class="rounded-lg border border-red-200 bg-red-50 p-4">
		<div class="flex items-start">
			<div class="flex-shrink-0">
				<svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
					<path
						fill-rule="evenodd"
						d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
						clip-rule="evenodd"
					/>
				</svg>
			</div>
			<div class="ml-3 flex-1">
				<h3 class="text-sm font-medium text-red-800">
					{context} Error
				</h3>
				<div class="mt-2 text-sm text-red-700">
					<p>{fallbackMessage}</p>
					{#if errorInfo.message !== fallbackMessage}
						<p class="mt-1 text-xs opacity-75">{errorInfo.message}</p>
					{/if}
				</div>
				{#if showRetry}
					<div class="mt-3">
						<button
							type="button"
							class="rounded-md bg-red-100 px-3 py-2 text-sm font-medium text-red-800 hover:bg-red-200 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:outline-none"
							onclick={retry}
						>
							Try Again
						</button>
					</div>
				{/if}
			</div>
		</div>
	</div>
{:else}
	<!-- Render children with error handling -->
	{@render children()}
{/if}

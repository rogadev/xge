<!--
	@fileoverview Generic error boundary for wrapping components that might throw errors.
	Provides configurable error UI with optional retry functionality. Unlike AppErrorBoundary
	and DataErrorBoundary, this is designed for component-level error handling with
	customizable messaging and behavior.
	
	@component ErrorBoundary
	@example
	```svelte
	<ErrorBoundary 
		context="Map Rendering" 
		fallbackMessage="Unable to load map. Check your connection."
		onRetry={() => mapStore.reinitialize()}
	>
		{#snippet children()}
			<MapContainer />
		{/snippet}
	</ErrorBoundary>
	```
-->
<script lang="ts">
	import { handleError } from '$lib/utils/errors.js';
	import type { Snippet } from 'svelte';

	/**
	 * Error information structure for display
	 */
	interface ComponentErrorInfo {
		/** User-friendly error message */
		message: string;
		/** Error severity level for styling/logging */
		severity: string;
	}

	interface Props {
		/** Child components to render within error boundary */
		children: Snippet;
		/** User-facing error message when errors occur */
		fallbackMessage?: string;
		/** Whether to show retry button in error UI */
		showRetry?: boolean;
		/** Callback function to execute when user clicks retry */
		onRetry?: () => void;
		/** Context name for error logging and UI display */
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
	let errorInfo = $state<ComponentErrorInfo | null>(null);

	/**
	 * Processes component errors and updates error state.
	 * Converts technical errors into user-friendly messages using the error utility.
	 *
	 * @param error - The error that occurred within the component boundary
	 */
	function handleComponentError(error: unknown): void {
		console.error(`Error in ${context}:`, error);

		const info = handleError(error, context);
		errorInfo = {
			message: info.message,
			severity: info.severity
		};

		hasError = true;
	}

	/**
	 * Resets error state and optionally triggers custom retry logic.
	 * Allows components to recover from transient errors without full page reload.
	 */
	function retry(): void {
		hasError = false;
		errorInfo = null;
		if (onRetry) {
			onRetry();
		}
	}

	/**
	 * Exposes error handler for parent components to manually trigger.
	 * Useful for try-catch blocks that want to delegate error display.
	 */
	export { handleComponentError as triggerError };
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

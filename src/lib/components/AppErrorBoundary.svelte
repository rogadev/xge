<!--
	@fileoverview Application-level error boundary that catches unhandled errors and promise rejections.
	Provides a user-friendly error dialog with options to reload or dismiss. Essential for production
	resilience and preventing white screens of death.
	
	@component AppErrorBoundary
	@example
	```svelte
	<AppErrorBoundary>
		{#snippet children()}
			<App />
		{/snippet}
	</AppErrorBoundary>
	```
-->
<script lang="ts">
	import { browser } from '$app/environment';
	import { handleError } from '$lib/utils/errors.js';
	import type { Snippet } from 'svelte';

	/**
	 * Error information displayed in the error dialog
	 */
	interface ErrorInfo {
		/** User-friendly error message */
		message: string;
		/** When the error occurred */
		timestamp: Date;
	}

	interface Props {
		/** Child components to render within error boundary */
		children: Snippet;
	}

	let { children }: Props = $props();

	let hasAppError = $state(false);
	let errorInfo = $state<ErrorInfo | null>(null);

	/**
	 * Handles both JavaScript errors and unhandled promise rejections.
	 * Converts technical errors into user-friendly messages and triggers error UI.
	 */
	function handleGlobalError(event: ErrorEvent | PromiseRejectionEvent): void {
		console.error('Global error caught:', event);

		let message = 'An unexpected error occurred';

		if ('error' in event && event.error) {
			const info = handleError(event.error, 'Application');
			message = info.message;
		} else if ('reason' in event) {
			const info = handleError(event.reason, 'Promise Rejection');
			message = info.message;
		}

		errorInfo = {
			message,
			timestamp: new Date()
		};

		hasAppError = true;
	}

	/**
	 * Registers global error listeners to catch all unhandled errors.
	 * Only runs in browser environment to avoid SSR issues.
	 */
	$effect(() => {
		if (browser) {
			window.addEventListener('error', handleGlobalError);
			window.addEventListener('unhandledrejection', handleGlobalError);

			return () => {
				window.removeEventListener('error', handleGlobalError);
				window.removeEventListener('unhandledrejection', handleGlobalError);
			};
		}
	});

	/**
	 * Forces a full page reload to recover from critical errors.
	 * Only available in browser environment.
	 */
	function reloadApp(): void {
		if (browser) {
			window.location.reload();
		}
	}

	/**
	 * Dismisses the error dialog and attempts to continue normal operation.
	 * Use with caution as underlying error may still exist.
	 */
	function dismissError(): void {
		hasAppError = false;
		errorInfo = null;
	}
</script>

{#if hasAppError && errorInfo}
	<!-- Critical application error overlay -->
	<div class="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black p-4">
		<div class="max-w-md rounded-lg bg-white p-6 shadow-xl">
			<div class="text-center">
				<div class="mx-auto h-12 w-12 rounded-full bg-red-100 p-3">
					<svg class="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z"
						/>
					</svg>
				</div>
				<h3 class="mt-4 text-lg font-medium text-gray-900">Application Error</h3>
				<p class="mt-2 text-sm text-gray-600">{errorInfo.message}</p>
				<p class="mt-1 text-xs text-gray-400">
					Error occurred at {errorInfo.timestamp.toLocaleTimeString()}
				</p>
				<div class="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
					<button
						type="button"
						class="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:outline-none"
						onclick={reloadApp}
					>
						Reload App
					</button>
					<button
						type="button"
						class="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
						onclick={dismissError}
					>
						Dismiss
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}

<!-- Always render children -->
{@render children()}

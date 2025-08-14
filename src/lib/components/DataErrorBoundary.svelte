<script lang="ts">
	import { projectsStore } from '$lib/stores/projects.js';
	import { onMount } from 'svelte';

	interface Props {
		children: any;
	}

	let { children }: Props = $props();

	let hasDataError = $state(false);
	let isLoading = $state(true);
	let errorMessage = $state('');

	// Check for data loading errors
	$effect(() => {
		const store = $projectsStore;

		if (store.error) {
			hasDataError = true;
			errorMessage = store.error;
			isLoading = false;
		} else if (store.allProjects.length >= 0) {
			// Data has been loaded (even if empty)
			hasDataError = false;
			isLoading = false;
		}
	});

	// Retry data loading
	function retryDataLoad() {
		hasDataError = false;
		isLoading = true;
		errorMessage = '';

		// Trigger data reload
		projectsStore.loadProjects();
	}

	onMount(() => {
		// Initial load check
		if ($projectsStore.allProjects.length === 0 && !$projectsStore.error) {
			projectsStore.loadProjects();
		}
	});
</script>

{#if isLoading}
	<!-- Data loading state -->
	<div class="flex min-h-[200px] items-center justify-center">
		<div class="text-center">
			<div
				class="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"
			></div>
			<p class="mt-2 text-sm text-gray-600">Loading climate projects...</p>
		</div>
	</div>
{:else if hasDataError}
	<!-- Data error state -->
	<div class="rounded-lg border border-red-200 bg-red-50 p-6">
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
			<h3 class="mt-4 text-lg font-medium text-red-800">Data Loading Error</h3>
			<p class="mt-2 text-sm text-red-600">{errorMessage}</p>
			<button
				type="button"
				class="mt-4 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:outline-none"
				onclick={retryDataLoad}
			>
				Retry Loading
			</button>
		</div>
	</div>
{:else}
	<!-- Render children when data is loaded successfully -->
	{@render children()}
{/if}

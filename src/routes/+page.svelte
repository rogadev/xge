<script lang="ts">
	import {
		MapContainer,
		ProjectMarkers,
		ProjectModal,
		FilterControls,
		ErrorBoundary,
		DataErrorBoundary,
		AppErrorBoundary
	} from '$lib/components';
</script>

<AppErrorBoundary>
	{#snippet children()}
		<DataErrorBoundary>
			{#snippet children()}
				<div class="relative h-screen w-full overflow-hidden">
					<!-- Main map container with error boundary -->
					<ErrorBoundary
						context="Map"
						fallbackMessage="The map failed to load. Please check your internet connection and try again."
					>
						{#snippet children()}
							<MapContainer />
						{/snippet}
					</ErrorBoundary>

					<!-- Project markers overlay with error boundary -->
					<ErrorBoundary
						context="Project Markers"
						fallbackMessage="Project markers failed to load. The map will continue to work."
					>
						{#snippet children()}
							<ProjectMarkers />
						{/snippet}
					</ErrorBoundary>

					<!-- Filter controls - responsive positioning with error boundary -->
					<div class="pointer-events-none absolute top-4 right-4 left-4 z-10">
						<div class="pointer-events-auto">
							<ErrorBoundary
								context="Filter Controls"
								fallbackMessage="Filter controls are temporarily unavailable."
							>
								{#snippet children()}
									<FilterControls />
								{/snippet}
							</ErrorBoundary>
						</div>
					</div>

					<!-- Modal overlay with error boundary -->
					<ErrorBoundary
						context="Project Modal"
						fallbackMessage="Project details are temporarily unavailable."
					>
						{#snippet children()}
							<ProjectModal />
						{/snippet}
					</ErrorBoundary>
				</div>
			{/snippet}
		</DataErrorBoundary>
	{/snippet}
</AppErrorBoundary>

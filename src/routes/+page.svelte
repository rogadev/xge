<!--
	@fileoverview Main page component for the XGE Climate Explorer application.
	Orchestrates the complete climate project mapping experience with layered error boundaries,
	responsive layout, and accessibility features. Implements a defensive architecture
	where individual component failures don't break the entire application.
	
	@component MainPage
	@route /
-->
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

<!--
	Layered Error Boundary Architecture:
	1. AppErrorBoundary: Catches unhandled JavaScript errors and promise rejections
	2. DataErrorBoundary: Handles project data loading failures
	3. ErrorBoundary: Component-specific error isolation for graceful degradation
-->
<AppErrorBoundary>
	{#snippet children()}
		<DataErrorBoundary>
			{#snippet children()}
				<!-- 
					Main application container with full viewport coverage.
					Uses semantic structure for screen readers and keyboard navigation.
				-->
				<main
					id="main-content"
					class="relative h-screen w-full overflow-hidden"
					aria-label="Climate projects interactive map"
				>
					<!-- 
						Core map layer - Foundation of the application.
						Isolated error boundary ensures map failures don't break other features.
					-->
					<section aria-label="Interactive map display">
						<ErrorBoundary
							context="Map"
							fallbackMessage="The map failed to load. Please check your internet connection and try again."
						>
							{#snippet children()}
								<MapContainer />
							{/snippet}
						</ErrorBoundary>
					</section>

					<!-- 
						Project markers overlay - Data visualization layer.
						Graceful degradation: map remains functional even if markers fail.
					-->
					<section aria-label="Climate project markers">
						<ErrorBoundary
							context="Project Markers"
							fallbackMessage="Project markers failed to load. The map will continue to work."
						>
							{#snippet children()}
								<ProjectMarkers />
							{/snippet}
						</ErrorBoundary>
					</section>

					<!-- 
						Filter controls - User interaction layer.
						Positioned responsively with pointer event management for proper z-index handling.
						Accessible keyboard navigation and screen reader support.
					-->
					<aside
						class="pointer-events-none absolute top-4 right-4 left-4 z-10"
						aria-label="Filter controls"
					>
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
					</aside>

					<!-- 
						Modal overlay - Detail view layer.
						Highest z-index for modal display with accessibility features.
						Error boundary ensures modal failures don't affect map interaction.
					-->
					<section aria-label="Project details modal">
						<ErrorBoundary
							context="Project Modal"
							fallbackMessage="Project details are temporarily unavailable."
						>
							{#snippet children()}
								<ProjectModal />
							{/snippet}
						</ErrorBoundary>
					</section>
				</main>
			{/snippet}
		</DataErrorBoundary>
	{/snippet}
</AppErrorBoundary>

<!--
	Architecture Notes:
	
	1. Defensive Design: Each major component is wrapped in its own ErrorBoundary
	   to prevent cascading failures that would break the entire application.
	
	2. Layered Resilience: Three levels of error handling ensure graceful degradation:
	   - Global errors (AppErrorBoundary)
	   - Data loading errors (DataErrorBoundary) 
	   - Component-specific errors (ErrorBoundary)
	
	3. Accessibility: Semantic HTML structure with proper ARIA labels and landmarks
	   for screen readers and keyboard navigation.
	
	4. Performance: Efficient layering with proper z-index management and pointer
	   event optimization to prevent unnecessary event bubbling.
	
	5. Responsive Design: Mobile-first approach with responsive positioning that
	   adapts to different screen sizes while maintaining usability.
-->

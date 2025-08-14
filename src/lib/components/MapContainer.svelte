<script lang="ts">
	import { mapStore } from '$lib/stores/map.js';
	import { PUBLIC_MAPBOX_ACCESS_TOKEN } from '$env/static/public';
	import mapboxgl from 'mapbox-gl';

	// Map container element reference
	let mapContainer: HTMLDivElement | undefined = $state();
	let map: mapboxgl.Map | null = null; // Non-reactive to prevent circular dependency
	let isInitialized = false; // Non-reactive to prevent effect loops

	// Loading and error states
	let isLoading = $state(true);
	let loadingTimeout: ReturnType<typeof setTimeout>;

	// Style options for fallback - using older, more compatible styles
	const styleOptions = [
		'mapbox://styles/mapbox/streets-v11',
		'mapbox://styles/mapbox/light-v10',
		'mapbox://styles/mapbox/outdoors-v11',
		'mapbox://styles/mapbox/satellite-v9'
	];

	// Initialize map when component mounts and mapContainer is available
	$effect(() => {
		if (!mapContainer || isInitialized) return;

		isInitialized = true; // Set immediately to prevent re-runs

		async function initializeMap() {
			try {
				// Validate Mapbox token
				if (
					!PUBLIC_MAPBOX_ACCESS_TOKEN ||
					PUBLIC_MAPBOX_ACCESS_TOKEN === 'your_mapbox_access_token_here'
				) {
					throw new Error(
						'Mapbox access token is not configured properly. Please check your .env file.'
					);
				}

				// Validate token format (Mapbox tokens start with 'pk.')
				if (!PUBLIC_MAPBOX_ACCESS_TOKEN.startsWith('pk.')) {
					throw new Error('Invalid Mapbox access token format. Token should start with "pk."');
				}

				// Set Mapbox access token
				mapboxgl.accessToken = PUBLIC_MAPBOX_ACCESS_TOKEN;

				// Set loading timeout (3 seconds as per requirement 5.1)
				loadingTimeout = setTimeout(() => {
					if (isLoading) {
						mapStore.setError('Map loading timeout. Please check your connection.');
						isLoading = false;
					}
				}, 3000);

				// Log token info for debugging
				console.log('Mapbox token configured:', PUBLIC_MAPBOX_ACCESS_TOKEN ? 'Yes' : 'No');
				console.log('Token starts with pk.:', PUBLIC_MAPBOX_ACCESS_TOKEN?.startsWith('pk.'));
				console.log('Attempting to load map with style: mapbox://styles/mapbox/light-v10');

				// Initialize map with most compatible style
				map = new mapboxgl.Map({
					container: mapContainer!,
					style: 'mapbox://styles/mapbox/light-v10', // Use basic style that should work
					center: [-106.3468, 56.1304], // Center on Canada
					zoom: 4,
					attributionControl: true,
					// Enable smooth interactions
					doubleClickZoom: true,
					dragPan: true,
					dragRotate: false, // Disable rotation for better UX
					scrollZoom: true,
					touchZoomRotate: true,
					touchPitch: false, // Disable pitch for better mobile UX
					// Performance optimizations
					antialias: true,
					fadeDuration: 300,
					// Accessibility
					keyboard: true,
					// Touch gesture settings for mobile
					cooperativeGestures: false // Allow single-finger pan
				});

				// Handle map load event
				map.on('load', () => {
					clearTimeout(loadingTimeout);
					isLoading = false;

					// Add navigation controls
					const nav = new mapboxgl.NavigationControl({
						showCompass: false, // Hide compass for cleaner UI
						showZoom: true,
						visualizePitch: false
					});
					map!.addControl(nav, 'top-right');

					// Add fullscreen control
					const fullscreen = new mapboxgl.FullscreenControl();
					map!.addControl(fullscreen, 'top-right');

					// Add smooth easing for better UX
					map!.on('movestart', () => {
						map!.getCanvas().style.cursor = 'grabbing';
					});

					map!.on('moveend', () => {
						map!.getCanvas().style.cursor = 'grab';
					});

					// Set initial cursor
					map!.getCanvas().style.cursor = 'grab';

					// Add keyboard navigation instructions for accessibility
					map!.getCanvas().setAttribute('tabindex', '0');
					map!
						.getCanvas()
						.setAttribute(
							'aria-label',
							'Interactive map. Use arrow keys to pan, plus and minus keys to zoom.'
						);

					// Update store
					mapStore.setInstance(map!);
					mapStore.setLoaded(true);
				});

				// Handle map errors with detailed logging and graceful handling
				let errorCount = 0;
				map.on('error', (e) => {
					errorCount++;
					console.error(`Mapbox error #${errorCount}:`, e);
					console.error('Error details:', {
						type: e.type,
						sourceId: (e as any).sourceId || 'unknown',
						tile: (e as any).tile || null,
						error: e.error
					});

					// If it's a tile loading error (common with token restrictions), just log it
					// but don't break the map - many tile errors are recoverable
					if ((e as any).tile && e.error) {
						console.warn(
							'Tile loading failed - this may be due to token restrictions at this zoom level'
						);
						// Don't show error to user for individual tile failures
						return;
					}

					// If this is a style error, try fallback styles
					if (e.error && (e.error.message?.includes('style') || e.error.message?.includes('404'))) {
						const currentStyle =
							(map?.getStyle()?.metadata as any)?.['mapbox:origin'] || styleOptions[0];
						const currentIndex = styleOptions.findIndex((style) => style === currentStyle);
						const nextStyle = styleOptions[currentIndex + 1];

						if (nextStyle) {
							console.log('Trying fallback style:', nextStyle);
							try {
								map?.setStyle(nextStyle);
								return; // Don't show error yet, let the fallback try
							} catch (fallbackError) {
								console.error('Fallback style also failed:', fallbackError);
							}
						}
					}

					// Only show error to user for critical failures after multiple errors
					if (errorCount > 10) {
						clearTimeout(loadingTimeout);
						isLoading = false;

						mapStore.setError(
							'Map tiles are failing to load. Your Mapbox token may need additional permissions or URL restrictions updated.'
						);
					}
				});
			} catch (error) {
				clearTimeout(loadingTimeout);
				isLoading = false;
				console.error('Map initialization error:', error);

				if (error instanceof Error) {
					if (error.message.includes('token') || error.message.includes('access token')) {
						mapStore.setError(`Mapbox Token Error: ${error.message}`);
					} else if (error.message.includes('format')) {
						mapStore.setError('Invalid Mapbox token format. Please check your .env file.');
					} else {
						mapStore.setError('Map temporarily unavailable. Please try again.');
					}
				} else {
					mapStore.setError('Map temporarily unavailable. Please try again.');
				}
			}
		}

		initializeMap();

		// Cleanup function (equivalent to onDestroy)
		return () => {
			// Clear timeout if component is destroyed during loading
			if (loadingTimeout) {
				clearTimeout(loadingTimeout);
			}

			// Comprehensive map cleanup to prevent memory leaks
			if (map) {
				try {
					// Remove the map instance (this handles most cleanup automatically)
					map.remove();
				} catch (e) {
					console.warn('Error during map cleanup:', e);
				} finally {
					map = null;
				}
			}

			// Reset initialization state
			isInitialized = false;

			// Reset store state
			mapStore.reset();
		};
	});
</script>

<div class="relative h-screen w-full">
	<!-- Map container -->
	<div
		bind:this={mapContainer}
		class="h-full w-full"
		role="application"
		aria-label="Interactive climate projects map"
	></div>

	<!-- Loading state -->
	{#if isLoading}
		<div
			class="bg-opacity-90 absolute inset-0 flex items-center justify-center bg-white"
			role="status"
			aria-live="polite"
		>
			<div class="text-center">
				<div
					class="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"
				></div>
				<p class="mt-2 text-sm text-gray-600">Loading map...</p>
			</div>
		</div>
	{/if}

	<!-- Error state -->
	{#if $mapStore.error}
		<div
			class="bg-opacity-95 absolute inset-0 flex items-center justify-center bg-white"
			role="alert"
			aria-live="assertive"
		>
			<div class="max-w-md rounded-lg bg-red-50 p-6 text-center">
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
				<h3 class="mt-4 text-lg font-medium text-red-800">Map Error</h3>
				<p class="mt-2 text-sm text-red-600">{$mapStore.error}</p>
				<button
					class="mt-4 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:outline-none"
					onclick={() => window.location.reload()}
				>
					Retry
				</button>
			</div>
		</div>
	{/if}
</div>

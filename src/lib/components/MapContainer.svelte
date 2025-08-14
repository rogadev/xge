<!--
	@fileoverview Core Mapbox GL JS map container with comprehensive error handling and mobile optimization.
	Handles map initialization, token validation, responsive controls, accessibility features,
	and graceful error recovery. Implements production-ready map loading with 3-second timeout
	and automatic style fallbacks for reliability.
	
	@component MapContainer
	@example
	```svelte
	<MapContainer />
	```
-->
<script lang="ts">
	import { mapStore } from '$lib/stores/map.js';
	import { PUBLIC_MAPBOX_ACCESS_TOKEN } from '$env/static/public';
	import mapboxgl from 'mapbox-gl';

	/**
	 * Mapbox style URLs with fallback options.
	 * Ordered from most to least preferred for progressive fallback.
	 */
	const styleOptions: readonly string[] = [
		'mapbox://styles/mapbox/streets-v11',
		'mapbox://styles/mapbox/light-v10',
		'mapbox://styles/mapbox/outdoors-v11',
		'mapbox://styles/mapbox/satellite-v9'
	] as const;

	/**
	 * Canada geographic center coordinates for map initialization.
	 */
	const CANADA_CENTER: [number, number] = [-106.3468, 56.1304] as const;

	/**
	 * Map loading timeout duration in milliseconds (3 seconds for performance requirement).
	 */
	const MAP_LOAD_TIMEOUT = 3000 as const;

	/**
	 * Error threshold before showing user-facing error messages.
	 * Prevents minor tile loading failures from disrupting user experience.
	 */
	const ERROR_THRESHOLD = 10 as const;

	let mapContainer: HTMLDivElement | undefined = $state();
	let map: mapboxgl.Map | null = null; // Non-reactive to prevent circular dependencies
	let isInitialized = false; // Non-reactive to prevent effect loops
	let isLoading = $state(true);
	let loadingTimeout: ReturnType<typeof setTimeout>;

	/**
	 * Initializes the Mapbox map with comprehensive error handling and mobile optimization.
	 * Implements token validation, responsive controls, accessibility features, and cleanup.
	 */
	$effect(() => {
		if (!mapContainer || isInitialized) return;

		isInitialized = true;

		async function initializeMap(): Promise<void> {
			try {
				validateMapboxToken();
				configureMapboxToken();
				setupLoadingTimeout();
				await createMapInstance();
			} catch (error) {
				handleInitializationError(error);
			}
		}

		/**
		 * Validates Mapbox access token existence and format.
		 * Throws descriptive errors for missing or malformed tokens.
		 */
		function validateMapboxToken(): void {
			if (
				!PUBLIC_MAPBOX_ACCESS_TOKEN ||
				PUBLIC_MAPBOX_ACCESS_TOKEN === 'your_mapbox_access_token_here'
			) {
				throw new Error(
					'Mapbox access token is not configured properly. Please check your .env file.'
				);
			}

			if (!PUBLIC_MAPBOX_ACCESS_TOKEN.startsWith('pk.')) {
				throw new Error('Invalid Mapbox access token format. Token should start with "pk."');
			}
		}

		/**
		 * Configures the global Mapbox access token for map initialization.
		 */
		function configureMapboxToken(): void {
			mapboxgl.accessToken = PUBLIC_MAPBOX_ACCESS_TOKEN;
		}

		/**
		 * Sets up 3-second loading timeout to meet performance requirements.
		 */
		function setupLoadingTimeout(): void {
			loadingTimeout = setTimeout(() => {
				if (isLoading) {
					mapStore.setError('Map loading timeout. Please check your connection.');
					isLoading = false;
				}
			}, MAP_LOAD_TIMEOUT);
		}

		/**
		 * Creates the Mapbox map instance with optimized settings for mobile and accessibility.
		 */
		async function createMapInstance(): Promise<void> {
			map = new mapboxgl.Map({
				container: mapContainer!,
				style: styleOptions[0],
				center: CANADA_CENTER,
				zoom: 4,
				maxZoom: 18,
				minZoom: 2,
				attributionControl: true,
				// Mobile-optimized interaction settings
				doubleClickZoom: true,
				dragPan: true,
				dragRotate: false, // Disabled for better mobile UX
				scrollZoom: true,
				touchZoomRotate: true,
				touchPitch: false, // Disabled for better mobile UX
				cooperativeGestures: false, // Allow single-finger pan
				// Performance optimizations
				antialias: true,
				fadeDuration: 300,
				preserveDrawingBuffer: false,
				refreshExpiredTiles: true,
				// Accessibility support
				keyboard: true
			});

			setupMapEventHandlers();
		}

		/**
		 * Configures map event handlers for loading, errors, and user interactions.
		 */
		function setupMapEventHandlers(): void {
			if (!map) return;

			map.on('load', handleMapLoad);
			map.on('error', handleMapError);

			// Map interaction events for marker visibility control
			map.on('movestart', handleInteractionStart);
			map.on('zoomstart', handleInteractionStart);
			map.on('moveend', handleInteractionEnd);
			map.on('zoomend', handleInteractionEnd);
		}

		/**
		 * Handles successful map load by setting up controls and accessibility features.
		 */
		function handleMapLoad(): void {
			if (!map) return;

			clearTimeout(loadingTimeout);
			isLoading = false;

			setupNavigationControls();
			setupAccessibilityFeatures();
			setupResponsiveHandlers();
			updateMapStore();
		}

		/**
		 * Sets up responsive navigation and fullscreen controls.
		 */
		function setupNavigationControls(): void {
			if (!map) return;

			const nav = new mapboxgl.NavigationControl({
				showCompass: false, // Cleaner UI
				showZoom: true,
				visualizePitch: false
			});

			const isMobile = window.innerWidth < 768;
			map.addControl(nav, isMobile ? 'bottom-right' : 'top-right');

			// Desktop-only fullscreen control
			if (!isMobile) {
				const fullscreen = new mapboxgl.FullscreenControl();
				map.addControl(fullscreen, 'top-right');
			}
		}

		/**
		 * Configures accessibility features and cursor states for better UX.
		 */
		function setupAccessibilityFeatures(): void {
			if (!map) return;

			const canvas = map.getCanvas();

			// Accessibility attributes
			canvas.setAttribute('tabindex', '0');
			canvas.setAttribute(
				'aria-label',
				'Interactive climate projects map. Use arrow keys to pan, plus and minus keys to zoom, or touch gestures on mobile.'
			);

			// Touch optimization
			canvas.style.touchAction = 'pan-x pan-y';

			// Interactive cursor states
			map.on('movestart', () => {
				canvas.style.cursor = 'grabbing';
			});

			map.on('moveend', () => {
				canvas.style.cursor = 'grab';
			});

			canvas.style.cursor = 'grab';
		}

		/**
		 * Sets up responsive handlers for viewport changes and device orientation.
		 */
		function setupResponsiveHandlers(): void {
			if (!map) return;

			const handleResize = (): void => {
				map!.resize();
			};

			window.addEventListener('resize', handleResize);
			window.addEventListener('orientationchange', handleResize);
		}

		/**
		 * Updates the map store with the initialized instance.
		 */
		function updateMapStore(): void {
			if (!map) return;

			mapStore.setInstance(map);
			mapStore.setLoaded(true);
		}

		/**
		 * Handles map errors with progressive fallback and intelligent error filtering.
		 */
		let errorCount = 0;
		function handleMapError(e: mapboxgl.ErrorEvent): void {
			errorCount++;
			console.error(`Mapbox error #${errorCount}:`, e);

			// Filter out recoverable tile loading errors
			if (isRecoverableTileError(e)) {
				console.warn('Recoverable tile loading error - continuing operation');
				return;
			}

			// Attempt style fallback for style-related errors
			if (isStyleError(e) && attemptStyleFallback()) {
				return;
			}

			// Show user error only after threshold to avoid disruption
			if (errorCount > ERROR_THRESHOLD) {
				showCriticalError();
			}
		}

		/**
		 * Determines if an error is a recoverable tile loading failure.
		 */
		function isRecoverableTileError(e: mapboxgl.ErrorEvent): boolean {
			return !!(e as any).tile && !!e.error;
		}

		/**
		 * Determines if an error is related to map style loading.
		 */
		function isStyleError(e: mapboxgl.ErrorEvent): boolean {
			return !!(
				e.error &&
				(e.error.message?.includes('style') || e.error.message?.includes('404'))
			);
		}

		/**
		 * Attempts to fallback to next available map style.
		 * Returns true if fallback was attempted, false if no more options.
		 */
		function attemptStyleFallback(): boolean {
			if (!map) return false;

			const currentStyle = (map.getStyle()?.metadata as any)?.['mapbox:origin'] || styleOptions[0];
			const currentIndex = styleOptions.findIndex((style) => style === currentStyle);
			const nextStyle = styleOptions[currentIndex + 1];

			if (nextStyle) {
				console.log('Attempting style fallback:', nextStyle);
				try {
					map.setStyle(nextStyle);
					return true;
				} catch (fallbackError) {
					console.error('Style fallback failed:', fallbackError);
				}
			}

			return false;
		}

		/**
		 * Shows critical error message to user after all recovery attempts.
		 */
		function showCriticalError(): void {
			clearTimeout(loadingTimeout);
			isLoading = false;
			mapStore.setError(
				'Map tiles are failing to load. Your Mapbox token may need additional permissions or URL restrictions updated.'
			);
		}

		/**
		 * Handles the start of map interactions (zoom or pan).
		 * Sets interaction state to hide markers during movement.
		 */
		function handleInteractionStart(): void {
			mapStore.setInteracting(true);
		}

		/**
		 * Handles the end of map interactions (zoom or pan).
		 * Clears interaction state to show markers after movement stops.
		 */
		function handleInteractionEnd(): void {
			mapStore.setInteracting(false);
		}

		/**
		 * Handles map initialization errors with specific error messaging.
		 */
		function handleInitializationError(error: unknown): void {
			clearTimeout(loadingTimeout);
			isLoading = false;
			console.error('Map initialization error:', error);

			if (error instanceof Error) {
				if (error.message.includes('token')) {
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

		initializeMap();

		/**
		 * Cleanup function to prevent memory leaks and reset state.
		 */
		return () => {
			if (loadingTimeout) {
				clearTimeout(loadingTimeout);
			}

			if (map) {
				try {
					map.remove();
				} catch (e) {
					console.warn('Error during map cleanup:', e);
				} finally {
					map = null;
				}
			}

			isInitialized = false;
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

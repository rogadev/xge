<!--
	@fileoverview Interactive project markers for climate projects on the map.
	Renders clickable markers with hover tooltips and handles marker visibility, positioning,
	and user interactions. Includes a workaround for marker disappearing issue during hover events.
	
	@component ProjectMarkers
	@example
	```svelte
	<ProjectMarkers />
	```
-->
<script lang="ts">
	import { mapStore } from '$lib/stores/map.js';
	import { projectsStore } from '$lib/stores/projects.js';
	import { selectedProjectStore } from '$lib/stores/selectedProject.js';
	import mapboxgl from 'mapbox-gl';
	import type { Project } from '$lib/types';

	/**
	 * Map storing project ID to Mapbox marker instance for efficient lookup and cleanup.
	 * @type {Map<string, mapboxgl.Marker>}
	 */
	let markers = $state(new Map<string, mapboxgl.Marker>());

	/**
	 * Reactive reference to filtered projects from the centralized store.
	 * Automatically updates when filters change, triggering marker updates.
	 */
	const { filteredProjects: filteredProjectsStore } = projectsStore;
	let filteredProjects = $derived($filteredProjectsStore);

	/**
	 * Effect that updates markers whenever filtered projects or map state changes.
	 * Ensures markers are synchronized with current filter state and map availability.
	 */
	$effect(() => {
		if ($mapStore.instance && $mapStore.isLoaded) {
			updateMarkers(filteredProjects);
		}
	});

	/**
	 * Creates a custom HTML element for a project marker with hover tooltips and click handlers.
	 * Includes styling, accessibility attributes, and event listeners for user interactions.
	 *
	 * @param project - The project data to create a marker for
	 * @returns The HTML element to be used as a Mapbox marker
	 * @throws Will log errors but return a fallback element if creation fails
	 */
	function createMarkerElement(project: Project): HTMLElement {
		try {
			const el = document.createElement('div');
			el.className = 'marker-custom cursor-pointer';
			el.setAttribute('tabindex', '0');
			el.setAttribute('role', 'button');

			// Safely handle project title for accessibility
			const safeTitle = project.title
				? String(project.title).replace(/["'<>]/g, '')
				: 'Climate Project';
			el.setAttribute('aria-label', `Climate project: ${safeTitle}`);

			// Create custom marker with project-specific styling
			const color = getMarkerColor(project.impactCategory);

			// Safely escape HTML content
			const escapedTitle = safeTitle
				.replace(/&/g, '&amp;')
				.replace(/</g, '&lt;')
				.replace(/>/g, '&gt;');

			el.innerHTML = `
				<div class="relative">
					<div class="w-8 h-8 rounded-full border-2 border-white shadow-lg flex items-center justify-center hover:scale-110 transition-transform duration-200 focus:scale-110 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 touch-manipulation" 
					     style="background-color: ${color}">
						<div class="w-3 h-3 rounded-full bg-white"></div>
					</div>
					<div class="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 bg-black text-white text-xs px-2 py-1 rounded opacity-0 pointer-events-none transition-opacity duration-200 whitespace-nowrap" 
					     style="z-index: 1000;">
						${escapedTitle}
					</div>
				</div>
			`;

			// Add hover effects with error handling
			el.addEventListener('mouseenter', () => {
				try {
					const tooltip = el.querySelector('div > div:last-child') as HTMLElement;
					if (tooltip) tooltip.style.opacity = '1';
				} catch (e) {
					console.warn('Error showing tooltip:', e);
				}
			});

			el.addEventListener('mouseleave', () => {
				try {
					const tooltip = el.querySelector('div > div:last-child') as HTMLElement;
					if (tooltip) tooltip.style.opacity = '0';

					// WORKAROUND: Force marker to redraw by removing and re-adding to map
					// This resolves an issue where markers become invisible after mouseleave events
					// due to unknown CSS interference, likely from Mapbox GL JS or browser rendering
					const map = $mapStore.instance;
					const existingMarker = markers.get(project.id);
					if (map && existingMarker) {
						setTimeout(() => {
							try {
								// Remove the marker and immediately re-add it
								existingMarker.remove();
								const newMarkerElement = createMarkerElement(project);
								const newMarker = new mapboxgl.Marker(newMarkerElement)
									.setLngLat(project.coordinates)
									.addTo(map);
								markers.set(project.id, newMarker);
							} catch (e) {
								console.warn('Error redrawing marker:', e);
							}
						}, 10); // Small delay to avoid conflicts
					}
				} catch (e) {
					console.warn('Error handling mouseleave:', e);
				}
			});

			// Add click handler with error handling
			const handleClick = () => {
				try {
					selectedProjectStore.selectProject(project);
				} catch (error) {
					console.error('Error selecting project:', error);
				}
			};

			el.addEventListener('click', handleClick);
			el.addEventListener('keydown', (e) => {
				if (e.key === 'Enter' || e.key === ' ') {
					e.preventDefault();
					handleClick();
				}
			});

			return el;
		} catch (error) {
			console.error('Error creating marker element:', error);
			// Return a basic fallback element
			const fallback = document.createElement('div');
			fallback.className = 'w-4 h-4 bg-gray-500 rounded-full';
			return fallback;
		}
	}

	/**
	 * Returns the appropriate color for a marker based on the project's impact category.
	 * Each impact category has a distinct color for visual differentiation on the map.
	 *
	 * @param impactCategory - The impact category of the project
	 * @returns Hex color code string for the marker background
	 */
	function getMarkerColor(impactCategory: string): string {
		const colors = {
			'renewable-energy': '#10B981', // Green
			conservation: '#3B82F6', // Blue
			'sustainable-agriculture': '#F59E0B', // Amber
			'waste-management': '#8B5CF6' // Purple
		};
		return colors[impactCategory as keyof typeof colors] || '#6B7280'; // Default gray
	}

	/**
	 * Efficiently updates markers on the map by adding new ones and removing obsolete ones.
	 * Uses incremental updates to avoid unnecessary DOM manipulation and maintain performance.
	 * Only markers for projects not in the filtered list are removed, and only missing markers are added.
	 *
	 * @param projects - Array of filtered projects to display as markers
	 * @throws Will log errors but continue execution for graceful degradation
	 */
	function updateMarkers(projects: Project[]) {
		try {
			const map = $mapStore.instance;
			if (!map) {
				console.warn('Map instance not available for marker update');
				return;
			}

			// Create a set of current project IDs for efficient lookup
			const currentProjectIds = new Set(projects.map((p) => p.id));
			const existingMarkerIds = new Set(markers.keys());

			// Remove markers for projects that are no longer in the filtered list
			markers.forEach((marker, projectId) => {
				if (!currentProjectIds.has(projectId)) {
					try {
						marker.remove();
						markers.delete(projectId);
					} catch (e) {
						console.warn('Error removing marker:', e);
					}
				}
			});

			// Add new markers for projects that don't have markers yet
			projects.forEach((project) => {
				// Skip if marker already exists
				if (existingMarkerIds.has(project.id)) {
					return;
				}

				try {
					// Validate project coordinates
					if (!Array.isArray(project.coordinates) || project.coordinates.length !== 2) {
						console.warn(`Invalid coordinates for project ${project.id}:`, project.coordinates);
						return;
					}

					const [lng, lat] = project.coordinates;
					if (typeof lng !== 'number' || typeof lat !== 'number' || isNaN(lng) || isNaN(lat)) {
						console.warn(`Invalid coordinate values for project ${project.id}:`, { lng, lat });
						return;
					}

					const markerElement = createMarkerElement(project);
					const marker = new mapboxgl.Marker(markerElement)
						.setLngLat(project.coordinates)
						.addTo(map);

					markers.set(project.id, marker);
				} catch (error) {
					console.error(`Error creating marker for project ${project.id}:`, error);
				}
			});
		} catch (error) {
			console.error('Error updating markers:', error);
			// Don't throw - graceful degradation
		}
	}

	/**
	 * Cleanup effect that removes all markers when the component is destroyed.
	 * Prevents memory leaks by properly disposing of Mapbox marker instances.
	 */
	$effect(() => {
		// Cleanup function runs when component is destroyed
		return () => {
			markers.forEach((marker) => marker.remove());
			markers.clear();
		};
	});
</script>

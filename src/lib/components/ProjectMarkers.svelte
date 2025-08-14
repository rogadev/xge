<script lang="ts">
	import { mapStore } from '$lib/stores/map.js';
	import { projectsStore } from '$lib/stores/projects.js';
	import { selectedProjectStore } from '$lib/stores/selectedProject.js';
	import { filtersStore } from '$lib/stores/filters.js';
	import mapboxgl from 'mapbox-gl';
	import type { Project } from '$lib/types';

	// Track markers and their DOM elements
	let markers = $state(new Map<string, mapboxgl.Marker>());

	// Derive filtered projects based on current filters
	let filteredProjects = $derived(
		$projectsStore.allProjects.length === 0
			? []
			: $projectsStore.allProjects.filter((project) => {
					// Apply region filter
					if ($filtersStore.region && project.region !== $filtersStore.region) {
						return false;
					}
					// Apply impact category filter
					if (
						$filtersStore.impactCategory &&
						project.impactCategory !== $filtersStore.impactCategory
					) {
						return false;
					}
					return true;
				})
	);

	// Update markers when filtered projects or map state changes
	$effect(() => {
		if ($mapStore.instance && $mapStore.isLoaded) {
			updateMarkers(filteredProjects);
		}
	});

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
				} catch (e) {
					console.warn('Error hiding tooltip:', e);
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

	function getMarkerColor(impactCategory: string): string {
		const colors = {
			'renewable-energy': '#10B981', // Green
			conservation: '#3B82F6', // Blue
			'sustainable-agriculture': '#F59E0B', // Amber
			'waste-management': '#8B5CF6' // Purple
		};
		return colors[impactCategory as keyof typeof colors] || '#6B7280'; // Default gray
	}

	function updateMarkers(projects: Project[]) {
		try {
			const map = $mapStore.instance;
			if (!map) {
				console.warn('Map instance not available for marker update');
				return;
			}

			// Remove existing markers safely
			markers.forEach((marker) => {
				try {
					marker.remove();
				} catch (e) {
					console.warn('Error removing marker:', e);
				}
			});
			markers.clear();

			// Add new markers for filtered projects
			projects.forEach((project) => {
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

	// Clean up markers when component is destroyed
	$effect(() => {
		// Cleanup function runs when component is destroyed
		return () => {
			markers.forEach((marker) => marker.remove());
			markers.clear();
		};
	});
</script>

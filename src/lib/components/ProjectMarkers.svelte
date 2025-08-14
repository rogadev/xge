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
		const el = document.createElement('div');
		el.className = 'marker-custom cursor-pointer';
		el.setAttribute('tabindex', '0');
		el.setAttribute('role', 'button');
		el.setAttribute('aria-label', `Climate project: ${project.title}`);

		// Create custom marker with project-specific styling
		const color = getMarkerColor(project.impactCategory);
		el.innerHTML = `
			<div class="relative">
				<div class="w-8 h-8 rounded-full border-2 border-white shadow-lg flex items-center justify-center hover:scale-110 transition-transform duration-200 focus:scale-110 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" 
				     style="background-color: ${color}">
					<div class="w-3 h-3 rounded-full bg-white"></div>
				</div>
				<div class="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 bg-black text-white text-xs px-2 py-1 rounded opacity-0 pointer-events-none transition-opacity duration-200 whitespace-nowrap" 
				     style="z-index: 1000;">
					${project.title}
				</div>
			</div>
		`;

		// Add hover effects
		el.addEventListener('mouseenter', () => {
			const tooltip = el.querySelector('div > div:last-child') as HTMLElement;
			if (tooltip) tooltip.style.opacity = '1';
		});

		el.addEventListener('mouseleave', () => {
			const tooltip = el.querySelector('div > div:last-child') as HTMLElement;
			if (tooltip) tooltip.style.opacity = '0';
		});

		// Add click handler
		const handleClick = () => {
			selectedProjectStore.selectProject(project);
		};

		el.addEventListener('click', handleClick);
		el.addEventListener('keydown', (e) => {
			if (e.key === 'Enter' || e.key === ' ') {
				e.preventDefault();
				handleClick();
			}
		});

		return el;
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
		const map = $mapStore.instance;
		if (!map) return;

		// Remove existing markers
		markers.forEach((marker) => marker.remove());
		markers.clear();

		// Add new markers for filtered projects
		projects.forEach((project) => {
			const markerElement = createMarkerElement(project);

			const marker = new mapboxgl.Marker(markerElement).setLngLat(project.coordinates).addTo(map);

			markers.set(project.id, marker);
		});
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

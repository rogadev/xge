<script lang="ts">
	import { filtersStore } from '$lib/stores/filters.js';
	import { projectsStore } from '$lib/stores/projects.js';
	import type { Project } from '$lib/types';

	// Available filter options
	const impactCategories = [
		{ value: 'renewable-energy', label: 'Renewable Energy' },
		{ value: 'conservation', label: 'Conservation' },
		{ value: 'sustainable-agriculture', label: 'Sustainable Agriculture' },
		{ value: 'waste-management', label: 'Waste Management' }
	];

	const regions = [
		{ value: 'north-america', label: 'North America' }
		// Currently all projects are in North America, but this is extensible
	];

	// Local state for dropdown open/close using $state()
	let impactCategoryDropdownOpen = $state(false);
	let regionDropdownOpen = $state(false);

	// Derived reactive values using $derived()
	let currentFilters = $derived($filtersStore);
	let allProjects = $derived($projectsStore.allProjects);

	// Calculate counts for each filter option using $derived()
	let impactCategoryCounts = $derived(
		impactCategories.map((category) => ({
			...category,
			count: allProjects.filter(
				(project: Project) =>
					project.impactCategory === category.value &&
					(!currentFilters.region || project.region === currentFilters.region)
			).length
		}))
	);

	let regionCounts = $derived(
		regions.map((region) => ({
			...region,
			count: allProjects.filter(
				(project: Project) =>
					project.region === region.value &&
					(!currentFilters.impactCategory ||
						project.impactCategory === currentFilters.impactCategory)
			).length
		}))
	);

	// Get active filter count using $derived()
	let activeFilterCount = $derived(
		[currentFilters.region, currentFilters.impactCategory].filter(Boolean).length
	);

	function toggleImpactCategory(category: string | null) {
		if (currentFilters.impactCategory === category) {
			filtersStore.setImpactCategory(null);
		} else {
			filtersStore.setImpactCategory(category);
		}
		impactCategoryDropdownOpen = false;
	}

	function toggleRegion(region: string | null) {
		if (currentFilters.region === region) {
			filtersStore.setRegion(null);
		} else {
			filtersStore.setRegion(region);
		}
		regionDropdownOpen = false;
	}

	function clearAllFilters() {
		filtersStore.clear();
	}

	function handleKeydown(event: KeyboardEvent, callback: () => void) {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			callback();
		}
	}

	// Close dropdowns when clicking outside using $effect()
	$effect(() => {
		function handleClickOutside(event: Event) {
			const target = event.target as HTMLElement;
			if (!target.closest('.dropdown-container')) {
				impactCategoryDropdownOpen = false;
				regionDropdownOpen = false;
			}
		}

		document.addEventListener('click', handleClickOutside);
		return () => {
			document.removeEventListener('click', handleClickOutside);
		};
	});
</script>

<div
	class="w-full max-w-md rounded-lg border border-gray-200 bg-white p-3 shadow-lg backdrop-blur-sm sm:p-4 lg:max-w-sm"
>
	<div class="space-y-4">
		<!-- Header -->
		<div class="flex items-center justify-between">
			<h3 class="text-lg font-semibold text-gray-900">Filters</h3>
			{#if activeFilterCount > 0}
				<button
					type="button"
					class="text-sm text-blue-600 hover:text-blue-800 focus:underline focus:outline-none"
					onclick={clearAllFilters}
				>
					Clear all ({activeFilterCount})
				</button>
			{/if}
		</div>

		<!-- Impact Category Filter -->
		<div class="dropdown-container relative">
			<label class="mb-1 block text-sm font-medium text-gray-700" for="impact-category-select">
				Impact Category
			</label>
			<button
				id="impact-category-select"
				type="button"
				class="relative w-full cursor-pointer rounded-md border border-gray-300 bg-white py-2 pr-10 pl-3 text-left focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none sm:text-sm"
				onclick={() => (impactCategoryDropdownOpen = !impactCategoryDropdownOpen)}
				aria-haspopup="listbox"
				aria-expanded={impactCategoryDropdownOpen}
			>
				<span class="block truncate">
					{#if currentFilters.impactCategory}
						{impactCategories.find((cat) => cat.value === currentFilters.impactCategory)?.label ||
							'All Categories'}
					{:else}
						All Categories
					{/if}
				</span>
				<span class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
					<svg class="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
						<path
							fill-rule="evenodd"
							d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3z"
							clip-rule="evenodd"
						/>
					</svg>
				</span>
			</button>

			{#if impactCategoryDropdownOpen}
				<div
					class="ring-opacity-5 absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black focus:outline-none sm:text-sm"
				>
					<button
						type="button"
						class="w-full px-3 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none {!currentFilters.impactCategory
							? 'bg-blue-50 text-blue-900'
							: 'text-gray-900'}"
						onclick={() => toggleImpactCategory(null)}
						onkeydown={(e) => handleKeydown(e, () => toggleImpactCategory(null))}
					>
						<span class="font-medium">All Categories</span>
						<span class="text-gray-500">({allProjects.length})</span>
					</button>
					{#each impactCategoryCounts as category}
						<button
							type="button"
							class="w-full px-3 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none {currentFilters.impactCategory ===
							category.value
								? 'bg-blue-50 text-blue-900'
								: 'text-gray-900'}"
							onclick={() => toggleImpactCategory(category.value)}
							onkeydown={(e) => handleKeydown(e, () => toggleImpactCategory(category.value))}
						>
							<span class="font-medium">{category.label}</span>
							<span class="text-gray-500">({category.count})</span>
						</button>
					{/each}
				</div>
			{/if}
		</div>

		<!-- Region Filter -->
		<div class="dropdown-container relative">
			<label class="mb-1 block text-sm font-medium text-gray-700" for="region-select">
				Region
			</label>
			<button
				id="region-select"
				type="button"
				class="relative w-full cursor-pointer rounded-md border border-gray-300 bg-white py-2 pr-10 pl-3 text-left focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none sm:text-sm"
				onclick={() => (regionDropdownOpen = !regionDropdownOpen)}
				aria-haspopup="listbox"
				aria-expanded={regionDropdownOpen}
			>
				<span class="block truncate">
					{#if currentFilters.region}
						{regions.find((region) => region.value === currentFilters.region)?.label ||
							'All Regions'}
					{:else}
						All Regions
					{/if}
				</span>
				<span class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
					<svg class="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
						<path
							fill-rule="evenodd"
							d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3z"
							clip-rule="evenodd"
						/>
					</svg>
				</span>
			</button>

			{#if regionDropdownOpen}
				<div
					class="ring-opacity-5 absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black focus:outline-none sm:text-sm"
				>
					<button
						type="button"
						class="w-full px-3 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none {!currentFilters.region
							? 'bg-blue-50 text-blue-900'
							: 'text-gray-900'}"
						onclick={() => toggleRegion(null)}
						onkeydown={(e) => handleKeydown(e, () => toggleRegion(null))}
					>
						<span class="font-medium">All Regions</span>
						<span class="text-gray-500">({allProjects.length})</span>
					</button>
					{#each regionCounts as region}
						<button
							type="button"
							class="w-full px-3 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none {currentFilters.region ===
							region.value
								? 'bg-blue-50 text-blue-900'
								: 'text-gray-900'}"
							onclick={() => toggleRegion(region.value)}
							onkeydown={(e) => handleKeydown(e, () => toggleRegion(region.value))}
						>
							<span class="font-medium">{region.label}</span>
							<span class="text-gray-500">({region.count})</span>
						</button>
					{/each}
				</div>
			{/if}
		</div>

		<!-- Active Filters Display -->
		{#if activeFilterCount > 0}
			<div class="border-t border-gray-200 pt-2">
				<div class="flex flex-wrap gap-2">
					{#if currentFilters.impactCategory}
						<span
							class="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800"
						>
							{impactCategories.find((cat) => cat.value === currentFilters.impactCategory)?.label}
							<button
								type="button"
								class="ml-1 inline-flex items-center rounded-full p-0.5 text-blue-400 hover:text-blue-600 focus:text-blue-600 focus:outline-none"
								onclick={() => filtersStore.setImpactCategory(null)}
								aria-label="Remove impact category filter"
							>
								<svg class="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
									<path
										fill-rule="evenodd"
										d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
										clip-rule="evenodd"
									/>
								</svg>
							</button>
						</span>
					{/if}
					{#if currentFilters.region}
						<span
							class="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800"
						>
							{regions.find((region) => region.value === currentFilters.region)?.label}
							<button
								type="button"
								class="ml-1 inline-flex items-center rounded-full p-0.5 text-green-400 hover:text-green-600 focus:text-green-600 focus:outline-none"
								onclick={() => filtersStore.setRegion(null)}
								aria-label="Remove region filter"
							>
								<svg class="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
									<path
										fill-rule="evenodd"
										d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
										clip-rule="evenodd"
									/>
								</svg>
							</button>
						</span>
					{/if}
				</div>
			</div>
		{/if}
	</div>
</div>

<!-- Enhanced mobile responsive styles -->
<style>
	/* Touch-friendly interactive elements */
	@media (max-width: 768px) {
		:global(.dropdown-container button) {
			min-height: 44px; /* Touch target size */
		}

		:global(.dropdown-container .ring-opacity-5) {
			max-height: 50vh; /* Prevent dropdowns from being too tall on mobile */
		}
	}

	/* Improve touch scrolling */
	:global(.dropdown-container .overflow-auto) {
		-webkit-overflow-scrolling: touch;
	}
</style>

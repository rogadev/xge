<script lang="ts">
	import { selectedProjectStore } from '$lib/stores/selectedProject.js';
	import type { Project } from '$lib/types';

	/**
	 * Map of impact categories to user-friendly display labels.
	 * Must stay in sync with Project interface impact category values.
	 */
	const IMPACT_CATEGORY_LABELS = {
		'renewable-energy': 'Renewable Energy',
		conservation: 'Conservation',
		'sustainable-agriculture': 'Sustainable Agriculture',
		'waste-management': 'Waste Management'
	} as const;

	/**
	 * Map of impact categories to Tailwind color classes for visual categorization.
	 * Uses distinct colors to help users quickly identify project types.
	 */
	const IMPACT_CATEGORY_COLORS = {
		'renewable-energy': 'bg-green-100 text-green-800',
		conservation: 'bg-blue-100 text-blue-800',
		'sustainable-agriculture': 'bg-amber-100 text-amber-800',
		'waste-management': 'bg-purple-100 text-purple-800'
	} as const;

	/**
	 * CSS selector for focusable elements within the modal.
	 * Used for focus trapping and initial focus management.
	 */
	const FOCUSABLE_SELECTOR =
		'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])' as const;

	/**
	 * Delay in milliseconds before focusing modal elements.
	 * Ensures DOM is fully rendered before focus management.
	 */
	const FOCUS_DELAY = 100 as const;

	let modalElement = $state<HTMLElement>();
	let previouslyFocusedElement = $state<HTMLElement | null>(null);

	let selectedProject = $derived($selectedProjectStore.selectedProject);
	let isOpen = $derived($selectedProjectStore.isOpen);

	/**
	 * Handles keyboard events for modal interaction.
	 * Closes modal on Escape key for standard user experience.
	 */
	function handleKeydown(event: KeyboardEvent): void {
		if (event.key === 'Escape' && isOpen) {
			closeModal();
		}
	}

	/**
	 * Handles backdrop clicks to close modal.
	 * Only closes when clicking the backdrop itself, not modal content.
	 */
	function handleBackdropClick(event: MouseEvent): void {
		if (event.target === event.currentTarget) {
			closeModal();
		}
	}

	/**
	 * Closes the modal and restores focus to the previously focused element.
	 * Essential for accessibility and smooth user experience.
	 */
	function closeModal(): void {
		selectedProjectStore.closeModal();
		restoreFocus();
	}

	/**
	 * Restores focus to the element that was focused before modal opened.
	 * Critical for screen reader users and keyboard navigation.
	 */
	function restoreFocus(): void {
		if (previouslyFocusedElement) {
			previouslyFocusedElement.focus();
			previouslyFocusedElement = null;
		}
	}

	/**
	 * Converts impact category value to user-friendly display label.
	 * Provides fallback for unknown categories to prevent breaking UI.
	 */
	function getImpactCategoryLabel(category: Project['impactCategory']): string {
		return IMPACT_CATEGORY_LABELS[category] || category;
	}

	/**
	 * Gets Tailwind color classes for impact category visual styling.
	 * Provides neutral fallback for unknown categories.
	 */
	function getImpactCategoryColor(category: Project['impactCategory']): string {
		return IMPACT_CATEGORY_COLORS[category] || 'bg-gray-100 text-gray-800';
	}

	/**
	 * Manages focus when modal opens for accessibility compliance.
	 * Stores previous focus and moves focus to first interactive element.
	 */
	$effect(() => {
		if (isOpen && modalElement) {
			previouslyFocusedElement = document.activeElement as HTMLElement;

			setTimeout(() => {
				if (!modalElement) return;

				const firstFocusable = modalElement.querySelector(FOCUSABLE_SELECTOR) as HTMLElement;
				if (firstFocusable) {
					firstFocusable.focus();
				} else {
					modalElement.focus();
				}
			}, FOCUS_DELAY);
		}
	});

	/**
	 * Prevents background scrolling when modal is open.
	 * Maintains scroll position and restores on close for better UX.
	 */
	$effect(() => {
		if (typeof window !== 'undefined') {
			if (isOpen) {
				document.body.style.overflow = 'hidden';
			} else {
				document.body.style.overflow = '';
			}
		}

		return () => {
			if (typeof window !== 'undefined') {
				document.body.style.overflow = '';
			}
		};
	});
</script>

<!--
	@fileoverview Accessible modal dialog for displaying detailed climate project information.
	Implements ARIA compliance, focus management, keyboard navigation, and scroll lock.
	Features responsive design with mobile-optimized touch targets and smooth animations.
	
	@component ProjectModal
	@example
	```svelte
	<ProjectModal />
	<!-- Opens automatically when selectedProjectStore has a project -->
``` -->

<svelte:window onkeydown={handleKeydown} />

{#if isOpen && selectedProject}
	<!-- Modal backdrop -->
	<div
		class="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black p-4 backdrop-blur-sm"
		onclick={handleBackdropClick}
		onkeydown={handleKeydown}
		role="dialog"
		aria-modal="true"
		aria-labelledby="modal-title"
		aria-describedby="modal-description"
		tabindex="0"
	>
		<!-- Modal content -->
		<div
			bind:this={modalElement}
			class="relative mx-4 max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-lg bg-white shadow-xl sm:mx-0"
			tabindex="-1"
		>
			<!-- Header -->
			<div class="flex items-start justify-between border-b border-gray-200 p-4 sm:p-6">
				<div class="min-w-0 flex-1">
					<h2 id="modal-title" class="pr-4 text-xl font-semibold text-gray-900">
						{selectedProject.title}
					</h2>
					<div class="mt-2 flex items-center gap-2">
						<span
							class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {getImpactCategoryColor(
								selectedProject.impactCategory
							)}"
						>
							{getImpactCategoryLabel(selectedProject.impactCategory)}
						</span>
						{#if selectedProject.verified}
							<span
								class="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800"
							>
								<svg class="mr-1 h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
									<path
										fill-rule="evenodd"
										d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
										clip-rule="evenodd"
									/>
								</svg>
								Verified
							</span>
						{/if}
					</div>
				</div>
				<button
					type="button"
					class="rounded-md bg-white text-gray-400 hover:text-gray-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
					onclick={closeModal}
					aria-label="Close modal"
				>
					<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M6 18L18 6M6 6l12 12"
						/>
					</svg>
				</button>
			</div>

			<!-- Content -->
			<div
				class="max-h-[50vh] overflow-y-auto p-4 sm:max-h-[60vh] sm:p-6"
				style="-webkit-overflow-scrolling: touch;"
			>
				<div id="modal-description" class="space-y-4">
					<div>
						<h3 class="mb-2 text-sm font-medium text-gray-900">Description</h3>
						<p class="leading-relaxed text-gray-700">{selectedProject.description}</p>
					</div>

					{#if selectedProject.source}
						<div>
							<h3 class="mb-2 text-sm font-medium text-gray-900">Source</h3>
							<p class="text-gray-700">{selectedProject.source}</p>
						</div>
					{/if}

					{#if selectedProject.dateVerified}
						<div>
							<h3 class="mb-2 text-sm font-medium text-gray-900">Last Verified</h3>
							<p class="text-gray-700">
								{new Date(selectedProject.dateVerified).toLocaleDateString()}
							</p>
						</div>
					{/if}

					<div>
						<h3 class="mb-2 text-sm font-medium text-gray-900">Location</h3>
						<p class="text-gray-700">
							Coordinates: {selectedProject.coordinates[1].toFixed(4)}, {selectedProject.coordinates[0].toFixed(
								4
							)}
						</p>
					</div>
				</div>
			</div>

			<!-- Footer -->
			<div
				class="flex flex-col items-center justify-between gap-3 border-t border-gray-200 bg-gray-50 p-4 sm:flex-row sm:gap-0 sm:p-6"
			>
				<div class="flex w-full items-center justify-center space-x-4 sm:w-auto sm:justify-start">
					{#if selectedProject.url}
						<a
							href={selectedProject.url}
							target="_blank"
							rel="noopener noreferrer"
							class="inline-flex min-h-[44px] touch-manipulation items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
						>
							<svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
								/>
							</svg>
							Learn More
						</a>
					{/if}
				</div>
				<button
					type="button"
					class="min-h-[44px] w-full touch-manipulation rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none sm:w-auto"
					onclick={closeModal}
				>
					Close
				</button>
			</div>
		</div>
	</div>
{/if}

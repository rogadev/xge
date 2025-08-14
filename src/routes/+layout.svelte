<!--
	@fileoverview Root layout component for the XGE Climate Explorer application.
	Provides global styles, favicon configuration, and base document structure.
	Serves as the foundation for all pages with consistent styling and metadata.
	
	@component RootLayout
	@layout root
-->
<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.png';
	import type { Snippet } from 'svelte';

	/**
	 * Props interface for the root layout component.
	 */
	interface Props {
		/** Child pages to render within this layout */
		children?: Snippet;
	}

	let { children }: Props = $props();
</script>

<!--
	Document head configuration for consistent branding and functionality.
	Favicon is imported as a module for proper Vite asset handling and optimization.
-->
<svelte:head>
	<!-- 
		Favicon configuration using Vite asset imports for proper versioning.
		This overrides any favicon set in app.html for dynamic control.
	-->
	<link rel="icon" href={favicon} type="image/png" />

	<!-- 
		Document title configuration.
		Can be overridden by individual pages using svelte:head.
	-->
	<title>XGE Climate Explorer</title>

	<!-- 
		Meta description for SEO and social sharing.
		Pages can override this with more specific descriptions.
	-->
	<meta
		name="description"
		content="Explore verified climate action projects across Canada through an interactive map interface. Discover renewable energy, conservation, sustainable agriculture, and waste management initiatives."
	/>

	<!-- 
		Additional Open Graph metadata for enhanced social sharing.
		Provides rich previews when links are shared on social platforms.
	-->
	<meta property="og:title" content="XGE Climate Explorer" />
	<meta
		property="og:description"
		content="Interactive map showcasing climate action projects across Canada"
	/>
	<meta property="og:image" content={favicon} />
	<meta property="og:url" content="https://xge-climate-explorer.vercel.app" />

	<!-- 
		Twitter Card metadata for Twitter-specific link previews.
	-->
	<meta name="twitter:card" content="summary" />
	<meta name="twitter:title" content="XGE Climate Explorer" />
	<meta
		name="twitter:description"
		content="Interactive map showcasing climate action projects across Canada"
	/>
	<meta name="twitter:image" content={favicon} />

	<!-- 
		Canonical URL for SEO to prevent duplicate content issues.
		Should be overridden by individual pages with their specific URLs.
	-->
	<link rel="canonical" href="https://xge-climate-explorer.vercel.app" />
</svelte:head>

<!--
	Main content area where page-specific content is rendered.
	The optional chaining ensures graceful handling if children is undefined.
-->
{@render children?.()}

<!--
	Layout Architecture Notes:
	
	1. Global Styles: The app.css import provides consistent styling across all pages
	   including Tailwind CSS, Mapbox styles, and custom utilities.
	
	2. Asset Management: Favicon is imported as a module for proper Vite handling,
	   ensuring optimized loading and correct versioning in production builds.
	
	3. SEO Foundation: Base metadata is configured here but can be overridden by
	   individual pages for more specific or dynamic content.
	
	4. Social Sharing: Open Graph and Twitter Card metadata ensure rich previews
	   when the application is shared on social platforms.
	
	5. Performance: Minimal layout keeps the bundle size small and ensures fast
	   initial page loads for the map-heavy application.
	
	6. Accessibility: The layout maintains semantic structure without interfering
	   with page-specific accessibility implementations.
-->

/**
 * @fileoverview General utility functions for common operations throughout the XGE application.
 * Provides performance optimizations, formatting helpers, and type-safe utility functions
 * that can be used across components and stores.
 */

import type { Project } from '$lib/types';

/**
 * Creates a debounced version of a function that delays execution until after
 * the specified delay has elapsed since the last invocation. Essential for
 * performance optimization with frequent operations like filtering and search.
 * 
 * @template T - The function type to debounce
 * @param func - The function to debounce
 * @param delay - The delay in milliseconds (recommended: 300ms for filters, 500ms for search)
 * @returns A debounced version of the function that maintains the original signature
 * 
 * @example
 * ```typescript
 * const debouncedFilter = debounce((query: string) => {
 *   performExpensiveFilter(query);
 * }, 300);
 * ```
 */
export function debounce<T extends (...args: any[]) => void>(func: T, delay: number): T {
  let timeoutId: ReturnType<typeof setTimeout>;
  return ((...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  }) as T;
}

/**
 * Formats geographic coordinates for user display.
 * Converts [longitude, latitude] array to readable string format.
 * 
 * @param coords - Coordinate tuple in [longitude, latitude] format
 * @returns Formatted string as "latitude, longitude" with 4 decimal precision
 * 
 * @example
 * ```typescript
 * formatCoordinates([-106.3468, 56.1304]); // "56.1304, -106.3468"
 * ```
 */
export function formatCoordinates(coords: [number, number]): string {
  const [longitude, latitude] = coords;
  return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
}

/**
 * Converts kebab-case impact category values to user-friendly display labels.
 * Handles the standard climate project impact categories.
 * 
 * @param category - The impact category in kebab-case format
 * @returns Human-readable category label with proper capitalization
 * 
 * @example
 * ```typescript
 * formatImpactCategory('renewable-energy'); // "Renewable Energy"
 * formatImpactCategory('waste-management'); // "Waste Management"
 * ```
 */
export function formatImpactCategory(category: string): string {
  return category
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Removes duplicate items from an array based on a key function.
 * Maintains the first occurrence of each unique item.
 * 
 * @template T - The array item type
 * @param array - The array to deduplicate
 * @param keyFn - Function that extracts the unique key from each item
 * @returns New array with duplicates removed
 * 
 * @example
 * ```typescript
 * const projects = [
 *   { id: '1', title: 'Project A' },
 *   { id: '2', title: 'Project B' },
 *   { id: '1', title: 'Project A Duplicate' }
 * ];
 * uniqueBy(projects, p => p.id); // Returns first two projects only
 * ```
 */
export function uniqueBy<T>(array: T[], keyFn: (item: T) => string | number): T[] {
  const seen = new Set<string | number>();
  return array.filter(item => {
    const key = keyFn(item);
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

/**
 * Formats a date string for user display.
 * Converts ISO date string to locale-appropriate format.
 * 
 * @param dateString - ISO date string (YYYY-MM-DD format)
 * @returns Locale-formatted date string, or "Invalid date" for malformed input
 * 
 * @example
 * ```typescript
 * formatDate('2024-01-15'); // "1/15/2024" (US locale)
 * formatDate('invalid'); // "Invalid date"
 * ```
 */
export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }
    return date.toLocaleDateString();
  } catch {
    return 'Invalid date';
  }
}

/**
 * Calculates the distance between two geographic coordinates using the Haversine formula.
 * Returns approximate distance in kilometers.
 * 
 * @param coord1 - First coordinate as [longitude, latitude]
 * @param coord2 - Second coordinate as [longitude, latitude]
 * @returns Distance in kilometers (rounded to 1 decimal place)
 * 
 * @example
 * ```typescript
 * const toronto = [-79.3832, 43.6532];
 * const vancouver = [-123.1207, 49.2827];
 * calculateDistance(toronto, vancouver); // ~3356.1
 * ```
 */
export function calculateDistance(coord1: [number, number], coord2: [number, number]): number {
  const [lon1, lat1] = coord1;
  const [lon2, lat2] = coord2;

  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 10) / 10; // Round to 1 decimal place
}

/**
 * Converts degrees to radians for geographic calculations.
 * 
 * @param degrees - Angle in degrees
 * @returns Angle in radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Safely truncates text to a specified length with ellipsis.
 * Preserves word boundaries when possible.
 * 
 * @param text - The text to truncate
 * @param maxLength - Maximum length before truncation
 * @returns Truncated text with ellipsis if needed
 * 
 * @example
 * ```typescript
 * truncateText('This is a very long description', 20); 
 * // "This is a very long..."
 * ```
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }

  const truncated = text.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');

  // If there's a space within the last 10 characters, break at word boundary
  if (lastSpace > maxLength - 10) {
    return truncated.slice(0, lastSpace) + '...';
  }

  return truncated + '...';
}

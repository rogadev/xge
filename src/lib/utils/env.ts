/**
 * Environment variable utilities for the XGE Project Explorer
 */

import { PUBLIC_MAPBOX_ACCESS_TOKEN } from '$env/static/public';

/**
 * Get the Mapbox access token from environment variables
 * @throws Error if token is not configured
 */
export function getMapboxToken(): string {
  if (!PUBLIC_MAPBOX_ACCESS_TOKEN) {
    throw new Error('PUBLIC_MAPBOX_ACCESS_TOKEN environment variable is not configured');
  }
  return PUBLIC_MAPBOX_ACCESS_TOKEN;
}

/**
 * Validate that all required environment variables are present
 * @returns boolean indicating if all required env vars are configured
 */
export function validateEnvironment(): boolean {
  try {
    getMapboxToken();
    return true;
  } catch {
    return false;
  }
}

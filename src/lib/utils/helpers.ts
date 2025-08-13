/**
 * General utility functions for common operations
 */

/**
 * Creates a debounced version of a function that delays invoking func until
 * after `delay` milliseconds have elapsed since the last time the debounced
 * function was invoked.
 * 
 * @param func - The function to debounce
 * @param delay - The number of milliseconds to delay
 * @returns A debounced version of the function
 */
export function debounce<T extends (...args: any[]) => void>(func: T, delay: number): T {
  let timeoutId: ReturnType<typeof setTimeout>;
  return ((...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  }) as T;
}

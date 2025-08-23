/**
 * Hydration utilities for the company management app
 */

/**
 * Check if we're running on the client side
 */
export const isClient = () => typeof window !== 'undefined';

/**
 * Check if we're running on the server side
 */
export const isServer = () => typeof window === 'undefined';

/**
 * Get a value that's consistent between server and client renders
 * @param serverValue - Value to use on server
 * @param clientValue - Value to use on client (after hydration)
 */
export const getHydrationSafeValue = <T>(serverValue: T, clientValue: T): T => {
  return isClient() ? clientValue : serverValue;
};

/**
 * Suppress hydration warnings for specific elements that may have differences
 * This should be used sparingly and only when necessary
 */
export const suppressHydrationWarning = {
  suppressHydrationWarning: true
} as const;
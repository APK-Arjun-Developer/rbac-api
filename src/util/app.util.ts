/**
 * Checks if value is null
 */
export function isNull(value: unknown): value is null {
  return value === null;
}

/**
 * Checks if value is undefined
 */
export function isUndefined(value: unknown): value is undefined {
  return value === undefined;
}

/**
 * Checks if value is either null OR undefined
 */
export function isNullOrUndefined(value: unknown): boolean {
  return value === null || value === undefined;
}

/**
 * Checks if value is NOT null AND NOT undefined
 */
export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

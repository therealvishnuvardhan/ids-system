/**
 * Math utilities for animation effects.
 */

/**
 * Returns a random integer between min and max (inclusive).
 */
export const randomInt = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min + 1)) + min

/**
 * Returns a random float using a logarithmic distribution between min and max.
 * This biases values toward the lower end of the range.
 */
export const randomLog = (min: number, max: number): number => {
  const logMin = Math.log(min)
  const logMax = Math.log(max)
  return Math.exp(logMin + Math.random() * (logMax - logMin))
}

/**
 * Proper modulo that always returns a non-negative result.
 */
export const mod = (n: number, m: number): number => ((n % m) + m) % m

/**
 * Returns true if the element is in the viewport.
 */
export const isInView = (el: HTMLElement | null): boolean => {
  if (!el) return false
  const rect = el.getBoundingClientRect()
  return (
    rect.top < window.innerHeight &&
    rect.bottom > 0 &&
    rect.left < window.innerWidth &&
    rect.right > 0
  )
}

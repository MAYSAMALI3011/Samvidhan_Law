export function delay(ms = 90): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

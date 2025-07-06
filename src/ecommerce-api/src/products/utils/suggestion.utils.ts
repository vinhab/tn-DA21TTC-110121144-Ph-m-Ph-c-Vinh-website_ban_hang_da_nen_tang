export function getSuggestedCategories(mainCategory: string): string[] {
  const map: Record<string, string[]> = {
    laptop: ['monitor', 'mouse', 'keyboard', 'accessory'],
    pc: ['monitor', 'mouse', 'keyboard'],
    monitor: ['pc', 'accessory'],
    mouse: ['keyboard', 'mousepad'],
    keyboard: ['mouse', 'mousepad', 'led'],
  }

  return map[mainCategory] || []
}

/**
 * Asset Resolution Utilities
 * Functions for resolving images and videos from glob imports
 */

/**
 * Get image from glob import by name
 * @param folder_name - Subfolder within assets (or empty string for root)
 * @param image_name - Name of the image file (without extension)
 * @param glob - Result of import.meta.glob('@assets/...')
 * @returns Image default export or null if not found
 */
export function getImage({
  folder_name,
  image_name,
  glob
}: {
  image_name: string;
  folder_name: string;
  glob: Record<string, {default: any;}>
}): any {
  for (const path in glob) {
    if (path.includes(image_name)) {
      return glob[path].default;
    }
  }
  return null;
}

/**
 * Convert TinaCMS string paths to proper Astro image imports
 * Handles both imported image objects and TinaCMS string paths
 * @param imagePath - Either an imported image object or a string path from TinaCMS
 * @returns Resolved image object or null
 */
export function resolveImagePath(imagePath: any): any {
  // If it's already an imported image object, return it
  if (typeof imagePath === 'object' && imagePath !== null && 'src' in imagePath) {
    return imagePath;
  }

  // If it's a TinaCMS string path like "/assets/image.jpg"
  if (typeof imagePath === 'string' && imagePath.startsWith('/assets/')) {
    const imageName = imagePath.replace('/assets/', '');
    try {
      const images = import.meta.glob('/src/assets/*.*', { eager: true });
      const resolvedPath = `/src/assets/${imageName}`;
      const imageModule = images[resolvedPath];
      return imageModule?.default || null;
    } catch (e) {
      console.error(`Failed to resolve image: ${imagePath}`, e);
      return null;
    }
  }

  // Return as-is for other cases
  return imagePath;
}

/**
 * Autoplay Video Handler
 *
 * Ensures background autoplay videos restart when:
 * - Page is restored from browser back/forward cache (bfcache)
 * - Page becomes visible after being hidden
 *
 * This script only affects videos with the autoplay attribute.
 * Interactive videos with custom controls should handle their own playback.
 */

function restartAutoplayVideos() {
  // Find all videos with autoplay attribute
  const autoplayVideos = document.querySelectorAll('video[autoplay]');

  console.log('Found autoplay videos:', autoplayVideos.length);

  autoplayVideos.forEach((video, index) => {
    const videoElement = video as HTMLVideoElement;

    console.log(`Video ${index}:`, {
      paused: videoElement.paused,
      src: videoElement.currentSrc,
      parent: videoElement.parentElement?.className
    });

    // Only restart if video is paused
    // This prevents interrupting videos that are already playing
    if (videoElement.paused) {
      // Small delay to ensure smooth restoration
      setTimeout(() => {
        videoElement.play().then(() => {
          console.log(`Video ${index} started playing`);
        }).catch((error) => {
          // Silently catch play errors (e.g., user interaction required)
          // This is expected behavior in some browsers
          console.warn(`Autoplay video ${index} restart prevented:`, error);
        });
      }, 100);
    }
  });
}

// Handle page restoration from bfcache (back/forward navigation)
window.addEventListener('pageshow', (event) => {
  // event.persisted is true when page is restored from bfcache
  if (event.persisted) {
    restartAutoplayVideos();
  }
});

// Handle page visibility changes (tab switching)
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    restartAutoplayVideos();
  }
});

// Export for potential manual use
export { restartAutoplayVideos };

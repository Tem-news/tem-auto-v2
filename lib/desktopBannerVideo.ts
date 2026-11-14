// Desktop only: hidden mobile banners must not consume video decoders.
export function manageDesktopBannerVideo(video: HTMLVideoElement, source: string, stopped: boolean, onBlocked: () => void) {
  if (!window.matchMedia('(min-width: 768px)').matches) return () => {}
  let alive = true
  let requesting = false
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
  const sync = () => {
    if (!alive) return
    // A resized window must retain the original mobile playback behavior.
    const desktop = window.matchMedia('(min-width: 768px)').matches
    const rect = video.getBoundingClientRect()
    const visible = !document.hidden && (!desktop || (
      rect.width > 0 && rect.height > 0 && rect.bottom > 0 &&
      rect.right > 0 && rect.top < window.innerHeight && rect.left < window.innerWidth
    ))
    if (!visible) {
      video.pause()
      if (video.hasAttribute('src')) { video.removeAttribute('src'); video.load() }
      return
    }
    if (video.getAttribute('src') !== source) {
      video.preload = desktop ? 'auto' : 'metadata'
      video.src = source
      video.load()
    } else if (desktop) video.preload = 'auto'
    video.muted = true
    if (stopped || reducedMotion.matches) { video.pause(); return }
    // Play after frames are available, rather than only during React ref setup.
    if (video.readyState < 2 || !video.paused || requesting) return
    requesting = true
    void video.play().then(() => { requesting = false }).catch(() => {
      requesting = false
      if (alive && video.hasAttribute('src')) onBlocked()
    })
  }
  const observer = typeof IntersectionObserver === 'undefined' ? null : new IntersectionObserver(sync)
  observer?.observe(video)
  video.addEventListener('loadeddata', sync)
  video.addEventListener('canplay', sync)
  document.addEventListener('visibilitychange', sync)
  window.addEventListener('resize', sync)
  reducedMotion.addEventListener('change', sync)
  sync()
  return () => {
    alive = false
    observer?.disconnect()
    video.removeEventListener('loadeddata', sync)
    video.removeEventListener('canplay', sync)
    document.removeEventListener('visibilitychange', sync)
    window.removeEventListener('resize', sync)
    reducedMotion.removeEventListener('change', sync)
    video.pause()
  }
}

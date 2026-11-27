import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Play } from 'lucide-react';
import companyVideoCover from '../../assets/company-presentation-cover.webp';

interface ServicesVideoShowcaseProps {
  /** Optional local asset path, for example `/videos/ziyotech-services.mp4`. */
  source?: string;
}

type PlaybackRequest = 'manual' | 'automatic';

export const ServicesVideoShowcase: React.FC<ServicesVideoShowcaseProps> = ({ source }) => {
  const [hasStarted, setHasStarted] = useState(false);
  const [coverVisible, setCoverVisible] = useState(true);
  const [playbackError, setPlaybackError] = useState(false);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hasStartedRef = useRef(false);
  const autoPausedRef = useRef(false);
  const autoPauseInProgressRef = useRef(false);
  const manualPausedRef = useRef(false);
  const playbackErrorRef = useRef(false);
  const playPendingRef = useRef(false);
  const deferredPlayRef = useRef<PlaybackRequest | null>(null);
  const playbackRequestIdRef = useRef(0);
  const hoverCapableRef = useRef(false);
  const pointerInsideRef = useRef(false);

  const isImmersivePlayback = useCallback((video: HTMLVideoElement) => {
    const container = videoContainerRef.current;
    const fullscreenElement = document.fullscreenElement;
    const webkitPresentationMode = (video as HTMLVideoElement & { webkitPresentationMode?: string }).webkitPresentationMode;

    return Boolean(
      (fullscreenElement && (fullscreenElement === video || container?.contains(fullscreenElement))) ||
      document.pictureInPictureElement === video ||
      webkitPresentationMode === 'picture-in-picture',
    );
  }, []);

  const requestPlayback = useCallback(async (request: PlaybackRequest) => {
    const video = videoRef.current;
    if (!video || !source) return;

    if (request === 'automatic') {
      if (!hoverCapableRef.current || !hasStartedRef.current || !autoPausedRef.current || manualPausedRef.current) return;
    } else {
      if (!hasStartedRef.current || video.ended) video.currentTime = 0;
      hasStartedRef.current = true;
      setHasStarted(true);
      manualPausedRef.current = false;
      autoPausedRef.current = false;
    }

    if (autoPauseInProgressRef.current) {
      deferredPlayRef.current = request;
      return;
    }
    if (playPendingRef.current) return;

    const requestId = ++playbackRequestIdRef.current;
    playPendingRef.current = true;
    playbackErrorRef.current = false;
    setPlaybackError(false);
    video.muted = false;

    try {
      await video.play();
      if (requestId !== playbackRequestIdRef.current) return;

      playPendingRef.current = false;
      autoPausedRef.current = false;
      manualPausedRef.current = false;
      setHasStarted(true);
      hasStartedRef.current = true;
      setCoverVisible(false);
    } catch {
      if (requestId !== playbackRequestIdRef.current) return;

      playPendingRef.current = false;
      playbackErrorRef.current = true;
      manualPausedRef.current = true;
      autoPausedRef.current = false;
      setPlaybackError(true);
      setCoverVisible(true);
    }
  }, [source]);

  const finishAutomaticPause = useCallback(() => {
    autoPauseInProgressRef.current = false;
    autoPausedRef.current = true;
    setCoverVisible(true);

    const deferredRequest = deferredPlayRef.current;
    deferredPlayRef.current = null;
    if (deferredRequest === 'manual' || (deferredRequest === 'automatic' && pointerInsideRef.current)) {
      queueMicrotask(() => void requestPlayback(deferredRequest));
    }
  }, [requestPlayback]);

  const pauseForPointerLeave = useCallback(() => {
    const video = videoRef.current;
    if (!video || !hasStartedRef.current || manualPausedRef.current || isImmersivePlayback(video)) return;
    if (video.paused && !playPendingRef.current) return;

    playbackRequestIdRef.current += 1;
    playPendingRef.current = false;
    autoPausedRef.current = true;
    setCoverVisible(true);

    if (video.paused) {
      finishAutomaticPause();
      return;
    }

    autoPauseInProgressRef.current = true;
    video.pause();
  }, [finishAutomaticPause, isImmersivePlayback]);

  const handlePointerEnter = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!hoverCapableRef.current || event.pointerType === 'touch') return;
    pointerInsideRef.current = true;
    if (hasStartedRef.current && autoPausedRef.current && !manualPausedRef.current) {
      void requestPlayback('automatic');
    }
  };

  const handlePointerLeave = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!hoverCapableRef.current || event.pointerType === 'touch') return;
    pointerInsideRef.current = false;
    deferredPlayRef.current = null;
    pauseForPointerLeave();
  };

  const handleVideoPlay = () => {
    if (autoPauseInProgressRef.current) {
      videoRef.current?.pause();
      return;
    }
    hasStartedRef.current = true;
    autoPausedRef.current = false;
    manualPausedRef.current = false;
    playbackErrorRef.current = false;
    setHasStarted(true);
    setPlaybackError(false);
    setCoverVisible(false);
  };

  const handleVideoPause = () => {
    const video = videoRef.current;
    if (autoPauseInProgressRef.current) {
      finishAutomaticPause();
      return;
    }
    if (!video || video.ended || playbackErrorRef.current) return;

    manualPausedRef.current = true;
    autoPausedRef.current = false;
  };

  const handleVideoEnded = () => {
    const video = videoRef.current;
    if (video) video.currentTime = 0;
    playbackRequestIdRef.current += 1;
    hasStartedRef.current = false;
    autoPausedRef.current = false;
    autoPauseInProgressRef.current = false;
    manualPausedRef.current = false;
    playbackErrorRef.current = false;
    playPendingRef.current = false;
    deferredPlayRef.current = null;
    setHasStarted(false);
    setPlaybackError(false);
    setCoverVisible(true);
  };

  const handleVideoError = () => {
    playbackRequestIdRef.current += 1;
    playPendingRef.current = false;
    playbackErrorRef.current = true;
    manualPausedRef.current = true;
    autoPausedRef.current = false;
    setPlaybackError(true);
    setCoverVisible(true);
    videoRef.current?.pause();
  };

  const handleImmersiveExit = useCallback(() => {
    const video = videoRef.current;
    if (video && !isImmersivePlayback(video) && !pointerInsideRef.current) pauseForPointerLeave();
  }, [isImmersivePlayback, pauseForPointerLeave]);

  useEffect(() => {
    const hoverQuery = window.matchMedia('(hover: hover) and (pointer: fine)');
    const updateHoverCapability = () => {
      hoverCapableRef.current = hoverQuery.matches;
      if (!hoverQuery.matches) pointerInsideRef.current = false;
    };
    const video = videoRef.current;

    updateHoverCapability();
    hoverQuery.addEventListener('change', updateHoverCapability);
    document.addEventListener('fullscreenchange', handleImmersiveExit);
    video?.addEventListener('leavepictureinpicture', handleImmersiveExit);

    return () => {
      hoverQuery.removeEventListener('change', updateHoverCapability);
      document.removeEventListener('fullscreenchange', handleImmersiveExit);
      video?.removeEventListener('leavepictureinpicture', handleImmersiveExit);
      playbackRequestIdRef.current += 1;
      video?.pause();
    };
  }, [handleImmersiveExit]);

  return (
    <section aria-label="ZiyoTech services video showcase" className="mt-16">
      <div className="rounded-[32px] border border-slate-800 bg-linear-to-r from-slate-900 via-[#0a1521] to-[#07121d] p-5 sm:p-7 lg:p-10">
        <div
          ref={videoContainerRef}
          onPointerEnter={handlePointerEnter}
          onPointerLeave={handlePointerLeave}
          className="relative aspect-video w-full overflow-hidden rounded-2xl border border-slate-700/80 bg-slate-950/60"
        >
          {source ? (
            <>
              <video
                ref={videoRef}
                className="absolute inset-0 h-full w-full object-contain"
                src={source}
                controls={hasStarted && !coverVisible}
                playsInline
                preload="none"
                onPlay={handleVideoPlay}
                onPause={handleVideoPause}
                onEnded={handleVideoEnded}
                onError={handleVideoError}
                aria-label="ZiyoTech company presentation video"
              />
              <img
                src={companyVideoCover}
                alt=""
                aria-hidden="true"
                className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 motion-reduce:transition-none motion-reduce:duration-0 ${coverVisible ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
              />
              {coverVisible && (
                <button
                  type="button"
                  aria-label="Play company video"
                  onClick={() => void requestPlayback('manual')}
                  className="group absolute left-1/2 top-1/2 z-10 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-slate-950/30 text-white shadow-lg shadow-slate-950/30 transition duration-200 hover:scale-105 hover:bg-slate-950/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 motion-reduce:transition-none motion-reduce:duration-0"
                >
                  <Play aria-hidden="true" className="ml-1 h-7 w-7 fill-current drop-shadow-md" />
                </button>
              )}
              <span className="sr-only" role="status" aria-live="polite">
                {playbackError ? 'Video playback could not start. Activate Play company video to try again.' : ''}
              </span>
            </>
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-3 px-4 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-blue-400/30 bg-blue-500/10 text-blue-300 sm:h-14 sm:w-14">
                <Play className="ml-0.5 h-5 w-5 sm:h-6 sm:w-6" aria-hidden="true" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white sm:text-lg">Our Services in Motion</h3>
                <p className="mt-1 text-xs text-slate-400 sm:text-sm">Video coming soon</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

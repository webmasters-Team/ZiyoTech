import React, { useEffect, useRef, useState } from 'react';
import { Play } from 'lucide-react';

interface ServicesVideoShowcaseProps {
  /** Optional local asset path, for example `/videos/ziyotech-services.mp4`. */
  source?: string;
}

export const ServicesVideoShowcase: React.FC<ServicesVideoShowcaseProps> = ({ source }) => {
  const [failedSource, setFailedSource] = useState<string | null>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hasVideo = Boolean(source) && failedSource !== source;

  useEffect(() => {
    setFailedSource(null);
  }, [source]);

  useEffect(() => {
    const container = videoContainerRef.current;
    const video = videoRef.current;
    if (!container || !video || !hasVideo) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if ((entry.intersectionRatio < 0.5 || !entry.isIntersecting) && document.fullscreenElement !== video) {
          video.pause();
        }
      },
      { threshold: 0.5 },
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, [hasVideo, source]);

  const pauseWhenPointerLeaves = () => {
    const video = videoRef.current;
    if (video && document.fullscreenElement !== video) video.pause();
  };

  return (
    <section aria-label="ZiyoTech services video showcase" className="mt-16">
      <div className="rounded-[32px] border border-slate-800 bg-linear-to-r from-slate-900 via-[#0a1521] to-[#07121d] p-5 sm:p-7 lg:p-10">
        <div
          ref={videoContainerRef}
          onMouseLeave={pauseWhenPointerLeaves}
          className="aspect-video w-full overflow-hidden rounded-2xl border border-slate-700/80 bg-slate-950/60"
        >
          {hasVideo ? (
            <video
              ref={videoRef}
              className="h-full w-full object-contain"
              src={source}
              controls
              playsInline
              preload="metadata"
              onError={() => setFailedSource(source || null)}
              aria-label="ZiyoTech services video"
            />
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

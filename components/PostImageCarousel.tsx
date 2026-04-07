import React, { useEffect, useMemo, useRef, useState } from 'react';
import { LucideChevronLeft, LucideChevronRight, LucideX } from 'lucide-react';
import { TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch';

interface PostImageCarouselProps {
  images: string[];
  imageClassName?: string;
}

export const PostImageCarousel: React.FC<PostImageCarouselProps> = ({
  images,
  imageClassName = 'max-h-[360px]',
}) => {
  const safeImages = useMemo(() => images.filter(Boolean), [images]);
  const carouselRef = useRef<HTMLDivElement | null>(null);
  const [index, setIndex] = useState(0);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [safeImages.length]);

  if (!safeImages.length) return null;

  const goTo = (nextIndex: number) => {
    const el = carouselRef.current;
    if (!el) return;
    const bounded = Math.max(0, Math.min(nextIndex, safeImages.length - 1));
    el.scrollTo({ left: bounded * el.clientWidth, behavior: 'smooth' });
    setIndex(bounded);
  };

  const handleScroll = () => {
    const el = carouselRef.current;
    if (!el) return;
    const next = Math.round(el.scrollLeft / el.clientWidth);
    setIndex(next);
  };

  const openViewer = (startIndex: number) => {
    setViewerIndex(startIndex);
    setViewerOpen(true);
  };

  const nextViewer = () => {
    setViewerIndex((prev) => (prev + 1) % safeImages.length);
  };

  const prevViewer = () => {
    setViewerIndex((prev) => (prev - 1 + safeImages.length) % safeImages.length);
  };

  return (
    <>
      <div className="relative">
        <div
          ref={carouselRef}
          onScroll={handleScroll}
          className="flex snap-x snap-mandatory overflow-x-auto rounded-lg scroll-smooth"
        >
          {safeImages.map((imageUrl, imgIndex) => (
            <button
              key={`${imageUrl}-${imgIndex}`}
              type="button"
              onClick={() => openViewer(imgIndex)}
              className="w-full shrink-0 snap-start"
            >
              <img
                src={imageUrl}
                className={`w-full rounded-lg object-cover ${imageClassName}`}
                alt={`Imagem ${imgIndex + 1} do post`}
                loading="lazy"
                decoding="async"
              />
            </button>
          ))}
        </div>

        {safeImages.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => goTo(index - 1)}
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/55 p-1.5 text-white"
            >
              <LucideChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={() => goTo(index + 1)}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/55 p-1.5 text-white"
            >
              <LucideChevronRight size={18} />
            </button>

            <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full bg-black/45 px-2 py-1">
              {safeImages.map((_, dotIndex) => (
                <button
                  key={`dot-${dotIndex}`}
                  type="button"
                  onClick={() => goTo(dotIndex)}
                  className={`h-1.5 w-1.5 rounded-full ${dotIndex === index ? 'bg-white' : 'bg-white/45'}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {viewerOpen && (
        <div className="fixed inset-0 z-[100] bg-black/95">
          <button
            type="button"
            onClick={() => setViewerOpen(false)}
            className="absolute right-4 top-4 z-[110] rounded-full bg-black/50 p-2 text-white"
          >
            <LucideX size={20} />
          </button>

          {safeImages.length > 1 && (
            <>
              <button
                type="button"
                onClick={prevViewer}
                className="absolute left-3 top-1/2 z-[110] -translate-y-1/2 rounded-full bg-black/60 p-2 text-white"
              >
                <LucideChevronLeft size={20} />
              </button>
              <button
                type="button"
                onClick={nextViewer}
                className="absolute right-3 top-1/2 z-[110] -translate-y-1/2 rounded-full bg-black/60 p-2 text-white"
              >
                <LucideChevronRight size={20} />
              </button>
            </>
          )}

          <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
            <TransformWrapper
              key={safeImages[viewerIndex]}
              initialScale={1}
              minScale={1}
              maxScale={5}
              wheel={{ step: 0.2 }}
              doubleClick={{ mode: 'zoomIn', step: 1 }}
              pinch={{ step: 5 }}
              panning={{ velocityDisabled: true }}
            >
              <TransformComponent
                wrapperClass="!w-full !h-full"
                contentClass="!w-full !h-full flex items-center justify-center"
              >
                <img
                  src={safeImages[viewerIndex]}
                  alt={`Imagem ampliada ${viewerIndex + 1}`}
                  className="max-h-[95vh] max-w-[95vw] object-contain"
                />
              </TransformComponent>
            </TransformWrapper>
          </div>
        </div>
      )}
    </>
  );
};

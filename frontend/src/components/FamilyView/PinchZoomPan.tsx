import React, { useEffect, useRef } from 'react';
import { create } from 'pinch-zoom-pan';

interface PinchZoomPanProps {
  min?: number;
  max?: number;
  captureWheel?: boolean;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}

export const PinchZoomPan = React.memo(
  function PinchZoomPan({ min, max, captureWheel, className, style, children }: PinchZoomPanProps) {
    const root = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const element = root.current;
      if (!element) return;
      const canvas = create({ element, minZoom: min, maxZoom: max, captureWheel });
      return canvas.destroy;
    }, [min, max, captureWheel]);

    return (
      <div 
        ref={root} 
        className={`relative transform translate-z-0 overflow-hidden ${className}`} 
        style={style}
      >
        <div className="absolute w-0 h-0 transform translate-x-0 translate-y-0 scale-100 origin-center will-change-transform">
          <div className="absolute transform -translate-x-1/2 -translate-y-1/2">
            {children}
          </div>
        </div>
      </div>
    );
  },
);
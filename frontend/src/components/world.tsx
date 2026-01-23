'use client'

import { useRef, useEffect } from 'react'
import { useTheme } from 'next-themes'
import createGlobe from 'cobe'

function Globe() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    if (!canvasRef.current) return;

    let phi = 0;
    let width = 0;
    const onResize = () => canvasRef.current && (width = canvasRef.current.offsetWidth)
    window.addEventListener('resize', onResize)
    onResize()
    
    const isDark = resolvedTheme === 'dark';

    const globe = createGlobe(canvasRef.current, {
        devicePixelRatio: 2,
        width: width * 2,
        height: width * 2,
        phi: 0,
        theta: 0.2,
        dark: isDark ? 1 : 0,
        diffuse: isDark ? 1.5 : 2,
        mapSamples: 25000,
        mapBrightness: isDark ? 4 : 3,
        baseColor: isDark ? [0.8, 0.9, 1] : [1, 1, 1],
        markerColor: [0.04, 0.44, 0.84],
        glowColor: isDark ? [0.8, 0.9, 1] : [0.078, 0.5, 0.92],
        markers: [
          { location: [22.5726, 88.3639], size: 0.1 },
          { location: [37.7595, -122.4367], size: 0.03 },
          { location: [40.7128, -74.006], size: 0.1 },
          { location: [51.5074, -0.1278], size: 0.05 },
          { location: [35.6895, 139.6917], size: 0.05 },
          { location: [-33.8688, 151.2093], size: 0.05 },
          { location: [28.6139, 77.2090], size: 0.04 },
          { location: [-22.9068, -43.1729], size: 0.06 },
        ],
        onRender: (state) => {
          if (!state.isDragging) {
            const time = Date.now() / 3000;
            const rotationSpeed = 0.002 + Math.sin(time) * 0.001;
            phi += rotationSpeed;
            state.phi = phi;
          }
          state.width = width * 2
          state.height = width * 2
          
          const isDarkOnRender = resolvedTheme === 'dark';
          state.dark = isDarkOnRender ? 1 : 0;
          state.diffuse = isDarkOnRender ? 1.5 : 2;
          state.mapBrightness = isDarkOnRender ? 4 : 3;
          state.baseColor = isDarkOnRender ? [0.8, 0.9, 1] : [1, 1, 1];
          state.markerColor = [0.04, 0.44, 0.84];
          state.glowColor = isDarkOnRender ? [0.8, 0.9, 1] : [0.078, 0.5, 0.92];
        }
      });

    return () => globe.destroy();
  }, [resolvedTheme]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: '100%', height: '100%', aspectRatio: '1 / 1' }}
    />
  );
}


export default function World() {
  return (
    <div className="absolute inset-0 flex items-center justify-center opacity-100 transition-opacity duration-1000">
      <div className="w-full max-w-4xl aspect-square">
        <Globe />
      </div>
    </div>
  );
}
